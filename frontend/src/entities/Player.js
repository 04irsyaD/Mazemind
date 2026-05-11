import * as THREE from 'three';
import { CONSTANTS } from '../core/Constants.js';

export class Player {
  constructor(scene) {
    this.scene = scene;
    
    // Geometric shape for player
    const geometry = new THREE.CapsuleGeometry(0.4, 0.6, 4, 8);
    const material = new THREE.MeshStandardMaterial({
      color: CONSTANTS.COLORS.PLAYER,
      emissive: CONSTANTS.COLORS.PLAYER_EMISSIVE,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.8
    });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.scene.add(this.mesh);

    // Add a point light to the player
    this.light = new THREE.PointLight(CONSTANTS.COLORS.PLAYER, 1, 5);
    this.mesh.add(this.light);

    // State
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.bobTime = 0;
    this.type = 'player';
  }

  setPosition(gridX, gridY) {
    this.position.set(
      gridX * CONSTANTS.CELL_SIZE,
      0.8, // Half height of capsule + offset
      gridY * CONSTANTS.CELL_SIZE
    );
    this.mesh.position.copy(this.position);
  }

  update(delta, inputVector, collisionSystem) {
    if (inputVector.x === 0 && inputVector.z === 0) {
      // Idle
      this.bobTime = 0;
      this.mesh.position.y = THREE.MathUtils.lerp(this.mesh.position.y, 0.8, 0.1);
      return;
    }

    // Calculate intended movement
    const moveSpeed = CONSTANTS.PLAYER_SPEED * delta;
    const dx = inputVector.x * moveSpeed;
    const dz = inputVector.z * moveSpeed;

    // Check collision before moving
    const currentX = this.position.x;
    const currentZ = this.position.z;
    
    // Try moving X
    let canMoveX = collisionSystem.canMoveTo(currentX + dx, currentZ);
    // Try moving Z
    let canMoveZ = collisionSystem.canMoveTo(currentX, currentZ + dz);

    if (canMoveX) this.position.x += dx;
    if (canMoveZ) this.position.z += dz;

    // Update mesh position
    this.mesh.position.x = this.position.x;
    this.mesh.position.z = this.position.z;

    // Bobbing animation
    this.bobTime += delta * 15;
    this.mesh.position.y = 0.8 + Math.abs(Math.sin(this.bobTime)) * 0.15;

    // Rotate player to face movement direction
    if (canMoveX || canMoveZ) {
      const angle = Math.atan2(inputVector.x, inputVector.z);
      this.mesh.rotation.y = THREE.MathUtils.lerp(this.mesh.rotation.y, angle, 0.2);
    }
  }
}
