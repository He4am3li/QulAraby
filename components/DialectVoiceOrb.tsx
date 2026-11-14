import React from 'react';
import './DialectVoiceOrb.css';
import { getDialectFlagOrbPalette } from '../services/dialectFlagOrbPalette.mjs';

interface Props {
  countryId: string;
  active: boolean;
  connecting?: boolean;
  listening: boolean;
  speaking: boolean;
  loading?: boolean;
  disabled?: boolean;
  lang: 'ar' | 'en';
  onToggle: () => void;
}

type OrbPhase = 'idle' | 'connecting' | 'listening' | 'speaking' | 'loading' | 'active';

/**
 * QUL's voice control: one floating, glass-like sphere inspired by the modern
 * macOS voice assistant. The artwork is native SVG/CSS, not an image asset.
 *
 * The original onToggle, disabled, connected, loading and screen-reader
 * semantics are intentionally unchanged. The button never moves its anchor.
 */
export const DialectVoiceOrb: React.FC<Props> = ({
  countryId, active, connecting = false, listening, speaking, loading = false, disabled = false, lang, onToggle
}) => {
  const ar = lang === 'ar';
  const palette = getDialectFlagOrbPalette(countryId);
  const uniqueId = React.useId().replace(/:/g, '');
  const clipId = `qul-voice-clip-${uniqueId}`;
  const warmId = `qul-voice-warm-${uniqueId}`;
  const coolId = `qul-voice-cool-${uniqueId}`;
  const sheenId = `qul-voice-sheen-${uniqueId}`;

  const phase: OrbPhase = connecting ? 'connecting'
    : speaking ? 'speaking'
    : listening ? 'listening'
    : loading ? 'loading'
    : active ? 'active' : 'idle';

  const status = connecting ? (ar ? 'جار الاتصال، اضغط للإلغاء' : 'Connecting, tap to cancel')
    : !active ? (ar ? 'بدء التحدث' : 'Start speaking')
    : speaking ? (ar ? 'الشخصية تتحدث' : 'Tutor speaking')
    : loading ? (ar ? 'جار تجهيز الرد' : 'Preparing a reply')
    : listening ? (ar ? 'جار الاستماع' : 'Listening')
    : (ar ? 'الاتصال نشط' : 'Call active');

  const actionLabel = connecting ? (ar ? 'إلغاء بدء المحادثة' : 'Cancel connecting')
    : active ? (ar ? 'إنهاء المحادثة الصوتية' : 'End voice conversation')
    : (ar ? 'تشغيل المحادثة الصوتية مع الشخصية المختارة' : 'Start live voice with selected tutor');

  return (
    <button
      type="button"
      className="dialect-orb"
      data-phase={phase}
      data-country={countryId}
      style={{
        '--orb-primary': palette.primary,
        '--orb-secondary': palette.secondary,
        '--orb-accent': palette.accent,
        '--orb-core': palette.core,
        '--orb-glow': palette.glow,
      } as React.CSSProperties}
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={active}
      aria-busy={connecting}
      aria-label={actionLabel}
      title={status}
    >
      <span className="dialect-orb__floor" aria-hidden="true" />
      <span className="dialect-orb__aura" aria-hidden="true" />
      <span className="dialect-orb__sphere" aria-hidden="true">
        <span className="dialect-orb__atmosphere" />
        <svg className="dialect-orb__waves" viewBox="0 0 100 100" focusable="false">
          <defs>
            <clipPath id={clipId}><circle cx="50" cy="50" r="48" /></clipPath>
            <linearGradient id={warmId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={palette.accent} />
              <stop offset="22%" stopColor={palette.secondary} />
              <stop offset="50%" stopColor={palette.primary} />
              <stop offset="78%" stopColor={palette.secondary} />
              <stop offset="100%" stopColor={palette.accent} />
            </linearGradient>
            <linearGradient id={coolId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={palette.primary} />
              <stop offset="31%" stopColor={palette.accent} />
              <stop offset="67%" stopColor={palette.secondary} />
              <stop offset="100%" stopColor={palette.primary} />
            </linearGradient>
            <linearGradient id={sheenId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity=".88" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            <g className="dialect-orb__ribbon-a">
              <path
                d="M-14 67 C16 56 19 21 43 26 C67 31 78 75 114 33"
                fill="none" stroke={`url(#${warmId})`} strokeWidth="24"
                strokeLinecap="round" opacity=".89"
              />
              <path
                d="M-12 54 C18 44 23 14 46 24 C69 35 81 73 112 29"
                fill="none" stroke={`url(#${sheenId})`} strokeWidth="1.8"
                strokeLinecap="round" opacity=".85"
              />
            </g>
            <g className="dialect-orb__ribbon-b">
              <path
                d="M-14 39 C15 58 24 90 50 77 C76 64 80 24 114 44"
                fill="none" stroke={`url(#${coolId})`} strokeWidth="22"
                strokeLinecap="round" opacity=".86"
              />
              <path
                d="M-12 30 C17 48 26 81 52 68 C78 53 87 16 114 36"
                fill="none" stroke={palette.accent} strokeWidth="1.6"
                strokeLinecap="round" opacity=".75"
              />
            </g>
          </g>
        </svg>
        <span className="dialect-orb__luster" />
        <span className="dialect-orb__contour" />
      </span>
      <span className="sr-only" role="status" aria-live="polite">{status}</span>
    </button>
  );
};
