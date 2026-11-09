import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewTranslationOffline as review} from '../services/translationOfflineReview.mjs';
const cases=[
['exact without vowels','I drink cold water.','أشرب ماء باردا','أشرب ماءً باردًا.','exact'],
['exact with vowels','I drink cold water.','أَشْرَبُ مَاءً بَارِدًا','أشرب ماءً باردًا.','exact'],
['hamza variation','I drink cold water.','اشرب ماء باردا','أشرب ماءً باردًا.','exact'],
['phonetic cold','I drink cold water.','أشرب ماء كولد','أشرب ماءً باردًا.','transliteration'],
['phonetic cold plus vowel','I drink cold water.','أشرب ماءً كولد','أشرب ماءً باردًا.','transliteration'],
['English cold','I drink cold water.','أشرب ماء cold','أشرب ماءً باردًا.','untranslated'],
['English water','I drink cold water.','أشرب water بارد','أشرب ماءً باردًا.','untranslated'],
['literal awkward','I drink cold water.','أنا أشرب البارد الماء','أشرب ماءً باردًا.','ungraded'],
['adjective missing','I drink cold water.','أشرب ماء','أشرب ماءً باردًا.','ungraded'],
['incorrect antonym','I drink cold water.','أشرب ماء ساخنا','أشرب ماءً باردًا.','ungraded'],
['valid paraphrase','I drink cold water.','أنا أشرب الماء البارد','أشرب ماءً باردًا.','ungraded'],
['spelling typo','I drink cold water.','أشرب مائا باردا','أشرب ماءً باردًا.','ungraded'],
['reference with punctuation','Where is the school?','أين المدرسة','أين المدرسة؟','exact'],
['alternate school','Where is the school?','أين تقع المدرسة','أين المدرسة؟','ungraded'],
['school English token','Where is the school?','أين school','أين المدرسة؟','untranslated'],
['simple exact','I love reading.','أحب القراءة','أحب القراءة.','exact'],
['reading paraphrase','I love reading.','أنا أحب أن أقرأ','أحب القراءة.','ungraded'],
['negation reversal','I love reading.','لا أحب القراءة','أحب القراءة.','ungraded'],
['punctuation normalization','The weather is beautiful.','الطقس جميل!','الطقس جميل.','exact'],
['gender mismatch','The weather is beautiful.','الطقس جميلة','الطقس جميل.','ungraded']
];
for(const [name,prompt,answer,reference,kind] of cases){
 test(name,()=>{
  const r=review(prompt,answer,reference);
  assert.equal(r.reviewKind,kind);
  assert.equal(r.accuracy,kind==='exact'?100:-1);
  assert.equal(r.isCorrect,kind==='exact');
  assert.ok(r.feedbackAr.length>25||kind==='exact');
  assert.ok(r.feedbackEn.length>25||kind==='exact');
  assert.doesNotMatch(r.feedbackAr,/مُحَاوَلَةٌ طَيِّبَةٌ|واصل التدريب/);
  if(kind==='transliteration') {assert.match(r.feedbackAr,/كولد/);assert.match(r.feedbackAr,/بارد/);}
 });
}
test('suite covers 20 student answers',()=>assert.equal(cases.length,20));
