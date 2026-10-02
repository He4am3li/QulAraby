import React from 'react';
import { useAuth } from './AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCog, ShieldCheck, GraduationCap, UserCircle } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { user, profile, updateRole } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  // Only allow specifically the main user or current admins to switch roles for testing
  if (user?.email !== 'he4amali22@gmail.com' && profile?.role !== 'admin') {
    return <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{profile?.role}</span>;
  }

  const roles = [
    { id: 'admin', label: 'Admin', labelAr: 'آدمن', icon: ShieldCheck, color: 'bg-red-500' },
    { id: 'teacher', label: 'Teacher', labelAr: 'معلم', icon: GraduationCap, color: 'bg-blue-500' },
    { id: 'student', label: 'Student', labelAr: 'طالب', icon: UserCircle, color: 'bg-emerald-500' },
  ] as const;

  const isAr = typeof window !== 'undefined' && localStorage.getItem('hub_lang') === 'ar';

  return (
    <div className="relative inline-block">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 cursor-pointer group bg-slate-800/80 hover:bg-slate-800 px-2 py-0.5 rounded-full border border-white/20 transition-all"
      >
        <span className="text-[9px] font-black text-white uppercase tracking-widest leading-none">
          {profile?.role || 'Guest'}
        </span>
        <UserCog size={8} className="text-emerald-400 opacity-80 group-hover:opacity-100" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: isAr ? -20 : 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: isAr ? -20 : 20, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className={`absolute top-1/2 -translate-y-1/2 bg-slate-800 border-2 border-slate-400 rounded-xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.6)] min-w-[130px] z-[10000] ${
              isAr ? 'left-full ml-2' : 'right-full mr-2'
            }`}
          >
            <div className="px-2 py-1 mb-1 border-b border-white/10 flex items-center justify-between">
              <p className="text-[7px] font-black text-white/60 uppercase tracking-widest">Select Role</p>
              <UserCog size={8} className="text-emerald-400 opacity-50" />
            </div>
            <div className="space-y-0.5">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => {
                    updateRole(role.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-all ${
                    profile?.role === role.id 
                      ? 'bg-emerald-600 text-white shadow-lg' 
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <role.icon size={11} className={profile?.role === role.id ? 'text-white' : 'text-emerald-400'} />
                    <span className="text-[10px] font-bold">{role.label}</span>
                  </div>
                  {profile?.role === role.id && (
                    <div className="w-1 h-1 rounded-full bg-white" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
