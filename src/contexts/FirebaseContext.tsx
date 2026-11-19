import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  auth,
  SUPER_ADMIN_EMAIL,
  signInWithGooglePopup,
  signOutFirebaseAuth,
} from '../firebase';
import { ensureAdminRoleDocument } from '../utils/firestoreSync';

interface FirebaseContextValue {
  firebaseUser: User | null;
  authReady: boolean;
  isFirebaseAdmin: boolean;
  isSuperAdmin: boolean;
  cloudStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastCloudSyncAt: number | null;
  setCloudStatus: (status: 'idle' | 'syncing' | 'synced' | 'error') => void;
  markCloudSynced: () => void;
  signInWithGoogle: () => Promise<User>;
  signOutFirebase: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [isFirebaseAdmin, setIsFirebaseAdmin] = useState<boolean>(false);
  const [cloudStatus, setCloudStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastCloudSyncAt, setLastCloudSyncAt] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user && user.emailVerified) {
        const adminOk = await ensureAdminRoleDocument(user);
        setIsFirebaseAdmin(adminOk);
      } else {
        setIsFirebaseAdmin(false);
      }
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const user = await signInWithGooglePopup();
    setFirebaseUser(user);
    if (user.emailVerified) {
      const adminOk = await ensureAdminRoleDocument(user);
      setIsFirebaseAdmin(adminOk);
    }
    return user;
  }, []);

  const signOutFirebase = useCallback(async () => {
    await signOutFirebaseAuth();
    setFirebaseUser(null);
    setIsFirebaseAdmin(false);
  }, []);

  const markCloudSynced = useCallback(() => {
    setCloudStatus('synced');
    setLastCloudSyncAt(Date.now());
  }, []);

  const isSuperAdmin = Boolean(
    firebaseUser?.emailVerified &&
      firebaseUser?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
  );

  return (
    <FirebaseContext.Provider
      value={{
        firebaseUser,
        authReady,
        isFirebaseAdmin,
        isSuperAdmin,
        cloudStatus,
        lastCloudSyncAt,
        setCloudStatus,
        markCloudSynced,
        signInWithGoogle,
        signOutFirebase,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export function useFirebase(): FirebaseContextValue {
  const ctx = useContext(FirebaseContext);
  if (!ctx) {
    throw new Error('useFirebase must be used within FirebaseProvider');
  }
  return ctx;
}
