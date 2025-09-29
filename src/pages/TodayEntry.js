// src/pages/TodayEntry.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Save, ArrowLeft, Calendar, Stethoscope } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { findPatientByPatientId } from '../services/patientFirebaseService';
import { addTodayEntry } from '../services/todayEntryService';

export default function TodayEntry() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { state } = useApp();
  
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    symptoms: '',
    diagnosis: '',
    prescription: '',
    testsRecommended: '',
    notes: '',
    nextVisit: '',
    bloodPressure: '',
    temperature: '',
    heartRate: '',
    oxygenLevel: '',
    weight: '',
    height: ''
  });

  useEffect(() => {
    // Check if user is doctor
    if (state.user?.role !== 'doctor') {
      navigate('/doctor-signin');
      return;
    }

    const loadPatientData = async () => {
      try {
        setLoading(true);
        const patient = await findPatientByPatientId(patientId);
        setPatientData(patient);
        
        // Load previous entry if exists
        const today = new Date().toISOString().split('T')[0];
        setFormData(prev => ({
          ...prev,
          date: today
        }));
        
      } catch (err) {
        setError('Patient not found');
        console.error('Error loading patient:', err);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      loadPatientData();
    }
  }, [patientId, navigate, state.user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const entryData = {
        ...formData,
        patientId: patientData.id,
        patientName: patientData.personalDetails?.name || 'Unknown',
        doctorId: state.user.uid,
        doctorName: state.user.name,
        createdAt: new Date().toISOString(),
        status: 'completed'
      };

      await addTodayEntry(entryData);
      setSuccess('Today\'s entry saved successfully!');
      
      // Redirect to patient dashboard after 2 seconds
      setTimeout(() => {
        navigate(`/doctor/patient/${patientId}`);
      }, 2000);
      
    } catch (err) {
      setError('Failed to save entry: ' + err.message);
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <motion.div 
            className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-grow py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button 
              onClick={() => navigate(`/doctor/patient/${patientId}`)}
              className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 mb-4"
            >
              <ArrowLeft size={16} />
              Back to Patient Dashboard
            </button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <Calendar className="text-brand-600" size={32} />
                  Today's Medical Entry
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Patient: <span className="font-semibold">{patientData?.personalDetails?.name}</span> 
                  | ID: {patientId}
                  {patientData?.personalDetails?.age && ` | Age: ${patientData.personalDetails.age}`}
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-500">Doctor</p>
                <p className="font-semibold">{state.user?.name}</p>
              </div>
            </div>
          </motion.div>

          {/* Success/Error Messages */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
            >
              {error}
            </motion.div>
          )}
          
          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6"
            >
              {success}
            </motion.div>
          )}

          {/* Entry Form */}
          <motion.form 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            {/* Date and Vital Signs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Blood Pressure
                </label>
                <input
                  type="text"
                  name="bloodPressure"
                  value={formData.bloodPressure}
                  onChange={handleInputChange}
                  placeholder="120/80"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleInputChange}
                  placeholder="98.6"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Heart Rate (bpm)
                </label>
                <input
                  type="number"
                  name="heartRate"
                  value={formData.heartRate}
                  onChange={handleInputChange}
                  placeholder="72"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Oxygen Level (%)
                </label>
                <input
                  type="number"
                  name="oxygenLevel"
                  value={formData.oxygenLevel}
                  onChange={handleInputChange}
                  placeholder="98"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="65.5"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  placeholder="170"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Symptoms */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Symptoms & Complaints *
              </label>
              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleInputChange}
                rows="3"
                required
                placeholder="Describe the patient's symptoms, complaints, and duration..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white resize-vertical"
              />
            </div>

            {/* Diagnosis */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Diagnosis *
              </label>
              <textarea
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleInputChange}
                rows="3"
                required
                placeholder="Enter diagnosis based on examination..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white resize-vertical"
              />
            </div>

            {/* Prescription */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prescription & Treatment
              </label>
              <textarea
                name="prescription"
                value={formData.prescription}
                onChange={handleInputChange}
                rows="3"
                placeholder="Medications, dosage, frequency, duration..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white resize-vertical"
              />
            </div>

            {/* Tests Recommended */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tests Recommended
              </label>
              <textarea
                name="testsRecommended"
                value={formData.testsRecommended}
                onChange={handleInputChange}
                rows="2"
                placeholder="Blood tests, X-ray, MRI, etc..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white resize-vertical"
              />
            </div>

            {/* Additional Notes and Next Visit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Clinical Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Additional observations, advice, follow-up instructions..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white resize-vertical"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Next Visit
                </label>
                <input
                  type="date"
                  name="nextVisit"
                  value={formData.nextVisit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white mb-4"
                />
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <Stethoscope size={16} />
                    Quick Notes
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    This entry will be saved to the patient's permanent medical record and will be visible to the patient and other authorized doctors.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate(`/doctor/patient/${patientId}`)}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-colors disabled:bg-brand-400 disabled:cursor-not-allowed"
              >
                <Save size={20} />
                {saving ? 'Saving...' : 'Save Today\'s Entry'}
              </button>
            </div>
          </motion.form>
        </div>
      </main>

      <Footer />
    </div>
  );
}