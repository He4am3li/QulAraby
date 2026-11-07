import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Check, CheckCircle2, ChevronLeft, ChevronRight, FileDown, Fingerprint, Headphones, HelpCircle, Home, LockKeyhole, MailOpen, Music2, RotateCcw, Search, ShieldCheck, Sparkles, Volume2, VolumeX, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { CASES_DATABASE, spyAudio, type DetectiveCase, type DifficultyLevel, type EvidenceTerm, type SuspectPerson } from './DetectiveMystery';
import { DETECTIVE_NARRATIVES } from './detectiveNarratives';
import { detectiveRectStyle, getDetectiveStartRect, getAdvancedPosterPortraitStyle } from './detectiveVisualGeometry';

type Screen = 'intro' | 'briefing' | 'investigation' | 'envelope' | 'report' | 'complete';
type UiLanguage = 'ar' | 'en';
type LevelProgress = { completedIds: number[]; nextIndex: number; bestScores: Record<number, number> };
type Progress = Record<DifficultyLevel, LevelProgress>;
const STORAGE_KEY = 'qul:detective:progress:v3';
const LEGACY_STORAGE_KEY = 'qul:detective:progress:v2';

const emptyLevel = (): LevelProgress => ({ completedIds: [], nextIndex: 0, bestScores: {} });
const emptyProgress = (): Progress => ({ beginner: emptyLevel(), intermediate: emptyLevel(), advanced: emptyLevel() });
const loadProgress = (): Progress => {
  if (typeof window === 'undefined') return emptyProgress();
  try {
    const current = window.localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(current || window.localStorage.getItem(LEGACY_STORAGE_KEY) || '{}');
    const defaults = emptyProgress();
    (Object.keys(defaults) as DifficultyLevel[]).forEach(level => {
      const record = parsed?.[level];
      if (record && Array.isArray(record.completedIds)) defaults[level] = {
        completedIds: record.completedIds.filter((id: unknown) => typeof id === 'number'),
        nextIndex: typeof record.nextIndex === 'number' ? record.nextIndex : 0,
        bestScores: record.bestScores && typeof record.bestScores === 'object' ? record.bestScores : {},
      };
    });
    if (!current) defaults.advanced = emptyLevel(); // Old advanced IDs 201/202 now refer to different mysteries.
    return defaults;
  } catch { return emptyProgress(); }
};
const storeProgress = (progress: Progress) => {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch {}
};
const wordOptions = (words: EvidenceTerm[], index: number, caseId: number): string[] => {
  const others = words.filter((_, i) => i !== index).map(word => word.en);
  const distractors = [others[(index * 2) % others.length], others[(index * 2 + 1) % others.length]];
  const correctPosition = (index + caseId) % 3;
  distractors.splice(correctPosition, 0, words[index].en);
  return distractors;
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
  const [advancedProofAnswers, setAdvancedProofAnswers] = useState<Record<number, number>>({});
  const [reason, setReason] = useState('');
  const [solved, setSolved] = useState(false);
  const [wordAnswers, setWordAnswers] = useState<Record<number, string>>({});
  const [reportTab, setReportTab] = useState<'practice' | 'dossier'>('practice');
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
  const score = Math.max(0, Math.min(100,
    Math.round((eliminated.length / Math.max(1, activeCase.suspects.length - 1)) * 50)
    + (solved ? 35 : 0) + answersCount * 3 - errors * 5));
  // All suspects are visible at once in the original cinematic scene.
  const suspectColumns = activeCase.suspects.length > 10 ? 6 : activeCase.suspects.length > 6 ? 5 : 3;
  const suspectRows = Math.ceil(activeCase.suspects.length / suspectColumns);
  const advancedProofs = level === 'advanced' ? (narrative?.accusationProofs || []) : [];
  const advancedProofsCorrect = advancedProofs.length === 2 &&
    advancedProofs.every((proof, index) => advancedProofAnswers[index] === proof.correctIndex);

  // The cinematic soundscape uses authored music and effects only.
  // Never synthesize Arabic speech for dossiers, witness statements or words.
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
  };
  const resetInvestigation = () => {
    setClueIndex(0); setEliminated([]); setCipherOpened(false);
    setFeedback(''); setErrors(0); setShowTranslation(false);
    setShowDossier(false); setAccusationOpen(false); setAccusedId(null);
    setReason(''); setSolved(false); setWordAnswers({}); setReportTab('practice');
    setAdvancedProofAnswers({});
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
    if (!accusedId || (level === 'advanced' && Object.keys(advancedProofAnswers).length < advancedProofs.length) ||
      (level !== 'advanced' && !reason)) {
      setFeedback(t('اختر مشتبهًا به وأكمل تبرير الاتهام أولًا.', 'Choose a suspect and complete the evidence questions first.'));
      return;
    }
    if (accusedId !== activeCase.culpritId || (level === 'advanced' ? !advancedProofsCorrect : reason !== 'evidence')) {
      spyAudio.playWrongBuzzer();
      setErrors(value => value + 1);
      setFeedback(t(level === 'advanced'
        ? 'الاتهام غير صحيح: تحقق من الشخص ومن كل دليل مستقل قبل الاعتماد.'
        : 'الاتهام غير مكتمل. قارن الوصف الأخير بصور الأشخاص واستبعد من ثبتت براءته.',
        level === 'advanced'
          ? 'Review both independent evidence records and the accused suspect.'
          : 'Not quite. Compare the final clue with the portraits and check the alibis.'));
      return;
    }
    spyAudio.playVictoryFanfare(); setSolved(true); setAccusationOpen(false);
    setFeedback('');
    const base = Math.max(0, 85 - errors * 5);
    markCaseSolved(base);
    setScreen('report');
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
  const notice = feedback && <div role="status" aria-live="polite" className="mx-auto w-full max-w-4xl rounded-xl border border-amber-300/35 bg-[#0c1822]/95 px-3 py-2 text-center text-xs text-amber-100 shadow-lg sm:text-sm">{feedback}</div>;
  const primaryButton = 'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-amber-200/70 bg-gradient-to-b from-amber-500 to-amber-700 px-5 py-2.5 font-bold text-slate-950 shadow-[0_10px_30px_rgba(217,119,6,.25)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-amber-200';
  const secondaryButton = 'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-amber-400/40 bg-[#101e29]/90 px-4 py-2.5 font-semibold text-amber-100 transition hover:bg-amber-400/15';
  const container = 'relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-3 py-3 sm:px-6 sm:py-5';
  const deviceNotice = t('يُحفظ تقدمك على هذا الجهاز.', 'Progress is saved on this device.');

  return (
    <main dir={language === 'ar' ? 'rtl' : 'ltr'} lang={language} className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-[#070d14] font-sans text-slate-100">
      {screen === 'intro' && (
        <section className="relative flex w-full flex-1 items-center justify-center overflow-hidden bg-[#03080e]" aria-label={t('اختيار مستوى التحقيق', 'Select investigation level')}>
          <div className="relative aspect-video w-full overflow-hidden shadow-2xl" style={{ maxHeight: '100dvh', maxWidth: 'calc(100dvh * (16 / 9))' }}>
            <div className="pointer-events-none absolute inset-0 bg-center bg-no-repeat" style={{ backgroundImage: 'url("/١.webp"), url("/1.webp")', backgroundSize: '100% 100%' }}/>
            {onBack && <button type="button" onClick={onBack} className="absolute right-[1%] top-[2%] z-20 rounded-full border border-amber-500/40 bg-black/55 px-3 py-1.5 text-xs font-bold text-amber-200" aria-label={t('العودة إلى الألعاب', 'Back to games')}><ArrowRight size={15}/></button>}
            {([
              { id: 'beginner' as DifficultyLevel, left: '23.2%' },
              { id: 'intermediate' as DifficultyLevel, left: '41.6%' },
              { id: 'advanced' as DifficultyLevel, left: '60.0%' },
            ]).map(item => <button key={item.id} type="button" onClick={() => chooseLevel(item.id)}
              aria-label={t('المستوى ', 'Level ') + levelLabel(item.id, language)}
              className="absolute z-20 cursor-pointer rounded-xl bg-transparent outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 hover:bg-white/5"
              style={{ left: item.left, top: '50.5%', width: '16.8%', height: '35.5%' }}/>)}
            <button type="button" onClick={toggleMute} title={t('كتم الصوت', 'Mute sound')}
              aria-label={t('الصوت', 'Sound')} className="absolute z-20 flex items-center justify-center rounded-full bg-transparent hover:bg-white/10"
              style={{ left: '2.7%', top: '86%', width: '4.5%', aspectRatio: '1' }}>
              {isMuted && <VolumeX className="h-[65%] w-[65%] rounded-full bg-black/80 p-1 text-red-400" />}
            </button>
            <button type="button" onClick={toggleMusic} title={t('الموسيقى', 'Music')} aria-label={t('الموسيقى', 'Music')}
              className="absolute z-20 flex items-center justify-center rounded-full bg-transparent hover:bg-white/10"
              style={{ left: '8.9%', top: '86%', width: '4.5%', aspectRatio: '1' }}>
              {!musicPlaying && <span className="rounded-full bg-black/70 px-1 text-xs text-slate-300">×</span>}
            </button>
          </div>
        </section>
      )}
      {screen === 'briefing' && (
        <section className="relative flex w-full flex-1 items-center justify-center overflow-hidden bg-[#03080e]" aria-label={t('بلاغ الواقعة', 'Crime briefing')}>
          <div className="relative aspect-video w-full overflow-hidden shadow-2xl" style={{ maxHeight: '100dvh', maxWidth: 'calc(100dvh * (16 / 9))' }}>
            <div className="pointer-events-none absolute inset-0 bg-center bg-no-repeat" style={{ backgroundImage: activeCase.bgImage, backgroundSize: '100% 100%' }}/>
            <button type="button" onClick={() => setScreen('intro')}
              aria-label={t('الرجوع لاختيار المستوى', 'Back to level selection')}
              className="absolute right-[1%] top-[2%] z-20 rounded-full border border-amber-500/40 bg-black/50 p-2 text-amber-200 hover:bg-black/75">
              <ArrowRight size={15}/>
            </button>
            <button type="button" onClick={() => { setFeedback(''); spyAudio.playClassifiedStamp(); setScreen('investigation'); }}
              aria-label={t('بدء التحقيق واستبعاد الأبرياء', 'Start investigation and clear innocents')}
              title={t('بدء التحقيق', 'Start investigation')}
              className="absolute z-20 cursor-pointer rounded-lg bg-transparent outline-offset-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 hover:bg-white/5"
              style={detectiveRectStyle(getDetectiveStartRect(level, activeCase.caseNumber))}/>
            <div className="absolute bottom-[2%] left-[1%] z-20 flex gap-2">
              <button type="button" onClick={toggleMute} aria-label={t('الصوت', 'Sound')} className="rounded-full border border-amber-400/30 bg-black/50 p-1.5 text-amber-100 hover:bg-black/75">{isMuted ? <VolumeX size={15}/> : <Volume2 size={15}/>}</button>
              <button type="button" onClick={toggleMusic} aria-label={t('الموسيقى', 'Music')} className="rounded-full border border-amber-400/30 bg-black/50 p-1.5 text-amber-100 hover:bg-black/75"><Music2 size={15}/></button>
            </div>
          </div>
        </section>
      )}
      {screen === 'investigation' && (
        <section className="relative flex w-full flex-1 items-center justify-center overflow-hidden bg-[#03080e]" aria-label={t('غرفة التحقيق', 'Investigation room')}>
          <div className="relative aspect-video w-full overflow-hidden shadow-2xl" style={{ maxHeight: '100dvh', maxWidth: 'calc(100dvh * (16 / 9))' }}>
            {/* Original ٨.jpeg: full-resolution picture with its built-in evidence and portrait frames. */}
            <div className="pointer-events-none absolute inset-0 bg-center bg-no-repeat" style={{ backgroundImage: 'url("/٨.jpeg"), url("/8.jpeg"), url("/٨.webp")', backgroundSize: '100% 100%' }}/>
            <button type="button" aria-label={t('العودة إلى مسرح الجريمة', 'Back to scene')}
              onClick={() => { setFeedback(''); setScreen('briefing'); }}
              className="absolute right-[1%] top-[2%] z-30 rounded-full border border-amber-500/40 bg-black/55 p-1.5 text-amber-200 hover:bg-black/75">
              <ArrowRight size={15}/>
            </button>
            {/* Printed yellow dossier: its text and all 3 options share ONE constrained
                box. The wording and answer buttons may never paint outside the paper. */}
            <div dir="rtl" lang="ar" className="absolute z-20 overflow-hidden text-center text-[#352715]"
              style={{ left: '7.22%', top: '31.1%', width: '28.9%', height: '21.9%' }}>
              {level === 'advanced' && activeClue.cipherKey && !cipherOpened ? (
                <div className="grid h-full w-full min-h-0 min-w-0 grid-rows-[auto_auto_minmax(0,1fr)] overflow-hidden px-[3%] py-[2%]"
                  style={{ rowGap: '1.7%' }} aria-label={t('فك شفرة الإفادة', 'Decode witness statement')}>
                  <div className="flex min-w-0 items-center justify-center gap-1 font-black leading-tight"
                    style={{ fontSize: 'clamp(7px, .87vw, 15px)' }}>
                    <LockKeyhole className="h-[1em] w-[1em] shrink-0"/>
                    {t('الإفادة المشفرة', 'Cipher clue')} {clueIndex + 1}/{activeCase.clues.length}
                  </div>
                  <div className="min-w-0 self-center px-1 text-center font-semibold leading-tight"
                    style={{ fontSize: 'clamp(6px, .78vw, 14px)', overflowWrap: 'anywhere' }}>
                    <span className="block font-bold">
                      {t('شفرة المصدر:', 'Cipher source:')}{' '}
                      {activeClue.cipherHint?.match(/شفرة المصدر:\s*([^.]*)/)?.[1]?.trim() || activeClue.cipherKey}
                    </span>
                    <span className="block text-[#63503a]">
                      {feedback || t('اقرأ بالعكس، ثم اختر المصدر الصحيح.', 'Read backwards and choose the source.')}
                    </span>
                  </div>
                  <div className="grid min-h-0 min-w-0 w-full grid-rows-3 gap-[2px] overflow-hidden">
                    {(activeClue.cipherOptions || []).map(option =>
                      <button type="button" key={option}
                        onClick={() => {
                          if (option === activeClue.cipherKey) {
                            spyAudio.playCipherDecode(); setCipherOpened(true); setFeedback('');
                          } else {
                            spyAudio.playWrongBuzzer(); setErrors(value => value + 1);
                            setFeedback(t('شفرة غير صحيحة، أعد المحاولة.', 'Incorrect code. Try again.'));
                          }
                        }}
                        className="flex h-full min-h-0 min-w-0 w-full items-center justify-center overflow-hidden rounded-[3px] border border-[#8e6a35]/45 bg-[#f0dfb7]/80 px-[2%] text-center font-bold leading-tight text-[#352817] transition-colors hover:bg-[#fff1ce] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4d361e]"
                        style={{ fontSize: 'clamp(7px, .82vw, 14px)', overflowWrap: 'anywhere' }}>
                        {option}
                      </button>)}
                  </div>
                </div>
              ) : (
                <div className="flex h-full w-full min-h-0 min-w-0 flex-col items-center justify-center gap-[2%] overflow-hidden px-[3%] py-[2%]">
                  <div className="shrink-0 font-black" style={{ fontSize: 'clamp(7px, .86vw, 15px)' }}>
                    {t('الإفادة', 'Statement')} {clueIndex + 1}/{activeCase.clues.length}
                  </div>
                  <div className="min-h-0 w-full overflow-y-auto text-center font-semibold leading-snug"
                    style={{ fontSize: 'clamp(7px, .88vw, 15px)', overflowWrap: 'anywhere', scrollbarWidth: 'none' }}>
                    <p>{activeClue.speech}</p>
                    {(showTranslation || language === 'en') && <p lang="en" dir="ltr" className="mt-1 text-[#55402a]">
                      {narrative?.cluesEn[clueIndex] || ''}
                    </p>}
                  </div>
                  <button type="button" onClick={() => setShowTranslation(v => !v)}
                    className="shrink-0 rounded border border-[#80623b]/35 bg-[#e5cc9f]/60 px-2 font-bold"
                    style={{ fontSize: 'clamp(7px, .75vw, 13px)' }}>
                    {showTranslation ? t('إخفاء الترجمة', 'Hide English') : t('الترجمة', 'Translation')}
                  </button>
                </div>
              )}
            </div>
            {/* Hide the six obsolete blank frames printed in the original investigation art.
                The dark matte belongs behind the portraits, not in front of the scene. */}
            <div aria-hidden="true" className="pointer-events-none absolute z-10"
              style={{
                left: '37.5%', top: '11.8%', width: '62.5%', height: '69.3%',
                background: 'linear-gradient(110deg, #0a1721 0%, #101e2b 56%, #0b1722 100%)',
                boxShadow: 'inset 0 0 45px rgba(0,0,0,.45)',
                maskImage: 'linear-gradient(90deg, transparent 0%, black 1.5%, black 99%, transparent 100%)',
              }}/>
            {/* One uninterrupted investigation roster. Original case portraits are cropped
                from the correct scene instead of using the old misaligned thumbnail cuts. */}
            <div dir="rtl"
              className="absolute z-20 flex flex-wrap content-center items-center justify-center overflow-hidden"
              style={{
                left: activeCase.suspects.length <= 6 ? '39.4%' : '38.6%',
                top: activeCase.suspects.length <= 6 ? '16.1%' : '17.8%',
                width: activeCase.suspects.length <= 6 ? '43.2%' : '60.5%',
                height: activeCase.suspects.length <= 6 ? '57%' : '59.7%',
                columnGap: '0.72%', rowGap: '3.2%',
              }}>
              {activeCase.suspects.map((person, suspectIndex) => {
                const cleared = eliminated.includes(person.id);
                return <button type="button" key={person.id}
                  aria-label={person.name + (cleared ? '، بريء' : '')}
                  disabled={cleared || clueCleared || accusationOpen}
                  onClick={() => onEliminate(person)}
                  className={'group flex min-h-0 flex-col overflow-hidden rounded-[3px] bg-transparent transition-transform duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-100 ' +
                    (cleared ? 'opacity-70 ' : 'hover:-translate-y-0.5')}
                  style={{
                    flex: '0 0 ' + ((99.3 - (suspectColumns - 1) * 0.72) / suspectColumns) + '%',
                    height: ((99.3 - (suspectRows - 1) * 3.2) / suspectRows) + '%',
                  }}>
                  <span className={'relative block min-h-0 w-full flex-1 overflow-hidden rounded-t-[3px] border border-b-0 bg-[#101820] shadow-md ' +
                    (cleared ? 'border-emerald-400/70 ' : 'border-[#bb9251]/80 group-hover:border-amber-200')}>
                    {level === 'advanced' && getAdvancedPosterPortraitStyle(activeCase.caseNumber, suspectIndex, activeCase.bgImage) ? (
                      <span aria-hidden="true"
                        className={'absolute inset-0 block h-full w-full transition-[filter] ' + (cleared ? 'grayscale brightness-[.55]' : '')}
                        style={getAdvancedPosterPortraitStyle(activeCase.caseNumber, suspectIndex, activeCase.bgImage) || undefined}/>
                    ) : (
                      <img src={person.image} alt="" draggable={false} loading="eager"
                        className={'absolute inset-0 block h-full w-full object-contain object-center transition-[filter] ' +
                          (cleared ? 'grayscale brightness-[.55]' : '')}/>
                    )}
                    {cleared && <span className="absolute inset-0 flex items-center justify-center bg-emerald-950/25">
                      <Check className="h-[25%] w-auto rounded-full bg-emerald-700 p-1 text-white"/>
                    </span>}
                  </span>
                  <span className={'flex h-[17%] min-h-0 w-full flex-none items-center justify-center overflow-hidden rounded-b-[3px] border border-[#bb9251]/80 bg-[#080f18]/95 px-0.5 text-center font-bold leading-none text-[#f4d497] ' +
                    (cleared ? 'text-slate-400 line-through' : '')}
                    style={{ fontSize: suspectColumns === 6 ? 'clamp(7px, .89vw, 15px)' : 'clamp(8px, 1.01vw, 17px)' }}>
                    {person.name}
                  </span>
                </button>;
              })}
            </div>
            <div className="absolute left-[7.5%] top-[68.2%] z-30 flex w-[28%] flex-col gap-1">
              {clueCleared && !readyToAccuse && <button type="button" onClick={nextClue}
                className="rounded-md border border-amber-500/70 bg-[#0c1822]/85 px-1 py-1 font-bold text-amber-200"
                style={{ fontSize: 'clamp(8px, .95vw, 15px)' }}>{t('الإفادة التالية', 'Next statement')}</button>}
              {readyToAccuse && <button type="button" onClick={() => { setAccusationOpen(true); setFeedback(''); }}
                className="rounded-md border border-red-400/70 bg-red-950/85 px-1 py-1 font-bold text-amber-100"
                style={{ fontSize: 'clamp(8px, .95vw, 15px)' }}>{t('وجّه الاتهام', 'Accuse suspect')}</button>}
              {feedback && <div role="status" aria-live="polite" className="rounded-md bg-black/80 px-1 py-1 text-center text-amber-100"
                style={{ fontSize: 'clamp(8px, .85vw, 13px)' }}>{feedback}</div>}
            </div>
            <div className="absolute bottom-[2%] left-[2%] z-30 flex items-center gap-1">
              <button type="button" onClick={() => setShowDossier(true)} aria-label={t('سجل الأدلة', 'Evidence log')}
                className="rounded-md border border-amber-500/35 bg-black/60 p-1.5 text-amber-200"><Fingerprint className="h-3.5 w-3.5"/></button>
              <button type="button" onClick={toggleMute} aria-label={t('الصوت', 'Sound')}
                className="rounded-md border border-amber-500/35 bg-black/60 p-1.5 text-amber-200">{isMuted ? <VolumeX className="h-3.5 w-3.5"/> : <Volume2 className="h-3.5 w-3.5"/>}</button>
            </div>
          </div>
        </section>
      )}
      {screen === 'report' && (
        <section className="relative flex w-full flex-1 items-center justify-center overflow-hidden bg-[#03080e]" aria-label={t('التقرير النهائي', 'Case report')}>
          <div ref={reportRef} className="relative aspect-video w-full overflow-hidden shadow-2xl"
            style={{ maxHeight: '100dvh', maxWidth: 'calc(100dvh * (16 / 9))' }}>
            <div className="pointer-events-none absolute inset-0 bg-center bg-no-repeat"
              style={{ backgroundImage: 'url("/٩.jpeg"), url("/9.jpeg"), url("/٩.webp")', backgroundSize: '100% 100%' }}/>
            <button type="button" onClick={() => setScreen('intro')} aria-label={t('العودة للرئيسية', 'Back to levels')}
              className="absolute right-[1%] top-[2%] z-30 rounded-full border border-amber-500/40 bg-black/55 p-1.5 text-amber-200">
              <ArrowRight size={15}/>
            </button>
            {/* No new boxes: only fill the five existing printed vocabulary cells. */}
            {[
              {top:'38.2%',height:'6.4%'},{top:'44.6%',height:'6.4%'},{top:'51.0%',height:'6.4%'},
              {top:'57.5%',height:'6.5%'},{top:'64.1%',height:'6.8%'},
            ].map((pos, idx) => {
              const word=activeCase.evidenceTerms[idx]; if(!word)return null;
              return <React.Fragment key={idx}>
                <span lang="ar" dir="rtl" className="pointer-events-none absolute z-20 flex items-center justify-center px-1 text-center font-bold text-white"
                  style={{left:'65.5%',width:'19%',top:pos.top,height:pos.height,fontSize:'clamp(7px,.94vw,17px)',textShadow:'0 1px 5px #000'}}>{word.ar}</span>
                <span dir="ltr" className="pointer-events-none absolute z-20 flex items-center justify-center px-1 text-center font-bold text-white"
                  style={{left:'46.5%',width:'18.5%',top:pos.top,height:pos.height,fontSize:'clamp(7px,.85vw,16px)',textShadow:'0 1px 5px #000'}}>{word.en}</span>
              </React.Fragment>;
            })}
            <button type="button" onClick={downloadPdf} disabled={isPdfLoading} aria-label={t('تحميل تقرير PDF', 'Download PDF')}
              className="absolute z-30 cursor-pointer rounded-lg bg-transparent outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200 hover:bg-white/5"
              style={{ left:'45.9%',width:'18.5%',top:'74.5%',height:'8.2%' }}/>
            <button type="button" onClick={nextCase} aria-label={t('القضية التالية', 'Next case')}
              className="absolute z-30 cursor-pointer rounded-lg bg-transparent outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200 hover:bg-white/5"
              style={{ left:'66%',width:'18.6%',top:'74.5%',height:'8.2%' }}/>
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
            {activeCase.evidenceTerms.map(word => <div key={word.ar} className="flex min-h-[40px] w-full items-center justify-between gap-2 rounded-xl border border-amber-400/20 px-3 py-2 text-sm"><span lang="ar" className="font-bold text-amber-200">{word.ar}</span><span dir="ltr" className="text-slate-300">{word.en}</span></div>)}
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
            {/* Every suspect remains selectable in a single, balanced two-row grid. */}
            <div className="grid gap-1.5 sm:gap-2" dir="rtl"
              style={{gridTemplateColumns: 'repeat(' + suspectColumns + ', minmax(0, 1fr))'}}>
              {activeCase.suspects.map(person =>
                <Portrait key={person.id} person={person} compact
                  selected={accusedId === person.id}
                  onClick={() => {setAccusedId(person.id);setFeedback('');}}/>)}
            </div>
            <p className="text-sm font-bold text-amber-100">{t('ما سبب اتهامك لهذا الشخص؟', 'Why do you accuse this person?')}</p>
            {level === 'advanced' ? <div className="grid gap-3 sm:grid-cols-2">
              {advancedProofs.map((proof, index) => <div key={index} className="space-y-2 rounded-xl border border-amber-400/25 bg-black/30 p-3">
                <p className="text-sm font-bold text-amber-100">{index+1}. {t(proof.questionAr, proof.questionEn)}</p>
                {(language === 'ar' ? proof.choicesAr : proof.choicesEn).map((label, idx) =>
                  <button key={idx} type="button" aria-pressed={advancedProofAnswers[index] === idx} onClick={() => setAdvancedProofAnswers(v => ({...v,[index]:idx}))}
                    className={secondaryButton + ' w-full text-start text-xs ' + (advancedProofAnswers[index] === idx ? 'border-amber-200 bg-amber-500/20' : '')}>{label}</button>
                )}
              </div>)}
            </div> : <div className="grid gap-2">
              {[
                ['random',t('لأنه في أول صورة.', 'Because they are in the first photo.')],
                ['evidence',t(level === 'beginner' ? 'لأن وصف الدليل الأخير يطابق شكله.' : 'لأن الأدلة أثبتت براءة الآخرين.',level === 'beginner' ? 'The final visual clue matches their appearance.' : 'The other suspects have verified alibis.')],
                ['looks',t('لأن وجهه يبدو غاضبًا.', 'Because their face looks angry.')],
              ].map(([id,label]) => <button key={id} type="button" aria-pressed={reason === id} onClick={() => setReason(id)} className={secondaryButton + ' w-full text-start text-sm ' + (reason === id ? 'border-amber-200 bg-amber-500/20' : '')}>{label}</button>)}
            </div>}
            {notice}
            <button type="button" disabled={!accusedId || (level === 'advanced' ? Object.keys(advancedProofAnswers).length !== 2 : !reason)} className={primaryButton + ' w-full disabled:cursor-not-allowed disabled:opacity-50'} onClick={submitAccusation}><ShieldCheck size={18}/>{t('اعتماد الاتهام', 'Submit accusation')}</button>
          </div>
        </div>
      )}
    </main>
  );
};
