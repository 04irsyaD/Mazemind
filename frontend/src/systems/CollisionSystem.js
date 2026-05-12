import * as THREE from 'three';
import { CONSTANTS } from '../core/Constants.js';

export class CollisionSystem {
  constructor(mapData) {
    this.grid = mapData.grid;
    this.width = this.grid[0].length;
    this.height = this.grid.length;
    this.padding = CONSTANTS.PLAYER_COLLISION_RADIUS;
    this.floorZones = mapData.floorZones ?? [];
    this.staticVolumes = (mapData.collisionVolumes ?? []).map(volume => this.normalizeVolume(volume));
    this.dynamicVolumes = new Map();
  }

  // World coordinates to grid coordinates
  worldToGrid(worldPos) {
    return Math.floor(worldPos / CONSTANTS.CELL_SIZE + 0.5);
  }

  isInsideGrid(gridX, gridZ) {
    return gridX >= 0 && gridX < this.width && gridZ >= 0 && gridZ < this.height;
  }

  isSolidCell(gridX, gridZ) {
    if (!this.isInsideGrid(gridX, gridZ)) return true;
    return this.grid[gridZ][gridX] === CONSTANTS.CELL_WALL;
  }

  isWorldSolid(worldX, worldZ) {
    return this.isSolidCell(this.worldToGrid(worldX), this.worldToGrid(worldZ));
  }

  canMoveTo(worldX, worldZ, radius = this.padding) {
    // Capsule footprint sampling: small enough for readable wall sliding, large enough
    // to keep the camera from scraping wall faces in first person.
    const checkPoints = [
      { x: worldX, z: worldZ },
      { x: worldX - radius, z: worldZ },
      { x: worldX + radius, z: worldZ },
      { x: worldX, z: worldZ - radius },
      { x: worldX, z: worldZ + radius },
      { x: worldX - radius * 0.7, z: worldZ - radius * 0.7 },
      { x: worldX + radius * 0.7, z: worldZ - radius * 0.7 },
      { x: worldX - radius * 0.7, z: worldZ + radius * 0.7 },
      { x: worldX + radius * 0.7, z: worldZ + radius * 0.7 }
    ];

    for (let point of checkPoints) {
      if (this.isWorldSolid(point.x, point.z)) return false;
    }

    return !this.intersectsAnyVolume(worldX, worldZ, radius);
  }

  moveWithCollision(position, desiredMove, radius = this.padding) {
    const result = {
      position: position.clone(),
      collidedX: false,
      collidedZ: false,
    };

    const distance = Math.hypot(desiredMove.x, desiredMove.z);
    if (distance <= 0.00001) return result;

    const maxStep = CONSTANTS.CELL_SIZE * 0.28;
    const steps = Math.max(1, Math.ceil(distance / maxStep));
    const step = new THREE.Vector3(desiredMove.x / steps, 0, desiredMove.z / steps);

    for (let i = 0; i < steps; i++) {
      const nextX = result.position.x + step.x;
      if (this.canMoveTo(nextX, result.position.z, radius)) {
        result.position.x = nextX;
      } else {
        result.collidedX = true;
      }

      const nextZ = result.position.z + step.z;
      if (this.canMoveTo(result.position.x, nextZ, radius)) {
        result.position.z = nextZ;
      } else {
        result.collidedZ = true;
      }
    }

    return result;
  }

  worldToRoom(mapData, worldX, worldZ) {
    const gridX = this.worldToGrid(worldX);
    const gridZ = this.worldToGrid(worldZ);
    return mapData.rooms?.find(room => (
      gridX >= room.x1 && gridX <= room.x2 &&
      gridZ >= room.y1 && gridZ <= room.y2
    )) ?? null;
  }

  getFloorHeightAt(worldX, worldZ) {
    const gridX = this.worldToGrid(worldX);
    const gridZ = this.worldToGrid(worldZ);
    return this.floorZones.find(zone => (
      gridX >= zone.x1 && gridX <= zone.x2 &&
      gridZ >= zone.y1 && gridZ <= zone.y2
    ))?.height ?? 0;
  }

  setDynamicBlocker(id, volume, enabled = true) {
    this.dynamicVolumes.set(id, {
      ...this.normalizeVolume({ id, ...volume }),
      enabled
    });
  }

  setDynamicBlockerEnabled(id, enabled) {
    const volume = this.dynamicVolumes.get(id);
    if (volume) volume.enabled = enabled;
  }

  normalizeVolume(volume) {
    const halfWidth = (volume.width ?? 1) * CONSTANTS.CELL_SIZE * 0.5;
    const halfDepth = (volume.depth ?? 1) * CONSTANTS.CELL_SIZE * 0.5;
    const centerX = volume.worldX ?? volume.x * CONSTANTS.CELL_SIZE;
    const centerZ = volume.worldZ ?? volume.y * CONSTANTS.CELL_SIZE;
    return {
      id: volume.id,
      minX: centerX - halfWidth,
      maxX: centerX + halfWidth,
      minZ: centerZ - halfDepth,
      maxZ: centerZ + halfDepth,
      enabled: volume.enabled !== false
    };
  }

  intersectsAnyVolume(worldX, worldZ, radius) {
    for (const volume of this.staticVolumes) {
      if (this.intersectsVolume(volume, worldX, worldZ, radius)) return true;
    }
    for (const volume of this.dynamicVolumes.values()) {
      if (this.intersectsVolume(volume, worldX, worldZ, radius)) return true;
    }
    return false;
  }

  intersectsVolume(volume, worldX, worldZ, radius) {
    if (!volume.enabled) return false;
    return (
      worldX >= volume.minX - radius &&
      worldX <= volume.maxX + radius &&
      worldZ >= volume.minZ - radius &&
      worldZ <= volume.maxZ + radius
    );
  }
}
