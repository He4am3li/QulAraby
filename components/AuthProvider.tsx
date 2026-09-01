import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'teacher' | 'student';
  photoURL: string;
  createdAt: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthReady: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  updateRole: (role: 'admin' | 'teacher' | 'student') => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAuthReady: false,
  signIn: async () => {},
  signOut: async () => {},
  updateRole: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile);
          } else {
            // Create new profile
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              // Automatically set owner as admin
              role: firebaseUser.email === 'he4amali22@gmail.com' ? 'admin' : 'student',
              photoURL: firebaseUser.photoURL || '',
              createdAt: serverTimestamp(),
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
          // Ensure profile fallback so application works seamlessly in offline mode
          setProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            role: firebaseUser.email === 'he4amali22@gmail.com' ? 'admin' : 'student',
            photoURL: firebaseUser.photoURL || '',
            createdAt: new Date(),
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    const lang = localStorage.getItem('hub_lang') || 'ar';
    // Add custom parameters if needed, like forcing account selection
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      // Handle the case where the user closes the popup or cancels the flow
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/user-cancelled') {
        console.log('Sign-in was cancelled by the user.');
        return;
      }
      
      // Handle other potential errors
      console.error('Sign in error:', error.code, error.message);
      
      if (error.code === 'auth/network-request-failed') {
        alert(lang === 'ar' 
          ? 'فشل الاتصال بالخادم. يرجى التأكد من اتصالك بالإنترنت وإيقاف أي مانع إعلانات (AdBlocker) قد يكون نشطاً.' 
          : 'Network request failed. Please check your internet connection and disable any AdBlockers that might be blocking Firebase services.');
        return;
      }

      // If it's a configuration error, we might want to alert the user
      if (error.code === 'auth/unauthorized-domain') {
        alert(lang === 'ar' 
          ? 'هذا النطاق غير مصرح به لتسجيل الدخول. يرجى مراجعة إعدادات Firebase.' 
          : 'This domain is not authorized for sign-in. Please check Firebase settings.');
      }
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const updateRole = async (newRole: 'admin' | 'teacher' | 'student') => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { role: newRole }, { merge: true });
      setProfile(prev => prev ? { ...prev, role: newRole } : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAuthReady, signIn, signOut, updateRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
