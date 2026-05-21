import { CONSTANTS } from '../core/Constants.js';

const GRID_WIDTH = 32;
const GRID_HEIGHT = 24;

const ROOM_A_BOUNDS = { x1: 3, y1: 15, x2: 11, y2: 21 };
const ROOM_A_OPEN_SIDE = { side: 'east', x: 11, y1: 17, y2: 21 };
const ACCESS_STRIP_BOUNDS = { x1: 12, y1: 17, x2: 14, y2: 21 };

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

function setCell(grid, x, y, cellType) {
  if (grid[y]?.[x] === undefined) return;
  grid[y][x] = cellType;
}

function setRect(grid, rect, cellType) {
  for (let y = rect.y1; y <= rect.y2; y++) {
    for (let x = rect.x1; x <= rect.x2; x++) {
      setCell(grid, x, y, cellType);
    }
  }
}

function addRoomAShell(grid) {
  for (let x = ROOM_A_BOUNDS.x1; x <= ROOM_A_BOUNDS.x2; x++) {
    setCell(grid, x, ROOM_A_BOUNDS.y1, CONSTANTS.CELL_WALL);
    setCell(grid, x, ROOM_A_BOUNDS.y2, CONSTANTS.CELL_WALL);
  }

  for (let y = ROOM_A_BOUNDS.y1; y <= ROOM_A_BOUNDS.y2; y++) {
    setCell(grid, ROOM_A_BOUNDS.x1, y, CONSTANTS.CELL_WALL);
  }

  for (let y = ROOM_A_BOUNDS.y1; y <= ROOM_A_BOUNDS.y1 + 1; y++) {
    setCell(grid, ROOM_A_BOUNDS.x2, y, CONSTANTS.CELL_WALL);
  }

  for (let y = ROOM_A_OPEN_SIDE.y1; y <= ROOM_A_OPEN_SIDE.y2; y++) {
    setCell(grid, ROOM_A_OPEN_SIDE.x, y, CONSTANTS.CELL_PATH);
  }

  setRect(grid, ACCESS_STRIP_BOUNDS, CONSTANTS.CELL_PATH);
}

function buildRoomAShellGrid() {
  const grid = buildEmptyFieldGrid();
  addRoomAShell(grid);
  return grid;
}

const level1V2CollisionGrid = buildRoomAShellGrid();
const level1V2Architecture = [];

const level1V2Rooms = [
  {
    id: 'front-admin-intake',
    label: 'Front Admin / Employee Intake',
    code: 'A',
    bounds: ROOM_A_BOUNDS,
    ...ROOM_A_BOUNDS,
    active: true,
    status: 'active'
  }
];

const level1V2OpenSides = [
  {
    id: 'front-admin-intake-east-open-side',
    roomId: 'front-admin-intake',
    ...ROOM_A_OPEN_SIDE
  }
];

const level1V2Corridors = [
  {
    id: 'room-a-access-strip',
    label: 'Room A Access Strip',
    ...ACCESS_STRIP_BOUNDS,
    temporary: true,
    status: 'map-shell-access'
  }
];

const level1V2OpenAreas = [
  {
    id: 'front-admin-intake-interior',
    roomId: 'front-admin-intake',
    x1: ROOM_A_BOUNDS.x1 + 1,
    y1: ROOM_A_BOUNDS.y1 + 1,
    x2: ROOM_A_BOUNDS.x2 - 1,
    y2: ROOM_A_BOUNDS.y2 - 1
  },
  {
    id: 'front-admin-intake-access-strip',
    x1: ACCESS_STRIP_BOUNDS.x1,
    y1: ACCESS_STRIP_BOUNDS.y1,
    x2: ACCESS_STRIP_BOUNDS.x2,
    y2: ACCESS_STRIP_BOUNDS.y2
  }
];

const level1V2FloorZones = [
  {
    id: 'front-admin-intake',
    x1: ROOM_A_BOUNDS.x1 + 1,
    y1: ROOM_A_BOUNDS.y1 + 1,
    x2: ROOM_A_BOUNDS.x2,
    y2: ROOM_A_BOUNDS.y2 - 1,
    color: 0x9caeae,
    emissive: 0x101616,
    emissiveIntensity: 0.045,
    roughness: 0.76,
    height: 0,
    floorLineColor: 0x9fb1b0,
    floorLineOpacity: 0.16,
    floorLineStep: 2
  },
  {
    id: 'front-admin-intake-access-strip',
    x1: ACCESS_STRIP_BOUNDS.x1,
    y1: ACCESS_STRIP_BOUNDS.y1,
    x2: ACCESS_STRIP_BOUNDS.x2,
    y2: ACCESS_STRIP_BOUNDS.y2,
    color: 0x889494,
    emissive: 0x101616,
    emissiveIntensity: 0.038,
    roughness: 0.78,
    height: 0,
    floorLineColor: 0x8f9a99,
    floorLineOpacity: 0.14,
    floorLineStep: 2
  },
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
  x: 6,
  y: 18,
  yaw: -Math.PI / 2,
  pitch: -0.04
};

function cellKey(x, y) {
  return `${x},${y}`;
}

function isPathCell(grid, x, y) {
  return grid[y]?.[x] === CONSTANTS.CELL_PATH;
}

function isInsideRoomA(x, y) {
  return (
    x >= ROOM_A_BOUNDS.x1 &&
    x <= ROOM_A_BOUNDS.x2 &&
    y >= ROOM_A_BOUNDS.y1 &&
    y <= ROOM_A_BOUNDS.y2
  );
}

function collectReachableCells(grid, start) {
  if (!isPathCell(grid, start.x, start.y)) return new Set();

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
      if (!isPathCell(grid, next.x, next.y) || reachable.has(key)) return;
      reachable.add(key);
      queue.push(next);
    });
  }

  return reachable;
}

function collectRoomAWallCells() {
  const wallCells = [];

  for (let x = ROOM_A_BOUNDS.x1; x <= ROOM_A_BOUNDS.x2; x++) {
    wallCells.push({ x, y: ROOM_A_BOUNDS.y1 });
    if (x !== ROOM_A_OPEN_SIDE.x) {
      wallCells.push({ x, y: ROOM_A_BOUNDS.y2 });
    }
  }

  for (let y = ROOM_A_BOUNDS.y1 + 1; y <= ROOM_A_BOUNDS.y2 - 1; y++) {
    wallCells.push({ x: ROOM_A_BOUNDS.x1, y });
  }

  for (let y = ROOM_A_BOUNDS.y1 + 1; y <= ROOM_A_BOUNDS.y1 + 1; y++) {
    wallCells.push({ x: ROOM_A_BOUNDS.x2, y });
  }

  return wallCells;
}

function collectRoomAOpenSideCells() {
  const cells = [];

  for (let y = ROOM_A_OPEN_SIDE.y1; y <= ROOM_A_OPEN_SIDE.y2; y++) {
    cells.push({ x: ROOM_A_OPEN_SIDE.x, y });
  }

  return cells;
}

function validateLevel1V2RoomAShell(level) {
  const grid = level.grid;
  const height = grid.length;
  const width = grid[0]?.length ?? 0;
  const warnings = [];

  const architectureEmpty = level.architecture.length === 0;
  if (!architectureEmpty) {
    warnings.push(`architecture must stay empty, found ${level.architecture.length}`);
  }

  let outerBoundaryWallsIntact = width === GRID_WIDTH && height === GRID_HEIGHT &&
    grid.every(row => row.length === GRID_WIDTH);
  if (outerBoundaryWallsIntact) {
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const isBorder =
          x === 0 ||
          y === 0 ||
          x === GRID_WIDTH - 1 ||
          y === GRID_HEIGHT - 1;
        if (isBorder && grid[y][x] !== CONSTANTS.CELL_WALL) {
          outerBoundaryWallsIntact = false;
        }
      }
    }
  }

  if (!outerBoundaryWallsIntact) {
    warnings.push('outer boundary walls must remain intact');
  }

  const roomAWallCells = collectRoomAWallCells();
  const roomAWallsExist = roomAWallCells.every(cell => grid[cell.y]?.[cell.x] === CONSTANTS.CELL_WALL);
  if (!roomAWallsExist) {
    warnings.push('Room A north, south, west, and east upper return wall cells must be CELL_WALL');
  }

  const roomAOpenSideCells = collectRoomAOpenSideCells();
  const roomAEastSideOpen = roomAOpenSideCells.every(cell => isPathCell(grid, cell.x, cell.y));
  if (!roomAEastSideOpen) {
    warnings.push('Room A east open side cells must stay CELL_PATH');
  }

  let roomAInteriorPath = true;
  for (let y = ROOM_A_BOUNDS.y1 + 1; y <= ROOM_A_BOUNDS.y2 - 1; y++) {
    for (let x = ROOM_A_BOUNDS.x1 + 1; x <= ROOM_A_BOUNDS.x2 - 1; x++) {
      if (!isPathCell(grid, x, y)) roomAInteriorPath = false;
    }
  }

  if (!roomAInteriorPath) {
    warnings.push('Room A interior must stay CELL_PATH');
  }

  let accessStripPath = true;
  for (let y = ACCESS_STRIP_BOUNDS.y1; y <= ACCESS_STRIP_BOUNDS.y2; y++) {
    for (let x = ACCESS_STRIP_BOUNDS.x1; x <= ACCESS_STRIP_BOUNDS.x2; x++) {
      if (!isPathCell(grid, x, y)) accessStripPath = false;
    }
  }

  if (!accessStripPath) {
    warnings.push('Room A access strip cells must stay CELL_PATH');
  }

  const playerStartCell = {
    x: Math.floor(level.playerStart.x),
    y: Math.floor(level.playerStart.y)
  };
  const playerStartOpen = isPathCell(grid, playerStartCell.x, playerStartCell.y);
  if (!playerStartOpen) {
    warnings.push(`playerStart must be CELL_PATH, found blocked cell at ${cellKey(playerStartCell.x, playerStartCell.y)}`);
  }

  const reachable = collectReachableCells(grid, playerStartCell);
  let accessStripReachable = false;
  for (let y = ACCESS_STRIP_BOUNDS.y1; y <= ACCESS_STRIP_BOUNDS.y2; y++) {
    for (let x = ACCESS_STRIP_BOUNDS.x1; x <= ACCESS_STRIP_BOUNDS.x2; x++) {
      if (reachable.has(cellKey(x, y)) && !isInsideRoomA(x, y)) accessStripReachable = true;
    }
  }

  if (!accessStripReachable) {
    warnings.push('playerStart cannot reach the Room A access strip through the open side');
  }

  return {
    valid: warnings.length === 0,
    warnings,
    details: {
      architectureEmpty,
      gridWidth: width,
      gridHeight: height,
      outerBoundaryWallsIntact,
      roomAWallCells: roomAWallCells.length,
      roomAWallsExist,
      openSide: ROOM_A_OPEN_SIDE,
      eastUpperReturnWallCells: roomAWallCells.filter(cell => cell.x === ROOM_A_BOUNDS.x2),
      roomAEastSideOpen,
      roomAInteriorPath,
      accessStripBounds: ACCESS_STRIP_BOUNDS,
      accessStripPath,
      playerStartCell,
      playerStartOpen,
      accessStripReachable,
      reachableCells: reachable.size
    }
  };
}

function isCellInRect(x, y, rect) {
  return x >= rect.x1 && x <= rect.x2 && y >= rect.y1 && y <= rect.y2;
}

function printLevel1V2AsciiGrid(level) {
  const playerStartCell = {
    x: Math.floor(level.playerStart.x),
    y: Math.floor(level.playerStart.y)
  };
  const roomAInterior = {
    x1: ROOM_A_BOUNDS.x1 + 1,
    y1: ROOM_A_BOUNDS.y1 + 1,
    x2: ROOM_A_BOUNDS.x2 - 1,
    y2: ROOM_A_BOUNDS.y2 - 1
  };
  const openSideCells = collectRoomAOpenSideCells();
  const rows = level.grid.map((row, y) => row.map((cell, x) => {
    if (x === playerStartCell.x && y === playerStartCell.y) return 'P';
    if (openSideCells.some(openCell => openCell.x === x && openCell.y === y)) return 'O';
    if (isCellInRect(x, y, ACCESS_STRIP_BOUNDS)) return 'O';
    if (isCellInRect(x, y, roomAInterior) && cell === CONSTANTS.CELL_PATH) return 'A';
    if (cell === CONSTANTS.CELL_WALL) return '#';
    if (cell === CONSTANTS.CELL_PATH) return '.';
    return '?';
  }).join(''));

  console.info([
    '[MazeMind] Level 1 V2 ASCII grid debug',
    `grid: ${level.grid[0]?.length ?? 0} x ${level.grid.length}`,
    `Room A bounds: x1=${ROOM_A_BOUNDS.x1}, y1=${ROOM_A_BOUNDS.y1}, x2=${ROOM_A_BOUNDS.x2}, y2=${ROOM_A_BOUNDS.y2}`,
    `Room A open side: side=${ROOM_A_OPEN_SIDE.side}, x=${ROOM_A_OPEN_SIDE.x}, y1=${ROOM_A_OPEN_SIDE.y1}, y2=${ROOM_A_OPEN_SIDE.y2}`,
    `access strip bounds: x1=${ACCESS_STRIP_BOUNDS.x1}, y1=${ACCESS_STRIP_BOUNDS.y1}, x2=${ACCESS_STRIP_BOUNDS.x2}, y2=${ACCESS_STRIP_BOUNDS.y2}`,
    `playerStart cell: (${playerStartCell.x},${playerStartCell.y})`,
    'legend: # wall, . path, P playerStart, A Room A interior, O open side/access strip',
    ...rows
  ].join('\n'));
}

export const level1V2 = {
  schemaVersion: 1,
  id: 'level-1-v2',
  label: 'Level 1 V2 Room A Shell Test',
  title: 'Level 1 V2 Room A Shell Test',
  version: 'v2-room-a-shell-test',
  status: 'map-shell-room-a-test',
  active: true,
  estimatedMinutes: 0,
  grid: level1V2CollisionGrid,
  collisionGrid: level1V2CollisionGrid,
  playerStart,
  floorZones: level1V2FloorZones,
  rooms: level1V2Rooms,
  spaces: [...level1V2Rooms, ...level1V2Corridors],
  openAreas: level1V2OpenAreas,
  openSides: level1V2OpenSides,
  corridors: level1V2Corridors,
  connectors: [],
  doorways: [],
  wallSegments: [],
  partitionBands: [],
  objectives: [],
  goals: [],
  checkpoints: [],
  triggers: [],
  crushers: [],
  sentientObjects: [],
  architecture: level1V2Architecture,
  collisionVolumes: [],
  routes: [],
  guideStrips: [],
  navigationNodes: [],
  areaLights: [],
  ceilingLights: [],
  hazards: [],
  storyBeats: [],
  manipulationNodes: [],
  lightingZones: [],
  wallDetailZones: [],
  ceilingDetailZones: [],
  proceduralFallbackRules: [],
  clearPathRules: [],
  notes: [
    'Level 1 V2 Room A shell test.',
    'Only Room A is added inside the empty field baseline.',
    'Architecture, corridor, furniture, objects, models, and gameplay tasks are disabled.'
  ]
};

export const level1V2RoomAShellValidation = validateLevel1V2RoomAShell(level1V2);

if (CONSTANTS.DEV_MODE && !level1V2RoomAShellValidation.valid) {
  console.warn('Level 1 V2 Room A shell validation', level1V2RoomAShellValidation);
}

if (CONSTANTS.DEV_MODE) {
  printLevel1V2AsciiGrid(level1V2);
}
