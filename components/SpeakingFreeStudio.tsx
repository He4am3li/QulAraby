import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Check, ChevronDown, Headphones, Languages, Loader2, MessageSquareText, Mic, MicOff, PenLine, Send, X } from 'lucide-react';
import { StudioMicIcon } from './StudioMicIcon';
import './SpeakingFreeStudio.css';

export type FreeStudioTurn = { role: 'user' | 'ai'; text: string; modality?: 'speech' | 'text' };

interface FreeStudioProps {
  lang: 'ar' | 'en';
  topic: string;
  level: string;
  isActive: boolean;
  loading: boolean;
  isFinishing: boolean;
  isAiSpeaking: boolean;
  micMuted: boolean;
  recoveryNotice: string | null;
  history: FreeStudioTurn[];
  learnerText: string;
  tutorText: string;
  meterRef: React.RefObject<HTMLDivElement | null>;
  onResume: () => void;
  onStop: () => void;
  onToggleMic: () => void;
  onSendText: (text: string) => boolean;
  onTranslate: (text: string) => Promise<string>;
  onStartSpelling: (text: string) => void;
  isGeneratingChallenge: boolean;
  children?: React.ReactNode;
}

type ToolPanel = 'type' | 'help' | 'translation' | 'history' | null;
const HELP_LINES = [
  { ar: 'هل يمكنك إعادة السؤال؟', en: 'Could you repeat the question?' },
  { ar: 'أحتاج إلى مثال، من فضلك.', en: 'I need an example, please.' },
  { ar: 'كيف أقول هذا بالعربية؟', en: 'How do I say this in Arabic?' },
];

export const SpeakingFreeStudio: React.FC<FreeStudioProps> = ({
  lang, topic, level, isActive, loading, isFinishing, isAiSpeaking, micMuted, recoveryNotice,
  history, learnerText, tutorText, meterRef, onResume, onStop, onToggleMic,
  onSendText, onTranslate, onStartSpelling, isGeneratingChallenge, children
}) => {
  const ar = lang === 'ar';
  const [dockOpen, setDockOpen] = React.useState(false);
  const [panel, setPanel] = React.useState<ToolPanel>(null);
  const [draft, setDraft] = React.useState('');
  const [translation, setTranslation] = React.useState<{ source: string; text: string } | null>(null);
  const [translating, setTranslating] = React.useState(false);
  const [sendError, setSendError] = React.useState('');
  const translationRequest = React.useRef(0);
  const transcriptRef = React.useRef<HTMLDivElement>(null);

  const turns: FreeStudioTurn[] = [
    ...history,
    ...(learnerText.trim() ? [{ role: 'user' as const, text: learnerText }] : []),
    ...(tutorText.trim() ? [{ role: 'ai' as const, text: tutorText }] : [])
  ];
  const latest = [...turns].reverse().find(turn => turn.text.trim());
  const latestTutor = [...turns].reverse().find(turn => turn.role === 'ai' && turn.text.trim());
  const visible = panel === 'history' ? turns.slice(-18) : turns.slice(-4);

  React.useEffect(() => {
    if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [turns.length, learnerText, tutorText, panel]);

  React.useEffect(() => () => { translationRequest.current += 1; }, []);

  const choosePanel = (next: ToolPanel) => {
    setDockOpen(true);
    setPanel(current => current === next ? null : next);
    setSendError('');
  };

  const sendMessage = (event: React.FormEvent) => {
    event.preventDefault();
    const value = draft.trim();
    if (!value || !isActive || loading) return;
    if (onSendText(value)) {
      setDraft('');
      setSendError('');
      setPanel(null);
    } else {
      setSendError(ar ? 'تعذر إرسال الرسالة. تأكد من اتصال المحادثة وحاول مرة أخرى.' : 'Message not sent. Check the connection and try again.');
    }
  };

  const selectHelp = (value: string) => {
    setDraft(value);
    setPanel('type');
    setDockOpen(true);
  };

  const showTranslation = async () => {
    setDockOpen(true);
    setPanel('translation');
    if (!latest?.text.trim()) return;
    const source = latest.text.trim();
    if (translation?.source === source) return;
    const request = ++translationRequest.current;
    setTranslating(true);
    setTranslation(null);
    try {
      const text = await onTranslate(source);
      if (translationRequest.current === request) {
        setTranslation({ source, text: text.trim() || (ar ? 'لا تتوفر ترجمة الآن.' : 'Translation unavailable.') });
      }
    } catch {
      if (translationRequest.current === request) {
        setTranslation({ source, text: ar ? 'تعذر جلب الترجمة. أعد المحاولة.' : 'Translation failed. Please retry.' });
      }
    } finally {
      if (translationRequest.current === request) setTranslating(false);
    }
  };

  return (
    <section className="qul-free-studio" dir={ar ? 'rtl' : 'ltr'} aria-label={ar ? 'المحادثة الحرة المباشرة' : 'Live free conversation'} data-testid="free-speaking-studio">
      <div className="qul-free-haze" aria-hidden="true" />
      <header className="qul-free-top">
        <div className="qul-free-heading">
          <span className={'qul-free-live-dot' + (isActive ? ' is-on' : '')} aria-hidden="true" />
          <div>
            <strong>{topic}</strong>
            <small>{level} <span aria-hidden="true">·</span> {micMuted ? (ar ? 'الميكروفون مكتوم' : 'Mic muted') : isAiSpeaking ? (ar ? 'المعلم يتحدث' : 'Tutor speaking') : isActive ? (ar ? 'جاهز للاستماع' : 'Listening') : (ar ? 'غير متصل' : 'Disconnected')}</small>
          </div>
        </div>
        <span className="qul-free-session-hint">{isFinishing ? (ar ? 'جارٍ حفظ الجلسة' : 'Saving session') : isActive ? (ar ? 'المحادثة جارية' : 'Session in progress') : (ar ? 'جاهز' : 'Ready')}</span>
      </header>

      {recoveryNotice && !isActive && (
        <div role="alert" className="qul-free-recovery">
          <p>{recoveryNotice}</p>
          <button type="button" disabled={loading} onClick={onResume}>
            {loading ? <Loader2 size={16} className="qul-free-spin" /> : <Headphones size={16} />}
            {ar ? 'استئناف الحوار' : 'Reconnect'}
          </button>
        </div>
      )}

      <div className="qul-free-center">
        <div className={'qul-free-orbit ' + (isAiSpeaking ? 'is-talking' : isActive && !micMuted ? 'is-listening' : 'is-idle')} aria-label={ar ? 'مؤشر الصوت المباشر' : 'Live audio indicator'}>
          <span className="qul-free-orbit-ring" aria-hidden="true" />
          <span className="qul-free-orbit-ring inner" aria-hidden="true" />
          <div className="qul-free-core">
            <StudioMicIcon size={31} strokeWidth={1.6} />
            <div ref={meterRef} className="qul-free-meter" style={{ '--mic-scale': 0.12 } as React.CSSProperties} aria-hidden="true">
              {Array.from({ length: 17 }, (_, index) => (
                <i key={index} style={{ height: 9 + Math.round(22 * Math.abs(Math.sin((index + 1) * .51))) + 'px', '--index': index } as React.CSSProperties} />
              ))}
            </div>
          </div>
        </div>

        <div ref={transcriptRef} className={'qul-free-dialogue ' + (panel === 'history' ? 'qul-free-dialogue-expanded' : '')} role="log" aria-live="polite" aria-label={ar ? 'عبارات المحادثة' : 'Conversation lines'}>
          {visible.length ? visible.map((turn, index) => (
            <motion.div key={String(turns.length - visible.length + index) + ':' + turn.role}
              className={'qul-free-line ' + (turn.role === 'ai' ? 'is-tutor' : 'is-learner')}
              initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .2 }}>
              <span className="qul-free-speaker">{turn.role === 'ai' ? (ar ? 'المعلم' : 'Tutor') : (ar ? 'أنت' : 'You')}
                {turn.modality === 'text' && <em>{ar ? 'كتابة' : 'Typed'}</em>}
              </span>
              <p dir="auto">{turn.text}</p>
            </motion.div>
          )) : (
            <p className="qul-free-empty">{ar ? 'ستظهر عبارات المحادثة هنا عند بدء الحديث.' : 'Your conversation appears here as you speak.'}</p>
          )}
        </div>
      </div>

      {children && <div className="qul-free-challenge">{children}</div>}

      <AnimatePresence mode="wait" initial={false}>
        {panel && (
          <motion.div key={panel} className="qul-free-tools-panel"
            initial={{ opacity: 0, y: 12, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 6, height: 0 }} transition={{ duration: .19 }}>
            <div className="qul-free-panel-heading">
              <strong>{panel === 'type' ? (ar ? 'اكتب ردك' : 'Write your reply')
                : panel === 'help' ? (ar ? 'عبارات مساعدة' : 'Helpful phrases')
                : panel === 'translation' ? (ar ? 'ترجمة آخر عبارة' : 'Latest line translation')
                : (ar ? 'سجل المحادثة' : 'Conversation history')}</strong>
              <button type="button" onClick={() => setPanel(null)} aria-label={ar ? 'إغلاق اللوحة' : 'Close panel'}><X size={16}/></button>
            </div>
            {panel === 'type' && (
              <form className="qul-free-compose" onSubmit={sendMessage}>
                <input type="text" value={draft} onChange={event => setDraft(event.target.value)}
                  maxLength={500} autoComplete="off" dir="auto"
                  placeholder={ar ? 'اكتب جملة أو سؤالًا...' : 'Type a sentence or question...'}
                  aria-label={ar ? 'رسالة الطالب المكتوبة' : 'Typed student message'} />
                <button type="submit" disabled={!isActive || loading || isAiSpeaking || !draft.trim()} aria-label={ar ? 'إرسال' : 'Send'}>
                  <Send size={18} />
                </button>
                {sendError && <p className="qul-free-compose-error" role="alert">{sendError}</p>}
                <small>{isAiSpeaking ? (ar ? 'أكمل بعد انتهاء رد المعلم.' : 'Continue when the tutor finishes speaking.') : (ar ? 'الردود المكتوبة لا تُحتسب ممارسة شفوية.' : 'Typed replies do not count as spoken practice.')}</small>
              </form>
            )}
            {panel === 'help' && (
              <div className="qul-free-help">
                {HELP_LINES.map(line => (
                  <button type="button" key={line.ar} onClick={() => selectHelp(line.ar)}>
                    <span dir="rtl">{line.ar}</span><small dir="ltr">{line.en}</small>
                  </button>
                ))}
              </div>
            )}
            {panel === 'translation' && (
              <div className="qul-free-translation" aria-live="polite">
                {!latest ? <p>{ar ? 'تحدث أولًا لتظهر عبارة يمكن ترجمتها.' : 'Speak first to translate a line.'}</p>
                  : translating ? <p><Loader2 size={15} className="qul-free-spin" />{ar ? 'تُترجم العبارة...' : 'Translating...'}</p>
                  : translation?.source === latest.text.trim() ? <p dir="auto">{translation.text}</p>
                  : <button type="button" onClick={showTranslation}>{ar ? 'إعادة محاولة الترجمة' : 'Retry translation'}</button>}
              </div>
            )}
            {panel === 'history' && (
              <div className="qul-free-history-tools">
                <span>{ar ? 'المحادثة كاملة في تقرير الجلسة.' : 'The complete transcript is included in your session report.'}</span>
                {latestTutor && (
                  <button type="button" disabled={isGeneratingChallenge || isAiSpeaking}
                    onClick={() => onStartSpelling(latestTutor.text)}>
                    {isGeneratingChallenge ? <Loader2 size={15} className="qul-free-spin"/> : <PenLine size={15}/>}
                    {ar ? 'تدرّب على إملاء آخر عبارة' : 'Practice spelling the latest reply'}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="qul-free-dock" data-testid="free-speaking-tool-dock">
        <AnimatePresence initial={false}>
          {dockOpen && (
            <motion.div className="qul-free-dock-actions"
              initial={{ opacity: 0, scale: .92 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: .94 }} transition={{ duration: .16 }}>
              <button type="button" onClick={onToggleMic} disabled={!isActive} aria-pressed={micMuted}
                title={micMuted ? (ar ? 'تشغيل الميكروفون' : 'Unmute') : (ar ? 'كتم الميكروفون' : 'Mute')}
                aria-label={micMuted ? (ar ? 'تشغيل الميكروفون' : 'Unmute microphone') : (ar ? 'كتم الميكروفون' : 'Mute microphone')}
                className={micMuted ? 'is-selected' : ''}>{micMuted ? <MicOff size={19}/> : <Mic size={19}/>}</button>
              <button type="button" onClick={() => choosePanel('type')} aria-pressed={panel === 'type'}
                title={ar ? 'الكتابة' : 'Type'} aria-label={ar ? 'كتابة رسالة' : 'Write a message'}
                className={panel === 'type' ? 'is-selected' : ''}><MessageSquareText size={19}/></button>
              <button type="button" onClick={() => void showTranslation()} aria-pressed={panel === 'translation'}
                title={ar ? 'ترجمة' : 'Translate'} aria-label={ar ? 'ترجمة آخر عبارة' : 'Translate last line'}
                className={panel === 'translation' ? 'is-selected' : ''}><Languages size={19}/></button>
              <button type="button" onClick={() => choosePanel('help')} aria-pressed={panel === 'help'}
                title={ar ? 'مساعدة' : 'Help'} aria-label={ar ? 'عبارات للمساعدة' : 'Helpful phrases'}
                className={panel === 'help' ? 'is-selected' : ''}><BookOpen size={19}/></button>
              <button type="button" onClick={() => choosePanel('history')} aria-pressed={panel === 'history'}
                title={ar ? 'سجل الحوار' : 'Transcript'} aria-label={ar ? 'عرض سجل الحوار' : 'Show transcript'}
                className={panel === 'history' ? 'is-selected' : ''}><PenLine size={19}/></button>
            </motion.div>
          )}
        </AnimatePresence>
        <button type="button" className="qul-free-main-control" onClick={() => { setDockOpen(value => !value); setPanel(null); }}
          aria-expanded={dockOpen} aria-controls="qul-free-dock-label"
          aria-label={dockOpen ? (ar ? 'طي أدوات المحادثة' : 'Collapse conversation tools') : (ar ? 'فتح أدوات المحادثة' : 'Open conversation tools')}>
          {dockOpen ? <ChevronDown size={23}/> : <StudioMicIcon size={25} strokeWidth={1.8}/>}
        </button>
        <span id="qul-free-dock-label" className="qul-free-dock-caption">{ar ? 'أدوات المحادثة' : 'Conversation tools'}</span>
        <button type="button" data-testid="free-speaking-finish" onClick={onStop}
          disabled={isFinishing} className="qul-free-finish"
          aria-label={ar ? 'إنهاء المحادثة وعرض التقرير' : 'Finish conversation and show report'}>
          {isFinishing ? <Loader2 size={15} className="qul-free-spin" aria-hidden="true" /> : <Check size={15} aria-hidden="true" />}
          {isFinishing ? (ar ? 'جارٍ إعداد التقرير...' : 'Preparing report...') : (ar ? 'إنهاء المحادثة وعرض التقرير' : 'Finish & view report')}
        </button>
      </footer>
    </section>
  );
};
