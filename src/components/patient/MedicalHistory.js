import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function MedicalHistory({ profile }) {
  const [activeTab, setActiveTab] = useState('illnesses');

  // Extract medical history with proper fallbacks
  const getMedicalData = () => {
    const medicalHistory = profile?.medicalHistory || {};
    
    return {
      illnesses: medicalHistory.illnesses || [],
      allergies: medicalHistory.allergies || [],
      surgeries: medicalHistory.surgeries || [],
      familyHistory: medicalHistory.familyHistory || [],
      medications: medicalHistory.medications || []
    };
  };

  const medicalData = getMedicalData();

  const tabs = [
    { key: 'illnesses', label: 'Previous Illnesses', icon: '🏥', color: 'blue' },
    { key: 'allergies', label: 'Allergies', icon: '⚠️', color: 'red' },
    { key: 'surgeries', label: 'Surgeries', icon: '🔪', color: 'purple' },
    { key: 'familyHistory', label: 'Family History', icon: '👨‍👩‍👧‍👦', color: 'green' },
    { key: 'medications', label: 'Current Medications', icon: '💊', color: 'orange' }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100',
      red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100',
      purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-100',
      green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100',
      orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-100'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Medical History</h2>
        <div className="bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            Complete Record
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'illnesses' && (
          <MedicalCard
            title="Previous Illnesses"
            items={medicalData.illnesses}
            color="blue"
            emptyMessage="No previous illnesses recorded"
            icon="🏥"
          />
        )}
        
        {activeTab === 'allergies' && (
          <MedicalCard
            title="Known Allergies"
            items={medicalData.allergies}
            color="red"
            emptyMessage="No allergies recorded"
            icon="⚠️"
            isAlert={true}
          />
        )}
        
        {activeTab === 'surgeries' && (
          <MedicalCard
            title="Previous Surgeries"
            items={medicalData.surgeries}
            color="purple"
            emptyMessage="No surgeries recorded"
            icon="🔪"
          />
        )}
        
        {activeTab === 'familyHistory' && (
          <MedicalCard
            title="Family Medical History"
            items={medicalData.familyHistory}
            color="green"
            emptyMessage="No family history recorded"
            icon="👨‍👩‍👧‍👦"
          />
        )}
        
        {activeTab === 'medications' && (
          <MedicalCard
            title="Current Medications"
            items={medicalData.medications}
            color="orange"
            emptyMessage="No current medications"
            icon="💊"
          />
        )}
      </motion.div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
        {tabs.map((tab) => {
          const count = medicalData[tab.key]?.length || 0;
          return (
            <div
              key={tab.key}
              className={`p-4 rounded-lg border ${getColorClasses(tab.color)}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{tab.icon}</span>
                <span className="text-2xl font-bold">{count}</span>
              </div>
              <p className="text-xs opacity-75">{tab.label}</p>
            </div>
          );
        })}
      </div>

      {/* Emergency Alert for Allergies */}
      {medicalData.allergies.length > 0 && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-300 mb-2">
            <span className="text-xl">🚨</span>
            <span className="font-bold">ALLERGY ALERT</span>
          </div>
          <p className="text-red-700 dark:text-red-400 text-sm">
            Patient has known allergies: {medicalData.allergies.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}

// Medical Card Component
function MedicalCard({ title, items, color, emptyMessage, icon, isAlert = false }) {
  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
      green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
    };
    return colors[color] || colors.blue;
  };

  const getTextColor = (color) => {
    const colors = {
      blue: 'text-blue-900 dark:text-blue-100',
      red: 'text-red-900 dark:text-red-100', 
      purple: 'text-purple-900 dark:text-purple-100',
      green: 'text-green-900 dark:text-green-100',
      orange: 'text-orange-900 dark:text-orange-100'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className={`p-6 rounded-xl border-2 ${getColorClasses(color)}`}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <h3 className={`text-xl font-bold ${getTextColor(color)}`}>
          {title}
        </h3>
        {items.length > 0 && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getColorClasses(color)} border`}>
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <span className={`w-2 h-2 rounded-full mt-2 ${
                color === 'red' ? 'bg-red-500' :
                color === 'blue' ? 'bg-blue-500' :
                color === 'purple' ? 'bg-purple-500' :
                color === 'green' ? 'bg-green-500' :
                'bg-orange-500'
              }`} />
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white font-medium">
                  {typeof item === 'string' ? item : item.condition || item.name || 'Unknown'}
                </p>
                {typeof item === 'object' && (item.date || item.doctor) && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {item.date && <span>Date: {item.date}</span>}
                    {item.date && item.doctor && <span> • </span>}
                    {item.doctor && <span>Doctor: {item.doctor}</span>}
                  </p>
                )}
              </div>
              {isAlert && (
                <span className="text-red-500 text-xl">⚠️</span>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-3">📋</div>
          <p className="text-gray-600 dark:text-gray-400">{emptyMessage}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Medical history will appear here when available
          </p>
        </div>
      )}
    </div>
  );
}