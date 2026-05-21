import { CONSTANTS } from '../core/Constants.js';

const GRID_WIDTH = 32;
const GRID_HEIGHT = 24;

export const level1V2MapDimensions = {
  gridWidth: GRID_WIDTH,
  gridHeight: GRID_HEIGHT,
  cellSizeMeters: CONSTANTS.CELL_SIZE,
  worldWidthMeters: GRID_WIDTH * CONSTANTS.CELL_SIZE,
  worldDepthMeters: GRID_HEIGHT * CONSTANTS.CELL_SIZE,
  wallHeightMeters: CONSTANTS.WALL_HEIGHT,
  ceilingHeightMeters: CONSTANTS.WALL_HEIGHT,
  playerEyeHeightMeters: CONSTANTS.PLAYER_EYE_HEIGHT,
  standardDoorWidthMeters: 1.1,
  importantDoorWidthMeters: 1.5,
  standardDoorHeightMeters: 2.1,
  elevatorDoorWidthMeters: 1.4,
  elevatorDoorHeightMeters: 2.2
};

export const level1V2MovementStandards = {
  mainCorridorClearWidthCells: 3,
  mainCorridorClearWidthMeters: 3 * CONSTANTS.CELL_SIZE,
  preferredLargeAisleWidthCells: [2.5, 3],
  standardDoorwayWidthCells: 1,
  importantDoorwayWidthCells: 1.5,
  doorwayClearanceMeters: 0.8,
  objectiveClearanceMeters: 0.8,
  elevatorApproachClearanceMeters: 1.5,
  chairToDeskClearanceMeters: 0.55,
  meetingTableClearanceMeters: 0.6,
  coffeeTableClearanceMeters: 0.3
};

const metersFromCells = cells => Number((cells * CONSTANTS.CELL_SIZE).toFixed(2));

function createRoomMetadata({ code, id, label, bounds, color, purpose, active = false }) {
  const gridWidth = bounds.x2 - bounds.x1 + 1;
  const gridHeight = bounds.y2 - bounds.y1 + 1;

  return {
    code,
    id,
    label,
    ...bounds,
    bounds,
    active,
    status: active ? 'active' : 'future',
    gridSizeCells: { width: gridWidth, depth: gridHeight },
    worldSizeMeters: {
      width: metersFromCells(gridWidth),
      depth: metersFromCells(gridHeight)
    },
    function: purpose,
    purpose,
    color
  };
}

const level1V2RoomA = createRoomMetadata({
  code: 'A',
  id: 'front-admin-intake',
  label: 'Front Admin / Employee Intake',
  bounds: { x1: 2, y1: 18, x2: 10, y2: 22 },
  color: 0xb8c6cc,
  purpose: 'first admin/intake space',
  active: true
});

// Future rooms B-H are intentionally not exported or carved in this Room A shell pass.

const level1V2MainCorridor = {
  id: 'main-corridor',
  label: 'Main Corridor',
  x1: 12,
  y1: 17,
  x2: 14,
  y2: 22,
  bounds: { x1: 12, y1: 17, x2: 14, y2: 22 },
  gridSizeCells: { width: 3, depth: 6 },
  worldSizeMeters: { width: metersFromCells(3), depth: metersFromCells(6) },
  function: 'main vertical player route',
  purpose: 'route spine',
  decorativeRoom: false,
  furnitureAllowed: false,
  mustStayMostlyClear: true,
  color: 0x7f8888
};

const level1V2OpenAreas = [
  { id: 'room-a-open', roomId: 'front-admin-intake', x1: 2, y1: 18, x2: 10, y2: 22 },
  { id: 'main-corridor-open', roomId: 'main-corridor', x1: 12, y1: 17, x2: 14, y2: 22 }
];

const level1V2WallLines = [
  { id: 'room-a-west-outer-wall', x1: 1, y1: 17, x2: 1, y2: 23 },
  { id: 'room-a-north-outer-wall', x1: 1, y1: 17, x2: 11, y2: 17 },
  { id: 'room-a-south-outer-wall', x1: 1, y1: 23, x2: 11, y2: 23 },
  { id: 'room-a-to-corridor-wall', x1: 11, y1: 18, x2: 11, y2: 22 },
  { id: 'corridor-west-boundary', x1: 11, y1: 17, x2: 11, y2: 22 },
  { id: 'corridor-east-boundary', x1: 15, y1: 17, x2: 15, y2: 22 },
  { id: 'corridor-north-cap', x1: 12, y1: 16, x2: 14, y2: 16 },
  { id: 'corridor-south-cap', x1: 12, y1: 23, x2: 14, y2: 23 }
];

const level1V2DoorOpenings = [
  {
    id: 'door-room-a-to-main-corridor',
    from: 'front-admin-intake',
    to: 'main-corridor',
    wallOpening: { x1: 11, y1: 20, x2: 11, y2: 21 },
    connector: { x1: 12, y1: 20, x2: 12, y2: 21 },
    clearWidthCells: 1,
    clearHeightCells: 2,
    clearWidthMeters: level1V2MapDimensions.standardDoorWidthMeters
  }
];

const level1V2ShellBlueprint = {
  gridWidth: GRID_WIDTH,
  gridHeight: GRID_HEIGHT,
  openAreas: level1V2OpenAreas,
  wallLines: level1V2WallLines,
  doorOpenings: level1V2DoorOpenings
};

const toGridRect = rect => ({
  x1: Math.floor(rect.x1),
  y1: Math.floor(rect.y1),
  x2: Math.ceil(rect.x2),
  y2: Math.ceil(rect.y2)
});

function setGridRect(grid, rect, cellType) {
  const rectangle = toGridRect(rect);
  const width = grid[0]?.length ?? 0;
  const height = grid.length;
  const x1 = Math.max(0, Math.min(width - 1, rectangle.x1));
  const x2 = Math.max(0, Math.min(width - 1, rectangle.x2));
  const y1 = Math.max(0, Math.min(height - 1, rectangle.y1));
  const y2 = Math.max(0, Math.min(height - 1, rectangle.y2));

  for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
      grid[y][x] = cellType;
    }
  }
}

function createWallGrid(width, height) {
  return Array.from({ length: height }, () => Array(width).fill(CONSTANTS.CELL_WALL));
}

function carveRect(grid, rect) {
  setGridRect(grid, rect, CONSTANTS.CELL_PATH);
}

function applyWallLine(grid, line) {
  if (line.x1 !== line.x2 && line.y1 !== line.y2) {
    if (CONSTANTS.DEV_MODE) {
      console.warn('Level 1 V2 Room A shell ignores non-axis-aligned wall line', line);
    }
    return;
  }

  setGridRect(grid, line, CONSTANTS.CELL_WALL);
}

function carveDoor(grid, door) {
  carveRect(grid, door.wallOpening);
  carveRect(grid, door.connector);
}

function buildLevel1V2CollisionGrid() {
  const grid = createWallGrid(GRID_WIDTH, GRID_HEIGHT);

  level1V2OpenAreas.forEach(area => carveRect(grid, area));
  level1V2WallLines.forEach(line => applyWallLine(grid, line));
  level1V2DoorOpenings.forEach(door => carveDoor(grid, door));

  return grid;
}

const level1V2Architecture = [];
const level1V2CollisionGrid = buildLevel1V2CollisionGrid();
const level1V2Rooms = [level1V2RoomA];
const level1V2Spaces = [level1V2RoomA, level1V2MainCorridor];

const level1V2FloorZones = [
  {
    id: 'front-admin-intake',
    x1: level1V2RoomA.x1,
    y1: level1V2RoomA.y1,
    x2: level1V2RoomA.x2,
    y2: level1V2RoomA.y2,
    color: level1V2RoomA.color,
    emissive: 0x101616,
    emissiveIntensity: 0.04,
    roughness: 0.76,
    height: 0,
    floorLineColor: 0x7f8988,
    floorLineOpacity: 0.18,
    floorLineStep: 2
  },
  {
    id: 'main-corridor',
    x1: level1V2MainCorridor.x1,
    y1: level1V2MainCorridor.y1,
    x2: level1V2MainCorridor.x2,
    y2: level1V2MainCorridor.y2,
    color: level1V2MainCorridor.color,
    emissive: 0x101616,
    emissiveIntensity: 0.035,
    roughness: 0.78,
    height: 0,
    floorLineColor: 0x7f8988,
    floorLineOpacity: 0.12,
    floorLineStep: 3
  }
];

function cellKey(x, y) {
  return `${x},${y}`;
}

function getStartCell(playerStart) {
  return {
    x: Math.floor(playerStart.x + 0.5),
    y: Math.floor(playerStart.y + 0.5)
  };
}

function isOpenCell(grid, x, y) {
  return grid[y]?.[x] !== undefined && grid[y][x] !== CONSTANTS.CELL_WALL;
}

function collectReachableCells(grid, start) {
  if (!isOpenCell(grid, start.x, start.y)) return new Set();

  const queue = [start];
  const reachable = new Set([cellKey(start.x, start.y)]);

  for (let index = 0; index < queue.length; index++) {
    const cell = queue[index];
    [
      { x: cell.x + 1, y: cell.y },
      { x: cell.x - 1, y: cell.y },
      { x: cell.x, y: cell.y + 1 },
      { x: cell.x, y: cell.y - 1 }
    ].forEach(next => {
      const key = cellKey(next.x, next.y);
      if (!isOpenCell(grid, next.x, next.y) || reachable.has(key)) return;
      reachable.add(key);
      queue.push(next);
    });
  }

  return reachable;
}

function rectHasReachableCell(rect, reachable) {
  const bounds = toGridRect(rect);
  for (let y = bounds.y1; y <= bounds.y2; y++) {
    for (let x = bounds.x1; x <= bounds.x2; x++) {
      if (reachable.has(cellKey(x, y))) return true;
    }
  }
  return false;
}

function collectClosedCells(grid, rect) {
  const closed = [];
  const bounds = toGridRect(rect);

  for (let y = bounds.y1; y <= bounds.y2; y++) {
    for (let x = bounds.x1; x <= bounds.x2; x++) {
      if (!isOpenCell(grid, x, y)) closed.push(cellKey(x, y));
    }
  }

  return closed;
}

function validateLevel1V2RoomAShell(level) {
  const grid = level.grid;
  const startCell = getStartCell(level.playerStart);
  const reachable = collectReachableCells(grid, startCell);
  const warnings = [];

  if (level.architecture.length !== 0) {
    warnings.push(`architecture must stay empty, found ${level.architecture.length}`);
  }

  if (!isOpenCell(grid, startCell.x, startCell.y)) {
    warnings.push(`playerStart is not open at ${cellKey(startCell.x, startCell.y)}`);
  }

  const closedCorridorCells = collectClosedCells(grid, level1V2MainCorridor.bounds);
  closedCorridorCells.forEach(cell => warnings.push(`main corridor has closed cell ${cell}`));

  const primaryDoor = level1V2DoorOpenings.find(door => door.id === 'door-room-a-to-main-corridor');
  const closedDoorWallOpeningCells = collectClosedCells(grid, primaryDoor.wallOpening);
  closedDoorWallOpeningCells.forEach(cell => warnings.push(`Room A door wallOpening has closed cell ${cell}`));
  const closedDoorConnectorCells = collectClosedCells(grid, primaryDoor.connector);
  closedDoorConnectorCells.forEach(cell => warnings.push(`Room A door connector has closed cell ${cell}`));

  const roomAReachable = rectHasReachableCell(level1V2RoomA.bounds, reachable);
  const corridorReachable = rectHasReachableCell(level1V2MainCorridor.bounds, reachable);
  const doorWallOpeningReachable = rectHasReachableCell(primaryDoor.wallOpening, reachable);
  const doorConnectorReachable = rectHasReachableCell(primaryDoor.connector, reachable);
  const roomAToCorridorReachable = roomAReachable && corridorReachable && doorWallOpeningReachable && doorConnectorReachable;

  if (!roomAToCorridorReachable) {
    warnings.push('Room A cannot reach the main corridor through the active door');
  }

  return {
    valid: warnings.length === 0,
    warnings,
    details: {
      architectureEmpty: level.architecture.length === 0,
      playerStartCell: startCell,
      playerStartOpen: isOpenCell(grid, startCell.x, startCell.y),
      closedCorridorCells,
      closedDoorWallOpeningCells,
      closedDoorConnectorCells,
      roomAReachable,
      corridorReachable,
      doorWallOpeningReachable,
      doorConnectorReachable,
      roomAToCorridorReachable,
      reachableCells: reachable.size,
      gridWidth: grid[0]?.length ?? 0,
      gridHeight: grid.length
    }
  };
}

export const level1V2 = {
  schemaVersion: 1,
  id: 'level-1-v2',
  label: 'Level 1 V2 Map Shell - Room A Test',
  title: 'Level 1 V2 Map Shell - Room A Test',
  version: 'v2-room-a-test',
  status: 'map-shell-room-a-test',
  active: true,
  estimatedMinutes: 20,
  mapDimensions: level1V2MapDimensions,
  movementStandards: level1V2MovementStandards,
  proceduralFallbackRules: [],
  shellBlueprint: level1V2ShellBlueprint,
  spaces: level1V2Spaces,
  rooms: level1V2Rooms,
  corridors: [level1V2MainCorridor],
  connectors: level1V2DoorOpenings,
  doorways: level1V2DoorOpenings,
  clearPathRules: [],
  wallSegments: level1V2WallLines,
  partitionBands: [],
  objectives: [],
  hazards: [],
  storyBeats: [],
  manipulationNodes: [],
  lightingZones: [],
  collisionVolumes: [],
  collisionGrid: level1V2CollisionGrid,
  grid: level1V2CollisionGrid,
  playerStart: { x: 6.5, y: 20.5, yaw: 0, pitch: -0.04 },
  goals: [],
  checkpoints: [],
  triggers: [],
  crushers: [],
  sentientObjects: [],
  floorZones: level1V2FloorZones,
  wallDetailZones: [],
  ceilingDetailZones: [],
  guideStrips: [],
  navigationNodes: [],
  areaLights: [],
  ceilingLights: [],
  routes: [],
  notes: [
    'Level 1 V2 is reset to a Room A map shell test.',
    'Only Room A and the main corridor are carved in the collision grid.',
    'Future rooms B-H are metadata only and are not carved yet.',
    'Furniture/object placement is intentionally disabled.',
    'Old level1.js remains available as legacy.',
    'No GLB model metadata or runtime external model URLs are added here.',
    'No Level 2 transition logic is implemented in this scaffold.'
  ],
  architecture: level1V2Architecture
};

export const level1V2ShellValidation = validateLevel1V2RoomAShell(level1V2);

if (CONSTANTS.DEV_MODE && !level1V2ShellValidation.valid) {
  console.warn('Level 1 V2 Room A shell validation', level1V2ShellValidation);
}
