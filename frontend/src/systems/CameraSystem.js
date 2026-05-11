import * as THREE from 'three';
import { CONSTANTS } from '../core/Constants.js';

export class CameraSystem {
  constructor(camera) {
    this.camera = camera;
    this.target = new THREE.Vector3();
    this.lookTarget = new THREE.Vector3();
    this.shakeTime = 0;
    this.shakeStrength = 0;
    
    // Isometric offset
    this.offset = new THREE.Vector3(20, 25, 20);
  }

  update(playerPos, delta = 0) {
    // Determine where camera should be
    this.target.copy(playerPos).add(this.offset);

    // Smoothly interpolate current camera position to target position
    this.camera.position.lerp(this.target, CONSTANTS.CAMERA_LERP);
    this.lookTarget.copy(playerPos);

    if (this.shakeTime > 0) {
      this.shakeTime = Math.max(0, this.shakeTime - delta);
      const falloff = this.shakeTime * CONSTANTS.CAMERA_SHAKE_DECAY;
      const shake = this.shakeStrength * Math.min(1, falloff);
      this.camera.position.x += (Math.random() - 0.5) * shake;
      this.camera.position.y += (Math.random() - 0.5) * shake * 0.4;
    }

    this.camera.lookAt(this.lookTarget);
  }

  // Snap instantly (e.g. on start/restart)
  snap(playerPos) {
    this.camera.position.copy(playerPos).add(this.offset);
    this.camera.lookAt(playerPos);
  }

  shake(strength = 0.25, duration = 0.5) {
    this.shakeStrength = Math.max(this.shakeStrength, strength);
    this.shakeTime = Math.max(this.shakeTime, duration);
  }
}
