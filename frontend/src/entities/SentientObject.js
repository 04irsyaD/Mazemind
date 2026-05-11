import * as THREE from 'three';
import { CONSTANTS } from '../core/Constants.js';

export class SentientObject {
  constructor(scene, eventBus, config) {
    this.scene = scene;
    this.eventBus = eventBus;
    this.type = 'sentient-object';
    this.id = config.id;
    this.kind = config.kind ?? 'chair';
    this.triggerRadius = config.triggerRadius ?? 5;
    this.attackRadius = config.attackRadius ?? 2;
    this.collisionRadius = config.collisionRadius ?? 0.75;
    this.attackSpeed = config.attackSpeed ?? 4.5;
    this.returnSpeed = config.returnSpeed ?? 5;
    this.shakeIntensity = config.shakeIntensity ?? 0.12;
    this.time = Math.random() * Math.PI * 2;
    this.state = 'idle';
    this.hasKilledDuringAttack = false;

    this.group = this.createMeshGroup(this.kind);
    this.group.position.set(config.x * CONSTANTS.CELL_SIZE, 0, config.y * CONSTANTS.CELL_SIZE);
    this.group.rotation.y = config.rotation ?? 0;
    this.scene.add(this.group);

    // Capture the authored transform once. This lets hundreds of objects return home
    // without manually wiring separate "original position" markers.
    this.originalPosition = this.group.position.clone();
    this.originalRotation = this.group.rotation.clone();
    this.attackTarget = new THREE.Vector3();
  }

  update(delta, context) {
    if (!context?.player) return;

    this.time += delta;
    const playerPosition = context.player.position;
    const distanceToPlayer = this.group.position.distanceTo(playerPosition);
    const distanceFromHome = this.group.position.distanceTo(this.originalPosition);

    if (distanceToPlayer > this.triggerRadius || distanceFromHome > this.triggerRadius * 1.4) {
      this.state = 'returning';
      this.hasKilledDuringAttack = false;
      this.returnHome(delta);
      return;
    }

    if (distanceToPlayer <= this.attackRadius) {
      this.state = 'attacking';
      this.attackPlayer(delta, playerPosition, context.player);
      return;
    }

    this.state = 'warning';
    this.hasKilledDuringAttack = false;
    this.shake(delta);
  }

  attackPlayer(delta, playerPosition, player) {
    this.attackTarget.copy(playerPosition);
    const direction = this.attackTarget.sub(this.group.position);
    direction.y = 0;

    if (direction.lengthSq() > 0.0001) {
      direction.normalize();
      this.group.position.addScaledVector(direction, this.attackSpeed * delta);
      this.group.rotation.y += delta * 8;
    }

    this.setAlertMaterial(true);

    // Only moving furniture kills. Idle/warning furniture is readable pressure, not unfair damage.
    if (!player.isInvulnerable() && !this.hasKilledDuringAttack && this.group.position.distanceTo(player.position) <= this.collisionRadius) {
      this.hasKilledDuringAttack = true;
      this.eventBus.emit(CONSTANTS.EVENTS.PLAYER_KILLED, {
        reason: 'sentient-object',
        respawn: true,
        taunt: `${this.getDisplayName()} knocked you back to your last checkpoint.`,
      });
    }
  }

  shake(delta) {
    const shakeX = Math.sin(this.time * 42) * this.shakeIntensity;
    const shakeZ = Math.cos(this.time * 37) * this.shakeIntensity;
    this.group.position.x = THREE.MathUtils.lerp(this.group.position.x, this.originalPosition.x + shakeX, 10 * delta);
    this.group.position.z = THREE.MathUtils.lerp(this.group.position.z, this.originalPosition.z + shakeZ, 10 * delta);
    this.group.rotation.y = this.originalRotation.y + Math.sin(this.time * 30) * 0.08;
    this.setAlertMaterial(true);
  }

  returnHome(delta) {
    this.group.position.lerp(this.originalPosition, Math.min(1, this.returnSpeed * delta));
    this.group.rotation.x = THREE.MathUtils.lerp(this.group.rotation.x, this.originalRotation.x, this.returnSpeed * delta);
    this.group.rotation.y = THREE.MathUtils.lerp(this.group.rotation.y, this.originalRotation.y, this.returnSpeed * delta);
    this.group.rotation.z = THREE.MathUtils.lerp(this.group.rotation.z, this.originalRotation.z, this.returnSpeed * delta);
    this.setAlertMaterial(false);

    if (this.group.position.distanceTo(this.originalPosition) < 0.02) {
      this.state = 'idle';
    }
  }

  createMeshGroup(kind) {
    const group = new THREE.Group();
    if (kind === 'table') return this.createTable(group);
    if (kind === 'dispenser') return this.createDispenser(group);
    return this.createChair(group);
  }

  createChair(group) {
    const material = this.createFurnitureMaterial(0x8d745f);
    const metal = this.createFurnitureMaterial(0x34384f);
    this.addBox(group, [0, 0.42, 0], [0.9, 0.18, 0.85], material);
    this.addBox(group, [0, 0.95, 0.35], [0.9, 0.9, 0.16], material);
    for (const x of [-0.32, 0.32]) {
      for (const z of [-0.28, 0.28]) {
        this.addBox(group, [x, 0.18, z], [0.12, 0.36, 0.12], metal);
      }
    }
    return group;
  }

  createTable(group) {
    const material = this.createFurnitureMaterial(0x6f5644);
    const metal = this.createFurnitureMaterial(0x2f3349);
    this.addBox(group, [0, 0.72, 0], [1.6, 0.18, 1.1], material);
    for (const x of [-0.58, 0.58]) {
      for (const z of [-0.38, 0.38]) {
        this.addBox(group, [x, 0.35, z], [0.14, 0.7, 0.14], metal);
      }
    }
    return group;
  }

  createDispenser(group) {
    const body = this.createFurnitureMaterial(0xd8e7ff);
    const water = new THREE.MeshStandardMaterial({
      color: CONSTANTS.COLORS.OFFICE_GLASS,
      emissive: CONSTANTS.COLORS.OFFICE_GLASS,
      emissiveIntensity: 0.25,
      transparent: true,
      opacity: 0.72,
      roughness: 0.2,
      metalness: 0.05,
    });
    this.addBox(group, [0, 0.55, 0], [0.55, 1.1, 0.5], body);
    const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.2, 0.65, 18), water);
    bottle.position.y = 1.45;
    bottle.castShadow = true;
    group.add(bottle);
    return group;
  }

  addBox(group, position, scale, material) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(scale[0], scale[1], scale[2]), material);
    mesh.position.set(position[0], position[1], position[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }

  createFurnitureMaterial(color) {
    return new THREE.MeshStandardMaterial({
      color,
      emissive: 0x000000,
      roughness: 0.68,
      metalness: 0.12,
    });
  }

  setAlertMaterial(isAlert) {
    this.group.traverse(child => {
      if (child.material?.emissive) {
        child.material.emissive.setHex(isAlert ? CONSTANTS.COLORS.FURNITURE_ALERT : 0x000000);
        child.material.emissiveIntensity = isAlert ? 0.18 : 0;
      }
    });
  }

  getDisplayName() {
    if (this.kind === 'table') return 'A meeting table';
    if (this.kind === 'dispenser') return 'The water dispenser';
    return 'A chair';
  }

  dispose() {
    this.scene.remove(this.group);
    this.group.traverse(child => {
      child.geometry?.dispose?.();
      child.material?.dispose?.();
    });
  }
}
