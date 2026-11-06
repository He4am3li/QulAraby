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
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.25 : 1.75));
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
  // The spectator geometry is instanced so it remains affordable on phones.
  const audienceCount=mobile?1700:3800;
  const seatGeo=new THREE.CapsuleGeometry(0.23,0.29,2,4);
  const audience=new THREE.InstancedMesh(seatGeo,seatingMat,audienceCount);
  const dummy=new THREE.Object3D();
  const palette=[0x233d65,0xbfc8e1,0x2772b2,0xf4cbd1,0x24774c,0xf0a65c,0xd94444,0x91a9c7];
  const col=new THREE.Color();
  for(let i=0;i<audienceCount;i++){
    const t=(i*2.399963229728653)% (Math.PI*2);
    const tier=i%10;const radius=46+(tier/10)*17;
    dummy.position.set(Math.sin(t)*radius, 4.8+(tier/10)*10.2, Math.cos(t)*radius);
    dummy.rotation.y=t;dummy.scale.set(0.85+((i*7)%5)*0.05,0.85+((i*13)%5)*0.06,0.95);
    dummy.updateMatrix();audience.setMatrixAt(i,dummy.matrix);
    col.setHex(palette[(i*7+Math.floor(i/19))%palette.length]);
    audience.setColorAt(i,col);
  }
  audience.instanceMatrix.needsUpdate=true;audience.frustumCulled=false;scene.add(audience);
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

  function createFallback(keeper) {
    // Fully articulated, rounded 3D athletes while the CC0 GLB rig loads.
    const root=new THREE.Group();
    const jersey=material(keeper?0xb7f02f:0x1366b2,0.08,0.62);
    const shorts=material(keeper?0x25422c:0xeff4f5,0,0.85);
    const socks=material(keeper?0xa4dd28:0x1b6bc9,0,0.73);
    const skin=material(0xb77d55,0,0.9),hair=material(0x241b19,0,0.98);
    function mesh(geometry,mat,parent,x,y,z) {
      const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);
      m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
    }
    mesh(new THREE.CapsuleGeometry(0.28,0.47,7,14),jersey,root,0,1.31,0);
    mesh(new THREE.SphereGeometry(0.18,12,12),skin,root,0,2.0,0);
    mesh(new THREE.SphereGeometry(0.185,12,12,0,Math.PI*2,0,Math.PI*0.48),hair,root,0,2.08,0);
    mesh(new THREE.CapsuleGeometry(0.275,0.06,4,10),shorts,root,0,0.88,0);
    const arms=[],legs=[];
    for(const sign of [-1,1]){
      const arm=new THREE.Group();arm.position.set(sign*0.32,1.65,0);root.add(arm);
      mesh(new THREE.CapsuleGeometry(0.095,0.36,5,9),jersey,arm,sign*0.04,-0.26,0);
      mesh(new THREE.CapsuleGeometry(0.07,0.21,5,9),skin,arm,sign*0.05,-0.65,0);
      if(keeper)mesh(new THREE.SphereGeometry(0.135,10,10),material(0x2a3034),arm,sign*0.05,-0.89,0.02);
      arms.push(arm);
      const leg=new THREE.Group();leg.position.set(sign*0.18,0.81,0);root.add(leg);
      mesh(new THREE.CapsuleGeometry(0.135,0.31,5,10),shorts,leg,0,-0.18,0);
      mesh(new THREE.CapsuleGeometry(0.11,0.36,5,10),socks,leg,0,-0.55,0);
      mesh(new THREE.CapsuleGeometry(0.12,0.12,5,10),black,leg,0,-0.74,0.12);
      legs.push(leg);
    }
    return {root,arms,legs};
  }
  const strikerRoot=new THREE.Group();strikerRoot.position.set(-0.72,0,10.75);
  strikerRoot.rotation.y=Math.PI;scene.add(strikerRoot);
  const keeperRoot=new THREE.Group();keeperRoot.position.set(0,0,0.36);
  scene.add(keeperRoot);
  const actors = [
    {root:strikerRoot, keeper:false, fallback:createFallback(false), mixer:null, actions:{}, active:''},
    {root:keeperRoot, keeper:true, fallback:createFallback(true), mixer:null, actions:{}, active:''}
  ];
  for(const a of actors)a.root.add(a.fallback.root);

  // CC0 humanoid model replaces the procedural rig when it is downloaded.
  // Never blocks the game or leaves an empty silhouette on network failure.
  const MODEL_URL='https://raw.githubusercontent.com/kendrekaran/striker-3d/main/assets/player.glb';
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
        rig.position.y=-skinnedBox.min.y*scale;
        rig.traverse((o)=>{
          if(!o.isMesh)return;
          o.castShadow=true;o.receiveShadow=true;
          const kit={
            Shirt:material(a.keeper?0xc0ed30:0x1650a8,0.08,0.65),
            Shirt2:material(a.keeper?0x9dbc23:0x123d88,0,0.72),
            Pants:material(a.keeper?0x304531:0xf7fafb,0,0.77),
            Socks:material(a.keeper?0xc0ed30:0x164ca4,0,0.72),
            Shoes:material(0x171e24,0.06,0.47)
          };
          const replace=m=>kit[m.name]||m;
          o.material=Array.isArray(o.material)?o.material.map(replace):replace(o.material);
        });
        a.root.remove(a.fallback.root);
        a.root.add(rig);
        a.mixer=new THREE.AnimationMixer(rig);
        // Named thigh bone, after the animation mixer, receives the impact kick.
        // The upstream CC0 clip collection has no authored football kick clip.
        const legBones=[];
        rig.traverse((bone)=>{
          if(bone.isBone && /(up.?leg|thigh|upper.?leg|r.?upleg)/i.test(bone.name))legBones.push(bone);
        });
        a.kickBone=legBones.find(b=>/(right|\.r\b|_r\b|r_)/i.test(b.name))||legBones[0]||null;
        for(const clip of gltf.animations){
          const name=clip.name.replace(/^HumanArmature\|Man_/, '').toLowerCase();
          a.actions[name]=a.mixer.clipAction(clip);
        }
        setAction(a,'idle');
      }
      onReady?.({rigged:true, animations:gltf.animations.length});
    },undefined,(err)=>{
      if(canRetry){fetchAthlete(CDN_MODEL,false);return;}
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
    let key=names.find(k=>k===actionName)
      || names.find(k=>k.includes(actionName))
      || (actionName==='kick'?names.find(k=>k.includes('idle')):undefined)
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
      shot.started=clock.getElapsedTime();setAction(actors[0],'kick');
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
    for(const a of actors){
      if(a.mixer){
        a.mixer.update(dt);
        if(!a.keeper && a.kickBone && shot.phase==='kick') {
          const impact=Math.sin(Math.min(1,Math.max(0,time/0.38))*Math.PI);
          a.kickBone.rotation.x-=impact*1.1;
          a.kickBone.updateMatrix();
        }
      } else {
        const moving=shot.phase==='runup' && !a.keeper;
        const rhythm=Math.sin(elapsed*(moving?12:2.1))*(moving?0.5:0.04);
        if(a.fallback.legs){
          a.fallback.legs[0].rotation.x=rhythm;
          a.fallback.legs[1].rotation.x=-rhythm;
          a.fallback.arms[0].rotation.x=-rhythm*0.65;
          a.fallback.arms[1].rotation.x=rhythm*0.65;
          if(a.keeper && shot.phase==='kick'){
            a.fallback.arms[0].rotation.z=-0.9;
            a.fallback.arms[1].rotation.z=0.9;
          }
        }
      }
    }
    // Always a true perspective camera, lightly tracking the foot-to-ball action.
    camera.position.x=mix(camera.position.x,Math.sin(cameraYaw)*19.8,0.08);
    camera.position.y=mix(camera.position.y,3.6,0.03);
    camera.position.z=mix(camera.position.z,Math.cos(cameraYaw)*(shot.phase==='runup'?18.6:19.8),0.08);
    camera.lookAt(0,1.35,-0.4);
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