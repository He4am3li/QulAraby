import React from 'react';
import { ChevronRight, Loader2, Mic, MicOff, Pause, Phone, PhoneOff, Play, Radio, Volume2, VolumeX } from 'lucide-react';
import './ListeningSkeuoRadio.css';

export type RadioStation = {
  id: number;
  ar: string;
  en: string;
  type: string;
};

type RadioContent = {
  transcript?: string;
  translation?: string;
  quiz?: unknown[];
} | null;

type Props = {
  lang: 'ar' | 'en';
  stations: RadioStation[];
  stationId: number;
  content: RadioContent;
  loading: boolean;
  audioReady: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  volume: number;
  isIncomingCall: boolean;
  isCalling: boolean;
  isRecording: boolean;
  callSeconds: number;
  onTune: (id: number) => void;
  onPlayPause: () => void;
  onVolume: (value: number) => void;
  onWord: (word: string) => void;
  onOpenQuiz: () => void;
  onDismissCall: () => void;
  onAnswerCall: () => void;
  onRecord: () => void;
  onEndCall: () => void;
};

const pad = (value: number) => String(value).padStart(2, '0');

export const ListeningSkeuoRadio: React.FC<Props> = ({
  lang, stations, stationId, content, loading, audioReady, isPlaying, isPaused,
  volume, isIncomingCall, isCalling, isRecording, callSeconds,
  onTune, onPlayPause, onVolume, onWord, onOpenQuiz,
  onDismissCall, onAnswerCall, onRecord, onEndCall,
}) => {
  const ar = lang === 'ar';
  const station = stations.find(s => s.id === stationId);
  const progress = stationId ? ((stationId - 1) / Math.max(1, stations.length - 1)) * 100 : 0;
  const next = stationId ? ((stationId % stations.length) + 1) : 1;
  const transcript = content?.transcript?.trim() || '';
  const translation = content?.translation?.trim() || '';
  const playing = isPlaying || isPaused;

  return (
    <section className="qul-radio" aria-label={ar ? 'جهاز الراديو التعليمي' : 'Educational radio receiver'} dir="ltr">
      <div className="qul-radio-carry" aria-hidden="true">
        <div className="qul-radio-carry-grip" />
      </div>
      <div className="qul-radio-antenna" aria-hidden="true">
        <div className="qul-radio-antenna-tip" />
      </div>

      <div className="qul-radio-cabinet">
        <div className="qul-radio-panel">
          <div className="qul-radio-header">
            <div className="qul-radio-brand" aria-label="QUL Audio">
              <span className="qul-radio-brand-emblem">قُـل</span>
              <span className="qul-radio-brand-text"><strong>QUL</strong><small>HERITAGE AUDIO</small></span>
            </div>
            <div className="qul-radio-manufacturer">STEREO <span>·</span> EDUCATIONAL RECEIVER <span>·</span> MODEL Q-26</div>
            <div className="qul-radio-led-group">
              <span className={'qul-radio-led ' + (isPlaying ? 'lit' : '')} />
              <span>{isPlaying ? 'ON AIR' : 'STANDBY'}</span>
            </div>
          </div>

          <div className="qul-radio-upper">
            <div className="qul-radio-speaker-body">
              <div className="qul-radio-speaker-edge">
                <div className="qul-radio-speaker-mesh">
                  <div className="qul-radio-speaker-center" />
                </div>
              </div>
              <div className="qul-radio-speaker-label"><span>SOUND</span><b>MONO / 01</b></div>
            </div>

            <div className="qul-radio-display-column">
              <div className="qul-radio-glass-frame">
                <div className="qul-radio-glass" aria-live="polite">
                  <div className="qul-radio-glass-top">
                    <span>QUL LEARNING BAND</span>
                    <span className="qul-radio-band">FM · PROGRAM</span>
                  </div>

                  <div className="qul-radio-station-numbers" aria-hidden="true">
                    {stations.map((s, i) => (
                      <span key={s.id}>{pad(i + 1)}</span>
                    ))}
                  </div>
                  <div className="qul-radio-tuner-track">
                    <div className="qul-radio-tuner-marks" />
                    <div
                      className={'qul-radio-tuner-needle ' + (loading ? 'searching' : '')}
                      style={{ left: `calc(8% + ${progress * 0.84}%)` }}
                    />
                  </div>
                  <div className="qul-radio-display-bottom">
                    <span>ANALOG SELECTOR</span>
                    <strong>CH {pad(stationId)}</strong>
                    <span>{loading ? 'TUNING…' : isPlaying ? '● LIVE AUDIO' : 'READY'}</span>
                  </div>
                </div>
              </div>

              <div className="qul-radio-screen">
                <div className="qul-radio-screen-inner" dir={ar ? 'rtl' : 'ltr'}>
                  {isIncomingCall ? (
                    <div className="qul-radio-call-status">
                      <div className="qul-radio-call-indicator"><Phone size={19} /></div>
                      <div className="qul-radio-program-info">
                        <span>{ar ? 'اتصال وارد من الاستوديو' : 'Incoming studio call'}</span>
                        <strong>{ar ? 'هل تريد الرد؟' : 'Answer the call?'}</strong>
                      </div>
                      <div className="qul-radio-call-buttons">
                        <button className="reject" onClick={onDismissCall} aria-label={ar ? 'رفض الاتصال' : 'Decline call'}><PhoneOff size={17} /></button>
                        <button className="accept" onClick={onAnswerCall} aria-label={ar ? 'الرد على الاتصال' : 'Answer call'}><Phone size={17} /></button>
                      </div>
                    </div>
                  ) : isCalling ? (
                    <div className="qul-radio-call-status">
                      <div className="qul-radio-call-indicator calling"><Mic size={20}/></div>
                      <div className="qul-radio-program-info">
                        <span>{ar ? 'على الهواء مع الاستوديو' : 'Live studio connection'}</span>
                        <strong className="qul-radio-call-time" dir="ltr">{pad(Math.floor(callSeconds / 60))}:{pad(callSeconds % 60)}</strong>
                      </div>
                      <div className="qul-radio-call-buttons">
                        <button className={isRecording ? 'reject' : 'accept'} onClick={onRecord} aria-label={isRecording ? (ar ? 'إيقاف التسجيل' : 'Stop recording') : (ar ? 'بدء التسجيل' : 'Start recording')}>
                          {isRecording ? <MicOff size={17}/> : <Mic size={17}/>}
                        </button>
                        <button className="reject" onClick={onEndCall} aria-label={ar ? 'إنهاء الاتصال' : 'End call'}><PhoneOff size={17}/></button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="qul-radio-screen-eyebrow">
                        {loading ? (ar ? 'جارٍ ضبط المحطة…' : 'Tuning station…') : station ? (ar ? 'المحطة الحالية' : 'Current program') : (ar ? 'اختر محطة' : 'Select a station')}
                      </span>
                      <div className="qul-radio-screen-main">
                        {loading ? <Loader2 className="qul-radio-loading" size={22}/> : <Radio size={19} strokeWidth={1.6}/>}
                        <strong>{station ? station[lang] : (ar ? 'راديو قُل' : 'QUL Radio')}</strong>
                      </div>
                      <span className="qul-radio-screen-foot">
                        {loading ? (ar ? 'جارٍ إعداد المقطع الصوتي' : 'Preparing your audio') :
                          audioReady ? (isPlaying ? (ar ? 'الصوت يعمل الآن' : 'Now playing') : isPaused ? (ar ? 'متوقف مؤقتًا' : 'Paused') : (ar ? 'اضغط زر التشغيل للاستماع' : 'Press play to listen')) :
                          content ? (ar ? 'التسجيل غير متاح حاليًا' : 'Audio unavailable') :
                          (ar ? 'خمس محطات للاستماع والتعلّم' : 'Five stations to explore')}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="qul-radio-hardware">
              <div className="qul-radio-knob-unit">
                <span className="qul-radio-hardware-label">TUNING</span>
                <button
                  type="button"
                  className="qul-radio-knob-housing"
                  aria-label={ar ? 'الانتقال إلى المحطة التالية' : 'Tune to next station'}
                  title={ar ? 'انقر للانتقال إلى المحطة التالية' : 'Click to tune to the next station'}
                  onClick={() => onTune(next)}
                  disabled={loading}
                >
                  <span className="qul-radio-knob-inner" style={{ transform: `rotate(${-128 + (progress / 100) * 256}deg)` }}>
                    <span className="qul-radio-knob-line" />
                    <span className="qul-radio-knob-core"/>
                  </span>
                </button>
                <span className="qul-radio-hardware-sublabel">{pad(stationId)} / {pad(stations.length)}</span>
              </div>
              <div className="qul-radio-hardware-separator"/>
              <div className="qul-radio-knob-unit">
                <label className="qul-radio-hardware-label" htmlFor="qul-radio-volume">VOLUME</label>
                <div className="qul-radio-knob-housing volume">
                  <span className="qul-radio-knob-inner" style={{ transform: `rotate(${-130 + volume * 260}deg)` }}>
                    <span className="qul-radio-knob-line"/>
                    <span className="qul-radio-knob-core"/>
                  </span>
                  <input
                    id="qul-radio-volume"
                    type="range"
                    min={0}
                    max={1}
                    step={0.02}
                    value={volume}
                    onChange={e => onVolume(Number(e.target.value))}
                    className="qul-radio-knob-range"
                    aria-label={ar ? 'ضبط مستوى الصوت' : 'Set radio volume'}
                    aria-valuetext={`${Math.round(volume * 100)}%`}
                  />
                </div>
                <span className="qul-radio-hardware-sublabel">{Math.round(volume * 100)}%</span>
              </div>
            </div>
          </div>

          <div className="qul-radio-control-bar">
            <div className="qul-radio-preset-label">
              <span>PRESET MEMORY</span>
              <small>{ar ? 'المحطات' : 'STATIONS'}</small>
            </div>
            <div className="qul-radio-presets" dir={ar ? 'rtl' : 'ltr'}>
              {stations.map(s => (
                <button
                  key={s.id}
                  className={'qul-radio-preset ' + (stationId === s.id ? 'selected' : '')}
                  disabled={loading}
                  type="button"
                  onClick={() => onTune(s.id)}
                  aria-pressed={stationId === s.id}
                  aria-label={`${ar ? 'اختر محطة' : 'Select station'} ${s.id}: ${s[lang]}`}
                >
                  <span className="qul-radio-preset-index">{pad(s.id)}</span>
                  <span className="qul-radio-preset-name">{s[lang]}</span>
                </button>
              ))}
            </div>
            <div className="qul-radio-transport">
              <button
                type="button"
                disabled={!audioReady || loading}
                onClick={onPlayPause}
                className={'qul-radio-play ' + (isPlaying ? 'pressed' : '')}
                aria-label={isPlaying ? (ar ? 'إيقاف مؤقت' : 'Pause playback') : (ar ? 'تشغيل التسجيل' : 'Play recording')}
              >
                {isPlaying ? <Pause size={23} fill="currentColor"/> : <Play size={23} fill="currentColor" />}
              </button>
              <div className="qul-radio-play-label">{isPlaying ? 'PAUSE' : 'PLAY'}</div>
            </div>
          </div>

          <div className="qul-radio-lower">
            <div className="qul-radio-lower-title">
              <span className="qul-radio-lower-screw"/>
              <span>PROGRAM NOTES</span>
              <span className="qul-radio-lower-screw"/>
            </div>
            <div className="qul-radio-annotation-row">
              <section className="qul-radio-annotation" dir="rtl" lang="ar" aria-label="Arabic transcript">
                <div className="qul-radio-annotation-heading"><span>النص المسموع</span><small>TRANSCRIPT · AR</small></div>
                <div className="qul-radio-annotation-text arabic-font">
                  {transcript ? transcript.split(/\s+/).map((word, i) => (
                    <button type="button" key={i} className="qul-radio-transcript-word" onClick={() => onWord(word)} title={ar ? 'معنى الكلمة' : 'Word meaning'}>{word}</button>
                  )) : <p>{ar ? 'سيظهر النص هنا بعد اختيار المحطة.' : 'سيظهر النص العربي هنا بعد اختيار المحطة.'}</p>}
                </div>
              </section>
              <section className="qul-radio-annotation" dir={ar ? 'rtl' : 'ltr'} aria-label="Translation">
                <div className="qul-radio-annotation-heading"><span>{ar ? 'الترجمة' : 'Translation'}</span><small>TRANSLATION</small></div>
                <div className="qul-radio-annotation-text">
                  {translation || (ar ? 'تظهر الترجمة عند تحميل المحطة.' : 'The translation appears when the station is loaded.')}
                </div>
              </section>
            </div>
          </div>

          <div className="qul-radio-footer">
            <div className="qul-radio-footer-metal"><span>QUL</span> · HI-FIDELITY LEARNING</div>
            <span className="qul-radio-footer-voltage">MODEL Q-26 • 5 CHANNEL MEMORY</span>
            <button
              type="button"
              className="qul-radio-quiz-button"
              onClick={onOpenQuiz}
              disabled={!content || loading || !content.quiz?.length}
            >
              {ar ? 'اختبر فهمك' : 'Check comprehension'}
              <ChevronRight size={15} className={ar ? 'qul-radio-chevron-rtl' : ''}/>
            </button>
          </div>
        </div>
        <span className="qul-radio-foot left" aria-hidden="true"/>
        <span className="qul-radio-foot right" aria-hidden="true"/>
      </div>
    </section>
  );
};
