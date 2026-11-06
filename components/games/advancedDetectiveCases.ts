import type { DetectiveCase, SuspectPerson } from './DetectiveMystery';

type AdvancedSeed = {
  id: number; caseNumber: number; title: string; description: string; culpritId: string;
  suspectIds: string[]; words: Array<[string, string]>;
  clues: Array<{ speech: string; innocentIds: string[]; key: string; hint: string; options: string[] }>;
};

// Advanced cases have their own investigation-room scene and do not reuse the
// six original cinematic case posters. Those six posters belong to intermediate.
const ADVANCED_SEEDS: AdvancedSeed[] = [
  {
    id: 201, caseNumber: 1, title: 'رسالة الأرشيف السرية',
    description: 'اختفت رسالة سرية من غرفة الأرشيف عندما انقطعت الكهرباء. راجع تسجيل كاميرا الممر وسجل الاستقبال للعثور على الحقيقة.',
    suspectIds: ['s13', 's14', 's15', 's16', 's17', 's18'], culpritId: 's14',
    words: [['رسالة سرية', 'Secret letter'], ['غرفة الأرشيف', 'Archive room'], ['الكهرباء', 'Electricity'], ['كاميرا الممر', 'Corridor camera'], ['سجل الاستقبال', 'Reception log']],
    clues: [
      { speech: 'سجلت كاميرا الممر وجود ندى وسلمى في قاعة الانتظار أثناء الحادث. ثبتت براءتهما.', innocentIds: ['s13', 's17'], key: 'كاميرا الممر', hint: 'ما الأداة التي سجلت مكان ندى وسلمى؟', options: ['بصمة الإصبع', 'كاميرا الممر', 'مفتاح الخزينة'] },
      { speech: 'أثبتت الأختام الرسمية أن الكابتن ريان والبحار صابر لم يدخلا الأرشيف وقت الاختفاء. هما بريئان.', innocentIds: ['s16', 's18'], key: 'الأختام الرسمية', hint: 'ما الذي وثق براءة الرجلين؟', options: ['الأختام الرسمية', 'المصباح', 'تذكرة القطار'] },
      { speech: 'أكد سجل الاستقبال وجود الجدة مريم في مكتب الاستعلامات طوال تلك الفترة، فهي بريئة.', innocentIds: ['s15'], key: 'سجل الاستقبال', hint: 'أي سجل أثبت مكان الجدة مريم؟', options: ['تقرير الطقس', 'دفتر المكتبة', 'سجل الاستقبال'] },
    ],
  },
  {
    id: 202, caseNumber: 2, title: 'سر الشارة الذهبية',
    description: 'اختفت شارة ذهبية من غرفة التسجيل خلال رحلة المدرسة. ظهرت سيارة عند الباب، وراجع المحقق صورة البوابة وسجل التذاكر.',
    suspectIds: ['s19', 's20', 's21', 's22', 's23', 's24'], culpritId: 's22',
    words: [['شارة ذهبية', 'Golden badge'], ['غرفة التسجيل', 'Registration room'], ['رحلة المدرسة', 'School trip'], ['صورة البوابة', 'Gate photograph'], ['سجل التذاكر', 'Ticket log']],
    clues: [
      { speech: 'تظهر صورة البوابة سامي وعمر خارج المبنى وقت اختفاء الشارة. هما بريئان.', innocentIds: ['s20', 's23'], key: 'صورة البوابة', hint: 'ما الدليل الذي يوضح مكان سامي وعمر؟', options: ['صورة البوابة', 'رسالة الهاتف', 'المفتاح'] },
      { speech: 'أثبت سجل التذاكر أن هنري وفارس كانا على متن الحافلة طوال الوقت، فهما بريئان.', innocentIds: ['s21', 's24'], key: 'سجل التذاكر', hint: 'ما السجل الذي يثبت وجودهما في الحافلة؟', options: ['فاتورة المحل', 'جواز السفر', 'سجل التذاكر'] },
      { speech: 'ميهو كانت في غرفة التسجيل أمام الموظفة طوال وقت الحادث. ثبتت براءتها.', innocentIds: ['s19'], key: 'غرفة التسجيل', hint: 'أين كانت ميهو وقت الحادث؟', options: ['الحديقة', 'غرفة التسجيل', 'غرفة الطعام'] },
    ],
  },
];

export const createAdvancedDetectiveCases = (roster: SuspectPerson[]): DetectiveCase[] => ADVANCED_SEEDS.map(seed => {
  const suspects = seed.suspectIds.map(id => {
    const suspect = roster.find(s => s.id === id);
    if (!suspect) throw new Error('Missing advanced detective suspect: ' + id);
    return suspect;
  });
  return {
    id: seed.id, level: 'advanced', caseNumber: seed.caseNumber,
    caseIndex: 10 + seed.caseNumber - 1, codeName: seed.title,
    crimeDescription: seed.description,
    bgImage: 'url("/٨.jpeg")',
    suspects, suspectIds: seed.suspectIds,
    culpritId: seed.culpritId,
    evidenceTerms: seed.words.map(([ar, en]) => ({ ar, en })),
    clues: seed.clues.map(clue => ({
      speech: clue.speech,
      matcher: (person: SuspectPerson) => clue.innocentIds.includes(person.id),
      cipherKey: clue.key,
      cipherHint: clue.hint,
      cipherOptions: clue.options,
    })),
  };
});
