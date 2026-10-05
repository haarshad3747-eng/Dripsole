import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  type User, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../firebase';
import { FIRST_ADMIN_EMAIL } from '../config';
import { seedDatabaseIfNeeded } from '../data/seedProducts';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  adminEmails: string[];
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  addAdmin: (email: string) => Promise<void>;
  removeAdmin: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  adminEmails: [],
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
  addAdmin: async () => {},
  removeAdmin: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Check admin privileges against Firestore 'admins' and config bootstrap
  const checkAdminStatus = async (currentUser: User | null) => {
    if (!currentUser || !currentUser.email) {
      setIsAdmin(false);
      return;
    }

    const email = currentUser.email.toLowerCase();

    // Check if matching FIRST_ADMIN_EMAIL
    if (FIRST_ADMIN_EMAIL && email === FIRST_ADMIN_EMAIL.toLowerCase()) {
      setIsAdmin(true);
      // ensure record in admins & seed database if empty
      try {
        await setDoc(doc(db, 'admins', email), {
          email,
          addedAt: new Date().toISOString(),
          addedBy: 'CONFIG_BOOTSTRAP'
        }, { merge: true });
        await seedDatabaseIfNeeded(db, currentUser);
      } catch (err) {
        // silent catch
      }
      await fetchAdmins();
      return;
    }

    // Check by email or UID in Firestore admins collection
    try {
      const emailDoc = await getDoc(doc(db, 'admins', email));
      const uidDoc = await getDoc(doc(db, 'admins', currentUser.uid));
      
      if (emailDoc.exists() || uidDoc.exists()) {
        setIsAdmin(true);
        await fetchAdmins();
        return;
      }
      setIsAdmin(false);
    } catch (err) {
      console.warn('Error checking admin status:', err);
      setIsAdmin(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const snap = await getDocs(collection(db, 'admins'));
      const emails: string[] = [];
      snap.forEach(d => {
        const data = d.data();
        if (data.email) emails.push(data.email.toLowerCase());
        else if (d.id.includes('@')) emails.push(d.id.toLowerCase());
      });
      if (FIRST_ADMIN_EMAIL && !emails.includes(FIRST_ADMIN_EMAIL.toLowerCase())) {
        emails.push(FIRST_ADMIN_EMAIL.toLowerCase());
      }
      setAdminEmails(Array.from(new Set(emails)));
    } catch (err) {
      // ignore if non-admin doesn't have read access
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await checkAdminStatus(currentUser);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Google Sign In Error:', error);
      if (error?.code !== 'auth/popup-closed-by-user') {
        throw error;
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Sign Out Error:', error);
      throw error;
    }
  };

  const addAdmin = async (email: string) => {
    if (!isAdmin) throw new Error('Unauthorized');
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) throw new Error('Email is required');
    try {
      await setDoc(doc(db, 'admins', cleanEmail), {
        email: cleanEmail,
        addedAt: new Date().toISOString(),
        addedBy: user?.email || 'admin'
      });
      await fetchAdmins();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `admins/${cleanEmail}`);
    }
  };

  const removeAdmin = async (email: string) => {
    if (!isAdmin) throw new Error('Unauthorized');
    const cleanEmail = email.trim().toLowerCase();
    
    // Protection: Can't remove if only one admin left
    if (adminEmails.length <= 1) {
      throw new Error('Cannot remove the last remaining admin.');
    }
    
    // Protection: Can't remove yourself directly to prevent total lockout
    if (user?.email?.toLowerCase() === cleanEmail && adminEmails.length <= 1) {
      throw new Error('You cannot remove yourself if no other admins exist.');
    }

    try {
      await deleteDoc(doc(db, 'admins', cleanEmail));
      await fetchAdmins();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `admins/${cleanEmail}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        adminEmails,
        loading,
        signInWithGoogle,
        logout,
        addAdmin,
        removeAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
