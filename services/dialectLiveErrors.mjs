/**
 * Translate known voice-connection failures into actionable, student-friendly feedback.
 * Never expose upstream error contents, credentials or account information in the UI.
 */
export const getDialectLiveError = (error, lang = 'ar') => {
  const name = String(error?.name || '');
  const code = String(error?.code || '');
  const messages = {
    permission: ['لم يُسمح باستخدام الميكروفون. فعّل إذن الميكروفون لهذا الموقع ثم اضغط زر التحدث مجددًا.', 'Microphone access was blocked. Allow the microphone for this site, then tap the voice button again.'],
    missing: ['لم يُعثر على ميكروفون. وصّل ميكروفونًا أو تحقق من إعدادات الجهاز.', 'No microphone was found. Connect a microphone or check your device settings.'],
    busy: ['تعذر تشغيل الميكروفون. أغلق التطبيقات الأخرى التي تستخدمه ثم أعد المحاولة.', 'Could not start the microphone. Close other apps using it and try again.'],
    unsupported: ['لا يمكن تشغيل الميكروفون في هذا المتصفح. استخدم اتصال HTTPS ومتصفحًا يدعم تسجيل الصوت.', 'The microphone is unavailable in this browser. Use HTTPS and a browser that supports audio recording.'],
    audio: ['تعذر تهيئة الصوت في هذا المتصفح. حدّث الصفحة أو جرّب متصفحًا آخر.', 'Audio could not be initialized. Refresh the page or try another browser.'],
    auth: ['انتهت جلسة تسجيل الدخول. سجّل الدخول مجددًا لتشغيل المحادثة.', 'Your sign-in session has expired. Sign in again to start speaking.'],
    access: ['لا يملك هذا الحساب صلاحية استخدام المحادثة الصوتية. تحقق من اعتماد الحساب.', 'This account cannot access voice conversations. Check account approval.'],
    quota: ['تم تجاوز عدد محاولات الاتصال مؤقتًا. حاول مرة أخرى بعد دقيقة.', 'Too many connection attempts. Please try again in one minute.'],
    service: ['خدمة المحادثة الصوتية غير متاحة الآن. حاول مرة أخرى بعد قليل.', 'The voice service is temporarily unavailable. Please try again shortly.'],
    closed: ['انقطع الاتصال الصوتي. اضغط زر التحدث لإعادة الاتصال.', 'The voice connection ended. Tap the voice button to reconnect.'],
    connection: ['تعذر بدء المحادثة الصوتية. تحقق من اتصال الإنترنت ثم حاول مجددًا.', 'Could not start the voice conversation. Check your connection and try again.']
  };
  const key = ['NotAllowedError', 'PermissionDeniedError', 'SecurityError'].includes(name) ? 'permission'
    : ['NotFoundError', 'DevicesNotFoundError', 'OverconstrainedError'].includes(name) ? 'missing'
    : ['NotReadableError', 'TrackStartError', 'AbortError'].includes(name) ? 'busy'
    : code === 'MIC_UNAVAILABLE' ? 'unsupported'
    : code === 'AUDIO_UNAVAILABLE' ? 'audio'
    : code === 'LIVE_AUTH_REQUIRED' ? 'auth'
    : code === 'LIVE_ACCESS_DENIED' ? 'access'
    : code === 'LIVE_QUOTA_REACHED' ? 'quota'
    : code === 'LIVE_SERVICE_UNAVAILABLE' ? 'service'
    : code === 'LIVE_CLOSED' ? 'closed'
    : 'connection';
  return messages[key][lang === 'en' ? 1 : 0];
};
