// Only transcribed learner SPEECH counts as oral evidence. Typed replies may
// remain in the conversation but must not inflate spoken turns or words.
// This still does NOT evaluate audio pronunciation.
export const summarizeSpeakingEvidence = (history = []) => {
  const learner = history.filter(turn => turn?.role === 'user' && turn?.modality !== 'text' && typeof turn?.text === 'string' && turn.text.trim());
  const learnerText = learner.map(turn => turn.text.trim());
  const allWords = learnerText.flatMap(text => text.split(/\s+/u).filter(Boolean));
  const arabicWords = learnerText.flatMap(text => (text.match(/[\u0621-\u064A][\u0621-\u064A\u064B-\u065F]*/gu) || []));
  const normalizedWords = arabicWords.map(word => word
    .replace(/[\u064B-\u065F]/gu, '')
    .replace(/[أإآ]/gu, 'ا')
    .replace(/ى/gu, 'ي')
    .replace(/ـ/gu, ''));
  return {
    learnerTurns: learner.length,
    transcriptWords: allWords.length,
    arabicWords: arabicWords.length,
    uniqueArabicWords: new Set(normalizedWords).size,
    source: 'transcript',
  };
};

export const createNextSpeakingTask = ({ level = 'beginner', topicAr = 'حياتك اليومية', corrections = [] } = {}) => {
  const topic = typeof topicAr === 'string' && topicAr.trim() ? topicAr.trim().slice(0, 64) : 'حياتك اليومية';
  const validCorrection = Array.isArray(corrections)
    ? corrections.find(c => typeof c?.correction === 'string' && c.correction.trim())
    : null;
  if (validCorrection) {
    return {
      promptAr: 'قل الجملة المصححة في موقف جديد: «' + validCorrection.correction.trim().slice(0, 160) + '».',
      promptEn: 'Use the corrected Arabic phrase in a new situation.',
      objectiveAr: 'تطبيق التصحيح في كلام جديد',
      objectiveEn: 'Use a correction in new speech',
      source: 'correction',
    };
  }
  if (level === 'advanced') {
    return { promptAr: 'قدّم رأيك في ' + topic + ' واذكر سببين يدعمانه.',
      promptEn: 'Share an opinion on the topic and give two reasons.',
      objectiveAr: 'تبرير الرأي', objectiveEn: 'Justify an opinion', source: 'level' };
  }
  if (level === 'intermediate') {
    return { promptAr: 'تحدث في ثلاث جمل مترابطة عن ' + topic + ' ثم اطرح سؤالًا.',
      promptEn: 'Speak in three connected sentences and ask a question.',
      objectiveAr: 'ربط الجمل وطرح الأسئلة', objectiveEn: 'Connect sentences and ask questions', source: 'level' };
  }
  return { promptAr: 'كوّن جملة عربية قصيرة عن ' + topic + '، ثم كررها بوضوح.',
    promptEn: 'Make one short Arabic sentence on the topic, then repeat it.',
    objectiveAr: 'تكوين جملة عربية بسيطة', objectiveEn: 'Build a simple Arabic sentence', source: 'level' };
};

export const mapPlacementLevel = (cefr) => {
  const level = String(cefr || '').trim().toUpperCase();
  if (level === 'A1') return 'beginner';
  if (level === 'A2' || level === 'B1') return 'intermediate';
  if (level === 'B2' || level === 'C1' || level === 'C2') return 'advanced';
  return null;
};

/**
 * Check AI-suggested mission evidence against learner speech, never tutor speech.
 * A validated quote is evidence of a transcript phrase, not an acoustic score.
 */
export const validateSpeakingMissionEvidence = (history = [], objectives = [], claimed = []) => {
  const learnerText = (Array.isArray(history) ? history : [])
    .filter(turn => turn?.role === 'user' && turn?.modality !== 'text' && typeof turn.text === 'string')
    .map(turn => turn.text.trim())
    .join(' ');
  return (Array.isArray(objectives) ? objectives : []).map((goal, index) => {
    const entry = Array.isArray(claimed) ? claimed[index] : null;
    const evidence = typeof entry?.evidence === 'string' ? entry.evidence.trim() : '';
    const achieved = entry?.goal === goal &&
      evidence.length >= 4 &&
      /[\u0621-\u064A]/u.test(evidence) &&
      learnerText.includes(evidence);
    return { goal, evidence: achieved ? evidence : '', achieved: Boolean(achieved) };
  });
};


/**
 * A session ending is not an assessment guarantee. It must still produce a
 * truthful printable record when live transcription is partial or absent.
 * The lack of speech recognition is NOT evidence that the learner was silent.
 */
export const createLimitedSpeakingReport = ({ topicAr='المحادثة', history=[] }={}) => {
  const lines=Array.isArray(history)?history:[];
  const transcribedSpeech=lines.some(entry=>entry?.role==='user'&&entry?.modality!=='text'&&
    typeof entry.text==='string'&&entry.text.trim());
  const typedOnly=lines.some(entry=>entry?.role==='user'&&entry?.modality==='text'&&
    typeof entry.text==='string'&&entry.text.trim())&&!transcribedSpeech;
  const summary=transcribedSpeech
    ? 'انتهت الجلسة، لكن التحليل الآلي غير متاح. احتفظنا بما وصل من النص، ولا يمكن الجزم بجودة النطق أو اكتمال التفريغ.'
    : typedOnly
      ? 'انتهت الجلسة. توجد ردود كتابية، لكن لم يصل تفريغ موثوق لكلام الطالب، لذا لا يمكن إصدار تقييم شفهي.'
      : 'انتهت الجلسة، لكن لم يصل تفريغ موثوق لكلام الطالب. هذا لا يعني أنه لم يتحدث، ولا يمكن إصدار تقييم شفهي.';
  const summaryEn=transcribedSpeech
    ? 'The session ended, but automated analysis is unavailable. Available transcript text was retained. Pronunciation and transcription completeness cannot be verified.'
    : typedOnly
      ? 'The session ended. Typed responses were recorded, but no reliable learner speech transcript was received, so an oral assessment is not possible.'
      : 'The session ended, but no reliable learner speech transcript was received. This does not mean the learner was silent, and an oral assessment is not possible.';
  return {
    assessmentStatus:'limited',
    summary, summaryEn,
    key_vocabulary:[],
    corrections:[],
    missionEvidence:[],
    tutor_tip_ar:'راجع عبارات الحوار المتاحة، ثم تدرب على جملة قصيرة مرة أخرى.',
    tutor_tip_en:'Review the available dialogue and practise one short sentence again.',
    next_practice:{
      ar:'قل جملة قصيرة عن '+String(topicAr||'موضوعك').slice(0,60)+' واطلب من المعلم إعادتها.',
      en:'Say one short Arabic sentence about the topic and ask the tutor to repeat it.',
    },
  };
};

export const hasTranscribedLearnerSpeech = (history=[]) =>
  Array.isArray(history)&&history.some(entry=>
    entry?.role==='user'&&entry?.modality!=='text'&&typeof entry.text==='string'&&entry.text.trim()
  );
