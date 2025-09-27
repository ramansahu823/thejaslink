import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function PersonalDetails({ profile, saving, onUpdate }) {
  const [phone, setPhone] = useState(profile?.phone || '');
  const [email, setEmail] = useState(profile?.email || '');

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Personal Details</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Info label="Name" value={profile?.name || '-'} />
        <Info label="DOB" value={profile?.dob || '-'} />
        <Info label="Aadhaar" value={profile?.aadhaar || '-'} />
        <Info label="Gender" value={profile?.gender || '-'} />
        <Info label="Blood Group" value={profile?.bloodGroup || '-'} />
        <Info label="Address" value={profile?.address || '-'} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus-ring" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus-ring" />
        </div>
      </div>

      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={saving} onClick={() => onUpdate({ phone, email })} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-semibold focus-ring">
        {saving ? (
          <motion.div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
        ) : (
          <span>Save</span>
        )}
      </motion.button>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
      <div className="text-xs text-neutral-500 mb-1">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}



