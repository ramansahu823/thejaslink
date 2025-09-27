import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../utils/translations';
import { motion } from 'framer-motion';
import { loginPatient, loginWithPatientIdAndAadhar } from '../services/authService';

export default function PatientLogin() {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const t = useTranslation(state.lang);
  
  const [loginMethod, setLoginMethod] = useState('credentials'); // 'credentials' or 'patientId'
  const [formData, setFormData] = useState({
    credentials: '', // patientId or phone or email
    password: '',
    patientId: '',
    aadhar: ''
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
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleLoginMethodChange = (method) => {
    setLoginMethod(method);
    setErrors({});
    setSubmitError('');
    setFormData({
      credentials: '',
      password: '',
      patientId: '',
      aadhar: ''
    });
  };

  const validateCredentialsForm = () => {
    const newErrors = {};

    if (!formData.credentials.trim()) {
      newErrors.credentials = 'Please enter your Patient ID, phone number, or email';
    } else {
      const c = formData.credentials.trim();
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c);
      const isPhone = /^[+]?\d[\d\s\-()]{9,14}$/.test(c);
      const isPatientId = /^\d{10}$/.test(c); // 10-digit patient ID
      if (!isEmail && !isPhone && !isPatientId) {
        newErrors.credentials = 'Enter a valid Patient ID (10 digits), phone, or email';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePatientIdForm = () => {
    const newErrors = {};

    if (!formData.patientId.trim()) {
      newErrors.patientId = 'Patient ID is required';
    } else if (!/^\d{10}$/.test(formData.patientId.trim())) {
      newErrors.patientId = 'Patient ID must be exactly 10 digits';
    }

    if (!formData.aadhar.trim()) {
      newErrors.aadhar = 'Aadhar number is required';
    } else if (!/^\d{12}$/.test(formData.aadhar.trim())) {
      newErrors.aadhar = 'Aadhar number must be exactly 12 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      let profile;

      if (loginMethod === 'credentials') {
        if (!validateCredentialsForm()) return;
        profile = await loginPatient(formData.credentials.trim(), formData.password);
      } else {
        if (!validatePatientIdForm()) return;
        profile = await loginWithPatientIdAndAadhar(formData.patientId.trim(), formData.aadhar.trim());
      }

      if (profile) {
        actions.setUser({ ...profile, role: 'patient' });
        navigate('/patient-dashboard');
      } else {
        throw new Error('Login failed');
      }
    } catch (err) {
      setSubmitError(err?.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleGoToRegistration = () => {
    navigate('/patient-registration');
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut', staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
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
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
            <button onClick={handleBackToHome} className="text-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white inline-flex items-center gap-2 focus-ring">
              <span>←</span>
              <span>{t('back')}</span>
            </button>
            <button onClick={handleBackToHome} className="text-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white inline-flex items-center gap-2 focus-ring">
              <span>🏠</span>
              <span>{t('homeCta')}</span>
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-300 grid place-items-center">
              <motion.svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor" animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                <path d="M12 13a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm6 8H6a1 1 0 0 1-1-1 7 7 0 0 1 14 0 1 1 0 0 1-1 1Z"/>
              </motion.svg>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-2 text-brand-600 dark:text-brand-400">{t('patientLogin')}</h2>
            <p className="text-neutral-600 dark:text-neutral-300 text-lg">{t('patientLoginSubtitle')}</p>
          </motion.div>

          {/* Login Method Toggle */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="flex rounded-lg bg-neutral-100 dark:bg-neutral-800 p-1">
              <button
                onClick={() => handleLoginMethodChange('credentials')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  loginMethod === 'credentials'
                    ? 'bg-white dark:bg-neutral-700 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                Email / Patient ID + Password
              </button>
              <button
                onClick={() => handleLoginMethodChange('patientId')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  loginMethod === 'patientId'
                    ? 'bg-white dark:bg-neutral-700 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                Patient ID + Aadhar
              </button>
            </div>
          </motion.div>

          <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-6">
            {loginMethod === 'credentials' ? (
              // Credentials Login Form
              <>
                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300" htmlFor="credentials">
                    Email / Patient ID <span className="text-red-500">*</span>
                  </label>
                  <input 
                    id="credentials" 
                    name="credentials" 
                    type="text" 
                    required 
                    value={formData.credentials} 
                    onChange={handleInputChange}
                    placeholder="Enter email or 10-digit Patient ID"
                    className={`w-full px-4 py-3 rounded-lg bg-neutral-100 dark:bg-neutral-900 border transition-colors focus-ring ${
                      errors.credentials ? 'border-red-500 focus:border-red-500' : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-500'
                    }`}
                  />
                  {errors.credentials && (
                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm mt-1">{errors.credentials}</motion.p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300" htmlFor="password">
                    {t('password')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input id="password" name="password" type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleInputChange} placeholder="Enter your password" 
                      className={`w-full px-4 py-3 pr-12 rounded-lg bg-neutral-100 dark:bg-neutral-900 border transition-colors focus-ring ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-500'}`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 focus-ring rounded">
                      {showPassword ? (
                        <motion.svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" whileHover={{ scale: 1.1 }}>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </motion.svg>
                      ) : (
                        <motion.svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" whileHover={{ scale: 1.1 }}>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </motion.svg>
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm mt-1">{errors.password}</motion.p>
                  )}
                </div>
              </>
            ) : (
              // Patient ID + Aadhar Login Form
              <>
                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300" htmlFor="patientId">
                    Patient ID <span className="text-red-500">*</span>
                  </label>
                  <input 
                    id="patientId" 
                    name="patientId" 
                    type="text" 
                    required 
                    value={formData.patientId} 
                    onChange={handleInputChange}
                    placeholder="Enter 10-digit Patient ID"
                    maxLength="10"
                    className={`w-full px-4 py-3 rounded-lg bg-neutral-100 dark:bg-neutral-900 border transition-colors focus-ring ${
                      errors.patientId ? 'border-red-500 focus:border-red-500' : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-500'
                    }`}
                  />
                  {errors.patientId && (
                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm mt-1">{errors.patientId}</motion.p>
                  )}
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Your 10-digit Patient ID received during registration
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300" htmlFor="aadhar">
                    Aadhar Number <span className="text-red-500">*</span>
                  </label>
                  <input 
                    id="aadhar" 
                    name="aadhar" 
                    type="text" 
                    required 
                    value={formData.aadhar} 
                    onChange={handleInputChange}
                    placeholder="Enter 12-digit Aadhar number"
                    maxLength="12"
                    className={`w-full px-4 py-3 rounded-lg bg-neutral-100 dark:bg-neutral-900 border transition-colors focus-ring ${
                      errors.aadhar ? 'border-red-500 focus:border-red-500' : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-500'
                    }`}
                  />
                  {errors.aadhar && (
                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm mt-1">{errors.aadhar}</motion.p>
                  )}
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Enter the same Aadhar used during registration
                  </p>
                </div>
              </>
            )}

            <motion.div className="pt-4" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {submitError && (
                <div className="mb-3 text-sm text-red-600 dark:text-red-400">{submitError}</div>
              )}
              <button type="submit" disabled={isSubmitting} className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-semibold text-lg focus-ring transition-colors">
                {isSubmitting ? (
                  <>
                    <motion.div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <motion.svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" whileHover={{ scale: 1.1 }}>
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                      <polyline points="10,17 15,12 10,7"/>
                      <line x1="15" y1="12" x2="3" y2="12"/>
                    </motion.svg>
                    <span>{t('signInButton')}</span>
                  </>
                )}
              </button>
            </motion.div>

            <motion.div className="text-center pt-6 border-t border-neutral-200 dark:border-neutral-800" whileHover={{ scale: 1.02 }}>
              <p className="text-neutral-600 dark:text-neutral-400 mb-3">{t('newToThejasLink')}</p>
              <button type="button" onClick={handleGoToRegistration} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-600 text-brand-600 dark:text-brand-400 font-semibold hover:bg-brand-50 dark:hover:bg-brand-900/20 focus-ring transition-colors">
                <motion.svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" whileHover={{ scale: 1.1 }}>
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