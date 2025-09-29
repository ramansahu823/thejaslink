import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Appointments({ items = [] }) {
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // Enhanced appointment data with more details
  const getAppointmentData = () => {
    if (items && items.length > 0) {
      return items;
    }
    
    // Mock data with comprehensive appointment information
    return [
      { 
        id: 'a1', 
        date: '2024-12-15', 
        time: '10:30 AM',
        doctor: 'Dr. Rajesh Sharma', 
        specialty: 'Cardiologist',
        clinic: 'Apollo Heart Institute',
        address: 'Sector 10, Jaipur',
        type: 'Follow-up',
        status: 'confirmed',
        reason: 'Blood pressure monitoring and ECG review',
        duration: '30 minutes',
        notes: 'Bring previous reports',
        phone: '+91-141-2345678',
        fees: '₹800'
      },
      { 
        id: 'a2', 
        date: '2024-12-20', 
        time: '2:00 PM',
        doctor: 'Dr. Priya Mehta', 
        specialty: 'General Physician',
        clinic: 'HealthCare Multispecialty',
        address: 'Malviya Nagar, Jaipur',
        type: 'Consultation',
        status: 'pending',
        reason: 'Annual health checkup',
        duration: '45 minutes',
        notes: 'Fasting required for blood tests',
        phone: '+91-141-2345679',
        fees: '₹500'
      },
      { 
        id: 'a3', 
        date: '2024-12-25', 
        time: '11:15 AM',
        doctor: 'Dr. Amit Singh', 
        specialty: 'Orthopedic',
        clinic: 'Bone & Joint Care Center',
        address: 'Civil Lines, Jaipur',
        type: 'Follow-up',
        status: 'rescheduled',
        reason: 'Knee pain assessment post-treatment',
        duration: '20 minutes',
        notes: 'X-ray reports required',
        phone: '+91-141-2345680',
        fees: '₹600'
      }
    ];
  };

  const appointments = getAppointmentData();

  // Filter appointments by type
  const filteredAppointments = appointments.filter(apt => {
    if (filterType === 'all') return true;
    return apt.status === filterType;
  });

  // Sort appointments by date
  const sortedAppointments = filteredAppointments.sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      rescheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      confirmed: '✅',
      pending: '⏳',
      rescheduled: '🔄',
      cancelled: '❌'
    };
    return icons[status] || '📅';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
  };

  const isUpcoming = (dateString) => {
    return new Date(dateString) >= new Date();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Upcoming Appointments
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your medical appointments and consultations
          </p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {sortedAppointments.length} Total
            </span>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <span>📅</span>
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
        {[
          { key: 'all', label: 'All Appointments' },
          { key: 'confirmed', label: 'Confirmed' },
          { key: 'pending', label: 'Pending' },
          { key: 'rescheduled', label: 'Rescheduled' }
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setFilterType(filter.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filterType === filter.key
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        <AnimatePresence>
          {sortedAppointments.map((appointment, index) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white dark:bg-gray-800 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                selectedAppointment?.id === appointment.id
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
              }`}
              onClick={() => setSelectedAppointment(
                selectedAppointment?.id === appointment.id ? null : appointment
              )}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      isUpcoming(appointment.date) ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      <span className="text-2xl">
                        {isUpcoming(appointment.date) ? '📅' : '📋'}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {appointment.doctor}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)} {appointment.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {appointment.specialty}
                        </p>
                        <p>{appointment.clinic}</p>
                        <p className="flex items-center gap-2">
                          <span>📍</span>
                          {appointment.address}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatDate(appointment.date)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {appointment.time} • {appointment.duration}
                    </div>
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">
                      {appointment.fees}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {selectedAppointment?.id === appointment.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                              Appointment Details
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Type:</span>
                                <span className="font-medium">{appointment.type}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Reason:</span>
                                <span className="font-medium text-right">{appointment.reason}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                                <span className="font-medium">{appointment.duration}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                              Contact Information
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <span>📞</span>
                                <span>{appointment.phone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>💰</span>
                                <span>Consultation Fee: {appointment.fees}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {appointment.notes && (
                        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <div className="flex items-start gap-2">
                            <span className="text-yellow-600">📝</span>
                            <div>
                              <h5 className="font-medium text-yellow-800 dark:text-yellow-300">Notes:</h5>
                              <p className="text-sm text-yellow-700 dark:text-yellow-400">{appointment.notes}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 mt-4">
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm">
                          <span>📞</span>
                          Call Clinic
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm">
                          <span>📍</span>
                          Get Directions
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm">
                          <span>🔄</span>
                          Reschedule
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm">
                          <span>❌</span>
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {sortedAppointments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📅</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No appointments found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You don't have any appointments scheduled yet.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <span>📅</span>
            <span>Schedule Your First Appointment</span>
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', count: appointments.length, color: 'bg-gray-50 text-gray-800' },
          { label: 'Confirmed', count: appointments.filter(a => a.status === 'confirmed').length, color: 'bg-green-50 text-green-800' },
          { label: 'Pending', count: appointments.filter(a => a.status === 'pending').length, color: 'bg-yellow-50 text-yellow-800' },
          { label: 'Upcoming', count: appointments.filter(a => isUpcoming(a.date)).length, color: 'bg-blue-50 text-blue-800' }
        ].map((stat, index) => (
          <div key={index} className={`p-4 rounded-xl ${stat.color} border`}>
            <div className="text-2xl font-bold">{stat.count}</div>
            <div className="text-sm opacity-75">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
