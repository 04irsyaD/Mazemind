export function normalizeLevelDefinition(level) {
  const spaces = level.spaces ?? level.rooms ?? [];
  const collisionGrid = level.collisionGrid ?? level.grid;
  return {
    ...level,
    schemaVersion: level.schemaVersion ?? 1,
    spaces,
    rooms: level.rooms ?? spaces,
    connectors: level.connectors ?? [],
    objectives: level.objectives ?? [],
    hazards: level.hazards ?? [],
    lightingZones: level.lightingZones ?? [],
    storyBeats: level.storyBeats ?? [],
    manipulationNodes: level.manipulationNodes ?? [],
    collisionVolumes: level.collisionVolumes ?? [],
    collisionGrid,
    grid: collisionGrid,
  };
}

export function getTaskObjectives(level) {
  return (level.objectives ?? []).filter(objective => objective.type === 'task');
}

export function getFinalExitObjective(level) {
  return (level.objectives ?? []).find(objective => objective.type === 'finalExit') ?? null;
}
