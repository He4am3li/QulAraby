import { RADIO_TEXT_CORPUS, RadioCorpusLevel, RadioCorpusText, RadioCorpusType } from './radioTextCorpus';

/**
 * Independent persistent random shuffle-bag for every (learner, level, radio
 * category). Each group contains TEN distinct texts. Draw without replacement;
 * reshuffle only when all ten have been used. Prevent an immediate repeat on a
 * cycle boundary. The current student can return after refresh or sign-in and
 * continue their remaining unseen texts on the same browser.
 */
type GroupHistory = { remaining: string[]; last: string | null; cycle: number };
type RadioHistory = Record<string, GroupHistory>;
const PREFIX = 'qul_radio_text_history_v1:';
const memoryFallback = new Map<string, RadioHistory>();

const shuffled = (values: string[]): string[] => {
  const result = values.slice();
  for (let i = result.length - 1; i > 0; i--) {
    // Fisher–Yates, unbiased when crypto is available.
    let rand: number;
    try {
      const bytes = new Uint32Array(1);
      crypto.getRandomValues(bytes);
      rand = bytes[0] / 4294967296;
    } catch {
      rand = Math.random();
    }
    const j = Math.floor(rand * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};
const readHistory = (key: string): RadioHistory => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return memoryFallback.get(key) || {};
    const parsed = JSON.parse(stored);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch { return memoryFallback.get(key) || {}; }
};
const writeHistory = (key: string, history: RadioHistory) => {
  memoryFallback.set(key, history);
  try { localStorage.setItem(key, JSON.stringify(history)); } catch { /* browser privacy mode */ }
};

export const drawRadioCorpusText = (
  level: RadioCorpusLevel,
  type: RadioCorpusType,
  learnerScope: string = 'guest'
): RadioCorpusText => {
  const group = RADIO_TEXT_CORPUS.filter(text => text.level === level && text.type === type);
  if (group.length !== 10 || new Set(group.map(text => text.id)).size !== 10) {
    throw new Error('The radio corpus group must have exactly ten distinct texts.');
  }
  const storageKey = PREFIX + (learnerScope || 'guest');
  const state = readHistory(storageKey);
  const groupKey = level + ':' + type;
  const previous = state[groupKey];
  const allowed = new Set(group.map(text => text.id));
  let remaining = Array.isArray(previous?.remaining)
    ? [...new Set(previous.remaining.filter(id => allowed.has(id)))]
    : [];
  const last = previous?.last && allowed.has(previous.last) ? previous.last : null;
  let cycle = Number.isFinite(previous?.cycle) ? previous.cycle : 0;
  if (!remaining.length) {
    remaining = shuffled(group.map(text => text.id));
    if (remaining[0] === last && remaining.length > 1) {
      // The first text of the new 10-text cycle cannot equal the previous last.
      [remaining[0], remaining[1]] = [remaining[1], remaining[0]];
    }
    cycle++;
  }
  const nextId = remaining.shift()!;
  state[groupKey] = { remaining, last: nextId, cycle };
  writeHistory(storageKey, state);
  return group.find(text => text.id === nextId)!;
};

export const remainingRadioCorpusTexts = (
  level: RadioCorpusLevel, type: RadioCorpusType, learnerScope = 'guest'
): number => {
  const history = readHistory(PREFIX + learnerScope);
  const remaining = history[level + ':' + type]?.remaining;
  return Array.isArray(remaining) ? remaining.length : 10;
};
