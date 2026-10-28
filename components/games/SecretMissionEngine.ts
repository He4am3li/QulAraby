import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';

export type SecretRoomId = 'depot' | 'comms' | 'archive' | 'vault';
export type SecretPhase = 'intro' | 'entering' | 'hall' | 'room-enter' | 'combat' | 'safes' | 'boss-defeated' | 'room-exit' | 'dead' | 'victory';

export const SECRET_ROOMS: { id: SecretRoomId; ar: string; en: string; z: number; side: -1 | 1; guards: number }[] = [
  { id:'depot', ar:'مخزن الإمدادات', en:'Supply Depot', z:3, side:-1, guards:1 },
  { id:'comms', ar:'غرفة الاتصالات', en:'Communications', z:-15, side:1, guards:2 },
  { id:'archive', ar:'غرفة الأرشيف', en:'Classified Archive', z:-33, side:-1, guards:3 },
  { id:'vault', ar:'حجرة الحماية', en:'Defense Chamber', z:-51, side:1, guards:0 },
];
export type SecretEvents = {
  onPhase: (phase: SecretPhase, room?: SecretRoomId) => void;
  onHealth: (health: number) => void;
  onThreats: (remaining: number) => void;
  onNearby: (room: SecretRoomId | null) => void;
  onShot: (hit:boolean) => void;
  onError: (message:string) => void;
};
type Combatant = { root:THREE.Group; body:THREE.Group; fallback:THREE.Group; mixer:THREE.AnimationMixer|null; action:THREE.AnimationAction|null; hp:number; maxHp:number; cooldown:number; dying:number; alive:boolean; isBoss:boolean; awareness:number; alerted:boolean; };
type Room = { info:typeof SECRET_ROOMS[number]; group:THREE.Group; door:THREE.Group; doorAngle:number; doorTarget:number; safes:{door:THREE.Group; opened:number; target:number; name:THREE.Sprite}[]; reward:THREE.Group; enemies:Combatant[]; prepared:boolean;};
type Traverse = {type:'intro'|'enter'|'exit';time:number;duration:number;from:THREE.Vector3;to:THREE.Vector3;fromYaw:number;toYaw:number; room?:Room};
type Trail = { mesh:THREE.Mesh; age:number; lifespan:number };
const lerp=THREE.MathUtils.lerp;
const clamp=THREE.MathUtils.clamp;
const ease=(n:number)=>n*n*(3-2*n);

const tex=(kind:'wall'|'ground'|'wood'|'steel')=>{
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
  const g=canvas.getContext('2d')!;
  const ground=kind==='ground';const wall=kind==='wall';
  g.fillStyle=ground?'#9a9890':wall?'#8b9391':kind==='wood'?'#79644b':'#697477';
  g.fillRect(0,0,512,512);
  // Deterministic speckled grime, joint lines, scratches and surface roughness.
  for(let i=0;i<2400;i++){
    const x=(i*97+19)%512,y=(i*151+31)%512,v=(i%9);
    g.fillStyle=v<4?'rgba(24,30,31,.065)':'rgba(243,244,236,.07)';
    g.fillRect(x,y,1+(i%5),1+(i%3));
  }
  if(ground) {
    for(let y=0;y<512;y+=72){g.strokeStyle='#30353530';g.lineWidth=2;g.beginPath();g.moveTo(0,y);g.lineTo(512,y);g.stroke();}
    for(let x=0;x<512;x+=104){g.strokeStyle='#383c3940';g.beginPath();g.moveTo(x,0);g.lineTo(x,512);g.stroke();}
  }else if(wall){
    for(let y=0;y<512;y+=164){g.strokeStyle='#e2e6dd32';g.lineWidth=3;g.beginPath();g.moveTo(0,y);g.lineTo(512,y);g.stroke();}
    for(let x=0;x<512;x+=200){g.strokeStyle='#343a3a28';g.lineWidth=2;g.beginPath();g.moveTo(x,0);g.lineTo(x,512);g.stroke();}
  }else{
    for(let i=0;i<38;i++){
      g.strokeStyle=i%2?'#ecddac15':'#2b303020';
      g.lineWidth=1+(i%3);
      g.beginPath();g.moveTo(0,(i*37)%512);g.lineTo(512,((i*37)%512)+2);g.stroke();
    }
  }
  const result=new THREE.CanvasTexture(canvas);
  result.colorSpace=THREE.SRGBColorSpace;
  result.wrapS=result.wrapT=THREE.RepeatWrapping;
  result.repeat.set(ground?3:1,ground?16:1);
  result.anisotropy=2;
  return result;
};

function makeLabel(text:string,color='#e5d4aa'){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
  const ctx=canvas.getContext('2d')!;
  ctx.fillStyle='#142026';ctx.fillRect(0,0,512,128);
  ctx.strokeStyle='#6b7775';ctx.lineWidth=3;ctx.strokeRect(4,4,504,120);
  ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.font=/[\u0600-\u06ff]/.test(text)?'bold 55px Tajawal, Arial':'bold 40px Arial';
  ctx.fillText(text,256,64,472);
  const texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;
  return texture;
}

export function createSecretMission(container:HTMLElement, events:SecretEvents, language:'ar'|'en') {
  const phone=window.matchMedia('(pointer:coarse), (max-width:900px)').matches;
  const renderer=new THREE.WebGLRenderer({antialias:!phone,alpha:false,powerPreference:phone?'low-power':'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,phone?1:1.65));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.35;
  renderer.shadowMap.enabled=!phone;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);
  renderer.domElement.style.touchAction='none';
  const scene=new THREE.Scene();
  scene.background=new THREE.Color('#707d80');
  scene.fog=new THREE.FogExp2('#9fa6a3',.009);
  const camera=new THREE.PerspectiveCamera(phone?69:65,1,.07,140);
  scene.add(new THREE.HemisphereLight('#f4f8f3','#72746f',3.6));
  const mainLight=new THREE.DirectionalLight('#f5efd8',3.2);
  mainLight.position.set(-6,12,12);
  mainLight.castShadow=!phone;
  if(!phone){mainLight.shadow.mapSize.set(1024,1024);mainLight.shadow.camera.left=-20;mainLight.shadow.camera.right=20;mainLight.shadow.camera.top=20;mainLight.shadow.camera.bottom=-20;}
  scene.add(mainLight);
  const materials:THREE.Material[]=[];
  const geometries:THREE.BufferGeometry[]=[];
  const textures:THREE.Texture[]=[];
  const material=<T extends THREE.Material>(m:T)=>(materials.push(m),m);
  const geometry=<T extends THREE.BufferGeometry>(g:T)=>(geometries.push(g),g);
  const wallMap=tex('wall'),floorMap=tex('ground'),steelMap=tex('steel');
  textures.push(wallMap,floorMap,steelMap);
  const concrete=material(new THREE.MeshStandardMaterial({map:wallMap,color:'#ebebe5',roughness:.91}));
  const ground=material(new THREE.MeshStandardMaterial({map:floorMap,color:'#e8e5dd',roughness:.84}));
  const steel=material(new THREE.MeshStandardMaterial({map:steelMap,color:'#ced0ce',metalness:.58,roughness:.45}));
  const trim=material(new THREE.MeshStandardMaterial({color:'#38484b',metalness:.63,roughness:.4}));
  const black=material(new THREE.MeshStandardMaterial({color:'#232d2c',roughness:.67,metalness:.33}));
  const tan=material(new THREE.MeshStandardMaterial({color:'#a29378',roughness:.87}));
  const amber=material(new THREE.MeshBasicMaterial({color:'#f3bd70'}));
  const cyan=material(new THREE.MeshBasicMaterial({color:'#a6effa'}));
  const red=material(new THREE.MeshBasicMaterial({color:'#f87569'}));
  const green=material(new THREE.MeshBasicMaterial({color:'#9cf3b4'}));
  const transparentRed=material(new THREE.MeshBasicMaterial({color:'#ff7967',transparent:true,opacity:.7,depthWrite:false}));
  const poly=(parent:THREE.Object3D,dim:[number,number,number],mat:THREE.Material,pos:[number,number,number])=>{
    const mesh=new THREE.Mesh(geometry(new THREE.BoxGeometry(...dim)),mat);
    mesh.position.set(...pos);mesh.castShadow=!phone;mesh.receiveShadow=!phone;
    parent.add(mesh);return mesh;
  };
  const round=(parent:THREE.Object3D,rad:number,height:number,mat:THREE.Material,pos:[number,number,number],seg=12)=>{
    const mesh=new THREE.Mesh(geometry(new THREE.CylinderGeometry(rad,rad,height,seg)),mat);
    mesh.position.set(...pos);mesh.castShadow=!phone;parent.add(mesh);return mesh;
  };
  const glows:THREE.Mesh[]=[];
  const lightBar=(parent:THREE.Group,z:number)=>{
    poly(parent,[3.8,.09,.31],trim,[0,3.46,z]);
    poly(parent,[3.42,.035,.16],amber,[0,3.4,z]);
  };
  const corridor=new THREE.Group();scene.add(corridor);
  poly(corridor,[6.6,.25,92],ground,[0,-.16,-20]);
  poly(corridor,[6.6,.17,92],concrete,[0,3.67,-20]);
  const sideWalls:[number,number][]=[[-3.3,-1],[3.3,1]];
  const rooms:Room[]=[];
  for(const [x,side] of sideWalls){
    const gap=SECRET_ROOMS.filter(r=>r.side===side).map(r=>r.z).sort((a,b)=>b-a);
    let prev=26;
    for(const z of gap){
      if(prev>z+1.55)poly(corridor,[.22,3.5,prev-(z+1.55)],concrete,[x,1.75,(prev+z+1.55)/2]);
      prev=z-1.55;
    }
    poly(corridor,[.22,3.5,prev+67],concrete,[x,1.75,(prev-67)/2]);
    poly(corridor,[.22,.15,92],trim,[x,3.48,-20]);
    poly(corridor,[.22,.12,92],trim,[x,.15,-20]);
  }
  for(let z=17;z>-65;z-=5.1){
    lightBar(corridor,z);
    for(const side of [-1,1]){
      poly(corridor,[.2,3.38,.14],trim,[side*3.17,1.74,z]);
      poly(corridor,[.26,.12,.28],steel,[side*3.18,.58,z]);
    }
    if(z%2>0) {
      const crate=poly(corridor,[.73,.6,.86],steel,[z%3>0?2.35:-2.35,.3,z-1.5]);
      poly(crate,[.73,.06,.85],tan,[0,.32,0]);
    }
  }
  // Ducts, conduit and warning boards create a recognisable tactical facility.
  for(const x of [-2.65,2.65]){
    poly(corridor,[.14,.14,90],trim,[x,3.16,-20]);
    poly(corridor,[.085,.085,90],tan,[x,.5,-20]);
  }
  const signMaterial=(texture:THREE.CanvasTexture)=>
    material(new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide,depthWrite:false}));
  const makeRoom=(info:typeof SECRET_ROOMS[number]):Room=>{
    const {side,z}=info;
    const frame=new THREE.Group();frame.position.set(side*3.3,0,z);corridor.add(frame);
    for(const depth of [-1.6,1.6])poly(frame,[.42,3.0,.19],trim,[0,1.5,depth]);
    poly(frame,[.42,.25,3.4],trim,[0,3.1,0]);
    poly(frame,[.42,.15,3.42],tan,[0,.12,0]);
    const hinge=new THREE.Group();hinge.position.set(0,0,-1.45);frame.add(hinge);
    poly(hinge,[.27,2.9,2.88],steel,[0,1.52,1.44]);
    poly(hinge,[.29,.12,2.75],trim,[0,2.7,1.44]);
    poly(hinge,[.3,.47,.55],amber,[-side*.16,1.42,2.2]);
    const marker=makeLabel(language==='ar'?info.ar:info.en);
    textures.push(marker);
    const card=new THREE.Mesh(geometry(new THREE.PlaneGeometry(2.25,.55)),signMaterial(marker));
    card.rotation.y=side*Math.PI/2;
    card.position.set(-side*.39,3.38,0);
    frame.add(card);
    const group=new THREE.Group();group.position.set(side*8.25,0,z);scene.add(group);
    const wx=5.0;
    poly(group,[10.7,.22,10],ground,[0,-.17,0]);
    poly(group,[10.7,.15,10],concrete,[0,3.64,0]);
    poly(group,[10.7,3.5,.2],concrete,[0,1.75,-5]);
    poly(group,[10.7,3.5,.2],concrete,[0,1.75,5]);
    poly(group,[.24,3.5,10],concrete,[side*5.25,1.75,0]);
    // Entrance-side wall leaves a clear opening of three units in Z.
    for(const zPart of [-3.28,3.28]){
      poly(group,[.24,3.5,3.37],concrete,[-side*5.25,1.75,zPart]);
    }
    poly(group,[.26,.24,3.2],trim,[-side*5.25,3.05,0]);
    poly(group,[2.6,.09,.31],amber,[0,3.43,0]);
    for(const x of [-3.9,3.9]) {
      poly(group,[.15,3.4,.14],trim,[x,1.74,-4.78]);
      poly(group,[.08,.08,9.3],steel,[x,3.2,0]);
    }
    const point=new THREE.PointLight('#fff0cb',phone?15:22,13,2);
    point.position.set(0,2.8,1);group.add(point);
    // Actual articulated safes, each numbered and unlocked separately.
    const safes:Room['safes']=[];
    const farX=side*2.55;
    for(let i=0;i<4;i++){
      const safeX=-3.32+i*2.18;
      const cabinet=new THREE.Group();cabinet.position.set(safeX,0,-3.95);group.add(cabinet);
      poly(cabinet,[1.68,2.25,1.45],trim,[0,1.13,0]);
      poly(cabinet,[1.47,1.99,.1],black,[0,1.13,.78]);
      const joint=new THREE.Group();joint.position.set(-.72,0,.83);cabinet.add(joint);
      poly(joint,[1.43,1.97,.13],steel,[.71,1.13,0]);
      poly(joint,[1.16,.1,.05],i===3?amber:cyan,[.71,1.93,.1]);
      round(joint,.1,.13,black,[1.15,1.04,.11],12).rotation.x=Math.PI/2;
      poly(cabinet,[1.54,.09,.12],tan,[0,.11,.78]);
      const key=makeLabel(language==='ar'?'خزنة '+(i+1):'SAFE '+(i+1));
      textures.push(key);
      const label=new THREE.Sprite(material(new THREE.SpriteMaterial({map:key,transparent:true,depthWrite:false})));
      label.position.set(0,2.53,.6);label.scale.set(1.36,.38,1);cabinet.add(label);
      safes.push({door:joint,opened:0,target:0,name:label});
    }
    // Physical loot in cabinet four: each room provides a piece of the
    // equipment required for the final defense, while the final vault holds papers.
    const reward=new THREE.Group();
    reward.position.set(-3.32+3*2.18,1.35,-3.05);
    group.add(reward);
    const isDocuments=info.id==='vault';
    if(isDocuments){
      for(let sheet=0;sheet<5;sheet++){
        const page=poly(reward,[.84,.012,.59],material(new THREE.MeshStandardMaterial({
          color:sheet%2?'#efe1c2':'#f6edda',roughness:.96
        })),[0,sheet*.025,0]);
        page.rotation.y=sheet*.08;
      }
      poly(reward,[.45,.02,.13],red,[0,.16,.1]);
    }else{
      poly(reward,[.92,.38,.55],steel,[0,0,0]);
      poly(reward,[.86,.24,.41],black,[0,.07,0]);
      poly(reward,[.69,.09,.12],info.id==='archive'?green:cyan,[0,.17,-.25]);
      for(const x of [-.3,.3])round(reward,.09,.3,trim,[x,-.09,.2]);
    }
    reward.visible=false;
    // Screens and stowed equipment; no blank floating cubes.
    const rack=new THREE.Group();rack.position.set(-side*3.95,0,1.2);group.add(rack);
    poly(rack,[.85,2.75,2.5],trim,[0,1.4,0]);
    for(let j=0;j<4;j++) {
      poly(rack,[.86,.11,2.4],steel,[0,.3+j*.6,0]);
      poly(rack,[.09,.07,.12],j%2?amber:green,[-side*.49,.4+j*.6,-.86]);
    }
    const console=new THREE.Group();console.position.set(side*.4,0,2.55);group.add(console);
    poly(console,[1.9,.8,1.0],trim,[0,.52,0]);
    poly(console,[1.74,.12,.95],steel,[0,.94,0]);
    poly(console,[1.35,.86,.12],black,[0,1.51,-.36]);
    poly(console,[1.1,.54,.05],iColor(info.id),[0,1.52,-.28]);
    group.visible=false;
    return {info,group,door:hinge,doorAngle:0,doorTarget:0,safes,reward,enemies:[],prepared:false};
  };
  function iColor(id:SecretRoomId):THREE.Material{return id==='vault'?red:id==='comms'?cyan:id==='archive'?green:amber;}
  for(const info of SECRET_ROOMS)rooms.push(makeRoom(info));

  const gate=new THREE.Group();gate.position.set(0,0,19);scene.add(gate);
  const hinges:THREE.Group[]=[];
  for(const side of [-1,1]){
    const part=new THREE.Group();part.position.set(side*1.65,0,0);gate.add(part);
    poly(part,[1.62,3.45,.34],steel,[-side*.81,1.73,0]);
    poly(part,[1.52,.1,.35],amber,[-side*.81,2.65,0]);
    hinges.push(part);
  }
  poly(gate,[3.65,.34,.5],trim,[0,3.73,0]);
  const actorParent=new THREE.Group();scene.add(actorParent);
  const playerRoot=new THREE.Group();actorParent.add(playerRoot);
  playerRoot.position.set(0,0,24);
  const avatar=new THREE.Group();playerRoot.add(avatar);
  const heroFallback=new THREE.Group();avatar.add(heroFallback);
  const armor=material(new THREE.MeshStandardMaterial({color:'#536252',roughness:.73}));
  const camo=material(new THREE.MeshStandardMaterial({color:'#343e36',roughness:.82}));
  const skin=material(new THREE.MeshStandardMaterial({color:'#b49a82',roughness:.9}));
  const chest=poly(heroFallback,[.76,.93,.39],armor,[0,1.22,0]);
  poly(heroFallback,[.68,.53,.2],camo,[0,1.23,-.25]);
  round(heroFallback,.25,.31,skin,[0,1.9,0]);
  round(heroFallback,.32,.2,camo,[0,2.06,.01]);
  for(const side of [-1,1]){
    const arm=round(heroFallback,.13,.75,armor,[side*.49,1.28,-.13]);arm.rotation.z=side*.18;
    round(heroFallback,.17,.9,camo,[side*.20,.52,0]);
    poly(heroFallback,[.28,.2,.4],black,[side*.19,.12,-.1]);
  }
  const heroWeapon=new THREE.Group();playerRoot.add(heroWeapon);
  const weaponBarrel=poly(heroWeapon,[.15,.16,.91],black,[0,0,-.33]);
  poly(heroWeapon,[.26,.14,.55],steel,[0,.11,-.18]);
  poly(heroWeapon,[.13,.32,.16],black,[0,-.22,.06]);
  const muzzle=poly(heroWeapon,[.19,.19,.25],cyan,[0,.02,-.86]);
  const sight=poly(heroWeapon,[.08,.09,.1],amber,[0,.2,-.49]);
  let model:THREE.Group|null=null,modelMixer:THREE.AnimationMixer|null=null,modelAction:THREE.AnimationAction|null=null;
  const clips=new Map<string,THREE.AnimationAction>();
  const guards:Combatant[]=[];
  const guardAnimations:THREE.AnimationClip[]=[];
  const dressGuard=(enemy:Combatant)=>{
    if(!model||enemy.isBoss||!enemy.alive||enemy.mixer)return;
    const copy=cloneSkeleton(model) as THREE.Group;
    copy.rotation.y=0;
    enemy.root.add(copy);
    enemy.fallback.visible=false;
    const mixer=new THREE.AnimationMixer(copy);
    const idle=guardAnimations.find(clip=>/idle/i.test(clip.name));
    const action=idle?mixer.clipAction(idle):null;
    action?.play();
    enemy.mixer=mixer;
    enemy.action=action;
  };
  const enemyFallback=(parent:THREE.Group,boss=false)=>{
    const g=new THREE.Group();parent.add(g);
    poly(g,boss?[1.65,1.5,1.0]:[.73,.87,.39],boss?trim:camo,[0,boss?1.42:1.29,0]);
    poly(g,boss?[1.5,.58,.7]:[.65,.48,.25],boss?black:armor,[0,boss?1.68:1.37,-.22]);
    round(g,boss?.43:.24,boss?.46:.31,boss?trim:skin,[0,boss?2.18:1.91,0]);
    for(const side of [-1,1]){
      const arm=round(g,boss?.22:.13,boss?.89:.72,boss?steel:armor,[side*(boss?.93:.46),boss?1.42:1.28,0]);
      arm.rotation.z=side*.16;
      round(g,boss?.25:.16,boss?1.0:.87,boss?trim:camo,[side*(boss?.42:.2),.55,0]);
    }
    poly(g,[.22,.17,.77],black,[.39,1.19,-.45]);
    poly(g,[.22,.23,.19],boss?red:amber,[.39,1.22,-.87]);
    return g;
  };
  const spawnGuards=(room:Room)=>{
    for(const existing of guards){existing.root.parent?.remove(existing.root);}
    guards.length=0;room.enemies=[];
    const boss=room.info.id==='vault';
    const count=boss?1:room.info.guards;
    for(let i=0;i<count;i++){
      const root=new THREE.Group();room.group.add(root);
      root.position.set((i-(count-1)/2)*2.45,0,boss?-1.75:-.6-(i%2)*.6);
      // Models face into the room, while the player enters from the side corridor.
      root.rotation.y=Math.PI;
      const fall=enemyFallback(root,boss);
      const hitRing=new THREE.Mesh(geometry(new THREE.TorusGeometry(boss?.54:.31,.065,8,24)),boss?red:amber);
      hitRing.rotation.x=Math.PI/2;hitRing.position.set(0,boss?2.55:2.18,0);root.add(hitRing);
      const enemy:Combatant={root,body:root,fallback:fall,mixer:null,action:null,
        hp:boss?12:room.info.id==='archive'?4:room.info.id==='comms'?3:2,
        maxHp:boss?12:room.info.id==='archive'?4:room.info.id==='comms'?3:2,
        cooldown:3.2+i*.65,dying:0,alive:true,isBoss:boss,awareness:0,alerted:boss};
      room.enemies.push(enemy);guards.push(enemy);
      dressGuard(enemy);
    }
    events.onThreats(guards.length);
  };
  const gltfLoader=new GLTFLoader();
  let loaderDisposed=false;
  gltfLoader.load('https://threejs.org/examples/models/gltf/Soldier.glb',gltf=>{
    if(loaderDisposed){gltf.scene.traverse(n=>{if(n instanceof THREE.Mesh)n.geometry.dispose();});return;}
    model=gltf.scene;
    guardAnimations.push(...gltf.animations);
    model.scale.setScalar(.96);
    avatar.add(model);heroFallback.visible=false;
    modelMixer=new THREE.AnimationMixer(model);
    for(const anim of gltf.animations)clips.set(anim.name.toLowerCase(),modelMixer.clipAction(anim));
    modelAction=clips.get('idle')||null;modelAction?.play();
    for(const guard of guards)dressGuard(guard);
    // Place weapon in the actual hand if the rig exposes a right-hand bone.
    let hand:THREE.Object3D|null=null;
    model.traverse(bone=>{
      if(!hand && /right.*hand|hand.*right|righthand/i.test(bone.name))hand=bone;
    });
    if(hand){
      heroWeapon.parent?.remove(heroWeapon);
      (hand as THREE.Object3D).add(heroWeapon);
      heroWeapon.position.set(.05,-.11,-.06);
      heroWeapon.rotation.set(.1,-.25,Math.PI/2);
      heroWeapon.scale.setScalar(.82);
    }
  },undefined,()=>{/* If remote GLB fails, use local 3D fallback. */});

  // Weapon effects (energy bolt, recoil flash, tracers) pooled to avoid allocations.
  const trails:Trail[]=[];
  const boltGeo=geometry(new THREE.CylinderGeometry(.055,.07,1,8));
  const makeTrail=(from:THREE.Vector3,to:THREE.Vector3,color:THREE.Material,life=.22)=>{
    const beam=new THREE.Mesh(boltGeo,color);
    const middle=from.clone().add(to).multiplyScalar(.5);
    const delta=to.clone().sub(from);
    beam.position.copy(middle);
    beam.scale.y=delta.length();
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize());
    scene.add(beam);trails.push({mesh:beam,age:0,lifespan:life});
  };
  const player=new THREE.Vector3(0,0,24);
  let yaw=0,pitch=-.08;
  let vy=0,crouch=false,sprint=false;
  const input={forward:0,strafe:0};
  const camSpot=new THREE.Vector3();
  const lookSpot=new THREE.Vector3();
  let camFollow=true;
  let phase:SecretPhase='intro';
  let activeRoom:Room|null=null;
  let nearby:SecretRoomId|null=null;
  let transition:Traverse|null=null;
  let hp=100;
  let weaponTier=0;
  let gateProgress=0;
  let safeIndex=0;
  let last=performance.now(),frame=0,time=0;
  let paused=false,disposed=false;
  const emit=(next:SecretPhase,id?:SecretRoomId)=>{phase=next;events.onPhase(next,id);};
  const limitCorridor=(p:THREE.Vector3)=>{
    p.z=clamp(p.z,-61,15);
    p.x=clamp(p.x,-2.42,2.42);
  };
  const roomBounds=(p:THREE.Vector3,room:Room)=>{
    p.x=clamp(p.x,room.group.position.x-4.2,room.group.position.x+4.2);
    p.z=clamp(p.z,room.info.z-3.65,room.info.z+3.65);
  };
  const transitionTo=(type:Traverse['type'],point:THREE.Vector3,toYaw:number,duration:number,room?:Room)=>{
    transition={type,time:0,duration,from:player.clone(),to:point,fromYaw:yaw,toYaw,room};
  };
  const start=()=>{
    if(phase!=='intro')return;
    gateProgress=.001;
    transitionTo('intro',new THREE.Vector3(0,0,12),0,2.6);
    emit('entering');
  };
  const roomAvailable=(id:SecretRoomId,allowed:SecretRoomId[])=>allowed.includes(id);
  let allowedRooms:SecretRoomId[]=['depot'];
  const setAllowed=(items:SecretRoomId[])=>{allowedRooms=items;};
  const enterRoom=(id?:SecretRoomId)=>{
    if(phase!=='hall')return false;
    const available=rooms.find(r=>r.info.id===(id??nearby));
    if(!available||!roomAvailable(available.info.id,allowedRooms))return false;
    if(Math.abs(player.z-available.info.z)>3.9)return false;
    activeRoom=available;
    available.doorTarget=available.info.side===1?1.6:-1.6;
    transitionTo('enter',new THREE.Vector3(available.group.position.x,0,available.info.z+1.8),
      -available.info.side*Math.PI/2,2.0,available);
    emit('room-enter',available.info.id);
    return true;
  };
  const travelTo=(id:SecretRoomId)=>{
    const r=rooms.find(v=>v.info.id===id);
    if(!r||!allowedRooms.includes(id))return false;
    if(phase==='intro'){start();return true;}
    if(phase!=='hall')return false;
    const goal=new THREE.Vector3(0,0,r.info.z+1.5);
    transitionTo('intro',goal,0,Math.max(1.5,Math.abs(player.z-goal.z)/7));
    // The intro transition in the hallway is a controlled guided walk.
    return true;
  };
  const resetThreats=()=>{
    if(!activeRoom)return;
    hp=100;events.onHealth(hp);
    activeRoom.safes.forEach(s=>{s.target=0;s.opened=0;});
    activeRoom.reward.visible=false;
    safeIndex=0;
    spawnGuards(activeRoom);
    emit('combat',activeRoom.info.id);
  };
  const exitRoom=()=>{
    if(!activeRoom||!['combat','safes','boss-defeated','dead'].includes(phase))return;
    const r=activeRoom;
    transitionTo('exit',new THREE.Vector3(0,0,r.info.z+2.45),0,1.8,r);
    emit('room-exit',r.info.id);
  };
  const openSafe=(index:number)=>{
    if(phase!=='safes'||!activeRoom||index!==safeIndex)return false;
    const box=activeRoom.safes[index];if(!box||box.target!==0)return false;
    box.target=-1.65;
    if(index===3)activeRoom.reward.visible=true;
    safeIndex++;
    return true;
  };
  const setWeaponTier=(tier:number)=>{weaponTier=clamp(tier,0,4);muzzle.scale.setScalar(1+tier*.19);};
  const setMovement=(forward:number,strafe:number,run:boolean)=>{input.forward=clamp(forward,-1,1);input.strafe=clamp(strafe,-1,1);sprint=run;};
  const look=(dx:number,dy:number)=>{
    if(!['hall','combat','safes'].includes(phase))return;
    yaw-=clamp(dx,-95,95)*.004;
    pitch=clamp(pitch-clamp(dy,-95,95)*.003,-.9,.54);
  };
  const jump=()=>{
    if(!['hall','combat','safes'].includes(phase)||crouch||player.y>.025)return;
    vy=5.45;
  };
  const setCrouch=(state:boolean)=>{crouch=state;};
  const setHealth=(value:number)=>{
    hp=clamp(value,0,100);events.onHealth(Math.round(hp));
    if(hp<=0&&phase!=='dead'){
      emit('dead',activeRoom?.info.id);
      input.forward=input.strafe=0;
    }
  };
  const fire=()=>{
    if(!['combat','safes'].includes(phase))return false;
    const origin=new THREE.Vector3();
    muzzle.getWorldPosition(origin);
    if(!Number.isFinite(origin.x)||origin.distanceTo(player)>3)origin.copy(player).add(new THREE.Vector3(0,1.35,0));
    const direction=new THREE.Vector3(-Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch));
    let best:Combatant|null=null,closestAngle=.42;
    const eye=player.clone().add(new THREE.Vector3(0,1.65,0));
    for(const enemy of guards){
      if(!enemy.alive)continue;
      const at=enemy.root.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,enemy.isBoss?1.7:1.35,0));
      const dist=eye.distanceTo(at);
      if(dist>20)continue;
      const dot=direction.dot(at.clone().sub(eye).normalize());
      const threshold=phone?.5:.66; // mobile aim assistance
      if(dot>threshold&&dot>closestAngle){best=enemy;closestAngle=dot;}
    }
    const hit=Boolean(best);
    // Gunfire reveals the player's position to every surviving guard.
    for(const other of guards)if(other.alive){other.alerted=true;other.awareness=1;}
    const end=best?best.root.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,best.isBoss?1.7:1.35,0))
      :origin.clone().addScaledVector(direction,15);
    makeTrail(origin,end,cyan,.17);
    if(best){
      const damage=best.isBoss? (weaponTier>=3?3:0) : weaponTier>=2?2:1;
      best.hp-=damage;
      if(best.hp<=0){
        best.alive=false;best.dying=0;
        events.onThreats(guards.filter(g=>g.alive).length);
        if(!guards.some(g=>g.alive)){
          if(activeRoom?.info.id==='vault')emit('boss-defeated','vault');
          emit('safes',activeRoom?.info.id);
        }
      }
    }
    events.onShot(hit);return hit;
  };
  const controls=new Set<string>();
  const keyDown=(event:KeyboardEvent)=>{
    if((event.target as HTMLElement)?.closest('input,textarea,select,button,[role=dialog]'))return;
    const key=event.key.toLowerCase();controls.add(key);
    if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(key))event.preventDefault();
    if(key==='shift')sprint=true;
    if(event.code==='Space'&&!event.repeat)jump();
    if(key==='c'&&!event.repeat)setCrouch(!crouch);
    if(key==='e'&&!event.repeat)enterRoom();
    if(key==='f'&&!event.repeat)fire();
    if(key==='escape')exitRoom();
  };
  const keyUp=(e:KeyboardEvent)=>{controls.delete(e.key.toLowerCase());if(e.key.toLowerCase()==='shift')sprint=false;};
  const canvas=renderer.domElement;
  let pointerDown:{x:number;y:number;time:number}|null=null;
  const pointerStart=(e:PointerEvent)=>{pointerDown={x:e.clientX,y:e.clientY,time:performance.now()};canvas.setPointerCapture(e.pointerId);};
  const pointerMove=(e:PointerEvent)=>{
    if(!pointerDown)return;
    const dx=e.clientX-pointerDown.x,dy=e.clientY-pointerDown.y;
    look(dx,dy);
    pointerDown.x=e.clientX;pointerDown.y=e.clientY;
    pointerDown.time=0;
  };
  const pointerEnd=(e:PointerEvent)=>{
    if(pointerDown&&pointerDown.time>0&&performance.now()-pointerDown.time<280){
      if(phase==='intro')start();
      else if(phase==='combat'||phase==='safes')fire();
    }
    pointerDown=null;
  };
  const resize=()=>{
    const w=container.clientWidth,h=container.clientHeight;
    if(!w||!h)return;
    renderer.setSize(w,h,false);camera.aspect=w/h;
    camera.fov=w<650?71:65;camera.updateProjectionMatrix();
  };
  const observer=new ResizeObserver(resize);observer.observe(container);resize();
  canvas.addEventListener('pointerdown',pointerStart);
  canvas.addEventListener('pointermove',pointerMove);
  canvas.addEventListener('pointerup',pointerEnd);
  canvas.addEventListener('pointercancel',pointerEnd);
  window.addEventListener('keydown',keyDown);
  window.addEventListener('keyup',keyUp);
  const lost=(e:Event)=>{e.preventDefault();paused=true;events.onError('Graphics context interrupted; use Restart');};
  canvas.addEventListener('webglcontextlost',lost);

  const render=(now:number)=>{
    frame=requestAnimationFrame(render);
    if(disposed||document.hidden||paused){last=now;return;}
    if(phone&&now-last<1000/30)return;
    const dt=clamp((now-last)/1000,0,.045);last=now;time+=dt;
    if(phase!=='intro')gateProgress=clamp(gateProgress+dt*.55,0,1);
    hinges.forEach((h,i)=>h.rotation.y=(i?1:-1)*ease(gateProgress)*1.55);
    gate.visible=phase==='intro'||(phase==='entering'&&player.z>17.0);
    for(const room of rooms){
      room.doorAngle=THREE.MathUtils.damp(room.doorAngle,room.doorTarget,3,dt);
      room.door.rotation.y=room.doorAngle;
      room.group.visible=room===activeRoom || Math.abs(player.z-room.info.z)<4.4;
      for(const s of room.safes){
        s.opened=THREE.MathUtils.damp(s.opened,s.target,4.3,dt);
        s.door.rotation.y=s.opened;
      }
      if(room.reward.visible){
        room.reward.position.y=1.35+Math.sin(time*2.3)*.09;
        room.reward.rotation.y+=dt*.7;
      }
    }
    let moving=false;
    if(transition){
      const t=clamp(transition.time/transition.duration,0,1);
      player.lerpVectors(transition.from,transition.to,ease(t));
      yaw=lerp(transition.fromYaw,transition.toYaw,ease(t));
      transition.time+=dt;
      moving=true;
      if(t>=1){
        const done=transition;transition=null;
        if(done.type==='enter'&&done.room){
          resetThreats();
        }else if(done.type==='exit'&&done.room){
          done.room.doorTarget=0;
          activeRoom=null;
          events.onNearby(null);
          emit('hall');
        }else emit('hall');
      }
    }else if(['hall','combat','safes'].includes(phase)){
      const up=Number(controls.has('w')||controls.has('arrowup'))-Number(controls.has('s')||controls.has('arrowdown'));
      const right=Number(controls.has('d')||controls.has('arrowright'))-Number(controls.has('a')||controls.has('arrowleft'));
      let f=clamp(input.forward+up,-1,1),r=clamp(input.strafe+right,-1,1);
      const norm=Math.hypot(f,r)||1;f/=norm;r/=norm;
      const speed=crouch?.95:sprint?5.8:3.2;
      player.x+=(-Math.sin(yaw)*f+Math.cos(yaw)*r)*dt*speed;
      player.z+=(-Math.cos(yaw)*f-Math.sin(yaw)*r)*dt*speed;
      if(phase==='hall')limitCorridor(player);
      else if(activeRoom)roomBounds(player,activeRoom);
      moving=Math.abs(f)+Math.abs(r)>.04;
      if(player.y>0||vy>0){
        vy-=13*dt;player.y+=vy*dt;
        if(player.y<0){player.y=0;vy=0;}
      }
    }
    playerRoot.position.copy(player);
    playerRoot.rotation.y=yaw;
    // Prone crawling: the operator's torso rolls almost horizontal and lowers to the floor.
    avatar.rotation.x=THREE.MathUtils.damp(avatar.rotation.x,crouch?-1.22:0,7,dt);
    avatar.position.y=THREE.MathUtils.damp(avatar.position.y,crouch?.46:0,7,dt);
    avatar.position.z=THREE.MathUtils.damp(avatar.position.z,crouch?.32:0,7,dt);
    avatar.scale.y=THREE.MathUtils.damp(avatar.scale.y,crouch?.9:1,8,dt);
    if(!model)chest.rotation.x=moving?Math.sin(time*(sprint?14:9))*.08:Math.sin(time*1.2)*.02;
    // Grip a weapon in front of the character even if the remote skeletal rig fails.
    if(heroWeapon.parent===playerRoot){
      heroWeapon.position.set(.4,crouch?.92:1.35,-.43);
      heroWeapon.rotation.set(-pitch*.4,0,0);
    }
    modelMixer?.update(dt);
    if(modelMixer){
      const name=moving?(sprint?'run':'walk'):'idle';
      const next=clips.get(name)||clips.get('idle')||null;
      if(next!==modelAction&&next){modelAction?.fadeOut(.18);next.reset().fadeIn(.18).play();modelAction=next;}
    }

    if(['combat','safes'].includes(phase)&&activeRoom){
      for(const guard of guards){
        guard.mixer?.update(dt);
        if(!guard.alive){
          guard.dying+=dt;
          guard.root.rotation.z=THREE.MathUtils.damp(guard.root.rotation.z,Math.PI*.43,4,dt);
          if(guard.dying>1.7)guard.root.visible=false;
          continue;
        }
        const dist=guard.root.getWorldPosition(new THREE.Vector3()).distanceTo(player);
        // Suspenseful stealth: patrols only engage after detecting the operator,
        // unless gunfire has already triggered the alarm. Prone movement hides better.
        const detectRadius=guard.isBoss?16:crouch?3.8:sprint?11:7.0;
        if(!guard.alerted){
          if(dist<detectRadius)guard.awareness+=dt*(crouch?.55:sprint?2.8:1.6);
          else guard.awareness=Math.max(0,guard.awareness-dt*.55);
          if(guard.awareness>1.1)guard.alerted=true;
          if(!guard.alerted){
            guard.root.rotation.y+=Math.sin(time*.63+guard.cooldown)*dt*.17;
            continue;
          }
        }
        const gh=guard.root.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,1.32,0));
        const ph=player.clone().add(new THREE.Vector3(0,crouch?.92:1.38,0));
        const dir=ph.sub(gh).normalize();
        guard.root.rotation.y=Math.atan2(-dir.x,-dir.z);
        if(dist>3.1){
          const chase=(guard.isBoss?.12:.37)*dt;
          guard.root.position.x+=dir.x*chase;guard.root.position.z+=dir.z*chase;
        }
        guard.cooldown-=dt;
        if(dist<13&&guard.cooldown<=0){
          const risk=guard.isBoss?14:activeRoom.info.id==='archive'?10:8;
          const base=guard.isBoss?2.1:2.55;
          guard.cooldown=base + Math.random()*.9;
          const from=guard.root.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,1.38,0));
          const to=player.clone().add(new THREE.Vector3(0,crouch?.95:1.35,0));
          makeTrail(from,to,red,.31);
          // Crouching, moving and using cover reduce the chance of taking damage.
          const chance=crouch?.35:moving?.64:.85;
          if(Math.random()<chance)setHealth(hp-risk);
        }
      }
    }
    for(let i=trails.length-1;i>=0;i--){
      const obj=trails[i];obj.age+=dt;
      if(obj.age>=obj.lifespan){
        obj.mesh.parent?.remove(obj.mesh);trails.splice(i,1);
      }else obj.mesh.scale.x=obj.mesh.scale.z=.75*(1-obj.age/obj.lifespan)+.18;
    }
    const currentNearby=phase==='hall' ?
      rooms.find(r=>Math.abs(r.info.z-player.z)<3.9)?.info.id??null : null;
    if(currentNearby!==nearby){nearby=currentNearby;events.onNearby(nearby);}
    const forward=new THREE.Vector3(-Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch));
    const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
    const head=player.clone().add(new THREE.Vector3(0,crouch?1:1.55,0));
    const roomView=Boolean(activeRoom) && phase!=='hall';
    const camTarget=head.clone().addScaledVector(forward,roomView?-2.65:-4.4)
      .addScaledVector(right,roomView?.62:1.15);
    camTarget.y+=roomView?.82:1.0;
    const lookTarget=head.clone().addScaledVector(forward,roomView?5.1:4.5);
    camera.position.lerp(camTarget,clamp(dt*8,0,1));
    const existingView=camFollow?lookTarget:lookTarget;
    camera.lookAt(existingView);
    for(const room of rooms)if(room.info.id==='vault'){
      // rotating boss warning light outside the target room
      const turret=room.enemies.find(g=>g.isBoss&&g.alive);
      if(turret)turret.root.rotation.y+=Math.sin(time*.7)*.006;
    }
    renderer.render(scene,camera);
  };
  frame=requestAnimationFrame(render);
  events.onPhase('intro');
  events.onHealth(100);
  events.onThreats(0);
  const setLanguage=(value:'ar'|'en')=>{language=value;};
  const restartRoom=()=>{if(!activeRoom)return;resetThreats();player.set(activeRoom.group.position.x,0,activeRoom.info.z+2.3);};
  const finish=()=>{if(phase!=='safes'||!activeRoom||activeRoom.info.id!=='vault'||safeIndex<4)return false;emit('victory','vault');return true;};
  return {
    start,travelTo,enterRoom,exitRoom,openSafe,fire,jump,look,setCrouch,setMovement,setWeaponTier,
    restartRoom,finish,setAllowed,setLanguage,
    getRoom(){return activeRoom?.info.id??null;},
    setPaused(value:boolean){paused=value;last=performance.now();},
    dispose(){
      disposed=true;loaderDisposed=true;cancelAnimationFrame(frame);observer.disconnect();
      canvas.removeEventListener('pointerdown',pointerStart);
      canvas.removeEventListener('pointermove',pointerMove);
      canvas.removeEventListener('pointerup',pointerEnd);
      canvas.removeEventListener('pointercancel',pointerEnd);
      canvas.removeEventListener('webglcontextlost',lost);
      window.removeEventListener('keydown',keyDown);
      window.removeEventListener('keyup',keyUp);
      modelMixer?.stopAllAction();
      for(const enemy of guards)enemy.mixer?.stopAllAction();
      scene.traverse(obj=>{
        if(obj instanceof THREE.Mesh && !geometries.includes(obj.geometry))obj.geometry.dispose();
      });
      geometries.forEach(g=>g.dispose());
      materials.forEach(m=>m.dispose());
      textures.forEach(t=>t.dispose());
      renderer.dispose();
      canvas.remove();
    }
  };
}
