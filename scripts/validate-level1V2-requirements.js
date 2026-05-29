#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const requirementsPath = path.join(
  repoRoot,
  'frontend',
  'src',
  'maps',
  'requirements',
  'level1V2-requirements.json'
);
const levelPath = path.join(repoRoot, 'frontend', 'src', 'maps', 'level1V2.js');
const CELL_SIZE_METERS = 3.6;

const failures = [];
const warnings = [];

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    failures.push(`Cannot read ${path.relative(repoRoot, filePath)}: ${error.message}`);
    return '';
  }
}

function addFailure(message) {
  failures.push(message);
}

function addWarning(message) {
  warnings.push(message);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasPattern(text, pattern) {
  return pattern.test(text);
}

function findConstArrayBody(text, constName) {
  const pattern = new RegExp(`const\\s+${escapeRegExp(constName)}\\s*=\\s*\\[([\\s\\S]*?)\\];`);
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
}

function findObjectSnippetById(text, id, maxLength = 900) {
  const idPattern = new RegExp(`id\\s*:\\s*['"]${escapeRegExp(id)}['"]`);
  const match = idPattern.exec(text);
  if (!match) return '';
  return text.slice(match.index, match.index + maxLength);
}

function ensurePattern(text, pattern, message) {
  if (!hasPattern(text, pattern)) addFailure(message);
}

function ensureNotPattern(text, pattern, message) {
  if (hasPattern(text, pattern)) addFailure(message);
}

function ensureOrderedNeedles(text, needles, label) {
  let cursor = -1;
  needles.forEach(needle => {
    const index = text.indexOf(needle, cursor + 1);
    if (index === -1) {
      addFailure(`${label} is missing ${needle}`);
      return;
    }

    if (index < cursor) {
      addFailure(`${label} order is invalid around ${needle}`);
      return;
    }

    cursor = index;
  });
}

function metersToGridCells(meters) {
  return Number((meters / CELL_SIZE_METERS).toFixed(3));
}

function boundsContainBounds(container, candidate) {
  return (
    candidate.x1 >= container.x1 &&
    candidate.y1 >= container.y1 &&
    candidate.x2 <= container.x2 &&
    candidate.y2 <= container.y2
  );
}

function doBoundsOverlap(first, second) {
  return !(
    first.x2 <= second.x1 ||
    first.x1 >= second.x2 ||
    first.y2 <= second.y1 ||
    first.y1 >= second.y2
  );
}

function dividerFootprint(divider) {
  const width = metersToGridCells(divider.dimensionsMeters.width);
  const depth = metersToGridCells(divider.dimensionsMeters.depth);

  return {
    x1: divider.position.x - width / 2,
    y1: divider.position.y - depth / 2,
    x2: divider.position.x + width / 2,
    y2: divider.position.y + depth / 2
  };
}

function validateRequirementsShape(requirements) {
  if (requirements.levelId !== 'level-1-v2') {
    addFailure('requirements.levelId must be level-1-v2');
  }

  if (requirements.status !== 'mvp-guarded') {
    addFailure('requirements.status must be mvp-guarded');
  }

  if (requirements.grid?.width !== 32 || requirements.grid?.height !== 24) {
    addFailure('requirements grid must be 32 x 24');
  }

  if (requirements.grid?.allowInternalWalls !== false) {
    addFailure('requirements.grid.allowInternalWalls must be false');
  }

  if (requirements.grid?.interiorCellMustBe !== 'CELL_PATH') {
    addFailure('requirements.grid.interiorCellMustBe must be CELL_PATH');
  }

  if (requirements.grid?.outerBoundaryWallsOnly !== true) {
    addFailure('requirements.grid.outerBoundaryWallsOnly must be true');
  }

  if (requirements.objectives?.documentTarget !== 5) {
    addFailure('requirements.objectives.documentTarget must be 5');
  }

  if (!Array.isArray(requirements.objectives?.route) || requirements.objectives.route.length !== 5) {
    addFailure('requirements.objectives.route must contain exactly 5 objectives');
  }

  if (!requirements.rooms?.['central-route']) {
    addFailure('requirements.rooms must include central-route');
  }

  const phase1 = requirements.mazeLitePhase1;
  if (!phase1) {
    addFailure('requirements.mazeLitePhase1 must exist for controlled visual dividers');
    return;
  }

  if (phase1.status !== 'approved-visual-only') {
    addFailure('requirements.mazeLitePhase1.status must be approved-visual-only');
  }

  if (phase1.source !== 'maze-lite-phase-1-visual-only') {
    addFailure('requirements.mazeLitePhase1.source must be maze-lite-phase-1-visual-only');
  }

  if (phase1.maxDividers !== 4) {
    addFailure('requirements.mazeLitePhase1.maxDividers must be 4');
  }

  if (phase1.allowCollision !== false || phase1.allowBlocking !== false) {
    addFailure('Maze Lite Phase 1 must disallow collision and blocking');
  }

  if (phase1.allowCentralRouteBaffles !== false) {
    addFailure('Maze Lite Phase 1 must disallow central route baffles');
  }

  if (!Array.isArray(phase1.dividers) || phase1.dividers.length < 1 || phase1.dividers.length > phase1.maxDividers) {
    addFailure(`requirements.mazeLitePhase1.dividers must contain 1 to ${phase1.maxDividers} dividers`);
    return;
  }

  const roomDividerCounts = new Map();
  phase1.dividers.forEach(divider => {
    const room = requirements.rooms?.[divider.roomId];
    if (!room) {
      addFailure(`${divider.id} roomId ${divider.roomId} is not defined in requirements.rooms`);
      return;
    }

    roomDividerCounts.set(divider.roomId, (roomDividerCounts.get(divider.roomId) ?? 0) + 1);

    if (['front-admin-intake', 'toilet', 'central-route'].includes(divider.roomId)) {
      addFailure(`${divider.id} must not be placed in ${divider.roomId}`);
    }

    if (divider.collision !== false || divider.blocking !== false) {
      addFailure(`${divider.id} must be collision false and blocking false`);
    }

    if (!['cubicle-partition', 'archive-rack-divider'].includes(divider.type)) {
      addFailure(`${divider.id} type ${divider.type} is not approved for this Phase 1 pass`);
    }

    const dimensions = divider.dimensionsMeters ?? {};
    if (divider.type === 'cubicle-partition') {
      if (dimensions.width < 2 || dimensions.width > 2.4) addFailure(`${divider.id} width must be 2.0m to 2.4m`);
      if (dimensions.depth < 0.18 || dimensions.depth > 0.25) addFailure(`${divider.id} depth must be 0.18m to 0.25m`);
      if (dimensions.height < 1.2 || dimensions.height > 1.5) addFailure(`${divider.id} height must be 1.2m to 1.5m`);
    }

    if (divider.type === 'archive-rack-divider') {
      if (dimensions.width < 1.5 || dimensions.width > 2) addFailure(`${divider.id} width must be 1.5m to 2.0m`);
      if (dimensions.depth < 0.35 || dimensions.depth > 0.5) addFailure(`${divider.id} depth must be 0.35m to 0.5m`);
      if (dimensions.height < 1.6 || dimensions.height > 2) addFailure(`${divider.id} height must be 1.6m to 2.0m`);
    }

    const footprint = dividerFootprint(divider);
    if (!boundsContainBounds(room.bounds, footprint)) {
      addFailure(`${divider.id} footprint must stay inside ${divider.roomId} bounds`);
    }

    if (doBoundsOverlap(footprint, requirements.rooms['central-route'].bounds)) {
      addFailure(`${divider.id} must not overlap central-route`);
    }

    requirements.objectives.route.forEach(objective => {
      const objectiveFootprint = {
        x1: objective.position.x - 0.32,
        y1: objective.position.y - 0.32,
        x2: objective.position.x + 0.32,
        y2: objective.position.y + 0.32
      };
      if (doBoundsOverlap(footprint, objectiveFootprint)) {
        addFailure(`${divider.id} must not overlap objective ${objective.id}`);
      }
    });
  });

  roomDividerCounts.forEach((count, roomId) => {
    const maxDividers = requirements.rooms[roomId]?.maxDividers ?? 0;
    if (count > maxDividers) {
      addFailure(`${roomId} divider count ${count} exceeds maxDividers ${maxDividers}`);
    }
  });
}

function validateStaticMazeLitePhase1(levelText, requirements) {
  const phase1 = requirements.mazeLitePhase1;
  const expectedDividers = phase1?.dividers ?? [];

  ensurePattern(levelText, /const\s+level1V2MazeLiteVisualDividers\s*=\s*\[/, 'level1V2MazeLiteVisualDividers must be declared');
  ensurePattern(levelText, /const\s+level1V2MazeLiteDividers\s*=\s*level1V2MazeLiteVisualDividers\s*;/, 'mazeLiteDividers must use the approved visual divider array');
  ensurePattern(levelText, /const\s+level1V2MazeLiteObstacles\s*=\s*\[\s*\]\s*;/, 'mazeLiteObstacles must remain empty');
  ensurePattern(levelText, /\.\.\.level1V2MazeLiteVisualDividerProps/, 'architecture must include approved visual divider props');
  ensurePattern(levelText, /dividerCollisionEnabled\s*:\s*false/, 'officeMazeLite.dividerCollisionEnabled must be false');
  ensurePattern(levelText, /gridWallSegmentsEnabled\s*:\s*false/, 'officeMazeLite.gridWallSegmentsEnabled must be false');

  const dividersBody = findConstArrayBody(levelText, 'level1V2MazeLiteVisualDividers');
  if (dividersBody === null) {
    addFailure('level1V2MazeLiteVisualDividers array was not found');
    return;
  }

  const dividerIdsInArray = [...dividersBody.matchAll(/id\s*:\s*['"]([^'"]+)['"]/g)].map(match => match[1]);
  const expectedIds = expectedDividers.map(divider => divider.id);
  if (dividerIdsInArray.length !== expectedDividers.length) {
    addFailure(`Maze Lite Phase 1 divider count must be ${expectedDividers.length} approved dividers, found ${dividerIdsInArray.length}`);
  }

  if (JSON.stringify(dividerIdsInArray) !== JSON.stringify(expectedIds)) {
    addFailure(`Maze Lite Phase 1 divider IDs must be exactly ${expectedIds.join(', ')}`);
  }

  expectedDividers.forEach(divider => {
    const snippet = findObjectSnippetById(levelText, divider.id, 1200);
    if (!snippet) {
      addFailure(`Maze Lite divider ${divider.id} is missing`);
      return;
    }

    ensurePattern(snippet, new RegExp(`roomId\\s*:\\s*['"]${escapeRegExp(divider.roomId)}['"]`), `${divider.id} roomId must be ${divider.roomId}`);
    ensurePattern(snippet, new RegExp(`type\\s*:\\s*['"]${escapeRegExp(divider.type)}['"]`), `${divider.id} type must be ${divider.type}`);
    ensurePattern(snippet, new RegExp(`position\\s*:\\s*\\{\\s*x\\s*:\\s*${escapeRegExp(divider.position.x)}\\s*,\\s*y\\s*:\\s*${escapeRegExp(divider.position.y)}\\s*\\}`), `${divider.id} position must remain ${JSON.stringify(divider.position)}`);
    ensurePattern(snippet, new RegExp(`rotation\\s*:\\s*${escapeRegExp(divider.rotation)}\\b`), `${divider.id} rotation must be ${divider.rotation}`);
    ensurePattern(snippet, /collision\s*:\s*false\b/, `${divider.id} collision must be false`);
    ensurePattern(snippet, /blocking\s*:\s*false\b/, `${divider.id} blocking must be false`);
    ensurePattern(snippet, new RegExp(`mazeRole\\s*:\\s*['"]${escapeRegExp(divider.mazeRole)}['"]`), `${divider.id} mazeRole must be ${divider.mazeRole}`);
    ensurePattern(snippet, new RegExp(`source\\s*:\\s*mazeLitePhase1Source\\b|source\\s*:\\s*['"]${escapeRegExp(phase1.source)}['"]`), `${divider.id} source must be ${phase1.source}`);
    ensurePattern(snippet, /requirementControlled\s*:\s*true\b/, `${divider.id} must be requirementControlled`);
    ensurePattern(snippet, new RegExp(`dimensionsMeters\\s*:\\s*\\{\\s*width\\s*:\\s*${escapeRegExp(divider.dimensionsMeters.width)}\\s*,\\s*depth\\s*:\\s*${escapeRegExp(divider.dimensionsMeters.depth)}\\s*,\\s*height\\s*:\\s*${escapeRegExp(divider.dimensionsMeters.height)}\\s*\\}`), `${divider.id} dimensionsMeters must remain approved`);
  });
}

function validateStaticMapText(levelText, requirements) {
  ensurePattern(levelText, /const\s+GRID_WIDTH\s*=\s*32\b/, 'GRID_WIDTH must remain 32');
  ensurePattern(levelText, /const\s+GRID_HEIGHT\s*=\s*24\b/, 'GRID_HEIGHT must remain 24');
  ensurePattern(levelText, /documentCountTarget\s*:\s*5\b/, 'documentCountTarget must remain 5');
  ensurePattern(levelText, /wallMode\s*:\s*['"]outer-boundary-only['"]/, 'wallMode must be outer-boundary-only');
  ensurePattern(levelText, /wallImplementation\s*:\s*['"]boundary-grid-only['"]/, 'wallImplementation must be boundary-grid-only');
  ensurePattern(levelText, /internalWallPolicy\s*:\s*['"]disabled['"]/, 'internalWallPolicy must be disabled');
  ensurePattern(levelText, /wallSegments\s*:\s*level1V2WallSegments\b/, 'wallSegments must be wired to the guarded empty wall segment list');
  ensurePattern(levelText, /const\s+level1V2WallSegments\s*=\s*\[\s*\]\s*;/, 'level1V2WallSegments must remain empty');
  ensurePattern(levelText, /collisionVolumes\s*:\s*\[\s*\]/, 'collisionVolumes must remain empty');

  ensureNotPattern(levelText, /(?:\.glb|\.gltf)\b/i, 'Level 1 V2 must not reference GLB/GLTF files');
  ensureNotPattern(levelText, /\b(?:GLTFLoader|DRACOLoader|useGLTF)\b/, 'Level 1 V2 must not use GLTF loading helpers');
  ensureNotPattern(levelText, /https?:\/\//i, 'Level 1 V2 must not reference online model URLs');
  ensureNotPattern(levelText, /\b(?:visualWallSegments|thin-wall|thinWall)\b/i, 'Level 1 V2 must not use thin-wall or visualWallSegments');
  ensureNotPattern(levelText, /\bminimalMazeWall\b/, 'Level 1 V2 must not use minimalMazeWall objects');
  ensureNotPattern(levelText, /\b(?:applyLevel1V2Phase1WallSegments|level1V2Phase1WallSegments|phase-1-approved-only|controlled-approved-segments)\b/, 'Level 1 V2 must not contain the disabled grid wall segment implementation');
  ensureNotPattern(levelText, /grid\s*\[\s*y\s*\]\s*\[\s*x\s*\]\s*=\s*CONSTANTS\.CELL_WALL/, 'Level 1 V2 must not write CELL_WALL into interior grid cells');
  ensureNotPattern(levelText, /\b(?:collision|collisionEnabled|blocking)\s*:\s*true\b/, 'Level 1 V2 must not enable divider collision or blocking flags');
  ensureNotPattern(levelText, /collisionVolumes\s*:\s*\[(?!\s*\])/, 'Level 1 V2 must not contain active collisionVolumes');

  validateStaticMazeLitePhase1(levelText, requirements);

  const expectedObjectiveIds = requirements.objectives.route.map(objective => objective.id);
  ensureOrderedNeedles(
    levelText,
    expectedObjectiveIds.map(id => `id: '${id}'`),
    'objective route'
  );

  requirements.objectives.route.forEach(expected => {
    const snippet = findObjectSnippetById(levelText, expected.id, 1800);
    if (!snippet) {
      addFailure(`objective ${expected.id} is missing`);
      return;
    }

    ensurePattern(snippet, new RegExp(`order\\s*:\\s*${expected.order}\\b`), `${expected.id} order must be ${expected.order}`);
    ensurePattern(snippet, new RegExp(`roomId\\s*:\\s*['"]${escapeRegExp(expected.roomId)}['"]`), `${expected.id} roomId must be ${expected.roomId}`);
    ensurePattern(snippet, new RegExp(`x\\s*:\\s*${escapeRegExp(expected.position.x)}\\b`), `${expected.id} x must be ${expected.position.x}`);
    ensurePattern(snippet, new RegExp(`y\\s*:\\s*${escapeRegExp(expected.position.y)}\\b`), `${expected.id} y must be ${expected.position.y}`);
  });

  Object.entries(requirements.rooms).forEach(([roomId, room]) => {
    if (!levelText.includes(`id: '${roomId}'`) && !levelText.includes(`id: "${roomId}"`)) {
      addFailure(`room id ${roomId} must exist in level1V2.js`);
      return;
    }

    const snippet = findObjectSnippetById(levelText, roomId, 700);
    const boundsPattern = new RegExp(
      `bounds\\s*:\\s*\\{\\s*x1\\s*:\\s*${room.bounds.x1}\\s*,\\s*y1\\s*:\\s*${room.bounds.y1}\\s*,\\s*x2\\s*:\\s*${room.bounds.x2}\\s*,\\s*y2\\s*:\\s*${room.bounds.y2}\\s*\\}`
    );

    if (!boundsPattern.test(snippet)) {
      addFailure(`${roomId} bounds must remain ${JSON.stringify(room.bounds)}`);
    }
  });

  const mvpObjectCount = (levelText.match(/id:\s*['"]mvp-/g) ?? []).length;
  const maxTotalObjects = requirements.globalAssetRules?.maxTotalObjects ?? 14;
  if (mvpObjectCount > maxTotalObjects) {
    addFailure(`MVP object count ${mvpObjectCount} exceeds maxTotalObjects ${maxTotalObjects}`);
  }

  [
    'routeBaffle',
    'filingCabinetDivider',
    'lowOfficeDivider',
    'workstationDivider',
    'oversized',
    'large-divider',
    'large-blocking-obstacle'
  ].forEach(keyword => {
    if (levelText.includes(keyword)) {
      addWarning(`suspicious divider/object keyword present: ${keyword}`);
    }
  });
}

function printResults() {
  if (failures.length > 0) {
    console.error('FAIL Level 1 V2 requirements validation');
    failures.forEach(message => console.error(`FAIL: ${message}`));
    warnings.forEach(message => console.warn(`WARN: ${message}`));
    process.exitCode = 1;
    return;
  }

  if (warnings.length > 0) {
    console.warn('WARN Level 1 V2 requirements validation passed with warnings');
    warnings.forEach(message => console.warn(`WARN: ${message}`));
    process.exitCode = 0;
    return;
  }

  console.log('PASS Level 1 V2 requirements validation');
  process.exitCode = 0;
}

const requirementsText = readText(requirementsPath);
const levelText = readText(levelPath);

let requirements = null;
if (requirementsText) {
  try {
    requirements = JSON.parse(requirementsText);
  } catch (error) {
    addFailure(`Invalid requirements JSON: ${error.message}`);
  }
}

if (requirements && levelText) {
  validateRequirementsShape(requirements);
  validateStaticMapText(levelText, requirements);
}

printResults();
