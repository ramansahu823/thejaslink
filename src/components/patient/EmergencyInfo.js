import React from 'react';

export default function EmergencyInfo({ profile }) {
  const info = profile?.emergency || {
    contactName: 'Family Member',
    contactPhone: '+91 98765 43210',
    allergies: profile?.medicalHistory?.allergies || ['Penicillin']
  };
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Emergency Info</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-red-600/10 border border-red-600/20">
          <div className="text-xs text-red-700 mb-1">Emergency Contact</div>
          <div className="font-semibold text-red-800">{info.contactName}</div>
          <div className="text-sm text-red-800">{info.contactPhone}</div>
        </div>
        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <div className="text-xs text-yellow-700 mb-1">Allergy Warnings</div>
          <div className="text-sm text-yellow-800">{(info.allergies || []).join(', ')}</div>
        </div>
      </div>
    </div>
  );
}













