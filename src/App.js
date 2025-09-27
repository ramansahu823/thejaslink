import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Home from './components/Home';
import PatientLogin from './components/PatientLogin';
import PatientRegistration from './components/PatientRegistration';
import DoctorRegistration from './components/DoctorRegistration';
import DoctorLogin from './components/DoctorLogin';
import Dashboard from './components/Dashboard';
import PatientDashboard from './pages/PatientDashboard';
import SuccessPage from './pages/SuccessPage';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="h-full bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans antialiased selection:bg-brand-200 selection:text-brand-900">
          {/* Background decoration */}
          <div className="fixed inset-0 -z-10 bg-grad"></div>
          
          {/* Header */}
          <Header />
          
          {/* Main App Container */}
          <main className="max-w-6xl mx-auto px-4 sm:px-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/doctor-signin" element={<DoctorLogin />} />
              <Route path="/patient-signin" element={<PatientLogin />} />
              <Route path="/doctor-registration" element={<DoctorRegistration />} />
              <Route path="/patient-registration" element={<PatientRegistration />} />
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/patient-dashboard" element={<PatientDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
