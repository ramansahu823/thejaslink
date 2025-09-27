import React from 'react';

export default function MedicalHistory({ profile }) {
  const items = profile?.medicalHistory || {
    illnesses: ['Hypertension'],
    allergies: ['Penicillin'],
    surgeries: ['Appendectomy (2018)']
  };
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Medical History</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Previous Illnesses" list={items.illnesses} />
        <Card title="Allergies" list={items.allergies} />
        <Card title="Surgeries" list={items.surgeries} />
      </div>
    </div>
  );
}

function Card({ title, list }) {
  return (
    <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
      <h3 className="font-semibold mb-2">{title}</h3>
      <ul className="list-disc pl-5 space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
        {(list && list.length ? list : ['-']).map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    </div>
  );
}



