import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LabReports({ reports = [], onUpload }) {
  const fileRef = useRef();
  const [selectedReport, setSelectedReport] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Helper functions for report data enhancement
  const categorizeReport = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('blood') || lowerName.includes('cbc') || lowerName.includes('lipid')) return 'Blood Tests';
    if (lowerName.includes('x-ray') || lowerName.includes('mri') || lowerName.includes('ct') || lowerName.includes('scan')) return 'Radiology';
    if (lowerName.includes('thyroid') || lowerName.includes('hormone')) return 'Hormone Tests';
    if (lowerName.includes('urine')) return 'Urine Tests';
    return 'Other';
  };

  const getFileSize = (name) => {
    // Mock file size calculation
    return Math.floor(Math.random() * 5000) + 500 + ' KB';
  };

  const getFileType = (name) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'application/pdf';
    if (['jpg', 'jpeg', 'png'].includes(ext)) return 'image/' + ext;
    return 'application/octet-stream';
  };

  // Enhanced report data with categories and details
  const getReportData = () => {
    if (reports && reports.length > 0) {
      return reports.map(report => ({
        ...report,
        category: report.category || categorizeReport(report.name),
        uploadedAt: report.uploadedAt || new Date().toISOString(),
        size: report.size || getFileSize(report.name),
        type: report.type || getFileType(report.name)
      }));
    }
    
    // Mock comprehensive lab reports
    return [
      {
        id: 'r1',
        name: 'Complete Blood Count (CBC)',
        category: 'Blood Tests',
        date: '2024-12-10',
        doctor: 'Dr. Rajesh Sharma',
        lab: 'PathLab Diagnostics',
        status: 'normal',
        url: '#',
        type: 'application/pdf',
        size: '2.3 MB',
        uploadedAt: '2024-12-10T10:30:00Z',
        results: {
          hemoglobin: { value: '14.2 g/dL', normal: '12.0-15.0 g/dL', status: 'normal' },
          wbc: { value: '7,200/μL', normal: '4,000-10,000/μL', status: 'normal' },
          platelets: { value: '285,000/μL', normal: '150,000-400,000/μL', status: 'normal' }
        },
        summary: 'All blood parameters within normal range'
      },
      {
        id: 'r2',
        name: 'Lipid Profile',
        category: 'Blood Tests',
        date: '2024-12-05',
        doctor: 'Dr. Priya Mehta',
        lab: 'SRL Diagnostics',
        status: 'attention',
        url: '#',
        type: 'application/pdf',
        size: '1.8 MB',
        uploadedAt: '2024-12-05T09:15:00Z',
        results: {
          cholesterol: { value: '220 mg/dL', normal: '<200 mg/dL', status: 'high' },
          ldl: { value: '145 mg/dL', normal: '<100 mg/dL', status: 'high' },
          hdl: { value: '45 mg/dL', normal: '>40 mg/dL', status: 'normal' },
          triglycerides: { value: '165 mg/dL', normal: '<150 mg/dL', status: 'high' }
        },
        summary: 'Cholesterol and triglycerides elevated - dietary modification recommended'
      },
      {
        id: 'r3',
        name: 'Chest X-Ray',
        category: 'Radiology',
        date: '2024-11-28',
        doctor: 'Dr. Amit Singh',
        lab: 'Imaging Center Plus',
        status: 'normal',
        url: '#',
        type: 'image/jpeg',
        size: '4.2 MB',
        uploadedAt: '2024-11-28T14:20:00Z',
        results: {},
        summary: 'Clear lung fields, normal cardiac silhouette'
      },
      {
        id: 'r4',
        name: 'HbA1c (Diabetes)',
        category: 'Blood Tests',
        date: '2024-11-20',
        doctor: 'Dr. Sunita Patel',
        lab: 'Thyrocare',
        status: 'borderline',
        url: '#',
        type: 'application/pdf',
        size: '1.2 MB',
        uploadedAt: '2024-11-20T11:45:00Z',
        results: {
          hba1c: { value: '6.2%', normal: '<5.7%', status: 'borderline' }
        },
        summary: 'Borderline diabetic range - lifestyle modification advised'
      },
      {
        id: 'r5',
        name: 'Thyroid Function Test',
        category: 'Hormone Tests',
        date: '2024-11-15',
        doctor: 'Dr. Vikram Mehta',
        lab: 'Metropolis Healthcare',
        status: 'normal',
        url: '#',
        type: 'application/pdf',
        size: '1.5 MB',
        uploadedAt: '2024-11-15T16:30:00Z',
        results: {
          tsh: { value: '2.1 mIU/L', normal: '0.4-4.0 mIU/L', status: 'normal' },
          t3: { value: '1.2 ng/mL', normal: '0.8-2.0 ng/mL', status: 'normal' },
          t4: { value: '8.5 μg/dL', normal: '5.0-12.0 μg/dL', status: 'normal' }
        },
        summary: 'Thyroid function within normal limits'
      }
    ];
  };

  const allReports = getReportData();

  // Filter reports
  const filteredReports = allReports.filter(report => {
    if (filterType === 'all') return true;
    return report.category.toLowerCase().includes(filterType.toLowerCase()) ||
           report.status === filterType;
  });

  // Sort reports
  const sortedReports = [...filteredReports].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date) - new Date(a.date);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'category':
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });

  const getStatusColor = (status) => {
    const colors = {
      normal: 'bg-green-100 text-green-800 border-green-200',
      attention: 'bg-red-100 text-red-800 border-red-200',
      borderline: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      pending: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      normal: '✅',
      attention: '⚠️',
      borderline: '⚡',
      pending: '⏳'
    };
    return icons[status] || '📊';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Blood Tests': '🩸',
      'Radiology': '📷',
      'Hormone Tests': '⚗️',
      'Urine Tests': '💧',
      'Other': '📋'
    };
    return icons[category] || '📋';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (size) => {
    if (typeof size === 'string') return size;
    if (size > 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    if (size > 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${size} B`;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Lab Reports & Test Results
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage your medical test reports and imaging results
          </p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 lg:mt-0">
          <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {sortedReports.length} Reports
            </span>
          </div>
          
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <span>📤</span>
            <span>Upload Report</span>
          </button>
          
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="flex flex-wrap gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            {[
              { key: 'all', label: 'All Reports' },
              { key: 'Blood Tests', label: 'Blood Tests' },
              { key: 'Radiology', label: 'Radiology' },
              { key: 'Hormone Tests', label: 'Hormone Tests' }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setFilterType(filter.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filterType === filter.key
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
          <option value="category">Sort by Category</option>
        </select>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {sortedReports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white dark:bg-gray-800 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                selectedReport?.id === report.id
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
              }`}
              onClick={() => setSelectedReport(
                selectedReport?.id === report.id ? null : report
              )}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                      <span className="text-xl">{getCategoryIcon(report.category)}</span>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {report.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {report.category}
                        </span>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(report.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                    {getStatusIcon(report.status)} {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Doctor:</span>
                    <span className="font-medium">{report.doctor}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Lab:</span>
                    <span className="font-medium">{report.lab}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">File:</span>
                    <span className="font-medium">{report.type.split('/')[1]?.toUpperCase() || 'PDF'} • {formatFileSize(report.size)}</span>
                  </div>
                </div>

                {report.summary && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Summary:</strong> {report.summary}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <a
                    href={report.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>View Report</span>
                    <span>→</span>
                  </a>
                  
                  <button
                    className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add download functionality here
                    }}
                  >
                    <span>Download</span>
                    <span>↓</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {sortedReports.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No reports found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {filterType === 'all' 
              ? "You haven't uploaded any lab reports yet."
              : `No ${filterType.toLowerCase()} reports found.`}
          </p>
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            <span>📤</span>
            <span>Upload Your First Report</span>
          </button>
        </div>
      )}

      {/* Report Detail Modal */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedReport(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Report Details
                  </h3>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                      <span className="text-2xl">{getCategoryIcon(selectedReport.category)}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                        {selectedReport.name}
                      </h4>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedReport.status)}`}>
                          {getStatusIcon(selectedReport.status)} {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedReport.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Test Date</label>
                      <p className="text-gray-900 dark:text-white">{formatDate(selectedReport.date)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Doctor</label>
                      <p className="text-gray-900 dark:text-white">{selectedReport.doctor}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Laboratory</label>
                      <p className="text-gray-900 dark:text-white">{selectedReport.lab}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">File Type</label>
                      <p className="text-gray-900 dark:text-white">{selectedReport.type.split('/')[1]?.toUpperCase() || 'PDF'} • {formatFileSize(selectedReport.size)}</p>
                    </div>
                  </div>

                  {selectedReport.summary && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Summary</label>
                      <p className="text-gray-900 dark:text-white mt-1">{selectedReport.summary}</p>
                    </div>
                  )}

                  {Object.keys(selectedReport.results || {}).length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 block">Test Results</label>
                      <div className="space-y-2">
                        {Object.entries(selectedReport.results).map(([key, result]) => (
                          <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white capitalize">
                                {key.replace(/([A-Z])/g, ' $1')}:
                              </span>
                              <span className={`ml-2 ${
                                result.status === 'high' ? 'text-red-600' :
                                result.status === 'low' ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {result.value}
                              </span>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Normal: {result.normal}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <a
                      href={selectedReport.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <span>View Full Report</span>
                      <span>→</span>
                    </a>
                    <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors">
                      <span>Download</span>
                      <span>↓</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}