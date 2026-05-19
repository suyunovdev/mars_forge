import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
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

export function ManagerTeam() {
  const { t } = useApp();
  const user  = auth.getUser();
  const stats = useMemo(() => db.stats.getManagerStats(user?.id ?? ''), [user?.id]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const STATUS_COLOR: Record<string, string> = {
    completed:   'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    in_progress: 'bg-yellow-500/20  text-yellow-400  border border-yellow-500/30',
    not_started: 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-300 dark:border-slate-700',
  };

  function statusLabel(status: string): string {
    if (status === 'completed')   return t('status.completed');
    if (status === 'in_progress') return t('status.in_progress');
    return t('status.not_started');
  }

  function toggle(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  if (!stats) {
    return (
      <div className="text-gray-400 dark:text-slate-400 text-center py-20">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{t('manager.teamProgress')}</h1>
        {stats.department && (
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
            {t('manager.department')}: <span className="text-emerald-400 font-medium">{stats.department.name}</span>
            {' · '}
            <span className="text-gray-500 dark:text-slate-400">{stats.teamSize} ta xodim</span>
          </p>
        )}
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: t('manager.avgProgress'),       value: `${stats.avgProgress}%` },
          { label: t('manager.completed'),          value: stats.completedEnrollments },
          { label: t('manager.totalEnrollments'),   value: stats.totalEnrollments },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-5 py-4">
            <p className="text-xs text-gray-400 dark:text-slate-500 mb-1">{s.label}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-slate-100">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Team table */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_140px_120px] gap-4 px-6 py-3 bg-gray-100/80 dark:bg-slate-800/50 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
          <span>{t('manager.employee')}</span>
          <span>{t('manager.avgProgress')}</span>
          <span>{t('courses.status')}</span>
        </div>

        {stats.teamProgress.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 dark:text-slate-500 text-sm">
            {t('manager.noTeam')}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-slate-800">
            {stats.teamProgress.map(({ employee, enrollments }) => {
              const isOpen = expanded.has(employee.id);
              const avgPct =
                enrollments.length > 0
                  ? Math.round(
                      enrollments.reduce((s, e) => s + e.enrollment.progress_percent, 0) /
                        enrollments.length
                    )
                  : 0;
              const allDone  = enrollments.length > 0 && enrollments.every(e => e.enrollment.status === 'completed');
              const anyStarted = enrollments.some(e => e.enrollment.status !== 'not_started');
              const overallStatus = allDone ? 'completed' : anyStarted ? 'in_progress' : 'not_started';

              return (
                <div key={employee.id}>
                  {/* Employee row */}
                  <button
                    onClick={() => toggle(employee.id)}
                    className="w-full grid grid-cols-[1fr_140px_120px] gap-4 px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-slate-800/40 transition group"
                  >
                    {/* Name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-white">
                          {employee.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">{employee.full_name}</p>
                        <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{employee.email}</p>
                      </div>
                      {enrollments.length > 0 && (
                        isOpen
                          ? <ChevronDown size={14} className="text-gray-400 dark:text-slate-500 shrink-0 ml-1" />
                          : <ChevronRight size={14} className="text-gray-400 dark:text-slate-500 shrink-0 ml-1" />
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center">
                      {enrollments.length > 0 ? (
                        <div className="w-full">
                          <ProgressBar value={avgPct} />
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300 dark:text-slate-600">{t('manager.noCourses')}</span>
                      )}
                    </div>

                    {/* Status badge */}
                    <div className="flex items-center">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${STATUS_COLOR[overallStatus]}`}>
                        {statusLabel(overallStatus)}
                      </span>
                    </div>
                  </button>

                  {/* Expanded courses */}
                  {isOpen && enrollments.length > 0 && (
                    <div className="bg-gray-50/60 dark:bg-slate-950/60 border-t border-gray-200/60 dark:border-slate-800 divide-y divide-gray-200/60 dark:divide-slate-800/60">
                      {enrollments.map(({ enrollment, course }) => (
                        <div
                          key={course.id}
                          className="grid grid-cols-[1fr_140px_120px] gap-4 px-6 py-3 pl-16 items-center"
                        >
                          <p className="text-sm text-gray-700 dark:text-slate-300 truncate">{course.title}</p>
                          <ProgressBar value={enrollment.progress_percent} />
                          <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium w-fit ${STATUS_COLOR[enrollment.status]}`}>
                            {statusLabel(enrollment.status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
