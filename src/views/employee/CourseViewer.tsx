import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle2, Circle, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Bot, X, Send } from 'lucide-react';
import { auth, db, Lesson, Module, Course } from '../../store/db';
import { generateTutorResponse } from '../../services/gemini';
import { useApp } from '../../contexts/AppContext';

type LessonFull = Lesson;
type ModuleFull = Module & { lessons: LessonFull[] };
type CourseFull = Course & { modules: ModuleFull[] };

interface QuizAnswers {
  [questionId: string]: {
    selected?: number;     // multiple_choice, true_false
    text?: string;         // short_answer, essay
    matchMap?: Record<number, number>; // matching: leftIdx → rightIdx
    order?: number[];      // ordering: current order of indices
  };
}

interface QuizChecked {
  checked: boolean;
  score?: number;
  total?: number;
}

interface TutorMessage {
  role: 'user' | 'model';
  text: string;
}

function isYouTube(url: string): boolean {
  return /youtu\.?be/.test(url);
}

function getYouTubeEmbed(url: string): string {
  const m = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}?rel=0` : url;
}

export function CourseViewer() {
  const { t } = useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = auth.getUser();

  const [course, setCourse] = useState<CourseFull | null>(null);
  const [activeLesson, setActiveLesson] = useState<LessonFull | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({});
  const [quizChecked, setQuizChecked] = useState<QuizChecked>({ checked: false });

  // AI Tutor state
  const [tutorOpen, setTutorOpen] = useState(false);
  const [tutorMessages, setTutorMessages] = useState<TutorMessage[]>([]);
  const [tutorInput, setTutorInput] = useState('');
  const [tutorLoading, setTutorLoading] = useState(false);
  const tutorMessagesEndRef = useRef<HTMLDivElement>(null);

  // Certificate state
  const [certIssued, setCertIssued] = useState(false);

  // Flat list of all lessons for prev/next navigation
  const allLessons: LessonFull[] = course?.modules.flatMap(m => m.lessons) ?? [];

  useEffect(() => {
    if (!id) return;
    const data = db.courses.findWithModules(id);
    if (!data) { navigate('/employee/my-courses'); return; }
    setCourse(data);
    if (user) {
      const firstUncompleted = data.modules
        .flatMap(m => m.lessons)
        .find(l => !db.lessonProgress.isCompleted(user.id, l.id));
      const firstLesson = data.modules[0]?.lessons[0] ?? null;
      setActiveLesson(firstUncompleted ?? firstLesson);
    }
    // Check if cert already issued
    if (user && id) {
      const cert = db.certificates.getByUserAndCourse(user.id, id);
      if (cert) setCertIssued(true);
    }
  }, [id]);

  useEffect(() => {
    if (tutorOpen && tutorMessages.length === 0) {
      setTutorMessages([{ role: 'model', text: t('tutor.welcome') }]);
    }
  }, [tutorOpen]);

  useEffect(() => {
    tutorMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tutorMessages]);

  function selectLesson(lesson: LessonFull) {
    setActiveLesson(lesson);
    setQuizAnswers({});
    setQuizChecked({ checked: false });
  }

  function isCompleted(lessonId: string): boolean {
    if (!user) return false;
    return db.lessonProgress.isCompleted(user.id, lessonId);
  }

  function handleComplete() {
    if (!user || !activeLesson || !id) return;
    db.lessonProgress.complete(user.id, activeLesson.id, id);
    const data = db.courses.findWithModules(id);
    if (data) setCourse(data);
    const currentIdx = allLessons.findIndex(l => l.id === activeLesson.id);
    const nextLesson = allLessons[currentIdx + 1] ?? null;
    if (nextLesson) {
      selectLesson(nextLesson);
    }
  }

  function handlePrev() {
    if (!activeLesson) return;
    const idx = allLessons.findIndex(l => l.id === activeLesson.id);
    if (idx > 0) selectLesson(allLessons[idx - 1]);
  }

  function handleNext() {
    if (!activeLesson) return;
    const idx = allLessons.findIndex(l => l.id === activeLesson.id);
    if (idx < allLessons.length - 1) selectLesson(allLessons[idx + 1]);
  }

  // Quiz helpers
  function setAnswer(questionId: string, update: Partial<QuizAnswers[string]>) {
    if (quizChecked.checked) return;
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: { ...(prev[questionId] ?? {}), ...update },
    }));
  }

  function checkQuiz() {
    if (!activeLesson?.content.questions) return;
    const questions = activeLesson.content.questions;
    let correct = 0;
    let gradable = 0;
    for (const q of questions) {
      if (q.type === 'essay') continue; // essay not graded
      gradable++;
      const ans = quizAnswers[q.id] ?? {};
      if (q.type === 'multiple_choice' || q.type === 'true_false') {
        if (ans.selected === q.correct) correct++;
      } else if (q.type === 'short_answer') {
        if (ans.text?.trim().toLowerCase() === (q.expectedAnswer ?? '').trim().toLowerCase()) correct++;
      } else if (q.type === 'matching') {
        const pairs = q.matchPairs ?? [];
        let allMatch = pairs.length > 0;
        for (let i = 0; i < pairs.length; i++) {
          if ((ans.matchMap ?? {})[i] !== i) { allMatch = false; break; }
        }
        if (allMatch) correct++;
      } else if (q.type === 'ordering') {
        const items = q.orderItems ?? [];
        const correctOrder = q.correctOrder ?? items.map((_, i) => i);
        const userOrder = ans.order ?? items.map((_, i) => i);
        const isCorrect = correctOrder.every((val, idx) => val === userOrder[idx]);
        if (isCorrect) correct++;
      }
    }
    setQuizChecked({ checked: true, score: correct, total: gradable });
  }

  function computeAvgScore(): number {
    if (!id || !user) return 0;
    const data = db.courses.findWithModules(id);
    if (!data) return 0;
    const quizLessons = data.modules.flatMap(m => m.lessons).filter(l => l.lesson_type === 'quiz');
    if (quizLessons.length === 0) return 100;
    // Return 100 as a default since we don't store per-lesson scores
    return 100;
  }

  function handleGetCertificate() {
    if (!user || !id) return;
    const score = computeAvgScore();
    db.certificates.issue(user.id, id, score);
    setCertIssued(true);
    navigate(`/employee/certificate/${id}`);
  }

  // AI Tutor
  const hasApiKey = !!process.env.GEMINI_API_KEY;

  async function sendTutorMessage() {
    if (!tutorInput.trim() || tutorLoading) return;
    const userMsg = tutorInput.trim();
    setTutorInput('');
    const newMessages: TutorMessage[] = [...tutorMessages, { role: 'user', text: userMsg }];
    setTutorMessages(newMessages);
    setTutorLoading(true);
    try {
      const history = newMessages.slice(1, -1); // exclude welcome message and current user message
      const lessonContent = activeLesson?.content.markdown ?? activeLesson?.content.questions?.map(q => q.question).join('\n') ?? '';
      const response = await generateTutorResponse(
        activeLesson?.title ?? '',
        lessonContent,
        course?.title ?? '',
        history,
        userMsg
      );
      setTutorMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch {
      setTutorMessages(prev => [...prev, { role: 'model', text: 'Xato yuz berdi. Qayta urinib ko\'ring.' }]);
    } finally {
      setTutorLoading(false);
    }
  }

  const allCompleted = allLessons.length > 0 && allLessons.every(l => isCompleted(l.id));

  if (!course) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeLessonIdx = activeLesson ? allLessons.findIndex(l => l.id === activeLesson.id) : -1;

  function getLessonBadge(lesson: LessonFull): { label: string; cls: string } {
    if (lesson.lesson_type === 'quiz') return { label: 'Q', cls: 'bg-violet-500/20 text-violet-400' };
    if (lesson.lesson_type === 'video') return { label: 'V', cls: 'bg-yellow-500/20 text-yellow-400' };
    return { label: 'T', cls: 'bg-blue-500/20 text-blue-400' };
  }

  return (
    <div className="flex gap-5 h-[calc(100vh-5rem)] relative">
      {/* Sidebar */}
      <div className="w-72 shrink-0 flex flex-col bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-4 py-4 border-b border-gray-200 dark:border-slate-800">
          <button
            onClick={() => navigate('/employee/my-courses')}
            className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 transition mb-3"
          >
            <ArrowLeft size={13} className="shrink-0" /> {t('viewer.back')}
          </button>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2">{course.title}</h2>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
            {allLessons.filter(l => isCompleted(l.id)).length}/{allLessons.length} {t('viewer.lesson')}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto py-3">
          {course.modules.map((mod, mi) => (
            <div key={mod.id} className="mb-3">
              <div className="px-4 py-1.5">
                <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                  {mi + 1}. {mod.title}
                </p>
              </div>
              {mod.lessons.map((lesson, li) => {
                const done = isCompleted(lesson.id);
                const active = activeLesson?.id === lesson.id;
                const badge = getLessonBadge(lesson);
                return (
                  <button
                    key={lesson.id}
                    onClick={() => selectLesson(lesson)}
                    className={`w-full flex items-center gap-2.5 px-4 py-2 text-left transition ${
                      active
                        ? 'bg-blue-600/20 text-blue-300'
                        : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    ) : (
                      <Circle size={14} className={`shrink-0 ${active ? 'text-blue-400' : 'text-gray-300 dark:text-slate-600'}`} />
                    )}
                    <span className="text-xs flex-1 line-clamp-2">{li + 1}. {lesson.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {allCompleted && (
          <div className="bg-emerald-600/20 border-b border-emerald-600/30 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <p className="text-sm font-semibold text-emerald-300">{t('viewer.congrats')} {t('viewer.allDone')}</p>
            </div>
            {!certIssued && (
              <button
                onClick={handleGetCertificate}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold transition shrink-0"
              >
                {t('cert.get')}
              </button>
            )}
            {certIssued && (
              <button
                onClick={() => navigate(`/employee/certificate/${id}`)}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-semibold transition shrink-0 hover:bg-amber-500/30"
              >
                {t('cert.title')} →
              </button>
            )}
          </div>
        )}

        {activeLesson ? (
          <>
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {/* Lesson header */}
              <div className="mb-6">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold mb-3 ${
                  activeLesson.lesson_type === 'quiz'
                    ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30'
                    : activeLesson.lesson_type === 'video'
                    ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                    : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                }`}>
                  {activeLesson.lesson_type === 'quiz'
                    ? t('courseDetail.quiz')
                    : activeLesson.lesson_type === 'video'
                    ? t('lesson.video')
                    : t('courseDetail.text')}
                </span>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{activeLesson.title}</h1>
              </div>

              {/* Text lesson */}
              {activeLesson.lesson_type === 'text' && (
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-base">
                    {activeLesson.content.markdown}
                  </p>
                </div>
              )}

              {/* Video lesson */}
              {activeLesson.lesson_type === 'video' && activeLesson.content.videoUrl && (
                <div className="rounded-xl overflow-hidden bg-black">
                  {isYouTube(activeLesson.content.videoUrl) ? (
                    <iframe
                      src={getYouTubeEmbed(activeLesson.content.videoUrl)}
                      className="w-full aspect-video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={activeLesson.title}
                    />
                  ) : (
                    <video
                      controls
                      className="w-full aspect-video"
                      src={activeLesson.content.videoUrl}
                    >
                      Brauzeringiz video formatini qo'llab-quvvatlamaydi.
                    </video>
                  )}
                </div>
              )}

              {/* Quiz lesson */}
              {activeLesson.lesson_type === 'quiz' && (
                <div className="space-y-6">
                  {activeLesson.content.questions?.map((q, qi) => {
                    const ans = quizAnswers[q.id] ?? {};
                    const isChecked = quizChecked.checked;

                    return (
                      <div key={q.id} className="rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-100/80 dark:bg-slate-800/50 p-5">
                        <div className="flex items-start gap-2 mb-3">
                          <span className="text-xs font-bold text-gray-400 dark:text-slate-500 mt-0.5 shrink-0">{qi + 1}.</span>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{q.question}</p>
                        </div>
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400 mb-3">
                          {t(`q.${q.type}` as Parameters<typeof t>[0])}
                        </span>

                        {/* multiple_choice */}
                        {q.type === 'multiple_choice' && (
                          <div className="space-y-2 mt-2">
                            {(q.options ?? []).map((opt, oi) => {
                              let cls = 'w-full text-left p-3 rounded-lg border text-sm transition ';
                              if (!isChecked) {
                                cls += ans.selected === oi
                                  ? 'border-blue-500 bg-blue-600/15 text-gray-900 dark:text-white'
                                  : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-gray-700 dark:text-slate-300 hover:border-gray-400 dark:hover:border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-700';
                              } else {
                                if (oi === q.correct) {
                                  cls += 'border-emerald-500 bg-emerald-600/15 text-emerald-300';
                                } else if (ans.selected === oi && oi !== q.correct) {
                                  cls += 'border-red-500 bg-red-600/15 text-red-300';
                                } else {
                                  cls += 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500';
                                }
                              }
                              return (
                                <button key={oi} onClick={() => setAnswer(q.id, { selected: oi })} className={cls}>
                                  {opt}
                                </button>
                              );
                            })}
                            {isChecked && (
                              <p className={`text-xs font-semibold mt-2 ${ans.selected === q.correct ? 'text-emerald-400' : 'text-red-400'}`}>
                                {ans.selected === q.correct ? t('viewer.correct') : `${t('viewer.wrong')}. ${t('courseDetail.correct')}: ${(q.options ?? [])[q.correct ?? 0]}`}
                              </p>
                            )}
                          </div>
                        )}

                        {/* true_false */}
                        {q.type === 'true_false' && (
                          <div className="flex gap-3 mt-2">
                            {[0, 1].map(val => {
                              const label = val === 0 ? t('q.trueOption') : t('q.falseOption');
                              let cls = 'flex-1 py-3 rounded-xl border text-sm font-semibold transition ';
                              if (!isChecked) {
                                cls += ans.selected === val
                                  ? 'border-blue-500 bg-blue-600/15 text-blue-300'
                                  : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-gray-700 dark:text-slate-300 hover:border-gray-400 dark:hover:border-slate-500';
                              } else {
                                if (val === q.correct) {
                                  cls += 'border-emerald-500 bg-emerald-600/15 text-emerald-300';
                                } else if (ans.selected === val && val !== q.correct) {
                                  cls += 'border-red-500 bg-red-600/15 text-red-300';
                                } else {
                                  cls += 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500';
                                }
                              }
                              return (
                                <button key={val} onClick={() => setAnswer(q.id, { selected: val })} className={cls}>
                                  {label}
                                </button>
                              );
                            })}
                            {isChecked && (
                              <p className={`text-xs font-semibold mt-2 ${ans.selected === q.correct ? 'text-emerald-400' : 'text-red-400'}`}>
                                {ans.selected === q.correct ? t('viewer.correct') : t('viewer.wrong')}
                              </p>
                            )}
                          </div>
                        )}

                        {/* short_answer */}
                        {q.type === 'short_answer' && (
                          <div className="mt-2">
                            <input
                              type="text"
                              value={ans.text ?? ''}
                              onChange={e => setAnswer(q.id, { text: e.target.value })}
                              disabled={isChecked}
                              placeholder={t('q.yourAnswer')}
                              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm disabled:opacity-60"
                            />
                            {isChecked && (
                              <p className={`text-xs font-semibold mt-2 ${
                                (ans.text ?? '').trim().toLowerCase() === (q.expectedAnswer ?? '').trim().toLowerCase()
                                  ? 'text-emerald-400' : 'text-red-400'
                              }`}>
                                {(ans.text ?? '').trim().toLowerCase() === (q.expectedAnswer ?? '').trim().toLowerCase()
                                  ? t('viewer.correct')
                                  : `${t('viewer.wrong')}. ${t('courseDetail.correct')}: ${q.expectedAnswer}`}
                              </p>
                            )}
                          </div>
                        )}

                        {/* matching */}
                        {q.type === 'matching' && (
                          <div className="mt-2 space-y-2">
                            {(q.matchPairs ?? []).map((pair, pi) => {
                              const shuffledRights = (q.matchPairs ?? []).map((p, i) => ({ text: p.right, idx: i }));
                              return (
                                <div key={pi} className="flex items-center gap-3">
                                  <span className="flex-1 text-sm text-gray-700 dark:text-slate-300 px-3 py-2 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                    {pair.left}
                                  </span>
                                  <span className="text-gray-400">→</span>
                                  <select
                                    value={(ans.matchMap ?? {})[pi] ?? ''}
                                    onChange={e => {
                                      const newMap = { ...(ans.matchMap ?? {}) };
                                      newMap[pi] = Number(e.target.value);
                                      setAnswer(q.id, { matchMap: newMap });
                                    }}
                                    disabled={isChecked}
                                    className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-60"
                                  >
                                    <option value="">— Tanlang —</option>
                                    {shuffledRights.map(r => (
                                      <option key={r.idx} value={r.idx}>{r.text}</option>
                                    ))}
                                  </select>
                                  {isChecked && (
                                    <span className={`text-xs font-bold ${(ans.matchMap ?? {})[pi] === pi ? 'text-emerald-400' : 'text-red-400'}`}>
                                      {(ans.matchMap ?? {})[pi] === pi ? '✓' : '✗'}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* ordering */}
                        {q.type === 'ordering' && (
                          <div className="mt-2 space-y-2">
                            {(() => {
                              const items = q.orderItems ?? [];
                              const currentOrder = (ans.order ?? items.map((_, i) => i));
                              return currentOrder.map((itemIdx, pos) => (
                                <div key={itemIdx} className="flex items-center gap-2">
                                  <span className="text-xs text-gray-400 dark:text-slate-500 w-5">{pos + 1}.</span>
                                  <span className="flex-1 text-sm text-gray-700 dark:text-slate-300 px-3 py-2 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                    {items[itemIdx]}
                                  </span>
                                  {!isChecked && (
                                    <div className="flex flex-col gap-0.5">
                                      <button
                                        disabled={pos === 0}
                                        onClick={() => {
                                          const newOrder = [...currentOrder];
                                          [newOrder[pos], newOrder[pos - 1]] = [newOrder[pos - 1], newOrder[pos]];
                                          setAnswer(q.id, { order: newOrder });
                                        }}
                                        className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                        title={t('q.moveUp')}
                                      >
                                        <ChevronUp size={14} />
                                      </button>
                                      <button
                                        disabled={pos === currentOrder.length - 1}
                                        onClick={() => {
                                          const newOrder = [...currentOrder];
                                          [newOrder[pos], newOrder[pos + 1]] = [newOrder[pos + 1], newOrder[pos]];
                                          setAnswer(q.id, { order: newOrder });
                                        }}
                                        className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                        title={t('q.moveDown')}
                                      >
                                        <ChevronDown size={14} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ));
                            })()}
                            {isChecked && q.correctOrder && (
                              <p className={`text-xs font-semibold mt-2 ${
                                (q.correctOrder ?? []).every((val, idx) => val === (ans.order ?? q.orderItems?.map((_, i) => i) ?? [])[idx])
                                  ? 'text-emerald-400' : 'text-red-400'
                              }`}>
                                {(q.correctOrder ?? []).every((val, idx) => val === (ans.order ?? [])[idx])
                                  ? t('viewer.correct')
                                  : t('viewer.wrong')}
                              </p>
                            )}
                          </div>
                        )}

                        {/* essay */}
                        {q.type === 'essay' && (
                          <div className="mt-2">
                            <textarea
                              rows={6}
                              value={ans.text ?? ''}
                              onChange={e => setAnswer(q.id, { text: e.target.value })}
                              disabled={isChecked}
                              placeholder={t('q.essayPlaceholder')}
                              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm resize-none disabled:opacity-60"
                            />
                            {isChecked && (
                              <p className="text-xs text-emerald-400 font-medium mt-1">
                                {t('q.saveEssay')} ✓
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {!quizChecked.checked ? (
                    <button
                      onClick={checkQuiz}
                      disabled={
                        (activeLesson.content.questions?.length ?? 0) > 0 &&
                        activeLesson.content.questions!.some(q => {
                          if (q.type === 'essay') return false; // essay can always proceed
                          const ans = quizAnswers[q.id];
                          if (q.type === 'multiple_choice' || q.type === 'true_false') return ans?.selected === undefined;
                          if (q.type === 'short_answer') return !ans?.text?.trim();
                          if (q.type === 'matching') {
                            const pairs = q.matchPairs ?? [];
                            return pairs.some((_, i) => (ans?.matchMap ?? {})[i] === undefined);
                          }
                          return false;
                        })
                      }
                      className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-gray-200 dark:disabled:bg-slate-700 disabled:text-gray-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold text-sm transition"
                    >
                      {t('viewer.checkAnswers')}
                    </button>
                  ) : (
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {quizChecked.score}/{quizChecked.total}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-slate-400">{t('viewer.quizScore')}</p>
                      </div>
                      <div className="h-10 w-px bg-gray-300 dark:bg-slate-700" />
                      <p className="text-sm text-gray-700 dark:text-slate-300">
                        {quizChecked.score === quizChecked.total
                          ? "Ajoyib! Barcha javoblar to'g'ri!"
                          : `${(quizChecked.total ?? 0) - (quizChecked.score ?? 0)} ta xato. Qayta ko'rib chiqing.`}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer navigation */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={activeLessonIdx <= 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-800 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} /> {t('viewer.prev')}
              </button>

              <div className="flex items-center gap-3">
                {isCompleted(activeLesson.id) ? (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <CheckCircle2 size={14} /> {t('emp.completed')}
                  </span>
                ) : (
                  <button
                    onClick={handleComplete}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition"
                  >
                    {t('viewer.completeAndNext')}
                  </button>
                )}
              </div>

              <button
                onClick={handleNext}
                disabled={activeLessonIdx >= allLessons.length - 1}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-800 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                {t('viewer.next')} <ChevronRight size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-slate-500">
            <p>{t('viewer.selectAnswer')}</p>
          </div>
        )}
      </div>

      {/* AI Tutor floating button */}
      <button
        onClick={() => setTutorOpen(true)}
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg transition ${tutorOpen ? 'opacity-0 pointer-events-none' : ''}`}
      >
        <Bot size={18} />
        {t('tutor.title')}
      </button>

      {/* AI Tutor panel */}
      {tutorOpen && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-blue-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{t('tutor.title')}</h3>
            </div>
            <button
              onClick={() => setTutorOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
            >
              <X size={16} />
            </button>
          </div>

          {!hasApiKey ? (
            <div className="flex-1 flex items-center justify-center p-6 text-center">
              <div>
                <Bot size={36} className="text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-slate-400">{t('tutor.noApiKey')}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {tutorMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-bl-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {tutorLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-slate-800 rounded-2xl rounded-bl-sm px-3 py-2 text-sm text-gray-500 dark:text-slate-400">
                      <span className="inline-flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    </div>
                  </div>
                )}
                <div ref={tutorMessagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 dark:border-slate-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tutorInput}
                    onChange={e => setTutorInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendTutorMessage(); } }}
                    placeholder={t('tutor.placeholder')}
                    disabled={tutorLoading}
                    className="flex-1 px-3 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm disabled:opacity-50"
                  />
                  <button
                    onClick={sendTutorMessage}
                    disabled={tutorLoading || !tutorInput.trim()}
                    className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-gray-200 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white transition"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
