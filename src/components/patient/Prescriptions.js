import React from 'react';

export default function Prescriptions({ items }) {
  const data = items && items.length ? items : [
    { id: 'd1', date: '2025-09-01', doctor: 'Dr. Rao', meds: ['Atorvastatin 10mg OD', 'Metformin 500mg BD'] }
  ];
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Prescriptions</h2>
      <div className="space-y-3">
        {data.map((p) => (
          <div key={p.id} className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-semibold">{p.doctor}</span>
              <span className="text-neutral-500">{p.date}</span>
            </div>
            <ul className="list-disc pl-5 text-sm text-neutral-700 dark:text-neutral-300">
              {(p.meds || []).map((m, i) => <li key={i}>{m}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}













