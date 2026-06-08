import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Settings, Share2, Trash2, Edit3, 
  ExternalLink, Users, Layout, Type, Palette,
  CheckCircle2, Copy, Send, Clock, ChevronRight,
  Sparkles, MessageCircle, Heart, ShieldCheck, X, Globe,
  Image as ImageIcon, File as FileIcon, Monitor, Smartphone, Eye, Upload
} from 'lucide-react';
import { 
  collection, query, where, orderBy, onSnapshot, 
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from './AuthProvider';

interface Board {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  settings: {
    background: string;
    bgImage?: string;
    fontFamily: string;
    fontSize: string;
    fontColor: string;
    layout: 'grid' | 'stream' | 'columns' | 'masonry' | 'canvas';
  };
  template: 'brainstorm' | 'debate' | 'story' | 'custom' | 'gallery';
  isPublic: boolean;
  requireApproval: boolean;
  isActive: boolean;
  questionFileUrl?: string;
  targetClasses?: string[];
  createdAt: any;
}

interface BoardManagementProps {
  lang: 'ar' | 'en';
  onSelectBoard: (boardId: string) => void;
}

export const BoardManagement: React.FC<BoardManagementProps> = ({ lang, onSelectBoard }) => {
  const { user, profile } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState<Board['template']>('custom');
  const [isPublic, setIsPublic] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);
  const [bg, setBg] = useState('bg-slate-50');
  const [bgImage, setBgImage] = useState<string | undefined>(undefined);
  const [fontFamily, setFontFamily] = useState('font-tajawal');
  const [layout, setLayout] = useState<Board['settings']['layout']>('grid');
  const [questionFileUrl, setQuestionFileUrl] = useState<string | undefined>(undefined);
  const [targetClasses, setTargetClasses] = useState<string[]>([]);
  const [newClass, setNewClass] = useState('');

  const isTeacher = profile?.role === 'teacher' || profile?.role === 'admin';

  useEffect(() => {
    if (!user) return;

    let q;
    if (isTeacher) {
      q = query(
        collection(db, 'writing_boards'),
        where('teacherId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
    } else {
      // For students, show public boards
      // In a real app, we'd also show boards assigned to them
      q = query(
        collection(db, 'writing_boards'),
        where('isPublic', '==', true),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const boardsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Board[];
      setBoards(boardsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'writing_boards');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isTeacher]);

  const handleSaveBoard = async () => {
    if (!title.trim() || !user) return;

    const boardData = {
      title,
      description,
      teacherId: user.uid,
      template,
      isPublic,
      requireApproval,
      isActive: true,
      questionFileUrl: questionFileUrl || null,
      targetClasses,
      settings: {
        background: bg,
        bgImage: bgImage || null,
        fontFamily,
        fontSize: 'text-base',
        fontColor: 'text-slate-800',
        layout
      },
      updatedAt: serverTimestamp()
    };

    try {
      if (editingBoard) {
        await updateDoc(doc(db, 'writing_boards', editingBoard.id), boardData);
      } else {
        await addDoc(collection(db, 'writing_boards'), {
          ...boardData,
          createdAt: serverTimestamp()
        });
      }
      resetForm();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'writing_boards');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTemplate('custom');
    setIsPublic(true);
    setRequireApproval(false);
    setBg('bg-slate-50');
    setBgImage(undefined);
    setFontFamily('font-tajawal');
    setLayout('grid');
    setQuestionFileUrl(undefined);
    setTargetClasses([]);
    setEditingBoard(null);
    setShowEditor(false);
  };

  const handleEdit = (board: Board) => {
    setEditingBoard(board);
    setTitle(board.title);
    setDescription(board.description);
    setTemplate(board.template);
    setIsPublic(board.isPublic);
    setRequireApproval(board.requireApproval);
    setBg(board.settings.background);
    setBgImage(board.settings.bgImage);
    setFontFamily(board.settings.fontFamily);
    setLayout(board.settings.layout);
    setQuestionFileUrl(board.questionFileUrl);
    setTargetClasses(board.targetClasses || []);
    setShowEditor(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'bg' | 'question') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (type === 'bg') setBgImage(base64String);
      else setQuestionFileUrl(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا المشروع؟' : 'Are you sure you want to delete this project?')) return;
    try {
      await deleteDoc(doc(db, 'writing_boards', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `writing_boards/${id}`);
    }
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/#/writing/board/${id}`;
    navigator.clipboard.writeText(url);
    setCopySuccess(id);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const STRINGS = {
    ar: {
      title: isTeacher ? 'إدارة مساحات التفاعل' : 'مساحات التفاعل المتاحة',
      newProject: 'مساحة إبداعية جديدة',
      editProject: 'تعديل المشروع',
      placeholderTitle: 'عنوان المساحة (مثلاً: وصف رحلة)',
      placeholderDesc: 'السؤال أو المهمة المطلوبة من الطلاب...',
      settings: 'إعدادات اللوحة',
      template: 'اختر قالبًا',
      public: 'متاح برابط خارجي',
      approval: 'يتطلب موافقة المعلم قبل النشر',
      bg: 'لون الخلفية',
      layout: 'طريقة العرض',
      save: 'حفظ',
      cancel: 'إلغاء',
      empty: isTeacher ? 'لم تقم بإنشاء أي مساحات بعد.' : 'لا توجد مساحات متاحة حالياً.',
      copyLink: 'شارك الرابط عبر',
      copied: 'تم النسخ!',
      open: 'فتح',
      templates: {
        brainstorm: 'عصف ذهني',
        debate: 'مناظرة',
        story: 'قصة تعاونية',
        custom: 'مخصص',
        gallery: 'معرض إبداعي'
      }
    },
    en: {
      title: isTeacher ? 'Writing Projects Management' : 'Available Writing Projects',
      newProject: 'New Writing Project',
      editProject: 'Edit Project',
      placeholderTitle: 'Project Title (e.g., Travel Description)',
      placeholderDesc: 'The question or task for students...',
      settings: 'Board Settings',
      template: 'Template',
      public: 'Public via Link',
      approval: 'Require Teacher Approval',
      bg: 'Background Color',
      layout: 'Layout Style',
      save: 'Save Project',
      cancel: 'Cancel',
      empty: isTeacher ? 'You haven\'t created any projects yet.' : 'No projects available at the moment.',
      copyLink: 'Copy Link',
      copied: 'Copied!',
      open: 'Open',
      templates: {
        brainstorm: 'Brainstorming',
        debate: 'Debate',
        story: 'Collaborative Story',
        custom: 'Custom',
        gallery: 'Creative Gallery'
      }
    }
  };

  const t = STRINGS[lang];

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-8 bg-slate-50/50" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black arabic-font text-slate-800">{t.title}</h2>
          <p className="text-sm text-slate-500 font-bold">
            {isTeacher ? 'أنشئ مساحات إبداعية لطلابك وقم بتخصيصها بالكامل' : 'انضم إلى المشاريع الكتابية وشارك إبداعاتك مع زملائك'}
          </p>
        </div>
        {isTeacher && (
          <button 
            onClick={() => setShowEditor(true)}
            className="px-8 py-4 bg-blue-600 text-white rounded-[1.5rem] font-black text-sm flex items-center gap-3 shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus size={20} />
            <span>{t.newProject}</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll pr-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-20">
            <Clock className="animate-spin mb-4" size={48} />
            <span className="font-black uppercase tracking-widest">Loading Projects...</span>
          </div>
        ) : boards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-slate-300 bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
            <Layout size={80} className="mb-6 opacity-20" />
            <p className="font-black arabic-font text-xl">{t.empty}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {boards.map((board) => (
                <motion.div
                  key={board.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col group relative overflow-hidden h-[280px]"
                >
                  {/* Creative Accent Strip */}
                  <div className={`absolute top-0 left-0 w-full h-1.5 ${board.settings.background}`} />
                  
                  <div className="p-5 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${board.settings.background} border border-slate-100 shadow-inner`}>
                        <Type size={18} className="text-slate-600" />
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(board)} className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all border border-slate-100">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDelete(board.id)} className="p-2 bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-all border border-red-100">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base font-black text-slate-800 arabic-font mb-2 leading-tight line-clamp-1">{board.title}</h3>
                    <p className="text-[11px] text-slate-500 arabic-font line-clamp-2 mb-4 flex-1 leading-relaxed">{board.description}</p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <div className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-black uppercase">
                        {t.templates[board.template]}
                      </div>
                      {board.isPublic && (
                        <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-black uppercase flex items-center gap-1">
                          <Globe size={8} /> Public
                        </div>
                      )}
                      {board.targetClasses && board.targetClasses.length > 0 && (
                        <div className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-md text-[9px] font-black uppercase flex items-center gap-1">
                          <Users size={8} /> {board.targetClasses.length} Classes
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <button 
                        onClick={() => onSelectBoard(board.id)}
                        className={`flex-1 py-2 rounded-xl font-black text-[10px] flex items-center justify-center gap-2 transition-all shadow-sm ${board.settings.background} ${board.settings.background.includes('bg-slate-900') || board.settings.background.includes('bg-zinc-800') || board.settings.background.includes('from-') ? 'text-white' : 'text-slate-900 border border-slate-200'}`}
                      >
                        <ExternalLink size={12} />
                        <span>{t.open}</span>
                      </button>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => copyLink(board.id)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${copySuccess === board.id ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                          title={t.copyLink}
                        >
                          <Copy size={14} />
                        </button>
                        <button 
                          onClick={() => {
                            const url = `${window.location.origin}/#/writing/board/${board.id}`;
                            window.open(`https://wa.me/?text=${encodeURIComponent(board.title + ': ' + url)}`, '_blank');
                          }}
                          className="w-9 h-9 rounded-xl flex items-center justify-center border border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all"
                          title="WhatsApp"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full h-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
            >
              {/* Header */}
              <div className="px-8 py-4 border-b border-slate-50 flex items-center justify-between bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                    {editingBoard ? <Edit3 size={20} /> : <Plus size={20} />}
                  </div>
                  <div>
                    <h3 className="text-lg font-black arabic-font text-slate-800">{editingBoard ? t.editProject : t.newProject}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{lang === 'ar' ? 'تعديل المشروع' : 'Edit Project'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={resetForm} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Split Screen Body */}
              <div className="flex-1 flex overflow-hidden">
                {/* Right: Editor (60% on desktop) */}
                <div className="w-full lg:w-[60%] overflow-y-auto p-6 md:p-10 custom-scroll border-l border-slate-100 bg-slate-50/30">
                  <div className="max-w-2xl mx-auto space-y-10">
                    
                    {/* Basic Info */}
                    <section className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Type size={14} /> {lang === 'ar' ? 'عنوان المشروع' : 'Project Title'}
                        </label>
                        <input 
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder={t.placeholderTitle}
                          className="w-full px-8 py-5 bg-white border border-slate-200 rounded-[1.5rem] text-xl font-black arabic-font outline-none focus:border-blue-500 transition-all shadow-sm"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <MessageCircle size={14} /> {lang === 'ar' ? 'السؤال أو المهمة' : 'Question / Task'}
                        </label>
                        <div className="relative">
                          <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t.placeholderDesc}
                            className="w-full h-48 px-8 py-6 bg-white border border-slate-200 rounded-[2rem] text-xl arabic-font outline-none focus:border-blue-500 transition-all resize-none shadow-sm"
                          />
                          <div className="absolute bottom-4 left-4 flex gap-2">
                            <label className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl cursor-pointer hover:bg-black transition-all shadow-lg text-[10px] font-black">
                              <Upload size={14} />
                              <span>{questionFileUrl ? (lang === 'ar' ? 'تم الرفع' : 'Uploaded') : (lang === 'ar' ? 'إرفاق ملف' : 'Attach File')}</span>
                              <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'question')} accept="image/*,application/pdf" />
                            </label>
                            {questionFileUrl && (
                              <button onClick={() => setQuestionFileUrl(undefined)} className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg">
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Visual Settings */}
                    <section className="space-y-8">
                      {/* Smart Distribution */}
                      <div className="space-y-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Users size={14} /> {lang === 'ar' ? 'الصفوف المستهدفة' : 'Target Classes'}
                        </label>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={newClass}
                            onChange={(e) => setNewClass(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && newClass.trim()) {
                                setTargetClasses([...targetClasses, newClass.trim()]);
                                setNewClass('');
                              }
                            }}
                            placeholder={lang === 'ar' ? 'أضف صفاً أو شعبة (مثلاً: 10/أ)' : 'Add a class or section (e.g., 10/A)'}
                            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:border-blue-500 transition-all"
                          />
                          <button 
                            onClick={() => {
                              if (newClass.trim()) {
                                setTargetClasses([...targetClasses, newClass.trim()]);
                                setNewClass('');
                              }
                            }}
                            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
                          >
                            <Plus size={20} />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {targetClasses.map((cls, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black flex items-center gap-2 border border-blue-100">
                              {cls}
                              <button onClick={() => setTargetClasses(targetClasses.filter((_, i) => i !== idx))} className="hover:text-red-500">
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.template}</label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          {(['custom', 'brainstorm', 'debate', 'story', 'gallery'] as const).map(temp => (
                            <button 
                              key={temp}
                              onClick={() => setTemplate(temp)}
                              className={`flex flex-col items-center gap-3 p-4 rounded-[1.5rem] border-2 transition-all ${template === temp ? 'bg-blue-50 border-blue-600 shadow-lg' : 'bg-white border-slate-100 hover:border-blue-200'}`}
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${template === temp ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {temp === 'custom' ? <Settings size={20} /> : temp === 'brainstorm' ? <Sparkles size={20} /> : temp === 'debate' ? <Users size={20} /> : temp === 'gallery' ? <Layout size={20} /> : <Edit3 size={20} />}
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-wider">{t.templates[temp]}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.layout}</label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          {(['grid', 'stream', 'columns', 'masonry', 'canvas'] as const).map(lay => (
                            <button 
                              key={lay}
                              onClick={() => setLayout(lay)}
                              className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${layout === lay ? 'bg-blue-50 border-blue-600' : 'bg-white border-slate-100 hover:border-blue-200'}`}
                            >
                              <Layout size={18} className={layout === lay ? 'text-blue-600' : 'text-slate-400'} />
                              <span className="text-[10px] font-black capitalize">{lay}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'اختر نوع الخط' : 'Choose Font Type'}</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {[
                            { id: 'font-tajawal', name: 'Tajawal (عصري)', class: 'font-tajawal' },
                            { id: 'font-amiri', name: 'Amiri (كلاسيكي)', class: 'font-amiri' },
                            { id: 'font-cairo', name: 'Cairo (هندسي)', class: 'font-cairo' },
                            { id: 'font-almarai', name: 'Almarai (نظيف)', class: 'font-almarai' },
                            { id: 'font-lalezar', name: 'Lalezar (عريض)', class: 'font-lalezar' },
                            { id: 'font-reem', name: 'Reem Kufi (كوفي)', class: 'font-reem' },
                            { id: 'font-aref', name: 'Aref Ruqaa (رقعة)', class: 'font-aref' },
                            { id: 'font-zain', name: 'Zain (ناعم)', class: 'font-zain' },
                            { id: 'font-farah', name: 'Farah (أنيق)', class: 'font-farah' }
                          ].map(font => (
                            <button 
                              key={font.id}
                              onClick={() => setFontFamily(font.id)}
                              className={`p-4 rounded-2xl border-2 text-right transition-all ${fontFamily === font.id ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105' : 'bg-white text-slate-600 border-slate-100 hover:border-blue-200'}`}
                            >
                              <span className={`text-lg block mb-1 ${font.class}`}>أبجد هوز</span>
                              <span className="text-[10px] font-bold opacity-70">{font.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.bg}</label>
                        <div className="flex flex-wrap gap-3 items-center">
                          <label className="w-10 h-10 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-blue-500 hover:text-blue-500 transition-all bg-white shadow-sm">
                            <ImageIcon size={18} />
                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'bg')} accept="image/*" />
                          </label>
                          {bgImage && (
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-blue-600 shadow-lg">
                              <img src={bgImage} className="w-full h-full object-cover" alt="BG" />
                              <button onClick={() => setBgImage(undefined)} className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity">
                                <X size={14} />
                              </button>
                            </div>
                          )}
                          {[
                            { id: 'bg-slate-50', class: 'bg-slate-50' },
                            { id: 'bg-pattern-waves', class: 'bg-pattern-waves' },
                            { id: 'bg-pattern-dots', class: 'bg-pattern-dots' },
                            { id: 'bg-pattern-grid', class: 'bg-pattern-grid' },
                            { id: 'bg-pattern-mesh', class: 'bg-pattern-mesh' },
                            { id: 'bg-pattern-soft', class: 'bg-pattern-soft' },
                            { id: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500', class: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500' },
                            { id: 'bg-gradient-to-br from-blue-600 to-cyan-500', class: 'bg-gradient-to-br from-blue-600 to-cyan-500' },
                            { id: 'bg-gradient-to-br from-emerald-500 to-teal-700', class: 'bg-gradient-to-br from-emerald-500 to-teal-700' },
                            { id: 'bg-gradient-to-br from-orange-400 to-rose-600', class: 'bg-gradient-to-br from-orange-400 to-rose-600' },
                            { id: 'bg-slate-900', class: 'bg-slate-900' }
                          ].map(color => (
                            <button 
                              key={color.id}
                              onClick={() => { setBg(color.id); setBgImage(undefined); }}
                              className={`w-10 h-10 rounded-xl border-4 transition-all ${color.class} ${bg === color.id && !bgImage ? 'border-blue-600 scale-110 shadow-xl' : 'border-white shadow-sm'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </section>

                    {/* Permissions */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                      <label className="flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-200 cursor-pointer hover:border-blue-200 transition-all shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                            <Globe size={20} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-800">{t.public}</span>
                            <span className="text-[10px] text-slate-400 font-bold">Visible via Link</span>
                          </div>
                        </div>
                        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="w-6 h-6 accent-blue-600" />
                      </label>

                      <label className="flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-200 cursor-pointer hover:border-blue-200 transition-all shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                            <ShieldCheck size={20} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-800">{t.approval}</span>
                            <span className="text-[10px] text-slate-400 font-bold">Moderation Required</span>
                          </div>
                        </div>
                        <input type="checkbox" checked={requireApproval} onChange={(e) => setRequireApproval(e.target.checked)} className="w-6 h-6 accent-blue-600" />
                      </label>
                    </section>
                  </div>
                </div>

                {/* Left: Live Preview (40% on desktop) */}
                <div className="hidden lg:flex lg:w-[40%] bg-slate-100 flex-col p-6 relative overflow-hidden">
                  <div className="flex-1 flex items-center justify-center">
                    <div 
                      className={`w-full h-full rounded-[1.5rem] shadow-2xl overflow-hidden relative flex flex-col transition-all duration-500 border-[3px] ${bgImage ? 'border-slate-800' : bg.includes('bg-slate-900') || bg.includes('bg-zinc-800') ? 'border-slate-700' : 'border-white'} ${bgImage ? '' : bg}`}
                    >
                      {bgImage && (
                        <img src={bgImage} className="absolute inset-0 w-full h-full object-cover" alt="Preview BG" />
                      )}
                      
                      {/* Professional Wavy Pattern Overlay (Subtle) */}
                      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                      
                      <div className="relative z-10 flex-1 flex flex-col p-6 overflow-y-auto custom-scroll">
                        {/* Question Box */}
                        <div className="bg-white/95 backdrop-blur-md rounded-[1.5rem] p-6 shadow-xl border border-white/20 mb-6 text-center transform hover:scale-[1.01] transition-transform">
                          <h2 className={`text-xl font-black mb-2 text-slate-800 ${fontFamily} leading-tight`}>{title || 'Project Title'}</h2>
                          <p className={`text-xs text-slate-600 ${fontFamily} leading-relaxed opacity-80`}>{description || 'The question or task will appear here...'}</p>
                          {questionFileUrl && (
                            <div className="mt-3 flex justify-center">
                              <div className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[9px] font-black flex items-center gap-2">
                                <FileIcon size={12} /> View Attachment
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Mock Posts based on Layout & Template */}
                        <div className={`
                          ${layout === 'grid' || layout === 'masonry' ? 'grid grid-cols-2 gap-3' : 
                            layout === 'stream' ? 'max-w-[240px] mx-auto space-y-3' : 
                            layout === 'canvas' ? 'relative h-64' :
                            'flex flex-row gap-3 overflow-x-auto pb-2'}
                        `}>
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`
                              bg-white/90 rounded-2xl border border-white/40 shadow-sm p-3 flex flex-col gap-2
                              ${layout === 'columns' ? 'min-w-[140px]' : ''}
                              ${layout === 'canvas' ? 'absolute w-32' : ''}
                              ${template === 'brainstorm' ? 'rounded-full aspect-square justify-center items-center text-center' : ''}
                              ${template === 'story' ? 'border-l-4 border-l-blue-400' : ''}
                            `} style={layout === 'canvas' ? { top: `${(i-1)*40}px`, left: `${(i-1)*30}px`, zIndex: i } : {}}>
                              <div className={`flex items-center gap-2 ${template === 'brainstorm' ? 'flex-col' : ''}`}>
                                <div className="w-5 h-5 rounded-full bg-slate-200" />
                                <div className="h-2 w-12 bg-slate-100 rounded-full" />
                              </div>
                              <div className={`bg-slate-50 rounded-xl ${template === 'brainstorm' ? 'h-8 w-16' : 'h-12'}`} />
                              {template === 'debate' && (
                                <div className="flex justify-between mt-1">
                                  <div className="h-3 w-8 bg-emerald-50 rounded-full" />
                                  <div className="h-3 w-8 bg-rose-50 rounded-full" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-4 bg-white border-t border-slate-100 flex justify-end gap-4">
                <button onClick={resetForm} className="px-6 py-3 bg-slate-50 text-slate-500 rounded-xl font-black text-sm hover:bg-slate-100 transition-all">
                  {t.cancel}
                </button>
                <button 
                  onClick={handleSaveBoard}
                  disabled={!title.trim()}
                  className="px-12 py-3 bg-blue-600 text-white rounded-xl font-black text-sm shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-95"
                >
                  {t.save}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
