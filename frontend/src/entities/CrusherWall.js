import * as THREE from 'three';
import { CONSTANTS } from '../core/Constants.js';

export class CrusherWall {
  constructor(scene, eventBus, config) {
    this.scene = scene;
    this.eventBus = eventBus;
    this.type = 'crusher';
    this.id = config.id;
    this.triggerId = config.triggerId;
    this.delay = config.delay ?? 1.1;
    this.speed = config.speed ?? 4;
    this.killRadius = config.killRadius ?? CONSTANTS.CELL_SIZE * 0.65;
    this.state = 'dormant';
    this.timer = 0;

    this.start = new THREE.Vector3(config.start.x * CONSTANTS.CELL_SIZE, CONSTANTS.CELL_SIZE / 2, config.start.y * CONSTANTS.CELL_SIZE);
    this.end = new THREE.Vector3(config.end.x * CONSTANTS.CELL_SIZE, CONSTANTS.CELL_SIZE / 2, config.end.y * CONSTANTS.CELL_SIZE);
    this.direction = this.end.clone().sub(this.start).normalize();
    this.distance = this.start.distanceTo(this.end);
    this.travelled = 0;

    this.material = new THREE.MeshStandardMaterial({
      color: CONSTANTS.COLORS.CRUSHER,
      emissive: 0x000000,
      roughness: 0.65,
      metalness: 0.35,
    });

    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(CONSTANTS.CELL_SIZE * 0.9, CONSTANTS.CELL_SIZE * 1.25, CONSTANTS.CELL_SIZE * 0.9),
      this.material
    );
    this.mesh.position.copy(this.start);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.scene.add(this.mesh);

    this.unsubTrigger = this.eventBus.on(CONSTANTS.EVENTS.TRIGGER_ENTERED, ({ id }) => {
      if (id === this.triggerId) {
        this.beginWarning();
      }
    });

    this.unsubCheckpoint = this.eventBus.on(CONSTANTS.EVENTS.CHECKPOINT_ACTIVATED, () => {
      this.disarm();
    });

    if (CONSTANTS.DEV_MODE) {
      const points = [
        new THREE.Vector3(this.start.x, 0.08, this.start.z),
        new THREE.Vector3(this.end.x, 0.08, this.end.z)
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: CONSTANTS.COLORS.WARNING });
      this.debugPath = new THREE.Line(geometry, material);
      this.scene.add(this.debugPath);
    }
  }

  beginWarning() {
    if (this.state !== 'dormant') return;

    this.state = 'warning';
    this.timer = 0;
    this.eventBus.emit(CONSTANTS.EVENTS.CRUSHER_WARNING, { id: this.id });
  }

  update(delta, context) {
    if (this.state === 'disarmed') return;

    if (this.state === 'warning') {
      this.timer += delta;
      const pulse = 0.35 + Math.sin(this.timer * 16) * 0.25;
      this.material.emissive.setHex(CONSTANTS.COLORS.WARNING);
      this.material.emissiveIntensity = pulse;

      if (this.timer >= this.delay) {
        this.state = 'moving';
        this.eventBus.emit(CONSTANTS.EVENTS.CRUSHER_ACTIVATED, { id: this.id });
      }
    }

    if (this.state === 'moving') {
      const step = this.speed * delta;
      this.travelled = Math.min(this.distance, this.travelled + step);
      this.mesh.position.copy(this.start).addScaledVector(this.direction, this.travelled);

      if (this.mesh.position.distanceTo(context.player.position) <= this.killRadius) {
        this.eventBus.emit(CONSTANTS.EVENTS.PLAYER_KILLED, {
          reason: 'crusher',
          taunt: 'Terlalu cepat masuk jalur akhir? Dindingnya juga ikut cepat.',
        });
      }

      if (this.travelled >= this.distance) {
        this.state = 'finished';
        this.material.emissiveIntensity = 0;
      }
    }
  }

  dispose() {
    this.unsubTrigger?.();
    this.unsubCheckpoint?.();
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();

    if (this.debugPath) {
      this.scene.remove(this.debugPath);
      this.debugPath.geometry.dispose();
      this.debugPath.material.dispose();
    }
  }

  disarm() {
    if (this.state === 'moving' || this.state === 'finished') return;

    this.state = 'disarmed';
    this.material.color.setHex(0x2d7d68);
    this.material.emissive.setHex(CONSTANTS.COLORS.CHECKPOINT_ACTIVE);
    this.material.emissiveIntensity = 0.18;
  }
}
