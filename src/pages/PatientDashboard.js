import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import Footer from '../components/Footer';
import { db, storage } from '../firebase';
import { logout } from '../services/authService';
import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  collection,
  addDoc,
  getDocs
} from 'firebase/firestore';    
import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { 
  User, 
  LogOut, 
  Settings, 
  QrCode,
  Download,
  Copy
} from 'lucide-react';

// Section Components
import PersonalDetails from '../components/patient/PersonalDetails';
import MedicalHistory from '../components/patient/MedicalHistory';
import LabReports from '../components/patient/LabReports';
import Prescriptions from '../components/patient/Prescriptions';
import ChronicTracker from '../components/patient/ChronicTracker';
import Appointments from '../components/patient/Appointments';
import Vaccinations from '../components/patient/Vaccinations';
import DoctorNotes from '../components/patient/DoctorNotes';
import EmergencyInfo from '../components/patient/EmergencyInfo';
import QRCodeSection from '../components/patient/QRCodeSection';
import NearbyHospitals from '../components/patient/NearbyHospitals';
import HealthSummaryButton from '../components/patient/HealthSummaryButton';

const sections = [
  { key: 'personal', label: 'Personal Details' },
  { key: 'medical', label: 'Medical History' },
  { key: 'reports', label: 'Lab Reports & Tests' },
  { key: 'prescriptions', label: 'Prescriptions' },
  { key: 'chronic', label: 'Chronic Diseases' },
  { key: 'appointments', label: 'Upcoming Appointments' },
  { key: 'vaccinations', label: 'Vaccination Records' },
  { key: 'notes', label: 'Doctor Notes' },
  { key: 'emergency', label: 'Emergency Info' },
  { key: 'qrcode', label: 'QR Code' },
  { key: 'nearby', label: 'Nearby Hospitals' }
];

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const [active, setActive] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [reports, setReports] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const uid = state?.user?.uid;
  const role = state?.user?.role;
  const currentUser = state?.user;

  // Extract patient information with fallbacks
  const getPatientInfo = () => {
    if (!profile && !currentUser) return { name: '', email: '', patientId: '', personalDetails: {} };
    
    const data = profile || currentUser;
    const personalDetails = data.personalDetails || {};
    
    return {
      name: personalDetails.name || personalDetails.fullName || data.name || 'Patient',
      email: personalDetails.email || data.email || '',
      patientId: data.patientId || 'Not Available',
      phone: personalDetails.phone || personalDetails.phoneNumber || '',
      aadhar: personalDetails.aadhar || personalDetails.aadhaar || personalDetails.aadharNumber || '',
      dob: personalDetails.dateOfBirth || personalDetails.dob || '',
      gender: personalDetails.gender || '',
      personalDetails: personalDetails
    };
  };

  const patientInfo = getPatientInfo();

  useEffect(() => {
    if (!uid || role !== 'patient') {
      navigate('/patient-signin');
      return;
    }

    // Demo mode: if UID is a synthetic demo id, skip Firebase reads
    if (String(uid).startsWith('demo_')) {
      setProfile(currentUser || { uid });
      setLoading(false);
      return;
    }

    const refDoc = doc(db, 'patients', uid);
    const unsub = onSnapshot(refDoc, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setProfile({ uid, ...data });
      } else {
        // If no profile exists, use the current user data
        setProfile(currentUser || { uid });
      }
      setLoading(false);
    });

    // Load subcollections (prescriptions, appointments, notes, vaccinations)
    (async () => {
      try {
        const basePath = doc(db, 'patients', uid);
        const presSnap = await getDocs(collection(basePath, 'prescriptions'));
        setPrescriptions(presSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        const appSnap = await getDocs(collection(basePath, 'appointments'));
        setAppointments(appSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        const noteSnap = await getDocs(collection(basePath, 'notes'));
        setNotes(noteSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        const vaccSnap = await getDocs(collection(basePath, 'vaccinations'));
        setVaccinations(vaccSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        // fallback silently
        console.log('Error loading subcollections:', e);
      }
    })();

    // Load storage-based report list
    (async () => {
      try {
        const folder = ref(storage, `patients/${uid}/reports`);
        const listed = await listAll(folder);
        const files = await Promise.all(listed.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return { name: itemRef.name, url, fullPath: itemRef.fullPath };
        }));
        setReports(files.sort((a, b) => (a.name < b.name ? 1 : -1)));
      } catch (e) {
        // no files yet
        console.log('Error loading reports:', e);
      }
    })();

    return () => unsub();
  }, [uid, role, navigate, currentUser]);

  const handleUpdateContact = async (partial) => {
    if (!uid) return;
    setSaving(true);
    try {
      const refDoc = doc(db, 'patients', uid);
      const current = (await getDoc(refDoc)).data() || {};
      
      // Update personal details properly
      const updatedData = {
        ...current,
        personalDetails: {
          ...current.personalDetails,
          ...partial
        }
      };
      
      await setDoc(refDoc, updatedData, { merge: true });
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReportUpload = async (file) => {
    if (!uid || !file) return;
    if (String(uid).startsWith('demo_')) {
      alert('Uploads are disabled in demo mode.');
      return;
    }
    const ts = Date.now();
    const safeName = file.name.replace(/\s+/g, '_');
    const fileRef = ref(storage, `patients/${uid}/reports/${ts}_${safeName}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    setReports(prev => [{ name: `${ts}_${safeName}`, url, fullPath: fileRef.fullPath }, ...prev]);
    try {
      await addDoc(collection(db, 'patients', uid, 'reports'), { 
        name: file.name, 
        storedAs: `${ts}_${safeName}`, 
        url, 
        ts 
      });
    } catch (_) {}
  };

  const handleLogout = async () => {
    try {
      await logout();
      actions.setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const copyPatientId = () => {
    navigator.clipboard.writeText(patientInfo.patientId);
    alert('Patient ID copied to clipboard!');
  };

  const downloadQRCode = () => {
    // Create QR code data with patient information
    const qrData = {
      patientId: patientInfo.patientId,
      name: patientInfo.name,
      dob: patientInfo.dob,
      phone: patientInfo.phone,
      emergencyContact: patientInfo.phone
    };
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 300;
    
    // Simple QR-like visual (you can integrate actual QR library here)
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 300, 300);
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText(`Patient ID: ${patientInfo.patientId}`, 10, 20);
    ctx.fillText(`Name: ${patientInfo.name}`, 10, 40);
    ctx.fillText(`QR Data: ${JSON.stringify(qrData)}`, 10, 60);
    
    // Convert to downloadable image
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `patient_qr_${patientInfo.patientId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  if (loading) {
    return (
      <section className="min-h-[calc(100vh-4rem)] grid place-items-center py-12">
        <motion.div 
          className="w-10 h-10 border-2 border-brand-600 border-t-transparent rounded-full" 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} 
        />
      </section>
    );
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Enhanced Top Bar */}
        <div className="mb-6 bg-white/80 dark:bg-neutral-900/70 backdrop-blur rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-600 dark:text-brand-400 mb-2">
                Welcome to ThejasLink, {patientInfo.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>Patient ID: </span>
                  <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">
                    {patientInfo.patientId}
                  </span>
                  <button 
                    onClick={copyPatientId}
                    className="text-brand-600 hover:text-brand-700 p-1"
                    title="Copy Patient ID"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Patient QR Code Button */}
              <button
                onClick={() => setShowQRModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors"
              >
                <QrCode size={18} />
                <span className="hidden sm:inline">Patient QR Code</span>
              </button>

              {/* Health Summary Button */}
              <HealthSummaryButton 
                uid={uid} 
                profile={profile} 
                prescriptions={prescriptions} 
                appointments={appointments} 
                reports={reports} 
                notes={notes} 
                vaccinations={vaccinations} 
              />

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  <User size={18} />
                  <span className="hidden sm:inline">Profile</span>
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 z-50">
                    <div className="p-3 border-b border-neutral-200 dark:border-neutral-700">
                      <p className="font-medium text-sm">{patientInfo.name}</p>
                      <p className="text-xs text-neutral-500">{patientInfo.email}</p>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setActive('personal');
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-2"
                      >
                        <Settings size={16} />
                        Personal Details
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="rounded-xl soft-shadow border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/70 backdrop-blur p-3">
              <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
                {sections.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setActive(s.key)}
                    className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-ring ${
                      active === s.key 
                        ? 'bg-brand-600 text-white' 
                        : 'bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200/70 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div 
                key={active} 
                variants={containerVariants} 
                initial="hidden" 
                animate="visible" 
                exit="hidden" 
                className="rounded-xl soft-shadow border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/70 backdrop-blur p-4 sm:p-6"
              >
                {active === 'personal' && (
                  <PersonalDetails 
                    profile={{
                      ...profile,
                      personalDetails: patientInfo.personalDetails,
                      patientId: patientInfo.patientId
                    }} 
                    saving={saving} 
                    onUpdate={handleUpdateContact} 
                  />
                )}
                {active === 'medical' && (
                  <MedicalHistory profile={profile} />
                )}
                {active === 'reports' && (
                  <LabReports reports={reports} onUpload={handleReportUpload} />
                )}
                {active === 'prescriptions' && (
                  <Prescriptions items={prescriptions} />
                )}
                {active === 'chronic' && (
                  <ChronicTracker profile={profile} />
                )}
                {active === 'appointments' && (
                  <Appointments items={appointments} />
                )}
                {active === 'vaccinations' && (
                  <Vaccinations items={vaccinations} />
                )}
                {active === 'notes' && (
                  <DoctorNotes items={notes} />
                )}
                {active === 'emergency' && (
                  <EmergencyInfo profile={profile} />
                )}
                {active === 'qrcode' && (
                  <QRCodeSection uid={uid} patientId={patientInfo.patientId} />
                )}
                {active === 'nearby' && (
                  <NearbyHospitals />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div 
            className="bg-white dark:bg-neutral-900 rounded-xl p-6 max-w-md w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold mb-2">Patient QR Code</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                This QR code contains your Patient ID and basic information
              </p>
            </div>
            
            <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-center mb-4">
              <div className="w-32 h-32 bg-white border-2 border-dashed border-neutral-300 rounded-lg mx-auto flex items-center justify-center mb-3">
                <QrCode size={48} className="text-neutral-400" />
              </div>
              <div className="text-sm space-y-1">
                <p><strong>Patient ID:</strong> {patientInfo.patientId}</p>
                <p><strong>Name:</strong> {patientInfo.name}</p>
                <p><strong>Phone:</strong> {patientInfo.phone}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={downloadQRCode}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors"
              >
                <Download size={16} />
                Download
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="flex-1 px-4 py-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="mt-10">
        <Footer onEmergencyCall={() => alert('Dialing emergency number...')} />
      </div>
    </section>
  );
}