import React from 'react';

export default function DoctorNotes({ items }) {
  const data = items && items.length ? items : [
    { id: 'n1', date: '2025-09-12', author: 'Dr. Rao', note: 'Patient stable. Continue current meds.' }
  ];
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Doctor Notes</h2>
      <div className="space-y-3">
        {data.map(n => (
          <div key={n.id} className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <div className="text-sm text-neutral-500 mb-1">{n.date} • {n.author}</div>
            <div className="text-sm">{n.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}













