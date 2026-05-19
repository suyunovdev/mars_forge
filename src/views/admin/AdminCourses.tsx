import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Pencil, Trash2, Eye, EyeOff, UserPlus } from 'lucide-react';
import { db, Course, Employee, Department } from '../../store/db';
import { useApp } from '../../contexts/AppContext';

type CourseWithCount = Course & { modules_count: number };

export function AdminCourses() {
  const { t } = useApp();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseWithCount[]>(() => db.courses.list());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // New course modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Assign modal
  const [assignCourseId, setAssignCourseId] = useState<string | null>(null);
  const [assignType, setAssignType] = useState<'employee' | 'department'>('employee');
  const [assigneeId, setAssigneeId] = useState('');
  const [assignDue, setAssignDue] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');

  const employees: Employee[] = db.employees.list();
  const departments: Department[] = db.departments.list();

  function refresh() {
    setCourses(db.courses.list());
  }

  function handleToggle(id: string) {
    db.courses.toggleStatus(id);
    refresh();
  }

  function handleDelete(id: string) {
    if (deleteConfirm === id) {
      db.courses.delete(id);
      setDeleteConfirm(null);
      refresh();
    } else {
      setDeleteConfirm(id);
    }
  }

  function handleCreate() {
    if (!newTitle.trim()) return;
    db.courses.create({ title: newTitle.trim(), description: newDesc.trim() });
    setNewTitle('');
    setNewDesc('');
    setShowNewModal(false);
    refresh();
  }

  function handleAssign() {
    if (!assignCourseId || !assigneeId) return;
    db.assignments.assignCourse({
      course_id: assignCourseId,
      assignee_type: assignType,
      assignee_id: assigneeId,
      due_date: assignDue || undefined,
    });
    setAssignSuccess('Tayinlash muvaffaqiyatli amalga oshirildi!');
    setTimeout(() => {
      setAssignCourseId(null);
      setAssignSuccess('');
      setAssigneeId('');
      setAssignDue('');
    }, 1500);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('courses.title')}</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Barcha o'quv kurslari</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition"
        >
          <Plus size={16} />
          {t('courses.new')}
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-800 bg-gray-100/80 dark:bg-slate-800/50">
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">{t('courses.name')}</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">{t('courses.status')}</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">{t('courses.modules')}</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">{t('courses.date')}</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider text-right">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
            {courses.map(course => (
              <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{course.title}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 line-clamp-1">{course.description}</p>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    course.status === 'published'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 border border-gray-300 dark:border-slate-600'
                  }`}>
                    {course.status === 'published' ? t('common.published') : t('common.draft')}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-500 dark:text-slate-400">{course.modules_count} modul</td>
                <td className="px-5 py-4 text-sm text-gray-500 dark:text-slate-400">
                  {new Date(course.created_at).toLocaleDateString('uz-UZ')}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleToggle(course.id)}
                      title={course.status === 'published' ? t('common.unpublish') : t('common.publish')}
                      className="p-1.5 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-800 dark:hover:text-slate-200 transition"
                    >
                      {course.status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      onClick={() => navigate(`/admin/courses/${course.id}`)}
                      title={t('common.edit')}
                      className="p-1.5 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-800 dark:hover:text-slate-200 transition"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => { setAssignCourseId(course.id); setAssigneeId(''); setAssignDue(''); setAssignSuccess(''); }}
                      title={t('courses.assign')}
                      className="p-1.5 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-blue-400 transition"
                    >
                      <UserPlus size={16} />
                    </button>
                    {deleteConfirm === course.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="px-2 py-1 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-500 transition"
                        >
                          {t('common.yes')}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2 py-1 rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs font-semibold hover:bg-gray-300 dark:hover:bg-slate-600 transition"
                        >
                          {t('common.no')}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(course.id)}
                        title={t('common.delete')}
                        className="p-1.5 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-red-600/10 hover:text-red-400 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-gray-400 dark:text-slate-500 text-sm">
                  {t('courses.empty')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Course Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">{t('courses.createTitle')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 dark:text-slate-400 mb-1.5">{t('courses.newTitle')}</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Kurs nomini kiriting"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-red-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-slate-400 mb-1.5">{t('courses.newDesc')}</label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Kurs tavsifi..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-red-500 text-sm resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreate}
                disabled={!newTitle.trim()}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-gray-200 dark:disabled:bg-slate-700 disabled:text-gray-400 dark:disabled:text-slate-500 text-white font-semibold text-sm transition"
              >
                {t('common.save')}
              </button>
              <button
                onClick={() => setShowNewModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-medium text-sm transition"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {assignCourseId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">{t('courses.assignTitle')}</h2>
            {assignSuccess ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-emerald-400 font-medium">{assignSuccess}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 dark:text-slate-400 mb-1.5">{t('courses.assignTo')}</label>
                  <div className="flex gap-2">
                    {(['employee', 'department'] as const).map(tp => (
                      <button
                        key={tp}
                        onClick={() => { setAssignType(tp); setAssigneeId(''); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                          assignType === tp
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {tp === 'employee' ? t('courses.toEmployee') : t('courses.toDepartment')}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 dark:text-slate-400 mb-1.5">
                    {assignType === 'employee' ? t('courses.selectEmployee') : t('courses.selectDepartment')}
                  </label>
                  <select
                    value={assigneeId}
                    onChange={e => setAssigneeId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 text-sm"
                  >
                    <option value="">— Tanlang —</option>
                    {assignType === 'employee'
                      ? employees.map(e => <option key={e.id} value={e.id}>{e.full_name} ({e.email})</option>)
                      : departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)
                    }
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 dark:text-slate-400 mb-1.5">{t('courses.dueDate')}</label>
                  <input
                    type="date"
                    value={assignDue}
                    onChange={e => setAssignDue(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 text-sm"
                  />
                </div>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={handleAssign}
                    disabled={!assigneeId}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-gray-200 dark:disabled:bg-slate-700 disabled:text-gray-400 dark:disabled:text-slate-500 text-white font-semibold text-sm transition"
                  >
                    {t('courses.assign')}
                  </button>
                  <button
                    onClick={() => setAssignCourseId(null)}
                    className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-medium text-sm transition"
                  >
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
