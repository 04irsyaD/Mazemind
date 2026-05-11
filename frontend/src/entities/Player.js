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

    // Add a point light to the player
    this.light = new THREE.PointLight(CONSTANTS.COLORS.PLAYER, 0.58, 10);
    this.scene.add(this.light);

    // State
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.bobTime = 0;
    this.invulnerableTimer = 0;
    this.type = 'player';
  }

  setPosition(gridX, gridY) {
    this.position.set(
      gridX * CONSTANTS.CELL_SIZE,
      0,
      gridY * CONSTANTS.CELL_SIZE
    );
    this.mesh.position.copy(this.position);
    this.light.position.set(this.position.x, CONSTANTS.PLAYER_EYE_HEIGHT, this.position.z);
  }

  update(delta, inputVector, collisionSystem, yaw = 0) {
    this.invulnerableTimer = Math.max(0, this.invulnerableTimer - delta);
    this.mesh.material.opacity = this.isInvulnerable() ? 0.55 + Math.sin(this.invulnerableTimer * 24) * 0.2 : 1;
    this.mesh.material.transparent = this.isInvulnerable();

    if (inputVector.x === 0 && inputVector.z === 0) {
      // Idle
      this.bobTime = 0;
      this.mesh.position.y = THREE.MathUtils.lerp(this.mesh.position.y, 0, 0.1);
      return;
    }

    // Calculate intended movement
    const moveSpeed = CONSTANTS.PLAYER_SPEED * delta;
    const cos = Math.cos(yaw);
    const sin = Math.sin(yaw);
    const worldX = inputVector.x * cos + inputVector.z * sin;
    const worldZ = -inputVector.x * sin + inputVector.z * cos;
    const dx = worldX * moveSpeed;
    const dz = worldZ * moveSpeed;

    // Check collision before moving
    const currentX = this.position.x;
    const currentZ = this.position.z;
    
    // Try moving X
    const nextX = currentX + dx;
    const nextZ = currentZ + dz;

    let canMoveX = collisionSystem.canMoveTo(nextX, currentZ);
    // Try moving Z
    let canMoveZ = collisionSystem.canMoveTo(this.position.x, nextZ);

    if (canMoveX) this.position.x += dx;
    if (canMoveZ) this.position.z += dz;

    // Update mesh position
    this.mesh.position.x = this.position.x;
    this.mesh.position.z = this.position.z;
    this.light.position.set(this.position.x, CONSTANTS.PLAYER_EYE_HEIGHT, this.position.z);

    // Bobbing animation
    this.bobTime += delta * 15;
    this.mesh.position.y = 0;

    // Rotate player to face movement direction
    if (canMoveX || canMoveZ) {
      const angle = Math.atan2(worldX, worldZ);
      this.mesh.rotation.y = THREE.MathUtils.lerp(this.mesh.rotation.y, angle, 0.2);
    }
  }

  respawnAt(worldPosition) {
    this.position.copy(worldPosition);
    this.position.y = 0;
    this.mesh.position.copy(worldPosition);
    this.mesh.position.y = 0;
    this.light.position.set(this.position.x, CONSTANTS.PLAYER_EYE_HEIGHT, this.position.z);
    this.invulnerableTimer = 1.25;
    this.bobTime = 0;
  }

  isInvulnerable() {
    return this.invulnerableTimer > 0;
  }
}
