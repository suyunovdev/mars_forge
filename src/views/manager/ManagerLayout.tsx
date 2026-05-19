import { Outlet, Link, useNavigate, useLocation } from 'react-router';
import { LogOut, LayoutDashboard, Users2, Sun, Moon } from 'lucide-react';
import { auth } from '../../store/db';
import { useApp } from '../../contexts/AppContext';

export function ManagerLayout() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = auth.getUser();
  const { t, lang, setLang, theme, toggleTheme } = useApp();

  const NAV = [
    { to: '/manager/dashboard', labelKey: 'nav.dashboard' as const, icon: LayoutDashboard },
    { to: '/manager/team',      labelKey: 'nav.teamProgress' as const, icon: Users2 },
  ];

  function handleLogout() {
    auth.clearUser();
    navigate('/login');
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950">
      {/* Sidebar — always dark */}
      <aside className="w-64 flex flex-col bg-gray-900 dark:bg-slate-900 border-r border-gray-700 dark:border-slate-800 shrink-0">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-gray-700 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Mars Forge</p>
              <p className="text-xs text-slate-500 leading-tight">{t('brand.manager')}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(item => {
            const Icon     = item.icon;
            const isActive = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-emerald-400' : 'text-slate-500'} />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        {/* Lang / Theme toggle */}
        <div className="px-3 pb-2 flex items-center gap-1">
          <button
            onClick={() => setLang('uz')}
            className={`text-xs px-2 py-1 rounded transition ${lang === 'uz' ? 'bg-emerald-600/20 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            UZ
          </button>
          <button
            onClick={() => setLang('ru')}
            className={`text-xs px-2 py-1 rounded transition ${lang === 'ru' ? 'bg-emerald-600/20 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            RU
          </button>
          <button
            onClick={toggleTheme}
            className="ml-auto p-1.5 rounded text-slate-400 hover:text-slate-200 transition"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        {/* User info & logout */}
        <div className="px-3 py-4 border-t border-gray-700 dark:border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800 dark:bg-slate-800/60 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white">
                {user?.full_name?.charAt(0).toUpperCase() ?? 'M'}
              </span>
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-slate-200 truncate">{user?.full_name ?? 'Manager'}</p>
              <p className="text-xs text-slate-500">{t('role.manager')}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-emerald-600/10 hover:text-emerald-400 transition"
          >
            <LogOut size={16} />
            {t('nav.logout')}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100">
        <div className="p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
