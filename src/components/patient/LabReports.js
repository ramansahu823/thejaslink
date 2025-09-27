import React, { useRef } from 'react';

export default function LabReports({ reports, onUpload }) {
  const fileRef = useRef();
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Lab Reports & Test Results</h2>
        <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold focus-ring">
          Upload Report
        </button>
        <input ref={fileRef} type="file" className="hidden" onChange={(e) => onUpload(e.target.files?.[0])} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(reports && reports.length ? reports : []).map((r) => (
          <a key={r.fullPath} href={r.url} target="_blank" rel="noreferrer" className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:shadow transition-shadow">
            <div className="font-medium truncate" title={r.name}>{r.name}</div>
            <div className="text-xs text-neutral-500 mt-1">Click to view/download</div>
          </a>
        ))}
        {(!reports || reports.length === 0) && (
          <div className="text-sm text-neutral-600 dark:text-neutral-400">No reports uploaded yet.</div>
        )}
      </div>
    </div>
  );
}



