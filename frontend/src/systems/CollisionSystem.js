import { CONSTANTS } from '../core/Constants.js';

export class CollisionSystem {
  constructor(mapData) {
    this.grid = mapData.grid;
    this.width = this.grid[0].length;
    this.height = this.grid.length;
    // Padding to account for player size (capsule radius is 0.4)
    this.padding = 0.4;
  }

  // World coordinates to grid coordinates
  worldToGrid(worldPos) {
    return Math.round(worldPos / CONSTANTS.CELL_SIZE);
  }

  canMoveTo(worldX, worldZ) {
    // Check 4 corners of the player bounding box
    const checkPoints = [
      { x: worldX - this.padding, z: worldZ - this.padding },
      { x: worldX + this.padding, z: worldZ - this.padding },
      { x: worldX - this.padding, z: worldZ + this.padding },
      { x: worldX + this.padding, z: worldZ + this.padding }
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
