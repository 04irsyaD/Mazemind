import { CONSTANTS } from '../core/Constants.js';

const GRID_WIDTH = 32;
const GRID_HEIGHT = 24;

function buildEmptyFieldGrid() {
  const grid = Array.from({ length: GRID_HEIGHT }, (_, y) =>
    Array.from({ length: GRID_WIDTH }, (_, x) => {
      const isBorder =
        x === 0 ||
        y === 0 ||
        x === GRID_WIDTH - 1 ||
        y === GRID_HEIGHT - 1;

      return isBorder ? CONSTANTS.CELL_WALL : CONSTANTS.CELL_PATH;
    })
  );

  return grid;
}

const level1V2CollisionGrid = buildEmptyFieldGrid();
const level1V2Architecture = [];

const level1V2FloorZones = [
  {
    id: 'empty-field',
    x1: 1,
    y1: 1,
    x2: GRID_WIDTH - 2,
    y2: GRID_HEIGHT - 2,
    color: 0x7f8888,
    emissive: 0x101616,
    emissiveIntensity: 0.035,
    roughness: 0.78,
    height: 0,
    floorLineColor: 0x7f8988,
    floorLineOpacity: 0.12,
    floorLineStep: 3
  }
];

const playerStart = {
  x: Math.floor(GRID_WIDTH / 2),
  y: Math.floor(GRID_HEIGHT / 2),
  yaw: 0,
  pitch: -0.04
};

function validateLevel1V2EmptyField(level) {
  const grid = level.grid;
  const height = grid.length;
  const width = grid[0]?.length ?? 0;
  const warnings = [];

  const gridSizeValid = width === GRID_WIDTH && height === GRID_HEIGHT &&
    grid.every(row => row.length === GRID_WIDTH);
  if (!gridSizeValid) {
    warnings.push(`grid size must be ${GRID_WIDTH} x ${GRID_HEIGHT}, found ${width} x ${height}`);
  }

  const architectureEmpty = level.architecture.length === 0;
  if (!architectureEmpty) {
    warnings.push(`architecture must stay empty, found ${level.architecture.length}`);
  }

  let borderWallsValid = true;
  let interiorPathsValid = true;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < (grid[y]?.length ?? 0); x++) {
      const isBorder =
        x === 0 ||
        y === 0 ||
        x === GRID_WIDTH - 1 ||
        y === GRID_HEIGHT - 1;
      const expectedCell = isBorder ? CONSTANTS.CELL_WALL : CONSTANTS.CELL_PATH;

      if (grid[y][x] !== expectedCell) {
        if (isBorder) {
          borderWallsValid = false;
        } else {
          interiorPathsValid = false;
        }
      }
    }
  }

  if (!borderWallsValid) {
    warnings.push('outer border cells must all be CELL_WALL');
  }

  if (!interiorPathsValid) {
    warnings.push('interior cells must all be CELL_PATH');
  }

  const playerStartCell = {
    x: Math.floor(level.playerStart.x),
    y: Math.floor(level.playerStart.y)
  };
  const playerStartOpen = grid[playerStartCell.y]?.[playerStartCell.x] === CONSTANTS.CELL_PATH;
  if (!playerStartOpen) {
    warnings.push(`playerStart must be CELL_PATH, found blocked cell at ${playerStartCell.x},${playerStartCell.y}`);
  }

  return {
    valid: warnings.length === 0,
    warnings,
    details: {
      architectureEmpty,
      gridWidth: width,
      gridHeight: height,
      gridSizeValid,
      borderWallsValid,
      interiorPathsValid,
      playerStartCell,
      playerStartOpen
    }
  };
}

export const level1V2 = {
  schemaVersion: 1,
  id: 'level-1-v2',
  label: 'Level 1 V2 Empty Field Baseline',
  title: 'Level 1 V2 Empty Field Baseline',
  version: 'v2-empty-field-baseline',
  status: 'empty-field-baseline',
  active: true,
  estimatedMinutes: 0,
  grid: level1V2CollisionGrid,
  collisionGrid: level1V2CollisionGrid,
  playerStart,
  floorZones: level1V2FloorZones,
  objectives: [],
  goals: [],
  checkpoints: [],
  triggers: [],
  crushers: [],
  sentientObjects: [],
  architecture: level1V2Architecture,
  rooms: [],
  corridors: [],
  connectors: [],
  doorways: [],
  wallSegments: [],
  partitionBands: [],
  collisionVolumes: [],
  routes: [],
  guideStrips: [],
  navigationNodes: [],
  areaLights: [],
  ceilingLights: [],
  spaces: [],
  hazards: [],
  storyBeats: [],
  manipulationNodes: [],
  lightingZones: [],
  wallDetailZones: [],
  ceilingDetailZones: [],
  proceduralFallbackRules: [],
  clearPathRules: [],
  notes: [
    'Level 1 V2 empty field baseline.',
    'Only the outer border is walled.',
    'Architecture, rooms, corridors, doors, objects, and gameplay tasks are disabled.'
  ]
};

export const level1V2EmptyFieldValidation = validateLevel1V2EmptyField(level1V2);

if (CONSTANTS.DEV_MODE && !level1V2EmptyFieldValidation.valid) {
  console.warn('Level 1 V2 empty field baseline validation', level1V2EmptyFieldValidation);
}
