import { Link } from 'react-router';
import { auth, db, Course, Enrollment } from '../../store/db';
import { BookOpen } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

type AssignedCourse = Course & { enrollment: Enrollment | null };

export function EmployeeDashboard() {
  const { t } = useApp();
  const user = auth.getUser();
  const courses: AssignedCourse[] = user ? db.assignments.getAssignedCourses(user.id) : [];

  function getButtonLabel(enrollment: Enrollment | null): string {
    if (!enrollment || enrollment.status === 'not_started') return t('emp.start');
    if (enrollment.status === 'completed') return t('emp.completed');
    return t('emp.continue');
  }

  function getButtonClass(enrollment: Enrollment | null): string {
    if (enrollment?.status === 'completed') {
      return 'block text-center w-full py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-600/30 text-emerald-400 text-sm font-semibold transition cursor-default';
    }
    return 'block text-center w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition';
  }

  function statusLabel(status: string): string {
    if (status === 'completed')   return t('status.completed');
    if (status === 'in_progress') return t('status.in_progress');
    return t('status.not_started');
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('emp.myCourses')}</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
          Salom, {user?.full_name ?? 'Xodim'}! {courses.length > 0 ? `${courses.length} ta kurs mavjud.` : ''}
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-gray-300 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50">
          <BookOpen size={48} className="text-gray-300 dark:text-slate-700 mb-4" />
          <p className="text-gray-500 dark:text-slate-400 font-medium">{t('emp.empty')}</p>
          <p className="text-gray-400 dark:text-slate-600 text-sm mt-1">Administrator kurs tayinlashini kuting</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map(item => {
            const progress = item.enrollment?.progress_percent ?? 0;
            const status = item.enrollment?.status ?? 'not_started';
            return (
              <div
                key={item.id}
                className="flex flex-col rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-gray-300 dark:hover:border-slate-700 transition"
              >
                {/* Status badge */}
                <div className="mb-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    status === 'completed'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : status === 'in_progress'
                      ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 border border-gray-300 dark:border-slate-600'
                  }`}>
                    {statusLabel(status)}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-5 flex-1 line-clamp-3">{item.description}</p>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-400 dark:text-slate-500">Progress</span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {status === 'completed' ? (
                  <span className={getButtonClass(item.enrollment)}>
                    {getButtonLabel(item.enrollment)}
                  </span>
                ) : (
                  <Link to={`/employee/course/${item.id}`} className={getButtonClass(item.enrollment)}>
                    {getButtonLabel(item.enrollment)}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
