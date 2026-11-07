/**
 * QUL Penalty Arena, real-time WebGL 3D, no photographs, video clips or image backgrounds.
 * Dynamic rigged player source: Quaternius Animated Men, CC0 1.0.
 * https://github.com/kendrekaran/striker-3d/tree/main/assets
 * Original rig is externally hosted by its public GitHub repository.
 */
export function createPenalty3D({ host, THREE, GLTFLoader, SkeletonUtils, onReady, onError }) {
  if (!host) throw new Error('The 3D arena needs a host element');
  let disposed = false, frame = 0, last = 0;
  const mobile = (host.clientWidth || innerWidth) < 720;
  const clock = new THREE.Clock();
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050d1b);
  scene.fog = new THREE.FogExp2(0x050d1b, 0.008);
  const camera = new THREE.PerspectiveCamera(mobile ? 61 : 52, 1, 0.1, 250);
  camera.position.set(0, 3.6, 19.8);
  camera.lookAt(0, 1.5, 0);
  const renderer = new THREE.WebGLRenderer({
    antialias: !mobile, alpha: false, powerPreference: 'high-performance'
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.65;
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

  const hemi = new THREE.HemisphereLight(0xc5e9ff, 0x193a24, 2.25);
  scene.add(hemi);
  const moon = new THREE.DirectionalLight(0xe7f1ff, 2.8);
  moon.position.set(-13, 35, 21); moon.castShadow = !mobile;
  if (!mobile) {
    moon.shadow.mapSize.set(1024,1024);
    moon.shadow.camera.left=-25; moon.shadow.camera.right=25;
    moon.shadow.camera.top=27; moon.shadow.camera.bottom=-27;
    moon.shadow.camera.near=1; moon.shadow.camera.far=105;
    moon.shadow.bias = -0.0006;
  }
  scene.add(moon);
  const lamp2 = new THREE.DirectionalLight(0x8ebedb, 1.6);
  lamp2.position.set(18, 25, -18); scene.add(lamp2);

  const material = (hex, metalness=0, roughness=0.78) =>
    new THREE.MeshStandardMaterial({color:hex, metalness, roughness});
  const turf = material(0x164d2b, 0, 0.96);
  const white = material(0xeef4ef, 0.22, 0.34);
  const black = material(0x18232b, 0.1, 0.68);
  const steel = material(0x8195a6, 0.55, 0.38);
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(130, 110), turf);
  grass.rotation.x = -Math.PI/2; grass.receiveShadow = true; scene.add(grass);
  // Actual individual 3D turf lanes, not an image/texture.
  for (let i = 0; i < 17; i++) {
    const lane = new THREE.Mesh(new THREE.PlaneGeometry(94, 3.8),
      material(i % 2 ? 0x165328 : 0x206334, 0, 1));
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
  const turfBladeCount=mobile?9500:30000;
  const turfBlades=new THREE.InstancedMesh(turfBladeGeometry,turfBladeMaterial,turfBladeCount);
  const grassDummy=new THREE.Object3D();
  const turfColor=new THREE.Color();
  let turfSeed=246813579;
  function turfRandom(){turfSeed^=turfSeed<<13;turfSeed^=turfSeed>>>17;turfSeed^=turfSeed<<5;return (turfSeed>>>0)/4294967296;}
  const bladePalette=[0x1f6533,0x2d773a,0x326f38,0x215a33,0x3a8642,0x34783b,0x285c30,0x498d47];
  for(let i=0;i<turfBladeCount;i++){
    const x=(turfRandom()-.5)*51,z=(turfRandom()-.5)*76;
    grassDummy.position.set(x,0.015,z);
    grassDummy.rotation.set((turfRandom()-.5)*.22,turfRandom()*Math.PI*2,(turfRandom()-.5)*.24);
    grassDummy.scale.set(.62+turfRandom()*.65,.4+turfRandom()*.64,.62+turfRandom()*.65);
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
  const seatingMat=material(0x172a43,0.15,0.95);
  for(let tier=0;tier<4;tier++) {
    const r=46+tier*3.5, y=4+tier*2.5;
    const ring=new THREE.Mesh(new THREE.CylinderGeometry(r+2,r,2.1,96,1,true),
      material(tier%2?0x20334d:0x14273e,0.1,0.85));
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

  const roofMat=material(0x142132,0.48,0.42);
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
          vec2 kitUV=vec2(.5+qulGarmentPosition.x*44.,.5+(qulGarmentPosition.z-.033)*70.);
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
  function fetchAthlete(url,canRetry) {
    new GLTFLoader().load(url, (gltf)=>{
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
      onReady?.({rigged:true, animations:gltf.animations.length});
    },undefined,(err)=>{
      if(canRetry){fetchAthlete(CDN_MODEL,false);return;}
      // Do not show a primitive replacement when the licensed rig fails.
      onReady?.({rigged:false,animations:0});
      onError?.(err);
    });
  }
  try{fetchAthlete(MODEL_URL,true);}catch(err){
    try{fetchAthlete(CDN_MODEL,false);}catch(second){onReady?.({rigged:false,animations:0});onError?.(second);}
  }

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

  const shot={phase:'idle',side:'left',started:0,targetX:2.1};
  function reset(){
    strikerRoot.position.set(-0.72,0,10.75);strikerRoot.rotation.set(0,Math.PI,0);
    keeperRoot.position.set(0,0,0.36);keeperRoot.rotation.set(0,0,0);
    ball.position.set(0,0.22,8.3);ball.rotation.set(0,0,0);
    ball.visible=true;ballShadow.visible=true;ballShadow.position.set(0,0.05,8.3);
    net.geometry.attributes.position.array.set(netRest);
    net.geometry.attributes.position.needsUpdate=true;
    actors.forEach(a=>{a.active='';setAction(a,'idle');});
  }
  function setPhase(phase='idle',side='left') {
    shot.phase=phase;shot.side=side;shot.started=clock.getElapsedTime();
    if(phase==='idle')reset();
    if(phase==='runup'){
      reset();shot.started=clock.getElapsedTime();
      shot.targetX=(side==='left'?-2.15:2.15);
      setAction(actors[0],'run');
    }
    if(phase==='kick'){
      shot.started=clock.getElapsedTime();
      setAction(actors[0],'kick');
      setAction(actors[1],'dive');
    }
    if(phase==='goal'){shot.started=clock.getElapsedTime();setAction(actors[0],'celebrate');}
    if(phase==='miss'){shot.started=clock.getElapsedTime();setAction(actors[1],'celebrate');}
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
      const t=clamp((shot.phase==='kick'?time:time+0.94)/1.05);
      // Shooting at the top corner of the goal, a proper airborne curve.
      ball.position.set(mix(0,shot.targetX,t),0.22+1.48*t+Math.sin(t*Math.PI)*0.64,mix(8.3,-1.45,t));
      ball.rotation.set(10*t,8*t,4*t);
      ballShadow.position.set(ball.position.x,0.052,ball.position.z);
      ballShadow.material.opacity=0.25*(1-t*0.78);
      const dive=clamp((t-0.34)/0.48);
      keeperRoot.position.x=mix(0,shot.phase==='miss'?shot.targetX:shot.targetX>0?-1.45:1.45,ease(dive));
      keeperRoot.position.y=mix(0,0.48,Math.sin(dive*Math.PI));
      keeperRoot.rotation.z=(shot.targetX>0?-1:1)*1.2*ease(dive);
      if(shot.phase==='miss'){
        ball.position.z=Math.max(ball.position.z,0.15);
        if(t>0.85){ball.position.y=1.4+(t-0.85)*2.2;ball.position.x=shot.targetX*0.8;}
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
      const clipTime=shot.phase==='kick'?time:(shot.phase==='goal'||shot.phase==='miss'?time+0.94:0);
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
        const extension=diving?ease((clipTime-.1)/.47):0;
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
    animateSupporters(elapsed,crowdEmotion);
    // Always a true perspective camera, lightly tracking the foot-to-ball action.
    camera.position.x=mix(camera.position.x,Math.sin(cameraYaw)*19.8,0.08);
    camera.position.y=mix(camera.position.y,shot.phase==='focus'?2.8:shot.phase==='kick'?2.2:3.45,0.065);
    const cinemaDistance=shot.phase==='focus'?15.0:shot.phase==='runup'?17.7:shot.phase==='kick'?14.8:19.1;
    camera.position.z=mix(camera.position.z,Math.cos(cameraYaw)*cinemaDistance,0.07);
    camera.lookAt(0,1.42,shot.phase==='focus'?4.3:shot.phase==='kick'?2.2:-0.3);
  }
  function resize(){
    if(disposed)return;
    const w=Math.max(200,host.clientWidth||innerWidth),h=Math.max(180,host.clientHeight||innerHeight);
    camera.aspect=w/h;
    camera.fov=w<620?63:52;
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