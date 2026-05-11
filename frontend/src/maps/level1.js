export const level1 = {
  grid: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 4, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 4, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 4, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  ],
  playerStart: { x: 3, y: 9 },
  goals: [
    {
      id: 'exit-door',
      x: 23,
      y: 9,
      height: -0.05,
      requiresAllCheckpoints: true,
      lockTriggerId: 'exit-pressure-plate'
    }
  ],
  checkpoints: [
    { id: 'reception', label: 'Reception Hub', x: 4, y: 8, radius: 2.15 },
    { id: 'pantry', label: 'Pantry Detour', x: 7, y: 4, radius: 2.15, height: 0.03 },
    { id: 'meeting-room', label: 'Checkpoint Chamber', x: 12, y: 9, radius: 2.35, height: 0.12 },
    { id: 'ceo-office', label: 'CEO Overlook', x: 19, y: 5, radius: 2.2, height: 0.08 },
    { id: 'server-room', label: 'Server Archive', x: 6, y: 14, radius: 2.2, height: -0.04 }
  ],
  triggers: [
    { id: 'exit-pressure-plate', x: 20, y: 9, radius: 2.25, height: -0.12, requiresCheckpointInactive: true }
  ],
  crushers: [
    {
      id: 'exit-route-crusher',
      triggerId: 'exit-pressure-plate',
      start: { x: 24, y: 9 },
      end: { x: 16, y: 9 },
      delay: 2.05,
      speed: 2.95,
      killRadius: 1.0,
      laneCoverage: 0.64,
      telegraphWidth: 0.5
    }
  ],
  sentientObjects: [
    { id: 'reception-chair-a', kind: 'chair', x: 2, y: 8, rotation: 0.2, triggerRadius: 5.3 },
    { id: 'reception-chair-b', kind: 'chair', x: 6, y: 10, rotation: -0.55, triggerRadius: 5.3 },
    { id: 'pantry-dispenser', kind: 'dispenser', x: 5, y: 4, height: 0.03, triggerRadius: 6.1, attackRadius: 2.1 },
    { id: 'pantry-table', kind: 'table', x: 9, y: 5, height: 0.03, rotation: Math.PI / 2, triggerRadius: 5.4 },
    { id: 'meeting-table', kind: 'table', x: 13, y: 9, height: 0.12, attackSpeed: 3.5, collisionRadius: 0.9 },
    { id: 'meeting-chair-a', kind: 'chair', x: 11, y: 8, height: 0.12, rotation: Math.PI / 2 },
    { id: 'meeting-chair-b', kind: 'chair', x: 14, y: 10, height: 0.12, rotation: -Math.PI / 2 },
    { id: 'ceo-desk', kind: 'table', x: 19, y: 6, height: 0.08, attackSpeed: 3.5, collisionRadius: 0.95 },
    { id: 'ceo-chair', kind: 'chair', x: 21, y: 5, height: 0.08, rotation: Math.PI },
    { id: 'server-rack-a', kind: 'table', x: 4, y: 14, height: -0.04, rotation: Math.PI / 2, triggerRadius: 5.7 },
    { id: 'server-rack-b', kind: 'table', x: 8, y: 15, height: -0.04, rotation: Math.PI / 2, triggerRadius: 5.7 },
    { id: 'exit-chair', kind: 'chair', x: 22, y: 10, height: -0.12, rotation: -0.2, triggerRadius: 5.0 }
  ],
  floorZones: [
    { id: 'spawn-hub', x1: 1, y1: 7, x2: 8, y2: 11, color: 0x1b3342, emissive: 0x06151f, height: 0 },
    { id: 'pantry-detour', x1: 3, y1: 2, x2: 10, y2: 6, color: 0x25332b, emissive: 0x06120b, height: 0.03 },
    { id: 'checkpoint-chamber', x1: 10, y1: 7, x2: 15, y2: 11, color: 0x173a47, emissive: 0x082633, emissiveIntensity: 0.18, height: 0.12 },
    { id: 'ceo-overlook', x1: 16, y1: 3, x2: 22, y2: 7, color: 0x2f293e, emissive: 0x10081d, height: 0.08 },
    { id: 'server-archive', x1: 2, y1: 13, x2: 8, y2: 16, color: 0x26223a, emissive: 0x0b0920, height: -0.04 },
    { id: 'crusher-lane', x1: 17, y1: 8, x2: 23, y2: 10, color: 0x3e1d18, emissive: 0x1c0603, emissiveIntensity: 0.16, height: -0.12 },
    { id: 'exit-threshold', x1: 22, y1: 8, x2: 23, y2: 10, color: 0x173a2d, emissive: 0x002513, emissiveIntensity: 0.2, height: -0.05 }
  ],
  guideStrips: [
    { x: 6.5, y: 9, axis: 'x', length: 4, opacity: 0.1 },
    { x: 12, y: 9, axis: 'x', length: 5, opacity: 0.16 },
    { x: 20.5, y: 9, axis: 'x', length: 7, color: 0xff7a1a, opacity: 0.18, width: 0.22 },
    { x: 7, y: 5.5, axis: 'z', length: 4, color: 0x79d7ff, opacity: 0.08 },
    { x: 6, y: 14.5, axis: 'x', length: 5, color: 0x7afcff, opacity: 0.08 }
  ],
  navigationNodes: [
    { x: 4, y: 8, intensity: 0.46, distance: 9 },
    { x: 7, y: 4, color: 0x79d7ff, intensity: 0.34, distance: 8 },
    { x: 12, y: 9, color: 0x7afcff, intensity: 0.72, distance: 11 },
    { x: 19, y: 5, color: 0xb28dff, intensity: 0.44, distance: 9 },
    { x: 6, y: 14, color: 0x7afcff, intensity: 0.42, distance: 8 },
    { x: 20, y: 9, color: 0xff7a1a, intensity: 0.55, distance: 9 },
    { x: 23, y: 9, color: 0x00ff88, intensity: 0.72, distance: 9 }
  ],
  areaLights: [
    { x: 4, y: 9, color: 0x28d8ff, intensity: 0.35, distance: 10, height: 2.2 },
    { x: 12, y: 9, color: 0x7afcff, intensity: 0.68, distance: 12, height: 2.5 },
    { x: 6, y: 14, color: 0x766bff, intensity: 0.32, distance: 8, height: 2.1 },
    { x: 19, y: 5, color: 0xb28dff, intensity: 0.38, distance: 9, height: 2.4 },
    { x: 20.5, y: 9, color: 0xff3300, intensity: 0.5, distance: 11, height: 1.7 }
  ],
  architecture: [
    { type: 'platform', x: 12, y: 9, width: 3.35, depth: 3.35, height: 0.18, color: 0x16495a, emissive: 0x0a2f3d },
    { type: 'platform', x: 20.5, y: 9, width: 6.5, depth: 2.75, height: 0.08, yOffset: -0.16, color: 0x4a211b, emissive: 0x260702 },
    { type: 'frame', x: 9.5, y: 9, axis: 'x', width: 2.6, color: 0x3e435f },
    { type: 'frame', x: 16.5, y: 9, axis: 'x', width: 2.9, color: 0x55444f },
    { type: 'frame', x: 22.5, y: 9, axis: 'x', width: 2.4, color: 0x2d5a47, emissive: 0x002513 },
    { type: 'beam', x: 19, y: 8, axis: 'x', length: 4, color: 0x58322d, emissive: 0x210503 },
    { type: 'beam', x: 21, y: 10, axis: 'x', length: 4, color: 0x58322d, emissive: 0x210503 },
    { type: 'column', x: 1.7, y: 7.5, radius: 0.16, height: 2.15, color: 0x3d4663 },
    { type: 'column', x: 7.4, y: 7.5, radius: 0.16, height: 2.15, color: 0x3d4663 },
    { type: 'column', x: 1.7, y: 10.5, radius: 0.16, height: 2.15, color: 0x3d4663 },
    { type: 'column', x: 7.4, y: 10.5, radius: 0.16, height: 2.15, color: 0x3d4663 },
    { type: 'column', x: 10.4, y: 7.4, radius: 0.14, height: 2.35, color: 0x315063, emissive: 0x062430 },
    { type: 'column', x: 14.6, y: 7.4, radius: 0.14, height: 2.35, color: 0x315063, emissive: 0x062430 },
    { type: 'column', x: 10.4, y: 10.6, radius: 0.14, height: 2.35, color: 0x315063, emissive: 0x062430 },
    { type: 'column', x: 14.6, y: 10.6, radius: 0.14, height: 2.35, color: 0x315063, emissive: 0x062430 },
    { type: 'column', x: 3.1, y: 13.4, radius: 0.12, height: 1.7, color: 0x3b365d, emissive: 0x080520 },
    { type: 'column', x: 8.0, y: 15.8, radius: 0.12, height: 1.7, color: 0x3b365d, emissive: 0x080520 },
    { type: 'monolith', x: 5.2, y: 14.8, width: 0.34, depth: 0.18, height: 1.4, color: 0x1c6173, emissive: 0x28d8ff },
    { type: 'monolith', x: 19.5, y: 5.2, width: 0.5, depth: 0.22, height: 1.1, color: 0x3e2f5a, emissive: 0x8c6bff }
  ]
};
