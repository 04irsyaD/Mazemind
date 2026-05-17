import { CONSTANTS } from '../core/Constants.js';
import { OfficeMazeGenerator } from './OfficeMazeGenerator.js';

const W = 45;
const H = 31;

const rooms = [
  {
    id: 'front-reception',
    label: 'Reception / Waiting Area',
    x1: 2,
    y1: 18,
    x2: 12,
    y2: 21,
    color: 0xd8dcdd,
    purpose: 'spawn',
    mood: 'quiet corporate'
  },
  {
    id: 'employee-intake',
    label: 'Employee Intake Desk',
    x1: 2,
    y1: 14,
    x2: 12,
    y2: 17,
    color: 0xd3dcdd,
    purpose: 'first document',
    mood: 'administrative'
  },
  {
    id: 'main-workstation-hall',
    label: 'Main Workstation Hall',
    x1: 2,
    y1: 4,
    x2: 19,
    y2: 12,
    color: 0xb9c2c5,
    purpose: 'exploration',
    mood: 'empty night office'
  },
  {
    id: 'archive',
    label: 'Records Archive',
    x1: 3,
    y1: 23,
    x2: 15,
    y2: 28,
    color: 0x8f9ba5,
    purpose: 'exploration',
    mood: 'cold storage'
  },
  {
    id: 'checkpoint-chamber',
    label: 'Counsellor / Review Room',
    x1: 18,
    y1: 12,
    x2: 24,
    y2: 18,
    color: 0xc7e1e4,
    purpose: 'document review',
    mood: 'judged'
  },
  {
    id: 'wrong-department',
    label: 'Accounts / Records Office',
    x1: 25,
    y1: 4,
    x2: 35,
    y2: 10,
    color: 0xc7cbc2,
    purpose: 'right department wing',
    mood: 'too orderly'
  },
  {
    id: 'utility-break',
    label: 'Staff Room',
    x1: 18,
    y1: 23,
    x2: 28,
    y2: 28,
    color: 0xa9b2a6,
    purpose: 'quiet detour',
    mood: 'stale'
  },
  {
    id: 'crusher-corridor',
    label: 'Emergency Records Hall',
    x1: 25,
    y1: 14,
    x2: 37,
    y2: 16,
    color: 0xb75a4d,
    purpose: 'fair threat corridor',
    mood: 'warning'
  },
  {
    id: 'fake-exit',
    label: 'Public Exit',
    x1: 38,
    y1: 12,
    x2: 42,
    y2: 18,
    color: 0xd6e4db,
    purpose: 'false hope',
    mood: 'too clean'
  },
  {
    id: 'final-route',
    label: 'Unknown Department Transfer Corridor',
    x1: 36,
    y1: 22,
    x2: 42,
    y2: 28,
    color: 0xc0dfe3,
    purpose: 'final route',
    mood: 'psychologically wrong'
  }
];

const connectors = [
  { id: 'reception-to-intake', label: 'Employee Intake Hall', x1: 4, y1: 17, x2: 10, y2: 18, from: 'front-reception', to: 'employee-intake' },
  { id: 'intake-to-workstations', label: 'Main Workstation Entry', x1: 6, y1: 12, x2: 10, y2: 14, from: 'employee-intake', to: 'main-workstation-hall' },
  { id: 'intake-to-archive', label: 'Archive Service Aisle', x1: 10, y1: 17, x2: 11, y2: 24, from: 'employee-intake', to: 'archive' },
  { id: 'workstation-to-review', label: 'Review Intake', x1: 17, y1: 11, x2: 20, y2: 14, from: 'main-workstation-hall', to: 'checkpoint-chamber' },
  { id: 'review-to-wrong-dept', label: 'Department Transfer', x1: 22, y1: 10, x2: 25, y2: 12, from: 'checkpoint-chamber', to: 'wrong-department' },
  { id: 'review-to-break', label: 'Staff Service Bend', x1: 21, y1: 18, x2: 23, y2: 23, from: 'checkpoint-chamber', to: 'utility-break' },
  { id: 'review-to-records', label: 'Emergency Records Intake', x1: 24, y1: 14, x2: 26, y2: 16, from: 'checkpoint-chamber', to: 'crusher-corridor' },
  { id: 'fake-exit-afterimage', label: 'Exit Afterimage', x1: 40, y1: 18, x2: 41, y2: 24, from: 'fake-exit', to: 'final-route' },
  { id: 'final-bend', label: 'Department Afterimage Bend', x1: 36, y1: 24, x2: 42, y2: 28, from: 'final-route', to: 'final-route' }
];

const objectives = [
  {
    id: 'shift-assignment-form',
    type: 'task',
    label: 'Shift Assignment Form',
    x: 5.35,
    y: 16.16,
    radius: 2.35,
    roomId: 'employee-intake',
    visualType: 'document',
    documentTitle: 'SHIFT ASSIGNMENT\nFORM',
    surfaceHeight: 0.92,
    markFloor: false
  },
  { id: 'assigned-desk-file', type: 'task', label: 'Assigned Desk File', x: 8, y: 7, radius: 2.45, roomId: 'main-workstation-hall' },
  { id: 'archive-index-packet', type: 'task', label: 'Archive Index Packet', x: 7, y: 25, radius: 2.45, height: -0.03, roomId: 'archive' },
  { id: 'review-ledger', type: 'task', label: 'Review Ledger', x: 21, y: 15, radius: 2.7, height: 0.08, roomId: 'checkpoint-chamber' },
  { id: 'transfer-notice', type: 'task', label: 'Transfer Notice', x: 31, y: 7, radius: 2.5, height: 0.04, roomId: 'wrong-department' },
  {
    id: 'final-access-door',
    type: 'finalExit',
    label: 'Final Access Door',
    x: 41,
    y: 27,
    height: -0.04,
    roomId: 'final-route',
    requiresState: 'finalRouteUnlocked',
    lockTriggerId: 'fake-exit-pressure'
  }
];

const hazards = [
  {
    id: 'fake-exit-pressure',
    type: 'fakeExitTrigger',
    x: 36,
    y: 15,
    radius: 2.7,
    height: -0.08,
    requiresCheckpointInactive: true,
    routeId: 'records-hall'
  },
  {
    id: 'records-hall-crusher',
    type: 'crusher',
    triggerId: 'fake-exit-pressure',
    start: { x: 37, y: 15 },
    end: { x: 25, y: 15 },
    delay: 3.2,
    speed: 2.1,
    killRadius: 0.72,
    laneCoverage: 0.58,
    telegraphWidth: 0.42
  }
];

const storyBeats = [
  { id: 'first-task', roomId: 'employee-intake', tone: 'ordinary', text: 'Assigned work begins with a form on the intake desk.' },
  { id: 'wrong-department-reveal', roomId: 'wrong-department', tone: 'incorrect', text: 'Department signage stops matching the floor plan.' },
  { id: 'fake-exit', roomId: 'fake-exit', tone: 'false-hope', text: 'The public exit appears before the department accepts the employee.' },
  { id: 'afterimage', roomId: 'final-route', tone: 'impossible', text: 'The office repeats itself as an afterimage.' }
];

const manipulationNodes = [
  { id: 'records-hall-lock', type: 'routeLock', routeId: 'records-hall', x: 25, y: 15 },
  { id: 'fake-exit-signage', type: 'signage', channelId: 'department-labels', x: 38.5, y: 13 },
  { id: 'afterimage-light', type: 'lighting', channelId: 'ai-cyan', x: 40, y: 24 }
];

const lightingZones = [
  { id: 'normal-office', channelId: 'normal-office', rooms: ['front-reception', 'employee-intake', 'main-workstation-hall'], mood: 'sterile' },
  { id: 'review-cyan', channelId: 'ai-cyan', rooms: ['checkpoint-chamber', 'final-route'], mood: 'observed' },
  { id: 'records-warning', channelId: 'emergency', rooms: ['crusher-corridor'], mood: 'danger' },
  { id: 'wrong-department-muted', channelId: 'wrongness', rooms: ['wrong-department', 'archive'], mood: 'incorrect' },
  { id: 'staff-muted', channelId: 'staff-muted', rooms: ['utility-break'], mood: 'stale' },
  { id: 'false-exit-clean', channelId: 'false-exit', rooms: ['fake-exit'], mood: 'too clean' }
];

const collisionVolumes = [
  { id: 'front-reception-desk', x: 4.2, y: 21.05, width: 2.25, depth: 0.5 },
  { id: 'employee-intake-desk', x: 5.35, y: 16.25, width: 3.15, depth: 0.78 },
  { id: 'archive-racks-north', x: 7.0, y: 24.0, width: 4.8, depth: 0.5 },
  { id: 'archive-racks-south', x: 7.0, y: 27.0, width: 4.8, depth: 0.5 },
  { id: 'review-table', x: 21, y: 16.2, width: 2.3, depth: 1.0 },
  { id: 'utility-copier', x: 20, y: 25, width: 0.9, depth: 0.62 },
  { id: 'wrong-department-monolith', x: 31, y: 7.9, width: 0.44, depth: 0.2 }
];

function createGrid() {
  return OfficeMazeGenerator.buildCollisionGrid({
    width: W,
    height: H,
    spaces: rooms,
    connectors,
    objectives,
    hazards
  });
}

const collisionGrid = createGrid();

function getRoom(id) {
  const room = rooms.find(candidate => candidate.id === id);
  if (!room) {
    throw new Error(`Unknown room lighting target: ${id}`);
  }
  return room;
}

function getRoomCenter(roomOrId) {
  const room = typeof roomOrId === 'string' ? getRoom(roomOrId) : roomOrId;
  return {
    x: (room.x1 + room.x2) / 2,
    y: (room.y1 + room.y2) / 2
  };
}

function distributePositions(min, max, count, inset = 1) {
  if (count <= 1) return [(min + max) / 2];
  const start = min + inset;
  const end = max - inset;
  return Array.from({ length: count }, (_, index) => start + ((end - start) * index) / (count - 1));
}

function valueFor(value, context) {
  return typeof value === 'function' ? value(context) : value;
}

function ceilingLightGrid(roomId, options) {
  const room = getRoom(roomId);
  const xs = options.xs ?? distributePositions(room.x1, room.x2, options.columns ?? 1, options.insetX ?? 1.1);
  const ys = options.ys ?? distributePositions(room.y1, room.y2, options.rows ?? 1, options.insetY ?? 1.1);
  const lights = [];

  ys.forEach((y, row) => {
    xs.forEach((x, column) => {
      const index = lights.length;
      const context = { x, y, row, column, index };
      lights.push({
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2)),
        width: valueFor(options.width ?? 0.9, context),
        depth: valueFor(options.depth ?? 0.1, context),
        color: valueFor(options.color ?? 0xcfe9e8, context),
        fixtureColor: valueFor(options.fixtureColor ?? 0x8f9b98, context),
        frameColor: valueFor(options.frameColor ?? 0x8d989a, context),
        emissiveIntensity: valueFor(options.emissiveIntensity ?? 0.09, context),
        intensity: valueFor(options.intensity ?? 0.16, context),
        distance: valueFor(options.distance ?? 9.5, context),
        flicker: valueFor(options.flicker ?? false, context)
      });
    });
  });

  return lights;
}

function softFillLights(roomId, fills) {
  const center = getRoomCenter(roomId);
  return fills.map(fill => ({
    x: fill.x ?? Number((center.x + (fill.dx ?? 0)).toFixed(2)),
    y: fill.y ?? Number((center.y + (fill.dy ?? 0)).toFixed(2)),
    color: fill.color,
    intensity: fill.intensity,
    distance: fill.distance,
    height: fill.height
  }));
}

function buildRoomLighting() {
  const ceilingLights = [];
  const areaLights = [];

  const addCeiling = lights => ceilingLights.push(...lights);
  const addFill = lights => areaLights.push(...lights);

  addCeiling(ceilingLightGrid('front-reception', {
    xs: [4.2, 7.5, 10.8],
    ys: [19.15, 21.05],
    color: ({ row }) => (row === 0 ? 0xe1ecea : 0xd6e3e1),
    fixtureColor: 0xb6c0be,
    frameColor: 0x9aa4a6,
    width: 0.78,
    emissiveIntensity: 0.135,
    intensity: ({ column }) => (column === 1 ? 0.42 : 0.34),
    distance: 12.5
  }));
  addFill(softFillLights('front-reception', [
    { x: 7.4, y: 20.05, color: 0xdfeae8, intensity: 0.72, distance: 16, height: 2.25 },
    { x: 4.15, y: 20.9, color: 0xc9d4d3, intensity: 0.28, distance: 11.5, height: 1.45 },
    { x: 10.95, y: 19.4, color: 0xc6d1d0, intensity: 0.24, distance: 10.5, height: 1.5 },
    { x: 8.9, y: 21.15, color: 0xbec9ca, intensity: 0.22, distance: 10.5, height: 1.55 }
  ]));

  addCeiling(ceilingLightGrid('employee-intake', {
    xs: [4.35, 7.0, 9.85],
    ys: [15.1, 16.65],
    color: 0xdce9e7,
    fixtureColor: 0xb2bebb,
    frameColor: 0x97a2a4,
    width: 0.72,
    emissiveIntensity: 0.13,
    intensity: ({ column }) => (column === 1 ? 0.38 : 0.32),
    distance: 11.5
  }));
  addFill(softFillLights('employee-intake', [
    { x: 5.45, y: 16.25, color: 0xe0ecea, intensity: 0.68, distance: 13.5, height: 2.2 },
    { x: 5.6, y: 16.55, color: 0x8ccbd2, intensity: 0.2, distance: 5.5, height: 1.2 },
    { x: 9.65, y: 16.25, color: 0xc7d3d1, intensity: 0.26, distance: 10.5, height: 1.5 }
  ]));

  addCeiling(ceilingLightGrid('main-workstation-hall', {
    xs: [4.0, 7.6, 11.2, 14.8, 18.0],
    ys: [5.2, 7.6, 10.0, 12.2],
    color: ({ row }) => (row >= 2 ? 0xd6e8e7 : 0xcbdfe1),
    fixtureColor: ({ row }) => (row >= 2 ? 0xa7b4b3 : 0x9ca9aa),
    frameColor: 0x879395,
    width: ({ column }) => (column === 4 ? 0.82 : 0.88),
    emissiveIntensity: ({ row }) => (row >= 2 ? 0.115 : 0.1),
    intensity: ({ row, column }) => {
      if (row >= 2 && column >= 1 && column <= 3) return 0.34;
      if (column === 1 || column === 2 || column === 3) return 0.3;
      return 0.24;
    },
    distance: ({ row }) => (row >= 2 ? 13 : 12),
    flicker: ({ row, column }) => row === 1 && column === 3
  }));
  addFill(softFillLights('main-workstation-hall', [
    { x: 8.2, y: 11.5, color: 0xd7e8e6, intensity: 0.48, distance: 15, height: 2.35 },
    { x: 12.6, y: 9.1, color: 0xc9dde0, intensity: 0.38, distance: 14, height: 2.25 },
    { x: 7.7, y: 7.0, color: 0xbacccd, intensity: 0.3, distance: 12.5, height: 1.45 },
    { x: 14.7, y: 6.9, color: 0xbacccd, intensity: 0.28, distance: 12.5, height: 1.45 },
    { x: 3.1, y: 10.4, color: 0xb6c5c7, intensity: 0.2, distance: 12, height: 1.6 },
    { x: 18.2, y: 10.1, color: 0xb6c5c7, intensity: 0.2, distance: 12.5, height: 1.65 },
    { x: 3.2, y: 5.5, color: 0xaec0c3, intensity: 0.18, distance: 11, height: 1.55 },
    { x: 18.1, y: 6.0, color: 0xaec0c3, intensity: 0.18, distance: 11, height: 1.55 }
  ]));

  addCeiling(ceilingLightGrid('archive', {
    xs: [5.0, 9.0, 13.0],
    ys: [24.0, 26.7],
    color: 0xb9c9df,
    fixtureColor: 0x8895a0,
    frameColor: 0x77838b,
    width: 0.92,
    emissiveIntensity: 0.09,
    intensity: ({ row }) => (row === 0 ? 0.24 : 0.2),
    distance: 10.5
  }));
  addFill(softFillLights('archive', [
    { x: 7, y: 25, color: 0xa8bbd8, intensity: 0.34, distance: 11.5, height: 1.9 },
    { x: 12.2, y: 26.5, color: 0x8fa2b8, intensity: 0.18, distance: 9, height: 1.45 }
  ]));

  addCeiling(ceilingLightGrid('checkpoint-chamber', {
    xs: [19.2, 22.4],
    ys: [13.0, 16.6],
    color: 0xc0eef2,
    fixtureColor: 0x8fb0b4,
    frameColor: 0x789297,
    width: 1.0,
    emissiveIntensity: 0.13,
    intensity: ({ column }) => (column === 1 ? 0.38 : 0.32),
    distance: 11.5
  }));
  addFill(softFillLights('checkpoint-chamber', [
    { x: 21, y: 15, color: 0xbff1f5, intensity: 0.56, distance: 13.5, height: 2.65 },
    { x: 21, y: 16.4, color: 0x8fcfd8, intensity: 0.22, distance: 8, height: 1.25 }
  ]));

  addCeiling(ceilingLightGrid('wrong-department', {
    xs: [27.0, 31.0, 34.0],
    ys: [6.0, 8.6],
    color: 0xd9dccd,
    fixtureColor: 0xb0b0a3,
    frameColor: 0x96988f,
    width: 0.9,
    emissiveIntensity: 0.105,
    intensity: 0.3,
    distance: 11.5
  }));
  addFill(softFillLights('wrong-department', [
    { x: 31, y: 7, color: 0xdadcc9, intensity: 0.34, distance: 12, height: 2.55 },
    { x: 26.2, y: 8.8, color: 0xc4c8ba, intensity: 0.18, distance: 9.5, height: 1.5 }
  ]));

  addCeiling(ceilingLightGrid('utility-break', {
    xs: [20.5, 23.0, 25.5],
    ys: [25.4],
    color: 0xcbd5c4,
    fixtureColor: 0x929b8c,
    frameColor: 0x7f897f,
    width: 0.82,
    emissiveIntensity: 0.08,
    intensity: 0.22,
    distance: 9.8
  }));
  addFill(softFillLights('utility-break', [
    { x: 20, y: 25, color: 0xbec9b8, intensity: 0.22, distance: 9.5, height: 1.65 },
    { x: 25.8, y: 26.2, color: 0xaebaa9, intensity: 0.16, distance: 8.5, height: 1.45 }
  ]));

  addCeiling(ceilingLightGrid('crusher-corridor', {
    xs: [27.2, 31.0, 34.8],
    ys: [15.0],
    color: 0xd45c48,
    fixtureColor: 0x8a655d,
    frameColor: 0x735a55,
    width: 0.95,
    emissiveIntensity: 0.135,
    intensity: ({ column }) => (column === 1 ? 0.46 : 0.36),
    distance: 12.5
  }));
  addFill(softFillLights('crusher-corridor', [
    { x: 31, y: 15, color: 0xd45c48, intensity: 0.62, distance: 15, height: 2.2 },
    { x: 25.8, y: 15, color: 0xc97868, intensity: 0.24, distance: 9.5, height: 1.35 },
    { x: 36.2, y: 15, color: 0xc97868, intensity: 0.24, distance: 9.5, height: 1.35 },
    { x: 31, y: 15.75, color: 0xcab5af, intensity: 0.16, distance: 11, height: 1.7 }
  ]));

  addCeiling(ceilingLightGrid('fake-exit', {
    xs: [38.6, 40.8],
    ys: [13.9, 16.4],
    color: 0xe5f2ec,
    fixtureColor: 0xb8c7bf,
    frameColor: 0x95a39d,
    width: 0.82,
    emissiveIntensity: 0.13,
    intensity: 0.4,
    distance: 11.5
  }));
  addFill(softFillLights('fake-exit', [
    { x: 40, y: 15, color: 0xe4f2ec, intensity: 0.5, distance: 12.5, height: 2.25 },
    { x: 38.5, y: 13.3, color: 0xa8d9bd, intensity: 0.18, distance: 8.5, height: 1.5 }
  ]));

  addCeiling(ceilingLightGrid('final-route', {
    xs: [37.0, 40.5],
    ys: [23.0, 26.3],
    color: ({ row }) => (row === 0 ? 0xc4edf0 : 0xe4f2f0),
    fixtureColor: 0x9fb8ba,
    frameColor: 0x819b9f,
    width: 0.95,
    emissiveIntensity: 0.13,
    intensity: ({ row }) => (row === 0 ? 0.34 : 0.38),
    distance: 11.5
  }));
  addFill(softFillLights('final-route', [
    { x: 40, y: 24, color: 0xa6dde5, intensity: 0.46, distance: 12.5, height: 2.4 },
    { x: 41, y: 27, color: 0xe2f1ef, intensity: 0.28, distance: 9, height: 1.8 }
  ]));

  return { ceilingLights, areaLights };
}

const roomLighting = buildRoomLighting();

export const level1 = {
  schemaVersion: 1,
  id: 'department-incorrect',
  title: 'Department Incorrect',
  estimatedMinutes: 20,
  spaces: rooms,
  connectors,
  objectives,
  hazards,
  storyBeats,
  manipulationNodes,
  lightingZones,
  collisionVolumes,
  collisionGrid,
  grid: collisionGrid,
  rooms,
  playerStart: { x: 8.2, y: 20.65, yaw: 0.03, pitch: -0.045 },
  goals: objectives.filter(objective => objective.type === 'finalExit').map(objective => ({
    id: objective.id,
    x: objective.x,
    y: objective.y,
    height: objective.height,
    requiresAllCheckpoints: true,
    lockTriggerId: objective.lockTriggerId
  })),
  checkpoints: objectives.filter(objective => objective.type === 'task'),
  triggers: hazards.filter(hazard => hazard.type === 'fakeExitTrigger'),
  crushers: hazards.filter(hazard => hazard.type === 'crusher'),
  sentientObjects: [],
  floorZones: [
    { id: 'front-reception', x1: 2, y1: 18, x2: 12, y2: 21, color: 0xb8bbb6, emissive: 0x151a19, emissiveIntensity: 0.045, roughness: 0.66, metalness: 0.05, height: 0, floorLineColor: 0x8f9896, floorLineOpacity: 0.24 },
    { id: 'employee-intake', x1: 2, y1: 14, x2: 12, y2: 17, color: 0xb0bab7, emissive: 0x141b1a, emissiveIntensity: 0.045, roughness: 0.7, metalness: 0.04, height: 0, floorLineColor: 0x879290, floorLineOpacity: 0.22 },
    { id: 'main-workstation-hall', x1: 2, y1: 4, x2: 19, y2: 12, color: 0x8f9c9e, emissive: 0x0f1618, emissiveIntensity: 0.04, roughness: 0.84, height: 0, floorLineColor: 0x748185, floorLineOpacity: 0.2, floorLineStep: 2 },
    { id: 'archive', x1: 3, y1: 23, x2: 15, y2: 28, color: 0x5f6d75, emissive: 0x0b1016, emissiveIntensity: 0.055, roughness: 0.86, height: -0.03, floorLineColor: 0x4f5b62, floorLineOpacity: 0.16, floorLineStep: 2 },
    { id: 'checkpoint-chamber', x1: 18, y1: 12, x2: 24, y2: 18, color: 0x809aa0, emissive: 0x0c1b1f, emissiveIntensity: 0.07, roughness: 0.78, height: 0.08, floorLineColor: 0x6f858a, floorLineOpacity: 0.18 },
    { id: 'wrong-department', x1: 25, y1: 4, x2: 35, y2: 10, color: 0xa6aba2, emissive: 0x12140f, emissiveIntensity: 0.04, roughness: 0.78, height: 0.04, floorLineColor: 0x858b82, floorLineOpacity: 0.18, floorLineStep: 2 },
    { id: 'utility-break', x1: 18, y1: 23, x2: 28, y2: 28, color: 0x7f897d, emissive: 0x10140e, emissiveIntensity: 0.035, roughness: 0.86, height: 0, floorLineColor: 0x6e796e, floorLineOpacity: 0.14, floorLineStep: 2 },
    { id: 'crusher-corridor', x1: 25, y1: 14, x2: 37, y2: 16, color: 0x72564f, emissive: 0x210805, emissiveIntensity: 0.09, roughness: 0.78, height: -0.08, floorLineColor: 0x8b6a60, floorLineOpacity: 0.16 },
    { id: 'fake-exit', x1: 38, y1: 12, x2: 42, y2: 18, color: 0xb8c7bf, emissive: 0x101a15, emissiveIntensity: 0.055, roughness: 0.68, height: -0.04, floorLineColor: 0x94a59d, floorLineOpacity: 0.2 },
    { id: 'final-route', x1: 36, y1: 22, x2: 42, y2: 28, color: 0x9fbfc3, emissive: 0x0b1d20, emissiveIntensity: 0.08, roughness: 0.68, height: -0.04, floorLineColor: 0x80a3a8, floorLineOpacity: 0.16, floorLineStep: 2 }
  ],
  wallDetailZones: [
    { id: 'reception-intake-trim', x1: 2, y1: 14, x2: 12, y2: 21 },
    { id: 'workstation-entry-trim', x1: 2, y1: 4, x2: 20, y2: 14 },
    { id: 'archive-service-trim', x1: 3, y1: 17, x2: 15, y2: 28 },
    { id: 'review-office-trim', x1: 17, y1: 10, x2: 25, y2: 19 },
    { id: 'department-wing-trim', x1: 24, y1: 4, x2: 35, y2: 13 },
    { id: 'staff-transfer-trim', x1: 18, y1: 18, x2: 28, y2: 28 },
    { id: 'exit-service-trim', x1: 25, y1: 12, x2: 42, y2: 28 }
  ],
  ceilingDetailZones: [
    { id: 'reception-intake-ceiling', x1: 2, y1: 14, x2: 12, y2: 21, step: 1 },
    { id: 'workstation-entry-ceiling', x1: 2, y1: 4, x2: 19, y2: 12, step: 2 },
    { id: 'archive-ceiling', x1: 3, y1: 23, x2: 15, y2: 28, step: 2 },
    { id: 'review-ceiling', x1: 18, y1: 12, x2: 24, y2: 18, step: 1.5 },
    { id: 'records-office-ceiling', x1: 25, y1: 4, x2: 35, y2: 10, step: 2 },
    { id: 'staff-ceiling', x1: 18, y1: 23, x2: 28, y2: 28, step: 2 },
    { id: 'exit-transfer-ceiling', x1: 25, y1: 12, x2: 42, y2: 28, step: 2 }
  ],
  guideStrips: [],
  navigationNodes: [],
  areaLights: roomLighting.areaLights,
  ceilingLights: roomLighting.ceilingLights,
  routes: [
    {
      id: 'critical-path',
      label: 'Critical Route',
      color: 0x86f7b2,
      points: [
        { x: 8.2, y: 20.65 },
        { x: 5.35, y: 16.16 },
        { x: 8, y: 7 },
        { x: 7, y: 25 },
        { x: 21, y: 15 },
        { x: 31, y: 7 },
        { x: 36, y: 15 },
        { x: 40, y: 24 },
        { x: 41, y: 27 }
      ]
    },
    {
      id: 'crusher-path',
      label: 'Crusher Travel',
      color: 0xc43c24,
      points: [
        { x: 37, y: 15 },
        { x: 25, y: 15 }
      ]
    }
  ],
  aiManipulation: {
    controllerId: 'department-intelligence',
    lockableRoutes: [
      { id: 'entry-loop', from: 'front-reception', to: 'employee-intake', anchor: { x: 8, y: 17 } },
      { id: 'records-hall', from: 'checkpoint-chamber', to: 'fake-exit', anchor: { x: 25, y: 15 } },
      { id: 'final-afterimage', from: 'fake-exit', to: 'final-route', anchor: { x: 40, y: 19 } }
    ],
    lightChannels: [
      { id: 'normal-office', rooms: ['front-reception', 'employee-intake', 'main-workstation-hall'] },
      { id: 'ai-cyan', rooms: ['checkpoint-chamber', 'final-route'] },
      { id: 'emergency', rooms: ['crusher-corridor'] },
      { id: 'wrongness', rooms: ['wrong-department', 'archive'] },
      { id: 'staff-muted', rooms: ['utility-break'] },
      { id: 'false-exit', rooms: ['fake-exit'] }
    ],
    signageChannels: [
      { id: 'department-labels', rooms: ['front-reception', 'employee-intake', 'main-workstation-hall', 'wrong-department', 'fake-exit'] }
    ],
    fakeExits: [
      { id: 'public-exit', room: 'fake-exit', triggerId: 'fake-exit-pressure' }
    ],
    loopCandidates: [
      { id: 'archive-return-loop', rooms: ['archive', 'employee-intake'] }
    ]
  },
  architecture: [
    { type: 'receptionDesk', x: 4.2, y: 21.05, width: 2.25, depth: 0.5, color: 0xb7bbb7, panelColor: 0xacb2af, topColor: 0xd1d3cd, trimColor: 0x8b9698, roughness: 0.72, metalness: 0.04 },
    { type: 'receptionDesk', x: 5.35, y: 16.25, width: 3.15, depth: 0.78, color: 0xb9bdb9, panelColor: 0xaeb5b2, topColor: 0xd5d7d0, trimColor: 0x879496, roughness: 0.72, metalness: 0.04 },
    { type: 'sofa', x: 3.8, y: 19.18, width: 2.1, color: 0x6f7d82 },
    { type: 'waitingChairs', x: 11.05, y: 19.05, count: 2, axis: 'z', spacing: 0.7, rotation: -Math.PI / 2, color: 0x394147 },
    { type: 'coffeeTable', x: 5.15, y: 19.32, color: 0xb8b8b0 },
    { type: 'plant', x: 2.7, y: 18.35, color: 0x4f765f, potColor: 0x8c8980 },
    { type: 'plant', x: 11.55, y: 21.55, color: 0x4b6f5a, potColor: 0x8a877f },
    { type: 'sign', id: 'records-sign', channelId: 'department-labels', x: 6.2, y: 14.05, text: 'RECORDS\nDEPARTMENT', color: 0xd8ebe7, width: 1.45, height: 2.14 },
    { type: 'sign', id: 'night-entry-sign', channelId: 'department-labels', x: 4.2, y: 22.05, text: 'NIGHT SHIFT\nENTRY', color: 0xcfe9e8, width: 1.3, height: 2.06, rotation: Math.PI },
    { type: 'sign', id: 'intake-sign', channelId: 'department-labels', x: 5.35, y: 17.05, text: 'EMPLOYEE\nINTAKE', color: 0xd8ebe7, width: 1.25, height: 1.94, rotation: Math.PI },
    { type: 'sign', id: 'main-hall-sign', channelId: 'department-labels', x: 8.2, y: 13.05, text: 'MAIN WORKSTATION\nHALL', color: 0xcfe9e8, width: 1.7, height: 2.14 },
    {
      type: 'taskTerminal',
      x: 5.85,
      y: 16.35,
      color: 0xa6dce4,
      desktop: true,
      surfaceHeight: 0.92,
      text: 'Welcome to Records Department.\nRetrieve your Shift Assignment Form.'
    },
    { type: 'sign', id: 'wrong-dept-sign', channelId: 'department-labels', x: 31, y: 10.05, text: 'ACCOUNTS /\nRECORDS OFFICE', color: 0xd0d1bd, width: 1.65, height: 2.12 },
    { type: 'sign', id: 'fake-exit-sign', channelId: 'department-labels', x: 37.08, y: 15, text: 'PUBLIC\nEXIT', color: 0x86f7b2, width: 1.15, height: 2.18, rotation: Math.PI / 2 },
    { type: 'sign', id: 'archive-sign', channelId: 'department-labels', x: 7, y: 22.05, text: 'RECORDS\nARCHIVE', color: 0xaebcff, width: 1.35, height: 2.1, rotation: Math.PI },
    { type: 'sign', id: 'review-sign', channelId: 'department-labels', x: 21, y: 11.05, text: 'COUNSELLOR /\nREVIEW', color: 0xb7f7ff, width: 1.45, height: 2.12 },
    { type: 'sign', id: 'staff-sign', channelId: 'department-labels', x: 22.5, y: 22.05, text: 'STAFF\nROOM', color: 0xc5d0b6, width: 1.15, height: 2.1, rotation: Math.PI },
    { type: 'taskTerminal', x: 8, y: 7, color: 0xbde1e0 },
    { type: 'taskTerminal', x: 7, y: 25, color: 0xa8bbd8 },
    { type: 'taskTerminal', x: 21, y: 15, color: 0xb7eef4 },
    { type: 'taskTerminal', x: 31, y: 7, color: 0xdadcc9 },
    {
      type: 'cubicleCluster',
      x: 3.7,
      y: 5.25,
      columns: 3,
      rows: 4,
      spacingX: 1.45,
      spacingY: 1.46,
      rotation: Math.PI / 2,
      deskWidth: 3.32,
      deskDepth: 1.64,
      partitionHeight: 0.56,
      frostedOpacity: 0.28,
      color: 0xd8dedf,
      partitionColor: 0xdde3e3,
      frostedColor: 0xe2f2f1,
      deskColor: 0xe2d8c5,
      deskBodyColor: 0xd4dbda,
      trimColor: 0x6d777b,
      monitorColor: 0x6fa8ad,
      monitorIntensity: 0.058,
      chairColor: 0x252d33,
      chairAccentColor: 0x37535c
    },
    {
      type: 'cubicleCluster',
      x: 12.5,
      y: 5.25,
      columns: 3,
      rows: 4,
      spacingX: 1.45,
      spacingY: 1.46,
      rotation: -Math.PI / 2,
      deskWidth: 3.32,
      deskDepth: 1.64,
      partitionHeight: 0.56,
      frostedOpacity: 0.26,
      color: 0xd3dadc,
      partitionColor: 0xd8dfe0,
      frostedColor: 0xdceeee,
      deskColor: 0xdedfd8,
      deskBodyColor: 0xcbd3d2,
      trimColor: 0x667176,
      monitorColor: 0x659da4,
      monitorIntensity: 0.052,
      chairColor: 0x232b31,
      chairAccentColor: 0x344e57
    },
    { type: 'copyMachine', x: 18.8, y: 5.25, color: 0xc9cfcb },
    { type: 'serverRackRow', x: 5, y: 24, count: 4, axis: 'x', color: 0x3b4650, emissive: 0x20395f, emissiveIntensity: 0.12 },
    { type: 'serverRackRow', x: 5, y: 27, count: 4, axis: 'x', color: 0x37414a, emissive: 0x20395f, emissiveIntensity: 0.12 },
    { type: 'meetingTable', x: 21, y: 16.2, width: 2.3, depth: 1.0, color: 0xa7afb1 },
    { type: 'glassWall', x: 18.05, y: 16.4, axis: 'z', length: 2.8, color: 0xb7d4dc, opacity: 0.15, frameColor: 0x6f858a, frostedOpacity: 0.26 },
    { type: 'glassWall', x: 31, y: 10.65, axis: 'x', length: 4.8, color: 0xd0d6c8, opacity: 0.16, frameColor: 0x747d7a, frostedOpacity: 0.22, postSpacing: 1.25 },
    { type: 'copyMachine', x: 20, y: 25, color: 0xb1b8b4 },
    { type: 'monolith', x: 31, y: 7.9, width: 0.44, depth: 0.2, height: 1.25, color: 0x625b70, emissive: 0x967fb0, emissiveIntensity: 0.16 },
    { type: 'frame', x: 8, y: 13, axis: 'z', width: 4.2, color: 0x8b9698 },
    { type: 'frame', x: 17.55, y: 13.2, axis: 'x', width: 3.0, color: 0x789297, emissive: 0x061b20, emissiveIntensity: 0.04 },
    { type: 'frame', x: 25, y: 15, axis: 'x', width: 2.45, color: 0x7a615a, emissive: 0x1b0603, emissiveIntensity: 0.12 },
    { type: 'frame', x: 37, y: 15, axis: 'x', width: 2.45, color: 0x90a79a, emissive: 0x07150d, emissiveIntensity: 0.08 },
    { type: 'beam', x: 31, y: 14.05, axis: 'x', length: 11.4, color: 0x72564f, emissive: 0x150302, emissiveIntensity: 0.1 },
    { type: 'beam', x: 31, y: 15.95, axis: 'x', length: 11.4, color: 0x72564f, emissive: 0x150302, emissiveIntensity: 0.1 },
    { type: 'windowBand', x: 40, y: 24, axis: 'z', length: 5, color: 0xa6dce4, emissiveIntensity: 0.08 },
    { type: 'doorSlab', x: 41, y: 27.8, width: 1.6, color: 0xaebdb8, emissive: 0x0a2013, emissiveIntensity: 0.08 }
  ]
};
