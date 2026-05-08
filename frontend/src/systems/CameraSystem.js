import * as THREE from 'three';
import { CONSTANTS } from '../core/Constants.js';

export class CameraSystem {
  constructor(camera) {
    this.camera = camera;
    this.target = new THREE.Vector3();
    
    // Isometric offset
    this.offset = new THREE.Vector3(20, 25, 20);
  }

  update(playerPos) {
    // Determine where camera should be
    this.target.copy(playerPos).add(this.offset);

    // Smoothly interpolate current camera position to target position
    this.camera.position.lerp(this.target, CONSTANTS.CAMERA_LERP);
  }

  // Snap instantly (e.g. on start/restart)
  snap(playerPos) {
    this.camera.position.copy(playerPos).add(this.offset);
  }
}
