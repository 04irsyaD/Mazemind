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

export const ASSET_SIZE_STANDARDS = {
  officeChair: {
    targetSizeMeters: [0.65, 1.05, 0.65],
    maxSizeMeters: [0.8, 1.25, 0.85]
  },
  waitingChair: {
    targetSizeMeters: [0.6, 0.9, 0.65],
    maxSizeMeters: [0.75, 1.1, 0.8]
  },
  officeDesk: {
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
  taskTerminal: {
    targetSizeMeters: [0.6, 1.2, 0.45],
    maxSizeMeters: [0.8, 1.5, 0.65]
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
    'fridgeCabinet'
  ],
  facingRequiredTypes: [
    'officeChair',
    'waitingChair',
    'meetingChair',
    'receptionDesk'
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
        ...standard('officeChair'),
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
    allowedAssets: {
      smallOfficeDesk: {
        idealCount: [0, 2],
        ...standard('officeDesk'),
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
        ...standard('waitingChair'),
        placementZones: ['smallBreakTableZone'],
        placement: { facing: 'smallBreakTable', minClearanceMeters: 0.45 },
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
    allowedAssets: {
      exitSign: {
        idealCount: 1,
        ...standard('wallSign'),
        placementZones: ['publicExitWallSignZone'],
        placement: { wallBound: true, minClearanceMeters: 0.8 },
        fallbackPrefab: 'exitSign'
      },
      doorSlab: {
        idealCount: [0, 1],
        ...standard('finalDoorSlab'),
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
        ...standard('taskTerminal'),
        placementZones: ['finalDoorWindowSignageZone'],
        placement: { wallBound: true, minClearanceMeters: 0.8 },
        fallbackPrefab: 'procedural'
      }
    },
    forbiddenObjects: ['officeDesk', 'officeChair', 'waitingChair', 'sofa', 'coffeeTable', 'copyMachine', 'meetingTable', 'serverRack'],
    forbiddenZones: ['centerCorridor']
  }
};

export const PREFAB_TO_MANIFEST_ASSET_TYPE = {
  waitingChairs: 'waitingChair',
  officeChairSet: 'officeChair',
  pottedPlant: 'pottedPlant',
  receptionDesk: 'receptionDesk',
  intakeDesk: 'intakeDesk',
  officeDesk: 'smallOfficeDesk',
  coffeeTable: 'coffeeTable',
  copyMachine: 'copyMachine',
  meetingTable: 'meetingTable',
  serverRackRow: 'serverRack',
  emergencyDoorFrame: 'emergencyDoorFrame',
  emergencyWarningTrim: 'warningTrim',
  finalDoorSlab: 'finalDoorSlab',
  workstationCluster: 'workstationCluster',
  workstationClusterLeft: 'workstationCluster',
  workstationClusterRight: 'workstationCluster',
  wallSign: 'wallSign',
  departmentSign: 'wallSign',
  exitSign: 'exitSign',
  warningSign: 'warningPanel',
  taskTerminal: 'taskTerminal',
  monolithTerminal: 'monolithTerminal',
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
  const errors = [];
  const warnings = [];

  Object.entries(ROOM_ASSET_MANIFEST).forEach(([roomId, room]) => {
    if (!room.function) errors.push(`${roomId} manifest is missing function`);
    if (!Number.isInteger(room.maxLargeProps) || room.maxLargeProps < 0) {
      errors.push(`${roomId} manifest maxLargeProps must be a non-negative integer`);
    }

    const roomAnchorZoneIds = roomLayoutAnchors?.[roomId] ? collectAnchorZoneIds(roomLayoutAnchors[roomId]) : null;

    Object.entries(room.allowedAssets ?? {}).forEach(([assetType, asset]) => {
      if (!isValidIdealCount(asset.idealCount)) {
        errors.push(`${roomId}.${assetType} has invalid idealCount`);
      }
      if (!isSizeTuple(asset.targetSizeMeters)) {
        errors.push(`${roomId}.${assetType} is missing targetSizeMeters`);
      }
      if (!isSizeTuple(asset.maxSizeMeters)) {
        errors.push(`${roomId}.${assetType} is missing maxSizeMeters`);
      }
      if (targetExceedsMax(asset.targetSizeMeters, asset.maxSizeMeters)) {
        errors.push(`${roomId}.${assetType} targetSizeMeters exceeds maxSizeMeters`);
      }
      if (!Array.isArray(asset.placementZones) || asset.placementZones.length === 0) {
        errors.push(`${roomId}.${assetType} must declare placementZones`);
      }
      if (!asset.fallbackPrefab) {
        errors.push(`${roomId}.${assetType} must declare fallbackPrefab`);
      }
      if (room.forbiddenObjects?.includes(assetType)) {
        errors.push(`${roomId}.${assetType} is both allowed and forbidden`);
      }
      if (roomAnchorZoneIds) {
        asset.placementZones?.forEach(zoneId => {
          if (!roomAnchorZoneIds.has(zoneId)) {
            warnings.push(`${roomId}.${assetType} placement zone "${zoneId}" is not present in roomLayoutAnchors`);
          }
        });
      }
    });
  });

  return { valid: errors.length === 0, errors, warnings };
}

export function validateModelAgainstRoomManifest(object, roomId, assetType, roomLayoutAnchors = null) {
  const warnings = [];
  const room = ROOM_ASSET_MANIFEST[roomId];
  const name = getObjectName(object);

  if (!room) {
    warnings.push(`${name} references room "${roomId}" with no room asset manifest entry`);
    return { valid: false, warnings };
  }

  const resolvedAssetType = assetType ?? getManifestAssetTypeForObject(object);
  const asset = room.allowedAssets?.[resolvedAssetType];

  if (!asset) {
    warnings.push(`${name} uses asset "${resolvedAssetType}" which is not allowed in ${roomId}`);
    if (['fake-exit', 'final-route'].includes(roomId) && OFFICE_FURNITURE_ASSET_TYPES.has(resolvedAssetType)) {
      warnings.push(`${name} is office furniture in ${roomId}, which is reserved as a no-office-furniture room`);
    }
    return { valid: false, warnings };
  }

  const anchorId = getObjectAnchorId(object);
  if (anchorId && !asset.placementZones.includes(anchorId)) {
    warnings.push(
      `${name} uses anchor "${anchorId}", but ${roomId}.${resolvedAssetType} allows ${asset.placementZones.join(', ')}`
    );
  }

  if (!asset.fallbackPrefab) warnings.push(`${roomId}.${resolvedAssetType} is missing fallbackPrefab`);
  if (!isSizeTuple(asset.targetSizeMeters)) warnings.push(`${roomId}.${resolvedAssetType} is missing targetSizeMeters`);
  if (!isSizeTuple(asset.maxSizeMeters)) warnings.push(`${roomId}.${resolvedAssetType} is missing maxSizeMeters`);
  if (targetExceedsMax(asset.targetSizeMeters, asset.maxSizeMeters)) {
    warnings.push(`${roomId}.${resolvedAssetType} targetSizeMeters exceeds maxSizeMeters`);
  }
  if (!isValidIdealCount(asset.idealCount)) warnings.push(`${roomId}.${resolvedAssetType} has invalid idealCount`);
  if (room.forbiddenObjects?.includes(resolvedAssetType)) {
    warnings.push(`${name} uses asset "${resolvedAssetType}" which is listed in ${roomId}.forbiddenObjects`);
  }

  if (
    roomId === 'crusher-corridor' &&
    (object?.metadata?.modelUrl || object?.modelUrl) &&
    object?.metadata?.visualOnly !== true
  ) {
    warnings.push(`${name} is a model prop in crusher-corridor and must be metadata.visualOnly`);
  }

  if (asset.placement?.visualOnlyRequired && object?.metadata?.prefab !== 'warningSign' && object?.metadata?.visualOnly !== true) {
    warnings.push(`${name} must be metadata.visualOnly for ${roomId}.${resolvedAssetType}`);
  }

  if (['fake-exit', 'final-route'].includes(roomId) && OFFICE_FURNITURE_ASSET_TYPES.has(resolvedAssetType)) {
    warnings.push(`${name} is office furniture in ${roomId}, which is reserved as a no-office-furniture room`);
  }

  const roomAnchor = roomLayoutAnchors?.[roomId];
  if (roomAnchor && anchorId) {
    const roomZoneIds = collectAnchorZoneIds(roomAnchor);
    if (!roomZoneIds.has(anchorId)) {
      warnings.push(`${name} anchor "${anchorId}" is not present in ${roomId} roomLayoutAnchors`);
    }
  }

  return { valid: warnings.length === 0, warnings };
}

export function validateRoomAssetCounts(architecture = []) {
  const warnings = [];
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
      warnings.push(`${roomId}.${assetType} count ${count} exceeds manifest ideal max ${maxIdealCount}`);
    }
  });

  return { valid: warnings.length === 0, warnings };
}

export function validateArchitectureAgainstRoomAssetManifest(architecture = [], roomLayoutAnchors = null) {
  const manifestResult = validateRoomAssetManifest(roomLayoutAnchors);
  const countResult = validateRoomAssetCounts(architecture);
  const warnings = [...manifestResult.warnings, ...countResult.warnings];
  const errors = [...manifestResult.errors];

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
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
