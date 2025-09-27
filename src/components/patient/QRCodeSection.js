import React, { useEffect, useRef } from 'react';

export default function QRCodeSection({ uid }) {
  const canvasRef = useRef();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const QRCode = (await import('qrcode')).default;
      if (!isMounted) return;
      const data = JSON.stringify({ type: 'patient', uid });
      await QRCode.toCanvas(canvasRef.current, data, { width: 220 });
    })();
    return () => { isMounted = false; };
  }, [uid]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Patient QR Code</h2>
      <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 inline-block">
        <canvas ref={canvasRef} width={220} height={220} />
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">Share with doctors to quickly access your records.</p>
    </div>
  );
}













