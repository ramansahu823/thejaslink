import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../utils/translations';
import { motion } from 'framer-motion';
import { registerPatient, checkAadhaarAlreadyRegistered } from '../services/authService';


export default function PatientRegistration() {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const t = useTranslation(state.lang);

  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    aadharNumber: '',
    phoneNumber: '',
    gender: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Strong password validation function
  const validateStrongPassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    if (password.length < minLength) {
      return 'Password must be at least 8 characters long';
    }
    if (!hasUpperCase) {
      return 'Password must include at least 1 uppercase letter';
    }
    if (!hasLowerCase) {
      return 'Password must include at least 1 lowercase letter';
    }
    if (!hasNumbers) {
      return 'Password must include at least 1 number';
    }
    if (!hasSpecialChar) {
      return 'Password must include at least 1 special character (!@#$%^&*)';
    }
    return null; // Password is valid
  };

  // Aadhar and DOB verification function
  const verifyAadharAndDOB = async (aadharNumber, dateOfBirth) => {
    try {
      // Basic validation
      if (!aadharNumber || !dateOfBirth) {
        throw new Error("Aadhar number and date of birth are required for verification");
      }

      // Validate Aadhar format (12 digits)
      const cleanAadhar = aadharNumber.replace(/\s/g, '');
      const aadharRegex = /^\d{12}$/;
      if (!aadharRegex.test(cleanAadhar)) {
        throw new Error("Invalid Aadhar number format. Must be 12 digits");
      }

      // Validate DOB format and age
      const dobDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dobDate.getFullYear();
      
      if (dobDate > today) {
        throw new Error("Date of birth cannot be in the future");
      }
      
      if (age < 0 || age > 150) {
        throw new Error("Please enter a valid date of birth");
      }

      // Check if Aadhar is already registered
      const aadharCheck = await checkAadhaarAlreadyRegistered(cleanAadhar);
      if (aadharCheck.alreadyRegistered) {
        throw new Error(aadharCheck.message);
      }

      // Simulate Aadhar verification process
      console.log("Verifying Aadhar:", cleanAadhar, "with DOB:", dateOfBirth);
      
      // Add a small delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        verified: true,
        message: "Aadhar and DOB verified successfully"
      };
      
    } catch (error) {
      console.error("Aadhar verification error:", error);
      throw error;
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';

    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';

    if (!formData.aadharNumber.trim()) {
      newErrors.aadharNumber = 'Aadhar number is required';
    } else if (!/^\d{12}$/.test(formData.aadharNumber.trim())) {
      newErrors.aadharNumber = 'Aadhar must be a 12-digit number';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[+]?\d[\d\s\-()]{9,14}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = 'Enter a valid phone number';
    }

    if (!formData.gender) newErrors.gender = 'Please select a gender';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    // Strong password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordError = validateStrongPassword(formData.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitError('');
    setSubmitSuccess('');
    setIsSubmitting(true);

    try {
      // Create patient profile object
      const profile = {
        name: formData.fullName.trim(),
        dateOfBirth: formData.dateOfBirth,
        aadhar: formData.aadharNumber.trim(),
        phone: formData.phoneNumber.trim(),
        gender: formData.gender,
        role: 'patient'
      };
      
      // First verify Aadhar and DOB
      console.log("Starting Aadhar verification...");
      await verifyAadharAndDOB(profile.aadhar, profile.dateOfBirth);
      console.log("Aadhar verification successful");
      
      // Register patient and get patient ID
      console.log("Starting patient registration...");
      const registeredPatient = await registerPatient(
        formData.email.trim(), 
        formData.password, 
        profile
      );
      
      console.log("Patient registration successful:", registeredPatient);
      
      // Set user in context
      actions.setUser({ 
        ...registeredPatient, 
        email: formData.email.trim(),
        role: 'patient'
      });
      
      // Show success message
      setSubmitSuccess('Account created successfully! Redirecting...');
      
      // Navigate to success page with patient ID
      setTimeout(() => {
        navigate('/success', { 
          state: { 
            userType: 'patient',
            patientId: registeredPatient.patientId,
            message: `Congratulations! Your patient ID is ${registeredPatient.patientId}. Please save this ID for future logins.`
          } 
        });
      }, 1500);
      
    } catch (err) {
      console.error("Registration error:", err);
      setSubmitError(err?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToSignIn = () => {
    navigate('/patient-signin');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut', staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <section className="min-h-[calc(100vh-4rem)] grid place-items-center py-10">
      <div className="w-full max-w-2xl mx-auto px-4">
        <motion.div className="rounded-2xl soft-shadow border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/70 backdrop-blur p-6 sm:p-8" variants={containerVariants} initial="hidden" animate="visible">
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
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-2 text-brand-600 dark:text-brand-400">{t('patientRegistration')}</h2>
            <p className="text-neutral-600 dark:text-neutral-300 text-lg">{t('patientRegistrationSubtitle')}</p>
          </motion.div>

          <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300" htmlFor="fullName">{t('fullName')} <span className="text-red-500">*</span></label>
                <input id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleInputChange} className={`w-full px-4 py-3 rounded-lg bg-neutral-100 dark:bg-neutral-900 border transition-colors focus-ring ${errors.fullName ? 'border-red-500 focus:border-red-500' : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-500'}`} />
                {errors.fullName && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm mt-1">{errors.fullName}</motion.p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300" htmlFor="dateOfBirth">{t('dateOfBirth')} <span className="text-red-500">*</span></label>
                <input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleInputChange} className={`w-full px-4 py-3 rounded-lg bg-neutral-100 dark:bg-neutral-900 border transition-colors focus-ring ${errors.dateOfBirth ? 'border-red-500 focus:border-red-500' : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-500'}`} />
                {errors.dateOfBirth && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</motion.p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300" htmlFor="aadharNumber">{t('aadharNumber')} <span className="text-red-500">*</span></label>
                <input id="aadharNumber" name="aadharNumber" type="text" value={formData.aadharNumber} onChange={handleInputChange} placeholder="12-digit Aadhar" maxLength="12" className={`w-full px-4 py-3 rounded-lg bg-neutral-100 dark:bg-neutral-900 border transition-colors focus-ring ${errors.aadharNumber ? 'border-red-500 focus:border-red-500' : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-500'}`} />
                {errors.aadharNumber && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm mt-1">{errors.aadharNumber}</motion.p>}
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Your Aadhaar details will be verified and used to generate your Patient ID
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300" htmlFor="phoneNumber">{t('phoneNumber')} <span className="text-red-500">*</span></label>
                <input 
                  id="phoneNumber" 
                  name="phoneNumber" 
                  type="tel" 
                  value={formData.phoneNumber} 
                  onChange={handleInputChange} 
                  placeholder="Enter your phone number (e.g., 9876543210)"
                  className={`w-full px-4 py-3 rounded-lg bg-neutral-100 dark:bg-neutral-900 border transition-colors focus-ring ${errors.phoneNumber ? 'border-red-500 focus:border-red-500' : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-500'}`} 
                />
                {errors.phoneNumber && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm mt-1">{errors.phoneNumber}</motion.p>}
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Enter your 10-digit mobile number
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300" htmlFor="gender">Gender <span className="text-red-500">*</span></label>
                <select id="gender" name="gender" value={formData.gender} onChange={handleInputChange} className={`w-full px-4 py-3 rounded-lg bg-neutral-100 dark:bg-neutral-900 border transition-colors focus-ring ${errors.gender ? 'border-red-500 focus:border-red-500' : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-500'}`}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm mt-1">{errors.gender}</motion.p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300" htmlFor="email">{t('email')} <span className="text-red-500">*</span></label>
                <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className={`w-full px-4 py-3 rounded-lg bg-neutral-100 dark:bg-neutral-900 border transition-colors focus-ring ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-500'}`} />
                {errors.email && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm mt-1">{errors.email}</motion.p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300" htmlFor="password">{t('password')} <span className="text-red-500">*</span></label>
              <div className="relative">
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleInputChange} className={`w-full px-4 py-3 pr-12 rounded-lg bg-neutral-100 dark:bg-neutral-900 border transition-colors focus-ring ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-500'}`} />
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
              {errors.password && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm mt-1">{errors.password}</motion.p>}
              
              {formData.password && (
                <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
                  <div className="mb-1">Password requirements:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    <div className={`flex items-center gap-1 ${formData.password.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-neutral-500'}`}>
                      <span>{formData.password.length >= 8 ? '✓' : '○'}</span>
                      <span>8+ characters</span>
                    </div>
                    <div className={`flex items-center gap-1 ${/[A-Z]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-neutral-500'}`}>
                      <span>{/[A-Z]/.test(formData.password) ? '✓' : '○'}</span>
                      <span>Uppercase letter</span>
                    </div>
                    <div className={`flex items-center gap-1 ${/[a-z]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-neutral-500'}`}>
                      <span>{/[a-z]/.test(formData.password) ? '✓' : '○'}</span>
                      <span>Lowercase letter</span>
                    </div>
                    <div className={`flex items-center gap-1 ${/\d/.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-neutral-500'}`}>
                      <span>{/\d/.test(formData.password) ? '✓' : '○'}</span>
                      <span>Number</span>
                    </div>
                    <div className={`flex items-center gap-1 ${/[!@#$%^&*]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-neutral-500'}`}>
                      <span>{/[!@#$%^&*]/.test(formData.password) ? '✓' : '○'}</span>
                      <span>Special character</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300" htmlFor="confirmPassword">{t('confirmPassword')} <span className="text-red-500">*</span></label>
              <div className="relative">
                <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleInputChange} className={`w-full px-4 py-3 pr-12 rounded-lg bg-neutral-100 dark:bg-neutral-900 border transition-colors focus-ring ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-500'}`} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 focus-ring rounded">
                  {showConfirmPassword ? (
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
              {errors.confirmPassword && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm mt-1">{errors.confirmPassword}</motion.p>}
            </div>

            <motion.div className="pt-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {submitError && (
                <div className="mb-3 p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  {submitError}
                </div>
              )}
              {submitSuccess && (
                <div className="mb-3 p-3 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  {submitSuccess}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-semibold text-lg focus-ring transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <motion.div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <motion.svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" whileHover={{ scale: 1.1 }}>
                      <path d="M12 5v14M5 12h14"/>
                    </motion.svg>
                    <span>{t('create')}</span>
                  </>
                )}
              </button>
            </motion.div>

            <motion.div className="text-center pt-6 border-t border-neutral-200 dark:border-neutral-800" whileHover={{ scale: 1.02 }}>
              <p className="text-neutral-600 dark:text-neutral-400 mb-3">{t('alreadyHaveAccount')}</p>
              <button type="button" onClick={handleBackToSignIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-600 text-brand-600 dark:text-brand-400 font-semibold hover:bg-brand-50 dark:hover:bg-brand-900/20 focus-ring transition-colors">
                <motion.svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" whileHover={{ scale: 1.1 }}>
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10,17 15,12 10,7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
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