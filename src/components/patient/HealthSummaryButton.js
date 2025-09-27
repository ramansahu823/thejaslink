import React, { useState } from 'react';

export default function HealthSummaryButton({ uid, profile, prescriptions, appointments, reports, notes, vaccinations }) {
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    setBusy(true);
    try {
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();
      let y = 10;
      const addLine = (text) => { doc.text(String(text), 10, y); y += 8; };
      doc.setFontSize(16); addLine('Health Summary');
      doc.setFontSize(11); addLine(`Patient UID: ${uid}`);
      addLine(`Name: ${profile?.name || '-'}`);
      addLine(`DOB: ${profile?.dob || '-'}`);
      addLine(`Gender: ${profile?.gender || '-'}`);
      y += 4; addLine('Prescriptions:');
      (prescriptions || []).forEach(p => addLine(`- ${p.date || ''} ${p.doctor || ''}: ${(p.meds || []).join(', ')}`));
      y += 4; addLine('Appointments:');
      (appointments || []).forEach(a => addLine(`- ${a.date || ''} with ${a.doctor || ''} @ ${a.clinic || ''}`));
      y += 4; addLine('Reports:');
      (reports || []).forEach(r => addLine(`- ${r.name}`));
      y += 4; addLine('Doctor Notes:');
      (notes || []).forEach(n => addLine(`- ${n.date || ''} ${n.author || ''}: ${n.note || ''}`));
      y += 4; addLine('Vaccinations:');
      (vaccinations || []).forEach(v => addLine(`- ${v.vaccine || ''}: ${(v.dates || []).join(', ')}`));
      doc.save('health-summary.pdf');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button disabled={busy} onClick={handleExport} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-60 font-semibold text-sm focus-ring">
      {busy ? 'Generating...' : 'Download Health Summary'}
    </button>
  );
}













