import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Lang } from '../i18n';
import { getTranslation, type TranslationKey } from '../i18n';

interface AppContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  t: (key: TranslationKey) => string;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem('lms_lang') as Lang) ?? 'uz';
  });
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('lms_theme') as 'dark' | 'light') ?? 'dark';
  });

  // Apply .dark class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('lms_theme', theme);
  }, [theme]);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem('lms_lang', l);
  }

  function toggleTheme() {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  }

  const t = useCallback((key: TranslationKey) => getTranslation(lang, key), [lang]);

  return (
    <AppContext.Provider value={{ lang, setLang, theme, toggleTheme, t }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
