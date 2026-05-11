import * as THREE from 'three';
import { CONSTANTS } from '../core/Constants.js';

export class Goal {
  constructor(scene, gridX, gridY, eventBus = null, config = {}) {
    this.scene = scene;
    this.eventBus = eventBus;
    this.gridPos = { x: gridX, y: gridY };
    this.id = config.id ?? 'goal';
    this.requiresCheckpoint = config.requiresCheckpoint ?? config.requiresAllCheckpoints ?? true;
    this.requiresAllCheckpoints = config.requiresAllCheckpoints ?? this.requiresCheckpoint;
    this.lockTriggerId = config.lockTriggerId ?? null;
    this.contacting = false;
    
    this.group = new THREE.Group();
    
    const worldX = gridX * CONSTANTS.CELL_SIZE;
    const worldZ = gridY * CONSTANTS.CELL_SIZE;
    this.group.position.set(worldX, config.height ?? 0, worldZ);

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
    this.setLockedVisual(this.requiresCheckpoint);
  }

  update(delta, context = null) {
    this.time += delta;
    // Rotate and bob gem
    this.gem.rotation.y += delta * 2;
    this.gem.position.y = 1 + Math.sin(this.time * 3) * 0.2;
    
    // Pulse platform
    this.platform.material.emissiveIntensity = 0.5 + Math.sin(this.time * 5) * 0.2;

    if (!context?.player) return;

    const isTouching = this.checkCollision(context.player.position.x, context.player.position.z);
    const isUnlocked = !this.requiresAllCheckpoints || context.gameManager?.hasAllCheckpoints();
    this.setLockedVisual(!isUnlocked);

    if (context.isFreeExplore) {
      this.contacting = false;
      return;
    }

    if (!isTouching) {
      this.contacting = false;
      return;
    }

    if (this.contacting) return;
    this.contacting = true;

    if (isUnlocked) {
      this.eventBus?.emit(CONSTANTS.EVENTS.GOAL_REACHED, { id: this.id });
      return;
    }

    this.eventBus?.emit(CONSTANTS.EVENTS.GOAL_LOCKED, {
      id: this.id,
      triggerId: this.lockTriggerId,
      taunt: 'Exit masih terkunci. Amankan semua ruangan dulu.'
    });
  }

  checkCollision(playerWorldX, playerWorldZ) {
    const worldX = this.gridPos.x * CONSTANTS.CELL_SIZE;
    const worldZ = this.gridPos.y * CONSTANTS.CELL_SIZE;
    
    const dist = Math.hypot(playerWorldX - worldX, playerWorldZ - worldZ);
    return dist < CONSTANTS.CELL_SIZE * 0.6; // Trigger distance
  }

  setLockedVisual(isLocked) {
    const color = isLocked ? CONSTANTS.COLORS.GOAL_LOCKED : CONSTANTS.COLORS.GOAL;
    this.platform.material.color.setHex(color);
    this.platform.material.emissive.setHex(color);
    this.gem.material.emissive.setHex(color);
  }

  dispose() {
    this.scene.remove(this.group);
    this.group.traverse(child => {
      child.geometry?.dispose?.();
      child.material?.dispose?.();
    });
  }
}
