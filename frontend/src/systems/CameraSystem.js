import * as THREE from 'three';
import { CONSTANTS } from '../core/Constants.js';

export class CameraSystem {
  constructor(camera) {
    this.camera = camera;
    this.eyePosition = new THREE.Vector3();
    this.lookTarget = new THREE.Vector3();
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.yaw = 0;
    this.pitch = 0;
    this.headBobTime = 0;
    this.lastPlayerPosition = new THREE.Vector3();
    this.shakeTime = 0;
    this.shakeStrength = 0;
    this.shakePhase = 0;
  }

  applyMouseLook(mouseDelta) {
    const dx = THREE.MathUtils.clamp(mouseDelta.x, -CONSTANTS.MAX_MOUSE_DELTA, CONSTANTS.MAX_MOUSE_DELTA);
    const dy = THREE.MathUtils.clamp(mouseDelta.y, -CONSTANTS.MAX_MOUSE_DELTA, CONSTANTS.MAX_MOUSE_DELTA);
    this.yaw -= dx * CONSTANTS.MOUSE_SENSITIVITY;
    this.pitch -= dy * CONSTANTS.MOUSE_SENSITIVITY;
    this.pitch = THREE.MathUtils.clamp(this.pitch, -1.18, 1.18);
  }

  update(playerPos, delta = 0) {
    const cappedDelta = Math.min(delta, CONSTANTS.MAX_DELTA);
    const horizontalDistance = Math.hypot(
      playerPos.x - this.lastPlayerPosition.x,
      playerPos.z - this.lastPlayerPosition.z
    );
    const horizontalSpeed = horizontalDistance / Math.max(cappedDelta, 0.0001);
    this.lastPlayerPosition.copy(playerPos);
    this.headBobTime += horizontalSpeed > 0.08 ? cappedDelta * CONSTANTS.HEAD_BOB_SPEED : 0;

    const bobOffset = Math.sin(this.headBobTime) * CONSTANTS.HEAD_BOB_AMOUNT * Math.min(1, horizontalSpeed / CONSTANTS.PLAYER_SPEED);
    this.eyePosition.set(
      playerPos.x,
      (playerPos.y ?? 0) + CONSTANTS.PLAYER_EYE_HEIGHT + bobOffset,
      playerPos.z
    );

    if (this.shakeTime > 0) {
      this.shakeTime = Math.max(0, this.shakeTime - cappedDelta);
      this.shakePhase += cappedDelta * 38;
      const falloff = this.shakeTime * CONSTANTS.CAMERA_SHAKE_DECAY;
      const shake = this.shakeStrength * Math.min(1, falloff);
      this.eyePosition.x += Math.sin(this.shakePhase) * shake * 0.35;
      this.eyePosition.y += Math.cos(this.shakePhase * 1.37) * shake * 0.12;
    }

    this.camera.position.copy(this.eyePosition);
    this.euler.set(this.pitch, this.yaw, 0);
    this.camera.quaternion.setFromEuler(this.euler);

    const forward = this.getForwardVector();
    this.lookTarget.copy(this.camera.position).addScaledVector(forward, 3);
  }

  updateFreeFly(position) {
    this.eyePosition.copy(position);
    this.camera.position.copy(this.eyePosition);
    this.euler.set(this.pitch, this.yaw, 0);
    this.camera.quaternion.setFromEuler(this.euler);

    const forward = this.getForwardVector();
    this.lookTarget.copy(this.camera.position).addScaledVector(forward, 3);
  }

  // Snap instantly (e.g. on start/restart)
  snap(playerPos) {
    this.lastPlayerPosition.copy(playerPos);
    this.headBobTime = 0;
    this.shakeTime = 0;
    this.shakeStrength = 0;
    this.update(playerPos, 0);
  }

  reset(yaw = 0, pitch = 0) {
    this.yaw = yaw;
    this.pitch = pitch;
    this.headBobTime = 0;
    this.shakeTime = 0;
    this.shakeStrength = 0;
    this.shakePhase = 0;
  }

  shake(strength = 0.25, duration = 0.5) {
    this.shakeStrength = Math.max(this.shakeStrength, strength);
    this.shakeTime = Math.max(this.shakeTime, duration);
  }

  getYaw() {
    return this.yaw;
  }

  getForwardVector() {
    return new THREE.Vector3(
      -Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      -Math.cos(this.yaw) * Math.cos(this.pitch)
    ).normalize();
  }

  getPlanarForwardVector() {
    return new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)).normalize();
  }

  getPlanarRightVector() {
    return new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw)).normalize();
  }
}
