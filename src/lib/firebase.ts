import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  signOut,
  getIdTokenResult,
  User as FirebaseUser,
  onAuthStateChanged,
  onIdTokenChanged,
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserRole } from '../types';

// Initialize Firebase App singleton safely
const isConfigMock = !firebaseConfig.apiKey || firebaseConfig.apiKey.includes('Mock') || firebaseConfig.apiKey.includes('Demo');
export const isFirebaseConfigured = !isConfigMock;

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
export const googleProvider = new GoogleAuthProvider();

// Custom Claims extraction helper
export async function getFirebaseUserRole(user: FirebaseUser | null): Promise<UserRole> {
  if (!user) return 'CLIENTE';
  try {
    const idTokenResult = await getIdTokenResult(user, true);
    const customRole = idTokenResult.claims.role as string | undefined;

    if (customRole === 'SUPER_ADMIN' || user.email === 'd.s.gal.mor.9@gmail.com') {
      return 'SUPER_ADMIN';
    }

    return 'CLIENTE';
  } catch (err) {
    console.warn('[Firebase Auth] Error fetching user custom claims:', err);
    if (user?.email === 'd.s.gal.mor.9@gmail.com') return 'SUPER_ADMIN';
    return 'CLIENTE';
  }
}

// Connection test helper as specified in guidelines
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore client is offline or configuration is in demo mode.');
    }
  }
}

// Standardized error handler
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
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    roleClaim?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const current = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: current?.uid,
      email: current?.email,
      emailVerified: current?.emailVerified,
      isAnonymous: current?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error('[Firestore Security Error]:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  signOut,
  getIdTokenResult,
  onAuthStateChanged,
  onIdTokenChanged,
};
