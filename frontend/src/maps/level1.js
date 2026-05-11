export const level1 = {
  grid: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0],
    [0, 1, 1, 1, 0, 1, 4, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 1, 1, 0],
    [0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 4, 1, 1, 0, 1, 1, 1, 1, 4, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
    [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 2, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 4, 1, 1, 0, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  ],
  playerStart: { x: 2, y: 9 },
  goals: [
    {
      id: 'exit-door',
      x: 23,
      y: 9,
      requiresAllCheckpoints: true
    }
  ],
  checkpoints: [
    { id: 'reception', label: 'Reception', x: 3, y: 7, radius: 1.3 },
    { id: 'pantry', label: 'Pantry', x: 6, y: 5, radius: 1.3 },
    { id: 'meeting-room', label: 'Meeting Room', x: 11, y: 7, radius: 1.3 },
    { id: 'ceo-office', label: 'CEO Office', x: 20, y: 5, radius: 1.3 },
    { id: 'server-room', label: 'Server Room', x: 18, y: 11, radius: 1.3 }
  ],
  sentientObjects: [
    { id: 'reception-chair-a', kind: 'chair', x: 2, y: 7, rotation: 0.2 },
    { id: 'reception-chair-b', kind: 'chair', x: 4, y: 9, rotation: -0.5 },
    { id: 'pantry-dispenser', kind: 'dispenser', x: 5, y: 5, triggerRadius: 5.5, attackRadius: 2.1 },
    { id: 'pantry-table', kind: 'table', x: 8, y: 5, rotation: Math.PI / 2 },
    { id: 'meeting-table', kind: 'table', x: 12, y: 7, attackSpeed: 3.8, collisionRadius: 0.95 },
    { id: 'meeting-chair-a', kind: 'chair', x: 9, y: 7, rotation: Math.PI / 2 },
    { id: 'meeting-chair-b', kind: 'chair', x: 14, y: 7, rotation: -Math.PI / 2 },
    { id: 'ceo-desk', kind: 'table', x: 19, y: 5, attackSpeed: 3.6, collisionRadius: 0.95 },
    { id: 'ceo-chair', kind: 'chair', x: 21, y: 5, rotation: Math.PI },
    { id: 'server-rack-a', kind: 'table', x: 16, y: 11, rotation: Math.PI / 2, triggerRadius: 5.8 },
    { id: 'server-rack-b', kind: 'table', x: 20, y: 11, rotation: Math.PI / 2, triggerRadius: 5.8 },
    { id: 'exit-chair', kind: 'chair', x: 22, y: 9, rotation: -0.2, triggerRadius: 5.5 }
  ]
};
