import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getPatientPrescriptions, 
  addPrescription,
  updatePrescription 
} from '../../services/patientFirebaseService';

export default function Prescriptions({ patientId }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!patientId) {
        setError('Patient ID is required');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        const data = await getPatientPrescriptions(patientId);
        setPrescriptions(data);
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
        setError('Failed to load prescriptions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, [patientId]);

  // Determine prescription status based on date and medication status
  const getPrescriptionStatus = (prescription) => {
    const today = new Date();
    const prescDate = new Date(prescription.date);
    const daysDiff = Math.floor((today - prescDate) / (1000 * 60 * 60 * 24));

    if (prescription.status === 'completed') return 'completed';
    if (prescription.status === 'cancelled') return 'cancelled';
    if (daysDiff <= 30) return 'current';
    if (daysDiff <= 90) return 'recent';
    return 'old';
  };

  // Filter and search prescriptions
  const filteredPrescriptions = prescriptions.filter(prescription => {
    // Status filter
    if (filterStatus !== 'all' && getPrescriptionStatus(prescription) !== filterStatus) {
      return false;
    }
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        prescription.doctor?.toLowerCase().includes(term) ||
        prescription.clinic?.toLowerCase().includes(term) ||
        prescription.diagnosis?.toLowerCase().includes(term) ||
        prescription.medications?.some(med => 
          med.name?.toLowerCase().includes(term)
        )
      );
    }
    
    return true;
  });

  const getStatusColor = (status) => {
    const colors = {
      current: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
      recent: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
      old: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
      completed: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
      cancelled: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
    };
    return colors[status] || colors.current;
  };

  const getStatusIcon = (status) => {
    const icons = {
      current: '💊',
      recent: '⏳',
      old: '📋',
      completed: '✅',
      cancelled: '❌'
    };
    return icons[status] || '💊';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDuration = (startDate, duration) => {
    if (!startDate || !duration) return 'Not specified';
    const start = new Date(startDate);
    const end = new Date(start.getTime() + (parseInt(duration) * 24 * 60 * 60 * 1000));
    return formatDate(end);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <motion.div
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <span className="text-gray-600 dark:text-gray-400">Loading your prescriptions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-6xl mb-4">❌</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Unable to Load Prescriptions
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Prescriptions & Medications
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and track your medical prescriptions and medication history
          </p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 lg:mt-0">
          <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {filteredPrescriptions.length} of {prescriptions.length} Prescriptions
            </span>
          </div>
          
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-gray-700 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              🏠
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-gray-700 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              📋
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by doctor, clinic, diagnosis, or medication..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="all">All Status</option>
            <option value="current">Current</option>
            <option value="recent">Recent</option>
            <option value="old">Older</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { 
            label: 'Current', 
            count: prescriptions.filter(p => getPrescriptionStatus(p) === 'current').length, 
            color: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
            icon: '💊'
          },
          { 
            label: 'Recent', 
            count: prescriptions.filter(p => getPrescriptionStatus(p) === 'recent').length, 
            color: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
            icon: '⏳'
          },
          { 
            label: 'Completed', 
            count: prescriptions.filter(p => getPrescriptionStatus(p) === 'completed').length, 
            color: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
            icon: '✅'
          },
          { 
            label: 'Total', 
            count: prescriptions.length, 
            color: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
            icon: '📊'
          }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl border ${stat.color}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stat.count}</div>
                <div className="text-sm opacity-75">{stat.label}</div>
              </div>
              <div className="text-2xl">{stat.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Prescriptions List/Grid */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
        <AnimatePresence>
          {filteredPrescriptions.map((prescription, index) => {
            const status = getPrescriptionStatus(prescription);
            return (
              <motion.div
                key={prescription.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white dark:bg-gray-800 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                  selectedPrescription?.id === prescription.id
                    ? 'border-blue-500 shadow-lg scale-[1.02]'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                }`}
                onClick={() => setSelectedPrescription(
                  selectedPrescription?.id === prescription.id ? null : prescription
                )}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                        <span className="text-2xl">💊</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                            {prescription.doctor || 'Dr. Unknown'}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(status)}`}>
                            {getStatusIcon(status)} {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                            {prescription.clinic || 'Medical Center'}
                          </p>
                          <p>Prescribed on: {formatDate(prescription.date)}</p>
                          {prescription.diagnosis && (
                            <p className="text-blue-600 dark:text-blue-400 truncate">
                              Diagnosis: {prescription.diagnosis}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 whitespace-nowrap">
                        {prescription.medications?.length || 0} Meds
                      </div>
                      {prescription.nextVisit && (
                        <div className="text-xs text-green-600 dark:text-green-400 whitespace-nowrap">
                          Next: {formatDate(prescription.nextVisit)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick medication preview */}
                  {prescription.medications?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {prescription.medications.slice(0, 3).map((med, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                        >
                          {med.name} {med.dosage}
                        </span>
                      ))}
                      {prescription.medications.length > 3 && (
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                          +{prescription.medications.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {selectedPrescription?.id === prescription.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4"
                      >
                        <div className="space-y-4">
                          {/* Medications Details */}
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                              <span>💊</span>
                              Prescribed Medications
                            </h4>
                            <div className="space-y-3">
                              {prescription.medications?.map((medication, idx) => (
                                <div key={idx} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <h5 className="font-medium text-gray-900 dark:text-white">
                                        {medication.name}
                                      </h5>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {medication.dosage} • {medication.frequency}
                                        {medication.duration && ` • ${medication.duration} days`}
                                      </p>
                                    </div>
                                    {medication.duration && prescription.date && (
                                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs whitespace-nowrap ml-2">
                                        Until: {calculateDuration(prescription.date, medication.duration)}
                                      </span>
                                    )}
                                  </div>
                                  {medication.instructions && (
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                                      <strong>Instructions:</strong> {medication.instructions}
                                    </p>
                                  )}
                                  {medication.notes && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      <strong>Notes:</strong> {medication.notes}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Diagnosis and Notes */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {prescription.diagnosis && (
                              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-2">
                                  <span>📋</span>
                                  Diagnosis
                                </h5>
                                <p className="text-sm text-blue-700 dark:text-blue-400">{prescription.diagnosis}</p>
                              </div>
                            )}

                            {prescription.nextVisit && (
                              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <h5 className="font-medium text-green-800 dark:text-green-300 mb-1 flex items-center gap-2">
                                  <span>📅</span>
                                  Next Visit
                                </h5>
                                <p className="text-sm text-green-700 dark:text-green-400">
                                  Scheduled for {formatDate(prescription.nextVisit)}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Additional Notes */}
                          {prescription.notes && (
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                              <h5 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1 flex items-center gap-2">
                                <span>📝</span>
                                Additional Notes
                              </h5>
                              <p className="text-sm text-yellow-700 dark:text-yellow-400">{prescription.notes}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredPrescriptions.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="text-gray-400 text-6xl mb-4">💊</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {searchTerm ? 'No matching prescriptions found' : 'No prescriptions recorded'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm 
              ? `No prescriptions found for "${searchTerm}". Try adjusting your search.`
              : prescriptions.length === 0 
                ? "You don't have any prescriptions yet. They will appear here once prescribed."
                : `No ${filterStatus} prescriptions found.`}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium"
            >
              Clear Search
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}