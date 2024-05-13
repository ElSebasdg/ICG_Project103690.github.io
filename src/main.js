import * as THREE from "three";
import { GLTFLoader } from '../threejs/examples/GLTFLoader.js';
import { OrbitControls } from '../threejs/examples/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
const gltfLoader = new GLTFLoader().setPath('/assets/');

// Load mountain model
const mountainLoaded = new GLTFLoader().setPath('assets/');
mountainLoaded.load('mountain.glb', (gltf) => {
    const montanha = gltf.scene;
    montanha.scale.set(0.1, 0.1, 0.1);
    montanha.position.set(0, 60, 0);
    scene.add(montanha);
});



// Load skydome model
const domeLoaded = new GLTFLoader().setPath('assets/');
domeLoaded.load('skydome.glb', (gltf) => {
    const ceu = gltf.scene;
    ceu.position.set(0, -40, 0);
	ceu.scale.set(0.5, 0.5, 0.5)
    scene.add(ceu);
});


let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.outputEncoding = THREE.sRGBEncoding;

  const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820);
  scene.add(ambient);

  const lightt = new THREE.DirectionalLight(0xFFFFFF, 1);
  lightt.position.set( 1, 10, 6);
  scene.add(lightt);

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// Create XYZ axes
const axesHelper = new THREE.AxesHelper(5); // Length of the axes lines
scene.add(axesHelper);

class Box extends THREE.Mesh {
    constructor({
        width,
        height,
        depth,
        color = '#00ff00',
        velocity = {
            x: 0,
            y: 0,
            z: 0
        },
        position = {
            x: 0,
            y: 0,
            z: 0
        }
    }) {
        super(
            new THREE.BoxGeometry(width, height, depth),
            new THREE.MeshStandardMaterial({ color })
        );
        this.height = height;
        this.width = width;
        this.depth = depth;

        this.position.set(position.x, position.y, position.z);

        this.right = this.position.x + this.width / 2;
        this.left = this.position.x - this.width / 2;

        this.bottom = this.position.y - this.height / 2;
        this.top = this.position.y + this.height / 2;

        this.front = this.position.z + this.depth / 2;
        this.back = this.position.z - this.depth / 2;

        this.velocity = velocity;
        this.gravity = -0.003;
    }
    updateFall(ground) {
        this.right = this.position.x + this.width / 2;
        this.left = this.position.x - this.width / 2;

        this.bottom = this.position.y - this.height / 2;
        this.top = this.position.y + this.height / 2;

        this.front = this.position.z + this.depth / 2;
        this.back = this.position.z - this.depth / 2;

    }
    update(group) {
        this.updateFall();

        this.position.x += this.velocity.x;
        this.position.z += this.velocity.z;

        this.applyGravity(ground);
    }

    applyGravity(ground) {
        this.velocity.y += this.gravity;

        if (
            boxCollision({
                obj1: this,
                obj2: ground
            })
        ) {
            this.velocity.y *= 0.8;
            this.velocity.y = -this.velocity.y;
        } else this.position.y += this.velocity.y;
    }
}


function boxCollision({ obj1, obj2 }) {
    const xCollision = obj1.right >= obj2.left && obj1.left <= obj2.right;
    const yCollision = obj1.bottom + obj1.velocity.y <= obj2.top && obj1.top >= obj2.bottom;
    const zCollision = obj1.front >= obj2.back && obj1.back <= obj2.front;

    return xCollision && yCollision && zCollision;
}



// playe
const cube = new Box({
    width: 0.5,
    height: 1,
    depth: 1,
    color: '#FFFFFF',
    velocity: {
        x: 0,
        y: 0,
        z: 0
    },
    position: {
        x: 0,
        y: -1.3,
        z: 3.2
    }
});
// Make cube transparent
cube.material.transparent = true;
cube.material.opacity = 0; // Adjust opacity as needed
cube.castShadow = false;
scene.add(cube);


const loade = new GLTFLoader().setPath('assets/');
loade.load('Pig.glb', (gltf) => {
    const model = gltf.scene;
    model.scale.set(0.01, 0.01, 0.01);
    model.position.set(0, 0, 0);
    model.rotateY(Math.PI);
    scene.add(model);
    cube.add(model);
});




// linha
const ground = new Box({
    width: 5,
    height: 0.5,
    depth: 50,
    color: '#964B00',
    position: {
        x: 0,
        y: -2,
        z: 0
    }
});
ground.receiveShadow = true;
scene.add(ground);

// 4 faixas verticais no ground
const stripeWidth = 0.1; // Largura das faixas
const stripeColor = '#ffffff'; // Cor das faixas

// Faixa 1 (borda esquerda)
const stripe1 = new Box({
    width: stripeWidth,
    height: ground.height,
    depth: ground.depth,
    color: stripeColor,
    position: {
        x: -ground.width / 2 + stripeWidth / 2,
        y: ground.position.y + ground.height / 2,
        z: 0
    }
});
scene.add(stripe1);

// Faixa 2 (borda direita)
const stripe2 = new Box({
    width: stripeWidth,
    height: ground.height,
    depth: ground.depth,
    color: stripeColor,
    position: {
        x: ground.width / 2 - stripeWidth / 2,
        y: ground.position.y + ground.height / 2,
        z: 0
    }
});
scene.add(stripe2);

// Faixa 3 (centro esquerdo)
const stripe3 = new Box({
    width: stripeWidth,
    height: ground.height,
    depth: ground.depth,
    color: stripeColor,
    position: {
        x: -ground.width / 6,
        y: ground.position.y + ground.height / 2,
        z: 0
    }
});
scene.add(stripe3);

// Faixa 4 (centro direito)
const stripe4 = new Box({
    width: stripeWidth,
    height: ground.height,
    depth: ground.depth,
    color: stripeColor,
    position: {
        x: ground.width / 6,
        y: ground.position.y + ground.height / 2,
        z: 0
    }
});
scene.add(stripe4);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.y = 3;
light.position.z = 2;
light.castShadow = true;
scene.add(light);

camera.position.z = 5;

const keys = {
    right: {
        pressed: false
    },
    left: {
        pressed: false
    },
    space: {
        pressed: false
    },
};

window.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'ArrowRight':
            keys.right.pressed = true;
            break;
        case 'ArrowLeft':
            keys.left.pressed = true;
            break;
        case 'Space':
            keys.space.pressed = true;
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
        case 'Space':
            keys.space.pressed = false;
            break;
    }
});

const getRandomXPosition = () => {
    // Array of possible x-coordinates
    const possibleXPositions = [1.6,0, -1.6];
    // Randomly select an index from the possibleXPositions array
    const randomIndex = Math.floor(Math.random() * possibleXPositions.length);
    // Return the corresponding x-coordinate
    return possibleXPositions[randomIndex];
};

const enemy = new Box({
    width: 1,
    height: 1,
    depth: 1,
    position: {
      x: 1.6,
      y: 0,
      z: -10
    },
    velocity: {
        x: 0,
        y: 0,
        z: 0.015
    },
    //zAcceleration: true
  })
  enemy.castShadow = false
  enemy.material.opacity = 0;
  enemy.material.transparent = true;

  const loader = new GLTFLoader().setPath('assets/');
    loader.load('Tractor.glb', (gltf) => {
        const tractorModel = gltf.scene;
        tractorModel.scale.set(0.1, 0.1, 0.1);
        tractorModel.position.set(0, -0.5, 0);
        enemy.add(tractorModel); // Add tractor model as child of the enemy cube
    });

  scene.add(enemy)

  const enemies = [enemy]


let frames = 0
function animate() {
    const animationId = requestAnimationFrame(animate)
    renderer.render(scene, camera);

    cube.velocity.x = 0;
    if (keys.left.pressed) cube.velocity.x = -0.01;
    else if (keys.right.pressed) cube.velocity.x = 0.01;

    cube.update(ground)
    enemies.forEach((enemy) => {
    enemy.update(ground)
      if (
        boxCollision({
          obj1: cube,
          obj2: enemy
        })
      ) {
        //console.log('collision')
        cancelAnimationFrame(animationId)
      }
    })
    if (frames % 300 === 0){
        const enemy = new Box({
            width: 1,
            height: 1,
            depth: 1,
            position: {
              x: getRandomXPosition(),
              y: 0,
              z: -20
            },
            velocity: {
                x: 0,
                y: 0,
                z: 0.015
            },
            //zAcceleration: true
          })
          enemy.castShadow = false
          enemy.material.opacity = 0;
          enemy.material.transparent = true;
        
          const loader = new GLTFLoader().setPath('assets/');
            loader.load('Tractor.glb', (gltf) => {
                const tractorModel = gltf.scene;
                tractorModel.scale.set(0.1, 0.1, 0.1);
                tractorModel.position.set(0, -0.5, 0);
                enemy.add(tractorModel); // Add tractor model as child of the enemy cube
            });
            scene.add(enemy)
          enemies.push(enemy)
    }

    frames++
}

animate()
