import * as THREE from 'three';
import { CONSTANTS } from './Constants.js';
import { devLog } from './Debug.js';

export class Scene {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(CONSTANTS.COLORS.BACKGROUND);
    this.scene.fog = new THREE.Fog(CONSTANTS.COLORS.BACKGROUND, 26, 118);
    devLog('Scene: Initialized FPS scene fog (26, 118)');

    // First-person camera. Camera transform is owned by CameraSystem, not parented to the player mesh.
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(68, aspect, 0.08, 140);
    this.camera.position.set(0, CONSTANTS.PLAYER_EYE_HEIGHT, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(CONSTANTS.COLORS.BACKGROUND, 1);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    this.setupLights();
    
    if (CONSTANTS.DEV_MODE) {
      const axesHelper = new THREE.AxesHelper(10);
      this.scene.add(axesHelper);

      const gridHelper = new THREE.GridHelper(58, 25, 0x444444, 0x222222);
      gridHelper.position.set(24, 0, 16);
      this.scene.add(gridHelper);

      this.cameraTargetHelper = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 8, 8),
        new THREE.MeshBasicMaterial({ color: CONSTANTS.COLORS.PLAYER })
      );
      this.cameraTargetHelper.position.y = 0.2;
      this.scene.add(this.cameraTargetHelper);
    }

    devLog('Scene: Renderer initialized');
    this.boundResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.boundResize);
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    this.scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xa8c8ff, 0x090a14, 0.72);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.55);
    dirLight.position.set(10, 16, -10);
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
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    if (!this.renderer || !this.scene || !this.camera) {
      console.error('Scene: Render components missing!', { r: !!this.renderer, s: !!this.scene, c: !!this.camera });
      return;
    }
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    window.removeEventListener('resize', this.boundResize);
    this.renderer.dispose();
  }
}
