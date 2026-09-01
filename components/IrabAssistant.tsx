
import React from 'react';
import { X, Send, Loader2, Copy, Check, Sparkles, BookOpen, Globe, RotateCcw, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { parseArabicSentence } from '../services/gemini';
import { IrabAnalysisResult } from '../types';

export const IrabAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [input, setInput] = React.useState('');
  const [result, setResult] = React.useState<IrabAnalysisResult | null>(null);
  const [rawTextResult, setRawTextResult] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);
  const [lang, setLang] = React.useState<'ar' | 'en'>(
    (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar'
  );

  const printCardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleLangChange = () => {
      const currentLang = (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar';
      setLang(currentLang);
    };
    window.addEventListener('langChanged', handleLangChange);
    return () => window.removeEventListener('langChanged', handleLangChange);
  }, []);

  const t = {
    parsing: lang === 'ar' ? 'الإعراب' : 'Parsing',
    helpMeWith: lang === 'ar' ? 'ساعدني في' : 'Help me with',
    helpMeWithParsing: lang === 'ar' ? 'ساعدني في الإعراب' : 'Help me with Parsing',
    grammarParser: lang === 'ar' ? 'المساعد النحوي الفوري' : 'Instant Arabic Parser',
    placeholder: lang === 'ar' ? 'أدخل الجملة المراد إعرابها...' : 'Enter sentence to parse...',
    analyzing: lang === 'ar' ? 'جاري التحليل النحوي الدقيق...' : 'Analyzing grammatically...',
    enterSentence: lang === 'ar' ? 'تفضل بكتابة أي جملة عربية لتحصل على إعراب نحوي مباشر ودقيق' : 'Enter an Arabic sentence for direct, clear grammatical parsing.',
    parseAnother: lang === 'ar' ? 'إعراب جملة أخرى' : 'Parse another sentence',
    error: lang === 'ar' ? 'عذراً، حدث خطأ أثناء محاولة الإعراب.' : 'Sorry, an error occurred while parsing.',
    arabicParsing: lang === 'ar' ? 'الإعراب النحوي المباشر' : 'Direct Arabic Parsing',
    englishParsing: lang === 'ar' ? 'الترجمة والإعراب بالإنجليزية' : 'English Breakdown & Translation',
    sentenceMeaning: lang === 'ar' ? 'معنى الجملة:' : 'Sentence Meaning:',
    copiedText: lang === 'ar' ? 'تم النسخ!' : 'Copied!',
    copyAll: lang === 'ar' ? 'نسخ الإعراب' : 'Copy Breakdown',
    downloadPdf: lang === 'ar' ? 'تحميل الإعراب بصيغة PDF' : 'Download I\'rab PDF',
    quickExamples: lang === 'ar' ? 'أمثلة سريعة:' : 'Quick examples:',
  };

  const sampleSentences = [
    'ذهب الولد إلى المدرسة',
    'العلمُ نورٌ والجهلُ ظلامٌ',
    'قرأ الطالبُ الكتابَ المفيدَ'
  ];

  const handleParse = async (e?: React.FormEvent, customInput?: string) => {
    if (e) e.preventDefault();
    const sentenceToParse = customInput || input;
    if (!sentenceToParse.trim()) return;
    setLoading(true);
    setResult(null);
    setRawTextResult(null);
    try {
      const res = await parseArabicSentence(sentenceToParse);
      if (res && typeof res === 'object' && res.arabicBreakdown) {
        setResult(res);
      } else if (typeof res === 'string') {
        setRawTextResult(res);
      }
    } catch (error) {
      setRawTextResult(t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    let textToCopy = `جملة: ${result.sentence || input}\n\n`;
    textToCopy += `[ الإعراب بالعربية ]\n`;
    result.arabicBreakdown.forEach((item) => {
      textToCopy += `• ${item.word}: ${item.irab}\n`;
    });
    if (result.meaningEn) {
      textToCopy += `\n[ Meaning ]: ${result.meaningEn}\n`;
    }
    if (result.englishBreakdown && result.englishBreakdown.length > 0) {
      textToCopy += `\n[ English Breakdown ]\n`;
      result.englishBreakdown.forEach((item) => {
        textToCopy += `• ${item.roman ? `${item.roman} (${item.word})` : item.word}: ${item.irabEn}\n`;
      });
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    if (!printCardRef.current || !result) return;
    setIsGeneratingPdf(true);
    try {
      const canvas = await html2canvas(printCardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 800
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfPageWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();

      let printWidth = pdfPageWidth;
      let printHeight = (imgProps.height * pdfPageWidth) / imgProps.width;

      if (printHeight > pdfPageHeight) {
        printHeight = pdfPageHeight;
        printWidth = (imgProps.width * printHeight) / imgProps.height;
      }

      const xOffset = Math.max(0, (pdfPageWidth - printWidth) / 2);
      const yOffset = Math.max(0, (pdfPageHeight - printHeight) / 2);

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, printWidth, printHeight);
      const safeFileName = (result.sentence || 'irab').trim().slice(0, 20).replace(/[^\w\u0621-\u064A]/g, '_');
      pdf.save(`Irab_${safeFileName}.pdf`);
    } catch (err) {
      console.error('Failed to generate I\'rab PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className={`fixed bottom-32 ${lang === 'ar' ? 'left-6 sm:left-12' : 'right-6 sm:right-12'} z-[100] no-print`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Hidden Printable A4 Card for PDF Rendering */}
      {result && (
        <div style={{ position: 'absolute', top: -99999, left: -99999, width: '800px' }}>
          <div 
            ref={printCardRef}
            className="w-[800px] bg-white p-10 font-sans text-slate-800"
            style={{ minHeight: '1050px', boxSizing: 'border-box' }}
          >
            {/* Header with Platform Logo (No Date) */}
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-6 mb-6" dir="rtl">
              <div className="flex items-center gap-4">
                {/* Platform Logo */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 border-2 border-slate-700 flex flex-col items-center justify-center text-white shadow-md shrink-0">
                  <span className="text-[9px] font-black text-blue-400 tracking-tighter drop-shadow-sm">QUL</span>
                  <span className="text-xl font-black text-emerald-400 arabic-font -mt-1 drop-shadow-sm">قُل</span>
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 arabic-font">منصة قُل | المساعد النحوي</h1>
                  <p className="text-xs font-bold text-blue-600">الإعراب النحوي والترجمة الإنجليزية</p>
                </div>
              </div>
              <div className="text-left">
                <span className="text-xs font-black text-slate-400 tracking-wider">QUL ARABIC PLATFORM</span>
              </div>
            </div>

            {/* Sentence Card */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-5 mb-8 text-right" dir="rtl">
              <span className="text-xs font-black text-blue-600 block mb-1">الجملة:</span>
              <h2 className="text-2xl font-black text-slate-900 arabic-font leading-relaxed">{result.sentence}</h2>
            </div>

            {/* Arabic Breakdown (RTL) - Clean lines without rectangles or circular numbering */}
            <div className="mb-8" dir="rtl">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <h3 className="text-base font-black text-slate-900 arabic-font">الإعراب النحوي المباشر</h3>
              </div>

              <div className="space-y-3">
                {result.arabicBreakdown.map((item, idx) => (
                  <div key={idx} className="py-2.5 border-b border-slate-100 last:border-b-0 flex items-baseline gap-2.5 text-right">
                    <span className="text-blue-900 font-black text-lg arabic-font shrink-0">
                      {item.word}:
                    </span>
                    <span className="text-slate-800 font-bold text-base arabic-font leading-relaxed flex-1">
                      {item.irab}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* English Breakdown (LTR) - Clean lines without rectangles or circular numbering */}
            {result.englishBreakdown && result.englishBreakdown.length > 0 && (
              <div className="mb-6" dir="ltr">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <h3 className="text-base font-black text-slate-900 font-sans">English Breakdown & Meaning</h3>
                </div>

                {result.meaningEn && (
                  <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/60 rounded-xl mb-4 text-left">
                    <span className="text-xs font-black text-emerald-800 block mb-0.5 font-sans">Sentence Meaning:</span>
                    <p className="text-sm font-bold text-slate-900 font-sans">&ldquo;{result.meaningEn}&rdquo;</p>
                  </div>
                )}

                <div className="space-y-3">
                  {result.englishBreakdown.map((item, idx) => (
                    <div key={idx} className="py-2.5 border-b border-slate-100 last:border-b-0 flex items-baseline gap-2.5 text-left font-sans">
                      <span className="text-emerald-950 font-bold text-base shrink-0">
                        {item.roman ? `${item.roman} (${item.word})` : item.word}:
                      </span>
                      <span className="text-slate-800 text-base font-sans leading-relaxed flex-1">
                        {item.irabEn}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Note */}
            <div className="mt-14 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400" dir="rtl">
              <p className="font-bold">منصة قُل لتعليم اللغة العربية</p>
              <p dir="ltr">qul-platform</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex flex-col items-center animate-float focus:outline-none"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#2563eb] to-[#059669] shadow-[0_12px_40px_rgba(37,99,235,0.3)] border border-white/40 overflow-hidden transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 active:scale-95 flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] pointer-events-none" />
            <span className={`${lang === 'ar' ? 'text-2xl sm:text-3xl' : 'text-xl'} text-white font-bold handwritten-font select-none tracking-tight drop-shadow-md`}>
              {t.parsing}
            </span>
            <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full animate-pulse shadow-sm z-10" />
          </div>
          <div className="mt-2.5 px-3.5 py-1 bg-white/95 backdrop-blur-md text-[#1e40af] text-[11px] font-black rounded-full shadow-md arabic-font border border-blue-100/60 transition-all group-hover:bg-blue-600 group-hover:text-white">
            {t.helpMeWith}
          </div>
        </button>
      )}

      {/* Main Parser Modal Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[26rem] md:w-[32rem] max-h-[85vh] bg-white rounded-[2rem] shadow-[0_25px_70px_rgba(0,0,0,0.25)] border border-slate-100 overflow-hidden flex flex-col animate-in slide-in-from-bottom-6 duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2563eb] via-[#1d4ed8] to-[#059669] p-4 sm:p-5 flex items-center justify-between text-white shadow-md relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                <span className="text-2xl text-white font-black handwritten-font select-none">ع</span>
              </div>
              <div className="text-right">
                <h4 className="text-base font-black arabic-font leading-tight flex items-center gap-1.5">
                  <span>{t.helpMeWithParsing}</span>
                  <Sparkles size={14} className="text-amber-300 animate-pulse" />
                </h4>
                <p className="text-[10px] text-blue-100 font-bold tracking-wide">{t.grammarParser}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              {result && (
                <>
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    title={t.downloadPdf}
                    className="p-2 hover:bg-white/20 active:scale-95 rounded-xl transition-all text-white flex items-center gap-1 text-[11px] font-bold disabled:opacity-50"
                  >
                    {isGeneratingPdf ? <Loader2 size={16} className="animate-spin text-amber-300" /> : <Download size={16} />}
                  </button>
                  <button
                    onClick={handleCopy}
                    title={t.copyAll}
                    className="p-2 hover:bg-white/20 active:scale-95 rounded-xl transition-all text-white flex items-center gap-1 text-[11px] font-bold"
                  >
                    {copied ? <Check size={16} className="text-emerald-300" /> : <Copy size={16} />}
                  </button>
                </>
              )}
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 active:scale-95 rounded-xl transition-colors text-white"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body Area */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto custom-scroll bg-slate-50/70 space-y-4">
            
            {/* Empty State / Welcome */}
            {!result && !rawTextResult && !loading && (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-center shadow-sm">
                  <BookOpen size={28} className="text-blue-600" />
                </div>
                <div className="max-w-xs space-y-1">
                  <h5 className="text-sm font-black text-slate-800 arabic-font">المساعد النحوي الفوري</h5>
                  <p className="text-xs font-medium text-slate-500 arabic-font leading-relaxed">{t.enterSentence}</p>
                </div>

                {/* Quick Examples */}
                <div className="w-full pt-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 arabic-font">{t.quickExamples}</p>
                  <div className="flex flex-col gap-1.5 w-full">
                    {sampleSentences.map((sent, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInput(sent);
                          handleParse(undefined, sent);
                        }}
                        className="w-full py-2 px-3 bg-white hover:bg-blue-50/80 hover:border-blue-200 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-700 arabic-font text-right transition-all flex items-center justify-between group shadow-2xs"
                      >
                        <span>{sent}</span>
                        <Send size={12} className="text-slate-300 group-hover:text-blue-500 rotate-180 transition-transform group-hover:translate-x-1" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="py-16 flex flex-col items-center justify-center space-y-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles size={16} className="text-blue-500 animate-pulse" />
                  </div>
                </div>
                <p className="text-xs font-black arabic-font text-slate-600 animate-pulse">{t.analyzing}</p>
              </div>
            )}

            {/* Results Display */}
            {(result || rawTextResult) && !loading && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                {/* Sentence Title Card */}
                {result?.sentence && (
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs text-right" dir="rtl">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">الجملة المحللة:</span>
                    <h3 className="text-lg font-black text-blue-900 arabic-font leading-relaxed">{result.sentence}</h3>
                  </div>
                )}

                {/* 1. ARABIC PARSING (RTL - كل كلمة في سطر مباشر وبسيط بدون مستطيلات أو ترقيم دوائر) */}
                {result?.arabicBreakdown && (
                  <div className="bg-white p-4 rounded-2xl border border-blue-100/80 shadow-sm space-y-3" dir="rtl">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black">
                          ع
                        </div>
                        <h4 className="text-xs font-black text-slate-800 arabic-font">{t.arabicParsing}</h4>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {result.arabicBreakdown.length} كلمات
                      </span>
                    </div>

                    <div className="space-y-2">
                      {result.arabicBreakdown.map((item, idx) => (
                        <div 
                          key={idx} 
                          className="py-2 border-b border-slate-100 last:border-b-0 flex items-baseline gap-2 text-right"
                        >
                          <span className="text-blue-900 font-black text-base arabic-font shrink-0">
                            {item.word}:
                          </span>
                          <span className="text-slate-800 font-bold text-xs sm:text-sm arabic-font leading-relaxed flex-1">
                            {item.irab}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. ENGLISH BREAKDOWN (LTR - Each word on a clean line without rectangles or circular numbering) */}
                {result?.englishBreakdown && result.englishBreakdown.length > 0 && (
                  <div className="bg-white p-4 rounded-2xl border border-emerald-100/80 shadow-sm space-y-3" dir="ltr">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-black">
                          <Globe size={13} />
                        </div>
                        <h4 className="text-xs font-black text-slate-800 font-sans tracking-tight">{t.englishParsing}</h4>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-sans">
                        English
                      </span>
                    </div>

                    {/* Sentence English Meaning */}
                    {result.meaningEn && (
                      <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/60 text-left">
                        <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block mb-0.5 font-sans">
                          Sentence Meaning:
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-slate-900 font-sans leading-relaxed">
                          &ldquo;{result.meaningEn}&rdquo;
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      {result.englishBreakdown.map((item, idx) => (
                        <div 
                          key={idx} 
                          className="py-2 border-b border-slate-100 last:border-b-0 flex items-baseline gap-2 text-left font-sans"
                        >
                          <span className="text-emerald-950 font-bold text-xs sm:text-sm shrink-0">
                            {item.roman ? `${item.roman} (${item.word})` : item.word}:
                          </span>
                          <span className="text-slate-800 font-medium text-xs sm:text-sm font-sans leading-relaxed flex-1">
                            {item.irabEn}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fallback Text result if any */}
                {rawTextResult && (
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-right arabic-font text-sm leading-relaxed whitespace-pre-wrap">
                    {rawTextResult}
                  </div>
                )}

                {/* Bottom Action: Parse Another Sentence */}
                <button 
                  onClick={() => { setResult(null); setRawTextResult(null); setInput(''); }}
                  className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 active:scale-98 rounded-xl text-xs font-black text-slate-700 hover:text-blue-600 transition-all arabic-font shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={14} />
                  <span>{t.parseAnother}</span>
                </button>
              </div>
            )}
          </div>

          {/* Input Footer Form */}
          <div className="p-3.5 sm:p-4 bg-white border-t border-slate-100 shadow-md">
            <form onSubmit={(e) => handleParse(e)} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.placeholder}
                className={`flex-1 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold arabic-font outline-none focus:ring-4 focus:ring-blue-100 transition-all ${lang === 'ar' ? 'text-right' : 'text-left'}`}
              />
              <button 
                disabled={loading || !input.trim()}
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl shadow-md disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center shrink-0"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className={lang === 'ar' ? 'rotate-180' : ''} />}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

