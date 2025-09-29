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
  setDoc,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';    
import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { 
  User, 
  LogOut, 
  Settings, 
  QrCode,
  Download,
  Copy,
  Menu,
  X
} from 'lucide-react';
import QRCode from 'qrcode';

// Import Firebase service functions
import {
  getPatientProfile,
  updatePatientProfile,
  getPatientAppointments,
  getPatientPrescriptions,
  getPatientLabReports,
  getPatientVaccinations,
  getDoctorNotes,
  getAllPatientData
} from '../services/patientFirebaseService';

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
  { key: 'personal', label: 'Personal Details', icon: '👤' },
  { key: 'medical', label: 'Medical History', icon: '📋' },
  { key: 'reports', label: 'Lab Reports & Tests', icon: '🔬' },
  { key: 'prescriptions', label: 'Prescriptions', icon: '💊' },
  { key: 'chronic', label: 'Chronic Diseases', icon: '❤️' },
  { key: 'appointments', label: 'Upcoming Appointments', icon: '📅' },
  { key: 'vaccinations', label: 'Vaccination Records', icon: '💉' },
  { key: 'notes', label: 'Doctor Notes', icon: '📝' },
  { key: 'emergency', label: 'Emergency Info', icon: '🚨' },
  { key: 'qrcode', label: 'QR Code', icon: '🔳' },
  { key: 'nearby', label: 'Nearby Hospitals', icon: '🏥' }
];

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const [active, setActive] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [reports, setReports] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dataLoadError, setDataLoadError] = useState(null);

  const uid = state?.user?.uid;
  const role = state?.user?.role;
  const currentUser = state?.user;

  // Get patient ID - from registration or UID-based
  const getPatientId = () => {
    if (currentUser?.patientId) return currentUser.patientId;
    if (profile?.patientId) return profile.patientId;
    return uid?.substring(0, 10) || 'Not Available';
  };

  const patientId = getPatientId();

  // Extract patient information with better fallbacks
  const getPatientInfo = () => {
    if (!profile && !currentUser) {
      return { 
        name: 'Patient', 
        email: '', 
        patientId: 'Not Available', 
        phone: '',
        aadhar: '',
        dob: '',
        gender: '',
        bloodGroup: '',
        address: '',
        personalDetails: {} 
      };
    }
    
    const data = profile || currentUser;
    
    // Handle different data structures
    const personalDetails = data.personalDetails || data || {};
    
    return {
      name: personalDetails.name || personalDetails.fullName || data.displayName || 'Patient',
      email: personalDetails.email || data.email || '',
      patientId: patientId,
      phone: personalDetails.phone || personalDetails.phoneNumber || data.phoneNumber || '',
      aadhar: personalDetails.aadhar || personalDetails.aadhaar || personalDetails.aadharNumber || '',
      dob: personalDetails.dateOfBirth || personalDetails.dob || '',
      gender: personalDetails.gender || '',
      bloodGroup: personalDetails.bloodGroup || personalDetails.bloodType || '',
      address: personalDetails.address || personalDetails.fullAddress || '',
      personalDetails: personalDetails
    };
  };

  const patientInfo = getPatientInfo();

  // Generate QR Code
  const generateQRCode = async () => {
    try {
      const qrData = JSON.stringify({
        type: 'patient',
        patientId: patientInfo.patientId,
        name: patientInfo.name,
        emergencyContact: profile?.emergency?.contactPhone || null,
        bloodGroup: patientInfo.bloodGroup || null,
        allergies: profile?.medicalHistory?.allergies || [],
        system: "ThejasLink Health Records",
        timestamp: new Date().toISOString()
      });
      
      const url = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#2a8dff',
          light: '#ffffff'
        }
      });
      setQrCodeUrl(url);
    } catch (err) {
      console.error('Error generating QR code:', err);
      // Fallback to simple QR code
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#2a8dff';
      ctx.fillRect(0, 0, 300, 300);
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px Arial';
      ctx.fillText('PATIENT ID', 80, 150);
      ctx.fillText(patientInfo.patientId, 100, 180);
      setQrCodeUrl(canvas.toDataURL());
    }
  };

  useEffect(() => {
    if (!uid || role !== 'patient') {
      navigate('/patient-login');
      return;
    }

    const loadPatientData = async () => {
      try {
        setLoading(true);
        setDataLoadError(null);

        // Demo mode handling
        if (String(uid).startsWith('demo_')) {
          const demoData = {
            uid,
            name: 'AMAN SAHU',
            email: 'aman@gmail.com',
            patientId: '3952995353',
            personalDetails: {
              name: 'AMAN SAHU',
              aadhar: 'XXXX-XXXX-XXXX-1234',
              bloodGroup: 'B+',
              phone: '+91 9876543210',
              dob: '15/03/1990',
              gender: 'Male',
              address: 'Kerala, India',
              email: 'aman@gmail.com'
            },
            medicalHistory: {
              allergies: ['Penicillin'],
              illnesses: [],
              surgeries: [],
              familyHistory: [],
              medications: []
            },
            chronic: {
              bp: 'Normal',
              diabetes: 'Not monitored',
              cholesterol: 'Not tested'
            }
          };
          setProfile(demoData);
          setPatientData({
            profile: demoData,
            appointments: [],
            prescriptions: [],
            labReports: [],
            vaccinations: [],
            doctorNotes: []
          });
          setLoading(false);
          return;
        }

        // Use patient ID for Firebase queries
        const currentPatientId = patientId;
        
        if (currentPatientId && currentPatientId !== 'Not Available') {
          try {
            // Try to load using new Firebase service functions
            const allData = await getAllPatientData(currentPatientId);
            setProfile(allData.profile);
            setPatientData(allData);
            setPrescriptions(allData.prescriptions || []);
            setAppointments(allData.appointments || []);
            setNotes(allData.doctorNotes || []);
            setVaccinations(allData.vaccinations || []);
            setReports(allData.labReports || []);
          } catch (firebaseServiceError) {
            console.log('New Firebase service failed, trying legacy method:', firebaseServiceError);
            
            // Fallback to legacy Firebase loading
            await loadLegacyPatientData();
          }
        } else {
          // Create new patient profile if no patient ID
          await createNewPatientProfile();
        }

      } catch (error) {
        console.error('Error loading patient data:', error);
        setDataLoadError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadPatientData();
  }, [uid, role, navigate, currentUser, patientId]);

  // Legacy Firebase loading method (your original code)
  const loadLegacyPatientData = async () => {
    try {
      const patientDocRef = doc(db, 'patients', uid);
      const patientSnap = await getDoc(patientDocRef);

      if (patientSnap.exists()) {
        const patientData = patientSnap.data();
        setProfile({ uid, ...patientData });
      } else {
        await createNewPatientProfile();
      }

      // Load subcollections using legacy method
      await loadSubcollections(uid);
    } catch (error) {
      console.error('Legacy loading failed:', error);
      throw error;
    }
  };

  // Create new patient profile
  const createNewPatientProfile = async () => {
    const newPatientId = generatePatientId();
    const initialData = {
      uid,
      email: currentUser?.email || '',
      name: currentUser?.displayName || 'Patient',
      patientId: newPatientId,
      personalDetails: {
        name: currentUser?.displayName || 'Patient',
        email: currentUser?.email || '',
        phone: '',
        aadhar: '',
        dob: '',
        gender: '',
        bloodGroup: '',
        address: ''
      },
      medicalHistory: {
        allergies: [],
        illnesses: [],
        surgeries: [],
        familyHistory: [],
        medications: []
      },
      chronic: {
        bp: 'Not monitored',
        diabetes: 'Not monitored',
        cholesterol: 'Not tested'
      },
      emergency: {
        contactName: '',
        contactPhone: ''
      },
      createdAt: new Date()
    };
    
    // Save using both methods for compatibility
    try {
      // Save to patients collection with UID as document ID
      await setDoc(doc(db, 'patients', uid), initialData);
      
      // Also save with patientId as document ID for new system
      await setDoc(doc(db, 'patients', newPatientId), initialData);
      
      setProfile(initialData);
    } catch (error) {
      console.error('Error creating patient profile:', error);
      throw error;
    }
  };

  const loadSubcollections = async (patientUid) => {
    try {
      const basePath = `patients/${patientUid}`;
      
      // Load prescriptions
      const presSnap = await getDocs(collection(db, basePath, 'prescriptions'));
      setPrescriptions(presSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Load appointments
      const appSnap = await getDocs(collection(db, basePath, 'appointments'));
      setAppointments(appSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Load notes
      const noteSnap = await getDocs(collection(db, basePath, 'notes'));
      setNotes(noteSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Load vaccinations
      const vaccSnap = await getDocs(collection(db, basePath, 'vaccinations'));
      setVaccinations(vaccSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Load reports from storage
      await loadReportsFromStorage(patientUid);

    } catch (error) {
      console.error('Error loading subcollections:', error);
    }
  };

  const loadReportsFromStorage = async (patientUid) => {
    try {
      const reportsRef = ref(storage, `patients/${patientUid}/reports`);
      const listed = await listAll(reportsRef);
      const files = await Promise.all(
        listed.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return { 
            name: itemRef.name, 
            url, 
            fullPath: itemRef.fullPath,
            uploadedAt: new Date().toISOString(),
            category: 'Uploaded Report',
            status: 'available'
          };
        })
      );
      setReports(files.sort((a, b) => b.name.localeCompare(a.name)));
    } catch (error) {
      console.log('No reports found or error loading reports:', error);
    }
  };

  const generatePatientId = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  };

  // Enhanced update function using new Firebase service
  const handleUpdateContact = async (updatedData) => {
    if (!patientId || patientId === 'Not Available') return;
    
    setSaving(true);
    try {
      // Use new Firebase service function
      await updatePatientProfile(patientId, {
        personalDetails: updatedData,
        updatedAt: new Date()
      });
      
      // Update local state
      setProfile(prev => ({
        ...prev,
        personalDetails: {
          ...prev?.personalDetails,
          ...updatedData
        }
      }));
      
      // Also update patientData if it exists
      if (patientData) {
        setPatientData(prev => ({
          ...prev,
          profile: {
            ...prev?.profile,
            personalDetails: {
              ...prev?.profile?.personalDetails,
              ...updatedData
            }
          }
        }));
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Fallback to legacy method
      try {
        const patientDocRef = doc(db, 'patients', uid);
        const currentData = (await getDoc(patientDocRef)).data() || {};
        
        const newData = {
          ...currentData,
          personalDetails: {
            ...currentData.personalDetails,
            ...updatedData
          },
          updatedAt: new Date()
        };
        
        await updateDoc(patientDocRef, newData);
        setProfile(prev => ({ ...prev, ...newData }));
      } catch (legacyError) {
        console.error('Legacy update also failed:', legacyError);
        alert('Error updating profile. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReportUpload = async (file) => {
    if (!uid || !file) return;
    
    if (String(uid).startsWith('demo_')) {
      alert('File upload is disabled in demo mode.');
      return;
    }
    
    try {
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const fileRef = ref(storage, `patients/${uid}/reports/${timestamp}_${safeName}`);
      
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      
      // Add to Firestore
      await addDoc(collection(db, 'patients', uid, 'reports'), {
        name: file.name,
        storagePath: fileRef.fullPath,
        url,
        uploadedAt: new Date(),
        size: file.size,
        type: file.type,
        category: 'Uploaded Report',
        status: 'available'
      });
      
      // Update local state
      setReports(prev => [{
        name: file.name,
        url,
        fullPath: fileRef.fullPath,
        uploadedAt: new Date().toISOString(),
        category: 'Uploaded Report',
        status: 'available'
      }, ...prev]);
      
    } catch (error) {
      console.error('Error uploading report:', error);
      alert('Error uploading file. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      actions.setUser(null);
      localStorage.removeItem('tl_user');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const copyPatientId = (e) => {  // ✅ Accept event as parameter
  navigator.clipboard.writeText(patientInfo.patientId)
    .then(() => {
      const originalText = e.target.innerHTML; 
      e.target.innerHTML = '✓ Copied!';        
      setTimeout(() => {
        e.target.innerHTML = originalText;      
      }, 2000);
    })
    .catch(err => {
      console.error('Failed to copy: ', err);
    });
};

  const downloadQRCode = () => {
    if (!qrCodeUrl) {
      alert('Please generate QR code first');
      return;
    }
    
    const a = document.createElement('a');
    a.href = qrCodeUrl;
    a.download = `thejaslink-patient-${patientInfo.patientId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-menu-container')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center py-12">
        <div className="text-center">
          <motion.div 
            className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full mx-auto mb-4" 
            animate={{ rotate: 360 }} 
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} 
          />
          <p className="text-gray-600 dark:text-gray-400">Loading your health dashboard...</p>
        </div>
      </section>
    );
  }

  // Error state
  if (dataLoadError) {
    return (
      <section className="min-h-screen flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Unable to Load Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {dataLoadError}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to ThejasLink, <span className="text-brand-600">{patientInfo.name}</span>
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2 bg-brand-50 dark:bg-brand-900/20 px-3 py-1 rounded-full">
                  <User size={16} className="text-brand-600" />
                  <span>Patient ID: </span>
                  <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">
                    {patientInfo.patientId}
                  </span>
                  <button 
                    onClick={copyPatientId}
                    className="text-brand-600 hover:text-brand-700 p-1 rounded transition-colors"
                    title="Copy Patient ID"
                  >
                    <Copy size={14} />
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-2 py-1 rounded text-xs font-medium">
                    Active
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              {/* QR Code Button */}
              <button
                onClick={() => {
                  generateQRCode();
                  setShowQRModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                <QrCode size={18} />
                <span className="hidden sm:inline">QR Code</span>
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

              {/* Profile Menu - FIXED */}
              <div className="profile-menu-container relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors shadow-sm"
                >
                  <User size={18} />
                  <span className="hidden sm:inline">Profile</span>
                </button>
                
                {showProfileMenu && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                  >
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{patientInfo.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{patientInfo.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setActive('personal');
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                      >
                        <Settings size={16} />
                        Personal Details
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar - Enhanced for mobile */}
          <aside className={`lg:col-span-3 ${mobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 p-4 sticky top-6"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 px-2">Navigation</h3>
              <nav className="grid gap-1">
                {sections.map((section) => (
                  <button
                    key={section.key}
                    onClick={() => {
                      setActive(section.key);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 text-left px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active === section.key
                        ? 'bg-brand-600 text-white shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                    }`}
                  >
                    <span className="text-lg">{section.icon}</span>
                    <span>{section.label}</span>
                  </button>
                ))}
              </nav>
            </motion.div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div 
                key={active}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                {active === 'personal' && (
                  <PersonalDetails 
                    profile={profile} 
                    saving={saving} 
                    onUpdate={handleUpdateContact} 
                  />
                )}
                {active === 'medical' && <MedicalHistory profile={profile} />}
                {active === 'reports' && (
                  <LabReports 
                    patientId={patientId}
                    reports={reports} 
                    onUpload={handleReportUpload} 
                  />
                )}
                {active === 'prescriptions' && (
                  <Prescriptions 
                    patientId={patientId}
                    items={prescriptions} 
                  />
                )}
                {active === 'chronic' && <ChronicTracker profile={profile} />}
                {active === 'appointments' && (
                  <Appointments 
                    patientId={patientId}
                    items={appointments} 
                  />
                )}
                {active === 'vaccinations' && (
                  <Vaccinations 
                    patientId={patientId}
                    items={vaccinations} 
                  />
                )}
                {active === 'notes' && (
                  <DoctorNotes 
                    patientId={patientId}
                    items={notes} 
                  />
                )}
                {active === 'emergency' && <EmergencyInfo profile={profile} />}
                {active === 'qrcode' && (
                  <QRCodeSection 
                    uid={uid} 
                    patientId={patientInfo.patientId}
                    profile={profile}
                    onGenerateQR={generateQRCode}
                    qrCodeUrl={qrCodeUrl}
                  />
                )}
                {active === 'nearby' && <NearbyHospitals />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Enhanced QR Code Modal */}
      {showQRModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowQRModal(false)}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Patient QR Code
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Scan this code to access patient information
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl text-center mb-6">
                {qrCodeUrl ? (
                  <img 
                    src={qrCodeUrl} 
                    alt="Patient QR Code" 
                    className="w-48 h-48 mx-auto mb-4 rounded-lg shadow-md"
                  />
                ) : (
                  <div className="w-48 h-48 mx-auto mb-4 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                    <QrCode size={48} className="text-gray-400" />
                  </div>
                )}
                
                <div className="space-y-2 text-sm">
                  <p><strong>Patient ID:</strong> {patientInfo.patientId}</p>
                  <p><strong>Name:</strong> {patientInfo.name}</p>
                  <p><strong>Blood Group:</strong> {patientInfo.bloodGroup || 'Not set'}</p>
                  <p><strong>System:</strong> ThejasLink Health Records</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={downloadQRCode}
                  disabled={!qrCodeUrl}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
                >
                  <Download size={18} />
                  Download
                </button>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <div className="mt-12">
        <Footer onEmergencyCall={() => alert('Connecting to emergency services...')} />
      </div>
    </section>
  );
}