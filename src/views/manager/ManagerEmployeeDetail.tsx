import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { auth, db } from '../../store/db';
import { useApp } from '../../contexts/AppContext';

function ProgressBar({ value }: { value: number }) {
  const color =
    value >= 80 ? 'bg-emerald-500' : value >= 40 ? 'bg-yellow-500' : 'bg-gray-300 dark:bg-slate-600';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 dark:bg-slate-800 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-gray-500 dark:text-slate-400 w-8 text-right shrink-0">{value}%</span>
    </div>
  );
}

export function ManagerEmployeeDetail() {
  const { t } = useApp();
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const user = auth.getUser();

  const employee = useMemo(() => employeeId ? db.employees.find(employeeId) : null, [employeeId]);

  const stats = useMemo(() => {
    if (!user) return null;
    return db.stats.getManagerStats(user.id);
  }, [user]);

  const employeeData = useMemo(() => {
    if (!stats || !employeeId) return null;
    return stats.teamProgress.find(tp => tp.employee.id === employeeId) ?? null;
  }, [stats, employeeId]);

  if (!employee || !employeeData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/manager/team')}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 transition"
          >
            <ArrowLeft size={16} /> {t('empDetail.back')}
          </button>
        </div>
        <div className="text-center py-20 text-gray-400 dark:text-slate-500">
          {t('common.loading')}
        </div>
      </div>
    );
  }

  const { enrollments } = employeeData;
  const dept = db.departments.list().find(d => d.id === employee.department_id);
  const completedCount = enrollments.filter(e => e.enrollment.status === 'completed').length;
  const inProgressCount = enrollments.filter(e => e.enrollment.status === 'in_progress').length;
  const overdueCount = enrollments.filter(e => e.is_overdue).length;
  const avgProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((s, e) => s + e.enrollment.progress_percent, 0) / enrollments.length)
    : 0;

  const STATUS_COLOR: Record<string, string> = {
    completed:   'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    in_progress: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    not_started: 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-300 dark:border-slate-700',
  };

  function statusLabel(status: string): string {
    if (status === 'completed') return t('status.completed');
    if (status === 'in_progress') return t('status.in_progress');
    return t('status.not_started');
  }

  function formatDate(iso?: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/manager/team')}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 transition mb-4"
        >
          <ArrowLeft size={16} /> {t('empDetail.back')}
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{t('empDetail.title')}</h1>
      </div>

      {/* Employee profile card */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-emerald-700 flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-white">
              {employee.full_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">{employee.full_name}</h2>
            <p className="text-gray-500 dark:text-slate-400 text-sm">{employee.email}</p>
            {dept && (
              <p className="text-sm text-emerald-400 font-medium mt-1">{dept.name}</p>
            )}
          </div>
          <div className="shrink-0">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              employee.status === 'active'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-red-500/15 text-red-400 border border-red-500/30'
            }`}>
              {employee.status === 'active' ? 'Faol' : "O'chirilgan"}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-slate-800">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{enrollments.length}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{t('manager.totalEnrollments')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">{completedCount}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{t('status.completed')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">{inProgressCount}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{t('status.in_progress')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">{overdueCount}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{t('overdue.label')}</p>
          </div>
        </div>

        {/* Average progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400 dark:text-slate-500">{t('manager.avgProgress')}</span>
            <span className="text-xs font-bold text-gray-700 dark:text-slate-300">{avgProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                avgProgress >= 80 ? 'bg-emerald-500' : avgProgress >= 40 ? 'bg-yellow-500' : 'bg-gray-400 dark:bg-slate-600'
              }`}
              style={{ width: `${avgProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Courses table */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">{t('empDetail.courses')}</h2>
        </div>

        {enrollments.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 dark:text-slate-500 text-sm">
            {t('empDetail.noCourses')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                    {t('courses.name')}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider w-36">
                    Progress
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider w-28">
                    {t('courses.status')}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider w-28">
                    {t('courses.dueDate')}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider w-32">
                    {t('empDetail.completedAt')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                {enrollments.map(({ enrollment, course, assignment, is_overdue }) => (
                  <tr key={course.id} className={`hover:bg-gray-50 dark:hover:bg-slate-800/30 transition ${is_overdue ? 'bg-red-50/50 dark:bg-red-950/10' : ''}`}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-slate-200">{course.title}</p>
                        {is_overdue && (
                          <span className="inline-flex items-center text-xs text-red-400 font-medium mt-0.5">
                            {t('overdue.badge')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <ProgressBar value={enrollment.progress_percent} />
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLOR[enrollment.status]}`}>
                        {statusLabel(enrollment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs ${is_overdue ? 'text-red-400 font-semibold' : 'text-gray-500 dark:text-slate-400'}`}>
                        {assignment?.due_date ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-500 dark:text-slate-400">
                        {formatDate(enrollment.completed_at)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
