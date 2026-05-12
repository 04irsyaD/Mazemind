import * as THREE from 'three';
import { CONSTANTS } from '../core/Constants.js';

export class Checkpoint {
  constructor(scene, eventBus, config) {
    this.scene = scene;
    this.eventBus = eventBus;
    this.type = 'checkpoint';
    this.id = config.id;
    this.label = config.label ?? config.id;
    this.radius = config.radius ?? CONSTANTS.CELL_SIZE * 0.6;
    this.activated = false;
    this.group = new THREE.Group();
    this.group.position.set(config.x * CONSTANTS.CELL_SIZE, config.height ?? 0, config.y * CONSTANTS.CELL_SIZE);

    this.material = new THREE.MeshStandardMaterial({
      color: CONSTANTS.COLORS.CHECKPOINT_INACTIVE,
      emissive: CONSTANTS.COLORS.CHECKPOINT_INACTIVE,
      emissiveIntensity: 0.25,
      transparent: true,
      opacity: 0.85,
    });

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.78, 0.9, 0.08, 24),
      this.material
    );
    base.position.y = 0.04;
    this.group.add(base);

    const consoleMat = new THREE.MeshStandardMaterial({
      color: 0x303941,
      roughness: 0.58,
      metalness: 0.14
    });

    const console = new THREE.Mesh(
      new THREE.BoxGeometry(0.84, 0.92, 0.48),
      consoleMat
    );
    console.position.y = 0.5;
    console.castShadow = true;
    console.receiveShadow = true;
    this.group.add(console);

    const screen = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.36, 0.06),
      this.material
    );
    screen.position.set(0, 0.98, -0.25);
    screen.rotation.x = -0.18;
    this.screen = screen;
    this.group.add(screen);

    this.light = new THREE.PointLight(CONSTANTS.COLORS.CHECKPOINT_INACTIVE, 0.7, 4);
    this.light.position.y = 1.1;
    this.group.add(this.light);

    this.time = 0;
    this.scene.add(this.group);
  }

  update(delta, context) {
    this.time += delta;
    this.screen.material.emissiveIntensity = (this.activated ? 0.7 : 0.24) + Math.sin(this.time * 2.8) * 0.08;

    if (context?.isFreeExplore) return;
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
    this.eventBus.emit(CONSTANTS.EVENTS.CHECKPOINT_ACTIVATED, {
      id: this.id,
      label: this.label,
      respawnPoint: new THREE.Vector3(this.group.position.x, this.group.position.y, this.group.position.z),
    });
  }

  dispose() {
    this.scene.remove(this.group);
    this.group.traverse(child => {
      child.geometry?.dispose?.();
      child.material?.dispose?.();
    });
  }
}
