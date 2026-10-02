import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalligraphyCardStudio } from '../components/whiteboard/CalligraphyCardStudio';
import { useAuth } from '../components/AuthProvider';

export const Calligraphy: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const studentName = profile?.displayName || user?.displayName || 'خطاط قُل';
  const isTeacher = profile?.role === 'teacher' || profile?.role === 'admin';

  return (
    <div id="qul-calligraphy-page" className="w-full h-full flex flex-col bg-[#0c0a08] overflow-hidden select-none">
      <CalligraphyCardStudio
        studentName={studentName || (isTeacher ? 'أستاذ الخط' : 'خطاط قُل')}
        onCloseStudio={() => navigate('/')}
      />
    </div>
  );
};

export default Calligraphy;
