// QRCodeSection.js - Updated with Firebase integration
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function QRCodeSection({ patientId, profile }) {
  const canvasRef = useRef();
  const [qrGenerated, setQrGenerated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const generateQR = async () => {
      try {
        const QRCode = (await import('qrcode')).default;
        if (!isMounted) return;
        
        // Create QR data with patient info
        const qrData = JSON.stringify({
          type: 'patient',
          patientId: patientId,
          name: profile?.name || 'Unknown Patient',
          emergencyContact: profile?.emergency?.contactPhone || null,
          bloodGroup: profile?.bloodGroup || null,
          allergies: profile?.medicalHistory?.allergies || [],
          timestamp: new Date().toISOString()
        });
        
        await QRCode.toCanvas(canvasRef.current, qrData, {
          width: 220,
          margin: 2,
          color: {
            dark: '#1f2937',
            light: '#ffffff'
          }
        });
        
        setQrGenerated(true);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    if (patientId) {
      generateQR();
    }

    return () => {
      isMounted = false;
    };
  }, [patientId, profile]);

  const downloadQR = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `patient-qr-${patientId}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const printQR = () => {
    if (!canvasRef.current) return;
    
    const printWindow = window.open('', '_blank');
    const qrDataUrl = canvasRef.current.toDataURL();
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Patient QR Code - ${profile?.name || patientId}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 20px; 
            }
            .qr-container { 
              border: 2px solid #ccc; 
              padding: 20px; 
              margin: 20px auto; 
              width: fit-content; 
            }
          </style>
        </head>
        <body>
          <h2>Patient Medical QR Code</h2>
          <div class="qr-container">
            <img src="${qrDataUrl}" alt="Patient QR Code" />
            <p><strong>Patient ID:</strong> ${patientId}</p>
            <p><strong>Name:</strong> ${profile?.name || 'Unknown'}</p>
            <p><strong>Emergency Contact:</strong> ${profile?.emergency?.contactPhone || 'Not provided'}</p>
            <p><strong>Blood Group:</strong> ${profile?.bloodGroup || 'Not provided'}</p>
          </div>
          <p><small>Scan this QR code to quickly access medical records</small></p>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Patient QR Code
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Quick access code for medical professionals
          </p>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            ID: {patientId}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center">
          <div className="inline-block p-4 bg-gray-50 dark:bg-gray-900 rounded-xl mb-6">
            {qrGenerated ? (
              <canvas 
                ref={canvasRef} 
                width={220} 
                height={220}
                className="rounded-lg"
              />
            ) : (
              <div className="w-55 h-55 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <motion.div
                  className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <div className="font-medium text-blue-800 dark:text-blue-300">Patient ID</div>
                <div className="text-blue-600 dark:text-blue-400">{patientId}</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <div className="font-medium text-green-800 dark:text-green-300">Blood Group</div>
                <div className="text-green-600 dark:text-green-400">{profile?.bloodGroup || 'Not set'}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={downloadQR}
                disabled={!qrGenerated}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
              >
                <span>⬇️</span>
                <span>Download QR</span>
              </button>
              
              <button
                onClick={printQR}
                disabled={!qrGenerated}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 rounded-lg font-medium transition-colors"
              >
                <span>🖨️</span>
                <span>Print QR</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-yellow-600 text-lg">ℹ️</span>
            <div className="text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">How to use:</p>
              <ul className="text-yellow-700 dark:text-yellow-400 space-y-1">
                <li>• Show this QR code to doctors for instant access</li>
                <li>• Contains your basic medical info and emergency contacts</li>
                <li>• Works even when you can't speak or are unconscious</li>
                <li>• Keep a printed copy in your wallet or phone</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

