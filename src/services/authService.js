import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

// Helpers
function assertNonEmpty(value, fieldName) {
  if (!value || String(value).trim().length === 0) {
    throw new Error(`${fieldName} is required`);
  }
}

// Generate unique 10-digit patient ID based on Aadhar
function generatePatientId(aadharNumber) {
  // Take last 6 digits of Aadhar + random 4 digits
  const aadharSuffix = aadharNumber.slice(-6);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
  return `${aadharSuffix}${randomSuffix}`;
}

// Check if Patient ID already exists (for uniqueness)
async function isPatientIdUnique(patientId) {
  try {
    const patientMappingRef = doc(db, 'patientMapping', patientId);
    const patientMappingSnap = await getDoc(patientMappingRef);
    return !patientMappingSnap.exists();
  } catch (error) {
    console.error('Error checking patient ID uniqueness:', error);
    return false;
  }
}

// Generate guaranteed unique patient ID
async function generateUniquePatientId(aadharNumber) {
  let patientId;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    patientId = generatePatientId(aadharNumber);
    isUnique = await isPatientIdUnique(patientId);
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Unable to generate unique patient ID. Please try again.');
  }

  return patientId;
}

export async function registerPatient(email, password, profile) {
  assertNonEmpty(email, 'Email');
  assertNonEmpty(password, 'Password');
  assertNonEmpty(profile.aadhar, 'Aadhar Number');
  
  try {
    // Create user account
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;
    
    // Generate unique patient ID
    const patientId = await generateUniquePatientId(profile.aadhar);
    
    // Save patient data with patient ID
    const patientRef = doc(db, 'patients', uid);
    const patientData = {
      uid,
      email,
      patientId,
      personalDetails: {
        name: profile.name,
        dateOfBirth: profile.dateOfBirth,
        aadhar: profile.aadhar,
        phone: profile.phone,
        gender: profile.gender,
        email: email
      },
      medicalHistory: [],
      labReports: [],
      prescriptions: [],
      chronicDiseases: [],
      doctorNotes: [],
      todayEntries: [],
      createdAt: Date.now()
    };
    
    await setDoc(patientRef, patientData);
    
    // Create mapping for patient ID to user UID
    const mappingRef = doc(db, 'patientMapping', patientId);
    await setDoc(mappingRef, {
      uid: uid,
      aadhar: profile.aadhar,
      email: email,
      name: profile.name,
      createdAt: Date.now()
    });
    
    return { uid, patientId, ...profile };
  } catch (error) {
    console.error('Patient registration error:', error);
    throw error;
  }
}

export async function loginPatient(credentials, password) {
  assertNonEmpty(credentials, 'Credentials');
  assertNonEmpty(password, 'Password');
  
  const trimmedCredentials = credentials.trim();
  
  try {
    // Check if credentials is an email
    if (trimmedCredentials.includes('@')) {
      // Login with email
      const cred = await signInWithEmailAndPassword(auth, trimmedCredentials, password);
      const uid = cred.user.uid;
      const ref = doc(db, 'patients', uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        throw new Error('Patient profile not found');
      }
      return { uid, ...snap.data() };
    } else {
      // Login with Patient ID
      return await loginWithPatientId(trimmedCredentials, password);
    }
  } catch (error) {
    console.error('Patient login error:', error);
    throw new Error('Invalid credentials or password');
  }
}

// Login with Patient ID and password
export async function loginWithPatientId(patientId, password) {
  try {
    // Get user UID from patient mapping
    const patientMappingRef = doc(db, 'patientMapping', patientId);
    const patientMappingSnap = await getDoc(patientMappingRef);
    
    if (!patientMappingSnap.exists()) {
      throw new Error('Patient ID not found');
    }
    
    const mappingData = patientMappingSnap.data();
    
    // Sign in with the email and password
    const cred = await signInWithEmailAndPassword(auth, mappingData.email, password);
    const uid = cred.user.uid;
    
    // Verify UID matches
    if (uid !== mappingData.uid) {
      throw new Error('Authentication mismatch');
    }
    
    // Get patient data
    const patientRef = doc(db, 'patients', uid);
    const patientSnap = await getDoc(patientRef);
    
    if (!patientSnap.exists()) {
      throw new Error('Patient data not found');
    }
    
    return {
      uid: uid,
      ...patientSnap.data()
    };
  } catch (error) {
    console.error('Patient ID login error:', error);
    throw new Error('Invalid Patient ID or password');
  }
}

// Login with Patient ID and Aadhar (alternative method)
export async function loginWithPatientIdAndAadhar(patientId, aadhar) {
  try {
    // Get user data from patient mapping
    const patientMappingRef = doc(db, 'patientMapping', patientId);
    const patientMappingSnap = await getDoc(patientMappingRef);
    
    if (!patientMappingSnap.exists()) {
      throw new Error('Patient ID not found');
    }
    
    const mappingData = patientMappingSnap.data();
    
    // Verify Aadhar matches
    if (mappingData.aadhar !== aadhar.trim()) {
      throw new Error('Invalid Patient ID or Aadhar number');
    }
    
    // Get patient data
    const patientRef = doc(db, 'patients', mappingData.uid);
    const patientSnap = await getDoc(patientRef);
    
    if (!patientSnap.exists()) {
      throw new Error('Patient data not found');
    }
    
    return {
      uid: mappingData.uid,
      ...patientSnap.data()
    };
  } catch (error) {
    console.error('Patient login with Aadhar error:', error);
    throw error;
  }
}

export async function logout() {
  await signOut(auth);
}

// Check if Aadhaar is already registered
export async function checkAadhaarAlreadyRegistered(aadharNumber) {
  assertNonEmpty(aadharNumber, 'Aadhaar Number');

  try {
    // Query the patients collection to check if Aadhaar is already registered
    const patientsQuery = query(
      collection(db, 'patients'),
      where('personalDetails.aadhar', '==', aadharNumber.trim())
    );
    
    const querySnapshot = await getDocs(patientsQuery);
    
    if (!querySnapshot.empty) {
      return {
        alreadyRegistered: true,
        message: 'This Aadhaar number is already registered. Please use a different Aadhaar or contact support.'
      };
    }

    return {
      alreadyRegistered: false,
      message: null
    };
  } catch (error) {
    throw new Error('Failed to check Aadhaar registration status. Please try again.');
  }
}

// Aadhaar verification function
export async function verifyAadhaar(aadharNumber, fullName, dateOfBirth) {
  assertNonEmpty(aadharNumber, 'Aadhaar Number');
  assertNonEmpty(fullName, 'Full Name');
  assertNonEmpty(dateOfBirth, 'Date of Birth');

  // Validate Aadhaar format (12 digits)
  if (!/^\d{12}$/.test(aadharNumber.trim())) {
    return {
      valid: false,
      mismatches: { aadharNumber: true, fullName: false, dateOfBirth: false },
      reason: 'Aadhaar number must be exactly 12 digits'
    };
  }

  try {
    // Query the aadharRegistry collection
    const aadharQuery = query(
      collection(db, 'aadharRegistry'),
      where('aadharNumber', '==', aadharNumber.trim())
    );
    const querySnapshot = await getDocs(aadharQuery);

    if (querySnapshot.empty) {
      return {
        valid: false,
        mismatches: { aadharNumber: true, fullName: false, dateOfBirth: false },
        reason: 'Aadhaar number not found'
      };
    }

    const aadharDoc = querySnapshot.docs[0];
    const aadharData = aadharDoc.data();

    const providedName = fullName.trim().toLowerCase();
    const registryName = (aadharData.fullName || '').trim().toLowerCase();
    const nameMatch = registryName === providedName;
    const dobMatch = aadharData.dateOfBirth === dateOfBirth;

    const valid = nameMatch && dobMatch;
    return {
      valid,
      mismatches: {
        aadharNumber: false,
        fullName: !nameMatch,
        dateOfBirth: !dobMatch
      },
      registry: aadharData
    };
  } catch (_) {
    return {
      valid: false,
      mismatches: { aadharNumber: false, fullName: false, dateOfBirth: false },
      reason: 'Failed to verify Aadhaar. Please try again.'
    };
  }
}
// ====== NAYA DOCTOR AUTHENTICATION CODE START ======

// Naya helper function: Check karega ki doctor pehle se registered hai ya nahi
export async function isDoctorAlreadyRegistered(licenseId) {
  const q = query(collection(db, 'doctors'), where('medicalLicenseId', '==', licenseId));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

// Puraane 'registerDoctor' function ko isse replace karein
export async function registerDoctor(email, password, profile) {
  assertNonEmpty(email, 'Email');
  assertNonEmpty(password, 'Password');
  
  // Step 1: Check karein ki is license se koi aur account toh nahi hai
  const alreadyExists = await isDoctorAlreadyRegistered(profile.medicalLicenseId);
  if (alreadyExists) {
    throw new Error('A doctor with this Medical License ID is already registered.');
  }

  // Step 2: Naya Firebase Auth user banayein
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;
  const ref = doc(db, 'doctors', uid);
  
  // Step 3: Doctor ka profile Firestore mein save karein
  // Hum yahan phone aur license ID bhi save kar rahe hain taaki login mein kaam aaye
  await setDoc(ref, { 
    uid, 
    email: email.trim(), 
    name: profile.name,
    dateOfBirth: profile.dateOfBirth,
    aadhar: profile.aadhar,
    medicalLicenseId: profile.medicalLicenseId,
    phone: profile.phone,
    role: 'doctor',
    createdAt: new Date() 
  });
  
  return uid;
}

// Puraane 'loginDoctor' function ko isse replace karein
export async function loginDoctor(credentials, password) {
  assertNonEmpty(credentials, 'Credentials');
  assertNonEmpty(password, 'Password');
  
  const trimmedCredentials = credentials.trim();
  let userEmail = '';

  // Step 1: User ka email pata lagayein
  if (trimmedCredentials.includes('@')) {
    // Agar user ne email daala hai, toh seedhe use karein
    userEmail = trimmedCredentials;
  } else {
    // Agar user ne phone ya license ID daala hai, toh 'doctors' collection se email dhoondein
    const doctorsRef = collection(db, 'doctors');
    
    // Alag-alag fields par query karke dekhein
    const phoneQuery = query(doctorsRef, where('phone', '==', trimmedCredentials));
    const licenseQuery = query(doctorsRef, where('medicalLicenseId', '==', trimmedCredentials));
    
    // Dono query ek saath run karein
    const [phoneSnapshot, licenseSnapshot] = await Promise.all([
      getDocs(phoneQuery),
      getDocs(licenseQuery)
    ]);

    if (!phoneSnapshot.empty) {
      userEmail = phoneSnapshot.docs[0].data().email;
    } else if (!licenseSnapshot.empty) {
      userEmail = licenseSnapshot.docs[0].data().email;
    } else {
      // Agar kuch nahi milta hai, toh error dein
      throw new Error('Doctor with these credentials not found.');
    }
  }

  if (!userEmail) {
    throw new Error('Could not verify your credentials.');
  }

  // Step 2: Asli email aur password se Firebase Auth mein sign in karein
  const cred = await signInWithEmailAndPassword(auth, userEmail, password);
  const uid = cred.user.uid;
  const ref = doc(db, 'doctors', uid);
  const snap = await getDoc(ref);
  
  if (!snap.exists()) {
    throw new Error('Doctor profile not found after login.');
  }
  
  // Login successful hone par poora profile return karein
  return { uid, ...snap.data() };
}

// ====== NAYA DOCTOR AUTHENTICATION CODE END ======