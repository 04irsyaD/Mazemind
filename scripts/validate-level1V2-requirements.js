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

function numberPattern(value) {
  const number = Number(value);
  if (Number.isInteger(number)) return `${number}(?:\\.0)?`;
  return escapeRegExp(value);
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

function previewCandidateFootprint(candidate) {
  const width = candidate.candidateType === 'archive-rack-divider' ? 0.34 : 0.38;
  const depth = candidate.candidateType === 'archive-rack-divider' ? 0.24 : 0.22;

  return {
    x1: candidate.position.x - width / 2,
    y1: candidate.position.y - depth / 2,
    x2: candidate.position.x + width / 2,
    y2: candidate.position.y + depth / 2
  };
}

function placementSlotFootprint(slot) {
  const width = slot.slotType === 'divider' ? 0.42 : 0.36;
  const depth = slot.slotType === 'divider' ? 0.18 : 0.28;

  return {
    x1: slot.position.x - width / 2,
    y1: slot.position.y - depth / 2,
    x2: slot.position.x + width / 2,
    y2: slot.position.y + depth / 2
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

  const placementSlots = requirements.placementSlots;
  if (!placementSlots) {
    addFailure('requirements.placementSlots must exist for floor-zone slot mode');
  } else {
    if (placementSlots.enabled !== true) addFailure('placementSlots.enabled must be true');
    if (placementSlots.mode !== true) addFailure('placementSlots.mode must be true');
    if (placementSlots.source !== 'approved-floor-zones') addFailure('placementSlots.source must be approved-floor-zones');
    if (placementSlots.status !== 'preview-only') addFailure('placementSlots.status must be preview-only');
    if (placementSlots.requireSlotForNewObjects !== true) addFailure('placementSlots.requireSlotForNewObjects must be true');
    if (placementSlots.requireSlotForNewDividers !== true) addFailure('placementSlots.requireSlotForNewDividers must be true');

    const expectedSlotIds = [
      'A_OBJECT_SLOT_01',
      'B_OBJECT_SLOT_01',
      'C_WORKSTATION_SLOT_01',
      'C_WORKSTATION_SLOT_02',
      'C_DIVIDER_SLOT_01',
      'D_OBJECT_SLOT_01',
      'F_ARCHIVE_SLOT_01',
      'F_ARCHIVE_SLOT_02',
      'F_DIVIDER_SLOT_01',
      'G_OBJECT_SLOT_01',
      'H_OBJECT_SLOT_01'
    ];
    const slots = placementSlots.slots ?? [];
    const actualSlotIds = slots.map(slot => slot.id);

    if (!Array.isArray(slots) || slots.length !== expectedSlotIds.length) {
      addFailure(`placementSlots.slots must contain exactly ${expectedSlotIds.length} slots`);
    } else if (JSON.stringify(actualSlotIds) !== JSON.stringify(expectedSlotIds)) {
      addFailure(`placementSlots slot IDs must be exactly ${expectedSlotIds.join(', ')}`);
    }

    slots.forEach(slot => {
      const room = requirements.rooms?.[slot.roomId];
      if (!room) {
        addFailure(`${slot.id} roomId ${slot.roomId} is not defined in requirements.rooms`);
        return;
      }

      if (slot.code !== room.code) addFailure(`${slot.id} code must be ${room.code}`);
      if (!['object', 'divider'].includes(slot.slotType)) addFailure(`${slot.id} slotType must be object or divider`);
      if (!slot.label) addFailure(`${slot.id} label must not be empty`);
      if (!Array.isArray(slot.allowedAssetTypes) || slot.allowedAssetTypes.length === 0) addFailure(`${slot.id} must list allowedAssetTypes`);
      if (slot.collisionAllowed !== false) addFailure(`${slot.id} collisionAllowed must be false`);
      if (slot.approved !== false) addFailure(`${slot.id} approved must be false`);
      if (slot.status !== 'pending-user-visual-approval') addFailure(`${slot.id} status must be pending-user-visual-approval`);
      if (slot.renderAs !== 'floor-slot-marker') addFailure(`${slot.id} renderAs must be floor-slot-marker`);

      ['width', 'depth', 'height'].forEach(key => {
        if (!Number.isFinite(slot.maxSize?.[key]) || slot.maxSize[key] <= 0) {
          addFailure(`${slot.id} maxSize.${key} must be positive`);
        }
      });

      const footprint = placementSlotFootprint(slot);
      if (!boundsContainBounds(room.bounds, footprint)) {
        addFailure(`${slot.id} floor slot marker must stay inside ${slot.roomId} bounds`);
      }

      if (slot.roomId !== 'central-route' && doBoundsOverlap(footprint, requirements.rooms['central-route'].bounds)) {
        addFailure(`${slot.id} floor slot marker must not overlap central-route`);
      }

      requirements.objectives.route.forEach(objective => {
        const objectiveFootprint = {
          x1: objective.position.x - 0.32,
          y1: objective.position.y - 0.32,
          x2: objective.position.x + 0.32,
          y2: objective.position.y + 0.32
        };
        if (!doBoundsOverlap(footprint, objectiveFootprint)) return;
        if (slot.intendedObjectiveId !== objective.id) {
          addFailure(`${slot.id} must not overlap objective ${objective.id} unless intendedObjectiveId matches`);
        }
      });
    });
  }

  const placementPreview = requirements.placementPreview;
  if (!placementPreview) {
    addFailure('requirements.placementPreview must exist for preview marker mode');
  } else {
    if (placementPreview.mazeLitePlacementPreview !== true) {
      addFailure('placementPreview.mazeLitePlacementPreview must be true');
    }
    if (placementPreview.mazeLitePhase1Enabled !== false) {
      addFailure('placementPreview.mazeLitePhase1Enabled must be false');
    }
    if (placementPreview.wallPlacementMode !== 'preview-markers-only') {
      addFailure('placementPreview.wallPlacementMode must be preview-markers-only');
    }

    const markerRules = placementPreview.markerRules ?? {};
    if (markerRules.renderAs !== 'floor-marker') addFailure('placementPreview marker renderAs must be floor-marker');
    if (markerRules.status !== 'pending-user-visual-approval') addFailure('placementPreview marker status must be pending-user-visual-approval');
    if (markerRules.collision !== false) addFailure('placementPreview markers must be collision false');
    if (markerRules.blocking !== false) addFailure('placementPreview markers must be blocking false');
    if (markerRules.approved !== false) addFailure('placementPreview markers must be approved false');
    if (markerRules.maxHeight !== 0.05) addFailure('placementPreview marker maxHeight must be 0.05');

    const expectedLabels = ['W1', 'W2', 'W3', 'W4'];
    if (!Array.isArray(placementPreview.candidates) || placementPreview.candidates.length !== 4) {
      addFailure('placementPreview.candidates must contain exactly 4 preview markers');
    } else {
      placementPreview.candidates.forEach((candidate, index) => {
        const room = requirements.rooms?.[candidate.targetRoomId];
        if (!room) {
          addFailure(`${candidate.id} targetRoomId ${candidate.targetRoomId} is not defined in requirements.rooms`);
          return;
        }

        if (candidate.label !== expectedLabels[index]) addFailure(`${candidate.id} label must be ${expectedLabels[index]}`);
        if (candidate.status !== 'pending-user-visual-approval') addFailure(`${candidate.id} status must be pending-user-visual-approval`);
        if (candidate.renderAs !== 'floor-marker') addFailure(`${candidate.id} renderAs must be floor-marker`);
        if (candidate.collision !== false) addFailure(`${candidate.id} collision must be false`);
        if (candidate.blocking !== false) addFailure(`${candidate.id} blocking must be false`);
        if (candidate.approved !== false) addFailure(`${candidate.id} approved must be false`);

        const footprint = previewCandidateFootprint(candidate);
        if (!boundsContainBounds(room.bounds, footprint)) {
          addFailure(`${candidate.id} preview marker must stay inside ${candidate.targetRoomId} bounds`);
        }

        if (doBoundsOverlap(footprint, requirements.rooms['central-route'].bounds)) {
          addFailure(`${candidate.id} preview marker must not overlap central-route`);
        }

        requirements.objectives.route.forEach(objective => {
          const objectiveFootprint = {
            x1: objective.position.x - 0.32,
            y1: objective.position.y - 0.32,
            x2: objective.position.x + 0.32,
            y2: objective.position.y + 0.32
          };
          if (doBoundsOverlap(footprint, objectiveFootprint)) {
            addFailure(`${candidate.id} preview marker must not overlap objective ${objective.id}`);
          }
        });
      });
    }
  }

  const phase1 = requirements.mazeLitePhase1;
  if (!phase1) {
    addFailure('requirements.mazeLitePhase1 must exist for controlled visual dividers');
    return;
  }

  if (phase1.status !== 'paused-until-user-approved-positions') {
    addFailure('requirements.mazeLitePhase1.status must be paused-until-user-approved-positions');
  }

  if (phase1.enabled !== false) {
    addFailure('requirements.mazeLitePhase1.enabled must be false while placement is paused');
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

  if (!Array.isArray(phase1.dividers) || phase1.dividers.length !== 0) {
    addFailure('requirements.mazeLitePhase1.dividers must be empty while placement is paused');
  }

  const placementRules = requirements.mazeLitePlacementRules;
  if (!placementRules) {
    addFailure('requirements.mazeLitePlacementRules must exist while Phase 1 placement is paused');
  } else {
    if (placementRules.phase1Status !== 'paused-until-user-approved-positions') {
      addFailure('mazeLitePlacementRules.phase1Status must be paused-until-user-approved-positions');
    }
    if (placementRules.requireUserApprovedScreenshotPlacement !== true) {
      addFailure('mazeLitePlacementRules.requireUserApprovedScreenshotPlacement must be true');
    }
    if (!Array.isArray(placementRules.forbiddenPlacementNotes) || placementRules.forbiddenPlacementNotes.length < 4) {
      addFailure('mazeLitePlacementRules.forbiddenPlacementNotes must include placement exclusion notes');
    }
  }

  const roomDividerCounts = new Map();
  const disabledProposalDividers = phase1.disabledProposalDividers ?? [];
  disabledProposalDividers.forEach(divider => {
    const room = requirements.rooms?.[divider.roomId];
    if (!room) {
      addFailure(`${divider.id} roomId ${divider.roomId} is not defined in requirements.rooms`);
      return;
    }

    roomDividerCounts.set(divider.roomId, (roomDividerCounts.get(divider.roomId) ?? 0) + 1);

    if (['front-admin-intake', 'toilet', 'central-route'].includes(divider.roomId)) {
      addFailure(`${divider.id} must not be placed in ${divider.roomId}`);
    }

    if (divider.enabled !== false) {
      addFailure(`${divider.id} must remain enabled: false while Phase 1 is paused`);
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
  const expectedDisabledProposals = phase1?.disabledProposalDividers ?? [];

  ensurePattern(levelText, /const\s+mazeLitePhase1Enabled\s*=\s*false\s*;/, 'mazeLitePhase1Enabled must be false while placement is paused');
  ensurePattern(levelText, /const\s+mazeLitePlacementStatus\s*=\s*['"]paused-pending-user-approved-placement['"]\s*;/, 'mazeLitePlacementStatus must be paused-pending-user-approved-placement');
  ensurePattern(levelText, /mazeLitePhase1Enabled\s*,/, 'level export must include mazeLitePhase1Enabled metadata');
  ensurePattern(levelText, /mazeLitePlacementStatus\s*,/, 'level export must include mazeLitePlacementStatus metadata');
  ensurePattern(levelText, /const\s+level1V2MazeLiteDisabledDividerProposals\s*=\s*\[/, 'disabled divider proposals must be retained separately');
  ensurePattern(levelText, /const\s+level1V2MazeLiteVisualDividers\s*=\s*mazeLitePhase1Enabled\s*\?[\s\S]*?:\s*\[\]\s*;/, 'active visual dividers must be gated by mazeLitePhase1Enabled and resolve to [] when paused');
  ensurePattern(levelText, /const\s+level1V2MazeLiteDividers\s*=\s*level1V2MazeLiteVisualDividers\s*;/, 'mazeLiteDividers must use the approved visual divider array');
  ensurePattern(levelText, /const\s+level1V2MazeLiteObstacles\s*=\s*\[\s*\]\s*;/, 'mazeLiteObstacles must remain empty');
  ensurePattern(levelText, /const\s+level1V2MazeLiteVisualDividerProps\s*=\s*level1V2MazeLiteVisualDividers\.map/, 'render props must be derived only from active visual dividers');
  ensurePattern(levelText, /dividerCollisionEnabled\s*:\s*false/, 'officeMazeLite.dividerCollisionEnabled must be false');
  ensurePattern(levelText, /gridWallSegmentsEnabled\s*:\s*false/, 'officeMazeLite.gridWallSegmentsEnabled must be false');
  ensurePattern(levelText, /enabled\s*:\s*mazeLitePhase1Enabled/, 'officeMazeLite.enabled must use the paused safe-mode flag');
  ensurePattern(levelText, /mazeLitePhase1Enabled\s*,[\s\S]*mazeLitePlacementStatus/, 'officeMazeLite must expose paused placement metadata');

  const proposalsBody = findConstArrayBody(levelText, 'level1V2MazeLiteDisabledDividerProposals');
  if (proposalsBody === null) {
    addFailure('level1V2MazeLiteDisabledDividerProposals array was not found');
    return;
  }

  const proposalIdsInArray = [...proposalsBody.matchAll(/id\s*:\s*['"]([^'"]+)['"]/g)].map(match => match[1]);
  const expectedIds = expectedDisabledProposals.map(divider => divider.id);
  if (proposalIdsInArray.length !== expectedDisabledProposals.length) {
    addFailure(`Disabled Maze Lite proposal count must be ${expectedDisabledProposals.length}, found ${proposalIdsInArray.length}`);
  }

  if (JSON.stringify(proposalIdsInArray) !== JSON.stringify(expectedIds)) {
    addFailure(`Disabled Maze Lite proposal IDs must be exactly ${expectedIds.join(', ')}`);
  }

  expectedDisabledProposals.forEach(divider => {
    const snippet = findObjectSnippetById(levelText, divider.id, 1200);
    if (!snippet) {
      addFailure(`Disabled Maze Lite proposal ${divider.id} is missing`);
      return;
    }

    ensurePattern(snippet, /enabled\s*:\s*false\b/, `${divider.id} must remain enabled false`);
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

function validateStaticPlacementPreview(levelText, requirements) {
  const placementPreview = requirements.placementPreview;
  const expectedCandidates = placementPreview?.candidates ?? [];

  ensurePattern(levelText, /const\s+mazeLitePlacementPreview\s*=\s*true\s*;/, 'mazeLitePlacementPreview must be true');
  ensurePattern(levelText, /const\s+wallPlacementMode\s*=\s*['"]preview-markers-only['"]\s*;/, 'wallPlacementMode must be preview-markers-only');
  ensurePattern(levelText, /mazeLitePlacementPreview\s*,/, 'level export must include mazeLitePlacementPreview metadata');
  ensurePattern(levelText, /wallPlacementMode\s*,/, 'level export must include wallPlacementMode metadata');
  ensurePattern(levelText, /placementCandidates\s*:\s*level1V2PlacementCandidates\b/, 'level export must expose placementCandidates');
  ensurePattern(levelText, /const\s+level1V2PlacementCandidates\s*=\s*\[/, 'level1V2PlacementCandidates must be declared');
  ensurePattern(levelText, /const\s+level1V2PlacementCandidateMarkers\s*=\s*level1V2PlacementCandidates\.map/, 'preview marker props must derive only from placementCandidates');
  ensurePattern(levelText, /\.\.\.level1V2PlacementCandidateMarkers/, 'architecture must include only generated placement candidate markers for preview rendering');
  ensurePattern(levelText, /console\.info\('\[MazeMind\] Level 1 V2 Placement Candidates:/, 'DEV log must report placement candidates');

  const candidatesBody = findConstArrayBody(levelText, 'level1V2PlacementCandidates');
  if (candidatesBody === null) {
    addFailure('level1V2PlacementCandidates array was not found');
    return;
  }

  const candidateIdsInArray = [...candidatesBody.matchAll(/id\s*:\s*['"]([^'"]+)['"]/g)].map(match => match[1]);
  const expectedIds = expectedCandidates.map(candidate => candidate.id);
  if (candidateIdsInArray.length !== expectedCandidates.length) {
    addFailure(`Placement preview candidate count must be ${expectedCandidates.length}, found ${candidateIdsInArray.length}`);
  }

  if (JSON.stringify(candidateIdsInArray) !== JSON.stringify(expectedIds)) {
    addFailure(`Placement preview candidate IDs must be exactly ${expectedIds.join(', ')}`);
  }

  expectedCandidates.forEach(candidate => {
    const snippet = findObjectSnippetById(levelText, candidate.id, 900);
    if (!snippet) {
      addFailure(`Placement preview candidate ${candidate.id} is missing`);
      return;
    }

    ensurePattern(snippet, new RegExp(`candidateType\\s*:\\s*['"]${escapeRegExp(candidate.candidateType)}['"]`), `${candidate.id} candidateType must be ${candidate.candidateType}`);
    ensurePattern(snippet, new RegExp(`targetRoomId\\s*:\\s*['"]${escapeRegExp(candidate.targetRoomId)}['"]`), `${candidate.id} targetRoomId must be ${candidate.targetRoomId}`);
    ensurePattern(snippet, new RegExp(`label\\s*:\\s*['"]${escapeRegExp(candidate.label)}['"]`), `${candidate.id} label must be ${candidate.label}`);
    ensurePattern(snippet, new RegExp(`position\\s*:\\s*\\{\\s*x\\s*:\\s*${escapeRegExp(candidate.position.x)}\\s*,\\s*y\\s*:\\s*${escapeRegExp(candidate.position.y)}\\s*\\}`), `${candidate.id} position must remain ${JSON.stringify(candidate.position)}`);
    ensurePattern(snippet, /status\s*:\s*['"]pending-user-visual-approval['"]/, `${candidate.id} status must be pending-user-visual-approval`);
    ensurePattern(snippet, /renderAs\s*:\s*['"]floor-marker['"]/, `${candidate.id} renderAs must be floor-marker`);
    ensurePattern(snippet, /collision\s*:\s*false\b/, `${candidate.id} collision must be false`);
    ensurePattern(snippet, /blocking\s*:\s*false\b/, `${candidate.id} blocking must be false`);
    ensurePattern(snippet, /approved\s*:\s*false\b/, `${candidate.id} approved must be false`);
  });
}

function validateStaticPlacementSlots(levelText, requirements) {
  const placementSlots = requirements.placementSlots;
  const expectedSlots = placementSlots?.slots ?? [];

  ensurePattern(levelText, /const\s+placementSlotMode\s*=\s*true\s*;/, 'placementSlotMode must be true');
  ensurePattern(levelText, /const\s+placementSlotSource\s*=\s*['"]approved-floor-zones['"]\s*;/, 'placementSlotSource must be approved-floor-zones');
  ensurePattern(levelText, /const\s+placementSlotStatus\s*=\s*['"]preview-only['"]\s*;/, 'placementSlotStatus must be preview-only');
  ensurePattern(levelText, /placementSlotMode\s*,/, 'level export must include placementSlotMode metadata');
  ensurePattern(levelText, /placementSlotSource\s*,/, 'level export must include placementSlotSource metadata');
  ensurePattern(levelText, /placementSlotStatus\s*,/, 'level export must include placementSlotStatus metadata');
  ensurePattern(levelText, /placementSlots\s*:\s*level1V2PlacementSlots\b/, 'level export must expose placementSlots');
  ensurePattern(levelText, /const\s+level1V2PlacementSlots\s*=\s*\[/, 'level1V2PlacementSlots must be declared');
  ensurePattern(levelText, /const\s+level1V2PlacementSlotMarkers\s*=\s*level1V2PlacementSlots\.map/, 'slot marker props must derive only from placementSlots');
  ensurePattern(levelText, /\.\.\.level1V2PlacementSlotMarkers/, 'architecture must include generated placement slot markers');
  ensurePattern(levelText, /console\.info\('\[MazeMind\] Level 1 V2 Placement Slots:/, 'DEV log must report placement slots');

  const slotsBody = findConstArrayBody(levelText, 'level1V2PlacementSlots');
  if (slotsBody === null) {
    addFailure('level1V2PlacementSlots array was not found');
    return;
  }

  const slotIdsInArray = [...slotsBody.matchAll(/id\s*:\s*['"]([^'"]+)['"]/g)].map(match => match[1]);
  const expectedIds = expectedSlots.map(slot => slot.id);
  if (slotIdsInArray.length !== expectedSlots.length) {
    addFailure(`Placement slot count must be ${expectedSlots.length}, found ${slotIdsInArray.length}`);
  }

  if (JSON.stringify(slotIdsInArray) !== JSON.stringify(expectedIds)) {
    addFailure(`Placement slot IDs must be exactly ${expectedIds.join(', ')}`);
  }

  expectedSlots.forEach(slot => {
    const snippet = findObjectSnippetById(levelText, slot.id, 1300);
    if (!snippet) {
      addFailure(`Placement slot ${slot.id} is missing`);
      return;
    }

    ensurePattern(snippet, new RegExp(`roomId\\s*:\\s*['"]${escapeRegExp(slot.roomId)}['"]`), `${slot.id} roomId must be ${slot.roomId}`);
    ensurePattern(snippet, new RegExp(`code\\s*:\\s*['"]${escapeRegExp(slot.code)}['"]`), `${slot.id} code must be ${slot.code}`);
    ensurePattern(snippet, new RegExp(`slotType\\s*:\\s*['"]${escapeRegExp(slot.slotType)}['"]`), `${slot.id} slotType must be ${slot.slotType}`);
    ensurePattern(snippet, new RegExp(`label\\s*:\\s*['"]${escapeRegExp(slot.label)}['"]`), `${slot.id} label must be ${slot.label}`);
    ensurePattern(snippet, new RegExp(`position\\s*:\\s*\\{\\s*x\\s*:\\s*${numberPattern(slot.position.x)}\\s*,\\s*y\\s*:\\s*${numberPattern(slot.position.y)}\\s*\\}`), `${slot.id} position must remain ${JSON.stringify(slot.position)}`);
    ensurePattern(snippet, new RegExp(`maxSize\\s*:\\s*\\{\\s*width\\s*:\\s*${numberPattern(slot.maxSize.width)}\\s*,\\s*depth\\s*:\\s*${numberPattern(slot.maxSize.depth)}\\s*,\\s*height\\s*:\\s*${numberPattern(slot.maxSize.height)}\\s*\\}`), `${slot.id} maxSize must remain approved`);
    ensurePattern(snippet, /collisionAllowed\s*:\s*false\b/, `${slot.id} collisionAllowed must be false`);
    ensurePattern(snippet, /approved\s*:\s*false\b/, `${slot.id} approved must be false`);
    ensurePattern(snippet, /status\s*:\s*['"]pending-user-visual-approval['"]/, `${slot.id} status must be pending-user-visual-approval`);
    ensurePattern(snippet, /renderAs\s*:\s*['"]floor-slot-marker['"]/, `${slot.id} renderAs must be floor-slot-marker`);
    slot.allowedAssetTypes.forEach(assetType => {
      ensurePattern(snippet, new RegExp(`['"]${escapeRegExp(assetType)}['"]`), `${slot.id} must include allowed asset type ${assetType}`);
    });
    if (slot.intendedObjectiveId) {
      ensurePattern(snippet, new RegExp(`intendedObjectiveId\\s*:\\s*['"]${escapeRegExp(slot.intendedObjectiveId)}['"]`), `${slot.id} intendedObjectiveId must be ${slot.intendedObjectiveId}`);
    }
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
  validateStaticPlacementPreview(levelText, requirements);
  validateStaticPlacementSlots(levelText, requirements);

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
