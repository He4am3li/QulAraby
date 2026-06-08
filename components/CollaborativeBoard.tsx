import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, MessageCircle, Heart, Share2, MoreVertical, 
  CheckCircle2, Clock, User, Trash2, ShieldCheck,
  Send, X, Image as ImageIcon, Tag, Search, Filter, Sparkles, ChevronRight,
  File as FileIcon, Play, ChevronLeft
} from 'lucide-react';
import { 
  collection, query, orderBy, onSnapshot, 
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp 
} from 'firebase/firestore';
import { GoogleGenAI } from "@google/genai";
import { generateContentWithRetry } from '../services/gemini';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from './AuthProvider';

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  title?: string;
  imageUrl?: string;
  tags?: string[];
  reactions?: Record<string, number>;
  likedBy?: string[];
  feedback?: string;
  isApproved?: boolean;
  createdAt: any;
}

interface BoardSettings {
  background: string;
  bgImage?: string;
  fontFamily: string;
  fontSize: string;
  fontColor: string;
  layout: 'grid' | 'stream' | 'columns' | 'masonry' | 'canvas';
}

interface Board {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  settings: BoardSettings;
  template: string;
  isPublic: boolean;
  requireApproval: boolean;
  isActive: boolean;
  questionFileUrl?: string;
  createdAt: any;
}

interface CollaborativeBoardProps {
  lang: 'ar' | 'en';
  boardId?: string;
  onBack?: () => void;
}

export const CollaborativeBoard: React.FC<CollaborativeBoardProps> = ({ lang, boardId = 'main-board', onBack }) => {
  const { user, profile, isAuthReady } = useAuth();
  const [board, setBoard] = useState<Board | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostImageUrl, setNewPostImageUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState<string | null>(null);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const isTeacher = profile?.role === 'teacher' || profile?.role === 'admin';

  useEffect(() => {
    if (!isAuthReady || !user) return;

    // Fetch Board Settings
    const boardRef = doc(db, 'writing_boards', boardId);
    const unsubscribeBoard = onSnapshot(boardRef, (doc) => {
      if (doc.exists()) {
        setBoard({ id: doc.id, ...doc.data() } as Board);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `writing_boards/${boardId}`);
    });

    // Fetch Posts
    const postsRef = collection(db, 'writing_boards', boardId, 'posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'));

    const unsubscribePosts = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `writing_boards/${boardId}/posts`);
      setLoading(false);
    });

    return () => {
      unsubscribeBoard();
      unsubscribePosts();
    };
  }, [boardId, isAuthReady, user]);

  const handleAddPost = async () => {
    if (!newPostContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const postsRef = collection(db, 'writing_boards', boardId, 'posts');
      
      const finalImageUrl = newPostImageUrl.trim() || `https://picsum.photos/seed/${Math.random()}/800/600`;

      await addDoc(postsRef, {
        authorId: user?.uid || 'anonymous',
        authorName: user?.displayName || (lang === 'ar' ? 'مجهول' : 'Anonymous'),
        authorPhoto: user?.photoURL || '',
        content: newPostContent,
        title: newPostTitle,
        imageUrl: finalImageUrl,
        isApproved: isTeacher || !board?.requireApproval,
        createdAt: serverTimestamp(),
        reactions: {},
        likedBy: []
      });
      
      setNewPostContent('');
      setNewPostTitle('');
      setNewPostImageUrl('');
      setShowNewPost(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `writing_boards/${boardId}/posts`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikePost = async (post: Post) => {
    if (!user) return;
    
    const likedBy = post.likedBy || [];
    const isLiked = likedBy.includes(user.uid);
    
    const newLikedBy = isLiked 
      ? likedBy.filter(id => id !== user.uid)
      : [...likedBy, user.uid];

    try {
      await updateDoc(doc(db, 'writing_boards', boardId, 'posts', post.id), {
        likedBy: newLikedBy
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `writing_boards/${boardId}/posts/${post.id}`);
    }
  };

  const handleGenerateFeedback = async (post: Post) => {
    if (!isTeacher) return;
    setIsGeneratingFeedback(post.id);
    try {
      const prompt = `Analyze this Arabic student writing and provide a short, encouraging feedback (2-3 sentences) in Arabic. Focus on grammar, vocabulary, and style. Text: "${post.content}"`;
      
      const result = await generateContentWithRetry({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      const feedback = result.text;

      await updateDoc(doc(db, 'writing_boards', boardId, 'posts', post.id), {
        feedback: feedback
      });
    } catch (error) {
      console.error('Feedback error:', error);
    } finally {
      setIsGeneratingFeedback(null);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذه المشاركة؟' : 'Are you sure you want to delete this post?')) return;
    try {
      await deleteDoc(doc(db, 'writing_boards', boardId, 'posts', postId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `writing_boards/${boardId}/posts/${postId}`);
    }
  };

  const handleToggleApproval = async (post: Post) => {
    if (!isTeacher) return;
    try {
      await updateDoc(doc(db, 'writing_boards', boardId, 'posts', post.id), {
        isApproved: !post.isApproved
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `writing_boards/${boardId}/posts/${post.id}`);
    }
  };

  const visiblePosts = posts.filter(post => 
    post.isApproved || post.authorId === user?.uid || isTeacher
  );

  const filteredPosts = visiblePosts.filter(post => 
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const STRINGS = {
    ar: {
      newPost: 'مشاركة جديدة',
      placeholder: 'اكتب شيئاً ملهماً...',
      titlePlaceholder: 'عنوان المشاركة (اختياري)',
      imagePlaceholder: 'رابط صورة (اختياري)',
      postBtn: 'نشر الآن',
      searchPlaceholder: 'بحث في المشاركات...',
      empty: 'لا توجد مشاركات بعد. كن أول من يكتب!',
      approve: 'اعتماد',
      unapprove: 'إلغاء الاعتماد',
      delete: 'حذف',
      waiting: 'في انتظار المراجعة',
      posting: 'جاري النشر...',
      feedback: 'توليد تغذية راجعة (AI)',
      back: 'العودة للمشاريع'
    },
    en: {
      newPost: 'New Post',
      placeholder: 'Write something inspiring...',
      titlePlaceholder: 'Post Title (Optional)',
      imagePlaceholder: 'Image URL (Optional)',
      postBtn: 'Post Now',
      searchPlaceholder: 'Search posts...',
      empty: 'No posts yet. Be the first to write!',
      approve: 'Approve',
      unapprove: 'Unapprove',
      delete: 'Delete',
      waiting: 'Pending Review',
      posting: 'Posting...',
      feedback: 'Generate AI Feedback',
      back: 'Back to Projects'
    }
  };

  const t = STRINGS[lang];

  const boardBg = board?.settings?.background || 'bg-slate-50/50';
  const boardBgImage = board?.settings?.bgImage;
  const boardFont = board?.settings?.fontFamily || 'font-tajawal';
  const boardLayout = board?.settings?.layout || 'grid';

  return (
    <div className={`flex-1 flex flex-col overflow-hidden relative ${boardBgImage ? '' : boardBg} transition-colors duration-500`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {boardBgImage && (
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{ backgroundImage: `url(${boardBgImage})` }}
        />
      )}
      
      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.2) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      
      <div className="absolute inset-0 z-0 bg-white/10 backdrop-blur-[2px]" />

      <div className="relative z-10 flex-1 flex flex-col p-6">
        {/* Board Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            {onBack && (
              <button onClick={onBack} className="p-2 bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 transition-all shadow-sm">
                <ChevronRight className={lang === 'ar' ? '' : 'rotate-180'} size={18} />
              </button>
            )}
            <div>
              <h2 className={`text-xl font-black ${boardFont} text-slate-800`}>{board?.title || '...'}</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex bg-white/10 p-1 rounded-xl border border-white/10 ml-4">
              {isTeacher && (
                <button 
                  onClick={() => setShowSlideshow(true)}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-black transition-all flex items-center gap-2 bg-white/10 text-white hover:bg-white/20"
                >
                  <Play size={12} />
                  <span>{lang === 'ar' ? 'عرض الشرائح' : 'Slideshow'}</span>
                </button>
              )}
            </div>
            <div className="relative flex-1 md:w-56">
              <Search className={`absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} size={16} />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchPlaceholder}
                className={`w-full ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 transition-all shadow-sm`}
              />
            </div>
            <button 
              onClick={() => setShowNewPost(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all whitespace-nowrap"
            >
              <Plus size={16} />
              <span>{t.newPost}</span>
            </button>
          </div>
        </div>

        {/* Prominent Question Display */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-3xl mx-auto w-full mb-8"
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl shadow-blue-900/5 border border-white/50 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500" />
            
            <div className="relative z-10 space-y-4">
              <p className={`text-lg md:text-xl text-slate-700 ${boardFont} leading-relaxed max-w-2xl mx-auto font-medium`}>
                {board?.description}
              </p>

              {board?.questionFileUrl && (
                <div className="pt-2 flex justify-center">
                  <a 
                    href={board.questionFileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs hover:bg-black transition-all shadow-lg hover:scale-105 active:scale-95"
                  >
                    <FileIcon size={16} />
                    <span>{lang === 'ar' ? 'عرض الملف المرفق' : 'View Attached File'}</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Posts Grid */}
        <div className="flex-1 overflow-y-auto custom-scroll pr-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-20">
            <Clock className="animate-spin mb-4" size={48} />
            <span className="font-black uppercase tracking-widest">Loading Wall...</span>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-300">
            <MessageCircle size={64} className="mb-4 opacity-20" />
            <p className="font-black arabic-font text-xl">{t.empty}</p>
          </div>
        ) : (
          <div className={`
            ${boardLayout === 'grid' ? 'columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6' : 
              boardLayout === 'masonry' ? 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4' :
              boardLayout === 'stream' ? 'max-w-2xl mx-auto space-y-8' : 
              boardLayout === 'canvas' ? 'relative min-h-[600px]' :
              'flex flex-row gap-6 overflow-x-auto pb-6'}
          `}>
            <AnimatePresence>
              {filteredPosts.map((post, idx) => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`
                    break-inside-avoid bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden relative group 
                    ${!post.isApproved ? 'ring-2 ring-amber-200' : ''}
                    ${boardLayout === 'canvas' ? 'absolute w-full max-w-sm' : ''}
                  `}
                  style={boardLayout === 'canvas' ? { 
                    top: `${(idx % 5) * 100}px`, 
                    left: `${(idx % 3) * 150}px`,
                    zIndex: idx,
                    transform: `rotate(${(idx % 2 === 0 ? 1 : -1) * (idx % 3)}deg)`
                  } : {}}
                >
                  {/* Post Image */}
                  {post.imageUrl && (
                    <div className="w-full h-48 overflow-hidden relative">
                      <img 
                        src={post.imageUrl} 
                        alt="Post" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  )}

                  <div className="p-6">
                    {/* Post Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                          {post.authorPhoto ? (
                            <img src={post.authorPhoto} alt={post.authorName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <User size={20} className="text-slate-400" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-sm font-black text-slate-800 ${boardFont}`}>{post.authorName}</span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US') : 'Just now'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        {isTeacher && (
                          <>
                            <button 
                              onClick={() => handleToggleApproval(post)}
                              className={`p-2 rounded-lg transition-all ${post.isApproved ? 'text-emerald-500 bg-emerald-50' : 'text-amber-500 bg-amber-50'}`}
                              title={post.isApproved ? t.unapprove : t.approve}
                            >
                              <ShieldCheck size={18} />
                            </button>
                            <button 
                              onClick={() => handleGenerateFeedback(post)}
                              disabled={isGeneratingFeedback === post.id}
                              className={`p-2 rounded-lg transition-all text-blue-500 bg-blue-50 hover:bg-blue-100`}
                              title={t.feedback}
                            >
                              {isGeneratingFeedback === post.id ? <Clock className="animate-spin" size={18} /> : <Sparkles size={18} />}
                            </button>
                          </>
                        )}
                        {(isTeacher || post.authorId === user?.uid) && (
                          <button 
                            onClick={() => handleDeletePost(post.id)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title={t.delete}
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="space-y-3">
                      {post.title && (
                        <h4 className={`text-lg font-black text-slate-800 ${boardFont} leading-tight`}>{post.title}</h4>
                      )}
                      <p className={`text-base text-slate-600 ${boardFont} leading-relaxed whitespace-pre-wrap`}>
                        {post.content}
                      </p>
                    </div>

                    {/* AI Feedback */}
                    {post.feedback && (
                      <div className="mt-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 mb-2 text-blue-600">
                          <Sparkles size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Teacher / AI Feedback</span>
                        </div>
                        <p className="text-sm text-blue-800 arabic-font italic leading-relaxed">
                          {post.feedback}
                        </p>
                      </div>
                    )}

                    {/* Post Footer */}
                    <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleLikePost(post)}
                          className={`flex items-center gap-1.5 transition-all ${post.likedBy?.includes(user?.uid || '') ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}
                        >
                          <Heart size={18} fill={post.likedBy?.includes(user?.uid || '') ? "currentColor" : "none"} />
                          <span className="text-xs font-bold">{post.likedBy?.length || 0}</span>
                        </button>
                        <button className="flex items-center gap-1.5 text-slate-400 hover:text-blue-500 transition-all">
                          <MessageCircle size={18} />
                          <span className="text-xs font-bold">0</span>
                        </button>
                      </div>
                      
                      {!post.isApproved && (
                        <div className="flex items-center gap-1.5 text-amber-500 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                          <Clock size={12} />
                          <span className="text-[10px] font-black arabic-font">{t.waiting}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Slideshow Modal */}
      <AnimatePresence>
        {showSlideshow && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-slate-900 flex items-center justify-center p-0 md:p-10"
          >
            <button 
              onClick={() => setShowSlideshow(false)} 
              className="absolute top-6 right-6 z-[210] p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all"
            >
              <X size={32} />
            </button>

            <div className="w-full h-full max-w-6xl flex flex-col items-center justify-center relative">
              <AnimatePresence mode="wait">
                {visiblePosts.length > 0 && (
                  <motion.div
                    key={visiblePosts[currentSlide].id}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="w-full h-full flex flex-col items-center justify-center p-6"
                  >
                    <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row w-full max-h-full">
                      {visiblePosts[currentSlide].imageUrl && (
                        <div className="w-full md:w-1/2 h-48 md:h-auto overflow-hidden">
                          <img 
                            src={visiblePosts[currentSlide].imageUrl} 
                            alt="Slide" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      <div className={`p-8 md:p-12 flex flex-col justify-center ${visiblePosts[currentSlide].imageUrl ? 'md:w-1/2' : 'w-full'} text-right`} dir="rtl">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden">
                            {visiblePosts[currentSlide].authorPhoto ? (
                              <img src={visiblePosts[currentSlide].authorPhoto} alt="Author" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <User size={24} className="text-slate-400 m-auto" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-xl font-black arabic-font text-slate-800">{visiblePosts[currentSlide].authorName}</h4>
                            <p className="text-xs text-slate-400 font-bold">{lang === 'ar' ? 'طالب مبدع' : 'Creative Student'}</p>
                          </div>
                        </div>
                        {visiblePosts[currentSlide].title && (
                          <h3 className="text-2xl font-black text-blue-600 arabic-font mb-4">{visiblePosts[currentSlide].title}</h3>
                        )}
                        <p className="text-xl md:text-2xl text-slate-700 arabic-font leading-relaxed whitespace-pre-wrap">
                          {visiblePosts[currentSlide].content}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls */}
              <div className="absolute bottom-10 flex items-center gap-8">
                <button 
                  onClick={() => setCurrentSlide(prev => (prev - 1 + visiblePosts.length) % visiblePosts.length)}
                  className="p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all"
                >
                  <ChevronLeft className={lang === 'ar' ? 'rotate-180' : ''} size={32} />
                </button>
                <div className="flex flex-col items-center gap-2">
                  <div className="text-white font-black text-xl">
                    {currentSlide + 1} / {visiblePosts.length}
                  </div>
                  <button 
                    onClick={() => setShowSlideshow(false)}
                    className="px-6 py-2 bg-white/10 text-white rounded-xl text-xs font-black hover:bg-white/20 transition-all border border-white/10"
                  >
                    {lang === 'ar' ? 'خروج' : 'Exit'}
                  </button>
                </div>
                <button 
                  onClick={() => setCurrentSlide(prev => (prev + 1) % visiblePosts.length)}
                  className="p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all"
                >
                  <ChevronRight className={lang === 'ar' ? 'rotate-180' : ''} size={32} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Post Modal */}
      <AnimatePresence>
        {showNewPost && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                    <Plus size={24} />
                  </div>
                  <h3 className="text-xl font-black arabic-font text-slate-800">{t.newPost}</h3>
                </div>
                <button onClick={() => setShowNewPost(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <input 
                    type="text"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder={t.titlePlaceholder}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-lg font-black arabic-font outline-none focus:bg-white focus:border-blue-500 transition-all"
                  />
                  
                  <input 
                    type="text"
                    value={newPostImageUrl}
                    onChange={(e) => setNewPostImageUrl(e.target.value)}
                    placeholder={t.imagePlaceholder}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:border-blue-500 transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <textarea 
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder={t.placeholder}
                    className="w-full h-48 px-6 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] text-xl arabic-font outline-none focus:bg-white focus:border-blue-500 transition-all resize-none"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-blue-600 transition-all border border-slate-100">
                      <ImageIcon size={20} />
                    </button>
                    <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-blue-600 transition-all border border-slate-100">
                      <Tag size={20} />
                    </button>
                  </div>

                  <button 
                    onClick={handleAddPost}
                    disabled={!newPostContent.trim() || isSubmitting}
                    className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Clock className="animate-spin" size={18} />
                    ) : (
                      <Send size={18} />
                    )}
                    <span>{isSubmitting ? t.posting : t.postBtn}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};
