import { CONSTANTS } from '../core/Constants.js';

export class OfficeMazeGenerator {
  static buildCollisionGrid({ width, height, spaces = [], connectors = [], objectives = [], hazards = [] }) {
    const grid = Array.from({ length: height }, () => Array(width).fill(CONSTANTS.CELL_WALL));
    const carveRect = (rect, cellType = CONSTANTS.CELL_PATH) => {
      for (let y = rect.y1; y <= rect.y2; y++) {
        for (let x = rect.x1; x <= rect.x2; x++) {
          if (x >= 0 && x < width && y >= 0 && y < height) {
            grid[y][x] = cellType;
          }
        }
      }
    };

    spaces.forEach(space => carveRect(space));
    connectors.forEach(connector => carveRect(connector));

    objectives.filter(objective => objective.type === 'task').forEach(objective => {
      this.setCell(grid, objective.x, objective.y, CONSTANTS.CELL_CHECKPOINT);
    });
    objectives.filter(objective => objective.type === 'finalExit').forEach(objective => {
      this.setCell(grid, objective.x, objective.y, CONSTANTS.CELL_GOAL);
    });
    hazards.filter(hazard => hazard.type === 'fakeExitTrigger').forEach(hazard => {
      this.setCell(grid, hazard.x, hazard.y, CONSTANTS.CELL_TRIGGER);
    });

    return grid;
  }

  static setCell(grid, x, y, cellType) {
    if (grid[y]?.[x] === undefined) return;
    grid[y][x] = cellType;
  }
}
