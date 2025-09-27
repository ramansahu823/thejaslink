import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../utils/translations';
import { motion } from 'framer-motion';
import Footer from './Footer';

export default function Home() {
  const navigate = useNavigate();
  const { actions } = useApp();
  const { state } = useApp();
  const t = useTranslation(state.lang);

  const handleRoleSelect = (role) => {
    actions.setRole(role);
    navigate(`/${role}-signin`);
  };

  const handleEmergencyCall = () => {
    alert('Emergency services: This is a demo. In a real app, this would connect to emergency services or display emergency contacts.');
  };

  return (
    <>
      {/* Hero Section */}
      <section id="home" className="min-h-[calc(100vh-4rem)] grid place-items-center py-10">
        <div className="w-full max-w-3xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              <span className="inline-block mr-2">{t('welcomeTitlePart1')}</span>
              <span className="inline-block true-focus-animation text-brand-600 dark:text-brand-400 mr-2">{t('welcomeTitlePart2')}</span>
              <span className="inline-block true-focus-animation-delayed text-brand-600 dark:text-brand-400">{t('welcomeTitlePart3')}</span>
            </h1>
            <p className="text-neutral-600 dark:text-neutral-300 text-base sm:text-lg">
              {t('welcomeSubtitle')}
            </p>
          </div>

          <div className="rounded-2xl soft-shadow border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 backdrop-blur p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="text-sm uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
                {t('whoAreYou')}
              </div>
              <div className="h-1 w-16 mx-auto rounded-full bg-brand-500/60"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Doctor card */}
              <button 
                onClick={() => handleRoleSelect('doctor')}
                className="group rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-6 text-left hover:-translate-y-0.5 transition-transform soft-shadow focus-ring w-full"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-brand-500/10 text-brand-700 dark:text-brand-300 grid place-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5ZM21 20a8.5 8.5 0 0 0-17 0 1 1 0 0 0 1 1h15a1 1 0 0 0 1-1Z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{t('doctor')}</div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">MBBS, MD, Specialist</div>
                  </div>
                  <div className="ml-auto text-brand-700 dark:text-brand-300 group-hover:translate-x-0.5 transition-transform">→</div>
                </div>
              </button>

              {/* Patient card */}
              <button 
                onClick={() => handleRoleSelect('patient')}
                className="group rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-6 text-left hover:-translate-y-0.5 transition-transform soft-shadow focus-ring w-full"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-brand-500/10 text-brand-700 dark:text-brand-300 grid place-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 13a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm6 8H6a1 1 0 0 1-1-1 7 7 0 0 1 14 0 1 1 0 0 1-1 1Z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{t('patient')}</div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">Care & Records</div>
                  </div>
                  <div className="ml-auto text-brand-700 dark:text-brand-300 group-hover:translate-x-0.5 transition-transform">→</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">{t('aboutTitle')}</h2>
            <div className="h-1 w-20 mx-auto rounded-full bg-brand-500/60 mb-6"></div>
            <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {t('aboutMotive')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Secure Digital Records */}
            <motion.div 
              className="group text-center p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur relative overflow-hidden cursor-pointer"
              whileHover={{ 
                y: -8,
                scale: 1.02,
                boxShadow: "0 20px 40px rgba(59, 130, 246, 0.15)"
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Light popup effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              
              <motion.div 
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-300 grid place-items-center relative z-10"
                whileHover={{ 
                  scale: 1.1,
                  rotate: [0, -5, 5, 0],
                }}
                transition={{ duration: 0.5 }}
              >
                <motion.svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="w-8 h-8" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  whileHover={{ 
                    scale: 1.2,
                    strokeWidth: 2.5
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </motion.svg>
              </motion.div>
              <h3 className="text-lg font-semibold mb-2 relative z-10">{t('aboutFeature1')}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 relative z-10">End-to-end encryption ensures your medical data stays private and secure.</p>
            </motion.div>

            {/* 24/7 Access */}
            <motion.div 
              className="group text-center p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur relative overflow-hidden cursor-pointer"
              whileHover={{ 
                y: -8,
                scale: 1.02,
                boxShadow: "0 20px 40px rgba(34, 197, 94, 0.15)"
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Light popup effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              
              <motion.div 
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-300 grid place-items-center relative z-10"
                whileHover={{ 
                  scale: 1.1,
                  rotate: [0, -10, 10, 0],
                }}
                transition={{ duration: 0.6 }}
              >
                <motion.svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="w-8 h-8" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  whileHover={{ 
                    scale: 1.2,
                    strokeWidth: 2.5
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </motion.svg>
              </motion.div>
              <h3 className="text-lg font-semibold mb-2 relative z-10">{t('aboutFeature2')}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 relative z-10">Access your health records anytime, anywhere, from any device.</p>
            </motion.div>

            {/* Multi-Provider Integration */}
            <motion.div 
              className="group text-center p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur relative overflow-hidden cursor-pointer"
              whileHover={{ 
                y: -8,
                scale: 1.02,
                boxShadow: "0 20px 40px rgba(168, 85, 247, 0.15)"
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Light popup effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              
              <motion.div 
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-300 grid place-items-center relative z-10"
                whileHover={{ 
                  scale: 1.1,
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 0.5 }}
              >
                <motion.svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="w-8 h-8" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  whileHover={{ 
                    scale: 1.2,
                    strokeWidth: 2.5
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </motion.svg>
              </motion.div>
              <h3 className="text-lg font-semibold mb-2 relative z-10">{t('aboutFeature3')}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 relative z-10">Seamlessly connect with hospitals, clinics, and healthcare providers.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 sm:py-20 bg-neutral-50/50 dark:bg-neutral-900/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">{t('servicesTitle')}</h2>
            <div className="h-1 w-20 mx-auto rounded-full bg-brand-500/60"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Digital Health Records Service */}
            <motion.div 
              className="group p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 soft-shadow relative overflow-hidden cursor-pointer"
              whileHover={{ 
                y: -8,
                scale: 1.02,
                boxShadow: "0 25px 50px rgba(59, 130, 246, 0.2)"
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Light popup effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              
              <motion.div 
                className="w-12 h-12 mb-4 rounded-lg bg-brand-500/10 text-brand-700 dark:text-brand-300 grid place-items-center relative z-10"
                whileHover={{ 
                  scale: 1.15,
                  rotate: [0, -8, 8, 0],
                }}
                transition={{ duration: 0.4 }}
              >
                <motion.svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="w-6 h-6" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  whileHover={{ 
                    scale: 1.3,
                    strokeWidth: 2.5
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </motion.svg>
              </motion.div>
              <h3 className="text-lg font-semibold mb-2 relative z-10">{t('serviceRecord')}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 relative z-10">{t('serviceRecordDesc')}</p>
            </motion.div>

            {/* Instant Access Service */}
            <motion.div 
              className="group p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 soft-shadow relative overflow-hidden cursor-pointer"
              whileHover={{ 
                y: -8,
                scale: 1.02,
                boxShadow: "0 25px 50px rgba(34, 197, 94, 0.2)"
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Light popup effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              
              <motion.div 
                className="w-12 h-12 mb-4 rounded-lg bg-brand-500/10 text-brand-700 dark:text-brand-300 grid place-items-center relative z-10"
                whileHover={{ 
                  scale: 1.15,
                  rotate: [0, 360],
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                <motion.svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="w-6 h-6" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  whileHover={{ 
                    scale: 1.3,
                    strokeWidth: 2.5
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </motion.svg>
              </motion.div>
              <h3 className="text-lg font-semibold mb-2 relative z-10">{t('serviceAccess')}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 relative z-10">{t('serviceAccessDesc')}</p>
            </motion.div>

            {/* Secure Sharing Service */}
            <motion.div 
              className="group p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 soft-shadow relative overflow-hidden cursor-pointer"
              whileHover={{ 
                y: -8,
                scale: 1.02,
                boxShadow: "0 25px 50px rgba(168, 85, 247, 0.2)"
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Light popup effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              
              <motion.div 
                className="w-12 h-12 mb-4 rounded-lg bg-brand-500/10 text-brand-700 dark:text-brand-300 grid place-items-center relative z-10"
                whileHover={{ 
                  scale: 1.15,
                  y: [0, -5, 0],
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <motion.svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="w-6 h-6" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  whileHover={{ 
                    scale: 1.3,
                    strokeWidth: 2.5
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                  <polyline points="16,6 12,2 8,6"/>
                  <line x1="12" y1="2" x2="12" y2="15"/>
                </motion.svg>
              </motion.div>
              <h3 className="text-lg font-semibold mb-2 relative z-10">{t('serviceShare')}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 relative z-10">{t('serviceShareDesc')}</p>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer onEmergencyCall={handleEmergencyCall} />
    </>
  );
}
