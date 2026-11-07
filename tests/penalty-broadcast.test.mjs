import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const arena=readFileSync('public/penalty-3d-engine.js','utf8');
const game=readFileSync('components/games/PenaltyShootout.tsx','utf8');
execFileSync(process.execPath,['--check','public/penalty-3d-engine.js'],{stdio:'pipe'});

const expected=[
  ['Correct back-of-shirt texture orientation',/kitUV=vec2\(\.5-qulGarmentPosition\.x\*44\./],
  ['Lettering tied to skinned torso',/varying vec3 qulGarmentPosition/],
  ['Human-geometry supporters',/function installHumanCrowd\(gltf\)/],
  ['Use locally bundled human GLB',/SkeletonUtils\.clone\(gltf\.scene\)/],
  ['Baked human skinned meshes',/skinned\.applyBoneTransform\(i,tmp\)/],
  ['Near spectators with mesh materials',/new THREE\.InstancedMesh\(g,m,supporters\.length\)/],
  ['Crowd standing and clapping poses',/find\(a=>\/clapping\|jump\/i\.test\(a\.name\)\)/],
  ['Goal and missed-kick reaction',/humanCrowd\.update\(elapsed,crowdEmotion\)/],
  ['Crowd scene cleanup',/humanCrowd\?\.dispose\(\)/],
  ['LED signage for the game',/QUL  PENALTY  ELITE/],
  ['Authentic saturated pitch lanes',/0x277b3b\s*:\s*0x1f7135/],
  ['Colour contrasted from warm rim and cool floodlights',/const cinemaRim = new THREE\.DirectionalLight/],
  ['Soft stadium depth fog',/scene\.fog = new THREE\.FogExp2\(0x071e22, 0\.0039\)/]
];
for(const [description,rule] of expected)assert.match(arena,rule,description);
assert.doesNotMatch(arena,/kitUV=vec2\(\.5\+qulGarmentPosition\.x\*44\./,'Legacy mirrored-print UV must never reappear');
assert.match(game,/from-\[#020b18\]\/35/,'Avoid dark overlay that hides the new turf');
assert.match(arena,/onReady\?\.\(\{rigged:true/,'Maintain rig readiness and do not show temporary mannequins');
assert.match(arena,/catch\(crowdError\)/,'A spectator model error must not disable penalty gameplay');
console.log('QUL cinematic stadium: normal-orientation jersey lettering, filmic turf & lighting, GLB humanoid supporters PASS');
