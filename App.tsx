import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Translator } from './pages/Translator';
import { VocabularyPage } from './pages/Vocabulary';
import { AIStudyMate } from './pages/AIStudyMate';
import { Reading } from './pages/Reading';
import { Letters } from './pages/Letters';
import { Speak } from './pages/Speak';
import { Listening } from './pages/Listening';
import { Writing } from './pages/Writing';
import { Games } from './pages/Games';
import { Dialects } from './pages/Dialects';
import { VoiceLab } from './pages/VoiceLab';
import { Worksheets } from './pages/Worksheets';
import Preparation from './pages/Preparation';
import Quizzes from './pages/Quizzes';
import { StudentMemory } from './pages/StudentMemory';
import { PlacementTest } from './pages/PlacementTest';
import { WhiteboardPage } from './pages/Whiteboard';
import { Calligraphy } from './pages/Calligraphy';
import { SplashScreen } from './components/SplashScreen';
import { AuthProvider } from './components/AuthProvider';
import { TeacherToolbar } from './components/TeacherToolbar';
import { StudentToolbar } from './components/StudentToolbar';
import { LiveInteractionLayer } from './components/LiveInteractionLayer';
import { LiveClassroomProvider, useLiveClassroom } from './components/LiveClassroomContext';
import { QuotaWarning } from './components/QuotaWarning';
import { Landing } from './pages/Landing';
import { useAuth } from './components/AuthProvider';
import { RoleSwitcher } from './components/RoleSwitcher';
import { SchoolAccessProvider } from './components/SchoolAccessProvider';
import { FeatureGate } from './components/FeatureGate';
import { AdminConsole } from './pages/AdminConsole';
import { SchoolDashboard } from './pages/SchoolDashboard';

const AppContent: React.FC = () => {
  const location = useLocation();
  const { user, profile, isAuthReady, loading, signOut } = useAuth();
  const [splashCompleted, setSplashCompleted] = React.useState(false);

  // Sync splash state with auth session
  React.useEffect(() => {
    if (!user && isAuthReady) {
      setSplashCompleted(false);
      sessionStorage.removeItem('qul_splash_seen');
    } else if (user) {
      const seen = sessionStorage.getItem('qul_splash_seen') === 'true';
      setSplashCompleted(seen);
    }
  }, [user, isAuthReady]);

  if (!isAuthReady || loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // A Google sign-in is not an invitation. Block every unapproved account,
  // including legacy users whose profile has no approval field.
  const isPlatformOwner = user?.email === 'he4amali22@gmail.com';
  if (user && (!user.emailVerified || (!isPlatformOwner && profile?.approved !== true))) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-slate-950 p-6 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/15 bg-white/5 p-8 text-center shadow-2xl">
          <img src="/Logo.png" alt="شعار قُل" className="mx-auto mb-6 h-16 w-16 rounded-2xl object-cover" />
          <h1 className="mb-3 text-2xl font-black">الحساب بانتظار اعتماد الإدارة</h1>
          <p className="mb-5 text-sm leading-7 text-slate-300">
            تسجيل الدخول بحساب Google لا يمنح تصريحًا لاستخدام منصة قُل.
            يرجى التواصل مع مسؤول المنصة لاعتماد حسابك.
          </p>
          <div className="mb-5 break-all rounded-xl bg-black/25 px-3 py-3 text-xs text-slate-300">{user.email}</div>
          <button onClick={() => window.location.reload()} className="me-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-bold">التحقق من الاعتماد</button>
          <button onClick={() => void signOut()} className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900">تسجيل الخروج</button>
        </div>
      </div>
    );
  }

  // If user is logged in but splash hasn't finished, show cinematic splash once
  if (user && !splashCompleted) {
    return (
      <SplashScreen 
        onComplete={() => {
          sessionStorage.setItem('qul_splash_seen', 'true');
          setSplashCompleted(true);
        }} 
      />
    );
  }

  // If user is not logged in, show landing
  if (!user) {
    return <Landing />;
  }

  const isTeacher = profile?.role === 'teacher' || profile?.role === 'admin';
  const isWhiteboard = location.pathname.startsWith('/whiteboard');

  return (
    <div className="animate-app-reveal min-h-screen bg-slate-50">
      <LiveClassroomProvider>
      <Layout>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={profile?.role === 'admin' ? <AdminConsole /> : profile?.role === 'schoolAdmin' ? <SchoolDashboard /> : <Home />} />
            <Route path="/admin" element={profile?.role === 'admin' ? <AdminConsole /> : <Navigate to="/" replace />} />
            <Route path="/school" element={profile?.role === 'schoolAdmin' ? <SchoolDashboard /> : <Navigate to="/" replace />} />
            <Route path="/whiteboard" element={<FeatureGate moduleId="whiteboard"><WhiteboardPage /></FeatureGate>} />
            <Route path="/calligraphy" element={<FeatureGate moduleId="calligraphy"><Calligraphy /></FeatureGate>} />
            <Route path="/test" element={<FeatureGate moduleId="placement"><PlacementTest /></FeatureGate>} />
            <Route path="/letters" element={<FeatureGate moduleId="letters"><Letters /></FeatureGate>} />
            <Route path="/vocabulary" element={<FeatureGate moduleId="vocabulary"><VocabularyPage /></FeatureGate>} />
            <Route path="/listening" element={<FeatureGate moduleId="listening"><Listening /></FeatureGate>} />
            <Route path="/speak" element={<FeatureGate moduleId="speaking"><Speak /></FeatureGate>} />
            <Route path="/reading" element={<FeatureGate moduleId="reading"><Reading /></FeatureGate>} />
            <Route path="/writing" element={<FeatureGate moduleId="writing"><Writing /></FeatureGate>} />
            <Route path="/writing/board/:boardId" element={<FeatureGate moduleId="writing"><Writing /></FeatureGate>} />
            <Route path="/translator" element={<FeatureGate moduleId="translator"><Translator /></FeatureGate>} />
            <Route path="/assistant" element={<FeatureGate moduleId="grammar"><AIStudyMate /></FeatureGate>} />
            <Route path="/games" element={<FeatureGate moduleId="games"><Games /></FeatureGate>} />
            <Route path="/dialects" element={<FeatureGate moduleId="dialects"><Dialects /></FeatureGate>} />
            <Route path="/voice-lab" element={isTeacher ? <VoiceLab /> : <Navigate to="/" replace />} />
            <Route path="/quizzes" element={<FeatureGate moduleId="quizzes"><Quizzes /></FeatureGate>} />
            <Route path="/worksheets" element={<FeatureGate moduleId="worksheets"><Worksheets /></FeatureGate>} />
            <Route path="/preparation" element={<FeatureGate moduleId="preparation"><Preparation /></FeatureGate>} />
            <Route path="/memory" element={<FeatureGate moduleId="memory"><StudentMemory /></FeatureGate>} />
            <Route path="/achievements" element={<FeatureGate moduleId="achievements"><Home /></FeatureGate>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Layout>
      {isWhiteboard && (
        isTeacher ? <ScopedTeacherToolbar /> : <StudentToolbar onAction={(action) => console.log('Student action:', action)} />
      )}
      {isWhiteboard && <ScopedLiveInteractionLayer />}
      </LiveClassroomProvider>
      <QuotaWarning />

      <style>{`
        @keyframes app-reveal {
          0% { 
            opacity: 0; 
            transform: scale(1.05);
            filter: blur(10px);
          }
          100% { 
            opacity: 1; 
            transform: scale(1);
            filter: blur(0);
          }
        }
        .animate-app-reveal {
          animation: app-reveal 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
    </div>
  );
};

const ScopedTeacherToolbar: React.FC = () => {
  const { sessionId } = useLiveClassroom();
  return sessionId ? <TeacherToolbar /> : null;
};
const ScopedLiveInteractionLayer: React.FC = () => {
  const { sessionId } = useLiveClassroom();
  return sessionId ? <LiveInteractionLayer /> : null;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <SchoolAccessProvider>
          <AppContent />
        </SchoolAccessProvider>
      </Router>
    </AuthProvider>
  );
};

export default App;