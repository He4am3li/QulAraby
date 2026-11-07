import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import type { SavedCalligraphyCard } from './calligraphyPersistence';

const CLOUD_COLLECTION = 'calligraphy';
const CLOUD_LIMIT = 20;

/**
 * Compress user artwork for account sync. Full-size PNG originals stay on
 * the device in IndexedDB. Firestore documents must remain far below 1 MiB.
 */
async function compressDataUrl(input: string, maxWidth: number, maxHeight: number, maxCharacters: number): Promise<string> {
  if (!input.startsWith('data:image/')) throw new Error('صيغة الصورة لا تدعم المزامنة.');
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('تعذر تحميل صورة اللوحة للمزامنة.'));
    image.src = input;
  });
  let scale = Math.min(1, maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
  for (let attempt = 0; attempt < 6; attempt++) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('المتصفح لا يدعم ضغط الصور.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const result = canvas.toDataURL('image/jpeg', Math.max(.55, .85 - .06 * attempt));
    if (result.length <= maxCharacters) return result;
    scale *= .75;
  }
  throw new Error('صورة اللوحة كبيرة جدًا للمزامنة، احتفظ بها على الجهاز.');
}

function requireUser(uid: string): void {
  if (!uid || auth.currentUser?.uid !== uid) {
    throw new Error('سجّل الدخول بحسابك لمزامنة لوحات الخط.');
  }
}

function ownerCollection(uid: string) {
  requireUser(uid);
  return collection(db, 'users', uid, CLOUD_COLLECTION);
}

interface CloudRecord {
  title: string;
  preview: string;
  settings: Record<string, unknown>;
  updatedAt: number;
}

const cloudSettings = (card: SavedCalligraphyCard, customBackground: string | null) => ({
  text: card.text || '',
  font: card.font || 'font-reem-kufi-ink',
  pen: card.pen || 'qasab_pen',
  color: card.color || '#1c140e',
  isGold: Boolean(card.isGold),
  foilStyle: card.foilStyle || 'leaf',
  isSpecialIlluminated: Boolean(card.isSpecialIlluminated),
  ornament: card.ornament || 'none',
  size: card.size || 'A3',
  fontSize: card.fontSize || 96,
  background: customBackground ? 'custom_uploaded' : (card.background || 'ottoman_gold_fleck'),
  customBgUrl: customBackground || '',
  showSignature: Boolean(card.showSignature),
  signatureName: card.signatureName || '',
  signaturePosition: card.signaturePosition || 'bottom-left'
});

export async function saveCloudCalligraphyCard(uid: string, card: SavedCalligraphyCard): Promise<void> {
  requireUser(uid);
  const preview = await compressDataUrl(card.dataUrl, 960, 720, 390_000);
  const customBackground = card.customBgUrl
    ? await compressDataUrl(card.customBgUrl, 960, 960, 290_000)
    : null;
  const settings = cloudSettings(card, customBackground);
  const record: CloudRecord = {
    title: card.title.slice(0, 100),
    preview,
    settings,
    updatedAt: Date.now()
  };
  if (JSON.stringify(record).length > 780_000) throw new Error('هذه اللوحة أكبر من حد المزامنة الآمنة.');
  await setDoc(doc(ownerCollection(uid), card.id), record);
}

export async function loadCloudCalligraphyCards(uid: string): Promise<SavedCalligraphyCard[]> {
  const records = await getDocs(ownerCollection(uid));
  return records.docs
    .map(record => {
      const data = record.data() as Partial<CloudRecord>;
      if (!data.preview?.startsWith('data:image/') || !data.settings || typeof data.settings !== 'object') return null;
      const options = data.settings;
      const card: SavedCalligraphyCard = {
        ...(options as Partial<SavedCalligraphyCard>),
        id: record.id,
        title: typeof data.title === 'string' ? data.title : 'لوحة خط عربي',
        dataUrl: data.preview,
        customBgUrl: typeof options.customBgUrl === 'string' && options.customBgUrl.startsWith('data:image/')
          ? options.customBgUrl : null
      };
      return card;
    })
    .filter((card): card is SavedCalligraphyCard => Boolean(card))
    .sort((a, b) => {
      // Card IDs from the original gallery contain a monotonically increasing timestamp.
      const time = (id: string) => Number(id.match(/^card_(\d{11,})/)?.[1] || '0');
      return time(b.id) - time(a.id);
    })
    .slice(0, CLOUD_LIMIT);
}

export async function deleteCloudCalligraphyCard(uid: string, cardId: string): Promise<void> {
  await deleteDoc(doc(ownerCollection(uid), cardId));
}
