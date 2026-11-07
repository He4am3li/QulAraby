import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { summarizeSpeakingEvidence, createNextSpeakingTask, mapPlacementLevel, validateSpeakingMissionEvidence } from '../services/speakingLearning.mjs';

test('speaking evidence counts learner words only and never invents acoustic scores', () => {
  const result = summarizeSpeakingEvidence([
    { role: 'ai', text: 'مرحبا كيف حالك؟' },
    { role: 'user', text: 'أنا أحب القراءة' },
    { role: 'user', text: 'أنا اقرأ كتب' },
    { role: 'ai', text: 'ممتاز' },
  ]);
  assert.equal(result.learnerTurns, 2);
  assert.equal(result.arabicWords, 6);
  assert.equal(result.uniqueArabicWords, 5);
  assert.equal(result.source, 'transcript');
  assert.equal('pronunciationScore' in result, false);
});
test('empty and model-only sessions are not presented as learner practice', () => {
  assert.equal(summarizeSpeakingEvidence([]).learnerTurns, 0);
  assert.equal(summarizeSpeakingEvidence([{ role: 'ai', text: 'أهلا' }]).arabicWords, 0);
});
test('practice task responds to level, then correction evidence', () => {
  assert.match(createNextSpeakingTask({ level: 'beginner', topicAr: 'السفر' }).promptAr, /جملة عربية قصيرة/);
  assert.match(createNextSpeakingTask({ level: 'intermediate', topicAr: 'السفر' }).promptAr, /ثلاث جمل/);
  assert.match(createNextSpeakingTask({ level: 'advanced', topicAr: 'السفر' }).promptAr, /سببين/);
  const basedOnError = createNextSpeakingTask({
    level: 'advanced', corrections: [{ original: 'انا ذهب', correction: 'أنا ذهبت' }],
  });
  assert.equal(basedOnError.source, 'correction');
  assert.match(basedOnError.promptAr, /أنا ذهبت/);
});

test('placement suggestions map known levels without validating unknown grades', () => {
  assert.equal(mapPlacementLevel('a1'), 'beginner');
  assert.equal(mapPlacementLevel('B1'), 'intermediate');
  assert.equal(mapPlacementLevel('C2'), 'advanced');
  assert.equal(mapPlacementLevel('speaking level pending'), null);
  assert.equal(mapPlacementLevel(undefined), null);
});

test('call objective evidence never credits the tutor or a fabricated learner quotation', () => {
  const history = [
    { role: 'ai', text: 'هل تريد طاولة لشخصين؟' },
    { role: 'user', text: 'أريد طاولة لشخصين، غدًا الساعة السابعة.' },
  ];
  const objectives = ['طلب طاولة', 'وقت الحجز', 'عدد الأشخاص'];
  const claimed = [
    { goal: objectives[0], evidence: 'أريد طاولة لشخصين' },
    { goal: objectives[1], evidence: 'الساعة الثامنة' },
    { goal: objectives[2], evidence: 'هل تريد طاولة لشخصين' },
  ];
  const result = validateSpeakingMissionEvidence(history, objectives, claimed);
  assert.deepEqual(result.map(x => x.achieved), [true, false, false]);
  assert.equal(result[1].evidence, '');
  assert.equal(result[2].evidence, '');
});

test('an AI claim with a mismatched goal or no Arabic evidence never counts', () => {
  const history = [{ role: 'user', text: 'Please book a table' }];
  const goals = ['اطلب طاولة'];
  assert.equal(validateSpeakingMissionEvidence(history, goals, [{ goal: goals[0], evidence: 'Please book a table' }])[0].achieved, false);
  assert.equal(validateSpeakingMissionEvidence([{ role: 'user', text: 'أريد طاولة' }], goals, [{ goal: 'غير مطابق', evidence: 'أريد طاولة' }])[0].achieved, false);
});

test('speaking sections mirror listening sidebar structure while keeping both full experiences', () => {
  const speak = readFileSync(new URL('../pages/Speak.tsx', import.meta.url), 'utf8');
  const booth = readFileSync(new URL('../components/SpeakingCallBooth.tsx', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../components/SpeakingCallBooth.css', import.meta.url), 'utf8');
  assert.match(speak, /speakingBranch === 'booth'/);
  assert.match(speak, /SpeakingCallBooth/);
  assert.match(speak, /CALL_CONTACTS\.map/);
  assert.match(speak, /<PageHeader/);
  assert.match(speak, /<aside/);
  assert.match(speak, /missionEvidence=/);
  assert.match(speak, /generateSessionInsights\(finalHistory, activeTopic\.ar/);
  for (const place of ['restaurant', 'hotel', 'friend', 'support']) {
    assert.match(booth, new RegExp("id: '" + place + "'"));
  }
  assert.match(booth, /sessionLive/);
  assert.match(booth, /onStart\(\)/);
  assert.match(booth, /onStop\(\)/);
  assert.match(booth, /onToggleMic/);
  assert.match(booth, /onShowDirectory/);
  assert.match(booth, /CALL_CONTACTS\.find/);
  assert.match(booth, /missionEvidence/);
  assert.match(css, /qul-call-handset/);
  assert.match(css, /qul-call-keypad/);
  assert.match(css, /prefers-reduced-motion/);
});
