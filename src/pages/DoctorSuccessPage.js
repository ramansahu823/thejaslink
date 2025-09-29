import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function DoctorSuccessPage() {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-10">
      <div className="max-w-md mx-auto px-4 w-full">
        <motion.div
          className="text-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <motion.div
            className="text-6xl mb-6"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            ✅
          </motion.div>
          
          <h1 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
            Registration Successful!
          </h1>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
              Your Doctor Account is Ready
            </h2>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Your credentials have been verified and your account has been created.
            </p>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            You can now log in using the email and password you provided during registration.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/doctor-signin')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Login Now
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Go to Home
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}