import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../utils/translations';
import { motion } from 'framer-motion';
import { loginDoctor } from '../services/authService';

export default function DoctorLogin() {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const t = useTranslation(state.lang);
  
  const [formData, setFormData] = useState({
    credentials: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Credentials validation (license/phone/email)
    if (!formData.credentials.trim()) {
      newErrors.credentials = 'Please enter your license ID, phone number, or email';
    } else {
      const credentials = formData.credentials.trim();
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials);
      const isPhone = /^[+]?[0-9\s\-()]{10,15}$/.test(credentials);
      const isLicense = /^[A-Z]{2}-\d{5}-\d{4}$/.test(credentials);
      
      if (!isEmail && !isPhone && !isLicense) {
        newErrors.credentials = 'Please enter a valid license ID, phone number, or email address';
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 // DoctorLogin.js

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitError('');
    // ...
    setIsSubmitting(true);
    try {
      // --- START: इस ब्लॉक को हटा दें ---
      // We require email login; if provided phone/license, show error
      if (!formData.credentials.includes('@')) {
        throw new Error('Please use your email to sign in');
      }
      // --- END: इस ब्लॉक को हटा दें ---
      const profile = await loginDoctor(formData.credentials.trim(), formData.password);

      actions.setUser({ ...profile, role: 'doctor' });
      
      // --- START: इस लाइन को बदलें ---
      navigate('/DoctorDashboard'); // सही URL
      // --- END: इस लाइन को बदलें ---

    } catch (err) {
      setSubmitError(err?.message || 'Failed to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleGoToRegistration = () => {
    navigate('/doctor-registration');
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <section className="min-h-[calc(100vh-4rem)] grid place-items-center py-10">
      <div className="w-full max-w-2xl mx-auto px-4">
        <motion.div 
          className="rounded-2xl soft-shadow border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/70 backdrop-blur p-6 sm:p-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
            <button 
              onClick={handleBackToHome}
              className="text-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white inline-flex items-center gap-2 focus-ring"
            >
              <span>←</span>
              <span>{t('back')}</span>
            </button>
            
            <button 
              onClick={handleBackToHome}
              className="text-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white inline-flex items-center gap-2 focus-ring"
            >
              <span>🏠</span>
              <span>{t('homeCta')}</span>
            </button>
          </motion.div>

          {/* Title Section */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-300 grid place-items-center">
              <motion.svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-10 h-10" 
                viewBox="0 0 24 24" 
                fill="currentColor"
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5ZM21 20a8.5 8.5 0 0 0-17 0 1 1 0 0 0 1 1h15a1 1 0 0 0 1-1Z"/>
              </motion.svg>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-2 text-brand-600 dark:text-brand-400">
              {t('doctorLogin')}
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 text-lg">
              {t('doctorLoginSubtitle')}
            </p>
          </motion.div>

          {/* Login Form */}
          <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-6">
            {/* Credentials Field */}
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300" htmlFor="credentials">
                {t('loginCredentials')} <span className="text-red-500">*</span>
              </label>
              <input 
                id="credentials" 
                name="credentials" 
                type="text" 
                required 
                value={formData.credentials}
                onChange={handleInputChange}
                placeholder={t('loginCredentialsPlaceholder')} 
                className={`w-full px-4 py-3 rounded-lg bg-neutral-100 dark:bg-neutral-900 border transition-colors focus-ring ${
                  errors.credentials 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-500'
                }`}
              />
              {errors.credentials && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {errors.credentials}
                </motion.p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300" htmlFor="password">
                {t('password')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  id="password" 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password" 
                  className={`w-full px-4 py-3 pr-12 rounded-lg bg-neutral-100 dark:bg-neutral-900 border transition-colors focus-ring ${
                    errors.password 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 focus-ring rounded"
                >
                  {showPassword ? (
                    <motion.svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="w-5 h-5" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      whileHover={{ scale: 1.1 }}
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </motion.svg>
                  ) : (
                    <motion.svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="w-5 h-5" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      whileHover={{ scale: 1.1 }}
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </motion.svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {errors.password}
                </motion.p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-brand-600 border-neutral-300 rounded focus:ring-brand-500"
                />
                <span>Remember me</span>
              </label>
              <button 
                type="button"
                className="text-sm text-brand-600 dark:text-brand-400 hover:underline focus-ring"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <motion.div 
              className="pt-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {submitError && (
                <div className="mb-3 text-sm text-red-600 dark:text-red-400">{submitError}</div>
              )}
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-semibold text-lg focus-ring transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <motion.svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="w-5 h-5" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      whileHover={{ scale: 1.1 }}
                    >
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                      <polyline points="10,17 15,12 10,7"/>
                      <line x1="15" y1="12" x2="3" y2="12"/>
                    </motion.svg>
                    <span>{t('signInButton')}</span>
                  </>
                )}
              </button>
            </motion.div>

            {/* Registration Link */}
            <motion.div 
              className="text-center pt-6 border-t border-neutral-200 dark:border-neutral-800"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-neutral-600 dark:text-neutral-400 mb-3">
                {t('newToThejasLink')}
              </p>
              <button 
                type="button"
                onClick={handleGoToRegistration}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-600 text-brand-600 dark:text-brand-400 font-semibold hover:bg-brand-50 dark:hover:bg-brand-900/20 focus-ring transition-colors"
              >
                <motion.svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="w-4 h-4" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  whileHover={{ scale: 1.1 }}
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </motion.svg>
                <span>{t('registerNow')}</span>
              </button>
            </motion.div>
          </motion.form>
        </motion.div>
      </div>
    </section>
  );
}
