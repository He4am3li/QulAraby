import React from 'react';
import * as THREE from 'three';
import { AVATAR_CONFIGS, CountryTutorAvatar } from './CountryTutorAvatar';

/**
 * A real WebGL character, not a flat image with CSS transforms.
 * The same rig serves the 22 destinations, using their existing national wardrobe data.
 * Keep this scene transparent so the characters stand inside the current dialect UI.
 */
type Gender = 'male' | 'female';
type Mood = { isSelected: boolean; isSpeaking: boolean; isListening: boolean; isLoading: boolean; audioLevel: number };

interface Props extends Mood {
  countryId: string;
  gender: Gender;
  imageSrc?: string;
  nameAr?: string;
  className?: string;
}

const sphere = (parent: THREE.Object3D, material: THREE.Material, x: number, y: number, z: number, sx: number, sy: number, sz: number) => {
  const object = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), material);
  object.position.set(x, y, z);
  object.scale.set(sx, sy, sz);
  object.castShadow = true;
  parent.add(object);
  return object;
};

const cylinder = (parent: THREE.Object3D, material: THREE.Material, top: number, bottom: number, height: number, x: number, y: number, z: number, segments = 40) => {
  const object = new THREE.Mesh(new THREE.CylinderGeometry(top, bottom, height, segments), material);
  object.position.set(x, y, z);
  object.castShadow = true;
  parent.add(object);
  return object;
};

const line = (parent: THREE.Object3D, points: THREE.Vector3[], color: string, thickness = 0.012) => {
  const curve = new THREE.CatmullRomCurve3(points);
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, thickness, 8, false), new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.25 }));
  parent.add(mesh);
  return mesh;
};

const patternedScarfTexture = (baseColor: string, ink: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 7;
  for (let n = -256; n < 512; n += 33) {
    ctx.beginPath(); ctx.moveTo(n, 0); ctx.lineTo(n + 256, 256); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(n, 256); ctx.lineTo(n + 256, 0); ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.1, 1.4);
  return texture;
};

const createCharacter = (countryId: string, gender: Gender) => {
  const outfit = AVATAR_CONFIGS[countryId]?.[gender] || AVATAR_CONFIGS.saudi[gender];
  const male = gender === 'male';
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const cloth = new THREE.MeshStandardMaterial({ color: outfit.primaryColor, roughness: 0.74, metalness: 0.035, side: THREE.DoubleSide });
  const trim = new THREE.MeshStandardMaterial({ color: outfit.accentColor, roughness: 0.28, metalness: 0.72 });
  const secondary = new THREE.MeshStandardMaterial({ color: outfit.secondaryColor, roughness: 0.7, side: THREE.DoubleSide });
  const skin = new THREE.MeshStandardMaterial({ color: outfit.skinTone, roughness: 0.76 });
  const hair = new THREE.MeshStandardMaterial({ color: outfit.hairColor, roughness: 0.89 });
  const white = new THREE.MeshStandardMaterial({ color: '#fffaf0', roughness: 0.25 });
  const iris = new THREE.MeshStandardMaterial({ color: '#332015', roughness: 0.28 });
  const black = new THREE.MeshStandardMaterial({ color: '#160f15', roughness: 0.66 });
  const rose = new THREE.MeshStandardMaterial({ color: '#8a414b', roughness: 0.7 });
  const cheek = new THREE.MeshStandardMaterial({ color: '#cf806d', transparent: true, opacity: 0.26, roughness: 0.9 });
  const shoes = new THREE.MeshStandardMaterial({ color: male ? '#493127' : outfit.accentColor, roughness: 0.45 });

  // Feet and continuous cloth surfaces keep the silhouettes readable at mobile sizes.
  for (const side of [-1, 1]) sphere(body, shoes, side * 0.27, 0.14, 0.15, 0.22, 0.12, 0.35);
  cylinder(body, cloth, male ? 0.43 : 0.39, male ? 0.65 : 0.76, 1.62, 0, 1.13, 0, 48);
  cylinder(body, cloth, 0.42, male ? 0.47 : 0.53, 0.68, 0, 2.14, 0, 40);
  cylinder(body, skin, 0.15, 0.16, 0.25, 0, 2.53, 0);
  // Hem, central tunic seam and embroidery.
  const hem = new THREE.Mesh(new THREE.TorusGeometry(male ? 0.65 : 0.76, 0.013, 6, 52), trim);
  hem.rotation.x = Math.PI / 2;
  hem.position.y = 0.34;
  body.add(hem);
  line(body, [new THREE.Vector3(0, 2.43, 0.435), new THREE.Vector3(0, 1.68, 0.45), new THREE.Vector3(0, 0.49, male ? 0.60 : 0.70)], outfit.accentColor, 0.014);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 6; i++) {
      const y = 2.22 - i * 0.16;
      const x = side * (0.055 + 0.025 * Math.sin(i * 0.9));
      sphere(body, trim, x, y, 0.464 + (i < 4 ? 0.0 : -0.005), 0.015, 0.024, 0.012);
    }
  }
  if (male && countryId === 'saudi') {
    // Saudi male follows the uploaded reference: white thobe and red ghutra.
    cloth.color.set('#f6f4f0');
  }

  const arms: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(side * 0.45, 2.35, 0);
    arm.rotation.z = side * 0.65;
    body.add(arm);
    cylinder(arm, cloth, 0.195, 0.155, 0.74, side * 0.025, -0.36, 0, 28);
    cylinder(arm, trim, 0.164, 0.164, 0.036, side * 0.025, -0.72, 0, 32);
    sphere(arm, skin, side * 0.03, -0.86, 0.07, 0.135, 0.16, 0.066);
    for (let finger = 0; finger < 4; finger++) {
      sphere(arm, skin, side * (0.003 + finger * 0.023), -1.0 - finger * 0.004, 0.08, 0.026, 0.095, 0.028);
    }
    arms.push(arm);
  }

  const head = new THREE.Group();
  head.position.set(0, 2.99, 0);
  body.add(head);
  const headScarfType = outfit.headwearType;
  const femaleHeadWrap = !male && headScarfType !== 'none';
  const maleHeadWrap = male && /ghutra|keffiyeh|turban/.test(headScarfType);
  const headCover = new THREE.MeshStandardMaterial({ color: headScarfType.includes('red') ? '#fff9f4' : headScarfType.includes('gold') ? '#5e4030' : headScarfType.includes('white') ? '#f6f5ec' : outfit.secondaryColor, roughness: 0.82, side: THREE.DoubleSide });

  // Hood and scarf drape are true 3D volumes and always sit behind the face.
  if (femaleHeadWrap || maleHeadWrap) {
    sphere(head, headCover, 0, -0.015, -0.16, 0.49, 0.56, 0.36);
    const backCloth = cylinder(head, headCover, 0.42, 0.66, 0.92, 0, -0.59, -0.20);
    backCloth.scale.z = 0.66;
  } else {
    sphere(head, hair, 0, 0.13, -0.05, 0.43, 0.47, 0.36);
  }
  sphere(head, skin, 0, -0.035, 0.14, 0.365, 0.435, 0.29);
  // Soft face cheeks, eyebrows, eye whites, and iris highlights.
  for (const side of [-1, 1]) {
    sphere(head, cheek, side * 0.23, -0.11, 0.379, 0.092, 0.052, 0.012);
    const eye = sphere(head, white, side * 0.161, 0.095, 0.392, 0.100, 0.121, 0.055);
    const pupil = sphere(head, iris, side * 0.153, 0.087, 0.441, 0.058, 0.078, 0.038);
    sphere(head, black, side * 0.153, 0.087, 0.472, 0.033, 0.052, 0.017);
    sphere(head, white, side * 0.136, 0.12, 0.484, 0.016, 0.020, 0.008);
    line(head, [
      new THREE.Vector3(side * 0.088, 0.241, 0.394),
      new THREE.Vector3(side * 0.159, 0.267, 0.395),
      new THREE.Vector3(side * 0.243, 0.236, 0.365)
    ], outfit.hairColor, 0.021);
  }
  sphere(head, skin, 0, -0.07, 0.44, 0.064, 0.10, 0.085);
  const mouth = sphere(head, rose, 0, -0.222, 0.415, 0.116, 0.022, 0.015);
  line(head, [
    new THREE.Vector3(-0.115, -0.218, 0.413),
    new THREE.Vector3(0, -0.246, 0.436),
    new THREE.Vector3(0.115, -0.218, 0.413)
  ], '#8f4f45', 0.014);
  if (male && outfit.beard) {
    sphere(head, hair, 0, -0.31, 0.05, 0.31, 0.16, 0.24);
    sphere(head, skin, 0, -0.22, 0.33, 0.25, 0.12, 0.14);
    for (const side of [-1, 1]) sphere(head, hair, side * 0.105, -0.204, 0.412, 0.096, 0.022, 0.022);
  }
  // A gold/colored band around the hijab frames the face without masking it.
  if (femaleHeadWrap) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.397, 0.027, 10, 52, Math.PI * 1.55), trim);
    ring.scale.y = 1.18;
    ring.rotation.z = Math.PI * 0.72;
    ring.position.set(-0.007, 0.005, 0.225);
    head.add(ring);
  }
  if (male && /ghutra|keffiyeh/.test(headScarfType)) {
    const capTexture = patternedScarfTexture('#fffbf4', headScarfType.includes('red') ? '#ac3440' : '#344046');
    const scarfMaterial = new THREE.MeshStandardMaterial({ map: capTexture, roughness: 0.86, side: THREE.DoubleSide });
    const crown = sphere(head, scarfMaterial, 0, 0.378, -0.07, 0.46, 0.20, 0.40);
    crown.rotation.z = -0.04;
    const scarf = cylinder(head, scarfMaterial, 0.41, 0.56, 0.83, 0, -0.42, -0.17);
    scarf.scale.z = 0.72;
    const agal = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.052, 12, 48), black);
    agal.rotation.x = Math.PI / 2;
    agal.position.y = 0.35;
    head.add(agal);
  } else if (male && /fez|chechia/.test(headScarfType)) {
    cylinder(head, new THREE.MeshStandardMaterial({ color: '#a51e30', roughness: 0.8 }), 0.29, 0.34, 0.42, 0, 0.45, -0.06);
  } else if (male && /turban/.test(headScarfType)) {
    for (let j = 0; j < 3; j++) {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.35 + j * 0.02, 0.084, 12, 42), secondary);
      band.rotation.x = Math.PI / 2;
      band.rotation.z = j * 0.18;
      band.position.y = 0.33 + j * 0.11;
      head.add(band);
    }
  } else if (male && /kofia|taqiyah/.test(headScarfType)) {
    cylinder(head, secondary, 0.34, 0.365, 0.19, 0, 0.4, -0.035);
  } else if (!male && headScarfType === 'pharaoh_crown') {
    cylinder(head, trim, 0.27, 0.33, 0.39, 0, 0.5, -0.07);
  }

  return { root, body, head, arms, mouth };
};

export const Live3DCharacter: React.FC<Props> = ({
  countryId, gender, isSelected, isSpeaking, isListening, isLoading, audioLevel, imageSrc, nameAr, className = ''
}) => {
  const mountRef = React.useRef<HTMLDivElement>(null);
  const stateRef = React.useRef<Mood>({ isSelected, isSpeaking, isListening, isLoading, audioLevel });
  const [failed, setFailed] = React.useState(false);
  stateRef.current = { isSelected, isSpeaking, isListening, isLoading, audioLevel };

  React.useEffect(() => {
    const host = mountRef.current;
    if (!host) return;
    setFailed(false);
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch (error) {
      console.warn('Character 3D unavailable on this device; using accessibility fallback.', error);
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.pointerEvents = 'none';
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    camera.position.set(0, 2.04, 7.35);
    camera.lookAt(0, 1.66, 0);
    scene.add(new THREE.HemisphereLight(0xfff8e8, 0x8a99ae, 2.0));
    const key = new THREE.DirectionalLight(0xffffff, 3.0);
    key.position.set(-3, 6, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffc89a, 1.4);
    rim.position.set(3, 4, -2);
    scene.add(rim);
    const fill = new THREE.PointLight(0xb7d4ff, 17, 18);
    fill.position.set(4, 2.3, 5);
    scene.add(fill);
    const character = createCharacter(countryId, gender);
    scene.add(character.root);
    character.root.rotation.y = gender === 'male' ? 0.08 : -0.08;
    const clock = new THREE.Clock();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let alive = true;
    const updateSize = () => {
      if (!alive) return;
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateSize);
    if (observer) observer.observe(host);
    window.addEventListener('resize', updateSize);
    updateSize();
    const animate = () => {
      if (!alive) return;
      frame = requestAnimationFrame(animate);
      if (document.hidden) return;
      const t = clock.getElapsedTime();
      const mood = stateRef.current;
      const movement = reduceMotion ? 0 : 1;
      character.body.position.y = movement * Math.sin(t * 1.55) * (mood.isSpeaking ? 0.023 : 0.012);
      character.body.rotation.y = movement * Math.sin(t * 0.65) * 0.035;
      character.head.rotation.y = movement * (mood.isListening ? Math.sin(t * 2) * 0.08 : Math.sin(t * 0.9) * 0.038);
      character.head.rotation.x = movement * (mood.isListening ? -0.07 + Math.sin(t * 3) * 0.048 : Math.sin(t * 1.4) * 0.025);
      // Welcoming gestures, attentive micro-nods, and speech-linked hand movement.
      character.arms[0].rotation.z = -0.66 + movement * Math.sin(t * 1.15) * 0.095;
      character.arms[1].rotation.z = 0.66 + movement * Math.sin(t * (mood.isSpeaking ? 3.5 : 1.25)) * (mood.isSpeaking ? 0.22 : 0.08);
      character.arms[1].rotation.x = movement * (mood.isSpeaking ? Math.sin(t * 2.8) * 0.10 : 0);
      character.mouth.scale.y = mood.isSpeaking ? 0.7 + (Math.max(0, mood.audioLevel) * 1.6) + movement * Math.abs(Math.sin(t * 14)) * 1.15 : 1;
      character.mouth.scale.x = mood.isSpeaking ? 0.88 : 1;
      const blinking = movement > 0 && (t % 4.3) > 4.17;
      // Blink by briefly flattening eye meshes; eye highlights follow naturally.
      character.head.children.forEach(item => {
        if (item instanceof THREE.Mesh && item.geometry instanceof THREE.SphereGeometry &&
          item.position.y > 0.07 && item.position.y < 0.16 && Math.abs(item.position.x) > 0.12 && Math.abs(item.position.x) < 0.21) {
          item.scale.y = blinking ? Math.min(item.scale.x * 0.12, 0.018) : item.userData.eyeHeight || item.scale.y;
          if (!item.userData.eyeHeight) item.userData.eyeHeight = item.scale.y;
        }
      });
      character.root.rotation.y = movement * Math.sin(t * 0.33) * 0.04 + (gender === 'male' ? 0.04 : -0.04);
      renderer.render(scene, camera);
    };
    animate();
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('resize', updateSize);
      scene.traverse(obj => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry?.dispose();
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach(material => {
            if (material instanceof THREE.MeshStandardMaterial) material.map?.dispose();
            material?.dispose();
          });
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [countryId, gender]);

  if (failed) {
    return <CountryTutorAvatar countryId={countryId} gender={gender} isSpeaking={isSpeaking} isListening={isListening} imageSrc={imageSrc} nameAr={nameAr} className={className} />;
  }
  return (
    <div
      ref={mountRef}
      className={'w-full h-full select-none ' + className}
      role="img"
      aria-label={(nameAr || (gender === 'male' ? 'المعلم' : 'المعلمة')) + '، شخصية ثلاثية الأبعاد تفاعلية'}
      style={{ background: 'transparent', pointerEvents: 'none' }}
    />
  );
};
