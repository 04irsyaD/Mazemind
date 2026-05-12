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

    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x2f3a3b,
      emissive: 0x020505,
      roughness: 0.62,
      metalness: 0.18
    });

    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x253a32,
      emissive: CONSTANTS.COLORS.GOAL,
      emissiveIntensity: 0.12,
      roughness: 0.66,
      metalness: 0.12
    });

    this.platform = new THREE.Mesh(
      new THREE.BoxGeometry(CONSTANTS.CELL_SIZE * 1.25, 0.06, CONSTANTS.CELL_SIZE * 0.62),
      new THREE.MeshStandardMaterial({
        color: 0x1c2d26,
        emissive: CONSTANTS.COLORS.GOAL,
        emissiveIntensity: 0.12,
        transparent: true,
        opacity: 0.8,
        roughness: 0.72
      })
    );
    this.platform.position.y = 0.03;
    this.group.add(this.platform);

    const door = new THREE.Mesh(
      new THREE.BoxGeometry(CONSTANTS.CELL_SIZE * 0.9, 2.25, 0.16),
      doorMat
    );
    door.position.set(0, 1.12, CONSTANTS.CELL_SIZE * 0.34);
    door.castShadow = true;
    door.receiveShadow = true;
    this.group.add(door);

    this.panel = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.32, 0.05),
      new THREE.MeshStandardMaterial({
        color: CONSTANTS.COLORS.GOAL,
        emissive: CONSTANTS.COLORS.GOAL,
        emissiveIntensity: 0.7,
        roughness: 0.25,
        metalness: 0.04
      })
    );
    this.panel.position.set(CONSTANTS.CELL_SIZE * 0.34, 1.1, CONSTANTS.CELL_SIZE * 0.24);
    this.group.add(this.panel);

    for (const x of [-0.55, 0.55]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.45, 0.2), frameMat);
      post.position.set(x * CONSTANTS.CELL_SIZE, 1.22, CONSTANTS.CELL_SIZE * 0.34);
      post.castShadow = true;
      this.group.add(post);
    }

    const lintel = new THREE.Mesh(new THREE.BoxGeometry(CONSTANTS.CELL_SIZE * 1.3, 0.16, 0.2), frameMat);
    lintel.position.set(0, 2.42, CONSTANTS.CELL_SIZE * 0.34);
    lintel.castShadow = true;
    this.group.add(lintel);

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
    
    // Pulse access strip.
    this.platform.material.emissiveIntensity = 0.5 + Math.sin(this.time * 5) * 0.2;
    this.panel.material.emissiveIntensity = 0.55 + Math.sin(this.time * 4) * 0.25;

    if (!context?.player) return;

    const isTouching = this.checkCollision(context.player.position.x, context.player.position.z);
    const isUnlocked = !this.requiresAllCheckpoints || context.progressionSystem?.canCompleteFinalExit(this.id) || context.gameManager?.hasAllCheckpoints();
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
      taunt: 'PUBLIC EXIT DENIED. TRANSFER INCOMPLETE.'
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
    this.panel.material.color.setHex(color);
    this.panel.material.emissive.setHex(color);
  }

  dispose() {
    this.scene.remove(this.group);
    this.group.traverse(child => {
      child.geometry?.dispose?.();
      child.material?.dispose?.();
    });
  }
}
