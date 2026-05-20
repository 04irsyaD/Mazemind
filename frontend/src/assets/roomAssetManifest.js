// Room Asset Manifest
//
// This SOP is intentionally meter-based. MazeMind renders on a cell grid
// where CONSTANTS.CELL_SIZE is 3.6 meters, but asset safety is easier to
// review in real-world object dimensions.
//
// targetSizeMeters is the preferred visual size of the real-world object.
// maxSizeMeters is the hard upper bound before the model is considered unsafe.
// placementZones must match existing roomLayoutAnchors zone ids.
// fallbackPrefab must always exist so procedural fallback remains available.
//
// Role separation is intentional and should not be blurred to satisfy a
// temporary placement problem:
// - officeChair is workstation-only; waitingChair is lobby/reception seating.
// - meetingChair is for checkpoint/review table seating only.
// - receptionDesk, intakeDesk, and officeDesk are separate room roles.
// - coffeeTable is waiting-area furniture, not a meetingTable substitute.
// - archiveRack/serverRack storage is not filingCabinet wall furniture.
// - emergency props are hazard/corridor visuals, never office furniture.

export const ROOM_ASSET_MANIFEST_REQUIRED_ROOMS = [
  'front-reception',
  'employee-intake',
  'main-workstation-hall',
  'archive',
  'checkpoint-chamber',
  'wrong-department',
  'utility-break',
  'crusher-corridor',
  'fake-exit',
  'final-route'
];

export const VALIDATION_CATEGORIES = {
  SOP_ERROR: 'SOP_ERROR',
  SOP_WARNING: 'SOP_WARNING',
  PLACEMENT_WARNING: 'PLACEMENT_WARNING',
  DEFERRED_REPAIR: 'DEFERRED_REPAIR',
  MANIFEST_MISMATCH: 'MANIFEST_MISMATCH'
};

export const ASSET_SIZE_STANDARDS = {
  officeChair: {
    targetSizeMeters: [0.65, 1.05, 0.65],
    maxSizeMeters: [0.8, 1.25, 0.85]
  },
  meetingChair: {
    targetSizeMeters: [0.65, 1.0, 0.65],
    maxSizeMeters: [0.85, 1.2, 0.85]
  },
  waitingChair: {
    targetSizeMeters: [0.6, 0.9, 0.65],
    maxSizeMeters: [0.75, 1.1, 0.8]
  },
  officeDesk: {
    targetSizeMeters: [1.4, 0.75, 0.75],
    maxSizeMeters: [1.8, 0.9, 0.9]
  },
  smallOfficeDesk: {
    targetSizeMeters: [1.4, 0.75, 0.75],
    maxSizeMeters: [1.8, 0.9, 0.9]
  },
  receptionDesk: {
    targetSizeMeters: [2.2, 1.05, 0.75],
    maxSizeMeters: [3.2, 1.2, 1.0]
  },
  intakeDesk: {
    targetSizeMeters: [2.4, 1.0, 0.8],
    maxSizeMeters: [3.2, 1.2, 1.0]
  },
  coffeeTable: {
    targetSizeMeters: [1.1, 0.45, 0.6],
    maxSizeMeters: [1.4, 0.55, 0.8]
  },
  meetingTable: {
    targetSizeMeters: [2.2, 0.75, 1.0],
    maxSizeMeters: [2.8, 0.9, 1.3]
  },
  copyMachine: {
    targetSizeMeters: [0.9, 1.1, 0.7],
    maxSizeMeters: [1.2, 1.4, 0.9]
  },
  filingCabinet: {
    targetSizeMeters: [0.8, 1.4, 0.45],
    maxSizeMeters: [1.1, 1.8, 0.65]
  },
  serverRack: {
    targetSizeMeters: [0.8, 1.9, 0.45],
    maxSizeMeters: [1.0, 2.2, 0.7]
  },
  sofa: {
    targetSizeMeters: [2.0, 0.9, 0.85],
    maxSizeMeters: [2.4, 1.1, 1.0]
  },
  pottedPlant: {
    targetSizeMeters: [0.55, 1.2, 0.55],
    maxSizeMeters: [0.8, 1.6, 0.8]
  },
  warningPanel: {
    targetSizeMeters: [0.8, 0.45, 0.08],
    maxSizeMeters: [1.2, 0.6, 0.12]
  },
  wallSign: {
    targetSizeMeters: [1.6, 0.35, 0.05],
    maxSizeMeters: [2.2, 0.6, 0.12]
  },
  exitSign: {
    targetSizeMeters: [1.1, 0.28, 0.04],
    maxSizeMeters: [1.35, 0.45, 0.1]
  },
  taskTerminal: {
    targetSizeMeters: [0.6, 1.2, 0.45],
    maxSizeMeters: [0.8, 1.5, 0.65]
  },
  wallTerminal: {
    targetSizeMeters: [0.55, 1.0, 0.16],
    maxSizeMeters: [0.75, 1.3, 0.24]
  },
  documentTray: {
    targetSizeMeters: [0.45, 0.12, 0.32],
    maxSizeMeters: [0.65, 0.25, 0.45]
  },
  glassPartition: {
    targetSizeMeters: [3.0, 1.8, 0.08],
    maxSizeMeters: [4.4, 2.1, 0.16]
  },
  workstationCluster: {
    targetSizeMeters: [7.0, 1.45, 5.5],
    maxSizeMeters: [7.6, 1.8, 6.2]
  },
  monitor: {
    targetSizeMeters: [0.7, 0.45, 0.08],
    maxSizeMeters: [1.0, 0.65, 0.14]
  },
  keyboard: {
    targetSizeMeters: [0.55, 0.05, 0.2],
    maxSizeMeters: [0.75, 0.12, 0.35]
  },
  partition: {
    targetSizeMeters: [1.4, 1.1, 0.08],
    maxSizeMeters: [2.0, 1.5, 0.16]
  },
  archiveBox: {
    targetSizeMeters: [0.55, 0.35, 0.4],
    maxSizeMeters: [0.8, 0.55, 0.6]
  },
  monolithTerminal: {
    targetSizeMeters: [0.45, 1.25, 0.22],
    maxSizeMeters: [0.65, 1.6, 0.35]
  },
  smallBreakTable: {
    targetSizeMeters: [1.2, 0.75, 0.7],
    maxSizeMeters: [1.6, 0.9, 1.0]
  },
  simpleChair: {
    targetSizeMeters: [0.55, 0.9, 0.55],
    maxSizeMeters: [0.7, 1.1, 0.75]
  },
  fridgeCabinet: {
    targetSizeMeters: [0.75, 1.8, 0.7],
    maxSizeMeters: [1.0, 2.1, 0.9]
  },
  trashBin: {
    targetSizeMeters: [0.35, 0.65, 0.35],
    maxSizeMeters: [0.5, 0.85, 0.5]
  },
  emergencyDoorFrame: {
    targetSizeMeters: [2.4, 2.2, 0.35],
    maxSizeMeters: [2.8, 2.5, 0.55]
  },
  warningTrim: {
    targetSizeMeters: [10.8, 0.1, 0.12],
    maxSizeMeters: [12.0, 0.25, 0.2]
  },
  hazardLight: {
    targetSizeMeters: [0.3, 0.3, 0.18],
    maxSizeMeters: [0.5, 0.5, 0.3]
  },
  finalDoorSlab: {
    targetSizeMeters: [1.6, 2.15, 0.12],
    maxSizeMeters: [2.0, 2.4, 0.24]
  },
  doorSlab: {
    targetSizeMeters: [1.4, 2.05, 0.1],
    maxSizeMeters: [1.8, 2.25, 0.2]
  },
  observationWindowBand: {
    targetSizeMeters: [0.08, 1.15, 5.0],
    maxSizeMeters: [0.16, 1.5, 5.6]
  }
};

export const GLOBAL_PLACEMENT_RULES = {
  clearancesMeters: {
    playerPath: 0.5,
    doorway: 0.8,
    chairToDesk: 0.55,
    coffeeTableAround: 0.3,
    meetingTableAround: 0.6
  },
  hardForbiddenZones: [
    'centralAisle',
    'centerLane',
    'doorway',
    'objectiveRadius',
    'finalRouteCenterCorridor'
  ],
  wallBoundTypes: [
    'filingCabinet',
    'copyMachine',
    'serverRack',
    'warningPanel',
    'wallTerminal',
    'fridgeCabinet',
    'exitSign'
  ],
  facingRequiredTypes: [
    'officeChair',
    'waitingChair',
    'meetingChair',
    'receptionDesk',
    'intakeDesk'
  ]
};

const standard = key => ({
  targetSizeMeters: ASSET_SIZE_STANDARDS[key].targetSizeMeters,
  maxSizeMeters: ASSET_SIZE_STANDARDS[key].maxSizeMeters
});

export const ROOM_ASSET_MANIFEST = {
  'front-reception': {
    function: 'entry lobby and waiting area',
    maxLargeProps: 6,
    placementNotes: [
      'Keep the spawn to employee-intake path clear.',
      'Reception desk faces the entrance and player approach.',
      'Waiting chairs and sofa stay in the seating zone.',
      'Plants are corner-only.'
    ],
    allowedAssets: {
      receptionDesk: {
        idealCount: 1,
        ...standard('receptionDesk'),
        placementZones: ['receptionDeskZone'],
        placement: { facing: 'entrance', wallBound: false, minClearanceMeters: 0.8 },
        fallbackPrefab: 'receptionDesk'
      },
      waitingChair: {
        idealCount: [2, 4],
        ...standard('waitingChair'),
        placementZones: ['sideWaitingChairZone'],
        placement: { facing: 'coffeeTable', wallBound: false, minClearanceMeters: 0.35 },
        fallbackPrefab: 'waitingChairs'
      },
      sofa: {
        idealCount: 1,
        ...standard('sofa'),
        placementZones: ['seatingZone'],
        placement: { facing: 'coffeeTable', wallBound: false, minClearanceMeters: 0.35 },
        fallbackPrefab: 'officeSofa'
      },
      coffeeTable: {
        idealCount: 1,
        ...standard('coffeeTable'),
        placementZones: ['seatingZone'],
        placement: { facing: 'sofa', wallBound: false, minClearanceMeters: 0.3 },
        fallbackPrefab: 'coffeeTable'
      },
      pottedPlant: {
        idealCount: [1, 2],
        ...standard('pottedPlant'),
        placementZones: ['plantZones'],
        placement: { cornerOnly: true, wallBound: false, minClearanceMeters: 0.5 },
        fallbackPrefab: 'pottedPlant'
      },
      wallSign: {
        idealCount: 1,
        ...standard('wallSign'),
        placementZones: ['entryWallSignZone'],
        placement: { wallBound: true, minClearanceMeters: 0.8 },
        fallbackPrefab: 'wallSign'
      }
    },
    forbiddenObjects: ['workstationCluster', 'archiveRack', 'serverRack', 'emergencyFrame'],
    forbiddenZones: ['spawnArea', 'centerRouteToIntake', 'entrancePath', 'doorway']
  },

  'employee-intake': {
    function: 'employee intake desk and first form handoff',
    maxLargeProps: 4,
    placementNotes: [
      'Intake desk faces the approach path.',
      'Terminal and form stay on the desk.',
      'Connector paths must remain clear.'
    ],
    allowedAssets: {
      intakeDesk: {
        idealCount: 1,
        ...standard('intakeDesk'),
        placementZones: ['intakeDeskZone'],
        placement: { facing: 'entrance', wallBound: false, minClearanceMeters: 0.7 },
        fallbackPrefab: 'intakeDesk'
      },
      taskTerminal: {
        idealCount: 1,
        ...standard('taskTerminal'),
        placementZones: ['intakeDeskZone'],
        placement: { desktop: true, minClearanceMeters: 0.4 },
        fallbackPrefab: 'taskTerminal'
      },
      filingCabinet: {
        idealCount: [0, 1],
        ...standard('filingCabinet'),
        placementZones: ['optionalSideCabinetZone'],
        placement: { wallBound: true, minClearanceMeters: 0.6 },
        fallbackPrefab: 'procedural'
      },
      documentTray: {
        idealCount: [0, 1],
        ...standard('documentTray'),
        placementZones: ['intakeDeskZone'],
        placement: { desktop: true, minClearanceMeters: 0.25 },
        fallbackPrefab: 'procedural'
      },
      wallSign: {
        idealCount: 1,
        ...standard('wallSign'),
        placementZones: ['behindIntakeDeskSignZone'],
        placement: { wallBound: true, minClearanceMeters: 0.7 },
        fallbackPrefab: 'departmentSign'
      }
    },
    forbiddenObjects: ['workstationCluster', 'serverRack', 'meetingTable', 'sofa'],
    forbiddenZones: ['workstationConnectorMouth', 'centerMovementLane', 'objectiveRadius']
  },

  'main-workstation-hall': {
    function: 'dense but readable rows of employee workstations',
    maxLargeProps: 5,
    placementNotes: [
      'Central aisle stays clear.',
      'Workstation clusters remain row-based.',
      'Office chairs face desks.',
      'Copy machine stays in the printer zone.'
    ],
    allowedAssets: {
      workstationCluster: {
        idealCount: 2,
        ...standard('workstationCluster'),
        placementZones: ['leftWorkstationRows', 'rightWorkstationRows'],
        placement: { wallBound: false, minClearanceMeters: 0.6 },
        fallbackPrefab: 'procedural',
        composedOf: ['officeDesk', 'officeChair', 'monitor', 'keyboard', 'partition']
      },
      officeDesk: {
        idealCount: [6, 24],
        ...standard('officeDesk'),
        placementZones: ['leftWorkstationRows', 'rightWorkstationRows'],
        placement: { pairedWith: 'officeChair', minClearanceMeters: 0.5 },
        fallbackPrefab: 'procedural'
      },
      officeChair: {
        idealCount: [6, 24],
        ...standard('officeChair'),
        placementZones: ['leftWorkstationRows', 'rightWorkstationRows'],
        placement: { facing: 'officeDesk', wallBound: false, minClearanceMeters: 0.45 },
        fallbackPrefab: 'procedural'
      },
      monitor: {
        idealCount: [6, 24],
        ...standard('monitor'),
        placementZones: ['leftWorkstationRows', 'rightWorkstationRows'],
        placement: { desktop: true, minClearanceMeters: 0.2 },
        fallbackPrefab: 'procedural'
      },
      keyboard: {
        idealCount: [6, 24],
        ...standard('keyboard'),
        placementZones: ['leftWorkstationRows', 'rightWorkstationRows'],
        placement: { desktop: true, minClearanceMeters: 0.2 },
        fallbackPrefab: 'procedural'
      },
      partition: {
        idealCount: [6, 24],
        ...standard('partition'),
        placementZones: ['leftWorkstationRows', 'rightWorkstationRows'],
        placement: { wallBound: false, minClearanceMeters: 0.2 },
        fallbackPrefab: 'procedural'
      },
      copyMachine: {
        idealCount: 1,
        ...standard('copyMachine'),
        placementZones: ['printerZone'],
        placement: { wallBound: true, minClearanceMeters: 0.6 },
        fallbackPrefab: 'copyMachine'
      },
      taskTerminal: {
        idealCount: 1,
        ...standard('taskTerminal'),
        placementZones: ['assignedDeskTerminalZone'],
        placement: { objectiveLinked: true, minClearanceMeters: 0.5 },
        fallbackPrefab: 'taskTerminal'
      },
      wallSign: {
        idealCount: 1,
        ...standard('wallSign'),
        placementZones: ['mainHallEntryWallSignZone'],
        placement: { wallBound: true, minClearanceMeters: 0.8 },
        fallbackPrefab: 'departmentSign'
      }
    },
    forbiddenObjects: ['meetingTable', 'sofa', 'archiveRack', 'emergencyFrame'],
    forbiddenZones: ['centralAisle', 'reviewConnectorMouth', 'assignedDeskFileInteractionRadius']
  },

  archive: {
    function: 'records archive with rack rows and one index objective',
    maxLargeProps: 4,
    placementNotes: [
      'Racks and cabinets stay in rows or wall-bound zones.',
      'Aisle between racks stays clear.',
      'No sofa or workstation furniture.'
    ],
    allowedAssets: {
      serverRack: {
        idealCount: 2,
        ...standard('serverRack'),
        placementZones: ['rackRowNorth', 'rackRowSouth'],
        placement: { wallBound: true, minClearanceMeters: 0.6 },
        fallbackPrefab: 'serverRackRow'
      },
      filingCabinet: {
        idealCount: [0, 2],
        ...standard('filingCabinet'),
        placementZones: ['rackRowNorth', 'rackRowSouth'],
        placement: { wallBound: true, minClearanceMeters: 0.5 },
        fallbackPrefab: 'procedural'
      },
      archiveBox: {
        idealCount: [0, 4],
        ...standard('archiveBox'),
        placementZones: ['rackRowNorth', 'rackRowSouth'],
        placement: { shelfOrWallOnly: true, minClearanceMeters: 0.35 },
        fallbackPrefab: 'procedural'
      },
      taskTerminal: {
        idealCount: 1,
        ...standard('taskTerminal'),
        placementZones: ['archiveIndexPacketZone'],
        placement: { objectiveLinked: true, minClearanceMeters: 0.6 },
        fallbackPrefab: 'taskTerminal'
      },
      wallSign: {
        idealCount: 1,
        ...standard('wallSign'),
        placementZones: ['archiveEntranceSignZone'],
        placement: { wallBound: true, minClearanceMeters: 0.8 },
        fallbackPrefab: 'wallSign'
      }
    },
    forbiddenObjects: ['workstationCluster', 'sofa', 'meetingTable'],
    forbiddenZones: ['aisleBetweenRackRows', 'archiveObjectiveRadius']
  },

  'checkpoint-chamber': {
    function: 'formal review room with a table, ledger terminal, and glass edge',
    maxLargeProps: 4,
    placementNotes: [
      'Meeting table does not block connector exits.',
      'Glass remains boundary-aligned.',
      'Review terminal remains readable.'
    ],
    allowedAssets: {
      meetingTable: {
        idealCount: 1,
        ...standard('meetingTable'),
        placementZones: ['meetingTableZone'],
        placement: { facing: 'reviewTerminal', minClearanceMeters: 0.6 },
        fallbackPrefab: 'meetingTable'
      },
      meetingChair: {
        idealCount: [0, 4],
        ...standard('meetingChair'),
        placementZones: ['meetingTableZone'],
        placement: { facing: 'meetingTable', minClearanceMeters: 0.55 },
        fallbackPrefab: 'procedural'
      },
      taskTerminal: {
        idealCount: 1,
        ...standard('taskTerminal'),
        placementZones: ['terminalZone'],
        placement: { objectiveLinked: true, minClearanceMeters: 0.6 },
        fallbackPrefab: 'taskTerminal'
      },
      glassPartition: {
        idealCount: 1,
        ...standard('glassPartition'),
        placementZones: ['westBoundaryPartition'],
        placement: { boundaryAligned: true, minClearanceMeters: 0.7 },
        fallbackPrefab: 'reviewGlassPartition'
      },
      wallSign: {
        idealCount: 1,
        ...standard('wallSign'),
        placementZones: ['reviewDoorwaySignZone'],
        placement: { wallBound: true, minClearanceMeters: 0.8 },
        fallbackPrefab: 'departmentSign'
      }
    },
    forbiddenObjects: ['workstationCluster', 'copyMachine', 'serverRack', 'sofa'],
    forbiddenZones: ['connectorExits', 'reviewEntrance', 'routeThroughTableAndObjective']
  },

  'wrong-department': {
    function: 'wrong records/accounts office with controlled objective misdirection',
    maxLargeProps: 5,
    placementNotes: [
      'Office furniture stays wall-side.',
      'Monolith terminal remains the focal point.',
      'No workstation cluster.'
    ],
    allowedAssets: {
      smallOfficeDesk: {
        idealCount: [0, 2],
        ...standard('smallOfficeDesk'),
        placementZones: ['wallDeskCabinetZones'],
        placement: { wallBound: true, minClearanceMeters: 0.6 },
        fallbackPrefab: 'officeDesk'
      },
      filingCabinet: {
        idealCount: [0, 2],
        ...standard('filingCabinet'),
        placementZones: ['wallDeskCabinetZones'],
        placement: { wallBound: true, minClearanceMeters: 0.6 },
        fallbackPrefab: 'procedural'
      },
      documentTray: {
        idealCount: [0, 2],
        ...standard('documentTray'),
        placementZones: ['wallDeskCabinetZones'],
        placement: { desktopOrCabinetTop: true, minClearanceMeters: 0.25 },
        fallbackPrefab: 'procedural'
      },
      taskTerminal: {
        idealCount: 1,
        ...standard('taskTerminal'),
        placementZones: ['terminalZone'],
        placement: { objectiveLinked: true, minClearanceMeters: 0.6 },
        fallbackPrefab: 'taskTerminal'
      },
      monolithTerminal: {
        idealCount: 1,
        ...standard('monolithTerminal'),
        placementZones: ['monolithZone'],
        placement: { wallBound: false, minClearanceMeters: 0.6 },
        fallbackPrefab: 'monolithTerminal'
      },
      glassPartition: {
        idealCount: 1,
        ...standard('glassPartition'),
        placementZones: ['accountsFrontBoundary'],
        placement: { boundaryAligned: true, minClearanceMeters: 0.7 },
        fallbackPrefab: 'officeFrontGlass'
      },
      wallSign: {
        idealCount: 1,
        ...standard('wallSign'),
        placementZones: ['accountsFrontSignZone'],
        placement: { wallBound: true, minClearanceMeters: 0.8 },
        fallbackPrefab: 'departmentSign'
      }
    },
    forbiddenObjects: ['workstationCluster', 'meetingTable', 'serverRack'],
    forbiddenZones: ['transferNoticeObjectiveRadius', 'accountsEntrancePath']
  },

  'utility-break': {
    function: 'staff utility break area with copier and optional break furniture',
    maxLargeProps: 5,
    placementNotes: [
      'Copy machine, fridge, and cabinet are wall-bound.',
      'Table and chair are corner-only.',
      'Room should not be overfilled.'
    ],
    allowedAssets: {
      copyMachine: {
        idealCount: 1,
        ...standard('copyMachine'),
        placementZones: ['copyCabinetZone'],
        placement: { wallBound: true, minClearanceMeters: 0.6 },
        fallbackPrefab: 'copyMachine'
      },
      fridgeCabinet: {
        idealCount: [0, 1],
        ...standard('fridgeCabinet'),
        placementZones: ['copyCabinetZone'],
        placement: { wallBound: true, minClearanceMeters: 0.6 },
        fallbackPrefab: 'procedural'
      },
      smallBreakTable: {
        idealCount: [0, 1],
        ...standard('smallBreakTable'),
        placementZones: ['smallBreakTableZone'],
        placement: { wallBound: true, minClearanceMeters: 0.6 },
        fallbackPrefab: 'procedural'
      },
      simpleChair: {
        idealCount: [0, 2],
        ...standard('simpleChair'),
        placementZones: ['smallBreakTableZone'],
        placement: { facing: 'smallBreakTable', cornerOnly: true, minClearanceMeters: 0.45 },
        fallbackPrefab: 'procedural'
      },
      trashBin: {
        idealCount: [0, 1],
        ...standard('trashBin'),
        placementZones: ['copyCabinetZone', 'smallBreakTableZone'],
        placement: { wallBound: true, minClearanceMeters: 0.4 },
        fallbackPrefab: 'procedural'
      },
      wallSign: {
        idealCount: 1,
        ...standard('wallSign'),
        placementZones: ['staffEntranceSignZone'],
        placement: { wallBound: true, minClearanceMeters: 0.8 },
        fallbackPrefab: 'wallSign'
      }
    },
    forbiddenObjects: ['workstationCluster', 'meetingTable', 'serverRack'],
    forbiddenZones: ['centerEntryArea']
  },

  'crusher-corridor': {
    function: 'hazard corridor with visual-only emergency framing',
    maxLargeProps: 6,
    placementNotes: [
      'Center lane must stay empty.',
      'All props are visualOnly if near hazard.',
      'Frames and trims belong only on edges or thresholds.',
      'No office furniture.'
    ],
    allowedAssets: {
      emergencyDoorFrame: {
        idealCount: 2,
        ...standard('emergencyDoorFrame'),
        placementZones: ['westEntranceFrame', 'eastExitFrame', 'crusherStartHousing', 'crusherReceiverHousing'],
        placement: { visualOnlyRequired: true, edgeOnly: true, minClearanceMeters: 0.8 },
        fallbackPrefab: 'emergencyDoorFrame'
      },
      warningTrim: {
        idealCount: [2, 4],
        ...standard('warningTrim'),
        placementZones: ['northEdgeWarningBeam', 'southEdgeWarningBeam', 'northWallServiceRail', 'southWallServiceRail'],
        placement: { visualOnlyRequired: true, edgeOnly: true, minClearanceMeters: 0.8 },
        fallbackPrefab: 'emergencyWarningTrim'
      },
      warningPanel: {
        idealCount: [0, 1],
        ...standard('warningPanel'),
        placementZones: ['corridorEntryEdgeSignZone'],
        placement: { wallBound: true, minClearanceMeters: 0.8 },
        fallbackPrefab: 'warningSign'
      },
      hazardLight: {
        idealCount: [0, 2],
        ...standard('hazardLight'),
        placementZones: ['northEdgeWarningBeam', 'southEdgeWarningBeam'],
        placement: { visualOnlyRequired: true, edgeOnly: true, minClearanceMeters: 0.8 },
        fallbackPrefab: 'procedural'
      },
      crusherHousingVisual: {
        idealCount: [0, 2],
        ...standard('emergencyDoorFrame'),
        placementZones: ['crusherStartHousing', 'crusherReceiverHousing'],
        placement: { visualOnlyRequired: true, edgeOnly: true, minClearanceMeters: 0.8 },
        fallbackPrefab: 'emergencyDoorFrame'
      }
    },
    forbiddenObjects: ['officeDesk', 'officeChair', 'copyMachine', 'meetingTable', 'sofa', 'serverRack'],
    forbiddenZones: ['centerLane']
  },

  'fake-exit': {
    function: 'clean false exit room with signage only',
    maxLargeProps: 1,
    placementNotes: [
      'No furniture.',
      'Path to fake exit trigger stays clear.',
      'Keep a clean suspicious emptiness.'
    ],
    allowedAssets: {
      exitSign: {
        idealCount: 1,
        ...standard('exitSign'),
        placementZones: ['publicExitWallSignZone'],
        placement: { wallBound: true, minClearanceMeters: 0.8 },
        fallbackPrefab: 'exitSign'
      },
      doorSlab: {
        idealCount: [0, 1],
        ...standard('doorSlab'),
        placementZones: ['noFurnitureZone'],
        placement: { visualOnlyRequired: true, wallBound: true, minClearanceMeters: 0.8 },
        fallbackPrefab: 'doorSlab'
      },
      warningTrim: {
        idealCount: [0, 1],
        ...standard('warningTrim'),
        placementZones: ['publicExitWallSignZone'],
        placement: { wallBound: true, minClearanceMeters: 0.8 },
        fallbackPrefab: 'procedural'
      }
    },
    forbiddenObjects: ['officeDesk', 'officeChair', 'waitingChair', 'sofa', 'coffeeTable', 'copyMachine', 'meetingTable', 'serverRack'],
    forbiddenZones: ['pathToFakeExitTrigger', 'noFurnitureZone']
  },

  'final-route': {
    function: 'sterile final approach to the final door',
    maxLargeProps: 2,
    placementNotes: [
      'Center corridor stays clear.',
      'Final door remains the focal point.',
      'No office furniture.'
    ],
    allowedAssets: {
      finalDoorSlab: {
        idealCount: 1,
        ...standard('finalDoorSlab'),
        placementZones: ['finalDoorZone'],
        placement: { visualOnlyRequired: true, wallBound: true, minClearanceMeters: 0.8 },
        fallbackPrefab: 'finalDoorSlab'
      },
      observationWindowBand: {
        idealCount: 1,
        ...standard('observationWindowBand'),
        placementZones: ['eastObservationWindowBand'],
        placement: { wallBound: true, minClearanceMeters: 0.8 },
        fallbackPrefab: 'observationWindowBand'
      },
      wallSign: {
        idealCount: [0, 1],
        ...standard('wallSign'),
        placementZones: ['finalDoorWindowSignageZone'],
        placement: { wallBound: true, minClearanceMeters: 0.8 },
        fallbackPrefab: 'wallSign'
      },
      wallTerminal: {
        idealCount: [0, 1],
        ...standard('wallTerminal'),
        placementZones: ['finalDoorWindowSignageZone'],
        placement: { wallBound: true, minClearanceMeters: 0.8 },
        fallbackPrefab: 'procedural'
      }
    },
    forbiddenObjects: ['officeDesk', 'officeChair', 'waitingChair', 'sofa', 'coffeeTable', 'copyMachine', 'meetingTable', 'serverRack'],
    forbiddenZones: ['centerCorridor']
  }
};

export const ROOM_PLACEMENT_REPAIR_PRIORITIES = [
  {
    roomId: 'crusher-corridor',
    priority: 'high',
    issue: 'Emergency frame appears too blocky/debug-like and should be refined without blocking center lane.'
  },
  {
    roomId: 'main-workstation-hall',
    priority: 'high',
    issue: 'Verify workstation clusters and chairs do not intrude into central aisle.'
  },
  {
    roomId: 'front-reception',
    priority: 'high',
    issue: 'Waiting area should use waitingChair model later, not officeChair model.'
  },
  {
    roomId: 'checkpoint-chamber',
    priority: 'medium',
    issue: 'Verify meeting table model offset and review chairs keep all connector exits readable.'
  },
  {
    roomId: 'main-workstation-hall',
    priority: 'medium',
    issue: 'Measure model-backed copy machine against SOP target/max size before placement repair is finalized.'
  }
];

// Prefab-to-role mapping is deliberately semantic. If a procedural prefab is
// reused by more than one visual role, keep the mapping role-specific here
// instead of loosening a room to accept the wrong furniture category.
export const PREFAB_TO_MANIFEST_ASSET_TYPE = {
  waitingChairs: 'waitingChair',
  officeChairSet: 'officeChair',
  pottedPlant: 'pottedPlant',
  receptionDesk: 'receptionDesk',
  intakeDesk: 'intakeDesk',
  // officeDesk is currently only allowed as wall-side small office furniture,
  // not as a workstation desk replacement in the main workstation clusters.
  officeDesk: 'smallOfficeDesk',
  coffeeTable: 'coffeeTable',
  copyMachine: 'copyMachine',
  meetingTable: 'meetingTable',
  serverRackRow: 'serverRack',
  emergencyDoorFrame: 'emergencyDoorFrame',
  emergencyWarningTrim: 'warningTrim',
  finalDoorSlab: 'finalDoorSlab',
  doorSlab: 'doorSlab',
  workstationCluster: 'workstationCluster',
  workstationClusterLeft: 'workstationCluster',
  workstationClusterRight: 'workstationCluster',
  wallSign: 'wallSign',
  departmentSign: 'wallSign',
  exitSign: 'exitSign',
  warningSign: 'warningPanel',
  taskTerminal: 'taskTerminal',
  monolithTerminal: 'monolithTerminal',
  // Both glass prefabs are glassPartition because the room decides whether
  // review-boundary or office-front boundary placement is valid.
  reviewGlassPartition: 'glassPartition',
  officeFrontGlass: 'glassPartition',
  observationWindowBand: 'observationWindowBand',
  officeSofa: 'sofa'
};

const OFFICE_FURNITURE_ASSET_TYPES = new Set([
  'officeDesk',
  'smallOfficeDesk',
  'officeChair',
  'waitingChair',
  'sofa',
  'coffeeTable',
  'copyMachine',
  'meetingTable',
  'meetingChair',
  'serverRack',
  'filingCabinet',
  'workstationCluster'
]);

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);

function createValidationIssue(category, message, context = {}) {
  return {
    category,
    message,
    ...context,
    formatted: `[${category}] ${message}`
  };
}

function pushIssue(collection, category, message, context) {
  collection.push(createValidationIssue(category, message, context));
}

function formatIssues(issues) {
  return issues.map(issue => issue.formatted);
}

function getObjectAnchorId(object) {
  const anchor = object?.metadata?.anchor ?? object?.anchor;
  if (!anchor) return undefined;
  if (typeof anchor === 'string') return anchor;
  return anchor.id;
}

function getObjectRoomId(object) {
  return object?.metadata?.roomId ?? object?.roomId;
}

function getObjectName(object) {
  return object?.id ?? object?.metadata?.prefab ?? object?.type ?? 'architecture-object';
}

function isSizeTuple(value) {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every(component => typeof component === 'number' && Number.isFinite(component) && component > 0)
  );
}

function targetExceedsMax(targetSizeMeters, maxSizeMeters) {
  if (!isSizeTuple(targetSizeMeters) || !isSizeTuple(maxSizeMeters)) return false;
  return targetSizeMeters.some((component, index) => component > maxSizeMeters[index]);
}

function isValidIdealCount(idealCount) {
  if (Number.isInteger(idealCount) && idealCount >= 0) return true;
  return (
    Array.isArray(idealCount) &&
    idealCount.length === 2 &&
    idealCount.every(value => Number.isInteger(value) && value >= 0) &&
    idealCount[0] <= idealCount[1]
  );
}

function idealCountMax(idealCount) {
  if (Number.isInteger(idealCount)) return idealCount;
  if (Array.isArray(idealCount)) return idealCount[1];
  return Infinity;
}

function countContribution(object, assetType) {
  if (assetType === 'waitingChair' && Number.isInteger(object?.count)) return object.count;
  if (assetType === 'officeChair' && Number.isInteger(object?.count)) return object.count;
  return 1;
}

function collectAnchorZoneIds(roomAnchor) {
  const zoneIds = new Set();
  [
    'furnitureZones',
    'signageZones',
    'glassZones',
    'frameZones',
    'warningZones',
    'hazardVisualZones',
    'beamZones',
    'forbiddenZones'
  ].forEach(collectionName => {
    roomAnchor?.[collectionName]?.forEach(zone => zoneIds.add(zone.id));
  });
  if (roomAnchor?.windowZone?.id) zoneIds.add(roomAnchor.windowZone.id);
  return zoneIds;
}

export function getManifestAssetTypeForObject(object) {
  const prefab = object?.metadata?.prefab;
  if (PREFAB_TO_MANIFEST_ASSET_TYPE[prefab]) return PREFAB_TO_MANIFEST_ASSET_TYPE[prefab];
  if (PREFAB_TO_MANIFEST_ASSET_TYPE[object?.type]) return PREFAB_TO_MANIFEST_ASSET_TYPE[object.type];
  return object?.type;
}

export function validateRoomAssetManifest(roomLayoutAnchors = null) {
  const errorIssues = [];
  const warningIssues = [];

  ROOM_ASSET_MANIFEST_REQUIRED_ROOMS.forEach(roomId => {
    if (!ROOM_ASSET_MANIFEST[roomId]) {
      pushIssue(errorIssues, VALIDATION_CATEGORIES.SOP_ERROR, `${roomId} is missing from ROOM_ASSET_MANIFEST`, {
        roomId
      });
    }
  });

  Object.entries(ROOM_ASSET_MANIFEST).forEach(([roomId, room]) => {
    if (!room.function) {
      pushIssue(errorIssues, VALIDATION_CATEGORIES.SOP_ERROR, `${roomId} manifest is missing function`, { roomId });
    }
    if (!Number.isInteger(room.maxLargeProps) || room.maxLargeProps < 0) {
      pushIssue(
        errorIssues,
        VALIDATION_CATEGORIES.SOP_ERROR,
        `${roomId} manifest maxLargeProps must be a non-negative integer`,
        { roomId }
      );
    }
    if (!isObject(room.allowedAssets) || Object.keys(room.allowedAssets).length === 0) {
      pushIssue(errorIssues, VALIDATION_CATEGORIES.SOP_ERROR, `${roomId} manifest must declare allowedAssets`, {
        roomId
      });
    }
    if (!Array.isArray(room.forbiddenObjects)) {
      pushIssue(errorIssues, VALIDATION_CATEGORIES.SOP_ERROR, `${roomId} manifest must declare forbiddenObjects`, {
        roomId
      });
    }
    if (!Array.isArray(room.forbiddenZones)) {
      pushIssue(errorIssues, VALIDATION_CATEGORIES.SOP_ERROR, `${roomId} manifest must declare forbiddenZones`, {
        roomId
      });
    }
    if (!Array.isArray(room.placementNotes) || room.placementNotes.length === 0) {
      pushIssue(warningIssues, VALIDATION_CATEGORIES.SOP_WARNING, `${roomId} manifest is missing placementNotes`, {
        roomId
      });
    }

    const roomAnchorZoneIds = roomLayoutAnchors?.[roomId] ? collectAnchorZoneIds(roomLayoutAnchors[roomId]) : null;

    Object.entries(room.allowedAssets ?? {}).forEach(([assetType, asset]) => {
      if (!isValidIdealCount(asset.idealCount)) {
        pushIssue(errorIssues, VALIDATION_CATEGORIES.SOP_ERROR, `${roomId}.${assetType} has invalid idealCount`, {
          roomId,
          assetType
        });
      }
      if (!isSizeTuple(asset.targetSizeMeters)) {
        pushIssue(errorIssues, VALIDATION_CATEGORIES.SOP_ERROR, `${roomId}.${assetType} is missing targetSizeMeters`, {
          roomId,
          assetType
        });
      }
      if (!isSizeTuple(asset.maxSizeMeters)) {
        pushIssue(errorIssues, VALIDATION_CATEGORIES.SOP_ERROR, `${roomId}.${assetType} is missing maxSizeMeters`, {
          roomId,
          assetType
        });
      }
      if (targetExceedsMax(asset.targetSizeMeters, asset.maxSizeMeters)) {
        pushIssue(
          errorIssues,
          VALIDATION_CATEGORIES.SOP_ERROR,
          `${roomId}.${assetType} targetSizeMeters exceeds maxSizeMeters`,
          { roomId, assetType }
        );
      }
      if (!Array.isArray(asset.placementZones) || asset.placementZones.length === 0) {
        pushIssue(errorIssues, VALIDATION_CATEGORIES.SOP_ERROR, `${roomId}.${assetType} must declare placementZones`, {
          roomId,
          assetType
        });
      }
      if (!isObject(asset.placement) || Object.keys(asset.placement).length === 0) {
        pushIssue(errorIssues, VALIDATION_CATEGORIES.SOP_ERROR, `${roomId}.${assetType} must declare placement rules`, {
          roomId,
          assetType
        });
      }
      if (!asset.fallbackPrefab) {
        pushIssue(errorIssues, VALIDATION_CATEGORIES.SOP_ERROR, `${roomId}.${assetType} must declare fallbackPrefab`, {
          roomId,
          assetType
        });
      }
      if (room.forbiddenObjects?.includes(assetType)) {
        pushIssue(errorIssues, VALIDATION_CATEGORIES.SOP_ERROR, `${roomId}.${assetType} is both allowed and forbidden`, {
          roomId,
          assetType
        });
      }
      if (roomAnchorZoneIds) {
        asset.placementZones?.forEach(zoneId => {
          if (!roomAnchorZoneIds.has(zoneId)) {
            pushIssue(
              warningIssues,
              VALIDATION_CATEGORIES.MANIFEST_MISMATCH,
              `${roomId}.${assetType} placement zone "${zoneId}" is not present in roomLayoutAnchors`,
              { roomId, assetType, zoneId }
            );
          }
        });
      }
    });
  });

  return {
    valid: errorIssues.length === 0,
    errors: formatIssues(errorIssues),
    warnings: formatIssues(warningIssues),
    issues: [...errorIssues, ...warningIssues]
  };
}

export function validateModelAgainstRoomManifest(object, roomId, assetType, roomLayoutAnchors = null) {
  const warningIssues = [];
  const room = ROOM_ASSET_MANIFEST[roomId];
  const name = getObjectName(object);

  if (!room) {
    pushIssue(
      warningIssues,
      VALIDATION_CATEGORIES.MANIFEST_MISMATCH,
      `${name} references room "${roomId}" with no room asset manifest entry`,
      { roomId, objectName: name }
    );
    return { valid: false, warnings: formatIssues(warningIssues), issues: warningIssues };
  }

  const resolvedAssetType = assetType ?? getManifestAssetTypeForObject(object);
  const asset = room.allowedAssets?.[resolvedAssetType];

  if (!asset) {
    pushIssue(
      warningIssues,
      VALIDATION_CATEGORIES.MANIFEST_MISMATCH,
      `${name} uses asset "${resolvedAssetType}" which is not allowed in ${roomId}`,
      { roomId, assetType: resolvedAssetType, objectName: name }
    );
    if (['fake-exit', 'final-route'].includes(roomId) && OFFICE_FURNITURE_ASSET_TYPES.has(resolvedAssetType)) {
      pushIssue(
        warningIssues,
        VALIDATION_CATEGORIES.PLACEMENT_WARNING,
        `${name} is office furniture in ${roomId}, which is reserved as a no-office-furniture room`,
        { roomId, assetType: resolvedAssetType, objectName: name }
      );
    }
    return { valid: false, warnings: formatIssues(warningIssues), issues: warningIssues };
  }

  const anchorId = getObjectAnchorId(object);
  if (anchorId && !asset.placementZones.includes(anchorId)) {
    pushIssue(
      warningIssues,
      VALIDATION_CATEGORIES.PLACEMENT_WARNING,
      `${name} uses anchor "${anchorId}", but ${roomId}.${resolvedAssetType} allows ${asset.placementZones.join(', ')}`,
      { roomId, assetType: resolvedAssetType, objectName: name, anchorId }
    );
  }

  if (!asset.fallbackPrefab) {
    pushIssue(warningIssues, VALIDATION_CATEGORIES.SOP_WARNING, `${roomId}.${resolvedAssetType} is missing fallbackPrefab`, {
      roomId,
      assetType: resolvedAssetType
    });
  }
  if (!isSizeTuple(asset.targetSizeMeters)) {
    pushIssue(
      warningIssues,
      VALIDATION_CATEGORIES.SOP_WARNING,
      `${roomId}.${resolvedAssetType} is missing targetSizeMeters`,
      { roomId, assetType: resolvedAssetType }
    );
  }
  if (!isSizeTuple(asset.maxSizeMeters)) {
    pushIssue(
      warningIssues,
      VALIDATION_CATEGORIES.SOP_WARNING,
      `${roomId}.${resolvedAssetType} is missing maxSizeMeters`,
      { roomId, assetType: resolvedAssetType }
    );
  }
  if (targetExceedsMax(asset.targetSizeMeters, asset.maxSizeMeters)) {
    pushIssue(
      warningIssues,
      VALIDATION_CATEGORIES.SOP_WARNING,
      `${roomId}.${resolvedAssetType} targetSizeMeters exceeds maxSizeMeters`,
      { roomId, assetType: resolvedAssetType }
    );
  }
  if (!isValidIdealCount(asset.idealCount)) {
    pushIssue(warningIssues, VALIDATION_CATEGORIES.SOP_WARNING, `${roomId}.${resolvedAssetType} has invalid idealCount`, {
      roomId,
      assetType: resolvedAssetType
    });
  }
  if (room.forbiddenObjects?.includes(resolvedAssetType)) {
    pushIssue(
      warningIssues,
      VALIDATION_CATEGORIES.PLACEMENT_WARNING,
      `${name} uses asset "${resolvedAssetType}" which is listed in ${roomId}.forbiddenObjects`,
      { roomId, assetType: resolvedAssetType, objectName: name }
    );
  }

  if (
    roomId === 'crusher-corridor' &&
    (object?.metadata?.modelUrl || object?.modelUrl) &&
    object?.metadata?.visualOnly !== true
  ) {
    pushIssue(
      warningIssues,
      VALIDATION_CATEGORIES.PLACEMENT_WARNING,
      `${name} is a model prop in crusher-corridor and must be metadata.visualOnly`,
      { roomId, assetType: resolvedAssetType, objectName: name }
    );
  }

  if (asset.placement?.visualOnlyRequired && object?.metadata?.prefab !== 'warningSign' && object?.metadata?.visualOnly !== true) {
    pushIssue(
      warningIssues,
      VALIDATION_CATEGORIES.PLACEMENT_WARNING,
      `${name} must be metadata.visualOnly for ${roomId}.${resolvedAssetType}`,
      { roomId, assetType: resolvedAssetType, objectName: name }
    );
  }

  if (['fake-exit', 'final-route'].includes(roomId) && OFFICE_FURNITURE_ASSET_TYPES.has(resolvedAssetType)) {
    pushIssue(
      warningIssues,
      VALIDATION_CATEGORIES.PLACEMENT_WARNING,
      `${name} is office furniture in ${roomId}, which is reserved as a no-office-furniture room`,
      { roomId, assetType: resolvedAssetType, objectName: name }
    );
  }

  const roomAnchor = roomLayoutAnchors?.[roomId];
  if (roomAnchor && anchorId) {
    const roomZoneIds = collectAnchorZoneIds(roomAnchor);
    if (!roomZoneIds.has(anchorId)) {
      pushIssue(
        warningIssues,
        VALIDATION_CATEGORIES.MANIFEST_MISMATCH,
        `${name} anchor "${anchorId}" is not present in ${roomId} roomLayoutAnchors`,
        { roomId, assetType: resolvedAssetType, objectName: name, anchorId }
      );
    }
  }

  return { valid: warningIssues.length === 0, warnings: formatIssues(warningIssues), issues: warningIssues };
}

export function validateRoomAssetCounts(architecture = []) {
  const warningIssues = [];
  const countsByRoom = new Map();

  architecture.forEach(object => {
    const roomId = getObjectRoomId(object);
    const assetType = getManifestAssetTypeForObject(object);
    if (!roomId || !assetType) return;

    const key = `${roomId}:${assetType}`;
    countsByRoom.set(key, (countsByRoom.get(key) ?? 0) + countContribution(object, assetType));
  });

  countsByRoom.forEach((count, key) => {
    const [roomId, assetType] = key.split(':');
    const asset = ROOM_ASSET_MANIFEST[roomId]?.allowedAssets?.[assetType];
    if (!asset || !isValidIdealCount(asset.idealCount)) return;

    const maxIdealCount = idealCountMax(asset.idealCount);
    if (count > maxIdealCount) {
      pushIssue(
        warningIssues,
        VALIDATION_CATEGORIES.PLACEMENT_WARNING,
        `${roomId}.${assetType} count ${count} exceeds manifest ideal max ${maxIdealCount}`,
        { roomId, assetType, count, maxIdealCount }
      );
    }
  });

  return { valid: warningIssues.length === 0, warnings: formatIssues(warningIssues), issues: warningIssues };
}

export function summarizeRoomAssetManifest(roomLayoutAnchors = null) {
  const roomsMissingPlacementNotes = [];
  const assetsMissingFallbackPrefab = [];
  const placementZonesNotFound = [];
  let totalAssetRules = 0;

  Object.entries(ROOM_ASSET_MANIFEST).forEach(([roomId, room]) => {
    if (!Array.isArray(room.placementNotes) || room.placementNotes.length === 0) {
      roomsMissingPlacementNotes.push(roomId);
    }

    const roomAnchorZoneIds = roomLayoutAnchors?.[roomId] ? collectAnchorZoneIds(roomLayoutAnchors[roomId]) : null;

    Object.entries(room.allowedAssets ?? {}).forEach(([assetType, asset]) => {
      totalAssetRules += 1;

      if (!asset.fallbackPrefab) {
        assetsMissingFallbackPrefab.push(`${roomId}.${assetType}`);
      }

      if (roomAnchorZoneIds) {
        asset.placementZones?.forEach(zoneId => {
          if (!roomAnchorZoneIds.has(zoneId)) {
            placementZonesNotFound.push(`${roomId}.${assetType}:${zoneId}`);
          }
        });
      }
    });
  });

  return {
    totalRoomsCovered: Object.keys(ROOM_ASSET_MANIFEST).length,
    requiredRoomsCovered: ROOM_ASSET_MANIFEST_REQUIRED_ROOMS.filter(roomId => ROOM_ASSET_MANIFEST[roomId]),
    requiredRoomsMissing: ROOM_ASSET_MANIFEST_REQUIRED_ROOMS.filter(roomId => !ROOM_ASSET_MANIFEST[roomId]),
    totalAssetRules,
    roomsMissingPlacementNotes,
    assetsMissingFallbackPrefab,
    placementZonesNotFound,
    deferredRepairCandidates: ROOM_PLACEMENT_REPAIR_PRIORITIES.map(candidate => ({
      ...candidate,
      category: VALIDATION_CATEGORIES.DEFERRED_REPAIR
    }))
  };
}

export function validateArchitectureAgainstRoomAssetManifest(architecture = [], roomLayoutAnchors = null) {
  const manifestResult = validateRoomAssetManifest(roomLayoutAnchors);
  const countResult = validateRoomAssetCounts(architecture);
  const warnings = [...manifestResult.warnings, ...countResult.warnings];
  const errors = [...manifestResult.errors];
  const deferredRepairIssues = ROOM_PLACEMENT_REPAIR_PRIORITIES.map(candidate =>
    createValidationIssue(
      VALIDATION_CATEGORIES.DEFERRED_REPAIR,
      `${candidate.roomId} (${candidate.priority}): ${candidate.issue}`,
      candidate
    )
  );
  const issues = [
    ...(manifestResult.issues ?? []),
    ...(countResult.issues ?? [])
  ];

  architecture.forEach(object => {
    const roomId = getObjectRoomId(object);
    if (!roomId) return;
    const result = validateModelAgainstRoomManifest(
      object,
      roomId,
      getManifestAssetTypeForObject(object),
      roomLayoutAnchors
    );
    result.warnings.forEach(warning => warnings.push(warning));
    result.issues?.forEach(issue => issues.push(issue));
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    deferredRepairs: formatIssues(deferredRepairIssues),
    issues: [...issues, ...deferredRepairIssues]
  };
}
