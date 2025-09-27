import React from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../utils/translations';

export default function Header() {
  const { state, actions } = useApp();
  const t = useTranslation(state.lang);

  const handleThemeToggle = () => {
    actions.setTheme(state.theme === 'dark' ? 'light' : 'dark');
  };

  const handleLangChange = (e) => {
    actions.setLang(e.target.value);
  };

  return (
    <header className="w-full border-b border-neutral-200/70 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-950/70 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="#/" className="flex items-center gap-3 group">
            <div className="relative">
              {/* Simple medical cross in a circle */}
              <svg width="36" height="36" viewBox="0 0 48 48" fill="none" className="drop-shadow-sm">
                <circle cx="24" cy="24" r="22" className="fill-brand-500/10 stroke-brand-600" strokeWidth="2"></circle>
                <path d="M24 14v20M14 24h20" className="stroke-brand-600" strokeWidth="3.5" strokeLinecap="round"></path>
              </svg>
              <span className="sr-only">ThejasLink</span>
            </div>
            <div className="leading-tight">
              <div className="text-lg font-extrabold tracking-tight">ThejasLink</div>
              <div className="text-[11px] uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
                {t('tagline')}
              </div>
            </div>
          </a>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language selector */}
            <label className="sr-only" htmlFor="langSelect">{t('langNote')}</label>
            <div className="relative">
              <select 
                id="langSelect" 
                value={state.lang}
                onChange={handleLangChange}
                className="appearance-none pr-9 pl-3 py-2 rounded-md bg-neutral-100 dark:bg-neutral-900 text-sm border border-neutral-200 dark:border-neutral-800 focus-ring"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
              </select>
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500">
                ▼
              </div>
            </div>

            {/* Theme toggle */}
            <button 
              onClick={handleThemeToggle}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-sm font-medium hover:bg-neutral-200/70 dark:hover:bg-neutral-800 focus-ring" 
              aria-pressed={state.theme === 'dark'}
            >
              <span className="w-4 h-4 grid place-items-center" aria-hidden="true">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`w-4 h-4 ${state.theme === 'dark' ? 'inline' : 'hidden'}`} 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="4" strokeWidth="1.6"/>
                  <g strokeWidth="1.6">
                    <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l-1.4-1.4M20.4 20.4L19 19M5 19l-1.4 1.4M20.4 3.6L19 5"/>
                  </g>
                </svg>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`w-4 h-4 ${state.theme === 'dark' ? 'hidden' : 'inline'}`} 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79z"/>
                </svg>
              </span>
              <span className="hidden sm:inline">{t('toggleTheme')}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
