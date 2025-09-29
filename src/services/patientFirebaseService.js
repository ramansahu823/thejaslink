// src/services/patientFirebaseService.js

import { 
  doc, 
  getDoc,  
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';

// Get patient profile data
export const getPatientProfile = async (patientId) => {
  try {
    const patientDoc = await getDoc(doc(db, 'patients', patientId));
    
    if (!patientDoc.exists()) {
      throw new Error('Patient not found');
    }

    return {
      id: patientDoc.id,
      ...patientDoc.data()
    };
  } catch (error) {
    console.error('Error fetching patient profile:', error);
    throw new Error('Failed to fetch patient data');
  }
};

// Update patient profile
export const updatePatientProfile = async (patientId, updateData) => {
  try {
    const patientRef = doc(db, 'patients', patientId);
    
    await updateDoc(patientRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });

    return { success: true, message: 'Profile updated successfully' };
  } catch (error) {
    console.error('Error updating patient profile:', error);
    throw new Error('Failed to update patient data');
  }
};

// Get patient appointments with enhanced data
export const getPatientAppointments = async (patientId) => {
  try {
    const appointmentsRef = collection(db, 'appointments');
    const q = query(
      appointmentsRef, 
      where('patientId', '==', patientId),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const appointments = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      appointments.push({
        id: doc.id,
        ...data,
        date: data.date?.toDate?.() || new Date(data.date),
        createdAt: data.createdAt?.toDate?.() || new Date()
      });
    });

    return appointments;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
};

// Enhanced patient prescriptions with medication details
export const getPatientPrescriptions = async (patientId) => {
  try {
    const prescriptionsRef = collection(db, 'prescriptions');
    const q = query(
      prescriptionsRef, 
      where('patientId', '==', patientId),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const prescriptions = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      prescriptions.push({
        id: doc.id,
        ...data,
        date: data.date?.toDate?.() || new Date(data.date),
        nextVisit: data.nextVisit?.toDate?.() || (data.nextVisit ? new Date(data.nextVisit) : null),
        createdAt: data.createdAt?.toDate?.() || new Date()
      });
    });

    return prescriptions;
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return [];
  }
};

// Enhanced lab reports with file handling
export const getPatientLabReports = async (patientId) => {
  try {
    const reportsRef = collection(db, 'labReports');
    const q = query(
      reportsRef, 
      where('patientId', '==', patientId),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const reports = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reports.push({
        id: doc.id,
        ...data,
        date: data.date?.toDate?.() || new Date(data.date),
        uploadedAt: data.uploadedAt?.toDate?.() || new Date(),
        createdAt: data.createdAt?.toDate?.() || new Date()
      });
    });

    return reports;
  } catch (error) {
    console.error('Error fetching lab reports:', error);
    return [];
  }
};

// Upload lab report with file storage
export const uploadLabReport = async (file, patientId, reportData) => {
  try {
    // Upload file to Firebase Storage
    const fileExtension = file.name.split('.').pop();
    const fileName = `lab-reports/${patientId}/${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, fileName);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Save report data to Firestore
    const reportsRef = collection(db, 'labReports');
    const docRef = await addDoc(reportsRef, {
      ...reportData,
      patientId: patientId,
      fileName: file.name,
      fileURL: downloadURL,
      filePath: fileName,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: serverTimestamp(),
      date: reportData.date || serverTimestamp()
    });

    return { 
      id: docRef.id, 
      success: true, 
      downloadURL,
      message: 'Lab report uploaded successfully' 
    };
  } catch (error) {
    console.error('Error uploading lab report:', error);
    throw new Error('Failed to upload lab report');
  }
};

// Delete lab report
export const deleteLabReport = async (reportId, filePath) => {
  try {
    // Delete from Firestore
    const reportRef = doc(db, 'labReports', reportId);
    await deleteDoc(reportRef); 
    
    // Delete file from storage if path exists
    if (filePath) {
      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);
    }
    
    return { success: true, message: 'Lab report deleted successfully' };
  } catch (error) {
    console.error('Error deleting lab report:', error);
    throw new Error('Failed to delete lab report');
  }
};

// Get patient vaccinations
export const getPatientVaccinations = async (patientId) => {
  try {
    const vaccinationsRef = collection(db, 'vaccinations');
    const q = query(
      vaccinationsRef, 
      where('patientId', '==', patientId),
      orderBy('vaccinationDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const vaccinations = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      vaccinations.push({
        id: doc.id,
        ...data,
        vaccinationDate: data.vaccinationDate?.toDate?.() || new Date(data.vaccinationDate),
        nextDoseDate: data.nextDoseDate?.toDate?.() || (data.nextDoseDate ? new Date(data.nextDoseDate) : null),
        createdAt: data.createdAt?.toDate?.() || new Date()
      });
    });

    return vaccinations;
  } catch (error) {
    console.error('Error fetching vaccinations:', error);
    return [];
  }
};

// Get doctor notes with enhanced data
export const getDoctorNotes = async (patientId) => {
  try {
    const notesRef = collection(db, 'doctorNotes');
    const q = query(
      notesRef, 
      where('patientId', '==', patientId),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const notes = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      notes.push({
        id: doc.id,
        ...data,
        date: data.date?.toDate?.() || new Date(data.date),
        createdAt: data.createdAt?.toDate?.() || new Date()
      });
    });

    return notes;
  } catch (error) {
    console.error('Error fetching doctor notes:', error);
    return [];
  }
};

// Add new appointment
export const addAppointment = async (patientId, appointmentData) => {
  try {
    const appointmentsRef = collection(db, 'appointments');
    
    const docRef = await addDoc(appointmentsRef, {
      ...appointmentData,
      patientId: patientId,
      status: 'scheduled',
      createdAt: serverTimestamp(),
      date: appointmentData.date || serverTimestamp()
    });

    return { 
      id: docRef.id, 
      success: true, 
      message: 'Appointment scheduled successfully' 
    };
  } catch (error) {
    console.error('Error adding appointment:', error);
    throw new Error('Failed to schedule appointment');
  }
};

// Update appointment status
export const updateAppointmentStatus = async (appointmentId, status) => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    
    await updateDoc(appointmentRef, {
      status: status,
      updatedAt: serverTimestamp()
    });

    return { success: true, message: `Appointment ${status} successfully` };
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw new Error('Failed to update appointment');
  }
};

// Get comprehensive patient data
export const getAllPatientData = async (patientId) => {
  try {
    // First, find the patient's main document using the patientId field
    const patientProfile = await findPatientByPatientId(patientId);
    if (!patientProfile) {
      throw new Error("Patient profile could not be found with the given ID.");
    }
    
    // Now use the actual document ID (UID) to fetch sub-collections
    const patientDocId = patientProfile.id;

    const [
      appointments, 
      prescriptions,
      labReports,
      vaccinations,
      doctorNotes
    ] = await Promise.all([
      getPatientAppointments(patientDocId), // Use the actual document ID
      getPatientPrescriptions(patientDocId), // Use the actual document ID
      getPatientLabReports(patientDocId), // Use the actual document ID
      getPatientVaccinations(patientDocId), // Use the actual document ID
      getDoctorNotes(patientDocId) // Use the actual document ID
    ]);

    return {
      profile: patientProfile,
      appointments,
      prescriptions,
      labReports,
      vaccinations,
      doctorNotes
    };
  } catch (error) {
    console.error('Error fetching all patient data:', error);
    throw new Error('Failed to fetch comprehensive patient data');
  }
};

// Search patients with enhanced search
export const searchPatients = async (searchTerm) => {
  try {
    const patientsRef = collection(db, 'patients');
    
    const nameQuery = query(
      patientsRef,
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff')
    );
    const idQuery = query(patientsRef, where('patientId', '==', searchTerm));
    const phoneQuery = query(patientsRef, where('phone', '==', searchTerm));
    const emailQuery = query(patientsRef, where('email', '==', searchTerm));

    const queries = [nameQuery, idQuery, phoneQuery, emailQuery];
    const results = new Map();

    for (const q of queries) {
      try {
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (!results.has(doc.id)) {
            results.set(doc.id, {
              id: doc.id,
              ...data
            });
          }
        });
      } catch (error) {
        console.warn('Query failed:', error);
      }
    }
    return Array.from(results.values());
  } catch (error) {
    console.error('Error searching patients:', error);
    return [];
  }
};

// Add new prescription
export const addPrescription = async (patientId, prescriptionData) => {
  try {
    const prescriptionsRef = collection(db, 'prescriptions');
    const docRef = await addDoc(prescriptionsRef, {
      ...prescriptionData,
      patientId: patientId,
      status: 'active',
      createdAt: serverTimestamp(),
      date: prescriptionData.date || serverTimestamp()
    });

    return { 
      id: docRef.id, 
      success: true, 
      message: 'Prescription added successfully' 
    };
  } catch (error) {
    console.error('Error adding prescription:', error);
    throw new Error('Failed to add prescription');
  }
};

// Update prescription
export const updatePrescription = async (prescriptionId, updateData) => {
  try {
    const prescriptionRef = doc(db, 'prescriptions', prescriptionId);
    
    await updateDoc(prescriptionRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });

    return { success: true, message: 'Prescription updated successfully' };
  } catch (error) {
    console.error('Error updating prescription:', error);
    throw new Error('Failed to update prescription');
  }
};

// =========== YEH NAYA FUNCTION HAI SEARCH KO THEEK KARNE KE LIYE ============
// Isse aapka doctor dashboard patient ko uske 10-digit ID se dhoondh payega.
// patientFirebaseService.js में ये नया function add करें
export const findPatientByPatientId = async (patientId) => {
  try {
    // Pehle patientMapping collection mein search karein
    const mappingRef = doc(db, 'patientMapping', patientId);
    const mappingSnap = await getDoc(mappingRef);
    
    if (!mappingSnap.exists()) {
      throw new Error('Patient not found');
    }
    
    const mappingData = mappingSnap.data();
    const patientUid = mappingData.uid;
    
    // Ab actual patient data fetch karein
    const patientRef = doc(db, 'patients', patientUid);
    const patientSnap = await getDoc(patientRef);
    
    if (!patientSnap.exists()) {
      throw new Error('Patient data not found');
    }
    
    return { 
      id: patientUid, 
      ...patientSnap.data(),
      patientId: patientId // Ensure patientId is included
    };
  } catch (error) {
    console.error('Error finding patient by Patient ID:', error);
    throw error;
  }
};