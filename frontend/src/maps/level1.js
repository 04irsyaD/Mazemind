import { CONSTANTS } from '../core/Constants.js';
import { OfficeMazeGenerator } from './OfficeMazeGenerator.js';

const W = 45;
const H = 31;

const rooms = [
  {
    id: 'entry',
    label: 'Office Entry',
    x1: 2,
    y1: 14,
    x2: 8,
    y2: 18,
    color: 0x637079,
    purpose: 'spawn',
    mood: 'calm'
  },
  {
    id: 'orientation-hub',
    label: 'Orientation Hub',
    x1: 8,
    y1: 11,
    x2: 16,
    y2: 20,
    color: 0x6bc7dc,
    purpose: 'route reading',
    mood: 'clinical'
  },
  {
    id: 'cubicle-sector',
    label: 'Assigned Desks',
    x1: 3,
    y1: 4,
    x2: 15,
    y2: 10,
    color: 0x93a4a7,
    purpose: 'exploration',
    mood: 'ordinary'
  },
  {
    id: 'archive',
    label: 'Server Archive',
    x1: 3,
    y1: 22,
    x2: 15,
    y2: 28,
    color: 0x7f89b8,
    purpose: 'exploration',
    mood: 'cold storage'
  },
  {
    id: 'checkpoint-chamber',
    label: 'Task Review Chamber',
    x1: 17,
    y1: 11,
    x2: 24,
    y2: 19,
    color: 0xb7f7ff,
    purpose: 'checkpoint chamber',
    mood: 'judged'
  },
  {
    id: 'wrong-department',
    label: 'Wrong Department',
    x1: 24,
    y1: 4,
    x2: 35,
    y2: 10,
    color: 0xa88dc4,
    purpose: 'impossible transition',
    mood: 'incorrect'
  },
  {
    id: 'utility-break',
    label: 'Utility Break Area',
    x1: 18,
    y1: 22,
    x2: 28,
    y2: 28,
    color: 0x89a07b,
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
    color: 0xc43c24,
    purpose: 'fair threat corridor',
    mood: 'warning'
  },
  {
    id: 'fake-exit',
    label: 'Public Exit',
    x1: 37,
    y1: 12,
    x2: 42,
    y2: 18,
    color: 0x86f7b2,
    purpose: 'false hope',
    mood: 'too clean'
  },
  {
    id: 'final-route',
    label: 'Department Afterimage',
    x1: 34,
    y1: 21,
    x2: 42,
    y2: 28,
    color: 0x6bc7dc,
    purpose: 'final route',
    mood: 'psychologically wrong'
  }
];

const connectors = [
  { id: 'entry-to-hub', label: 'Employee Intake Hall', x1: 6, y1: 15, x2: 10, y2: 17, from: 'entry', to: 'orientation-hub' },
  { id: 'hub-to-cubicles', label: 'North Admin Connector', x1: 10, y1: 9, x2: 12, y2: 12, from: 'orientation-hub', to: 'cubicle-sector' },
  { id: 'hub-to-archive', label: 'Archive Connector', x1: 10, y1: 20, x2: 12, y2: 23, from: 'orientation-hub', to: 'archive' },
  { id: 'hub-to-review', label: 'Review Intake', x1: 15, y1: 14, x2: 18, y2: 17, from: 'orientation-hub', to: 'checkpoint-chamber' },
  { id: 'review-to-wrong-dept', label: 'Department Transfer', x1: 21, y1: 9, x2: 25, y2: 13, from: 'checkpoint-chamber', to: 'wrong-department' },
  { id: 'review-to-break', label: 'Utility Bend', x1: 21, y1: 19, x2: 23, y2: 23, from: 'checkpoint-chamber', to: 'utility-break' },
  { id: 'review-to-records', label: 'Emergency Records Intake', x1: 24, y1: 14, x2: 26, y2: 16, from: 'checkpoint-chamber', to: 'crusher-corridor' },
  { id: 'fake-exit-afterimage', label: 'Exit Afterimage', x1: 39, y1: 18, x2: 41, y2: 24, from: 'fake-exit', to: 'final-route' },
  { id: 'final-bend', label: 'Department Afterimage Bend', x1: 36, y1: 24, x2: 42, y2: 28, from: 'final-route', to: 'final-route' }
];

const objectives = [
  { id: 'orientation', type: 'task', label: 'Orientation Task', x: 12, y: 15, radius: 2.5, roomId: 'orientation-hub' },
  { id: 'assigned-desks', type: 'task', label: 'Assigned Desk Task', x: 7, y: 7, radius: 2.45, roomId: 'cubicle-sector' },
  { id: 'server-archive', type: 'task', label: 'Archive Task', x: 7, y: 25, radius: 2.45, height: -0.03, roomId: 'archive' },
  { id: 'review-chamber', type: 'task', label: 'Review Chamber Task', x: 21, y: 15, radius: 2.7, height: 0.08, roomId: 'checkpoint-chamber' },
  { id: 'wrong-dept', type: 'task', label: 'Wrong Department Task', x: 31, y: 7, radius: 2.5, height: 0.04, roomId: 'wrong-department' },
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
  { id: 'first-task', roomId: 'orientation-hub', tone: 'ordinary', text: 'Assigned work begins as routine verification.' },
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
  { id: 'normal-office', channelId: 'normal-office', rooms: ['entry', 'orientation-hub', 'cubicle-sector'], mood: 'sterile' },
  { id: 'review-cyan', channelId: 'ai-cyan', rooms: ['checkpoint-chamber', 'final-route'], mood: 'observed' },
  { id: 'records-warning', channelId: 'emergency', rooms: ['crusher-corridor'], mood: 'danger' },
  { id: 'wrong-department-muted', channelId: 'wrongness', rooms: ['wrong-department', 'archive'], mood: 'incorrect' }
];

const collisionVolumes = [
  { id: 'reception-desk', x: 5.5, y: 15.1, width: 2.4, depth: 0.45 },
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
  playerStart: { x: 4, y: 16, yaw: -Math.PI / 2, pitch: 0 },
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
  sentientObjects: [
    { id: 'entry-chair', kind: 'chair', x: 6, y: 17, rotation: 0.35, triggerRadius: 4.2, attackRadius: 0 },
    { id: 'cubicle-chair-a', kind: 'chair', x: 6, y: 6, rotation: Math.PI, triggerRadius: 4.8, attackRadius: 0 },
    { id: 'cubicle-chair-b', kind: 'chair', x: 12, y: 8, rotation: -0.2, triggerRadius: 4.8, attackRadius: 0 },
    { id: 'archive-cart', kind: 'table', x: 12, y: 26, height: -0.03, rotation: Math.PI / 2, triggerRadius: 5.2, attackRadius: 0 },
    { id: 'review-table', kind: 'table', x: 21, y: 16, height: 0.08, triggerRadius: 5.0, attackRadius: 0 },
    { id: 'wrong-chair', kind: 'chair', x: 33, y: 8, height: 0.04, rotation: -Math.PI / 2, triggerRadius: 5.0, attackRadius: 0 },
    { id: 'break-dispenser', kind: 'dispenser', x: 20, y: 25, triggerRadius: 4.2, attackRadius: 0 }
  ],
  floorZones: [
    { id: 'entry', x1: 2, y1: 14, x2: 8, y2: 18, color: 0x2a3035, emissive: 0x010203, height: 0 },
    { id: 'orientation-hub', x1: 8, y1: 11, x2: 16, y2: 20, color: 0x29323a, emissive: 0x061014, emissiveIntensity: 0.06, height: 0 },
    { id: 'cubicle-sector', x1: 3, y1: 4, x2: 15, y2: 10, color: 0x343631, emissive: 0x020302, height: 0 },
    { id: 'archive', x1: 3, y1: 22, x2: 15, y2: 28, color: 0x252934, emissive: 0x050714, emissiveIntensity: 0.09, height: -0.03 },
    { id: 'checkpoint-chamber', x1: 17, y1: 11, x2: 24, y2: 19, color: 0x253840, emissive: 0x061b20, emissiveIntensity: 0.14, height: 0.08 },
    { id: 'wrong-department', x1: 24, y1: 4, x2: 35, y2: 10, color: 0x302b3a, emissive: 0x0b0615, emissiveIntensity: 0.08, height: 0.04 },
    { id: 'utility-break', x1: 18, y1: 22, x2: 28, y2: 28, color: 0x30342a, emissive: 0x050702, height: 0 },
    { id: 'crusher-corridor', x1: 25, y1: 14, x2: 37, y2: 16, color: 0x3c2723, emissive: 0x150302, emissiveIntensity: 0.14, height: -0.08 },
    { id: 'fake-exit', x1: 37, y1: 12, x2: 42, y2: 18, color: 0x28382f, emissive: 0x07150d, emissiveIntensity: 0.12, height: -0.04 },
    { id: 'final-route', x1: 34, y1: 21, x2: 42, y2: 28, color: 0x1f3337, emissive: 0x06191d, emissiveIntensity: 0.2, height: -0.04 }
  ],
  guideStrips: [
    { x: 8, y: 16, axis: 'x', length: 7, color: 0xcfe9e8, opacity: 0.08, width: 0.18 },
    { x: 12, y: 12, axis: 'z', length: 5, color: 0x8bdcff, opacity: 0.1, width: 0.18 },
    { x: 12, y: 22, axis: 'z', length: 6, color: 0x8bdcff, opacity: 0.08, width: 0.18 },
    { x: 20, y: 15, axis: 'x', length: 7, color: 0xb7f7ff, opacity: 0.15, width: 0.2 },
    { x: 31, y: 10, axis: 'x', length: 7, color: 0xa88dc4, opacity: 0.09, width: 0.16 },
    { x: 31, y: 15, axis: 'x', length: 12, color: 0xc43c24, opacity: 0.18, width: 0.22 },
    { x: 40, y: 22, axis: 'z', length: 8, color: 0x6bc7dc, opacity: 0.13, width: 0.2 }
  ],
  navigationNodes: [
    { x: 4, y: 16, color: 0xcfe9e8, intensity: 0.22, distance: 8 },
    { x: 12, y: 15, color: 0x6bc7dc, intensity: 0.42, distance: 10 },
    { x: 7, y: 7, color: 0xcfe9e8, intensity: 0.28, distance: 9 },
    { x: 7, y: 25, color: 0x8ca2ff, intensity: 0.28, distance: 9 },
    { x: 21, y: 15, color: 0xb7f7ff, intensity: 0.58, distance: 11 },
    { x: 31, y: 7, color: 0xa88dc4, intensity: 0.32, distance: 9 },
    { x: 36, y: 15, color: 0xc43c24, intensity: 0.48, distance: 12 },
    { x: 41, y: 27, color: 0x86f7b2, intensity: 0.55, distance: 9 }
  ],
  areaLights: [
    { x: 5, y: 16, color: 0xcfe9e8, intensity: 0.18, distance: 8, height: 2.65 },
    { x: 12, y: 15, color: 0x6bc7dc, intensity: 0.34, distance: 11, height: 2.7 },
    { x: 21, y: 15, color: 0xb7f7ff, intensity: 0.55, distance: 12, height: 2.75 },
    { x: 31, y: 7, color: 0xa88dc4, intensity: 0.3, distance: 10, height: 2.65 },
    { x: 31, y: 15, color: 0xc43c24, intensity: 0.5, distance: 14, height: 2.25 },
    { x: 40, y: 24, color: 0x6bc7dc, intensity: 0.38, distance: 11, height: 2.45 }
  ],
  ceilingLights: [
    { x: 5, y: 16, width: 1.6, depth: 0.18, color: 0xcfe9e8, intensity: 0.34 },
    { x: 10, y: 14, width: 1.6, depth: 0.18, color: 0xcfe9e8, intensity: 0.28 },
    { x: 13, y: 18, width: 1.6, depth: 0.18, color: 0xcfe9e8, intensity: 0.28 },
    { x: 7, y: 7, width: 1.5, depth: 0.18, color: 0xcfe9e8, intensity: 0.3 },
    { x: 12, y: 7, width: 1.2, depth: 0.18, color: 0xcfe9e8, intensity: 0.22, flicker: true },
    { x: 7, y: 25, width: 1.5, depth: 0.18, color: 0xaebcff, intensity: 0.26 },
    { x: 21, y: 15, width: 1.8, depth: 0.2, color: 0xb7f7ff, intensity: 0.46 },
    { x: 31, y: 7, width: 1.5, depth: 0.18, color: 0xd5c2ff, intensity: 0.28, flicker: true },
    { x: 28, y: 15, width: 1.4, depth: 0.18, color: 0xc43c24, intensity: 0.34 },
    { x: 34, y: 15, width: 1.4, depth: 0.18, color: 0xc43c24, intensity: 0.34 },
    { x: 40, y: 15, width: 1.2, depth: 0.18, color: 0xcfe9e8, intensity: 0.32 },
    { x: 40, y: 25, width: 1.4, depth: 0.18, color: 0x6bc7dc, intensity: 0.36, flicker: true }
  ],
  routes: [
    {
      id: 'critical-path',
      label: 'Critical Route',
      color: 0x86f7b2,
      points: [
        { x: 4, y: 16 },
        { x: 12, y: 15 },
        { x: 7, y: 7 },
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
      { id: 'entry-loop', from: 'entry', to: 'orientation-hub', anchor: { x: 8, y: 16 } },
      { id: 'records-hall', from: 'checkpoint-chamber', to: 'fake-exit', anchor: { x: 25, y: 15 } },
      { id: 'final-afterimage', from: 'fake-exit', to: 'final-route', anchor: { x: 40, y: 19 } }
    ],
    lightChannels: [
      { id: 'normal-office', rooms: ['entry', 'orientation-hub', 'cubicle-sector'] },
      { id: 'ai-cyan', rooms: ['checkpoint-chamber', 'final-route'] },
      { id: 'emergency', rooms: ['crusher-corridor'] },
      { id: 'wrongness', rooms: ['wrong-department', 'archive'] }
    ],
    signageChannels: [
      { id: 'department-labels', rooms: ['orientation-hub', 'wrong-department', 'fake-exit'] }
    ],
    fakeExits: [
      { id: 'public-exit', room: 'fake-exit', triggerId: 'fake-exit-pressure' }
    ],
    loopCandidates: [
      { id: 'archive-return-loop', rooms: ['archive', 'orientation-hub'] }
    ]
  },
  architecture: [
    { type: 'receptionDesk', x: 5.5, y: 15.1, width: 2.4, depth: 0.45, rotation: 0, color: 0x4b4f4f },
    { type: 'sign', id: 'entry-sign', channelId: 'department-labels', x: 5.5, y: 14.1, text: 'NIGHT SHIFT ENTRY', color: 0xcfe9e8, width: 2.2 },
    { type: 'sign', id: 'orientation-sign', channelId: 'department-labels', x: 12, y: 12.1, text: 'ORIENTATION', color: 0x8bdcff, width: 2.0 },
    { type: 'sign', id: 'wrong-dept-sign', channelId: 'department-labels', x: 31, y: 10.1, text: 'DEPARTMENT NOT FOUND', color: 0xd5c2ff, width: 2.6 },
    { type: 'sign', id: 'fake-exit-sign', channelId: 'department-labels', x: 38.5, y: 13, text: 'PUBLIC EXIT', color: 0x86f7b2, width: 2.1 },
    { type: 'taskTerminal', x: 12, y: 15, color: 0x6bc7dc },
    { type: 'taskTerminal', x: 7, y: 7, color: 0xcfe9e8 },
    { type: 'taskTerminal', x: 7, y: 25, color: 0x8ca2ff },
    { type: 'taskTerminal', x: 21, y: 15, color: 0xb7f7ff },
    { type: 'taskTerminal', x: 31, y: 7, color: 0xa88dc4 },
    { type: 'cubicleCluster', x: 6, y: 6, columns: 2, rows: 2, color: 0x4b5358 },
    { type: 'cubicleCluster', x: 11, y: 6, columns: 2, rows: 2, color: 0x4b5358 },
    { type: 'serverRackRow', x: 5, y: 24, count: 4, axis: 'x', color: 0x222832, emissive: 0x182a4a },
    { type: 'serverRackRow', x: 5, y: 27, count: 4, axis: 'x', color: 0x222832, emissive: 0x182a4a },
    { type: 'meetingTable', x: 21, y: 16.2, width: 2.3, depth: 1.0, color: 0x4a4f52 },
    { type: 'glassWall', x: 17, y: 15, axis: 'z', length: 4, color: 0x8ac7d9 },
    { type: 'glassWall', x: 24, y: 15, axis: 'z', length: 4, color: 0x8ac7d9 },
    { type: 'copyMachine', x: 20, y: 25, color: 0x6d746f },
    { type: 'monolith', x: 31, y: 7.9, width: 0.44, depth: 0.2, height: 1.25, color: 0x3a3148, emissive: 0xa88dc4 },
    { type: 'frame', x: 25, y: 15, axis: 'z', width: 2.7, color: 0x5a443f, emissive: 0x1b0603 },
    { type: 'frame', x: 37, y: 15, axis: 'z', width: 2.7, color: 0x375443, emissive: 0x07150d },
    { type: 'beam', x: 31, y: 14, axis: 'x', length: 12, color: 0x4b3430, emissive: 0x150302 },
    { type: 'beam', x: 31, y: 16, axis: 'x', length: 12, color: 0x4b3430, emissive: 0x150302 },
    { type: 'column', x: 9, y: 12, radius: 0.13, height: 2.65, color: 0x4a5358 },
    { type: 'column', x: 15, y: 19, radius: 0.13, height: 2.65, color: 0x4a5358 },
    { type: 'column', x: 18, y: 12, radius: 0.13, height: 2.85, color: 0x315063, emissive: 0x061b20 },
    { type: 'column', x: 24, y: 18, radius: 0.13, height: 2.85, color: 0x315063, emissive: 0x061b20 },
    { type: 'windowBand', x: 40, y: 24, axis: 'z', length: 5, color: 0x6bc7dc },
    { type: 'doorSlab', x: 41, y: 27.8, width: 1.6, color: 0x2d5645, emissive: 0x0a2013 }
  ]
};
