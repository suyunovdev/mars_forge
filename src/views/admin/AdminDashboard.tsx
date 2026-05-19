import { db } from '../../store/db';
import { Users, BookOpen, ClipboardList, TrendingUp } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export function AdminDashboard() {
  const { t } = useApp();
  const stats = db.stats.getDashboard();

  const cards = [
    {
      labelKey: 'admin.dashboard.employees' as const,
      value: stats.activeEmployees,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-600/10 border-blue-600/20',
    },
    {
      labelKey: 'admin.dashboard.courses' as const,
      value: stats.publishedCourses,
      icon: BookOpen,
      color: 'text-emerald-400',
      bg: 'bg-emerald-600/10 border-emerald-600/20',
    },
    {
      labelKey: 'admin.dashboard.assignments' as const,
      value: stats.totalAssignments,
      icon: ClipboardList,
      color: 'text-violet-400',
      bg: 'bg-violet-600/10 border-violet-600/20',
    },
    {
      labelKey: 'admin.dashboard.avgProgress' as const,
      value: `${stats.avgProgress}%`,
      icon: TrendingUp,
      color: 'text-amber-400',
      bg: 'bg-amber-600/10 border-amber-600/20',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.dashboard.title')}</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Korporativ o'quv tizimi umumiy ko'rinishi</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.labelKey} className={`rounded-xl border p-5 ${card.bg}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-2">{t(card.labelKey)}</p>
                  <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <Icon size={20} className={card.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Departments progress */}
      <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">{t('admin.dashboard.deptProgress')}</h2>
        {stats.departments.length === 0 ? (
          <p className="text-gray-400 dark:text-slate-500 text-sm">{t('common.noData')}</p>
        ) : (
          <div className="space-y-5">
            {stats.departments.map(dep => (
              <div key={dep.name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800 dark:text-slate-200">{dep.name}</span>
                    <span className="text-xs text-gray-500 dark:text-slate-500 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {dep.count} {t('admin.dashboard.people')}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">{dep.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-red-600 to-red-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${dep.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
