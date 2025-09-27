// In src/pages/SuccessPage.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function SuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { patientId, } = location.state || {};

  return (
    <section className="min-h-screen flex items-center justify-center py-10">
      <div className="max-w-md mx-auto px-4">
        <motion.div 
          className="text-center bg-white rounded-2xl shadow-lg p-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="text-6xl mb-6"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎉
          </motion.div>
          
          <h1 className="text-2xl font-bold text-green-600 mb-4">
            Registration Successfully Completed!
          </h1>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">
              Your Patient ID
            </h2>
            <div className="text-3xl font-mono font-bold text-blue-600 mb-2">
              {patientId}
            </div>
            <p className="text-sm text-blue-600">
              Please save this ID for future logins
            </p>
          </div>
          
          <p className="text-gray-600 mb-6">
            Your account has been created successfully. Use your Patient ID and Aadhar number to login.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/patient-signin')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Login Now
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Go to Home
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}