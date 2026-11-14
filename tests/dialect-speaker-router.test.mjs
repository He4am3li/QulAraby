import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolveAddressedDialectTutor as route } from '../services/dialectSpeakerRouter.mjs';

const code = readFileSync(new URL('../pages/Dialects.tsx', import.meta.url), 'utf8');
const raw = code.slice(code.indexOf('export const COUNTRY_DATA = ['));
const markers = [...raw.matchAll(/^\s+id: '([a-z]+)',/gm)];
const countries = markers.map((marker, index) => {
  const block = raw.slice(marker.index, markers[index + 1]?.index ?? raw.length);
  const male = block.match(/characterMale:\s*\{\s*nameAr:\s*'([^']+)',?\s*nameEn:\s*'([^']+)'/);
  const female = block.match(/characterFemale:\s*\{\s*nameAr:\s*'([^']+)',?\s*nameEn:\s*'([^']+)'/);
  assert.ok(male && female, 'Both characters have names for ' + marker[1]);
  return {
    id: marker[1],
    characterMale: { nameAr: male[1], nameEn: male[2] },
    characterFemale: { nameAr: female[1], nameEn: female[2] }
  };
});

test('all 22 country pairs automatically route their explicitly addressed male or female tutor', () => {
  assert.equal(countries.length, 22);
  for (const country of countries) {
    const m = country.characterMale;
    const f = country.characterFemale;
    assert.equal(route('يا ' + m.nameAr + '، إنت رأيك إيه؟', country), 'male', country.id);
    assert.equal(route('وإنتِ رأيك إيه يا ' + f.nameAr + '؟', country), 'female', country.id);
    assert.equal(route('كيفك يا ' + f.nameAr, country), 'female', country.id);
    assert.equal(route(f.nameAr + ' إنتِ شايفة إيه؟', country), 'female', country.id);
    assert.equal(route('What do you think, ' + m.nameEn + '?', country), 'male', country.id);
    assert.equal(route('Hi ' + f.nameEn + ', how are you?', country), 'female', country.id);
    assert.equal(route('Hello ' + m.nameEn, country), 'male', country.id);
  }
});

test('talking ABOUT the other tutor is not treated as addressing them', () => {
  for (const country of countries) {
    const m = country.characterMale.nameAr;
    const f = country.characterFemale.nameAr;
    assert.equal(route('مين ' + f + ' اللي واقفة جنبك؟', country), null, country.id);
    assert.equal(route('احكيلي عن ' + f, country), null, country.id);
    assert.equal(route(m + ' قال لي إن الجو جميل', country), null, country.id);
    assert.equal(route('أنا عارف ' + f, country), null, country.id);
    assert.equal(route('I heard about ' + country.characterMale.nameEn, country), null, country.id);
    assert.equal(route('يا ' + m + ' ويا ' + f, country), null, country.id);
  }
});

test('Arabic name normalization and country scope are respected', () => {
  const egypt = countries.find(item => item.id === 'egypt');
  const syria = countries.find(item => item.id === 'syria');
  assert.equal(route('كيفك فاطمة؟', egypt), 'female');
  assert.equal(route('فاطمة، إنتِ رأيك إيه؟', egypt), 'female');
  assert.equal(route('يا أوس، كيف حالك؟', syria), 'male');
  assert.equal(route('يا اوس، كيف حالك؟', syria), 'male');
  assert.equal(route('يا فاطمة، رأيك فين؟', syria), null);
  assert.equal(route('كيفك يا فاطمة؟', null), null);
});

test('text and live modes invoke the same resolver, keeping one shared conversation', () => {
  assert.match(code, /resolveAddressedDialectTutor\(input, countryForTurn\)/);
  assert.match(code, /resolveAddressedDialectTutor\(speech, country\)/);
  assert.match(code, /startLiveConversation\(target, speech\)/);
  assert.match(code, /session\.sendClientContent\(\{/);
  assert.match(code, /turnComplete: true/);
  assert.match(code, /setSelectedPersona\(target\)/);
  assert.match(code, /playAudio\(modelText, currentPersona\)/);
});
