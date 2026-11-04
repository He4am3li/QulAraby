import React from 'react';
import { collection, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export type DialectVoiceGender = 'male' | 'female';
export type VoiceDelivery = 'gentle' | 'natural' | 'expressive';
export type DialectVoiceProfile = {
  countryId: string;
  gender: DialectVoiceGender;
  voiceName: string;
  delivery: VoiceDelivery;
  approved: boolean;
  reviewedArabic: boolean;
  reviewedEnglish: boolean;
  updatedAt?: unknown;
};

export const VOICE_PALETTE: Record<DialectVoiceGender, string[]> = {
  male: ['Puck', 'Charon', 'Fenrir', 'Orus', 'Enceladus'],
  female: ['Kore', 'Aoede', 'Leda', 'Zephyr', 'Callirrhoe']
};

const COUNTRY_IDS = [
  'uae', 'egypt', 'saudi', 'morocco', 'kuwait', 'qatar', 'bahrain', 'oman',
  'yemen', 'iraq', 'jordan', 'palestine', 'syria', 'lebanon', 'algeria',
  'tunisia', 'libya', 'sudan', 'mauritania', 'somalia', 'djibouti', 'comoros'
];
export const voiceProfileKey = (countryId: string, gender: DialectVoiceGender) => countryId + '_' + gender;

export function defaultDialectVoice(countryId: string, gender: DialectVoiceGender): DialectVoiceProfile {
  const palette = VOICE_PALETTE[gender];
  const index = Math.max(0, COUNTRY_IDS.indexOf(countryId));
  return {
    countryId, gender, voiceName: palette[index % palette.length],
    delivery: 'natural', approved: false, reviewedArabic: false, reviewedEnglish: false
  };
}

export function normalizeVoiceProfile(data: any): DialectVoiceProfile | null {
  if (!data || typeof data !== 'object') return null;
  if (!COUNTRY_IDS.includes(data.countryId) || !['male', 'female'].includes(data.gender)) return null;
  if (!VOICE_PALETTE[data.gender as DialectVoiceGender].includes(data.voiceName)) return null;
  if (!['gentle', 'natural', 'expressive'].includes(data.delivery)) return null;
  return {
    countryId: data.countryId,
    gender: data.gender,
    voiceName: data.voiceName,
    delivery: data.delivery,
    approved: data.approved === true,
    reviewedArabic: data.reviewedArabic === true,
    reviewedEnglish: data.reviewedEnglish === true,
    updatedAt: data.updatedAt
  };
}

export function publishedVoice(
  profiles: Record<string, DialectVoiceProfile>,
  countryId: string, gender: DialectVoiceGender
): DialectVoiceProfile {
  const key = voiceProfileKey(countryId, gender);
  const candidate = profiles[key];
  // Unapproved or incomplete reviews cannot change student voices.
  if (candidate?.approved && candidate.reviewedArabic && candidate.reviewedEnglish)
    return candidate;
  return defaultDialectVoice(countryId, gender);
}

export function useDialectVoiceProfiles(): {
  profiles: Record<string, DialectVoiceProfile>;
  loading: boolean;
  error: string | null;
} {
  const [profiles, setProfiles] = React.useState<Record<string, DialectVoiceProfile>>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    return onSnapshot(collection(db, 'dialect_voice_profiles'), snap => {
      const next: Record<string, DialectVoiceProfile> = {};
      snap.forEach(item => {
        const profile = normalizeVoiceProfile(item.data());
        if (profile && item.id === voiceProfileKey(profile.countryId, profile.gender)) next[item.id] = profile;
      });
      setProfiles(next);
      setLoading(false);
      setError(null);
    }, e => {
      console.warn('Could not load approved dialect voices', e);
      setError('تعذر قراءة اعتمادات الأصوات. تُستخدم الأصوات الافتراضية الآمنة.');
      setLoading(false);
    });
  }, []);
  return { profiles, loading, error };
}

export async function approveDialectVoice(
  profile: DialectVoiceProfile
): Promise<void> {
  const normalized = normalizeVoiceProfile(profile);
  if (!normalized || !normalized.reviewedArabic || !normalized.reviewedEnglish)
    throw new Error('يجب اختبار العينتين العربية والإنجليزية قبل اعتماد الصوت.');
  await setDoc(doc(db, 'dialect_voice_profiles', voiceProfileKey(normalized.countryId, normalized.gender)), {
    countryId: normalized.countryId,
    gender: normalized.gender,
    voiceName: normalized.voiceName,
    delivery: normalized.delivery,
    approved: true,
    reviewedArabic: true,
    reviewedEnglish: true,
    updatedAt: serverTimestamp()
  });
}
