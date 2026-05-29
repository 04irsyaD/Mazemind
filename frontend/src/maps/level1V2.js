import { CONSTANTS } from '../core/Constants.js';
import { officeProps } from './prefabs/officeProps.js';

const GRID_WIDTH = 32;
const GRID_HEIGHT = 24;

const level1V2WallSegments = [];
const mazeLitePhase1Source = 'maze-lite-phase-1-visual-only';
const mazeLitePhase1Enabled = false;
const mazeLitePlacementStatus = 'paused-pending-user-approved-placement';
const metersToGridCells = meters => Number((meters / CONSTANTS.CELL_SIZE).toFixed(3));

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
    function: 'Admin Intake',
    zoneType: 'Floorplan Preview',
    bounds: { x1: 2, y1: 3, x2: 9, y2: 7 },
    accessStyle: 'semi-open admin bay / open side toward central route',
    status: 'floorplan-preview',
    statusLabel: 'Preview Zone'
  },
  {
    code: 'B',
    id: 'canteen',
    label: 'Canteen',
    function: 'Canteen',
    zoneType: 'Floorplan Preview',
    bounds: { x1: 2, y1: 8, x2: 9, y2: 12 },
    accessStyle: 'side opening toward central route',
    status: 'floorplan-preview',
    statusLabel: 'Preview Zone'
  },
  {
    code: 'E',
    id: 'toilet',
    label: 'Toilet',
    function: 'Toilet',
    zoneType: 'Floorplan Preview',
    bounds: { x1: 2, y1: 13, x2: 6, y2: 15 },
    accessStyle: 'narrow controlled access',
    status: 'floorplan-preview',
    statusLabel: 'Preview Zone'
  },
  {
    code: 'F',
    id: 'records-archive',
    label: 'Records Archive',
    function: 'Records Archive',
    zoneType: 'Floorplan Preview',
    bounds: { x1: 2, y1: 17, x2: 12, y2: 22 },
    accessStyle: 'controlled archive access',
    status: 'floorplan-preview',
    statusLabel: 'Preview Zone'
  },
  {
    code: 'C',
    id: 'main-workstation-hall',
    label: 'Main Workstation Hall',
    function: 'Main Workstation',
    zoneType: 'Floorplan Preview',
    bounds: { x1: 14, y1: 3, x2: 29, y2: 8 },
    accessStyle: 'wider workstation threshold',
    status: 'floorplan-preview',
    statusLabel: 'Preview Zone'
  },
  {
    code: 'D',
    id: 'boardroom-review',
    label: 'Boardroom / Review Room',
    function: 'Boardroom Review',
    zoneType: 'Floorplan Preview',
    bounds: { x1: 14, y1: 10, x2: 29, y2: 15 },
    accessStyle: 'formal centered access',
    status: 'floorplan-preview',
    statusLabel: 'Preview Zone'
  },
  {
    code: 'H',
    id: 'level2-access',
    label: 'Lift / Stairs to Level 2',
    function: 'Level 2 Access',
    zoneType: 'Floorplan Preview',
    bounds: { x1: 14, y1: 17, x2: 17, y2: 22 },
    accessStyle: 'progression access',
    status: 'floorplan-preview',
    statusLabel: 'Preview Zone'
  },
  {
    code: 'G',
    id: 'secondary-workstation',
    label: 'Secondary Workstation / Accounts Processing',
    function: 'Accounts Processing',
    zoneType: 'Floorplan Preview',
    bounds: { x1: 19, y1: 17, x2: 29, y2: 22 },
    accessStyle: 'rear/side access from H or lower route',
    status: 'floorplan-preview',
    statusLabel: 'Preview Zone'
  }
].map(withTopLevelBounds);

const level1V2CentralRoute = withTopLevelBounds({
  code: 'R',
  id: 'central-route',
  label: 'Central Route',
  function: 'Route Spine',
  zoneType: 'Floorplan Preview',
  bounds: { x1: 10, y1: 3, x2: 13, y2: 22 },
  accessStyle: 'main vertical route spine',
  status: 'floorplan-preview',
  statusLabel: 'Preview Route'
});

const floorZoneColors = {
  'front-admin-intake': 0x9caeae,
  canteen: 0x9aad9a,
  toilet: 0xa7bdc2,
  'records-archive': 0x8b969c,
  'central-route': 0x6c7776,
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
    emissive: 0x10191a,
    emissiveIntensity: 0.055,
    floorLineColor: 0x95a0a0,
    floorLineOpacity: 0.24,
    floorLineStep: 2
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

const standardLabelPolish = {
  height: 0.66,
  heightOffset: 1.1,
  opacity: 0.92
};

const longLabelPolish = {
  height: 0.62,
  heightOffset: 1.08,
  opacity: 0.84
};

const level1V2FloorplanMarkers = [
  {
    id: 'marker-front-admin-intake',
    code: 'A',
    label: 'Front Admin',
    roomId: 'front-admin-intake',
    position: { x: 5.5, y: 5 },
    markerType: 'floorplan-label',
    text: 'A - Front Admin',
    accent: 0xd5eeee,
    width: 3.3,
    ...standardLabelPolish,
    status: 'preview-marker'
  },
  {
    id: 'marker-canteen',
    code: 'B',
    label: 'Canteen',
    roomId: 'canteen',
    position: { x: 5.5, y: 10 },
    markerType: 'floorplan-label',
    text: 'B - Canteen',
    accent: 0xd7ead7,
    width: 3,
    ...standardLabelPolish,
    status: 'preview-marker'
  },
  {
    id: 'marker-toilet',
    code: 'E',
    label: 'Toilet',
    roomId: 'toilet',
    position: { x: 4, y: 14 },
    markerType: 'floorplan-label',
    text: 'E - Toilet',
    accent: 0xd7eff4,
    width: 2.7,
    ...standardLabelPolish,
    status: 'preview-marker'
  },
  {
    id: 'marker-records-archive',
    code: 'F',
    label: 'Records Archive',
    roomId: 'records-archive',
    position: { x: 7, y: 20 },
    markerType: 'floorplan-label',
    text: 'F - Records Archive',
    accent: 0xd7e0e5,
    width: 3.55,
    ...longLabelPolish,
    status: 'preview-marker'
  },
  {
    id: 'marker-central-route',
    code: 'R',
    label: 'Central Route',
    roomId: 'central-route',
    position: { x: 11.5, y: 12 },
    markerType: 'floorplan-label',
    text: 'R - Central Route',
    accent: 0xd5e0df,
    width: 3.45,
    ...longLabelPolish,
    status: 'preview-marker'
  },
  {
    id: 'marker-main-workstation-hall',
    code: 'C',
    label: 'Workstation Hall',
    roomId: 'main-workstation-hall',
    position: { x: 21.5, y: 5.5 },
    markerType: 'floorplan-label',
    text: 'C - Workstation Hall',
    accent: 0xe3ecef,
    width: 3.75,
    ...longLabelPolish,
    status: 'preview-marker'
  },
  {
    id: 'marker-boardroom-review',
    code: 'D',
    label: 'Boardroom',
    roomId: 'boardroom-review',
    position: { x: 21.5, y: 12.5 },
    markerType: 'floorplan-label',
    text: 'D - Boardroom',
    accent: 0xd8f0f5,
    width: 3,
    ...standardLabelPolish,
    status: 'preview-marker'
  },
  {
    id: 'marker-level2-access',
    code: 'H',
    label: 'Level 2 Access',
    roomId: 'level2-access',
    position: { x: 15.5, y: 20 },
    markerType: 'floorplan-label',
    text: 'H - Level 2 Access',
    accent: 0xd5f2eb,
    width: 3.55,
    ...longLabelPolish,
    status: 'preview-marker'
  },
  {
    id: 'marker-secondary-workstation',
    code: 'G',
    label: 'Secondary Workstation',
    roomId: 'secondary-workstation',
    position: { x: 24, y: 20 },
    markerType: 'floorplan-label',
    text: 'G - Secondary Workstation',
    accent: 0xf0eedf,
    width: 4.25,
    height: 0.6,
    heightOffset: 1.06,
    opacity: 0.78,
    status: 'preview-marker'
  }
];

const level1V2LightingZones = [
  {
    id: 'level1v2-objective-soft-lighting',
    channelId: 'v2-objective-soft',
    rooms: [
      'front-admin-intake',
      'main-workstation-hall',
      'boardroom-review',
      'records-archive',
      'level2-access'
    ]
  },
  {
    id: 'level1v2-route-fill-lighting',
    channelId: 'v2-route-fill',
    rooms: ['central-route']
  }
];

const level1V2CeilingLights = [
  {
    id: 'v2-light-a-admin',
    channelId: 'v2-objective-soft',
    x: 5.5,
    y: 5.5,
    width: 0.82,
    depth: 0.18,
    color: 0xb6d2d1,
    fixtureColor: 0x8c9998,
    intensity: 0.11,
    distance: 6.4,
    emissiveIntensity: 0.16,
    flicker: false
  },
  {
    id: 'v2-light-c-workstation',
    channelId: 'v2-objective-soft',
    x: 21.5,
    y: 5.5,
    width: 0.92,
    depth: 0.18,
    color: 0xb8d6d7,
    fixtureColor: 0x909d9d,
    intensity: 0.12,
    distance: 6.8,
    emissiveIntensity: 0.17,
    flicker: false
  },
  {
    id: 'v2-light-d-boardroom',
    channelId: 'v2-objective-soft',
    x: 21.5,
    y: 12.5,
    width: 0.92,
    depth: 0.18,
    color: 0xb1d1d7,
    fixtureColor: 0x8d999c,
    intensity: 0.11,
    distance: 6.8,
    emissiveIntensity: 0.16,
    flicker: false
  },
  {
    id: 'v2-light-f-archive',
    channelId: 'v2-objective-soft',
    x: 7,
    y: 20,
    width: 0.88,
    depth: 0.18,
    color: 0xaec8cf,
    fixtureColor: 0x879296,
    intensity: 0.11,
    distance: 6.4,
    emissiveIntensity: 0.15,
    flicker: false
  },
  {
    id: 'v2-light-h-access',
    channelId: 'v2-objective-soft',
    x: 15.5,
    y: 20,
    width: 0.78,
    depth: 0.18,
    color: 0xb3d9d1,
    fixtureColor: 0x899996,
    intensity: 0.1,
    distance: 5.8,
    emissiveIntensity: 0.15,
    flicker: false
  }
];

const level1V2AreaLights = [
  {
    id: 'v2-route-spine-fill',
    channelId: 'v2-route-fill',
    x: 11.5,
    y: 12.5,
    height: 2.05,
    color: 0x8fb1b3,
    intensity: 0.08,
    distance: 13,
    flicker: false
  }
];

function createMvpObject(roomCode, object) {
  return {
    roomCode,
    status: 'mvp-preview-object',
    visualOnly: true,
    ...object,
    metadata: {
      ...object.metadata,
      visualOnly: true,
      mvpPreviewObject: true
    }
  };
}

function createMvpPlatform({
  id,
  roomCode,
  roomId,
  label,
  x,
  y,
  width,
  depth,
  height = 0.12,
  color,
  emissive = 0x000000,
  emissiveIntensity = 0.02,
  purpose
}) {
  return createMvpObject(roomCode, {
    id,
    type: 'platform',
    label,
    roomId,
    x,
    y,
    width,
    depth,
    height,
    color,
    emissive,
    emissiveIntensity,
    roughness: 0.76,
    purpose,
    size: { width, height, depth },
    metadata: {
      prefab: 'mvpPlatformMarker',
      roomId,
      purpose
    }
  });
}

const level1V2OfficeMazeLiteStatus = {
  enabled: mazeLitePhase1Enabled,
  phase: 1,
  visualOnly: true,
  mazeLitePhase1Enabled,
  mazeLitePlacementStatus,
  gridWallSegmentsEnabled: false,
  dividerCollisionEnabled: false,
  note: 'Office Maze Lite Phase 1 divider rendering is paused until user-approved screenshot/top-down placement.'
};

const level1V2MvpObjects = [
  createMvpObject('A', officeProps.intakeDesk({
    id: 'mvp-front-admin-intake-counter',
    label: 'Front Admin Intake Counter',
    roomId: 'front-admin-intake',
    x: 6,
    y: 6.35,
    width: 1.6,
    depth: 0.55,
    size: { width: 1.6, height: 0.94, depth: 0.55 },
    color: 0xaeb8b7,
    panelColor: 0x909b9c,
    topColor: 0xd5d9d6,
    trimColor: 0x6c777a,
    purpose: 'mvp-admin-intake-marker',
    visualOnly: true
  })),
  createMvpObject('B', officeProps.coffeeTable({
    id: 'mvp-canteen-table-marker',
    label: 'Canteen Table Marker',
    roomId: 'canteen',
    x: 5.5,
    y: 11.15,
    width: 1.25,
    depth: 0.62,
    size: { width: 1.25, height: 0.47, depth: 0.62 },
    color: 0xa7b59f,
    purpose: 'mvp-canteen-table-marker',
    visualOnly: true
  })),
  createMvpPlatform({
    id: 'mvp-toilet-utility-marker',
    roomCode: 'E',
    roomId: 'toilet',
    label: 'Toilet Utility Marker',
    x: 3.25,
    y: 14.65,
    width: 0.6,
    depth: 0.48,
    height: 0.16,
    color: 0x9fb5bb,
    emissive: 0x0a1517,
    purpose: 'mvp-toilet-utility-marker'
  }),
  createMvpObject('F', officeProps.serverRackRow({
    id: 'mvp-archive-rack-west',
    label: 'Archive Rack West',
    roomId: 'records-archive',
    x: 4.6,
    y: 18.25,
    count: 1,
    axis: 'x',
    color: 0x46535a,
    emissive: 0x243a44,
    emissiveIntensity: 0.08,
    size: { width: 0.8, height: 1.9, depth: 0.4 },
    purpose: 'mvp-archive-rack-marker',
    visualOnly: true
  })),
  createMvpObject('F', officeProps.serverRackRow({
    id: 'mvp-archive-rack-east',
    label: 'Archive Rack East',
    roomId: 'records-archive',
    x: 9.35,
    y: 21.05,
    count: 1,
    axis: 'x',
    color: 0x46535a,
    emissive: 0x243a44,
    emissiveIntensity: 0.08,
    size: { width: 0.8, height: 1.9, depth: 0.4 },
    purpose: 'mvp-archive-rack-marker',
    visualOnly: true
  })),
  createMvpObject('C', officeProps.officeDesk({
    id: 'mvp-main-workstation-left',
    label: 'Main Workstation Marker Left',
    roomId: 'main-workstation-hall',
    x: 18.8,
    y: 6.85,
    width: 1.25,
    depth: 0.7,
    size: { width: 1.25, height: 0.94, depth: 0.7 },
    color: 0xb9c0c1,
    topColor: 0xd6dcda,
    purpose: 'mvp-workstation-marker',
    visualOnly: true
  })),
  createMvpObject('C', officeProps.officeDesk({
    id: 'mvp-main-workstation-right',
    label: 'Main Workstation Marker Right',
    roomId: 'main-workstation-hall',
    x: 25,
    y: 6.95,
    width: 1.25,
    depth: 0.7,
    size: { width: 1.25, height: 0.94, depth: 0.7 },
    color: 0xb9c0c1,
    topColor: 0xd6dcda,
    purpose: 'mvp-workstation-marker',
    visualOnly: true
  })),
  createMvpObject('D', officeProps.meetingTable({
    id: 'mvp-boardroom-table-marker',
    label: 'Boardroom Table Marker',
    roomId: 'boardroom-review',
    x: 21.5,
    y: 14,
    width: 2.1,
    depth: 0.86,
    size: { width: 2.1, height: 0.79, depth: 0.86 },
    color: 0x84949a,
    purpose: 'mvp-boardroom-table-marker',
    visualOnly: true
  })),
  createMvpPlatform({
    id: 'mvp-level2-access-pad',
    roomCode: 'H',
    roomId: 'level2-access',
    label: 'Level 2 Access Pad',
    x: 15.5,
    y: 21.25,
    width: 1.05,
    depth: 0.65,
    height: 0.13,
    color: 0x77aaa3,
    emissive: 0x12312d,
    emissiveIntensity: 0.08,
    purpose: 'mvp-level2-access-marker'
  }),
  createMvpObject('G', officeProps.officeDesk({
    id: 'mvp-secondary-workstation-marker',
    label: 'Secondary Workstation Marker',
    roomId: 'secondary-workstation',
    x: 24,
    y: 21.3,
    width: 1.25,
    depth: 0.7,
    size: { width: 1.25, height: 0.94, depth: 0.7 },
    color: 0xb9b7a8,
    topColor: 0xdad8ca,
    purpose: 'mvp-secondary-workstation-marker',
    visualOnly: true
  }))
];

const level1V2MazeLiteDisabledDividerProposals = [
  {
    id: 'c-workstation-divider-01',
    enabled: false,
    roomId: 'main-workstation-hall',
    type: 'cubicle-partition',
    position: { x: 18, y: 4.5 },
    rotation: 0,
    collision: false,
    blocking: false,
    mazeRole: 'visual-lane-suggestion',
    source: mazeLitePhase1Source,
    requirementControlled: true,
    dimensionsMeters: { width: 2.1, depth: 0.22, height: 1.32 }
  },
  {
    id: 'c-workstation-divider-02',
    enabled: false,
    roomId: 'main-workstation-hall',
    type: 'cubicle-partition',
    position: { x: 25, y: 6.5 },
    rotation: 0,
    collision: false,
    blocking: false,
    mazeRole: 'visual-lane-suggestion',
    source: mazeLitePhase1Source,
    requirementControlled: true,
    dimensionsMeters: { width: 2.1, depth: 0.22, height: 1.32 }
  },
  {
    id: 'f-archive-divider-01',
    enabled: false,
    roomId: 'records-archive',
    type: 'archive-rack-divider',
    position: { x: 5, y: 18.5 },
    rotation: 0,
    collision: false,
    blocking: false,
    mazeRole: 'visual-archive-aisle',
    source: mazeLitePhase1Source,
    requirementControlled: true,
    dimensionsMeters: { width: 1.6, depth: 0.36, height: 1.7 }
  }
];

const level1V2MazeLiteVisualDividers = mazeLitePhase1Enabled
  ? level1V2MazeLiteDisabledDividerProposals.filter(divider => divider.enabled === true)
  : [];

const mazeLiteDividerPrefabByType = {
  'cubicle-partition': 'cubiclePartition',
  'archive-rack-divider': 'archiveRackDivider'
};

const mazeLiteDividerRoomCodeById = {
  'main-workstation-hall': 'C',
  'records-archive': 'F'
};

function createMazeLiteVisualDividerProp(divider) {
  const prefabName = mazeLiteDividerPrefabByType[divider.type];
  const dimensions = divider.dimensionsMeters;
  const width = metersToGridCells(dimensions.width);
  const depth = metersToGridCells(dimensions.depth);

  const prop = officeProps[prefabName]({
    id: divider.id,
    label: divider.id,
    roomId: divider.roomId,
    x: divider.position.x,
    y: divider.position.y,
    rotation: divider.rotation,
    width,
    depth,
    height: dimensions.height,
    size: { width, height: dimensions.height, depth },
    visualOnly: true,
    collision: false,
    blocking: false,
    mazeRole: divider.mazeRole,
    source: divider.source,
    requirementControlled: divider.requirementControlled,
    assetType: divider.type,
    purpose: divider.mazeRole
  });

  return {
    ...prop,
    roomCode: mazeLiteDividerRoomCodeById[divider.roomId],
    status: 'maze-lite-phase-1-visual-only',
    visualOnly: true,
    metadata: {
      ...prop.metadata,
      source: divider.source,
      requirementControlled: divider.requirementControlled,
      mazeRole: divider.mazeRole,
      assetType: divider.type,
      visualOnly: true
    }
  };
}

const level1V2MazeLiteVisualDividerProps = level1V2MazeLiteVisualDividers.map(createMazeLiteVisualDividerProp);
const level1V2MazeLiteDividers = level1V2MazeLiteVisualDividers;
const level1V2MazeLiteObstacles = [];

const level1V2Architecture = [
  ...level1V2MvpObjects,
  ...level1V2MazeLiteVisualDividerProps
];

const objectiveActiveColor = 0xb7f7ff;
const objectiveInactiveColor = 0x55727a;
const objectiveCompletedColor = 0x3f4b4d;
const objectiveFinalCompletedColor = 0x8df0d2;
const level1V2StartHint = 'Follow the active glowing document marker.';

const level1V2MvpObjectives = [
  {
    id: 'shift-assignment-form',
    type: 'task',
    order: 1,
    objectiveIndex: 0,
    label: 'Shift Assignment Form',
    documentName: 'Shift Assignment Form',
    taskText: 'Retrieve Shift Assignment Form.',
    nextTaskText: 'Check workstation logs.',
    promptText: 'Press E to retrieve Shift Assignment Form',
    interactionPrompt: 'Press E to retrieve Shift Assignment Form',
    completeText: 'Shift Assignment Form collected.',
    activeGlow: true,
    inactiveGlow: false,
    markerColor: objectiveInactiveColor,
    activeColor: objectiveActiveColor,
    completedColor: objectiveCompletedColor,
    routeHint: 'active-objective-beacon',
    visualType: 'document',
    documentTitle: 'SHIFT ASSIGNMENT\nFORM',
    surfaceHeight: 0.08,
    roomId: 'front-admin-intake',
    x: 5.5,
    y: 5.5,
    radius: 2.4,
    interactionRadius: 2.4,
    promptRadius: 4.8,
    status: 'mvp-objective'
  },
  {
    id: 'workstation-log',
    type: 'task',
    order: 2,
    objectiveIndex: 1,
    label: 'Workstation Log',
    documentName: 'Workstation Log',
    taskText: 'Check workstation logs.',
    nextTaskText: 'Review pending ledger.',
    promptText: 'Press E to check workstation logs',
    interactionPrompt: 'Press E to check workstation logs',
    completeText: 'Workstation Log checked.',
    activeGlow: true,
    inactiveGlow: false,
    markerColor: objectiveInactiveColor,
    activeColor: objectiveActiveColor,
    completedColor: objectiveCompletedColor,
    routeHint: 'active-objective-beacon',
    visualType: 'document',
    documentTitle: 'WORKSTATION\nLOG',
    surfaceHeight: 0.08,
    roomId: 'main-workstation-hall',
    x: 21.5,
    y: 5.5,
    radius: 2.55,
    interactionRadius: 2.55,
    promptRadius: 4.95,
    status: 'mvp-objective'
  },
  {
    id: 'pending-ledger',
    type: 'task',
    order: 3,
    objectiveIndex: 2,
    label: 'Pending Ledger',
    documentName: 'Pending Ledger',
    taskText: 'Review pending ledger.',
    nextTaskText: 'Collect archive record.',
    promptText: 'Press E to review pending ledger',
    interactionPrompt: 'Press E to review pending ledger',
    completeText: 'Pending Ledger reviewed.',
    activeGlow: true,
    inactiveGlow: false,
    markerColor: objectiveInactiveColor,
    activeColor: objectiveActiveColor,
    completedColor: objectiveCompletedColor,
    routeHint: 'active-objective-beacon',
    visualType: 'document',
    documentTitle: 'PENDING\nLEDGER',
    surfaceHeight: 0.08,
    roomId: 'boardroom-review',
    x: 21.5,
    y: 12.5,
    radius: 2.55,
    interactionRadius: 2.55,
    promptRadius: 4.95,
    status: 'mvp-objective'
  },
  {
    id: 'archive-record',
    type: 'task',
    order: 4,
    objectiveIndex: 3,
    label: 'Archive Record',
    documentName: 'Archive Record',
    taskText: 'Collect archive record.',
    nextTaskText: 'Proceed to Level 2 access.',
    promptText: 'Press E to collect archive record',
    interactionPrompt: 'Press E to collect archive record',
    completeText: 'Archive Record collected.',
    activeGlow: true,
    inactiveGlow: false,
    markerColor: objectiveInactiveColor,
    activeColor: objectiveActiveColor,
    completedColor: objectiveCompletedColor,
    routeHint: 'active-objective-beacon',
    visualType: 'document',
    documentTitle: 'ARCHIVE\nRECORD',
    surfaceHeight: 0.08,
    roomId: 'records-archive',
    x: 7,
    y: 20,
    radius: 2.55,
    interactionRadius: 2.55,
    promptRadius: 4.95,
    status: 'mvp-objective'
  },
  {
    id: 'level2-access-note',
    type: 'task',
    order: 5,
    objectiveIndex: 4,
    label: 'Level 2 Access Note',
    documentName: 'Level 2 Access Note',
    taskText: 'Proceed to Level 2 access.',
    completionText: 'Level 1 V2 route complete.',
    finalFeedbackText: 'Level 2 access ready. MVP route complete.',
    promptText: 'Press E to proceed to Level 2 access',
    interactionPrompt: 'Press E to proceed to Level 2 access',
    completeText: 'Level 2 access confirmed.',
    finalObjective: true,
    finalCompletedColor: objectiveFinalCompletedColor,
    finalCompleteGlow: false,
    activeGlow: true,
    inactiveGlow: false,
    markerColor: objectiveInactiveColor,
    activeColor: objectiveActiveColor,
    completedColor: objectiveCompletedColor,
    routeHint: 'active-objective-beacon',
    visualType: 'document',
    documentTitle: 'LEVEL 2\nACCESS',
    surfaceHeight: 0.08,
    roomId: 'level2-access',
    x: 15.5,
    y: 20,
    radius: 2.55,
    interactionRadius: 2.55,
    promptRadius: 4.95,
    status: 'mvp-objective'
  }
];

const level1V2ManualTestSteps = [
  'Start in A.',
  'Collect Shift Assignment Form.',
  'Navigate to C.',
  'Collect Workstation Log.',
  'Navigate to D.',
  'Review Pending Ledger.',
  'Navigate to F.',
  'Collect Archive Record.',
  'Navigate to H.',
  'Confirm Level 2 access.',
  'Confirm Documents 5/5.',
  'Confirm Level 1 V2 route complete.',
  'Reset and confirm route returns to 0/5.'
];

const level1V2PresentationChecklist = [
  'Start at A.',
  'Collect Shift Assignment Form.',
  'Follow tasks to C, D, F, H.',
  'Confirm Documents 5/5.',
  'Confirm Level 1 V2 route complete.',
  'Reset and verify route returns to 0/5.'
];

const expectedLevel1V2ObjectiveFlow = [
  {
    id: 'shift-assignment-form',
    roomId: 'front-admin-intake',
    x: 5.5,
    y: 5.5,
    taskText: 'Retrieve Shift Assignment Form.',
    promptText: 'Press E to retrieve Shift Assignment Form',
    completeText: 'Shift Assignment Form collected.'
  },
  {
    id: 'workstation-log',
    roomId: 'main-workstation-hall',
    x: 21.5,
    y: 5.5,
    taskText: 'Check workstation logs.',
    promptText: 'Press E to check workstation logs',
    completeText: 'Workstation Log checked.'
  },
  {
    id: 'pending-ledger',
    roomId: 'boardroom-review',
    x: 21.5,
    y: 12.5,
    taskText: 'Review pending ledger.',
    promptText: 'Press E to review pending ledger',
    completeText: 'Pending Ledger reviewed.'
  },
  {
    id: 'archive-record',
    roomId: 'records-archive',
    x: 7,
    y: 20,
    taskText: 'Collect archive record.',
    promptText: 'Press E to collect archive record',
    completeText: 'Archive Record collected.'
  },
  {
    id: 'level2-access-note',
    roomId: 'level2-access',
    x: 15.5,
    y: 20,
    taskText: 'Proceed to Level 2 access.',
    promptText: 'Press E to proceed to Level 2 access',
    completeText: 'Level 2 access confirmed.'
  }
];

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
  const objectiveCells = new Map((level.objectives ?? []).map((objective, index) => [
    cellKey(Math.floor(objective.x), Math.floor(objective.y)),
    `${index + 1}`
  ]));

  const rows = level.grid.map((row, y) => row.map((cell, x) => {
    const isBorder =
      x === 0 ||
      y === 0 ||
      x === GRID_WIDTH - 1 ||
      y === GRID_HEIGHT - 1;

    if (isBorder && cell === CONSTANTS.CELL_WALL) return '#';
    if (x === playerStartCell.x && y === playerStartCell.y) return 'P';

    const objectiveGlyph = objectiveCells.get(cellKey(x, y));
    if (objectiveGlyph) return objectiveGlyph;

    const room = findRoomAt(x, y);
    if (room) return room.code;
    if (isCellInBounds(x, y, level1V2CentralRoute.bounds)) return level1V2CentralRoute.code;
    if (cell === CONSTANTS.CELL_PATH) return '.';
    if (cell === CONSTANTS.CELL_WALL) return '#';
    return '?';
  }).join(''));

  return [
    `grid: ${level.grid[0]?.length ?? 0} x ${level.grid.length}`,
    `playerStart: x=${level.playerStart.x}, y=${level.playerStart.y}, yaw=${level.playerStart.yaw}, pitch=${level.playerStart.pitch}`,
    `legend: # outer boundary, . path, A/B/C/D/E/F/G/H room, R central route, P player, 1-5 objectives`,
    `wallSegments: ${level.wallSegments?.length ?? 0}`,
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

function hasTextValue(value) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().toLowerCase() !== 'undefined';
}

function validateLabelMetadata(area, requiredFields, warnings) {
  requiredFields.forEach(field => {
    if (!hasTextValue(area[field])) {
      warnings.push(`${area.code ?? area.id} ${field} label metadata must not be undefined`);
    }
  });
}

const approvedFloorplanBounds = {
  A: { x1: 2, y1: 3, x2: 9, y2: 7 },
  B: { x1: 2, y1: 8, x2: 9, y2: 12 },
  E: { x1: 2, y1: 13, x2: 6, y2: 15 },
  F: { x1: 2, y1: 17, x2: 12, y2: 22 },
  R: { x1: 10, y1: 3, x2: 13, y2: 22 },
  C: { x1: 14, y1: 3, x2: 29, y2: 8 },
  D: { x1: 14, y1: 10, x2: 29, y2: 15 },
  H: { x1: 14, y1: 17, x2: 17, y2: 22 },
  G: { x1: 19, y1: 17, x2: 29, y2: 22 }
};

function boundsMatch(first, second) {
  return (
    first?.x1 === second?.x1 &&
    first?.y1 === second?.y1 &&
    first?.x2 === second?.x2 &&
    first?.y2 === second?.y2
  );
}

function getFloorplanAreaForMarker(marker) {
  return level1V2FloorplanRooms.find(room => room.id === marker.roomId) ??
    (level1V2CentralRoute.id === marker.roomId ? level1V2CentralRoute : null);
}

function validateFloorplanMarkers(markers, warnings) {
  const expectedCodes = new Set(['A', 'B', 'E', 'F', 'R', 'C', 'D', 'H', 'G']);
  const markerCodes = new Set();

  if (markers.length !== expectedCodes.size) {
    warnings.push(`room marker count must remain ${expectedCodes.size}, found ${markers.length}`);
  }

  markers.forEach(marker => {
    markerCodes.add(marker.code);

    if (!hasTextValue(marker.id)) warnings.push(`${marker.code ?? 'marker'} id must not be empty`);
    if (!hasTextValue(marker.code)) warnings.push(`${marker.id ?? 'marker'} code must not be empty`);
    if (!hasTextValue(marker.label)) warnings.push(`${marker.id ?? marker.code} label must not be empty`);
    if (!hasTextValue(marker.roomId)) warnings.push(`${marker.id ?? marker.code} roomId must not be empty`);
    if (marker.markerType !== 'floorplan-label') warnings.push(`${marker.id} markerType must be floorplan-label`);
    if (marker.status !== 'preview-marker') warnings.push(`${marker.id} status must be preview-marker`);
    if (!hasTextValue(marker.text)) warnings.push(`${marker.id} text must not be empty or undefined`);

    const markerText = `${marker.text ?? ''}`;
    if (markerText.toLowerCase().includes('undefined')) {
      warnings.push(`${marker.id} text must not contain undefined`);
    }

    const x = marker.position?.x;
    const y = marker.position?.y;
    const positionValid = Number.isFinite(x) && Number.isFinite(y);

    if (!positionValid) {
      warnings.push(`${marker.id} position must include finite x and y values`);
      return;
    }

    if (x <= 0 || y <= 0 || x >= GRID_WIDTH - 1 || y >= GRID_HEIGHT - 1) {
      warnings.push(`${marker.id} marker position must stay inside the playable grid`);
    }

    const targetArea = getFloorplanAreaForMarker(marker);
    if (!targetArea) {
      warnings.push(`${marker.id} marker target roomId does not match a room or route`);
      return;
    }

    if (!isCellInBounds(x, y, targetArea.bounds)) {
      warnings.push(`${marker.id} marker must stay inside ${targetArea.code} bounds`);
    }

    if (Number.isFinite(marker.width) && (marker.width < 2.4 || marker.width > 4.4)) {
      warnings.push(`${marker.id} marker width should stay compact and readable`);
    }

    if (Number.isFinite(marker.height) && (marker.height < 0.5 || marker.height > 0.78)) {
      warnings.push(`${marker.id} marker height should stay presentation-safe`);
    }

    if (Number.isFinite(marker.opacity) && (marker.opacity < 0.72 || marker.opacity > 1)) {
      warnings.push(`${marker.id} marker opacity should stay readable without dominating`);
    }
  });

  expectedCodes.forEach(code => {
    if (!markerCodes.has(code)) warnings.push(`missing floorplan marker for ${code}`);
  });
  markerCodes.forEach(code => {
    if (!expectedCodes.has(code)) warnings.push(`unexpected floorplan marker for ${code}`);
  });
}

function validatePresentationLighting(level, warnings) {
  const ceilingLights = level.ceilingLights ?? [];
  const areaLights = level.areaLights ?? [];
  const lightingZones = level.lightingZones ?? [];
  const totalPresentationLights = ceilingLights.length + areaLights.length;
  const allAuthoredAreas = [...level1V2FloorplanRooms, level1V2CentralRoute];

  if (totalPresentationLights > 6) {
    warnings.push(`presentation light count must stay <= 6, found ${totalPresentationLights}`);
  }

  lightingZones.forEach(zone => {
    if (!hasTextValue(zone.id)) warnings.push('lighting zone id must not be empty or undefined');
    if (!hasTextValue(zone.channelId)) warnings.push(`${zone.id ?? 'lighting zone'} channelId must not be empty`);
    (zone.rooms ?? []).forEach(roomId => {
      if (!allAuthoredAreas.some(area => area.id === roomId)) {
        warnings.push(`${zone.id} references unknown lighting room ${roomId}`);
      }
    });
  });

  [...ceilingLights, ...areaLights].forEach(light => {
    if (!hasTextValue(light.id)) warnings.push('presentation light id must not be empty or undefined');
    if (!hasTextValue(light.channelId)) warnings.push(`${light.id ?? 'presentation light'} channelId must not be empty`);
    if (!Number.isFinite(light.x) || !Number.isFinite(light.y)) {
      warnings.push(`${light.id ?? 'presentation light'} must include finite x/y`);
      return;
    }
    if (light.x <= 0 || light.y <= 0 || light.x >= GRID_WIDTH - 1 || light.y >= GRID_HEIGHT - 1) {
      warnings.push(`${light.id} must stay inside the playable grid`);
    }
    if (light.flicker === true) {
      warnings.push(`${light.id} must not flicker in presentation mode`);
    }
    if ((light.intensity ?? 0) > 0.16) {
      warnings.push(`${light.id} intensity should stay subtle for MVP presentation`);
    }
    if ((light.distance ?? 0) > 13) {
      warnings.push(`${light.id} distance should stay low-cost and localized`);
    }
  });
}

function boundsContainBounds(container, candidate) {
  return (
    candidate.x1 >= container.x1 &&
    candidate.y1 >= container.y1 &&
    candidate.x2 <= container.x2 &&
    candidate.y2 <= container.y2
  );
}

function getObjectFootprint(object) {
  const width = object.size?.width ?? object.width ?? object.length ?? 0.5;
  const depth = object.size?.depth ?? object.depth ?? 0.5;
  const x = object.x ?? object.position?.x;
  const y = object.y ?? object.position?.z;

  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

  return {
    x1: x - width / 2,
    y1: y - depth / 2,
    x2: x + width / 2,
    y2: y + depth / 2
  };
}

function objectHasAssetReference(object) {
  return [
    object.modelUrl,
    object.modelId,
    object.assetTag,
    object.chairModelUrl,
    object.chairModelId,
    object.chairAssetTag,
    object.metadata?.modelUrl,
    object.metadata?.modelId,
    object.metadata?.assetTag,
    object.metadata?.chairModelUrl,
    object.metadata?.chairModelId,
    object.metadata?.chairAssetTag
  ].some(hasTextValue);
}

function validateMvpObjects(objects, warnings) {
  if (objects.length !== level1V2MvpObjects.length) {
    warnings.push(`MVP object count must remain ${level1V2MvpObjects.length}, found ${objects.length}`);
  }

  objects.forEach(object => {
    if (!hasTextValue(object.id)) warnings.push('MVP object id must not be empty or undefined');
    if (!hasTextValue(object.type)) warnings.push(`${object.id ?? 'MVP object'} type must not be empty or undefined`);
    if (!hasTextValue(object.label)) warnings.push(`${object.id ?? 'MVP object'} label must not be empty or undefined`);
    if (!hasTextValue(object.roomId)) warnings.push(`${object.id ?? 'MVP object'} roomId must not be empty or undefined`);
    if (object.status !== 'mvp-preview-object') warnings.push(`${object.id} status must be mvp-preview-object`);
    if (object.visualOnly !== true || object.metadata?.visualOnly !== true) {
      warnings.push(`${object.id} must be visualOnly`);
    }
    if (objectHasAssetReference(object)) {
      warnings.push(`${object.id} must not reference GLB, online, or model assets`);
    }

    const footprint = getObjectFootprint(object);
    if (!footprint) {
      warnings.push(`${object.id} must have a finite x/y position`);
      return;
    }

    if (!boundsContainBounds({ x1: 1, y1: 1, x2: GRID_WIDTH - 2, y2: GRID_HEIGHT - 2 }, footprint)) {
      warnings.push(`${object.id} must stay inside playable grid and away from outer walls`);
    }

    const targetRoom = level1V2FloorplanRooms.find(room => room.id === object.roomId);
    if (!targetRoom) {
      warnings.push(`${object.id} roomId must match an A-H room`);
      return;
    }

    if (!boundsContainBounds(targetRoom.bounds, footprint)) {
      warnings.push(`${object.id} must stay inside ${targetRoom.code} bounds`);
    }

    if (doBoundsOverlap(footprint, level1V2CentralRoute.bounds)) {
      warnings.push(`${object.id} must not overlap the central route`);
    }
  });
}

function getMazeLiteDividerFootprint(divider) {
  const width = metersToGridCells(divider.dimensionsMeters?.width ?? 1);
  const depth = metersToGridCells(divider.dimensionsMeters?.depth ?? 0.2);
  const x = divider.position?.x;
  const y = divider.position?.y;

  return {
    x1: x - width / 2,
    y1: y - depth / 2,
    x2: x + width / 2,
    y2: y + depth / 2
  };
}

function validateArchitectureComposition(level, warnings) {
  const expectedIds = [
    ...(level.mvpObjects ?? []).map(object => object.id),
    ...level1V2MazeLiteVisualDividerProps.map(object => object.id)
  ];
  const actualIds = (level.architecture ?? []).map(object => object.id);

  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    warnings.push('architecture must contain MVP objects followed only by approved Phase 1 visual dividers');
  }
}

function validateMazeLiteDividers(level, warnings) {
  const dividers = level.mazeLiteDividers ?? [];
  const expectedDividers = level1V2MazeLiteVisualDividers;
  const expectedIds = expectedDividers.map(divider => divider.id);
  const actualIds = dividers.map(divider => divider.id);
  const objectiveFootprints = (level.objectives ?? []).map(objective => ({
    id: objective.id,
    x: objective.x,
    y: objective.y,
    footprint: {
      x1: objective.x - 0.32,
      y1: objective.y - 0.32,
      x2: objective.x + 0.32,
      y2: objective.y + 0.32
    }
  }));
  const markerFootprints = (level.floorplanMarkers ?? []).map(marker => ({
    id: marker.id,
    x: marker.position?.x,
    y: marker.position?.y,
    footprint: {
      x1: (marker.position?.x ?? 0) - 0.4,
      y1: (marker.position?.y ?? 0) - 0.4,
      x2: (marker.position?.x ?? 0) + 0.4,
      y2: (marker.position?.y ?? 0) + 0.4
    }
  }));

  if (mazeLitePhase1Enabled === false && dividers.length !== 0) {
    warnings.push(`Maze Lite Phase 1 is paused; active divider count must be 0, found ${dividers.length}`);
  }

  if (mazeLitePhase1Enabled === true && (dividers.length < 1 || dividers.length > 4)) {
    warnings.push(`Maze Lite Phase 1 divider count must be between 1 and 4, found ${dividers.length}`);
  }

  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    warnings.push(`Maze Lite Phase 1 divider IDs must be exactly ${expectedIds.join(', ')}`);
  }

  if ((level.mazeLiteObstacles ?? []).length !== 0) {
    warnings.push('mazeLiteObstacles must remain empty for the visual-only phase');
  }

  dividers.forEach((divider, index) => {
    const expectedDivider = expectedDividers[index];
    const dimensions = divider.dimensionsMeters ?? {};
    const footprint = getMazeLiteDividerFootprint(divider);
    const targetRoom = level1V2FloorplanRooms.find(room => room.id === divider.roomId);

    if (!expectedDivider || JSON.stringify(divider) !== JSON.stringify(expectedDivider)) {
      warnings.push(`${divider.id ?? `divider ${index + 1}`} must match the approved Phase 1 placement`);
    }

    if (divider.source !== mazeLitePhase1Source) warnings.push(`${divider.id} source must be ${mazeLitePhase1Source}`);
    if (divider.requirementControlled !== true) warnings.push(`${divider.id} must be requirementControlled`);
    if (divider.collision !== false) warnings.push(`${divider.id} collision must be false`);
    if (divider.blocking !== false) warnings.push(`${divider.id} blocking must be false`);
    if (!['cubicle-partition', 'archive-rack-divider'].includes(divider.type)) {
      warnings.push(`${divider.id} type is not approved for Phase 1`);
    }

    if (divider.type === 'cubicle-partition') {
      if (dimensions.width < 2 || dimensions.width > 2.4) warnings.push(`${divider.id} width must stay 2.0m to 2.4m`);
      if (dimensions.depth < 0.18 || dimensions.depth > 0.25) warnings.push(`${divider.id} depth must stay 0.18m to 0.25m`);
      if (dimensions.height < 1.2 || dimensions.height > 1.5) warnings.push(`${divider.id} height must stay 1.2m to 1.5m`);
    }

    if (divider.type === 'archive-rack-divider') {
      if (dimensions.width < 1.5 || dimensions.width > 2) warnings.push(`${divider.id} width must stay 1.5m to 2.0m`);
      if (dimensions.depth < 0.35 || dimensions.depth > 0.5) warnings.push(`${divider.id} depth must stay 0.35m to 0.5m`);
      if (dimensions.height < 1.6 || dimensions.height > 2) warnings.push(`${divider.id} height must stay 1.6m to 2.0m`);
    }

    if (!targetRoom) {
      warnings.push(`${divider.id} roomId must match an approved room`);
    } else if (!boundsContainBounds(targetRoom.bounds, footprint)) {
      warnings.push(`${divider.id} must stay inside ${targetRoom.code} bounds`);
    }

    if (doBoundsOverlap(footprint, level1V2CentralRoute.bounds)) {
      warnings.push(`${divider.id} must not overlap the central route`);
    }

    objectiveFootprints.forEach(objective => {
      if (doBoundsOverlap(footprint, objective.footprint)) {
        warnings.push(`${divider.id} must not overlap objective ${objective.id}`);
      }
    });

    markerFootprints.forEach(marker => {
      if (Number.isFinite(marker.x) && Number.isFinite(marker.y) && doBoundsOverlap(footprint, marker.footprint)) {
        warnings.push(`${divider.id} must not overlap room label ${marker.id}`);
      }
    });
  });
}

function validateMazeLiteCollisionVolumes(level, warnings) {
  if ((level.collisionVolumes ?? []).length !== 0) {
    warnings.push('collisionVolumes must remain empty while Office Maze Lite dividers are disabled');
  }
}

function cellKey(x, y) {
  return `${x},${y}`;
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

function getInteriorWallCellKeys(grid) {
  const wallKeys = new Set();

  for (let y = 1; y < grid.length - 1; y++) {
    for (let x = 1; x < (grid[y]?.length ?? 1) - 1; x++) {
      if (grid[y][x] === CONSTANTS.CELL_WALL) {
        wallKeys.add(cellKey(x, y));
      }
    }
  }

  return wallKeys;
}

function validateBoundaryOnlyGrid(level, warnings) {
  const wallSegments = level.wallSegments ?? [];
  const gridWallKeys = getInteriorWallCellKeys(level.grid);

  if (wallSegments.length !== 0) {
    warnings.push(`wallSegments must remain empty for the guarded MVP, found ${wallSegments.length}`);
  }

  gridWallKeys.forEach(key => {
    warnings.push(`interior cell ${key} must remain CELL_PATH`);
  });

  return {
    wallSegmentCount: wallSegments.length,
    gridInteriorWallCellCount: gridWallKeys.size,
    boundaryOnly: wallSegments.length === 0 && gridWallKeys.size === 0
  };
}

function validateObjectiveRouteReachability(level, warnings) {
  const routePoints = [
    {
      id: 'playerStart',
      x: Math.floor(level.playerStart.x),
      y: Math.floor(level.playerStart.y)
    },
    ...(level.objectives ?? []).map(objective => ({
      id: objective.id,
      x: Math.floor(objective.x),
      y: Math.floor(objective.y)
    }))
  ];

  const segments = [];

  for (let index = 0; index < routePoints.length - 1; index++) {
    const from = routePoints[index];
    const to = routePoints[index + 1];
    const reachableCells = collectReachableCells(level.grid, from);
    const targetReachable = reachableCells.has(cellKey(to.x, to.y));
    segments.push({
      from: from.id,
      to: to.id,
      targetReachable
    });

    if (!targetReachable) {
      warnings.push(`route segment ${from.id} -> ${to.id} is blocked by the collision grid`);
    }
  }

  const centralRouteStart = { x: 11, y: level1V2CentralRoute.bounds.y1 };
  const centralRouteEnd = { x: 11, y: level1V2CentralRoute.bounds.y2 };
  const centralRouteReachable = collectReachableCells(level.grid, centralRouteStart)
    .has(cellKey(centralRouteEnd.x, centralRouteEnd.y));

  if (!centralRouteReachable) {
    warnings.push('central route must remain passable top-to-bottom');
  }

  return {
    mode: 'approximate-grid-cell-bfs',
    centralRouteReachable,
    segments
  };
}

function getObjectiveTargetArea(objective) {
  return level1V2FloorplanRooms.find(room => room.id === objective.roomId) ??
    (level1V2CentralRoute.id === objective.roomId ? level1V2CentralRoute : null);
}

function validateMvpObjectives(level, reachableCells, warnings) {
  const objectives = level.objectives ?? [];

  if (objectives.length !== 5) {
    warnings.push(`objectives count must be 5, found ${objectives.length}`);
  }

  if (level.objectiveFlow?.documentCountTarget !== 5) {
    warnings.push('documentCountTarget must be 5 for Level 1 V2 MVP flow');
  }

  if (level.objectiveFlow?.startHint !== level1V2StartHint) {
    warnings.push(`objectiveFlow startHint must be "${level1V2StartHint}"`);
  }

  const expectedRouteCodes = ['A', 'C', 'D', 'F', 'H'];
  if (JSON.stringify(level.objectiveFlow?.route ?? []) !== JSON.stringify(expectedRouteCodes)) {
    warnings.push('objectiveFlow route must remain A -> C -> D -> F -> H');
  }

  if (level.objectiveFlow?.completionText !== 'Level 1 V2 route complete.') {
    warnings.push('objectiveFlow completionText must remain Level 1 V2 route complete.');
  }

  if (level.objectiveFlow?.nextLevelMessage !== 'Level 2 access ready. MVP route complete.') {
    warnings.push('objectiveFlow nextLevelMessage must remain the presentation-ready completion message');
  }

  if (level.objectiveFlow?.exitUnlockPending !== true || level.objectiveFlow?.nextLevelNotImplemented !== true) {
    warnings.push('objectiveFlow must mark Level 2 exit as pending/not implemented');
  }

  if (objectives.some(objective => objective.type === 'finalExit')) {
    warnings.push('Level 1 V2 MVP completion must not add a finalExit transition yet');
  }

  expectedLevel1V2ObjectiveFlow.forEach((expected, index) => {
    const objective = objectives[index];
    if (objective?.id !== expected.id) {
      warnings.push(`objective ${index + 1} must be ${expected.id}`);
      return;
    }

    if (objective.roomId !== expected.roomId) {
      warnings.push(`${objective.id} roomId must be ${expected.roomId}`);
    }

    if (objective.x !== expected.x || objective.y !== expected.y) {
      warnings.push(`${objective.id} position changed from approved MVP objective flow`);
    }

    if (objective.taskText !== expected.taskText) {
      warnings.push(`${objective.id} taskText must be "${expected.taskText}"`);
    }

    if (objective.promptText !== expected.promptText || objective.interactionPrompt !== expected.promptText) {
      warnings.push(`${objective.id} prompt text must be "${expected.promptText}"`);
    }

    if (objective.completeText !== expected.completeText) {
      warnings.push(`${objective.id} completeText must be "${expected.completeText}"`);
    }

    if (objective.order !== index + 1) {
      warnings.push(`${objective.id} order must be ${index + 1}`);
    }

    if (objective.objectiveIndex !== index) {
      warnings.push(`${objective.id} objectiveIndex must be ${index}`);
    }
  });

  objectives.forEach(objective => {
    [
      'id',
      'label',
      'taskText',
      'roomId',
      'documentName',
      'promptText',
      'interactionPrompt',
      'completeText',
      'status'
    ].forEach(field => {
      if (!hasTextValue(objective[field])) {
        warnings.push(`${objective.id ?? 'objective'} ${field} must not be empty or undefined`);
      }
    });

    if (objective.type !== 'task') warnings.push(`${objective.id} type must be task`);
    if (objective.status !== 'mvp-objective') warnings.push(`${objective.id} status must be mvp-objective`);
    if (objective.activeGlow !== true) warnings.push(`${objective.id} activeGlow must be true`);
    if (objective.inactiveGlow !== false) warnings.push(`${objective.id} inactiveGlow must be false`);
    if (objective.visualType !== 'document') warnings.push(`${objective.id} visualType must be document`);
    if (objective.routeHint !== 'active-objective-beacon') warnings.push(`${objective.id} routeHint must be active-objective-beacon`);
    if (!Number.isFinite(objective.activeColor) || !Number.isFinite(objective.completedColor) || !Number.isFinite(objective.markerColor)) {
      warnings.push(`${objective.id} must include active, completed, and future marker colors`);
    }
    if (!Number.isFinite(objective.order) || !Number.isFinite(objective.objectiveIndex)) {
      warnings.push(`${objective.id} must include numeric order and objectiveIndex`);
    }
    if (!Number.isFinite(objective.interactionRadius) || objective.interactionRadius !== objective.radius) {
      warnings.push(`${objective.id} interactionRadius must match radius`);
    }
    if (!Number.isFinite(objective.promptRadius) || objective.promptRadius <= objective.interactionRadius) {
      warnings.push(`${objective.id} promptRadius must be larger than interactionRadius`);
    }
    if (!Number.isFinite(objective.x) || !Number.isFinite(objective.y)) {
      warnings.push(`${objective.id} position must include finite x and y values`);
      return;
    }

    [
      objective.id,
      objective.label,
      objective.documentName,
      objective.taskText,
      objective.nextTaskText,
      objective.completionText,
      objective.promptText,
      objective.interactionPrompt,
      objective.completeText,
      objective.finalFeedbackText,
      objective.documentTitle
    ].forEach(value => {
      if (`${value ?? ''}`.toLowerCase().includes('undefined')) {
        warnings.push(`${objective.id} text metadata must not contain undefined`);
      }
    });

    if (objective.x <= 0 || objective.y <= 0 || objective.x >= GRID_WIDTH - 1 || objective.y >= GRID_HEIGHT - 1) {
      warnings.push(`${objective.id} must stay inside playable grid`);
    }

    const targetArea = getObjectiveTargetArea(objective);
    if (!targetArea) {
      warnings.push(`${objective.id} roomId must match a room`);
      return;
    }

    if (!isCellInBounds(objective.x, objective.y, targetArea.bounds)) {
      warnings.push(`${objective.id} must stay inside ${targetArea.code} bounds`);
    }

    if (targetArea.id !== level1V2CentralRoute.id && isCellInBounds(objective.x, objective.y, level1V2CentralRoute.bounds)) {
      warnings.push(`${objective.id} must not be inside the central route`);
    }

    const objectiveCell = {
      x: Math.floor(objective.x),
      y: Math.floor(objective.y)
    };

    if (!isPathCell(level.grid, objectiveCell.x, objectiveCell.y)) {
      warnings.push(`${objective.id} must be on CELL_PATH`);
    }

    if (!reachableCells.has(cellKey(objectiveCell.x, objectiveCell.y))) {
      warnings.push(`${objective.id} is not reachable from playerStart`);
    }

    if (objectHasAssetReference(objective)) {
      warnings.push(`${objective.id} must not reference GLB, online, or model assets`);
    }
  });

  const activeMarkerExists = objectives.some(objective => objective.activeGlow === true && objective.routeHint === 'active-objective-beacon');
  const completedMarkerStateExists = objectives.every(objective => Number.isFinite(objective.completedColor) && hasTextValue(objective.completeText));
  const finalObjective = objectives[objectives.length - 1];
  const finalMarkerStateExists = finalObjective?.finalObjective === true &&
    finalObjective?.finalCompleteGlow === false &&
    Number.isFinite(finalObjective?.finalCompletedColor) &&
    finalObjective?.finalFeedbackText === 'Level 2 access ready. MVP route complete.';
  if (!activeMarkerExists) warnings.push('active objective marker state must exist');
  if (!completedMarkerStateExists) warnings.push('completed objective marker state must exist');
  if (!finalMarkerStateExists) warnings.push('H final completion marker state must exist and remain dim after completion');
  if (!hasTextValue(finalObjective?.completionText) || finalObjective.completionText !== level.objectiveFlow?.completionText) {
    warnings.push('final objective completionText must match objectiveFlow completionText');
  }

  const forbiddenV1ObjectiveText = [
    'Assigned Desk File',
    'Archive Index Packet',
    'Review Ledger',
    'Transfer Notice',
    'Final Access Door'
  ];
  const v2ObjectiveText = JSON.stringify(objectives);
  forbiddenV1ObjectiveText.forEach(text => {
    if (v2ObjectiveText.includes(text)) {
      warnings.push(`V2 objective text must not include old V1 text: ${text}`);
    }
  });
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
    'goals',
    'checkpoints',
    'triggers',
    'crushers',
    'sentientObjects',
    'hazards',
    'routes',
    'guideStrips',
    'navigationNodes',
    'partitionBands',
    'doorways',
    'connectors',
    'storyBeats',
    'manipulationNodes',
    'wallDetailZones',
    'ceilingDetailZones'
  ].forEach(key => {
    if ((level[key] ?? []).length !== 0) {
      warnings.push(`${key} must be empty in floorplan preview mode`);
    }
  });

  if (level.status !== 'mvp-objective-preview') {
    warnings.push('status must remain mvp-objective-preview');
  }

  if (level.mapBuildMode !== 'floorplan-zones-mvp') {
    warnings.push('mapBuildMode must remain floorplan-zones-mvp');
  }

  if (level.mvpObjectiveMode !== true) {
    warnings.push('mvpObjectiveMode must be true');
  }

  if (level.wallMode !== 'outer-boundary-only') {
    warnings.push('wallMode must be outer-boundary-only');
  }

  if (level.wallImplementation !== 'boundary-grid-only') {
    warnings.push('wallImplementation must be boundary-grid-only');
  }

  if (level.internalWallPolicy !== 'disabled') {
    warnings.push('internalWallPolicy must be disabled');
  }

  level1V2FloorplanRooms.forEach(room => {
    if (!areBoundsInsideInterior(room.bounds)) {
      warnings.push(`${room.code} bounds must stay inside the playable interior`);
    }

    if (!boundsMatch(room.bounds, approvedFloorplanBounds[room.code])) {
      warnings.push(`${room.code} bounds changed from the approved floorplan`);
    }

    validateLabelMetadata(room, [
      'code',
      'id',
      'label',
      'function',
      'accessStyle',
      'status',
      'statusLabel',
      'zoneType'
    ], warnings);
  });

  if (!areBoundsInsideInterior(level1V2CentralRoute.bounds)) {
    warnings.push('central route bounds must stay inside the playable interior');
  }

  if (!boundsMatch(level1V2CentralRoute.bounds, approvedFloorplanBounds.R)) {
    warnings.push('central route bounds changed from the approved floorplan');
  }

  validateLabelMetadata(level1V2CentralRoute, [
    'code',
    'id',
    'label',
    'function',
    'status',
    'statusLabel',
    'zoneType'
  ], warnings);

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
  const expectedFloorZoneOrder = [
    'front-admin-intake',
    'canteen',
    'toilet',
    'records-archive',
    'central-route',
    'main-workstation-hall',
    'boardroom-review',
    'level2-access',
    'secondary-workstation',
    'empty-field'
  ];
  const actualFloorZoneOrder = level.floorZones.map(zone => zone.id);
  const floorZoneOrderMatches = expectedFloorZoneOrder.every((id, index) => actualFloorZoneOrder[index] === id);

  if (!floorZoneOrderMatches || actualFloorZoneOrder.length !== expectedFloorZoneOrder.length) {
    warnings.push(`floor zone order must be ${expectedFloorZoneOrder.join(' -> ')}`);
  }

  level.floorZones
    .filter(zone => zone.id !== 'empty-field')
    .forEach(zone => {
      const approvedEntry = [...level1V2FloorplanRooms, level1V2CentralRoute].find(area => area.id === zone.id);
      if (!approvedEntry) {
        warnings.push(`${zone.id} floor zone must map to an approved room or route`);
        return;
      }
      if (!boundsMatch(zone, approvedEntry.bounds)) {
        warnings.push(`${zone.id} floor zone bounds changed from approved floorplan`);
      }
    });

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

  validateFloorplanMarkers(level.floorplanMarkers ?? [], warnings);
  validateMvpObjects(level.mvpObjects ?? [], warnings);
  validateMazeLiteDividers(level, warnings);
  validateMazeLiteCollisionVolumes(level, warnings);
  validateArchitectureComposition(level, warnings);
  validatePresentationLighting(level, warnings);
  const boundaryGridValidation = validateBoundaryOnlyGrid(level, warnings);

  const playerStartCell = {
    x: Math.floor(level.playerStart.x),
    y: Math.floor(level.playerStart.y)
  };
  const reachableCells = collectReachableCells(grid, playerStartCell);
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

  validateMvpObjectives(level, reachableCells, warnings);
  const objectiveRouteReachability = validateObjectiveRouteReachability(level, warnings);
  const mazeLiteDividers = level.mazeLiteDividers ?? [];
  const mazeLiteObstacles = level.mazeLiteObstacles ?? [];

  return {
    valid: warnings.length === 0,
    warnings,
    details: {
      gridWidth: width,
      gridHeight: height,
      roomCount: level1V2FloorplanRooms.length,
      centralRouteBounds: level1V2CentralRoute.bounds,
      floorplanMarkerCount: level.floorplanMarkers?.length ?? 0,
      presentationLightCount: (level.ceilingLights?.length ?? 0) + (level.areaLights?.length ?? 0),
      presentationLightBudgetOk: ((level.ceilingLights?.length ?? 0) + (level.areaLights?.length ?? 0)) <= 6,
      playerStartCell,
      playerStartOpen,
      playerStartInsideA,
      playerStartNearA,
      floorZoneOrder: level.floorZones.map(zone => zone.id),
      architectureObjectCount: level.architecture.length,
      mvpObjectCount: level.mvpObjects?.length ?? 0,
      officeMazeLiteStatus: level.officeMazeLite,
      mazeLiteDividerCount: mazeLiteDividers.length,
      mazeLiteObstacleCount: mazeLiteObstacles.length,
      mazeLitePhase1Enabled,
      mazeLitePlacementStatus,
      mazeLitePhase1VisualOnly: mazeLiteDividers.length > 0 &&
        mazeLiteDividers.length <= 4 &&
        mazeLiteDividers.every(divider => divider.collision === false && divider.blocking === false),
      collisionVolumesEmpty: level.collisionVolumes.length === 0,
      boundaryGridValidation,
      objectiveRouteReachability,
      objectiveCount: level.objectives.length,
      documentCountTarget: level.objectiveFlow?.documentCountTarget,
      startHint: level.objectiveFlow?.startHint,
      objectiveRoute: level.objectives.map(objective => objective.roomId),
      objectiveOrder: level.objectives.map(objective => objective.id),
      taskTextProgression: [
        ...level.objectives.map(objective => objective.taskText),
        level.objectiveFlow?.completionText
      ],
      objectivePromptTexts: level.objectives.map(objective => objective.promptText),
      objectiveCompleteTexts: level.objectives.map(objective => objective.completeText),
      routeHint: level.objectives[0]?.routeHint,
      nextLevelMessage: level.objectiveFlow?.nextLevelMessage,
      interiorCellsArePath: boundaryGridValidation.gridInteriorWallCellCount === 0,
      noInternalWalls: boundaryGridValidation.boundaryOnly,
      reachableCells: reachableCells.size
    }
  };
}

export const level1V2 = {
  schemaVersion: 1,
  id: 'level-1-v2',
  label: 'Level 1 V2 MVP Objective Preview',
  title: 'Level 1 V2 MVP Objective Preview',
  version: 'v2-mvp-objective-preview',
  status: 'mvp-objective-preview',
  floorplanPreview: true,
  mvpObjectiveMode: true,
  mapBuildMode: 'floorplan-zones-mvp',
  wallMode: 'outer-boundary-only',
  wallImplementation: 'boundary-grid-only',
  internalWallPolicy: 'disabled',
  mazeLitePhase1Enabled,
  mazeLitePlacementStatus,
  officeMazeLite: level1V2OfficeMazeLiteStatus,
  objectiveFlow: {
    route: ['A', 'C', 'D', 'F', 'H'],
    documentCountTarget: 5,
    startHint: level1V2StartHint,
    taskTexts: level1V2MvpObjectives.map(objective => objective.taskText),
    completionText: 'Level 1 V2 route complete.',
    nextLevelMessage: 'Level 2 access ready. MVP route complete.',
    exitUnlockPending: true,
    nextLevelNotImplemented: true
  },
  active: true,
  estimatedMinutes: 0,
  grid: level1V2CollisionGrid,
  collisionGrid: level1V2CollisionGrid,
  playerStart,
  rooms: level1V2FloorplanRooms,
  corridors: [level1V2CentralRoute],
  floorZones: level1V2FloorZones,
  floorplanMarkers: level1V2FloorplanMarkers,
  mvpObjects: level1V2MvpObjects,
  mazeLiteDividers: level1V2MazeLiteDividers,
  mazeLiteObstacles: level1V2MazeLiteObstacles,
  architecture: level1V2Architecture,
  objectives: level1V2MvpObjectives,
  goals: [],
  checkpoints: [],
  triggers: [],
  crushers: [],
  sentientObjects: [],
  collisionVolumes: [],
  routes: [],
  guideStrips: [],
  navigationNodes: [],
  areaLights: level1V2AreaLights,
  ceilingLights: level1V2CeilingLights,
  wallSegments: level1V2WallSegments,
  partitionBands: [],
  doorways: [],
  connectors: [],
  hazards: [],
  storyBeats: [],
  manipulationNodes: [],
  lightingZones: level1V2LightingZones,
  wallDetailZones: [],
  ceilingDetailZones: [],
  manualTestSteps: level1V2ManualTestSteps,
  presentationChecklist: level1V2PresentationChecklist,
  notes: [
    'Level 1 V2 MVP objective preview. Floor zones remain the source of truth.',
    'A-H rooms and the central route are shown as floor colors only.',
    'Only outer boundary walls exist.',
    'Every non-border interior cell remains CELL_PATH.',
    'Minimal MVP objects are procedural visual markers only; collisionVolumes remain empty.',
    'Office Maze Lite Phase 1 divider rendering is paused pending user-approved screenshot/top-down placement.',
    'Maze Lite dividers are non-colliding and non-blocking; grid wall segments remain disabled.',
    'Simple objective route is A -> C -> D -> F -> H.',
    'Level 1 V2 MVP presentation checklist: start at A, collect Shift Assignment Form, follow tasks to C/D/F/H, confirm Documents 5/5, confirm route complete, reset to 0/5.',
    `Start hint: ${level1V2StartHint}`,
    'Manual test: start in A, confirm first task, collect A -> C -> D -> F -> H, confirm Documents reaches 5/5, route complete text, then reset to 0/5.'
  ]
};

export const level1V2AsciiPreview = createLevel1V2AsciiPreview(level1V2);
export const level1V2FloorplanPreviewValidation = validateLevel1V2FloorplanPreview(level1V2);

if (CONSTANTS.DEV_MODE) {
  printLevel1V2AsciiGrid(level1V2);
  console.info('[MazeMind] Level 1 V2 MVP manual test steps:\n' + level1V2ManualTestSteps.map((step, index) => `${index + 1}. ${step}`).join('\n'));
  console.info('[MazeMind] Level 1 V2 MVP presentation checklist:\n' + level1V2PresentationChecklist.map((step, index) => `${index + 1}. ${step}`).join('\n'));

  if (level1V2FloorplanPreviewValidation.valid) {
    console.info('[MazeMind] Level 1 V2 floorplan preview validation passed', level1V2FloorplanPreviewValidation);
  } else {
    console.warn('[MazeMind] Level 1 V2 floorplan preview validation warnings', level1V2FloorplanPreviewValidation);
  }
}
