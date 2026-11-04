import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Headphones, Loader2, Play, ShieldCheck, Square, Volume2 } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { COUNTRY_DATA } from './Dialects';
import { decodeAudioData, generateSpeech } from '../services/gemini';
import {
  approveDialectVoice, defaultDialectVoice, useDialectVoiceProfiles, voiceProfileKey,
  VOICE_PALETTE, type DialectVoiceGender, type VoiceDelivery
} from '../services/dialectVoiceProfiles';

const DELIVERY: { id: VoiceDelivery; ar: string; en: string }[] = [
  { id: 'gentle', ar: 'هادئ ومطمئن', en: 'Gentle' },
  { id: 'natural', ar: 'طبيعي ومريح', en: 'Natural' },
  { id: 'expressive', ar: 'تفاعلي ومعبّر', en: 'Expressive' }
];

export const VoiceLab: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const { profiles, loading, error: readError } = useDialectVoiceProfiles();
  const [countryId, setCountryId] = React.useState('saudi');
  const [gender, setGender] = React.useState<DialectVoiceGender>('male');
  const country: any = COUNTRY_DATA.find(item => item.id === countryId) || COUNTRY_DATA[0];
  const defaultVoice = defaultDialectVoice(countryId, gender);
  const current = profiles[voiceProfileKey(countryId, gender)];
  const [voiceName, setVoiceName] = React.useState(defaultVoice.voiceName);
  const [delivery, setDelivery] = React.useState<VoiceDelivery>('natural');
  const [arabicTest, setArabicTest] = React.useState('');
  const [englishTest, setEnglishTest] = React.useState('');
  const [played, setPlayed] = React.useState({ ar: false, en: false });
  const [reviewed, setReviewed] = React.useState({ ar: false, en: false });
  const [generating, setGenerating] = React.useState<'ar' | 'en' | null>(null);
  const [playing, setPlaying] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const audioRef = React.useRef<{ ctx: AudioContext; source: AudioBufferSourceNode } | null>(null);
  const requestRef = React.useRef(0);

  const stopPlayback = React.useCallback(() => {
    const playingNow = audioRef.current;
    audioRef.current = null;
    if (playingNow) {
      playingNow.source.onended = null;
      try { playingNow.source.stop(); } catch (_) {}
      playingNow.source.disconnect();
      void playingNow.ctx.close().catch(() => {});
    }
    setPlaying(false);
  }, []);

  React.useEffect(() => {
    requestRef.current++;
    stopPlayback();
    setGenerating(null);
    const selected = profiles[voiceProfileKey(countryId, gender)] || defaultDialectVoice(countryId, gender);
    setVoiceName(selected.voiceName);
    setDelivery(selected.delivery);
    const firstDialogue = country.dialogue?.lines?.[0]?.dialect || country.vocab?.[0]?.dialect || 'أهلاً وسهلاً';
    const secondDialogue = country.dialogue?.lines?.[1]?.dialect || country.vocab?.[1]?.dialect || '';
    setArabicTest([firstDialogue, secondDialogue].filter(Boolean).join(' '));
    setEnglishTest('Hello! Welcome to ' + country.nameEn + '. Let me tell you about our food, traditions, and daily life. What would you like to know?');
    setPlayed({ ar: false, en: false });
    setReviewed({ ar: false, en: false });
    setNotice(null);
  }, [countryId, gender, country, profiles, stopPlayback]);

  React.useEffect(() => () => {
    requestRef.current++;
    const sound = audioRef.current;
    if (sound) {
      sound.source.onended = null;
      try { sound.source.stop(); } catch (_) {}
      sound.source.disconnect();
      void sound.ctx.close().catch(() => {});
      audioRef.current = null;
    }
  }, []);

  const changeVoice = (next: string) => {
    requestRef.current++;
    stopPlayback();
    setVoiceName(next);
    setPlayed({ ar: false, en: false });
    setReviewed({ ar: false, en: false });
    setNotice(null);
  };

  const tryVoice = async (lang: 'ar' | 'en') => {
    const text = (lang === 'ar' ? arabicTest : englishTest).trim();
    if (!text || generating) return;
    const request = ++requestRef.current;
    stopPlayback();
    setNotice(null);
    setGenerating(lang);
    try {
      const pcm = await generateSpeech(text.slice(0, 330), lang, voiceName);
      if (request !== requestRef.current) return;
      if (!pcm?.length) throw new Error('لم يرجع محرك الصوت أي تسجيل.');
      const ctx = new AudioContext();
      try {
        const buffer = await decodeAudioData(pcm, ctx);
        if (request !== requestRef.current) { void ctx.close(); return; }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        // Tempo is auditioned in context; identity stays anchored to the chosen voice.
        source.playbackRate.value = delivery === 'gentle' ? 0.96 : delivery === 'expressive' ? 1.04 : 1;
        audioRef.current = { ctx, source };
        source.onended = () => { setPlaying(false); audioRef.current = null; void ctx.close(); };
        source.start();
        setPlaying(true);
        setPlayed(previous => ({ ...previous, [lang]: true }));
      } catch (e) { void ctx.close(); throw e; }
    } catch (e: any) {
      if (request === requestRef.current) setNotice(e?.message || 'تعذر اختبار الصوت. تحقق من اتصال خدمة Gemini.');
    } finally {
      if (request === requestRef.current) setGenerating(null);
    }
  };

  const approve = async () => {
    if (!isAdmin || !played.ar || !played.en || !reviewed.ar || !reviewed.en || saving) return;
    setSaving(true);
    setNotice(null);
    try {
      await approveDialectVoice({
        countryId, gender, voiceName, delivery,
        approved: true, reviewedArabic: true, reviewedEnglish: true
      });
      setNotice('تم اعتماد الهوية الصوتية لهذه الشخصية. تُقرأ الموافقة من Firestore في المحادثات الجديدة.');
    } catch (e: any) {
      setNotice(e?.message || 'فشل حفظ الموافقة. تحقق من قواعد Firestore.');
    } finally { setSaving(false); }
  };
  const published = Boolean(current?.approved && current.reviewedArabic && current.reviewedEnglish &&
    current.voiceName === voiceName && current.delivery === delivery);
  const name = gender === 'male' ? country.characterMale.nameAr : country.characterFemale.nameAr;
  const englishName = gender === 'male' ? country.characterMale.nameEn : country.characterFemale.nameEn;

  return (
    <main dir="rtl" className="mx-auto flex h-[calc(100dvh-90px)] min-h-[460px] max-w-[1420px] flex-col gap-3 overflow-hidden px-3 py-3 text-slate-900 sm:px-5">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-[18px] border border-emerald-900/10 bg-white/90 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-emerald-950 p-2.5 text-emerald-100"><Headphones size={23}/></span>
          <div>
            <h1 className="text-base font-black sm:text-xl">مختبر أصوات اللهجات</h1>
            <p className="text-[10px] font-semibold text-slate-500 sm:text-xs">اعتماد الهوية الصوتية للمعلمين بعد اختبار العربية والإنجليزية</p>
          </div>
        </div>
        <button onClick={() => navigate('/dialects')} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold hover:bg-slate-50">العودة إلى اللهجات</button>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-[minmax(260px,.85fr)_minmax(0,1.5fr)]">
        <section className="flex min-h-0 flex-col gap-3 overflow-y-auto rounded-[19px] border border-emerald-950/10 bg-white/90 p-4 shadow-sm">
          <p className="text-xs font-black text-emerald-900">هوية المتحدث</p>
          <label className="text-xs font-bold">البلد
            <select value={countryId} onChange={e => setCountryId(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-500">
              {COUNTRY_DATA.map(c => <option key={c.id} value={c.id}>{c.flag} {c.nameAr}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="اختيار الشخصية">
            {(['male', 'female'] as const).map(g => <button key={g} type="button" aria-pressed={g === gender}
              onClick={() => setGender(g)}
              className={'rounded-xl border px-3 py-3 text-xs font-black transition ' + (g === gender ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-white text-slate-500')}>
              {g === 'male' ? country.characterMale.nameAr : country.characterFemale.nameAr}
            </button>)}
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/55 px-3 py-3">
            <p className="text-lg font-black text-emerald-950">{name} <span className="text-sm font-bold text-slate-400" dir="ltr">{englishName}</span></p>
            <p className="mt-1 text-xs text-slate-500">{country.dialect}</p>
          </div>
          <label className="text-xs font-bold">الصوت الأساسي
            <select value={voiceName} onChange={e => changeVoice(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-500">
              {VOICE_PALETTE[gender].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </label>
          <div className="space-y-1.5">
            <label className="text-xs font-bold">طابع الأداء
              <select value={delivery} onChange={e => { setDelivery(e.target.value as VoiceDelivery); setPlayed({ ar: false, en: false }); setReviewed({ ar: false, en: false }); }}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-500">
                {DELIVERY.map(d => <option key={d.id} value={d.id}>{d.ar}</option>)}
              </select>
            </label>
            <p className="text-[11px] leading-5 text-slate-500">تغيّر المعاينة سرعة الأداء قليلًا، ويستخدم الحوار الحي الطابع المختار كتعليمات صوتية.</p>
          </div>
          <p className="text-[11px] leading-5 text-slate-500">الاختيار يثبت صوت الشخصية، لكن صحة اللكنة المحلية تحتاج تقييمًا بشريًا، ولا تُستنتج من اسم الصوت.</p>
        </section>
        <section className="flex min-h-0 flex-col gap-3 overflow-y-auto rounded-[19px] border border-emerald-950/10 bg-white/90 p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-black"><Volume2 size={17} className="text-emerald-700"/> اختبار مخارج الحروف واللكنة</h2>
            <span className={'rounded-full px-3 py-1 text-[11px] font-bold ' + (published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600')}>
              {published ? 'معتمد' : 'قيد المراجعة'}
            </span>
          </div>
          {(['ar', 'en'] as const).map(language => <div key={language} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-black">{language === 'ar' ? 'عينة اللهجة العربية' : 'English with local accent'}</span>
              <button onClick={() => generating ? undefined : (playing ? stopPlayback() : void tryVoice(language))}
                disabled={Boolean(generating)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-950 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">
                {generating === language ? <Loader2 size={15} className="animate-spin"/> : playing ? <Square size={14}/> : <Play size={15}/>}
                {generating === language ? 'جارٍ التوليد' : playing ? 'إيقاف' : 'استمع واختبر'}
              </button>
            </div>
            <textarea dir={language === 'ar' ? 'rtl' : 'ltr'} lang={language} value={language === 'ar' ? arabicTest : englishTest}
              onChange={e => {
                if (language === 'ar') setArabicTest(e.target.value); else setEnglishTest(e.target.value);
                setPlayed(prev => ({ ...prev, [language]: false }));
                setReviewed(prev => ({ ...prev, [language]: false }));
              }}
              maxLength={330} rows={2} className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs leading-6 outline-none focus:border-emerald-500"/>
            <label className="mt-2 flex items-start gap-2 text-[11px] font-semibold text-slate-700">
              <input type="checkbox" className="mt-0.5 accent-emerald-700" disabled={!played[language]} checked={reviewed[language]}
                onChange={e => setReviewed(prev => ({ ...prev, [language]: e.target.checked }))}/>
              {language === 'ar' ? 'استمعت وتحققت من صحة اللهجة ومخارج الحروف دون فصحى دخيلة' : 'I checked that the speaker sounds local when speaking clear English'}
            </label>
          </div>)}
          {readError && <p className="flex items-center gap-2 text-xs text-amber-800"><AlertTriangle size={15}/>{readError}</p>}
          {notice && <p className="rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold" role="status">{notice}</p>}
          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
            <span className="inline-flex items-center gap-2 text-[11px] text-slate-500">
              {loading ? <Loader2 size={15} className="animate-spin"/> : published ? <CheckCircle2 size={15} className="text-emerald-600"/> : <ShieldCheck size={15}/>}
              {isAdmin ? 'الاعتماد ينعكس على المعلم في المحادثات الجديدة' : 'المعاينة متاحة، الاعتماد للأدمن فقط'}
            </span>
            {isAdmin && <button onClick={() => void approve()}
              disabled={!played.ar || !played.en || !reviewed.ar || !reviewed.en || saving || Boolean(readError)}
              className="rounded-xl bg-emerald-800 px-5 py-2.5 text-xs font-black text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40">
              {saving ? 'جارٍ الاعتماد...' : 'اعتماد صوت الشخصية'}
            </button>}
          </div>
        </section>
      </div>
    </main>
  );
};
