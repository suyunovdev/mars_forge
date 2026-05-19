import { useState } from 'react';
import { Link } from 'react-router';
import { auth, db, Course, Enrollment } from '../../store/db';
import { BookOpen } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

type AssignedCourse = Course & { enrollment: Enrollment | null; due_date?: string; is_overdue: boolean };
type TabFilter = 'all' | 'in_progress' | 'completed' | 'overdue';

export function EmployeeDashboard() {
  const { t } = useApp();
  const user = auth.getUser();
  const courses: AssignedCourse[] = user ? db.assignments.getAssignedCourses(user.id) : [];
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  function getButtonLabel(enrollment: Enrollment | null): string {
    if (!enrollment || enrollment.status === 'not_started') return t('emp.start');
    if (enrollment.status === 'completed') return t('emp.completed');
    return t('emp.continue');
  }

  function statusLabel(status: string): string {
    if (status === 'completed')   return t('status.completed');
    if (status === 'in_progress') return t('status.in_progress');
    return t('status.not_started');
  }

  const filteredCourses = courses.filter(item => {
    const status = item.enrollment?.status ?? 'not_started';
    if (activeTab === 'all') return true;
    if (activeTab === 'in_progress') return status === 'in_progress' || status === 'not_started';
    if (activeTab === 'completed') return status === 'completed';
    if (activeTab === 'overdue') return item.is_overdue;
    return true;
  });

  const overdueCount = courses.filter(c => c.is_overdue).length;

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'all', label: t('emp.tab.all') },
    { key: 'in_progress', label: t('emp.tab.inProgress') },
    { key: 'completed', label: t('emp.tab.completed') },
    { key: 'overdue', label: t('emp.tab.overdue') },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('emp.myCourses')}</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
          Salom, {user?.full_name ?? 'Xodim'}! {courses.length > 0 ? `${courses.length} ta kurs mavjud.` : ''}
        </p>
      </div>

      {/* Tabs */}
      {courses.length > 0 && (
        <div className="flex gap-1 mb-6 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl w-fit">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
              {tab.key === 'overdue' && overdueCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-red-500 text-white">
                  {overdueCount}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-gray-300 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50">
          <BookOpen size={48} className="text-gray-300 dark:text-slate-700 mb-4" />
          <p className="text-gray-500 dark:text-slate-400 font-medium">{t('emp.empty')}</p>
          <p className="text-gray-400 dark:text-slate-600 text-sm mt-1">Administrator kurs tayinlashini kuting</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map(item => {
            const progress = item.enrollment?.progress_percent ?? 0;
            const status = item.enrollment?.status ?? 'not_started';
            return (
              <div
                key={item.id}
                className={`flex flex-col rounded-2xl border bg-white dark:bg-slate-900 p-5 transition ${
                  item.is_overdue
                    ? 'border-red-500/40 dark:border-red-500/30 hover:border-red-500/60'
                    : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Status badge + overdue */}
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    status === 'completed'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : status === 'in_progress'
                      ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 border border-gray-300 dark:border-slate-600'
                  }`}>
                    {statusLabel(status)}
                  </span>
                  {item.is_overdue && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
                      {t('overdue.badge')}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-4 flex-1 line-clamp-3">{item.description}</p>

                {/* Due date */}
                {item.due_date && (
                  <p className={`text-xs mb-3 font-medium ${item.is_overdue ? 'text-red-400' : 'text-gray-400 dark:text-slate-500'}`}>
                    {t('overdue.due')}: {item.due_date}
                  </p>
                )}

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-400 dark:text-slate-500">Progress</span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        status === 'completed' ? 'bg-emerald-500' : item.is_overdue ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2">
                  {status === 'completed' ? (
                    <>
                      <span className="block text-center w-full py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-600/30 text-emerald-400 text-sm font-semibold">
                        {t('emp.completed')}
                      </span>
                      <Link
                        to={`/employee/certificate/${item.id}`}
                        className="block text-center w-full py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-sm font-semibold hover:bg-amber-500/25 transition"
                      >
                        {t('cert.title')} →
                      </Link>
                    </>
                  ) : (
                    <Link
                      to={`/employee/course/${item.id}`}
                      className="block text-center w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition"
                    >
                      {getButtonLabel(item.enrollment)}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
