import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../utils/translations';
import { motion } from 'framer-motion';
import { registerDoctor } from '../services/authService';
import { isAadharValid, isLicenseValid, verifyDoctorFull } from '../services/verificationService';

export default function DoctorRegistration() {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const t = useTranslation(state.lang);
  
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    aadharNumber: '',
    medicalLicenseId: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [validations, setValidations] = useState({
    aadhar: null,
    license: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

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

  const handleAadharBlur = async () => {
    if (formData.aadharNumber.length === 12) {
      const isValid = await isAadharValid(formData.aadharNumber);
      setValidations(prev => ({
        ...prev,
        aadhar: isValid
      }));
    }
  };

  const handleLicenseBlur = async () => {
    if (formData.medicalLicenseId) {
      const isValid = await isLicenseValid(formData.medicalLicenseId);
      setValidations(prev => ({
        ...prev,
        license: isValid
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    // Date of Birth validation
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      if (dob >= today) {
        newErrors.dateOfBirth = 'Date of birth must be in the past';
      }
    }

    // Aadhar Number validation
    if (!formData.aadharNumber.trim()) {
      newErrors.aadharNumber = 'Aadhar number is required';
    } else if (!/^\d{12}$/.test(formData.aadharNumber.replace(/\s/g, ''))) {
      newErrors.aadharNumber = 'Aadhar number must be 12 digits';
    }

    // Medical License ID validation
    if (!formData.medicalLicenseId.trim()) {
      newErrors.medicalLicenseId = 'Medical license ID is required';
    }

    // Phone Number validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }else if (!/^[+]?[0-9\s\-()]{10,15}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // DoctorRegistration.js

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitError('');
    setSubmitSuccess('');
    setIsSubmitting(true);

    try {
      // Verify doctor credentials
      const isVerified = await verifyDoctorFull({
        aadhar: formData.aadharNumber.trim(),
        licenseId: formData.medicalLicenseId.trim(),
        dob: formData.dateOfBirth
      });

      if (!isVerified) {
        throw new Error('Aadhaar, License, Name, and DOB do not match our records');
      }

      const profile = {
        name: formData.fullName.trim(),
        dateOfBirth: formData.dateOfBirth,
        aadhar: formData.aadharNumber.trim(),
        medicalLicenseId: formData.medicalLicenseId.trim(),
        phone: formData.phoneNumber.trim(),
        role: 'doctor'
      };
      await registerDoctor(formData.email.trim(), formData.password, profile);
      actions.setUser({ ...profile, email: formData.email.trim() });
      setSubmitSuccess('Account created successfully');
      
      // Change this line to navigate to the new success page
      navigate('/doctor-success'); // Changed from '/success'

    } catch (err) {
      // --- START: यह कोड जोड़ें ---
      setSubmitError(err?.message || 'Failed to create account. Please try again.');
      // --- END: यह कोड जोड़ें ---
    } finally {
        // --- START: यह कोड जोड़ें ---
        setIsSubmitting(false);
        // --- END: यह कोड जोड़ें ---
    }
  };
  const handleBackToSignIn = () => {
    navigate('/doctor-signin');
  };

  const handleBackToHome = () => {
    navigate('/');
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
      <div className="w-full max-w-4xl mx-auto px-4">
        <motion.div 
          className="rounded-2xl soft-shadow border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/70 backdrop-blur p-6 sm:p-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
            <button 
              onClick={handleBackToSignIn}
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
              {t('doctorRegistration')}
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 text-lg">
              {t('doctorRegistrationSubtitle')}
            </p>
          </motion.div>

          {/* Registration Form */}
          <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-6">
            {/* First Row - Full Name and Date of Birth */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300" htmlFor="fullName">
                  {t('fullName')} <span className="text-red-500">*</span>
                </label>
                <input 
                  id="fullName" 
                  name="fullName" 
                  type="text" 
                  required 
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Dr. John Smith" 
                  className={`w-full px-4 py-3 rounded-lg bg-neutral-100 dark:bg-neutral-900 border transition-colors focus-ring ${
                    errors.fullName 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-500'
                  }`}
                />
                {errors.fullName && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.fullName}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300" htmlFor="dateOfBirth">
                  {t('dateOfBirth')} <span className="text-red-500">*</span>
                </label>
                <input 
                  id="dateOfBirth" 
                  name="dateOfBirth" 
                  type="date" 
                  required 
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg bg-neutral-100 dark:bg-neutral-900 border transition-colors focus-ring ${
                    errors.dateOfBirth 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-500'
                  }`}
                />
                {errors.dateOfBirth && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.dateOfBirth}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Second Row - Aadhar Number and Medical License ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300" htmlFor="aadharNumber">
                  {t('aadharNumber')} <span className="text-red-500">*</span>
                </label>
                <input 
                  id="aadharNumber" 
                  name="aadharNumber" 
                  type="text" 
                  required 
                  value={formData.aadharNumber}
                  onChange={handleInputChange}
                  placeholder="1234 5678 9012" 
                  onBlur={handleAadharBlur}
                  className={`w-full px-4 py-3 rounded-lg bg-neutral-100 dark:bg-neutral-900 border transition-colors focus-ring ${
                    errors.aadharNumber 
                      ? 'border-red-500 focus:border-red-500' 
                      : validations.aadhar === false
                      ? 'border-red-500'
                      : validations.aadhar === true
                      ? 'border-green-500'
                      : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-500'
                  }`}
                />
                {errors.aadharNumber && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.aadharNumber}
                  </motion.p>
                )}
                {validations.aadhar !== null && !errors.aadharNumber && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={validations.aadhar ? "text-green-500 text-sm mt-1" : "text-red-500 text-sm mt-1"}
                  >
                    {validations.aadhar ? "✅ Aadhaar is valid" : "❌ Aadhaar not found"}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300" htmlFor="medicalLicenseId">
                  {t('medicalLicenseId')} <span className="text-red-500">*</span>
                </label>
                <input 
                  id="medicalLicenseId" 
                  name="medicalLicenseId" 
                  type="text" 
                  required 
                  value={formData.medicalLicenseId}
                  onChange={handleInputChange}
                  placeholder="MH-12345-2024" 
                  onBlur={handleLicenseBlur}
                  className={`w-full px-4 py-3 rounded-lg bg-neutral-100 dark:bg-neutral-900 border transition-colors focus-ring ${
                    errors.medicalLicenseId 
                      ? 'border-red-500 focus:border-red-500' 
                      : validations.license === false
                      ? 'border-red-500'
                      : validations.license === true
                      ? 'border-green-500'
                      : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-500'
                  }`}
                />
                {errors.medicalLicenseId && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.medicalLicenseId}
                  </motion.div>
                )}
                {validations.license !== null && !errors.medicalLicenseId && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={validations.license ? "text-green-500 text-sm mt-1" : "text-red-500 text-sm mt-1"}
                  >
                    {validations.license ? "✅ License is valid" : "❌ License not found"}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Third Row - Phone Number and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300" htmlFor="phoneNumber">
                  {t('phoneNumber')} <span className="text-red-500">*</span>
                </label>
                <input 
                  id="phoneNumber" 
                  name="phoneNumber" 
                  type="tel" 
                  required 
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210" 
                  className={`w-full px-4 py-3 rounded-lg bg-neutral-100 dark:bg-neutral-900 border transition-colors focus-ring ${
                    errors.phoneNumber 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-500'
                  }`}
                />
                {errors.phoneNumber && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.phoneNumber}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300" htmlFor="email">
                  {t('email')} <span className="text-red-500">*</span>
                </label>
                <input 
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="doctor@hospital.com" 
                  className={`w-full px-4 py-3 rounded-lg bg-neutral-100 dark:bg-neutral-900 border transition-colors focus-ring ${
                    errors.email 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-500'
                  }`}
                />
                {errors.email && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Fourth Row - Password and Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300" htmlFor="password">
                  {t('password')} <span className="text-red-500">*</span>
                </label>
                <input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password" 
                  className={`w-full px-4 py-3 rounded-lg bg-neutral-100 dark:bg-neutral-900 border transition-colors focus-ring ${
                    errors.password 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-500'
                  }`}
                />
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

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300" htmlFor="confirmPassword">
                  {t('confirmPassword')} <span className="text-red-500">*</span>
                </label>
                <input 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  type="password" 
                  required 
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password" 
                  className={`w-full px-4 py-3 rounded-lg bg-neutral-100 dark:bg-neutral-900 border transition-colors focus-ring ${
                    errors.confirmPassword 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-500'
                  }`}
                />
                {errors.confirmPassword && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.confirmPassword}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <motion.div 
              className="pt-6"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
            {submitError && (
              <div className="mb-3 text-sm text-red-600 dark:text-red-400">{submitError}</div>
            )}
            {submitSuccess && (
              <div className="mb-3 text-sm text-green-600 dark:text-green-400">{submitSuccess}</div>
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
                    <span>Creating Account...</span>
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
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="8.5" cy="7" r="4"/>
                      <line x1="20" y1="8" x2="20" y2="14"/>
                      <line x1="23" y1="11" x2="17" y2="11"/>
                    </motion.svg>
                    <span>{t('create')}</span>
                  </>
                )}
              </button>
            </motion.div>

            {/* Sign In Link */}
            <motion.div 
              className="text-center pt-4 border-t border-neutral-200 dark:border-neutral-800"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-neutral-600 dark:text-neutral-400 mb-3">
                {t('alreadyHaveAccount')}
              </p>
              <button 
                type="button"
                onClick={handleBackToSignIn}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-600 text-brand-600 dark:text-brand-400 font-semibold hover:bg-brand-50 dark:hover:bg-brand-900/20 focus-ring transition-colors"
              >
                <motion.svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="w-4 h-4" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  whileHover={{ x: 2 }}
                >
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </motion.svg>
                <span>{t('signIn')}</span>
              </button>
            </motion.div>
          </motion.form>
        </motion.div>
      </div>
    </section>
  );
}
