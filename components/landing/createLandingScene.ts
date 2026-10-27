import * as THREE from "three";

/** QUL's own procedural scene. No third-party models, textures or tracking. */
export function createLandingScene(host: HTMLElement, onFailure: () => void) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  const mobile = window.matchMedia('(max-width: 900px)').matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0.4, 9);
  scene.add(new THREE.HemisphereLight(0xfff8e4, 0x154b3b, 3));
  const key = new THREE.DirectionalLight(0xffe7bb, 5);
  key.position.set(-3, 5, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x6affcd, 3);
  rim.position.set(4, 1, -3);
  scene.add(rim);
  const gold = new THREE.MeshStandardMaterial({
    color: 0xc7aa73,
    metalness: 0.72,
    roughness: 0.29,
  });
  const green = new THREE.MeshStandardMaterial({
    color: 0x194b3b,
    metalness: 0.35,
    roughness: 0.3,
  });
  const ivory = new THREE.MeshStandardMaterial({
    color: 0xf3ebd6,
    roughness: 0.65,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x071b17,
    roughness: 0.32,
  });
  const glow = new THREE.MeshBasicMaterial({ color: 0x8df5d0 });
  const groups = Array.from({ length: 4 }, () => new THREE.Group());
  groups.forEach((g, i) => { g.position.z = -i * 8; scene.add(g); });
  const textures: THREE.Texture[] = [];
  const box = (
    g: THREE.Object3D,
    w: number,
    h: number,
    d: number,
    m: THREE.Material,
    x = 0,
    y = 0,
    z = 0,
  ) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z);
    g.add(mesh);
    return mesh;
  };
  const ring = (
    g: THREE.Object3D,
    r: number,
    tube: number,
    x = 0,
    y = 0,
    z = 0,
  ) => {
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 12, 80), gold);
    mesh.position.set(x, y, z);
    g.add(mesh);
    return mesh;
  };
  // The Arabic mark is drawn with a locally loaded font to retain shaping.
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    renderer.dispose();
    renderer.domElement.remove();
    throw new Error("Canvas unavailable");
  }
  ctx.fillStyle = "#f3e4bd";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.direction = "rtl";
  ctx.font = '540px "Al-Wissam", serif';
  ctx.fillText("قُل", 512, 470);
  ctx.font = "48px sans-serif";
  ctx.direction = "ltr";
  ctx.fillText("Q U L", 512, 800);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textures.push(texture);
  const mark = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 3.6),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    }),
  );
  mark.position.z = 0.15;
  groups[0].add(mark);
  const halo = ring(groups[0], 2.05, 0.025);
  halo.rotation.y = 0.5;
  halo.rotation.x = 0.25;
  const halo2 = ring(groups[0], 2.3, 0.012);
  halo2.rotation.x = 1.1;
  halo2.rotation.y = -0.3;
  // Small original Arabic glyphs orbit the mark without intercepting navigation.
  const letters = ["ع", "ب", "ي", "أ", "ن", "م"].map((letter, index) => {
    const tile = document.createElement("canvas");
    tile.width = tile.height = 128;
    const brush = tile.getContext("2d")!;
    brush.font = '80px "Al-Wissam", serif';
    brush.textAlign = "center";
    brush.textBaseline = "middle";
    brush.fillStyle = "#c7aa73";
    brush.fillText(letter, 64, 64);
    const map = new THREE.CanvasTexture(tile);
    map.colorSpace = THREE.SRGBColorSpace;
    textures.push(map);
    const glyph = new THREE.Mesh(
      new THREE.PlaneGeometry(0.36, 0.36),
      new THREE.MeshBasicMaterial({
        map,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      }),
    );
    groups[0].add(glyph);
    return { glyph, phase: (index * Math.PI) / 3 };
  });
  // Hinged book: actual depth, individual paper edges, animated opening.
  const left = new THREE.Group(),
    right = new THREE.Group();
  groups[1].add(left, right);
  [left, right].forEach((leaf, i) => {
    const side = i === 0 ? -1 : 1;
    box(leaf, 1.65, 2.25, 0.1, green, side * 0.83, 0, -0.06);
    box(leaf, 1.54, 2.12, 0.14, ivory, side * 0.8, 0, 0.06);
    for (let row = 0; row < 8; row++)
      box(
        leaf,
        1.03 - (row % 3) * 0.1,
        0.017,
        0.008,
        gold,
        side * 0.8,
        0.65 - row * 0.19,
        0.14,
      );
    for (let page = 0; page < 5; page++)
      box(
        leaf,
        1.54,
        0.008,
        0.005,
        gold,
        side * 0.8,
        -1.04 + page * 0.013,
        0.09,
      );
  });
  box(right, 0.18, 0.65, 0.013, gold, 1.22, 0.85, 0.16);
  // Cassette with mechanical reels.
  box(groups[2], 3.7, 2.35, 0.42, green);
  box(groups[2], 3.25, 1.45, 0.04, ivory, 0, 0.2, 0.23);
  box(groups[2], 2.8, 0.63, 0.04, dark, 0, 0.02, 0.27);
  box(groups[2], 3, 0.055, 0.02, gold, 0, 0.74, 0.27);
  box(groups[2], 2.4, 0.28, 0.06, dark, 0, -0.84, 0.24);
  const reels = [-1, 1].map((x) => {
    const reel = new THREE.Group();
    reel.position.set(x, 0.02, 0.31);
    groups[2].add(reel);
    ring(reel, 0.26, 0.055);
    for (let i = 0; i < 6; i++) {
      const spoke = box(
        reel,
        0.09,
        0.19,
        0.04,
        ivory,
        Math.sin((i * Math.PI) / 3) * 0.15,
        Math.cos((i * Math.PI) / 3) * 0.15,
      );
      spoke.rotation.z = (-i * Math.PI) / 3;
    }
    return reel;
  });
  [-1.68, 1.68].forEach((x) =>
    [-0.99, 0.99].forEach((y) => {
      const screw = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), gold);
      screw.position.set(x, y, 0.23);
      groups[2].add(screw);
    }),
  );
  // Rocket and ringed planet.
  const rocket = new THREE.Group();
  groups[3].add(rocket);
  rocket.position.set(-0.7, -0.4, 0.3);
  rocket.rotation.z = -0.4;
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.35, 1.5, 32),
    ivory,
  );
  rocket.add(body);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.65, 32), gold);
  nose.position.y = 1.07;
  rocket.add(nose);
  const windowMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.19, 24, 16),
    green,
  );
  windowMesh.position.set(0, 0.25, 0.25);
  rocket.add(windowMesh);
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.8, 24), glow);
  flame.rotation.z = Math.PI;
  flame.position.y = -1.12;
  rocket.add(flame);
  [-1, 1].forEach((side) => {
    const fin = box(rocket, 0.15, 0.65, 0.5, gold, side * 0.35, -0.5);
    fin.rotation.z = side * -0.4;
  });
  const planet = new THREE.Mesh(new THREE.SphereGeometry(0.78, 48, 32), gold);
  planet.position.set(1.1, 0.85, -0.3);
  groups[3].add(planet);
  const planetRing = ring(groups[3], 1.1, 0.04, 1.1, 0.85, -0.3);
  planetRing.rotation.x = 1.2;
  planetRing.rotation.y = 0.4;
  const orbit = ring(groups[0], 2.75, 0.008);
  orbit.rotation.x = 1.27;
  orbit.position.y = -1.8;

  // A spatial gallery: architectural portals, guide rails and floating glyphs
  // remain in the same world as the camera moves forward through each chapter.
  const corridor = new THREE.Group();
  scene.add(corridor);
  const bronzeLine = new THREE.MeshBasicMaterial({ color: 0xc7aa73, transparent: true, opacity: 0.30, depthWrite: false });
  const greenLine = new THREE.MeshBasicMaterial({ color: 0x79d3ae, transparent: true, opacity: 0.16, depthWrite: false });
  for (let i = 0; i < 10; i++) {
    const z = 2 - i * 3.5;
    for (const x of [-3.0, 3.0]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.018, 5.2, 0.018), bronzeLine);
      post.position.set(x, 0, z);
      corridor.add(post);
    }
    const top = new THREE.Mesh(new THREE.BoxGeometry(6.02, 0.018, 0.018), bronzeLine);
    top.position.set(0, 2.6, z);
    corridor.add(top);
    const base = new THREE.Mesh(new THREE.BoxGeometry(6.02, 0.018, 0.018), greenLine);
    base.position.set(0, -2.6, z);
    corridor.add(base);
  }
  for (const x of [-2.6, 2.6]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.016, 39), greenLine);
    rail.position.set(x, -2.3, -16);
    corridor.add(rail);
  }
  let cameraProgress = 0;
  let progress = 0,
    frame = 0,
    lastRender = 0,
    disposed = false,
    inView = true,
    start = performance.now(),
    width = 0,
    height = 0;
  const resize = () => {
    width = host.clientWidth;
    height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.fov = width <= 900 ? (height > width ? 60 : 46) : 34;
    camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  const render = (now: number) => {
    frame = 0;
    if (disposed || document.hidden || !inView) return;
    // Decorative motion does not need to render at the display's full refresh rate.
    if (now - lastRender < 1000 / 30) {
      frame = requestAnimationFrame(render);
      return;
    }
    lastRender = now;
    const time = (now - start) / 1000;
    // Scroll moves the viewpoint through one continuous space (never swaps scenes).
    cameraProgress += (progress - cameraProgress) * (mobile ? 0.14 : 0.1);
    groups.forEach((g, i) => {
      g.visible = Math.abs(i - cameraProgress) < 2.1;
      g.position.set(0, Math.sin(time * 0.55 + i) * 0.06, -i * 8);
      g.scale.setScalar(1);
      g.rotation.set(0.05, Math.sin(time * 0.2 + i) * 0.075, -0.04);
    });
    letters.forEach(({ glyph, phase }) => {
      const angle = phase + time * 0.06;
      glyph.position.set(Math.cos(angle) * 2.3, Math.sin(angle) * 1.9, -0.2);
    });
    left.rotation.y = -0.23 - Math.abs(Math.sin(time * 0.2)) * 0.12;
    right.rotation.y = 0.23;
    reels.forEach((reel) => (reel.rotation.z = time * 0.55));
    flame.scale.y = 1 + Math.sin(time * 7) * 0.08;
    orbit.rotation.z = time * 0.025;
    camera.position.set(
      Math.sin(cameraProgress * Math.PI) * (mobile ? 0.12 : 0.28),
      mobile ? 0.1 : 0.4,
      9 - cameraProgress * 8
    );
    camera.lookAt(camera.position.x * 0.15, 0, camera.position.z - 9);
    renderer.render(scene, camera);
    frame = requestAnimationFrame(render);
  };
  const resume = () => {
    cancelAnimationFrame(frame);
    if (!document.hidden && !disposed && inView)
      frame = requestAnimationFrame(render);
  };
  const visibility = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    resume();
  });
  visibility.observe(host);
  const lost = (event: Event) => {
    event.preventDefault();
    onFailure();
  };
  renderer.domElement.addEventListener("webglcontextlost", lost);
  document.addEventListener("visibilitychange", resume);
  resume();
  return {
    setProgress(value: number) {
      progress = Math.max(0, Math.min(3, value));
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      visibility.disconnect();
      document.removeEventListener("visibilitychange", resume);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      const geometries = new Set<THREE.BufferGeometry>(),
        materials = new Set<THREE.Material>();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          geometries.add(object.geometry);
          (Array.isArray(object.material)
            ? object.material
            : [object.material]
          ).forEach((m) => materials.add(m));
        }
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
