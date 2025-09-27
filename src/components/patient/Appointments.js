import React from 'react';

export default function Appointments({ items }) {
  const data = items && items.length ? items : [
    { id: 'a1', date: '2025-10-05 10:30', doctor: 'Dr. Sharma', clinic: 'City Clinic' },
    { id: 'a2', date: '2025-11-12 14:00', doctor: 'Dr. Mehta', clinic: 'HealthCare Center' }
  ];
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Upcoming Appointments</h2>
      <div className="space-y-3">
        {data.map((a) => (
          <div key={a.id} className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <div className="font-semibold">{a.doctor}</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">{a.clinic}</div>
            </div>
            <div className="text-sm text-neutral-700 dark:text-neutral-300">{a.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}













