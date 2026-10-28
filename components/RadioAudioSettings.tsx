import React from 'react';
import type { useRadioNarration } from '../src/hooks/useRadioNarration';

type Props = {
  audio: ReturnType<typeof useRadioNarration>; lang: 'ar' | 'en'; hasText: boolean;
  textTitle: string; practiceActive: boolean;
};

export function RadioAudioSettings({ audio, lang, hasText, textTitle, practiceActive }: Props) {
  const ar = lang === 'ar';
  return <details className="qul-radio-audio-settings" dir={ar ? 'rtl' : 'ltr'}>
    <summary>{ar ? 'إعدادات الصوت المجاني' : 'Free audio settings'}</summary>
    <p>{ar ? 'اختر صوتًا عربيًا مثبتًا على جهازك وجرّبه. جودة القراءة تعتمد على الصوت المتاح. لا تُرسل النصوص إلى خدمة صوتية.'
      : 'Choose and preview an installed Arabic voice. Quality depends on the available voice. Text is not sent to a speech service.'}</p>
    <div className="qul-radio-audio-options">
      <label>{ar ? 'صوت الجهاز' : 'Device voice'}
        <select value={audio.voiceURI} disabled={!audio.voices.length || practiceActive}
          onChange={event => audio.chooseVoice(event.target.value)}>
          {!audio.voices.length && <option value="">{ar ? 'لا يوجد صوت عربي محلي' : 'No installed Arabic voice'}</option>}
          {audio.voices.map(voice => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name}</option>)}
        </select>
      </label>
      <button type="button" disabled={!audio.voices.length || audio.busy || practiceActive}
        onClick={() => audio.play(true, true)}>{ar ? 'جرّب الصوت' : 'Preview voice'}</button>
      <label>{ar ? 'سرعة القراءة' : 'Reading speed'}
        <select value={audio.rate} disabled={practiceActive} onChange={event => audio.changeRate(Number(event.target.value))}>
          {[0.8, 0.9, 0.92, 0.95, 1, 1.1].map(rate => <option key={rate} value={rate}>{rate}×</option>)}
        </select>
      </label>
    </div>
    {!audio.voices.length && <p>{ar
      ? 'يمكن تنزيل صوت عربي من إعدادات النطق في جهازك ثم إعادة فتح المتصفح. تنزيل الصوت يحتاج الإنترنت مرة واحدة.'
      : 'Download an Arabic voice in your device speech settings, then reopen the browser. The initial download requires internet.'}</p>}
    <div className="qul-radio-recording-options">
      <label>{ar ? 'تسجيل واضح لهذا النص' : 'A clear recording of this text'}
        <input type="file" accept="audio/*,.mp3,.m4a,.wav,.ogg,.webm,.aac" disabled={!hasText || audio.busy || practiceActive}
          onChange={event => {
            const file = event.target.files?.[0]; event.target.value = '';
            if (file) void audio.importRecording(file);
          }} />
      </label>
      <p>{ar ? 'اختر تسجيلًا مطابقًا للنص بصوتك أو صوت قارئ. يُحفظ لهذا النص في هذا المتصفح فقط، ويعمل عند تكراره دون استهلاك رصيد الذكاء الاصطناعي. مسح بيانات المتصفح يحذفه.'
        : 'Choose a matching recording of the passage. It stays in this browser for this text and is reused without AI credits. Clearing browser data removes it.'}</p>
      {hasText && <small>{ar ? 'النص: ' : 'Text: '}{textTitle}</small>}
      {audio.recordingName && <div role="status"><span>{ar ? 'التسجيل المستخدم: ' : 'Using recording: '}{audio.recordingName}</span>
        <button type="button" disabled={audio.busy} onClick={() => void audio.removeRecording()}>
          {ar ? 'إزالة التسجيل المحلي' : 'Remove local recording'}</button></div>}
      {audio.busy && <p role="status">{ar ? 'جارٍ تجهيز التسجيل المحلي…' : 'Preparing local recording…'}</p>}
    </div>
  </details>;
}
