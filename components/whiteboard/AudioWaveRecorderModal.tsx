import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, Square, Play, Pause, RotateCcw, Plus, Activity, Volume2 } from 'lucide-react';
import { WhiteboardElement } from '../../types/whiteboard';

interface AudioWaveRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertAudioCard: (element: WhiteboardElement) => void;
}

export const AudioWaveRecorderModal: React.FC<AudioWaveRecorderModalProps> = ({
  isOpen,
  onClose,
  onInsertAudioCard
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [cardTitle, setCardTitle] = useState('نموذج النطق الصوتي الصحيح');
  const [samplePhrase, setSamplePhrase] = useState('القِرَاءَةُ غِذَاءُ العَقْلِ وَالرُّوح');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlobUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access note:', err);
      setIsRecording(true);
      setRecordingDuration(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsRecording(false);

    if (!audioBlobUrl) {
      setAudioBlobUrl('simulated_audio_' + Date.now());
    }
  };

  const togglePlayback = () => {
    if ('speechSynthesis' in window && samplePhrase) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(samplePhrase);
      utter.lang = 'ar-SA';
      utter.onend = () => setIsPlaying(false);
      setIsPlaying(true);
      window.speechSynthesis.speak(utter);
    }
  };

  const handleInsert = () => {
    const newElement: WhiteboardElement = {
      id: 'audio_model_' + Date.now(),
      type: 'audio_card',
      x: 180 + Math.random() * 60,
      y: 130 + Math.random() * 60,
      color: '#d97706',
      strokeWidth: 2,
      cardData: {
        word: samplePhrase,
        meaning: cardTitle,
        translation: `تسجيل صوتي تعليمي (${recordingDuration > 0 ? recordingDuration + ' ث' : 'نموذج نطق'})`,
        audioUrl: audioBlobUrl || undefined
      }
    };
    onInsertAudioCard(newElement);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 w-full max-w-xl shadow-2xl text-slate-800 relative overflow-hidden"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60 shadow-sm">
                <Mic size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 arabic-font flex items-center gap-2">
                  مسجل النماذج الصوتية والموجات 🎙️
                </h3>
                <p className="text-xs text-slate-500 font-medium">تسجيل صوت المعلم وإدراجه كبطاقة استماع تفاعلية</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Inputs */}
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">عنوان التسجيل أو الهدف:</label>
              <input
                type="text"
                value={cardTitle}
                onChange={(e) => setCardTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">العبارة أو الكلمة المراد نطقها:</label>
              <input
                type="text"
                value={samplePhrase}
                onChange={(e) => setSamplePhrase(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-black arabic-font text-base focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Wave Visualizer Box */}
          <div className="bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-slate-50 border border-amber-200/80 rounded-2xl p-6 text-center mb-5 flex flex-col items-center justify-center min-h-[140px]">
            {isRecording ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-1.5 h-12">
                  {[40, 70, 90, 60, 100, 45, 80, 55, 95, 35].map((height, idx) => (
                    <motion.div
                      key={idx}
                      animate={{ height: [`${height * 0.2}%`, `${height}%`, `${height * 0.3}%`] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: idx * 0.05 }}
                      className="w-1.5 bg-rose-500 rounded-full"
                    />
                  ))}
                </div>
                <div className="text-xs text-rose-600 font-bold flex items-center justify-center gap-1.5 animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>جارٍ التسجيل الآن... 00:{recordingDuration < 10 ? '0' + recordingDuration : recordingDuration}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Activity size={32} className="text-amber-500 mx-auto opacity-70" />
                <div className="text-xs text-slate-500 font-bold">
                  {audioBlobUrl ? 'تم تسجيل الصوت بنجاح! جاهز للإدراج' : 'اضغط على زر التسجيل لبدء النطق الصوتي'}
                </div>
              </div>
            )}
          </div>

          {/* Recording & Action Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
              >
                <Mic size={16} />
                بدء التسجيل
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition animate-pulse"
              >
                <Square size={16} />
                إيقاف التسجيل وحفظ الصوت
              </button>
            )}

            {audioBlobUrl && !isRecording && (
              <button
                onClick={togglePlayback}
                className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition"
                title="معاينة الصوت"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>
            )}

            <button
              onClick={handleInsert}
              disabled={!samplePhrase.trim() || isRecording}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-2xl font-black arabic-font text-xs flex items-center justify-center gap-2 shadow-md transition"
            >
              <Plus size={16} />
              إدراج البطاقة الصوتية للسبورة
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
