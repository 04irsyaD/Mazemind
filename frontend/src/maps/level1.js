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
    y2: 22,
    color: 0x9aa3a1,
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
    color: 0xcfe9e8,
    purpose: 'first document',
    mood: 'administrative'
  },
  {
    id: 'main-workstation-hall',
    label: 'Main Workstation Hall',
    x1: 2,
    y1: 4,
    x2: 20,
    y2: 13,
    color: 0x93a4b2,
    purpose: 'exploration',
    mood: 'empty night office'
  },
  {
    id: 'archive',
    label: 'Records Archive',
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
    label: 'Counsellor / Review Room',
    x1: 17,
    y1: 11,
    x2: 24,
    y2: 19,
    color: 0xb7f7ff,
    purpose: 'document review',
    mood: 'judged'
  },
  {
    id: 'wrong-department',
    label: 'Accounts / Records Office',
    x1: 24,
    y1: 4,
    x2: 35,
    y2: 10,
    color: 0x9c9b86,
    purpose: 'right department wing',
    mood: 'too orderly'
  },
  {
    id: 'utility-break',
    label: 'Staff Room',
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
    label: 'Unknown Department Transfer Corridor',
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
  { id: 'reception-to-intake', label: 'Employee Intake Hall', x1: 4, y1: 17, x2: 10, y2: 18, from: 'front-reception', to: 'employee-intake' },
  { id: 'intake-to-workstations', label: 'Main Workstation Entry', x1: 6, y1: 12, x2: 10, y2: 14, from: 'employee-intake', to: 'main-workstation-hall' },
  { id: 'intake-to-archive', label: 'Archive Connector', x1: 10, y1: 17, x2: 12, y2: 24, from: 'employee-intake', to: 'archive' },
  { id: 'workstation-to-review', label: 'Review Intake', x1: 17, y1: 11, x2: 20, y2: 15, from: 'main-workstation-hall', to: 'checkpoint-chamber' },
  { id: 'review-to-wrong-dept', label: 'Department Transfer', x1: 21, y1: 9, x2: 25, y2: 13, from: 'checkpoint-chamber', to: 'wrong-department' },
  { id: 'review-to-break', label: 'Utility Bend', x1: 21, y1: 19, x2: 23, y2: 23, from: 'checkpoint-chamber', to: 'utility-break' },
  { id: 'review-to-records', label: 'Emergency Records Intake', x1: 24, y1: 14, x2: 26, y2: 16, from: 'checkpoint-chamber', to: 'crusher-corridor' },
  { id: 'fake-exit-afterimage', label: 'Exit Afterimage', x1: 39, y1: 18, x2: 41, y2: 24, from: 'fake-exit', to: 'final-route' },
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
  { id: 'wrong-department-muted', channelId: 'wrongness', rooms: ['wrong-department', 'archive'], mood: 'incorrect' }
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
    { id: 'front-reception', x1: 2, y1: 18, x2: 12, y2: 22, color: 0x6a7471, emissive: 0x0b0f0e, emissiveIntensity: 0.068, roughness: 0.82, height: 0 },
    { id: 'employee-intake', x1: 2, y1: 14, x2: 12, y2: 17, color: 0x737d79, emissive: 0x0c100f, emissiveIntensity: 0.07, roughness: 0.8, height: 0 },
    { id: 'main-workstation-hall', x1: 2, y1: 4, x2: 20, y2: 13, color: 0x465662, emissive: 0x040809, emissiveIntensity: 0.05, roughness: 0.88, height: 0 },
    { id: 'archive', x1: 3, y1: 22, x2: 15, y2: 28, color: 0x2a3037, emissive: 0x050714, emissiveIntensity: 0.08, height: -0.03 },
    { id: 'checkpoint-chamber', x1: 17, y1: 11, x2: 24, y2: 19, color: 0x2f4248, emissive: 0x061b20, emissiveIntensity: 0.11, height: 0.08 },
    { id: 'wrong-department', x1: 24, y1: 4, x2: 35, y2: 10, color: 0x414139, emissive: 0x070705, emissiveIntensity: 0.055, height: 0.04 },
    { id: 'utility-break', x1: 18, y1: 22, x2: 28, y2: 28, color: 0x373b32, emissive: 0x050702, height: 0 },
    { id: 'crusher-corridor', x1: 25, y1: 14, x2: 37, y2: 16, color: 0x3c2723, emissive: 0x150302, emissiveIntensity: 0.14, height: -0.08 },
    { id: 'fake-exit', x1: 37, y1: 12, x2: 42, y2: 18, color: 0x28382f, emissive: 0x07150d, emissiveIntensity: 0.12, height: -0.04 },
    { id: 'final-route', x1: 34, y1: 21, x2: 42, y2: 28, color: 0x1f3337, emissive: 0x06191d, emissiveIntensity: 0.2, height: -0.04 }
  ],
  guideStrips: [],
  navigationNodes: [],
  areaLights: [
    { x: 7.6, y: 19.2, color: 0xd6e9e5, intensity: 0.48, distance: 13.5, height: 2.35 },
    { x: 8.8, y: 20.75, color: 0xb9c7c3, intensity: 0.14, distance: 9.5, height: 1.45 },
    { x: 3.75, y: 19.35, color: 0xb9c7c3, intensity: 0.1, distance: 7.5, height: 1.35 },
    { x: 5.45, y: 16.25, color: 0xcfe9e8, intensity: 0.44, distance: 10, height: 2.3 },
    { x: 5.6, y: 16.55, color: 0x7fcbd4, intensity: 0.2, distance: 5.4, height: 1.2 },
    { x: 9.6, y: 16.35, color: 0xb8c9c5, intensity: 0.12, distance: 7.5, height: 1.45 },
    { x: 8.2, y: 11.5, color: 0xcfe9e8, intensity: 0.25, distance: 12, height: 2.45 },
    { x: 8.25, y: 8.45, color: 0x9fb5b7, intensity: 0.13, distance: 9, height: 1.35 },
    { x: 13.5, y: 8.2, color: 0xb8d2d5, intensity: 0.15, distance: 9.5, height: 2.35 },
    { x: 21, y: 15, color: 0xb7f7ff, intensity: 0.48, distance: 12, height: 2.75 },
    { x: 31, y: 7, color: 0xd0d1bd, intensity: 0.26, distance: 10, height: 2.65 },
    { x: 31, y: 15, color: 0xc43c24, intensity: 0.5, distance: 14, height: 2.25 },
    { x: 40, y: 24, color: 0x6bc7dc, intensity: 0.38, distance: 11, height: 2.45 }
  ],
  ceilingLights: [
    { x: 7.3, y: 19.05, width: 0.78, depth: 0.11, color: 0xd6e9e5, fixtureColor: 0x98a6a2, emissiveIntensity: 0.16, intensity: 0.32, distance: 9.5 },
    { x: 5.8, y: 16.05, width: 0.72, depth: 0.11, color: 0xcfe9e8, fixtureColor: 0x9aaba8, emissiveIntensity: 0.17, intensity: 0.31, distance: 8.8 },
    { x: 9.2, y: 15.0, width: 0.68, depth: 0.1, color: 0xcfe9e8, fixtureColor: 0x94a3a0, emissiveIntensity: 0.13, intensity: 0.2, distance: 7.8 },
    { x: 7.2, y: 11.2, width: 0.9, depth: 0.11, color: 0xcfe9e8, fixtureColor: 0x94a3a0, emissiveIntensity: 0.13, intensity: 0.2, distance: 9.5 },
    { x: 7, y: 7, width: 1.0, depth: 0.12, color: 0xcfe9e8, fixtureColor: 0x8f9c99, emissiveIntensity: 0.11, intensity: 0.16, distance: 8.5 },
    { x: 13, y: 11, width: 1.0, depth: 0.12, color: 0xcfe9e8, fixtureColor: 0x8f9c99, emissiveIntensity: 0.08, intensity: 0.12, distance: 8, flicker: true },
    { x: 14, y: 7, width: 0.85, depth: 0.11, color: 0xcfe9e8, fixtureColor: 0x8f9c99, emissiveIntensity: 0.09, intensity: 0.12, distance: 7.5 },
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
      { id: 'wrongness', rooms: ['wrong-department', 'archive'] }
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
    { type: 'receptionDesk', x: 4.2, y: 21.05, width: 2.25, depth: 0.5, color: 0x8a7a62, trimColor: 0x30383a, roughness: 0.76 },
    { type: 'receptionDesk', x: 5.35, y: 16.25, width: 3.15, depth: 0.78, color: 0x9a8568, trimColor: 0x2d3436, roughness: 0.74 },
    { type: 'sofa', x: 3.8, y: 19.18, width: 2.1, color: 0x596064 },
    { type: 'waitingChairs', x: 11.05, y: 19.05, count: 2, axis: 'z', spacing: 0.7, rotation: -Math.PI / 2, color: 0x3d4347 },
    { type: 'coffeeTable', x: 5.15, y: 19.32, color: 0x7a715f },
    { type: 'plant', x: 2.7, y: 18.35, color: 0x41684f },
    { type: 'plant', x: 11.55, y: 21.55, color: 0x3e6049 },
    { type: 'sign', id: 'records-sign', channelId: 'department-labels', x: 6.2, y: 14.08, text: 'RECORDS DEPARTMENT', color: 0xd8ebe7, width: 2.45 },
    { type: 'sign', id: 'night-entry-sign', channelId: 'department-labels', x: 4.2, y: 22.1, text: 'NIGHT SHIFT ENTRY', color: 0xcfe9e8, width: 2.0, height: 1.85, rotation: Math.PI },
    { type: 'sign', id: 'intake-sign', channelId: 'department-labels', x: 5.35, y: 16.78, text: 'EMPLOYEE INTAKE', color: 0xd8ebe7, width: 1.55, height: 1.18 },
    { type: 'sign', id: 'main-hall-sign', channelId: 'department-labels', x: 8.2, y: 13.1, text: 'MAIN WORKSTATION HALL', color: 0xcfe9e8, width: 2.65 },
    {
      type: 'taskTerminal',
      x: 5.85,
      y: 16.35,
      color: 0x8bdcff,
      desktop: true,
      surfaceHeight: 0.92,
      text: 'Welcome to Records Department.\nRetrieve your Shift Assignment Form.'
    },
    { type: 'sign', id: 'wrong-dept-sign', channelId: 'department-labels', x: 31, y: 10.1, text: 'ACCOUNTS / RECORDS OFFICE', color: 0xd0d1bd, width: 2.7 },
    { type: 'sign', id: 'fake-exit-sign', channelId: 'department-labels', x: 38.5, y: 13, text: 'PUBLIC EXIT', color: 0x86f7b2, width: 2.1 },
    { type: 'sign', id: 'archive-sign', channelId: 'department-labels', x: 7, y: 22.1, text: 'RECORDS ARCHIVE', color: 0xaebcff, width: 2.0 },
    { type: 'sign', id: 'review-sign', channelId: 'department-labels', x: 21, y: 11.1, text: 'COUNSELLOR / REVIEW', color: 0xb7f7ff, width: 2.35 },
    { type: 'sign', id: 'staff-sign', channelId: 'department-labels', x: 22.5, y: 22.1, text: 'STAFF ROOM', color: 0xc5d0b6, width: 1.7 },
    { type: 'taskTerminal', x: 8, y: 7, color: 0xcfe9e8 },
    { type: 'taskTerminal', x: 7, y: 25, color: 0x8ca2ff },
    { type: 'taskTerminal', x: 21, y: 15, color: 0xb7f7ff },
    { type: 'taskTerminal', x: 31, y: 7, color: 0xd0d1bd },
    { type: 'cubicleCluster', x: 4.2, y: 6.6, columns: 2, rows: 2, color: 0x566066, monitorColor: 0x607b82, chairColor: 0x25282a },
    { type: 'cubicleCluster', x: 13.0, y: 6.6, columns: 2, rows: 2, color: 0x566066, monitorColor: 0x5f777d, chairColor: 0x25282a },
    { type: 'glassWall', x: 10.8, y: 13.2, axis: 'x', length: 3.0, color: 0x8ac7d9 },
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
