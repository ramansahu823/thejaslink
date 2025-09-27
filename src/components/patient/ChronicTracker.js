import React from 'react';

export default function ChronicTracker({ profile }) {
  const data = profile?.chronic || {
    bp: '130/85',
    diabetes: 'FBS 110 mg/dL',
    asthma: 'No recent episodes'
  };
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Chronic Diseases Tracker</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card label="Blood Pressure" value={data.bp} />
        <Card label="Diabetes" value={data.diabetes} />
        <Card label="Asthma" value={data.asthma} />
      </div>
    </div>
  );
}

function Card({ label, value }) {
  return (
    <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
      <div className="text-xs text-neutral-500 mb-1">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}













