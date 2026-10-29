import { useCallback, useEffect, useRef, useState } from 'react';
import { localArabicVoices, radioSpeechChunks } from '../data/radioSpeech';
import { radioRecordingStore, validateRadioRecording } from '../data/radioLocalRecordings';

type Options = {
  textId: string; ownerId?: string; transcript: string; level?: string; volume: number;
  lang: 'ar' | 'en'; onEnd: () => void;
  onState: (playing: boolean, paused: boolean) => void; onError: (error: string | null) => void;
};

export function useRadioNarration(options: Options) {
  const current = useRef(options); current.current = options;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState(() => {
    try { return localStorage.getItem('qul-radio-voice') || ''; } catch { return ''; }
  });
  const [rate, setRate] = useState(0.92);
  const [recordingName, setRecordingName] = useState('');
  const [busy, setBusy] = useState(false);
  const token = useRef(0), storageToken = useRef(0);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const recordingURL = useRef('');
  const playback = useRef<'stopped' | 'playing' | 'paused'>('stopped');

  const stop = useCallback(() => {
    token.current++;
    if (utterance.current) window.speechSynthesis?.cancel();
    utterance.current = null;
    if (audio.current) {
      audio.current.onended = null; audio.current.onerror = null;
      audio.current.pause(); audio.current.currentTime = 0;
    }
    playback.current = 'stopped';
    current.current.onState(false, false);
  }, []);

  const clearRecording = useCallback(() => {
    if (audio.current) { audio.current.pause(); audio.current.removeAttribute('src'); }
    audio.current = null;
    if (recordingURL.current) URL.revokeObjectURL(recordingURL.current);
    recordingURL.current = '';
  }, []);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const update = () => setVoices(localArabicVoices(window.speechSynthesis.getVoices()));
    update(); window.speechSynthesis.addEventListener('voiceschanged', update);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', update);
  }, []);

  useEffect(() => {
    stop(); clearRecording(); setRecordingName('');
    const request = ++storageToken.current;
    setBusy(Boolean(options.textId));
    if (options.textId) {
      void radioRecordingStore(`${options.ownerId || 'local'}:${options.textId}`, 'get').then(saved => {
        if (request !== storageToken.current || !saved) return;
        recordingURL.current = URL.createObjectURL(saved.blob);
        setRecordingName(saved.name);
      }).catch(() => { /* Speech still works if private mode blocks storage. */ })
        .finally(() => { if (request === storageToken.current) setBusy(false); });
    }
    return () => { storageToken.current++; stop(); clearRecording(); };
  }, [options.textId, options.ownerId, stop, clearRecording]);

  useEffect(() => {
    stop(); setRate(options.level === 'beginner' ? 0.9 : options.level === 'advanced' ? 1 : 0.95);
  }, [options.level, stop]);

  useEffect(() => {
    // Adjust the playing audio immediately. Mutating the active speech utterance
    // also keeps the next chunk at the selected volume without cancelling it.
    // Cancelling on every dial movement used to restart the spoken sentence.
    if (audio.current) audio.current.volume = options.volume;
    if (utterance.current) utterance.current.volume = options.volume;
  }, [options.volume]);

  const chooseVoice = (value: string) => {
    stop(); setVoiceURI(value);
    try { localStorage.setItem('qul-radio-voice', value); } catch { /* Optional preference. */ }
  };

  const play = (restart = false, sample = false) => {
    const { transcript, onState, onEnd, onError, lang, volume } = current.current;
    if (!sample && (!transcript || busy)) return;
    if (!restart && !sample && playback.current !== 'stopped') {
      if (playback.current === 'playing') {
        if (audio.current) audio.current.pause(); else window.speechSynthesis.pause();
        playback.current = 'paused'; onState(false, true); return;
      }
      if (!audio.current) {
        window.speechSynthesis.resume(); playback.current = 'playing'; onState(true, false); return;
      }
      const run = token.current;
      void audio.current.play().then(() => {
        if (run !== token.current) return;
        playback.current = 'playing'; onState(true, false);
      }).catch(() => {
        if (run !== token.current) return;
        stop(); onError(lang === 'ar' ? 'تعذّر استئناف التسجيل.' : 'Could not resume the recording.');
      });
      return;
    }
    stop(); onError(null);
    const run = token.current;
    const ended = () => {
      if (run !== token.current) return;
      playback.current = 'stopped'; utterance.current = null;
      onState(false, false); if (!sample) onEnd();
    };
    if (recordingURL.current && !sample) {
      const recording = new Audio(recordingURL.current); audio.current = recording;
      recording.volume = volume; recording.playbackRate = rate;
      recording.onended = ended;
      recording.onerror = () => {
        if (run !== token.current) return;
        stop(); onError(lang === 'ar' ? 'تعذّر قراءة التسجيل. أزل التسجيل المحلي لاستخدام صوت الجهاز.' : 'Cannot read the recording. Remove it to use a device voice.');
      };
      void recording.play().then(() => {
        if (run !== token.current) { recording.pause(); return; }
        playback.current = 'playing'; onState(true, false);
      }).catch(() => {
        if (run !== token.current) return;
        stop(); onError(lang === 'ar' ? 'تعذّر تشغيل التسجيل. اضغط التشغيل للمحاولة مجددًا.' : 'Cannot play the recording. Press play to retry.');
      });
      return;
    }
    audio.current = null;
    const available = 'speechSynthesis' in window ? localArabicVoices(window.speechSynthesis.getVoices()) : [];
    const voice = available.find(item => item.voiceURI === voiceURI) || available[0];
    if (!voice || typeof SpeechSynthesisUtterance === 'undefined') {
      onError(lang === 'ar' ? 'لا يوجد صوت عربي محلي متاح. ثبّت صوتًا عربيًا من إعدادات جهازك أو أضف تسجيلًا للنص من إعدادات الصوت.' : 'No installed Arabic voice is available. Install one in device settings or add a recording in Audio settings.');
      return;
    }
    const chunks = radioSpeechChunks(sample ? 'مرحبًا بك. استمع إلى النص بهدوء، ثم أجب عن الأسئلة.' : transcript);
    if (!chunks.length) return;
    let index = 0;
    const speakNext = () => {
      if (run !== token.current) return;
      const speech = new SpeechSynthesisUtterance(chunks[index]);
      speech.voice = voice; speech.lang = voice.lang; speech.rate = rate; speech.pitch = 1; speech.volume = current.current.volume;
      utterance.current = speech;
      speech.onend = () => { if (run !== token.current || utterance.current !== speech) return; if (++index < chunks.length) speakNext(); else ended(); };
      speech.onerror = event => {
        if (run !== token.current || utterance.current !== speech || ['canceled','interrupted'].includes(event.error)) return;
        stop(); onError(lang === 'ar' ? 'تعذّر تشغيل صوت الجهاز. جرّب صوتًا عربيًا آخر أو تسجيلًا محليًا.' : 'Device voice failed. Try another Arabic voice or a local recording.');
      };
      playback.current = 'playing'; onState(true, false); window.speechSynthesis.speak(speech);
    };
    speakNext();
  };

  const importRecording = async (file: File) => {
    const { textId, ownerId, onError, lang } = current.current;
    if (!textId || busy) return;
    stop(); setBusy(true);
    const request = ++storageToken.current;
    try {
      await validateRadioRecording(file);
      if (request !== storageToken.current) return;
      await radioRecordingStore(`${ownerId || 'local'}:${textId}`, 'put', { blob: file, name: file.name });
      if (request !== storageToken.current) return;
      clearRecording(); recordingURL.current = URL.createObjectURL(file);
      setRecordingName(file.name); onError(null);
    } catch {
      if (request === storageToken.current) onError(lang === 'ar'
        ? 'لم يُحفظ التسجيل. اختر ملفًا صوتيًا صالحًا أصغر من ٣٠ ميغابايت، وتأكد من توفر مساحة في المتصفح.'
        : 'Recording not saved. Use a valid audio file under 30 MB and allow browser storage.');
    } finally { if (request === storageToken.current) setBusy(false); }
  };

  const removeRecording = async () => {
    if (busy) return;
    stop(); setBusy(true);
    const request = ++storageToken.current;
    const { ownerId, textId, lang, onError } = current.current;
    try {
      await radioRecordingStore(`${ownerId || 'local'}:${textId}`, 'delete');
      if (request !== storageToken.current) return;
      clearRecording(); setRecordingName(''); onError(null);
    } catch {
      if (request === storageToken.current) onError(lang === 'ar' ? 'تعذّر إزالة التسجيل المحفوظ.' : 'Could not remove the saved recording.');
    } finally { if (request === storageToken.current) setBusy(false); }
  };

  return { play, stop, voices, voiceURI: voices.some(v => v.voiceURI === voiceURI) ? voiceURI : voices[0]?.voiceURI || '',
    chooseVoice, rate, changeRate: (value: number) => { stop(); setRate(value); },
    recordingName, busy, importRecording, removeRecording };
}
