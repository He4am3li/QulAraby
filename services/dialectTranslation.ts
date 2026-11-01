import { GoogleGenAI } from '@google/genai';
import { getDialectTextDirection } from './dialectVoiceProfiles';

export interface BilingualTutorReply {
  dialectText: string;
  translationEn: string;
}

const englishCache = new Map<string, string>();
const pendingTranslations = new Map<string, Promise<string>>();
const MAX_CACHE_ENTRIES = 150;

/** A model-generated translation is an aid, not a certified or word-synchronous subtitle. */
export async function translateDialectToEnglish(countryId: string, original: string): Promise<string> {
  const source = original.replace(/\s+/g, ' ').trim().slice(0, 800);
  if (!source) return '';
  const key = countryId + ':' + source;
  const cached = englishCache.get(key);
  if (cached !== undefined) return cached;
  const pending = pendingTranslations.get(key);
  if (pending) return pending;

  const task = (async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          'Translate this Arabic dialect speech into SIMPLE, ACCURATE English for an Arabic beginner.',
          getDialectTextDirection(countryId),
          'Preserve names, intent, questions, and cultural terms. Do not add explanations or answers.',
          'Translate only what is actually written. Return only the English translation.',
          'SOURCE ARABIC: ' + JSON.stringify(source)
        ].join('\n'),
        config: { temperature: 0.1 }
      });
      const translated = (response.text || '').trim().replace(/^["']|["']$/g, '');
      if (!translated) return '';
      if (englishCache.size >= MAX_CACHE_ENTRIES) englishCache.delete(englishCache.keys().next().value!);
      englishCache.set(key, translated);
      return translated;
    } catch (error) {
      console.warn('Dialect translation is temporarily unavailable.', error);
      return '';
    } finally {
      pendingTranslations.delete(key);
    }
  })();
  pendingTranslations.set(key, task);
  return task;
}

/** Keep spoken Arabic separate from its English accessibility aid. */
export function parseBilingualTutorReply(raw: string): BilingualTutorReply {
  const clean = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try {
    const obj = JSON.parse(clean);
    if (typeof obj?.dialectText === 'string' && obj.dialectText.trim()) {
      return {
        dialectText: obj.dialectText.trim(),
        translationEn: typeof obj.translationEn === 'string' ? obj.translationEn.trim() : ''
      };
    }
  } catch { /* A model may return ordinary text, which we display faithfully. */ }
  return { dialectText: raw.trim(), translationEn: '' };
}
