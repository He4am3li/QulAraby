import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Check, CheckCircle2, ChevronLeft, ChevronRight, FileDown, Fingerprint, Headphones, HelpCircle, Home, LockKeyhole, MailOpen, Music2, RotateCcw, Search, ShieldCheck, Sparkles, Volume2, VolumeX, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { CASES_DATABASE, spyAudio, type DetectiveCase, type DifficultyLevel, type EvidenceTerm, type SuspectPerson } from './DetectiveMystery';
import { DETECTIVE_NARRATIVES } from './detectiveNarratives';

type Screen = 'intro' | 'briefing' | 'investigation' | 'envelope' | 'report' | 'complete';
type UiLanguage = 'ar' | 'en';
type LevelProgress = { completedIds: number[]; nextIndex: number; bestScores: Record<number, number> };
type Progress = Record<DifficultyLevel, LevelProgress>;
const STORAGE_KEY = 'qul:detective:progress:v2';

const emptyLevel = (): LevelProgress => ({ completedIds: [], nextIndex: 0, bestScores: {} });
const emptyProgress = (): Progress => ({ beginner: emptyLevel(), intermediate: emptyLevel(), advanced: emptyLevel() });
const loadProgress = (): Progress => {
  if (typeof window === 'undefined') return emptyProgress();
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    const defaults = emptyProgress();
    (Object.keys(defaults) as DifficultyLevel[]).forEach(level => {
      const record = parsed?.[level];
      if (record && Array.isArray(record.completedIds)) defaults[level] = {
        completedIds: record.completedIds.filter((id: unknown) => typeof id === 'number'),
        nextIndex: typeof record.nextIndex === 'number' ? record.nextIndex : 0,
        bestScores: record.bestScores && typeof record.bestScores === 'object' ? record.bestScores : {},
      };
    });
    return defaults;
  } catch { return emptyProgress(); }
};
const storeProgress = (progress: Progress) => {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch {}
};
const wordOptions = (words: EvidenceTerm[], index: number): string[] => {
  const others = words.filter((_, i) => i !== index).map(word => word.en);
  const choices = [words[index].en, others[(index * 2) % others.length], others[(index * 2 + 1) % others.length]];
  return choices.sort((a, b) => ((a.length + index * 11) % 7) - ((b.length + index * 11) % 7));
};
const levelLabel = (level: DifficultyLevel, language: UiLanguage) => ({
  beginner: language === 'ar' ? 'المبتدئ' : 'Beginner',
  intermediate: language === 'ar' ? 'المتوسط' : 'Intermediate',
  advanced: language === 'ar' ? 'المتقدم' : 'Advanced',
}[level]);

interface ExperienceProps { onBack?: () => void; lang?: UiLanguage }
interface PortraitProps {
  person: SuspectPerson; disabled?: boolean; eliminated?: boolean; culprit?: boolean;
  selected?: boolean; onClick?: () => void; compact?: boolean; badge?: string;
}
const Portrait: React.FC<PortraitProps> = ({ person, disabled, eliminated, culprit, selected, onClick, compact, badge }) => (
  <button type="button" disabled={disabled} onClick={onClick}
    aria-label={person.name + (eliminated ? '، بريء' : '')}
    aria-pressed={selected}
    className={'relative group flex flex-col min-w-0 min-h-0 overflow-hidden rounded-xl border bg-[#0a1118] text-amber-100 shadow-[0_12px_28px_rgba(0,0,0,.35)] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 ' +
      (culprit ? 'border-red-400 ring-2 ring-red-500/70 ' : selected ? 'border-amber-200 ring-2 ring-amber-400 ' : 'border-amber-500/40 ') +
      (disabled ? 'cursor-default ' : 'cursor-pointer hover:border-amber-200 hover:-translate-y-0.5 ') +
      (compact ? 'w-full ' : 'w-full h-full ')}>
    <div className="relative w-full flex-1 min-h-0 overflow-hidden bg-gradient-to-b from-stone-700 to-slate-950" style={{ aspectRatio: '4 / 4.2' }}>
      <img src={person.image} alt="" loading="eager" className={'w-full h-full object-cover object-top transition-[filter] ' + (eliminated ? 'grayscale brightness-50' : '')} />
      {eliminated && <div className="absolute inset-0 flex items-center justify-center bg-emerald-950/30"><span className="rounded-full bg-emerald-600 p-2 shadow-lg"><Check className="h-5 w-5 text-white" /></span></div>}
      {culprit && <span className="absolute top-1 right-1 rounded-lg bg-red-700 px-1.5 py-0.5 text-[10px] font-bold text-white">الجاني</span>}
      {badge && !eliminated && <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-amber-200">{badge}</span>}
    </div>
    <span className={'flex w-full min-h-[30px] shrink-0 items-center justify-center border-t border-amber-500/40 px-1 py-1 text-center font-bold ' + (compact ? 'text-[11px] sm:text-xs ' : 'text-xs sm:text-sm ') + (eliminated ? 'text-slate-400 line-through' : '')}>{person.name}</span>
  </button>
);

export const DetectiveExperience: React.FC<ExperienceProps> = ({ onBack, lang = 'ar' }) => {
  const [language, setLanguage] = useState<UiLanguage>(lang);
  useEffect(() => setLanguage(lang), [lang]);
  const [screen, setScreen] = useState<Screen>('intro');
  const [level, setLevel] = useState<DifficultyLevel>('beginner');
  const [caseIndex, setCaseIndex] = useState(0);
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [clueIndex, setClueIndex] = useState(0);
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [cipherOpened, setCipherOpened] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [errors, setErrors] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showDossier, setShowDossier] = useState(false);
  const [accusationOpen, setAccusationOpen] = useState(false);
  const [accusedId, setAccusedId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [solved, setSolved] = useState(false);
  const [wordAnswers, setWordAnswers] = useState<Record<number, string>>({});
  const [isMuted, setIsMuted] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const t = (ar: string, en: string) => language === 'ar' ? ar : en;
  const cases = useMemo(() => CASES_DATABASE.filter(item => item.level === level), [level]);
  const activeCase: DetectiveCase = cases[Math.min(caseIndex, cases.length - 1)] || CASES_DATABASE[0];
  const narrative = DETECTIVE_NARRATIVES[activeCase.id];
  const activeClue = activeCase.clues[Math.min(clueIndex, activeCase.clues.length - 1)];
  const clueCleared = activeCase.suspects.every(suspect => !activeClue.matcher(suspect) || eliminated.includes(suspect.id));
  const allInnocentsEliminated = activeCase.suspects.filter(person => !eliminated.includes(person.id)).length === 1;
  const readyToAccuse = clueCleared && clueIndex === activeCase.clues.length - 1 && allInnocentsEliminated;
  const answersCount = Object.keys(wordAnswers).length;
  const wordsComplete = answersCount === activeCase.evidenceTerms.length;
  const score = Math.max(0, Math.min(100, eliminated.length * 10 + (solved ? 35 : 0) + answersCount * 3 - errors * 5));

  const playSpeech = (arabicText: string) => {
    if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setFeedback(t('النطق غير متاح أو الصوت مكتوم.', 'Speech is unavailable or muted.'));
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(arabicText);
    utterance.lang = 'ar-SA';
    utterance.rate = level === 'beginner' ? 0.78 : 0.9;
    const voice = window.speechSynthesis.getVoices().find(v => v.lang.toLowerCase().startsWith('ar'));
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  };
  useEffect(() => () => {
    spyAudio.stopBgm();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);
  const toggleMusic = () => {
    const playing = spyAudio.toggleBgm();
    setMusicPlaying(playing);
  };
  const toggleMute = () => {
    spyAudio.setMuted(!isMuted);
    setIsMuted(!isMuted);
    if (!isMuted && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  };
  const resetInvestigation = () => {
    setClueIndex(0); setEliminated([]); setCipherOpened(false);
    setFeedback(''); setErrors(0); setShowTranslation(false);
    setShowDossier(false); setAccusationOpen(false); setAccusedId(null);
    setReason(''); setSolved(false); setWordAnswers({});
  };
  const chooseLevel = (nextLevel: DifficultyLevel) => {
    const list = CASES_DATABASE.filter(item => item.level === nextLevel);
    const candidate = progress[nextLevel].nextIndex;
    const idx = candidate >= 0 && candidate < list.length ? candidate : 0;
    setLevel(nextLevel); setCaseIndex(idx); resetInvestigation();
    spyAudio.setTrack(idx % 5); spyAudio.playClassifiedStamp();
    setScreen('briefing');
  };
  const onEliminate = (person: SuspectPerson) => {
    if (eliminated.includes(person.id) || clueCleared || accusationOpen) return;
    if (level === 'advanced' && activeClue.cipherKey && !cipherOpened) {
      setFeedback(t('افتح الشفرة قبل اختيار المشتبه به.', 'Decode the clue before selecting a suspect.'));
      return;
    }
    if (!activeClue.matcher(person)) {
      spyAudio.playWrongBuzzer();
      setErrors(value => value + 1);
      setFeedback(t('راجع الإفادة: لا يوجد دليل يبرئ ' + person.name + ' في هذه الخطوة.', 'Read the statement again. It does not clear ' + person.name + '.'));
      return;
    }
    spyAudio.playClassifiedStamp();
    setEliminated(value => value.includes(person.id) ? value : [...value, person.id]);
    setFeedback(t(person.name + ' بريء بناءً على هذه الإفادة.', person.name + ' is cleared by this statement.'));
  };
  const nextClue = () => {
    if (!clueCleared || clueIndex >= activeCase.clues.length - 1) return;
    spyAudio.playClueStinger();
    setClueIndex(index => index + 1); setCipherOpened(false);
    setShowTranslation(false); setFeedback('');
  };
  const markCaseSolved = (bestScore: number) => {
    setProgress(previous => {
      const item = previous[level];
      const nextLevel: LevelProgress = {
        completedIds: [...new Set([...item.completedIds, activeCase.id])],
        nextIndex: (caseIndex + 1) % cases.length,
        bestScores: { ...item.bestScores, [activeCase.id]: Math.max(item.bestScores[activeCase.id] || 0, bestScore) },
      };
      const next = { ...previous, [level]: nextLevel };
      storeProgress(next);
      return next;
    });
  };
  const submitAccusation = () => {
    if (!accusedId || !reason) {
      setFeedback(t('اختر مشتبهًا به وحدد الدليل أولًا.', 'Choose a suspect and an evidence reason first.'));
      return;
    }
    if (accusedId !== activeCase.culpritId || reason !== 'evidence') {
      spyAudio.playWrongBuzzer();
      setErrors(value => value + 1);
      setFeedback(t('الاتهام غير مكتمل. قارن الوصف الأخير بصور الأشخاص واستبعد من ثبتت براءته.', 'Not quite. Compare the final clue with the portraits and check the alibis.'));
      return;
    }
    spyAudio.playVictoryFanfare(); setSolved(true); setAccusationOpen(false);
    setFeedback('');
    const base = Math.max(0, 85 - errors * 5);
    markCaseSolved(base);
    setScreen('envelope');
    try { confetti({ particleCount: 65, spread: 60, origin: { y: 0.55 } }); } catch {}
  };
  const answerWord = (choice: string) => {
    const index = answersCount;
    const correct = activeCase.evidenceTerms[index].en;
    if (choice !== correct) {
      spyAudio.playWrongBuzzer();
      setErrors(count => count + 1);
      setFeedback(t('حاول مجددًا، الكلمة من أحداث القضية.', 'Try again. The word appears in the case.'));
      return;
    }
    spyAudio.playClassifiedStamp();
    setWordAnswers(answers => ({ ...answers, [index]: choice }));
    setFeedback(t('إجابة صحيحة.', 'Correct!'));
    const nextScore = Math.max(0, Math.min(100, 50 + 35 + (index + 1) * 3 - errors * 5));
    markCaseSolved(nextScore);
  };
  const nextCase = () => {
    const completed = progress[level].completedIds;
    if (cases.every(item => completed.includes(item.id))) {
      setScreen('complete');
      return;
    }
    const next = cases.findIndex((item, i) => i > caseIndex && !completed.includes(item.id));
    const firstIncomplete = cases.findIndex(item => !completed.includes(item.id));
    const idx = next >= 0 ? next : Math.max(0, firstIncomplete);
    setCaseIndex(idx); resetInvestigation(); spyAudio.setTrack(idx % 5); setScreen('briefing');
  };
  const exportText = () => {
    const content = [
      'قُل | تقرير قضية: ' + activeCase.codeName,
      'المستوى: ' + levelLabel(level, 'ar'), 'الجاني: ' + activeCase.suspects.find(s => s.id === activeCase.culpritId)?.name,
      'النتيجة: ' + score + '/100', 'الدليل الأخير: ' + (narrative?.finalEvidenceAr || ''),
      ...activeCase.evidenceTerms.map(item => item.ar + ' = ' + item.en),
    ].join('\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'QUL_Case_' + activeCase.id + '.txt';
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };
  const downloadPdf = async () => {
    if (!reportRef.current || isPdfLoading) return;
    setIsPdfLoading(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: '#08121b', useCORS: true });
      const pdf = new jsPDF({ format: 'a4', orientation: 'portrait', unit: 'mm' });
      const width = pdf.internal.pageSize.getWidth(), height = pdf.internal.pageSize.getHeight();
      const factor = Math.min(width / canvas.width, height / canvas.height);
      const finalW = canvas.width * factor, finalH = canvas.height * factor;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', (width - finalW) / 2, (height - finalH) / 2, finalW, finalH);
      pdf.save('QUL_Case_' + activeCase.id + '.pdf');
    } catch (err) {
      console.error('Detective PDF generation failed; providing text report.', err);
      exportText();
    } finally { setIsPdfLoading(false); }
  };

  const background = screen === 'intro' ? 'url("/١.webp")'
    : screen === 'briefing' ? activeCase.bgImage
    : screen === 'envelope' || screen === 'report' ? 'url("/٩.jpeg")'
    : 'url("/٨.jpeg")';
  const pageStyle: React.CSSProperties = {
    backgroundImage: 'linear-gradient(105deg,rgba(2,7,12,.91),rgba(2,9,15,.66) 52%,rgba(3,8,13,.78)), ' + background,
    backgroundPosition: 'center', backgroundSize: 'cover',
  };
  const labelAr = activeCase.codeName;
  const labelEn = narrative?.titleEn || activeCase.codeName;
  const description = t(activeCase.crimeDescription, narrative?.descriptionEn || activeCase.crimeDescription);
  const evidenceAr = narrative?.finalEvidenceAr || 'بقية المشتبه بهم لديهم دليل براءة.';
  const evidenceEn = narrative?.finalEvidenceEn || 'Other suspects have alibis.';
  const reportIsReady = solved && wordsComplete;
  const Header = () => (
    <header className="relative z-20 flex h-14 w-full flex-none items-center justify-between gap-2 border-b border-amber-400/20 bg-[#07111b]/80 px-3 sm:px-5 backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-2">
        <button type="button" aria-label={t('العودة', 'Back')} onClick={() => {
          setFeedback('');
          setScreen(screen === 'investigation' ? 'briefing' : screen === 'intro' ? 'intro' : 'intro');
          if (screen === 'intro') onBack?.();
        }} className="rounded-lg border border-amber-500/30 p-2 text-amber-200 hover:bg-amber-400/10"><ArrowRight size={17}/></button>
        <ShieldCheck size={18} className="shrink-0 text-amber-300"/>
        <span className="truncate font-bold text-amber-100">{screen === 'intro' ? t('من الجاني؟', 'Who Did It?') : t(labelAr, labelEn)}</span>
      </div>
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        {screen !== 'intro' && <span className="hidden rounded-full border border-amber-400/30 px-2 py-1 text-[11px] text-amber-200 sm:inline">{levelLabel(level, language)} {caseIndex + 1}/{cases.length}</span>}
        <button type="button" onClick={() => setLanguage(l => l === 'ar' ? 'en' : 'ar')} className="min-w-[42px] rounded-lg border border-amber-400/30 px-2 py-1.5 text-xs font-bold text-amber-200" aria-label="Toggle language">{language === 'ar' ? 'EN' : 'عربي'}</button>
        <button type="button" aria-label={t('الصوت', 'Sound')} onClick={toggleMute} className="rounded-lg border border-amber-400/30 p-2 text-amber-200">{isMuted ? <VolumeX size={17}/> : <Volume2 size={17}/>}</button>
        <button type="button" aria-label={t('الموسيقى', 'Music')} onClick={toggleMusic} className={'rounded-lg border p-2 ' + (musicPlaying ? 'border-amber-200 bg-amber-500/20 text-amber-100' : 'border-amber-400/30 text-amber-200')}><Music2 size={17}/></button>
      </div>
    </header>
  );
  const notice = feedback && <div role="status" aria-live="polite" className="mx-auto w-full max-w-4xl rounded-xl border border-amber-300/35 bg-[#0c1822]/95 px-3 py-2 text-center text-xs text-amber-100 shadow-lg sm:text-sm">{feedback}</div>;
  const primaryButton = 'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-amber-200/70 bg-gradient-to-b from-amber-500 to-amber-700 px-5 py-2.5 font-bold text-slate-950 shadow-[0_10px_30px_rgba(217,119,6,.25)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-amber-200';
  const secondaryButton = 'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-amber-400/40 bg-[#101e29]/90 px-4 py-2.5 font-semibold text-amber-100 transition hover:bg-amber-400/15';
  const container = 'relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-3 py-3 sm:px-6 sm:py-5';
  const deviceNotice = t('يُحفظ تقدمك على هذا الجهاز.', 'Progress is saved on this device.');

  return (
    <main dir={language === 'ar' ? 'rtl' : 'ltr'} lang={language} className="relative flex min-h-[100dvh] w-full flex-col overflow-x-hidden bg-[#070d14] font-sans text-slate-100" style={pageStyle}>
      <Header/>
      {screen === 'intro' && (
        <section className={container + ' justify-center gap-4'}>
          <div className="mx-auto w-full max-w-3xl space-y-3 rounded-3xl border border-amber-400/35 bg-[#0a1622]/85 p-5 text-center shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-amber-300/50 bg-amber-500/10"><Search className="text-amber-300" size={29}/></div>
            <h1 className="text-3xl font-black text-amber-200 sm:text-5xl">{t('من الجاني؟', 'Who Did It?')}</h1>
            <p className="text-sm leading-relaxed text-slate-200 sm:text-lg">{t('راقب، استمع، استبعد الأبرياء، ثم اتهم الشخص الذي تدينه الأدلة.', 'Observe, listen, clear the innocent suspects, then make an evidence-based accusation.')}</p>
            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
              {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map(item => {
                const list = CASES_DATABASE.filter(c => c.level === item);
                const total = progress[item].completedIds.filter(id => list.some(c => c.id === id)).length;
                return <button key={item} type="button" onClick={() => chooseLevel(item)} className="rounded-2xl border border-amber-300/45 bg-gradient-to-b from-[#23303b] to-[#101920] p-4 text-start transition hover:-translate-y-1 hover:border-amber-200 hover:shadow-xl">
                  <span className="flex items-center gap-2 text-lg font-bold text-amber-200"><Fingerprint size={21}/>{levelLabel(item, language)}</span>
                  <span className="mt-2 block text-xs text-slate-200">{t('قضايا مكتملة', 'Cases solved')} {total}/{list.length}</span>
                  <span className="mt-3 block text-xs text-amber-100">{total ? t('تابع التحقيق', 'Continue') : t('ابدأ التحقيق', 'Begin investigation')}</span>
                </button>;
              })}
            </div>
            <p className="text-xs text-slate-400">{deviceNotice}</p>
          </div>
        </section>
      )}
      {screen === 'briefing' && (
        <section className={container + ' justify-center gap-3'}>
          <div className="grid w-full flex-1 items-center gap-4 lg:grid-cols-[minmax(300px,.9fr)_minmax(0,1.2fr)]">
            <div className="flex flex-col gap-3 rounded-3xl border border-amber-400/50 bg-[#07131e]/90 p-4 shadow-2xl backdrop-blur-xl sm:p-6">
              <div className="flex items-center justify-between text-amber-300"><span className="text-xs font-bold tracking-wide">{t('بلاغ الواقعة', 'CASE BRIEFING')}</span><span className="text-xs">{caseIndex + 1}/{cases.length}</span></div>
              <h2 className="text-2xl font-black text-amber-200 sm:text-3xl">{t(labelAr, labelEn)}</h2>
              <p className="text-base leading-loose text-slate-100 sm:text-lg">{description}</p>
              {language === 'en' && <p lang="ar" dir="rtl" className="rounded-xl bg-black/25 p-2 text-sm text-amber-100">{activeCase.crimeDescription}</p>}
              <button type="button" className={secondaryButton} onClick={() => playSpeech(activeCase.crimeDescription)}><Headphones size={18}/>{t('استمع إلى البلاغ', 'Listen to Arabic briefing')}</button>
              <div className="flex flex-wrap gap-2">
                {activeCase.evidenceTerms.slice(0,3).map(term => <span key={term.ar} className="rounded-full border border-amber-500/20 bg-black/30 px-3 py-1 text-xs text-amber-100">{term.ar}</span>)}
              </div>
              <button type="button" onClick={() => {setFeedback(''); spyAudio.playClassifiedStamp(); setScreen('investigation');}} className={primaryButton}><Search size={19}/>{t('بدء التحقيق', 'Start investigating')}</button>
            </div>
            <div className="flex flex-col gap-2 rounded-3xl border border-amber-400/20 bg-[#06101a]/70 p-3 backdrop-blur-md">
              <h3 className="text-center text-sm font-bold text-amber-200">{t('المشتبه بهم', 'Six suspects')}</h3>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-3 xl:grid-cols-6">
                {activeCase.suspects.map(person => <Portrait key={person.id} person={person} compact disabled />)}
              </div>
            </div>
          </div>
          {notice}
        </section>
      )}
      {screen === 'investigation' && (
        <section className={container + ' gap-3'}>
          <div className="grid flex-1 items-stretch gap-3 lg:grid-cols-[minmax(260px,.85fr)_minmax(0,1.4fr)]">
            <div className="flex flex-col justify-between gap-3 rounded-2xl border border-amber-500/45 bg-[#091823]/95 p-3 shadow-2xl backdrop-blur-xl sm:p-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-amber-300"><Fingerprint size={17}/>{t('الإفادة', 'Statement')} {clueIndex + 1}/{activeCase.clues.length}</span>
                  <span className="rounded-full border border-amber-500/25 px-2 py-1 text-[11px] text-amber-100">{t('الأبرياء', 'Cleared')} {eliminated.length}/5</span>
                </div>
                {level === 'advanced' && activeClue.cipherKey && !cipherOpened ? (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-amber-100">{activeClue.cipherHint}</p>
                    <div className="flex flex-wrap gap-2">{(activeClue.cipherOptions || []).map(option => <button key={option} type="button" onClick={() => {
                      if (option === activeClue.cipherKey) { setCipherOpened(true); spyAudio.playCipherDecode(); setFeedback(''); }
                      else { setErrors(value => value + 1); setFeedback(t('مفتاح خاطئ، أعد المحاولة.', 'Wrong key. Try again.')); spyAudio.playWrongBuzzer(); }
                    }} className={secondaryButton + ' text-xs'}>{option}</button>)}</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p lang="ar" dir="rtl" className="rounded-xl bg-[#e6d0a6] p-3 text-center text-base font-bold leading-loose text-[#382815] sm:p-4 sm:text-lg">{activeClue.speech}</p>
                    {language === 'en' && <p className="text-sm leading-relaxed text-slate-100">{narrative?.cluesEn[clueIndex] || activeClue.speech}</p>}
                    {language === 'ar' && showTranslation && <p dir="ltr" className="text-sm leading-relaxed text-slate-200">{narrative?.cluesEn[clueIndex] || ''}</p>}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={secondaryButton + ' flex-1 text-xs sm:text-sm'} onClick={() => playSpeech(activeClue.speech)}><Volume2 size={16}/>{t('استمع', 'Listen')}</button>
                <button type="button" className={secondaryButton + ' flex-1 text-xs sm:text-sm'} onClick={() => setShowTranslation(!showTranslation)}><BookOpen size={16}/>{t('الترجمة', 'Translation')}</button>
                <button type="button" className={secondaryButton + ' flex-1 text-xs sm:text-sm'} onClick={() => setShowDossier(true)}><Fingerprint size={16}/>{t('المفردات', 'Words')}</button>
              </div>
              {clueCleared && !readyToAccuse && <button type="button" className={primaryButton} onClick={nextClue}><ChevronLeft size={17}/>{t('الدليل التالي', 'Next clue')}</button>}
              {readyToAccuse && <button type="button" className={primaryButton} onClick={() => { setAccusationOpen(true); setFeedback(''); }}><ShieldCheck size={17}/>{t('وجّه الاتهام', 'Make an accusation')}</button>}
              <p className="text-xs leading-relaxed text-slate-300">{t('اقرأ الإفادة واضغط على الأشخاص الذين ثبتت براءتهم فقط.', 'Read the statement and tap only the suspects it clears.')}</p>
            </div>
            <div className="flex min-h-0 flex-col justify-between gap-2 rounded-2xl border border-amber-400/30 bg-black/50 p-3 backdrop-blur-md">
              <div className="flex items-center justify-between gap-2 text-sm font-bold text-amber-200"><span>{t('ملفات المشتبه بهم', 'Suspect files')}</span><span className="text-xs text-slate-200">{t('الأخطاء', 'Mistakes')} {errors}</span></div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-3 lg:gap-4">
                {activeCase.suspects.map(person => <Portrait key={person.id} person={person} eliminated={eliminated.includes(person.id)} disabled={eliminated.includes(person.id) || clueCleared || accusationOpen} onClick={() => onEliminate(person)}/>)}
              </div>
            </div>
          </div>
          {notice}
        </section>
      )}
      {screen === 'envelope' && (
        <section className={container + ' justify-center'}>
          <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-5 rounded-3xl border border-amber-400/60 bg-[#08141e]/95 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-10">
            <p className="text-sm font-bold tracking-wide text-amber-300">{t('ملف سري', 'CLASSIFIED CASE FILE')}</p>
            <div className="relative flex h-44 w-64 items-center justify-center rounded-xl border-2 border-amber-500/50 bg-gradient-to-b from-[#d9bd8e] to-[#8e6a42] shadow-[0_20px_60px_rgba(0,0,0,.5)]">
              <div className="absolute left-0 right-0 top-0 h-1/2 origin-top border-b border-[#735235] bg-[#ead2a7]" style={{clipPath:'polygon(0 0,100% 0,50% 100%)'}}/>
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#bd8b51] bg-red-800 text-amber-100 shadow-lg"><Fingerprint size={26}/></div>
            </div>
            <h2 className="text-2xl font-black text-amber-200">{t('أُغلقت القضية بنجاح', 'Case closed successfully')}</h2>
            <p className="max-w-md text-sm text-slate-200">{t('افتح الملف للاطلاع على الجاني والأدلة، ثم اختبر كلمات القضية.', 'Open the file to review your suspect and evidence, then practice the case vocabulary.')}</p>
            <button type="button" onClick={() => { spyAudio.playEnvelopeOpen(); setScreen('report'); }} className={primaryButton}><MailOpen size={19}/>{t('فتح ملف القضية', 'Open case file')}</button>
          </div>
        </section>
      )}
      {screen === 'report' && (
        <section className={container + ' justify-center gap-3'}>
          <div className="grid flex-1 items-center gap-4 lg:grid-cols-2">
            <div ref={reportRef} className="flex flex-col gap-3 rounded-3xl border border-amber-400/60 bg-[#08141e] p-5 shadow-2xl sm:p-7">
              <div className="flex items-center justify-between"><span className="text-xs font-bold text-amber-300">{t('تقرير إغلاق القضية', 'FINAL CASE REPORT')}</span><ShieldCheck size={22} className="text-amber-300"/></div>
              <h2 className="text-2xl font-black text-amber-200">{t(labelAr, labelEn)}</h2>
              <div className="flex items-center gap-4 rounded-2xl border border-red-400/30 bg-[#1c1317] p-3">
                <img className="h-20 w-16 rounded-lg object-cover object-top" src={activeCase.suspects.find(s => s.id === activeCase.culpritId)?.image} alt=""/>
                <div><span className="text-xs text-slate-300">{t('الجاني الذي حددته', 'Identified suspect')}</span><p className="text-xl font-black text-amber-100">{activeCase.suspects.find(s => s.id === activeCase.culpritId)?.name}</p><p className="mt-1 text-xs text-emerald-300">{t('تم التحقق من الأدلة', 'Evidence verified')}</p></div>
              </div>
              <p lang="ar" dir="rtl" className="rounded-xl bg-white/5 p-3 text-sm leading-loose text-slate-100">{evidenceAr}</p>
              <div className="flex items-center justify-between"><span className="font-semibold text-amber-200">{t('النتيجة', 'Score')}</span><strong className="text-2xl text-amber-200">{score}/100</strong></div>
              <div className="rounded-xl border border-amber-500/30 p-3">
                <h3 className="mb-2 font-bold text-amber-200">{t('كلمات من القضية', 'Words from the case')}</h3>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {activeCase.evidenceTerms.map(term => <div key={term.ar} className="flex items-center justify-between gap-2 border-b border-white/10 py-1 text-sm"><span lang="ar">{term.ar}</span><span dir="ltr" className="text-xs text-slate-300">{term.en}</span></div>)}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 rounded-3xl border border-amber-400/30 bg-[#08141e]/95 p-4 shadow-xl sm:p-6">
              <h3 className="text-xl font-black text-amber-200">{t('تدرب على كلمات القضية', 'Practice the case words')}</h3>
              {!wordsComplete ? (
                <>
                  <p className="text-xs text-slate-300">{t('اختر المعنى الصحيح لكل كلمة. يمكن إعادة المحاولة.', 'Choose the correct meaning for each Arabic word. You can retry.')}</p>
                  <p className="text-xs text-amber-200">{answersCount + 1}/{activeCase.evidenceTerms.length}</p>
                  <div className="rounded-xl bg-[#e6d0a6] p-4 text-center text-[#362516]">
                    <p className="text-2xl font-black">{activeCase.evidenceTerms[answersCount].ar}</p>
                    <button type="button" className="mt-2 inline-flex items-center gap-1 text-xs font-bold" onClick={() => playSpeech(activeCase.evidenceTerms[answersCount].ar)}><Volume2 size={15}/>{t('استمع', 'Listen')}</button>
                  </div>
                  <div className="grid gap-2">
                    {wordOptions(activeCase.evidenceTerms, answersCount).map(answer => <button key={answer} type="button" className={secondaryButton} onClick={() => answerWord(answer)} dir="ltr">{answer}</button>)}
                  </div>
                </>
              ) : (
                <div className="space-y-3 rounded-2xl border border-emerald-400/40 bg-emerald-950/20 p-5 text-center">
                  <CheckCircle2 size={40} className="mx-auto text-emerald-400"/>
                  <h4 className="text-lg font-bold text-emerald-200">{t('أتقنت كلمات القضية!', 'You mastered the case words!')}</h4>
                  <p className="text-sm text-slate-200">{t('أحسنت، أصبح تقرير القضية جاهزًا.', 'Your case report is ready.')}</p>
                </div>
              )}
              {notice}
              {reportIsReady && <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button className={secondaryButton} type="button" disabled={isPdfLoading} onClick={downloadPdf}><FileDown size={18}/>{t('تحميل التقرير PDF', 'Download PDF')}</button>
                <button className={primaryButton} type="button" onClick={nextCase}><ChevronLeft size={18}/>{t('القضية التالية', 'Next case')}</button>
              </div>}
              {!reportIsReady && <p className="text-center text-xs text-slate-300">{t('أكمل التدريب لفتح التقرير والقضية التالية.', 'Finish the vocabulary practice to unlock the report and next case.')}</p>}
            </div>
          </div>
        </section>
      )}
      {screen === 'complete' && (
        <section className={container + ' justify-center'}>
          <div className="mx-auto max-w-xl space-y-5 rounded-3xl border border-amber-400/50 bg-[#091924]/95 p-8 text-center shadow-2xl">
            <Sparkles size={56} className="mx-auto text-amber-300"/>
            <h2 className="text-3xl font-black text-amber-200">{t('أنهيت جميع القضايا!', 'All cases completed!')}</h2>
            <p className="text-slate-200">{t('أتممت', 'You completed')} {progress[level].completedIds.length} {t('قضايا في هذا المستوى.', 'cases at this level.')}</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button type="button" className={secondaryButton} onClick={() => setScreen('intro')}><Home size={17}/>{t('اختيار مستوى آخر', 'Choose another level')}</button>
              <button type="button" className={primaryButton} onClick={() => {setCaseIndex(0);resetInvestigation();setScreen('briefing');}}><RotateCcw size={17}/>{t('أعد القضايا للتدريب', 'Practice again')}</button>
            </div>
          </div>
        </section>
      )}
      {showDossier && screen === 'investigation' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-label={t('سجل الأدلة', 'Evidence file')} className="w-full max-w-md space-y-3 rounded-2xl border border-amber-400/60 bg-[#081823] p-5 shadow-2xl">
            <div className="flex items-center justify-between"><h3 className="text-lg font-bold text-amber-200">{t('كلمات وأدلة القضية', 'Case words and evidence')}</h3><button type="button" aria-label={t('إغلاق','Close')} onClick={() => setShowDossier(false)}><X size={19}/></button></div>
            {activeCase.evidenceTerms.map(word => <button type="button" key={word.ar} onClick={() => playSpeech(word.ar)} className="flex min-h-[40px] w-full items-center justify-between gap-2 rounded-xl border border-amber-400/20 px-3 py-2 text-sm hover:bg-amber-400/10"><span lang="ar" className="font-bold text-amber-200">{word.ar}</span><span className="flex items-center gap-2 text-slate-300" dir="ltr"><Volume2 size={14}/>{word.en}</span></button>)}
            <button type="button" className={primaryButton + ' w-full'} onClick={() => setShowDossier(false)}>{t('تابع التحقيق', 'Continue investigation')}</button>
          </div>
        </div>
      )}
      {accusationOpen && screen === 'investigation' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-3 backdrop-blur-md">
          <div role="dialog" aria-modal="true" aria-label={t('توجيه الاتهام','Make an accusation')} className="my-auto w-full max-w-3xl space-y-3 rounded-2xl border border-amber-400/60 bg-[#081823] p-4 shadow-2xl sm:p-6">
            <div className="flex items-center justify-between"><h3 className="text-lg font-black text-amber-200">{t('من الجاني؟ قدم الدليل.', 'Who did it? Show the evidence.')}</h3><button type="button" aria-label={t('إغلاق','Close')} onClick={() => {setAccusationOpen(false);setFeedback('');}}><X size={20}/></button></div>
            <p className="rounded-xl border border-amber-300/30 bg-[#e6d0a6] p-3 text-center text-sm font-bold leading-relaxed text-[#2b1d0c]" lang="ar" dir="rtl">{evidenceAr}</p>
            {language === 'en' && <p className="text-sm text-amber-100">{evidenceEn}</p>}
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">{activeCase.suspects.map(person => <Portrait key={person.id} person={person} compact selected={accusedId === person.id} onClick={() => {setAccusedId(person.id);setFeedback('');}}/>)}</div>
            <p className="text-sm font-bold text-amber-100">{t('ما سبب اتهامك لهذا الشخص؟', 'Why do you accuse this person?')}</p>
            <div className="grid gap-2">
              {[
                ['random',t('لأنه في أول صورة.', 'Because they are in the first photo.')],
                ['evidence',t(level === 'beginner' ? 'لأن وصف الدليل الأخير يطابق شكله.' : 'لأن الأدلة أثبتت براءة الآخرين.',level === 'beginner' ? 'The final visual clue matches their appearance.' : 'The other suspects have verified alibis.')],
                ['looks',t('لأن وجهه يبدو غاضبًا.', 'Because their face looks angry.')],
              ].map(([id,label]) => <button key={id} type="button" aria-pressed={reason === id} onClick={() => setReason(id)} className={secondaryButton + ' w-full text-start text-sm ' + (reason === id ? 'border-amber-200 bg-amber-500/20' : '')}>{label}</button>)}
            </div>
            {notice}
            <button type="button" disabled={!accusedId || !reason} className={primaryButton + ' w-full disabled:cursor-not-allowed disabled:opacity-50'} onClick={submitAccusation}><ShieldCheck size={18}/>{t('اعتماد الاتهام', 'Submit accusation')}</button>
          </div>
        </div>
      )}
    </main>
  );
};
