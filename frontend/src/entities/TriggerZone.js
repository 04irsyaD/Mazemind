import * as THREE from 'three';
import { CONSTANTS } from '../core/Constants.js';

export class TriggerZone {
  constructor(scene, eventBus, config) {
    this.scene = scene;
    this.eventBus = eventBus;
    this.type = 'trigger';
    this.id = config.id;
    this.radius = config.radius ?? CONSTANTS.CELL_SIZE * 0.55;
    this.triggered = false;
    this.requiresCheckpointInactive = config.requiresCheckpointInactive ?? false;
    this.gridPos = { x: config.x, y: config.y };
    this.group = new THREE.Group();
    this.group.position.set(config.x * CONSTANTS.CELL_SIZE, config.height ?? 0, config.y * CONSTANTS.CELL_SIZE);

    const markerGeo = new THREE.RingGeometry(this.radius * 0.55, this.radius, 24);
    const markerMat = new THREE.MeshBasicMaterial({
      color: CONSTANTS.COLORS.TRIGGER,
      transparent: true,
      opacity: config.opacity ?? 0.08,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    this.marker = new THREE.Mesh(markerGeo, markerMat);
    this.marker.rotation.x = -Math.PI / 2;
    this.marker.position.y = 0.04;
    this.group.add(this.marker);
    this.scene.add(this.group);
  }

  update(delta, context) {
    if (context?.isFreeExplore) return;
    if (this.triggered) return;
    if (this.requiresCheckpointInactive && context.checkpointActive) return;

    const distance = Math.hypot(
      context.player.position.x - this.group.position.x,
      context.player.position.z - this.group.position.z
    );

    if (distance <= this.radius) {
      this.triggered = true;
      this.marker.material.opacity = 0.45;
      this.eventBus.emit(CONSTANTS.EVENTS.TRIGGER_ENTERED, { id: this.id });
    }
  }

  reset() {
    this.triggered = false;
  }

  dispose() {
    this.scene.remove(this.group);
    this.group.traverse(child => {
      child.geometry?.dispose?.();
      child.material?.dispose?.();
    });
  }
}
