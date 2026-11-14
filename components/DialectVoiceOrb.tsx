import React from 'react';
import './DialectVoiceOrb.css';
import { getDialectFlagOrbPalette } from '../services/dialectFlagOrbPalette.mjs';
import { DialectFlagGlassArt } from './DialectFlagGlassArt';

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
  const lensId = `qul-voice-lens-${uniqueId}`;
  const edgeId = `qul-voice-edge-${uniqueId}`;

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
            <clipPath id={clipId}><circle cx="50" cy="50" r="48.2" /></clipPath>
            <linearGradient id={lensId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity=".39"/>
              <stop offset="24%" stopColor="#FFFFFF" stopOpacity=".03"/>
              <stop offset="62%" stopColor="#FFFFFF" stopOpacity="0"/>
              <stop offset="100%" stopColor="#D3F4FF" stopOpacity=".17"/>
            </linearGradient>
            <radialGradient id={edgeId} cx="46%" cy="43%" r="68%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0"/>
              <stop offset="53%" stopColor="#DDF5FF" stopOpacity="0"/>
              <stop offset="78%" stopColor="#123246" stopOpacity=".13"/>
              <stop offset="100%" stopColor="#081824" stopOpacity=".68"/>
            </radialGradient>
          </defs>
          <g clipPath={'url(#' + clipId + ')'}>
            {/* The flag IS the optical surface, never a rectangular badge. */}
            <g className="dialect-orb__flag-surface">
              <DialectFlagGlassArt countryId={countryId} />
            </g>
            {/* Refraction follows the curved glass boundary, not the flag edges. */}
            <circle cx="50" cy="50" r="49" fill={'url(#' + edgeId + ')'} />
            <circle cx="50" cy="50" r="49" fill={'url(#' + lensId + ')'} />
            <path d="M8 39 C15 15 37 5 55 8"
              fill="none" stroke="#FFFFFF" strokeWidth="2.7" strokeLinecap="round" opacity=".5"/>
            <path d="M89 46 C96 60 90 78 78 88"
              fill="none" stroke="#E2FAFF" strokeWidth="1.9" strokeLinecap="round" opacity=".33"/>
          </g>
        </svg>
        <span className="dialect-orb__luster" />
        <span className="dialect-orb__contour" />
      </span>
      <span className="sr-only" role="status" aria-live="polite">{status}</span>
    </button>
  );
};
