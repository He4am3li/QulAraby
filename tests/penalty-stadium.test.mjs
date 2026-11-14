import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';

execFileSync(process.execPath,['--check','public/penalty-3d-engine.js'],{stdio:'pipe'});
const scene=readFileSync('public/penalty-3d-engine.js','utf8');
const platform=readFileSync('components/games/PenaltyShootout.tsx','utf8');
const adapter=readFileSync('components/games/PenaltyLive3D.tsx','utf8');

for(const [label,rx] of [
  ['Instanced three-dimensional grass',/new THREE\.InstancedMesh\(turfBladeGeometry,turfBladeMaterial,turfBladeCount\)/],
  ['Adaptive grass density',/turfBladeCount=mobile\?\d+:\d+/],
  ['Separate crowd bodies',/new THREE\.InstancedMesh\(seatGeo/],
  ['Separate spectator heads',/audienceHeads=new THREE\.InstancedMesh\(headGeo/],
  ['Animated fan arms',/audienceLeftArms=new THREE\.InstancedMesh/],
  ['Goal crowd celebration',/animateSupporters\(elapsed,crowdEmotion\)/],
  ['Skinned shirt names',/varying vec3 qulGarmentPosition/],
  ['No detached name labels',/const shirtLettering=\[\]/],
  ['Football shorts, exposed legs and tall socks',/float shortsRegion=smoothstep/],
  ['Sporty leg silhouette',/positions\.setX\(i,center/],
  ['Goalkeeper gloves skinned to hands',/rig\.getObjectByName\(name\)/],
  ['Goalkeeper arm extension',/const extension=diving\?/],
  ['Clip-assisted kicker action',/kick:'standing'/],
  ['Goalkeeper diving action',/dive:'jump'/],
  ['Club-specific animated shirt pattern',/qulPattern/],
  ['Defending keeper own strip and number',/keeperNumber=Number\.isInteger/],
  ['Mobile WebGL resource cleanup',/renderer\.dispose\(\)/]
])assert.match(scene,rx,label+' is missing');

assert.doesNotMatch(scene,/new THREE\.PlaneGeometry\(\.57,\.62\)/,'Floating player name planes must be removed');
assert.doesNotMatch(scene,/a\.kickBone\.rotation\.x-=impact/,'Kick animation must not accumulate bone rotations');
assert.doesNotMatch(scene,/function createFallback\(/,'Geometric primitive athletes must not return');
assert.match(platform,/shooterClubId:attackingClub\.id/,'Pass correct kicking team jersey');
assert.match(platform,/keeperClubId:defendingClub\.id/,'Pass defending goalkeeper jersey');
assert.match(platform,/shortsByClub/,'Shorts colour must not be copied blindly from badge palette');
assert.match(platform,/kit=\{stadiumKit\}/,'Jerseys must change with the next player');
assert.match(adapter,/shooterAccent\?:string/,'Adapter must accept club kit accent');
console.log('Penalty stadium: instanced blades, reacting supporters, athlete uniforms, jersey lettering and safer motion PASS');
