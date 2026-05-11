import { CONSTANTS } from '../core/Constants.js';

export class CollisionSystem {
  constructor(mapData) {
    this.grid = mapData.grid;
    this.width = this.grid[0].length;
    this.height = this.grid.length;
    this.padding = CONSTANTS.PLAYER_COLLISION_RADIUS;
  }

  // World coordinates to grid coordinates
  worldToGrid(worldPos) {
    return Math.round(worldPos / CONSTANTS.CELL_SIZE);
  }

  canMoveTo(worldX, worldZ) {
    // Circle-ish sampling gives first-person movement smoother corner sliding than a box.
    const checkPoints = [
      { x: worldX, z: worldZ },
      { x: worldX - this.padding, z: worldZ },
      { x: worldX + this.padding, z: worldZ },
      { x: worldX, z: worldZ - this.padding },
      { x: worldX, z: worldZ + this.padding },
      { x: worldX - this.padding * 0.7, z: worldZ - this.padding * 0.7 },
      { x: worldX + this.padding * 0.7, z: worldZ - this.padding * 0.7 },
      { x: worldX - this.padding * 0.7, z: worldZ + this.padding * 0.7 },
      { x: worldX + this.padding * 0.7, z: worldZ + this.padding * 0.7 }
    ];

    for (let point of checkPoints) {
      const gridX = this.worldToGrid(point.x);
      const gridZ = this.worldToGrid(point.z);

      // Bounds check
      if (gridX < 0 || gridX >= this.width || gridZ < 0 || gridZ >= this.height) {
        return false;
      }

      // Wall check
      if (this.grid[gridZ][gridX] === CONSTANTS.CELL_WALL) {
        return false;
      }
    }

    return true;
  }
}
