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
const svgPatternPath = path.join(
  repoRoot,
  'frontend',
  'src',
  'maps',
  'requirements',
  'level1V2-svg-pattern.json'
);
const svgPatternPlanPath = path.join(
  repoRoot,
  'frontend',
  'src',
  'maps',
  'requirements',
  'level1V2-svg-pattern-conversion-plan.md'
);
const svgSourcePath = path.join(repoRoot, 'final.svg');
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

function sameOrderedValues(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
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

function countMatches(text, pattern) {
  return [...text.matchAll(pattern)].length;
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

function isFinitePoint(point) {
  return Number.isFinite(point?.x) && Number.isFinite(point?.y);
}

function validateCandidateApproval(candidate, label) {
  if (candidate.approved !== false) addFailure(`${label} approved must be false by default`);
}

function validateCandidateRuntimeRoomId(roomId, roomIds, label) {
  if (roomId === 'secondary-office') {
    addFailure(`${label} must use secondary-workstation instead of secondary-office`);
    return;
  }

  if (!roomIds.has(roomId)) {
    addFailure(`${label} roomId ${roomId} is not defined in requirements.rooms`);
  }
}

function validateSvgPatternRequirementsEntry(requirements) {
  const svgPattern = requirements.svgPattern;
  if (!svgPattern) {
    addFailure('requirements.svgPattern must reference the final.svg conversion guardrail');
    return;
  }

  if (svgPattern.source !== 'final.svg') addFailure('requirements.svgPattern.source must be final.svg');
  if (svgPattern.patternJson !== 'level1V2-svg-pattern.json') addFailure('requirements.svgPattern.patternJson must be level1V2-svg-pattern.json');
  if (svgPattern.conversionPlan !== 'level1V2-svg-pattern-conversion-plan.md') addFailure('requirements.svgPattern.conversionPlan must be level1V2-svg-pattern-conversion-plan.md');
  if (svgPattern.status !== 'pattern-reference') addFailure('requirements.svgPattern.status must be pattern-reference');
  if (svgPattern.directImplementationAllowed !== false) addFailure('requirements.svgPattern.directImplementationAllowed must be false');
  if (svgPattern.requiresUserApprovalBeforeConversion !== true) addFailure('requirements.svgPattern.requiresUserApprovalBeforeConversion must be true');
  if (!sameOrderedValues(svgPattern.approvedObjectConversions ?? [], ['A01'])) {
    addFailure('requirements.svgPattern.approvedObjectConversions must be exactly A01');
  }
  if (svgPattern.linePreviewOnly !== true) addFailure('requirements.svgPattern.linePreviewOnly must be true');
  if (!Array.isArray(svgPattern.rules) || svgPattern.rules.length < 5) {
    addFailure('requirements.svgPattern.rules must include SVG conversion guardrails');
  }
}

function validateSvgPattern(pattern, requirements, levelText, planText, sourceSvgText) {
  const roomIds = new Set(Object.keys(requirements.rooms ?? {}));

  if (!sourceSvgText.includes('<svg')) {
    addFailure('final.svg must be present at the repository root and contain an SVG document');
  }
  [
    'front-admin-intake',
    'secondary-office',
    'A-BAY-WEST',
    'C-DIV-01',
    'F-RACK-01',
    'D-HINT-01',
    'H-BAY-01',
    'A01',
    'G02'
  ].forEach(needle => {
    if (!sourceSvgText.includes(needle)) {
      addFailure(`final.svg must include source pattern label ${needle}`);
    }
  });

  if (!planText.includes('# Level 1 V2 SVG Pattern Conversion Plan')) {
    addFailure('level1V2-svg-pattern-conversion-plan.md must include the required title');
  }
  if (!planText.includes('final.svg')) {
    addFailure('level1V2-svg-pattern-conversion-plan.md must identify final.svg as the source');
  }
  if (!planText.includes('Direct implementation from the SVG is forbidden')) {
    addFailure('conversion plan must forbid direct SVG implementation');
  }

  if (pattern.source !== 'final.svg') addFailure('svg pattern source must be final.svg');
  if (pattern.status !== 'pattern-reference') addFailure('svg pattern status must be pattern-reference');
  if (pattern.directImplementationAllowed !== false) addFailure('svg pattern directImplementationAllowed must be false');
  if (pattern.requiresUserApprovalBeforeConversion !== true) addFailure('svg pattern requiresUserApprovalBeforeConversion must be true');

  const conversionRules = pattern.conversionRules ?? {};
  if (conversionRules.allowDirectWallImplementation !== false) addFailure('svg conversionRules.allowDirectWallImplementation must be false');
  if (conversionRules.allowCollision !== false) addFailure('svg conversionRules.allowCollision must be false');
  if (conversionRules.allowStructuralWalls !== false) addFailure('svg conversionRules.allowStructuralWalls must be false');
  if (conversionRules.allowDoors !== false) addFailure('svg conversionRules.allowDoors must be false');
  if (conversionRules.allowObjectConversion !== false) addFailure('svg conversionRules.allowObjectConversion must be false');
  if (!sameOrderedValues(conversionRules.approvedObjectConversions ?? [], ['A01'])) {
    addFailure('svg conversionRules.approvedObjectConversions must be exactly A01');
  }
  if (conversionRules.linePreviewOnly !== true) addFailure('svg conversionRules.linePreviewOnly must be true');

  const roomMapping = pattern.roomMapping ?? {};
  if (roomMapping.G?.runtimeRoomId !== 'secondary-workstation') {
    addFailure('svg roomMapping.G must map to secondary-workstation');
  }
  if (roomMapping['secondary-office']?.runtimeRoomId !== 'secondary-workstation') {
    addFailure('svg roomMapping.secondary-office must map to secondary-workstation');
  }
  Object.entries(roomMapping).forEach(([key, mapping]) => {
    if (!roomIds.has(mapping.runtimeRoomId)) {
      addFailure(`svg roomMapping.${key}.runtimeRoomId ${mapping.runtimeRoomId} is not defined in requirements.rooms`);
    }
  });

  const expectedAccessIds = [
    'A_TO_B',
    'A_TO_R',
    'B_TO_E',
    'E_TO_R',
    'F_TO_R',
    'R_TO_C',
    'R_TO_D',
    'D_TO_H',
    'H_TO_EXIT'
  ];
  const accessCandidates = pattern.accessCandidates ?? [];
  if (!Array.isArray(accessCandidates) || !sameOrderedValues(accessCandidates.map(candidate => candidate.id), expectedAccessIds)) {
    addFailure(`svg accessCandidates IDs must be exactly ${expectedAccessIds.join(', ')}`);
  }

  accessCandidates.forEach(candidate => {
    validateCandidateApproval(candidate, `access candidate ${candidate.id}`);
    if (candidate.implementationStatus !== 'metadata-only') {
      addFailure(`access candidate ${candidate.id} implementationStatus must be metadata-only`);
    }
    if (candidate.from === 'secondary-office' || candidate.to === 'secondary-office') {
      addFailure(`access candidate ${candidate.id} must not use secondary-office as a runtime room ID`);
    }
    if (!roomIds.has(candidate.from)) {
      addFailure(`access candidate ${candidate.id} from ${candidate.from} is not a known room`);
    }
    if (candidate.to !== 'exit / future level 2' && !roomIds.has(candidate.to)) {
      addFailure(`access candidate ${candidate.id} to ${candidate.to} is not a known room or final exit`);
    }
    if (!isFinitePoint(candidate.sourceGap?.start) || !isFinitePoint(candidate.sourceGap?.end)) {
      addFailure(`access candidate ${candidate.id} must include finite sourceGap start and end`);
    }
  });

  const expectedObjectIds = [
    'A01',
    'B01',
    'E01',
    'C01',
    'C02',
    'C03',
    'C04',
    'D01',
    'F01',
    'F02',
    'H01',
    'G01',
    'G02'
  ];
  const objectCandidates = pattern.objectCandidates ?? [];
  if (!Array.isArray(objectCandidates) || !sameOrderedValues(objectCandidates.map(candidate => candidate.id), expectedObjectIds)) {
    addFailure(`svg objectCandidates IDs must be exactly ${expectedObjectIds.join(', ')}`);
  }

  objectCandidates.forEach(candidate => {
    const isApprovedA01Conversion = candidate.id === 'A01';

    if (isApprovedA01Conversion) {
      if (candidate.approved !== true) addFailure('object candidate A01 approved must be true for this controlled conversion');
      if (candidate.implementationStatus !== 'converted-mvp-visual') {
        addFailure('object candidate A01 implementationStatus must be converted-mvp-visual');
      }
      if (candidate.convertedAs !== 'mvp-front-admin-intake-counter') {
        addFailure('object candidate A01 convertedAs must be mvp-front-admin-intake-counter');
      }
      if (candidate.blocking !== false) addFailure('object candidate A01 blocking must be false');
    } else {
      validateCandidateApproval(candidate, `object candidate ${candidate.id}`);
      if (candidate.implementationStatus === 'converted-mvp-visual') {
        addFailure(`object candidate ${candidate.id} must not be converted in the A01-only pass`);
      }
      if (candidate.blocking !== undefined && candidate.blocking !== false) {
        addFailure(`object candidate ${candidate.id} blocking must not be true`);
      }
    }

    validateCandidateRuntimeRoomId(candidate.roomId, roomIds, `object candidate ${candidate.id}`);
    if (candidate.collision !== false) addFailure(`object candidate ${candidate.id} collision must be false`);
    if (!candidate.objectType) addFailure(`object candidate ${candidate.id} objectType must not be empty`);
    if (!candidate.role) addFailure(`object candidate ${candidate.id} role must not be empty`);
    if (!candidate.implementationStatus) addFailure(`object candidate ${candidate.id} implementationStatus must not be empty`);
  });

  const expectedWallIds = [
    'A-BAY-WEST',
    'A-BAY-NORTH',
    'A-BAY-SOUTH',
    'C-DIV-01',
    'F-RACK-01',
    'F-RACK-02',
    'D-HINT-01',
    'H-BAY-01'
  ];
  const wallLineCandidates = pattern.wallLineCandidates ?? [];
  if (!Array.isArray(wallLineCandidates) || !sameOrderedValues(wallLineCandidates.map(candidate => candidate.id), expectedWallIds)) {
    addFailure(`svg wallLineCandidates IDs must be exactly ${expectedWallIds.join(', ')}`);
  }

  wallLineCandidates.forEach(candidate => {
    validateCandidateApproval(candidate, `wall line candidate ${candidate.id}`);
    validateCandidateRuntimeRoomId(candidate.roomId, roomIds, `wall line candidate ${candidate.id}`);

    if (!candidate.wallType) addFailure(`wall line candidate ${candidate.id} wallType must not be empty`);
    if (!isFinitePoint(candidate.start) || !isFinitePoint(candidate.end)) {
      addFailure(`wall line candidate ${candidate.id} must include finite line start and end`);
    } else if (candidate.start.x === candidate.end.x && candidate.start.y === candidate.end.y) {
      addFailure(`wall line candidate ${candidate.id} must be line-based, not point-based`);
    }
    if (!['horizontal', 'vertical'].includes(candidate.orientation)) {
      addFailure(`wall line candidate ${candidate.id} orientation must be horizontal or vertical`);
    }
    if (!Number.isFinite(candidate.thickness) || candidate.thickness <= 0) {
      addFailure(`wall line candidate ${candidate.id} thickness must be a positive number`);
    }
    if (!Number.isFinite(candidate.height) || candidate.height !== 0) {
      addFailure(`wall line candidate ${candidate.id} height must be 0 while preview-only`);
    }
    if (candidate.solid !== false) addFailure(`wall line candidate ${candidate.id} solid must be false`);
    if (candidate.collision !== false) addFailure(`wall line candidate ${candidate.id} collision must be false`);
    if (candidate.blocking !== false) addFailure(`wall line candidate ${candidate.id} blocking must be false`);
    if (candidate.implementationStatus !== 'line-preview-only') {
      addFailure(`wall line candidate ${candidate.id} implementationStatus must be line-preview-only`);
    }
    if (candidate.approvalRequired !== true) {
      addFailure(`wall line candidate ${candidate.id} approvalRequired must be true`);
    }
    if (levelText.includes(candidate.id)) {
      addFailure(`wall line candidate ${candidate.id} must not be converted or referenced in level1V2.js`);
    }
  });
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

  validateSvgPatternRequirementsEntry(requirements);

  const placementSlots = requirements.placementSlots;
  if (!placementSlots) {
    addFailure('requirements.placementSlots must exist for rejected placement slot guardrails');
  } else {
    if (placementSlots.enabled !== false) addFailure('placementSlots.enabled must be false after user rejection');
    if (placementSlots.mode !== false) addFailure('placementSlots.mode must be false after user rejection');
    if (placementSlots.source !== 'approved-floor-zones') addFailure('placementSlots.source must be approved-floor-zones');
    if (placementSlots.status !== 'rejected-by-user') addFailure('placementSlots.status must be rejected-by-user');
    if (placementSlots.requireSlotForNewObjects !== true) addFailure('placementSlots.requireSlotForNewObjects must remain true');
    if (placementSlots.requireSlotForNewDividers !== true) addFailure('placementSlots.requireSlotForNewDividers must remain true');
    if (!Array.isArray(placementSlots.slots) || placementSlots.slots.length !== 0) {
      addFailure('placementSlots.slots must be empty after user rejection');
    }

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
    const rejectedSlots = placementSlots.rejectedSlots ?? [];
    const rejectedSlotIds = rejectedSlots.map(slot => slot.id);

    if (!Array.isArray(rejectedSlots) || rejectedSlots.length !== expectedSlotIds.length) {
      addFailure(`placementSlots.rejectedSlots must contain exactly ${expectedSlotIds.length} rejected slots`);
    } else if (JSON.stringify(rejectedSlotIds) !== JSON.stringify(expectedSlotIds)) {
      addFailure(`rejected placement slot IDs must be exactly ${expectedSlotIds.join(', ')}`);
    }

    rejectedSlots.forEach(slot => {
      const room = requirements.rooms?.[slot.roomId];
      if (!room) {
        addFailure(`${slot.id} roomId ${slot.roomId} is not defined in requirements.rooms`);
        return;
      }

      if (slot.enabled !== false) addFailure(`${slot.id} must be enabled false`);
      if (slot.rejected !== true) addFailure(`${slot.id} must be rejected true`);
      if (slot.approved !== false) addFailure(`${slot.id} approved must be false`);
      if (slot.status !== 'rejected-by-user') addFailure(`${slot.id} status must be rejected-by-user`);
      if (slot.collisionAllowed !== false) addFailure(`${slot.id} collisionAllowed must be false`);
      if (slot.renderAs !== 'floor-slot-marker') addFailure(`${slot.id} renderAs must remain floor-slot-marker`);
      if (slot.code !== room.code) addFailure(`${slot.id} code must be ${room.code}`);
      if (!['object', 'divider'].includes(slot.slotType)) addFailure(`${slot.id} slotType must be object or divider`);
      if (!slot.label) addFailure(`${slot.id} label must not be empty`);
    });
  }

  const placementPreview = requirements.placementPreview;
  if (!placementPreview) {
    addFailure('requirements.placementPreview must exist for rejected marker guardrails');
  } else {
    if (placementPreview.mazeLitePlacementPreview !== false) {
      addFailure('placementPreview.mazeLitePlacementPreview must be false after user rejection');
    }
    if (placementPreview.mazeLitePhase1Enabled !== false) {
      addFailure('placementPreview.mazeLitePhase1Enabled must be false');
    }
    if (placementPreview.wallPlacementMode !== 'disabled') {
      addFailure('placementPreview.wallPlacementMode must be disabled after user rejection');
    }
    if (!Array.isArray(placementPreview.candidates) || placementPreview.candidates.length !== 0) {
      addFailure('placementPreview.candidates must be empty after user rejection');
    }

    const markerRules = placementPreview.markerRules ?? {};
    if (markerRules.renderAs !== 'floor-marker') addFailure('placementPreview marker renderAs must be floor-marker');
    if (markerRules.status !== 'rejected-by-user') addFailure('placementPreview marker status must be rejected-by-user');
    if (markerRules.collision !== false) addFailure('placementPreview markers must be collision false');
    if (markerRules.blocking !== false) addFailure('placementPreview markers must be blocking false');
    if (markerRules.approved !== false) addFailure('placementPreview markers must be approved false');
    if (markerRules.enabled !== false) addFailure('placementPreview markers must be enabled false');
    if (markerRules.rejected !== true) addFailure('placementPreview markers must be rejected true');
    if (markerRules.maxHeight !== 0.05) addFailure('placementPreview marker maxHeight must be 0.05');

    const expectedLabels = ['W1', 'W2', 'W3', 'W4'];
    const expectedCandidateIds = ['candidate-c-divider-01', 'candidate-c-divider-02', 'candidate-f-archive-01', 'candidate-f-archive-02'];
    const rejectedCandidates = placementPreview.rejectedCandidates ?? [];
    const rejectedCandidateIds = rejectedCandidates.map(candidate => candidate.id);
    if (!Array.isArray(rejectedCandidates) || rejectedCandidates.length !== expectedCandidateIds.length) {
      addFailure(`placementPreview.rejectedCandidates must contain exactly ${expectedCandidateIds.length} rejected markers`);
    } else if (JSON.stringify(rejectedCandidateIds) !== JSON.stringify(expectedCandidateIds)) {
      addFailure(`rejected placement candidate IDs must be exactly ${expectedCandidateIds.join(', ')}`);
    }

    rejectedCandidates.forEach((candidate, index) => {
      if (!requirements.rooms?.[candidate.targetRoomId]) {
        addFailure(`${candidate.id} targetRoomId ${candidate.targetRoomId} is not defined in requirements.rooms`);
        return;
      }

      if (candidate.enabled !== false) addFailure(`${candidate.id} must be enabled false`);
      if (candidate.rejected !== true) addFailure(`${candidate.id} must be rejected true`);
      if (candidate.label !== expectedLabels[index]) addFailure(`${candidate.id} label must be ${expectedLabels[index]}`);
      if (candidate.status !== 'rejected-by-user') addFailure(`${candidate.id} status must be rejected-by-user`);
      if (candidate.renderAs !== 'floor-marker') addFailure(`${candidate.id} renderAs must be floor-marker`);
      if (candidate.collision !== false) addFailure(`${candidate.id} collision must be false`);
      if (candidate.blocking !== false) addFailure(`${candidate.id} blocking must be false`);
      if (candidate.approved !== false) addFailure(`${candidate.id} approved must be false`);
    });
  }

  const placementApproval = requirements.placementApproval;
  if (!placementApproval) {
    addFailure('requirements.placementApproval must exist after marker rejection');
  } else {
    if (placementApproval.currentStatus !== 'all-current-markers-rejected') addFailure('placementApproval.currentStatus must be all-current-markers-rejected');
    if (placementApproval.requireManualTopDownApproval !== true) addFailure('placementApproval.requireManualTopDownApproval must be true');
    if (placementApproval.doNotGenerateSlotsFromBoundsOnly !== true) addFailure('placementApproval.doNotGenerateSlotsFromBoundsOnly must be true');
    if (placementApproval.doNotConvertUnapprovedMarkers !== true) addFailure('placementApproval.doNotConvertUnapprovedMarkers must be true');
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
  const expectedCandidates = placementPreview?.rejectedCandidates ?? [];

  ensurePattern(levelText, /const\s+mazeLitePlacementPreview\s*=\s*false\s*;/, 'mazeLitePlacementPreview must be false after user rejection');
  ensurePattern(levelText, /const\s+wallPlacementMode\s*=\s*['"]disabled['"]\s*;/, 'wallPlacementMode must be disabled after user rejection');
  ensurePattern(levelText, /mazeLitePlacementPreview\s*,/, 'level export must include mazeLitePlacementPreview metadata');
  ensurePattern(levelText, /wallPlacementMode\s*,/, 'level export must include wallPlacementMode metadata');
  ensurePattern(levelText, /placementCandidates\s*:\s*level1V2PlacementCandidates\b/, 'level export must expose placementCandidates');
  ensurePattern(levelText, /const\s+level1V2RejectedPlacementCandidates\s*=\s*\[/, 'rejected placement candidates must be retained separately');
  ensurePattern(levelText, /const\s+level1V2PlacementCandidates\s*=\s*\[\s*\]\s*;/, 'level1V2PlacementCandidates must be an empty active array after user rejection');
  ensurePattern(levelText, /const\s+level1V2PlacementCandidateMarkers\s*=\s*level1V2PlacementCandidates\.map/, 'preview marker props must derive only from placementCandidates');
  ensurePattern(levelText, /\.\.\.level1V2PlacementCandidateMarkers/, 'architecture may only include candidate markers generated from the empty active array');
  ensurePattern(levelText, /no active placement markers render/, 'DEV log must report rejected placement markers are inactive');

  const candidatesBody = findConstArrayBody(levelText, 'level1V2PlacementCandidates');
  if (candidatesBody === null) {
    addFailure('level1V2PlacementCandidates array was not found');
    return;
  }

  const candidateIdsInArray = [...candidatesBody.matchAll(/id\s*:\s*['"]([^'"]+)['"]/g)].map(match => match[1]);
  if (candidateIdsInArray.length !== 0) {
    addFailure(`Active placement candidate count must be 0 after user rejection, found ${candidateIdsInArray.length}`);
  }

  const rejectedBody = findConstArrayBody(levelText, 'level1V2RejectedPlacementCandidates');
  if (rejectedBody === null) {
    addFailure('level1V2RejectedPlacementCandidates array was not found');
    return;
  }

  const rejectedIdsInArray = [...rejectedBody.matchAll(/id\s*:\s*['"]([^'"]+)['"]/g)].map(match => match[1]);
  const expectedIds = expectedCandidates.map(candidate => candidate.id);
  if (rejectedIdsInArray.length !== expectedCandidates.length) {
    addFailure(`Rejected placement candidate count must be ${expectedCandidates.length}, found ${rejectedIdsInArray.length}`);
  }

  if (JSON.stringify(rejectedIdsInArray) !== JSON.stringify(expectedIds)) {
    addFailure(`Rejected placement candidate IDs must be exactly ${expectedIds.join(', ')}`);
  }

  expectedCandidates.forEach(candidate => {
    const snippet = findObjectSnippetById(levelText, candidate.id, 900);
    if (!snippet) {
      addFailure(`Rejected placement candidate ${candidate.id} is missing`);
      return;
    }

    ensurePattern(snippet, /enabled\s*:\s*false\b/, `${candidate.id} must be enabled false`);
    ensurePattern(snippet, /rejected\s*:\s*true\b/, `${candidate.id} must be rejected true`);
    ensurePattern(snippet, new RegExp(`candidateType\\s*:\\s*['"]${escapeRegExp(candidate.candidateType)}['"]`), `${candidate.id} candidateType must be ${candidate.candidateType}`);
    ensurePattern(snippet, new RegExp(`targetRoomId\\s*:\\s*['"]${escapeRegExp(candidate.targetRoomId)}['"]`), `${candidate.id} targetRoomId must be ${candidate.targetRoomId}`);
    ensurePattern(snippet, new RegExp(`label\\s*:\\s*['"]${escapeRegExp(candidate.label)}['"]`), `${candidate.id} label must be ${candidate.label}`);
    ensurePattern(snippet, new RegExp(`position\\s*:\\s*\\{\\s*x\\s*:\\s*${escapeRegExp(candidate.position.x)}\\s*,\\s*y\\s*:\\s*${escapeRegExp(candidate.position.y)}\\s*\\}`), `${candidate.id} position must remain ${JSON.stringify(candidate.position)}`);
    ensurePattern(snippet, /status\s*:\s*['"]rejected-by-user['"]/, `${candidate.id} status must be rejected-by-user`);
    ensurePattern(snippet, /renderAs\s*:\s*['"]floor-marker['"]/, `${candidate.id} renderAs must be floor-marker`);
    ensurePattern(snippet, /collision\s*:\s*false\b/, `${candidate.id} collision must be false`);
    ensurePattern(snippet, /blocking\s*:\s*false\b/, `${candidate.id} blocking must be false`);
    ensurePattern(snippet, /approved\s*:\s*false\b/, `${candidate.id} approved must be false`);
  });
}

function validateStaticPlacementSlots(levelText, requirements) {
  const placementSlots = requirements.placementSlots;
  const expectedSlots = placementSlots?.rejectedSlots ?? [];

  ensurePattern(levelText, /const\s+placementSlotMode\s*=\s*false\s*;/, 'placementSlotMode must be false after user rejection');
  ensurePattern(levelText, /const\s+placementSlotSource\s*=\s*['"]approved-floor-zones['"]\s*;/, 'placementSlotSource must be approved-floor-zones');
  ensurePattern(levelText, /const\s+placementSlotStatus\s*=\s*['"]rejected-by-user['"]\s*;/, 'placementSlotStatus must be rejected-by-user');
  ensurePattern(levelText, /placementSlotMode\s*,/, 'level export must include placementSlotMode metadata');
  ensurePattern(levelText, /placementSlotSource\s*,/, 'level export must include placementSlotSource metadata');
  ensurePattern(levelText, /placementSlotStatus\s*,/, 'level export must include placementSlotStatus metadata');
  ensurePattern(levelText, /placementSlots\s*:\s*level1V2PlacementSlots\b/, 'level export must expose placementSlots');
  ensurePattern(levelText, /const\s+level1V2RejectedPlacementSlots\s*=\s*\[/, 'rejected placement slots must be retained separately');
  ensurePattern(levelText, /const\s+level1V2PlacementSlots\s*=\s*\[\s*\]\s*;/, 'level1V2PlacementSlots must be an empty active array after user rejection');
  ensurePattern(levelText, /const\s+level1V2PlacementSlotMarkers\s*=\s*level1V2PlacementSlots\.map/, 'slot marker props must derive only from placementSlots');
  ensurePattern(levelText, /\.\.\.level1V2PlacementSlotMarkers/, 'architecture may only include slot markers generated from the empty active array');
  ensurePattern(levelText, /no active placement markers render/, 'DEV log must report rejected placement markers are inactive');

  const slotsBody = findConstArrayBody(levelText, 'level1V2PlacementSlots');
  if (slotsBody === null) {
    addFailure('level1V2PlacementSlots array was not found');
    return;
  }

  const slotIdsInArray = [...slotsBody.matchAll(/id\s*:\s*['"]([^'"]+)['"]/g)].map(match => match[1]);
  if (slotIdsInArray.length !== 0) {
    addFailure(`Active placement slot count must be 0 after user rejection, found ${slotIdsInArray.length}`);
  }

  const rejectedBody = findConstArrayBody(levelText, 'level1V2RejectedPlacementSlots');
  if (rejectedBody === null) {
    addFailure('level1V2RejectedPlacementSlots array was not found');
    return;
  }

  const rejectedIdsInArray = [...rejectedBody.matchAll(/id\s*:\s*['"]([^'"]+)['"]/g)].map(match => match[1]);
  const expectedIds = expectedSlots.map(slot => slot.id);
  if (rejectedIdsInArray.length !== expectedSlots.length) {
    addFailure(`Rejected placement slot count must be ${expectedSlots.length}, found ${rejectedIdsInArray.length}`);
  }

  if (JSON.stringify(rejectedIdsInArray) !== JSON.stringify(expectedIds)) {
    addFailure(`Rejected placement slot IDs must be exactly ${expectedIds.join(', ')}`);
  }

  expectedSlots.forEach(slot => {
    const snippet = findObjectSnippetById(levelText, slot.id, 1300);
    if (!snippet) {
      addFailure(`Rejected placement slot ${slot.id} is missing`);
      return;
    }

    ensurePattern(snippet, /enabled\s*:\s*false\b/, `${slot.id} must be enabled false`);
    ensurePattern(snippet, /rejected\s*:\s*true\b/, `${slot.id} must be rejected true`);
    ensurePattern(snippet, new RegExp(`roomId\\s*:\\s*['"]${escapeRegExp(slot.roomId)}['"]`), `${slot.id} roomId must be ${slot.roomId}`);
    ensurePattern(snippet, new RegExp(`code\\s*:\\s*['"]${escapeRegExp(slot.code)}['"]`), `${slot.id} code must be ${slot.code}`);
    ensurePattern(snippet, new RegExp(`slotType\\s*:\\s*['"]${escapeRegExp(slot.slotType)}['"]`), `${slot.id} slotType must be ${slot.slotType}`);
    ensurePattern(snippet, new RegExp(`label\\s*:\\s*['"]${escapeRegExp(slot.label)}['"]`), `${slot.id} label must be ${slot.label}`);
    ensurePattern(snippet, new RegExp(`position\\s*:\\s*\\{\\s*x\\s*:\\s*${numberPattern(slot.position.x)}\\s*,\\s*y\\s*:\\s*${numberPattern(slot.position.y)}\\s*\\}`), `${slot.id} position must remain ${JSON.stringify(slot.position)}`);
    ensurePattern(snippet, new RegExp(`maxSize\\s*:\\s*\\{\\s*width\\s*:\\s*${numberPattern(slot.maxSize.width)}\\s*,\\s*depth\\s*:\\s*${numberPattern(slot.maxSize.depth)}\\s*,\\s*height\\s*:\\s*${numberPattern(slot.maxSize.height)}\\s*\\}`), `${slot.id} maxSize must remain approved`);
    ensurePattern(snippet, /collisionAllowed\s*:\s*false\b/, `${slot.id} collisionAllowed must be false`);
    ensurePattern(snippet, /approved\s*:\s*false\b/, `${slot.id} approved must be false`);
    ensurePattern(snippet, /status\s*:\s*['"]rejected-by-user['"]/, `${slot.id} status must be rejected-by-user`);
    ensurePattern(snippet, /renderAs\s*:\s*['"]floor-slot-marker['"]/, `${slot.id} renderAs must be floor-slot-marker`);
    slot.allowedAssetTypes.forEach(assetType => {
      ensurePattern(snippet, new RegExp(`['"]${escapeRegExp(assetType)}['"]`), `${slot.id} must include allowed asset type ${assetType}`);
    });
    if (slot.intendedObjectiveId) {
      ensurePattern(snippet, new RegExp(`intendedObjectiveId\\s*:\\s*['"]${escapeRegExp(slot.intendedObjectiveId)}['"]`), `${slot.id} intendedObjectiveId must be ${slot.intendedObjectiveId}`);
    }
  });
}

function validateStaticSvgPatternA01Conversion(levelText, requirements) {
  if (!sameOrderedValues(requirements.svgPattern?.approvedObjectConversions ?? [], ['A01'])) {
    addFailure('Only A01 may be approved for SVG object conversion');
  }

  ensurePattern(levelText, /function\s+createSvgPatternA01IntakeCounter\s*\(/, 'A01 must use a dedicated controlled conversion helper');
  ensurePattern(levelText, /createMvpObject\(\s*['"]A['"]\s*,\s*createSvgPatternA01IntakeCounter\(\)\s*\)/, 'A01 must convert through the existing A-room MVP object slot');
  ensurePattern(levelText, /const\s+level1V2A01ReviewMarkers\s*=\s*\[/, 'A01 review markers must use a dedicated guarded marker array');
  ensurePattern(levelText, /\.\.\.level1V2A01ReviewMarkers\s*,/, 'A01 review markers must be included in architecture');

  if (countMatches(levelText, /id\s*:\s*['"]mvp-front-admin-intake-counter['"]/g) !== 1) {
    addFailure('A01 converted intake counter id must appear exactly once');
  }

  const snippet = findObjectSnippetById(levelText, 'mvp-front-admin-intake-counter', 2600);
  if (!snippet) {
    addFailure('A01 converted intake counter object is missing');
    return;
  }

  ensurePattern(snippet, /roomId\s*:\s*['"]front-admin-intake['"]/, 'A01 roomId must be front-admin-intake');
  ensurePattern(snippet, /x\s*:\s*6\b/, 'A01 x must remain 6');
  ensurePattern(snippet, /y\s*:\s*6\.35\b/, 'A01 y must remain 6.35');
  ensurePattern(snippet, /width\s*:\s*1\.9\b/, 'A01 width must remain 1.9 for visual review');
  ensurePattern(snippet, /depth\s*:\s*0\.7\b/, 'A01 depth must remain 0.7 for visual review');
  ensurePattern(snippet, /size\s*:\s*\{\s*width\s*:\s*1\.9\s*,\s*height\s*:\s*0\.96\s*,\s*depth\s*:\s*0\.7\s*\}/, 'A01 size must remain the approved visual review size');
  ensurePattern(snippet, /topColor\s*:\s*0xf1eee1\b/, 'A01 must keep the brighter topColor for review visibility');
  ensurePattern(snippet, /emissive\s*:\s*0x172828\b/, 'A01 must keep subtle emissive polish');
  ensurePattern(snippet, /emissiveIntensity\s*:\s*0\.045\b/, 'A01 emissiveIntensity must remain subtle');
  ensurePattern(snippet, /source\s*:\s*['"]svg-pattern-A01['"]/, 'A01 must include source svg-pattern-A01');
  ensurePattern(snippet, /svgCandidateId\s*:\s*['"]A01['"]/, 'A01 must include svgCandidateId A01');
  ensurePattern(snippet, /requirementControlled\s*:\s*true\b/, 'A01 must be requirementControlled');
  ensurePattern(snippet, /collision\s*:\s*false\b/, 'A01 collision must be false');
  ensurePattern(snippet, /blocking\s*:\s*false\b/, 'A01 blocking must be false');

  const reviewPadSnippet = findObjectSnippetById(levelText, 'svg-review-pad-A01', 1600);
  if (!reviewPadSnippet) {
    addFailure('A01 temporary review pad is missing');
  } else {
    ensurePattern(reviewPadSnippet, /type\s*:\s*['"]platform['"]/, 'A01 review pad type must be platform');
    ensurePattern(reviewPadSnippet, /roomId\s*:\s*['"]front-admin-intake['"]/, 'A01 review pad roomId must be front-admin-intake');
    ensurePattern(reviewPadSnippet, /targetObjectId\s*:\s*['"]mvp-front-admin-intake-counter['"]/, 'A01 review pad must target the intake counter');
    ensurePattern(reviewPadSnippet, /label\s*:\s*['"]A01 Review Pad['"]/, 'A01 review pad label must be A01 Review Pad');
    ensurePattern(reviewPadSnippet, /x\s*:\s*6\b/, 'A01 review pad x must be 6');
    ensurePattern(reviewPadSnippet, /y\s*:\s*6\.35\b/, 'A01 review pad y must be 6.35');
    ensurePattern(reviewPadSnippet, /width\s*:\s*2\.1\b/, 'A01 review pad width must be 2.1');
    ensurePattern(reviewPadSnippet, /depth\s*:\s*0\.9\b/, 'A01 review pad depth must be 0.9');
    ensurePattern(reviewPadSnippet, /height\s*:\s*0\.045\b/, 'A01 review pad height must be 0.045');
    ensurePattern(reviewPadSnippet, /visualOnly\s*:\s*true\b/, 'A01 review pad must be visualOnly');
    ensurePattern(reviewPadSnippet, /collision\s*:\s*false\b/, 'A01 review pad collision must be false');
    ensurePattern(reviewPadSnippet, /blocking\s*:\s*false\b/, 'A01 review pad blocking must be false');
    ensurePattern(reviewPadSnippet, /reviewOnly\s*:\s*true\b/, 'A01 review pad must be reviewOnly');
    ensurePattern(reviewPadSnippet, /source\s*:\s*['"]svg-pattern-A01['"]/, 'A01 review pad source must be svg-pattern-A01');
    ensurePattern(reviewPadSnippet, /svgCandidateId\s*:\s*['"]A01-review['"]/, 'A01 review pad svgCandidateId must be A01-review');
    ensureNotPattern(reviewPadSnippet, /collisionVolumes\s*:/, 'A01 review pad must not define collisionVolumes');
    ensureNotPattern(reviewPadSnippet, /wallSegments\s*:/, 'A01 review pad must not define wallSegments');
  }

  const reviewLabelSnippet = findObjectSnippetById(levelText, 'svg-review-label-A01', 1200);
  if (reviewLabelSnippet) {
    ensurePattern(reviewLabelSnippet, /type\s*:\s*['"]sign['"]/, 'A01 review label type must be sign');
    ensurePattern(reviewLabelSnippet, /text\s*:\s*['"]A01['"]/, 'A01 review label text must be A01');
    ensurePattern(reviewLabelSnippet, /targetObjectId\s*:\s*['"]mvp-front-admin-intake-counter['"]/, 'A01 review label must target the intake counter');
    ensurePattern(reviewLabelSnippet, /visualOnly\s*:\s*true\b/, 'A01 review label must be visualOnly');
    ensurePattern(reviewLabelSnippet, /collision\s*:\s*false\b/, 'A01 review label collision must be false');
    ensurePattern(reviewLabelSnippet, /blocking\s*:\s*false\b/, 'A01 review label blocking must be false');
    ensurePattern(reviewLabelSnippet, /reviewOnly\s*:\s*true\b/, 'A01 review label must be reviewOnly');
    ensureNotPattern(reviewLabelSnippet, /collisionVolumes\s*:/, 'A01 review label must not define collisionVolumes');
    ensureNotPattern(reviewLabelSnippet, /wallSegments\s*:/, 'A01 review label must not define wallSegments');
  }

  if (countMatches(levelText, /id\s*:\s*['"]svg-review-pad-A01['"]/g) !== 1) {
    addFailure('A01 review pad id must appear exactly once');
  }
  if (countMatches(levelText, /svgCandidateId\s*:\s*['"]A01['"]/g) !== 2) {
    addFailure('A01 svgCandidateId must appear only on the intake counter object and metadata');
  }
  if (countMatches(levelText, /svgCandidateId\s*:\s*['"]A01-review['"]/g) !== 2) {
    addFailure('A01-review svgCandidateId must appear only on the review pad object and metadata');
  }
  if (countMatches(levelText, /source\s*:\s*['"]svg-pattern-A01['"]/g) !== 4) {
    addFailure('svg-pattern-A01 source must appear only on the A01 counter and A01 review pad object metadata');
  }

  ensureNotPattern(levelText, /svgCandidateId\s*:\s*['"](?!A01['"]|A01-review['"])[^'"]+['"]/, 'No SVG object candidate except A01 or the A01 review marker may be referenced');
  ensureNotPattern(levelText, /source\s*:\s*['"]svg-pattern-(?!A01['"])[^'"]+['"]/, 'No SVG pattern source except A01 may be converted');
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
  validateStaticSvgPatternA01Conversion(levelText, requirements);

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
const svgPatternText = readText(svgPatternPath);
const svgPatternPlanText = readText(svgPatternPlanPath);
const svgSourceText = readText(svgSourcePath);
const levelText = readText(levelPath);

let requirements = null;
if (requirementsText) {
  try {
    requirements = JSON.parse(requirementsText);
  } catch (error) {
    addFailure(`Invalid requirements JSON: ${error.message}`);
  }
}

let svgPattern = null;
if (svgPatternText) {
  try {
    svgPattern = JSON.parse(svgPatternText);
  } catch (error) {
    addFailure(`Invalid SVG pattern JSON: ${error.message}`);
  }
}

if (requirements && levelText) {
  validateRequirementsShape(requirements);
  validateStaticMapText(levelText, requirements);
}

if (requirements && svgPattern && levelText && svgPatternPlanText && svgSourceText) {
  validateSvgPattern(svgPattern, requirements, levelText, svgPatternPlanText, svgSourceText);
}

printResults();
