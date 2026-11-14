import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { transform } from 'esbuild';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const page = read('pages/Dialects.tsx');
const policySource = read('services/dialectTutorPolicy.ts');
const compiled = await transform(policySource, { loader: 'ts', format: 'esm', target: 'es2022' });
const { getDialectTutorIdentity, buildDialectTutorPolicy } = await import(
  'data:text/javascript;base64,' + Buffer.from(compiled.code).toString('base64')
);

// Read the actual published country records so name changes cannot silently
// break one of the two speaker identities.
const countryDataStart = page.indexOf('export const COUNTRY_DATA = [');
const countryDataEnd = page.indexOf('\n];', countryDataStart);
assert.ok(countryDataStart > 0 && countryDataEnd > countryDataStart);
const data = page.slice(countryDataStart, countryDataEnd);
const markers = [...data.matchAll(/^\s+id: '([a-z]+)',/gm)];
const countries = markers.map((match, index) => {
  const block = data.slice(match.index, markers[index + 1]?.index ?? data.length);
  const male = block.match(/characterMale:\s*\{\s*nameAr:\s*'([^']+)',?\s*nameEn:\s*'([^']+)'/);
  const female = block.match(/characterFemale:\s*\{\s*nameAr:\s*'([^']+)',?\s*nameEn:\s*'([^']+)'/);
  assert.ok(male && female, 'both genders need actual names in ' + match[1]);
  return {
    id: match[1],
    characterMale: { nameAr: male[1], nameEn: male[2] },
    characterFemale: { nameAr: female[1], nameEn: female[2] }
  };
});

test('all 22 countries provide two correctly named colleagues for text and voice', () => {
  assert.equal(countries.length, 22);
  for (const country of countries) {
    const male = getDialectTutorIdentity(country, country.characterMale);
    const female = getDialectTutorIdentity(country, country.characterFemale);
    assert.equal(male.tutorNameAr, country.characterMale.nameAr, country.id);
    assert.equal(male.tutorGender, 'male', country.id);
    assert.equal(male.partnerNameAr, country.characterFemale.nameAr, country.id);
    assert.equal(male.partnerGender, 'female', country.id);
    assert.equal(female.tutorNameAr, country.characterFemale.nameAr, country.id);
    assert.equal(female.tutorGender, 'female', country.id);
    assert.equal(female.partnerNameAr, country.characterMale.nameAr, country.id);
    assert.equal(female.partnerGender, 'male', country.id);
    for (const identity of [male, female]) {
      const policy = buildDialectTutorPolicy({
        ...identity, countryName: country.id, dialect: 'local',
        history: [{ role: 'user', text: 'مين اللي واقف جنبك؟' }]
      });
      assert.ok(policy.includes(identity.tutorNameAr), country.id);
      assert.ok(policy.includes(identity.partnerNameAr), country.id);
      assert.ok(policy.includes(identity.partnerName), country.id);
      assert.ok(policy.includes(
        identity.partnerGender === 'male'
          ? 'زميلي ' + identity.partnerNameAr
          : 'زميلتي ' + identity.partnerNameAr
      ), country.id);
      assert.match(policy, /NEVER automatically append a question/);
      assert.match(policy, /Do not keep mentioning the colleague unless the student refers to them/);
    }
  }
  assert.equal(countries.length * 2, 44);
});

test('updated country pair names are used, not stale hardcoded greetings', () => {
  const byId = Object.fromEntries(countries.map(c => [c.id, c]));
  assert.equal(byId.syria.characterMale.nameAr, 'أوس');
  assert.equal(byId.algeria.characterMale.nameAr, 'بلقاسم');
  assert.equal(byId.algeria.characterFemale.nameAr, 'حليمة');
  assert.equal(byId.egypt.characterFemale.nameAr, 'فاطمة');
  assert.equal(byId.kuwait.characterFemale.nameAr, 'لولوة');
});

test('both typed and live pathways use the correct colleague and preserve prior speaker names', () => {
  assert.match(page, /getDialectTutorIdentity\(countryForTurn, currentPersona\)/);
  assert.match(page, /getDialectTutorIdentity\(country, persona\)/);
  const country = countries.find(c => c.id === 'egypt');
  const policy = buildDialectTutorPolicy({
    ...getDialectTutorIdentity(country, country.characterFemale),
    countryName: 'Egypt', dialect: 'Egyptian Arabic',
    history: [{role: 'model', text: 'أهلاً', speakerName: country.characterMale.nameAr}]
  });
  assert.ok(policy.includes('"speaker":"أحمد"'));
  assert.ok(policy.includes('زميلي أحمد'));
  assert.doesNotMatch(page, /then ask a very simple question|ask ONE manageable question|offer the next small step/);
  assert.match(page, /Do not append a routine question/);
  assert.match(page, /do not finish replies with automatic questions or topic suggestions/);
});
