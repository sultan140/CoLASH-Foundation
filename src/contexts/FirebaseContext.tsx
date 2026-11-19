import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  auth,
  isSuperAdminEmail,
  signInWithGooglePopup,
  signOutFirebaseAuth,
  testConnection,
} from '../firebase';
import {
  ensureAdminRoleDocument,
  fetchCloudInventorySummary,
  type FirestoreCloudInventory,
} from '../utils/firestoreSync';

interface FirebaseContextValue {
  firebaseUser: User | null;
  authReady: boolean;
  firebaseConnected: boolean | null;
  isFirebaseAdmin: boolean;
  isSuperAdmin: boolean;
  cloudStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastCloudSyncAt: number | null;
  cloudInventory: FirestoreCloudInventory | null;
  refreshCloudInventory: (includeVaultOverride?: boolean) => Promise<FirestoreCloudInventory>;
  reconnectFirebase: () => Promise<boolean>;
  setCloudStatus: (status: 'idle' | 'syncing' | 'synced' | 'error') => void;
  markCloudSynced: () => void;
  signInWithGoogle: () => Promise<User>;
  signOutFirebase: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean | null>(null);
  const [isFirebaseAdmin, setIsFirebaseAdmin] = useState<boolean>(false);
  const [cloudStatus, setCloudStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastCloudSyncAt, setLastCloudSyncAt] = useState<number | null>(null);
  const [cloudInventory, setCloudInventory] = useState<FirestoreCloudInventory | null>(null);

  const refreshCloudInventory = useCallback(
    async (includeVaultOverride?: boolean) => {
      const includeVault =
        includeVaultOverride !== undefined ? includeVaultOverride : isFirebaseAdmin;
      const summary = await fetchCloudInventorySummary(includeVault);
      setCloudInventory(summary);
      return summary;
    },
    [isFirebaseAdmin]
  );

  const reconnectFirebase = useCallback(async () => {
    const ok = await testConnection();
    setFirebaseConnected(ok);
    const current = auth.currentUser;
    if (current && current.emailVerified) {
      const adminOk = await ensureAdminRoleDocument(current);
      setIsFirebaseAdmin(adminOk);
      await refreshCloudInventory(adminOk);
    } else {
      await refreshCloudInventory(false);
    }
    return ok;
  }, [refreshCloudInventory]);

  useEffect(() => {
    void testConnection().then(setFirebaseConnected);
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
    const ok = await testConnection();
    setFirebaseConnected(ok);
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
    firebaseUser?.emailVerified && isSuperAdminEmail(firebaseUser?.email)
  );

  return (
    <FirebaseContext.Provider
      value={{
        firebaseUser,
        authReady,
        firebaseConnected,
        isFirebaseAdmin,
        isSuperAdmin,
        cloudStatus,
        lastCloudSyncAt,
        cloudInventory,
        refreshCloudInventory,
        reconnectFirebase,
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
