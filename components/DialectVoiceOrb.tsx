import React from 'react';
import './DialectVoiceOrb.css';
import { getDialectFlagOrbPalette } from '../services/dialectFlagOrbPalette.mjs';
import { getDialectGlassFlagLights } from '../services/dialectOrbGlassIdentity.mjs';

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
 * Keep the microphone identity visible above glass and national light ribbons.
 * Only the INTERNAL colour fabrics flutter; the OUTER pulses stay independent.
 * Original microphone, conversation and screen-reader interactions are unchanged.
 */
export const DialectVoiceOrb: React.FC<Props> = ({
  countryId, active, connecting = false, listening, speaking, loading = false, disabled = false, lang, onToggle
}) => {
  const ar = lang === 'ar';
  const palette = getDialectFlagOrbPalette(countryId);
  const flag = getDialectGlassFlagLights(countryId);
  const uniqueId = React.useId().replace(/:/g, '');
  const clipId = 'qul-voice-clip-' + uniqueId;
  const topId = 'qul-voice-top-' + uniqueId;
  const midId = 'qul-voice-mid-' + uniqueId;
  const lowerId = 'qul-voice-bottom-' + uniqueId;
  const sideId = 'qul-voice-side-' + uniqueId;
  const glassId = 'qul-voice-glass-' + uniqueId;

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
      <span className="dialect-orb__pulse dialect-orb__pulse--one" aria-hidden="true" />
      <span className="dialect-orb__pulse dialect-orb__pulse--two" aria-hidden="true" />
      <span className="dialect-orb__pulse dialect-orb__pulse--three" aria-hidden="true" />
      <span className="dialect-orb__sphere" aria-hidden="true">
        <span className="dialect-orb__atmosphere" />
        <svg className="dialect-orb__waves" viewBox="0 0 100 100" focusable="false">
          <defs>
            <clipPath id={clipId}><circle cx="50" cy="50" r="48.2" /></clipPath>
            <linearGradient id={topId} x1="0%" y1="0%" x2="100%" y2="65%">
              <stop offset="0%" stopColor={flag.edge} stopOpacity=".38" />
              <stop offset="25%" stopColor={flag.top} stopOpacity=".96" />
              <stop offset="76%" stopColor={flag.top} stopOpacity=".91" />
              <stop offset="100%" stopColor={flag.middle} stopOpacity=".62" />
            </linearGradient>
            <linearGradient id={midId} x1="3%" y1="22%" x2="88%" y2="88%">
              <stop offset="0%" stopColor={flag.middle} stopOpacity=".35" />
              <stop offset="35%" stopColor={flag.middle} stopOpacity=".87" />
              <stop offset="73%" stopColor={flag.middle} stopOpacity=".57" />
              <stop offset="100%" stopColor={flag.top} stopOpacity=".32" />
            </linearGradient>
            <linearGradient id={lowerId} x1="3%" y1="95%" x2="95%" y2="3%">
              <stop offset="0%" stopColor={flag.bottom} stopOpacity=".96" />
              <stop offset="66%" stopColor={flag.bottom} stopOpacity=".89" />
              <stop offset="100%" stopColor={flag.middle} stopOpacity=".22" />
            </linearGradient>
            <linearGradient id={sideId} x1="0%" y1="30%" x2="100%" y2="55%">
              <stop offset="0%" stopColor={flag.edge} stopOpacity=".94" />
              <stop offset="55%" stopColor={flag.edge} stopOpacity=".78" />
              <stop offset="100%" stopColor={flag.top} stopOpacity=".04" />
            </linearGradient>
            <radialGradient id={glassId} cx="42%" cy="38%" r="69%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity=".12" />
              <stop offset="52%" stopColor="#FFFFFF" stopOpacity=".04" />
              <stop offset="74%" stopColor="#E9FCFF" stopOpacity=".14" />
              <stop offset="88%" stopColor="#152F48" stopOpacity=".31" />
              <stop offset="100%" stopColor="#0A172C" stopOpacity=".68" />
            </radialGradient>
          </defs>
          <g clipPath={'url(#' + clipId + ')'}>
            {/* Curved national optical light bands, never an inserted rectangular flag. */}
            <g className="dialect-orb__inner-light">
              <g className="dialect-orb__fabric dialect-orb__fabric--top">
                <path d="M-22 17 C7 -7 38 -1 65 12 C89 25 105 5 122 18 L123 48 C95 68 78 30 50 39 C23 47 5 38 -22 60Z"
                  fill={'url(#' + topId + ')'} />
              </g>
              <g className="dialect-orb__fabric dialect-orb__fabric--middle">
                <path d="M-21 45 C7 23 31 59 57 43 C85 29 103 41 121 38 L121 70 C88 65 70 72 49 65 C23 56 10 81 -21 77Z"
                  fill={'url(#' + midId + ')'} />
              </g>
              <g className="dialect-orb__fabric dialect-orb__fabric--bottom">
                <path d="M-19 77 C11 50 32 67 51 71 C78 79 104 55 121 57 L121 111 H-19Z"
                  fill={'url(#' + lowerId + ')'} />
              </g>
              <g className="dialect-orb__fabric dialect-orb__fabric--side">
                <path d="M-20 -10 C26 3 19 21 16 45 C14 70 37 91 12 112 L-22 111Z"
                  fill={'url(#' + sideId + ')'} />
              </g>
            </g>
            <circle cx="50" cy="50" r="49" fill={'url(#' + glassId + ')'} />
            <path d="M7 37 C13 16 31 7 54 8" stroke="#F1FFFF" strokeWidth="2.6"
              opacity=".55" fill="none" strokeLinecap="round" />
            <path d="M84 17 C94 24 96 37 96 47" stroke="#DFFFFF" strokeWidth="1.4"
              opacity=".37" fill="none" strokeLinecap="round" />
            <path d="M25 91 C46 104 74 98 85 82" stroke="#DBF9FF" strokeWidth="1.5"
              opacity=".27" fill="none" strokeLinecap="round" />
          </g>
        </svg>
        <span className="dialect-orb__luster" />
        <span className="dialect-orb__contour" />
        <svg className="dialect-orb__microphone" viewBox="0 0 48 48" focusable="false">
          <rect x="19" y="8" width="10" height="22" rx="5" fill="currentColor" />
          <path d="M14.5 23 V25.5 C14.5 38 33.5 38 33.5 25.5 V23" fill="none"
            stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M24 36 V42 M18 42 H30" fill="none" stroke="currentColor"
            strokeWidth="3" strokeLinecap="round" />
        </svg>
      </span>
      <span className="sr-only" role="status" aria-live="polite">{status}</span>
    </button>
  );
};
