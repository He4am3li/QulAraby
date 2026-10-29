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
  onWeaponChange?: (tier:number) => void;
  onSafeReady?: (index:number) => void;
  onAmmoChange?: (loaded:number,reserve:number) => void;
  onLoot?: (index:number) => void;
  onError: (message:string) => void;
};
type Combatant = { root:THREE.Group; body:THREE.Group; fallback:THREE.Group; mixer:THREE.AnimationMixer|null; action:THREE.AnimationAction|null; hp:number; maxHp:number; cooldown:number; dying:number; alive:boolean; isBoss:boolean; awareness:number; alerted:boolean; };
type Room = { info:typeof SECRET_ROOMS[number]; group:THREE.Group; door:THREE.Group; doorAngle:number; doorTarget:number; safes:{door:THREE.Group; opened:number; target:number; name:THREE.Sprite; indicator:THREE.MeshBasicMaterial; contents:THREE.Group}[]; reward:THREE.Group; enemies:Combatant[]; prepared:boolean;};
type Traverse = {type:'intro'|'enter'|'exit';time:number;duration:number;from:THREE.Vector3;to:THREE.Vector3;fromYaw:number;toYaw:number; room?:Room};
type Trail = { mesh:THREE.Mesh; age:number; lifespan:number };
const lerp=THREE.MathUtils.lerp;
const clamp=THREE.MathUtils.clamp;
const ease=(n:number)=>n*n*(3-2*n);

const tex=(kind:'wall'|'ground'|'wood'|'steel')=>{
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
  const g=canvas.getContext('2d')!;
  const ground=kind==='ground';const wall=kind==='wall';
  g.fillStyle=ground?'#9a9890':wall?'#8b9391':kind==='wood'?'#79644b':'#697477';
  g.fillRect(0,0,256,256);
  // Deterministic speckled grime, joint lines, scratches and surface roughness.
  for(let i=0;i<1200;i++){
    const x=(i*97+19)%256,y=(i*151+31)%256,v=(i%9);
    g.fillStyle=v<4?'rgba(24,30,31,.065)':'rgba(243,244,236,.07)';
    g.fillRect(x,y,1+(i%5),1+(i%3));
  }
  if(ground) {
    for(let y=0;y<256;y+=36){g.strokeStyle='#30353530';g.lineWidth=2;g.beginPath();g.moveTo(0,y);g.lineTo(256,y);g.stroke();}
    for(let x=0;x<256;x+=52){g.strokeStyle='#383c3940';g.beginPath();g.moveTo(x,0);g.lineTo(x,256);g.stroke();}
  }else if(wall){
    for(let y=0;y<256;y+=82){g.strokeStyle='#e2e6dd32';g.lineWidth=3;g.beginPath();g.moveTo(0,y);g.lineTo(256,y);g.stroke();}
    for(let x=0;x<256;x+=100){g.strokeStyle='#343a3a28';g.lineWidth=2;g.beginPath();g.moveTo(x,0);g.lineTo(x,256);g.stroke();}
  }else{
    for(let i=0;i<38;i++){
      g.strokeStyle=i%2?'#ecddac15':'#2b303020';
      g.lineWidth=1+(i%3);
      g.beginPath();g.moveTo(0,(i*37)%256);g.lineTo(256,((i*37)%256)+2);g.stroke();
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
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,phone?0.75:1.25));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.35;
  renderer.shadowMap.enabled=!phone;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);
  renderer.domElement.style.touchAction='none';
  const scene=new THREE.Scene();
  scene.background=new THREE.Color('#111b23');
  scene.fog=new THREE.FogExp2('#182a32',.012);
  const camera=new THREE.PerspectiveCamera(phone?69:65,1,.07,140);
  scene.add(new THREE.HemisphereLight('#b4cbd5','#202c32',phone?1.65:1.95));
  const mainLight=new THREE.DirectionalLight('#f4e3c8',phone?1.8:2.2);
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
  // Cinematic visual identity: amber guidance runway, blue security conduits
  // and periodic red restricted-sector beacons. Emissive geometry is cheap on mobile.
  const guideGlow=material(new THREE.MeshBasicMaterial({color:'#d99a4f'}));
  const securityGlow=material(new THREE.MeshBasicMaterial({color:'#5bbac7'}));
  const alertGlow=material(new THREE.MeshBasicMaterial({color:'#dd6256'}));
  for(let z=18;z>-65;z-=2.7){
    for(const x of [-2.82,2.82])poly(corridor,[.045,.012,1.35],guideGlow,[x,-.02,z]);
  }
  for(let z=12;z>-65;z-=12){
    for(const x of [-3.11,3.11]){
      poly(corridor,[.08,.08,.62],alertGlow,[x,2.76,z]);
      poly(corridor,[.08,.11,.78],securityGlow,[x,1.08,z-2.1]);
    }
  }
    // Architectural rhythm: recessed wall armor, warning stripes and overhead
  // ribs make the bunker read as a designed military facility, not a box maze.
  const armorPanel=material(new THREE.MeshStandardMaterial({color:'#293c43',metalness:.62,roughness:.48}));
  const cautionStripe=material(new THREE.MeshBasicMaterial({color:'#dc9b54'}));
  for(let z=16;z>-65;z-=6){
    for(const side of [-1,1]){
      const x=side*3.08;
      poly(corridor,[.08,1.24,2.1],armorPanel,[x,1.84,z]);
      poly(corridor,[.095,.055,1.78],cautionStripe,[x,2.56,z]);
      poly(corridor,[.095,.055,1.78],securityGlow,[x,1.08,z]);
    }
    poly(corridor,[6.12,.17,.14],armorPanel,[0,3.39,z]);
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
    // Each sector has its own cinematic color signature and physical light strips.
    const sectorColor=info.id==='depot'?'#e9aa61':info.id==='comms'?'#55d1df':info.id==='archive'?'#6bd5a3':'#ee6961';
    const sectorStrip=material(new THREE.MeshBasicMaterial({color:sectorColor}));
    for(const x of [-4.55,4.55])poly(group,[.09,.045,8.7],sectorStrip,[x,3.37,0]);
    poly(group,[3.2,.04,.09],sectorStrip,[0,3.4,-4.72]);
    const point=new THREE.PointLight(sectorColor,phone?9:16,13,2);
    point.position.set(0,2.8,1);group.add(point);
    // Sector architecture: reinforced bulkhead ribs and illuminated floor
    // threshold. Shared materials avoid extra texture downloads on phones.
    for(const x of [-4.7,4.7]){
      for(const zz of [0,3.3]){
        poly(group,[.18,2.6,.16],armorPanel,[x,1.4,zz]);
        poly(group,[.2,.055,.68],sectorStrip,[x,2.86,zz]);
      }
    }
    for(const xx of [-3.6,3.6])poly(group,[.13,.012,6.8],sectorStrip,[xx,-.025,0]);
    // Distinct functional silhouettes make each sector readable without
    // expensive textures or extra geometry outside the camera frustum.
    if(info.id==='depot'){
      for(const x of [-3.85,3.85]){
        for(let level=0;level<3;level++){
          poly(group,[.64,.1,2.7],steel,[x,.48+level*.68,1.05]);
          for(const zz of [.12,1.1,1.95])poly(group,[.42,.42,.5],level===1?amber:armorPanel,[x,.76+level*.68,zz]);
        }
      }
    }else if(info.id==='comms'){
      for(const x of [-3.9,3.9]){
        poly(group,[.62,1.95,2.25],black,[x,1.13,1.1]);
        for(const zz of [.4,1.1,1.8])poly(group,[.07,.38,.45],cyan,[x-Math.sign(x)*.35,1.7,zz]);
      }
      for(const x of [-2.1,0,2.1])poly(group,[.95,.06,.65],steel,[x,2.93,1.5]);
    }else if(info.id==='archive'){
      for(const x of [-4.15,4.15]){
        for(const zz of [-1.1,.3,1.7]){
          poly(group,[.42,2.15,.78],trim,[x,1.12,zz]);
          for(const h of [.58,1.1,1.62])poly(group,[.46,.08,.68],tan,[x,h,zz]);
        }
      }
    }else{
      for(const x of [-3.9,3.9]){
        poly(group,[.55,2.75,1.15],black,[x,1.35,.45]);
        for(const h of [.5,1.2,1.9])poly(group,[.6,.08,.85],red,[x,h,.45]);
      }
      round(group,.72,.2,red,[0,2.85,.7],12).rotation.x=Math.PI/2;
    }
    // Actual articulated safes, each numbered and unlocked separately.
    const safes:Room['safes']=[];
    const farX=side*2.55;
    for(let i=0;i<4;i++){
      const safeX=-3.32+i*2.18;
      const cabinet=new THREE.Group();cabinet.position.set(safeX,0,-3.95);group.add(cabinet);
      poly(cabinet,[1.68,2.25,1.45],trim,[0,1.13,0]);
      // Interior shelves and visible contents are revealed by the actual hinged door.
      poly(cabinet,[1.47,1.99,.1],black,[0,1.13,.78]);
      poly(cabinet,[1.38,.07,1.17],steel,[0,.57,.04]);
      poly(cabinet,[1.38,.07,1.17],steel,[0,1.28,.04]);
      const contents=new THREE.Group();cabinet.add(contents);
      // Physical loot silhouettes: magazines, armor, targeting modules and
      // the final weapon cache are visible only after each door swings open.
      if(info.id!=='vault'){
        const lootColor=i===0?amber:i===1?green:i===2?cyan:steel;
        for(let n=0;n<(i===0?3:1);n++){
          const dims:[number,number,number]=i===0?[.16,.43,.23]:i===1?[.83,.62,.22]:i===2?[.55,.32,.5]:[1.1,.3,.5];
          poly(contents,dims,lootColor,[(n-1)*.29,i===1?.86:1.37,.28]);
        }
      }
      for(let item=0;item<3;item++){
        const isPaper=info.id==='vault';
        const x=-.43+item*.43;
        poly(contents,isPaper?[.31,.025,.48]:[.24,.35,.3],
          isPaper?tan:item===2?amber:cyan,[x,isPaper?1.37:.82,.08]);
        if(isPaper)poly(contents,[.24,.008,.025],black,[x,1.39,.1]);
      }
      const joint=new THREE.Group();joint.position.set(-.72,0,.83);cabinet.add(joint);
      poly(joint,[1.43,1.97,.13],steel,[.71,1.13,0]);
      poly(joint,[1.16,.1,.05],i===3?amber:cyan,[.71,1.93,.1]);
      round(joint,.1,.13,black,[1.15,1.04,.11],12).rotation.x=Math.PI/2;
      const indicator=material(new THREE.MeshBasicMaterial({color:0xff3c42}));
      poly(joint,[.28,.08,.045],indicator,[1.13,1.48,.1]);
      poly(cabinet,[1.54,.09,.12],tan,[0,.11,.78]);
      const key=makeLabel(language==='ar'?'خزنة '+(i+1):'SAFE '+(i+1));
      textures.push(key);
      const label=new THREE.Sprite(material(new THREE.SpriteMaterial({map:key,transparent:true,depthWrite:false})));
      label.position.set(0,2.53,.6);label.scale.set(1.36,.38,1);cabinet.add(label);
      safes.push({door:joint,opened:0,target:0,name:label,indicator,contents});
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
    // Wall-mounted mission terminal replaces the large freestanding console.
    // The old console sat directly between the third-person camera and hero,
    // filling the foreground and hiding the playable operator.
    const terminal=new THREE.Group();terminal.position.set(side*4.96,1.67,2.25);group.add(terminal);
    poly(terminal,[.15,1.16,1.66],trim,[0,0,0]);
    poly(terminal,[.17,.87,1.39],black,[-side*.02,0,0]);
    poly(terminal,[.18,.12,1.12],iColor(info.id),[-side*.04,.21,0]);
    for(let line=0;line<3;line++)poly(terminal,[.18,.035,.9-line*.17],sectorStrip,[-side*.05,-.03-line*.16,0]);
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
  const heroArms:THREE.Mesh[]=[];
  const heroHands:THREE.Mesh[]=[];
  // A low-poly reach rig stays available even when the remote GLTF soldier
  // has no compatible hand bones. It is shown only during interactions.
  const interactionHands=new THREE.Group();playerRoot.add(interactionHands);
  const interactionSleeves:THREE.Mesh[]=[];
  let skeletalHands:THREE.Bone[]=[];
  let weaponGrip:THREE.Bone|null=null;
  let skeletalShoulders:THREE.Bone[]=[];
  const lastReachRotations=new Map<THREE.Bone,THREE.Quaternion>();
  for(const side of [-1,1]){
    const sleeve=round(interactionHands,.115,.48,armor,[side*.28,1.12,-.3]);
    sleeve.rotation.x=Math.PI/2.8;
    interactionSleeves.push(sleeve);
    round(interactionHands,.115,.18,skin,[side*.28,1.18,-.58]);
  }
  interactionHands.visible=false;
  for(const side of [-1,1]){
    const arm=round(heroFallback,.13,.75,armor,[side*.49,1.28,-.13]);arm.rotation.z=side*.18;
    heroArms.push(arm);
    const hand=round(heroFallback,.12,.24,skin,[side*.49,.84,-.22]);
    heroHands.push(hand);
    round(heroFallback,.17,.9,camo,[side*.20,.52,0]);
    poly(heroFallback,[.28,.2,.4],black,[side*.19,.12,-.1]);
  }
  const heroWeapon=new THREE.Group();playerRoot.add(heroWeapon);
  // The body-mounted fallback remains visible even if a downloaded soldier
  // lacks compatible hand bones. An articulated hand grip is added below.
  const weaponBarrel=poly(heroWeapon,[.15,.16,.91],black,[0,0,-.33]);
  poly(heroWeapon,[.26,.14,.55],steel,[0,.11,-.18]);
  poly(heroWeapon,[.13,.32,.16],black,[0,-.22,.06]);
  const weaponLight=material(new THREE.MeshBasicMaterial({color:'#a6effa'}));
  const muzzle=poly(heroWeapon,[.19,.19,.25],weaponLight,[0,.02,-.86]);
  poly(heroWeapon,[.08,.09,.1],amber,[0,.2,-.49]);
  // Visible, gameplay-earned upgrades, not a number-only weapon level.
  const upgradeRail=poly(heroWeapon,[.28,.065,.7],steel,[0,.24,-.36]);
  const upgradeCoil=round(heroWeapon,.17,.36,weaponLight,[0,.02,-.68],12);
  upgradeCoil.rotation.x=Math.PI/2;
  const upgradeScope=poly(heroWeapon,[.19,.16,.34],black,[0,.34,-.4]);
  const upgradeEmitter=poly(heroWeapon,[.29,.14,.3],amber,[0,.01,-.87]);
  upgradeRail.visible=upgradeCoil.visible=upgradeScope.visible=upgradeEmitter.visible=false;
  let model:THREE.Group|null=null,modelMixer:THREE.AnimationMixer|null=null,modelAction:THREE.AnimationAction|null=null;
  const clips=new Map<string,THREE.AnimationAction>();
  let locomotionState='idle';
  let locomotionBlend=0;
  const guards:Combatant[]=[];
  const guardAnimations:THREE.AnimationClip[]=[];
  const dressGuard=(enemy:Combatant)=>{
    if(phone||!model||enemy.isBoss||!enemy.alive||enemy.mixer)return;
    const copy=cloneSkeleton(model) as THREE.Group;
    // Keep the animated rig at the same scale as the playable operator.
    copy.scale.copy(model.scale);
    // Enemy uniforms must not reuse the player's green military outfit.
    // Clone materials before tinting, otherwise the original hero changes too.
    copy.traverse(node=>{
      if(!(node instanceof THREE.Mesh))return;
      const recolor=(mat:THREE.Material):THREE.Material=>{
        const own=mat.clone();
        if(own instanceof THREE.MeshStandardMaterial){
          own.color.multiply(new THREE.Color('#ad7d70'));
          own.roughness=Math.max(.7,own.roughness);
        }
        return own;
      };
      node.material=Array.isArray(node.material)?node.material.map(recolor):recolor(node.material);
    });
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
  // Separate tactical palettes remain visible even on low-end phones,
  // where skeletal guard models are deliberately disabled for performance.
  const guardCloth=material(new THREE.MeshStandardMaterial({color:'#65564b',roughness:.9}));
  const guardVest=material(new THREE.MeshStandardMaterial({color:'#8c7564',roughness:.78}));
  const guardHelmet=material(new THREE.MeshStandardMaterial({color:'#413b37',roughness:.85}));
  const enemyFallback=(parent:THREE.Group,boss=false)=>{
    const g=new THREE.Group();parent.add(g);
    if(boss){
      // Heavy autonomous multi-barrel defense cannon, visually different
      // from the human guards and resistant to the starter energy weapon.
      poly(g,[2.35,.3,2.2],black,[0,.23,0]);
      for(const x of [-.95,.95])for(const z of [-.78,.78]){
        poly(g,[.22,.58,.27],steel,[x,.42,z]);
        poly(g,[.27,.12,.34],trim,[x,.12,z]);
      }
      round(g,.9,.52,trim,[0,.87,0],16);
      poly(g,[1.95,.76,1.4],steel,[0,1.48,0]);
      poly(g,[1.75,.51,.85],black,[0,1.51,-.63]);
      poly(g,[.88,.31,.08],red,[0,1.64,-1.09]);
      for(const x of [-.53,0,.53]){
        const gun=round(g,.14,1.44,trim,[x,1.53,-1.43]);
        gun.rotation.x=Math.PI/2;
        const tip=round(g,.17,.14,red,[x,1.53,-2.2]);
        tip.rotation.x=Math.PI/2;
      }
      poly(g,[.96,.25,.53],tan,[0,2.04,.1]);
      return g;
    }
    if(!boss){
      round(g,.32,.17,guardHelmet,[0,2.1,0]);
      poly(g,[.64,.17,.12],guardHelmet,[0,1.99,-.2]);
    }
    poly(g,boss?[1.65,1.5,1.0]:[.73,.87,.39],boss?trim:guardCloth,[0,boss?1.42:1.29,0]);
    poly(g,boss?[1.5,.58,.7]:[.65,.48,.25],boss?black:guardVest,[0,boss?1.68:1.37,-.22]);
    round(g,boss?.43:.24,boss?.46:.31,boss?trim:skin,[0,boss?2.18:1.91,0]);
    for(const side of [-1,1]){
      const arm=round(g,boss?.22:.13,boss?.89:.72,boss?steel:guardVest,[side*(boss?.93:.46),boss?1.42:1.28,0]);
      arm.rotation.z=side*.16;
      round(g,boss?.25:.16,boss?1.0:.87,boss?trim:guardCloth,[side*(boss?.42:.2),.55,0]);
    }
    poly(g,[.22,.17,.77],black,[.39,1.19,-.45]);
    poly(g,[.22,.23,.19],boss?red:amber,[.39,1.22,-.87]);
    return g;
  };
  // Retain one set of combatants per room. Previously, every re-entry or
  // retry created fresh meshes, cloned rigs and animation mixers; mobile GPU
  // memory and frame time would grow with every attempt.
  const spawnGuards=(room:Room)=>{
    guards.length=0;
    const boss=room.info.id==='vault';
    const count=boss?1:room.info.guards;
    if(room.enemies.length===count){
      room.enemies.forEach((enemy,i)=>{
        enemy.root.visible=true;
        enemy.root.position.set((i-(count-1)/2)*2.45,0,boss?-1.75:-.6-(i%2)*.6);
        enemy.root.rotation.set(0,Math.PI,0);
        enemy.root.scale.set(1,1,1);
        enemy.hp=enemy.maxHp;
        enemy.cooldown=3.2+i*.65;
        enemy.dying=0;
        enemy.alive=true;
        enemy.awareness=0;
        enemy.alerted=boss;
        enemy.mixer?.stopAllAction();
        enemy.action?.reset().play();
        dressGuard(enemy);
        guards.push(enemy);
      });
      events.onThreats(guards.length);
      return;
    }
    room.enemies=[];
    for(let i=0;i<count;i++){
      const root=new THREE.Group();room.group.add(root);
      root.position.set((i-(count-1)/2)*2.45,0,boss?-1.75:-.6-(i%2)*.6);
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
    // Resolve actual skeleton hands once; when available, drive them through
    // their existing joints instead of displaying detached overlay arms.
    skeletalHands=[];skeletalShoulders=[];lastReachRotations.clear();weaponGrip=null;
    for(const side of ['left','right']){
      let candidate:THREE.Bone|null=null;
      model.traverse(node=>{
        if(candidate||!(node instanceof THREE.Bone))return;
        const name=node.name.toLowerCase().replace(/[^a-z]/g,'');
        if(name.includes(side)&&name.includes('hand'))candidate=node;
      });
      if(candidate){
        skeletalHands.push(candidate);
        if(side==='right')weaponGrip=candidate;
        let upper:THREE.Object3D|null=candidate.parent;
        while(upper&&upper!==model){
          if(upper instanceof THREE.Bone&&/upper.?arm|shoulder/i.test(upper.name))break;
          upper=upper.parent;
        }
        if(upper instanceof THREE.Bone)skeletalShoulders.push(upper);
      }
    }
    modelMixer=new THREE.AnimationMixer(model);
    for(const anim of gltf.animations){
      const action=modelMixer.clipAction(anim);
      action.enabled=true;
      clips.set(anim.name.toLowerCase(),action);
    }
    modelAction=clips.get('idle')||null;modelAction?.play();
    for(const guard of guards)dressGuard(guard);
    // Use a body-space grip as a reliable initial pose; the update loop
    // tracks the animated right hand without inheriting unpredictable GLB
    // wrist axes that can bury the rifle inside the soldier mesh.
    heroWeapon.position.set(.38,1.15,-.48);
    heroWeapon.rotation.set(-.18,-.12,0);
    heroWeapon.scale.setScalar(.9);
  },undefined,()=>{/* If remote GLB fails, use local 3D fallback. */});

  // Weapon effects (energy bolt, recoil flash, tracers) pooled to avoid allocations.
  const trails:Trail[]=[];
  const spareTrails:THREE.Mesh[]=[];
  const boltGeo=geometry(new THREE.CylinderGeometry(.055,.07,1,8));
  const makeTrail=(from:THREE.Vector3,to:THREE.Vector3,color:THREE.Material,life=.22)=>{
    // Reuse tracer meshes instead of allocating each time anyone fires.
    const beam=spareTrails.pop() ?? new THREE.Mesh(boltGeo,color);
    beam.material=color;
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
  let velocityX=0,velocityZ=0;
  const input={forward:0,strafe:0};
  let touchTriggerHeld=false;
  const camSpot=new THREE.Vector3();
  const lookSpot=new THREE.Vector3();
  let camFollow=true;
  let phase:SecretPhase='intro';
  let activeRoom:Room|null=null;
  let nearby:SecretRoomId|null=null;
  let transition:Traverse|null=null;
  let hp=100;
  let weaponTier=0;
  let unlockedWeaponTier=0;
  let nextShotAt=0;
  let shotKick=0;
  let muzzleFlashUntil=0;
  let hitFeedbackUntil=0;
  let lastHitAt=-10000;
  let gateProgress=0;
  let safeIndex=0;
  let safeApproach:{index:number;ready:boolean;arrivedAt:number}|null=null;
  let safeUnlockUntil=0;
  let safeDoorReleaseAt=0;
  let safeDoorPending:{index:number;room:Room}|null=null;
  let safeInteractionStart=0;
  let safeInteractionEnd=0;
  let safePickupUntil=0;
  let safePickupIndex=-1;
  // A single reusable 3D pickup travels from the opened safe to the operator.
  const pickupModel=new THREE.Group();scene.add(pickupModel);
  const pickupCore=poly(pickupModel,[.32,.28,.32],amber,[0,0,0]);
  const pickupRing=round(pickupModel,.25,.07,cyan,[0,0,0],12);
  pickupRing.rotation.x=Math.PI/2;
  pickupModel.visible=false;
  let pickupOrigin=new THREE.Vector3();
  let pickupStarted=0;
  let pickupAwardPending=-1;
  let safeLootPending:{index:number;at:number}|null=null;
  let ammo=24,reserveAmmo=96;
  const emitAmmo=()=>events.onAmmoChange?.(ammo,reserveAmmo);
  const reload=()=>{
    if(ammo>=24||reserveAmmo<=0||!['combat','safes'].includes(phase))return;
    const amount=Math.min(24-ammo,reserveAmmo);
    ammo+=amount;reserveAmmo-=amount;emitAmmo();
  };
  let upgradePulseUntil=0;
  let weaponEvolutionStart=0;
  let weaponEvolutionFrom=0;
  let weaponEvolutionTo=0;
  let rewardCollected=false;
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
    // The four rear cabinets occupy physical floor space. Prevent the
    // operator from walking through their fronts, while keeping the
    // educational lock interaction reachable from the aisle.
    // Resolve against cabinet footprints, allowing sideways sliding instead
    // of pinning the operator against an invisible wall across the aisle.
    for(const cabinetX of [-3.32,-1.14,1.04,3.22]){
      // Recompute after every correction: adjacent cabinet hitboxes can
      // overlap and using the original coordinates causes jitter/sticking.
      const dx=p.x-room.group.position.x-cabinetX;
      const dz=p.z-room.info.z+3.95;
      const overlapX=1.02-Math.abs(dx);
      const overlapZ=1.09-Math.abs(dz);
      if(overlapX<=0||overlapZ<=0)continue;
      if(overlapX<overlapZ){
        p.x+=Math.sign(dx||1)*(overlapX+.002);
        velocityX=0;
      }else{
        p.z+=Math.sign(dz||1)*(overlapZ+.002);
        velocityZ=0;
      }
    }
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
    velocityX=velocityZ=0;
    const available=rooms.find(r=>r.info.id===(id??nearby));
    if(!available||!roomAvailable(available.info.id,allowedRooms))return false;
    // Selecting a room from the mission map should work even when the player
    // is farther down the corridor. The guided transition avoids requiring
    // precise movement on touch screens.
    if(Math.abs(player.z-available.info.z)>3.9){
      player.set(0,0,available.info.z+1.5);
      controls.clear();input.forward=0;input.strafe=0;
    }
    activeRoom=available;
    available.doorTarget=available.info.side===1?1.6:-1.6;
    // Two-beat breach: line up at the door, then cross the threshold
    // before turning to face the threat. No sideways sliding animation.
    transitionTo('enter',new THREE.Vector3(available.group.position.x,0,available.info.z+1.8),
      0,2.0,available);
    emit('room-enter',available.info.id);
    return true;
  };
  const travelTo=(id:SecretRoomId)=>{
    const r=rooms.find(v=>v.info.id===id);
    if(!r||!allowedRooms.includes(id))return false;
    if(phase==='intro'){start();return true;}
    if(phase!=='hall')return false;
    // Mission-map selection enters the chosen room directly rather than
    // forcing a second tap after a long corridor animation.
    return enterRoom(id);
  };
  const resetThreats=()=>{
    if(!activeRoom)return;
    hp=100;events.onHealth(hp);
    activeRoom.safes.forEach(s=>{s.target=0;s.opened=0;s.contents.visible=true;s.indicator.color.setHex(0xff3c42);});
    activeRoom.reward.visible=false;
    safeIndex=0;
    safeApproach=null;
    safeLootPending=null;
    safeDoorPending=null;
    safeInteractionStart=safeInteractionEnd=0;
    safePickupUntil=0;safePickupIndex=-1;pickupAwardPending=-1;pickupModel.visible=false;
    rewardCollected=false;
    spawnGuards(activeRoom);
    emit('combat',activeRoom.info.id);
  };
  const exitRoom=()=>{
    if(!activeRoom||!['combat','safes','boss-defeated','dead'].includes(phase))return;
    const r=activeRoom;
    transitionTo('exit',new THREE.Vector3(0,0,r.info.z+2.45),0,1.8,r);
    emit('room-exit',r.info.id);
  };
  const approachSafe=(index:number)=>{
    if(phase!=='safes'||!activeRoom||index!==safeIndex||safeApproach)return false;
    safeApproach={index,ready:false,arrivedAt:0};
    controls.clear();input.forward=input.strafe=0;velocityX=velocityZ=0;
    return true;
  };
  const openSafe=(index:number)=>{
    if(phase!=='safes'||!activeRoom||index!==safeIndex||!safeApproach?.ready)return false;
    const box=activeRoom.safes[index];if(!box||box.target!==0)return false;
    // First the operator keys the code, then physically releases the latch.
    // The door motor does not start until the reach animation completes.
    const now=performance.now();
    safeInteractionStart=now;
    safeInteractionEnd=now+2100;
    safeDoorReleaseAt=now+600;
    safeDoorPending={index,room:activeRoom};
    safeUnlockUntil=now+1400;
    upgradePulseUntil=now+2100;
    // Every cabinet contributes a tangible gameplay reward. The final one
    // unlocks the next weapon tier and updates its physical attachment rig.
    // Reward is granted only when the door has visibly opened, not when
    // the player merely answers the educational question.
    safeLootPending={index,at:performance.now()+2100};
    if(index===3)activeRoom.reward.visible=true;
    safeIndex++;
    safeApproach=null;
    return true;
  };
  const collectReward=()=>{
    if(phase!=='safes'||!activeRoom||safeIndex<4||rewardCollected)return false;
    rewardCollected=true;
    upgradePulseUntil=performance.now()+2400;
    activeRoom.reward.visible=false;
    return true;
  };
  const setWeaponTier=(tier:number)=>{
    const previousTier=weaponTier;
    unlockedWeaponTier=Math.max(unlockedWeaponTier,clamp(tier,0,4));
    weaponTier=clamp(tier,0,unlockedWeaponTier);
    if(previousTier!==weaponTier){
      weaponEvolutionFrom=previousTier;
      weaponEvolutionTo=weaponTier;
      weaponEvolutionStart=performance.now();
      upgradePulseUntil=weaponEvolutionStart+1600;
    }
    events.onWeaponChange?.(weaponTier);
    muzzle.scale.setScalar(1+weaponTier*.19);
    upgradeRail.visible=weaponTier>=1;
    upgradeCoil.visible=weaponTier>=2;
    upgradeScope.visible=weaponTier>=3;
    upgradeEmitter.visible=weaponTier>=4;
    weaponLight.color.setHex(weaponTier>=3?0xf1ba6c:weaponTier>=2?0x9cf3b4:0xa6effa);
  };
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
  // Shared two-dimensional cabinet occlusion for player and enemy projectiles.
  const cabinetOccludes=(from:THREE.Vector3,to:THREE.Vector3,room:Room)=>{
    const a=room.group.worldToLocal(from.clone());
    const b=room.group.worldToLocal(to.clone());
    const dx=b.x-a.x,dz=b.z-a.z;
    const lengthSq=dx*dx+dz*dz;
    if(lengthSq<.0001)return false;
    return [-3.32,-1.14,1.04,3.22].some(x=>{
      const t=clamp(((x-a.x)*dx+(-3.95-a.z)*dz)/lengthSq,0,1);
      return t>.02&&t<.98&&Math.hypot(a.x+t*dx-x,a.z+t*dz+3.95)<.87;
    });
  };
  const fire=()=>{
    if(!['combat','safes'].includes(phase)||hp<=0||paused||document.hidden)return false;
    // Frame-independent fire cadence prevents input-spam from bypassing
    // combat progression. Upgraded weapons have faster trigger response.
    const now=performance.now();
    if(now<nextShotAt)return false;
    if(phase==='safes'&&(safeApproach||now<safeInteractionEnd||now<safePickupUntil||pickupAwardPending>=0))return false;
    if(ammo<=0){reload();return false;}
    ammo--;emitAmmo();
    nextShotAt=now+(weaponTier>=3?210:weaponTier>=2?280:360);
    shotKick=Math.min(.22,shotKick+.11);
    muzzleFlashUntil=now+75;
    const origin=new THREE.Vector3();
    muzzle.getWorldPosition(origin);
    if(!Number.isFinite(origin.x)||origin.distanceTo(player)>3)origin.copy(player).add(new THREE.Vector3(0,1.35,0));
    const direction=new THREE.Vector3(-Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch));
    let best:Combatant|null=null,closestAngle=-1;
    const eye=player.clone().add(new THREE.Vector3(0,1.65,0));
    for(const enemy of guards){
      if(!enemy.alive)continue;
      const at=enemy.root.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,enemy.isBoss?1.7:1.35,0));
      const dist=eye.distanceTo(at);
      if(dist>20)continue;
      const dot=direction.dot(at.clone().sub(eye).normalize());
      // Use the target's angular footprint: a nearby guard is easier to hit,
      // while distant targets require a more accurate aim. Mobile keeps
      // slightly more forgiving aiming without firing through cover.
      const angularRadius=Math.atan2(enemy.isBoss?1.05:.46,Math.max(1,dist));
      const aimCone=phone?.16:.105;
      const threshold=Math.cos(angularRadius+aimCone);
      if(dot>threshold&&dot>closestAngle&&(!activeRoom||!cabinetOccludes(eye,at,activeRoom))){
        best=enemy;closestAngle=dot;
      }
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
      // Non-lethal impacts briefly stagger the guard, visibly confirming
      // that the projectile connected without disrupting pursuit logic.
      if(best.hp>0&&damage>0){
        best.root.rotation.z=Math.min(.23,best.root.rotation.z+.13);
        best.cooldown=Math.max(best.cooldown,.42);
      }
      if(best.hp<=0){
        best.alive=false;best.dying=0;
        events.onThreats(guards.filter(g=>g.alive).length);
        if(!guards.some(g=>g.alive)){
          if(activeRoom?.info.id==='vault')emit('boss-defeated','vault');
          emit('safes',activeRoom?.info.id);
        }
      }
    }
    if(hit){hitFeedbackUntil=performance.now()+125;lastHitAt=performance.now();}
    events.onShot(hit);return hit;
  };
  const controls=new Set<string>();
  const keyDown=(event:KeyboardEvent)=>{
    if((event.target as HTMLElement)?.closest('input,textarea,select,[role=dialog]'))return;
    const key=event.key.toLowerCase();controls.add(key);
    if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(key))event.preventDefault();
    if(key==='shift')sprint=true;
    if(event.code==='Space'&&!event.repeat)jump();
    if(key==='c'&&!event.repeat)setCrouch(!crouch);
    if(key==='e'&&!event.repeat)enterRoom();
    if(key==='f'&&!event.repeat)fire();
    if(key==='r'&&!event.repeat)reload();
    // 1–5 select only weapons already earned from educational objectives.
    if(/^[1-5]$/.test(key)&&!event.repeat){
      const selected=Number(key)-1;
      if(selected<=unlockedWeaponTier)setWeaponTier(selected);
    }
    if(key==='escape')exitRoom();
  };
  const keyUp=(e:KeyboardEvent)=>{controls.delete(e.key.toLowerCase());if(e.key.toLowerCase()==='shift')sprint=false;};
  // Release held keys when focus leaves the game to avoid stuck movement/fire.
  const clearKeyboard=()=>{controls.clear();sprint=false;};
  window.addEventListener('blur',clearKeyboard);
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
    shotKick=THREE.MathUtils.damp(shotKick,0,13,dt);
    // Hit-confirmation pulse gently fades; no additional geometry or textures.
    const hitAge=Math.max(0,now-lastHitAt);
    const hitPulse=hitAge<180?1+(.35*(1-hitAge/180)):1;
    muzzle.scale.setScalar((1+weaponTier*.19)*(now<muzzleFlashUntil?1.8:1)*(now<upgradePulseUntil?1.3:1));
    // An actual 3D weapon transformation accompanies every earned tier.
    const evolutionAge=now-weaponEvolutionStart;
    const evolving=weaponEvolutionStart>0&&evolutionAge>=0&&evolutionAge<1600;
    const evolutionPulse=evolving?Math.sin(Math.PI*evolutionAge/1600):0;
    const tierShape=1+weaponTier*.075;
    heroWeapon.scale.set(tierShape*(1+evolutionPulse*.16),tierShape*(1+evolutionPulse*.16),tierShape*(1+evolutionPulse*.24));
    upgradeRail.scale.x=1+evolutionPulse*.4;
    upgradeCoil.scale.setScalar(1+evolutionPulse*.5);
    upgradeScope.scale.y=1+evolutionPulse*.45;
    upgradeEmitter.scale.setScalar(hitPulse*(1+evolutionPulse*.6));
    // A successful hit briefly changes the emitter color, giving immediate
    // readable feedback even on small touch screens.
    if(now<hitFeedbackUntil)weaponLight.color.setHex(0xffe0a0);
    else weaponLight.color.setHex(weaponTier>=3?0xf1ba6c:weaponTier>=2?0x9cf3b4:0xa6effa);
    if(controls.has('f')||touchTriggerHeld)fire();
    if(safeDoorPending&&now>=safeDoorReleaseAt){
      safeDoorPending.room.safes[safeDoorPending.index].target=-1.65;
      safeDoorPending.room.safes[safeDoorPending.index].indicator.color.setHex(0x6dffae);
      safeDoorPending=null;
    }
    if(safeLootPending&&now>=safeLootPending.at){
      const {index}=safeLootPending;safeLootPending=null;
      safePickupIndex=index;
      safePickupUntil=now+850;
      pickupStarted=now;
      if(activeRoom){
        // Transfer the actual cabinet item into the flying pickup rather
        // than showing a duplicate in the open safe.
        activeRoom.safes[index].contents.visible=false;
        pickupOrigin.set(activeRoom.group.position.x-3.32+index*2.18,1.35,activeRoom.info.z-3.35);
        pickupModel.position.copy(pickupOrigin);
        pickupModel.visible=true;
        pickupCore.material=index===0?amber:index===1?green:index===2?cyan:steel;
      }
      // Do not award loot before its physical pickup animation completes.
      pickupAwardPending=index;
    }
    if(pickupAwardPending>=0&&now>=safePickupUntil){
      const index=pickupAwardPending;pickupAwardPending=-1;
      if(activeRoom)activeRoom.safes[index].contents.visible=false;
      if(index===0){reserveAmmo+=36;reload();}
      if(index===1){hp=Math.min(100,hp+25);events.onHealth(Math.round(hp));}
      if(index===2)upgradeCoil.visible=true;
      if(index===3&&activeRoom?.info.id!=='vault')setWeaponTier(Math.min(4,unlockedWeaponTier+1));
      upgradePulseUntil=now+1900;
      events.onLoot?.(index);
    }
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
    // After the guard fight, the operator physically rushes to each locked
    // safe. The question appears only after reaching and testing the lock.
    if(phase==='safes'&&activeRoom&&safeApproach&&!safeApproach.ready){
      const targetX=activeRoom.group.position.x-3.32+safeApproach.index*2.18;
      const targetZ=activeRoom.info.z-2.22;
      const dx=targetX-player.x,dz=targetZ-player.z;
      const distance=Math.hypot(dx,dz);
      const step=Math.min(distance,6.6*dt);
      if(distance>.001){player.x+=dx/distance*step;player.z+=dz/distance*step;}
      // Turn toward the next cabinet instead of strafing sideways.
      // Once there, face the keypad squarely for the interaction.
      const targetYaw=distance>.13?Math.atan2(-dx,-dz):0;
      yaw+=Math.atan2(Math.sin(targetYaw-yaw),Math.cos(targetYaw-yaw))*Math.min(1,dt*11);
      if(distance<.13){
        if(!safeApproach.arrivedAt){
          safeApproach.arrivedAt=now;
          activeRoom.safes[safeApproach.index].indicator.color.setHex(0xffbd54);
        }
        // Give the operator time to touch the keypad and discover that it
        // is code-locked before presenting the educational question.
        if(now-safeApproach.arrivedAt>=700){
          safeApproach.ready=true;
          events.onSafeReady?.(safeApproach.index);
        }
      }
    }
    let moving=false;
    if(transition){
      const t=clamp(transition.time/transition.duration,0,1);
      if(transition.type==='enter'&&transition.room){
        const r=transition.room;
        const staging=new THREE.Vector3(0,0,r.info.z+1.8);
        const through=new THREE.Vector3(r.group.position.x,0,r.info.z+1.8);
        if(t<.36){
          player.lerpVectors(transition.from,staging,ease(t/.36));
          yaw=0;
        }else if(t<.78){
          player.lerpVectors(staging,through,ease((t-.36)/.42));
          yaw=-r.info.side*Math.PI/2;
        }else{
          player.copy(through);
          yaw=lerp(-r.info.side*Math.PI/2,0,ease((t-.78)/.22));
        }
      }else{
        player.lerpVectors(transition.from,transition.to,ease(t));
        if(transition.type==='exit'&&transition.room){
          const dx=transition.to.x-transition.from.x;
          const dz=transition.to.z-transition.from.z;
          const facing=Math.atan2(-dx,-dz);
          yaw=lerp(transition.fromYaw,facing,ease(Math.min(1,t*3)));
          if(t>.8)yaw=lerp(facing,0,ease((t-.8)/.2));
        }else yaw=lerp(transition.fromYaw,transition.toYaw,ease(t));
      }
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
    }else if(phase==='safes'&&safeApproach&&!safeApproach.ready){
      // The operator must stop running while testing the keypad; otherwise
      // the walk/run animation continues in place during the lock close-up.
      velocityX=velocityZ=0;
      moving=!safeApproach.arrivedAt;
    }else if(['hall','combat','safes'].includes(phase)){
      const safeLocked=phase==='safes'&&(Boolean(safeApproach)||now<safePickupUntil||now<safeInteractionEnd);
      if(safeLocked){velocityX=THREE.MathUtils.damp(velocityX,0,12,dt);velocityZ=THREE.MathUtils.damp(velocityZ,0,12,dt);}
      else {
      const up=Number(controls.has('w')||controls.has('arrowup'))-Number(controls.has('s')||controls.has('arrowdown'));
      const right=Number(controls.has('d')||controls.has('arrowright'))-Number(controls.has('a')||controls.has('arrowleft'));
      let f=clamp(input.forward+up,-1,1),r=clamp(input.strafe+right,-1,1);
      const norm=Math.hypot(f,r)||1;f/=norm;r/=norm;
      const speed=crouch?.95:sprint?5.8:3.2;
      // Smooth acceleration/deceleration prevents robotic starts and stops.
      const desiredX=(-Math.sin(yaw)*f+Math.cos(yaw)*r)*speed;
      const desiredZ=(-Math.cos(yaw)*f-Math.sin(yaw)*r)*speed;
      const response=sprint?7.5:crouch?5.2:9.5;
      velocityX=THREE.MathUtils.damp(velocityX,desiredX,response,dt);
      velocityZ=THREE.MathUtils.damp(velocityZ,desiredZ,response,dt);
      player.x+=velocityX*dt;
      player.z+=velocityZ*dt;
      if(phase==='hall')limitCorridor(player);
      else if(activeRoom)roomBounds(player,activeRoom);
      moving=Math.abs(f)+Math.abs(r)>.04;
      if(player.y>0||vy>0){
        vy-=13*dt;player.y+=vy*dt;
        if(player.y<0){player.y=0;vy=0;}
      }
      }
    }
    playerRoot.position.copy(player);
    playerRoot.rotation.y=yaw;
    // Lean into strafing while running, giving the operator readable weight
    // and direction without requiring another downloaded animation clip.
    const lateralSpeed=(-Math.cos(yaw)*velocityX+Math.sin(yaw)*velocityZ);
    const targetLean=crouch?0:clamp(lateralSpeed*.035,-.12,.12);
    avatar.rotation.z=THREE.MathUtils.damp(avatar.rotation.z,targetLean,7,dt);
    // Reach toward the mechanical lock as its motor releases, then recover.
    const interacting=phase==='safes'&&now<safeUnlockUntil;
    // Keep the interaction lean; the old prone layer overwrote it every frame.
    avatar.rotation.x=THREE.MathUtils.damp(avatar.rotation.x,crouch?-1.22:interacting?-.22:0,7,dt);
    avatar.position.y=THREE.MathUtils.damp(avatar.position.y,crouch?.46:0,7,dt);
    avatar.position.z=THREE.MathUtils.damp(avatar.position.z,crouch?.32:0,7,dt);
    avatar.scale.y=THREE.MathUtils.damp(avatar.scale.y,crouch?.9:1,8,dt);
    const pickupActive=phase==='safes'&&now<safePickupUntil;
    if(pickupActive&&pickupModel.visible){
      const t=clamp((now-pickupStarted)/850,0,1);
      // Move toward the operator's forward-facing hand, even after the
      // character turns. A world-fixed Z offset caused sideways pickups.
      const destination=player.clone().add(new THREE.Vector3(-Math.sin(yaw)*.43,1.27,-Math.cos(yaw)*.43));
      pickupModel.position.lerpVectors(pickupOrigin,destination,ease(t));
      pickupModel.position.y+=Math.sin(Math.PI*t)*.38;
      pickupModel.rotation.y+=dt*7;
      pickupModel.scale.setScalar(Math.max(.04,1-t*.9));
    }else if(pickupModel.visible){pickupModel.visible=false;pickupModel.scale.setScalar(1);}
    const pickupProgress=pickupActive?1-(safePickupUntil-now)/850:0;
    const interactionElapsed=now-safeInteractionStart;
    const interactingSafe=phase==='safes'&&interactionElapsed>=0&&now<safeInteractionEnd;
    const probingSafe=phase==='safes'&&Boolean(safeApproach?.arrivedAt)&&!safeApproach?.ready;
    if(probingSafe&&activeRoom&&safeApproach){
      // The amber lock light blinks while the operator discovers the code
      // requirement, then remains steady when the challenge appears.
      const lamp=activeRoom.safes[safeApproach.index].indicator;
      lamp.color.setHex(Math.sin((now-safeApproach.arrivedAt)*.028)>0?0xffc25a:0x86511e);
    }
    const probeProgress=probingSafe&&safeApproach?clamp((now-safeApproach.arrivedAt)/700,0,1):0;
    const reach=interactingSafe?Math.sin(Math.PI*clamp(interactionElapsed/1500,0,1)):
      pickupActive?Math.sin(Math.PI*pickupProgress)*.8:
      probingSafe?Math.sin(Math.PI*probeProgress)*.65:0;
    interactionHands.visible=Boolean(model)&&skeletalHands.length===0&&(interactingSafe||pickupActive||probingSafe);
    if(interactionHands.visible){
      interactionHands.position.z=-reach*.24;
      interactionSleeves.forEach((sleeve,i)=>{sleeve.rotation.x=1.05-reach*.38;sleeve.rotation.z=(i===0?-.12:.12)*reach;});
    }
    heroArms.forEach((arm,index)=>{
      arm.rotation.x=THREE.MathUtils.damp(arm.rotation.x,reach*(index===0?-1.15:-.72),12,dt);
      arm.rotation.z=THREE.MathUtils.damp(arm.rotation.z,(index===0?-.18:.18)+reach*(index===0?.25:-.24),12,dt);
      // Position hands at the projected ends of the forearms so the operator
      // visibly reaches forward instead of only rotating rigid shoulder pieces.
      const extension=reach*.44;
      heroHands[index].position.z=THREE.MathUtils.damp(heroHands[index].position.z,-.22-extension,12,dt);
      heroHands[index].position.y=THREE.MathUtils.damp(heroHands[index].position.y,.84+reach*.35,12,dt);
    });
    // During lock interaction the weapon is holstered rather than clipping
    // through the safe door; it returns smoothly as the operator collects loot.
    heroWeapon.visible=!interactingSafe&&!pickupActive&&!probingSafe;
    if(model&&interactionHands.visible){
      // Hide the fallback soldier's body, but keep its reach cue in the
      // correct local space for the loaded animated character.
      heroFallback.visible=false;
    }
    // Procedural movement layers keep the fallback operator expressive even
    // before the external skeletal model is available on a slow connection.
    const danger=phase==='combat'&&guards.some(g=>g.alive&&g.alerted);
    const grounded=player.y<=.025&&vy===0;
    const horizontalSpeed=Math.hypot(velocityX,velocityZ);
    const gait=moving?(sprint?13:8):1.2;
    const stride=moving?Math.sin(time*gait):0;
    const caution=danger&&!sprint;
    if(!model){
      chest.rotation.x=THREE.MathUtils.damp(chest.rotation.x,
        (crouch?-.13:caution?-.085:0)+stride*(sprint?.13:.065),9,dt);
      chest.rotation.z=THREE.MathUtils.damp(chest.rotation.z,
        moving?Math.cos(time*gait*.5)*.045:0,7,dt);
      avatar.rotation.z=THREE.MathUtils.damp(avatar.rotation.z,
        targetLean+(moving?Math.cos(time*gait)*.018:0),7,dt);
    }
    const weaponLift=danger?.035:0;
    // Grip a weapon in front of the character even if the remote skeletal rig fails.
    if(heroWeapon.parent===playerRoot){
      heroWeapon.position.set(.4,crouch?.92:1.35+weaponLift,-.43);
      heroWeapon.rotation.set(-pitch*.4,0,0);
    }
    if(modelMixer){
      // Finite-state locomotion: grounded, airborne, prone and transitions.
      // Available Soldier.glb clips are blended, while missing actions fall
      // back to procedural poses rather than freezing the character.
      const desiredState=!grounded?'jump':crouch?(horizontalSpeed>.18?'crawl':'prone'):
        horizontalSpeed<.18?'idle':horizontalSpeed>4.25?'run':'walk';
      const candidates=desiredState==='jump'?['jump','running','run','idle']:
        desiredState==='crawl'?['crawl','crouch','walk','idle']:
        desiredState==='prone'?['prone','crouch','idle']:
        desiredState==='run'?['run','running','walk','idle']:
        desiredState==='walk'?['walk','walking','idle']:['idle','standing'];
      // Resolve clips by semantic names: asset packs often use names such as
      // "Walking", "RunForward" or "Idle_01" rather than exact map keys.
      const resolveClip=(name:string)=>clips.get(name)||
        [...clips.entries()].find(([key])=>key.startsWith(name)||key.includes(name))?.[1];
      const next=candidates.map(resolveClip).find(Boolean)||null;
      if(next&&next!==modelAction){
        modelAction?.fadeOut(.22);
        next.reset().setEffectiveWeight(1).fadeIn(.22).play();
        modelAction=next;
      }
      locomotionState=desiredState;
      locomotionBlend=THREE.MathUtils.damp(locomotionBlend,horizontalSpeed,8,dt);
      if(modelAction){
        const clipName=modelAction.getClip().name.toLowerCase();
        if(/walk|run/.test(clipName))modelAction.setEffectiveTimeScale(
          clamp(locomotionBlend/(clipName.includes('run')?5.8:3.2),.55,1.4));
      }
      modelMixer.update(dt);
      // Apply reach after animation sampling; the mixer otherwise resets the
      // hand bones on every frame. Use a bounded additive wrist rotation.
      if(skeletalHands.length){
        // Undo our previous additive rotation first. Some animation clips do
        // not key every bone, so simply multiplying a fresh tilt each frame
        // causes unbounded twisting. This preserves the mixer pose as well.
        const poseReach=(bone:THREE.Bone,tilt:THREE.Quaternion)=>{
          const previous=lastReachRotations.get(bone);
          if(previous)bone.quaternion.multiply(previous.clone().invert());
          bone.quaternion.multiply(tilt);
          lastReachRotations.set(bone,tilt);
        };
        skeletalHands.forEach((hand,i)=>{
          poseReach(hand,new THREE.Quaternion().setFromEuler(new THREE.Euler(-reach*.38,(i===0?-.12:.12)*reach,0)));
        });
        skeletalShoulders.forEach((shoulder,i)=>{
          poseReach(shoulder,new THREE.Quaternion().setFromEuler(new THREE.Euler(-reach*.25,0,(i===0?-.1:.1)*reach)));
        });
      }
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
        guard.root.rotation.z=THREE.MathUtils.damp(guard.root.rotation.z,0,10,dt);
        const dist=guard.root.getWorldPosition(new THREE.Vector3()).distanceTo(player);
        // Suspenseful stealth: patrols only engage after detecting the operator,
        // unless gunfire has already triggered the alarm. Prone movement hides better.
        const detectRadius=guard.isBoss?16:crouch?3.8:sprint?11:7.0;
        // Awareness depends on line of sight, not distance alone. Guards
        // investigate footsteps but cannot see the operator through cover.
        const guardForward=new THREE.Vector3(0,0,-1).applyQuaternion(guard.root.getWorldQuaternion(new THREE.Quaternion()));
        const toPlayer=player.clone().sub(guard.root.getWorldPosition(new THREE.Vector3()));
        toPlayer.y=0;
        const visible=toPlayer.lengthSq()<1.5||guardForward.dot(toPlayer.normalize())>-.15;
        // The room's fixed equipment blocks direct sight. Use a cheap
        // horizontal segment test instead of per-frame scene-wide raycasts.
        const guardWorld=guard.root.getWorldPosition(new THREE.Vector3());
        const behindCabinets=cabinetOccludes(guardWorld,player,activeRoom);
        const clearSight=(dist<4.2||visible)&&!behindCabinets;
        if(!guard.alerted){
          // The operator is unmistakably visible at close range. Avoid an
          // orientation-dependent dead zone where guards never react.
          if(dist<4.2&&!behindCabinets)guard.alerted=true;
          if(dist<detectRadius&&clearSight)guard.awareness+=dt*(crouch?.55:sprint?2.8:1.6);
          else guard.awareness=Math.max(0,guard.awareness-dt*.55);
          if(guard.awareness>1.1)guard.alerted=true;
          if(!guard.alerted){
            // Guards patrol short lanes, pause, and scan before engaging.
            // Stable per-guard offsets avoid random jumps or extra allocations.
            const patrolId=guards.indexOf(guard);
            const patrolPhase=time*.52+patrolId*2.1;
            const baseX=(patrolId-(guards.length-1)/2)*2.45;
            const baseZ=-.6-(patrolId%2)*.6;
            const targetX=clamp(baseX+Math.sin(patrolPhase)*.68,-4.15,4.15);
            const targetZ=baseZ+Math.cos(patrolPhase*.73)*.36;
            guard.root.position.x=THREE.MathUtils.damp(guard.root.position.x,targetX,1.4,dt);
            guard.root.position.z=THREE.MathUtils.damp(guard.root.position.z,targetZ,1.4,dt);
            const scanAngle=Math.PI+Math.sin(time*.8+patrolId*1.7)*.7;
            guard.root.rotation.y=THREE.MathUtils.damp(guard.root.rotation.y,scanAngle,1.8,dt);
            continue;
          }
        }
        const gh=guard.root.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,1.32,0));
        const ph=player.clone().add(new THREE.Vector3(0,crouch?.92:1.38,0));
        const dir=ph.sub(gh).normalize();
        guard.root.rotation.y=Math.atan2(-dir.x,-dir.z);
        if(dist>3.1){
          const chase=(guard.isBoss?.12:.37)*dt;
          // Keep patrols inside the room; avoid guards clipping through walls.
          const nextX=clamp(guard.root.position.x+dir.x*chase,-4.35,4.35);
          const nextZ=clamp(guard.root.position.z+dir.z*chase,-4.1,4.1);
          // The same solid cabinets that stop the operator must stop guards.
          // Sliding along the front allows pursuit without walking through loot.
          const cabinetBlocked=nextZ < -2.78 && [-3.32,-1.14,1.04,3.22].some(x=>Math.abs(nextX-x)<1.04);
          guard.root.position.x=nextX;
          guard.root.position.z=cabinetBlocked?Math.max(guard.root.position.z,-2.78):nextZ;
        }
        guard.cooldown-=dt;
        // A cabinet between the two characters is actual cover, not merely
        // a visibility hint: enemies cannot damage the player through it.
        if(dist<13&&clearSight&&guard.cooldown<=0){
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
        obj.mesh.parent?.remove(obj.mesh);trails.splice(i,1);spareTrails.push(obj.mesh);
      }else obj.mesh.scale.x=obj.mesh.scale.z=.75*(1-obj.age/obj.lifespan)+.18;
    }
    // Automatically enter the next unlocked room when the player approaches its doorway.
    // This keeps manual navigation available but removes the mandatory interaction button.
    if(phase==='hall'&&!transition){
      const doorway=rooms.find(r=>allowedRooms.includes(r.info.id)&&
        Math.abs(r.info.z-player.z)<1.65&&
        Math.abs(player.x)<2.1);
      if(doorway)enterRoom(doorway.info.id);
    }
    const currentNearby=phase==='hall' ?
      rooms.find(r=>Math.abs(r.info.z-player.z)<3.9)?.info.id??null : null;
    if(currentNearby!==nearby){nearby=currentNearby;events.onNearby(nearby);}
    const forward=new THREE.Vector3(-Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch));
    const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
    const head=player.clone().add(new THREE.Vector3(0,crouch?1:1.55,0));
    // Switch to corridor framing as soon as the operator reaches the exit
    // threshold. Holding room framing throughout exit pins the camera behind
    // the entrance bulkhead and obscures the player's view.
    const crossingExit=phase==='room-exit'&&Math.abs(player.x)<4.65;
    const roomView=Boolean(activeRoom)&&phase!=='hall'&&!crossingExit;
    const camTarget=head.clone().addScaledVector(forward,roomView?-2.65:-4.4)
      .addScaledVector(right,roomView?.62:1.15);
    camTarget.y+=roomView?.82:1.0;
    // Keep the third-person camera inside the playable corridor or room,
    // rather than letting it pass through walls and expose exterior geometry.
    if(roomView&&activeRoom){
      const local=camTarget.clone().sub(activeRoom.group.position);
      // The playable interior is narrower than the room's decorative shell.
      // Keep the camera inside the actual walkable footprint to avoid
      // exposing exterior ceilings/walls when turning near a corner.
      local.x=clamp(local.x,-4.05,4.05);
      local.z=clamp(local.z,-3.48,3.48);
      camTarget.copy(local.add(activeRoom.group.position));
    }else{
      // The exit transition crosses the corridor wall. Keep the camera on
      // the corridor side until the operator has fully cleared the doorway.
      camTarget.x=clamp(camTarget.x,-2.15,2.15);
    }
    camTarget.y=clamp(camTarget.y,1.0,2.75);
    // Clamp the camera's desired position relative to the actual operator.
    // This avoids long sweeps across geometry when a room loads or teleports.
    const cameraOffset=camTarget.clone().sub(head);
    const maxBoom=roomView?3.1:4.8;
    if(cameraOffset.length()>maxBoom)camTarget.copy(head).add(cameraOffset.setLength(maxBoom));
    const lookTarget=head.clone().addScaledVector(forward,roomView?5.1:4.5);
    lookTarget.y+=shotKick;
    // Snap after a room transition so interpolation never sweeps the camera
    // through corridor walls; otherwise ease the camera toward its target.
    if(transition||dt>.04)camera.position.copy(camTarget);
    else camera.position.lerp(camTarget,clamp(dt*8,0,1));
    if(roomView&&activeRoom){
      const localCamera=camera.position.clone().sub(activeRoom.group.position);
      localCamera.x=clamp(localCamera.x,-4.05,4.05);
      localCamera.z=clamp(localCamera.z,-3.48,3.48);
      camera.position.copy(localCamera.add(activeRoom.group.position));
      // The camera is also a physical observer: do not place it inside
      // rear safe cabinets when backing up against the objective wall.
      for(const cabinetX of [-3.32,-1.14,1.04,3.22]){
        const dx=localCamera.x-cabinetX;
        const dz=localCamera.z+3.95;
        if(Math.abs(dx)<1.04&&Math.abs(dz)<1.12){
          camera.position.z=activeRoom.info.z-2.83;
          break;
        }
      }
    }else{
      camera.position.x=clamp(camera.position.x,-2.55,2.55);
    }
    // A shoulder camera must never intersect the operator: bring it forward
    // if interpolation or tight corners collapse the camera boom.
    const separation=camera.position.clone().sub(head);
    const separationLength=separation.length();
    if(separationLength<.75){
      camera.position.copy(head).addScaledVector(separationLength>.001?separation.normalize():forward.clone().negate(),.75);
    }
    camera.lookAt(lookTarget);
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
  emitAmmo();
  events.onThreats(0);
  const setLanguage=(value:'ar'|'en')=>{language=value;};
  const restartRoom=()=>{if(!activeRoom||phase!=='dead')return;nextShotAt=0;shotKick=0;muzzleFlashUntil=0;hitFeedbackUntil=0;lastHitAt=-10000;controls.clear();input.forward=input.strafe=0;sprint=false;crouch=false;vy=0;player.set(activeRoom.group.position.x,0,activeRoom.info.z+2.3);resetThreats();};
  const finish=()=>{if(phase!=='safes'||!activeRoom||activeRoom.info.id!=='vault'||safeIndex<4||!rewardCollected)return false;emit('victory','vault');return true;};
  return {
    start,travelTo,enterRoom,exitRoom,approachSafe,openSafe,collectReward,fire,reload,jump,look,setCrouch,setMovement,setWeaponTier,
    setTriggerHeld(value:boolean){touchTriggerHeld=value;},
    restartRoom,finish,setAllowed,setLanguage,
    getRoom(){return activeRoom?.info.id??null;},
    setPaused(value:boolean){paused=value;last=performance.now();},
    dispose(){
      disposed=true;touchTriggerHeld=false;loaderDisposed=true;cancelAnimationFrame(frame);observer.disconnect();
      canvas.removeEventListener('pointerdown',pointerStart);
      canvas.removeEventListener('pointermove',pointerMove);
      canvas.removeEventListener('pointerup',pointerEnd);
      canvas.removeEventListener('pointercancel',pointerEnd);
      canvas.removeEventListener('webglcontextlost',lost);
      window.removeEventListener('keydown',keyDown);
      window.removeEventListener('keyup',keyUp);
      window.removeEventListener('blur',clearKeyboard);
      modelMixer?.stopAllAction();
      for(const room of rooms)for(const enemy of room.enemies)enemy.mixer?.stopAllAction();
      const externalGeometries=new Set<THREE.BufferGeometry>();
      const externalMaterials=new Set<THREE.Material>();
      scene.traverse(obj=>{
        if(!(obj instanceof THREE.Mesh))return;
        if(!geometries.includes(obj.geometry))externalGeometries.add(obj.geometry);
        const meshMaterials=Array.isArray(obj.material)?obj.material:[obj.material];
        for(const m of meshMaterials)if(m&&!materials.includes(m))externalMaterials.add(m);
      });
      for(const g of externalGeometries)g.dispose();
      for(const m of externalMaterials){
        for(const key of ['map','normalMap','roughnessMap','metalnessMap','emissiveMap','aoMap'] as const){
          const tex=(m as unknown as Record<string,unknown>)[key];
          if(tex instanceof THREE.Texture)tex.dispose();
        }
        m.dispose();
      }
      geometries.forEach(g=>g.dispose());
      materials.forEach(m=>m.dispose());
      textures.forEach(t=>t.dispose());
      renderer.dispose();
      canvas.remove();
    }
  };
}
