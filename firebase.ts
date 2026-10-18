import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { initializeFirestore, doc, getDoc, setDoc, collection, query, where, getDocs, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp, setLogLevel } from 'firebase/firestore';

// Set Firestore log level to silent to avoid connection retry warnings
setLogLevel('silent');

// Import the Firebase configuration
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase SDK with forced long-polling to prevent WebChannel stream timeouts
const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// --- Auth Helpers ---

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logout = () => signOut(auth);

// --- Firestore Error Handling ---

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function safeStringify(obj: any): string {
  try {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (typeof Node !== 'undefined' && value instanceof Node) {
          return `[Element: ${value.nodeName}]`;
        }
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    });
  } catch {
    return String(obj);
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  let errorMessage = 'Unknown error';
  let errorCode = '';
  if (error instanceof Error) {
    errorMessage = error.message;
    errorCode = (error as any).code || '';
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object') {
    try {
      errorMessage = (error as any).message || String(error);
      errorCode = (error as any).code || '';
    } catch {
      errorMessage = 'Unserializable error object';
    }
  }

  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };

  const formattedLog = safeStringify(errInfo);
  console.warn('Firestore Operation Status: ', formattedLog);

  // If error indicates offline status or network connection issues, log gracefully
  if (
    errorCode === 'unavailable' ||
    errorCode === 'failed-precondition' ||
    errorMessage.includes('offline') ||
    errorMessage.includes('Could not reach Cloud Firestore') ||
    errorMessage.includes('operation could not be completed')
  ) {
    console.warn(`Firestore ${operationType} on ${path} is operating in offline mode or waiting for backend connection.`);
    return;
  }

  throw new Error(`Firestore ${operationType} failed on ${path}: ${errorMessage}`);
}

export { serverTimestamp };
