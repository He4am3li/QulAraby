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

export async function persistCalligraphyCards(cards: SavedCalligraphyCard[]): Promise<void> {
  const database = await openGalleryDB();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put(cards.slice(0, MAX_SAVED_CALLIGRAPHY_CARDS), RECORD_KEY);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('تعذّر حفظ اللوحة في الجهاز.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('أُلغي حفظ اللوحة في الجهاز.'));
    });
  } finally {
    database.close();
  }
}

export async function loadCalligraphyCards(): Promise<SavedCalligraphyCard[]> {
  const database = await openGalleryDB();
  let existing: SavedCalligraphyCard[] = [];
  try {
    existing = await new Promise<SavedCalligraphyCard[]>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const request = transaction.objectStore(STORE_NAME).get(RECORD_KEY);
      request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result : []);
      request.onerror = () => reject(request.error ?? new Error('تعذرت قراءة أعمال الخط العربي.'));
    });
  } finally {
    database.close();
  }
  if (existing.length > 0) return existing;

  // Migrate existing artwork exactly once, deleting the old copy only after
  // the new IndexedDB transaction successfully commits.
  let legacy: SavedCalligraphyCard[] = [];
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) legacy = parsed.slice(0, MAX_SAVED_CALLIGRAPHY_CARDS);
    }
  } catch {
    return existing;
  }
  if (legacy.length) {
    await persistCalligraphyCards(legacy);
    try { localStorage.removeItem(LEGACY_KEY); } catch { /* migrated safely */ }
    return legacy;
  }
  return existing;
}
