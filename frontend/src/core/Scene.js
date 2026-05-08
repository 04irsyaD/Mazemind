import * as THREE from 'three';
import { CONSTANTS } from './Constants.js';

export class Scene {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(CONSTANTS.COLORS.BACKGROUND);
    this.scene.fog = new THREE.Fog(CONSTANTS.COLORS.BACKGROUND, 15, 35);

    // Camera (Orthographic for Isometric view)
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 18; // How much of the map we see
    
    this.camera = new THREE.OrthographicCamera(
      frustumSize * aspect / -2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      frustumSize / -2,
      1,
      1000
    );

    // Setup Isometric angle
    // Pitch ~ -55 degrees, Yaw 45 degrees
    this.camera.position.set(20, 25, 20); // Initial position, will follow player
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    this.setupLights();

    // Resize handler
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    // Isometric light angle
    dirLight.position.set(10, 20, -10);
    dirLight.castShadow = true;
    
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    
    const d = 15;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;

    this.scene.add(dirLight);
  }

  onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 18;

    this.camera.left = frustumSize * aspect / -2;
    this.camera.right = frustumSize * aspect / 2;
    this.camera.top = frustumSize / 2;
    this.camera.bottom = frustumSize / -2;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
