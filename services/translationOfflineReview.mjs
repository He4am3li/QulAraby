// Conservative offline feedback, never substitutes for semantic AI assessment.
export function reviewTranslationOffline(promptEn, answer, reference) {
  const norm = s => (s || '').normalize('NFKC').replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[إأآ]/g,'ا').replace(/ى/g,'ي').replace(/[،؛.!?؟]/g,'').replace(/\s+/g,' ').trim();
  const user = norm(answer), target = norm(reference);
  const exact = Boolean(target) && user === target;
  const isCold = /^i drink cold water\.?$/i.test(promptEn.trim());
  const containsCold = isCold && /كولد/.test(user);
  const spelling = isCold && /اشرب ماء باردا/.test(user);
  const englishWord = /[a-zA-Z]{2,}/.test(answer);
  const correction = containsCold
    ? {ar:'كتبت «كولد» وهي نقل صوتي لكلمة cold وليست ترجمة عربية. المقابل الصحيح «بارد». اكتب: «أشرب ماءً باردًا».',en:'«كولد» is a transliteration, not Arabic for cold. Use «بارد»: «أشرب ماءً باردًا».',tip:'تأتي الصفة بعد الاسم: ماء بارد.'}
    : englishWord
    ? {ar:'تحتوي إجابتك على كلمة إنجليزية لم تُترجم. ابحث عن مقابلها العربي ثم أعد كتابة الجملة.',en:'Your answer contains an untranslated English word. Find its Arabic equivalent and rewrite the sentence.',tip:''}
    : {ar:'لا يمكن التأكد من دقة هذه الصياغة دون التقييم الدلالي. قارنها بالترجمة المرجعية ثم أعد المحاولة.',en:'Semantic evaluation is unavailable. Compare your answer with the reference before retrying.',tip:''};
  return {
    accuracy: exact ? 100 : -1, isCorrect: exact,
    feedbackAr: exact ? 'ترجمتك مطابقة للصياغة المرجعية.' : correction.ar,
    feedbackEn: exact ? 'Your translation matches the reference wording.' : correction.en,
    vocalizedArabic: reference || answer, transliteration:'',
    grammarTip: exact ? '' : correction.tip,
    reviewKind: exact ? 'exact' : containsCold ? 'transliteration' : englishWord ? 'untranslated' : 'ungraded'
  };
}
