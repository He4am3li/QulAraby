import React from 'react';

/**
 * Approved Salman artwork, reconstructed from the original 42 PSD layers.
 * The isolated iframe preserves the original artwork and avoids applying
 * 3D transforms to the clothing or exposing neck and shoulder seams.
 *
 * QUL's parent page controls animation state. The iframe must not speak
 * autonomously, since voice is already managed by the dialect conversation.
 */
type SalmanReaction = 'idle' | 'greeting' | 'correct' | 'retry';

interface SalmanLayeredAvatarProps {
  isSpeaking?: boolean;
  isListening?: boolean;
  isLoading?: boolean;
  reaction?: SalmanReaction;
  view?: 'portrait' | 'full';
  className?: string;
}

export const SalmanLayeredAvatar: React.FC<SalmanLayeredAvatarProps> = ({
  isSpeaking = false,
  isListening = false,
  isLoading = false,
  reaction = 'idle',
  view = 'portrait',
  className = ''
}) => {
  const frameRef = React.useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = React.useState(false);

  // Speech and listening take priority. No entire-body bounces or tilts.
  const state = isSpeaking
    ? 'speaking'
    : isListening
      ? 'listening'
      : isLoading
        ? 'thinking'
        : reaction;

  const sendState = React.useCallback(() => {
    const target = frameRef.current?.contentWindow;
    if (!target) return;
    target.postMessage({ type: 'qul:salman-state', state, speaking: isSpeaking }, window.location.origin);
  }, [state, isSpeaking]);

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.type !== 'qul:salman-ready') return;
      setReady(true);
      sendState();
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [sendState]);

  React.useEffect(() => {
    if (ready) sendState();
  }, [ready, sendState]);

  return (
    <div className={`relative overflow-hidden ${className}`} role="img" aria-label="سلمان، معلم اللهجة السعودية، شخصية تفاعلية بتعبيرات الوجه الأصلية">
      <iframe
        ref={frameRef}
        src={`/avatars/salman-layered.html?embed=1&view=${view}`}
        title="سلمان، معلم اللهجة السعودية"
        loading="lazy"
        scrolling="no"
        tabIndex={-1}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full border-0 bg-transparent pointer-events-none"
        style={{ border: 0, background: 'transparent', colorScheme: 'light' }}
      />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <span className="w-5 h-5 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
        </div>
      )}
    </div>
  );
};
