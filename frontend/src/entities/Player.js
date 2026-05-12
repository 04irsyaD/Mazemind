import * as THREE from 'three';
import { CONSTANTS } from '../core/Constants.js';

export class Player {
  constructor(scene) {
    this.scene = scene;
    
    // Geometric shape for player
    const geometry = new THREE.CapsuleGeometry(0.36, 0.62, 4, 8);
    const material = new THREE.MeshStandardMaterial({
      color: CONSTANTS.COLORS.PLAYER,
      emissive: CONSTANTS.COLORS.PLAYER_EMISSIVE,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.8
    });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.visible = CONSTANTS.DEV_MODE;
    this.scene.add(this.mesh);

    // Kept as an optional diagnostic handle, but disabled for the intended lonely office lighting.
    this.light = new THREE.PointLight(CONSTANTS.COLORS.PLAYER, 0, 10);
    this.scene.add(this.light);

    // State
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.desiredVelocity = new THREE.Vector3();
    this.lastMove = new THREE.Vector3();
    this.bobTime = 0;
    this.invulnerableTimer = 0;
    this.type = 'player';
  }

  setPosition(gridX, gridY, floorHeight = 0) {
    this.position.set(
      gridX * CONSTANTS.CELL_SIZE,
      floorHeight,
      gridY * CONSTANTS.CELL_SIZE
    );
    this.mesh.position.copy(this.position);
    this.light.position.set(this.position.x, this.position.y + CONSTANTS.PLAYER_EYE_HEIGHT, this.position.z);
  }

  update(delta, inputVector, collisionSystem, yaw = 0) {
    const cappedDelta = Math.min(delta, CONSTANTS.MAX_DELTA);
    this.invulnerableTimer = Math.max(0, this.invulnerableTimer - delta);
    this.mesh.material.opacity = this.isInvulnerable() ? 0.55 + Math.sin(this.invulnerableTimer * 24) * 0.2 : 1;
    this.mesh.material.transparent = this.isInvulnerable();

    const cos = Math.cos(yaw);
    const sin = Math.sin(yaw);
    const worldX = inputVector.x * cos + inputVector.z * sin;
    const worldZ = -inputVector.x * sin + inputVector.z * cos;
    const hasInput = inputVector.x !== 0 || inputVector.z !== 0;
    const speed = CONSTANTS.PLAYER_SPEED;

    this.desiredVelocity.set(
      hasInput ? worldX * speed : 0,
      0,
      hasInput ? worldZ * speed : 0
    );

    const smoothing = hasInput ? CONSTANTS.PLAYER_ACCELERATION : CONSTANTS.PLAYER_DECELERATION;
    const blend = 1 - Math.exp(-smoothing * cappedDelta);
    this.velocity.lerp(this.desiredVelocity, blend);

    if (!hasInput && this.velocity.lengthSq() < CONSTANTS.PLAYER_STOP_EPSILON * CONSTANTS.PLAYER_STOP_EPSILON) {
      this.velocity.set(0, 0, 0);
    }

    this.lastMove.copy(this.velocity).multiplyScalar(cappedDelta);
    const movement = collisionSystem.moveWithCollision
      ? collisionSystem.moveWithCollision(this.position, this.lastMove, CONSTANTS.PLAYER_COLLISION_RADIUS)
      : { position: this.position.clone().add(this.lastMove), collidedX: false, collidedZ: false };

    this.position.copy(movement.position);
    this.position.y = collisionSystem.getFloorHeightAt?.(this.position.x, this.position.z) ?? this.position.y;

    if (movement.collidedX) this.velocity.x = 0;
    if (movement.collidedZ) this.velocity.z = 0;

    // Update mesh position
    this.mesh.position.x = this.position.x;
    this.mesh.position.y = this.position.y;
    this.mesh.position.z = this.position.z;
    this.light.position.set(this.position.x, this.position.y + CONSTANTS.PLAYER_EYE_HEIGHT, this.position.z);

    // Bobbing animation
    if (this.velocity.lengthSq() > 0.02) {
      this.bobTime += cappedDelta * 8;
    } else {
      this.bobTime = 0;
    }
    this.mesh.position.y = this.position.y;

    // Rotate player to face movement direction
    if (this.velocity.lengthSq() > 0.01) {
      const angle = Math.atan2(worldX, worldZ);
      this.mesh.rotation.y = THREE.MathUtils.lerp(this.mesh.rotation.y, angle, 0.2);
    }
  }

  respawnAt(worldPosition) {
    this.position.copy(worldPosition);
    this.position.y = worldPosition.y ?? 0;
    this.mesh.position.copy(worldPosition);
    this.mesh.position.y = this.position.y;
    this.light.position.set(this.position.x, this.position.y + CONSTANTS.PLAYER_EYE_HEIGHT, this.position.z);
    this.velocity.set(0, 0, 0);
    this.desiredVelocity.set(0, 0, 0);
    this.invulnerableTimer = 1.25;
    this.bobTime = 0;
  }

  isInvulnerable() {
    return this.invulnerableTimer > 0;
  }
}
