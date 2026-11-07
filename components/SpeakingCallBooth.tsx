import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Phone, PhoneCall, PhoneOff, Mic, MicOff, RotateCcw, Headphones, Volume2, BookOpen, ArrowUpRight, Signal, CircleHelp, Disc3 } from 'lucide-react';
import './SpeakingCallBooth.css';

export const CALL_CONTACTS = [
  {
    id: 'restaurant', extension: '101', ar: 'مطعم الياسمين', en: 'Jasmine Restaurant',
    agentAr: 'موظف الاستقبال', agentEn: 'Restaurant receptionist', symbol: '✦',
    aimAr: 'احجز طاولة لشخصين، وحدد اليوم والوقت.', aimEn: 'Reserve a table for two and choose a date and time.',
    objectivesAr: ['اطلب طاولة', 'حدد عدد الأشخاص', 'حدد موعد الحجز'],
    objectivesEn: ['Request a table', 'Specify the number of guests', 'Set a reservation time'],
    complication: 'If the learner completes the basic request, say the requested time is unavailable and offer a different time.',
    accent: '#d9ad74',
  },
  {
    id: 'hotel', extension: '202', ar: 'فندق الواحة', en: 'Oasis Hotel',
    agentAr: 'موظف الاستقبال', agentEn: 'Hotel receptionist', symbol: '◈',
    aimAr: 'استفسر عن غرفة وحدد عدد الليالي.', aimEn: 'Ask about a room and specify the length of stay.',
    objectivesAr: ['اسأل عن غرفة', 'حدد عدد الليالي', 'استفسر عن السعر'],
    objectivesEn: ['Ask about a room', 'Specify the nights', 'Ask about the price'],
    complication: 'If the learner manages the initial request, offer a different room type and invite a decision.',
    accent: '#a6c5cb',
  },
  {
    id: 'friend', extension: '303', ar: 'صديقك أحمد', en: 'Your friend Ahmed',
    agentAr: 'أحمد', agentEn: 'Ahmed', symbol: '✳',
    aimAr: 'رتب نزهة مع صديقك في نهاية الأسبوع.', aimEn: 'Plan a weekend outing with a friend.',
    objectivesAr: ['سلّم على صديقك', 'اقترح نشاطًا', 'اتفق على موعد'],
    objectivesEn: ['Greet your friend', 'Suggest an activity', 'Agree on a time'],
    complication: 'If the learner proposes an outing, say you have a conflicting appointment and suggest an alternative.',
    accent: '#b9c69c',
  },
  {
    id: 'support', extension: '404', ar: 'خدمة العملاء', en: 'Customer Service',
    agentAr: 'ممثل خدمة العملاء', agentEn: 'Customer service agent', symbol: '⌁',
    aimAr: 'اشرح مشكلة في طلبك واقترح حلًا مناسبًا.', aimEn: 'Explain a problem with an order and propose a solution.',
    objectivesAr: ['عرّف بالمشكلة', 'اذكر التفاصيل', 'اطلب حلًا'],
    objectivesEn: ['Describe the problem', 'Provide details', 'Request a solution'],
    complication: 'Ask one follow-up question about the problem, then suggest a reasonable resolution.',
    accent: '#d6b6aa',
  },
] as const;

export type CallContact = typeof CALL_CONTACTS[number];
type CallTurn = { role: 'user' | 'ai'; text: string };
interface CallBoothProps {
  lang: 'ar' | 'en';
  contact: CallContact;
  level: string;
  isActive: boolean;
  loading: boolean;
  isAiSpeaking: boolean;
  micMuted: boolean;
  recoveryNotice: string | null;
  history: CallTurn[];
  learnerText: string;
  tutorText: string;
  onSelectContact: (id: CallContact['id']) => void;
  onStart: () => void;
  onStop: () => void;
  onResume: () => void;
  onToggleMic: () => void;
  meterRef: React.RefObject<HTMLDivElement | null>;
}

const DIGITS = ['1','2','3','4','5','6','7','8','9','*','0','#'];

export const SpeakingCallBooth: React.FC<CallBoothProps> = ({
  lang, contact, level, isActive, loading, isAiSpeaking, micMuted, recoveryNotice,
  history, learnerText, tutorText, onSelectContact, onStart, onStop, onResume, onToggleMic, meterRef,
}) => {
  const [dialed, setDialed] = React.useState('');
  const [dialError, setDialError] = React.useState('');
  const [showScript, setShowScript] = React.useState(false);
  const [hasInteracted, setHasInteracted] = React.useState(false);
  const toneContextRef = React.useRef<AudioContext | null>(null);
  const tickerRef = React.useRef<HTMLDivElement | null>(null);
  const sessionLive = isActive || loading;
  const isArabic = lang === 'ar';
  const allTurns = [
    ...history.filter(item => item.text.trim()),
    ...(learnerText.trim() ? [{ role: 'user' as const, text: learnerText }] : []),
    ...(tutorText.trim() ? [{ role: 'ai' as const, text: tutorText }] : []),
  ];
  React.useEffect(() => {
    setDialed(contact.extension);
    setDialError('');
    setHasInteracted(false);
    setShowScript(false);
  }, [contact.id]);
  React.useEffect(() => {
    if (!tickerRef.current || !showScript) return;
    tickerRef.current.scrollTop = tickerRef.current.scrollHeight;
  }, [history.length, learnerText, tutorText, showScript]);
  React.useEffect(() => () => {
    void toneContextRef.current?.close().catch(() => undefined);
    toneContextRef.current = null;
  }, []);

  const beep = (frequency: number, duration = 0.11) => {
    try {
      const AudioClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioClass) return;
      const audio = toneContextRef.current || new AudioClass();
      toneContextRef.current = audio;
      void audio.resume();
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.06, audio.currentTime + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start();
      oscillator.stop(audio.currentTime + duration + 0.01);
    } catch { /* An unavailable audio device must never block the call. */ }
  };
  const ring = () => {
    // Original, locally generated telephone rings with no external audio downloads.
    try {
      const AudioClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioClass) return;
      const audio = toneContextRef.current || new AudioClass();
      toneContextRef.current = audio;
      void audio.resume();
      [0, 0.55, 1.1].forEach((offset) => {
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = 440;
        gain.gain.setValueAtTime(0.0001, audio.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.06, audio.currentTime + offset + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + offset + 0.26);
        oscillator.connect(gain);
        gain.connect(audio.destination);
        oscillator.start(audio.currentTime + offset);
        oscillator.stop(audio.currentTime + offset + 0.27);
      });
    } catch { /* Fall back to visual ringing. */ }
  };
  const dialKey = (key: string) => {
    if (sessionLive) return;
    setDialError('');
    beep(key === '*' ? 350 : key === '#' ? 670 : 370 + Number(key) * 55);
    if (key === '*') { setDialed(''); return; }
    if (key === '#') {
      const match = CALL_CONTACTS.find(entry => entry.extension === dialed);
      if (match) { onSelectContact(match.id); setDialed(match.extension); }
      else setDialError(isArabic ? 'هذا الرقم غير موجود في الدليل.' : 'This extension is not in the directory.');
      return;
    }
    setDialed(current => (current + key).slice(-3));
  };
  const beginCall = () => {
    if (sessionLive) return;
    const match = CALL_CONTACTS.find(entry => entry.extension === dialed);
    if (!match) {
      setDialError(isArabic ? 'اختر رقمًا من دليل المكالمات أولًا.' : 'Choose a number from the directory first.');
      beep(210, 0.21);
      return;
    }
    if (match.id !== contact.id) {
      onSelectContact(match.id);
      setDialError(isArabic ? 'تم اختيار الجهة الجديدة. اضغط الاتصال مجددًا.' : 'Contact selected. Press call again.');
      return;
    }
    setHasInteracted(true);
    setShowScript(true);
    ring();
    onStart();
  };
  const endCall = () => {
    beep(240, 0.15);
    onStop();
  };
  const stateText = loading
    ? (isArabic ? 'جارٍ توصيل المكالمة' : 'CONNECTING')
    : isActive
      ? isAiSpeaking
        ? (isArabic ? 'الطرف الآخر يتحدث' : 'AGENT SPEAKING')
        : micMuted
          ? (isArabic ? 'الميكروفون مغلق' : 'MIC MUTED')
          : (isArabic ? 'المكالمة متصلة' : 'CONNECTED')
      : recoveryNotice
        ? (isArabic ? 'انقطع الاتصال' : 'LINE INTERRUPTED')
        : (isArabic ? 'جاهز للاتصال' : 'LINE READY');
  return (
    <div className="qul-call-world" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="qul-call-atmosphere" aria-hidden="true" />
      <div className="qul-call-heading">
        <div className="qul-call-heading-title">
          <span className="qul-call-eyebrow">QUL TELEPHONE EXCHANGE · 01</span>
          <h2>{isArabic ? 'كابينة الاتصال' : 'The Call Booth'}</h2>
          <p>{isArabic ? 'ارفع السماعة وتحدث بالعربية لإنجاز مهمتك.' : 'Pick up the handset and complete a real speaking mission.'}</p>
        </div>
        <div className={'qul-call-online ' + (isActive ? 'connected' : '')}>
          <span aria-hidden="true" />
          <strong>{stateText}</strong>
        </div>
      </div>

      <div className="qul-call-stage">
        <div className="qul-call-device-area">
          <div className="qul-call-floor-light" aria-hidden="true" />
          <div className="qul-call-cabinet">
            <div className="qul-call-cabinet-rails" aria-hidden="true" />
            <div className="qul-call-plate-top">
              <span>QUL · 1968</span><span className="qul-call-metal-dot" /><span>PRIVATE LANGUAGE EXCHANGE</span>
            </div>
            <motion.div
              className={'qul-call-handset ' + (sessionLive ? 'lifted' : '')}
              animate={sessionLive ? { y: -43, rotate: -6, x: -11 } : { y: 0, rotate: 0, x: 0 }}
              transition={{ type: 'spring', mass: 0.9, stiffness: 170, damping: 16 }}
              aria-hidden="true">
              <div className="qul-call-ear"><span>••••</span></div>
              <div className="qul-call-handle"><div className="qul-call-handle-band" /></div>
              <div className="qul-call-ear"><span>••••</span></div>
            </motion.div>
            <div className="qul-call-rest" aria-hidden="true"><i /><i /></div>

            <div className="qul-call-console">
              <div className="qul-call-console-led">
                <span className={'qul-call-led ' + (isActive ? 'is-on' : loading ? 'is-ringing' : '')} />
                <span>LIVE LINE</span>
                <span>{level.toUpperCase()}</span>
              </div>
              <div className="qul-call-screen">
                <span className="qul-call-screen-label">{isArabic ? 'الجهة المحددة' : 'SELECTED CONTACT'}</span>
                <strong className="qul-call-screen-name">{isArabic ? contact.ar : contact.en}</strong>
                <div className="qul-call-screen-extension" dir="ltr">
                  <span>EXT</span>
                  <strong>{dialed || '···'}</strong>
                  <span className={isActive ? 'qul-call-screen-signal live' : 'qul-call-screen-signal'}><Signal size={17}/></span>
                </div>
                <div className="qul-call-screen-status" aria-live="polite">{dialError || stateText}</div>
              </div>

              <div className="qul-call-keypad" dir="ltr">
                {DIGITS.map(key => (
                  <button type="button" key={key} className="qul-call-key" disabled={sessionLive}
                    onClick={() => dialKey(key)} aria-label={key === '*' ? (isArabic ? 'مسح الرقم' : 'Clear') : key === '#' ? (isArabic ? 'اختيار الرقم' : 'Select extension') : key}>
                    <span>{key}</span>
                    <small>{key === '*' ? 'CLEAR' : key === '#' ? 'ENTER' : key === '0' ? 'OPER' : ''}</small>
                  </button>
                ))}
              </div>
              <div className="qul-call-device-controls">
                <button type="button" className="qul-call-connect" onClick={beginCall} disabled={sessionLive} aria-label={isArabic ? 'إجراء الاتصال' : 'Place call'}>
                  <PhoneCall size={21} /> <span>{isArabic ? 'اتصال' : 'CALL'}</span>
                </button>
                <button type="button" className="qul-call-end" onClick={endCall} disabled={!isActive && !loading && !recoveryNotice} aria-label={isArabic ? 'إنهاء المكالمة' : 'End call'}>
                  <PhoneOff size={21} /> <span>{isArabic ? 'إنهاء' : 'END'}</span>
                </button>
              </div>
            </div>
            <div className="qul-call-device-bottom"><span>VOICE STUDIO</span><span>MADE FOR SPEAKING</span></div>
          </div>
          <div className="qul-call-cord" aria-hidden="true"><svg viewBox="0 0 160 100" preserveAspectRatio="none"><path d="M5 4 C5 30 45 24 45 49 S81 78 86 41 S137 14 155 86" /></svg></div>
        </div>

        <div className="qul-call-mission-area">
          <section className="qul-call-mission-ticket" aria-label={isArabic ? 'مهمة المكالمة' : 'Call mission'}>
            <div className="qul-call-ticket-top"><span>CALL SHEET / {contact.extension}</span><span>QUL</span></div>
            <div className="qul-call-ticket-content">
              <span className="qul-call-ticket-kicker">{isArabic ? 'مهمتك اليوم' : 'TODAY’S MISSION'}</span>
              <h3>{isArabic ? contact.ar : contact.en}</h3>
              <p>{isArabic ? contact.aimAr : contact.aimEn}</p>
              <div className="qul-call-ticket-rules">
                {(isArabic ? contact.objectivesAr : contact.objectivesEn).map((item, index) => (
                  <div key={index} className="qul-call-rule"><span>0{index + 1}</span><p>{item}</p></div>
                ))}
              </div>
              <div className="qul-call-ticket-foot">
                <CircleHelp size={14} />
                <span>{isArabic ? 'يمكنك طلب المساعدة بالإنجليزية عند الحاجة.' : 'Ask for an English hint whenever needed.'}</span>
              </div>
            </div>
            <div className="qul-call-ticket-tear" aria-hidden="true" />
          </section>

          <section className="qul-call-transcript-shell" aria-label={isArabic ? 'سجل المكالمة' : 'Call log'}>
            <div className="qul-call-log-header">
              <div><span className="qul-call-led is-on" /><strong>{isArabic ? 'سجل المكالمة' : 'CALL LOG'}</strong></div>
              <button type="button" className="qul-call-log-toggle" onClick={() => setShowScript(value => !value)}
                aria-expanded={showScript}>
                <BookOpen size={15}/>{showScript ? (isArabic ? 'إخفاء' : 'HIDE') : (isArabic ? 'عرض' : 'SHOW')}
              </button>
            </div>
            <AnimatePresence initial={false}>
              {showScript && (
                <motion.div key="call-log" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }} className="qul-call-log-expand">
                  <div className="qul-call-log-list" ref={tickerRef}>
                    {allTurns.length ? allTurns.slice(-12).map((turn, idx) => (
                      <div className={'qul-call-log-entry ' + (turn.role === 'ai' ? 'agent' : 'learner')} key={idx}>
                        <span>{turn.role === 'ai' ? (isArabic ? contact.agentAr : contact.agentEn) : (isArabic ? 'أنت' : 'YOU')}</span>
                        <p dir="auto">{turn.text}</p>
                      </div>
                    )) : <p className="qul-call-log-empty">{isArabic ? 'يظهر الحوار هنا بعد بدء الاتصال.' : 'The conversation will appear after connecting.'}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="qul-call-audio-strip">
              <div ref={meterRef} className="qul-call-audio-meter" style={{ '--phone-mic': 0.12 } as React.CSSProperties} aria-label={isArabic ? 'مؤشر الميكروفون الحي' : 'Live microphone meter'}>
                {Array.from({length: 21}, (_, index) => (
                  <i key={index} style={{ height: (9 + Math.abs(Math.sin(index * 0.55)) * 18) + 'px', transform: 'scaleY(var(--phone-mic, .12))' }} />
                ))}
              </div>
              <span>{isActive ? (isAiSpeaking ? (isArabic ? 'استمع إلى الرد' : 'LISTEN TO THE REPLY') : (isArabic ? 'تحدث الآن' : 'YOUR TURN')) : (isArabic ? 'في انتظار المكالمة' : 'STANDBY')}</span>
            </div>
            <div className="qul-call-controls">
              <button type="button" disabled={!isActive} onClick={onToggleMic} className={micMuted ? 'qul-call-muted' : ''}>
                {micMuted ? <MicOff size={17} /> : <Mic size={17}/>}
                {micMuted ? (isArabic ? 'تشغيل الميكروفون' : 'Unmute') : (isArabic ? 'كتم الميكروفون' : 'Mute')}
              </button>
              {recoveryNotice && !isActive && (
                <button type="button" disabled={loading} onClick={onResume} className="qul-call-retry">
                  <RotateCcw size={16} />{isArabic ? 'إعادة الاتصال' : 'Reconnect'}
                </button>
              )}
            </div>
            {recoveryNotice && !isActive && <p className="qul-call-warning" role="alert">{recoveryNotice}</p>}
          </section>
        </div>
      </div>
      <div className="qul-call-bottom-line"><span>QUL / SPEAK WITH PURPOSE</span><span>{isArabic ? 'أرقام داخلية للتدريب فقط، وليست اتصالات هاتفية حقيقية.' : 'Training extensions only, not real telephone calls.'}</span></div>
    </div>
  );
};
