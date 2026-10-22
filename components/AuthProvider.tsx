import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, deleteField } from 'firebase/firestore';
import { auth, db, signInWithGoogle, logout } from '../firebase';

export type UserRole = 'admin' | 'schoolAdmin' | 'teacher' | 'student';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  photoURL?: string;
  createdAt?: any;
  schoolId?: string;
  updatedAt?: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAuthReady: boolean;
  loading: boolean;
  isSigningIn: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  updateRole: (role: UserRole, schoolId?: string | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const applyDeveloperPreview = (profile: UserProfile, currentUser: User | null): UserProfile => {
  if (currentUser?.email !== 'he4amali22@gmail.com' || typeof window === 'undefined') return profile;
  const previewRole = localStorage.getItem('qul_dev_preview_role') as UserRole | null;
  const schoolId = localStorage.getItem('qul_dev_preview_school_id');
  if (!previewRole || !['admin', 'schoolAdmin', 'teacher', 'student'].includes(previewRole)) return profile;
  return {
    ...profile,
    role: previewRole,
    ...(previewRole !== 'admin' && schoolId ? { schoolId } : { schoolId: undefined }),
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Handle redirect sign-in result if returning from signInWithRedirect
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("Logged in successfully via redirect:", result.user.email);
        }
      })
      .catch((error) => {
        if (error && error.code !== 'auth/null-user') {
          console.warn('Redirect sign-in notice:', error);
          if (error.code === 'auth/unauthorized-domain') {
            setAuthError('النطاق الحالي غير مضاف في Authorized Domains في Firebase Console.');
          }
        }
      });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setAuthError(null);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(userDocRef);
          
          if (docSnap.exists()) {
            const storedProfile = docSnap.data() as UserProfile;
            setProfile(applyDeveloperPreview(storedProfile, currentUser));
          } else {
            // Determine default role
            const role: UserRole = currentUser.email === 'he4amali22@gmail.com' ? 'admin' : 'student';
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'مستخدم قُل',
              role,
              photoURL: currentUser.photoURL || '',
              createdAt: serverTimestamp(),
            };
            await setDoc(userDocRef, newProfile);
            setProfile(applyDeveloperPreview(newProfile, currentUser));
          }
        } catch (error) {
          console.error('Error fetching or creating user profile:', error);
          // Fallback profile
          setProfile(applyDeveloperPreview({
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'مستخدم قُل',
            role: currentUser.email === 'he4amali22@gmail.com' ? 'admin' : 'student',
            photoURL: currentUser.photoURL || '',
          }, currentUser));
        }
      } else {
        setProfile(null);
      }
      setIsAuthReady(true);
      setLoading(false);
      setIsSigningIn(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      setAuthError(null);
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Sign-in failed:', error);
      let message = 'تعذر تسجيل الدخول، يرجى المحاولة مرة أخرى.';
      if (error?.code === 'auth/unauthorized-domain') {
        message = 'النطاق الحالي (Domain) غير مصرح به في Firebase Console. يرجى إضافته إلى Authorized Domains.';
      } else if (error?.code === 'auth/popup-blocked') {
        message = 'قام المتصفح بحظر النافذة المنبثقة، يرجى السماح بالنوافذ المنبثقة للموقع أو استخدام متصفح قياسي.';
      } else if (error?.code === 'auth/popup-closed-by-user') {
        message = 'تم إغلاق نافذة الدخول قبل إتمامها. يمكنك النقر مجدداً للدخول.';
      } else if (error?.message) {
        message = error.message;
      }
      setAuthError(message);
      setIsSigningIn(false);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await logout();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Sign-out failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (newRole: UserRole, schoolId?: string | null) => {
    if (!user || user.email !== 'he4amali22@gmail.com') {
      throw new Error('Role preview is available only to the platform owner account.');
    }
    // Developer preview is local-only. It must never change the real role stored in Firestore.
    localStorage.setItem('qul_dev_preview_role', newRole);
    if (schoolId) localStorage.setItem('qul_dev_preview_school_id', schoolId);
    else localStorage.removeItem('qul_dev_preview_school_id');
    setProfile(prev => prev ? {
      ...prev,
      role: newRole,
      ...(schoolId ? { schoolId } : { schoolId: undefined }),
    } : null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthReady,
        loading,
        isSigningIn,
        authError,
        clearAuthError: () => setAuthError(null),
        signIn: handleSignIn,
        signOut: handleSignOut,
        updateRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
