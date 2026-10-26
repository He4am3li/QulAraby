import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import championsBallTexture from '/src/assets/images/champions_ball_texture_1790676004465.jpg';
import proPitchGrassTurf from '/src/assets/images/pro_pitch_grass_turf_1790675991247.jpg';

export interface ShotEvent {
  id: number;
  isGoal: boolean;
  cornerIndex: number; // 0: Top-Left, 1: Top-Right, 2: Bottom-Left, 3: Bottom-Right
}

interface PenaltyShootout3DCanvasProps {
  shotTrigger: ShotEvent | null;
  onShotFinish: (isGoal: boolean) => void;
  audio: any;
}

export const PenaltyShootout3DCanvas: React.FC<PenaltyShootout3DCanvasProps> = ({
  shotTrigger,
  onShotFinish,
  audio,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [screenShake, setScreenShake] = useState<boolean>(false);

  // Three.js References
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

  const keeperGroupRef = useRef<THREE.Group | null>(null);
  const keeperLeftArmRef = useRef<THREE.Group | null>(null);
  const keeperRightArmRef = useRef<THREE.Group | null>(null);
  const crowdParticlesRef = useRef<THREE.Points | null>(null);

  // Shot simulation trajectory variables
  const shotStateRef = useRef<{
    active: boolean;
    phase: 'idle' | 'runup' | 'in_flight' | 'impact' | 'celebration' | 'despair';
    startTime: number;
    duration: number;
    startPos: THREE.Vector3;
    targetPos: THREE.Vector3;
    isGoal: boolean;
    netHitTriggered: boolean;
    keeperDived: boolean;
  }>({
    active: false,
    phase: 'idle',
    startTime: 0,
    duration: 1.1,
    startPos: new THREE.Vector3(0, 0.22, 11),
    targetPos: new THREE.Vector3(0, 1.2, 0),
    isGoal: true,
    netHitTriggered: false,
    keeperDived: false
  });

  // Setup Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 550;

    // 1. Scene & Atmosphere
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020817, 0.015);

    // 2. Camera: Over-the-shoulder third person (behind striker facing the goal)
    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 120);
    camera.position.set(0, 2.5, 15.6);
    camera.lookAt(0, 1.3, 0);
    cameraRef.current = camera;

    // 3. Renderer with antialiasing and shadow maps
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Lighting: Floodlit Night Stadium
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const mainFloodlight = new THREE.DirectionalLight(0xe2e8f0, 2.0);
    mainFloodlight.position.set(15, 25, 20);
    mainFloodlight.castShadow = true;
    mainFloodlight.shadow.mapSize.width = 2048;
    mainFloodlight.shadow.mapSize.height = 2048;
    mainFloodlight.shadow.camera.near = 0.5;
    mainFloodlight.shadow.camera.far = 60;
    mainFloodlight.shadow.camera.left = -20;
    mainFloodlight.shadow.camera.right = 20;
    mainFloodlight.shadow.camera.top = 20;
    mainFloodlight.shadow.camera.bottom = -20;
    scene.add(mainFloodlight);

    // Back rim light from stands
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    rimLight.position.set(-15, 18, -10);
    scene.add(rimLight);

    // 5. Lush Pitch Grass Floor
    const textureLoader = new THREE.TextureLoader();
    const turfTexture = textureLoader.load(proPitchGrassTurf);
    turfTexture.wrapS = THREE.RepeatWrapping;
    turfTexture.wrapT = THREE.RepeatWrapping;
    turfTexture.repeat.set(16, 24);

    const pitchGeo = new THREE.PlaneGeometry(80, 80);
    const pitchMat = new THREE.MeshStandardMaterial({
      map: turfTexture,
      roughness: 0.82,
      metalness: 0.05,
      color: 0x15803d
    });
    const pitchMesh = new THREE.Mesh(pitchGeo, pitchMat);
    pitchMesh.rotation.x = -Math.PI / 2;
    pitchMesh.receiveShadow = true;
    scene.add(pitchMesh);

    // Pitch White Lines
    const penaltyBoxGeo = new THREE.BufferGeometry();
    const lineVertices = new Float32Array([
      // Goal line
      -10, 0.02, 0,  10, 0.02, 0,
      // 18-yard box
      -8.5, 0.02, 0, -8.5, 0.02, 16.5,
      -8.5, 0.02, 16.5, 8.5, 0.02, 16.5,
      8.5, 0.02, 16.5, 8.5, 0.02, 0,
      // 6-yard box
      -4.5, 0.02, 0, -4.5, 0.02, 5.5,
      -4.5, 0.02, 5.5, 4.5, 0.02, 5.5,
      4.5, 0.02, 5.5, 4.5, 0.02, 0,
    ]);
    penaltyBoxGeo.setAttribute('position', new THREE.BufferAttribute(lineVertices, 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3 });
    const lineSegments = new THREE.LineSegments(penaltyBoxGeo, lineMat);
    scene.add(lineSegments);

    // Penalty Spot (نقطة الجزاء على مسافة 11 متراً)
    const spotGeo = new THREE.CircleGeometry(0.18, 24);
    const spotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const spotMesh = new THREE.Mesh(spotGeo, spotMat);
    spotMesh.rotation.x = -Math.PI / 2;
    spotMesh.position.set(0, 0.03, 11);
    scene.add(spotMesh);

    // 6. Realistic Goal Posts (الأعمدة والعارضة)
    const goalWidth = 7.32;
    const goalHeight = 2.44;
    const goalDepth = 2.2;
    const postRadius = 0.07;

    const postMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.1 });

    // Left post
    const leftPostGeo = new THREE.CylinderGeometry(postRadius, postRadius, goalHeight, 16);
    const leftPost = new THREE.Mesh(leftPostGeo, postMat);
    leftPost.position.set(-goalWidth / 2, goalHeight / 2, 0);
    leftPost.castShadow = true;
    scene.add(leftPost);

    // Right post
    const rightPost = leftPost.clone();
    rightPost.position.set(goalWidth / 2, goalHeight / 2, 0);
    scene.add(rightPost);

    // Crossbar (العارضة)
    const crossbarGeo = new THREE.CylinderGeometry(postRadius, postRadius, goalWidth + postRadius * 2, 16);
    const crossbar = new THREE.Mesh(crossbarGeo, postMat);
    crossbar.rotation.z = Math.PI / 2;
    crossbar.position.set(0, goalHeight, 0);
    crossbar.castShadow = true;
    scene.add(crossbar);

    // Goal Net Frame
    const backLeftPost = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, goalHeight, 12), postMat);
    backLeftPost.position.set(-goalWidth / 2, goalHeight / 2, -goalDepth);
    scene.add(backLeftPost);

    const backRightPost = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, goalHeight, 12), postMat);
    backRightPost.position.set(goalWidth / 2, goalHeight / 2, -goalDepth);
    scene.add(backRightPost);

    // 3D Realistic Net (شبكة المرمى القابلة للتشوه والتأثر بالكرة)
    const netGeo = new THREE.PlaneGeometry(goalWidth, goalHeight, 28, 16);
    const netMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      wireframe: true,
      roughness: 0.9,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });
    const netMesh = new THREE.Mesh(netGeo, netMat);
    netMesh.position.set(0, goalHeight / 2, -goalDepth);
    scene.add(netMesh);
    netMeshRef.current = netMesh;

    // Save original net vertex positions for elastic rebound
    const netPosAttr = netGeo.attributes.position;
    netOriginalPositionsRef.current = new Float32Array(netPosAttr.array);

    // 7. Official Champions Ball (الكرة الرسمية)
    const ballTexture = textureLoader.load(championsBallTexture);
    const ballGeo = new THREE.SphereGeometry(0.22, 32, 32);
    const ballMat = new THREE.MeshStandardMaterial({
      map: ballTexture,
      roughness: 0.35,
      metalness: 0.1
    });
    const ballMesh = new THREE.Mesh(ballGeo, ballMat);
    ballMesh.position.set(0, 0.22, 11); // On penalty spot
    ballMesh.castShadow = true;
    scene.add(ballMesh);
    ballMeshRef.current = ballMesh;

    // Ball soft contact shadow
    const ballShadowGeo = new THREE.CircleGeometry(0.25, 24);
    const ballShadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45 });
    const ballShadow = new THREE.Mesh(ballShadowGeo, ballShadowMat);
    ballShadow.rotation.x = -Math.PI / 2;
    ballShadow.position.set(0, 0.02, 11);
    scene.add(ballShadow);

    // 8. Goalkeeper Entity (حارس المرمى الرياضي)
    const keeperGroup = new THREE.Group();
    keeperGroup.position.set(0, 0.9, 0.2); // On goal line

    const keeperJerseyMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.6 }); // Vibrant goalkeeper jersey
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
    const gloveMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4 }); // Bright keeper gloves

    // Keeper Torso
    const keeperTorso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.35), keeperJerseyMat);
    keeperTorso.castShadow = true;
    keeperGroup.add(keeperTorso);

    // Keeper Head
    const keeperHead = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 20), skinMat);
    keeperHead.position.set(0, 0.62, 0);
    keeperGroup.add(keeperHead);

    // Keeper Left Arm & Glove
    const kLeftArmGroup = new THREE.Group();
    kLeftArmGroup.position.set(-0.48, 0.3, 0);
    const kLeftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.6, 12), keeperJerseyMat);
    kLeftArm.position.y = -0.28;
    const kLeftGlove = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.14), gloveMat);
    kLeftGlove.position.y = -0.62;
    kLeftArmGroup.add(kLeftArm, kLeftGlove);
    keeperGroup.add(kLeftArmGroup);
    keeperLeftArmRef.current = kLeftArmGroup;

    // Keeper Right Arm & Glove
    const kRightArmGroup = new THREE.Group();
    kRightArmGroup.position.set(0.48, 0.3, 0);
    const kRightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.6, 12), keeperJerseyMat);
    kRightArm.position.y = -0.28;
    const kRightGlove = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.14), gloveMat);
    kRightGlove.position.y = -0.62;
    kRightArmGroup.add(kRightArm, kRightGlove);
    keeperGroup.add(kRightArmGroup);
    keeperRightArmRef.current = kRightArmGroup;

    // Keeper Legs
    const kLeftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.75, 12), blackMat);
    kLeftLeg.position.set(-0.22, -0.65, 0);
    const kRightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.75, 12), blackMat);
    kRightLeg.position.set(0.22, -0.65, 0);
    keeperGroup.add(kLeftLeg, kRightLeg);

    scene.add(keeperGroup);
    keeperGroupRef.current = keeperGroup;

    // 9. Striker Entity (اللاعب المسدد - ظهره للمشاهد)
    const strikerGroup = new THREE.Group();
    strikerGroup.position.set(0, 0.9, 12.6); // 1.6m behind the ball

    const strikerJerseyMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.5 }); // Blue Team Jersey
    const whiteShortsMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });

    // Striker Torso (Back has player number 9 in golden font effect)
    const strikerTorso = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.82, 0.36), strikerJerseyMat);
    strikerTorso.castShadow = true;
    strikerGroup.add(strikerTorso);

    // Striker Head
    const strikerHead = new THREE.Mesh(new THREE.SphereGeometry(0.23, 20, 20), skinMat);
    strikerHead.position.set(0, 0.64, 0);
    strikerGroup.add(strikerHead);

    // Striker Right Kicking Leg
    const sRightLegGroup = new THREE.Group();
    sRightLegGroup.position.set(0.22, -0.4, 0);
    const sRightThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.45, 12), whiteShortsMat);
    sRightThigh.position.y = -0.22;
    const sRightShin = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.45, 12), skinMat);
    sRightShin.position.y = -0.58;
    const sRightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.28), blackMat);
    sRightBoot.position.set(0, -0.82, -0.08);
    sRightLegGroup.add(sRightThigh, sRightShin, sRightBoot);
    strikerGroup.add(sRightLegGroup);
    strikerRightLegRef.current = sRightLegGroup;

    // Striker Left Plant Leg
    const sLeftLegGroup = new THREE.Group();
    sLeftLegGroup.position.set(-0.22, -0.4, 0);
    const sLeftThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.45, 12), whiteShortsMat);
    sLeftThigh.position.y = -0.22;
    const sLeftShin = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.45, 12), skinMat);
    sLeftShin.position.y = -0.58;
    const sLeftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.28), blackMat);
    sLeftBoot.position.set(0, -0.82, -0.08);
    sLeftLegGroup.add(sLeftThigh, sLeftShin, sLeftBoot);
    strikerGroup.add(sLeftLegGroup);
    strikerLeftLegRef.current = sLeftLegGroup;

    // Striker Arms
    const sRightArmGroup = new THREE.Group();
    sRightArmGroup.position.set(0.46, 0.32, 0);
    const sRightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.55, 12), strikerJerseyMat);
    sRightArm.position.y = -0.25;
    sRightArmGroup.add(sRightArm);
    strikerGroup.add(sRightArmGroup);
    strikerRightArmRef.current = sRightArmGroup;

    const sLeftArmGroup = new THREE.Group();
    sLeftArmGroup.position.set(-0.46, 0.32, 0);
    const sLeftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.55, 12), strikerJerseyMat);
    sLeftArm.position.y = -0.25;
    sLeftArmGroup.add(sLeftArm);
    strikerGroup.add(sLeftArmGroup);
    strikerLeftArmRef.current = sLeftArmGroup;

    scene.add(strikerGroup);
    strikerGroupRef.current = strikerGroup;

    // 10. Background Stadium Grandstand Lights (كشافات الاستاد وجماهير المدرجات)
    const crowdCount = 1200;
    const crowdGeo = new THREE.BufferGeometry();
    const crowdPos = new Float32Array(crowdCount * 3);
    const crowdColors = new Float32Array(crowdCount * 3);

    for (let i = 0; i < crowdCount; i++) {
      const idx = i * 3;
      crowdPos[idx] = (Math.random() - 0.5) * 55;
      crowdPos[idx + 1] = 4 + Math.random() * 16;
      crowdPos[idx + 2] = -12 - Math.random() * 25;

      // Sparkling fan flashes
      const isFlash = Math.random() > 0.85;
      crowdColors[idx] = isFlash ? 1.0 : 0.2 + Math.random() * 0.3;
      crowdColors[idx + 1] = isFlash ? 1.0 : 0.3 + Math.random() * 0.4;
      crowdColors[idx + 2] = isFlash ? 1.0 : 0.5 + Math.random() * 0.5;
    }
    crowdGeo.setAttribute('position', new THREE.BufferAttribute(crowdPos, 3));
    crowdGeo.setAttribute('color', new THREE.BufferAttribute(crowdColors, 3));
    const crowdParticleMat = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    const crowdParticles = new THREE.Points(crowdGeo, crowdParticleMat);
    scene.add(crowdParticles);
    crowdParticlesRef.current = crowdParticles;

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Keeper Idle Waving / Anticipation (Before Shot)
      if (keeperGroupRef.current && !shotStateRef.current.keeperDived) {
        keeperGroupRef.current.position.x = Math.sin(elapsed * 3.2) * 0.55;
        if (keeperLeftArmRef.current && keeperRightArmRef.current) {
          keeperLeftArmRef.current.rotation.z = Math.sin(elapsed * 4.5) * 0.35 - 0.35;
          keeperRightArmRef.current.rotation.z = -Math.sin(elapsed * 4.5) * 0.35 + 0.35;
        }
      }

      // Striker Idle Stance (Before Run-up)
      if (strikerGroupRef.current && shotStateRef.current.phase === 'idle') {
        strikerGroupRef.current.position.y = 0.9 + Math.sin(elapsed * 2.2) * 0.02;
      }

      // Shot Execution Simulation State Machine
      const shot = shotStateRef.current;
      if (shot.active) {
        const timeSinceShot = elapsed - shot.startTime;

        // Phase 1: Striker Run-up (0.0s to 0.42s)
        if (timeSinceShot < 0.42) {
          shot.phase = 'runup';
          const runProgress = timeSinceShot / 0.42;
          if (strikerGroupRef.current) {
            strikerGroupRef.current.position.z = 12.6 - runProgress * 1.35;
            if (strikerRightLegRef.current && strikerLeftLegRef.current) {
              strikerRightLegRef.current.rotation.x = -Math.sin(runProgress * Math.PI * 4) * 0.9;
              strikerLeftLegRef.current.rotation.x = Math.sin(runProgress * Math.PI * 4) * 0.9;
            }
          }
        }
        // Phase 2: Kick Impact (at 0.42s)
        else if (timeSinceShot >= 0.42 && timeSinceShot < 0.5) {
          if (strikerRightLegRef.current) {
            strikerRightLegRef.current.rotation.x = 1.3;
          }
          if (ballMeshRef.current && !shot.netHitTriggered) {
            audio?.playPowerfulKick();
          }
        }
        // Phase 3: Ball Flight in 3D (0.42s to 1.12s)
        else if (timeSinceShot >= 0.42 && timeSinceShot < 1.12) {
          shot.phase = 'in_flight';
          const flightProgress = (timeSinceShot - 0.42) / 0.7;

          if (ballMeshRef.current) {
            const currentPos = new THREE.Vector3().lerpVectors(shot.startPos, shot.targetPos, flightProgress);
            const heightArc = Math.sin(flightProgress * Math.PI) * 0.55;
            currentPos.y += heightArc;
            ballMeshRef.current.position.copy(currentPos);
            ballMeshRef.current.rotation.x += 18 * delta;
            ballMeshRef.current.rotation.y += 14 * delta;
          }

          // Goalkeeper Dive Reaction!
          if (keeperGroupRef.current && !shot.keeperDived) {
            shot.keeperDived = true;
          }
          if (keeperGroupRef.current) {
            const diveProgress = Math.min(1, (timeSinceShot - 0.42) / 0.6);
            const targetX = shot.isGoal ? shot.targetPos.x * 0.52 : shot.targetPos.x * 0.96;
            const targetY = Math.max(0.4, shot.targetPos.y * 0.85);

            keeperGroupRef.current.position.x = THREE.MathUtils.lerp(0, targetX, diveProgress);
            keeperGroupRef.current.position.y = THREE.MathUtils.lerp(0.9, targetY, diveProgress);
            keeperGroupRef.current.rotation.z = THREE.MathUtils.lerp(0, targetX > 0 ? -1.15 : 1.15, diveProgress);

            if (keeperLeftArmRef.current && keeperRightArmRef.current) {
              keeperLeftArmRef.current.rotation.z = -1.2;
              keeperRightArmRef.current.rotation.z = 1.2;
            }
          }

          // Dynamic Camera Dolly-Zoom
          if (cameraRef.current) {
            cameraRef.current.position.z = THREE.MathUtils.lerp(15.6, 9.8, flightProgress * 0.5);
            cameraRef.current.position.y = THREE.MathUtils.lerp(2.5, 1.9, flightProgress * 0.5);
          }
        }
        // Phase 4: Net Impact or Goalkeeper Save (at 1.12s)
        else if (timeSinceShot >= 1.12 && timeSinceShot < 1.35) {
          if (!shot.netHitTriggered) {
            shot.netHitTriggered = true;

            if (shot.isGoal) {
              audio?.playGoalCheer();
              setScreenShake(true);
              setTimeout(() => setScreenShake(false), 850);

              // Elastic deformation of 3D net
              if (netMeshRef.current && netOriginalPositionsRef.current) {
                const posAttr = netMeshRef.current.geometry.attributes.position;
                const arr = posAttr.array as Float32Array;
                for (let v = 0; v < arr.length; v += 3) {
                  const vx = arr[v];
                  const vy = arr[v + 1];
                  const dist = Math.hypot(vx - shot.targetPos.x, vy - shot.targetPos.y);
                  if (dist < 1.7) {
                    arr[v + 2] = netOriginalPositionsRef.current[v + 2] - (1.7 - dist) * 0.7;
                  }
                }
                posAttr.needsUpdate = true;
              }
            } else {
              audio?.playWoodworkHit();
              audio?.playDespairGasp();

              if (ballMeshRef.current) {
                ballMeshRef.current.position.y += 0.7;
                ballMeshRef.current.position.x += 1.2;
                ballMeshRef.current.position.z += 1.0;
              }
            }
          }
        }
        // Phase 5: Player Reaction (1.35s to 2.4s)
        else if (timeSinceShot >= 1.35 && timeSinceShot < 2.4) {
          if (shot.isGoal) {
            shot.phase = 'celebration';
            if (strikerGroupRef.current) {
              strikerGroupRef.current.position.y = 0.9 + Math.abs(Math.sin(elapsed * 6)) * 0.35; // Jumping in joy
              if (strikerRightArmRef.current && strikerLeftArmRef.current) {
                strikerRightArmRef.current.rotation.z = 2.4;
                strikerLeftArmRef.current.rotation.z = -2.4;
              }
            }
            if (keeperGroupRef.current) {
              keeperGroupRef.current.position.y = 0.25;
              keeperGroupRef.current.rotation.z = 1.4;
            }
          } else {
            shot.phase = 'despair';
            if (strikerGroupRef.current) {
              if (strikerRightArmRef.current && strikerLeftArmRef.current) {
                strikerRightArmRef.current.rotation.x = 2.0;
                strikerLeftArmRef.current.rotation.x = 2.0;
              }
            }
            if (keeperGroupRef.current) {
              keeperGroupRef.current.position.y = 0.85;
              keeperGroupRef.current.rotation.z = 0;
            }
          }
        }
        // Phase 6: Callback Finish
        else if (timeSinceShot >= 2.4) {
          shot.active = false;
          onShotFinish(shot.isGoal);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

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
      if (rendererRef.current?.domElement) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Listen to shotTrigger to execute shot
  useEffect(() => {
    if (!shotTrigger) {
      // Reset striker & ball & keeper to starting position
      if (ballMeshRef.current) {
        ballMeshRef.current.position.set(0, 0.22, 11);
        ballMeshRef.current.rotation.set(0, 0, 0);
      }
      if (strikerGroupRef.current) {
        strikerGroupRef.current.position.set(0, 0.9, 12.6);
        if (strikerRightLegRef.current) strikerRightLegRef.current.rotation.set(0, 0, 0);
        if (strikerLeftLegRef.current) strikerLeftLegRef.current.rotation.set(0, 0, 0);
        if (strikerRightArmRef.current) strikerRightArmRef.current.rotation.set(0, 0, 0);
        if (strikerLeftArmRef.current) strikerLeftArmRef.current.rotation.set(0, 0, 0);
      }
      if (keeperGroupRef.current) {
        keeperGroupRef.current.position.set(0, 0.9, 0.2);
        keeperGroupRef.current.rotation.set(0, 0, 0);
      }
      if (cameraRef.current) {
        cameraRef.current.position.set(0, 2.5, 15.6);
        cameraRef.current.lookAt(0, 1.3, 0);
      }
      shotStateRef.current.active = false;
      shotStateRef.current.phase = 'idle';
      return;
    }

    // Determine target based on cornerIndex
    let tx = 0;
    let ty = 1.3;
    switch (shotTrigger.cornerIndex) {
      case 0: // Top-Left (المقص الأيسر)
        tx = -2.9;
        ty = 2.05;
        break;
      case 1: // Top-Right (المقص الأيمن)
        tx = 2.9;
        ty = 2.05;
        break;
      case 2: // Bottom-Left (الأرضية اليسرى)
        tx = -2.8;
        ty = 0.35;
        break;
      case 3: // Bottom-Right (الأرضية اليمنى)
        tx = 2.8;
        ty = 0.35;
        break;
      default:
        tx = -2.7;
        ty = 1.8;
    }

    if (!shotTrigger.isGoal) {
      // If miss, target is closer to keeper's reach so he blocks it easily
      tx = tx * 0.42;
    }

    shotStateRef.current = {
      active: true,
      phase: 'runup',
      startTime: performance.now() / 1000,
      duration: 1.1,
      startPos: new THREE.Vector3(0, 0.22, 11),
      targetPos: new THREE.Vector3(tx, ty, 0),
      isGoal: shotTrigger.isGoal,
      netHitTriggered: false,
      keeperDived: false
    };
  }, [shotTrigger]);

  return (
    <div className={`relative w-full h-full min-h-[500px] overflow-hidden select-none transition-transform duration-150 ${screenShake ? 'scale-[1.015] translate-y-[-4px]' : ''}`}>
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
