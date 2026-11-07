import type { CalligraphyPenNibId } from './calligraphyStudioData';
import type { OrnamentStyleId } from './CalligraphyOrnaments';

/**
 * Durable on-device calligraphy gallery.
 *
 * Store the full-resolution artwork in IndexedDB rather than localStorage,
 * whose small synchronous quota was causing silent save failures. This is
 * on-device persistence only, not cross-device cloud synchronization.
 */
export interface SavedCalligraphyCard {
  id: string;
  title: string;
  dataUrl: string;
  text?: string;
  font?: string;
  pen?: CalligraphyPenNibId;
  color?: string;
  isGold?: boolean;
  foilStyle?: string;
  isSpecialIlluminated?: boolean;
  ornament?: OrnamentStyleId;
  size?: string;
  fontSize?: number;
  background?: string;
  customBgUrl?: string | null;
  showSignature?: boolean;
  signatureName?: string;
  signaturePosition?: 'bottom-right' | 'bottom-center' | 'bottom-left';
}

const DB_NAME = 'qul-calligraphy-gallery';
const STORE_NAME = 'artwork';
const RECORD_KEY = 'cards';
const LEGACY_KEY = 'qul_calligraphy_saved_cards_atelier';
export const MAX_SAVED_CALLIGRAPHY_CARDS = 20;

function scopeKey(scope: string): string {
  const safeScope = scope === 'guest' ? 'guest' : scope.trim().slice(0, 128);
  if (!safeScope) throw new Error('الحساب غير صالح لحفظ اللوحات.');
  return `${RECORD_KEY}:${encodeURIComponent(safeScope)}`;
}

function openGalleryDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('حفظ الأعمال غير مدعوم في هذا المتصفح.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('تعذر فتح معرض الخط العربي.'));
    request.onblocked = () => reject(new Error('المعرض مفتوح في تبويب آخر. أغلق التبويب القديم ثم حاول مرة أخرى.'));
  });
}

async function readGalleryKey(key: string): Promise<SavedCalligraphyCard[]> {
  const database = await openGalleryDB();
  try {
    return await new Promise<SavedCalligraphyCard[]>((resolve, reject) => {
      const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key);
      request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result : []);
      request.onerror = () => reject(request.error ?? new Error('تعذرت قراءة أعمال الخط العربي.'));
    });
  } finally {
    database.close();
  }
}

/** Each signed-in account has its OWN device gallery. Guest works stay separate. */
export async function persistCalligraphyCards(cards: SavedCalligraphyCard[], scope = 'guest'): Promise<void> {
  const database = await openGalleryDB();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put(cards.slice(0, MAX_SAVED_CALLIGRAPHY_CARDS), scopeKey(scope));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('تعذّر حفظ اللوحة في الجهاز.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('أُلغي حفظ اللوحة في الجهاز.'));
    });
  } finally {
    database.close();
  }
}

/** The old shared gallery is never auto-assigned to a signed-in user's account. */
export async function loadLegacyCalligraphyCards(): Promise<SavedCalligraphyCard[]> {
  const [guestCards, previousCards] = await Promise.all([
    readGalleryKey(scopeKey('guest')),
    readGalleryKey(RECORD_KEY)
  ]);
  let oldLocalStorage: SavedCalligraphyCard[] = [];
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) oldLocalStorage = parsed;
  } catch { /* invalid old data must never affect current works */ }
  const merged = new Map<string, SavedCalligraphyCard>();
  for (const card of [...oldLocalStorage, ...previousCards, ...guestCards]) {
    if (card?.id && card?.dataUrl) merged.set(card.id, card);
  }
  return Array.from(merged.values()).slice(0, MAX_SAVED_CALLIGRAPHY_CARDS);
}

export async function loadCalligraphyCards(scope = 'guest'): Promise<SavedCalligraphyCard[]> {
  const current = await readGalleryKey(scopeKey(scope));
  if (current.length) return current.slice(0, MAX_SAVED_CALLIGRAPHY_CARDS);
  if (scope !== 'guest') return [];

  // Existing unsigned works are copied to the guest's scoped gallery, with
  // their original key preserved for explicit import by the rightful account.
  const legacy = await loadLegacyCalligraphyCards();
  if (legacy.length) {
    await persistCalligraphyCards(legacy, 'guest');
    return legacy;
  }
  return [];
}
