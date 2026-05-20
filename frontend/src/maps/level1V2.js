import { CONSTANTS } from '../core/Constants.js';
import {
  LEVEL1_V2_GLOBAL_PLACEMENT_RULES,
  LEVEL1_V2_ROOM_ASSET_MANIFEST,
  LEVEL1_V2_ROOM_REPAIR_PRIORITIES,
  summarizeLevel1V2RoomAssetManifest,
  validateLevel1V2ArchitectureAgainstManifest
} from '../assets/level1V2RoomAssetManifest.js';

const GRID_WIDTH = 36;
const GRID_HEIGHT = 26;

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

function createRoom({ code, id, label, bounds, color, purpose, roomFunction, notes = [] }) {
  const gridWidth = bounds.x2 - bounds.x1;
  const gridHeight = bounds.y2 - bounds.y1;

  return {
    code,
    id,
    label,
    ...bounds,
    bounds,
    gridSizeCells: { width: gridWidth, depth: gridHeight },
    worldSizeMeters: {
      width: metersFromCells(gridWidth),
      depth: metersFromCells(gridHeight)
    },
    function: roomFunction,
    purpose,
    color,
    notes
  };
}

const level1V2Rooms = [
  createRoom({
    code: 'A',
    id: 'front-admin-intake',
    label: 'Front Admin / Employee Intake',
    bounds: { x1: 2, y1: 19, x2: 10, y2: 24 },
    color: 0xb8c6cc,
    purpose: 'first admin/intake space',
    roomFunction: 'first admin/intake space'
  }),
  createRoom({
    code: 'B',
    id: 'canteen',
    label: 'Staff Canteen',
    bounds: { x1: 2, y1: 12, x2: 10, y2: 18 },
    color: 0xb7c2b6,
    purpose: 'staff canteen / break area',
    roomFunction: 'staff canteen / break area'
  }),
  createRoom({
    code: 'E',
    id: 'toilet',
    label: 'Restroom',
    bounds: { x1: 2, y1: 8, x2: 7, y2: 11 },
    color: 0xc0d0d2,
    purpose: 'restroom / toilet area',
    roomFunction: 'restroom / toilet area'
  }),
  createRoom({
    code: 'F',
    id: 'records-archive',
    label: 'Records Archive',
    bounds: { x1: 2, y1: 2, x2: 12, y2: 7 },
    color: 0x929da2,
    purpose: 'archive / records storage',
    roomFunction: 'archive / records storage',
    notes: ['Archive stays left of the main corridor with a controlled doorway for map-shell readability.']
  }),
  createRoom({
    code: 'C',
    id: 'main-workstation-hall',
    label: 'Main Workstation Hall',
    bounds: { x1: 16, y1: 19, x2: 32, y2: 24 },
    color: 0xb4bbbd,
    purpose: 'main employee workstation rows',
    roomFunction: 'main employee workstation rows'
  }),
  createRoom({
    code: 'D',
    id: 'boardroom-review',
    label: 'Boardroom / Review Room',
    bounds: { x1: 16, y1: 10, x2: 31, y2: 18 },
    color: 0xb0c8cc,
    purpose: 'boardroom / formal review chamber',
    roomFunction: 'boardroom / formal review chamber'
  }),
  createRoom({
    code: 'G',
    id: 'secondary-workstation',
    label: 'Secondary Workstation / Accounts Processing',
    bounds: { x1: 22, y1: 2, x2: 32, y2: 7 },
    color: 0xbebfb3,
    purpose: 'secondary workstation / accounts processing',
    roomFunction: 'secondary workstation / accounts processing'
  }),
  createRoom({
    code: 'H',
    id: 'level2-access',
    label: 'Lift / Stairs to Level 2',
    bounds: { x1: 16, y1: 2, x2: 20, y2: 7 },
    color: 0xaac6c0,
    purpose: 'elevator or stairwell access to level 2',
    roomFunction: 'elevator or stairwell access to level 2'
  })
];

const level1V2MainCorridor = {
  id: 'main-corridor',
  label: 'Main Corridor',
  x1: 12,
  y1: 2,
  x2: 14,
  y2: 24,
  bounds: { x1: 12, y1: 2, x2: 14, y2: 24 },
  gridSizeCells: { width: 3, depth: 22 },
  worldSizeMeters: { width: metersFromCells(3), depth: metersFromCells(22) },
  function: 'main vertical player route',
  purpose: 'route spine',
  decorativeRoom: false,
  furnitureAllowed: false,
  mustStayMostlyClear: true,
  color: 0x7f8888
};

const level1V2Doorways = [
  {
    id: 'door-front-admin-to-main-corridor',
    from: 'front-admin-intake',
    to: 'main-corridor',
    bounds: { x1: 11, y1: 21, x2: 12, y2: 21 },
    clearWidthCells: 1,
    clearWidthMeters: level1V2MapDimensions.standardDoorWidthMeters,
    rule: 'Front intake doorway stays free of desks, chairs, signs, and plants.'
  },
  {
    id: 'door-canteen-to-main-corridor',
    from: 'canteen',
    to: 'main-corridor',
    bounds: { x1: 11, y1: 15, x2: 12, y2: 15 },
    clearWidthCells: 1,
    clearWidthMeters: level1V2MapDimensions.standardDoorWidthMeters,
    rule: 'No seating or utility props in canteen doorway.'
  },
  {
    id: 'door-toilet-to-main-corridor',
    from: 'toilet',
    to: 'main-corridor',
    bounds: [
      { x1: 7, y1: 9, x2: 8, y2: 9 },
      { x1: 11, y1: 9, x2: 12, y2: 9 }
    ],
    clearWidthCells: 1,
    clearWidthMeters: level1V2MapDimensions.standardDoorWidthMeters,
    rule: 'Restroom fixtures never intrude into the doorway.'
  },
  {
    id: 'door-records-to-main-corridor',
    from: 'records-archive',
    to: 'main-corridor',
    bounds: { x1: 11, y1: 5, x2: 12, y2: 5 },
    clearWidthCells: 1,
    clearWidthMeters: level1V2MapDimensions.standardDoorWidthMeters,
    rule: 'Archive rack rows keep this doorway and aisle readable.'
  },
  {
    id: 'door-main-corridor-to-main-workstation',
    from: 'main-corridor',
    to: 'main-workstation-hall',
    bounds: { x1: 15, y1: 21, x2: 16, y2: 21 },
    clearWidthCells: 1,
    clearWidthMeters: level1V2MapDimensions.standardDoorWidthMeters,
    rule: 'Workstation chairs and clusters do not spill into this connector.'
  },
  {
    id: 'door-main-corridor-to-boardroom',
    from: 'main-corridor',
    to: 'boardroom-review',
    bounds: { x1: 15, y1: 14, x2: 16, y2: 14 },
    clearWidthCells: 1,
    clearWidthMeters: level1V2MapDimensions.standardDoorWidthMeters,
    rule: 'Meeting furniture stays clear of the boardroom approach.'
  },
  {
    id: 'door-main-corridor-to-level2-access',
    from: 'main-corridor',
    to: 'level2-access',
    bounds: { x1: 15, y1: 5, x2: 16, y2: 5 },
    clearWidthCells: 1,
    clearWidthMeters: level1V2MapDimensions.standardDoorWidthMeters,
    rule: 'The elevator/stair approach remains clear by at least 1.5m.'
  },
  {
    id: 'door-level2-access-to-secondary-workstation',
    from: 'level2-access',
    to: 'secondary-workstation',
    bounds: { x1: 21, y1: 5, x2: 22, y2: 5 },
    clearWidthCells: 1,
    clearWidthMeters: level1V2MapDimensions.standardDoorWidthMeters,
    rule: 'Accounts furniture must not block Level 2 access circulation.'
  }
];

const level1V2ClearPathRules = [
  {
    id: 'main-corridor-clear-route',
    bounds: level1V2MainCorridor.bounds,
    minClearWidthCells: level1V2MovementStandards.mainCorridorClearWidthCells,
    minClearWidthMeters: level1V2MovementStandards.mainCorridorClearWidthMeters,
    rules: [
      'Main corridor must remain clear.',
      'Furniture must not occupy main corridor bounds.',
      'Chairs must not extend into main corridor.',
      'Wall-bound objects may face the corridor only when mounted from inside room bounds.'
    ]
  },
  {
    id: 'doorway-clearance',
    doorways: level1V2Doorways.map(doorway => doorway.id),
    minClearanceMeters: level1V2MovementStandards.doorwayClearanceMeters,
    rules: [
      'Doorway areas must not contain furniture.',
      'Important doorway clear width should be at least 1.5 cells if possible.',
      'Standard doorway clear width must be at least 1 cell.'
    ]
  },
  {
    id: 'level2-access-approach',
    roomId: 'level2-access',
    minClearanceMeters: level1V2MovementStandards.elevatorApproachClearanceMeters,
    rules: [
      'Elevator/stairs approach area must remain clear by at least 1.5m to 2.0m.',
      'No office furniture belongs in H / level2-access.'
    ]
  }
];

const level1V2WallSegments = [
  {
    id: 'left-wing-west-outer-wall',
    kind: 'outer-wall',
    x1: 1,
    y1: 1,
    x2: 1,
    y2: 25,
    purpose: 'Defines the outside edge of the A/B/E/F wing.'
  },
  {
    id: 'left-wing-north-outer-wall',
    kind: 'outer-wall',
    x1: 1,
    y1: 1,
    x2: 12,
    y2: 1,
    purpose: 'Defines the top edge of the left room stack.'
  },
  {
    id: 'left-wing-south-outer-wall',
    kind: 'outer-wall',
    x1: 1,
    y1: 25,
    x2: 11,
    y2: 25,
    purpose: 'Defines the lower edge of the admin room.'
  },
  {
    id: 'left-corridor-boundary-wall',
    kind: 'corridor-boundary',
    x1: 11,
    y1: 2,
    x2: 11,
    y2: 24,
    doorwayIds: [
      'door-front-admin-to-main-corridor',
      'door-canteen-to-main-corridor',
      'door-toilet-to-main-corridor',
      'door-records-to-main-corridor'
    ],
    purpose: 'Keeps corridor cells x=12..14 open while separating the left rooms.'
  },
  {
    id: 'left-stack-admin-canteen-separator',
    kind: 'room-separator',
    x1: 2,
    y1: 19,
    x2: 11,
    y2: 19,
    purpose: 'Separates A from B.'
  },
  {
    id: 'left-stack-canteen-toilet-separator',
    kind: 'room-separator',
    x1: 2,
    y1: 12,
    x2: 11,
    y2: 12,
    purpose: 'Separates B from E.'
  },
  {
    id: 'left-stack-toilet-archive-separator',
    kind: 'room-separator',
    x1: 2,
    y1: 8,
    x2: 11,
    y2: 8,
    purpose: 'Separates E from F and keeps the toilet compact.'
  },
  {
    id: 'records-archive-internal-wall-stub',
    kind: 'internal-stub',
    x1: 6,
    y1: 3,
    x2: 6,
    y2: 5,
    purpose: 'Adds a structural notch to F without placing archive objects.'
  },
  {
    id: 'right-corridor-boundary-wall',
    kind: 'corridor-boundary',
    x1: 15,
    y1: 2,
    x2: 15,
    y2: 24,
    doorwayIds: [
      'door-main-corridor-to-main-workstation',
      'door-main-corridor-to-boardroom',
      'door-main-corridor-to-level2-access'
    ],
    purpose: 'Keeps corridor cells x=12..14 open while separating the right rooms.'
  },
  {
    id: 'right-wing-east-outer-wall',
    kind: 'outer-wall',
    x1: 33,
    y1: 1,
    x2: 33,
    y2: 25,
    purpose: 'Leaves a wall/void buffer beyond the right-side rooms.'
  },
  {
    id: 'right-wing-north-outer-wall',
    kind: 'outer-wall',
    x1: 15,
    y1: 1,
    x2: 33,
    y2: 1,
    purpose: 'Defines the top edge of the H/G rooms.'
  },
  {
    id: 'right-wing-south-outer-wall',
    kind: 'outer-wall',
    x1: 15,
    y1: 25,
    x2: 33,
    y2: 25,
    purpose: 'Defines the lower edge of the main workstation hall.'
  },
  {
    id: 'main-workstation-boardroom-separator',
    kind: 'room-separator',
    x1: 16,
    y1: 19,
    x2: 33,
    y2: 19,
    purpose: 'Separates C from D.'
  },
  {
    id: 'boardroom-lower-access-separator',
    kind: 'room-separator',
    x1: 16,
    y1: 8,
    x2: 33,
    y2: 8,
    purpose: 'Separates D from H/G.'
  },
  {
    id: 'level2-secondary-separator',
    kind: 'room-separator',
    x1: 21,
    y1: 2,
    x2: 21,
    y2: 7,
    doorwayIds: ['door-level2-access-to-secondary-workstation'],
    purpose: 'Keeps H and G separate with one controlled connector.'
  },
  {
    id: 'main-workstation-entry-stub',
    kind: 'internal-stub',
    x1: 16,
    y1: 22,
    x2: 18,
    y2: 22,
    purpose: 'Breaks the C doorway silhouette without adding furniture.'
  },
  {
    id: 'boardroom-entry-stub',
    kind: 'internal-stub',
    x1: 16,
    y1: 15,
    x2: 18,
    y2: 15,
    purpose: 'Gives D a recessed entry rather than a flat rectangular opening.'
  }
];

const level1V2FloorplanBlueprint = {
  gridWidth: GRID_WIDTH,
  gridHeight: GRID_HEIGHT,
  openAreas: [
    { id: 'A-open', roomId: 'front-admin-intake', x1: 2, y1: 19, x2: 10, y2: 24 },
    { id: 'B-open', roomId: 'canteen', x1: 2, y1: 12, x2: 10, y2: 18 },
    { id: 'E-open', roomId: 'toilet', x1: 2, y1: 8, x2: 7, y2: 11 },
    { id: 'E-connector-open', roomId: 'toilet', x1: 8, y1: 9, x2: 12, y2: 9 },
    { id: 'F-open', roomId: 'records-archive', x1: 2, y1: 2, x2: 10, y2: 7 },
    { id: 'main-corridor-open', roomId: 'main-corridor', x1: 12, y1: 2, x2: 14, y2: 24 },
    { id: 'C-open', roomId: 'main-workstation-hall', x1: 16, y1: 19, x2: 32, y2: 24 },
    { id: 'D-open', roomId: 'boardroom-review', x1: 16, y1: 10, x2: 31, y2: 18 },
    { id: 'H-open', roomId: 'level2-access', x1: 16, y1: 2, x2: 20, y2: 7 },
    { id: 'G-open', roomId: 'secondary-workstation', x1: 22, y1: 2, x2: 32, y2: 7 }
  ],
  wallLines: level1V2WallSegments,
  doorOpenings: level1V2Doorways,
  roomMetadata: [...level1V2Rooms, level1V2MainCorridor]
};

const level1V2ProceduralFallbackRules = [
  'Do not add GLB model metadata in this scaffold.',
  'Do not download or reference runtime external model URLs.',
  'Use existing officeProps prefabs only when the prefab role matches the room function.',
  'Use "procedural" in the manifest when a dedicated prefab does not exist yet.',
  'Do not fill empty space with random props; empty space is valid until the room-specific prefab exists.',
  'Fallback placeholders must stay inside their matching placement zone and out of forbidden zones.'
];

const level1V2RoomLayoutSpecs = {
  globalRules: [
    'Every object must belong to the purpose of its room.',
    'Main corridor must remain clear.',
    'Doorway zones must remain clear.',
    'Do not place isolated columns.',
    'Do not fill empty space with random props.',
    'Room placement follows LEVEL1_V2_ROOM_ASSET_MANIFEST.',
    'Model roles must be separated by function.',
    'officeChair is for workstations only.',
    'canteenChair is for canteen only.',
    'meetingChair is for boardroom/review only.',
    'Toilet props must never be office furniture.',
    'level2-access must remain sterile and clear.'
  ],
  rooms: {
    'front-admin-intake': {
      role: 'First admin/intake space.',
      clearPath: 'Keep the corridor entry and approach to the intake desk open.',
      allowedObjectThemes: ['intake desk', 'optional front counter', 'visible task terminal', 'small corner plant', 'entry sign'],
      forbiddenObjects: LEVEL1_V2_ROOM_ASSET_MANIFEST['front-admin-intake'].forbiddenObjects,
      forbiddenZones: LEVEL1_V2_ROOM_ASSET_MANIFEST['front-admin-intake'].forbiddenZones,
      notes: ['Desk faces player approach.', 'Do not overfill with waiting-room furniture.']
    },
    canteen: {
      role: 'Staff canteen / break area.',
      clearPath: 'Keep the door to main corridor clear and seating contained.',
      allowedObjectThemes: ['canteen tables', 'canteen chairs', 'wall utility appliances', 'entry sign'],
      forbiddenObjects: LEVEL1_V2_ROOM_ASSET_MANIFEST.canteen.forbiddenObjects,
      forbiddenZones: LEVEL1_V2_ROOM_ASSET_MANIFEST.canteen.forbiddenZones,
      notes: ['Do not use office chairs.', 'Wall utility props stay wall-bound.']
    },
    'main-workstation-hall': {
      role: 'Main employee workstation rows.',
      clearPath: 'Central aisle and main-corridor connector remain open.',
      allowedObjectThemes: ['workstation clusters', 'office desks', 'office chairs', 'monitors', 'partitions', 'copy machine', 'department sign'],
      forbiddenObjects: LEVEL1_V2_ROOM_ASSET_MANIFEST['main-workstation-hall'].forbiddenObjects,
      forbiddenZones: LEVEL1_V2_ROOM_ASSET_MANIFEST['main-workstation-hall'].forbiddenZones,
      notes: ['Rows stay aligned.', 'Office chairs face desks.']
    },
    'boardroom-review': {
      role: 'Boardroom / formal review chamber.',
      clearPath: 'Doorway and connector clear path stay free around the table.',
      allowedObjectThemes: ['conference table', 'meeting chairs', 'review terminal', 'presentation wall', 'boundary glass', 'entry sign'],
      forbiddenObjects: LEVEL1_V2_ROOM_ASSET_MANIFEST['boardroom-review'].forbiddenObjects,
      forbiddenZones: LEVEL1_V2_ROOM_ASSET_MANIFEST['boardroom-review'].forbiddenZones,
      notes: ['MeetingTable is only a temporary scaffold fallback for a future conference table.']
    },
    toilet: {
      role: 'Restroom / toilet area.',
      clearPath: 'Doorway remains clear; fixtures stay wall-side or rear-side.',
      allowedObjectThemes: ['stalls', 'sink', 'mirror', 'hand dryer', 'trash bin', 'restroom sign'],
      forbiddenObjects: LEVEL1_V2_ROOM_ASSET_MANIFEST.toilet.forbiddenObjects,
      forbiddenZones: LEVEL1_V2_ROOM_ASSET_MANIFEST.toilet.forbiddenZones,
      notes: ['No office furniture.', 'No workstation props.']
    },
    'records-archive': {
      role: 'Archive / records storage.',
      clearPath: 'Aisle between rack rows and archive doorway stay clear.',
      allowedObjectThemes: ['archive racks', 'server rack placeholder', 'filing cabinets', 'archive boxes', 'document packet', 'archive sign'],
      forbiddenObjects: LEVEL1_V2_ROOM_ASSET_MANIFEST['records-archive'].forbiddenObjects,
      forbiddenZones: LEVEL1_V2_ROOM_ASSET_MANIFEST['records-archive'].forbiddenZones,
      notes: ['Rows and cabinets are storage-only.', 'No sofa, canteen, or meeting furniture.']
    },
    'secondary-workstation': {
      role: 'Secondary workstation / accounts processing.',
      clearPath: 'Central aisle and level2-access connector stay clear.',
      allowedObjectThemes: ['smaller desk rows', 'office chairs', 'monitors', 'filing cabinets', 'document trays', 'task terminal', 'department sign'],
      forbiddenObjects: LEVEL1_V2_ROOM_ASSET_MANIFEST['secondary-workstation'].forbiddenObjects,
      forbiddenZones: LEVEL1_V2_ROOM_ASSET_MANIFEST['secondary-workstation'].forbiddenZones,
      notes: ['Smaller and quieter than the main workstation hall.', 'Keep Level 2 access readable.']
    },
    'level2-access': {
      role: 'Lift / stairs to Level 2.',
      clearPath: 'Elevator/stairs approach and corridor endpoint stay clear.',
      allowedObjectThemes: ['elevator door placeholder', 'stairwell door placeholder', 'access panel', 'level 2 sign', 'warning trim'],
      forbiddenObjects: LEVEL1_V2_ROOM_ASSET_MANIFEST['level2-access'].forbiddenObjects,
      forbiddenZones: LEVEL1_V2_ROOM_ASSET_MANIFEST['level2-access'].forbiddenZones,
      notes: ['No Level 2 transition logic yet.', 'No office furniture.']
    }
  }
};

const level1V2FuturePlacementAnchors = {
  'front-admin-intake': {
    roomId: 'front-admin-intake',
    roomBounds: { x1: 2, y1: 23, x2: 12, y2: 29 },
    entranceSide: 'east from main corridor',
    exitSide: 'east to main corridor',
    mainAisle: {
      id: 'front-admin-corridor-approach',
      bounds: { x1: 8.2, y1: 25, x2: 12, y2: 27.2 },
      widthCells: 2,
      rule: 'Keep approach from corridor to intake desk open.'
    },
    furnitureZones: [
      {
        id: 'intakeDeskZone',
        allowedTypes: ['intakeDesk', 'taskTerminal', 'documentTray'],
        bounds: { x1: 4.0, y1: 25.0, x2: 7.2, y2: 26.8 },
        center: { x: 5.6, y: 26.0 }
      },
      {
        id: 'frontCounterZone',
        allowedTypes: ['receptionDesk'],
        bounds: { x1: 3.0, y1: 27.3, x2: 8.1, y2: 28.6 }
      },
      {
        id: 'cornerPlantZone',
        allowedTypes: ['pottedPlant'],
        bounds: { x1: 10.6, y1: 27.2, x2: 11.8, y2: 28.7 }
      }
    ],
    signageZones: [
      {
        id: 'adminEntrySignZone',
        prefab: 'wallSign',
        text: 'ADMIN\nINTAKE',
        allowedTypes: ['wallSign'],
        bounds: { x1: 6.5, y1: 23.8, x2: 8.5, y2: 24.2 },
        mount: 'wall',
        wall: 'north',
        coord: 7.5,
        height: 2.02,
        maxWidth: 1.55
      }
    ],
    forbiddenZones: [
      {
        id: 'mainCorridorEntry',
        bounds: { x1: 13, y1: 25, x2: 16, y2: 27 },
        rule: 'No furniture in the corridor-side entry.'
      },
      {
        id: 'doorwayToMainCorridor',
        bounds: { x1: 12, y1: 26, x2: 14, y2: 26 },
        rule: 'Doorway clear width must remain open.'
      }
    ]
  },
  canteen: {
    roomId: 'canteen',
    roomBounds: { x1: 2, y1: 16, x2: 12, y2: 22 },
    entranceSide: 'east from main corridor',
    furnitureZones: [
      {
        id: 'canteenSeatingZone',
        allowedTypes: ['canteenTable', 'canteenChair'],
        bounds: { x1: 4.0, y1: 18.0, x2: 10.5, y2: 21.2 }
      },
      {
        id: 'canteenWallUtilityZone',
        allowedTypes: ['vendingMachine', 'waterDispenser', 'fridgeCabinet', 'trashBin'],
        bounds: { x1: 2.3, y1: 17.5, x2: 3.8, y2: 21.5 },
        wallBound: true
      }
    ],
    signageZones: [
      {
        id: 'canteenEntrySignZone',
        prefab: 'wallSign',
        text: 'STAFF\nCANTEEN',
        allowedTypes: ['wallSign'],
        bounds: { x1: 6.5, y1: 16.8, x2: 8.8, y2: 17.2 },
        mount: 'wall',
        wall: 'north',
        coord: 7.6,
        height: 2.0,
        maxWidth: 1.6
      }
    ],
    forbiddenZones: [
      {
        id: 'canteenDoorway',
        bounds: { x1: 12, y1: 19, x2: 14, y2: 19 },
        rule: 'No table, chair, vending, fridge, or trash bin in doorway.'
      },
      {
        id: 'mainCorridorConnector',
        bounds: { x1: 13, y1: 16, x2: 16, y2: 22 },
        rule: 'Main corridor connector is circulation only.'
      }
    ]
  },
  'main-workstation-hall': {
    roomId: 'main-workstation-hall',
    roomBounds: { x1: 18, y1: 23, x2: 39, y2: 29 },
    entranceSide: 'west from main corridor',
    mainAisle: {
      id: 'main-workstation-central-aisle',
      bounds: { x1: 18, y1: 26.1, x2: 39, y2: 26.9 },
      widthCells: 2.5,
      rule: 'Central aisle stays clear through the workstation hall.'
    },
    furnitureZones: [
      {
        id: 'mainWorkstationRowsNorth',
        allowedTypes: ['workstationCluster', 'officeDesk', 'officeChair', 'monitor', 'keyboard', 'partition'],
        bounds: { x1: 20, y1: 24.5, x2: 37.8, y2: 25.7 },
        rowAligned: true
      },
      {
        id: 'mainWorkstationRowsSouth',
        allowedTypes: ['workstationCluster', 'officeDesk', 'officeChair', 'monitor', 'keyboard', 'partition'],
        bounds: { x1: 20, y1: 27.3, x2: 37.8, y2: 28.5 },
        rowAligned: true
      },
      {
        id: 'mainPrinterZone',
        allowedTypes: ['copyMachine'],
        bounds: { x1: 37.8, y1: 24.5, x2: 38.8, y2: 25.8 },
        wallBound: true
      }
    ],
    signageZones: [
      {
        id: 'workstationEntrySignZone',
        prefab: 'departmentSign',
        text: 'MAIN\nWORKSTATIONS',
        allowedTypes: ['wallSign'],
        bounds: { x1: 27, y1: 28.8, x2: 29.4, y2: 29.2 },
        mount: 'wall',
        wall: 'south',
        coord: 28.2,
        height: 2.02,
        maxWidth: 1.95
      }
    ],
    forbiddenZones: [
      {
        id: 'mainWorkstationCentralAisle',
        bounds: { x1: 18, y1: 26.1, x2: 39, y2: 26.9 },
        rule: 'No desks, chairs, partitions, or copy machine in central aisle.'
      },
      {
        id: 'mainCorridorConnector',
        bounds: { x1: 16, y1: 26, x2: 18, y2: 26 },
        rule: 'Connector from main corridor is route-only.'
      }
    ]
  },
  'boardroom-review': {
    roomId: 'boardroom-review',
    roomBounds: { x1: 18, y1: 13, x2: 38, y2: 22 },
    entranceSide: 'west from main corridor',
    furnitureZones: [
      {
        id: 'conferenceTableZone',
        allowedTypes: ['conferenceTable', 'meetingTable'],
        bounds: { x1: 24, y1: 15, x2: 32.5, y2: 19.5 },
        center: { x: 28.2, y: 17.3 }
      },
      {
        id: 'conferenceChairRingZone',
        allowedTypes: ['meetingChair'],
        bounds: { x1: 22, y1: 14, x2: 35, y2: 21 }
      },
      {
        id: 'reviewTerminalZone',
        allowedTypes: ['taskTerminal'],
        bounds: { x1: 35.2, y1: 16, x2: 37.2, y2: 18.2 }
      }
    ],
    wallZones: [
      {
        id: 'presentationWallZone',
        allowedTypes: ['wallBoard'],
        bounds: { x1: 18, y1: 14, x2: 18.4, y2: 20 },
        wallBound: true
      }
    ],
    glassZones: [
      {
        id: 'reviewBoundaryGlassZone',
        allowedTypes: ['glassPartition'],
        bounds: { x1: 18, y1: 13, x2: 38, y2: 13.4 },
        boundaryAligned: true
      }
    ],
    signageZones: [
      {
        id: 'boardroomEntrySignZone',
        prefab: 'departmentSign',
        text: 'BOARDROOM\nREVIEW',
        allowedTypes: ['wallSign'],
        bounds: { x1: 27, y1: 12.8, x2: 29.4, y2: 13.2 },
        mount: 'wall',
        wall: 'north',
        coord: 29.2,
        height: 2.02,
        maxWidth: 1.95
      }
    ],
    forbiddenZones: [
      {
        id: 'boardroomDoorway',
        bounds: { x1: 16, y1: 18, x2: 18, y2: 18 },
        rule: 'Doorway from corridor must stay clear.'
      },
      {
        id: 'connectorClearPath',
        bounds: { x1: 18, y1: 16, x2: 22, y2: 18 },
        rule: 'No meeting chair/table intrusion near connector.'
      }
    ]
  },
  toilet: {
    roomId: 'toilet',
    roomBounds: { x1: 2, y1: 11, x2: 8, y2: 15 },
    entranceSide: 'east from main corridor',
    furnitureZones: [
      {
        id: 'toiletStallZone',
        allowedTypes: ['toiletStall'],
        bounds: { x1: 3.0, y1: 12.0, x2: 6.5, y2: 14.4 },
        wallBound: true
      },
      {
        id: 'sinkWallZone',
        allowedTypes: ['sink', 'mirror', 'handDryer'],
        bounds: { x1: 6.8, y1: 12.1, x2: 8.0, y2: 13.6 },
        wallBound: true
      },
      {
        id: 'toiletUtilityCorner',
        allowedTypes: ['trashBin'],
        bounds: { x1: 7.0, y1: 14.0, x2: 8.0, y2: 14.8 },
        cornerOnly: true
      }
    ],
    signageZones: [
      {
        id: 'toiletEntrySignZone',
        prefab: 'wallSign',
        text: 'RESTROOM',
        allowedTypes: ['wallSign'],
        bounds: { x1: 4.2, y1: 10.8, x2: 6.4, y2: 11.2 },
        mount: 'wall',
        wall: 'north',
        coord: 7.5,
        height: 2.0,
        maxWidth: 1.45
      }
    ],
    forbiddenZones: [
      {
        id: 'toiletDoorway',
        bounds: { x1: 8, y1: 13, x2: 15, y2: 13 },
        rule: 'Restroom doorway is clear circulation.'
      }
    ]
  },
  'records-archive': {
    roomId: 'records-archive',
    roomBounds: { x1: 2, y1: 2, x2: 14, y2: 10 },
    entranceSide: 'east from main corridor',
    furnitureZones: [
      {
        id: 'archiveRackRows',
        allowedTypes: ['archiveRack', 'serverRack', 'archiveBox'],
        bounds: { x1: 3, y1: 2.7, x2: 12.3, y2: 9.3 },
        rowAligned: true
      },
      {
        id: 'archiveWallCabinetZone',
        allowedTypes: ['filingCabinet', 'archiveBox'],
        bounds: { x1: 2.2, y1: 2.5, x2: 3.5, y2: 9.4 },
        wallBound: true
      },
      {
        id: 'archiveObjectiveZone',
        allowedTypes: ['documentPacket', 'taskTerminal'],
        bounds: { x1: 11.2, y1: 5.0, x2: 13.0, y2: 7.2 }
      }
    ],
    signageZones: [
      {
        id: 'archiveEntrySignZone',
        prefab: 'wallSign',
        text: 'RECORDS\nARCHIVE',
        allowedTypes: ['wallSign'],
        bounds: { x1: 6.2, y1: 1.8, x2: 8.3, y2: 2.2 },
        mount: 'wall',
        wall: 'north',
        coord: 7.2,
        height: 2.0,
        maxWidth: 1.65
      }
    ],
    forbiddenZones: [
      {
        id: 'archiveAisleBetweenRows',
        bounds: { x1: 6.2, y1: 2.5, x2: 7.8, y2: 9.5 },
        rule: 'Aisle between archive rows stays clear.'
      },
      {
        id: 'archiveDoorway',
        bounds: { x1: 13, y1: 6, x2: 15, y2: 6 },
        rule: 'Archive doorway and corridor overlap stay clear.'
      }
    ]
  },
  'secondary-workstation': {
    roomId: 'secondary-workstation',
    roomBounds: { x1: 24, y1: 2, x2: 39, y2: 10 },
    entranceSide: 'west through level2-access connector',
    furnitureZones: [
      {
        id: 'secondaryDeskRows',
        allowedTypes: ['officeDesk', 'officeChair', 'monitor', 'keyboard', 'documentTray'],
        bounds: { x1: 26, y1: 2.8, x2: 38, y2: 9.2 },
        rowAligned: true
      },
      {
        id: 'secondaryWallCabinetZone',
        allowedTypes: ['filingCabinet'],
        bounds: { x1: 37.2, y1: 2.5, x2: 38.8, y2: 9.5 },
        wallBound: true
      },
      {
        id: 'secondaryObjectiveZone',
        allowedTypes: ['taskTerminal'],
        bounds: { x1: 25.6, y1: 5.2, x2: 27.2, y2: 7.0 }
      }
    ],
    signageZones: [
      {
        id: 'secondaryEntrySignZone',
        prefab: 'departmentSign',
        text: 'ACCOUNTS\nPROCESSING',
        allowedTypes: ['wallSign'],
        bounds: { x1: 31.0, y1: 1.8, x2: 33.5, y2: 2.2 },
        mount: 'wall',
        wall: 'north',
        coord: 32.2,
        height: 2.02,
        maxWidth: 1.95
      }
    ],
    forbiddenZones: [
      {
        id: 'secondaryCentralAisle',
        bounds: { x1: 31, y1: 2.4, x2: 34.5, y2: 9.6 },
        rule: 'Accounts aisle stays clear for processing route.'
      },
      {
        id: 'level2AccessConnector',
        bounds: { x1: 22, y1: 6, x2: 24, y2: 6 },
        rule: 'Connector to H remains clear.'
      }
    ]
  },
  'level2-access': {
    roomId: 'level2-access',
    roomBounds: { x1: 18, y1: 2, x2: 22, y2: 10 },
    entranceSide: 'west from main corridor',
    exitSide: 'future Level 2 transition, not implemented',
    doorZones: [
      {
        id: 'elevatorDoorZone',
        allowedTypes: ['elevatorDoor'],
        bounds: { x1: 19, y1: 9.45, x2: 21.7, y2: 10.0 },
        focalPoint: true,
        wallBound: true
      },
      {
        id: 'stairwellDoorZone',
        allowedTypes: ['stairwellDoor'],
        bounds: { x1: 18.5, y1: 2.0, x2: 21.8, y2: 2.55 },
        wallBound: true
      }
    ],
    wallZones: [
      {
        id: 'accessPanelZone',
        allowedTypes: ['accessPanel'],
        bounds: { x1: 21.2, y1: 5.5, x2: 21.9, y2: 6.5 },
        wallBound: true,
        notes: 'TODO: add dedicated accessPanel prefab later.'
      }
    ],
    trimZones: [
      {
        id: 'level2AccessTrimZone',
        allowedTypes: ['warningTrim'],
        bounds: { x1: 18.5, y1: 9.55, x2: 21.8, y2: 10.0 },
        visualOnly: true
      }
    ],
    signageZones: [
      {
        id: 'level2AccessSignZone',
        prefab: 'wallSign',
        text: 'LEVEL 2\nACCESS',
        allowedTypes: ['level2Sign'],
        bounds: { x1: 18.8, y1: 9.8, x2: 21.8, y2: 10.2 },
        mount: 'wall',
        wall: 'south',
        coord: 21.0,
        height: 2.08,
        maxWidth: 1.75
      }
    ],
    forbiddenZones: [
      {
        id: 'level2AccessApproach',
        bounds: { x1: 18, y1: 4.0, x2: 22, y2: 8.8 },
        rule: 'Approach to elevator/stairs stays clear by at least 1.5m.'
      },
      {
        id: 'mainCorridorEndpoint',
        bounds: { x1: 14, y1: 2, x2: 18, y2: 10 },
        rule: 'Main corridor endpoint remains clear.'
      }
    ]
  }
};

const compactZone = (id, bounds, allowedTypes = []) => ({ id, bounds, allowedTypes });

const level1V2RoomLayoutAnchors = {
  'front-admin-intake': {
    roomId: 'front-admin-intake',
    roomBounds: { x1: 2, y1: 19, x2: 10, y2: 24 },
    furnitureZones: [
      compactZone('intakeDeskZone', { x1: 3, y1: 20, x2: 6.5, y2: 22 }, ['intakeDesk', 'taskTerminal', 'documentTray']),
      compactZone('frontCounterZone', { x1: 3, y1: 22.5, x2: 7, y2: 24 }, ['receptionDesk']),
      compactZone('cornerPlantZone', { x1: 8.5, y1: 22.5, x2: 10, y2: 24 }, ['pottedPlant'])
    ],
    signageZones: [compactZone('adminEntrySignZone', { x1: 4, y1: 19, x2: 7, y2: 19.4 }, ['wallSign'])],
    forbiddenZones: [
      compactZone('mainCorridorEntry', { x1: 11, y1: 20, x2: 14, y2: 22 }),
      compactZone('doorwayToMainCorridor', { x1: 11, y1: 21, x2: 12, y2: 21 })
    ]
  },
  canteen: {
    roomId: 'canteen',
    roomBounds: { x1: 2, y1: 12, x2: 10, y2: 18 },
    furnitureZones: [
      compactZone('canteenSeatingZone', { x1: 4, y1: 13, x2: 9.5, y2: 17.5 }, ['canteenTable', 'canteenChair']),
      compactZone('canteenWallUtilityZone', { x1: 2, y1: 13, x2: 3.5, y2: 18 }, ['vendingMachine', 'waterDispenser', 'fridgeCabinet', 'trashBin'])
    ],
    signageZones: [compactZone('canteenEntrySignZone', { x1: 4, y1: 12, x2: 7, y2: 12.4 }, ['wallSign'])],
    forbiddenZones: [
      compactZone('canteenDoorway', { x1: 11, y1: 15, x2: 12, y2: 15 }),
      compactZone('mainCorridorConnector', { x1: 12, y1: 12, x2: 14, y2: 18 })
    ]
  },
  'main-workstation-hall': {
    roomId: 'main-workstation-hall',
    roomBounds: { x1: 16, y1: 19, x2: 32, y2: 24 },
    furnitureZones: [
      compactZone('mainWorkstationRowsNorth', { x1: 18, y1: 20, x2: 30, y2: 21 }, ['workstationCluster', 'officeDesk', 'officeChair', 'monitor', 'keyboard', 'partition']),
      compactZone('mainWorkstationRowsSouth', { x1: 18, y1: 23, x2: 30, y2: 24 }, ['workstationCluster', 'officeDesk', 'officeChair', 'monitor', 'keyboard', 'partition']),
      compactZone('mainPrinterZone', { x1: 30.5, y1: 20, x2: 32, y2: 21.5 }, ['copyMachine'])
    ],
    signageZones: [compactZone('workstationEntrySignZone', { x1: 24, y1: 24, x2: 28, y2: 24.4 }, ['wallSign'])],
    forbiddenZones: [
      compactZone('mainWorkstationCentralAisle', { x1: 16, y1: 21, x2: 32, y2: 22.5 }),
      compactZone('mainCorridorConnector', { x1: 15, y1: 21, x2: 16, y2: 21 })
    ]
  },
  'boardroom-review': {
    roomId: 'boardroom-review',
    roomBounds: { x1: 16, y1: 10, x2: 31, y2: 18 },
    furnitureZones: [
      compactZone('conferenceTableZone', { x1: 21, y1: 12, x2: 27, y2: 16 }, ['conferenceTable', 'meetingTable']),
      compactZone('conferenceChairRingZone', { x1: 19, y1: 11, x2: 29, y2: 17 }, ['meetingChair']),
      compactZone('reviewTerminalZone', { x1: 28.5, y1: 13, x2: 30.5, y2: 15 }, ['taskTerminal'])
    ],
    wallZones: [compactZone('presentationWallZone', { x1: 16, y1: 11, x2: 16.5, y2: 17 }, ['wallBoard'])],
    glassZones: [compactZone('reviewBoundaryGlassZone', { x1: 16, y1: 10, x2: 31, y2: 10.4 }, ['glassPartition'])],
    signageZones: [compactZone('boardroomEntrySignZone', { x1: 23, y1: 10, x2: 27, y2: 10.4 }, ['wallSign'])],
    forbiddenZones: [
      compactZone('boardroomDoorway', { x1: 15, y1: 14, x2: 16, y2: 14 }),
      compactZone('connectorClearPath', { x1: 16, y1: 13, x2: 19, y2: 15 })
    ]
  },
  toilet: {
    roomId: 'toilet',
    roomBounds: { x1: 2, y1: 8, x2: 7, y2: 11 },
    furnitureZones: [
      compactZone('toiletStallZone', { x1: 2.5, y1: 9, x2: 5, y2: 11 }, ['toiletStall']),
      compactZone('sinkWallZone', { x1: 5.5, y1: 9, x2: 7, y2: 10.5 }, ['sink', 'mirror', 'handDryer']),
      compactZone('toiletUtilityCorner', { x1: 6, y1: 10.5, x2: 7, y2: 11 }, ['trashBin'])
    ],
    signageZones: [compactZone('toiletEntrySignZone', { x1: 3.5, y1: 8, x2: 6.5, y2: 8.4 }, ['wallSign'])],
    forbiddenZones: [compactZone('toiletDoorway', { x1: 7, y1: 9, x2: 12, y2: 9 })]
  },
  'records-archive': {
    roomId: 'records-archive',
    roomBounds: { x1: 2, y1: 2, x2: 12, y2: 7 },
    furnitureZones: [
      compactZone('archiveRackRows', { x1: 3, y1: 3, x2: 9.5, y2: 6.5 }, ['archiveRack', 'serverRack', 'archiveBox']),
      compactZone('archiveWallCabinetZone', { x1: 2, y1: 3, x2: 3.5, y2: 7 }, ['filingCabinet', 'archiveBox']),
      compactZone('archiveObjectiveZone', { x1: 9.5, y1: 4.5, x2: 11.5, y2: 6 }, ['documentPacket', 'taskTerminal'])
    ],
    signageZones: [compactZone('archiveEntrySignZone', { x1: 5, y1: 2, x2: 8, y2: 2.4 }, ['wallSign'])],
    forbiddenZones: [
      compactZone('archiveAisleBetweenRows', { x1: 5.5, y1: 3, x2: 7.5, y2: 7 }),
      compactZone('archiveDoorway', { x1: 11, y1: 5, x2: 12, y2: 5 })
    ]
  },
  'secondary-workstation': {
    roomId: 'secondary-workstation',
    roomBounds: { x1: 22, y1: 2, x2: 32, y2: 7 },
    furnitureZones: [
      compactZone('secondaryDeskRows', { x1: 23, y1: 3, x2: 30, y2: 6.5 }, ['officeDesk', 'officeChair', 'monitor', 'keyboard', 'documentTray']),
      compactZone('secondaryWallCabinetZone', { x1: 30.5, y1: 3, x2: 32, y2: 7 }, ['filingCabinet']),
      compactZone('secondaryObjectiveZone', { x1: 23, y1: 4.5, x2: 25, y2: 6 }, ['taskTerminal'])
    ],
    signageZones: [compactZone('secondaryEntrySignZone', { x1: 26, y1: 2, x2: 30, y2: 2.4 }, ['wallSign'])],
    forbiddenZones: [
      compactZone('secondaryCentralAisle', { x1: 26, y1: 3, x2: 28, y2: 7 }),
      compactZone('level2AccessConnector', { x1: 21, y1: 5, x2: 22, y2: 5 })
    ]
  },
  'level2-access': {
    roomId: 'level2-access',
    roomBounds: { x1: 16, y1: 2, x2: 20, y2: 7 },
    doorZones: [
      compactZone('elevatorDoorZone', { x1: 17, y1: 6.5, x2: 20, y2: 7 }, ['elevatorDoor']),
      compactZone('stairwellDoorZone', { x1: 16.5, y1: 2, x2: 20, y2: 2.5 }, ['stairwellDoor'])
    ],
    wallZones: [compactZone('accessPanelZone', { x1: 19.2, y1: 4.5, x2: 20, y2: 5.5 }, ['accessPanel'])],
    trimZones: [compactZone('level2AccessTrimZone', { x1: 16.5, y1: 6.6, x2: 20, y2: 7 }, ['warningTrim'])],
    signageZones: [compactZone('level2AccessSignZone', { x1: 17, y1: 6.8, x2: 20, y2: 7.2 }, ['level2Sign'])],
    forbiddenZones: [
      compactZone('level2AccessApproach', { x1: 16, y1: 3, x2: 20, y2: 6.5 }),
      compactZone('mainCorridorEndpoint', { x1: 12, y1: 2, x2: 16, y2: 7 })
    ]
  }
};

const level1V2Architecture = [];

const level1V2Spaces = [...level1V2Rooms, level1V2MainCorridor];
const toCollisionRect = rectangle => ({
  x1: Math.floor(rectangle.x1),
  y1: Math.floor(rectangle.y1),
  x2: Math.ceil(rectangle.x2),
  y2: Math.ceil(rectangle.y2)
});

const asRectList = value => (Array.isArray(value) ? value : [value]).filter(Boolean);

function setGridRect(grid, rectangle, cellType) {
  const rect = toCollisionRect(rectangle);
  const width = grid[0]?.length ?? 0;
  const height = grid.length;
  const x1 = Math.max(0, Math.min(width - 1, rect.x1));
  const x2 = Math.max(0, Math.min(width - 1, rect.x2));
  const y1 = Math.max(0, Math.min(height - 1, rect.y1));
  const y2 = Math.max(0, Math.min(height - 1, rect.y2));

  for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
      grid[y][x] = cellType;
    }
  }
}

function createWallGrid(width, height) {
  return Array.from({ length: height }, () => Array(width).fill(CONSTANTS.CELL_WALL));
}

function carveOpenRect(grid, rectangle) {
  setGridRect(grid, rectangle, CONSTANTS.CELL_PATH);
}

function applyWallLine(grid, line) {
  if (line.x1 !== line.x2 && line.y1 !== line.y2) {
    if (CONSTANTS.DEV_MODE) {
      console.warn('Level 1 V2 blueprint ignores non-axis-aligned wall line', line);
    }
    return;
  }

  setGridRect(grid, line, CONSTANTS.CELL_WALL);
}

function carveDoorOpening(grid, opening) {
  asRectList(opening.bounds).forEach(bounds => carveOpenRect(grid, bounds));
}

function buildLevel1V2CollisionGrid(blueprint) {
  const grid = createWallGrid(blueprint.gridWidth, blueprint.gridHeight);

  blueprint.openAreas.forEach(area => carveOpenRect(grid, area));
  blueprint.wallLines.forEach(line => applyWallLine(grid, line));
  blueprint.doorOpenings.forEach(opening => carveDoorOpening(grid, opening));

  return grid;
}

const level1V2CollisionGrid = buildLevel1V2CollisionGrid(level1V2FloorplanBlueprint);

const level1V2FloorZones = level1V2Spaces.map(space => ({
  id: space.id,
  x1: space.x1,
  y1: space.y1,
  x2: space.x2,
  y2: space.y2,
  color: space.color,
  emissive: 0x101616,
  emissiveIntensity: space.id === 'level2-access' ? 0.07 : 0.04,
  roughness: 0.76,
  height: 0,
  floorLineColor: 0x7f8988,
  floorLineOpacity: space.id === 'main-corridor' ? 0.12 : 0.18,
  floorLineStep: space.id === 'main-corridor' ? 3 : 2
}));

export const level1V2 = {
  schemaVersion: 1,
  id: 'level-1-v2',
  label: 'Level 1 V2 Map Shell',
  title: 'Level 1 V2 Map Shell',
  version: 'v2-map-shell',
  status: 'map-shell',
  active: true,
  estimatedMinutes: 20,
  mapDimensions: level1V2MapDimensions,
  movementStandards: level1V2MovementStandards,
  placementRules: LEVEL1_V2_GLOBAL_PLACEMENT_RULES,
  proceduralFallbackRules: level1V2ProceduralFallbackRules,
  repairPriorities: LEVEL1_V2_ROOM_REPAIR_PRIORITIES,
  floorplanBlueprint: level1V2FloorplanBlueprint,
  spaces: level1V2Spaces,
  rooms: level1V2Rooms,
  corridors: [level1V2MainCorridor],
  connectors: level1V2Doorways,
  doorways: level1V2Doorways,
  clearPathRules: level1V2ClearPathRules,
  wallSegments: level1V2WallSegments,
  partitionBands: level1V2WallSegments,
  objectives: [],
  hazards: [],
  storyBeats: [],
  manipulationNodes: [],
  lightingZones: [],
  collisionVolumes: [],
  collisionGrid: level1V2CollisionGrid,
  grid: level1V2CollisionGrid,
  roomLayoutSpecs: level1V2RoomLayoutSpecs,
  roomLayoutAnchors: level1V2RoomLayoutAnchors,
  roomAssetManifest: LEVEL1_V2_ROOM_ASSET_MANIFEST,
  roomAssetManifestSummary: summarizeLevel1V2RoomAssetManifest(level1V2RoomLayoutAnchors),
  playerStart: { x: 6.5, y: 21.5, yaw: 0, pitch: -0.04 },
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
  routes: [
    {
      id: 'level1v2-foundation-route',
      label: 'Level 1 V2 Foundation Route',
      color: 0x86f7b2,
      points: [
        { x: 6.5, y: 21.5 },
        { x: 13.0, y: 21.0 },
        { x: 13.0, y: 15.0 },
        { x: 13.0, y: 9.0 },
        { x: 13.0, y: 5.0 },
        { x: 18.0, y: 5.0 },
        { x: 23.0, y: 5.0 }
      ]
    }
  ],
  notes: [
    'Level 1 V2 is currently a map shell.',
    'The playable shell is built from a compact manual floorplan blueprint rather than room rectangle auto-carving.',
    'Furniture/object placement is intentionally disabled.',
    'Old level1.js remains available as legacy.',
    'Object placement will be added after floorplan approval.',
    'No GLB model metadata or runtime external model URLs are added here.',
    'No Level 2 transition logic is implemented in this scaffold.'
  ],
  architecture: level1V2Architecture
};

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
  const bounds = toCollisionRect(rect);
  for (let y = bounds.y1; y <= bounds.y2; y++) {
    for (let x = bounds.x1; x <= bounds.x2; x++) {
      if (reachable.has(cellKey(x, y))) return true;
    }
  }
  return false;
}

function validateLevel1V2BlueprintReachability(level) {
  const grid = level.grid;
  const start = getStartCell(level.playerStart);
  const reachable = collectReachableCells(grid, start);
  const warnings = [];

  if (!isOpenCell(grid, start.x, start.y)) {
    warnings.push(`playerStart is not open at ${cellKey(start.x, start.y)}`);
  }

  level.rooms.forEach(room => {
    if (!rectHasReachableCell(room.bounds, reachable)) {
      warnings.push(`${room.code} / ${room.id} is not reachable from playerStart`);
    }
  });

  level.doorways.forEach(doorway => {
    const reachableDoor = asRectList(doorway.bounds).some(bounds => rectHasReachableCell(bounds, reachable));
    if (!reachableDoor) warnings.push(`${doorway.id} is not reachable from playerStart`);
  });

  for (let y = level1V2MainCorridor.y1; y <= level1V2MainCorridor.y2; y++) {
    for (let x = level1V2MainCorridor.x1; x <= level1V2MainCorridor.x2; x++) {
      if (!isOpenCell(grid, x, y)) warnings.push(`main corridor has blocked cell ${cellKey(x, y)}`);
    }
  }

  return {
    valid: warnings.length === 0,
    warnings,
    details: {
      reachableCells: reachable.size,
      playerStartCell: start,
      gridWidth: grid[0]?.length ?? 0,
      gridHeight: grid.length
    }
  };
}

const level1V2Validation = validateLevel1V2ArchitectureAgainstManifest(
  level1V2.architecture,
  level1V2.roomLayoutAnchors
);

if (CONSTANTS.DEV_MODE && (!level1V2Validation.valid || level1V2Validation.warnings.length)) {
  console.warn('Level 1 V2 architecture validation', level1V2Validation);
}

const level1V2BlueprintValidation = validateLevel1V2BlueprintReachability(level1V2);

if (CONSTANTS.DEV_MODE && !level1V2BlueprintValidation.valid) {
  console.warn('Level 1 V2 blueprint reachability validation', level1V2BlueprintValidation);
}
