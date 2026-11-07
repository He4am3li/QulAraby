import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeSpeakingEvidence, createNextSpeakingTask } from '../services/speakingLearning.mjs';

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
