import * as THREE from 'three';
import { CONSTANTS } from './Constants.js';
import { devLog } from './Debug.js';

export class Scene {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(CONSTANTS.COLORS.BACKGROUND);
    this.scene.fog = new THREE.FogExp2(CONSTANTS.COLORS.BACKGROUND, 0.01);
    devLog('Scene: Initialized FPS scene fog exp2 0.01');

    // First-person camera. Camera transform is owned by CameraSystem, not parented to the player mesh.
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(64, aspect, 0.05, 165);
    this.camera.position.set(0, CONSTANTS.PLAYER_EYE_HEIGHT, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(CONSTANTS.COLORS.BACKGROUND, 1);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.92;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    this.setupLights();
    
    this.developerHelperGroup = new THREE.Group();
    this.developerHelperGroup.visible = false;

    if (CONSTANTS.DEVELOPER_TOOLS_ENABLED) {
      const axesHelper = new THREE.AxesHelper(10);
      this.developerHelperGroup.add(axesHelper);

      const gridHelper = new THREE.GridHelper(58, 25, 0x444444, 0x222222);
      gridHelper.position.set(24, 0, 16);
      this.developerHelperGroup.add(gridHelper);

      this.cameraTargetHelper = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 8, 8),
        new THREE.MeshBasicMaterial({ color: CONSTANTS.COLORS.PLAYER })
      );
      this.cameraTargetHelper.position.y = 0.2;
      this.developerHelperGroup.add(this.cameraTargetHelper);
    }

    this.scene.add(this.developerHelperGroup);

    devLog('Scene: Renderer initialized');
    this.boundResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.boundResize);
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xb9c4c8, 0.24);
    this.scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xd9f1ef, 0x08090b, 0.34);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xe8f8f4, 0.18);
    dirLight.position.set(12, 18, -16);
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

  setDeveloperHelpersVisible(isVisible) {
    if (this.developerHelperGroup) {
      this.developerHelperGroup.visible = !!isVisible;
    }
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
    this.scene.traverse(child => {
      child.geometry?.dispose?.();
      if (Array.isArray(child.material)) {
        child.material.forEach(material => {
          material.map?.dispose?.();
          material.dispose?.();
        });
      } else {
        child.material?.map?.dispose?.();
        child.material?.dispose?.();
      }
    });
    this.renderer.domElement.remove();
    this.renderer.dispose();
  }
}
