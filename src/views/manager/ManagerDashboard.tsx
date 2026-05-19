import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { Users2, BookOpen, TrendingUp, Award } from 'lucide-react';
import { auth, db } from '../../store/db';
import { useApp } from '../../contexts/AppContext';

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-slate-100 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  const color =
    value >= 80 ? 'bg-emerald-500' : value >= 40 ? 'bg-yellow-500' : 'bg-gray-300 dark:bg-slate-600';
  return (
    <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-1.5">
      <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${value}%` }} />
    </div>
  );
}

export function ManagerDashboard() {
  const { t } = useApp();
  const user  = auth.getUser();
  const stats = useMemo(() => db.stats.getManagerStats(user?.id ?? ''), [user?.id]);

  const STATUS_LABEL: Record<string, string> = {
    completed:   t('status.completed'),
    in_progress: t('status.in_progress'),
    not_started: t('status.not_started'),
  };
  const STATUS_COLOR: Record<string, string> = {
    completed:   'bg-emerald-500/20 text-emerald-400',
    in_progress: 'bg-yellow-500/20  text-yellow-400',
    not_started: 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400',
  };

  if (!stats) {
    return (
      <div className="text-gray-500 dark:text-slate-400 text-center py-20">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{t('manager.dashboard')}</h1>
        {stats.department && (
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
            {t('manager.department')}: <span className="text-emerald-400 font-medium">{stats.department.name}</span>
          </p>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users2}    label={t('manager.teamSize')}          value={stats.teamSize}              color="bg-emerald-600" />
        <StatCard icon={BookOpen}  label={t('manager.totalEnrollments')}  value={stats.totalEnrollments}      color="bg-blue-600"    />
        <StatCard icon={Award}     label={t('manager.completed')}         value={stats.completedEnrollments}  color="bg-purple-600"  />
        <StatCard icon={TrendingUp} label={t('manager.avgProgress')}      value={`${stats.avgProgress}%`}    color="bg-orange-600"  />
      </div>

      {/* Team quick view */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">{t('manager.team')}</h2>
          <Link
            to="/manager/team"
            className="text-sm text-emerald-400 hover:text-emerald-300 font-medium transition"
          >
            {t('manager.detail')}
          </Link>
        </div>

        {stats.teamProgress.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400 dark:text-slate-500 text-sm">
            {t('manager.noTeam')}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-slate-800">
            {stats.teamProgress.map(({ employee, enrollments }) => {
              const avgPct =
                enrollments.length > 0
                  ? Math.round(
                      enrollments.reduce((s, e) => s + e.enrollment.progress_percent, 0) /
                        enrollments.length
                    )
                  : 0;
              return (
                <div key={employee.id} className="px-6 py-4 flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-white">
                      {employee.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Name + courses */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">{employee.full_name}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{enrollments.length} {t('manager.assigned')}</p>
                  </div>

                  {/* Progress */}
                  <div className="w-32 hidden sm:block">
                    <ProgressBar value={avgPct} />
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 text-right">{avgPct}%</p>
                  </div>

                  {/* Badges */}
                  <div className="flex gap-1.5 flex-wrap justify-end w-40 hidden md:flex">
                    {enrollments.slice(0, 2).map(({ enrollment, course }) => (
                      <span
                        key={course.id}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          STATUS_COLOR[enrollment.status] ?? STATUS_COLOR.not_started
                        }`}
                      >
                        {STATUS_LABEL[enrollment.status]}
                      </span>
                    ))}
                    {enrollments.length > 2 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400">
                        +{enrollments.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
