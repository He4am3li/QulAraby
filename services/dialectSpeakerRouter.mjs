/**
 * Route an explicitly addressed learner turn to the on-stage tutor, without
 * confusing mentions about a person with speech directed to that person.
 * Pure utility shared by typed dialogue and the Gemini Live transcription.
 */
const normalize = value => String(value || '')
  .normalize('NFKC')
  .toLowerCase()
  .replace(/[\u064b-\u065f\u0670\u06d6-\u06ed\u0640]/g, '')
  .replace(/[أإآٱ]/g, 'ا')
  .replace(/[ؤ]/g, 'و')
  .replace(/[ئ]/g, 'ي')
  .replace(/[ى]/g, 'ي')
  .replace(/[ة]/g, 'ه');

const words = value => normalize(value).match(/[a-z]+|[\u0621-\u064a]+/g) || [];

const callWords = new Set(['يا', 'hey', 'hi', 'hello', 'yo']);
const replyCues = new Set([
  'انت', 'انتي', 'انتو', 'وانت', 'وانتي', 'رايك', 'ايه', 'وش', 'شو',
  'كيف', 'كيفك', 'اخبارك', 'شلونك', 'شخبارك', 'علومك', 'قولي', 'قول',
  'ممكن', 'تقدر', 'تقدري', 'عندك', 'تحبي', 'تحب', 'شنو',
  'what', 'how', 'why', 'hello', 'hi', 'hey', 'tell', 'can', 'could',
  'do', 'are', 'would', 'you', 'your'
]);
const directedQuestions = new Set([
  'رايك', 'برايك', 'كيفك', 'شلونك', 'شخبارك', 'علومك', 'اخبارك',
  'انت', 'انتي', 'وانت', 'وانتي', 'تعتقد', 'تعتقدي', 'تقول',
  'تقولي', 'شايف', 'شايفه', 'تشوف', 'تشوفي', 'موافق', 'موافقه',
  'think', 'your', 'you', 'how', 'feel', 'hello', 'hi', 'hey'
]);

const addressesName = (utteranceWords, person) => {
  const variants = [person?.nameAr, person?.nameEn]
    .filter(Boolean)
    .map(words)
    .filter(name => name.length);
  for (const name of variants) {
    for (let index = 0; index <= utteranceWords.length - name.length; index++) {
      if (!name.every((word, offset) => utteranceWords[index + offset] === word)) continue;
      const before = utteranceWords.slice(0, index);
      const after = utteranceWords.slice(index + name.length);
      // Clear vocative, including "إيه رأيك يا فاطمة؟" and "hey Fatima".
      if (before.length && callWords.has(before[before.length - 1])) return true;
      // Name first, followed by a direct second-person question or greeting.
      if (before.length === 0 && after.length && replyCues.has(after[0])) return true;
      // "What do you think, Fatima?" without an Arabic vocative.
      // Keep a short context window to avoid incidental name mentions.
      const lastWords = before.slice(-6);
      if (after.length === 0 && lastWords.some(word => directedQuestions.has(word))) return true;
    }
  }
  return false;
};

/**
 * @returns {'male'|'female'|null}
 * Null means no clear addressee or both tutors have been addressed at once.
 */
export const resolveAddressedDialectTutor = (utterance, country) => {
  if (!country?.characterMale || !country?.characterFemale) return null;
  const spoken = words(utterance);
  if (!spoken.length) return null;
  const male = addressesName(spoken, country.characterMale);
  const female = addressesName(spoken, country.characterFemale);
  if (male === female) return null;
  return female ? 'female' : 'male';
};
