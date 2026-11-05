import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../components/games/SecretMissionChallengeBank.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  reportDiagnostics: true
});
assert.equal(compiled.diagnostics?.filter(item => item.category === ts.DiagnosticCategory.Error).length ?? 0, 0);

const rooms = ['depot', 'comms', 'archive', 'vault'];
const sourceSafes = Object.fromEntries(rooms.map(room => [room, {
  safes: Array.from({ length: 4 }, (_, i) => ({
    pin: String(i + 1000), loot: { ar: 'عنصر', en: 'Item' }
  }))
}]));

function evaluateWithRandom(random) {
  const exports = {};
  const customMath = Object.create(Math);
  customMath.random = () => random;
  vm.runInNewContext(compiled.outputText, { exports, Math: customMath });
  return exports;
}

for (const random of [0, .12, .37, .63, .99]) {
  const { buildMissionDeck, normalizeArabic } = evaluateWithRandom(random);
  assert.equal(normalizeArabic('الْبَابُ'), 'الباب', 'Arabic vowel normalization');
  assert.equal(normalizeArabic('إلى'), 'الي', 'Arabic alef/ya normalization');

  const deck = buildMissionDeck(sourceSafes);
  assert.equal(Object.keys(deck).length, 4);
  for (const room of rooms) {
    assert.equal(deck[room].length, 4, room + ' should have four distinct locks');
    assert.equal(deck[room].map(q => q.mode).join(','), 'select,order,verify,write');

    for (const [index, question] of deck[room].entries()) {
      assert.equal(question.pin, String(index + 1000));
      assert.ok(question.prompt.ar && question.prompt.en, 'Bilingual prompt');
      assert.ok(question.hint.ar && question.hint.en, 'Bilingual hint');
      assert.ok(question.explanation.ar && question.explanation.en, 'Bilingual explanation');

      if (question.mode === 'select') {
        assert.equal(question.options.length, 3);
        assert.ok(question.answer >= 0 && question.answer < 3, 'Valid shuffled answer');
        assert.equal(new Set(question.options.map(item => item.ar)).size, 3, 'No duplicate choices');
      } else if (question.mode === 'order') {
        assert.ok(question.tokens.length >= 3);
        const indices = Array.from(question.tokenOrder);
        assert.equal(indices.length, question.tokens.length);
        assert.equal(new Set(indices).size, question.tokens.length);
        assert.equal([...indices].sort((a,b) => a-b).join(','), indices.map((_,i) => i).join(','));
        // A student can always solve the scrambled message by tapping tokens
        // in ascending original-token order, regardless of randomization.
        const solved = indices.map((v,i) => [v,i]).sort((a,b) => a[0]-b[0]).map(pair => pair[1]);
        assert.ok(solved.every((visibleIndex, position) => indices[visibleIndex] === position));
      } else if (question.mode === 'verify') {
        assert.ok(question.answer === 0 || question.answer === 1);
      } else {
        assert.ok(question.accepted?.length > 0);
        assert.ok(question.accepted.some(text => normalizeArabic(text).length > 0));
      }
    }
  }
}
const first = evaluateWithRandom(0).buildMissionDeck(sourceSafes);
const last = evaluateWithRandom(.99).buildMissionDeck(sourceSafes);
for (const room of rooms) {
  for (let i = 0; i < 4; i++) {
    assert.notEqual(first[room][i].prompt.ar, last[room][i].prompt.ar,
      'Replay should access a different authored variant for ' + room + '/' + i);
  }
}
console.log('Secret Mission: 32 authored variants, four modes, shuffle, Arabic input and replay checks passed.');
