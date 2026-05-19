import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle2, Circle, ChevronLeft, ChevronRight } from 'lucide-react';
import { auth, db, Lesson, Module, Course } from '../../store/db';
import { useApp } from '../../contexts/AppContext';

type LessonFull = Lesson;
type ModuleFull = Module & { lessons: LessonFull[] };
type CourseFull = Course & { modules: ModuleFull[] };

interface QuizState {
  answers: (number | null)[];
  checked: boolean;
}

export function CourseViewer() {
  const { t } = useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = auth.getUser();

  const [course, setCourse] = useState<CourseFull | null>(null);
  const [activeLesson, setActiveLesson] = useState<LessonFull | null>(null);
  const [quizState, setQuizState] = useState<QuizState>({ answers: [], checked: false });

  // Flat list of all lessons for prev/next navigation
  const allLessons: LessonFull[] = course?.modules.flatMap(m => m.lessons) ?? [];

  useEffect(() => {
    if (!id) return;
    const data = db.courses.findWithModules(id);
    if (!data) { navigate('/employee/my-courses'); return; }
    setCourse(data);
    // Find first uncompleted lesson or first lesson
    if (user) {
      const firstUncompleted = data.modules
        .flatMap(m => m.lessons)
        .find(l => !db.lessonProgress.isCompleted(user.id, l.id));
      const firstLesson = data.modules[0]?.lessons[0] ?? null;
      setActiveLesson(firstUncompleted ?? firstLesson);
    }
  }, [id]);

  function selectLesson(lesson: LessonFull) {
    setActiveLesson(lesson);
    setQuizState({ answers: [], checked: false });
  }

  function isCompleted(lessonId: string): boolean {
    if (!user) return false;
    return db.lessonProgress.isCompleted(user.id, lessonId);
  }

  function handleComplete() {
    if (!user || !activeLesson || !id) return;
    db.lessonProgress.complete(user.id, activeLesson.id, id);
    // refresh course to get updated state
    const data = db.courses.findWithModules(id);
    if (data) setCourse(data);
    // Go to next lesson
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

  // Quiz
  function selectAnswer(qi: number, optIdx: number) {
    if (quizState.checked) return;
    const answers = [...quizState.answers];
    answers[qi] = optIdx;
    setQuizState({ ...quizState, answers });
  }

  function checkQuiz() {
    setQuizState({ ...quizState, checked: true });
  }

  function quizScore(): number {
    if (!activeLesson?.content.questions) return 0;
    return activeLesson.content.questions.filter((q, i) => quizState.answers[i] === q.correct).length;
  }

  // Check if all lessons done
  const allCompleted = allLessons.length > 0 && allLessons.every(l => isCompleted(l.id));

  if (!course) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeLessonIdx = activeLesson ? allLessons.findIndex(l => l.id === activeLesson.id) : -1;

  return (
    <div className="flex gap-5 h-[calc(100vh-5rem)]">
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
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{allLessons.filter(l => isCompleted(l.id)).length}/{allLessons.length} {t('viewer.lesson')}</p>
        </div>
        <div className="flex-1 overflow-y-auto py-3">
          {course.modules.map((mod, mi) => (
            <div key={mod.id} className="mb-3">
              <div className="px-4 py-1.5">
                <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">{mi + 1}. {mod.title}</p>
              </div>
              {mod.lessons.map((lesson, li) => {
                const done = isCompleted(lesson.id);
                const active = activeLesson?.id === lesson.id;
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
                    <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${lesson.lesson_type === 'quiz' ? 'bg-violet-500/20 text-violet-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {lesson.lesson_type === 'quiz' ? 'Q' : 'T'}
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
          <div className="bg-emerald-600/20 border-b border-emerald-600/30 px-6 py-3 flex items-center gap-3">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <p className="text-sm font-semibold text-emerald-300">{t('viewer.congrats')} {t('viewer.allDone')}</p>
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
                    : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                }`}>
                  {activeLesson.lesson_type === 'quiz' ? t('courseDetail.quiz') : t('courseDetail.text')}
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

              {/* Quiz lesson */}
              {activeLesson.lesson_type === 'quiz' && (
                <div className="space-y-6">
                  {activeLesson.content.questions?.map((q, qi) => {
                    const correct = quizState.answers[qi] === q.correct;
                    return (
                      <div key={qi} className="rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-100/80 dark:bg-slate-800/50 p-5">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{qi + 1}. {q.question}</p>
                        <div className="space-y-2">
                          {q.options.map((opt, oi) => {
                            let cls = 'w-full text-left p-3 rounded-lg border text-sm transition ';
                            if (!quizState.checked) {
                              cls += quizState.answers[qi] === oi
                                ? 'border-blue-500 bg-blue-600/15 text-gray-900 dark:text-white'
                                : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-gray-700 dark:text-slate-300 hover:border-gray-400 dark:hover:border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-700';
                            } else {
                              if (oi === q.correct) {
                                cls += 'border-emerald-500 bg-emerald-600/15 text-emerald-300';
                              } else if (quizState.answers[qi] === oi && oi !== q.correct) {
                                cls += 'border-red-500 bg-red-600/15 text-red-300';
                              } else {
                                cls += 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500';
                              }
                            }
                            return (
                              <button key={oi} onClick={() => selectAnswer(qi, oi)} className={cls}>
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        {quizState.checked && (
                          <p className={`mt-3 text-xs font-semibold ${correct ? 'text-emerald-400' : 'text-red-400'}`}>
                            {correct ? t('viewer.correct') : `${t('viewer.wrong')}. ${t('courseDetail.correct')}: ${q.options[q.correct]}`}
                          </p>
                        )}
                      </div>
                    );
                  })}

                  {!quizState.checked ? (
                    <button
                      onClick={checkQuiz}
                      disabled={(activeLesson.content.questions?.length ?? 0) > 0 &&
                        activeLesson.content.questions!.some((_, qi) => quizState.answers[qi] === undefined || quizState.answers[qi] === null)}
                      className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-gray-200 dark:disabled:bg-slate-700 disabled:text-gray-400 dark:disabled:text-slate-500 text-white font-semibold text-sm transition"
                    >
                      {t('viewer.checkAnswers')}
                    </button>
                  ) : (
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{quizScore()}/{activeLesson.content.questions?.length ?? 0}</p>
                        <p className="text-xs text-gray-400 dark:text-slate-400">{t('viewer.quizScore')}</p>
                      </div>
                      <div className="h-10 w-px bg-gray-300 dark:bg-slate-700" />
                      <p className="text-sm text-gray-700 dark:text-slate-300">
                        {quizScore() === activeLesson.content.questions?.length
                          ? "Ajoyib! Barcha javoblar to'g'ri!"
                          : `${activeLesson.content.questions!.length - quizScore()} ta xato. Qayta ko'rib chiqing.`}
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
    </div>
  );
}
