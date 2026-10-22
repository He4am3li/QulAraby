import React from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthProvider';
import { ALL_SCHOOL_MODULE_IDS } from '../config/schoolPlans';

interface SchoolAccessValue {
  loading: boolean;
  isRestricted: boolean;
  enabledModules: string[];
  schoolName: string | null;
  schoolStatus: string | null;
  accessError: string | null;
  canAccess: (moduleId: string) => boolean;
  refreshAccess: () => void;
}

const SchoolAccessContext = React.createContext<SchoolAccessValue | undefined>(undefined);

export const SchoolAccessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, isAuthReady } = useAuth();
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [state, setState] = React.useState<Omit<SchoolAccessValue, 'canAccess' | 'refreshAccess'>>({
    loading: true,
    isRestricted: false,
    enabledModules: ALL_SCHOOL_MODULE_IDS,
    schoolName: null,
    schoolStatus: null,
    accessError: null,
  });

  React.useEffect(() => {
    let active = true;

    const load = async () => {
      if (!isAuthReady) {
        setState((current) => ({ ...current, loading: true }));
        return;
      }

      if (!profile) {
        setState({
          loading: false,
          isRestricted: false,
          enabledModules: ALL_SCHOOL_MODULE_IDS,
          schoolName: null,
          schoolStatus: null,
          accessError: null,
        });
        return;
      }

      if (profile.role === 'admin') {
        setState({
          loading: false,
          isRestricted: false,
          enabledModules: ALL_SCHOOL_MODULE_IDS,
          schoolName: null,
          schoolStatus: 'active',
          accessError: null,
        });
        return;
      }

      const schoolId = profile.schoolId;
      if (!schoolId) {
        const needsSchool = profile.role === 'schoolAdmin';
        setState({
          loading: false,
          isRestricted: needsSchool,
          enabledModules: needsSchool ? [] : ALL_SCHOOL_MODULE_IDS,
          schoolName: null,
          schoolStatus: needsSchool ? 'unassigned' : null,
          accessError: needsSchool ? 'حساب مدير المدرسة غير مرتبط بمدرسة.' : null,
        });
        return;
      }

      try {
        const schoolSnapshot = await getDoc(doc(db, 'schools', schoolId));
        if (!schoolSnapshot.exists()) {
          if (active) setState({
            loading: false,
            isRestricted: true,
            enabledModules: [],
            schoolName: null,
            schoolStatus: 'missing',
            accessError: 'تعذر العثور على بيانات المدرسة المرتبطة بهذا الحساب.',
          });
          return;
        }

        const school = schoolSnapshot.data();
        let includedModules: string[] = Array.isArray(school.enabledModules) ? school.enabledModules : [];
        if (!Array.isArray(school.enabledModules) && school.planId) {
          const planSnapshot = await getDoc(doc(db, 'plans', String(school.planId)));
          includedModules = planSnapshot.exists() && Array.isArray(planSnapshot.data().includedModules)
            ? planSnapshot.data().includedModules
            : [];
        }

        const expiresAt = school.expiresAt?.toDate ? school.expiresAt.toDate() : null;
        const expired = expiresAt ? expiresAt.getTime() < Date.now() : false;
        const activeStatus = school.status === 'active' || school.status === 'trial';
        const permitted = activeStatus && !expired && school.planStatus !== 'inactive';

        if (active) setState({
          loading: false,
          isRestricted: true,
          enabledModules: permitted ? includedModules : [],
          schoolName: typeof school.name === 'string' ? school.name : null,
          schoolStatus: expired ? 'expired' : String(school.status || 'inactive'),
          accessError: !permitted
            ? (expired ? 'انتهت مدة اشتراك المدرسة.' : 'اشتراك المدرسة غير مفعّل حاليًا.')
            : null,
        });
      } catch (error) {
        console.error('Failed to load school subscription:', error);
        if (active) setState({
          loading: false,
          isRestricted: true,
          enabledModules: [],
          schoolName: null,
          schoolStatus: 'unknown',
          accessError: 'تعذر التحقق من اشتراك المدرسة. يرجى التواصل مع مسؤول المنصة.',
        });
      }
    };

    void load();
    return () => { active = false; };
  }, [profile, isAuthReady, refreshKey]);

  const canAccess = React.useCallback(
    (moduleId: string) => !state.isRestricted || state.enabledModules.includes(moduleId),
    [state.isRestricted, state.enabledModules],
  );
  const refreshAccess = React.useCallback(() => setRefreshKey((value) => value + 1), []);

  const value = React.useMemo(
    () => ({ ...state, canAccess, refreshAccess }),
    [state, canAccess, refreshAccess],
  );

  return <SchoolAccessContext.Provider value={value}>{children}</SchoolAccessContext.Provider>;
};

export const useSchoolAccess = () => {
  const context = React.useContext(SchoolAccessContext);
  if (!context) throw new Error('useSchoolAccess must be used within SchoolAccessProvider');
  return context;
};
