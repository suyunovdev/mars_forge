import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, Pencil, Eye, EyeOff, Save, UserPlus, X } from 'lucide-react';
import { db, Course, Module, Lesson, LessonType, QuizQuestion, Employee, Department, Assignment } from '../../store/db';
import { useApp } from '../../contexts/AppContext';

interface LessonEditorState {
  id: string | null; // null = new
  moduleId: string;
  title: string;
  lesson_type: LessonType;
  markdown: string;
  questions: QuizQuestion[];
  order: number;
}

function defaultEditor(moduleId: string, order: number): LessonEditorState {
  return { id: null, moduleId, title: '', lesson_type: 'text', markdown: '', questions: [], order };
}

export function AdminCourseDetail() {
  const { t } = useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<(Module & { lessons: Lesson[] })[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saveMsg, setSaveMsg] = useState('');

  // Lesson editor modal
  const [editor, setEditor] = useState<LessonEditorState | null>(null);

  // Assign modal
  const [showAssign, setShowAssign] = useState(false);
  const [assignType, setAssignType] = useState<'employee' | 'department'>('employee');
  const [assigneeId, setAssigneeId] = useState('');
  const [assignDue, setAssignDue] = useState('');
  const [assignMsg, setAssignMsg] = useState('');

  const employees: Employee[] = db.employees.list();
  const departments: Department[] = db.departments.list();

  useEffect(() => {
    if (!id) return;
    const data = db.courses.findWithModules(id);
    if (!data) { navigate('/admin/courses'); return; }
    setCourse(data);
    setTitle(data.title);
    setDescription(data.description);
    setModules(data.modules);
    setAssignments(db.assignments.list().filter(a => a.course_id === id));
  }, [id]);

  function refreshModules() {
    if (!id) return;
    const data = db.courses.findWithModules(id);
    if (data) setModules(data.modules);
  }

  function handleSaveCourse() {
    if (!id) return;
    db.courses.update(id, { title, description });
    setCourse(prev => prev ? { ...prev, title, description } : prev);
    setSaveMsg(t('common.save'));
    setTimeout(() => setSaveMsg(''), 2000);
  }

  function handleToggleStatus() {
    if (!id || !course) return;
    const updated = db.courses.toggleStatus(id);
    if (updated) setCourse(updated);
  }

  // Modules
  function addModule() {
    if (!id) return;
    const maxOrder = modules.reduce((m, mod) => Math.max(m, mod.order), 0);
    db.modules.create({ course_id: id, title: 'Yangi modul', order: maxOrder + 1 });
    refreshModules();
  }

  function updateModuleTitle(moduleId: string, newTitle: string) {
    setModules(prev => prev.map(m => m.id === moduleId ? { ...m, title: newTitle } : m));
  }

  function saveModuleTitle(moduleId: string, newTitle: string) {
    db.modules.update(moduleId, { title: newTitle });
  }

  function deleteModule(moduleId: string) {
    db.modules.delete(moduleId);
    refreshModules();
  }

  function moveModule(moduleId: string, dir: 'up' | 'down') {
    const idx = modules.findIndex(m => m.id === moduleId);
    if (idx === -1) return;
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= modules.length) return;
    const newModules = [...modules];
    [newModules[idx], newModules[swapIdx]] = [newModules[swapIdx], newModules[idx]];
    newModules[idx].order = idx + 1;
    newModules[swapIdx].order = swapIdx + 1;
    db.modules.update(newModules[idx].id, { order: newModules[idx].order });
    db.modules.update(newModules[swapIdx].id, { order: newModules[swapIdx].order });
    setModules(newModules);
  }

  // Lessons
  function openNewLesson(moduleId: string, currentCount: number) {
    setEditor(defaultEditor(moduleId, currentCount + 1));
  }

  function openEditLesson(lesson: Lesson) {
    setEditor({
      id: lesson.id,
      moduleId: lesson.module_id,
      title: lesson.title,
      lesson_type: lesson.lesson_type,
      markdown: lesson.content.markdown ?? '',
      questions: lesson.content.questions ?? [],
      order: lesson.order,
    });
  }

  function deleteLesson(lessonId: string) {
    db.lessons.delete(lessonId);
    refreshModules();
  }

  function moveLesson(moduleId: string, lessonId: string, dir: 'up' | 'down') {
    const mod = modules.find(m => m.id === moduleId);
    if (!mod) return;
    const lessons = [...mod.lessons];
    const idx = lessons.findIndex(l => l.id === lessonId);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= lessons.length) return;
    [lessons[idx], lessons[swapIdx]] = [lessons[swapIdx], lessons[idx]];
    lessons[idx].order = idx + 1;
    lessons[swapIdx].order = swapIdx + 1;
    db.lessons.update(lessons[idx].id, { order: lessons[idx].order });
    db.lessons.update(lessons[swapIdx].id, { order: lessons[swapIdx].order });
    refreshModules();
  }

  function saveLesson() {
    if (!editor) return;
    const content = editor.lesson_type === 'text'
      ? { markdown: editor.markdown }
      : { questions: editor.questions };

    if (editor.id) {
      db.lessons.update(editor.id, {
        title: editor.title,
        lesson_type: editor.lesson_type,
        content,
      });
    } else {
      db.lessons.create({
        module_id: editor.moduleId,
        title: editor.title,
        lesson_type: editor.lesson_type,
        content,
        order: editor.order,
      });
    }
    setEditor(null);
    refreshModules();
  }

  function addQuestion() {
    if (!editor) return;
    setEditor({
      ...editor,
      questions: [
        ...editor.questions,
        { question: '', options: ['', '', '', ''], correct: 0 },
      ],
    });
  }

  function updateQuestion(qi: number, field: Partial<QuizQuestion>) {
    if (!editor) return;
    const questions = editor.questions.map((q, i) => i === qi ? { ...q, ...field } : q);
    setEditor({ ...editor, questions });
  }

  function updateOption(qi: number, oi: number, value: string) {
    if (!editor) return;
    const questions = editor.questions.map((q, i) => {
      if (i !== qi) return q;
      const options = [...q.options];
      options[oi] = value;
      return { ...q, options };
    });
    setEditor({ ...editor, questions });
  }

  function removeQuestion(qi: number) {
    if (!editor) return;
    setEditor({ ...editor, questions: editor.questions.filter((_, i) => i !== qi) });
  }

  // Assign
  function handleAssign() {
    if (!id || !assigneeId) return;
    db.assignments.assignCourse({
      course_id: id,
      assignee_type: assignType,
      assignee_id: assigneeId,
      due_date: assignDue || undefined,
    });
    setAssignments(db.assignments.list().filter(a => a.course_id === id));
    setAssignMsg('Tayinlandi!');
    setTimeout(() => { setAssignMsg(''); setShowAssign(false); setAssigneeId(''); setAssignDue(''); }, 1500);
  }

  function getAssigneeName(a: Assignment): string {
    if (a.assignee_type === 'employee') {
      const emp = employees.find(e => e.id === a.assignee_id);
      return emp ? emp.full_name : a.assignee_id;
    } else {
      const dep = departments.find(d => d.id === a.assignee_id);
      return dep ? dep.name : a.assignee_id;
    }
  }

  if (!course) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/courses')}
          className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-800 dark:hover:text-slate-200 transition mt-0.5"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="text-2xl font-bold bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-slate-700 focus:border-red-500 focus:outline-none text-gray-900 dark:text-white w-full pb-1 transition"
          />
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            placeholder={t('courseDetail.descPlaceholder')}
            className="mt-2 w-full bg-transparent border border-transparent hover:border-gray-300 dark:hover:border-slate-700 focus:border-red-500 focus:outline-none text-gray-500 dark:text-slate-400 text-sm rounded-lg px-2 py-1 resize-none transition"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleToggleStatus}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              course.status === 'published'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 border-gray-300 dark:border-slate-600 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            {course.status === 'published' ? <><Eye size={12} /> {t('common.published')}</> : <><EyeOff size={12} /> {t('common.draft')}</>}
          </button>
          <button
            onClick={handleSaveCourse}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition"
          >
            <Save size={14} />
            {saveMsg || t('common.save')}
          </button>
        </div>
      </div>

      {/* Modules */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">{t('courseDetail.modules')}</h2>
        <div className="space-y-4">
          {modules.map((mod, mi) => (
            <div key={mod.id} className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
              {/* Module header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 dark:bg-slate-800/60">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveModule(mod.id, 'up')} disabled={mi === 0} className="text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition">
                    <ChevronUp size={14} />
                  </button>
                  <button onClick={() => moveModule(mod.id, 'down')} disabled={mi === modules.length - 1} className="text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition">
                    <ChevronDown size={14} />
                  </button>
                </div>
                <span className="text-xs font-bold text-gray-400 dark:text-slate-500 w-5">{mi + 1}</span>
                <input
                  type="text"
                  value={mod.title}
                  onChange={e => updateModuleTitle(mod.id, e.target.value)}
                  onBlur={e => saveModuleTitle(mod.id, e.target.value)}
                  className="flex-1 bg-transparent text-sm font-semibold text-gray-800 dark:text-slate-200 focus:outline-none border-b border-transparent focus:border-red-500 transition"
                />
                <button
                  onClick={() => deleteModule(mod.id)}
                  className="p-1 rounded text-gray-400 dark:text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Lessons */}
              <div className="divide-y divide-gray-200 dark:divide-slate-800">
                {mod.lessons.map((les, li) => (
                  <div key={les.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-800/30 transition group">
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => moveLesson(mod.id, les.id, 'up')} disabled={li === 0} className="text-gray-300 dark:text-slate-600 hover:text-gray-500 dark:hover:text-slate-400 disabled:opacity-20 disabled:cursor-not-allowed transition">
                        <ChevronUp size={12} />
                      </button>
                      <button onClick={() => moveLesson(mod.id, les.id, 'down')} disabled={li === mod.lessons.length - 1} className="text-gray-300 dark:text-slate-600 hover:text-gray-500 dark:hover:text-slate-400 disabled:opacity-20 disabled:cursor-not-allowed transition">
                        <ChevronDown size={12} />
                      </button>
                    </div>
                    <span className="text-xs text-gray-300 dark:text-slate-600 w-4">{li + 1}.</span>
                    <span className="flex-1 text-sm text-gray-700 dark:text-slate-300">{les.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${les.lesson_type === 'quiz' ? 'bg-violet-500/15 text-violet-400' : 'bg-blue-500/15 text-blue-400'}`}>
                      {les.lesson_type === 'quiz' ? t('courseDetail.quiz') : t('courseDetail.text')}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => openEditLesson(les)} className="p-1 rounded text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => deleteLesson(les.id)} className="p-1 rounded text-gray-400 dark:text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
                {mod.lessons.length === 0 && (
                  <div className="px-4 py-3 text-xs text-gray-300 dark:text-slate-600 italic">{t('common.noData')}</div>
                )}
              </div>

              {/* Add lesson */}
              <div className="px-4 py-2 border-t border-gray-200 dark:border-slate-800">
                <button
                  onClick={() => openNewLesson(mod.id, mod.lessons.length)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500 hover:text-red-400 transition"
                >
                  <Plus size={13} /> {t('courseDetail.addLesson')}
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addModule}
          className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-gray-300 dark:border-slate-700 text-gray-400 dark:text-slate-400 hover:border-red-500/50 hover:text-red-400 text-sm transition w-full justify-center"
        >
          <Plus size={16} /> {t('courseDetail.addModule')}
        </button>
      </div>

      {/* Assignments */}
      <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t('courseDetail.assignments')}</h2>
          <button
            onClick={() => { setShowAssign(true); setAssigneeId(''); setAssignDue(''); setAssignMsg(''); }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 transition"
          >
            <UserPlus size={13} /> {t('courseDetail.addAssignment')}
          </button>
        </div>
        {assignments.length === 0 ? (
          <p className="text-sm text-gray-300 dark:text-slate-600 italic">{t('common.noData')}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {assignments.map(a => (
              <span key={a.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-xs text-gray-700 dark:text-slate-300">
                <span className={`w-1.5 h-1.5 rounded-full ${a.assignee_type === 'employee' ? 'bg-blue-400' : 'bg-violet-400'}`} />
                {getAssigneeName(a)}
                {a.due_date && <span className="text-gray-400 dark:text-slate-500">· {a.due_date}</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Lesson Editor Modal */}
      {editor && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl w-full max-w-2xl my-8 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {editor.id ? t('courseDetail.editLesson') : t('courseDetail.newLesson')}
              </h2>
              <button onClick={() => setEditor(null)} className="p-1.5 rounded-lg text-gray-400 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">{t('courseDetail.lessonName')}</label>
                <input
                  type="text"
                  value={editor.title}
                  onChange={e => setEditor({ ...editor, title: e.target.value })}
                  placeholder="Dars nomini kiriting"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-red-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">{t('courseDetail.lessonType')}</label>
                <div className="flex gap-2">
                  {(['text', 'quiz'] as const).map(tp => (
                    <button
                      key={tp}
                      onClick={() => setEditor({ ...editor, lesson_type: tp })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                        editor.lesson_type === tp
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {tp === 'text' ? t('courseDetail.text') : t('courseDetail.quiz')}
                    </button>
                  ))}
                </div>
              </div>

              {editor.lesson_type === 'text' ? (
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">{t('courseDetail.content')}</label>
                  <textarea
                    value={editor.markdown}
                    onChange={e => setEditor({ ...editor, markdown: e.target.value })}
                    rows={8}
                    placeholder="# Sarlavha&#10;&#10;Mazmun..."
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-red-500 text-sm font-mono resize-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-2">{t('courseDetail.questions')}</label>
                  <div className="space-y-4">
                    {editor.questions.map((q, qi) => (
                      <div key={qi} className="p-4 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700">
                        <div className="flex items-start gap-2 mb-3">
                          <span className="text-xs font-bold text-gray-400 dark:text-slate-500 mt-2.5 w-5 shrink-0">{qi + 1}.</span>
                          <input
                            type="text"
                            value={q.question}
                            onChange={e => updateQuestion(qi, { question: e.target.value })}
                            placeholder={t('courseDetail.question')}
                            className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-red-500"
                          />
                          <button onClick={() => removeQuestion(qi)} className="p-2 rounded-lg text-gray-400 dark:text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition shrink-0">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="pl-7 space-y-2">
                          {q.options.map((opt, oi) => (
                            <div key={oi} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct-${qi}`}
                                checked={q.correct === oi}
                                onChange={() => updateQuestion(qi, { correct: oi })}
                                className="w-3.5 h-3.5 accent-emerald-500 shrink-0"
                              />
                              <input
                                type="text"
                                value={opt}
                                onChange={e => updateOption(qi, oi, e.target.value)}
                                placeholder={`${t('courseDetail.option')} ${oi + 1}`}
                                className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-red-500"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addQuestion}
                    className="mt-3 flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-400 hover:text-red-400 transition"
                  >
                    <Plus size={13} /> {t('courseDetail.addQuestion')}
                  </button>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-800 flex gap-3">
              <button
                onClick={saveLesson}
                disabled={!editor.title.trim()}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-gray-200 dark:disabled:bg-slate-700 disabled:text-gray-400 dark:disabled:text-slate-500 text-white font-semibold text-sm transition"
              >
                {t('common.save')}
              </button>
              <button
                onClick={() => setEditor(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-medium text-sm transition"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssign && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t('courseDetail.addAssignment')}</h2>
              <button onClick={() => setShowAssign(false)} className="p-1.5 rounded-lg text-gray-400 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition">
                <X size={16} />
              </button>
            </div>
            {assignMsg ? (
              <div className="py-8 text-center text-emerald-400 font-medium">{assignMsg}</div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{t('courses.assignTo')}</label>
                  <div className="flex gap-2">
                    {(['employee', 'department'] as const).map(tp => (
                      <button key={tp} onClick={() => { setAssignType(tp); setAssigneeId(''); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${assignType === tp ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'}`}>
                        {tp === 'employee' ? t('courses.toEmployee') : t('courses.toDepartment')}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">
                    {assignType === 'employee' ? t('courses.selectEmployee') : t('courses.selectDepartment')}
                  </label>
                  <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 text-sm">
                    <option value="">— Tanlang —</option>
                    {assignType === 'employee'
                      ? employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)
                      : departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{t('courses.dueDate')}</label>
                  <input type="date" value={assignDue} onChange={e => setAssignDue(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 text-sm" />
                </div>
                <div className="flex gap-3">
                  <button onClick={handleAssign} disabled={!assigneeId}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-gray-200 dark:disabled:bg-slate-700 disabled:text-gray-400 dark:disabled:text-slate-500 text-white font-semibold text-sm transition">
                    {t('courses.assign')}
                  </button>
                  <button onClick={() => setShowAssign(false)}
                    className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-medium text-sm transition">
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
