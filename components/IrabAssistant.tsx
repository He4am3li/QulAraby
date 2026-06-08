
import React from 'react';
import { X, Send, Loader2, MessageCircle } from 'lucide-react';
import { parseArabicSentence } from '../services/gemini';
import ReactMarkdown from 'react-markdown';

export const IrabAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [input, setInput] = React.useState('');
  const [result, setResult] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [lang, setLang] = React.useState<'ar' | 'en'>(
    (localStorage.getItem('hub_lang') as 'ar' | 'en') || 'ar'
  );

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
    grammarParser: lang === 'ar' ? 'Arabic Grammar Parser' : 'Arabic Grammar Parser',
    placeholder: lang === 'ar' ? 'أدخل الجملة المراد إعرابها...' : 'Enter the sentence to be parsed...',
    analyzing: lang === 'ar' ? 'جاري التحليل النحوي للجملة...' : 'Analyzing the sentence grammatically...',
    enterSentence: lang === 'ar' ? 'تفضل بإدخال الجملة العربية التي ترغب في تحليلها وإعرابها' : 'Please enter the Arabic sentence you wish to analyze and parse.',
    parseAnother: lang === 'ar' ? 'إعراب جملة أخرى | Parse another sentence' : 'Parse another sentence',
    error: lang === 'ar' ? 'عذراً، حدث خطأ أثناء محاولة الإعراب.' : 'Sorry, an error occurred while parsing.',
  };

  const handleParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await parseArabicSentence(input);
      setResult(res);
    } catch (error) {
      setResult(t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed bottom-32 ${lang === 'ar' ? 'left-16' : 'right-16'} z-[100] no-print`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex flex-col items-center animate-float"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2563eb] to-[#059669] shadow-[0_12px_40px_rgba(37,99,235,0.25)] border border-white/30 overflow-hidden transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 active:scale-95 flex flex-col items-center justify-center relative">
            {/* Subtle glass effect */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
            
            <span className={`${lang === 'ar' ? 'text-2xl' : 'text-lg'} text-white font-bold handwritten-font select-none tracking-tight drop-shadow-lg`}>
              {t.parsing}
            </span>
            
            <div className="absolute top-3 right-3 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full animate-pulse shadow-sm z-10" />
          </div>
          <div className="mt-3 px-4 py-1.5 bg-white/90 backdrop-blur-md text-[#1e40af] text-[10px] font-black rounded-full shadow-lg arabic-font border border-blue-100/50 transition-all group-hover:bg-blue-600 group-hover:text-white">
            {t.helpMeWith}
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 md:w-96 bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
          <div className="bg-gradient-to-r from-[#2563eb] to-[#059669] p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2563eb] to-[#059669] border border-white/30 flex items-center justify-center overflow-hidden shadow-sm">
                <span className="text-xl text-white font-bold handwritten-font select-none">ع</span>
              </div>
              <div className="text-right">
                <h4 className="text-sm font-black arabic-font">{t.helpMeWithParsing}</h4>
                <p className="text-[8px] opacity-80 uppercase font-bold">{t.grammarParser}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 h-96 overflow-y-auto custom-scroll bg-slate-50/50">
            {!result && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
                  <Send size={24} className={`text-slate-400 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                </div>
                <p className="text-xs font-black arabic-font text-slate-500">{t.enterSentence}</p>
              </div>
            )}

            {loading && (
              <div className="h-full flex flex-col items-center justify-center space-y-3">
                <Loader2 className="animate-spin text-blue-500" size={32} />
                <p className="text-[10px] font-black arabic-font text-slate-400 animate-pulse">{t.analyzing}</p>
              </div>
            )}

            {result && (
              <div className="animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-right">
                  <div className="text-sm arabic-font leading-relaxed space-y-2">
                    <ReactMarkdown 
                      components={{
                        p: ({children}) => <p className="mb-2">{children}</p>,
                        ul: ({children}) => <ul className="list-none p-0 m-0 space-y-2">{children}</ul>,
                        li: ({children}) => (
                          <li className="bg-blue-50/50 p-2 rounded-lg border border-blue-100/30 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                            <span>{children}</span>
                          </li>
                        )
                      }}
                    >
                      {result}
                    </ReactMarkdown>
                  </div>
                </div>
                <button 
                  onClick={() => { setResult(null); setInput(''); }}
                  className="mt-4 w-full py-3 bg-white border border-slate-100 rounded-xl text-[10px] font-black text-blue-600 hover:bg-blue-50 transition-all arabic-font shadow-sm"
                >
                  {t.parseAnother}
                </button>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-slate-100">
            <form onSubmit={handleParse} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.placeholder}
                className={`flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold arabic-font outline-none focus:ring-2 focus:ring-blue-100 transition-all ${lang === 'ar' ? 'text-right' : 'text-left'}`}
              />
              <button 
                disabled={loading || !input.trim()}
                type="submit"
                className="bg-blue-600 text-white p-2 rounded-xl shadow-md disabled:opacity-50 active:scale-95 transition-all"
              >
                <Send size={18} className={lang === 'ar' ? 'rotate-180' : ''} />
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
