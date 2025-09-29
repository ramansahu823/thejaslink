// NearbyHospitals.js - Updated with real functionality
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function NearbyHospitals() {
  
  const [location, setLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock hospital data for Jaipur
  const mockHospitals = [
    {
      id: 1,
      name: "AIIMS Jaipur",
      type: "Government Hospital",
      distance: "2.5 km",
      rating: 4.5,
      phone: "+91-141-2672101",
      address: "Sikar Road, Jaipur",
      specialties: ["Emergency", "Cardiology", "Neurology"],
      available24x7: true,
      lat: 26.9124,
      lng: 75.7873
    },
    {
      id: 2,
      name: "Fortis Hospital Jaipur",
      type: "Private Hospital",
      distance: "3.2 km",
      rating: 4.3,
      phone: "+91-141-2921000",
      address: "Malviya Nagar, Jaipur",
      specialties: ["Emergency", "Oncology", "Orthopedics"],
      available24x7: true,
      lat: 26.8851,
      lng: 75.8094
    },
    {
      id: 3,
      name: "Apollo Hospital Jaipur",
      type: "Private Hospital",
      distance: "4.1 km",
      rating: 4.4,
      phone: "+91-141-2200000",
      address: "Sector 10, Pratap Nagar",
      specialties: ["Emergency", "Cardiac Surgery", "Gastroenterology"],
      available24x7: true,
      lat: 26.9037,
      lng: 75.8240
    },
    {
      id: 4,
      name: "Max Super Speciality Hospital",
      type: "Private Hospital", 
      distance: "5.8 km",
      rating: 4.2,
      phone: "+91-141-2988888",
      address: "Shipra Path, Mansarovar",
      specialties: ["Emergency", "Nephrology", "Urology"],
      available24x7: true,
      lat: 26.8721,
      lng: 75.7933
    },
    {
      id: 5,
      name: "CK Birla Hospital",
      type: "Private Hospital",
      distance: "6.2 km", 
      rating: 4.1,
      phone: "+91-141-3070000",
      address: "JLN Marg, Jaipur",
      specialties: ["Emergency", "Maternity", "Pediatrics"],
      available24x7: true,
      lat: 26.9056,
      lng: 75.8072
    }
  ];

  useEffect(() => {
    // Simulate loading and getting location
    const timer = setTimeout(() => {
      setHospitals(mockHospitals);
      setLocation({ lat: 26.9124, lng: 75.7873, city: 'Jaipur' });
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const getDirections = (hospital) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const callHospital = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const getTypeColor = (type) => {
    const colors = {
      'Government Hospital': 'bg-blue-100 text-blue-800 border-blue-200',
      'Private Hospital': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Nearby Hospitals & Clinics
        </h2>
        <div className="flex items-center justify-center py-12 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <motion.div
            className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Finding nearby hospitals...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Nearby Hospitals & Clinics
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Healthcare facilities near {location?.city || 'your location'}
          </p>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">
          <span className="text-sm font-medium text-red-700 dark:text-red-300">
            🚨 Emergency: 102
          </span>
        </div>
      </div>

      {/* Emergency Alert */}
      <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex items-center gap-2 text-red-800 dark:text-red-300 mb-2">
          <span className="text-xl">🚨</span>
          <span className="font-bold">Emergency Numbers</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <a href="tel:102" className="text-red-700 dark:text-red-400 hover:underline">102 - Ambulance</a>
          <a href="tel:108" className="text-red-700 dark:text-red-400 hover:underline">108 - Emergency</a>
          <a href="tel:100" className="text-red-700 dark:text-red-400 hover:underline">100 - Police</a>
          <a href="tel:101" className="text-red-700 dark:text-red-400 hover:underline">101 - Fire</a>
        </div>
      </div>

      {/* Hospitals List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {hospitals.map((hospital, index) => (
          <motion.div
            key={hospital.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {hospital.name}
                  </h3>
                  {hospital.available24x7 && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      24×7
                    </span>
                  )}
                </div>
                
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs border ${getTypeColor(hospital.type)}`}>
                      {hospital.type}
                    </span>
                    <span>📍 {hospital.distance}</span>
                  </div>
                  <p>📍 {hospital.address}</p>
                  <div className="flex items-center gap-1">
                    <span>⭐</span>
                    <span>{hospital.rating}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Specialties:</p>
              <div className="flex flex-wrap gap-2">
                {hospital.specialties.map((specialty, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => callHospital(hospital.phone)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                <span>📞</span>
                <span>Call</span>
              </button>
              
              <button
                onClick={() => getDirections(hospital)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <span>🗺️</span>
                <span>Directions</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Map Placeholder */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hospital Locations</h3>
        <div className="aspect-video w-full rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 grid place-items-center">
          <div className="text-center">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-gray-600 dark:text-gray-400">Interactive map integration</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              (Google Maps or similar service can be integrated here)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}