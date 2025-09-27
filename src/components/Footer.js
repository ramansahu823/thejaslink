import React from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../utils/translations';

export default function Footer({ onEmergencyCall }) {
  const { state } = useApp();
  const t = useTranslation(state.lang);

  return (
    <footer className="py-12 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <svg width="32" height="32" viewBox="0 0 48 48" fill="none" className="drop-shadow-sm">
                <circle cx="24" cy="24" r="22" className="fill-brand-500/10 stroke-brand-600" strokeWidth="2"></circle>
                <path d="M24 14v20M14 24h20" className="stroke-brand-600" strokeWidth="3.5" strokeLinecap="round"></path>
              </svg>
              <div className="leading-tight">
                <div className="text-lg font-extrabold tracking-tight">ThejasLink</div>
                <div className="text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {t('tagline')}
                </div>
              </div>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Revolutionizing healthcare through secure, accessible digital health records for everyone.
            </p>
            
            {/* Emergency Button */}
            <button 
              onClick={onEmergencyCall}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm focus-ring"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              <span>{t('emergencyCall')}</span>
            </button>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-3">{t('footerQuickLinks')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#home" className="text-neutral-600 dark:text-neutral-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  {t('navHome')}
                </a>
              </li>
              <li>
                <a href="#about" className="text-neutral-600 dark:text-neutral-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  {t('navAbout')}
                </a>
              </li>
              <li>
                <a href="#services" className="text-neutral-600 dark:text-neutral-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  {t('navServices')}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-3">{t('footerContact')}</h4>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li>{t('footerPhone')}</li>
              <li>{t('footerEmail')}</li>
              <li>{t('footerAddress')}</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800 text-center text-sm text-neutral-600 dark:text-neutral-400">
          <p>{t('footerCopyright')}</p>
        </div>
      </div>
    </footer>
  );
}
