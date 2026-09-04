// Three.js is loaded globally via the local script in index.html.

const usePixelArt = new URLSearchParams(window.location.search).get("art") === "pixel";

const CONCEPT_ART = {
  car: "./assets/car.png",
  robot: "./assets/robot.png",
  walk: "./assets/robot_walk.png",
  wheel: "./assets/wheel.png",
  frames: 8,
  pixel: false,
  carSize: [5, 5],
  robotSize: [5, 5],
  wheelSize: [0.75, 0.75],
  wheels: [
    [-1.207, -0.302],
    [1.313, -0.317],
  ],
  robotRadius: 2.3,
  carRadius: 0.7,
};

const PIXEL_ART = {
  car: "./assets/characters/lambo_car.png",
  robot: "./assets/characters/lambo_robot.png",
  walk: "./assets/characters/lambo_robot_run_sheet.png",
  wheel: "./assets/props/lambo_wheel.png",
  frames: 8,
  pixel: true,
  carSize: [6.2, 3.1],
  robotSize: [3.2, 4.2],
  wheelSize: [0.95, 0.95],
  wheels: [
    [-1.35, -0.78],
    [1.4, -0.78],
  ],
  robotRadius: 1.9,
  carRadius: 0.85,
};

const ART = usePixelArt ? PIXEL_ART : CONCEPT_ART;

const modePill = document.getElementById("mode-pill");
const hintLabel = document.getElementById("hint-label");
const cooldownFill = document.getElementById("cooldown-fill");
const conceptLink = document.getElementById("art-concept");
const pixelLink = document.getElementById("art-pixel");
if (usePixelArt) pixelLink.classList.add("active");
else conceptLink.classList.add("active");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
scene.fog = new THREE.FogExp2(0x111111, 0.028);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 120);
camera.position.set(0, 4, 20);

const renderer = new THREE.WebGLRenderer({ antialias: !ART.pixel });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("app").appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.22));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.45);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);
const rim = new THREE.PointLight(0xff5500, 0.55, 40);
rim.position.set(0, 6, 8);
scene.add(rim);

const textureLoader = new THREE.TextureLoader();

function loadTexture(url) {
  const texture = textureLoader.load(url);
  if (ART.pixel) {
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
  }
  return texture;
}

const carTexture = loadTexture(ART.car);
const robotTextureWalk = loadTexture(ART.walk);
robotTextureWalk.wrapS = THREE.RepeatWrapping;
robotTextureWalk.repeat.set(1 / ART.frames, 1);
const robotTextureIdle = loadTexture(ART.robot);
const wheelTexture = loadTexture(ART.wheel);

const matProps = { transparent: true, side: THREE.DoubleSide, alphaTest: 0.05, color: 0xffffff };
const carMat = new THREE.MeshBasicMaterial({ map: carTexture, ...matProps });
const robotMatRun = new THREE.MeshBasicMaterial({ map: robotTextureWalk, ...matProps });
const robotMatIdle = new THREE.MeshBasicMaterial({ map: robotTextureIdle, ...matProps });
const wheelMat = new THREE.MeshBasicMaterial({ map: wheelTexture, ...matProps });

const player = new THREE.Group();
player.position.set(-14, 3, 0);

const bodyMesh = new THREE.Mesh(new THREE.PlaneGeometry(ART.carSize[0], ART.carSize[1]), carMat);
player.add(bodyMesh);

const wheelGeo = new THREE.PlaneGeometry(ART.wheelSize[0], ART.wheelSize[1]);
const backWheel = new THREE.Mesh(wheelGeo, wheelMat);
backWheel.position.set(ART.wheels[0][0], ART.wheels[0][1], 0.02);
player.add(backWheel);
const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
frontWheel.position.set(ART.wheels[1][0], ART.wheels[1][1], 0.02);
player.add(frontWheel);
scene.add(player);

const platforms = [];
const platformMat = new THREE.MeshLambertMaterial({ color: 0x050505 });
const neonMat = new THREE.MeshBasicMaterial({ color: 0xff5500 });

function addPlatform(x, y, width, height) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, 5), platformMat);
  mesh.position.set(x, y, 0);
  scene.add(mesh);
  platforms.push(mesh);
  const neon = new THREE.Mesh(new THREE.BoxGeometry(width, 0.06, 5.05), neonMat);
  neon.position.set(x, y + height / 2 + 0.02, 0);
  scene.add(neon);
  return mesh;
}

addPlatform(-16, -1, 28, 2);
addPlatform(18, -1, 18, 2);
addPlatform(38, 2.2, 10, 1.4);
addPlatform(8, 4.2, 5, 1.2);

for (let i = 0; i < 18; i++) {
  const bgGeo = new THREE.BoxGeometry(Math.random() * 10 + 2, Math.random() * 20 + 10, 2);
  const bgMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const bgMesh = new THREE.Mesh(bgGeo, bgMat);
  bgMesh.position.set((Math.random() - 0.5) * 110, 5, -10 - Math.random() * 20);
  scene.add(bgMesh);
}

const spawn = { x: -14, y: 3 };
let isGrounded = false;
let isRobot = false;
let currentRobotFrame = 0;
let lastFrameTime = 0;
let isTransforming = false;
let targetIsRobot = false;
let transformStartTime = 0;
let lastTransformTime = 0;
const transformDuration = 400;
const transformCooldown = 2000;
let velocity = { x: 0, y: 0 };
const gravity = -0.015;
const jumpStrength = 0.38;
const moveSpeed = 0.15;

const keys = { left: false, right: false, jump: false };

function isMoveLeft(key) {
  return key === "a" || key === "arrowleft";
}
function isMoveRight(key) {
  return key === "d" || key === "arrowright";
}
function isJumpKey(key, code) {
  return key === " " || key === "spacebar" || key === "w" || code === "Space";
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (isMoveLeft(key) || isMoveRight(key) || isJumpKey(key, event.code) || key === "t") {
    event.preventDefault();
  }
  if (isMoveLeft(key)) keys.left = true;
  if (isMoveRight(key)) keys.right = true;
  if (isJumpKey(key, event.code)) keys.jump = true;
  if (key === "t") transform();
});

window.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();
  if (isMoveLeft(key)) keys.left = false;
  if (isMoveRight(key)) keys.right = false;
  if (isJumpKey(key, event.code)) keys.jump = false;
});

function applyBodySize() {
  const size = isRobot ? ART.robotSize : ART.carSize;
  bodyMesh.geometry.dispose();
  bodyMesh.geometry = new THREE.PlaneGeometry(size[0], size[1]);
}

function transform() {
  const now = Date.now();
  if (isTransforming || now - lastTransformTime < transformCooldown) return;
  isTransforming = true;
  transformStartTime = now;
  lastTransformTime = now;
  targetIsRobot = !isRobot;
  if (isGrounded) {
    velocity.y = 0.22;
    isGrounded = false;
  }
}

function currentRadius() {
  return isRobot ? ART.robotRadius : ART.carRadius;
}

function checkCollisions() {
  isGrounded = false;
  const px = player.position.x;
  const py = player.position.y;
  const radius = currentRadius();
  for (const platform of platforms) {
    const top = platform.position.y + platform.geometry.parameters.height / 2;
    const left = platform.position.x - platform.geometry.parameters.width / 2;
    const right = platform.position.x + platform.geometry.parameters.width / 2;
    if (velocity.y <= 0 && py - radius <= top && py - radius > top - 1.0) {
      if (px > left && px < right) {
        isGrounded = true;
        player.position.y = top + radius;
        velocity.y = 0;
      }
    }
  }
}

function updateHud(now) {
  modePill.textContent = isRobot ? "ROBOT" : "HOVERCAR";
  modePill.classList.toggle("robot", isRobot);
  if (isTransforming) {
    hintLabel.textContent = "Transforming...";
  } else if (isRobot) {
    hintLabel.textContent = "Jump enabled. Slower.";
  } else {
    hintLabel.textContent = "Faster. Cannot jump. Gap needs robot form.";
  }
  const remaining = Math.max(0, transformCooldown - (now - lastTransformTime));
  cooldownFill.style.width = `${((transformCooldown - remaining) / transformCooldown) * 100}%`;
}

function animate() {
  requestAnimationFrame(animate);
  const now = Date.now();
  const currentSpeed = isRobot ? moveSpeed : moveSpeed * 2;

  if (keys.left) {
    velocity.x = -currentSpeed;
    player.scale.x = isRobot ? -1 : 1;
    if (!isTransforming) player.rotation.y = 0;
  } else if (keys.right) {
    velocity.x = currentSpeed;
    player.scale.x = isRobot ? 1 : -1;
    if (!isTransforming) player.rotation.y = 0;
  } else {
    velocity.x *= 0.8;
  }

  if (isTransforming) {
    const progress = Math.min((now - transformStartTime) / transformDuration, 1);
    player.rotation.y = progress * Math.PI * 4;
    player.scale.y = 1 - Math.sin(progress * Math.PI) * 0.8;
    if (progress > 0.5 && isRobot !== targetIsRobot) {
      isRobot = targetIsRobot;
      applyBodySize();
      if (isRobot) {
        bodyMesh.material = robotMatIdle;
        frontWheel.visible = false;
        backWheel.visible = false;
      } else {
        bodyMesh.material = carMat;
        frontWheel.visible = true;
        backWheel.visible = true;
      }
    }
    if (progress === 1) {
      isTransforming = false;
      player.rotation.y = 0;
      player.scale.y = 1;
    }
  }

  if (!isRobot && Math.abs(velocity.x) > 0.01) {
    frontWheel.rotation.z += Math.abs(velocity.x) * 0.4;
    backWheel.rotation.z += Math.abs(velocity.x) * 0.4;
  }

  if (keys.jump && isGrounded && isRobot) {
    velocity.y = jumpStrength;
    isGrounded = false;
  }

  if (isRobot && !isGrounded) {
    if (bodyMesh.material !== robotMatRun) bodyMesh.material = robotMatRun;
    robotTextureWalk.offset.x = 2 / ART.frames;
    bodyMesh.scale.set(velocity.y > 0 ? 0.9 : 1.05, velocity.y > 0 ? 1.15 : 0.95, 1);
    bodyMesh.position.y = 0;
    bodyMesh.rotation.z = 0;
  } else if (isRobot && Math.abs(velocity.x) > 0.01) {
    if (bodyMesh.material !== robotMatRun) bodyMesh.material = robotMatRun;
    if (now - lastFrameTime > 70) {
      currentRobotFrame = (currentRobotFrame + 1) % ART.frames;
      robotTextureWalk.offset.x = currentRobotFrame / ART.frames;
      lastFrameTime = now;
    }
    bodyMesh.scale.set(1, 1, 1);
    bodyMesh.position.y = 0;
    bodyMesh.rotation.z = 0;
  } else if (isRobot) {
    if (bodyMesh.material !== robotMatIdle) bodyMesh.material = robotMatIdle;
    const time = now * 0.0025;
    bodyMesh.scale.set(1, 1 + Math.sin(time) * 0.02, 1);
    bodyMesh.position.y = Math.sin(time) * 0.05;
    bodyMesh.rotation.z = Math.cos(time * 0.5) * 0.015;
  } else {
    bodyMesh.scale.set(1, 1, 1);
    bodyMesh.position.y = 0;
    bodyMesh.rotation.z = 0;
  }

  velocity.y += gravity;
  player.position.x += velocity.x;
  player.position.y += velocity.y;
  checkCollisions();

  if (player.position.y < -18) {
    player.position.set(spawn.x, spawn.y, 0);
    velocity.x = 0;
    velocity.y = 0;
  }

  camera.position.x += (player.position.x - camera.position.x) * 0.1;
  camera.position.y += (player.position.y + 3 - camera.position.y) * 0.1;
  rim.position.x = player.position.x;
  updateHud(now);
  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
