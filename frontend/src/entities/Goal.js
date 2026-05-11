import * as THREE from 'three';
import { CONSTANTS } from '../core/Constants.js';

export class Goal {
  constructor(scene, gridX, gridY) {
    this.scene = scene;
    this.gridPos = { x: gridX, y: gridY };
    
    this.group = new THREE.Group();
    
    const worldX = gridX * CONSTANTS.CELL_SIZE;
    const worldZ = gridY * CONSTANTS.CELL_SIZE;
    this.group.position.set(worldX, 0, worldZ);

    // Goal indicator (glowing platform)
    const platformGeo = new THREE.BoxGeometry(CONSTANTS.CELL_SIZE * 0.8, 0.1, CONSTANTS.CELL_SIZE * 0.8);
    const platformMat = new THREE.MeshStandardMaterial({
      color: CONSTANTS.COLORS.GOAL,
      emissive: CONSTANTS.COLORS.GOAL,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8
    });
    this.platform = new THREE.Mesh(platformGeo, platformMat);
    this.platform.position.y = 0.05;
    this.group.add(this.platform);

    // Floating gem
    const gemGeo = new THREE.OctahedronGeometry(0.3);
    const gemMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: CONSTANTS.COLORS.GOAL,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.9
    });
    this.gem = new THREE.Mesh(gemGeo, gemMat);
    this.gem.position.y = 1;
    this.gem.castShadow = true;
    this.group.add(this.gem);

    // Light
    const light = new THREE.PointLight(CONSTANTS.COLORS.GOAL, 1, 4);
    light.position.y = 1;
    this.group.add(light);

    this.scene.add(this.group);
    this.time = 0;
    this.type = 'goal';
  }

  update(delta) {
    this.time += delta;
    // Rotate and bob gem
    this.gem.rotation.y += delta * 2;
    this.gem.position.y = 1 + Math.sin(this.time * 3) * 0.2;
    
    // Pulse platform
    this.platform.material.emissiveIntensity = 0.5 + Math.sin(this.time * 5) * 0.2;
  }

  checkCollision(playerWorldX, playerWorldZ) {
    const worldX = this.gridPos.x * CONSTANTS.CELL_SIZE;
    const worldZ = this.gridPos.y * CONSTANTS.CELL_SIZE;
    
    const dist = Math.hypot(playerWorldX - worldX, playerWorldZ - worldZ);
    return dist < CONSTANTS.CELL_SIZE * 0.6; // Trigger distance
  }

  dispose() {
    this.scene.remove(this.group);
    this.group.traverse(child => {
      child.geometry?.dispose?.();
      child.material?.dispose?.();
    });
  }
}
