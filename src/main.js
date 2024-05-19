import * as THREE from "three";
import { GLTFLoader } from '../threejs/examples/GLTFLoader.js';
import { OrbitControls } from '../threejs/examples/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(4.61, 2, 8);

// Loaders
const gltfLoader = new GLTFLoader().setPath('/assets/');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// Load mountain and skydome models
gltfLoader.load('mountain.glb', (gltf) => {
    const montanha = gltf.scene;
    montanha.scale.set(2, 2, 2);
    montanha.position.set(0, 20, 0);
    montanha.rotateX(-Math.PI / 2);
    scene.add(montanha);
});

gltfLoader.load('skydome.glb', (gltf) => {
    const ceu = gltf.scene;
    ceu.position.set(0, 0, 0);
    ceu.scale.set(4, 4, 4);
    ceu.rotateX(-Math.PI / 2);
    scene.add(ceu);
});

gltfLoader.load('Farm.glb', (gltf) => {
    const quinta = gltf.scene;
    quinta.scale.set(3, 3, 3);
    quinta.position.set(0, -1.5, -40);
    // quinta.rotateX(-Math.PI / 2);
    scene.add(quinta);
});

// Lighting
const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820);
scene.add(ambient);

const lightt = new THREE.DirectionalLight(0xFFFFFF, 1);
lightt.position.set(1, 10, 6);
scene.add(lightt);

// Coin Counter
let coinCounter = 0;
const coinCounterElement = document.createElement('div');
coinCounterElement.style.position = 'absolute';
coinCounterElement.style.top = '10px';
coinCounterElement.style.right = '10px';
coinCounterElement.style.color = '#ffffff';
coinCounterElement.style.fontFamily = 'Arial';
coinCounterElement.style.fontSize = '24px';
document.body.appendChild(coinCounterElement);

function updateCoinCounterDisplay() {
    coinCounterElement.textContent = 'Coins: ' + coinCounter;
}
updateCoinCounterDisplay();

// Box Class
class Box extends THREE.Mesh {
    constructor({ width, height, depth, color = '#00ff00', velocity = { x: 0, y: 0, z: 0 }, position = { x: 0, y: 0, z: 0 }, isCoin = false }) {
        super(new THREE.BoxGeometry(width, height, depth), new THREE.MeshStandardMaterial({ color }));
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.position.set(position.x, position.y, position.z);
        this.velocity = velocity;
        this.gravity = -0.003;
        this.isCoin = isCoin;
        this.canJump = true;
        this.updateEdges();
    }

    updateEdges() {
        this.right = this.position.x + this.width / 2;
        this.left = this.position.x - this.width / 2;
        this.bottom = this.position.y - this.height / 2;
        this.top = this.position.y + this.height / 2;
        this.front = this.position.z + this.depth / 2;
        this.back = this.position.z - this.depth / 2;
    }

    updateFall() {
        this.updateEdges();
    }

    update(ground) {
        this.updateFall();
        this.position.x += this.velocity.x;
        this.position.z += this.velocity.z;
        this.applyGravity(ground);
    }
    applyGravity(ground) {
        this.velocity.y += this.gravity;
        if (boxCollision({ obj1: this, obj2: ground })) {
            this.velocity.y = 0;
            this.position.y = ground.top + this.height / 2;
            this.canJump = true; // Reset canJump flag when hitting the ground
        } else {
            this.position.y += this.velocity.y;
        }
    }
}

function boxCollision({ obj1, obj2 }) {
    const xCollision = obj1.right >= obj2.left && obj1.left <= obj2.right;
    const yCollision = obj1.bottom + obj1.velocity.y <= obj2.top && obj1.top >= obj2.bottom;
    const zCollision = obj1.front >= obj2.back && obj1.back <= obj2.front;
    return xCollision && yCollision && zCollision;
}

// Player cube
const cube = new Box({ width: 0.5, height: 1, depth: 1, color: '#FFFFFF', position: { x: 0, y: -1.3, z: 3.2 } });
cube.material.transparent = true;
cube.material.opacity = 0;
cube.castShadow = false;
scene.add(cube);

gltfLoader.load('Pig.glb', (gltf) => {
    const model = gltf.scene;
    model.scale.set(0.01, 0.01, 0.01);
    model.position.set(0, 0, 0);
    model.rotateY(Math.PI);
    scene.add(model);
    cube.add(model);
});

// Ground
const ground = new Box({ width: 5, height: 0.5, depth: 100, color: '#964B00', position: { x: 0, y: -2, z: 5 } });
ground.receiveShadow = true;
scene.add(ground);

// Stripes on the ground
const stripeWidth = 0.1;
const stripeColor = '#ffffff';
const stripes = [{ x: -ground.width / 2 + stripeWidth / 2 }, { x: ground.width / 2 - stripeWidth / 2 }, { x: -ground.width / 6 }, { x: ground.width / 6 }];
stripes.forEach(stripe => {
    const stripeBox = new Box({ width: stripeWidth, height: ground.height, depth: ground.depth, color: stripeColor, position: { x: stripe.x, y: ground.position.y + ground.height / 2, z: 5 } });
    scene.add(stripeBox);
});

// Additional lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 3, 2);
light.castShadow = true;
scene.add(light);

// Key controls
const keys = { right: { pressed: false }, left: { pressed: false } };
window.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'ArrowRight':
            keys.right.pressed = true;
            break;
        case 'ArrowLeft':
            keys.left.pressed = true;
            break;
        case 'Space':
            if (cube.canJump) {
                cube.velocity.y = 0.11;
                cube.canJump = false; // Set canJump flag to false when jumping
            }
            break;
    }
});
window.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'ArrowRight':
            keys.right.pressed = false;
            break;
        case 'ArrowLeft':
            keys.left.pressed = false;
            break;
    }
});

// Random position generator for enemies
const getRandomXPosition = () => {
    const possibleXPositions = [1.6, 0, -1.6];
    return possibleXPositions[Math.floor(Math.random() * possibleXPositions.length)];
};

// Enemies array
const enemies = [];

// Enemy creation function
function createEnemy(modelPath, scaleX, scaleY, scaleZ, rotationY, width, height, depth, positionGlb, isCoin = false) {
    const enemy = new Box({ width, height, depth, position: { x: getRandomXPosition(), y: 0, z: -30 }, velocity: { x: 0, y: 0, z: 0.1 }, isCoin });
    gltfLoader.load(modelPath, (gltf) => {
        const model = gltf.scene;
        model.scale.set(scaleX, scaleY, scaleZ);
        model.position.set(positionGlb.x, positionGlb.y, positionGlb.z);
        model.rotateY(rotationY);
        enemy.add(model);
    });
    return enemy;
}

// Animation loop
let frames = 0;
let spawnRate = 200;

function animate() {
    const animationId = requestAnimationFrame(animate);
    renderer.render(scene, camera);

    // Player movement
    cube.velocity.x = keys.left.pressed ? -0.04 : keys.right.pressed ? 0.04 : 0;
    cube.update(ground);

    // Enemy spawning
    if (frames % spawnRate === 0) {
        if (spawnRate > 45) spawnRate -= 4;
        const randomEnemyType = Math.random();
        const positionScare = { x: 0, y: -1.1, z: 0 };
        const position = { x: 0, y: -0.5, z: 0 };
        const positionCoin = { x: 0, y: 0, z: 0 };

        let newEnemy;
        if (randomEnemyType < 0.25) {
            newEnemy = createEnemy('Tractor.glb', 0.1, 0.1, 0.1, Math.PI * 2, 1.2, 1.1, 1.1, position, false);
        } else if (randomEnemyType < 0.50) {
            newEnemy = createEnemy('Chicken.glb', 0.007, 0.007, 0.007, Math.PI / 2, 0.55, 1, 1, position, false);
        } else if (randomEnemyType < 0.75) {
            newEnemy = createEnemy('Scarecrow.glb', 0.7, 0.7, 0.7, Math.PI * 2, 0.7, 2, 1, positionScare, false);
        } else {
            newEnemy = createEnemy('Coin.glb', 1, 1, 1, Math.PI, 1, 1, 1, positionCoin, true);
        }

        newEnemy.castShadow = false;
        newEnemy.material.opacity = 0;
        newEnemy.material.transparent = true;
        scene.add(newEnemy);
        enemies.push(newEnemy);
    }

    // Update enemies and check for collisions
    enemies.forEach((enemy, index) => {
        enemy.update(ground);

        if (boxCollision({ obj1: cube, obj2: enemy })) {
            if (enemy.isCoin) {
                handleCollisionWithCoin();
                scene.remove(enemy);
                enemies.splice(index, 1);
            } else {
                console.log('Game Over');
                cancelAnimationFrame(animationId);
                window.location.href = `youLost.html?coins=${coinCounter}`;
            }
        } else if (enemy.position.z >= 10) {
            // Remove enemies that go past a certain point
            scene.remove(enemy);
            enemies.splice(index, 1);
        }
        else if (cube.position.y < -15) {
            // Remove enemies that go past a certain point
            scene.remove(cube);
            cancelAnimationFrame(animationId);
            window.location.href = `youLost.html?coins=${coinCounter}`;
        }
    });

    frames++;
}

// Initialize the coin counter
function handleCollisionWithCoin() {
    coinCounter++;
    updateCoinCounterDisplay();
}

animate();
