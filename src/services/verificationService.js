import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Check if Aadhaar exists in verified doctors collection
export const isAadharValid = async (aadhar) => {
  try {
    const q = query(
      collection(db, 'verifiedDoctors'),
      where('aadhar', '==', aadhar)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking Aadhaar:', error);
    return false;
  }
};

// Check if License ID exists in verified doctors collection
export const isLicenseValid = async (licenseId) => {
  try {
    const q = query(
      collection(db, 'verifiedDoctors'),
      where('licenseId', '==', licenseId)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking License:', error);
    return false;
  }
};

// Full verification of doctor credentials
export const verifyDoctorFull = async ({ aadhar, licenseId, dob }) => {
  try {
    const q = query(
      collection(db, 'verifiedDoctors'),
      where('aadhar', '==', aadhar),
      where('licenseId', '==', licenseId),
      where('dob', '==', dob)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error verifying doctor:', error);
    return false;
  }
};