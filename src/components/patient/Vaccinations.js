import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPatientVaccinations } from '../../services/patientFirebaseService';

export default function Vaccinations({ patientId }) {
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVaccine, setSelectedVaccine] = useState(null);

  useEffect(() => {
    const fetchVaccinations = async () => {
      if (!patientId) return;
      
      try {
        setLoading(true);
        const data = await getPatientVaccinations(patientId);
        setVaccinations(data);
      } catch (error) {
        console.error('Error fetching vaccinations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVaccinations();
  }, [patientId]);

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      partial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      due: 'bg-red-100 text-red-800 border-red-200',
      overdue: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || colors.completed;
  };

  const getStatusIcon = (status) => {
    const icons = {
      completed: '✅',
      partial: '⏳',
      due: '⚠️',
      overdue: '🚨'
    };
    return icons[status] || '💉';
  };

  const getVaccineIcon = (vaccine) => {
    const icons = {
      'COVID-19': '🦠',
      'Hepatitis B': '💉',
      'Influenza': '🤧',
      'Tetanus': '⚕️',
      'Pneumonia': '🫁',
      'HPV': '🛡️'
    };
    return icons[vaccine] || '💉';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateCompletionRate = () => {
    const completed = vaccinations.filter(v => v.status === 'completed').length;
    const total = vaccinations.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading vaccination records...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Vaccination Records
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your immunization history and vaccination status
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              {calculateCompletionRate()}% Complete
            </span>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {vaccinations.length} Vaccines
            </span>
          </div>
        </div>
      </div>

      {/* Vaccination Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {vaccinations.map((vaccination, index) => (
            <motion.div
              key={vaccination.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white dark:bg-gray-800 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                selectedVaccine?.id === vaccination.id
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
              }`}
              onClick={() => setSelectedVaccine(
                selectedVaccine?.id === vaccination.id ? null : vaccination
              )}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                      <span className="text-2xl">{getVaccineIcon(vaccination.vaccine)}</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {vaccination.vaccine}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(vaccination.status)}`}>
                          {getStatusIcon(vaccination.status)} {vaccination.status.charAt(0).toUpperCase() + vaccination.status.slice(1)}
                        </span>
                      </div>
                      
                      {vaccination.brand && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Brand: {vaccination.brand}
                        </p>
                      )}
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {vaccination.doses?.length || 0} dose(s) completed
                      </p>
                    </div>
                  </div>
                </div>

                {/* Latest dose info */}
                {vaccination.doses && vaccination.doses.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg mb-4">
                    <div className="text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">Latest dose:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {formatDate(vaccination.doses[vaccination.doses.length - 1].date)}
                      </span>
                    </div>
                    {vaccination.doses[vaccination.doses.length - 1].location && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Location: {vaccination.doses[vaccination.doses.length - 1].location}
                      </div>
                    )}
                  </div>
                )}

                {/* Next due date */}
                {vaccination.nextDue && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
                      <span>⏰</span>
                      <span className="text-sm font-medium">
                        Next dose due: {formatDate(vaccination.nextDue)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Expanded Details */}
                <AnimatePresence>
                  {selectedVaccine?.id === vaccination.id && vaccination.doses && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4"
                    >
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Dose History
                      </h4>
                      <div className="space-y-3">
                        {vaccination.doses.map((dose, idx) => (
                          <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
                              {dose.doseNumber || idx + 1}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-white">
                                Dose {dose.doseNumber || idx + 1}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {formatDate(dose.date)}
                                {dose.location && ` • ${dose.location}`}
                              </div>
                              {dose.batchNumber && (
                                <div className="text-xs text-gray-500 dark:text-gray-500">
                                  Batch: {dose.batchNumber}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {vaccinations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">💉</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No vaccination records found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No vaccination history has been recorded yet.
          </p>
        </div>
      )}

      {/* Vaccination Statistics */}
      {vaccinations.length > 0 && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { 
              label: 'Completed', 
              count: vaccinations.filter(v => v.status === 'completed').length, 
              color: 'bg-green-50 text-green-800 border-green-200' 
            },
            { 
              label: 'Partial', 
              count: vaccinations.filter(v => v.status === 'partial').length, 
              color: 'bg-yellow-50 text-yellow-800 border-yellow-200' 
            },
            { 
              label: 'Due', 
              count: vaccinations.filter(v => v.status === 'due' || v.status === 'overdue').length, 
              color: 'bg-red-50 text-red-800 border-red-200' 
            },
            { 
              label: 'Total Doses', 
              count: vaccinations.reduce((acc, v) => acc + (v.doses?.length || 0), 0), 
              color: 'bg-blue-50 text-blue-800 border-blue-200' 
            }
          ].map((stat, index) => (
            <div key={index} className={`p-4 rounded-xl border ${stat.color}`}>
              <div className="text-2xl font-bold">{stat.count}</div>
              <div className="text-sm opacity-75">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Vaccination Reminders */}
      {vaccinations.some(v => v.nextDue) && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 mb-2">
            <span className="text-xl">📅</span>
            <span className="font-bold">Upcoming Vaccinations</span>
          </div>
          <div className="space-y-2">
            {vaccinations
              .filter(v => v.nextDue)
              .map(v => (
                <div key={v.id} className="text-sm text-blue-700 dark:text-blue-400">
                  • {v.vaccine} - Due on {formatDate(v.nextDue)}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}