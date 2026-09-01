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
import { Worksheets } from './pages/Worksheets';
import Preparation from './pages/Preparation';
import Quizzes from './pages/Quizzes';
import { StudentMemory } from './pages/StudentMemory';
import { PlacementTest } from './pages/PlacementTest';
import { WhiteboardPage } from './pages/Whiteboard';
import { SplashScreen } from './components/SplashScreen';
import { AuthProvider } from './components/AuthProvider';
import { TeacherToolbar } from './components/TeacherToolbar';
import { StudentToolbar } from './components/StudentToolbar';
import { LiveInteractionLayer } from './components/LiveInteractionLayer';
import { QuotaWarning } from './components/QuotaWarning';
import { Landing } from './pages/Landing';
import { useAuth } from './components/AuthProvider';
import { RoleSwitcher } from './components/RoleSwitcher';

const AppContent: React.FC = () => {
  const location = useLocation();
  const { user, profile, isAuthReady, loading } = useAuth();
  const [splashCompleted, setSplashCompleted] = React.useState(false);
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  // Sync splash state with auth session
  React.useEffect(() => {
    if (!user && isAuthReady) {
      setSplashCompleted(false);
      setIsLoggingIn(false);
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

  // If user is logged in but splash hasn't finished, OR if we just started logging in
  if ((user && !splashCompleted) || isLoggingIn) {
    return (
      <SplashScreen 
        onComplete={() => {
          sessionStorage.setItem('qul_splash_seen', 'true');
          setSplashCompleted(true);
          setIsLoggingIn(false);
        }} 
      />
    );
  }

  // If user is not logged in, show landing
  if (!user) {
    return <Landing onSignInStart={() => setIsLoggingIn(true)} />;
  }

  const isTeacher = profile?.role === 'teacher' || profile?.role === 'admin';
  const isWhiteboard = location.pathname.startsWith('/whiteboard');

  return (
    <div className="animate-app-reveal min-h-screen bg-slate-50">
      <Layout>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/whiteboard" element={<WhiteboardPage />} />
            <Route path="/test" element={<PlacementTest />} />
            <Route path="/letters" element={<Letters />} />
            <Route path="/vocabulary" element={<VocabularyPage />} />
            <Route path="/listening" element={<Listening />} />
            <Route path="/speak" element={<Speak />} />
            <Route path="/reading" element={<Reading />} />
            <Route path="/writing" element={<Writing />} />
            <Route path="/writing/board/:boardId" element={<Writing />} />
            <Route path="/translator" element={<Translator />} />
            <Route path="/assistant" element={<AIStudyMate />} />
            <Route path="/games" element={<Games />} />
            <Route path="/dialects" element={<Dialects />} />
            <Route path="/quizzes" element={<Quizzes />} />
            <Route path="/worksheets" element={<Worksheets />} />
            <Route path="/preparation" element={<Preparation />} />
            <Route path="/memory" element={<StudentMemory />} />
            <Route path="/achievements" element={<Home />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Layout>
      {isWhiteboard && (
        isTeacher ? <TeacherToolbar /> : <StudentToolbar onAction={(action) => console.log('Student action:', action)} />
      )}
      <LiveInteractionLayer />
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

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;