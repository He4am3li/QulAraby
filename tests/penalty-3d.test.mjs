import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

// The arena is served directly from /public and is NOT transpiled by Vite.
// Always syntax-check it explicitly during builds so the preview is never a
// successful deployment containing a broken Three.js scene.
execFileSync(process.execPath,['--check','public/penalty-3d-engine.js'],{stdio:'pipe'});
const scene=readFileSync('public/penalty-3d-engine.js','utf8');
const platform=readFileSync('components/games/PenaltyShootout.tsx','utf8');
const adapter=readFileSync('components/games/PenaltyLive3D.tsx','utf8');
const preview=readFileSync('public/penalty-preview.html','utf8');
for(const [name,rx] of [
 ['perspective camera',/PerspectiveCamera/],
 ['WebGL renderer',/WebGLRenderer/],
 ['3D net',/new THREE\.LineSegments/],
 ['physical goal posts',/CylinderGeometry/],
 ['football ball mesh',/IcosahedronGeometry/],
 ['articulated humanoid rig',/SkeletonUtils\.clone/],
 ['responsive canvas',/ResizeObserver/],
 ['orbit camera control',/pointermove/],
 ['resource cleanup',/renderer\.dispose/]
]) assert.match(scene,rx,name+' is missing');
assert.doesNotMatch(platform,/<video|PPT_READY_SCENE|PPT_GOAL_VIDEO|PPT_SAVE_VIDEO|stadiumPanorama|goalkeeperReadyImg/, 'Legacy static footage in React match');
assert.match(platform,/<PenaltyLive3D phase=\{phase\}/, 'Match does not render WebGL scene');
assert.match(adapter,/import \* as THREE from 'three'/,'App must bundle three locally');
assert.match(scene,/MODEL_URL='\/penalty-models\/player\.glb'/,'Rigged athlete must be bundled locally to avoid network failure');
assert.match(preview,/createPenalty3D/,'Preview must use the exact same simulation');
assert.doesNotMatch(preview,/<img\b|<video\b|penalty-cinematic/, 'Preview contains still images or video');
console.log('Penalty WebGL arena syntax, real 3D scene, zero still images, app integration: PASS');