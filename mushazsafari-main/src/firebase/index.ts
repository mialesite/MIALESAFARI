
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

/**
 * Singletons to prevent multiple initializations which cause 
 * "Internal Assertion Failed" errors in Next.js environments.
 */
let app: FirebaseApp;
let firestore: Firestore;
let auth: Auth;
let storage: FirebaseStorage;

export function initializeFirebase() {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  
  if (!firestore) {
    if (typeof window !== 'undefined') {
      // Browser side - enable persistence to save data "directly in the app"
      firestore = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
    } else {
      // Server side - standard firestore
      firestore = getFirestore(app);
    }
  }
  
  if (!auth) auth = getAuth(app);
  if (!storage) storage = getStorage(app);

  return { app, firestore, auth, storage };
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './firestore/use-memo-firebase';
