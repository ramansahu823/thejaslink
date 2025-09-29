import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function PersonalDetails({ profile, saving, onUpdate }) {
  // Extract personal details with proper fallbacks
  const getPersonalData = () => {
    if (!profile) return {};
    
    // Handle different data structures
    const personalDetails = profile.personalDetails || {};
    const directProfile = profile;
    
    return {
      name: personalDetails.name || personalDetails.fullName || directProfile.name || '',
      email: personalDetails.email || directProfile.email || '',
      phone: personalDetails.phone || personalDetails.phoneNumber || directProfile.phone || '',
      aadhar: personalDetails.aadhar || personalDetails.aadhaar || personalDetails.aadharNumber || '',
      dob: personalDetails.dateOfBirth || personalDetails.dob || '',
      gender: personalDetails.gender || '',
      bloodGroup: personalDetails.bloodGroup || personalDetails.bloodType || '',
      address: personalDetails.address || personalDetails.fullAddress || '',
      patientId: directProfile.patientId || directProfile.uid?.substring(0, 10) || 'Not Available'
    };
  };

  const personalData = getPersonalData();
  
  // Local state for editable fields
  const [editableFields, setEditableFields] = useState({
    phone: personalData.phone,
    email: personalData.email,
    address: personalData.address,
    bloodGroup: personalData.bloodGroup
  });

  // Update local state when profile changes
  useEffect(() => {
    const newPersonalData = getPersonalData();
    setEditableFields({
      phone: newPersonalData.phone,
      email: newPersonalData.email,
      address: newPersonalData.address,
      bloodGroup: newPersonalData.bloodGroup
    });
  }, [profile]);

  const handleInputChange = (field, value) => {
    setEditableFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Only update the fields that can be edited
    onUpdate(editableFields);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Personal Details</h2>
        <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            ID: {personalData.patientId}
          </span>
        </div>
      </div>

      {/* Non-editable Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <InfoCard 
          label="Full Name" 
          value={personalData.name || 'Not provided'} 
          icon="👤"
          readonly={true}
        />
        <InfoCard 
          label="Date of Birth" 
          value={personalData.dob ? formatDate(personalData.dob) : 'Not provided'} 
          icon="📅"
          readonly={true}
        />
        <InfoCard 
          label="Gender" 
          value={personalData.gender || 'Not provided'} 
          icon="⚥"
          readonly={true}
        />
        <InfoCard 
          label="Aadhar Number" 
          value={personalData.aadhar ? maskAadhar(personalData.aadhar) : 'Not provided'} 
          icon="🆔"
          readonly={true}
        />
        <InfoCard 
          label="Patient ID" 
          value={personalData.patientId} 
          icon="🏥"
          readonly={true}
        />
      </div>

      {/* Editable Information */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Editable Information
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📞 Phone Number
            </label>
            <input
              type="tel"
              value={editableFields.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter phone number"
              className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📧 Email Address
            </label>
            <input
              type="email"
              value={editableFields.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          {/* Blood Group */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🩸 Blood Group
            </label>
            <select
              value={editableFields.bloodGroup}
              onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          {/* Address - Full width */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📍 Address
            </label>
            <textarea
              value={editableFields.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter complete address"
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
            />
          </div>
        </div>

        {/* Save Button */}
        <motion.div 
          className="mt-6 flex justify-end"
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }}
        >
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            {saving ? (
              <>
                <motion.div 
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" 
                  animate={{ rotate: 360 }} 
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} 
                />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>Save Changes</span>
              </>
            )}
          </button>
        </motion.div>
      </div>

      {/* Data Sync Status */}
      <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
          <span>✅</span>
          <span className="text-sm font-medium">
            Profile data synced from Firebase
          </span>
        </div>
        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
          Last updated: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
}

// Info Card Component for readonly fields
function InfoCard({ label, value, icon, readonly = false }) {
  return (
    <div className={`p-4 rounded-lg border transition-colors ${
      readonly 
        ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
    }`}>
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
        <span>{icon}</span>
        <span className="uppercase tracking-wide font-medium">{label}</span>
      </div>
      <div className="font-semibold text-gray-900 dark:text-white">
        {value || 'Not provided'}
      </div>
      {readonly && (
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Read only
        </div>
      )}
    </div>
  );
}

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return 'Not provided';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString; // Return original if parsing fails
  }
}

// Helper function to mask Aadhar number
function maskAadhar(aadhar) {
  if (!aadhar) return 'Not provided';
  
  // Remove any existing formatting
  const cleaned = aadhar.replace(/\D/g, '');
  
  if (cleaned.length === 12) {
    // Format as XXXX-XXXX-1234 (show only last 4 digits)
    return `XXXX-XXXX-${cleaned.slice(-4)}`;
  }
  
  return 'Invalid format';
}