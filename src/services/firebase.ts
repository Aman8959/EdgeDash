import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocFromServer,
  collection, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { CandidateProfile, Config, JobListing } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with configured database ID
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Test connection on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection notice: client is offline or starting up.');
      return false;
    }
    // Expected to fail if doc doesn't exist or unauthenticated for test doc, but connection is reached
    return true;
  }
}

// Auth Actions
export async function signInWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  // Initialize or update user profile document in Firestore
  await syncUserProfile(user);
  return user;
}

export async function registerWithEmail(email: string, pass: string, fullName: string): Promise<FirebaseUser> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  const user = cred.user;
  if (fullName) {
    await updateProfile(user, { displayName: fullName });
  }
  await syncUserProfile(user, fullName);
  return user;
}

export async function loginWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  await syncUserProfile(cred.user);
  return cred.user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// User Metadata Sync
async function syncUserProfile(user: FirebaseUser, overrideName?: string) {
  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    const now = new Date().toISOString();
    
    if (!snap.exists()) {
      await setDoc(userRef, {
        email: user.email || '',
        displayName: overrideName || user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL || '',
        createdAt: now,
        lastLoginAt: now
      });
    } else {
      await setDoc(userRef, {
        lastLoginAt: now,
        displayName: overrideName || user.displayName || snap.data()?.displayName || 'User',
        photoURL: user.photoURL || snap.data()?.photoURL || ''
      }, { merge: true });
    }
  } catch (e) {
    console.warn('Sync user profile notice:', e);
  }
}

// Firestore Candidate Profile Persistence
export async function saveCandidateProfileToFirestore(userId: string, profile: CandidateProfile) {
  try {
    const ref = doc(db, 'users', userId, 'data', 'candidate');
    await setDoc(ref, {
      candidate: profile,
      updatedAt: new Date().toISOString()
    });
  } catch (e) {
    console.warn('Error saving candidate profile to Firestore:', e);
  }
}

export async function loadCandidateProfileFromFirestore(userId: string): Promise<CandidateProfile | null> {
  try {
    const ref = doc(db, 'users', userId, 'data', 'candidate');
    const snap = await getDoc(ref);
    if (snap.exists() && snap.data()?.candidate) {
      return snap.data().candidate as CandidateProfile;
    }
  } catch (e) {
    console.warn('Error loading candidate profile from Firestore:', e);
  }
  return null;
}

// Firestore User Config Persistence
export async function saveConfigToFirestore(userId: string, config: Config) {
  try {
    const ref = doc(db, 'users', userId, 'data', 'config');
    await setDoc(ref, {
      config,
      updatedAt: new Date().toISOString()
    });
  } catch (e) {
    console.warn('Error saving config to Firestore:', e);
  }
}

export async function loadConfigFromFirestore(userId: string): Promise<Config | null> {
  try {
    const ref = doc(db, 'users', userId, 'data', 'config');
    const snap = await getDoc(ref);
    if (snap.exists() && snap.data()?.config) {
      return snap.data().config as Config;
    }
  } catch (e) {
    console.warn('Error loading config from Firestore:', e);
  }
  return null;
}

// Application Tracking Persistence
export async function recordApplicationInFirestore(userId: string, job: JobListing, method: string, appRef?: string) {
  try {
    const appId = `app-${job.id.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    const ref = doc(db, 'users', userId, 'applications', appId);
    await setDoc(ref, {
      id: appId,
      jobId: job.id,
      company: job.company,
      title: job.title,
      location: job.location,
      status: 'applied',
      appliedAt: new Date().toISOString(),
      applicationRef: appRef || `APP-${Date.now()}`,
      method: method || 'direct_in_app',
      fitScore: job.fit_score || 0
    });
  } catch (e) {
    console.warn('Error recording application to Firestore:', e);
  }
}
