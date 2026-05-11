import * as THREE from 'three';
import { CONSTANTS } from '../core/Constants.js';

export class Checkpoint {
  constructor(scene, eventBus, config) {
    this.scene = scene;
    this.eventBus = eventBus;
    this.type = 'checkpoint';
    this.id = config.id;
    this.radius = config.radius ?? CONSTANTS.CELL_SIZE * 0.6;
    this.activated = false;
    this.group = new THREE.Group();
    this.group.position.set(config.x * CONSTANTS.CELL_SIZE, 0, config.y * CONSTANTS.CELL_SIZE);

    this.material = new THREE.MeshStandardMaterial({
      color: CONSTANTS.COLORS.CHECKPOINT_INACTIVE,
      emissive: CONSTANTS.COLORS.CHECKPOINT_INACTIVE,
      emissiveIntensity: 0.25,
      transparent: true,
      opacity: 0.85,
    });

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 0.95, 0.18, 24),
      this.material
    );
    base.position.y = 0.09;
    this.group.add(base);

    const beacon = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.35),
      this.material
    );
    beacon.position.y = 1;
    this.beacon = beacon;
    this.group.add(beacon);

    this.light = new THREE.PointLight(CONSTANTS.COLORS.CHECKPOINT_INACTIVE, 0.7, 4);
    this.light.position.y = 1.1;
    this.group.add(this.light);

    this.time = 0;
    this.scene.add(this.group);
  }

  update(delta, context) {
    this.time += delta;
    this.beacon.rotation.y += delta * 2;
    this.beacon.position.y = 1 + Math.sin(this.time * 3) * 0.15;

    if (this.activated) return;

    const distance = Math.hypot(
      context.player.position.x - this.group.position.x,
      context.player.position.z - this.group.position.z
    );

    if (distance <= this.radius) {
      this.activate();
    }
  }

  activate() {
    this.activated = true;
    this.material.color.setHex(CONSTANTS.COLORS.CHECKPOINT_ACTIVE);
    this.material.emissive.setHex(CONSTANTS.COLORS.CHECKPOINT_ACTIVE);
    this.material.emissiveIntensity = 0.8;
    this.light.color.setHex(CONSTANTS.COLORS.CHECKPOINT_ACTIVE);
    this.light.intensity = 1.2;
    this.eventBus.emit(CONSTANTS.EVENTS.CHECKPOINT_ACTIVATED, { id: this.id });
  }

  dispose() {
    this.scene.remove(this.group);
    this.group.traverse(child => {
      child.geometry?.dispose?.();
      child.material?.dispose?.();
    });
  }
}
