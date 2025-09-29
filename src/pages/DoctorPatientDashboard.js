import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";
import {
  ArrowLeft,
  User,
  AlertTriangle,
  FileText,
  Stethoscope,
  Beaker,
  Pill,
  Activity,
  ClipboardPlus,
} from "lucide-react";

// Apne maujooda components ko import karein
import Header from "../components/Header";
import Footer from "../components/Footer";
import PersonalDetails from "../components/patient/PersonalDetails";
import MedicalHistory from "../components/patient/MedicalHistory";
import LabReports from "../components/patient/LabReports";
import Prescriptions from "../components/patient/Prescriptions";
import ChronicTracker from "../components/patient/ChronicTracker";
import Appointments from "../components/patient/Appointments";
import Vaccinations from "../components/patient/Vaccinations";
import DoctorNotes from "../components/patient/DoctorNotes";

// Sahi Firebase service functions ko import karein
import {
  findPatientByPatientId,
  getPatientAppointments,
  getPatientPrescriptions,
  getPatientLabReports,
  getPatientVaccinations,
  getDoctorNotes,
} from "../services/patientFirebaseService";

// Dashboard grid ke liye card data
const dashboardSections = [
  {
    key: "personal",
    title: "Personal Details",
    description: "Name, DOB, Aadhaar, Contact info",
    icon: User,
    color: "blue",
  },
  {
    key: "medical",
    title: "Medical History",
    description: "Allergies, previous conditions, surgeries",
    icon: Stethoscope,
    color: "red",
  },
  {
    key: "reports",
    title: "Lab Reports",
    description: "Blood tests, X-rays, MRI scans",
    icon: Beaker,
    color: "purple",
  },
  {
    key: "prescriptions",
    title: "Prescriptions",
    description: "Current medications, vaccination records",
    icon: Pill,
    color: "green",
  },
  {
    key: "chronic",
    title: "Chronic Diseases",
    description: "Diabetes, BP, asthma, heart conditions",
    icon: Activity,
    color: "orange",
  },
  {
    key: "notes",
    title: "Doctor Notes",
    description: "Clinical observations, follow-up notes",
    icon: FileText,
    color: "indigo",
  },
];

export default function DoctorPatientDashboard() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const { state } = useApp();

  const [activeSection, setActiveSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientData, setPatientData] = useState(null);

  // DoctorPatientDashboard.js में useEffect ko update karein
  useEffect(() => {
    // Doctor authentication check
    if (state.user === undefined) {
      setLoading(true);
      return;
    }

    if (state.user === null || state.user.role !== "doctor") {
      navigate("/doctor-signin");
      return;
    }

    const loadData = async () => {
      if (!patientId) {
        setError("No Patient ID provided.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log("Loading data for patient:", patientId);

        // Patient profile load karein
        const profile = await findPatientByPatientId(patientId);
        console.log("Profile found:", profile);

        if (!profile || !profile.id) {
          throw new Error("Patient profile incomplete");
        }

        const patientDocId = profile.id;

        // All data parallel mein load karein
        const [
          appointments,
          prescriptions,
          labReports,
          vaccinations,
          doctorNotes,
        ] = await Promise.all([
          getPatientAppointments(patientDocId),
          getPatientPrescriptions(patientDocId),
          getPatientLabReports(patientDocId),
          getPatientVaccinations(patientDocId),
          getDoctorNotes(patientDocId),
        ]);

        setPatientData({
          profile,
          appointments,
          prescriptions,
          labReports,
          vaccinations,
          doctorNotes,
        });
      } catch (err) {
        console.error("Failed to fetch patient data:", err);
        setError(
          "Could not find patient with this ID. Please check the Patient ID."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId, navigate, state.user]);

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const renderSectionComponent = () => {
    if (!activeSection) return null;
    const { profile, appointments, labReports } = patientData;
    switch (activeSection) {
      case "personal":
        return <PersonalDetails profile={profile} />;
      case "medical":
        return <MedicalHistory profile={profile} />;
      case "reports":
        return <LabReports reports={labReports} />;
      case "prescriptions":
        return <Prescriptions patientId={patientId} />;
      case "chronic":
        return <ChronicTracker profile={profile} />;
      case "appointments":
        return <Appointments items={appointments} />;
      case "vaccinations":
        return <Vaccinations patientId={patientId} />;
      case "notes":
        return <DoctorNotes patientId={patientId} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <motion.div
            className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex items-center justify-center text-center p-4">
          <div>
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-xl font-bold">Error Fetching Data</h2>
            <p className="mt-2 text-gray-500">{error}</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const patientProfile = patientData?.profile;
  const patientName =
    patientProfile?.personalDetails?.name || patientProfile?.name || "Patient";
  const age = calculateAge(
    patientProfile?.personalDetails?.dateOfBirth || patientProfile?.dateOfBirth
  );
  const lastVisit = patientData?.appointments?.[0]?.date
    ? new Date(patientData.appointments[0].date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="flex-grow py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <button
                  onClick={() =>
                    activeSection
                      ? setActiveSection(null)
                      : navigate("/dashboard")
                  }
                  className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 mb-2"
                >
                  <ArrowLeft size={16} />
                  {activeSection ? "Back to Overview" : "Back to Search"}
                </button>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Patient: {patientName}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  ID: {patientId} | Age: {age} | Last Visit: {lastVisit}
                </p>
              </div>
          {/* In DoctorPatientDashboard.js, update the Today's Entry button: */}
              <button
                onClick={() => navigate(`/today-entry/${patientId}`)}
                className="flex items-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-sm transition-colors"
              >
                <ClipboardPlus size={18} />
                Today's Entry
              </button>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {activeSection ? (
              <motion.div
                key="detail"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderSectionComponent()}
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { staggerChildren: 0.05 } }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {dashboardSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <motion.button
                      key={section.key}
                      onClick={() => setActiveSection(section.key)}
                      className="group text-left bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-200 dark:border-gray-700 hover:border-brand-500 dark:hover:border-brand-500 transition-all duration-300"
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      whileHover={{ scale: 1.03, y: -5 }}
                    >
                      <div
                        className={`w-12 h-12 rounded-lg bg-${section.color}-100 dark:bg-${section.color}-900/20 text-${section.color}-600 dark:text-${section.color}-400 flex items-center justify-center mb-4`}
                      >
                        <Icon size={24} />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                        {section.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {section.description}
                      </p>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
