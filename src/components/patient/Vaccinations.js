import React from 'react';

export default function Vaccinations({ items }) {
  const data = items && items.length ? items : [
    { id: 'v1', vaccine: 'COVID-19', status: 'Completed', dates: ['2021-05-14', '2021-08-20'] },
    { id: 'v2', vaccine: 'Hepatitis B', status: 'Completed', dates: ['2010-01-10', '2010-02-10', '2010-06-10'] }
  ];
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Vaccination Records</h2>
      <div className="space-y-3">
        {data.map(v => (
          <div key={v.id} className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-1">
              <div className="font-semibold">{v.vaccine}</div>
              <span className="text-xs px-2 py-1 rounded bg-green-600/10 text-green-700 dark:text-green-400 border border-green-600/20">{v.status}</span>
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">{(v.dates || []).join(', ')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}













