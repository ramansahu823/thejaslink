import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function ChronicTracker({ profile }) {
  const [selectedCondition, setSelectedCondition] = useState(null);

  // Extract chronic conditions data with proper fallbacks
  const getChronicData = () => {
    const chronic = profile?.chronic || {};
    
    const conditions = [
      {
        id: 'bp',
        name: 'Blood Pressure',
        icon: '❤️',
        value: chronic.bp || 'Not monitored',
        status: getHealthStatus(chronic.bp, 'bp'),
        color: getStatusColor(chronic.bp, 'bp'),
        unit: 'mmHg',
        normalRange: '120/80 - 140/90',
        lastUpdated: chronic.bpLastUpdated || 'Never'
      },
      {
        id: 'diabetes',
        name: 'Blood Sugar',
        icon: '🍬',
        value: chronic.diabetes || 'Not monitored',
        status: getHealthStatus(chronic.diabetes, 'diabetes'),
        color: getStatusColor(chronic.diabetes, 'diabetes'),
        unit: 'mg/dL',
        normalRange: '70-140 mg/dL',
        lastUpdated: chronic.diabetesLastUpdated || 'Never'
      },
      {
        id: 'asthma',
        name: 'Respiratory Health',
        icon: '🫁',
        value: chronic.asthma || 'No issues reported',
        status: getHealthStatus(chronic.asthma, 'asthma'),
        color: getStatusColor(chronic.asthma, 'asthma'),
        unit: '',
        normalRange: 'No symptoms',
        lastUpdated: chronic.asthmaLastUpdated || 'Never'
      },
      {
        id: 'cholesterol',
        name: 'Cholesterol',
        icon: '🧈',
        value: chronic.cholesterol || 'Not tested',
        status: getHealthStatus(chronic.cholesterol, 'cholesterol'),
        color: getStatusColor(chronic.cholesterol, 'cholesterol'),
        unit: 'mg/dL',
        normalRange: '<200 mg/dL',
        lastUpdated: chronic.cholesterolLastUpdated || 'Never'
      },
      {
        id: 'weight',
        name: 'Weight Management',
        icon: '⚖️',
        value: chronic.weight || 'Not tracked',
        status: getHealthStatus(chronic.weight, 'weight'),
        color: getStatusColor(chronic.weight, 'weight'),
        unit: 'kg',
        normalRange: 'BMI 18.5-24.9',
        lastUpdated: chronic.weightLastUpdated || 'Never'
      },
      {
        id: 'thyroid',
        name: 'Thyroid Function',
        icon: '🦋',
        value: chronic.thyroid || 'Not tested',
        status: getHealthStatus(chronic.thyroid, 'thyroid'),
        color: getStatusColor(chronic.thyroid, 'thyroid'),
        unit: 'mIU/L',
        normalRange: '0.4-4.0 mIU/L',
        lastUpdated: chronic.thyroidLastUpdated || 'Never'
      }
    ];

    return conditions;
  };

  const conditions = getChronicData();

  // Get overall health score
  const getOverallHealthScore = () => {
    const monitored = conditions.filter(c => c.value !== 'Not monitored' && c.value !== 'Not tested' && c.value !== 'Not tracked').length;
    const total = conditions.length;
    return Math.round((monitored / total) * 100);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Chronic Disease Tracker</h2>
        <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            {getOverallHealthScore()}% Monitored
          </span>
        </div>
      </div>

      {/* Health Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {conditions.map((condition) => (
          <motion.div
            key={condition.id}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
              selectedCondition?.id === condition.id
                ? `${condition.color.bg} ${condition.color.border} scale-105 shadow-lg`
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md'
            }`}
            onClick={() => setSelectedCondition(selectedCondition?.id === condition.id ? null : condition)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{condition.icon}</span>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {condition.name}
                </h3>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                condition.color.bg + ' ' + condition.color.text
              }`}>
                {condition.status}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {condition.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Normal: {condition.normalRange}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                Last updated: {condition.lastUpdated}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detailed View for Selected Condition */}
      {selectedCondition && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-xl border-2 ${selectedCondition.color.bg} ${selectedCondition.color.border} mb-8`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedCondition.icon}</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedCondition.name} Details
              </h3>
            </div>
            <button
              onClick={() => setSelectedCondition(null)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <span className="text-gray-600 dark:text-gray-400">✕</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Current Value</h4>
              <p className="text-2xl font-bold">{selectedCondition.value}</p>
              {selectedCondition.unit && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedCondition.unit}</p>
              )}
            </div>
            
            <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Status</h4>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
                selectedCondition.color.bg + ' ' + selectedCondition.color.text
              }`}>
                <span>{getStatusIcon(selectedCondition.status)}</span>
                <span className="font-medium">{selectedCondition.status}</span>
              </div>
            </div>
            
            <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Normal Range</h4>
              <p className="text-sm">{selectedCondition.normalRange}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Updated: {selectedCondition.lastUpdated}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Health Tips and Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">💡</span>
            <h3 className="font-bold text-green-800 dark:text-green-300">Health Tips</h3>
          </div>
          <ul className="space-y-2 text-sm text-green-700 dark:text-green-400">
            <li>• Monitor your vitals regularly</li>
            <li>• Maintain a healthy diet</li>
            <li>• Exercise as recommended by your doctor</li>
            <li>• Take medications on schedule</li>
            <li>• Keep regular doctor appointments</li>
          </ul>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📊</span>
            <h3 className="font-bold text-blue-800 dark:text-blue-300">Tracking Progress</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700 dark:text-blue-400">Monitored Conditions</span>
              <span className="font-bold text-blue-800 dark:text-blue-300">
                {conditions.filter(c => c.value !== 'Not monitored' && c.value !== 'Not tested').length}/{conditions.length}
              </span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${getOverallHealthScore()}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getHealthStatus(value, type) {
  if (!value || value === 'Not monitored' || value === 'Not tested' || value === 'Not tracked') {
    return 'Not Monitored';
  }
  
  // Simple status determination - in real app, this would be more sophisticated
  if (value.includes('Normal') || value.includes('controlled') || value.includes('stable')) {
    return 'Good';
  }
  if (value.includes('High') || value.includes('Low') || value.includes('episodes')) {
    return 'Needs Attention';
  }
  
  return 'Monitored';
}

function getStatusColor(value, type) {
  const status = getHealthStatus(value, type);
  
  switch (status) {
    case 'Good':
      return {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        text: 'text-green-800 dark:text-green-300'
      };
    case 'Needs Attention':
      return {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        text: 'text-red-800 dark:text-red-300'
      };
    default:
      return {
        bg: 'bg-gray-50 dark:bg-gray-800/20',
        border: 'border-gray-200 dark:border-gray-700',
        text: 'text-gray-800 dark:text-gray-300'
      };
  }
}

function getStatusIcon(status) {
  switch (status) {
    case 'Good':
      return '✅';
    case 'Needs Attention':
      return '⚠️';
    default:
      return '📊';
  }
}
