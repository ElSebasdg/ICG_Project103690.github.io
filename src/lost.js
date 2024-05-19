import * as THREE from "three";
import { GLTFLoader } from '../threejs/examples/GLTFLoader.js';
import { OrbitControls } from '../threejs/examples/OrbitControls.js';


window.addEventListener('DOMContentLoaded', () => {
    const scene = new THREE.Scene();

    // Create a gradient skybox
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const gradient = context.createLinearGradient(0, 0, 0, window.innerHeight);
    gradient.addColorStop(0, '#1e3c72');
    gradient.addColorStop(1, '#2a5298');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    const texture = new THREE.CanvasTexture(canvas);
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
    const skybox = new THREE.Mesh(geometry, material);

    scene.add(skybox);
    const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820);
    scene.add(ambient);
    const lightt = new THREE.DirectionalLight(0xFFFFFF, 1);
    lightt.position.set(1, 10, 6);
    scene.add(lightt);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const urlParams = new URLSearchParams(window.location.search);
    const coins = urlParams.get('coins');

    const messageElement = document.createElement('p');
    messageElement.textContent = `Perdeste :( Recolheste ${coins} moedas.`;
    messageElement.style.fontSize = '3em';
    messageElement.style.position = 'absolute';
    messageElement.style.top = '50%';
    messageElement.style.left = '50%';
    messageElement.style.transform = 'translate(-50%, -50%)';
    messageElement.style.color = 'white';
    document.body.appendChild(messageElement);

    const button = document.createElement('button');
    button.textContent = 'Play Again';
    button.style.position = 'absolute';
    button.style.top = '60%';
    button.style.left = '50%';
    button.style.transform = 'translate(-50%, -50%)';
    button.style.padding = '10px 20px';
    button.style.fontFamily = 'Arial, sans-serif';
    button.style.fontSize = '1.2em';
    button.style.backgroundColor = '#4CAF50';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.addEventListener('click', () => {
        window.location.href = 'game.html';
    });
    document.body.appendChild(button);

    const gltfLoader = new GLTFLoader().setPath('/assets/');
    gltfLoader.load('Bonfire.glb', (gltf) => {
        const fire = gltf.scene;
        fire.scale.set(0.5, 0.5, 0.5);
        fire.position.set(0, 0, 0);
        fire.rotateY(Math.PI/2);
        cube2.add(fire);
    });

    gltfLoader.load('Pig.glb', (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.01, 0.01, 0.01);
        model.position.set(0, 0, 0);
        model.rotateY(Math.PI/2);
        cube.add(model);
    });

    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 2, 0)
    scene.add(cube);

    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 0, 5);
    cube.material.transparent = true;
    cube.material.opacity = 0;
    cube.castShadow = false;

    // pau
    const cylinderGeometry = new THREE.CylinderGeometry(0.3, 0.3, 3, 40); // Adjust radius and height as needed
    const brownMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 }); // Brown color
    const cylinder = new THREE.Mesh(cylinderGeometry, brownMaterial);
    cylinder.position.set(0, 0, 0);
    cylinder.rotateZ(Math.PI/2);
    cylinder.scale.set(0.1, 1, 0.1);
    cube.add(cylinder);


     // Create second spinning cube
     const cubeGeometry2 = new THREE.BoxGeometry(1, 1, 1);
     const cubeMaterial2 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
     const cube2 = new THREE.Mesh(cubeGeometry2, cubeMaterial2);
     cube2.position.set(0, 0, 0);
     cube2.material.transparent = true;
     cube2.material.opacity = 0;
     cube2.castShadow = false;
     scene.add(cube2);

    function animate() {
        requestAnimationFrame(animate);

        // Rotate the cube
        cube.rotation.x += 0.01;
        

        renderer.render(scene, camera);
    }

    animate();
});
