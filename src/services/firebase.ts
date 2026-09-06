import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
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

// Initialize Firebase App safely (singleton check across hot reload & dev server)
function getOrCreateFirebaseApp(): FirebaseApp {
  const apps = getApps();
  if (apps.length > 0) {
    return getApp();
  }
  try {
    return initializeApp(firebaseConfig);
  } catch (err) {
    return getApp();
  }
}

const app = getOrCreateFirebaseApp();

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
  return !!db;
}

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

// Local Session & Auth State Management
type AuthCallback = (user: AppUser | null) => void;
const authSubscribers: Set<AuthCallback> = new Set();
let currentAppUser: AppUser | null = null;

function getStoredLocalUser(): AppUser | null {
  try {
    const saved = localStorage.getItem('edgedash_local_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.uid) {
        return parsed as AppUser;
      }
    }
  } catch (e) {
    // Ignore JSON parse errors
  }
  return null;
}

function notifySubscribers(user: AppUser | null) {
  currentAppUser = user;
  authSubscribers.forEach(cb => {
    try {
      cb(user);
    } catch (e) {
      console.warn('Auth subscriber notification notice:', e);
    }
  });
}

// Setup Firebase Auth listener that merges with local sessions
onAuthStateChanged(auth, (fbUser) => {
  if (fbUser) {
    const appUser: AppUser = {
      uid: fbUser.uid,
      email: fbUser.email,
      displayName: fbUser.displayName,
      photoURL: fbUser.photoURL
    };
    notifySubscribers(appUser);
  } else {
    // If no Firebase user, check if we have an active local session
    const localUser = getStoredLocalUser();
    notifySubscribers(localUser);
  }
});

export function loginWithLocalSession(email: string, displayName: string): AppUser {
  const safeEmail = email.trim() || 'user@example.com';
  const safeName = displayName.trim() || safeEmail.split('@')[0];
  const localUser: AppUser = {
    uid: 'user_' + Math.abs(safeEmail.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)).toString(36),
    email: safeEmail,
    displayName: safeName,
    photoURL: null
  };
  localStorage.setItem('edgedash_local_user', JSON.stringify(localUser));
  notifySubscribers(localUser);
  return localUser;
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
  try {
    localStorage.removeItem('edgedash_local_user');
  } catch (e) {
    // Ignore storage issues
  }
  try {
    await signOut(auth);
  } catch (e) {
    // Ignore sign out error
  }
  notifySubscribers(null);
}

export function subscribeToAuth(callback: (user: AppUser | null) => void) {
  authSubscribers.add(callback);
  
  // Call immediately with existing state if available
  const existing = currentAppUser || getStoredLocalUser();
  if (existing) {
    callback(existing);
  } else if (auth.currentUser) {
    callback({
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      displayName: auth.currentUser.displayName,
      photoURL: auth.currentUser.photoURL
    });
  } else {
    // Trigger initial check
    callback(null);
  }

  return () => {
    authSubscribers.delete(callback);
  };
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
