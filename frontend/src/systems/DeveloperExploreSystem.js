import * as THREE from 'three';
import { CONSTANTS } from '../core/Constants.js';

export class DeveloperExploreSystem {
  constructor(scene) {
    this.scene = scene;
    this.debugGroup = new THREE.Group();
    this.debugGroup.visible = false;
    this.scene.add(this.debugGroup);

    this.debugVisible = false;
    this.flyMode = false;
    this.collisionEnabled = true;
    this.crushersVisible = true;
    this.collisionVisible = false;
    this.roomsVisible = false;
    this.routeVisible = false;
    this.activeRoom = null;
    this.freeFlyPosition = new THREE.Vector3();
    this.mapData = null;
    this.entityManager = null;
    this.collisionGroup = null;
    this.roomsGroup = null;
    this.routeGroup = null;
  }

  reset(mapData, entityManager, options = {}) {
    const debugVisible = !!options.debugVisible;
    const roomsVisible = options.roomsVisible ?? debugVisible;
    const routeVisible = options.routeVisible ?? debugVisible;

    this.mapData = mapData;
    this.entityManager = entityManager;
    this.debugVisible = debugVisible;
    this.flyMode = false;
    this.collisionEnabled = true;
    this.crushersVisible = true;
    this.collisionVisible = false;
    this.roomsVisible = roomsVisible;
    this.routeVisible = routeVisible;
    this.activeRoom = null;
    this.clearDebugHelpers();
    this.createDebugHelpers(mapData);
    this.setDebugVisibility(debugVisible);
    this.setCrushersVisible(true);
  }

  update(delta, inputManager, cameraSystem, player, uiManager) {
    this.handleDebugToggleInput(inputManager, cameraSystem, player, { allowExploreControls: true });
    if (inputManager.wasKeyPressed('KeyR')) this.teleportToStart(player, cameraSystem);

    this.handleTeleportKeys(inputManager, player, cameraSystem);
    this.activeRoom = this.getRoomAtWorld(player.position.x, player.position.z);

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
      crushersVisible: this.crushersVisible,
      collisionVisible: this.collisionVisible,
      roomsVisible: this.roomsVisible,
      routeVisible: this.routeVisible,
      activeRoom: this.activeRoom?.label ?? null
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
        player.position.y + CONSTANTS.PLAYER_EYE_HEIGHT,
        player.position.z
      );
      cameraSystem.updateFreeFly(this.freeFlyPosition);
      return;
    }

    const floorHeight = this.getFloorHeightAtWorld(cameraSystem.camera.position.x, cameraSystem.camera.position.z);
    player.respawnAt(new THREE.Vector3(cameraSystem.camera.position.x, floorHeight, cameraSystem.camera.position.z));
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

    const floorHeight = this.getFloorHeightAtWorld(this.freeFlyPosition.x, this.freeFlyPosition.z);
    player.position.set(this.freeFlyPosition.x, floorHeight, this.freeFlyPosition.z);
    player.mesh.position.copy(player.position);
    player.light.position.set(player.position.x, player.position.y + CONSTANTS.PLAYER_EYE_HEIGHT, player.position.z);
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
      this.getFloorHeight(gridX, gridY),
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
    this.setCollisionVisible(this.collisionVisible);
    this.setRoomsVisible(this.roomsVisible);
    this.setRouteVisible(this.routeVisible);
    this.setCrusherDebugPathsVisible(isVisible);
  }

  setCrushersVisible(isVisible) {
    this.crushersVisible = isVisible;
    this.entityManager?.findByType('crusher').forEach(crusher => {
      crusher.mesh.visible = isVisible;
      if (crusher.telegraphStrip) crusher.telegraphStrip.visible = isVisible;
      if (crusher.debugPath) crusher.debugPath.visible = isVisible && this.debugVisible;
    });
  }

  setCrusherDebugPathsVisible(isVisible) {
    this.entityManager?.findByType('crusher').forEach(crusher => {
      if (crusher.debugPath) crusher.debugPath.visible = isVisible && this.crushersVisible;
    });
  }

  setCollisionVisible(isVisible) {
    this.collisionVisible = isVisible;
    if (this.collisionGroup) this.collisionGroup.visible = isVisible && this.debugVisible;
  }

  setRoomsVisible(isVisible) {
    this.roomsVisible = isVisible;
    if (this.roomsGroup) this.roomsGroup.visible = isVisible && this.debugVisible;
  }

  setRouteVisible(isVisible) {
    this.routeVisible = isVisible;
    if (this.routeGroup) this.routeGroup.visible = isVisible && this.debugVisible;
  }

  handleDebugToggleInput(inputManager, cameraSystem = null, player = null, options = {}) {
    const allowExploreControls = options.allowExploreControls ?? false;
    let changed = false;

    if (inputManager.wasKeyPressed('F1')) {
      this.setDebugVisibility(!this.debugVisible);
      changed = true;
    }

    if (allowExploreControls) {
      if (inputManager.wasKeyPressed('F2')) {
        this.setFlyMode(!this.flyMode, cameraSystem, player);
        changed = true;
      }
      if (inputManager.wasKeyPressed('F3')) {
        this.collisionEnabled = !this.collisionEnabled;
        changed = true;
      }
      if (inputManager.wasKeyPressed('F4')) {
        this.setCrushersVisible(!this.crushersVisible);
        changed = true;
      }
    }

    if (inputManager.wasKeyPressed('F5')) {
      this.setCollisionVisible(!this.collisionVisible);
      if (this.collisionVisible && !this.debugVisible) this.setDebugVisibility(true);
      changed = true;
    }
    if (inputManager.wasKeyPressed('F6')) {
      this.setRoomsVisible(!this.roomsVisible);
      if (this.roomsVisible && !this.debugVisible) this.setDebugVisibility(true);
      changed = true;
    }
    if (inputManager.wasKeyPressed('F7')) {
      this.setRouteVisible(!this.routeVisible);
      if (this.routeVisible && !this.debugVisible) this.setDebugVisibility(true);
      changed = true;
    }

    return changed;
  }

  clearDebugHelpers() {
    for (const child of [...this.debugGroup.children]) {
      this.debugGroup.remove(child);
      child.traverse?.(node => {
        node.geometry?.dispose?.();
        if (Array.isArray(node.material)) {
          node.material.forEach(material => {
            material.map?.dispose?.();
            material.dispose?.();
          });
        } else {
          node.material?.map?.dispose?.();
          node.material?.dispose?.();
        }
      });
    }
    this.collisionGroup = null;
    this.roomsGroup = null;
    this.routeGroup = null;
  }

  createDebugHelpers(mapData) {
    this.collisionGroup = new THREE.Group();
    this.roomsGroup = new THREE.Group();
    this.routeGroup = new THREE.Group();
    this.debugGroup.add(this.collisionGroup, this.roomsGroup, this.routeGroup);

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

    this.createCollisionHelpers(mapData);
    this.createRoomHelpers(mapData);
    this.createRouteHelpers(mapData);
    this.setCollisionVisible(this.collisionVisible);
    this.setRoomsVisible(this.roomsVisible);
    this.setRouteVisible(this.routeVisible);
  }

  createCollisionHelpers(mapData) {
    let solidCount = 0;
    mapData.grid.forEach(row => {
      row.forEach(cell => {
        if (cell === CONSTANTS.CELL_WALL) solidCount++;
      });
    });

    const mesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(CONSTANTS.CELL_SIZE, 0.12, CONSTANTS.CELL_SIZE),
      new THREE.MeshBasicMaterial({
        color: 0xff3344,
        transparent: true,
        opacity: 0.16,
        depthWrite: false
      }),
      solidCount
    );
    const dummy = new THREE.Object3D();
    let index = 0;

    for (let y = 0; y < mapData.grid.length; y++) {
      for (let x = 0; x < mapData.grid[y].length; x++) {
        if (mapData.grid[y][x] !== CONSTANTS.CELL_WALL) continue;
        dummy.position.set(x * CONSTANTS.CELL_SIZE, 0.09, y * CONSTANTS.CELL_SIZE);
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
        index++;
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    this.collisionGroup.add(mesh);

    mapData.collisionVolumes?.forEach(volume => {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(
          (volume.width ?? 1) * CONSTANTS.CELL_SIZE,
          0.2,
          (volume.depth ?? 1) * CONSTANTS.CELL_SIZE
        ),
        this.createDebugMaterial(0xff9f43, 0.32)
      );
      box.position.set(volume.x * CONSTANTS.CELL_SIZE, 0.18, volume.y * CONSTANTS.CELL_SIZE);
      this.collisionGroup.add(box);
    });
  }

  createRoomHelpers(mapData) {
    mapData.rooms?.forEach(room => {
      const width = (room.x2 - room.x1 + 1) * CONSTANTS.CELL_SIZE;
      const depth = (room.y2 - room.y1 + 1) * CONSTANTS.CELL_SIZE;
      const centerX = ((room.x1 + room.x2) / 2) * CONSTANTS.CELL_SIZE;
      const centerZ = ((room.y1 + room.y2) / 2) * CONSTANTS.CELL_SIZE;
      const floorHeight = this.getFloorHeight(Math.round((room.x1 + room.x2) / 2), Math.round((room.y1 + room.y2) / 2));

      const outline = new THREE.Mesh(
        new THREE.RingGeometry(0.48, 0.52, 4),
        this.createDebugMaterial(room.color ?? 0xffffff, 0.5)
      );
      outline.scale.set(width, depth, 1);
      outline.rotation.x = -Math.PI / 2;
      outline.rotation.z = Math.PI / 4;
      outline.position.set(centerX, floorHeight + 0.1, centerZ);
      this.roomsGroup.add(outline);

      const label = this.createLabelSprite(`${room.label} | ${room.purpose}`, room.color ?? 0xffffff);
      label.position.set(centerX, floorHeight + 1.95, centerZ);
      this.roomsGroup.add(label);
    });
  }

  createRouteHelpers(mapData) {
    mapData.routes?.forEach(route => {
      const points = route.points.map(point => new THREE.Vector3(
        point.x * CONSTANTS.CELL_SIZE,
        this.getFloorHeight(point.x, point.y) + 0.18,
        point.y * CONSTANTS.CELL_SIZE
      ));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({ color: route.color ?? CONSTANTS.COLORS.GOAL })
      );
      this.routeGroup.add(line);
    });

    this.mapData?.aiManipulation?.lockableRoutes?.forEach(route => {
      const anchor = route.anchor;
      if (!anchor) return;
      const marker = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.5),
        this.createDebugMaterial(CONSTANTS.COLORS.AI_CYAN, 0.72)
      );
      marker.position.set(anchor.x * CONSTANTS.CELL_SIZE, 0.55, anchor.y * CONSTANTS.CELL_SIZE);
      this.routeGroup.add(marker);
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

  getFloorHeightAtWorld(worldX, worldZ) {
    const gridX = Math.floor(worldX / CONSTANTS.CELL_SIZE + 0.5);
    const gridY = Math.floor(worldZ / CONSTANTS.CELL_SIZE + 0.5);
    return this.getFloorHeight(gridX, gridY);
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

  createLabelSprite(text, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 768;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    context.fillStyle = 'rgba(0, 0, 0, 0.65)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
    context.font = '700 34px Arial, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false
    }));
    sprite.scale.set(5.8, 0.96, 1);
    return sprite;
  }

  getRoomAtWorld(worldX, worldZ) {
    const gridX = Math.floor(worldX / CONSTANTS.CELL_SIZE + 0.5);
    const gridY = Math.floor(worldZ / CONSTANTS.CELL_SIZE + 0.5);
    return this.mapData?.rooms?.find(room => (
      gridX >= room.x1 && gridX <= room.x2 &&
      gridY >= room.y1 && gridY <= room.y2
    )) ?? null;
  }

  dispose() {
    this.clearDebugHelpers();
    this.scene.remove(this.debugGroup);
  }
}
