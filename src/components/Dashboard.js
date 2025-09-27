import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../utils/translations';

export default function Dashboard() {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const t = useTranslation(state.lang);

  const isDoctor = state.user?.role === 'doctor';
  const titleKey = isDoctor ? 'dashboardTitleDoctor' : 'dashboardTitlePatient';
  const descKey = isDoctor ? 'dashboardDescDoctor' : 'dashboardDescPatient';
  const welcome = isDoctor ? t('successWelcomeDoctor') : t('successWelcomePatient');

  const handleSignOut = () => {
    actions.clearUser();
    navigate('/');
  };

  return (
    <section className="min-h-[calc(100vh-4rem)] grid place-items-center py-10">
      <div className="w-full max-w-4xl">
        <div className="rounded-2xl soft-shadow border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/70 backdrop-blur p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-700 dark:text-brand-300 grid place-items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5ZM21 20a8.5 8.5 0 0 0-17 0 1 1 0 0 0 1 1h15a1 1 0 0 0 1-1Z"/>
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold">
                {t(titleKey)}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                {t(descKey)}
              </p>
            </div>
            <button 
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200/70 dark:hover:bg-neutral-800 font-medium focus-ring"
            >
              <span>{t('signOut')}</span>
            </button>
          </div>

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/50 p-5 sm:p-6">
            <div className="text-lg font-semibold mb-2">
              {welcome}, {state.user?.name || ''}!
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              This is a sample dashboard. Add, view, or manage demo records here.
            </div>

            {/* Quick actions */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button className="px-4 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold focus-ring">
                New record
              </button>
              <button className="px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200/70 dark:hover:bg-neutral-800 text-sm font-semibold focus-ring">
                View records
              </button>
              <button className="px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200/70 dark:hover:bg-neutral-800 text-sm font-semibold focus-ring">
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
