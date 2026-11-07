import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

type ShotPhase = 'idle' | 'focus' | 'runup' | 'kick' | 'goal' | 'miss';

interface Props {
  phase?: ShotPhase;
  diveSide?: 'left' | 'right';
  className?: string;
  kitColor?: string;
}

/**
 * True real-time Three.js rendering, with shared live engine also used by the
 * public preview. No static photos, posters, sprite sheets or video textures.
 */
export const PenaltyLive3D: React.FC<Props> = ({
  phase = 'idle', diveSide = 'left', className = '', kitColor='#1366b2'
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const arenaRef = useRef<{ setPhase: (phase: ShotPhase, side: 'left'|'right') => void; setKitColor: (color: string) => void; dispose: () => void } | null>(null);
  const latestRef = useRef({ phase, diveSide, kitColor });
  latestRef.current = { phase, diveSide, kitColor };

  useEffect(() => {
    let canceled = false;
    // Keep the live engine in /public so the standalone educational preview and
    // the platform use exactly the same physical simulation and 3D geometry.
    const enginePath: string = '/penalty-3d-engine.js';
    void import(/* @vite-ignore */ enginePath).then((mod) => {
      if (canceled || !hostRef.current) return;
      const engine = mod.createPenalty3D({
        host: hostRef.current, THREE, GLTFLoader, SkeletonUtils,
        onError: (reason: unknown) => console.warn('[Penalty3D] External CC0 athlete failed to load; 3D rig fallback active', reason)
      });
      arenaRef.current = engine;
      engine.setKitColor(latestRef.current.kitColor);
      engine.setPhase(latestRef.current.phase, latestRef.current.diveSide);
    }).catch((reason: unknown) => {
      console.error('[Penalty3D] Scene initialization failed', reason);
    });
    return () => {
      canceled = true;
      arenaRef.current?.dispose();
      arenaRef.current = null;
    };
  }, []);

  useEffect(() => {
    arenaRef.current?.setPhase(phase, diveSide);
  }, [phase, diveSide]);

  useEffect(() => { arenaRef.current?.setKitColor(kitColor); },[kitColor]);

  return <div
    ref={hostRef}
    className={'absolute inset-0 overflow-hidden bg-[#071a20] ' + className}
    role="img"
    aria-label="ملعب كرة قدم حقيقي ثلاثي الأبعاد، لاعب متحرك وحارس مرمى ومرمى وكرة تفاعلية"
  />;
};