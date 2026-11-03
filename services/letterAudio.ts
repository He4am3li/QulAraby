/**
 * Recorded Arabic letter names. Each file is shipped with the app under /public,
 * so selecting a letter never makes a generative speech request.
 */
export const LETTER_NAME_AUDIO_FILES: Record<string, string> = {
  'أ': 'alif.mp3',
  'ب': 'ba.mp3',
  'ت': 'ta.mp3',
  'ث': 'tha.mp3',
  'ج': 'jim.mp3',
  'ح': 'ha.mp3',
  'خ': 'kha.mp3',
  'د': 'dal.mp3',
  'ذ': 'dhal.mp3',
  'ر': 'ra.mp3',
  'ز': 'zay.mp3',
  'س': 'sin.mp3',
  'ش': 'shin.mp3',
  'ص': 'sad.mp3',
  'ض': 'dad.mp3',
  'ط': 'ta-emphatic.mp3',
  'ظ': 'za-emphatic.mp3',
  'ع': 'ayn.mp3',
  'غ': 'ghayn.mp3',
  'ف': 'fa.mp3',
  'ق': 'qaf.mp3',
  'ك': 'kaf.mp3',
  'ل': 'lam.mp3',
  'م': 'mim.mp3',
  'ن': 'nun.mp3',
  'هـ': 'haa.mp3',
  'و': 'waw.mp3',
  'ي': 'ya.mp3'
};

const preloaded = new Map<string, HTMLAudioElement>();
let active: HTMLAudioElement | null = null;

function getLetterAudio(letter: string): HTMLAudioElement {
  const name = LETTER_NAME_AUDIO_FILES[letter];
  if (!name) throw new Error(`No recorded pronunciation for ${letter}`);
  const existing = preloaded.get(letter);
  if (existing) return existing;
  const audio = new Audio(`${import.meta.env.BASE_URL}audio/letters/${name}`);
  audio.preload = 'auto';
  audio.addEventListener('ended', () => {
    if (active === audio) active = null;
  });
  preloaded.set(letter, audio);
  return audio;
}

/** Cache and warm up recordings as soon as the Letters page opens. */
export function preloadLetterNames(): void {
  for (const letter of Object.keys(LETTER_NAME_AUDIO_FILES)) {
    const audio = getLetterAudio(letter);
    if (audio.readyState === HTMLMediaElement.HAVE_NOTHING) audio.load();
  }
}

/** Start immediately within the click's user-activation, with no TTS call. */
export function playLetterName(letter: string): Promise<void> {
  const audio = getLetterAudio(letter);
  if (active) {
    active.pause();
    try { active.currentTime = 0; } catch { /* not yet seekable */ }
  }
  active = audio;
  try { audio.currentTime = 0; } catch { /* not yet seekable */ }
  return audio.play();
}

/** Prevent playback continuing after navigating away from Letters. */
export function stopLetterName(): void {
  if (!active) return;
  active.pause();
  try { active.currentTime = 0; } catch { /* not yet seekable */ }
  active = null;
}
