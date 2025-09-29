import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDoctorNotes } from '../../services/patientFirebaseService';

export default function DoctorNotes({ patientId }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    const fetchDoctorNotes = async () => {
      if (!patientId) return;
      
      try {
        setLoading(true);
        const data = await getDoctorNotes(patientId);
        setNotes(data);
      } catch (error) {
        console.error('Error fetching doctor notes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorNotes();
  }, [patientId]);

  // Sort notes
  const sortedNotes = [...notes].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date) - new Date(a.date);
      case 'doctor':
        return a.doctor.localeCompare(b.doctor);
      case 'visitType':
        return a.visitType?.localeCompare(b.visitType || '') || 0;
      default:
        return 0;
    }
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getVisitTypeColor = (visitType) => {
    const colors = {
      'Consultation': 'bg-blue-100 text-blue-800 border-blue-200',
      'Follow-up': 'bg-green-100 text-green-800 border-green-200',
      'Emergency': 'bg-red-100 text-red-800 border-red-200',
      'Check-up': 'bg-purple-100 text-purple-800 border-purple-200',
      'Treatment': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[visitType] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getVisitTypeIcon = (visitType) => {
    const icons = {
      'Consultation': '👨‍⚕️',
      'Follow-up': '🔄',
      'Emergency': '🚨',
      'Check-up': '🔍',
      'Treatment': '💊'
    };
    return icons[visitType] || '📝';
  };

  const getDoctorSpecialty = (doctor) => {
    // Simple mapping - in real app, this would come from doctor database
    const specialties = {
      'Dr. Rajesh Kumar': 'Cardiologist',
      'Dr. Priya Mehta': 'General Physician',
      'Dr. Amit Singh': 'Orthopedic Surgeon',
      'Dr. Sunita Patel': 'Endocrinologist'
    };
    return specialties[doctor] || 'Physician';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading doctor notes...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Doctor Notes & Observations
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Medical notes and observations from your healthcare providers
          </p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 lg:mt-0">
          <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {sortedNotes.length} Notes
            </span>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          >
            <option value="date">Sort by Date</option>
            <option value="doctor">Sort by Doctor</option>
            <option value="visitType">Sort by Visit Type</option>
          </select>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        <AnimatePresence>
          {sortedNotes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white dark:bg-gray-800 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                selectedNote?.id === note.id
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
              }`}
              onClick={() => setSelectedNote(
                selectedNote?.id === note.id ? null : note
              )}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                      <span className="text-2xl">{getVisitTypeIcon(note.visitType)}</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {note.doctor}
                        </h3>
                        {note.visitType && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getVisitTypeColor(note.visitType)}`}>
                            {note.visitType}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {getDoctorSpecialty(note.doctor)}
                        </p>
                        <p>{formatDate(note.date)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Note Preview */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4">
                  <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
                    {note.note}
                  </p>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {selectedNote?.id === note.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4"
                    >
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            Complete Note
                          </h4>
                          <div className="p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                            <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                              {note.note}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                            <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Doctor Information</h5>
                            <div className="space-y-1 text-sm">
                              <p className="text-blue-700 dark:text-blue-400">
                                <strong>Name:</strong> {note.doctor}
                              </p>
                              <p className="text-blue-700 dark:text-blue-400">
                                <strong>Specialty:</strong> {getDoctorSpecialty(note.doctor)}
                              </p>
                            </div>
                          </div>

                          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                            <h5 className="font-medium text-green-800 dark:text-green-300 mb-2">Visit Details</h5>
                            <div className="space-y-1 text-sm">
                              <p className="text-green-700 dark:text-green-400">
                                <strong>Date:</strong> {formatDate(note.date)}
                              </p>
                              <p className="text-green-700 dark:text-green-400">
                                <strong>Type:</strong> {note.visitType || 'General'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3 pt-2">
                          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                            <span>📧</span>
                            <span>Email Note</span>
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors">
                            <span>🖨️</span>
                            <span>Print Note</span>
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors">
                            <span>📋</span>
                            <span>Copy Text</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {sortedNotes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No doctor notes found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No medical notes or observations have been recorded yet.
          </p>
        </div>
      )}

      {/* Summary Statistics */}
      {sortedNotes.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { 
                label: 'Total Notes', 
                count: sortedNotes.length, 
                color: 'bg-blue-50 text-blue-800 border-blue-200' 
              },
              { 
                label: 'This Month', 
                count: sortedNotes.filter(n => {
                  const noteDate = new Date(n.date);
                  const now = new Date();
                  return noteDate.getMonth() === now.getMonth() && noteDate.getFullYear() === now.getFullYear();
                }).length, 
                color: 'bg-green-50 text-green-800 border-green-200' 
              },
              { 
                label: 'Follow-ups', 
                count: sortedNotes.filter(n => n.visitType === 'Follow-up').length, 
                color: 'bg-purple-50 text-purple-800 border-purple-200' 
              },
              { 
                label: 'Doctors', 
                count: new Set(sortedNotes.map(n => n.doctor)).size, 
                color: 'bg-orange-50 text-orange-800 border-orange-200' 
              }
            ].map((stat, index) => (
              <div key={index} className={`p-4 rounded-xl border ${stat.color}`}>
                <div className="text-2xl font-bold">{stat.count}</div>
                <div className="text-sm opacity-75">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}