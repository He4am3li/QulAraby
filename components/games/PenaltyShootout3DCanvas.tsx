import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { PlayerCard, TeamInfo, AnswerOption } from './PenaltyShootout';
import championsBallTexture from '/src/assets/images/champions_ball_texture_1790676004465.jpg';
import proPitchGrassTurf from '/src/assets/images/pro_pitch_grass_turf_1790675991247.jpg';
import ochoaImg from '/src/assets/images/ochoa_goalkeeper_1790691964622.jpg';
import { Camera, Eye, Zap, Volume2, RefreshCw } from 'lucide-react';

interface PenaltyShootout3DCanvasProps {
  striker: PlayerCard;
  team: TeamInfo;
  opponentTeam: TeamInfo;
  onShotFinish: (isGoal: boolean, option: AnswerOption) => void;
  audio: any;
  currentQuestion: {
    id: number;
    category: string;
    prompt: string;
    answers: AnswerOption[];
    explanation: string;
  };
  roundIndex: number;
}

export type CameraMode = 'behind_striker' | 'broadcast' | 'inside_net' | 'cinematic_orbit';

export const PenaltyShootout3DCanvas: React.FC<PenaltyShootout3DCanvasProps> = ({
  striker,
  team,
  opponentTeam,
  onShotFinish,
  audio,
  currentQuestion,
  roundIndex
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [cameraMode, setCameraMode] = useState<CameraMode>('behind_striker');
  const [isShotActive, setIsShotActive] = useState<boolean>(false);
  const [shotPhase, setShotPhase] = useState<'aiming' | 'runup' | 'in_flight' | 'impact' | 'celebration' | 'despair'>('aiming');
  const [actionBanner, setActionBanner] = useState<string>('اختر إحدى زوايا المرمى الأربع للإجابة والتسديد!');

  // Three.js References to control animation state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Entities references
  const ballMeshRef = useRef<THREE.Mesh | null>(null);
  const netMeshRef = useRef<THREE.Mesh | null>(null);
  const netOriginalPositionsRef = useRef<Float32Array | null>(null);
  const strikerGroupRef = useRef<THREE.Group | null>(null);
  const strikerRightLegRef = useRef<THREE.Group | null>(null);
  const strikerLeftLegRef = useRef<THREE.Group | null>(null);
  const strikerRightArmRef = useRef<THREE.Group | null>(null);
  const strikerLeftArmRef = useRef<THREE.Group | null>(null);
  const strikerHeadRef = useRef<THREE.Mesh | null>(null);

  const keeperGroupRef = useRef<THREE.Group | null>(null);
  const keeperLeftArmRef = useRef<THREE.Group | null>(null);
  const keeperRightArmRef = useRef<THREE.Group | null>(null);

  const crowdParticlesRef = useRef<THREE.Points | null>(null);
  const crowdMeshesRef = useRef<THREE.InstancedMesh | null>(null);
  const stadiumLightsRef = useRef<THREE.SpotLight[]>([]);

  // Shot simulation trajectory variables
  const shotStateRef = useRef<{
    active: boolean;
    phase: 'aiming' | 'runup' | 'in_flight' | 'impact' | 'celebration' | 'despair';
    startTime: number;
    duration: number;
    startPos: THREE.Vector3;
    targetPos: THREE.Vector3;
    isGoal: boolean;
    chosenOption: AnswerOption | null;
    ballSpin: THREE.Vector3;
    netHitTriggered: boolean;
    keeperDived: boolean;
  }>({
    active: false,
    phase: 'aiming',
    startTime: 0,
    duration: 1.1,
    startPos: new THREE.Vector3(0, 0.22, 11),
    targetPos: new THREE.Vector3(0, 1.2, 0),
    isGoal: true,
    chosenOption: null,
    ballSpin: new THREE.Vector3(0, 0, 0),
    netHitTriggered: false,
    keeperDived: false
  });

  // Setup Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060c18);
    scene.fog = new THREE.FogExp2(0x060c18, 0.012);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 200);
    camera.position.set(0, 2.4, 15.2);
    camera.lookAt(0, 1.4, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const textureLoader = new THREE.TextureLoader();

    // 4. Stadium Floodlights & Ambient
    const ambientLight = new THREE.AmbientLight(0x2d3748, 1.2);
    scene.add(ambientLight);

    const mainDirectional = new THREE.DirectionalLight(0xffffff, 1.5);
    mainDirectional.position.set(10, 25, 20);
    mainDirectional.castShadow = true;
    mainDirectional.shadow.mapSize.width = 2048;
    mainDirectional.shadow.mapSize.height = 2048;
    mainDirectional.shadow.camera.near = 0.5;
    mainDirectional.shadow.camera.far = 60;
    mainDirectional.shadow.camera.left = -15;
    mainDirectional.shadow.camera.right = 15;
    mainDirectional.shadow.camera.top = 20;
    mainDirectional.shadow.camera.bottom = -5;
    scene.add(mainDirectional);

    // 4 Floodlight Towers (Stadium Atmosphere)
    const lightPositions: [number, number, number][] = [
      [-18, 18, 18],
      [18, 18, 18],
      [-18, 18, -6],
      [18, 18, -6]
    ];
    stadiumLightsRef.current = [];

    lightPositions.forEach(([lx, ly, lz]) => {
      const spot = new THREE.SpotLight(0xfff7ed, 4.0, 65, Math.PI / 4, 0.45, 1);
      spot.position.set(lx, ly, lz);
      spot.target.position.set(0, 1.2, 3);
      spot.castShadow = false;
      scene.add(spot);
      scene.add(spot.target);
      stadiumLightsRef.current.push(spot);

      // Light Flare / Lens Glow Mesh
      const flareGeo = new THREE.SphereGeometry(0.7, 16, 16);
      const flareMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const flare = new THREE.Mesh(flareGeo, flareMat);
      flare.position.set(lx, ly, lz);
      scene.add(flare);
    });

    // 5. Realistic Grass Pitch with Turf Texture
    const grassTexture = textureLoader.load(proPitchGrassTurf);
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(12, 12);

    const pitchGeo = new THREE.PlaneGeometry(60, 60);
    const pitchMat = new THREE.MeshStandardMaterial({
      map: grassTexture,
      roughness: 0.85,
      metalness: 0.1
    });
    const pitch = new THREE.Mesh(pitchGeo, pitchMat);
    pitch.rotation.x = -Math.PI / 2;
    pitch.position.y = 0;
    pitch.receiveShadow = true;
    scene.add(pitch);

    // Pitch Lines (Goal Line, Penalty Box, Penalty Spot, Penalty Arc)
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Goal Line
    const goalLine = new THREE.Mesh(new THREE.PlaneGeometry(24, 0.14), lineMat);
    goalLine.rotation.x = -Math.PI / 2;
    goalLine.position.set(0, 0.005, 0);
    scene.add(goalLine);

    // 18-Yard Box Lines
    const penaltyBoxWidth = 18;
    const penaltyBoxLength = 14;
    // Front line
    const pFrontLine = new THREE.Mesh(new THREE.PlaneGeometry(penaltyBoxWidth, 0.14), lineMat);
    pFrontLine.rotation.x = -Math.PI / 2;
    pFrontLine.position.set(0, 0.005, penaltyBoxLength);
    scene.add(pFrontLine);
    // Left side line
    const pLeftLine = new THREE.Mesh(new THREE.PlaneGeometry(0.14, penaltyBoxLength), lineMat);
    pLeftLine.rotation.x = -Math.PI / 2;
    pLeftLine.position.set(-penaltyBoxWidth / 2, 0.005, penaltyBoxLength / 2);
    scene.add(pLeftLine);
    // Right side line
    const pRightLine = new THREE.Mesh(new THREE.PlaneGeometry(0.14, penaltyBoxLength), lineMat);
    pRightLine.rotation.x = -Math.PI / 2;
    pRightLine.position.set(penaltyBoxWidth / 2, 0.005, penaltyBoxLength / 2);
    scene.add(pRightLine);

    // Penalty Spot (11 meters from goal line)
    const penaltySpotGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.02, 32);
    const penaltySpot = new THREE.Mesh(penaltySpotGeo, lineMat);
    penaltySpot.position.set(0, 0.01, 11);
    scene.add(penaltySpot);

    // 6. Regulation 3D Goal (Width: 7.32m, Height: 2.44m, Depth: 2.2m)
    const goalGroup = new THREE.Group();
    const postMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.8
    });
    const postRadius = 0.09;
    const goalWidth = 7.32;
    const goalHeight = 2.44;
    const goalDepth = 2.2;

    // Left Post
    const leftPost = new THREE.Mesh(new THREE.CylinderGeometry(postRadius, postRadius, goalHeight, 24), postMat);
    leftPost.position.set(-goalWidth / 2, goalHeight / 2, 0);
    leftPost.castShadow = true;
    goalGroup.add(leftPost);

    // Right Post
    const rightPost = new THREE.Mesh(new THREE.CylinderGeometry(postRadius, postRadius, goalHeight, 24), postMat);
    rightPost.position.set(goalWidth / 2, goalHeight / 2, 0);
    rightPost.castShadow = true;
    goalGroup.add(rightPost);

    // Crossbar
    const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(postRadius, postRadius, goalWidth + postRadius * 2, 24), postMat);
    crossbar.rotation.z = Math.PI / 2;
    crossbar.position.set(0, goalHeight, 0);
    crossbar.castShadow = true;
    goalGroup.add(crossbar);

    // Back Support Pipes
    const backLeftSupport = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, Math.sqrt(goalHeight * goalHeight + goalDepth * goalDepth), 16), postMat);
    backLeftSupport.position.set(-goalWidth / 2, goalHeight / 2, -goalDepth / 2);
    backLeftSupport.rotation.x = Math.atan2(goalDepth, goalHeight);
    goalGroup.add(backLeftSupport);

    const backRightSupport = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, Math.sqrt(goalHeight * goalHeight + goalDepth * goalDepth), 16), postMat);
    backRightSupport.position.set(goalWidth / 2, goalHeight / 2, -goalDepth / 2);
    backRightSupport.rotation.x = Math.atan2(goalDepth, goalHeight);
    goalGroup.add(backRightSupport);

    // 3D Goal Net (Deformable Mesh)
    const netGeo = new THREE.PlaneGeometry(goalWidth, goalHeight, 24, 16);
    // Position net back plane
    netGeo.translate(0, goalHeight / 2, -goalDepth);
    const netMat = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      wireframe: true,
      roughness: 0.9,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide
    });
    const netMesh = new THREE.Mesh(netGeo, netMat);
    netMeshRef.current = netMesh;
    netOriginalPositionsRef.current = new Float32Array(netGeo.attributes.position.array);
    goalGroup.add(netMesh);

    scene.add(goalGroup);

    // 7. Dynamic 3D Crowd Stands (Tiered Grandstand & Instanced Spectators)
    const standsGroup = new THREE.Group();
    const grandstandMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });

    // 10 Tiered Rows behind the goal
    const numRows = 10;
    const rowDepth = 1.2;
    const rowHeight = 0.7;
    for (let r = 0; r < numRows; r++) {
      const rowMesh = new THREE.Mesh(new THREE.BoxGeometry(45, rowHeight, rowDepth), grandstandMat);
      rowMesh.position.set(0, 0.35 + r * rowHeight, -goalDepth - 2.5 - r * rowDepth);
      standsGroup.add(rowMesh);
    }

    // Instanced Crowd Spectators (Jump, Wave, Cheer)
    const totalSpectators = 900;
    const spectatorGeo = new THREE.CylinderGeometry(0.2, 0.22, 0.9, 8);
    const spectatorMat = new THREE.MeshStandardMaterial({ roughness: 0.7 });
    const crowdMesh = new THREE.InstancedMesh(spectatorGeo, spectatorMat, totalSpectators);
    crowdMeshesRef.current = crowdMesh;

    const dummy = new THREE.Object3D();
    const teamColor = new THREE.Color(team.primaryColor);
    const oppColor = new THREE.Color(opponentTeam.primaryColor);
    const whiteColor = new THREE.Color(0xffffff);
    const redColor = new THREE.Color(0xef4444);
    const blueColor = new THREE.Color(0x3b82f6);

    let spectatorIdx = 0;
    for (let r = 0; r < numRows; r++) {
      const countInRow = 90;
      for (let c = 0; c < countInRow; c++) {
        if (spectatorIdx >= totalSpectators) break;
        const sx = -20 + (c / (countInRow - 1)) * 40 + (Math.random() * 0.2 - 0.1);
        const sy = 0.8 + r * rowHeight;
        const sz = -goalDepth - 2.5 - r * rowDepth;

        dummy.position.set(sx, sy, sz);
        dummy.updateMatrix();
        crowdMesh.setMatrixAt(spectatorIdx, dummy.matrix);

        // Assign vibrant team fan jersey colors
        const pick = Math.random();
        const fanColor = pick < 0.4 ? teamColor : pick < 0.7 ? oppColor : pick < 0.85 ? blueColor : redColor;
        crowdMesh.setColorAt(spectatorIdx, fanColor);

        spectatorIdx++;
      }
    }
    crowdMesh.instanceMatrix.needsUpdate = true;
    if (crowdMesh.instanceColor) crowdMesh.instanceColor.needsUpdate = true;
    standsGroup.add(crowdMesh);

    // Flashing camera lights in stands (Champions League Night effect)
    const flashCount = 120;
    const flashGeo = new THREE.BufferGeometry();
    const flashPositions = new Float32Array(flashCount * 3);
    for (let i = 0; i < flashCount; i++) {
      flashPositions[i * 3] = (Math.random() - 0.5) * 42;
      flashPositions[i * 3 + 1] = 1.0 + Math.random() * 7;
      flashPositions[i * 3 + 2] = -goalDepth - 3.0 - Math.random() * 12;
    }
    flashGeo.setAttribute('position', new THREE.BufferAttribute(flashPositions, 3));
    const flashMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.35,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const flashPoints = new THREE.Points(flashGeo, flashMat);
    crowdParticlesRef.current = flashPoints;
    standsGroup.add(flashPoints);

    scene.add(standsGroup);

    // 8. Official World Cup 3D Ball
    const ballTexture = textureLoader.load(championsBallTexture);
    const ballGeo = new THREE.SphereGeometry(0.22, 32, 32);
    const ballMat = new THREE.MeshStandardMaterial({
      map: ballTexture,
      roughness: 0.35,
      metalness: 0.25
    });
    const ballMesh = new THREE.Mesh(ballGeo, ballMat);
    ballMesh.position.set(0, 0.22, 11);
    ballMesh.castShadow = true;
    scene.add(ballMesh);
    ballMeshRef.current = ballMesh;

    // 9. Articulated 3D Striker Model (Messi / Mbappe / Ronaldo / etc.)
    const strikerGroup = new THREE.Group();
    strikerGroup.position.set(0, 0, 12.6); // 1.6m behind the ball
    strikerGroup.rotation.y = Math.PI; // Looking towards the goal

    const jerseyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(team.primaryColor),
      roughness: 0.5
    });
    const shortsMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(team.secondaryColor || '#ffffff'),
      roughness: 0.5
    });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xdeb887, roughness: 0.7 });
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.3 });

    // Striker Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.58, 0.26), jerseyMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    strikerGroup.add(torso);

    // Striker Head (with photo portrait texture badge or realistic athletic modeling)
    const headTexture = textureLoader.load(striker.image);
    const headMat = new THREE.MeshStandardMaterial({
      map: headTexture,
      roughness: 0.4
    });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 20), headMat);
    head.position.y = 1.8;
    head.castShadow = true;
    strikerGroup.add(head);
    strikerHeadRef.current = head;

    // Striker Shorts / Pelvis
    const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.24, 0.24), shortsMat);
    pelvis.position.y = 0.98;
    strikerGroup.add(pelvis);

    // Right Leg (Kicking leg)
    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(-0.14, 0.88, 0);
    const rightThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.42, 12), shortsMat);
    rightThigh.position.y = -0.21;
    rightLegGroup.add(rightThigh);
    const rightShin = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.42, 12), jerseyMat);
    rightShin.position.y = -0.58;
    rightLegGroup.add(rightShin);
    const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.08, 0.24), bootMat);
    rightBoot.position.set(0, -0.82, -0.06);
    rightLegGroup.add(rightBoot);
    strikerGroup.add(rightLegGroup);
    strikerRightLegRef.current = rightLegGroup;

    // Left Leg (Plant foot)
    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(0.14, 0.88, 0);
    const leftThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.42, 12), shortsMat);
    leftThigh.position.y = -0.21;
    leftLegGroup.add(leftThigh);
    const leftShin = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.42, 12), jerseyMat);
    leftShin.position.y = -0.58;
    leftLegGroup.add(leftShin);
    const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.08, 0.24), bootMat);
    leftBoot.position.set(0, -0.82, -0.06);
    leftLegGroup.add(leftBoot);
    strikerGroup.add(leftLegGroup);
    strikerLeftLegRef.current = leftLegGroup;

    // Arms
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(-0.3, 1.55, 0);
    const rightArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.54, 12), skinMat);
    rightArmMesh.position.y = -0.27;
    rightArmGroup.add(rightArmMesh);
    strikerGroup.add(rightArmGroup);
    strikerRightArmRef.current = rightArmGroup;

    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(0.3, 1.55, 0);
    const leftArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.54, 12), skinMat);
    leftArmMesh.position.y = -0.27;
    leftArmGroup.add(leftArmMesh);
    strikerGroup.add(leftArmGroup);
    strikerLeftArmRef.current = leftArmGroup;

    scene.add(strikerGroup);
    strikerGroupRef.current = strikerGroup;

    // 10. Articulated 3D Goalkeeper Model (Guillermo Ochoa)
    const keeperGroup = new THREE.Group();
    keeperGroup.position.set(0, 0, 0.2); // On the goal line
    keeperGroup.rotation.y = 0; // Looking towards the penalty spot

    const keeperJerseyMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4 }); // Neon Green keeper jersey
    const keeperShortsMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.5 });
    const keeperGloveMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 }); // Yellow gloves

    // Keeper Torso
    const kTorso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.28), keeperJerseyMat);
    kTorso.position.y = 1.38;
    kTorso.castShadow = true;
    keeperGroup.add(kTorso);

    // Keeper Head
    const keeperHeadTexture = textureLoader.load(ochoaImg);
    const kHead = new THREE.Mesh(new THREE.SphereGeometry(0.19, 20, 20), new THREE.MeshStandardMaterial({ map: keeperHeadTexture }));
    kHead.position.y = 1.84;
    kHead.castShadow = true;
    keeperGroup.add(kHead);

    // Keeper Legs
    const kPelvis = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.24, 0.24), keeperShortsMat);
    kPelvis.position.y = 1.0;
    keeperGroup.add(kPelvis);

    const kLeftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.85, 12), keeperJerseyMat);
    kLeftLeg.position.set(-0.16, 0.5, 0);
    keeperGroup.add(kLeftLeg);

    const kRightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.85, 12), keeperJerseyMat);
    kRightLeg.position.set(0.16, 0.5, 0);
    keeperGroup.add(kRightLeg);

    // Keeper Arms with Large Gloves
    const kLeftArmGroup = new THREE.Group();
    kLeftArmGroup.position.set(-0.32, 1.55, 0);
    const kLeftArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.55, 12), keeperJerseyMat);
    kLeftArmMesh.position.y = -0.27;
    kLeftArmGroup.add(kLeftArmMesh);
    const kLeftGlove = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.12), keeperGloveMat);
    kLeftGlove.position.y = -0.58;
    kLeftArmGroup.add(kLeftGlove);
    keeperGroup.add(kLeftArmGroup);
    keeperLeftArmRef.current = kLeftArmGroup;

    const kRightArmGroup = new THREE.Group();
    kRightArmGroup.position.set(0.32, 1.55, 0);
    const kRightArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.55, 12), keeperJerseyMat);
    kRightArmMesh.position.y = -0.27;
    kRightArmGroup.add(kRightArmMesh);
    const kRightGlove = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.12), keeperGloveMat);
    kRightGlove.position.y = -0.58;
    kRightArmGroup.add(kRightGlove);
    keeperGroup.add(kRightArmGroup);
    keeperRightArmRef.current = kRightArmGroup;

    scene.add(keeperGroup);
    keeperGroupRef.current = keeperGroup;

    // 11. Main 60FPS Render & Physics Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // A. Dynamic Crowd Animation (Cheering & Camera Flashes)
      if (crowdMeshesRef.current) {
        const dummyMatrix = new THREE.Object3D();
        const isGoalScored = shotStateRef.current.phase === 'celebration';
        const bounceSpeed = isGoalScored ? 12 : 3.5;
        const bounceHeight = isGoalScored ? 0.35 : 0.08;

        for (let i = 0; i < 900; i += 8) {
          crowdMeshesRef.current.getMatrixAt(i, dummyMatrix.matrix);
          dummyMatrix.matrix.decompose(dummyMatrix.position, dummyMatrix.quaternion, dummyMatrix.scale);
          dummyMatrix.position.y += Math.sin(elapsed * bounceSpeed + i) * bounceHeight * delta;
          dummyMatrix.updateMatrix();
          crowdMeshesRef.current.setMatrixAt(i, dummyMatrix.matrix);
        }
        crowdMeshesRef.current.instanceMatrix.needsUpdate = true;
      }

      // Random camera flashes
      if (crowdParticlesRef.current) {
        const mat = crowdParticlesRef.current.material as THREE.PointsMaterial;
        mat.opacity = 0.4 + Math.sin(elapsed * 15) * 0.4;
      }

      // B. Keeper Idle Waving / Stance (Before Shot)
      if (keeperGroupRef.current && !shotStateRef.current.keeperDived) {
        // Shuffle side-to-side and wave arms to distract striker
        keeperGroupRef.current.position.x = Math.sin(elapsed * 3.5) * 0.7;
        if (keeperLeftArmRef.current && keeperRightArmRef.current) {
          keeperLeftArmRef.current.rotation.z = Math.sin(elapsed * 5) * 0.4 - 0.4;
          keeperRightArmRef.current.rotation.z = -Math.sin(elapsed * 5) * 0.4 + 0.4;
        }
      }

      // C. Striker Idle Stance (Before Run-up)
      if (strikerGroupRef.current && shotStateRef.current.phase === 'aiming') {
        strikerGroupRef.current.position.y = Math.sin(elapsed * 2.5) * 0.03;
        if (strikerRightArmRef.current) strikerRightArmRef.current.rotation.x = Math.sin(elapsed * 2) * 0.1;
        if (strikerLeftArmRef.current) strikerLeftArmRef.current.rotation.x = -Math.sin(elapsed * 2) * 0.1;
      }

      // D. Shot Execution State Machine
      const shot = shotStateRef.current;
      if (shot.active) {
        const timeSinceShot = elapsed - shot.startTime;

        // Phase 1: Striker Run-up (0.0s to 0.45s)
        if (timeSinceShot < 0.45) {
          shot.phase = 'runup';
          const runProgress = timeSinceShot / 0.45;
          if (strikerGroupRef.current) {
            // Move forward towards the ball (from z: 12.6 to z: 11.2)
            strikerGroupRef.current.position.z = 12.6 - runProgress * 1.4;

            // Leg running cycles
            if (strikerRightLegRef.current && strikerLeftLegRef.current) {
              strikerRightLegRef.current.rotation.x = -Math.sin(runProgress * Math.PI * 4) * 0.9;
              strikerLeftLegRef.current.rotation.x = Math.sin(runProgress * Math.PI * 4) * 0.9;
            }
          }
        }
        // Phase 2: Kick Impact & Ball Launch (at 0.45s)
        else if (timeSinceShot >= 0.45 && timeSinceShot < 0.52) {
          if (strikerRightLegRef.current) {
            // Power strike swing
            strikerRightLegRef.current.rotation.x = 1.35; // Maximum forward strike extension
          }
          if (ballMeshRef.current && !shot.netHitTriggered) {
            audio.playPowerfulKick();
          }
        }
        // Phase 3: Ball Flight in 3D (0.45s to 1.15s)
        else if (timeSinceShot >= 0.45 && timeSinceShot < 1.15) {
          shot.phase = 'in_flight';
          const flightProgress = (timeSinceShot - 0.45) / 0.7; // 0 to 1

          if (ballMeshRef.current) {
            // Ball position interpolation with parabolic arc
            const currentPos = new THREE.Vector3().lerpVectors(shot.startPos, shot.targetPos, flightProgress);
            // Height curve
            const heightArc = Math.sin(flightProgress * Math.PI) * 0.6;
            currentPos.y += heightArc;

            ballMeshRef.current.position.copy(currentPos);

            // Ball rotation spin (Magnus effect)
            ballMeshRef.current.rotation.x += 16 * delta;
            ballMeshRef.current.rotation.y += 12 * delta;
          }

          // Goalkeeper Dive Reaction!
          if (keeperGroupRef.current && !shot.keeperDived) {
            shot.keeperDived = true;
          }
          if (keeperGroupRef.current) {
            const diveProgress = Math.min(1, (timeSinceShot - 0.45) / 0.6);
            const targetX = shot.isGoal ? shot.targetPos.x * 0.55 : shot.targetPos.x * 0.95;
            const targetY = Math.max(0.4, shot.targetPos.y * 0.85);

            keeperGroupRef.current.position.x = THREE.MathUtils.lerp(0, targetX, diveProgress);
            keeperGroupRef.current.position.y = THREE.MathUtils.lerp(0, targetY, diveProgress);
            // Tilt body horizontally into dive
            keeperGroupRef.current.rotation.z = THREE.MathUtils.lerp(0, targetX > 0 ? -1.1 : 1.1, diveProgress);

            if (keeperLeftArmRef.current && keeperRightArmRef.current) {
              keeperLeftArmRef.current.rotation.z = -1.2;
              keeperRightArmRef.current.rotation.z = 1.2;
            }
          }

          // Dynamic Camera Tracking during shot
          if (cameraRef.current && cameraMode === 'behind_striker') {
            cameraRef.current.position.z = THREE.MathUtils.lerp(15.2, 8.5, flightProgress * 0.5);
            cameraRef.current.position.y = THREE.MathUtils.lerp(2.4, 1.8, flightProgress * 0.5);
          }
        }
        // Phase 4: Net Impact or Goalkeeper Save (at 1.15s)
        else if (timeSinceShot >= 1.15 && timeSinceShot < 1.4) {
          if (!shot.netHitTriggered) {
            shot.netHitTriggered = true;

            if (shot.isGoal) {
              // Sound: Goal Cheer & Net Swish
              audio.playGoalCheer();
              setActionBanner('⚽ هـــــــــدف! قذيفة في الشباك لا تصد ولا ترد!');

              // Bulge 3D net backwards where ball hit
              if (netMeshRef.current && netOriginalPositionsRef.current) {
                const posAttr = netMeshRef.current.geometry.attributes.position;
                const arr = posAttr.array as Float32Array;
                for (let v = 0; v < arr.length; v += 3) {
                  const vx = arr[v];
                  const vy = arr[v + 1];
                  const dist = Math.hypot(vx - shot.targetPos.x, vy - shot.targetPos.y);
                  if (dist < 1.8) {
                    arr[v + 2] = netOriginalPositionsRef.current[v + 2] - (1.8 - dist) * 0.65;
                  }
                }
                posAttr.needsUpdate = true;
              }
            } else {
              // Sound: Save / Hit Post & Despair Gasp
              audio.playWoodworkHit();
              audio.playDespairGasp();
              setActionBanner('🧤 تصدي خيالي من الأخطبوط أوتشوا وتشتيت الكرة!');

              // Ball deflects away
              if (ballMeshRef.current) {
                ballMeshRef.current.position.y += 0.8;
                ballMeshRef.current.position.x += 1.4;
                ballMeshRef.current.position.z += 1.2;
              }
            }
          }
        }
        // Phase 5: Player Celebration / Despair Reaction (1.4s to 3.0s)
        else if (timeSinceShot >= 1.4 && timeSinceShot < 3.0) {
          if (shot.isGoal) {
            shot.phase = 'celebration';
            // Striker Celebrates!
            if (strikerGroupRef.current) {
              // Turn towards crowd & raise both arms
              strikerGroupRef.current.rotation.y = 0;
              strikerGroupRef.current.position.y = Math.abs(Math.sin(elapsed * 6)) * 0.35; // Jumping
              if (strikerRightArmRef.current && strikerLeftArmRef.current) {
                strikerRightArmRef.current.rotation.z = 2.4; // Arms raised to heaven
                strikerLeftArmRef.current.rotation.z = -2.4;
              }
            }
            // Keeper lies dejected on grass
            if (keeperGroupRef.current) {
              keeperGroupRef.current.position.y = 0.2;
              keeperGroupRef.current.rotation.z = 1.5;
            }
          } else {
            shot.phase = 'despair';
            // Striker drops hands to head in regret
            if (strikerGroupRef.current) {
              if (strikerRightArmRef.current && strikerLeftArmRef.current) {
                strikerRightArmRef.current.rotation.x = 2.1;
                strikerLeftArmRef.current.rotation.x = 2.1;
              }
            }
            // Keeper pumps fists in celebration
            if (keeperGroupRef.current) {
              keeperGroupRef.current.position.y = 0.8;
              keeperGroupRef.current.rotation.z = 0;
              if (keeperRightArmRef.current) keeperRightArmRef.current.rotation.z = 2.2;
            }
          }
        }
        // Phase 6: Finish and Transition
        else if (timeSinceShot >= 3.0) {
          shot.active = false;
          setIsShotActive(false);
          if (shot.chosenOption) {
            onShotFinish(shot.isGoal, shot.chosenOption);
          }
        }
      }

      // Camera Modes
      if (cameraRef.current) {
        if (cameraMode === 'broadcast') {
          cameraRef.current.position.set(16, 8, 8);
          cameraRef.current.lookAt(0, 1.2, 3);
        } else if (cameraMode === 'inside_net') {
          cameraRef.current.position.set(0, 1.3, -goalDepth + 0.4);
          cameraRef.current.lookAt(0, 1.0, 11);
        } else if (cameraMode === 'cinematic_orbit') {
          const orbitRadius = 13;
          cameraRef.current.position.x = Math.sin(elapsed * 0.5) * orbitRadius;
          cameraRef.current.position.z = Math.cos(elapsed * 0.5) * orbitRadius + 4;
          cameraRef.current.position.y = 3.5;
          cameraRef.current.lookAt(0, 1.2, 5);
        } else if (cameraMode === 'behind_striker' && !shot.active) {
          cameraRef.current.position.set(0, 2.4, 15.2);
          cameraRef.current.lookAt(0, 1.4, 0);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle Window Resize
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      cameraRef.current.aspect = nw / nh;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.dispose();
      }
    };
  }, [team, opponentTeam, striker]);

  // Handle Shot Trigger from UI Button / Corner Target
  const handleTriggerShot = (option: AnswerOption, cornerIdx: number) => {
    if (isShotActive) return;

    setIsShotActive(true);
    setActionBanner(`🚀 ${striker.name} يركض نحو الكرة ويسدد بكل قوة!`);

    // Target 3D coordinates based on the corner
    // Goal width: 7.32 (x from -3.4 to +3.4), Height: 2.44 (y from 0.2 to 2.2)
    let tx = 0;
    let ty = 1.2;

    switch (cornerIdx) {
      case 0: // Top-Left (المقص الأيسر)
        tx = -2.9;
        ty = 2.05;
        break;
      case 1: // Top-Right (المقص الأيمن)
        tx = 2.9;
        ty = 2.05;
        break;
      case 2: // Bottom-Left (الأرضية اليسرى)
        tx = -2.9;
        ty = 0.35;
        break;
      case 3: // Bottom-Right (الأرضية اليمنى)
        tx = 2.9;
        ty = 0.35;
        break;
      default:
        tx = 0;
        ty = 1.5;
    }

    const isGoal = !!option.correct;
    if (!isGoal) {
      // If incorrect, adjust target closer to keeper's reach or slightly outside
      tx = tx * 0.45; // Keeper blocks it easily
    }

    // Set shot physics in simulation state
    shotStateRef.current = {
      active: true,
      phase: 'runup',
      startTime: performance.now() / 1000,
      duration: 1.1,
      startPos: new THREE.Vector3(0, 0.22, 11),
      targetPos: new THREE.Vector3(tx, ty, 0),
      isGoal: isGoal,
      chosenOption: option,
      ballSpin: new THREE.Vector3(12, 10, 0),
      netHitTriggered: false,
      keeperDived: false
    };
  };

  return (
    <div className="relative w-full h-[78vh] min-h-[580px] rounded-3xl overflow-hidden border-2 border-white/20 shadow-[0_0_60px_rgba(0,0,0,0.9)] bg-slate-950 flex flex-col justify-between select-none">
      
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

      {/* TOP HUD: Action Broadcast Banner & Camera Switcher */}
      <div className="relative z-20 p-4 flex flex-col md:flex-row items-center justify-between gap-3 pointer-events-auto">
        
        {/* Live Match State Capsule */}
        <div className="bg-slate-950/85 backdrop-blur-xl border border-white/20 px-5 py-2 rounded-2xl flex items-center gap-3 shadow-xl">
          <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
          <span className="text-xs font-black text-amber-400 tracking-wider">بث ثلاثي الأبعاد مباشر 3D STADIUM ENGINE</span>
          <span className="text-white/40">•</span>
          <span className="text-xs font-black text-white">{striker.name} #{striker.number}</span>
        </div>

        {/* Camera Selector Buttons */}
        <div className="bg-slate-950/85 backdrop-blur-xl border border-white/20 p-1 rounded-2xl flex items-center gap-1 shadow-xl">
          <button
            onClick={() => setCameraMode('behind_striker')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              cameraMode === 'behind_striker' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Eye size={13} />
            <span>خلف اللاعب</span>
          </button>

          <button
            onClick={() => setCameraMode('broadcast')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              cameraMode === 'broadcast' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Camera size={13} />
            <span>بث تلفزيوني</span>
          </button>

          <button
            onClick={() => setCameraMode('inside_net')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              cameraMode === 'inside_net' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Zap size={13} />
            <span>داخل الشباك</span>
          </button>

          <button
            onClick={() => setCameraMode('cinematic_orbit')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              cameraMode === 'cinematic_orbit' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <RefreshCw size={13} />
            <span>دوران سينمائي</span>
          </button>
        </div>
      </div>

      {/* MID ACTION TICKER BANNER */}
      <div className="relative z-20 self-center max-w-xl w-[92%] text-center pointer-events-none">
        <div className="bg-slate-950/90 backdrop-blur-md border border-cyan-400/40 rounded-2xl px-6 py-2.5 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
          <p className="text-sm md:text-base font-black text-white">{actionBanner}</p>
        </div>
      </div>

      {/* BOTTOM QUESTION & 4 CORNER SHOOTING TARGETS */}
      <div className="relative z-20 p-4 md:p-6 flex flex-col gap-3 pointer-events-auto">
        
        {/* Question Prompt Bar */}
        <div className="self-center w-full max-w-3xl bg-slate-950/95 backdrop-blur-2xl border-2 border-amber-400/80 rounded-2xl p-4 text-center shadow-2xl">
          <div className="text-[11px] font-black text-amber-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-2">
            <span>{currentQuestion.category}</span>
            <span>•</span>
            <span>سدد نحو زاوية الإجابة الصحيحة لتسجيل الهدف!</span>
          </div>
          <h3 className="text-base md:text-lg font-black text-white leading-relaxed">
            {currentQuestion.prompt}
          </h3>
        </div>

        {/* 4 Interactive Goal Corner Target Buttons */}
        <div className="max-w-4xl mx-auto w-full grid grid-cols-2 gap-3">
          {currentQuestion.answers.map((opt, idx) => {
            const cornerPositions = [
              'الزاوية العليا اليسرى (90)',
              'الزاوية العليا اليمنى (90)',
              'الزاوية الأرضية اليسرى',
              'الزاوية الأرضية اليمنى'
            ];
            return (
              <button
                key={idx}
                disabled={isShotActive}
                onClick={() => handleTriggerShot(opt, idx)}
                className={`group relative p-3 md:p-4 rounded-2xl border-2 transition-all duration-200 text-right cursor-pointer flex flex-col justify-between shadow-xl ${
                  isShotActive 
                    ? 'opacity-40 cursor-not-allowed border-white/10 bg-slate-900/60'
                    : 'bg-gradient-to-r from-slate-950/95 via-blue-950/90 to-slate-950/95 border-cyan-400/70 hover:border-amber-400 hover:scale-[1.02] active:scale-95 hover:shadow-[0_0_35px_rgba(245,158,11,0.5)]'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono px-2 py-0.5 rounded-md bg-cyan-400/20 text-cyan-300 font-black border border-cyan-400/30">
                    {opt.cornerIcon} {cornerPositions[idx]}
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 group-hover:bg-amber-400 group-hover:scale-125 transition-all animate-ping" />
                </div>
                <div className="text-sm md:text-base font-black text-white group-hover:text-amber-200 transition-colors">
                  {opt.text}
                </div>
              </button>
            );
          })}
        </div>

      </div>

    </div>
  );
};
