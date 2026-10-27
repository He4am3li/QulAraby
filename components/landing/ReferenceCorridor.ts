import * as THREE from 'three';

/**
 * QUL spatial landing, based on the public MIT-licensed interaction architecture
 * of ITomPoland/portfolio-itom (useInfiniteCamera, EntranceDoors,
 * CorridorSegment, DoorSection, InfiniteCorridorManager).
 * The reference's photographs, painted textures and 3D assets are NOT copied.
 * Original source: https://github.com/ITomPoland/portfolio-itom
 */
export type QulRoom = 'reading' | 'listening' | 'games' | 'schools';
export type CorridorPhase = 'entrance' | 'entering' | 'corridor' | 'approaching' | 'room' | 'leaving';

type Callbacks = {
  onPhase: (phase: CorridorPhase, room?: QulRoom) => void;
  onProgress: (value: number) => void;
  lang: 'ar' | 'en';
};

type Portal = {
  id: QulRoom;
  side: -1 | 1;
  z: number;
  hinge: THREE.Group;
  leaf: THREE.Group;
  hit: THREE.Mesh;
  glow: THREE.Mesh;
  room: THREE.Group;
  open: number;
  targetOpen: number;
};

const LABELS: Record<QulRoom, { ar: string; en: string }> = {
  reading: { ar: 'القراءة', en: 'READING' },
  listening: { ar: 'الاستماع', en: 'LISTENING' },
  games: { ar: 'الألعاب', en: 'GAMES' },
  schools: { ar: 'المدارس', en: 'SCHOOLS' },
};

const clamp = THREE.MathUtils.clamp;

/** Texture maps are procedurally drawn for this project. No third-party assets. */
const paperTexture = (kind: 'floor' | 'wall' | 'ceiling'): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = kind === 'floor' ? '#c4b295' : kind === 'wall' ? '#e7dcc7' : '#d8ceb9';
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 850; i++) {
    const x = (i * 191 + 63) % 512;
    const y = (i * 97 + 29) % 512;
    ctx.fillStyle = i % 3 ? 'rgba(55,46,35,.035)' : 'rgba(255,255,255,.12)';
    ctx.fillRect(x, y, 1 + i % 3, 1 + i % 2);
  }
  if (kind === 'floor') {
    for (let y = 0; y < 512; y += 84) {
      ctx.strokeStyle = '#584f4038';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y + 2); ctx.stroke();
    }
    for (let x = 0; x < 512; x += 110) {
      ctx.strokeStyle = '#56493729';
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 3, 512); ctx.stroke();
    }
  } else {
    for (let i = 0; i < 20; i++) {
      ctx.strokeStyle = 'rgba(74,69,59,.038)';
      ctx.beginPath();
      ctx.moveTo(0, (i * 47) % 512);
      ctx.bezierCurveTo(130, (i * 47 + 8) % 512, 330, (i * 47 - 6) % 512, 512, (i * 47 + 3) % 512);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(kind === 'floor' ? 2.4 : 1, kind === 'floor' ? 16 : 1);
  return tex;
};

const labelTexture = (label: string, opts: { bg?: string; fg?: string; width?: number; height?: number } = {}) => {
  const canvas = document.createElement('canvas');
  canvas.width = opts.width ?? 768; canvas.height = opts.height ?? 256;
  const ctx = canvas.getContext('2d')!;
  if (opts.bg) { ctx.fillStyle = opts.bg; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
  ctx.direction = /[\u0600-\u06ff]/.test(label) ? 'rtl' : 'ltr';
  ctx.font = /[\u0600-\u06ff]/.test(label)
    ? 'bold 112px "Al-Wissam", "Tajawal", serif'
    : 'bold 68px Inter, sans-serif';
  ctx.fillStyle = opts.fg ?? '#243e31';
  ctx.fillText(label, canvas.width / 2, canvas.height / 2, canvas.width * .9);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

export function createQulCorridor(host: HTMLElement, callbacks: Callbacks) {
  const mobile = window.matchMedia('(max-width: 900px)').matches;
  const renderer = new THREE.WebGLRenderer({
    alpha: false,
    antialias: !mobile,
    powerPreference: mobile ? 'low-power' : 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.2 : 1.7));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.17;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#d6cbb8');
  scene.fog = new THREE.FogExp2('#d6cbb8', 0.013);
  const camera = new THREE.PerspectiveCamera(mobile ? 64 : 62, 1, 0.07, 170);
  camera.position.set(0, 0.1, 28);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb6a58b, 2.0));
  const sun = new THREE.DirectionalLight(0xfff4d6, 2.6);
  sun.position.set(-6, 9, 12);
  scene.add(sun);
  const ceilingLight = new THREE.DirectionalLight(0xffffff, 0.7);
  ceilingLight.position.set(4, 3, -30);
  scene.add(ceilingLight);

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];
  const keepGeo = <T extends THREE.BufferGeometry>(geo: T) => { geometries.push(geo); return geo; };
  const keepMat = <T extends THREE.Material>(mat: T) => { materials.push(mat); return mat; };
  const keepTex = <T extends THREE.Texture>(tex: T) => { textures.push(tex); return tex; };
  const wallTex = keepTex(paperTexture('wall'));
  const floorTex = keepTex(paperTexture('floor'));
  const ceilingTex = keepTex(paperTexture('ceiling'));
  const wall = keepMat(new THREE.MeshStandardMaterial({ map: wallTex, color: 0xffffff, roughness: 0.91 }));
  const floor = keepMat(new THREE.MeshStandardMaterial({ map: floorTex, color: 0xe6d9be, roughness: 0.75 }));
  const ceil = keepMat(new THREE.MeshStandardMaterial({ map: ceilingTex, roughness: 0.95 }));
  const ink = keepMat(new THREE.MeshStandardMaterial({ color: '#2d3630', roughness: 0.75 }));
  const teal = keepMat(new THREE.MeshStandardMaterial({ color: '#235247', roughness: 0.7 }));
  const gold = keepMat(new THREE.MeshStandardMaterial({ color: '#a8834e', metalness: 0.34, roughness: 0.53 }));
  const glass = keepMat(new THREE.MeshStandardMaterial({ color: '#cadbd2', transparent: true, opacity: 0.27, side: THREE.DoubleSide, depthWrite: false, roughness: 0.12 }));
  const white = keepMat(new THREE.MeshBasicMaterial({ color: '#f9f2dd', side: THREE.DoubleSide }));

  const box = (parent: THREE.Object3D, w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number) => {
    const mesh = new THREE.Mesh(keepGeo(new THREE.BoxGeometry(w, h, d)), mat);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  };
  const panel = (parent: THREE.Object3D, tex: THREE.Texture, w: number, h: number, x: number, y: number, z: number, rotY=0) => {
    const mat = keepMat(new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
    const mesh = new THREE.Mesh(keepGeo(new THREE.PlaneGeometry(w, h)), mat);
    mesh.position.set(x,y,z); mesh.rotation.y=rotY; parent.add(mesh);
    return mesh;
  };
  const label = (parent: THREE.Object3D, text: string, w: number, h: number, x: number, y: number, z: number, rotate=0) =>
    panel(parent, keepTex(labelTexture(text)), w, h, x, y, z, rotate);

  const corridor = new THREE.Group(); scene.add(corridor);
  // Reference corridor uses 80-unit repeat segments, 3.5-unit walls and 3.5-unit height.
  const H = 3.5, HALF = H/2, W = 3.5, Z_TOP = 21, Z_END = -155;
  box(corridor, W*2, .14, Z_TOP-Z_END, floor, 0, -HALF-.07, (Z_TOP+Z_END)/2);
  box(corridor, W*2, .12, Z_TOP-Z_END, ceil, 0, HALF+.06, (Z_TOP+Z_END)/2);
  for (const x of [-W+.15, W-.15]) {
    box(corridor, .12, .13, Z_TOP-Z_END, gold, x, -HALF+.13, (Z_TOP+Z_END)/2);
    box(corridor, .07, .07, Z_TOP-Z_END, gold, x, HALF-.1, (Z_TOP+Z_END)/2);
  }

  // Model the original door pattern (-18,-32,-48,-62), repeated in each corridor segment.
  const ids: QulRoom[] = ['reading','listening','games','schools'];
  const doors: Portal[] = [];
  const targets: THREE.Object3D[] = [];
  const roomGroups: THREE.Group[] = [];
  const D_SPAN = 3.0;
  for (let segment=0;segment<2;segment++) {
    const zBase = 10 - segment * 80;
    ids.forEach((id, i) => {
      const z = zBase - [18,32,48,62][i];
      const side = (i % 2 === 0 ? -1 : 1) as -1 | 1;
      const baseX = side * W;
      const frame = new THREE.Group();
      frame.position.set(baseX, 0, z);
      corridor.add(frame);
      // Double threshold and frame form an actual door opening.
      for (const vz of [-1.04,1.04]) box(frame, .33, 2.6, .17, teal, 0, -.45, vz);
      box(frame, .35, .2, 2.3, teal, 0, .89, 0);
      box(frame, .4, .1, 2.3, gold, 0, -1.69, 0);
      const hinge = new THREE.Group();
      hinge.position.set(0,-.35,-1.02);
      frame.add(hinge);
      const leaf = new THREE.Group();
      hinge.add(leaf);
      box(leaf,.16,2.42,2.03,teal,0,-.1,1.02);
      box(leaf,.19,2.22,1.83,wall, -side*.12,-.1,1.02);
      box(leaf,.22,.14,1.7,gold,-side*.15,.78,1.02);
      box(leaf,.14,.12,.12,gold,-side*.23,-.32,1.67);
      // Sign painted in the local QUL font, facing the hallway.
      const name = LABELS[id][callbacks.lang];
      const sign = label(frame,name,1.15,.39,-side*.26,1.32,0,side*Math.PI/2);
      sign.userData.kind='sign';
      const hit = new THREE.Mesh(keepGeo(new THREE.BoxGeometry(.78,2.75,2.28)),
        keepMat(new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false})));
      hit.position.set(-side*.4,-.45,0);
      hit.userData.room=id;
      frame.add(hit); targets.push(hit);
      const glowMesh = new THREE.Mesh(keepGeo(new THREE.BoxGeometry(.42,2.8,2.5)),
        keepMat(new THREE.MeshBasicMaterial({color:'#d6ad69',transparent:true,opacity:0,depthWrite:false})));
      glowMesh.position.set(0,-.42,0);
      frame.add(glowMesh);
      // The four adjoining rooms are actual 3D spaces behind the matching doorway.
      const room = new THREE.Group();
      room.position.set(side * 9.2, -.06, z);
      scene.add(room); roomGroups.push(room);
      box(room,10,.13,9.5,floor,0,-HALF,0);
      box(room,10,.10,9.5,ceil,0,HALF,0);
      box(room,10,H,.16,wall,0,0,-4.76);
      box(room,10,H,.16,wall,0,0,4.76);
      box(room,.14,H,9.5,wall,side*5,0,0);
      const accent = new THREE.PointLight(0xffdfaa, 9, 12, 2);
      accent.position.set(0,1.25,0);room.add(accent);
      const board = new THREE.Group();room.add(board);
      // Own QUL content inside the spaces; follows the reference's four-room navigation.
      if (id==='reading') {
        const book = new THREE.Group(); book.position.set(0,-.18,-1.8); room.add(book);
        box(book,1.67,.16,2.5,teal,-.88,0,0);
        box(book,1.67,.16,2.5,teal,.88,0,0);
        box(book,1.52,.05,2.38,white,-.85,.12,0);
        box(book,1.52,.05,2.38,white,.85,.12,0);
        box(book,.08,.27,2.5,gold,0,0,0);
        label(room, callbacks.lang==='ar'?'القراءة':'READING',3,.9,0,.75,-4.54);
      } else if(id==='listening') {
        box(room,2.8,1.7,.36,teal,0,-.3,-2);
        box(room,2.5,1.0,.08,white,0,-.19,-1.78);
        for(const x of [-.73,.73]) {
          const reel = new THREE.Mesh(keepGeo(new THREE.TorusGeometry(.31,.08,10,40)),gold);
          reel.position.set(x,-.17,-1.71);room.add(reel);
          box(room,.19,.19,.09,ink,x,-.17,-1.66);
        }
        label(room,callbacks.lang==='ar'?'الاستماع':'LISTENING',3,.9,0,.85,-4.54);
      } else if(id==='games') {
        const spaceship = new THREE.Group(); spaceship.position.set(0,-.15,-2);room.add(spaceship);
        const body = new THREE.Mesh(keepGeo(new THREE.CylinderGeometry(.30,.49,2.6,24)),white);
        body.rotation.z=.18; spaceship.add(body);
        const cone = new THREE.Mesh(keepGeo(new THREE.ConeGeometry(.31,.9,24)),gold);
        cone.position.y=1.66;cone.rotation.z=.18;spaceship.add(cone);
        for(const x of [-.6,.6])box(spaceship,.5,1.0,.18,teal,x,-.6,0);
        const flame = new THREE.Mesh(keepGeo(new THREE.ConeGeometry(.26,1.1,24)),gold);
        flame.rotation.z=Math.PI;flame.position.y=-1.7;spaceship.add(flame);
        label(room,callbacks.lang==='ar'?'الألعاب':'GAMES',3,.9,0,.85,-4.54);
      } else {
        box(room,4.3,2.2,.1,teal,0,.24,-3.4);
        for(let i=0;i<4;i++)box(room,.55,.5+i*.22,.12,gold,-1.3+i*.85,-.51+(i*.22)/2,-3.29);
        label(room,callbacks.lang==='ar'?'للمدارس':'FOR SCHOOLS',3.4,.8,0,1.16,-3.28);
      }
      doors.push({id,side,z,hinge,leaf,hit,glow:glowMesh,room,open:0,targetOpen:0});
    });
  }

  // The original corridor uses sawtooth recesses; actual gaps remain at doors.
  for (const side of [-1,1]) {
    const gaps=doors.filter(d=>d.side===side).map(d=>({near:d.z+D_SPAN/2,far:d.z-D_SPAN/2}))
      .sort((a,b)=>b.near-a.near);
    let cursor=Z_TOP;
    for(const gap of gaps) {
      if(cursor > gap.near) {
        const middle=(cursor+gap.near)/2;
        box(corridor,.18,H,cursor-gap.near,wall,side*W,0,middle);
      }
      cursor=gap.far;
    }
    if(cursor>Z_END)box(corridor,.18,H,cursor-Z_END,wall,side*W,0,(cursor+Z_END)/2);
  }

  // Entrance doors: like the source site, doors are in front of the gallery.
  const entrance = new THREE.Group();
  entrance.position.set(0,0,22);
  scene.add(entrance);
  const entranceLeaves: THREE.Group[]=[];
  for(const side of [-1,1]) {
    const hinge=new THREE.Group();hinge.position.x=side*1.26;entrance.add(hinge);
    const leaf=new THREE.Group();hinge.add(leaf);
    box(leaf,1.25,3.35,.17,teal,-side*.625,0,0);
    box(leaf,1.1,3.16,.18,wall,-side*.625,0,.035);
    box(leaf,.06,2.95,.18,gold,-side*.08,0,.07);
    box(leaf,.14,.14,.26,gold,-side*1.05,-.17,.18);
    entranceLeaves.push(hinge);
  }
  box(entrance,.25,4.0,.6,ink,-1.38,0,0);
  box(entrance,.25,4.0,.6,ink,1.38,0,0);
  box(entrance,2.9,.23,.6,ink,0,1.9,0);
  const entranceName=label(entrance,'قُل',2.25,.85,0,2.56,.08);
  entranceName.material.transparent=true;
  const entranceHit = new THREE.Mesh(keepGeo(new THREE.BoxGeometry(3.6,3.8,.7)),
    keepMat(new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false})));
  entranceHit.userData.entrance=true;
  entrance.add(entranceHit);
  targets.push(entranceHit);
  box(corridor,7,.14,10,floor,0,-HALF-.07,23);
  box(corridor,7,.14,10,ceil,0,HALF+.06,23);
  for(const x of [-W,W])box(corridor,.16,H,10,wall,x,0,23);

  // QUL letters integrate with the hallway rather than becoming unrelated overlays.
  const floatGlyphs: THREE.Mesh[] = [];
  for(let i=0;i<32;i++) {
    const ar='قُلْعَرَبِيَّة'.charAt(i % 11);
    const tex=keepTex(labelTexture(ar,{width:160,height:160,fg:i%2?'#b19564':'#557562'}));
    const mesh=panel(corridor,tex,.33,.33,((i%2)?1:-1)*(2.45+(i%3)*.16),
      -.1+(i%7)*.25, 14-i*5.2);
    mesh.rotation.y=i%2?.4:-.4;
    floatGlyphs.push(mesh);
  }
  const clock=new THREE.Clock();
  const look = new THREE.Vector3(0,0,18);
  const aim = new THREE.Vector3(0,0,18);
  const origin = new THREE.Vector3();
  const pointer = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  let hover: THREE.Object3D | null=null;
  let phase: CorridorPhase='entrance';
  let active:Portal | null=null;
  let requestedZ=28;
  let openEntrance=0;
  let openTarget=0;
  let roomTarget=new THREE.Vector3();
  let viewTarget=new THREE.Vector3();
  let travel=0;
  let animId=0,disposed=false,last=0,enabled=true;
  let pointerX=0, pointerY=0, downX=0,downY=0;
  let touchY=0, touchX=0,touchMoved=false;
  let currentSegment=0;
  const emit=(next:CorridorPhase, room?:QulRoom) => {
    phase=next;callbacks.onPhase(next,room);
  };
  const focusRoom=(portal:Portal)=> {
    if (phase!=='corridor')return;
    active=portal;
    portal.targetOpen = portal.side===-1 ? -Math.PI*.58 : Math.PI*.58;
    roomTarget.set(portal.side*10.5,.15,portal.z-.3);
    viewTarget.set(portal.side*15,0,portal.z-.3);
    emit('approaching',portal.id);
  };
  const goBack=()=>{
    if(phase!=='room'||!active)return;
    active.targetOpen=0;
    requestedZ=active.z+4;
    emit('leaving',active.id);
  };
  const approach=(dt:number)=>{
    if(!active)return;
    if(phase==='approaching') {
      // The reference glides to the selected door, opens it and enters the room.
      const entry=new THREE.Vector3(active.side*2.25,.12,active.z+1.9);
      const dist=camera.position.distanceTo(entry);
      if(dist>.13) {
        camera.position.lerp(entry,Math.min(1,dt*1.65));
        aim.lerp(new THREE.Vector3(active.side*6,0,active.z),Math.min(1,dt*1.8));
      } else {
        camera.position.lerp(roomTarget,Math.min(1,dt*.87));
        aim.lerp(viewTarget,Math.min(1,dt*.9));
        if(camera.position.distanceTo(roomTarget)<.2) emit('room',active.id);
      }
    } else if(phase==='leaving') {
      const returnPoint=new THREE.Vector3(0,.16,requestedZ);
      camera.position.lerp(returnPoint,Math.min(1,dt*1.55));
      aim.lerp(new THREE.Vector3(0,0,returnPoint.z-9),Math.min(1,dt*1.8));
      if(camera.position.distanceTo(returnPoint)<.15) {
        active=null; emit('corridor');
      }
    }
  };
  const start=()=>{
    if(phase!=='entrance')return;
    openTarget=1;
    requestedZ=8;
    emit('entering');
  };
  const navigate=(id:QulRoom)=>{
    if(phase==='entrance'){start();return;}
    if(phase==='room'){goBack();return;}
    const candidate=doors.find(d=>d.id===id&&d.z>-70);
    if(candidate) {
      requestedZ=candidate.z+5;
      // travel to the door before opening, as on the source site
      movingTo=candidate;
    }
  };
  let movingTo:Portal|null=null;
  const onWheel=(e:WheelEvent)=>{
    if(!enabled || phase==='room'||phase==='approaching'||phase==='leaving') return;
    e.preventDefault();
    if(phase==='entrance') {start();return;}
    if(phase!=='corridor')return;
    requestedZ = clamp(requestedZ-e.deltaY*.025,-143,8);
  };
  const onKey=(e:KeyboardEvent)=>{
    if((e.target as HTMLElement)?.closest('input,textarea,select,[role=dialog]'))return;
    if(e.key==='Escape'&&phase==='room'){goBack();return;}
    if(phase==='entrance'&&(e.key==='Enter'||e.key===' ')){e.preventDefault();start();return;}
    if(phase==='corridor'&&['ArrowDown','ArrowUp','PageDown','PageUp',' '].includes(e.key)){
      e.preventDefault();
      const v=e.key==='ArrowDown'?100:e.key==='ArrowUp'?-100:e.key==='PageDown'?400:e.key==='PageUp'?-400:180;
      requestedZ=clamp(requestedZ-v*.025,-143,8);
    }
  };
  const pick=(event:PointerEvent):THREE.Object3D|null=>{
    const rect=renderer.domElement.getBoundingClientRect();
    pointer.x=((event.clientX-rect.left)/rect.width)*2-1;
    pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;
    raycaster.setFromCamera(pointer,camera);
    const matches=raycaster.intersectObjects(targets,false);
    for(const v of matches) {
      if(v.object.userData.entrance&&(phase==='entrance'||phase==='entering')) return v.object;
      if(v.object.userData.room&&phase==='corridor'&&Math.abs(camera.position.z-(doors.find(d=>d.hit===v.object)?.z??0))<11) return v.object;
    }
    return null;
  };
  const onPointerMove=(e:PointerEvent)=>{
    pointerX=(e.clientX/window.innerWidth-.5)*2;
    pointerY=(e.clientY/window.innerHeight-.5)*2;
    if(e.pointerType==='touch')return;
    hover=pick(e);
    renderer.domElement.style.cursor=hover?'pointer':'default';
  };
  const onPointerDown=(e:PointerEvent)=>{downX=e.clientX;downY=e.clientY;touchX=e.clientX;touchY=e.clientY;touchMoved=false;};
  const onPointerUp=(e:PointerEvent)=>{
    if(e.pointerType==='touch'&&(Math.abs(e.clientY-downY)>15||touchMoved))return;
    if(Math.abs(e.clientX-downX)>18||Math.abs(e.clientY-downY)>18)return;
    const hit=pick(e);
    if(hit?.userData.entrance)start();
    else if(hit?.userData.room) {
      const selected=doors.find(d=>d.hit===hit);
      if(selected)focusRoom(selected);
    }
  };
  const onTouchMove=(e:TouchEvent)=>{
    if(!enabled || phase!=='corridor'||!e.touches.length)return;
    e.preventDefault();
    const y=e.touches[0].clientY;
    const delta=(touchY-y)*2;
    if(Math.abs(delta)>2)touchMoved=true;
    touchY=y;
    requestedZ=clamp(requestedZ-delta*.025,-143,8);
  };
  const canvas=renderer.domElement;
  canvas.addEventListener('wheel',onWheel,{passive:false});
  canvas.addEventListener('pointermove',onPointerMove);
  canvas.addEventListener('pointerdown',onPointerDown);
  canvas.addEventListener('pointerup',onPointerUp);
  canvas.addEventListener('touchmove',onTouchMove,{passive:false});
  window.addEventListener('keydown',onKey);
  const resize=()=>{
    const w=host.clientWidth,h=host.clientHeight;
    if(!w||!h)return;
    renderer.setSize(w,h,false);
    camera.aspect=w/h;
    camera.fov=w<600?70:62;
    camera.updateProjectionMatrix();
  };
  resize();
  const observer=new ResizeObserver(resize);
  observer.observe(host);
  const draw=(now:number)=>{
    animId=requestAnimationFrame(draw);
    if(disposed||document.hidden||!enabled)return;
    if(mobile&&now-last<28)return;
    const dt=Math.min((now-last)/1000||.016,.06);
    last=now;
    travel+=dt;
    openEntrance=THREE.MathUtils.damp(openEntrance,openTarget,2.3,dt);
    entranceLeaves[0].rotation.y=openEntrance*-.Math.PI*.57;
    entranceLeaves[1].rotation.y=openEntrance*Math.PI*.57;
    entrance.visible=phase==='entrance'||(phase==='entering'&&camera.position.z>19);
    targets.forEach(hit=>{
      const portal=doors.find(d=>d.hit===hit);
      if(!portal)return;
      portal.open=THREE.MathUtils.damp(portal.open,portal.targetOpen,2.1,dt);
      portal.hinge.rotation.y=portal.open;
      (portal.glow.material as THREE.MeshBasicMaterial).opacity=
        hover === hit && phase === 'corridor' ? 0.15 : 0;
    });
    if(phase==='entering') {
      requestedZ=8;
      const factor=1-Math.exp(-1.2*dt);
      camera.position.z += (requestedZ-camera.position.z)*factor;
      aim.lerp(new THREE.Vector3(0,0,camera.position.z-9),Math.min(1,dt*2));
      if(camera.position.z<8.45) emit('corridor');
    } else if(phase==='corridor') {
      const delta=clamp(dt*3.6,0,1);
      camera.position.z+=(requestedZ-camera.position.z)*delta; // source smoothing 0.06/frame
      const parallaxX=mobile?0:pointerX*.27;
      const parallaxY=mobile?0:pointerY*.11;
      camera.position.x=THREE.MathUtils.damp(camera.position.x,parallaxX,4,dt);
      camera.position.y=THREE.MathUtils.damp(camera.position.y,.1-parallaxY,4,dt);
      // Original camera has a nearby door glance as visitors advance.
      const near=doors.find(d=>Math.abs(d.z-camera.position.z)<5);
      const glancing=near?near.side*.48*(1-Math.abs(near.z-camera.position.z)/5):0;
      aim.lerp(new THREE.Vector3(glancing,0,camera.position.z-9),Math.min(1,dt*3.5));
      if(movingTo&&Math.abs(camera.position.z-requestedZ)<.3){
        const selected=movingTo;movingTo=null;focusRoom(selected);
      }
      currentSegment=Math.floor((10-camera.position.z)/80);
      callbacks.onProgress(clamp((28-camera.position.z)/100,0,1));
    } else if(phase==='approaching'||phase==='leaving') approach(dt);
    // Floating letters are small spatial details attached to the hallway.
    floatGlyphs.forEach((glyph,i)=>{
      glyph.position.y=(-.1+(i%7)*.25)+Math.sin(travel*.6+i*.83)*.07;
      glyph.rotation.z=Math.sin(travel*.38+i)*.05;
    });
    // Smooth target tracking; entering rooms turns your view through the doorway.
    look.lerp(aim,Math.min(1,dt*4.8));
    camera.lookAt(look);
    renderer.render(scene,camera);
  };
  animId=requestAnimationFrame(draw);
  callbacks.onPhase('entrance');
  const setLanguage=(lang:'ar'|'en')=>{
    callbacks.lang=lang;
    // Room name textures retain the chosen language after switching.
    for(const portal of doors) {
      const frame=portal.hinge.parent!;
      const sign=frame.children.find(c=>c.userData.kind==='sign') as THREE.Mesh|undefined;
      if(!sign)return;
      const material=sign.material as THREE.MeshBasicMaterial;
      const prev=material.map;
      material.map=keepTex(labelTexture(LABELS[portal.id][lang]));
      material.needsUpdate=true;
      if(prev)prev.dispose();
    }
  };
  return {
    start,back:goBack,visit:navigate,setLanguage,
    setMotionEnabled(next:boolean){enabled=next; if(!next)renderer.render(scene,camera);},
    dispose(){
      disposed=true;cancelAnimationFrame(animId);observer.disconnect();
      canvas.removeEventListener('wheel',onWheel);
      canvas.removeEventListener('pointermove',onPointerMove);
      canvas.removeEventListener('pointerdown',onPointerDown);
      canvas.removeEventListener('pointerup',onPointerUp);
      canvas.removeEventListener('touchmove',onTouchMove);
      window.removeEventListener('keydown',onKey);
      scene.traverse(obj=>{
        if(obj instanceof THREE.Mesh) {
          if(!geometries.includes(obj.geometry))obj.geometry.dispose();
        }
      });
      geometries.forEach(g=>g.dispose());
      materials.forEach(m=>m.dispose());
      textures.forEach(t=>t.dispose());
      renderer.dispose();canvas.remove();
    }
  };
}
