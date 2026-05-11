export const level1 = {
  grid: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 5, 1, 2, 0],
    [0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 3, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0],
    [0, 1, 1, 1, 3, 0, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 4, 1, 1, 3, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  ],
  playerStart: { x: 1, y: 1 },
  checkpoints: [
    { id: 'main-checkpoint', x: 3, y: 9 }
  ],
  triggers: [
    {
      id: 'premature-final-trigger',
      x: 7,
      y: 1,
      radius: 1.15,
      requiresCheckpointInactive: true
    }
  ],
  crushers: [
    {
      id: 'final-path-crusher',
      triggerId: 'premature-final-trigger',
      start: { x: 9, y: 1 },
      end: { x: 6, y: 1 },
      delay: 1.1,
      speed: 4.2,
      killRadius: 1.15
    }
  ]
};
