import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Sun, Moon } from 'lucide-react';
import { auth, db } from '../store/db';
import { useApp } from '../contexts/AppContext';

export function Login() {
  const navigate = useNavigate();
  const { t, lang, setLang, theme, toggleTheme } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const employee = db.employees.findByEmail(email.trim().toLowerCase());
      if (!employee) {
        setError(t('auth.errNotFound'));
        setLoading(false);
        return;
      }
      if (employee.password !== password) {
        setError(t('auth.errPassword'));
        setLoading(false);
        return;
      }
      auth.setUser({
        id: employee.id,
        email: employee.email,
        role: employee.role,
        full_name: employee.full_name,
      });
      if (employee.role === 'admin')         navigate('/admin/dashboard');
      else if (employee.role === 'manager') navigate('/manager/dashboard');
      else                                  navigate('/employee/my-courses');
    } catch {
      setError(t('auth.errSystem'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 dark:from-slate-900 dark:via-red-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Lang / Theme toggle */}
        <div className="flex items-center justify-end gap-2 mb-4">
          <button
            onClick={() => setLang('uz')}
            className={`text-xs px-2 py-1 rounded transition ${lang === 'uz' ? 'bg-red-600/30 text-red-300' : 'text-slate-400 hover:text-slate-200'}`}
          >
            UZ
          </button>
          <button
            onClick={() => setLang('ru')}
            className={`text-xs px-2 py-1 rounded transition ${lang === 'ru' ? 'bg-red-600/30 text-red-300' : 'text-slate-400 hover:text-slate-200'}`}
          >
            RU
          </button>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 transition"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-600 mb-4 shadow-lg shadow-red-900/50">
            <svg viewBox="0 0 24 24" className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Mars Forge LMS</h1>
          <p className="text-slate-400 mt-1 text-sm">Korporativ o'quv platformasi</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">{t('auth.title')}</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('auth.email')}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@kompaniya.uz"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('auth.password')}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-sm">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-semibold transition shadow-lg shadow-red-900/30"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('auth.loggingIn')}
                </span>
              ) : t('auth.login')}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-slate-500 mb-3 text-center">{t('auth.demo')}</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: t('auth.role.admin'),    email: 'admin@demo.uz',   pass: 'admin',   color: 'text-red-400'     },
                { label: t('auth.role.manager'),  email: 'manager@demo.uz', pass: 'manager', color: 'text-emerald-400' },
                { label: t('auth.role.employee'), email: 'worker@demo.uz',  pass: 'worker',  color: 'text-blue-400'    },
              ].map(cred => (
                <button
                  key={cred.label}
                  type="button"
                  onClick={() => { setEmail(cred.email); setPassword(cred.pass); setError(''); }}
                  className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left transition"
                >
                  <p className={`text-xs font-semibold ${cred.color}`}>{cred.label}</p>
                  <p className="text-[10px] text-slate-500 truncate">{cred.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          © 2025 Mars Forge. Barcha huquqlar himoyalangan.
        </p>
      </div>
    </div>
  );
}
