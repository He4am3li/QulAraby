import React from 'react';
import { Phone, RotateCcw, BookOpen, SlidersHorizontal } from 'lucide-react';
import { SpeakingPhoneBook } from './SpeakingPhoneBook';
import { validateSimulatedDial } from '../services/speakingDial.mjs';
import './SpeakingCallBooth.css';
import './SpeakingScene.css';
import './SpeakingReferencePhoto.css';
import { type SpeakingPhoneContact } from '../data/speakingDirectory';
import { EVERYDAY_CALL_CONTACTS } from '../data/speakingEverydayContacts';
import { ADDITIONAL_EVERYDAY_CONTACTS } from '../data/speakingExtraEverydayContacts';
import './SpeakingSourceAssets.css';
import { SpeakingDeskPhone } from './SpeakingDeskPhone';

export type CallContact = SpeakingPhoneContact;
export const CALL_CONTACTS: CallContact[] = [...EVERYDAY_CALL_CONTACTS, ...ADDITIONAL_EVERYDAY_CONTACTS];

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
  onOpenOptions: () => void;
  meterRef: React.RefObject<HTMLDivElement | null>;
}

export const SpeakingCallBooth: React.FC<CallBoothProps> = ({
  lang, contact, isActive, loading, isAiSpeaking, micMuted, recoveryNotice,
  history, learnerText, tutorText,
  onSelectContact, onStart, onStop, onResume, onToggleMic, onOpenOptions, meterRef,
}) => {
  const ar = lang === 'ar';
  const [bookSelection, setBookSelection] = React.useState<string | null>(null);
  const [dialed, setDialed] = React.useState('');
  const [offHook,setOffHook] = React.useState(false);
  const callAttemptRef = React.useRef('');
  const [dialError, setDialError] = React.useState('');
  const [showScript, setShowScript] = React.useState(false);
  const [mobilePane, setMobilePane] = React.useState<'book' | 'phone'>('phone');
  const toneContextRef = React.useRef<AudioContext | null>(null);
  const transcriptRef = React.useRef<HTMLDivElement>(null);

  const busy = loading || isActive;
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
    callAttemptRef.current = '';
    setShowScript(false);
    onSelectContact(entry.id);
    // On phones keep the directory visible until the learner chooses the phone tab.
  };

  const dialKey = (digit: string) => {
    if (busy) return;
    if (!offHook) {
      setDialError(ar ? 'ارفع السماعة أولًا، ثم اطلب الرقم.' : 'Lift the receiver before dialing.');
      return;
    }
    setDialError('');
    if (digit === '*') {
      callAttemptRef.current = '';
      setDialed('');
      tone(330);
      return;
    }
    if (digit === '#') {
      callAttemptRef.current = '';
      setDialed(value => value.slice(0,-1));
      tone(440);
      return;
    }
    if (!/^[0-9]$/.test(digit)) return;
    tone(390 + Number(digit) * 39);
    setDialed(value => value.length >= 3 ? digit : value + digit);
  };
  const liftReceiver = () => {
    if (busy || offHook) return;
    setOffHook(true);
    setDialError('');
    tone(420, .1);
  };
  const endCall = () => {
    tone(260,.13);
    if (busy) onStop();
    callAttemptRef.current = '';
    setOffHook(false);
    setDialed('');
    setDialError('');
  };
  React.useEffect(() => {
    if (!offHook || busy || dialed.length !== 3 || callAttemptRef.current === dialed) return;
    const result = validateSimulatedDial({
      selectedId: bookSelection,
      dialed,
      contacts: CALL_CONTACTS,
    });
    if (result === 'ready') {
      callAttemptRef.current = dialed;
      setDialError('');
      setShowScript(true);
      onStart();
    } else {
      setDialError(result === 'select_contact'
        ? (ar ? 'اختر جهة من الدليل أولًا.' : 'Choose a contact first.')
        : (ar ? 'الرقم غير صحيح، راجعه في الدليل.' : 'Wrong number, check the book.'));
    }
  }, [offHook, dialed, busy, bookSelection, onStart, ar]);

  return (
    <div className="qul-call-world qul-call-scene" dir={ar?'rtl':'ltr'}>
      <div className="qul-call-atmosphere" aria-hidden="true"/>
      <div className="qul-call-mobile-switch" role="group" aria-label={ar?'عرض الهاتف والدليل':'Phone and book views'}>
        <button type="button" className={mobilePane==='phone'?'active':''}
          onClick={()=>setMobilePane('phone')} aria-pressed={mobilePane==='phone'}
          aria-label={ar?'عرض الهاتف':'Show telephone'}>
          <Phone size={18}/>
        </button>
        <button type="button" className={mobilePane==='book'?'active':''}
          onClick={()=>setMobilePane('book')} aria-pressed={mobilePane==='book'}
          aria-label={ar?'عرض دليل الهاتف':'Show telephone directory'}>
          <BookOpen size={18}/>
        </button>
        <button type="button" onClick={onOpenOptions}
          aria-label={ar?'الأقسام والمستوى':'Speaking sections and level'}
          className="qul-call-options-button" title={ar?'الأقسام والمستوى':'Speaking sections and level'}>
          <SlidersHorizontal size={18}/>
        </button>
      </div>

      <div className={'qul-scene-layout qul-scene-show-'+mobilePane}>
        <div className="qul-scene-phone-pane" data-pane="phone">
          <SpeakingDeskPhone lang={lang} dialed={dialed} offHook={offHook} active={isActive} loading={loading}
            micMuted={micMuted} isAiSpeaking={isAiSpeaking} selected={selected}
            onDial={dialKey} onLift={liftReceiver} onHangup={endCall}
            onToggleMic={onToggleMic} meterRef={meterRef}/>
          {dialError && <div className="qul-scene-dial-feedback error" role="alert">{dialError}</div>}
          {recoveryNotice && !isActive && (
            <div className="qul-scene-recovery">
              <span>{recoveryNotice}</span>
              <button type="button" disabled={loading} onClick={() => { setOffHook(true); onResume(); }}>
                <RotateCcw size={14}/>{ar?'إعادة الاتصال':'Reconnect'}
              </button>
            </div>
          )}
        </div>

        <div className="qul-scene-book-pane" data-pane="book">
          <SpeakingPhoneBook lang={lang} contacts={CALL_CONTACTS}
            selectedId={bookSelection} disabled={busy} onSelect={selectBookEntry}/>
          {(showScript || busy) && (
            <section className={'qul-call-receipt '+(showScript?'is-open':'')}
              aria-label={ar?'ورقة سجل المكالمة':'Telephone call record'}>
              <button type="button" className="qul-call-receipt-toggle"
                onClick={()=>setShowScript(value=>!value)} aria-expanded={showScript}>
                <span className="qul-receipt-smallprint" dir="ltr">QUL / CALL RECORD</span>
                <strong>{ar?'شريط المحادثة':'Conversation paper tape'}</strong>
                <span className="qul-receipt-fold">{showScript?(ar?'طي الورقة':'Fold'):(ar?'فتح الورقة':'Unfold')}</span>
              </button>
              {showScript && <div ref={transcriptRef} className="qul-call-receipt-paper" role="log"
                aria-label={ar?'نص المكالمة':'Call transcript'}>
                {allTurns.length ? allTurns.slice(-12).map((turn,index)=>(
                  <div className={'qul-call-receipt-turn '+turn.role} key={index}>
                    <small>{turn.role==='ai'?(ar?contact.agentAr:contact.agentEn):(ar?'الطالب':'Learner')}</small>
                    <p dir="auto">{turn.text}</p>
                  </div>
                )) : (
                  <p className="qul-call-receipt-empty">
                    {ar?'تظهر عبارات المحادثة هنا عند التحدث.':'Spoken turns will appear here during the call.'}
                  </p>
                )}
              </div>}
            </section>
          )}
        </div>
      </div>

    </div>
  );
};
