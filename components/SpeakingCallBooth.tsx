import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, Phone, PhoneCall, PhoneOff, Mic, MicOff, RotateCcw, BookOpen, ChevronLeft, Signal, Wifi, BatteryFull, Delete, AudioLines, X, Volume2 } from 'lucide-react';
import { SpeakingPhoneBook } from './SpeakingPhoneBook';
import { validateSimulatedDial } from '../services/speakingDial.mjs';
import './SpeakingCallBooth.css';
import './SpeakingModernPhone.css';

export const CALL_CONTACTS = [
  {
    id: 'restaurant', extension: '101', voice: 'Achird', ar: 'مطعم الياسمين', en: 'Jasmine Restaurant',
    agentAr: 'موظف الاستقبال', agentEn: 'Restaurant receptionist', symbol: '✦',
    aimAr: 'احجز طاولة لشخصين، وحدد اليوم والوقت.', aimEn: 'Reserve a table for two and choose a date and time.',
    objectivesAr: ['اطلب طاولة', 'حدد عدد الأشخاص', 'حدد موعد الحجز'],
    objectivesEn: ['Request a table', 'Specify the number of guests', 'Set a reservation time'],
    complication: 'If the learner completes the basic request, say the requested time is unavailable and offer a different time.',
    accent: '#d9ad74',
  },
  {
    id: 'hotel', extension: '202', voice: 'Charon', ar: 'فندق الواحة', en: 'Oasis Hotel',
    agentAr: 'موظف الاستقبال', agentEn: 'Hotel receptionist', symbol: '◈',
    aimAr: 'استفسر عن غرفة وحدد عدد الليالي.', aimEn: 'Ask about a room and specify the length of stay.',
    objectivesAr: ['اسأل عن غرفة', 'حدد عدد الليالي', 'استفسر عن السعر'],
    objectivesEn: ['Ask about a room', 'Specify the nights', 'Ask about the price'],
    complication: 'If the learner manages the initial request, offer a different room type and invite a decision.',
    accent: '#a6c5cb',
  },
  {
    id: 'friend', extension: '303', voice: 'Puck', ar: 'صديقك أحمد', en: 'Your friend Ahmed',
    agentAr: 'أحمد', agentEn: 'Ahmed', symbol: '✳',
    aimAr: 'رتب نزهة مع صديقك في نهاية الأسبوع.', aimEn: 'Plan a weekend outing with a friend.',
    objectivesAr: ['سلّم على صديقك', 'اقترح نشاطًا', 'اتفق على موعد'],
    objectivesEn: ['Greet your friend', 'Suggest an activity', 'Agree on a time'],
    complication: 'If the learner proposes an outing, say you have a conflicting appointment and suggest an alternative.',
    accent: '#b9c69c',
  },
  {
    id: 'support', extension: '404', voice: 'Rasalgethi', ar: 'خدمة العملاء', en: 'Customer Service',
    agentAr: 'ممثل خدمة العملاء', agentEn: 'Customer service agent', symbol: '⌁',
    aimAr: 'اشرح مشكلة في طلبك واقترح حلًا مناسبًا.', aimEn: 'Explain a problem with an order and propose a solution.',
    objectivesAr: ['عرّف بالمشكلة', 'اذكر التفاصيل', 'اطلب حلًا'],
    objectivesEn: ['Describe the problem', 'Provide details', 'Request a solution'],
    complication: 'Ask one follow-up question about the problem, then suggest a reasonable resolution.',
    accent: '#d6b6aa',
  },

  {
    id: 'taxi', extension: '505', voice: 'Orus', ar: 'مكتب سيارات الأجرة', en: 'Taxi Dispatch',
    agentAr: 'موظف الحجز', agentEn: 'Taxi dispatcher', symbol: '◉',
    aimAr: 'اطلب سيارة أجرة وحدد مكان الانطلاق والوجهة.', aimEn: 'Request a taxi, give a pickup point and a destination.',
    objectivesAr: ['اطلب سيارة', 'اذكر مكان الانطلاق', 'اذكر الوجهة'],
    objectivesEn: ['Request a taxi', 'Name the pickup point', 'Name the destination'],
    complication: 'If the learner completes a basic ride request, explain there is a short delay and ask whether that is acceptable. Do not request an exact home address.',
    accent: '#c4b5d7',
  },
  {
    id: 'clinic', extension: '606', voice: 'Leda', ar: 'العيادة الطبية', en: 'Medical Clinic',
    agentAr: 'موظفة الاستقبال', agentEn: 'Clinic receptionist', symbol: '✚',
    aimAr: 'اطلب موعدًا، واذكر اليوم والوقت المناسبين.', aimEn: 'Ask for an appointment and choose a day and time.',
    objectivesAr: ['اطلب موعدًا', 'حدد اليوم', 'حدد الوقت المناسب'],
    objectivesEn: ['Request an appointment', 'Choose the day', 'Choose a suitable time'],
    complication: 'The preferred time slot is unavailable; offer another slot. This is scheduling roleplay, not medical advice.',
    accent: '#adcac4',
  },
  {
    id: 'library', extension: '707', voice: 'Aoede', ar: 'المكتبة العامة', en: 'Public Library',
    agentAr: 'أمينة المكتبة', agentEn: 'Librarian', symbol: '▤',
    aimAr: 'اسأل عن كتاب، واستفسر عن موعد استعارتِه.', aimEn: 'Ask about a book and when it can be borrowed.',
    objectivesAr: ['اطلب كتابًا', 'اسأل هل هو متاح', 'اسأل عن الاستعارة'],
    objectivesEn: ['Ask for a book', 'Ask if it is available', 'Ask about borrowing'],
    complication: 'Say one book is on loan and suggest a similar topic, then ask if the learner wants the alternative.',
    accent: '#c6b991',
  },
  {
    id: 'bakery', extension: '808', voice: 'Kore', ar: 'مخبز الصباح', en: 'Morning Bakery',
    agentAr: 'موظفة المخبز', agentEn: 'Bakery assistant', symbol: '◒',
    aimAr: 'اطلب خبزًا ومعجنات، واسأل عن الكمية والسعر.', aimEn: 'Order bread and pastries, asking about quantity and price.',
    objectivesAr: ['اطلب صنفًا', 'حدد الكمية', 'اسأل عن السعر'],
    objectivesEn: ['Order an item', 'Specify quantity', 'Ask the price'],
    complication: 'One type of pastry is sold out; suggest a substitute and invite the learner to choose.',
    accent: '#dfb389',
  },
  {
    id: 'school', extension: '909', voice: 'Fenrir', ar: 'مكتب المدرسة', en: 'School Office',
    agentAr: 'موظف شؤون الطلاب', agentEn: 'School office administrator', symbol: '◇',
    aimAr: 'اسأل عن نشاط مدرسي وموعده ومكانه.', aimEn: 'Ask about a school activity, including its time and location.',
    objectivesAr: ['اسأل عن النشاط', 'اسأل عن الموعد', 'اسأل عن المكان'],
    objectivesEn: ['Ask about the activity', 'Ask when it happens', 'Ask where it takes place'],
    complication: 'The venue changed to another room; help the learner confirm the new location.',
    accent: '#abbad8',
  },
  {
    id: 'museum', extension: '110', voice: 'Zephyr', ar: 'متحف المدينة', en: 'City Museum',
    agentAr: 'مرشدة المتحف', agentEn: 'Museum guide', symbol: '❖',
    aimAr: 'استفسر عن زيارة المتحف، وحدد وقت الزيارة وسعر التذكرة.', aimEn: 'Ask about visiting the museum, the opening time and ticket price.',
    objectivesAr: ['اسأل عن الزيارة', 'اسأل عن موعد الفتح', 'اسأل عن التذاكر'],
    objectivesEn: ['Ask about visiting', 'Ask about opening hours', 'Ask about tickets'],
    complication: 'Offer an alternative tour time after the learner asks about visiting. Keep everything fictional.',
    accent: '#c4b2a3',
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
  missionEvidence?: Array<{ goal: string; evidence: string; achieved: boolean }>;
  assessmentStatus?: string;
  onSelectContact: (id: CallContact['id']) => void;
  onStart: () => void;
  onStop: () => void;
  onResume: () => void;
  onToggleMic: () => void;
  meterRef: React.RefObject<HTMLDivElement | null>;
}

const DIAL_KEYS = [
  ['1',''], ['2','ABC'], ['3','DEF'],
  ['4','GHI'], ['5','JKL'], ['6','MNO'],
  ['7','PQRS'], ['8','TUV'], ['9','WXYZ'],
  ['*',''], ['0','+'], ['#',''],
] as const;

export const SpeakingCallBooth: React.FC<CallBoothProps> = ({
  lang, contact, level, isActive, loading, isAiSpeaking, micMuted, recoveryNotice,
  history, learnerText, tutorText, missionEvidence, assessmentStatus,
  onSelectContact, onStart, onStop, onResume, onToggleMic, meterRef,
}) => {
  const ar = lang === 'ar';
  const reducedMotion = useReducedMotion();
  const [bookSelection, setBookSelection] = React.useState<string | null>(null);
  const [dialed, setDialed] = React.useState('');
  const [dialError, setDialError] = React.useState('');
  const [showScript, setShowScript] = React.useState(false);
  const [mobilePane, setMobilePane] = React.useState<'book' | 'phone'>('phone');
  const toneContextRef = React.useRef<AudioContext | null>(null);
  const transcriptRef = React.useRef<HTMLDivElement>(null);

  const busy = loading || isActive;
  const completedGoals = missionEvidence?.filter(item => item.achieved).length || 0;
  const verified = assessmentStatus === 'analyzed' && completedGoals === contact.objectivesAr.length;
  const selected = CALL_CONTACTS.find(item => item.id === bookSelection) || null;
  const allTurns = [
    ...history.filter(item => item.text.trim()),
    ...(learnerText.trim() ? [{ role: 'user' as const, text: learnerText }] : []),
    ...(tutorText.trim() ? [{ role: 'ai' as const, text: tutorText }] : []),
  ];

  React.useEffect(() => {
    if (!transcriptRef.current || !showScript) return;
    transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [history.length, learnerText, tutorText, showScript]);

  React.useEffect(() => () => {
    void toneContextRef.current?.close().catch(() => undefined);
    toneContextRef.current = null;
  }, []);

  const tone = (freq: number, duration = .085) => {
    try {
      const AudioClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioClass) return;
      const ctx: AudioContext = toneContextRef.current || new AudioClass();
      toneContextRef.current = ctx;
      void ctx.resume();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.026, ctx.currentTime + .014);
      gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + duration + .01);
    } catch { /* Muted or unavailable audio must not block a simulated call. */ }
  };

  const selectBookEntry = (entry: CallContact) => {
    if (busy) return;
    setBookSelection(entry.id);
    setDialed('');
    setDialError('');
    setShowScript(false);
    onSelectContact(entry.id);
    // On phones keep the directory visible until the learner chooses the phone tab.
  };

  const dialKey = (digit: string) => {
    if (busy) return;
    setDialError('');
    if (digit === '*') {
      setDialed('');
      tone(330);
      return;
    }
    if (digit === '#') {
      setDialed(value => value.slice(0,-1));
      tone(440);
      return;
    }
    if (!/^[0-9]$/.test(digit)) return;
    tone(390 + Number(digit) * 39);
    setDialed(value => value.length >= 3 ? value : value + digit);
  };

  const startCall = () => {
    if (busy) return;
    const result = validateSimulatedDial({
      selectedId: bookSelection,
      dialed,
      contacts: CALL_CONTACTS,
    });
    if (result !== 'ready') {
      const messages = {
        select_contact: ar ? 'افتح الأجندة واختر جهة الاتصال أولًا.' : 'Open the book and choose a contact first.',
        incomplete: ar ? 'أدخل الرقم المكوّن من ثلاثة أرقام.' : 'Enter the complete three-digit number.',
        wrong_number: ar ? 'الرقم غير مطابق. تحقق من الأجندة وحاول مجددًا.' : 'Wrong number. Check the book and try again.',
      };
      setDialError(messages[result as keyof typeof messages]);
      tone(230,.16);
      return;
    }
    setDialError('');
    setShowScript(true);
    onStart();
  };
  const endCall = () => {
    tone(260,.13);
    onStop();
  };
  const statusText = loading
    ? (ar ? 'جارٍ الاتصال...' : 'Connecting...')
    : isActive ? (ar ? 'المكالمة جارية' : 'Call connected')
    : recoveryNotice ? (ar ? 'انقطع الاتصال' : 'Connection interrupted')
    : (ar ? 'جاهز للاتصال' : 'Ready to dial');

  return (
    <div className="qul-call-world qul-call-modern" dir={ar ? 'rtl' : 'ltr'}>
      <div className="qul-call-atmosphere" aria-hidden="true"/>
      <header className="qul-call-heading">
        <div className="qul-call-heading-title">
          <span className="qul-call-eyebrow">QUL · SPEAKING EXPERIENCES</span>
          <h2>{ar ? 'كابينة الاتصال' : 'The Call Booth'}</h2>
          <p>{ar ? 'ابحث في الأجندة عن رقم الجهة، ثم اطلبه على هاتفك.' : 'Find a number in the address book, then dial it yourself.'}</p>
        </div>
        <span className={'qul-call-online ' + (isActive ? 'connected' : '')}>
          <i aria-hidden="true"/>{statusText}
        </span>
      </header>
      <div className="qul-call-mobile-switch" role="group" aria-label={ar ? 'عرض الهاتف أو الأجندة' : 'Phone and address book'}>
        <button type="button" onClick={() => setMobilePane('book')} className={mobilePane === 'book' ? 'active' : ''} aria-pressed={mobilePane === 'book'}>
          <BookOpen size={17}/>{ar ? 'الأجندة' : 'Address book'}
        </button>
        <button type="button" onClick={() => setMobilePane('phone')} className={mobilePane === 'phone' ? 'active' : ''} aria-pressed={mobilePane === 'phone'}>
          <Phone size={17}/>{ar ? 'الهاتف' : 'Phone'}
        </button>
      </div>
      <div className={'qul-call-stage qul-call-studio-grid qul-call-show-' + mobilePane}>
        <div className="qul-call-device-area qul-call-smartphone-area" data-pane="phone">
          <div className="qul-call-floor-light" aria-hidden="true"/>
          <div className="qul-phone-device" role="group" aria-label={ar ? 'هاتف قُل الحديث' : 'QUL modern smartphone'}>
            <span className="qul-phone-side-key qul-phone-side-key-left" aria-hidden="true"/>
            <span className="qul-phone-side-key qul-phone-side-key-right" aria-hidden="true"/>
            <div className="qul-phone-glass">
              <div className="qul-phone-status-bar" dir="ltr">
                <strong>9:41</strong><div className="qul-phone-dynamic-island"><i/><i/></div>
                <span><Signal size={12}/><Wifi size={13}/><BatteryFull size={16}/></span>
              </div>
              <AnimatePresence mode="wait" initial={false}>
                {!isActive && !loading ? (
                  <motion.div key="dialer" className="qul-phone-screen-dialer"
                    initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: reducedMotion ? 0 : .22 }}>
                    <span className="qul-phone-app-label">QUL <b>PHONE</b></span>
                    <h3>{ar ? 'لوحة الاتصال' : 'Keypad'}</h3>
                    <div className="qul-phone-dial-display">
                      <span className="qul-phone-digits" dir="ltr" aria-live="polite">{dialed || '· · ·'}</span>
                      <span className="qul-phone-dial-help">{dialError ||
                        (selected ? (ar ? 'اقرأ الرقم من الأجندة وأدخله هنا' : 'Enter the number you found in the book')
                          : (ar ? 'ابحث عن الجهة في الأجندة أولًا' : 'Find a contact in the address book first'))}</span>
                    </div>
                    <div className="qul-phone-ios-keypad" dir="ltr">
                      {DIAL_KEYS.map(([digit, letters]) => (
                        <button key={digit} type="button" onClick={() => dialKey(digit)} aria-label={digit === '*' ? (ar ? 'مسح الرقم' : 'Clear number') : digit === '#' ? (ar ? 'حذف آخر رقم' : 'Delete last digit') : digit}>
                          <strong>{digit}</strong>
                          <small>{digit === '*' ? (ar ? 'مسح' : 'CLEAR') : digit === '#' ? (ar ? 'حذف' : 'DELETE') : letters}</small>
                        </button>
                      ))}
                    </div>
                    <div className="qul-phone-dial-footer">
                      <button type="button" className="qul-phone-ios-clear" onClick={() => dialKey('#')}
                        aria-label={ar ? 'حذف آخر رقم' : 'Delete last digit'} disabled={!dialed}>
                        <Delete size={22}/>
                      </button>
                      <button type="button" className="qul-phone-ios-call" onClick={startCall}
                        aria-label={ar ? 'بدء المكالمة' : 'Start call'} disabled={!selected}>
                        <PhoneCall size={26} fill="currentColor"/>
                      </button>
                      <button type="button" className="qul-phone-ios-reset" onClick={() => dialKey('*')}
                        aria-label={ar ? 'مسح كل الأرقام' : 'Clear all digits'} disabled={!dialed}><X size={20}/></button>
                    </div>
                    <span className="qul-phone-dial-footer-label">{ar ? 'الاتصال' : 'Call'}</span>
                  </motion.div>
                ) : (
                  <motion.div key="calling" className="qul-phone-screen-calling"
                    initial={reducedMotion ? false : { opacity: 0, scale: .94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}>
                    <span className="qul-phone-call-brow">QUL LIVE · {selected?.extension || contact.extension}</span>
                    <div className="qul-phone-call-avatar">{contact.symbol}</div>
                    <h3>{ar ? contact.ar : contact.en}</h3>
                    <p>{loading ? (ar ? 'يُطلب الرقم...' : 'Dialling...')
                      : isAiSpeaking ? (ar ? 'الطرف الآخر يتحدث' : 'Contact speaking')
                      : micMuted ? (ar ? 'الميكروفون مكتوم' : 'Microphone muted')
                      : (ar ? 'المكالمة متصلة' : 'Call connected')}</p>
                    <div className="qul-phone-live-wave" ref={meterRef} style={{ '--phone-mic': .12 } as React.CSSProperties} aria-hidden="true">
                      {Array.from({ length: 21 }, (_, i) => <i key={i} style={{
                        height: (10 + Math.abs(Math.sin(i * .42)) * 25) + 'px',
                        transform: 'scaleY(var(--phone-mic, .12))'
                      }}/>)}
                    </div>
                    <div className="qul-phone-call-preview" dir="auto">
                      {tutorText || learnerText || (ar ? 'تحدث بالعربية لإنجاز مهمتك' : 'Speak in Arabic to complete your mission')}
                    </div>
                    <div className="qul-phone-call-controls">
                      <button type="button" onClick={onToggleMic} disabled={!isActive} className={micMuted ? 'muted' : ''}>
                        {micMuted ? <MicOff size={22}/> : <Mic size={22}/>}
                        <span>{micMuted ? (ar ? 'تشغيل' : 'Unmute') : (ar ? 'كتم' : 'Mute')}</span>
                      </button>
                      <button type="button" onClick={endCall} className="end">
                        <PhoneOff size={24} fill="currentColor"/>
                        <span>{ar ? 'إنهاء' : 'End'}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {recoveryNotice && !busy && (
                <div className="qul-phone-reconnect">
                  <p>{recoveryNotice}</p>
                  <button type="button" onClick={() => { setShowScript(true); onResume(); }}>
                    <RotateCcw size={14}/>{ar ? 'استئناف' : 'Resume'}
                  </button>
                </div>
              )}
              <div className="qul-phone-home-indicator" aria-hidden="true"/>
            </div>
          </div>
          <div className="qul-phone-caption">{ar ? 'الاتصالات محاكاة تعليمية وليست مكالمات هاتفية فعلية.' : 'Simulated educational calls, not real telephone connections.'}</div>
        </div>

        <div className="qul-call-experience-area" data-pane="book">
          <SpeakingPhoneBook
            lang={lang}
            contacts={CALL_CONTACTS}
            selectedId={bookSelection}
            disabled={busy}
            onSelect={selectBookEntry}
          />
          <section className="qul-call-mission-ticket" aria-label={ar ? 'مهمة المكالمة' : 'Call mission'}>
            {selected ? (
              <div className="qul-call-ticket-content">
                <div className="qul-call-ticket-top"><span>QUL · MISSION CARD</span><span>{level.toUpperCase()}</span></div>
                <h3>{ar ? selected.ar : selected.en}</h3>
                <p>{ar ? selected.aimAr : selected.aimEn}</p>
                <div className="qul-call-ticket-rules">
                  {(ar ? selected.objectivesAr : selected.objectivesEn).map((goal, index) => {
                    const achieved = assessmentStatus === 'analyzed' && Boolean(missionEvidence?.[index]?.achieved);
                    return <div className={'qul-call-rule ' + (achieved ? 'verified' : '')} key={index}>
                      <span>{achieved ? <Check size={14}/> : index + 1}</span><p>{goal}</p>
                    </div>;
                  })}
                </div>
                {assessmentStatus === 'analyzed' && (
                  <div className={'qul-call-ticket-result ' + (verified ? 'is-complete' : '')}>
                    <span>{verified ? (ar ? 'المهمة مكتملة' : 'Mission complete') : (ar ? 'الأهداف التي تحققت' : 'Verified objectives')}</span>
                    <strong>{completedGoals}/{selected.objectivesAr.length}</strong>
                  </div>
                )}
              </div>
            ) : (
              <div className="qul-call-mission-empty">
                <BookOpen size={22}/>
                <span>{ar ? 'اختر جهة من الأجندة لتظهر مهمتك هنا.' : 'Choose a contact in the book to reveal your mission.'}</span>
              </div>
            )}
          </section>
          <section className="qul-call-transcript-shell" aria-label={ar ? 'سجل المحادثة' : 'Conversation transcript'}>
            <div className="qul-call-log-header">
              <div><span className={'qul-call-led ' + (isActive ? 'is-on' : '')}/><strong>{ar ? 'سجل المكالمة' : 'Conversation log'}</strong></div>
              <button type="button" onClick={() => setShowScript(value => !value)} aria-expanded={showScript} className="qul-call-log-toggle">
                <BookOpen size={15}/>{showScript ? (ar ? 'إخفاء' : 'Hide') : (ar ? 'عرض' : 'Show')}
              </button>
            </div>
            <AnimatePresence initial={false}>
              {showScript && (
                <motion.div className="qul-call-log-expand" key="conversation"
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: reducedMotion ? 0 : .2 }}>
                  <div className="qul-call-log-list" ref={transcriptRef}>
                    {allTurns.length ? allTurns.slice(-12).map((turn,index) => (
                      <div key={index} className={'qul-call-log-entry ' + (turn.role === 'ai' ? 'agent' : 'learner')}>
                        <span>{turn.role === 'ai' ? (ar ? contact.agentAr : contact.agentEn) : (ar ? 'أنت' : 'You')}</span>
                        <p dir="auto">{turn.text}</p>
                      </div>
                    )) : <p className="qul-call-log-empty">{ar ? 'يظهر الحوار هنا بعد إجراء المكالمة.' : 'Your conversation appears here after calling.'}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </div>
      <footer className="qul-call-bottom-line">
        <span>QUL / SPEAK WITH PURPOSE</span>
        <span>{ar ? '1. افتح الأجندة  2. ابحث عن الرقم  3. اطلبه على الهاتف' : '1. Open the book  2. Find the number  3. Dial it'}</span>
      </footer>
    </div>
  );
};
