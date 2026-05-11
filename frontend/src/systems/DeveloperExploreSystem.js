import * as THREE from 'three';
import { CONSTANTS } from '../core/Constants.js';

export class DeveloperExploreSystem {
  constructor(scene) {
    this.scene = scene;
    this.debugGroup = new THREE.Group();
    this.scene.add(this.debugGroup);

    this.debugVisible = true;
    this.flyMode = false;
    this.collisionEnabled = true;
    this.crushersVisible = true;
    this.freeFlyPosition = new THREE.Vector3();
    this.mapData = null;
    this.entityManager = null;
  }

  reset(mapData, entityManager) {
    this.mapData = mapData;
    this.entityManager = entityManager;
    this.debugVisible = true;
    this.flyMode = false;
    this.collisionEnabled = true;
    this.crushersVisible = true;
    this.clearDebugHelpers();
    this.createDebugHelpers(mapData);
    this.setDebugVisibility(true);
    this.setCrushersVisible(true);
  }

  update(delta, inputManager, cameraSystem, player, uiManager) {
    if (inputManager.wasKeyPressed('F1')) this.setDebugVisibility(!this.debugVisible);
    if (inputManager.wasKeyPressed('F2')) this.setFlyMode(!this.flyMode, cameraSystem, player);
    if (inputManager.wasKeyPressed('F3')) this.collisionEnabled = !this.collisionEnabled;
    if (inputManager.wasKeyPressed('F4')) this.setCrushersVisible(!this.crushersVisible);
    if (inputManager.wasKeyPressed('KeyR')) this.teleportToStart(player, cameraSystem);

    this.handleTeleportKeys(inputManager, player, cameraSystem);

    if (this.flyMode) {
      this.updateFlyCamera(delta, inputManager, cameraSystem, player);
    }

    uiManager.updateDebugPanel(this.getState());
  }

  getState() {
    return {
      debugVisible: this.debugVisible,
      flyMode: this.flyMode,
      collisionEnabled: this.collisionEnabled,
      crushersVisible: this.crushersVisible
    };
  }

  getCollisionSystem(collisionSystem) {
    if (this.collisionEnabled) return collisionSystem;
    return { canMoveTo: () => true };
  }

  setFlyMode(isEnabled, cameraSystem, player) {
    this.flyMode = isEnabled;

    if (isEnabled) {
      this.freeFlyPosition.set(
        player.position.x,
        CONSTANTS.PLAYER_EYE_HEIGHT,
        player.position.z
      );
      cameraSystem.updateFreeFly(this.freeFlyPosition);
      return;
    }

    player.respawnAt(new THREE.Vector3(
      cameraSystem.camera.position.x,
      0,
      cameraSystem.camera.position.z
    ));
    cameraSystem.snap(player.position);
  }

  updateFlyCamera(delta, inputManager, cameraSystem, player) {
    const movement = inputManager.getMovementVector();
    const vertical =
      (inputManager.isKeyDown('Space') ? 1 : 0) -
      (inputManager.isKeyDown('ShiftLeft') || inputManager.isKeyDown('ShiftRight') ? 1 : 0);
    const speed = CONSTANTS.FREE_FLY_SPEED * (inputManager.isKeyDown('ControlLeft') ? 1.7 : 1);
    const moveStep = speed * delta;
    const yaw = cameraSystem.getYaw();
    const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
    const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));

    this.freeFlyPosition.addScaledVector(right, movement.x * moveStep);
    this.freeFlyPosition.addScaledVector(forward, -movement.z * moveStep);
    this.freeFlyPosition.y = Math.max(0.45, this.freeFlyPosition.y + vertical * moveStep);

    cameraSystem.updateFreeFly(this.freeFlyPosition);

    player.position.set(this.freeFlyPosition.x, 0, this.freeFlyPosition.z);
    player.mesh.position.copy(player.position);
    player.light.position.set(player.position.x, CONSTANTS.PLAYER_EYE_HEIGHT, player.position.z);
  }

  handleTeleportKeys(inputManager, player, cameraSystem) {
    const checkpointKeys = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'];
    for (let index = 0; index < checkpointKeys.length; index++) {
      if (inputManager.wasKeyPressed(checkpointKeys[index])) {
        const checkpoint = this.mapData?.checkpoints?.[index];
        if (checkpoint) this.teleportToGrid(player, cameraSystem, checkpoint.x, checkpoint.y);
      }
    }

    if (inputManager.wasKeyPressed('Digit0')) {
      const goal = this.mapData?.goals?.[0];
      if (goal) this.teleportToGrid(player, cameraSystem, goal.x, goal.y);
    }
  }

  teleportToStart(player, cameraSystem) {
    const start = this.mapData?.playerStart;
    if (start) this.teleportToGrid(player, cameraSystem, start.x, start.y);
  }

  teleportToGrid(player, cameraSystem, gridX, gridY) {
    const worldPosition = new THREE.Vector3(
      gridX * CONSTANTS.CELL_SIZE,
      0,
      gridY * CONSTANTS.CELL_SIZE
    );

    if (this.flyMode) {
      this.freeFlyPosition.set(worldPosition.x, CONSTANTS.PLAYER_EYE_HEIGHT, worldPosition.z);
      cameraSystem.updateFreeFly(this.freeFlyPosition);
    }

    player.respawnAt(worldPosition);
    if (!this.flyMode) cameraSystem.snap(player.position);
  }

  setDebugVisibility(isVisible) {
    this.debugVisible = isVisible;
    this.debugGroup.visible = isVisible;
  }

  setCrushersVisible(isVisible) {
    this.crushersVisible = isVisible;
    this.entityManager?.findByType('crusher').forEach(crusher => {
      crusher.mesh.visible = isVisible;
      if (crusher.telegraphStrip) crusher.telegraphStrip.visible = isVisible;
      if (crusher.debugPath) crusher.debugPath.visible = isVisible;
    });
  }

  clearDebugHelpers() {
    for (const child of [...this.debugGroup.children]) {
      this.debugGroup.remove(child);
      child.geometry?.dispose?.();
      child.material?.dispose?.();
    }
  }

  createDebugHelpers(mapData) {
    mapData.triggers?.forEach(trigger => {
      const ring = this.createRing(trigger.radius, CONSTANTS.COLORS.TRIGGER, 0.8);
      ring.position.set(
        trigger.x * CONSTANTS.CELL_SIZE,
        this.getFloorHeight(trigger.x, trigger.y) + 0.075,
        trigger.y * CONSTANTS.CELL_SIZE
      );
      this.debugGroup.add(ring);
    });

    mapData.checkpoints?.forEach((checkpoint, index) => {
      const ring = this.createRing(checkpoint.radius, CONSTANTS.COLORS.CHECKPOINT_ACTIVE, 0.62);
      const floorHeight = this.getFloorHeight(checkpoint.x, checkpoint.y);
      ring.position.set(checkpoint.x * CONSTANTS.CELL_SIZE, floorHeight + 0.08, checkpoint.y * CONSTANTS.CELL_SIZE);
      this.debugGroup.add(ring);

      const marker = new THREE.Mesh(
        new THREE.ConeGeometry(0.22, 0.7, 12),
        this.createDebugMaterial(CONSTANTS.COLORS.CHECKPOINT_ACTIVE, 0.78)
      );
      marker.position.set(checkpoint.x * CONSTANTS.CELL_SIZE, floorHeight + 1.65 + index * 0.02, checkpoint.y * CONSTANTS.CELL_SIZE);
      this.debugGroup.add(marker);
    });

    mapData.goals?.forEach(goal => {
      const ring = this.createRing(CONSTANTS.CELL_SIZE * 0.72, CONSTANTS.COLORS.GOAL, 0.72);
      ring.position.set(goal.x * CONSTANTS.CELL_SIZE, this.getFloorHeight(goal.x, goal.y) + 0.09, goal.y * CONSTANTS.CELL_SIZE);
      this.debugGroup.add(ring);
    });

    mapData.crushers?.forEach(crusher => {
      const start = new THREE.Vector3(crusher.start.x * CONSTANTS.CELL_SIZE, 0.16, crusher.start.y * CONSTANTS.CELL_SIZE);
      const end = new THREE.Vector3(crusher.end.x * CONSTANTS.CELL_SIZE, 0.16, crusher.end.y * CONSTANTS.CELL_SIZE);
      const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
      const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: CONSTANTS.COLORS.WARNING }));
      this.debugGroup.add(line);
    });
  }

  createRing(radius, color, opacity) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(Math.max(0.05, radius - 0.06), radius, 32),
      this.createDebugMaterial(color, opacity)
    );
    ring.rotation.x = -Math.PI / 2;
    return ring;
  }

  getFloorHeight(x, y) {
    return this.mapData?.floorZones?.find(zone => (
      x >= zone.x1 && x <= zone.x2 &&
      y >= zone.y1 && y <= zone.y2
    ))?.height ?? 0;
  }

  createDebugMaterial(color, opacity) {
    return new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
      depthWrite: false
    });
  }

  dispose() {
    this.clearDebugHelpers();
    this.scene.remove(this.debugGroup);
  }
}
