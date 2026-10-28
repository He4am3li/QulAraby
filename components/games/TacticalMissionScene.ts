import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * Standalone QUL tactical education game.
 * Design cues: third-person camera, industrial facility, mission consoles.
 * No gameplay assets or level geometry are copied from commercial games.
 * One compact corridor, four rooms, no duplicate sections or expensive shadows.
 */
export type MissionId = 'warehouse' | 'signals' | 'archive' | 'command';
export type GamePhase = 'entrance' | 'starting' | 'corridor' | 'entering' | 'room' | 'leaving';

export const MISSIONS: { id: MissionId; ar: string; en: string; color: string }[] = [
  { id: 'warehouse', ar: 'مخزن الإمدادات', en: 'Supply Depot', color: '#d4aa60' },
  { id: 'signals', ar: 'غرفة الاتصالات', en: 'Signal Room', color: '#48c5df' },
  { id: 'archive', ar: 'الأرشيف السري', en: 'Secret Archive', color: '#ba8dff' },
  { id: 'command', ar: 'مركز القيادة', en: 'Command Center', color: '#f18e6c' },
];

type Callbacks = {
  lang: 'ar' | 'en';
  onPhase: (phase: GamePhase, id?: MissionId) => void;
  onNearby: (id: MissionId | null) => void;
  onError: (reason: string) => void;
  onTargetHit: () => void;
  canEnter: (id: MissionId) => boolean;
};

type Door = {
  id: MissionId;
  side: -1 | 1;
  z: number;
  pivot: THREE.Group;
  root: THREE.Group;
  hit: THREE.Mesh;
  interior: THREE.Group;
  opened: number;
  target: number;
  glow: THREE.Mesh;
  sign: THREE.Mesh;
  targetMesh: THREE.Mesh;
};
type Transition = {
  name: 'start' | 'enter' | 'exit';
  duration: number;
  elapsed: number;
  from: THREE.Vector3;
  to: THREE.Vector3;
  camFrom: THREE.Vector3;
  camTo: THREE.Vector3;
  lookFrom: THREE.Vector3;
  lookTo: THREE.Vector3;
  target?: Door;
};
type Input = { x: number; z: number; sprint: boolean };
const clamp = THREE.MathUtils.clamp;

function makeSign(text: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas text is unavailable');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#091923';
  ctx.fillRect(0, 0, 640, 160);
  ctx.strokeStyle = '#5f8091';
  ctx.lineWidth = 5;
  ctx.strokeRect(5, 5, 630, 150);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#e8f4ef';
  ctx.font = /[\u0600-\u06ff]/.test(text)
    ? 'bold 66px "Tajawal", Arial, sans-serif'
    : 'bold 54px Arial, sans-serif';
  ctx.fillText(text, 320, 82, 590);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createTacticalScene(host: HTMLElement, callbacks: Callbacks) {
  const mobile = matchMedia('(max-width: 900px), (pointer: coarse)').matches;
  const renderer = new THREE.WebGLRenderer({
    antialias: !mobile,
    powerPreference: mobile ? 'low-power' : 'high-performance'
  });
  // Keep mobile render resolution bounded: high DPR + eight rooms was expensive.
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 0.95 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = mobile ? 1.72 : 1.52;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#384852');
  scene.fog = new THREE.FogExp2('#384852', 0.012);
  const camera = new THREE.PerspectiveCamera(mobile ? 69 : 63, 1, 0.08, 100);
  camera.position.set(1.1, 2.65, 24.4);
  const cameraLook = new THREE.Vector3(0, 1.32, 18);
  const temp = new THREE.Vector3();
  const desiredCamera = new THREE.Vector3();
  const desiredLook = new THREE.Vector3();
  scene.add(new THREE.HemisphereLight('#f2f7ff', '#8499a4', 3.7));
  const fill = new THREE.DirectionalLight('#ecf5ff', 3.8);
  fill.position.set(2, 9, 10);
  scene.add(fill);
  const rim = new THREE.PointLight('#b5e7f2', 28, 26, 2);
  rim.position.set(-2.4, 2.8, -20);
  scene.add(rim);
  const alarm = new THREE.PointLight('#f3bd94', 19, 23, 2);
  alarm.position.set(2.6, 2.7, -46);
  scene.add(alarm);

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];
  const geo = <T extends THREE.BufferGeometry>(value: T) => (geometries.push(value), value);
  const mat = <T extends THREE.Material>(value: T) => (materials.push(value), value);
  const metal = mat(new THREE.MeshStandardMaterial({ color: '#586b76', metalness: .37, roughness: .55 }));
  const steel = mat(new THREE.MeshStandardMaterial({ color: '#899ca6', metalness: .52, roughness: .42 }));
  const concrete = mat(new THREE.MeshStandardMaterial({ color: '#697a83', metalness: .1, roughness: .8 }));
  const black = mat(new THREE.MeshStandardMaterial({ color: '#283a44', metalness: .3, roughness: .55 }));
  const bright = mat(new THREE.MeshStandardMaterial({ color: '#c7d5db', metalness: .22, roughness: .46 }));
  const orange = mat(new THREE.MeshBasicMaterial({ color: '#eab46e' }));
  const cyan = mat(new THREE.MeshBasicMaterial({ color: '#7bdbf2' }));
  const red = mat(new THREE.MeshBasicMaterial({ color: '#e26e5c' }));
  const violet = mat(new THREE.MeshBasicMaterial({ color: '#b893ee' }));
  const skin = mat(new THREE.MeshStandardMaterial({ color: '#b7957a', roughness: .94 }));
  const cloth = mat(new THREE.MeshStandardMaterial({ color: '#556251', roughness: .88 }));
  const camo = mat(new THREE.MeshStandardMaterial({ color: '#596558', roughness: .91 }));
  const emitter = mat(new THREE.MeshBasicMaterial({ color: '#61c9e5' }));

  const cube = (parent: THREE.Object3D, sx: number, sy: number, sz: number,
    material: THREE.Material, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(geo(new THREE.BoxGeometry(sx, sy, sz)), material);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };
  const cylinder = (parent: THREE.Object3D, rt: number, rb: number, length: number,
    material: THREE.Material, x: number, y: number, z: number, radial = 10) => {
    const m = new THREE.Mesh(geo(new THREE.CylinderGeometry(rt, rb, length, radial)), material);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };
  const signs: { mesh: THREE.Mesh; id: MissionId }[] = [];
  const addSign = (parent: THREE.Object3D, id: MissionId, pos: THREE.Vector3, rotationY: number, width = 2.0, height = .5) => {
    const i = MISSIONS.find(m => m.id === id)!;
    const texture = makeSign(i[callbacks.lang]);
    textures.push(texture);
    const material = mat(new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }));
    const mesh = new THREE.Mesh(geo(new THREE.PlaneGeometry(width, height)), material);
    mesh.position.copy(pos);
    mesh.rotation.y = rotationY;
    mesh.userData.room = id;
    parent.add(mesh);
    signs.push({ mesh, id });
    return mesh;
  };

  const building = new THREE.Group();
  scene.add(building);
  // One contiguous playable corridor. Floor/ceiling, metal walls, pipes and lamps.
  const wallX = 3.15;
  const corridorFront = 17.8;
  const corridorBack = -67;
  cube(building, 6.5, .23, corridorFront - corridorBack, concrete, 0, -.16, (corridorFront + corridorBack)/2);
  cube(building, 6.5, .16, corridorFront - corridorBack, metal, 0, 3.65, (corridorFront + corridorBack)/2);
  for (const x of [-2.95, 2.95]) {
    cube(building, .06, .11, 83, steel, x, .03, -24);
    cube(building, .11, .09, 83, steel, x, 3.35, -24);
  }
  const doorSpecs: { id: MissionId; z: number; side: -1 | 1 }[] =
    MISSIONS.map((m, i) => ({ id: m.id, z: 2 - i * 17, side: (i % 2 === 0 ? -1 : 1) as -1 | 1 }));
  const doors: Door[] = [];
  const pickTargets: THREE.Mesh[] = [];
  const doorX = wallX;
  for (const side of [-1, 1] as const) {
    const gaps = doorSpecs.filter(d => d.side === side).map(d => d.z).sort((a, b) => b - a);
    let cursor = corridorFront;
    for (const z of gaps) {
      const upper = z + 1.48;
      if (cursor > upper) cube(building, .22, 3.56, cursor-upper, metal, side * wallX, 1.77, (cursor + upper)/2);
      cursor = z - 1.48;
    }
    if (cursor > corridorBack) cube(building, .22, 3.56, cursor-corridorBack, metal, side*wallX,1.77,(cursor+corridorBack)/2);
  }
  // Reusable ceiling strips give a shooter-style industrial ambience without postprocessing.
  for (let z = 12; z > -66; z -= 6) {
    cube(building, 4.1, .075, .33, black, 0, 3.51, z);
    cube(building, 3.2, .037, .2, z % 3 ? cyan : orange, 0, 3.46, z);
    for (const x of [-2.7, 2.7]) {
      cube(building, .09, 2.9, .075, steel, x, 1.71, z);
      cube(building, .16, .08, .7, orange, x, 1.08, z);
    }
  }
  // Stacked supply crates and cover barriers: also create depth and spatial scale.
  for (let i = 0; i < 14; i++) {
    const z = 8-i*5.25;
    const x = (i%2 ? 2.35 : -2.35);
    const height = i%3 ? .52 : .85;
    const crate = cube(building, .8, height, .75, i%2 ? metal : steel, x, height/2, z);
    cube(crate, .79, .08, .79, orange, 0, height*.42, 0);
  }

  const portalRoot = new THREE.Group(); building.add(portalRoot);
  for (let i = 0; i < doorSpecs.length; i++) {
    const spec = doorSpecs[i];
    const side = spec.side;
    const root = new THREE.Group();
    root.position.set(side * doorX, 0, spec.z);
    portalRoot.add(root);
    cube(root, .34, 3.0, .22, black, 0, 1.5, -1.45);
    cube(root, .34, 3.0, .22, black, 0, 1.5, 1.45);
    cube(root, .4, .24, 3.18, steel, 0, 3.05, 0);
    cube(root, .55, .15, 3.14, orange, 0, .08, 0);
    const pivot = new THREE.Group();
    pivot.position.set(0, 0, -1.35);
    root.add(pivot);
    cube(pivot,.22,2.9,2.68,metal,0,1.49,1.34);
    cube(pivot,.24,.11,2.35,orange,side*.13,2.42,1.34);
    cube(pivot,.25,.5,.44,steel,side*.13,1.43,2.35);
    const hit = new THREE.Mesh(geo(new THREE.BoxGeometry(.88,3.0,2.8)),
      mat(new THREE.MeshBasicMaterial({ visible: false })));
    hit.position.set(-side*.18,1.55,0);
    root.add(hit); hit.userData.room=spec.id;
    pickTargets.push(hit);
    const glow = cube(root,.09,.8,.07,orange,-side*.22,1.51,1.46);
    const sign = addSign(root,spec.id,new THREE.Vector3(-side*.43,3.45,0),side*Math.PI/2,2.28,.54);
    // Side rooms are built once, and are hidden outside their proximity.
    const interior = new THREE.Group();
    interior.position.set(side*8.35,0,spec.z);
    scene.add(interior);
    cube(interior,9.2,.18,8.2,concrete,0,-.18,0);
    cube(interior,9.2,.14,8.2,metal,0,3.62,0);
    cube(interior,9.2,3.55,.2,metal,0,1.77,-4.05);
    cube(interior,9.2,3.55,.2,metal,0,1.77,4.05);
    cube(interior,.2,3.55,8.2,metal,side*4.6,1.77,0);
    cube(interior,1.0,.22,2.95,steel,-side*4.72,.0,0); // bridge to hallway
    for (let j = 0; j < 4; j++) {
      const zz = -2.9 + j*1.94;
      cube(interior,.19,3.0,.18,steel,side*4.2,1.5,zz);
    }
    cube(interior,3.2,2.15,.34,black,side*.72,1.48,-2.3);
    cube(interior,2.7,1.42,.06,steel,side*.72,1.6,-2.09);
    cube(interior,2.4,.12,.07,[orange,cyan,violet,red][i],side*.72,2.02,-2.04);
    cube(interior,1.0,.6,.95,metal,-side*.6,.38,-.6);
    cube(interior,1.2,.83,.95,steel,side*1.6,.45,2.0);
    cube(interior,.98,.46,.89,black,-side*1.7,.28,2.2);
    for (let j = 0; j < 3; j++) {
      cube(interior,.45,.5,.44,[cyan,orange,violet][j],side*(-1.1+j*1.1),1.0,-2.04);
    }
    // A glowing mission target reacts to completing the learning objective.
    const target = new THREE.Mesh(geo(new THREE.TorusGeometry(.42,.08,7,24)),[cyan,violet,orange,red][i]);
    target.position.set(side*.72,1.64,-1.95);
    interior.add(target);
    target.visible = false; // appears once the educational answer unlocks it
    const roomLight = new THREE.PointLight([0xf5d39b,0xabe9f5,0xe0c5fa,0xffc4ac][i], mobile ? 16 : 22, 13, 2);
    roomLight.position.set(side*.7,2.75,0);
    interior.add(roomLight);
    interior.visible = false;
    doors.push({id:spec.id,side,z:spec.z,pivot,root,hit,interior,opened:0,target:0,glow,sign,targetMesh:target});
  }

  // Massive entrance gate opens before the soldier enters the facility.
  const entrance = new THREE.Group();
  entrance.position.set(0,0,15.4);
  scene.add(entrance);
  const gateParts: THREE.Group[] = [];
  for (const side of [-1,1] as const) {
    const hinge = new THREE.Group();
    hinge.position.set(side*1.65,0,0);
    entrance.add(hinge);
    cube(hinge,1.65,3.42,.26,metal,-side*.83,1.73,0);
    cube(hinge,.12,2.65,.32,orange,-side*.25,1.73,.04);
    cube(hinge,.22,.16,.4,steel,-side*1.2,1.35,.1);
    gateParts.push(hinge);
  }
  cube(entrance,.3,3.86,.52,black,-1.78,1.91,0);
  cube(entrance,.3,3.86,.52,black,1.78,1.91,0);
  cube(entrance,3.8,.32,.52,steel,0,3.92,0);
  cube(entrance,3.7,.1,.38,red,0,3.63,.1);

  // Animated third-person operator. A fully rigged, freely redistributable
  // glTF Soldier is streamed asynchronously; a simple mannequin remains if it fails.
  const operator = new THREE.Group(); scene.add(operator);
  operator.position.set(0,0,19.2);
  const mannequin = new THREE.Group();
  operator.add(mannequin);
  const torso = cube(mannequin,.72,.77,.38,camo,0,1.28,0);
  cube(mannequin,.68,.56,.23,cloth,0,1.34,-.19);
  cylinder(mannequin,.24,.28,.37,skin,0,1.85,0);
  cylinder(mannequin,.31,.32,.26,camo,0,2.04,.02);
  cube(mannequin,.83,.14,.29,black,0,2.03,.05);
  for(const side of [-1,1]) {
    const arm = cylinder(mannequin,.14,.12,.7,cloth,side*.49,1.33,-.04);
    arm.rotation.z=side*.21;
    const leg = cylinder(mannequin,.16,.14,.9,camo,side*.21,.57,0);
    leg.rotation.z=side*.045;
    cube(mannequin,.25,.23,.38,black,side*.23,.14,-.08);
  }
  cube(mannequin,.32,.62,.18,black,0,1.35,.28);
  const gun = new THREE.Group();
  gun.position.set(.44,1.28,-.33);
  operator.add(gun);
  cube(gun,.14,.17,.8,black,0,0,-.31);
  cube(gun,.2,.15,.48,steel,0,.1,-.45);
  cube(gun,.12,.23,.16,black,0,-.21,-.03);
  const barrel = cube(gun,.16,.16,.32,cyan,0,.02,-.84);
  const gunTip = new THREE.PointLight('#64cfff',0,3);
  gunTip.position.set(0,.02,-.91);gun.add(gunTip);
  let modelMixer: THREE.AnimationMixer | null=null;
  let loadedSoldier: THREE.Group | null=null;
  const modelActions = new Map<string,THREE.AnimationAction>();
  let action: THREE.AnimationAction|null=null;
  let disposalStarted=false;
  const loader = new GLTFLoader();
  loader.load('https://threejs.org/examples/models/gltf/Soldier.glb',
    gltf => {
      if(disposalStarted) {
        gltf.scene.traverse(o=>{
          if(o instanceof THREE.Mesh) {
            o.geometry?.dispose();
            const mats=Array.isArray(o.material)?o.material:[o.material];
            mats.forEach(m=>m?.dispose());
          }
        });
        return;
      }
      gltf.scene.scale.setScalar(.96);
      // Soldier.glb faces down the playable -Z direction by default.
      // The previous PI flip made the run cycle appear backwards.
      gltf.scene.rotation.y=0;
      operator.add(gltf.scene);
      loadedSoldier = gltf.scene;
      mannequin.visible=false;
      modelMixer=new THREE.AnimationMixer(gltf.scene);
      for (const clip of gltf.animations) {
        const item=modelMixer.clipAction(clip);
        modelActions.set(clip.name.toLowerCase(),item);
      }
      action=modelActions.get('idle') ?? null;
      action?.play();
    },
    undefined,
    () => { /* Offline/blocked CDN: keep the lightweight procedural operator. */ }
  );

  let phase:GamePhase='entrance';
  let active:Door|null=null;
  let selected:Door|null=null;
  let transition:Transition|null=null;
  let targetZ=operator.position.z;
  let nearby:MissionId|null=null;
  let lang=callbacks.lang;
  let mobileInput:Input={x:0,z:0,sprint:false};
  let holdingKeys=new Set<string>();
  let upgrade=1;
  let pulseTime=0;
  let targetArmed=false;
  let shotProgress=0;
  let shotActive=false;
  let shotWillHit=false;
  const shotFrom=new THREE.Vector3();
  const shotTo=new THREE.Vector3();
  const projectile = new THREE.Mesh(geo(new THREE.SphereGeometry(.12,10,8)),
    mat(new THREE.MeshBasicMaterial({color:'#b4f7ff'})));
  projectile.visible=false;
  scene.add(projectile);
  let flashTime=0;
  let gateOpen=0;
  let gateTarget=0;
  let paused=false;
  let disposed=false;
  let last=performance.now();
  let raf=0;
  let clock=0;
  let lastNearbyCheck=0;
  const emit=(next:GamePhase,id?:MissionId)=>{
    phase=next;
    callbacks.onPhase(next,id);
  };
  const makeTransition=(name:Transition['name'],to:THREE.Vector3,camTo:THREE.Vector3,lookTo:THREE.Vector3,duration:number,target?:Door)=>{
    transition={
      name,duration,elapsed:0,from:operator.position.clone(),to,
      camFrom:camera.position.clone(),camTo,
      lookFrom:cameraLook.clone(),lookTo,target
    };
  };
  const start=()=>{
    if(phase!=='entrance')return;
    gateTarget=1;
    makeTransition('start',
      new THREE.Vector3(0,0,11.5),
      new THREE.Vector3(1.05,2.75,15.4),
      new THREE.Vector3(0,1.38,9.3),2.6);
    emit('starting');
  };
  const focusRoom=(door:Door)=>{
    if(phase!=='corridor')return;
    selected=null;
    if(!callbacks.canEnter(door.id))return;
    active=door;
    targetArmed=false;
    door.targetMesh.visible=false;
    door.target=door.side*1.55;
    const x=door.side*8;
    makeTransition('enter',
      new THREE.Vector3(x,0,door.z+.3),
      new THREE.Vector3(door.side*5.55,2.75,door.z+3.2),
      new THREE.Vector3(door.side*9.6,1.4,door.z-1.15),2.15,door);
    emit('entering',door.id);
  };
  const travelTo=(id:MissionId)=>{
    if(phase==='entrance'){start();selected=doors.find(d=>d.id===id)??null;return;}
    if(phase==='room'||phase==='entering'||phase==='leaving')return;
    if(!callbacks.canEnter(id))return;
    const door=doors.find(d=>d.id===id);
    if(!door)return;
    selected=door;
    targetZ=door.z+1.7;
  };
  const enterNearest=()=>{
    if(phase!=='corridor')return;
    const door=doors.reduce<Door|null>((closest,d)=>{
      const dist=Math.abs(d.z-operator.position.z);
      if(dist>4.8)return closest;
      return !closest||dist<Math.abs(closest.z-operator.position.z)?d:closest;
    },null);
    if(door && callbacks.canEnter(door.id))focusRoom(door);
  };
  const leave=()=>{
    if(phase!=='room'||!active)return;
    const door=active;
    targetZ=door.z+2.15;
    targetArmed=false;
    door.targetMesh.visible=false;
    shotActive=false;
    projectile.visible=false;
    makeTransition('exit',
      new THREE.Vector3(0,0,targetZ),
      new THREE.Vector3(1.05,2.6,targetZ+4.2),
      new THREE.Vector3(0,1.35,targetZ-2.1),1.75,door);
    emit('leaving',door.id);
  };
  const setInput=(next:Input)=>{mobileInput=next;};
  const setUpgrade=(level:number)=> {
    upgrade=clamp(level,1,5);
    barrel.scale.z=1+(upgrade-1)*.25;
    (barrel.material as THREE.MeshBasicMaterial).color.setHex(upgrade>2?0xf7be65:0x79ddfb);
  };
  const armTarget=(armed:boolean)=>{
    targetArmed=armed && phase==='room' && Boolean(active);
    if(active) {
      active.targetMesh.visible=targetArmed;
      active.targetMesh.scale.setScalar(1);
    }
  };
  // Real in-world plasma bolt; a correct answer unlocks a holographic target.
  // Shots before solving the question still animate, but cannot clear the task.
  const fire=()=>{
    if(phase!=='room'||!active||shotActive)return false;
    operator.updateMatrixWorld(true);
    gunTip.getWorldPosition(shotFrom);
    shotWillHit=targetArmed;
    if(shotWillHit){
      active.targetMesh.getWorldPosition(shotTo);
    }else{
      shotTo.copy(shotFrom).add(new THREE.Vector3(active.side * 5.2, 0, -1.7));
    }
    shotActive=true;
    shotProgress=0;
    projectile.position.copy(shotFrom);
    projectile.visible=true;
    pulseTime=.18;
    gunTip.intensity=8+upgrade*3;
    return true;
  };
  const pulse=fire;
  const setLanguage=(next:'ar'|'en')=>{
    lang=next;
    for(const ref of signs) {
      const definition=MISSIONS.find(x=>x.id===ref.id)!;
      const old=(ref.mesh.material as THREE.MeshBasicMaterial).map;
      const newTex=makeSign(definition[lang]);
      textures.push(newTex);
      (ref.mesh.material as THREE.MeshBasicMaterial).map=newTex;
      (ref.mesh.material as THREE.MeshBasicMaterial).needsUpdate=true;
      old?.dispose();
    }
  };
  const onKeyDown=(e:KeyboardEvent)=>{
    if((e.target as HTMLElement)?.closest('input,textarea,select,button,[role="dialog"]'))return;
    holdingKeys.add(e.key.toLowerCase());
    if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase()))e.preventDefault();
    if(e.key.toLowerCase()==='e'&&phase==='corridor')enterNearest();
    if(e.code==='Space'&&phase==='room'&&!e.repeat)fire();
    if(e.key==='Escape'&&phase==='room')leave();
    if(e.key==='Enter'&&phase==='entrance')start();
  };
  const onKeyUp=(e:KeyboardEvent)=>holdingKeys.delete(e.key.toLowerCase());
  const pointer=new THREE.Vector2();
  const ray=new THREE.Raycaster();
  let pointerDown={x:0,y:0};
  const onPointerDown=(e:PointerEvent)=>{pointerDown={x:e.clientX,y:e.clientY};};
  const onPointerUp=(e:PointerEvent)=>{
    if(Math.abs(e.clientX-pointerDown.x)+Math.abs(e.clientY-pointerDown.y)>18)return;
    if(phase==='entrance'){start();return;}
    if(phase==='room'){fire();return;}
    if(phase!=='corridor')return;
    const rect=renderer.domElement.getBoundingClientRect();
    pointer.set((e.clientX-rect.left)/rect.width*2-1,-((e.clientY-rect.top)/rect.height*2-1));
    ray.setFromCamera(pointer,camera);
    const hits=ray.intersectObjects(pickTargets,false);
    const door=doors.find(d=>d.hit===hits[0]?.object);
    if(door) {
      const distance=Math.abs(door.z-operator.position.z);
      if(distance<4.8)focusRoom(door);
      else travelTo(door.id);
    }
  };
  const onWheel=(e:WheelEvent)=>{
    if(phase!=='corridor')return;
    e.preventDefault();
    targetZ=clamp(targetZ-e.deltaY*.025,-63,11.8);
    selected=null;
  };
  const canvas=renderer.domElement;
  canvas.style.touchAction='none';
  canvas.addEventListener('pointerdown',onPointerDown);
  canvas.addEventListener('pointerup',onPointerUp);
  canvas.addEventListener('wheel',onWheel,{passive:false});
  window.addEventListener('keydown',onKeyDown);
  window.addEventListener('keyup',onKeyUp);
  const resize=()=>{
    const w=host.clientWidth,h=host.clientHeight;
    if(!w||!h)return;
    renderer.setSize(w,h,false);
    camera.aspect=w/h;
    camera.fov=mobile?(w<h?73:66):63;
    camera.updateProjectionMatrix();
  };
  const observer=new ResizeObserver(resize);
  observer.observe(host);resize();
  const onContextLost=(e:Event)=>{
    e.preventDefault();
    paused=true;
    callbacks.onError('WebGL context lost');
  };
  canvas.addEventListener('webglcontextlost',onContextLost);
  const draw=(now:number)=>{
    raf=requestAnimationFrame(draw);
    if(disposed||document.hidden||paused){last=now;return;}
    if(mobile&&now-last<1000/30)return;
    const dt=Math.min(Math.max(0,(now-last)/1000),.05);
    last=now;
    clock+=dt;
    gateOpen=THREE.MathUtils.damp(gateOpen,gateTarget,2.5,dt);
    entrance.children.slice(0,2).forEach((item,i)=>item.rotation.y=(i?1:-1)*gateOpen*1.48);
    entrance.visible=phase==='entrance'||(phase==='starting'&&operator.position.z>14.2);
    for(const door of doors){
      door.opened=THREE.MathUtils.damp(door.opened,door.target,3,dt);
      door.pivot.rotation.y=door.opened;
      // Render only the active/nearby room. Four copies are never active at once.
      door.interior.visible=door===active||Math.abs(door.z-operator.position.z)<5.2;
    }

    let walking=false,sprinting=false;
    if(transition){
      transition.elapsed+=dt;
      const t=clamp(transition.elapsed/transition.duration,0,1);
      const eased=t*t*(3-2*t);
      operator.position.lerpVectors(transition.from,transition.to,eased);
      camera.position.lerpVectors(transition.camFrom,transition.camTo,eased);
      cameraLook.lerpVectors(transition.lookFrom,transition.lookTo,eased);
      walking=true;
      if(t>=1){
        const done=transition;
        transition=null;
        if(done.name==='start'){
          targetZ=operator.position.z;
          emit('corridor');
        }else if(done.name==='enter'){
          emit('room',done.target?.id);
        }else{
          if(done.target)done.target.target=0;
          active=null;
          nearby=null;
          callbacks.onNearby(null);
          emit('corridor');
        }
      }
    }else if(phase==='corridor'){
      const keyX=Number(holdingKeys.has('d')||holdingKeys.has('arrowright'))-Number(holdingKeys.has('a')||holdingKeys.has('arrowleft'));
      const keyZ=Number(holdingKeys.has('w')||holdingKeys.has('arrowup'))-Number(holdingKeys.has('s')||holdingKeys.has('arrowdown'));
      const vx=clamp(keyX+mobileInput.x,-1,1);
      const vz=clamp(keyZ+mobileInput.z,-1,1);
      const sprintingNow=holdingKeys.has('shift')||mobileInput.sprint;
      sprinting=sprintingNow;
      const length=Math.hypot(vx,vz)||1;
      const speed=sprintingNow?5.8:3.5;
      if(vx||vz){
        operator.position.x=clamp(operator.position.x+(vx/length)*speed*dt,-1.75,1.75);
        targetZ=clamp(operator.position.z-(vz/length)*speed*dt,-63.3,11.8);
        selected=null;
        walking=true;
      }
      if(selected){
        targetZ=selected.z+1.7;
        walking=true;
      }
      const remaining=targetZ-operator.position.z;
      operator.position.z+=clamp(remaining,-speed*dt,speed*dt);
      if(Math.abs(remaining)>.03)walking=true;
      if(selected&&Math.abs(operator.position.z-targetZ)<.12){
        const target=selected;selected=null;focusRoom(target);
      }
      if(now-lastNearbyCheck>180){
        lastNearbyCheck=now;
        const nearest=doors.reduce<Door|null>((out,d)=>
          Math.abs(d.z-operator.position.z)<4.8&&
          (!out||Math.abs(d.z-operator.position.z)<Math.abs(out.z-operator.position.z))?d:out,null);
        const next=nearest?.id??null;
        if(next!==nearby){nearby=next;callbacks.onNearby(next);}
      }
      const targetYaw=walking ? (vx>0?.18:vx<0?-.18:0):0;
      operator.rotation.y=THREE.MathUtils.damp(operator.rotation.y,targetYaw,7,dt);
      desiredCamera.set(operator.position.x+1.05,2.72,operator.position.z+4.3);
      camera.position.lerp(desiredCamera,clamp(dt*7,0,1));
      desiredLook.set(operator.position.x,1.33,operator.position.z-2.2);
      cameraLook.lerp(desiredLook,clamp(dt*7,0,1));
    }else if(phase==='room'){
      // Retain a stable over-the-shoulder view of the console.
      desiredLook.set(active?.side?active.side*9.4:0,1.42,(active?.z??0)-1.55);
      cameraLook.lerp(desiredLook,clamp(dt*3,0,1));
      operator.rotation.y=THREE.MathUtils.damp(operator.rotation.y,active?.side===1?Math.PI/2:-Math.PI/2,4,dt);
    }
    if(modelMixer){
      modelMixer.update(dt);
      const nextAction=modelActions.get(walking?(sprinting?'run':'walk'):'idle')??modelActions.get('idle')??null;
      if(nextAction&&nextAction!==action){
        action?.fadeOut(.18);
        nextAction.reset().fadeIn(.18).play();
        action=nextAction;
      }
    }else{
      // Fallback operator breathes/steps when a model cannot be downloaded.
      torso.rotation.x=walking?Math.sin(clock*11)*.06:Math.sin(clock*1.6)*.018;
    }
    if(shotActive){
      shotProgress = Math.min(1,shotProgress+dt*(upgrade*.55+2.8));
      projectile.position.lerpVectors(shotFrom,shotTo,shotProgress);
      const size=1+(1-shotProgress)*.7;
      projectile.scale.setScalar(size);
      if(shotProgress>=1){
        shotActive=false;
        projectile.visible=false;
        if(shotWillHit && targetArmed && active){
          active.targetMesh.visible=false;
          targetArmed=false;
          flashTime=.32;
          callbacks.onTargetHit();
        }
      }
    }
    if(flashTime>0){flashTime=Math.max(0,flashTime-dt);rim.intensity=28+flashTime*85;}
    else rim.intensity=28;
    if(pulseTime>0){
      pulseTime=Math.max(0,pulseTime-dt);
      gunTip.intensity=pulseTime*48;
    }else gunTip.intensity=0;
    camera.lookAt(cameraLook);
    renderer.render(scene,camera);
  };
  raf=requestAnimationFrame(draw);
  callbacks.onPhase('entrance');

  return {
    start,travelTo,enterNearest,leave,setInput,setUpgrade,pulse,fire,armTarget,setLanguage,
    setPaused(value:boolean){paused=value;},
    dispose(){
      disposed=true;disposalStarted=true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener('pointerdown',onPointerDown);
      canvas.removeEventListener('pointerup',onPointerUp);
      canvas.removeEventListener('wheel',onWheel);
      canvas.removeEventListener('webglcontextlost',onContextLost);
      window.removeEventListener('keydown',onKeyDown);
      window.removeEventListener('keyup',onKeyUp);
      modelMixer?.stopAllAction();
      if(loadedSoldier) {
        modelMixer?.uncacheRoot(loadedSoldier);
        loadedSoldier.traverse(node => {
          if(node instanceof THREE.Mesh) {
            node.geometry?.dispose();
            const mats=Array.isArray(node.material)?node.material:[node.material];
            mats.forEach(material => {
              if(!material)return;
              const maps = ['map','normalMap','roughnessMap','metalnessMap','emissiveMap','aoMap'] as const;
              for(const name of maps) {
                const tex=(material as unknown as Record<string, unknown>)[name];
                if(tex instanceof THREE.Texture)tex.dispose();
              }
              material.dispose();
            });
          }
        });
        loadedSoldier.parent?.remove(loadedSoldier);
      }
      geometries.forEach(x=>x.dispose());
      materials.forEach(x=>x.dispose());
      textures.forEach(x=>x.dispose());
      renderer.dispose();
      canvas.remove();
    }
  };
}
