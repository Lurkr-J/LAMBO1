// Three.js is loaded globally via CDN in index.html

// --- SCENE SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
scene.fog = new THREE.FogExp2(0x111111, 0.03); // Limbo-style fog

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 3, 20);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('app').appendChild(renderer.domElement);

// --- LIGHTING ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

// --- ASSETS ---
const textureLoader = new THREE.TextureLoader();
const carTexture = textureLoader.load('./assets/car.png?v=' + Date.now());
const robotTextureWalk = textureLoader.load('./assets/robot_walk.png?v=' + Date.now());
robotTextureWalk.wrapS = THREE.RepeatWrapping;
robotTextureWalk.repeat.set(1 / 8, 1); // 8 frames in the new run animation

const robotTextureIdle = textureLoader.load('./assets/robot.png?v=' + Date.now());

// --- PLAYER SETUP ---
const matProps = { transparent: true, side: THREE.DoubleSide, alphaTest: 0.05, color: 0xffffff };
const carMat = new THREE.MeshBasicMaterial({ map: carTexture, ...matProps });
const robotMatRun = new THREE.MeshBasicMaterial({ map: robotTextureWalk, ...matProps });
const robotMatIdle = new THREE.MeshBasicMaterial({ map: robotTextureIdle, ...matProps });

const player = new THREE.Group();
player.position.set(0, 2, 0);

const bodyMesh = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), carMat);
player.add(bodyMesh);

const wheelGeo = new THREE.PlaneGeometry(0.75, 0.75); // Sized to cover the black holes
const wheelMat = new THREE.MeshBasicMaterial({ map: textureLoader.load('./assets/wheel.png?v=' + Date.now()), ...matProps });

const backWheel = new THREE.Mesh(wheelGeo, wheelMat);
backWheel.position.set(-1.207, -0.302, 0.01);
player.add(backWheel);

const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
frontWheel.position.set(1.313, -0.317, 0.01);
player.add(frontWheel);

scene.add(player);

// --- LEVEL ENVIRONMENT ---
const platforms = [];
const platformGeo = new THREE.BoxGeometry(40, 2, 5);
const platformMat = new THREE.MeshLambertMaterial({ color: 0x050505 }); // Dark platforms
const ground = new THREE.Mesh(platformGeo, platformMat);
ground.position.set(0, -1, 0);
scene.add(ground);
platforms.push(ground);

const p2Geo = new THREE.BoxGeometry(10, 2, 5);
const platform2 = new THREE.Mesh(p2Geo, platformMat);
platform2.position.set(15, 3, 0);
scene.add(platform2);
platforms.push(platform2);

// Add some background parallax elements
for (let i = 0; i < 20; i++) {
    const bgGeo = new THREE.BoxGeometry(Math.random() * 10 + 2, Math.random() * 20 + 10, 2);
    const bgMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.set((Math.random() - 0.5) * 100, 5, -10 - Math.random() * 20);
    scene.add(bgMesh);
}

// --- PHYSICS & LOGIC ---
const cameraOffset = new THREE.Vector3(0, 5, 20);
let isGrounded = false;
let isRobot = false;

// Robot animation state
let currentRobotFrame = 0;
let lastFrameTime = 0;
const robotFrameCount = 8; // Increased from 5 to 8 for the run cycle

// Transformation state
let isTransforming = false;
let targetIsRobot = false;
let transformStartTime = 0;
let lastTransformTime = 0;
const transformDuration = 400; // ms
const transformCooldown = 2000; // ms

let velocity = { x: 0, y: 0 };
const gravity = -0.015;
const jumpStrength = 0.35;
const moveSpeed = 0.15;
const playerRadius = 1.5; // Rough collision radius

const keys = { a: false, d: false, space: false };

window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'a') keys.a = true;
    if (e.key.toLowerCase() === 'd') keys.d = true;
    if (e.key === ' ' || e.key === 'Spacebar') keys.space = true;
    if (e.key.toLowerCase() === 't') transform();
});

window.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() === 'a') keys.a = false;
    if (e.key.toLowerCase() === 'd') keys.d = false;
    if (e.key === ' ' || e.key === 'Spacebar') keys.space = false;
});

function transform() {
    const now = Date.now();
    if (isTransforming || now - lastTransformTime < transformCooldown) return; // Prevent spamming and enforce cooldown
    
    isTransforming = true;
    transformStartTime = now;
    lastTransformTime = now;
    targetIsRobot = !isRobot;
    
    // Give a slight upward boost for cinematic flair
    if (isGrounded) {
        velocity.y = 0.25;
        isGrounded = false;
    }
}

function checkCollisions() {
    isGrounded = false;
    const px = player.position.x;
    const py = player.position.y;
    
    // Dynamic collision radius (distance from center to feet/wheels)
    const currentRadius = isRobot ? 2.3 : 0.7;
    
    // Simple AABB vs Platform collision (assuming platforms are centered at Y, top is Y + height/2)
    for (let p of platforms) {
        const top = p.position.y + p.geometry.parameters.height / 2;
        const left = p.position.x - p.geometry.parameters.width / 2;
        const right = p.position.x + p.geometry.parameters.width / 2;
        
        // Check if player is above platform and falling
        if (velocity.y <= 0 && py - currentRadius <= top && py - currentRadius > top - 1.0) {
            if (px > left && px < right) {
                isGrounded = true;
                player.position.y = top + currentRadius;
                velocity.y = 0;
            }
        }
    }
}

// --- GAME LOOP ---
function animate() {
    requestAnimationFrame(animate);

    // Movement logic
    const currentSpeed = isRobot ? moveSpeed : moveSpeed * 2; // Car goes 2x faster

    if (keys.a) {
        velocity.x = -currentSpeed;
        player.scale.x = isRobot ? -1 : 1; 
        if (!isTransforming) player.rotation.y = 0; // Don't snap rotation if spinning
    } else if (keys.d) {
        velocity.x = currentSpeed;
        player.scale.x = isRobot ? 1 : -1; 
        if (!isTransforming) player.rotation.y = 0;
    } else {
        velocity.x *= 0.8; // friction
    }

    // Transformation Animation
    if (isTransforming) {
        const elapsed = Date.now() - transformStartTime;
        const progress = Math.min(elapsed / transformDuration, 1.0);
        
        // Spin the player (coin flip effect in 3D)
        player.rotation.y = progress * Math.PI * 4; // 2 full spins
        
        // Fold (squash) vertically in the middle of the animation
        const squash = 1 - (Math.sin(progress * Math.PI) * 0.8); // squashes to 0.2 height at apex
        player.scale.y = squash;
        
        // Swap model exactly at the halfway point when it's most squashed and spun away
        if (progress > 0.5 && isRobot !== targetIsRobot) {
            isRobot = targetIsRobot;
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
        
        if (progress === 1.0) {
            isTransforming = false;
            player.rotation.y = 0;
            player.scale.y = 1;
        }
    }

    // Rotate wheels
    if (!isRobot && Math.abs(velocity.x) > 0.01) {
        frontWheel.rotation.z += Math.abs(velocity.x) * 0.4;
        backWheel.rotation.z += Math.abs(velocity.x) * 0.4;
    }

    // Jump logic (Robot ONLY)
    if (keys.space && isGrounded && isRobot) {
        velocity.y = jumpStrength;
        isGrounded = false;
    }

    // Robot animation states
    if (isRobot && !isGrounded) {
        // Jumping / Falling Animation
        if (bodyMesh.material !== robotMatRun) bodyMesh.material = robotMatRun;
        robotTextureWalk.offset.x = 2 / robotFrameCount; // Use a mid-stride frame (frame 2) for leaping
        
        if (velocity.y > 0) {
            // Ascending: Stretch vertically
            bodyMesh.scale.set(0.9, 1.15, 1);
        } else {
            // Falling: Squash slightly
            bodyMesh.scale.set(1.05, 0.95, 1);
        }
        bodyMesh.position.y = 0;
        bodyMesh.rotation.z = 0;
    } else if (isRobot && Math.abs(velocity.x) > 0.01) {
        // Run Animation
        if (bodyMesh.material !== robotMatRun) bodyMesh.material = robotMatRun;
        
        const now = Date.now();
        if (now - lastFrameTime > 50) { // ~20 fps for a fast run cycle
            currentRobotFrame = (currentRobotFrame + 1) % robotFrameCount;
            robotTextureWalk.offset.x = currentRobotFrame / robotFrameCount;
            lastFrameTime = now;
        }
        bodyMesh.scale.set(1, 1, 1);
        bodyMesh.position.y = 0;
        bodyMesh.rotation.z = 0;
    } else if (isRobot) {
        // Idle (Breathing) Animation - Revert to standing pose
        if (bodyMesh.material !== robotMatIdle) bodyMesh.material = robotMatIdle;
        
        const time = Date.now() * 0.0025;
        bodyMesh.scale.set(1, 1 + Math.sin(time) * 0.02, 1);
        bodyMesh.position.y = Math.sin(time) * 0.05;
        bodyMesh.rotation.z = Math.cos(time * 0.5) * 0.015;
    } else {
        // Car mode cleanup
        bodyMesh.scale.set(1, 1, 1);
        bodyMesh.position.y = 0;
        bodyMesh.rotation.z = 0;
    }

    // Apply physics
    velocity.y += gravity;
    player.position.x += velocity.x;
    player.position.y += velocity.y;

    checkCollisions();
    
    // Death / Fall off map
    if (player.position.y < -20) {
        player.position.set(0, 5, 0);
        velocity.y = 0;
    }

    // Camera follow
    camera.position.x += (player.position.x - camera.position.x) * 0.1;
    camera.position.y += (player.position.y + 3 - camera.position.y) * 0.1;

    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
