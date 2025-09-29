import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { QrReader } from 'react-qr-reader';
import { User, LogOut, Search, QrCode, X } from 'lucide-react';

// Import your existing Header and Footer
import Header from '../components/Header'; // Adjust the path if necessary
import Footer from '../components/Footer'; // Adjust the path if necessary
import { logout } from '../services/authService';
// Import the NEW search function
import { findPatientByPatientId } from '../services/patientFirebaseService';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  
  const [patientId, setPatientId] = useState('');
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const doctorName = state.user?.name || 'Doctor';

  // Redirect if not logged in as a doctor
  useEffect(() => {
    if (state.user?.role !== 'doctor') {
      navigate('/doctor-signin');
    }
  }, [state.user, navigate]);
  
 // DoctorDashboard.js में handleSearch function ko update karein
const handleSearch = async (id) => {
  const trimmedId = id.trim();
  if (!trimmedId) {
    setError('Please enter a valid Patient ID.');
    return;
  }
  
  // Patient ID format validate karein
  if (!/^\d{10}$/.test(trimmedId)) {
    setError('Please enter a valid 10-digit Patient ID.');
    return;
  }
  
  setError('');
  setIsSearching(true);
  
  try {
    // Patient exists check karein
    await findPatientByPatientId(trimmedId);
    
    // Navigate to patient dashboard
    navigate(`/doctor/patient/${trimmedId}`);
  } catch (err) {
    setError('Patient not found. Please check the ID and try again.');
    console.error('Search error:', err);
  } finally {
    setIsSearching(false);
  }
};

  const handleScan = (result, error) => {
    if (!!result) {
      try {
        const data = JSON.parse(result.text);
        if (data.type === 'patient' && data.patientId) {
          setShowScanner(false);
          handleSearch(data.patientId);
        } else {
          setError('Invalid QR code. Please scan a ThejasLink patient QR code.');
        }
      } catch (e) {
        setError('QR code could not be read. Please try again.');
      }
    }
    if (!!error) {
      // console.info(error); // Optional: log scan errors
    }
  };

  const handleSignOut = async () => {
    await logout();
    actions.setUser(null);
    localStorage.removeItem('tl_user');
    navigate('/');
  };
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-menu-container')) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <motion.div 
          className="w-full max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100">
                Welcome, <span className="text-brand-600 dark:text-brand-400">{doctorName}</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Find a patient to view their health records.
              </p>
            </div>

            <div className="profile-menu-container relative mt-4 sm:mt-0">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-300 grid place-items-center">
                  <User size={20} />
                </div>
                <div className="hidden sm:block text-left pr-2">
                  <div className="font-semibold text-sm">{doctorName}</div>
                  <div className="text-xs text-gray-500">Doctor</div>
                </div>
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                  >
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-semibold text-sm truncate">{doctorName}</p>
                      <p className="text-xs text-gray-500 truncate">{state.user?.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-center mb-6">Find Patient Record</h2>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(patientId)}
                  placeholder="Enter 10-digit Patient ID..."
                  className="w-full pl-12 pr-4 py-4 rounded-lg bg-gray-100 dark:bg-gray-900 border-2 border-transparent focus:border-brand-500 focus:ring-0 transition-colors"
                />
              </div>
              <button 
                onClick={() => handleSearch(patientId)}
                disabled={isSearching}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-colors disabled:bg-brand-400"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
            
            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
              <span className="flex-shrink mx-4 text-sm text-gray-500">OR</span>
              <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            </div>

            <button 
              onClick={() => setShowScanner(true)}
              className="w-full flex items-center justify-center gap-3 py-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg transition-colors"
            >
              <QrCode size={20} />
              Scan Patient QR Code
            </button>
            
            {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
          </div>
        </motion.div>
      </main>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md relative">
              <h3 className="text-lg font-semibold text-center mb-4">Scan QR Code</h3>
              <button onClick={() => setShowScanner(false)} className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
                <X size={20} />
              </button>
              <div className="rounded-lg overflow-hidden border-4 border-brand-500">
                <QrReader
                  onResult={handleScan}
                  constraints={{ facingMode: 'environment' }}
                  videoContainerStyle={{ width: '100%', paddingTop: '100%' }}
                  videoStyle={{ top: 'auto', left: 'auto', transform: 'none', position: 'absolute' }}
                />
              </div>
              <p className="text-center text-sm text-gray-500 mt-4">Point the camera at the patient's QR code.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
