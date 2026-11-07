// Derived only from the learner's transcribed text. This does NOT evaluate audio pronunciation.
export const summarizeSpeakingEvidence = (history = []) => {
  const learner = history.filter(turn => turn?.role === 'user' && typeof turn?.text === 'string' && turn.text.trim());
  const learnerText = learner.map(turn => turn.text.trim());
  const allWords = learnerText.flatMap(text => text.split(/\s+/u).filter(Boolean));
  const arabicWords = learnerText.flatMap(text => (text.match(/[\u0621-\u064A]+/gu) || []));
  const normalizedWords = arabicWords.map(word => word
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
