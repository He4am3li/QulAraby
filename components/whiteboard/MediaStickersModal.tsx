import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, FileText, Upload, Sparkles, Check, Plus, ChevronRight, ChevronLeft, Loader2, ZoomIn, BookOpen } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { WhiteboardElement } from '../../types/whiteboard';

// Configure PDF.js worker
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
} catch (err) {
  console.warn('PDF.js worker init note:', err);
}

interface MediaStickersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertImage: (element: WhiteboardElement) => void;
  onSetPdfBackground?: (url: string, pageNum: number) => void;
}

interface StickerItem {
  id: string;
  title: string;
  category: 'landmarks' | 'culture' | 'professions' | 'awards';
  icon: string;
  tag: string;
}

const STICKERS: StickerItem[] = [
  // Awards & Encouragement
  { id: 'aw1', title: 'مُمْتَاز 🌟', category: 'awards', icon: '🌟', tag: 'تعزيز وتشجيع' },
  { id: 'aw2', title: 'بَطَلُ العَرَبِيَّة 👑', category: 'awards', icon: '👑', tag: 'وسام الشرف' },
  { id: 'aw3', title: 'إِجَابَةٌ رَائِعَة 🎯', category: 'awards', icon: '🎯', tag: 'دقة وإتقان' },
  { id: 'aw4', title: 'نَجْمُ الحِصَّة ⭐', category: 'awards', icon: '⭐', tag: 'مشاركة مميزة' },
  { id: 'aw5', title: 'خَطَّاطٌ مُبْدِع ✒️', category: 'awards', icon: '✒️', tag: 'جمال الخط' },

  // Landmarks
  { id: 'lm1', title: 'الكَعْبَةُ المُشَرَّفَة (مكة)', category: 'landmarks', icon: '🕋', tag: 'معلم إسلامي' },
  { id: 'lm2', title: 'المَسْجِدُ الأَقْصَى (القدس)', category: 'landmarks', icon: '🕌', tag: 'معلم إسلامي' },
  { id: 'lm3', title: 'الأَهْرَامَات (مصر)', category: 'landmarks', icon: '🔺', tag: 'معلم تاريخي' },
  { id: 'lm4', title: 'البَتْرَاء (الأردن)', category: 'landmarks', icon: '🏛️', tag: 'معلم أثري' },
  { id: 'lm5', title: 'بُرْجُ الخَلِيفَة (دبي)', category: 'landmarks', icon: '🏙️', tag: 'معلم حديث' },

  // Culture & Arab Heritage
  { id: 'cl1', title: 'الدَّلَّةُ والقَهْوَةُ العَرَبِيَّة', category: 'culture', icon: '☕', tag: 'كرم وضيافة' },
  { id: 'cl2', title: 'التَّمْرُ السُّكَّرِي', category: 'culture', icon: '🌴', tag: 'غذاء وثقافة' },
  { id: 'cl3', title: 'الصَّقْرُ العَرَبِي', category: 'culture', icon: '🦅', tag: 'أصالة وقوة' },
  { id: 'cl4', title: 'الخَيْلُ العَرَبِيُّ الأَصِيل', category: 'culture', icon: '🐎', tag: 'فروسية' },
  { id: 'cl5', title: 'العُودُ الشَّرْقِي', category: 'culture', icon: '🪕', tag: 'موسيقى عربية' },

  // Professions
  { id: 'pr1', title: 'مُعَلِّمٌ / مُعَلِّمَة', category: 'professions', icon: '👨‍🏫', tag: 'تعليم' },
  { id: 'pr2', title: 'طَبِيبٌ / طَبِيبَة', category: 'professions', icon: '👨‍⚕️', tag: 'صحة' },
  { id: 'pr3', title: 'مُهَنْدِسٌ / مُهَنْدِسَة', category: 'professions', icon: '👷', tag: 'بناء' },
  { id: 'pr4', title: 'رَائِدُ فَضَاء', category: 'professions', icon: '🧑‍🚀', tag: 'علوم' },
];

export const MediaStickersModal: React.FC<MediaStickersModalProps> = ({
  isOpen,
  onClose,
  onInsertImage,
  onSetPdfBackground
}) => {
  const [activeTab, setActiveTab] = useState<'stickers' | 'pdf' | 'upload'>('stickers');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  // PDF State
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [pdfPagesCount, setPdfPagesCount] = useState<number>(0);
  const [selectedPdfPage, setSelectedPdfPage] = useState<number>(1);
  const [pdfPagePreview, setPdfPagePreview] = useState<string | null>(null);
  const [pdfDocProxy, setPdfDocProxy] = useState<any>(null);
  const [pdfPagesCache, setPdfPagesCache] = useState<Record<number, string>>({});

  if (!isOpen) return null;

  const filteredStickers = selectedCategory === 'all'
    ? STICKERS
    : STICKERS.filter(s => s.category === selectedCategory);

  const handleSelectSticker = (sticker: StickerItem) => {
    const newElement: WhiteboardElement = {
      id: `sticker_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      type: 'arabic_card',
      x: 180 + Math.random() * 80,
      y: 140 + Math.random() * 80,
      width: 260,
      color: '#0d9488',
      strokeWidth: 2,
      cardData: {
        word: sticker.title,
        pos: sticker.tag,
        meaning: sticker.icon,
        translation: 'ملصق تعليمي وثقافي'
      }
    };
    onInsertImage(newElement);
    onClose();
  };

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const newElement: WhiteboardElement = {
          id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          type: 'image',
          x: 180,
          y: 120,
          width: 320,
          height: 240,
          src: dataUrl,
          color: '#ffffff',
          strokeWidth: 1,
          cardData: {
            imageTitle: file.name,
            imageUrl: dataUrl
          }
        };
        onInsertImage(newElement);
        onClose();
      }
    };
    reader.readAsDataURL(file);
  };

  const renderPdfPagePreview = async (pdfDoc: any, pageNumber: number) => {
    try {
      setPdfLoading(true);
      if (pdfPagesCache[pageNumber]) {
        setPdfPagePreview(pdfPagesCache[pageNumber]);
        setPdfLoading(false);
        return pdfPagesCache[pageNumber];
      }
      const page = await pdfDoc.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.8 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        await page.render({ canvasContext: ctx, viewport }).promise;
        const dataUrl = canvas.toDataURL('image/png');
        setPdfPagePreview(dataUrl);
        setPdfPagesCache(prev => ({ ...prev, [pageNumber]: dataUrl }));
        return dataUrl;
      }
    } catch (err) {
      console.error('Error rendering PDF page preview:', err);
    } finally {
      setPdfLoading(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfLoading(true);
    setPdfFileName(file.name);
    setPdfPagesCache({});

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      setPdfDocProxy(pdf);
      setPdfPagesCount(pdf.numPages);
      setSelectedPdfPage(1);
      const firstPage = await renderPdfPagePreview(pdf, 1);
      
      // Pre-cache up to first 5 pages for instant interactive flipping
      const maxPreload = Math.min(pdf.numPages, 5);
      for (let i = 2; i <= maxPreload; i++) {
        pdf.getPage(i).then(async (page: any) => {
          const vp = page.getViewport({ scale: 1.8 });
          const cvs = document.createElement('canvas');
          cvs.width = vp.width;
          cvs.height = vp.height;
          const cx = cvs.getContext('2d');
          if (cx) {
            await page.render({ canvasContext: cx, viewport: vp }).promise;
            const u = cvs.toDataURL('image/png');
            setPdfPagesCache(prev => ({ ...prev, [i]: u }));
          }
        }).catch(() => {});
      }
    } catch (err) {
      console.error('Failed to load PDF:', err);
      setPdfPagesCount(1);
      setSelectedPdfPage(1);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleChangePdfPage = async (newPage: number) => {
    if (newPage < 1 || newPage > pdfPagesCount) return;
    setSelectedPdfPage(newPage);
    if (pdfDocProxy) {
      await renderPdfPagePreview(pdfDocProxy, newPage);
    }
  };

  const handleInsertPdfAsPresentation = () => {
    if (!pdfPagePreview) return;
    const pagesList: string[] = [];
    for (let i = 1; i <= pdfPagesCount; i++) {
      pagesList.push(pdfPagesCache[i] || (i === selectedPdfPage ? pdfPagePreview : ''));
    }
    const newElement: WhiteboardElement = {
      id: `pdf_pres_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      type: 'pdf_presentation',
      x: 120,
      y: 60,
      width: 580,
      height: 720,
      scale: 1,
      src: pdfPagePreview,
      color: '#ffffff',
      strokeWidth: 1,
      pdfData: {
        docName: pdfFileName || 'كتاب مدرسي تفاعلي',
        pages: pagesList,
        currentPage: selectedPdfPage,
        totalPages: pdfPagesCount,
        scale: 1
      },
      cardData: {
        imageTitle: `${pdfFileName || 'كتاب مدرسي'} (ص ${selectedPdfPage})`,
        imageUrl: pdfPagePreview
      }
    };
    onInsertImage(newElement);
    onClose();
  };

  const handleApplyPdfAsBackground = () => {
    if (pdfPagePreview && onSetPdfBackground) {
      onSetPdfBackground(pdfPagePreview, selectedPdfPage);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 w-full max-w-2xl shadow-2xl text-slate-800 relative overflow-hidden flex flex-col max-h-[88vh]"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-200/60 shadow-sm">
                <ImageIcon size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 arabic-font flex items-center gap-2">
                  مكتبة الوسائط والملصقات وعارض كتب PDF 📚
                </h3>
                <p className="text-xs text-slate-500 font-medium">إدراج ملصقات الثقافة العربية وعرض الكتب للشرح التفاعلي</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-3 gap-2 mb-4 bg-slate-100/80 p-1.5 rounded-2xl shrink-0">
            <button
              onClick={() => setActiveTab('stickers')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold arabic-font transition ${
                activeTab === 'stickers'
                  ? 'bg-white text-teal-700 shadow-sm font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Sparkles size={16} />
              <span>الملصقات التفاعلية</span>
            </button>

            <button
              onClick={() => setActiveTab('pdf')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold arabic-font transition ${
                activeTab === 'pdf'
                  ? 'bg-white text-teal-700 shadow-sm font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <FileText size={16} />
              <span>عارض كتب PDF</span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold arabic-font transition ${
                activeTab === 'upload'
                  ? 'bg-white text-teal-700 shadow-sm font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Upload size={16} />
              <span>رفع صورة مخصصة</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto custom-scroll pr-1 space-y-4">
            {/* Tab 1: Stickers */}
            {activeTab === 'stickers' && (
              <div className="space-y-4">
                {/* Category Filter */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'الكل' },
                    { id: 'awards', label: 'أوسمة وتشجيع 🌟' },
                    { id: 'landmarks', label: 'معالم وآثار 🏛️' },
                    { id: 'culture', label: 'ثقافة وتقاليد 🌴' },
                    { id: 'professions', label: 'المهن 👨‍🏫' }
                  ].map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                        selectedCategory === c.id
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-1">
                  {filteredStickers.map(sticker => (
                    <motion.div
                      key={sticker.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectSticker(sticker)}
                      className="p-3.5 bg-slate-50 hover:bg-teal-50/60 border border-slate-200 hover:border-teal-400 rounded-2xl cursor-pointer transition shadow-xs flex flex-col items-center text-center gap-2 group"
                    >
                      <span className="text-3xl filter drop-shadow-sm group-hover:scale-120 transition-transform">
                        {sticker.icon}
                      </span>
                      <span className="text-xs font-black text-slate-800 arabic-font leading-tight">
                        {sticker.title}
                      </span>
                      <span className="text-[10px] text-teal-700 font-bold px-2 py-0.5 bg-white border border-teal-200 rounded-lg">
                        {sticker.tag}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: PDF Book Viewer */}
            {activeTab === 'pdf' && (
              <div className="space-y-4">
                {!pdfFileName ? (
                  <div className="bg-slate-50 p-8 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                    <FileText size={48} className="text-teal-600 mx-auto mb-3 opacity-90" />
                    <h4 className="text-base font-black text-slate-900 arabic-font mb-1.5">
                      رفع الكتاب المدرسي أو ورقة العمل (PDF) 📄
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
                      يتم استخراج صفحات الملف بدقة عالية لعرضها على السبورة وحل التمارين والشرح فوقها بالقلم والماركر
                    </p>

                    <input
                      type="file"
                      accept=".pdf"
                      ref={pdfInputRef}
                      onChange={handlePdfUpload}
                      className="hidden"
                    />

                    <button
                      onClick={() => pdfInputRef.current?.click()}
                      className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-xs transition inline-flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <Upload size={16} />
                      <span>اختيار ملف PDF من الجهاز</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* PDF Control Bar */}
                    <div className="bg-teal-50/70 border border-teal-200/80 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <FileText size={18} className="text-teal-700" />
                        <span className="font-bold text-xs text-slate-900 truncate max-w-xs">{pdfFileName}</span>
                        <span className="text-[11px] text-teal-700 font-bold px-2 py-0.5 bg-white rounded-lg border border-teal-200">
                          {pdfPagesCount} صفحة
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleChangePdfPage(selectedPdfPage - 1)}
                          disabled={selectedPdfPage <= 1 || pdfLoading}
                          className="p-1.5 bg-white text-slate-700 disabled:opacity-30 rounded-lg border border-slate-200 hover:bg-slate-50"
                        >
                          <ChevronRight size={16} />
                        </button>
                        <span className="text-xs font-bold text-slate-700 px-1">
                          صفحة {selectedPdfPage} من {pdfPagesCount}
                        </span>
                        <button
                          onClick={() => handleChangePdfPage(selectedPdfPage + 1)}
                          disabled={selectedPdfPage >= pdfPagesCount || pdfLoading}
                          className="p-1.5 bg-white text-slate-700 disabled:opacity-30 rounded-lg border border-slate-200 hover:bg-slate-50"
                        >
                          <ChevronLeft size={16} />
                        </button>

                        <button
                          onClick={() => {
                            setPdfFileName(null);
                            setPdfDocProxy(null);
                            setPdfPagePreview(null);
                          }}
                          className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 bg-white border border-rose-200 rounded-lg mr-2"
                        >
                          ملف آخر
                        </button>
                      </div>
                    </div>

                    {/* Page Preview */}
                    <div className="bg-slate-100/80 rounded-2xl p-3 border border-slate-200 flex flex-col items-center justify-center min-h-[220px]">
                      {pdfLoading ? (
                        <div className="flex flex-col items-center gap-2 text-slate-500 py-8">
                          <Loader2 size={24} className="animate-spin text-teal-600" />
                          <span className="text-xs font-bold">جارٍ معالجة الصفحة واستخراج الصورة...</span>
                        </div>
                      ) : pdfPagePreview ? (
                        <div className="relative group max-h-[300px] overflow-hidden rounded-xl shadow-md border border-slate-200">
                          <img
                            src={pdfPagePreview}
                            alt={`Page ${selectedPdfPage}`}
                            className="max-h-[300px] w-auto object-contain rounded-xl"
                          />
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 py-6">تعذر عرض المعاينة</div>
                      )}
                    </div>

                    {/* PDF Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={handleInsertPdfAsPresentation}
                        disabled={!pdfPagePreview || pdfLoading}
                        className="py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-2xl font-bold arabic-font text-xs flex items-center justify-center gap-2 shadow-md transition"
                      >
                        <BookOpen size={16} />
                        عرض الكتاب للشرح التفاعلي (عارض متعدد الصفحات)
                      </button>

                      <button
                        onClick={handleApplyPdfAsBackground}
                        disabled={!pdfPagePreview || pdfLoading}
                        className="py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-2xl font-bold arabic-font text-xs flex items-center justify-center gap-2 shadow-md transition"
                      >
                        <Check size={16} />
                        تعيين كشريحة كاملة للسبورة الحالية
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Upload Custom Image */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                <div className="bg-slate-50 p-8 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                  <ImageIcon size={44} className="text-teal-600 mx-auto mb-2 opacity-80" />
                  <h4 className="text-sm font-black text-slate-900 arabic-font mb-1">
                    رفع صورة توضيحية أو مخطط تعليمي
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">
                    يمكنك تحريك الصورة، وتغيير حجمها، وتدويرها بسهولة بعد إدراجها
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleCustomImageUpload}
                    className="hidden"
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-xs transition inline-flex items-center gap-2 shadow-md"
                  >
                    <Upload size={16} />
                    <span>اختيار صورة من الجهاز</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
