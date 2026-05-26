import { CONSTANTS } from '../core/Constants.js';

const GRID_WIDTH = 32;
const GRID_HEIGHT = 24;

function buildFloorZonePreviewGrid() {
  return Array.from({ length: GRID_HEIGHT }, (_, y) =>
    Array.from({ length: GRID_WIDTH }, (_, x) => {
      const isBorder =
        x === 0 ||
        y === 0 ||
        x === GRID_WIDTH - 1 ||
        y === GRID_HEIGHT - 1;

      return isBorder ? CONSTANTS.CELL_WALL : CONSTANTS.CELL_PATH;
    })
  );
}

function withTopLevelBounds(area) {
  return {
    ...area,
    ...area.bounds
  };
}

const level1V2FloorplanRooms = [
  {
    code: 'A',
    id: 'front-admin-intake',
    label: 'Front Admin / Employee Intake',
    bounds: { x1: 2, y1: 3, x2: 9, y2: 7 },
    accessStyle: 'semi-open admin bay / open side toward central route',
    status: 'floorplan-preview'
  },
  {
    code: 'B',
    id: 'canteen',
    label: 'Canteen',
    bounds: { x1: 2, y1: 8, x2: 9, y2: 12 },
    accessStyle: 'side opening toward central route',
    status: 'floorplan-preview'
  },
  {
    code: 'E',
    id: 'toilet',
    label: 'Toilet',
    bounds: { x1: 2, y1: 13, x2: 6, y2: 15 },
    accessStyle: 'narrow controlled access',
    status: 'floorplan-preview'
  },
  {
    code: 'F',
    id: 'records-archive',
    label: 'Records Archive',
    bounds: { x1: 2, y1: 17, x2: 12, y2: 22 },
    accessStyle: 'controlled archive access',
    status: 'floorplan-preview'
  },
  {
    code: 'C',
    id: 'main-workstation-hall',
    label: 'Main Workstation Hall',
    bounds: { x1: 14, y1: 3, x2: 29, y2: 8 },
    accessStyle: 'wider workstation threshold',
    status: 'floorplan-preview'
  },
  {
    code: 'D',
    id: 'boardroom-review',
    label: 'Boardroom / Review Room',
    bounds: { x1: 14, y1: 10, x2: 29, y2: 15 },
    accessStyle: 'formal centered access',
    status: 'floorplan-preview'
  },
  {
    code: 'H',
    id: 'level2-access',
    label: 'Lift / Stairs to Level 2',
    bounds: { x1: 14, y1: 17, x2: 17, y2: 22 },
    accessStyle: 'progression access',
    status: 'floorplan-preview'
  },
  {
    code: 'G',
    id: 'secondary-workstation',
    label: 'Secondary Workstation / Accounts Processing',
    bounds: { x1: 19, y1: 17, x2: 29, y2: 22 },
    accessStyle: 'rear/side access from H or lower route',
    status: 'floorplan-preview'
  }
].map(withTopLevelBounds);

const level1V2CentralRoute = withTopLevelBounds({
  code: 'R',
  id: 'central-route',
  label: 'Central Route',
  bounds: { x1: 10, y1: 3, x2: 13, y2: 22 },
  accessStyle: 'main vertical route spine',
  status: 'floorplan-preview'
});

const floorZoneColors = {
  'front-admin-intake': 0x9caeae,
  canteen: 0x9aad9a,
  toilet: 0xa7bdc2,
  'records-archive': 0x8b969c,
  'central-route': 0x707a7a,
  'main-workstation-hall': 0xaeb7ba,
  'boardroom-review': 0xa3bcc2,
  'level2-access': 0x8db8af,
  'secondary-workstation': 0xb7b6a6
};

function createFloorZoneFromBounds(source, overrides = {}) {
  const { x1, y1, x2, y2 } = source.bounds;

  return {
    id: source.id,
    x1,
    y1,
    x2,
    y2,
    color: floorZoneColors[source.id],
    emissive: 0x101616,
    emissiveIntensity: 0.04,
    roughness: 0.76,
    height: 0,
    floorLineColor: 0x7f8988,
    floorLineOpacity: 0.14,
    floorLineStep: 2,
    ...overrides
  };
}

const level1V2FloorZones = [
  ...level1V2FloorplanRooms
    .slice(0, 4)
    .map(room => createFloorZoneFromBounds(room)),
  createFloorZoneFromBounds(level1V2CentralRoute, {
    floorLineOpacity: 0.18,
    floorLineStep: 3
  }),
  ...level1V2FloorplanRooms
    .slice(4)
    .map(room => createFloorZoneFromBounds(room)),
  {
    id: 'empty-field',
    x1: 1,
    y1: 1,
    x2: GRID_WIDTH - 2,
    y2: GRID_HEIGHT - 2,
    color: 0x7f8888,
    emissive: 0x101616,
    emissiveIntensity: 0.04,
    roughness: 0.76,
    height: 0,
    floorLineColor: 0x7f8988,
    floorLineOpacity: 0.14,
    floorLineStep: 2
  }
];

const level1V2CollisionGrid = buildFloorZonePreviewGrid();

const playerStart = {
  x: 5,
  y: 5,
  yaw: 0,
  pitch: -0.04
};

function isCellInBounds(x, y, bounds) {
  return x >= bounds.x1 && x <= bounds.x2 && y >= bounds.y1 && y <= bounds.y2;
}

function formatBounds(bounds) {
  return `x1=${bounds.x1}, y1=${bounds.y1}, x2=${bounds.x2}, y2=${bounds.y2}`;
}

function findRoomAt(x, y) {
  return level1V2FloorplanRooms.find(room => isCellInBounds(x, y, room.bounds));
}

function createLevel1V2AsciiPreview(level) {
  const playerStartCell = {
    x: Math.floor(level.playerStart.x),
    y: Math.floor(level.playerStart.y)
  };

  const rows = level.grid.map((row, y) => row.map((cell, x) => {
    if (cell === CONSTANTS.CELL_WALL) return '#';
    if (x === playerStartCell.x && y === playerStartCell.y) return 'P';

    const room = findRoomAt(x, y);
    if (room) return room.code;
    if (isCellInBounds(x, y, level1V2CentralRoute.bounds)) return level1V2CentralRoute.code;
    if (cell === CONSTANTS.CELL_PATH) return '.';
    return '?';
  }).join(''));

  return [
    `grid: ${level.grid[0]?.length ?? 0} x ${level.grid.length}`,
    `playerStart: x=${level.playerStart.x}, y=${level.playerStart.y}, yaw=${level.playerStart.yaw}, pitch=${level.playerStart.pitch}`,
    'rooms:',
    ...level1V2FloorplanRooms.map(room => `${room.code} ${room.id}: ${formatBounds(room.bounds)}`),
    `central route ${level1V2CentralRoute.code} ${level1V2CentralRoute.id}: ${formatBounds(level1V2CentralRoute.bounds)}`,
    'map:',
    ...rows
  ].join('\n');
}

function printLevel1V2AsciiGrid(level) {
  console.info('[MazeMind] Level 1 V2 Floorplan ASCII Preview:\n' + createLevel1V2AsciiPreview(level));
}

function areBoundsInsideInterior(bounds) {
  return (
    bounds.x1 >= 1 &&
    bounds.y1 >= 1 &&
    bounds.x2 <= GRID_WIDTH - 2 &&
    bounds.y2 <= GRID_HEIGHT - 2 &&
    bounds.x1 <= bounds.x2 &&
    bounds.y1 <= bounds.y2
  );
}

function doBoundsOverlap(first, second) {
  return !(
    first.x2 < second.x1 ||
    second.x2 < first.x1 ||
    first.y2 < second.y1 ||
    second.y2 < first.y1
  );
}

function doBoundsFullyCover(coveringBounds, targetBounds) {
  return (
    coveringBounds.x1 <= targetBounds.x1 &&
    coveringBounds.y1 <= targetBounds.y1 &&
    coveringBounds.x2 >= targetBounds.x2 &&
    coveringBounds.y2 >= targetBounds.y2
  );
}

function isPathCell(grid, x, y) {
  return grid[y]?.[x] === CONSTANTS.CELL_PATH;
}

function isPlayerStartNearRoom(playerStartCell, bounds) {
  const clampedX = Math.max(bounds.x1, Math.min(playerStartCell.x, bounds.x2));
  const clampedY = Math.max(bounds.y1, Math.min(playerStartCell.y, bounds.y2));
  const distance = Math.abs(playerStartCell.x - clampedX) + Math.abs(playerStartCell.y - clampedY);
  return distance <= 2;
}

function validateLevel1V2FloorplanPreview(level) {
  const grid = level.grid;
  const height = grid.length;
  const width = grid[0]?.length ?? 0;
  const warnings = [];

  if (width !== GRID_WIDTH || height !== GRID_HEIGHT || grid.some(row => row.length !== GRID_WIDTH)) {
    warnings.push(`grid size must be ${GRID_WIDTH} x ${GRID_HEIGHT}, found ${width} x ${height}`);
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < (grid[y]?.length ?? 0); x++) {
      const isBorder =
        x === 0 ||
        y === 0 ||
        x === GRID_WIDTH - 1 ||
        y === GRID_HEIGHT - 1;

      if (isBorder && grid[y][x] !== CONSTANTS.CELL_WALL) {
        warnings.push(`outer boundary cell ${x},${y} must be CELL_WALL`);
      }

      if (!isBorder && grid[y][x] !== CONSTANTS.CELL_PATH) {
        warnings.push(`interior cell ${x},${y} must be CELL_PATH`);
      }
    }
  }

  [
    'architecture',
    'objectives',
    'checkpoints',
    'triggers',
    'crushers',
    'sentientObjects'
  ].forEach(key => {
    if ((level[key] ?? []).length !== 0) {
      warnings.push(`${key} must be empty in floorplan preview mode`);
    }
  });

  level1V2FloorplanRooms.forEach(room => {
    if (!areBoundsInsideInterior(room.bounds)) {
      warnings.push(`${room.code} bounds must stay inside the playable interior`);
    }
  });

  if (!areBoundsInsideInterior(level1V2CentralRoute.bounds)) {
    warnings.push('central route bounds must stay inside the playable interior');
  }

  for (let firstIndex = 0; firstIndex < level1V2FloorplanRooms.length; firstIndex++) {
    for (let secondIndex = firstIndex + 1; secondIndex < level1V2FloorplanRooms.length; secondIndex++) {
      const first = level1V2FloorplanRooms[firstIndex];
      const second = level1V2FloorplanRooms[secondIndex];
      if (doBoundsOverlap(first.bounds, second.bounds)) {
        warnings.push(`${first.code} room bounds overlap ${second.code} room bounds`);
      }
    }
  }

  level1V2FloorplanRooms.forEach(room => {
    if (doBoundsFullyCover(level1V2CentralRoute.bounds, room.bounds)) {
      warnings.push(`central route must not fully cover room ${room.code}`);
    }
  });

  const emptyFieldIndex = level.floorZones.findIndex(zone => zone.id === 'empty-field');
  if (emptyFieldIndex === -1) {
    warnings.push('empty-field floor zone is missing');
  } else {
    [...level1V2FloorplanRooms, level1V2CentralRoute].forEach(zoneSource => {
      const zoneIndex = level.floorZones.findIndex(zone => zone.id === zoneSource.id);
      if (zoneIndex === -1) {
        warnings.push(`${zoneSource.id} floor zone is missing`);
      } else if (zoneIndex > emptyFieldIndex) {
        warnings.push(`${zoneSource.id} floor zone must come before empty-field`);
      }
    });
  }

  const playerStartCell = {
    x: Math.floor(level.playerStart.x),
    y: Math.floor(level.playerStart.y)
  };
  const roomA = level1V2FloorplanRooms.find(room => room.code === 'A');
  const playerStartOpen = isPathCell(grid, playerStartCell.x, playerStartCell.y);
  const playerStartInsideA = roomA ? isCellInBounds(playerStartCell.x, playerStartCell.y, roomA.bounds) : false;
  const playerStartNearA = roomA ? isPlayerStartNearRoom(playerStartCell, roomA.bounds) : false;

  if (!playerStartOpen) {
    warnings.push(`playerStart must be CELL_PATH, found blocked cell at ${playerStartCell.x},${playerStartCell.y}`);
  }

  if (!playerStartInsideA && !playerStartNearA) {
    warnings.push('playerStart must be inside A or near A');
  }

  return {
    valid: warnings.length === 0,
    warnings,
    details: {
      gridWidth: width,
      gridHeight: height,
      roomCount: level1V2FloorplanRooms.length,
      centralRouteBounds: level1V2CentralRoute.bounds,
      playerStartCell,
      playerStartOpen,
      playerStartInsideA,
      playerStartNearA,
      floorZoneOrder: level.floorZones.map(zone => zone.id),
      architectureEmpty: level.architecture.length === 0,
      objectivesEmpty: level.objectives.length === 0,
      interiorCellsArePath: !warnings.some(warning => warning.includes('interior cell'))
    }
  };
}

export const level1V2 = {
  schemaVersion: 1,
  id: 'level-1-v2',
  label: 'Level 1 V2 Floorplan Zone Preview',
  title: 'Level 1 V2 Floorplan Zone Preview',
  version: 'v2-floorplan-zone-preview',
  status: 'floorplan-zone-preview',
  floorplanPreview: true,
  mapBuildMode: 'floorplan-zones-only',
  active: true,
  estimatedMinutes: 0,
  grid: level1V2CollisionGrid,
  collisionGrid: level1V2CollisionGrid,
  playerStart,
  rooms: level1V2FloorplanRooms,
  corridors: [level1V2CentralRoute],
  floorZones: level1V2FloorZones,
  architecture: [],
  objectives: [],
  goals: [],
  checkpoints: [],
  triggers: [],
  crushers: [],
  sentientObjects: [],
  collisionVolumes: [],
  routes: [],
  guideStrips: [],
  navigationNodes: [],
  areaLights: [],
  ceilingLights: [],
  wallSegments: [],
  partitionBands: [],
  doorways: [],
  connectors: [],
  hazards: [],
  storyBeats: [],
  manipulationNodes: [],
  lightingZones: [],
  wallDetailZones: [],
  ceilingDetailZones: [],
  notes: [
    'Level 1 V2 floorplan zone preview. No walls or tasks yet.',
    'A-H rooms and the central route are shown as floor colors only.',
    'Only the outer boundary wall exists; every interior cell remains CELL_PATH.'
  ]
};

export const level1V2AsciiPreview = createLevel1V2AsciiPreview(level1V2);
export const level1V2FloorplanPreviewValidation = validateLevel1V2FloorplanPreview(level1V2);

if (CONSTANTS.DEV_MODE) {
  printLevel1V2AsciiGrid(level1V2);

  if (level1V2FloorplanPreviewValidation.valid) {
    console.info('[MazeMind] Level 1 V2 floorplan preview validation passed', level1V2FloorplanPreviewValidation);
  } else {
    console.warn('[MazeMind] Level 1 V2 floorplan preview validation warnings', level1V2FloorplanPreviewValidation);
  }
}
