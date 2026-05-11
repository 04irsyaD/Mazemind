import * as THREE from 'three';
import { CONSTANTS } from '../core/Constants.js';

export class Trap {
  constructor(scene, gridX, gridY) {
    this.scene = scene;
    this.gridPos = { x: gridX, y: gridY };
    this.active = false;
    this.triggered = false;
    
    this.group = new THREE.Group();
    
    const worldX = gridX * CONSTANTS.CELL_SIZE;
    const worldZ = gridY * CONSTANTS.CELL_SIZE;
    this.group.position.set(worldX, 0, worldZ);

    // Subtle floor marker
    const markerGeo = new THREE.PlaneGeometry(CONSTANTS.CELL_SIZE * 0.8, CONSTANTS.CELL_SIZE * 0.8);
    const markerMat = new THREE.MeshStandardMaterial({
      color: CONSTANTS.COLORS.TRAP,
      transparent: true,
      opacity: 0.3, // very subtle
      depthWrite: false
    });
    this.marker = new THREE.Mesh(markerGeo, markerMat);
    this.marker.rotation.x = -Math.PI / 2;
    this.marker.position.y = 0.02; // slightly above floor
    this.group.add(this.marker);

    // Spikes (hidden initially)
    this.spikes = new THREE.Group();
    const spikeGeo = new THREE.ConeGeometry(0.1, 0.8, 4);
    const spikeMat = new THREE.MeshStandardMaterial({ 
      color: 0x888888,
      metalness: 0.8,
      roughness: 0.2
    });

    // Create 5 spikes
    const positions = [
      [0, 0], [0.3, 0.3], [-0.3, 0.3], [0.3, -0.3], [-0.3, -0.3]
    ];

    positions.forEach(pos => {
      const spike = new THREE.Mesh(spikeGeo, spikeMat);
      spike.position.set(pos[0], -0.4, pos[1]); // Hidden below floor
      this.spikes.add(spike);
    });

    this.group.add(this.spikes);
    
    // Light (hidden)
    this.light = new THREE.PointLight(CONSTANTS.COLORS.TRAP, 0, 3);
    this.light.position.y = 0.5;
    this.group.add(this.light);

    this.scene.add(this.group);
    this.type = 'trap';
  }

  update(delta) {
    if (this.triggered) {
      // Animate spikes up
      this.spikes.children.forEach(spike => {
        spike.position.y = THREE.MathUtils.lerp(spike.position.y, 0.4, 15 * delta);
      });
      this.marker.material.opacity = 0.8;
      this.light.intensity = 2;
    }
  }

  checkCollision(playerWorldX, playerWorldZ) {
    if (this.triggered) return false; // Already triggered

    const worldX = this.gridPos.x * CONSTANTS.CELL_SIZE;
    const worldZ = this.gridPos.y * CONSTANTS.CELL_SIZE;
    
    const dist = Math.hypot(playerWorldX - worldX, playerWorldZ - worldZ);
    if (dist < CONSTANTS.CELL_SIZE * 0.4) {
      this.trigger();
      return true; // Hit!
    }
    return false;
  }

  trigger() {
    this.triggered = true;
  }

  dispose() {
    this.scene.remove(this.group);
    this.group.traverse(child => {
      child.geometry?.dispose?.();
      child.material?.dispose?.();
    });
  }
}
