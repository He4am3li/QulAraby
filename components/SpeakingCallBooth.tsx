import React from 'react';
import { Check, Phone, RotateCcw, BookOpen } from 'lucide-react';
import { SpeakingPhoneBook } from './SpeakingPhoneBook';
import { validateSimulatedDial } from '../services/speakingDial.mjs';
import './SpeakingCallBooth.css';
import './SpeakingScene.css';
import { ADDITIONAL_SPEAKING_CONTACTS, type SpeakingPhoneContact } from '../data/speakingDirectory';
import { SpeakingDeskPhone } from './SpeakingDeskPhone';

const ORIGINAL_CALL_CONTACTS = [
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

export type CallContact = SpeakingPhoneContact;
export const CALL_CONTACTS: CallContact[] = [...ORIGINAL_CALL_CONTACTS, ...ADDITIONAL_SPEAKING_CONTACTS];
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
    <div className="qul-call-world qul-call-scene" dir={ar?'rtl':'ltr'}>
      <div className="qul-call-atmosphere" aria-hidden="true"/>
      <header className="qul-call-heading">
        <div>
          <span className="qul-call-eyebrow">QUL · REAL-LIFE SPEAKING</span>
          <h2>{ar?'كابينة الاتصال':'The Call Booth'}</h2>
          <p>{ar?'افتح دليل الهاتف، اختر الجهة، ثم اطلب رقمها بنفسك.':'Open the directory, find the contact and dial its number.'}</p>
        </div>
        <span className={'qul-call-online '+(isActive?'connected':'')}>
          <i aria-hidden="true"/>{statusText}
        </span>
      </header>
      <div className="qul-call-mobile-switch" role="group" aria-label={ar?'عرض الهاتف والدليل':'Phone and book views'}>
        <button type="button" className={mobilePane==='phone'?'active':''}
          onClick={()=>setMobilePane('phone')} aria-pressed={mobilePane==='phone'}>
          <Phone size={17}/>{ar?'الهاتف':'Telephone'}
        </button>
        <button type="button" className={mobilePane==='book'?'active':''}
          onClick={()=>setMobilePane('book')} aria-pressed={mobilePane==='book'}>
          <BookOpen size={17}/>{ar?'دليل الهاتف':'Address book'}
        </button>
      </div>

      <div className={'qul-scene-layout qul-scene-show-'+mobilePane}>
        <div className="qul-scene-phone-pane" data-pane="phone">
          <SpeakingDeskPhone lang={lang} dialed={dialed} active={isActive} loading={loading}
            micMuted={micMuted} isAiSpeaking={isAiSpeaking} selected={selected}
            onDial={dialKey} onCall={startCall} onEnd={endCall}
            onToggleMic={onToggleMic} meterRef={meterRef}/>
          <div className={'qul-scene-dial-feedback '+(dialError?'error':'')} aria-live="polite">
            <span>{dialError || (selected
              ? (ar?'أدخل رقم '+selected.ar+' من الأجندة.':'Dial the number you found for '+selected.en+'.')
              : (ar?'افتح دليل الهاتف واختر الجهة قبل الاتصال.':'Open the phone book and choose a contact first.'))}</span>
          </div>
          {recoveryNotice && !isActive && (
            <div className="qul-scene-recovery">
              <span>{recoveryNotice}</span>
              <button type="button" disabled={loading} onClick={onResume}>
                <RotateCcw size={14}/>{ar?'إعادة الاتصال':'Reconnect'}
              </button>
            </div>
          )}
        </div>

        <div className="qul-scene-book-pane" data-pane="book">
          <SpeakingPhoneBook lang={lang} contacts={CALL_CONTACTS}
            selectedId={bookSelection} disabled={busy} onSelect={selectBookEntry}/>
          <section className="qul-scene-mission" aria-label={ar?'مهمة المكالمة':'Call mission'}>
            {selected ? (
              <>
                <div className="qul-scene-mission-header">
                  <div><small>QUL · MISSION</small><strong>{ar?selected.ar:selected.en}</strong></div>
                  {assessmentStatus==='analyzed' &&
                    <span className={'qul-scene-mission-progress '+(verified?'verified':'')}>
                      {completedGoals} / {selected.objectivesAr.length}
                    </span>}
                </div>
                <p>{ar?selected.aimAr:selected.aimEn}</p>
                <div className="qul-scene-mission-steps">
                  {(ar?selected.objectivesAr:selected.objectivesEn).map((objective,index)=>
                    <span key={index} className={assessmentStatus==='analyzed' && missionEvidence?.[index]?.achieved ? 'achieved' : ''}>
                      {assessmentStatus==='analyzed' && missionEvidence?.[index]?.achieved?<Check size={12}/>:index+1}
                      {objective}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="qul-scene-mission-empty">
                <BookOpen size={20}/><span>{ar?'اختر اسم الجهة من صفحات الدليل لتظهر المهمة.':'Select an entry in the book to discover your mission.'}</span>
              </div>
            )}
          </section>
          <section className="qul-scene-transcript" aria-label={ar?'سجل المكالمة':'Call transcript'}>
            <button type="button" onClick={()=>setShowScript(value=>!value)} aria-expanded={showScript}
              className="qul-scene-transcript-toggle">
              <BookOpen size={17}/>{ar?'سجل المحادثة':'Conversation log'}
              <span>{showScript?(ar?'إخفاء':'Hide'):(ar?'عرض':'Show')}</span>
            </button>
            {showScript && (
              <div ref={transcriptRef} className="qul-scene-transcript-lines">
                {allTurns.length
                  ? allTurns.slice(-8).map((turn,index)=>(
                    <div key={index} className={'qul-scene-transcript-line '+turn.role}>
                      <strong>{turn.role==='ai'?(ar?contact.agentAr:contact.agentEn):(ar?'أنت':'You')}</strong>
                      <p dir="auto">{turn.text}</p>
                    </div>
                  ))
                  : <p>{ar?'سيظهر نص الحوار هنا عند بدء المكالمة.':'The transcript will appear after the call starts.'}</p>}
              </div>
            )}
          </section>
        </div>
      </div>
      <footer className="qul-call-bottom-line">
        <span>QUL · SPEAK WITH PURPOSE</span>
        <span>{ar?'الدليل والأرقام جهات افتراضية للتدريب، وليست اتصالات حقيقية.':'All directory numbers are fictional learning simulations.'}</span>
      </footer>
    </div>
  );
};
