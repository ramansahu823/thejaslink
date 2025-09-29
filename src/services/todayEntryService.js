// src/services/todayEntryService.js
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy,
  doc,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// Add today's entry
export const addTodayEntry = async (entryData) => {
  try {
    const todayEntriesRef = collection(db, 'todayEntries');
    
    const docRef = await addDoc(todayEntriesRef, {
      ...entryData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Also update the patient's record with last visit info
    await updatePatientLastVisit(entryData.patientId, entryData.date);

    return { 
      id: docRef.id, 
      success: true, 
      message: 'Today\'s entry saved successfully' 
    };
  } catch (error) {
    console.error('Error saving today entry:', error);
    throw new Error('Failed to save today\'s entry: ' + error.message);
  }
};

// Get all today entries for a patient
export const getPatientTodayEntries = async (patientId) => {
  try {
    const todayEntriesRef = collection(db, 'todayEntries');
    const q = query(
      todayEntriesRef, 
      where('patientId', '==', patientId),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const entries = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      entries.push({
        id: doc.id,
        ...data,
        date: data.date,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date()
      });
    });

    return entries;
  } catch (error) {
    console.error('Error fetching today entries:', error);
    return [];
  }
};

// Get today's entry by date
export const getTodayEntryByDate = async (patientId, date) => {
  try {
    const todayEntriesRef = collection(db, 'todayEntries');
    const q = query(
      todayEntriesRef, 
      where('patientId', '==', patientId),
      where('date', '==', date)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      ...data,
      date: data.date,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date()
    };
  } catch (error) {
    console.error('Error fetching today entry by date:', error);
    return null;
  }
};

// Update patient's last visit date
const updatePatientLastVisit = async (patientId, visitDate) => {
  try {
    const patientRef = doc(db, 'patients', patientId);
    await updateDoc(patientRef, {
      lastVisit: visitDate,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating patient last visit:', error);
    // Don't throw error for this as it's secondary
  }
};

// Update an existing today entry
export const updateTodayEntry = async (entryId, updateData) => {
  try {
    const entryRef = doc(db, 'todayEntries', entryId);
    
    await updateDoc(entryRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });

    return { success: true, message: 'Entry updated successfully' };
  } catch (error) {
    console.error('Error updating today entry:', error);
    throw new Error('Failed to update entry: ' + error.message);
  }
};