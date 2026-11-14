/**
 * QUL Penalty Arena, real-time WebGL 3D, no photographs, video clips or image backgrounds.
 * Dynamic rigged player source: Quaternius Animated Men, CC0 1.0.
 * https://github.com/kendrekaran/striker-3d/tree/main/assets
 * Original rig is externally hosted by its public GitHub repository.
 */
let warmedFootballer=null;
/**
 * Parse the rig while students choose teams; reuse the GLTF for striker, keeper
 * and crowd instead of requesting and parsing it again after match entry.
 */
export function warmPenaltyAthlete(GLTFLoader){
  if(!warmedFootballer){
    warmedFootballer=new Promise((resolve,reject)=>{
      const loader=new GLTFLoader();
      loader.load('/penalty-models/player.glb',resolve,undefined,()=>{
        loader.load('https://cdn.jsdelivr.net/gh/kendrekaran/striker-3d@main/assets/player.glb',resolve,undefined,reject);
      });
    }).catch(err=>{warmedFootballer=null;throw err;});
  }
  return warmedFootballer;
}

export function createPenalty3D({ host, THREE, GLTFLoader, SkeletonUtils, onReady, onError }) {
  if (!host) throw new Error('The 3D arena needs a host element');
  let disposed = false, frame = 0, last = 0;
  const mobile = (host.clientWidth || innerWidth) < 720;
  const clock = new THREE.Clock();
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x030b17);
  scene.fog = new THREE.FogExp2(0x071e22, 0.0039);
  const camera = new THREE.PerspectiveCamera(mobile ? 61 : 52, 1, 0.1, 250);
  camera.position.set(0, 3.6, 19.8);
  camera.lookAt(0, 1.5, 0);
  const renderer = new THREE.WebGLRenderer({
    antialias: !mobile, alpha: false, powerPreference: 'high-performance'
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.24;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.15 : 1.5));
  renderer.shadowMap.enabled = !mobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;touch-action:pan-y';
  renderer.domElement.setAttribute('aria-label', 'ملعب كرة قدم ثلاثي الأبعاد تفاعلي');
  host.appendChild(renderer.domElement);
  // Drag the actual WebGL camera to inspect the scene's 3D depth.
  let cameraYaw = 0, dragging = false, dragX = 0;
  renderer.domElement.style.cursor = 'grab';
  function onPointerDown(event) {
    dragging = true; dragX = event.clientX;
    renderer.domElement.style.cursor = 'grabbing';
    renderer.domElement.setPointerCapture?.(event.pointerId);
  }
  function onPointerMove(event) {
    if (!dragging) return;
    cameraYaw = Math.max(-0.65, Math.min(0.65, cameraYaw - (event.clientX - dragX) * 0.004));
    dragX = event.clientX;
  }
  function onPointerUp() {
    dragging = false; renderer.domElement.style.cursor = 'grab';
  }
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerup', onPointerUp);
  renderer.domElement.addEventListener('pointercancel', onPointerUp);

  const hemi = new THREE.HemisphereLight(0xdcefff, 0x206a3d, 1.68);
  scene.add(hemi);
  const moon = new THREE.DirectionalLight(0xf7fbff, 3.35);
  moon.position.set(-13, 35, 21); moon.castShadow = !mobile;
  if (!mobile) {
    moon.shadow.mapSize.set(1024,1024);
    moon.shadow.camera.left=-25; moon.shadow.camera.right=25;
    moon.shadow.camera.top=27; moon.shadow.camera.bottom=-27;
    moon.shadow.camera.near=1; moon.shadow.camera.far=105;
    moon.shadow.bias = -0.0006;
  }
  scene.add(moon);
  const lamp2 = new THREE.DirectionalLight(0x5bbefd, 2.25);
  lamp2.position.set(18, 25, -18); scene.add(lamp2);
  // The rear amber key light contrasts with the cool broadcast floodlights.
  const cinemaRim = new THREE.DirectionalLight(0xffd492,2.1);
  cinemaRim.position.set(4,15,-16);scene.add(cinemaRim);
  // Give dark, muted scenes a touch of warm stadium light without flattening skin tones.
  const fieldFill = new THREE.DirectionalLight(0xe5ffdf,.85);
  fieldFill.position.set(0,18,7);scene.add(fieldFill);

  const material = (hex, metalness=0, roughness=0.78) =>
    new THREE.MeshStandardMaterial({color:hex, metalness, roughness});
  // Small deterministic grass-fibre albedo texture avoids large flat polygons.
  const turfCanvas=document.createElement('canvas');
  turfCanvas.width=256;turfCanvas.height=256;
  const turfCtx=turfCanvas.getContext('2d');
  let turfTexture=null;
  if(turfCtx){
    turfCtx.fillStyle='#205f30';turfCtx.fillRect(0,0,256,256);
    let seed=41397;
    const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296;};
    for(let i=0;i<12500;i++){
      const x=rand()*256,y=rand()*256;
      turfCtx.strokeStyle=rand()>.55?'rgba(100,159,77,.27)':'rgba(9,47,25,.30)';
      turfCtx.lineWidth=.4+rand()*.7;
      turfCtx.beginPath();turfCtx.moveTo(x,y);turfCtx.lineTo(x+(rand()-.5)*2,y+2+rand()*4);turfCtx.stroke();
    }
    turfTexture=new THREE.CanvasTexture(turfCanvas);
    turfTexture.wrapS=turfTexture.wrapT=THREE.RepeatWrapping;
    turfTexture.repeat.set(18,24);
    turfTexture.colorSpace=THREE.SRGBColorSpace;
    turfTexture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  }
  const turf = material(0x94bb91, 0, 0.95);
  if(turfTexture)turf.map=turfTexture;
  const white = material(0xeef4ef, 0.22, 0.34);
  const black = material(0x18232b, 0.1, 0.68);
  const steel = material(0x8195a6, 0.55, 0.38);
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(130, 110), turf);
  grass.rotation.x = -Math.PI/2; grass.receiveShadow = true; scene.add(grass);
  // Share one repeated grass albedo across all mowing stripes to avoid GPU uploads.
  const laneTexture=turfTexture?.clone();
  if(laneTexture){laneTexture.repeat.set(18,2);laneTexture.needsUpdate=true;}
  for (let i = 0; i < 17; i++) {
    const laneMaterial=material(i % 2 ? 0xa1c49d : 0x8eb58c, 0, .96);
    if(laneTexture)laneMaterial.map=laneTexture;
    const lane = new THREE.Mesh(new THREE.PlaneGeometry(94, 3.8),laneMaterial);
    lane.rotation.x = -Math.PI/2; lane.position.set(0, 0.008 + i*0.0001, -30 + i*3.8);
    lane.receiveShadow=true; scene.add(lane);
  }
  // Real instanced 3D turf, not a flat green plane. Two intersecting blades per tuft.
  // A single draw call keeps the detail usable on mobile GPUs.
  const turfBladeGeometry=new THREE.BufferGeometry();
  turfBladeGeometry.setAttribute('position',new THREE.Float32BufferAttribute([
    -0.018,0,0, 0,0.15,0.014, 0.018,0,0,
    0,0,-0.018, 0,0.15,0.014, 0,0,0.018
  ],3));
  turfBladeGeometry.computeVertexNormals();
  const turfBladeMaterial=new THREE.MeshLambertMaterial({color:0xffffff,side:THREE.DoubleSide});
  const turfBladeCount=mobile?2400:6500;
  const turfBlades=new THREE.InstancedMesh(turfBladeGeometry,turfBladeMaterial,turfBladeCount);
  const grassDummy=new THREE.Object3D();
  const turfColor=new THREE.Color();
  let turfSeed=246813579;
  function turfRandom(){turfSeed^=turfSeed<<13;turfSeed^=turfSeed>>>17;turfSeed^=turfSeed<<5;return (turfSeed>>>0)/4294967296;}
  const bladePalette=[0x338847,0x2b7a3c,0x358e47,0x24773b,0x4c9b52,0x3b8d43,0x2f803b,0x55a556];
  for(let i=0;i<turfBladeCount;i++){
    const x=(turfRandom()-.5)*51,z=(turfRandom()-.5)*76;
    grassDummy.position.set(x,0.015,z);
    grassDummy.rotation.set((turfRandom()-.5)*.22,turfRandom()*Math.PI*2,(turfRandom()-.5)*.24);
    grassDummy.scale.set(.20+turfRandom()*.20,.12+turfRandom()*.18,.20+turfRandom()*.20);
    grassDummy.updateMatrix();
    turfBlades.setMatrixAt(i,grassDummy.matrix);
    turfColor.setHex(bladePalette[Math.floor(turfRandom()*bladePalette.length)]);
    turfBlades.setColorAt(i,turfColor);
  }
  turfBlades.instanceMatrix.needsUpdate=true;
  turfBlades.frustumCulled=false;
  turfBlades.castShadow=false;
  turfBlades.receiveShadow=false;
  scene.add(turfBlades);

  // Fine pitch lines with 3D geometry and depth testing.
  const stripeMat = new THREE.MeshBasicMaterial({color:0xc5eee1, transparent:true, opacity:0.89, depthWrite:false});
  function line(x1,z1,x2,z2,w=0.10) {
    const dx=x2-x1,dz=z2-z1, len=Math.sqrt(dx*dx+dz*dz);
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,0.015,len),stripeMat);
    mesh.position.set((x1+x2)/2,0.04,(z1+z2)/2);
    mesh.rotation.y=Math.atan2(dx,dz); scene.add(mesh);return mesh;
  }
  line(-24,-30,-24,34);line(24,-30,24,34);line(-24,-30,24,-30);line(-24,34,24,34);
  line(-20.16,0,-20.16,16.5);line(20.16,0,20.16,16.5);line(-20.16,16.5,20.16,16.5);
  line(-9.15,0,-9.15,5.5);line(9.15,0,9.15,5.5);line(-9.15,5.5,9.15,5.5);
  const penaltySpot = new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.12,0.02,24),stripeMat);
  penaltySpot.position.set(0,0.05,11);scene.add(penaltySpot);
  const arcPts=[];for(let a=0;a<=32;a++){let ang=-0.75+1.5*a/32;arcPts.push(new THREE.Vector3(Math.sin(ang)*9.15,0.06,11 + Math.cos(ang)*9.15));}
  const arc=new THREE.Line(new THREE.BufferGeometry().setFromPoints(arcPts),new THREE.LineBasicMaterial({color:0xbce0d0}));
  scene.add(arc);

  // Stadium bowl with volumetric seating, structural tiers and thousands of 3D spectators.
  const seatingMat=material(0x122237,0.15,0.88);
  for(let tier=0;tier<4;tier++) {
    const r=46+tier*3.5, y=4+tier*2.5;
    const ring=new THREE.Mesh(new THREE.CylinderGeometry(r+2,r,2.1,96,1,true),
      material(tier%2?0x233a55:0x102439,0.1,0.8));
    ring.position.set(0,y,0); ring.material.side=THREE.DoubleSide;
    scene.add(ring);
    const rail=new THREE.Mesh(new THREE.TorusGeometry(r+0.9,0.11,6,96),steel);
    rail.rotation.x=Math.PI/2;rail.position.y=y+1.1;scene.add(rail);
  }
  // Three-dimensional supporters, with separate bodies, heads and animated raised arms.
  // Unlike generic pills, they change pose together after a save or a goal.
  const spectatorCount=mobile?850:1950;
  const seatGeo=new THREE.CapsuleGeometry(.20,.36,2,5);
  const headGeo=new THREE.SphereGeometry(.17,7,5);
  const armGeo=new THREE.CapsuleGeometry(.062,.27,2,5);
  const audience=new THREE.InstancedMesh(seatGeo,material(0xffffff,0,.98),spectatorCount);
  const audienceHeads=new THREE.InstancedMesh(headGeo,material(0xffffff,0,.96),spectatorCount);
  const audienceLeftArms=new THREE.InstancedMesh(armGeo,material(0xffffff,0,.94),spectatorCount);
  const audienceRightArms=new THREE.InstancedMesh(armGeo,material(0xffffff,0,.94),spectatorCount);
  const spectatorDummy=new THREE.Object3D();
  const spectatorPositions=new Float32Array(spectatorCount*3);
  const palette=[0x254375,0xf0e4d0,0x2a86ba,0xc7344c,0x18734a,0xe9ad51,0x9873a5,0xdde6ed];
  const skins=[0xe4bc8f,0xb98963,0x8d6047,0xe5c3a1,0x624432];
  const spectatorColor=new THREE.Color();
  for(const mesh of [audience,audienceHeads,audienceLeftArms,audienceRightArms]){
    mesh.frustumCulled=false;mesh.castShadow=false;scene.add(mesh);
  }
  for(let i=0;i<spectatorCount;i++){
    const a=(i*2.399963229728653)%(Math.PI*2), tier=i%10, radius=46+tier/10*17;
    spectatorPositions[i*3]=Math.sin(a)*radius;
    spectatorPositions[i*3+1]=4.8+tier/10*10.2;
    spectatorPositions[i*3+2]=Math.cos(a)*radius;
    spectatorColor.setHex(palette[(i*7+Math.floor(i/19))%palette.length]);
    audience.setColorAt(i,spectatorColor);
    audienceLeftArms.setColorAt(i,spectatorColor);
    audienceRightArms.setColorAt(i,spectatorColor);
    spectatorColor.setHex(skins[(i*13+Math.floor(i/11))%skins.length]);
    audienceHeads.setColorAt(i,spectatorColor);
  }
  function animateSupporters(elapsed,reaction=0){
    const cheering=reaction>0.01;
    // Cheering animation is updated in batches, not 60 times per second.
    if(!cheering && Math.floor(elapsed*9)===lastSpectatorTick)return;
    if(cheering && Math.floor(elapsed*19)===lastSpectatorTick)return;
    lastSpectatorTick=Math.floor(elapsed*(cheering?19:9));
    const lift=Math.max(0,Math.min(1,reaction));
    for(let i=0;i<spectatorCount;i++){
      const x=spectatorPositions[i*3],y=spectatorPositions[i*3+1],z=spectatorPositions[i*3+2];
      const wave=Math.sin(elapsed*(lift>.25?10.5:1.5)+i*.64);
      const bounce=(.025+lift*.22)*(wave*.5+.5);
      spectatorDummy.rotation.set(0,Math.atan2(x,z)+Math.PI,0);
      spectatorDummy.position.set(x,y+bounce,z);
      spectatorDummy.scale.set(1,1,1);spectatorDummy.updateMatrix();audience.setMatrixAt(i,spectatorDummy.matrix);
      spectatorDummy.position.set(x,y+.58+bounce,z);
      spectatorDummy.scale.set(1,1,1);spectatorDummy.updateMatrix();audienceHeads.setMatrixAt(i,spectatorDummy.matrix);
      for(const sign of [-1,1]){
        const raised=lift>0.1?(Math.sin(i*.21+elapsed*7)>.1?1:0):0;
        spectatorDummy.position.set(x+sign*(.27+raised*.06),y+.17+raised*.32+bounce,z);
        spectatorDummy.rotation.set(0,Math.atan2(x,z)+Math.PI,sign*(.20+raised*1.55));
        spectatorDummy.scale.set(1,1,1);spectatorDummy.updateMatrix();
        (sign<0?audienceLeftArms:audienceRightArms).setMatrixAt(i,spectatorDummy.matrix);
      }
    }
    for(const mesh of [audience,audienceHeads,audienceLeftArms,audienceRightArms])mesh.instanceMatrix.needsUpdate=true;
  }
  let lastSpectatorTick=-1;
  animateSupporters(0,0);

  // Densely populated far stands: a one-time baked human crowd mural fills the
  // gaps between the actual animated 3D supporters. The mural is only used at
  // a distance and never replaces the players, keeper or near spectators.
  const crowdCanvas=document.createElement('canvas');
  crowdCanvas.width=1024;crowdCanvas.height=512;
  const crowdCtx=crowdCanvas.getContext('2d');
  if(crowdCtx){
    crowdCtx.fillStyle='#142438';crowdCtx.fillRect(0,0,1024,512);
    let crowdSeed=8247021;
    const rnd=()=>{crowdSeed=(Math.imul(crowdSeed,1664525)+1013904223)|0;return(crowdSeed>>>0)/4294967296;};
    const jerseys=['#e2e7e4','#f8d36d','#b53f55','#2585a7','#227047','#8c99bc','#f1aa69','#c8d7da','#344f87'];
    const skinTones=['#edc8a2','#d0a27c','#ad7659','#875338','#e4bb93'];
    for(let row=0;row<38;row++){
      const cy=10+row*13.05;
      crowdCtx.fillStyle=row%2?'#172b43':'#203349';
      crowdCtx.fillRect(0,cy+8,1024,4);
      for(let col=0;col<126;col++){
        const x=(col+.46)*8.16+(rnd()-.5)*1.65;
        const y=cy+(rnd()-.5)*2.2;
        const jersey=jerseys[Math.floor(rnd()*jerseys.length)];
        crowdCtx.fillStyle=jersey;
        crowdCtx.fillRect(x-2.7,y+3,5.4,5.8);
        crowdCtx.fillStyle=skinTones[Math.floor(rnd()*skinTones.length)];
        crowdCtx.beginPath();crowdCtx.ellipse(x,y+1.3,1.95,2.35,0,0,Math.PI*2);crowdCtx.fill();
        if(rnd()>.91){
          crowdCtx.strokeStyle=jersey;crowdCtx.lineWidth=1.65;
          crowdCtx.beginPath();crowdCtx.moveTo(x-2,y+4);crowdCtx.lineTo(x-4.4,y-.6);
          crowdCtx.moveTo(x+2,y+4);crowdCtx.lineTo(x+4.2,y-.6);crowdCtx.stroke();
        }
      }
    }
  }
  const crowdMuralTexture=new THREE.CanvasTexture(crowdCanvas);
  crowdMuralTexture.colorSpace=THREE.SRGBColorSpace;
  crowdMuralTexture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
  const crowdMuralMaterial=new THREE.MeshBasicMaterial({
    map:crowdMuralTexture,side:THREE.DoubleSide,toneMapped:false
  });
  const endStand=new THREE.Mesh(new THREE.PlaneGeometry(56,14),crowdMuralMaterial);
  endStand.position.set(0,10.6,-25.2);scene.add(endStand);
  for(const side of [-1,1]){
    const sideStand=new THREE.Mesh(new THREE.PlaneGeometry(34,12),crowdMuralMaterial);
    sideStand.position.set(side*29.3,9.4,2.6);
    sideStand.rotation.y=-side*Math.PI/2;
    scene.add(sideStand);
  }
  // The near stands reuse the locally bundled, rigged CC0 human model instead of
  // capsules or head-and-box silhouettes. Two animations are baked to instanced
  // *human geometry* once, leaving ordinary WebGL draw calls during gameplay.
  let humanCrowd=null;
  function installHumanCrowd(gltf){
    const columns=mobile?27:48, rows=mobile?8:11;
    const supporters=[];
    let random=15262107;
    const jitter=()=>{random^=random<<13;random^=random>>>17;random^=random<<5;return(random>>>0)/4294967296;};
    for(let row=0;row<rows;row++){
      for(let col=0;col<columns;col++){
        supporters.push({
          x:(col-(columns-1)/2)*1.19+(jitter()-.5)*.19,
          y:3.25+row*.72+(jitter()-.5)*.08,
          z:-8.8-row*.95+(jitter()-.5)*.19,
          yaw:Math.PI+(jitter()-.5)*.22,
          scale:.90+jitter()*.20,
          phase:jitter()*Math.PI*2,
          shirt:Math.floor(jitter()*10),skin:Math.floor(jitter()*6),
          hair:Math.floor(jitter()*6)
        });
      }
    }
    // Side terraces put full humanoid spectators in view instead of distant dots.
    for(const side of [-1,1])for(let row=0;row<(mobile?5:7);row++){
      const sideZ=1.0+row*1.2;
      const step=new THREE.Mesh(new THREE.BoxGeometry(1.5,.46,31),material(0x182c42,.03,.9));
      step.position.set(side*(26.2+row*1.25),2.75+row*.75,sideZ);scene.add(step);
      for(let col=0;col<25;col++)supporters.push({
        x:side*(26.2+row*1.25)+(jitter()-.5)*.15,
        y:3.12+row*.75+(jitter()-.5)*.06,
        z:-11+col*1.12+(jitter()-.5)*.2,
        yaw:side>0?-Math.PI/2:Math.PI/2,
        scale:.91+jitter()*.16,phase:jitter()*Math.PI*2,
        shirt:Math.floor(jitter()*10),skin:Math.floor(jitter()*6),hair:Math.floor(jitter()*6)
      });
    }
    const crowdShirts=[0x245b93,0xdbc29a,0xe6e6e2,0xa83b49,0x1a7d68,0x364c7e,0x756793,0xc99247,0x26364c,0x9d565d];
    const crowdSkins=[0xe6bf98,0xc6976e,0xa66f4b,0x764e36,0xe8c7a9,0x5a3928];
    const crowdHair=[0x241d1d,0x745036,0x332623,0xd4b882,0x13151a,0x916c51];
    const stepMat=material(0x14283a,.04,.91);
    const stepLights=new THREE.MeshBasicMaterial({color:0x33778c,toneMapped:false});
    for(let row=0;row<rows;row++){
      const baseZ=-8.8-row*.95;
      const steps=new THREE.Mesh(new THREE.BoxGeometry(columns*1.23,.40,1.55),stepMat);
      steps.position.set(0,2.72+row*.72,baseZ);scene.add(steps);
      if(row%3===0){
        const lightStrip=new THREE.Mesh(new THREE.BoxGeometry(columns*1.23,.065,.085),stepLights);
        lightStrip.position.set(0,2.97+row*.72,baseZ+.74);scene.add(lightStrip);
      }
    }
    const normalClip=gltf.animations.find(a=>/standing|idle/i.test(a.name))||gltf.animations[0];
    const celebrateClip=gltf.animations.find(a=>/clapping|jump/i.test(a.name))||normalClip;
    function bakeHuman(clip,seconds){
      const human=SkeletonUtils.clone(gltf.scene);
      const skinned=human.getObjectByName('BaseHuman');
      if(!skinned?.isSkinnedMesh || !skinned.geometry?.groups?.length || !skinned.applyBoneTransform)return null;
      const mixer=new THREE.AnimationMixer(human);
      const action=mixer.clipAction(clip);
      action.play();mixer.setTime(seconds);
      human.updateMatrixWorld(true);
      skinned.skeleton.update();
      const original=skinned.geometry;
      const pos=original.getAttribute('position');
      const baked=new Float32Array(pos.count*3);
      const tmp=new THREE.Vector3();
      let minX=Infinity,minY=Infinity,minZ=Infinity,maxX=-Infinity,maxY=-Infinity,maxZ=-Infinity;
      for(let i=0;i<pos.count;i++){
        tmp.fromBufferAttribute(pos,i);
        skinned.applyBoneTransform(i,tmp).applyMatrix4(skinned.matrixWorld);
        baked[i*3]=tmp.x;baked[i*3+1]=tmp.y;baked[i*3+2]=tmp.z;
        minX=Math.min(minX,tmp.x);maxX=Math.max(maxX,tmp.x);
        minY=Math.min(minY,tmp.y);maxY=Math.max(maxY,tmp.y);
        minZ=Math.min(minZ,tmp.z);maxZ=Math.max(maxZ,tmp.z);
      }
      if(!Number.isFinite(minY)||maxY-minY<.1)return null;
      const scale=1.79/(maxY-minY);
      const centerX=(minX+maxX)*.5,centerZ=(minZ+maxZ)*.5;
      for(let i=0;i<pos.count;i++){
        baked[i*3]=(baked[i*3]-centerX)*scale;
        baked[i*3+1]=(baked[i*3+1]-minY)*scale;
        baked[i*3+2]=(baked[i*3+2]-centerZ)*scale;
      }
      const bakedGeo=original.clone();
      bakedGeo.setAttribute('position',new THREE.BufferAttribute(baked,3));
      bakedGeo.deleteAttribute('skinIndex');bakedGeo.deleteAttribute('skinWeight');
      bakedGeo.computeVertexNormals();
      const instances=[];
      const indices=bakedGeo.getIndex();
      const mats=Array.isArray(skinned.material)?skinned.material:[skinned.material];
      for(const group of original.groups){
        const originalMat=mats[group.materialIndex];
        const name=originalMat?.name||'Skin';
        const g=bakedGeo.clone();
        const subIndex=new Uint16Array(group.count);
        for(let k=0;k<group.count;k++)subIndex[k]=indices.getX(group.start+k);
        g.setIndex(new THREE.BufferAttribute(subIndex,1));
        g.clearGroups();g.computeBoundingSphere();
        const m=new THREE.MeshStandardMaterial({
          color:0xffffff,roughness:.88,metalness:0,side:THREE.FrontSide
        });
        const inst=new THREE.InstancedMesh(g,m,supporters.length);
        inst.frustumCulled=false;inst.castShadow=false;inst.receiveShadow=false;
        inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        scene.add(inst);
        instances.push({mesh:inst,name});
      }
      mixer.stopAllAction();
      return instances;
    }
    const neutral=bakeHuman(normalClip,.23);
    const celebrating=bakeHuman(celebrateClip,.68);
    if(!neutral || !celebrating){
      for(const group of [neutral,celebrating])for(const o of group||[]){
        scene.remove(o.mesh);o.mesh.geometry.dispose();o.mesh.material.dispose();
      }
      return null;
    }
    const variants=[neutral,celebrating];
    const scratch=new THREE.Object3D(),color=new THREE.Color();
    let lastTick=-1,lastMode=-1;
    const chooseColor=(name,p)=>{
      if(name==='Shirt'||name==='Shirt2')return crowdShirts[p.shirt];
      if(name==='Pants')return crowdShirts[(p.shirt+5)%crowdShirts.length];
      if(name==='Skin')return crowdSkins[p.skin];
      if(name==='Hair'||name==='Hair2')return crowdHair[p.hair];
      if(name==='Eyes')return 0xf4f0e9;
      if(name==='Socks')return 0x59677a;
      return 0x1d2631;
    };
    for(const variant of variants)for(const item of variant){
      for(let i=0;i<supporters.length;i++){
        color.setHex(chooseColor(item.name,supporters[i]));
        item.mesh.setColorAt(i,color);
      }
      item.mesh.instanceColor.needsUpdate=true;
    }
    function update(elapsed,reaction){
      const cheering=reaction>.14;
      const mode=cheering?1:0;
      const tick=Math.floor(elapsed*(cheering?7:2));
      if(tick===lastTick&&mode===lastMode)return;
      lastTick=tick;lastMode=mode;
      for(let v=0;v<variants.length;v++){
        // A save or goal does not make all supporters perform the same animation.
        const visible=cheering||v===0;
        for(const entry of variants[v])entry.mesh.visible=visible;
        if(!visible)continue;
        for(let i=0;i<supporters.length;i++){
          const p=supporters[i];
          const personalCheer=cheering&&Math.sin(elapsed*2.4+p.phase)>-.38;
          const bounce=personalCheer?(Math.sin(elapsed*(7.5+p.scale)+p.phase)*.5+.5)*.17:(Math.sin(elapsed*1.3+p.phase)*.5+.5)*.014;
          scratch.position.set(p.x,p.y+bounce,p.z);
          scratch.rotation.set(0,p.yaw,personalCheer?Math.sin(elapsed*4+p.phase)*.09:0);
          // Hide the non-selected pose of each individual without extra geometry.
          scratch.scale.setScalar((personalCheer?1:0)===v?p.scale:0.00001);
          scratch.updateMatrix();
          for(const entry of variants[v])entry.mesh.setMatrixAt(i,scratch.matrix);
        }
        for(const entry of variants[v])entry.mesh.instanceMatrix.needsUpdate=true;
      }
    }
    update(0,0);
    return {update,dispose(){
      for(const variant of variants)for(const item of variant){
        scene.remove(item.mesh);item.mesh.geometry.dispose();item.mesh.material.dispose();
      }
    }};
  }


  const roofMat=material(0x102339,0.48,0.42);
  const roof=new THREE.Mesh(new THREE.TorusGeometry(62.5,2.2,8,100),roofMat);
  roof.rotation.x=Math.PI/2;roof.position.y=17.5;scene.add(roof);
  const upperRoof = new THREE.Mesh(new THREE.TorusGeometry(55.5,0.45,6,100),steel);
  upperRoof.rotation.x=Math.PI/2;upperRoof.position.y=21;scene.add(upperRoof);
  for(let n=0;n<16;n++){
    const a=n*Math.PI/8;
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.13,10,6),steel);
    beam.position.set(Math.sin(a)*59,19,Math.cos(a)*59);
    beam.rotation.z=Math.cos(a)*0.45;beam.rotation.x=-Math.sin(a)*0.45;scene.add(beam);
  }
  function makeFloodlights(angle) {
    const x=Math.sin(angle)*50,z=Math.cos(angle)*50;
    const stand=new THREE.Mesh(new THREE.CylinderGeometry(0.45,0.63,29,9),steel);
    stand.position.set(x,14.5,z);scene.add(stand);
    const panel=new THREE.Mesh(new THREE.BoxGeometry(9,4.4,0.46),material(0x29394d,0.5,0.45));
    panel.position.set(x,29.5,z);panel.rotation.y=angle;scene.add(panel);
    const bulbMat=new THREE.MeshBasicMaterial({color:0xe2f3ff});
    for(let row=0;row<2;row++)for(let j=0;j<5;j++){
      const bulb=new THREE.Mesh(new THREE.BoxGeometry(1.3,1.1,0.08),bulbMat);
      bulb.position.set(x+(j-2)*1.58*Math.cos(angle),28.65+row*1.54,z-(j-2)*1.58*Math.sin(angle));
      bulb.rotation.y=angle;scene.add(bulb);
    }
    const point=new THREE.PointLight(0xb9e6ff,105,80,2);
    point.position.set(x,29,z);scene.add(point);
  }
  makeFloodlights(-Math.PI/3);makeFloodlights(Math.PI/3);
  makeFloodlights(Math.PI+Math.PI/3);makeFloodlights(Math.PI-Math.PI/3);
  // Broadcast-grade LED boards and floodlight halos: unlit emissive artwork,
  // not additional real-time shadow-casting lights.
  const ledPanels=[];
  // Brand-specific editorial LED boards, built locally to avoid external ads or UI assets.
  const ledCanvas=document.createElement('canvas');
  ledCanvas.width=1024;ledCanvas.height=128;
  const ledCtx=ledCanvas.getContext('2d');
  if(ledCtx){
    const grad=ledCtx.createLinearGradient(0,0,1024,128);
    grad.addColorStop(0,'#062b3a');grad.addColorStop(.5,'#0d7891');grad.addColorStop(1,'#062b3a');
    ledCtx.fillStyle=grad;ledCtx.fillRect(0,0,1024,128);
    ledCtx.fillStyle='#f9e2ad';ledCtx.fillRect(18,12,6,103);ledCtx.fillRect(1000,12,6,103);
    ledCtx.fillStyle='#f2f8fb';ledCtx.font='900 54px Arial,sans-serif';
    ledCtx.textAlign='center';ledCtx.textBaseline='middle';
    ledCtx.fillText('QUL  PENALTY  ELITE',512,67);
  }
  const ledTexture=new THREE.CanvasTexture(ledCanvas);
  ledTexture.colorSpace=THREE.SRGBColorSpace;
  const ledSurface=new THREE.MeshBasicMaterial({color:0x0b3444,toneMapped:false});
  const ledBroadcast=new THREE.MeshBasicMaterial({
    map:ledTexture,side:THREE.DoubleSide,toneMapped:false
  });
  const ledTrim=new THREE.MeshBasicMaterial({color:0xf4dd95,toneMapped:false});
  for(const [x,z,w,rot] of [[0,-9.3,32,0],[-19,-4.5,15,Math.PI*.47],[19,-4.5,15,-Math.PI*.47]]){
    const board=new THREE.Mesh(new THREE.BoxGeometry(w,1,.12),ledSurface);
    board.position.set(x,1.05,z);board.rotation.y=rot;scene.add(board);ledPanels.push(board);
    const trim=new THREE.Mesh(new THREE.BoxGeometry(w,.075,.15),ledTrim);
    trim.position.set(x,1.56,z);trim.rotation.y=rot;scene.add(trim);
  }
  const ledTitle=new THREE.Mesh(new THREE.PlaneGeometry(31,.85),ledBroadcast);
  ledTitle.position.set(0,1.05,-9.21);scene.add(ledTitle);
  const lampGlowMaterial=new THREE.MeshBasicMaterial({
    color:0xd0eeff,transparent:true,opacity:.11,depthWrite:false,
    blending:THREE.AdditiveBlending,side:THREE.DoubleSide
  });
  for(const [x,z] of [[-43,25],[43,25],[-43,-38],[43,-38]]){
    const halo=new THREE.Mesh(new THREE.SphereGeometry(3.8,12,8),lampGlowMaterial);
    halo.position.set(x,28,z);scene.add(halo);
  }

  // Full 3D goal, pipes, depth and a physical net composed of tensioned line segments.
  function post(a,b,r=0.065) {
    const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b);
    const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,start.distanceTo(end),12),white);
    mesh.position.copy(start).add(end).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),end.sub(start).normalize());
    mesh.castShadow=true;scene.add(mesh);return mesh;
  }
  const W=3.66,H=2.44,back=-2;
  post([-W,0,0],[-W,H,0]);post([W,0,0],[W,H,0]);
  post([-W,H,0],[W,H,0]);post([-W,H,0],[-W,H,back],0.043);
  post([W,H,0],[W,H,back],0.043);
  post([-W,H,back],[W,H,back],0.043);
  post([-W,0,back],[-W,H,back],0.038);post([W,0,back],[W,H,back],0.038);
  const netLines=[];
  const NL=0.26;
  // vertical and horizontal across rear net
  for(let x=-W;x<=W+0.001;x+=NL) netLines.push(x,0,back, x,H,back);
  for(let y=0;y<=H+0.001;y+=NL) netLines.push(-W,y,back, W,y,back);
  // net side panels
  for(const side of [-W,W]){
    for(let y=0;y<=H+0.001;y+=NL)netLines.push(side,y,0,side,y,back);
    for(let z=0;z>=back-0.001;z-=NL)netLines.push(side,0,z,side,H,z);
  }
  // roof of net
  for(let x=-W;x<=W+0.001;x+=NL)netLines.push(x,H,0,x,H,back);
  for(let z=0;z>=back-0.001;z-=NL)netLines.push(-W,H,z,W,H,z);
  const netGeometry=new THREE.BufferGeometry();
  netGeometry.setAttribute('position', new THREE.Float32BufferAttribute(netLines,3));
  const net=new THREE.LineSegments(netGeometry, new THREE.LineBasicMaterial({
    color:0xd4ecfc, transparent:true,opacity:0.43
  }));
  scene.add(net);const netRest=Float32Array.from(netLines);

  // A true 3D football with panels and depth; never a flat ball image.
  const ball=new THREE.Group();
  const ballWhite=material(0xe8f0ed,0,0.31),ballDark=material(0x15202a,0,0.38);
  const shell=new THREE.Mesh(new THREE.IcosahedronGeometry(0.22,2),ballWhite);
  shell.castShadow=true;ball.add(shell);
  for(let i=0;i<12;i++){
    const k=i/12*Math.PI*2,theta=Math.acos(1-2*(i+0.5)/12);
    const patch=new THREE.Mesh(new THREE.CircleGeometry(0.062,5),ballDark);
    const normal=new THREE.Vector3(Math.sin(theta)*Math.cos(k),Math.cos(theta),Math.sin(theta)*Math.sin(k));
    patch.position.copy(normal).multiplyScalar(0.222);
    patch.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal);
    ball.add(patch);
  }
  ball.position.set(0,0.22,8.3);scene.add(ball);
  const ballShadow=new THREE.Mesh(new THREE.CircleGeometry(0.32,20),
    new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.24,depthWrite:false}));
  ballShadow.rotation.x=-Math.PI/2;ballShadow.position.set(0,0.047,8.3);scene.add(ballShadow);

  let shooterUniform='#1366b2', keeperUniform='#b7f02f';
  let shooterSecondary='#eff4f5',keeperSecondary='#202e30';
  let shooterNumber=9,keeperNumber=1;
  let shooterName='',keeperName='',shooterClubId='',keeperClubId='';
  let shooterAccent='#f5f5f5',keeperAccent='#f7f7f7';
  const shooterShirtMaterials=[],keeperShirtMaterials=[];
  const shooterShortsMaterials=[],keeperShortsMaterials=[];
  const shooterSocksMaterials=[],keeperSocksMaterials=[];
  // Lettering is projected in the material shader using the garment's bind-pose
  // coordinates. Since the shirt itself is skinned, the name follows every torso
  // rotation and never floats as a separate rectangle in 3D space.
  const shirtLettering=[];
  const sportsShorts=[];
  const safeColor=(value,fallback)=>typeof value==='string'&&/^#[0-9a-fA-F]{6}$/.test(value)?value:fallback;
  const setColor=(mats,color)=>mats.forEach(m=>m?.color?.set(color));

  const patternCode={barcelona:1,juventus:2,psg:3,arsenal:4,madrid:5,city:6,liverpool:7,chelsea:8,bayern:9,united:10};
  function addNumberPanels(actor){
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;
    const tex=new THREE.CanvasTexture(canvas);
    tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
    const entry={keeper:actor.keeper,canvas,texture:tex,
      uniformPattern:{value:patternCode[actor.keeper?keeperClubId:shooterClubId]||0},
      uniformStripe:{value:new THREE.Color(actor.keeper?keeperSecondary:shooterSecondary)},
      uniformAccent:{value:new THREE.Color(actor.keeper?keeperAccent:shooterAccent)}
    };
    shirtLettering.push(entry);
    const shirts=actor.keeper?keeperShirtMaterials:shooterShirtMaterials;
    for(const mat of shirts){
      mat.onBeforeCompile=(shader)=>{
        shader.uniforms.qulClothLettering={value:tex};
        shader.uniforms.qulPattern=entry.uniformPattern;
        shader.uniforms.qulStripe=entry.uniformStripe;
        shader.uniforms.qulAccent=entry.uniformAccent;
        shader.vertexShader=shader.vertexShader
          .replace('#include <common>','#include <common>\nvarying vec3 qulGarmentPosition;')
          .replace('#include <begin_vertex>','#include <begin_vertex>\nqulGarmentPosition = position;');
        shader.fragmentShader=shader.fragmentShader
          .replace('#include <common>','#include <common>\nvarying vec3 qulGarmentPosition;\nuniform sampler2D qulClothLettering;\nuniform float qulPattern;\nuniform vec3 qulStripe;\nuniform vec3 qulAccent;')
          .replace('#include <color_fragment>',String.raw`#include <color_fragment>
          // Club-colour patterns stay attached to the animated shirt mesh.
          float columnStripe=step(.48,fract((qulGarmentPosition.x+.012)*170.));
          if(qulPattern<2.5 && qulPattern>.5){
            diffuseColor.rgb=mix(diffuseColor.rgb,qulStripe,columnStripe*.90);
          }
          if(qulPattern>2.5 && qulPattern<3.5){
            float center=1.-smoothstep(.0025,.0045,abs(qulGarmentPosition.x));
            diffuseColor.rgb=mix(diffuseColor.rgb,qulStripe,center*.90);
          }
          if(qulPattern>3.5 && qulPattern<4.5){
            float sleeves=smoothstep(.007,.0095,abs(qulGarmentPosition.x));
            diffuseColor.rgb=mix(diffuseColor.rgb,qulStripe,sleeves*.9);
          }
          if(qulPattern>4.5 && qulPattern<5.5){
            float piping=1.-smoothstep(.0005,.0013,abs(abs(qulGarmentPosition.x)-.0091));
            diffuseColor.rgb=mix(diffuseColor.rgb,qulAccent,piping*.55);
          }
          if(qulPattern>5.5 && qulPattern<10.5){
            float subtleLine=1.-smoothstep(.0001,.0007,abs(fract((qulGarmentPosition.x+qulGarmentPosition.z*.3)*140.)-.5)*.008);
            diffuseColor.rgb=mix(diffuseColor.rgb,qulAccent,subtleLine*.07);
          }
          vec2 kitUV=vec2(.5-qulGarmentPosition.x*44.,.5+(qulGarmentPosition.z-.033)*70.);
          float inBounds=step(0.,kitUV.x)*step(kitUV.x,1.)*step(0.,kitUV.y)*step(kitUV.y,1.);
          float onBack=smoothstep(.0003,.0028,qulGarmentPosition.y);
          vec4 printed=texture2D(qulClothLettering,clamp(kitUV,0.,1.));
          diffuseColor.rgb=mix(diffuseColor.rgb,printed.rgb,printed.a*onBack*inBounds);`);
      };
      mat.customProgramCacheKey=()=> 'qul-skinned-jersey-lettering-v3';
      mat.needsUpdate=true;
    }
  }
  function drawNumbers(){
    for(const d of shirtLettering){
      const ctx=d.canvas.getContext('2d');if(!ctx)continue;
      ctx.clearRect(0,0,512,512);
      const number=d.keeper?keeperNumber:shooterNumber;
      const name=d.keeper?keeperName:shooterName;
      const primary=d.keeper?keeperUniform:shooterUniform;
      const r=parseInt(primary.slice(1,3),16),g=parseInt(primary.slice(3,5),16),b=parseInt(primary.slice(5,7),16);
      const ink=(r*.2126+g*.7152+b*.0722)>145?'#15213a':'#fcfcf4';
      ctx.fillStyle=ink;ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.font='900 52px Arial';
      const label=String(name).toUpperCase().split(' ').slice(-1).join(' ').slice(0,14);
      ctx.fillText(label,256,138,456);
      ctx.font='900 253px Arial';ctx.fillText(String(number),256,334,456);
      d.texture.needsUpdate=true;
    }
  }
  function makeSportsShorts(keeper){
    const mat=material(0xffffff,0,.91);
    const uniforms={
      colorShorts:{value:new THREE.Color(keeper?keeperSecondary:shooterSecondary)},
      colorSocks:{value:new THREE.Color(keeper?keeperUniform:shooterUniform)},
      colorSkin:{value:new THREE.Color(keeper?0xad805d:0xb88661)},
      colorHem:{value:new THREE.Color(keeper?keeperUniform:shooterUniform)}
    };
    sportsShorts.push({keeper,uniforms,material:mat});
    mat.onBeforeCompile=(shader)=>{
      Object.assign(shader.uniforms,{
        qulColorShorts:uniforms.colorShorts,
        qulColorSocks:uniforms.colorSocks,
        qulColorSkin:uniforms.colorSkin,
        qulColorHem:uniforms.colorHem
      });
      shader.vertexShader=shader.vertexShader
        .replace('#include <common>','#include <common>\nvarying float qulLegHeight;')
        .replace('#include <begin_vertex>','#include <begin_vertex>\nqulLegHeight = position.z;');
      shader.fragmentShader=shader.fragmentShader
        .replace('#include <common>','#include <common>\nvarying float qulLegHeight;\nuniform vec3 qulColorShorts;\nuniform vec3 qulColorSocks;\nuniform vec3 qulColorSkin;\nuniform vec3 qulColorHem;')
        .replace('#include <color_fragment>',String.raw`#include <color_fragment>
        // Existing rig includes full trousers. Reveal skinned thighs and socks
        // using stable garment-local height so athletic shorts follow the legs.
        float shortsRegion=smoothstep(.0178,.0194,qulLegHeight);
        float sockRegion=1.-smoothstep(.0088,.0104,qulLegHeight);
        vec3 sportsKit=mix(qulColorSkin,qulColorShorts,shortsRegion);
        sportsKit=mix(sportsKit,qulColorSocks,sockRegion);
        float shortsHem=1.-smoothstep(.00008,.00048,abs(qulLegHeight-.0186));
        sportsKit=mix(sportsKit,qulColorHem,shortsHem*.50);
        float sockTrim=1.-smoothstep(.00006,.00042,abs(qulLegHeight-.0096));
        sportsKit=mix(sportsKit,qulColorShorts,sockTrim*.6);
        diffuseColor.rgb *= sportsKit;`);
    };
    mat.customProgramCacheKey=()=> 'qul-football-shorts-skin-socks-v3';
    mat.needsUpdate=true;return mat;
  }
  function setKit(options={}){
    shooterUniform=safeColor(options.shooterPrimary,shooterUniform);
    shooterSecondary=safeColor(options.shooterSecondary,shooterSecondary);
    keeperUniform=safeColor(options.keeperPrimary,keeperUniform);
    keeperSecondary=safeColor(options.keeperSecondary,keeperSecondary);
    shooterNumber=Number.isInteger(options.shooterNumber)?options.shooterNumber:shooterNumber;
    keeperNumber=Number.isInteger(options.keeperNumber)?options.keeperNumber:keeperNumber;
    shooterName=String(options.shooterName??shooterName);
    keeperName=String(options.keeperName??keeperName);
    shooterClubId=String(options.shooterClubId??shooterClubId);
    keeperClubId=String(options.keeperClubId??keeperClubId);
    shooterAccent=safeColor(options.shooterAccent,shooterAccent);
    keeperAccent=safeColor(options.keeperAccent,keeperAccent);
    setColor(shooterShirtMaterials,shooterUniform);
    setColor(keeperShirtMaterials,keeperUniform);
    setColor(shooterShortsMaterials,shooterSecondary);
    setColor(keeperShortsMaterials,keeperSecondary);
    setColor(shooterSocksMaterials,shooterUniform);
    setColor(keeperSocksMaterials,keeperUniform);
    for(const s of shirtLettering){
      s.uniformPattern.value=patternCode[s.keeper?keeperClubId:shooterClubId]||0;
      s.uniformStripe.value.set(s.keeper?keeperSecondary:shooterSecondary);
      s.uniformAccent.value.set(s.keeper?keeperAccent:shooterAccent);
    }
    for(const s of sportsShorts){
      s.uniforms.colorShorts.value.set(s.keeper?keeperSecondary:shooterSecondary);
      s.uniforms.colorSocks.value.set(s.keeper?keeperUniform:shooterUniform);
      s.uniforms.colorHem.value.set(s.keeper?keeperUniform:shooterUniform);
    }
    drawNumbers();
  }
  const strikerRoot=new THREE.Group();strikerRoot.position.set(-0.72,0,10.75);
  strikerRoot.rotation.y=Math.PI;scene.add(strikerRoot);
  const keeperRoot=new THREE.Group();keeperRoot.position.set(0,0,0.36);
  scene.add(keeperRoot);
  const actors = [
    {root:strikerRoot, keeper:false, mixer:null, actions:{}, active:'',bones:null},
    {root:keeperRoot, keeper:true, mixer:null, actions:{}, active:'',bones:null}
  ];
  // The cinematic curtain remains until both skinned GLB athletes are loaded.
  // No primitive mannequins are constructed or drawn.
  const MODEL_URL='/penalty-models/player.glb';
  const CDN_MODEL='https://cdn.jsdelivr.net/gh/kendrekaran/striker-3d@main/assets/player.glb';
  function fetchAthlete() {
    warmPenaltyAthlete(GLTFLoader).then((gltf)=>{
      if(disposed)return;
      const base=gltf.scene,skinnedBox=new THREE.Box3(),tmp=new THREE.Box3();
      base.updateMatrixWorld(true);
      base.traverse((m)=>{
        if(m.isSkinnedMesh && m.computeBoundingBox){
          m.computeBoundingBox();tmp.copy(m.boundingBox).applyMatrix4(m.matrixWorld);
          skinnedBox.union(tmp);
        }
      });
      if(skinnedBox.isEmpty())skinnedBox.setFromObject(base);
      const h=Math.max(0.1,skinnedBox.max.y-skinnedBox.min.y);
      const scale=2.18/h;
      for(const a of actors){
        const rig=SkeletonUtils.clone(base);
        rig.scale.multiplyScalar(scale);
        // Athletic but natural body proportions, with a slightly broader goalkeeper.
        rig.scale.x*=a.keeper?1.045:1.015;
        rig.scale.z*=a.keeper?1.015:1.005;
        rig.position.y=-skinnedBox.min.y*scale;
        rig.traverse((o)=>{
          if(!o.isMesh)return;
          o.castShadow=true;o.receiveShadow=true;
          const originalMaterials=Array.isArray(o.material)?o.material:[o.material];
          if(originalMaterials.some(m=>m?.name==='Pants') && o.geometry?.attributes?.position){
            // Preserve glTF bone weights but tailor trouser-width calves into fitted,
            // exposed athletic legs under the short hem.
            o.geometry=o.geometry.clone();
            const positions=o.geometry.attributes.position;
            for(let i=0;i<positions.count;i++){
              const z=positions.getZ(i);
              if(z>.0025 && z<.0187){
                const x=positions.getX(i),y=positions.getY(i);
                const center=Math.sign(x)*.00255;
                const taper=z<.011?.77:.85;
                positions.setX(i,center+(x-center)*taper);
                positions.setY(i,y*.87);
              }
            }
            positions.needsUpdate=true;
            o.geometry.computeVertexNormals();
          }
          const kit={
            Shirt:material(a.keeper?keeperUniform:shooterUniform,0.08,0.65),
            Shirt2:material(a.keeper?keeperUniform:shooterUniform,0,0.72),
            Pants:makeSportsShorts(a.keeper),
            Socks:material(a.keeper?keeperSecondary:shooterSecondary,0,0.72),
            Shoes:material(0x171e24,0.06,0.47)
          };
          const shirts=a.keeper?keeperShirtMaterials:shooterShirtMaterials;
          const shorts=a.keeper?keeperShortsMaterials:shooterShortsMaterials;
          const socks=a.keeper?keeperSocksMaterials:shooterSocksMaterials;
          shirts.push(kit.Shirt,kit.Shirt2);
          // The skinned pants shader handles shorts, bare knees and high socks.
          socks.push(kit.Socks);
          const replace=m=>kit[m.name]||m;
          o.material=Array.isArray(o.material)?o.material.map(replace):replace(o.material);
        });
        a.root.add(rig);
        if(a.keeper){
          // Gloves follow the real hand bones through the existing skin animation.
          const gloveMaterial=material(0xf5f0e4,0.04,.46);
          for(const name of ['Palm.L','Palm.R']){
            const hand=rig.getObjectByName(name);
            if(!hand?.isBone)continue;
            const glove=new THREE.Mesh(new THREE.BoxGeometry(.0033,.0031,.0032),gloveMaterial);
            glove.position.set(0,.0014,0);
            glove.castShadow=true;hand.add(glove);
          }
        }
        addNumberPanels(a);
        a.mixer=new THREE.AnimationMixer(rig);
        // Named thigh bone, after the animation mixer, receives the impact kick.
        // The upstream CC0 clip collection has no authored football kick clip.
        const bones={};
        for(const name of ['Torso','UpperLeg.R','LowerLeg.R','UpperLeg.L','LowerLeg.L','UpperArm.R','UpperArm.L','LowerArm.R','LowerArm.L']){
          const bone=rig.getObjectByName(name);
          if(bone?.isBone)bones[name]={bone,x:bone.rotation.x,y:bone.rotation.y,z:bone.rotation.z};
        }
        a.bones=bones;
        a.kickBone=bones['UpperLeg.R']?.bone||null;
        for(const clip of gltf.animations){
          const name=clip.name.replace(/^HumanArmature\|Man_/, '').toLowerCase();
          a.actions[name]=a.mixer.clipAction(clip);
        }
        setAction(a,'idle');
      }
      drawNumbers();
      // Install high-detail humanoid supporters only after the real rig is loaded.
      // A missing crowd pose must never block the goalkeeper or the match.
      try{
        humanCrowd=installHumanCrowd(gltf);
        if(humanCrowd){
          audience.visible=false;audienceHeads.visible=false;
          audienceLeftArms.visible=false;audienceRightArms.visible=false;
        }
      }catch(crowdError){
        console.warn('[QUL Arena] detailed crowd unavailable, using distant stands',crowdError);
      }
      onReady?.({rigged:true, animations:gltf.animations.length});
    }).catch((err)=>{
      // Do not show a primitive replacement when the licensed rig fails.
      onReady?.({rigged:false,animations:0});
      onError?.(err);
    });
  }
  fetchAthlete();

  function setAction(a, actionName) {
    if(a.active===actionName)return;
    const names=Object.keys(a.actions);
    const aliases={kick:'standing',celebrate:'clapping',dive:'jump'};
    const action=aliases[actionName]||actionName;
    let key=names.find(k=>k===action)
      || names.find(k=>k.includes(action))
      || names.find(k=>k.includes('idle'));
    if(!key)return;
    const next=a.actions[key];
    if(a.current && a.current!==next)a.current.fadeOut(0.14);
    next.reset().fadeIn(0.14).play();
    if(actionName==='kick' || actionName==='celebrate') {
      next.setLoop(THREE.LoopOnce,1);next.clampWhenFinished=true;
    } else {next.setLoop(THREE.LoopRepeat,Infinity);next.clampWhenFinished=false;}
    a.active=actionName;a.current=next;
  }

  const shot={phase:'idle',side:'left',started:0,targetX:2.1,targetY:1.65,power:0.75,scored:true,flightStart:0,flightOutcome:true};
  function reset(){
    strikerRoot.position.set(-0.72,0,10.75);strikerRoot.rotation.set(0,Math.PI,0);
    keeperRoot.position.set(0,0,0.36);keeperRoot.rotation.set(0,0,0);
    ball.position.set(0,0.22,8.3);ball.rotation.set(0,0,0);
    ball.visible=true;ballShadow.visible=true;ballShadow.position.set(0,0.05,8.3);
    net.geometry.attributes.position.array.set(netRest);
    net.geometry.attributes.position.needsUpdate=true;
    actors.forEach(a=>{a.active='';setAction(a,'idle');});
  }
  function setAim(x=0,y=0.5,power=0.75){
    shot.targetX=Math.max(-2.9,Math.min(2.9,x*2.9));
    shot.targetY=0.55+Math.max(0,Math.min(1,y))*1.95;
    shot.power=Math.max(0.25,Math.min(1,power));
  }
  function setOutcome(scored=true){shot.flightOutcome=Boolean(scored);}
  function setPhase(phase='idle',side='left') {
    shot.phase=phase;shot.side=side;shot.started=clock.getElapsedTime();
    if(phase==='idle')reset();
    if(phase==='runup'){
      reset();shot.started=clock.getElapsedTime();
      if(shot.autoAim)shot.targetX=(side==='left'?-2.15:2.15);
      setAction(actors[0],'run');
    }
    if(phase==='kick'){
      shot.started=clock.getElapsedTime();
      setAction(actors[0],'kick');
      shot.flightStart=shot.started;
      setAction(actors[1],'dive');
    }
    if(phase==='goal'){shot.started=clock.getElapsedTime();shot.scored=true;shot.flightOutcome=true;setAction(actors[0],'celebrate');}
    if(phase==='miss'){shot.started=clock.getElapsedTime();shot.scored=false;shot.flightOutcome=false;setAction(actors[1],'celebrate');}
  }
  function clamp(x){return Math.max(0,Math.min(1,x));}
  function mix(a,b,t){return a+(b-a)*t;}
  function ease(x){return 1-Math.pow(1-clamp(x),3);}
  function update(elapsed,dt){
    const time=elapsed-shot.started;
    const sway=Math.sin(elapsed*2.2)*0.035;
    if(shot.phase==='focus') {
      strikerRoot.position.y=Math.sin(elapsed*2.8)*0.026;
      strikerRoot.rotation.z=Math.sin(elapsed*0.85)*0.012;
      keeperRoot.position.x=Math.sin(elapsed*1.5)*0.09;
    }
    if(shot.phase==='idle') {
      strikerRoot.position.y=sway*0.45;
      keeperRoot.position.x=Math.sin(elapsed*1.4)*0.14;
      keeperRoot.position.y=Math.sin(elapsed*2.6)*0.028;
    }
    if(shot.phase==='runup'){
      const t=ease(time/0.85);
      strikerRoot.position.set(mix(-0.72,0.12,t),Math.sin(t*15)*0.035,mix(10.75,8.85,t));
      keeperRoot.position.x=Math.sin(elapsed*5.5)*0.15;
    }
    if(shot.phase==='kick' || shot.phase==='goal' || shot.phase==='miss'){
      const t=clamp((elapsed-shot.flightStart)/(1.25-shot.power*0.3));
      // Shooting at the top corner of the goal, a proper airborne curve.
      const save=!shot.flightOutcome;
      const ballT=save?Math.min(t,0.79):t;
      const targetZ=save?0.75:-1.45;
      ball.position.set(mix(0,shot.targetX,ballT),mix(0.22,shot.targetY,ballT)+Math.sin(ballT*Math.PI)*(.25+shot.power*.35),mix(8.3,targetZ,ballT));
      ball.rotation.set(10*t,8*t,4*t);
      ballShadow.position.set(ball.position.x,0.052,ball.position.z);
      ballShadow.material.opacity=0.25*(1-t*0.78);
      const dive=clamp((t-0.12)/0.65);
      keeperRoot.position.x=mix(0,save?shot.targetX*.79:shot.targetX>0?-1.55:1.55,ease(dive));
      keeperRoot.position.y=0.58*Math.sin(dive*Math.PI);
      keeperRoot.rotation.z=(shot.targetX>0?-1:1)*1.2*ease(dive);
      if(save){
        // The saved ball never crosses the goal line: it hits the keeper and rebounds into the field.
        if(t>0.79){
          const rebound=(t-0.79)/0.21;
          ball.position.z=0.75+rebound*2.9;
          ball.position.y=Math.max(0.22,shot.targetY*.79-rebound*.65);
          ball.position.x=shot.targetX*.79+rebound*.48;
        }
      }
      if(shot.phase==='goal'){
        const p=net.geometry.attributes.position;
        for(let i=0;i<p.count;i++){
          const z=netRest[i*3+2],x=netRest[i*3],y=netRest[i*3+1];
          if(z< -1.85 && Math.abs(x-shot.targetX)<1.2 && Math.abs(y-1.7)<1.1){
            p.setZ(i,z-0.34*Math.sin(Math.max(0,time)*10)*Math.exp(-time*2));
          }
        }
        p.needsUpdate=true;
        strikerRoot.rotation.y=Math.PI+Math.sin(time*3)*0.13;
      }
    }
    // All poses are evaluated from each clip's rest pose every frame.
    // The previous incremental rotation.x -= ... accumulated and broke limbs.
    for(const a of actors){
      if(!a.mixer)continue;
      a.mixer.update(dt);
      const b=a.bones;
      if(!b)continue;
      const get=name=>b[name]?.bone;
      const rest=name=>b[name];
      const clipTime=shot.phase==='kick'||shot.phase==='goal'||shot.phase==='miss'?elapsed-shot.flightStart:0;
      const power=Math.sin(Math.PI*clamp(clipTime/.68));
      if(!a.keeper){
        const thigh=get('UpperLeg.R'),shin=get('LowerLeg.R'),torso=get('Torso');
        if(shot.phase==='kick'||shot.phase==='goal'||shot.phase==='miss'){
          if(thigh)thigh.rotation.x=rest('UpperLeg.R').x-1.00*power;
          if(shin)shin.rotation.x=rest('LowerLeg.R').x+.62*power;
          if(torso)torso.rotation.z=rest('Torso').z-.12*power;
        }
      }else{
        const diving=shot.phase==='kick'||shot.phase==='goal'||shot.phase==='miss';
        const extension=diving?ease((clipTime-.08)/.45):0;
        for(const sign of ['L','R']){
          const arm=get('UpperArm.'+sign),forearm=get('LowerArm.'+sign);
          if(arm)arm.rotation.z=rest('UpperArm.'+sign).z+(sign==='L'?-1:1)*.78*extension;
          if(forearm)forearm.rotation.x=rest('LowerArm.'+sign).x-.18*extension;
        }
        const legL=get('UpperLeg.L'),legR=get('UpperLeg.R');
        if(legL)legL.rotation.x=rest('UpperLeg.L').x+.38*extension;
        if(legR)legR.rotation.x=rest('UpperLeg.R').x-.26*extension;
      }
    }
    const crowdEmotion=shot.phase==='goal'?Math.exp(-Math.max(0,time)*.22)
      :shot.phase==='miss'?.54*Math.exp(-Math.max(0,time)*.28):.035;
    if(humanCrowd)humanCrowd.update(elapsed,crowdEmotion);
    else animateSupporters(elapsed,crowdEmotion);
    // Always a true perspective camera, lightly tracking the foot-to-ball action.
    camera.position.x=mix(camera.position.x,Math.sin(cameraYaw)*19.8,0.08);
    camera.position.y=mix(camera.position.y,shot.phase==='focus'?3.4:shot.phase==='kick'?3.0:3.55,0.065);
    const cinemaDistance=shot.phase==='focus'?18.7:shot.phase==='runup'?19.4:shot.phase==='kick'?18.2:20.2;
    camera.position.z=mix(camera.position.z,Math.cos(cameraYaw)*cinemaDistance,0.07);
    camera.lookAt(-0.3,1.4,shot.phase==='focus'?4.25:shot.phase==='kick'?3.5:3.0);
  }
  function resize(){
    if(disposed)return;
    const w=Math.max(200,host.clientWidth||innerWidth),h=Math.max(180,host.clientHeight||innerHeight);
    camera.aspect=w/h;
    camera.fov=w<620?67:57;
    camera.updateProjectionMatrix();renderer.setSize(w,h,false);
  }
  let observer=null;
  if(typeof ResizeObserver!=='undefined'){
    observer=new ResizeObserver(resize);observer.observe(host);
  } else window.addEventListener('resize',resize);
  resize(); reset();
  function animate(){
    if(disposed)return;
    const dt=Math.min(clock.getDelta(),0.065);
    const elapsed=clock.elapsedTime;
    update(elapsed,dt);
    renderer.render(scene,camera);
    frame=requestAnimationFrame(animate);
  }
  frame=requestAnimationFrame(animate);
  return {
    setPhase,
    setAim,
    setOutcome,
    setKitColor(value){setKit({shooterPrimary:value});},
    setKit,
    reset,
    dispose(){
      if(disposed)return;
      disposed=true;cancelAnimationFrame(frame);
      observer?.disconnect();window.removeEventListener('resize',resize);
      renderer.domElement.removeEventListener('pointerdown',onPointerDown);
      renderer.domElement.removeEventListener('pointermove',onPointerMove);
      renderer.domElement.removeEventListener('pointerup',onPointerUp);
      renderer.domElement.removeEventListener('pointercancel',onPointerUp);
      actors.forEach(a=>a.mixer?.stopAllAction());
      shirtLettering.forEach(d=>d.texture.dispose());
      ledTexture.dispose();
      turfTexture?.dispose();laneTexture?.dispose();crowdMuralTexture.dispose();
      humanCrowd?.dispose();
      scene.traverse(o=>{
        if(o.geometry && o.geometry.dispose)o.geometry.dispose();
        if(o.material){
          const mats=Array.isArray(o.material)?o.material:[o.material];
          mats.forEach(m=>m?.dispose?.());
        }
      });
      renderer.dispose();renderer.domElement.remove();
    }
  };
}