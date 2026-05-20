// Level 1 V2 Room Asset Manifest
//
// This SOP is specific to the A-H Level 1 V2 floor plan. It does not replace
// the original roomAssetManifest.js used by the current Level 1 map.
//
// All sizes are in real-world meters.
// targetSizeMeters is the preferred visual size for the object.
// maxSizeMeters is the hard upper bound before the placement should be repaired.
// placementZones must match level1V2 roomLayoutAnchors zone ids.
// fallbackPrefab must exist for procedural fallback; "procedural" is the built-in fallback.
// This SOP describes ideal room placement, not a copy of bad current placement.

export const LEVEL1_V2_REQUIRED_ROOMS = [
  'front-admin-intake',
  'canteen',
  'main-workstation-hall',
  'boardroom-review',
  'toilet',
  'records-archive',
  'secondary-workstation',
  'level2-access'
];

export const LEVEL1_V2_VALIDATION_CATEGORIES = {
  SOP_ERROR: 'SOP_ERROR',
  SOP_WARNING: 'SOP_WARNING',
  PLACEMENT_WARNING: 'PLACEMENT_WARNING',
  DEFERRED_REPAIR: 'DEFERRED_REPAIR',
  MANIFEST_MISMATCH: 'MANIFEST_MISMATCH'
};

const LEVEL1_V2_MAIN_CORRIDOR_BOUNDS = { x1: 14, y1: 2, x2: 16, y2: 29 };

export const LEVEL1_V2_ASSET_SIZE_STANDARDS = {
  intakeDesk: {
    targetSizeMeters: [2.4, 1.0, 0.8],
    maxSizeMeters: [3.2, 1.2, 1.0]
  },
  receptionDesk: {
    targetSizeMeters: [2.2, 1.05, 0.75],
    maxSizeMeters: [3.2, 1.2, 1.0]
  },
  taskTerminal: {
    targetSizeMeters: [0.6, 1.2, 0.45],
    maxSizeMeters: [0.8, 1.5, 0.65]
  },
  documentTray: {
    targetSizeMeters: [0.45, 0.12, 0.32],
    maxSizeMeters: [0.65, 0.25, 0.45]
  },
  pottedPlant: {
    targetSizeMeters: [0.55, 1.2, 0.55],
    maxSizeMeters: [0.8, 1.6, 0.8]
  },
  canteenTable: {
    targetSizeMeters: [1.2, 0.75, 0.75],
    maxSizeMeters: [1.6, 0.9, 1.0]
  },
  canteenChair: {
    targetSizeMeters: [0.55, 0.9, 0.55],
    maxSizeMeters: [0.75, 1.1, 0.75]
  },
  vendingMachine: {
    targetSizeMeters: [0.85, 1.9, 0.65],
    maxSizeMeters: [1.1, 2.2, 0.85]
  },
  waterDispenser: {
    targetSizeMeters: [0.35, 1.2, 0.35],
    maxSizeMeters: [0.55, 1.5, 0.55]
  },
  fridgeCabinet: {
    targetSizeMeters: [0.75, 1.8, 0.7],
    maxSizeMeters: [1.0, 2.1, 0.9]
  },
  trashBin: {
    targetSizeMeters: [0.35, 0.65, 0.35],
    maxSizeMeters: [0.5, 0.85, 0.5]
  },
  officeDesk: {
    targetSizeMeters: [1.4, 0.75, 0.75],
    maxSizeMeters: [1.8, 0.9, 0.9]
  },
  officeChair: {
    targetSizeMeters: [0.65, 1.05, 0.65],
    maxSizeMeters: [0.8, 1.25, 0.85]
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
  workstationCluster: {
    targetSizeMeters: [7.0, 1.45, 5.5],
    maxSizeMeters: [7.6, 1.8, 6.2]
  },
  copyMachine: {
    targetSizeMeters: [0.9, 1.1, 0.7],
    maxSizeMeters: [1.2, 1.4, 0.9]
  },
  conferenceTable: {
    targetSizeMeters: [3.2, 0.75, 1.4],
    maxSizeMeters: [4.4, 0.9, 1.8]
  },
  meetingTable: {
    targetSizeMeters: [2.2, 0.75, 1.0],
    maxSizeMeters: [2.8, 0.9, 1.3]
  },
  meetingChair: {
    targetSizeMeters: [0.6, 1.0, 0.6],
    maxSizeMeters: [0.8, 1.2, 0.8]
  },
  wallBoard: {
    targetSizeMeters: [1.8, 1.0, 0.06],
    maxSizeMeters: [2.6, 1.4, 0.12]
  },
  glassPartition: {
    targetSizeMeters: [3.0, 1.8, 0.08],
    maxSizeMeters: [4.4, 2.1, 0.16]
  },
  toiletStall: {
    targetSizeMeters: [0.9, 2.0, 1.3],
    maxSizeMeters: [1.2, 2.3, 1.6]
  },
  sink: {
    targetSizeMeters: [0.55, 0.85, 0.45],
    maxSizeMeters: [0.8, 1.1, 0.65]
  },
  mirror: {
    targetSizeMeters: [0.8, 0.8, 0.04],
    maxSizeMeters: [1.2, 1.2, 0.08]
  },
  handDryer: {
    targetSizeMeters: [0.35, 0.45, 0.18],
    maxSizeMeters: [0.55, 0.65, 0.28]
  },
  archiveRack: {
    targetSizeMeters: [0.8, 1.9, 0.45],
    maxSizeMeters: [1.0, 2.2, 0.7]
  },
  serverRack: {
    targetSizeMeters: [0.8, 1.9, 0.45],
    maxSizeMeters: [1.0, 2.2, 0.7]
  },
  filingCabinet: {
    targetSizeMeters: [0.8, 1.4, 0.45],
    maxSizeMeters: [1.1, 1.8, 0.65]
  },
  archiveBox: {
    targetSizeMeters: [0.55, 0.35, 0.4],
    maxSizeMeters: [0.8, 0.55, 0.6]
  },
  documentPacket: {
    targetSizeMeters: [0.35, 0.04, 0.25],
    maxSizeMeters: [0.55, 0.1, 0.4]
  },
  elevatorDoor: {
    targetSizeMeters: [1.4, 2.2, 0.12],
    maxSizeMeters: [2.0, 2.5, 0.25]
  },
  stairwellDoor: {
    targetSizeMeters: [1.1, 2.1, 0.12],
    maxSizeMeters: [1.6, 2.4, 0.25]
  },
  accessPanel: {
    targetSizeMeters: [0.25, 0.45, 0.08],
    maxSizeMeters: [0.4, 0.65, 0.16]
  },
  level2Sign: {
    targetSizeMeters: [1.4, 0.32, 0.04],
    maxSizeMeters: [2.0, 0.6, 0.12]
  },
  wallSign: {
    targetSizeMeters: [1.6, 0.35, 0.05],
    maxSizeMeters: [2.2, 0.6, 0.12]
  },
  warningTrim: {
    targetSizeMeters: [2.0, 0.08, 0.08],
    maxSizeMeters: [4.0, 0.2, 0.2]
  }
};

export const LEVEL1_V2_GLOBAL_PLACEMENT_RULES = {
  clearancesMeters: {
    playerPath: 0.5,
    doorway: 0.8,
    objective: 0.8,
    elevatorApproach: 1.5,
    chairToDesk: 0.55,
    canteenTableAround: 0.45,
    meetingTableAround: 0.6,
    coffeeTableAround: 0.3
  },
  hardForbiddenZones: [
    'mainCorridor',
    'doorway',
    'objectiveRadius',
    'level2AccessApproach',
    'emergencyOrHazardCenterLane'
  ],
  wallBoundTypes: [
    'vendingMachine',
    'waterDispenser',
    'fridgeCabinet',
    'trashBin',
    'filingCabinet',
    'archiveRack',
    'serverRack',
    'sink',
    'mirror',
    'handDryer',
    'accessPanel',
    'wallBoard',
    'wallSign',
    'level2Sign'
  ],
  facingRequiredTypes: [
    'officeChair',
    'canteenChair',
    'meetingChair',
    'intakeDesk',
    'receptionDesk'
  ],
  roleSeparationRules: [
    'officeChair is for workstation only',
    'canteenChair is for canteen only',
    'meetingChair is for boardroom/review only',
    'receptionDesk is not officeDesk',
    'intakeDesk is not receptionDesk unless explicitly allowed',
    'canteenTable is not meetingTable',
    'conferenceTable is not coffeeTable',
    'archiveRack/serverRack is not filingCabinet',
    'toilet fixtures are never office furniture',
    'level2-access props are not office furniture'
  ]
};

const standard = key => ({
  targetSizeMeters: LEVEL1_V2_ASSET_SIZE_STANDARDS[key].targetSizeMeters,
  maxSizeMeters: LEVEL1_V2_ASSET_SIZE_STANDARDS[key].maxSizeMeters
});

export const LEVEL1_V2_ROOM_ASSET_MANIFEST = {
  'front-admin-intake': {
    function: 'first admin/intake space',
    maxLargeProps: 4,
    allowedAssets: {
      intakeDesk: {
        idealCount: 1,
        ...standard('intakeDesk'),
        placementZones: ['intakeDeskZone'],
        placement: { facing: 'playerApproach', wallBound: false, minClearanceMeters: 0.8 },
        fallbackPrefab: 'intakeDesk'
      },
      receptionDesk: {
        idealCount: [0, 1],
        ...standard('receptionDesk'),
        placementZones: ['frontCounterZone'],
        placement: { facing: 'playerApproach', wallBound: false, minClearanceMeters: 0.8 },
        fallbackPrefab: 'receptionDesk'
      },
      taskTerminal: {
        idealCount: 1,
        ...standard('taskTerminal'),
        placementZones: ['intakeDeskZone'],
        placement: { objectiveLinked: true, desktop: true, minClearanceMeters: 0.8 },
        fallbackPrefab: 'taskTerminal'
      },
      documentTray: {
        idealCount: [0, 1],
        ...standard('documentTray'),
        placementZones: ['intakeDeskZone'],
        placement: { desktop: true, minClearanceMeters: 0.25 },
        fallbackPrefab: 'procedural'
      },
      pottedPlant: {
        idealCount: [0, 1],
        ...standard('pottedPlant'),
        placementZones: ['cornerPlantZone'],
        placement: { cornerOnly: true, wallBound: false, minClearanceMeters: 0.5 },
        fallbackPrefab: 'pottedPlant'
      },
      wallSign: {
        idealCount: 1,
        ...standard('wallSign'),
        placementZones: ['adminEntrySignZone'],
        placement: { wallBound: true, minClearanceMeters: 0.8 },
        fallbackPrefab: 'wallSign'
      }
    },
    forbiddenObjects: ['workstationCluster', 'canteenTable', 'toiletFixture', 'archiveRack', 'emergencyFrame', 'conferenceTable'],
    forbiddenZones: ['mainCorridorEntry', 'doorwayToMainCorridor'],
    placementNotes: [
      'Keep approach path clear.',
      'Desk faces player approach.',
      'Document/form terminal must be visible.',
      'Do not overfill this room.'
    ]
  },
  canteen: {
    function: 'staff canteen / break area',
    maxLargeProps: 5,
    allowedAssets: {
      canteenTable: {
        idealCount: [1, 2],
        ...standard('canteenTable'),
        placementZones: ['canteenSeatingZone'],
        placement: { pairedWith: 'canteenChair', minClearanceMeters: 0.45 },
        fallbackPrefab: 'procedural'
      },
      canteenChair: {
        idealCount: [4, 8],
        ...standard('canteenChair'),
        placementZones: ['canteenSeatingZone'],
        placement: { facing: 'canteenTable', minClearanceMeters: 0.45 },
        fallbackPrefab: 'procedural'
      },
      vendingMachine: {
        idealCount: [0, 1],
        ...standard('vendingMachine'),
        placementZones: ['canteenWallUtilityZone'],
        placement: { wallBound: true, minClearanceMeters: 0.6 },
        fallbackPrefab: 'procedural'
      },
      waterDispenser: {
        idealCount: [0, 1],
        ...standard('waterDispenser'),
        placementZones: ['canteenWallUtilityZone'],
        placement: { wallBound: true, minClearanceMeters: 0.6 },
        fallbackPrefab: 'procedural'
      },
      fridgeCabinet: {
        idealCount: [0, 1],
        ...standard('fridgeCabinet'),
        placementZones: ['canteenWallUtilityZone'],
        placement: { wallBound: true, minClearanceMeters: 0.6 },
        fallbackPrefab: 'procedural'
      },
      trashBin: {
        idealCount: [0, 1],
        ...standard('trashBin'),
        placementZones: ['canteenWallUtilityZone'],
        placement: { wallBound: true, minClearanceMeters: 0.45 },
        fallbackPrefab: 'procedural'
      },
      wallSign: {
        idealCount: 1,
        ...standard('wallSign'),
        placementZones: ['canteenEntrySignZone'],
        placement: { wallBound: true, minClearanceMeters: 0.8 },
        fallbackPrefab: 'wallSign'
      }
    },
    forbiddenObjects: ['officeChair', 'workstationCluster', 'meetingTable', 'conferenceTable', 'archiveRack', 'emergencyFrame'],
    forbiddenZones: ['canteenDoorway', 'mainCorridorConnector'],
    placementNotes: [
      'Tables and chairs stay inside canteen seating zones.',
      'Vending/fridge/trash stay wall-bound.',
      'Do not use office chairs.',
      'Keep doorway clear.'
    ]
  },
  'main-workstation-hall': {
    function: 'main employee workstation rows',
    maxLargeProps: 5,
    allowedAssets: {
      workstationCluster: {
        idealCount: [2, 4],
        ...standard('workstationCluster'),
        placementZones: ['mainWorkstationRowsNorth', 'mainWorkstationRowsSouth'],
        placement: { rowAligned: true, minClearanceMeters: 0.6 },
        fallbackPrefab: 'procedural',
        composedOf: ['officeDesk', 'officeChair', 'monitor', 'keyboard', 'partition']
      },
      officeDesk: {
        idealCount: [8, 24],
        ...standard('officeDesk'),
        placementZones: ['mainWorkstationRowsNorth', 'mainWorkstationRowsSouth'],
        placement: { pairedWith: 'officeChair', rowAligned: true, minClearanceMeters: 0.5 },
        fallbackPrefab: 'procedural'
      },
      officeChair: {
        idealCount: [8, 24],
        ...standard('officeChair'),
        placementZones: ['mainWorkstationRowsNorth', 'mainWorkstationRowsSouth'],
        placement: { facing: 'officeDesk', minClearanceMeters: 0.55 },
        fallbackPrefab: 'procedural'
      },
      monitor: {
        idealCount: [8, 24],
        ...standard('monitor'),
        placementZones: ['mainWorkstationRowsNorth', 'mainWorkstationRowsSouth'],
        placement: { desktop: true, minClearanceMeters: 0.2 },
        fallbackPrefab: 'procedural'
      },
      keyboard: {
        idealCount: [8, 24],
        ...standard('keyboard'),
        placementZones: ['mainWorkstationRowsNorth', 'mainWorkstationRowsSouth'],
        placement: { desktop: true, minClearanceMeters: 0.2 },
        fallbackPrefab: 'procedural'
      },
      partition: {
        idealCount: [6, 24],
        ...standard('partition'),
        placementZones: ['mainWorkstationRowsNorth', 'mainWorkstationRowsSouth'],
        placement: { rowAligned: true, minClearanceMeters: 0.2 },
        fallbackPrefab: 'procedural'
      },
      copyMachine: {
        idealCount: [0, 1],
        ...standard('copyMachine'),
        placementZones: ['mainPrinterZone'],
        placement: { wallBound: true, minClearanceMeters: 0.6 },
        fallbackPrefab: 'copyMachine'
      },
      wallSign: {
        idealCount: 1,
        ...standard('wallSign'),
        placementZones: ['workstationEntrySignZone'],
        placement: { wallBound: true, minClearanceMeters: 0.8 },
        fallbackPrefab: 'departmentSign'
      }
    },
    forbiddenObjects: ['canteenTable', 'toiletFixture', 'sofa', 'emergencyFrame', 'archiveRack'],
    forbiddenZones: ['mainWorkstationCentralAisle', 'mainCorridorConnector'],
    placementNotes: [
      'Central aisle stays clear.',
      'Workstation rows stay aligned.',
      'Office chairs face desks.',
      'Copy machine stays in side printer zone.'
    ]
  },
  'boardroom-review': {
    function: 'boardroom / formal review chamber',
    maxLargeProps: 4,
    allowedAssets: {
      conferenceTable: {
        idealCount: 1,
        ...standard('conferenceTable'),
        placementZones: ['conferenceTableZone'],
        placement: { central: true, minClearanceMeters: 0.6 },
        fallbackPrefab: 'procedural'
      },
      meetingTable: {
        idealCount: [0, 1],
        ...standard('meetingTable'),
        placementZones: ['conferenceTableZone'],
        placement: { central: true, temporaryFallbackFor: 'conferenceTable', minClearanceMeters: 0.6 },
        fallbackPrefab: 'meetingTable'
      },
      meetingChair: {
        idealCount: [6, 10],
        ...standard('meetingChair'),
        placementZones: ['conferenceChairRingZone'],
        placement: { facing: 'conferenceTable', minClearanceMeters: 0.6 },
        fallbackPrefab: 'procedural'
      },
      taskTerminal: {
        idealCount: [0, 1],
        ...standard('taskTerminal'),
        placementZones: ['reviewTerminalZone'],
        placement: { objectiveLinked: true, minClearanceMeters: 0.8 },
        fallbackPrefab: 'taskTerminal'
      },
      wallBoard: {
        idealCount: [0, 1],
        ...standard('wallBoard'),
        placementZones: ['presentationWallZone'],
        placement: { wallBound: true, minClearanceMeters: 0.6 },
        fallbackPrefab: 'procedural'
      },
      glassPartition: {
        idealCount: [0, 1],
        ...standard('glassPartition'),
        placementZones: ['reviewBoundaryGlassZone'],
        placement: { boundaryAligned: true, minClearanceMeters: 0.7 },
        fallbackPrefab: 'reviewGlassPartition'
      },
      wallSign: {
        idealCount: 1,
        ...standard('wallSign'),
        placementZones: ['boardroomEntrySignZone'],
        placement: { wallBound: true, minClearanceMeters: 0.8 },
        fallbackPrefab: 'departmentSign'
      }
    },
    forbiddenObjects: ['workstationCluster', 'canteenTable', 'toiletFixture', 'archiveRack', 'emergencyFrame'],
    forbiddenZones: ['boardroomDoorway', 'connectorClearPath'],
    placementNotes: [
      'Conference table stays central.',
      'Meeting chairs face table.',
      'Doorway clearance must stay open.',
      'Review terminal remains readable.'
    ]
  },
  toilet: {
    function: 'restroom / toilet area',
    maxLargeProps: 5,
    allowedAssets: {
      toiletStall: {
        idealCount: [2, 4],
        ...standard('toiletStall'),
        placementZones: ['toiletStallZone'],
        placement: { wallSideOrRearSide: true, minClearanceMeters: 0.5 },
        fallbackPrefab: 'procedural'
      },
      sink: {
        idealCount: [1, 2],
        ...standard('sink'),
        placementZones: ['sinkWallZone'],
        placement: { wallBound: true, minClearanceMeters: 0.5 },
        fallbackPrefab: 'procedural'
      },
      mirror: {
        idealCount: [1, 2],
        ...standard('mirror'),
        placementZones: ['sinkWallZone'],
        placement: { wallBound: true, above: 'sink', minClearanceMeters: 0.5 },
        fallbackPrefab: 'procedural'
      },
      handDryer: {
        idealCount: [0, 1],
        ...standard('handDryer'),
        placementZones: ['sinkWallZone'],
        placement: { wallBound: true, minClearanceMeters: 0.5 },
        fallbackPrefab: 'procedural'
      },
      trashBin: {
        idealCount: [0, 1],
        ...standard('trashBin'),
        placementZones: ['toiletUtilityCorner'],
        placement: { wallBound: true, cornerOnly: true, minClearanceMeters: 0.4 },
        fallbackPrefab: 'procedural'
      },
      wallSign: {
        idealCount: 1,
        ...standard('wallSign'),
        placementZones: ['toiletEntrySignZone'],
        placement: { wallBound: true, minClearanceMeters: 0.8 },
        fallbackPrefab: 'wallSign'
      }
    },
    forbiddenObjects: ['officeDesk', 'officeChair', 'workstationCluster', 'meetingTable', 'conferenceTable', 'archiveRack', 'copyMachine'],
    forbiddenZones: ['toiletDoorway'],
    placementNotes: [
      'Toilet stalls stay wall-side or rear-side.',
      'Sink/mirror wall-bound.',
      'No office furniture.',
      'Doorway stays clear.'
    ]
  },
  'records-archive': {
    function: 'archive / records storage',
    maxLargeProps: 6,
    allowedAssets: {
      archiveRack: {
        idealCount: [3, 5],
        ...standard('archiveRack'),
        placementZones: ['archiveRackRows'],
        placement: { rowAligned: true, minClearanceMeters: 0.6 },
        fallbackPrefab: 'procedural'
      },
      serverRack: {
        idealCount: [0, 2],
        ...standard('serverRack'),
        placementZones: ['archiveRackRows'],
        placement: { rowAligned: true, wallBound: true, minClearanceMeters: 0.6 },
        fallbackPrefab: 'serverRackRow'
      },
      filingCabinet: {
        idealCount: [1, 3],
        ...standard('filingCabinet'),
        placementZones: ['archiveWallCabinetZone'],
        placement: { wallBound: true, minClearanceMeters: 0.5 },
        fallbackPrefab: 'procedural'
      },
      archiveBox: {
        idealCount: [2, 6],
        ...standard('archiveBox'),
        placementZones: ['archiveRackRows', 'archiveWallCabinetZone'],
        placement: { shelfOrCabinetTop: true, minClearanceMeters: 0.35 },
        fallbackPrefab: 'procedural'
      },
      documentPacket: {
        idealCount: [0, 1],
        ...standard('documentPacket'),
        placementZones: ['archiveObjectiveZone'],
        placement: { objectiveLinked: true, minClearanceMeters: 0.8 },
        fallbackPrefab: 'procedural'
      },
      taskTerminal: {
        idealCount: [0, 1],
        ...standard('taskTerminal'),
        placementZones: ['archiveObjectiveZone'],
        placement: { objectiveLinked: true, minClearanceMeters: 0.8 },
        fallbackPrefab: 'taskTerminal'
      },
      wallSign: {
        idealCount: 1,
        ...standard('wallSign'),
        placementZones: ['archiveEntrySignZone'],
        placement: { wallBound: true, minClearanceMeters: 0.8 },
        fallbackPrefab: 'wallSign'
      }
    },
    forbiddenObjects: ['sofa', 'canteenTable', 'meetingTable', 'conferenceTable', 'workstationCluster'],
    forbiddenZones: ['archiveAisleBetweenRows', 'archiveDoorway'],
    placementNotes: [
      'Racks/cabinets stay row-based or wall-bound.',
      'Aisle between racks stays clear.',
      'Document packet/objective remains reachable.'
    ]
  },
  'secondary-workstation': {
    function: 'secondary workstation / accounts processing',
    maxLargeProps: 5,
    allowedAssets: {
      officeDesk: {
        idealCount: [4, 8],
        ...standard('officeDesk'),
        placementZones: ['secondaryDeskRows'],
        placement: { pairedWith: 'officeChair', rowAligned: true, minClearanceMeters: 0.5 },
        fallbackPrefab: 'officeDesk'
      },
      officeChair: {
        idealCount: [4, 8],
        ...standard('officeChair'),
        placementZones: ['secondaryDeskRows'],
        placement: { facing: 'officeDesk', minClearanceMeters: 0.55 },
        fallbackPrefab: 'procedural'
      },
      monitor: {
        idealCount: [4, 8],
        ...standard('monitor'),
        placementZones: ['secondaryDeskRows'],
        placement: { desktop: true, minClearanceMeters: 0.2 },
        fallbackPrefab: 'procedural'
      },
      keyboard: {
        idealCount: [4, 8],
        ...standard('keyboard'),
        placementZones: ['secondaryDeskRows'],
        placement: { desktop: true, minClearanceMeters: 0.2 },
        fallbackPrefab: 'procedural'
      },
      filingCabinet: {
        idealCount: [0, 2],
        ...standard('filingCabinet'),
        placementZones: ['secondaryWallCabinetZone'],
        placement: { wallBound: true, minClearanceMeters: 0.5 },
        fallbackPrefab: 'procedural'
      },
      documentTray: {
        idealCount: [0, 2],
        ...standard('documentTray'),
        placementZones: ['secondaryDeskRows'],
        placement: { desktop: true, minClearanceMeters: 0.25 },
        fallbackPrefab: 'procedural'
      },
      taskTerminal: {
        idealCount: [0, 1],
        ...standard('taskTerminal'),
        placementZones: ['secondaryObjectiveZone'],
        placement: { objectiveLinked: true, minClearanceMeters: 0.8 },
        fallbackPrefab: 'taskTerminal'
      },
      wallSign: {
        idealCount: 1,
        ...standard('wallSign'),
        placementZones: ['secondaryEntrySignZone'],
        placement: { wallBound: true, minClearanceMeters: 0.8 },
        fallbackPrefab: 'departmentSign'
      }
    },
    forbiddenObjects: ['canteenTable', 'toiletFixture', 'emergencyFrame', 'sofa', 'conferenceTable'],
    forbiddenZones: ['secondaryCentralAisle', 'level2AccessConnector'],
    placementNotes: [
      'Smaller rows than main workstation.',
      'Office chairs face desks.',
      'Filing cabinets wall-bound.',
      'Keep route to level2-access clear.'
    ]
  },
  'level2-access': {
    function: 'lift or stairs to Level 2',
    maxLargeProps: 3,
    allowedAssets: {
      elevatorDoor: {
        idealCount: [0, 1],
        ...standard('elevatorDoor'),
        placementZones: ['elevatorDoorZone'],
        placement: { focalPoint: true, wallBound: true, minClearanceMeters: 1.5 },
        fallbackPrefab: 'finalDoorSlab'
      },
      stairwellDoor: {
        idealCount: [0, 1],
        ...standard('stairwellDoor'),
        placementZones: ['stairwellDoorZone'],
        placement: { wallBound: true, minClearanceMeters: 1.5 },
        fallbackPrefab: 'finalDoorSlab'
      },
      accessPanel: {
        idealCount: [0, 1],
        ...standard('accessPanel'),
        placementZones: ['accessPanelZone'],
        placement: { wallBound: true, minClearanceMeters: 1.5 },
        fallbackPrefab: 'procedural'
      },
      level2Sign: {
        idealCount: 1,
        ...standard('level2Sign'),
        placementZones: ['level2AccessSignZone'],
        placement: { wallBound: true, minClearanceMeters: 1.5 },
        fallbackPrefab: 'wallSign'
      },
      warningTrim: {
        idealCount: [0, 2],
        ...standard('warningTrim'),
        placementZones: ['level2AccessTrimZone'],
        placement: { wallBound: true, visualOnly: true, minClearanceMeters: 1.5 },
        fallbackPrefab: 'procedural'
      }
    },
    forbiddenObjects: ['officeDesk', 'officeChair', 'canteenTable', 'sofa', 'archiveRack', 'copyMachine', 'meetingTable'],
    forbiddenZones: ['level2AccessApproach', 'mainCorridorEndpoint'],
    placementNotes: [
      'Elevator/stairs are focal point.',
      'Route to elevator/stairs must stay clear.',
      'No office furniture.',
      'Access panel stays wall-bound.'
    ]
  }
};

export const LEVEL1_V2_PREFAB_TO_MANIFEST_ASSET_TYPE = {
  waitingChairs: {
    default: 'waitingChair',
    byRoom: {
      canteen: 'canteenChair'
    }
  },
  officeChairSet: 'officeChair',
  pottedPlant: 'pottedPlant',
  receptionDesk: 'receptionDesk',
  intakeDesk: 'intakeDesk',
  officeDesk: 'officeDesk',
  coffeeTable: {
    default: 'coffeeTable',
    byRoom: {
      canteen: 'canteenTable'
    }
  },
  copyMachine: 'copyMachine',
  meetingTable: 'meetingTable',
  serverRackRow: 'serverRack',
  emergencyDoorFrame: 'emergencyFrame',
  emergencyWarningTrim: 'warningTrim',
  finalDoorSlab: {
    default: 'finalDoorSlab',
    byRoom: {
      'level2-access': 'elevatorDoor'
    },
    byRoomAnchor: {
      'level2-access': {
        elevatorDoorZone: 'elevatorDoor',
        stairwellDoorZone: 'stairwellDoor'
      }
    }
  },
  workstationCluster: 'workstationCluster',
  workstationClusterLeft: 'workstationCluster',
  workstationClusterRight: 'workstationCluster',
  wallSign: {
    default: 'wallSign',
    byRoom: {
      'level2-access': 'level2Sign'
    }
  },
  departmentSign: 'wallSign',
  exitSign: {
    default: 'wallSign',
    byRoom: {
      'level2-access': 'level2Sign'
    }
  },
  taskTerminal: 'taskTerminal',
  reviewGlassPartition: 'glassPartition',
  officeFrontGlass: 'glassPartition',
  officeSofa: 'sofa'
};

export const LEVEL1_V2_ROOM_REPAIR_PRIORITIES = [
  {
    roomId: 'canteen',
    priority: 'high',
    issue: 'Add dedicated canteen table/chair procedural prefabs or model-backed assets later; do not reuse office chairs.'
  },
  {
    roomId: 'boardroom-review',
    priority: 'medium',
    issue: 'Add a dedicated conferenceTable prefab later; meetingTable is only a temporary scaffold placeholder.'
  },
  {
    roomId: 'toilet',
    priority: 'medium',
    issue: 'Toilet fixtures are SOP-only until procedural restroom fixtures are implemented.'
  },
  {
    roomId: 'level2-access',
    priority: 'medium',
    issue: 'Replace finalDoorSlab placeholder with dedicated elevatorDoor/stairwellDoor visuals when assets exist.'
  },
  {
    roomId: 'records-archive',
    priority: 'low',
    issue: 'ArchiveRack is SOP-only; serverRackRow is the only safe storage placeholder in the scaffold.'
  }
];

const KNOWN_LEVEL1_V2_FALLBACK_PREFABS = new Set([
  'procedural',
  'intakeDesk',
  'receptionDesk',
  'taskTerminal',
  'pottedPlant',
  'wallSign',
  'departmentSign',
  'officeDesk',
  'copyMachine',
  'meetingTable',
  'reviewGlassPartition',
  'serverRackRow',
  'finalDoorSlab'
]);

const OFFICE_FURNITURE_ASSET_TYPES = new Set([
  'officeDesk',
  'officeChair',
  'workstationCluster',
  'monitor',
  'keyboard',
  'partition',
  'copyMachine',
  'meetingTable',
  'meetingChair',
  'conferenceTable',
  'sofa',
  'receptionDesk',
  'intakeDesk',
  'filingCabinet'
]);

const zoneCollections = [
  'furnitureZones',
  'signageZones',
  'glassZones',
  'doorZones',
  'wallZones',
  'utilityZones',
  'trimZones',
  'forbiddenZones'
];

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

function getObjectName(object) {
  return object?.id ?? object?.metadata?.prefab ?? object?.type ?? 'architecture-object';
}

function getObjectRoomId(object) {
  return object?.metadata?.roomId ?? object?.roomId;
}

function getObjectAnchorId(object) {
  const anchor = object?.metadata?.anchor ?? object?.anchor;
  if (!anchor) return undefined;
  if (typeof anchor === 'string') return anchor;
  return anchor.id;
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

function countContribution(object) {
  const prefab = object?.metadata?.prefab;
  if (prefab === 'waitingChairs' && Number.isInteger(object?.count)) return object.count;
  if (prefab === 'officeChairSet' && Number.isInteger(object?.count)) return object.count;
  return 1;
}

function collectRoomZones(roomAnchor) {
  const zones = [];
  zoneCollections.forEach(collectionName => {
    roomAnchor?.[collectionName]?.forEach(zone => zones.push({ ...zone, collectionName }));
  });
  return zones;
}

function collectAnchorZoneIds(roomAnchor) {
  return new Set(collectRoomZones(roomAnchor).map(zone => zone.id));
}

function findAnchorZone(roomAnchor, zoneId) {
  return collectRoomZones(roomAnchor).find(zone => zone.id === zoneId);
}

function pointInBounds(point, bounds) {
  if (!point || !bounds) return false;
  return point.x >= bounds.x1 && point.x <= bounds.x2 && point.y >= bounds.y1 && point.y <= bounds.y2;
}

function objectPoint(object) {
  const x = object?.x ?? object?.position?.x;
  const y = object?.y ?? object?.position?.z;
  if (typeof x !== 'number' || typeof y !== 'number') return null;
  return { x, y };
}

function fallbackExists(fallbackPrefab) {
  return KNOWN_LEVEL1_V2_FALLBACK_PREFABS.has(fallbackPrefab);
}

function resolveContextMapping(mapping, object, roomId) {
  if (!mapping) return undefined;
  if (typeof mapping === 'string') return mapping;

  const anchorId = getObjectAnchorId(object);
  const anchorMapping = mapping.byRoomAnchor?.[roomId]?.[anchorId];
  if (anchorMapping) return anchorMapping;
  if (mapping.byRoom?.[roomId]) return mapping.byRoom[roomId];
  return mapping.default;
}

export function getLevel1V2ManifestAssetTypeForObject(object) {
  const prefab = object?.metadata?.prefab;
  const byPrefab = resolveContextMapping(LEVEL1_V2_PREFAB_TO_MANIFEST_ASSET_TYPE[prefab], object, getObjectRoomId(object));
  if (byPrefab) return byPrefab;

  const byType = resolveContextMapping(LEVEL1_V2_PREFAB_TO_MANIFEST_ASSET_TYPE[object?.type], object, getObjectRoomId(object));
  if (byType) return byType;

  return object?.type;
}

export function validateLevel1V2RoomAssetManifest(roomLayoutAnchors = null) {
  const errorIssues = [];
  const warningIssues = [];

  LEVEL1_V2_REQUIRED_ROOMS.forEach(roomId => {
    if (!LEVEL1_V2_ROOM_ASSET_MANIFEST[roomId]) {
      pushIssue(errorIssues, LEVEL1_V2_VALIDATION_CATEGORIES.SOP_ERROR, `${roomId} is missing from LEVEL1_V2_ROOM_ASSET_MANIFEST`, {
        roomId
      });
    }
  });

  Object.entries(LEVEL1_V2_ROOM_ASSET_MANIFEST).forEach(([roomId, room]) => {
    if (!room.function) {
      pushIssue(errorIssues, LEVEL1_V2_VALIDATION_CATEGORIES.SOP_ERROR, `${roomId} manifest is missing function`, { roomId });
    }
    if (!Number.isInteger(room.maxLargeProps) || room.maxLargeProps < 0) {
      pushIssue(errorIssues, LEVEL1_V2_VALIDATION_CATEGORIES.SOP_ERROR, `${roomId} maxLargeProps must be a non-negative integer`, {
        roomId
      });
    }
    if (!isObject(room.allowedAssets) || Object.keys(room.allowedAssets).length === 0) {
      pushIssue(errorIssues, LEVEL1_V2_VALIDATION_CATEGORIES.SOP_ERROR, `${roomId} manifest must declare allowedAssets`, {
        roomId
      });
    }
    if (!Array.isArray(room.forbiddenObjects)) {
      pushIssue(errorIssues, LEVEL1_V2_VALIDATION_CATEGORIES.SOP_ERROR, `${roomId} manifest must declare forbiddenObjects`, {
        roomId
      });
    }
    if (!Array.isArray(room.forbiddenZones)) {
      pushIssue(errorIssues, LEVEL1_V2_VALIDATION_CATEGORIES.SOP_ERROR, `${roomId} manifest must declare forbiddenZones`, {
        roomId
      });
    }
    if (!Array.isArray(room.placementNotes) || room.placementNotes.length === 0) {
      pushIssue(warningIssues, LEVEL1_V2_VALIDATION_CATEGORIES.SOP_WARNING, `${roomId} manifest is missing placementNotes`, {
        roomId
      });
    }

    const anchorZoneIds = roomLayoutAnchors?.[roomId] ? collectAnchorZoneIds(roomLayoutAnchors[roomId]) : null;

    Object.entries(room.allowedAssets ?? {}).forEach(([assetType, asset]) => {
      if (!isValidIdealCount(asset.idealCount)) {
        pushIssue(errorIssues, LEVEL1_V2_VALIDATION_CATEGORIES.SOP_ERROR, `${roomId}.${assetType} has invalid idealCount`, {
          roomId,
          assetType
        });
      }
      if (!isSizeTuple(asset.targetSizeMeters)) {
        pushIssue(errorIssues, LEVEL1_V2_VALIDATION_CATEGORIES.SOP_ERROR, `${roomId}.${assetType} is missing targetSizeMeters`, {
          roomId,
          assetType
        });
      }
      if (!isSizeTuple(asset.maxSizeMeters)) {
        pushIssue(errorIssues, LEVEL1_V2_VALIDATION_CATEGORIES.SOP_ERROR, `${roomId}.${assetType} is missing maxSizeMeters`, {
          roomId,
          assetType
        });
      }
      if (targetExceedsMax(asset.targetSizeMeters, asset.maxSizeMeters)) {
        pushIssue(errorIssues, LEVEL1_V2_VALIDATION_CATEGORIES.SOP_ERROR, `${roomId}.${assetType} targetSizeMeters exceeds maxSizeMeters`, {
          roomId,
          assetType
        });
      }
      if (!Array.isArray(asset.placementZones) || asset.placementZones.length === 0) {
        pushIssue(errorIssues, LEVEL1_V2_VALIDATION_CATEGORIES.SOP_ERROR, `${roomId}.${assetType} must declare placementZones`, {
          roomId,
          assetType
        });
      }
      if (!isObject(asset.placement) || Object.keys(asset.placement).length === 0) {
        pushIssue(errorIssues, LEVEL1_V2_VALIDATION_CATEGORIES.SOP_ERROR, `${roomId}.${assetType} must declare placement rules`, {
          roomId,
          assetType
        });
      }
      if (!asset.fallbackPrefab) {
        pushIssue(errorIssues, LEVEL1_V2_VALIDATION_CATEGORIES.SOP_ERROR, `${roomId}.${assetType} must declare fallbackPrefab`, {
          roomId,
          assetType
        });
      } else if (!fallbackExists(asset.fallbackPrefab)) {
        pushIssue(errorIssues, LEVEL1_V2_VALIDATION_CATEGORIES.SOP_ERROR, `${roomId}.${assetType} fallbackPrefab "${asset.fallbackPrefab}" is not known`, {
          roomId,
          assetType,
          fallbackPrefab: asset.fallbackPrefab
        });
      }
      if (room.forbiddenObjects?.includes(assetType)) {
        pushIssue(errorIssues, LEVEL1_V2_VALIDATION_CATEGORIES.SOP_ERROR, `${roomId}.${assetType} is both allowed and forbidden`, {
          roomId,
          assetType
        });
      }
      if (anchorZoneIds) {
        asset.placementZones?.forEach(zoneId => {
          if (!anchorZoneIds.has(zoneId)) {
            pushIssue(warningIssues, LEVEL1_V2_VALIDATION_CATEGORIES.MANIFEST_MISMATCH, `${roomId}.${assetType} placement zone "${zoneId}" is not present in roomLayoutAnchors`, {
              roomId,
              assetType,
              zoneId
            });
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

export function validateLevel1V2ObjectAgainstManifest(object, roomId = getObjectRoomId(object), assetType = null, roomLayoutAnchors = null) {
  const warningIssues = [];
  const name = getObjectName(object);
  const resolvedAssetType = assetType ?? getLevel1V2ManifestAssetTypeForObject(object);
  const room = LEVEL1_V2_ROOM_ASSET_MANIFEST[roomId];
  const objectPosition = objectPoint(object);

  if (roomId === 'main-corridor') {
    pushIssue(warningIssues, LEVEL1_V2_VALIDATION_CATEGORIES.PLACEMENT_WARNING, `${name} is assigned to main-corridor, which must stay furniture-free`, {
      roomId,
      assetType: resolvedAssetType,
      objectName: name
    });
  }

  if (objectPosition && pointInBounds(objectPosition, LEVEL1_V2_MAIN_CORRIDOR_BOUNDS)) {
    pushIssue(warningIssues, LEVEL1_V2_VALIDATION_CATEGORIES.PLACEMENT_WARNING, `${name} sits inside the main corridor clear bounds`, {
      roomId,
      assetType: resolvedAssetType,
      objectName: name
    });
  }

  if (!room) {
    pushIssue(warningIssues, LEVEL1_V2_VALIDATION_CATEGORIES.MANIFEST_MISMATCH, `${name} references room "${roomId}" with no V2 room manifest entry`, {
      roomId,
      assetType: resolvedAssetType,
      objectName: name
    });
    return { valid: false, warnings: formatIssues(warningIssues), issues: warningIssues };
  }

  const asset = room.allowedAssets?.[resolvedAssetType];
  if (!asset) {
    pushIssue(warningIssues, LEVEL1_V2_VALIDATION_CATEGORIES.MANIFEST_MISMATCH, `${name} uses asset "${resolvedAssetType}" which is not allowed in ${roomId}`, {
      roomId,
      assetType: resolvedAssetType,
      objectName: name
    });
  }

  if (room.forbiddenObjects?.includes(resolvedAssetType)) {
    pushIssue(warningIssues, LEVEL1_V2_VALIDATION_CATEGORIES.PLACEMENT_WARNING, `${name} uses forbidden asset "${resolvedAssetType}" in ${roomId}`, {
      roomId,
      assetType: resolvedAssetType,
      objectName: name
    });
  }

  if (roomId === 'toilet' && OFFICE_FURNITURE_ASSET_TYPES.has(resolvedAssetType)) {
    pushIssue(warningIssues, LEVEL1_V2_VALIDATION_CATEGORIES.PLACEMENT_WARNING, `${name} is office furniture in toilet`, {
      roomId,
      assetType: resolvedAssetType,
      objectName: name
    });
  }

  if (roomId === 'canteen' && resolvedAssetType === 'officeChair') {
    pushIssue(warningIssues, LEVEL1_V2_VALIDATION_CATEGORIES.PLACEMENT_WARNING, `${name} uses officeChair in canteen`, {
      roomId,
      assetType: resolvedAssetType,
      objectName: name
    });
  }

  if (roomId === 'level2-access' && OFFICE_FURNITURE_ASSET_TYPES.has(resolvedAssetType)) {
    pushIssue(warningIssues, LEVEL1_V2_VALIDATION_CATEGORIES.PLACEMENT_WARNING, `${name} is office furniture in level2-access`, {
      roomId,
      assetType: resolvedAssetType,
      objectName: name
    });
  }

  const anchorId = getObjectAnchorId(object);
  if (asset && anchorId && !asset.placementZones.includes(anchorId)) {
    pushIssue(warningIssues, LEVEL1_V2_VALIDATION_CATEGORIES.PLACEMENT_WARNING, `${name} uses anchor "${anchorId}", but ${roomId}.${resolvedAssetType} allows ${asset.placementZones.join(', ')}`, {
      roomId,
      assetType: resolvedAssetType,
      objectName: name,
      anchorId
    });
  }

  const roomAnchor = roomLayoutAnchors?.[roomId];
  if (roomAnchor && anchorId) {
    const zone = findAnchorZone(roomAnchor, anchorId);
    if (!zone) {
      pushIssue(warningIssues, LEVEL1_V2_VALIDATION_CATEGORIES.MANIFEST_MISMATCH, `${name} anchor "${anchorId}" is not present in ${roomId} roomLayoutAnchors`, {
        roomId,
        assetType: resolvedAssetType,
        objectName: name,
        anchorId
      });
    } else if (zone.collectionName === 'forbiddenZones') {
      pushIssue(warningIssues, LEVEL1_V2_VALIDATION_CATEGORIES.PLACEMENT_WARNING, `${name} is anchored to forbidden zone "${anchorId}" in ${roomId}`, {
        roomId,
        assetType: resolvedAssetType,
        objectName: name,
        anchorId
      });
    }

    roomAnchor.forbiddenZones?.forEach(zoneCandidate => {
      if (objectPosition && pointInBounds(objectPosition, zoneCandidate.bounds)) {
        pushIssue(warningIssues, LEVEL1_V2_VALIDATION_CATEGORIES.PLACEMENT_WARNING, `${name} sits inside forbidden zone "${zoneCandidate.id}" in ${roomId}`, {
          roomId,
          assetType: resolvedAssetType,
          objectName: name,
          forbiddenZoneId: zoneCandidate.id
        });
      }
    });
  }

  return {
    valid: warningIssues.length === 0,
    warnings: formatIssues(warningIssues),
    issues: warningIssues
  };
}

export function validateLevel1V2RoomAssetCounts(architecture = []) {
  const warningIssues = [];
  const countsByRoom = new Map();

  architecture.forEach(object => {
    const roomId = getObjectRoomId(object);
    if (!roomId) return;
    const assetType = getLevel1V2ManifestAssetTypeForObject(object);
    if (!assetType) return;

    const key = `${roomId}:${assetType}`;
    countsByRoom.set(key, (countsByRoom.get(key) ?? 0) + countContribution(object, assetType));
  });

  countsByRoom.forEach((count, key) => {
    const [roomId, assetType] = key.split(':');
    const asset = LEVEL1_V2_ROOM_ASSET_MANIFEST[roomId]?.allowedAssets?.[assetType];
    if (!asset || !isValidIdealCount(asset.idealCount)) return;

    const maxIdealCount = idealCountMax(asset.idealCount);
    if (count > maxIdealCount) {
      pushIssue(warningIssues, LEVEL1_V2_VALIDATION_CATEGORIES.PLACEMENT_WARNING, `${roomId}.${assetType} count ${count} exceeds manifest ideal max ${maxIdealCount}`, {
        roomId,
        assetType,
        count,
        maxIdealCount
      });
    }
  });

  return {
    valid: warningIssues.length === 0,
    warnings: formatIssues(warningIssues),
    issues: warningIssues
  };
}

export function validateLevel1V2ArchitectureAgainstManifest(architecture = [], roomLayoutAnchors = null) {
  const manifestResult = validateLevel1V2RoomAssetManifest(roomLayoutAnchors);
  const countResult = validateLevel1V2RoomAssetCounts(architecture);
  const errors = [...manifestResult.errors];
  const warnings = [...manifestResult.warnings, ...countResult.warnings];
  const issues = [
    ...(manifestResult.issues ?? []),
    ...(countResult.issues ?? [])
  ];

  architecture.forEach(object => {
    const result = validateLevel1V2ObjectAgainstManifest(
      object,
      getObjectRoomId(object),
      getLevel1V2ManifestAssetTypeForObject(object),
      roomLayoutAnchors
    );
    result.warnings.forEach(warning => warnings.push(warning));
    result.issues?.forEach(issue => issues.push(issue));
  });

  const deferredRepairs = LEVEL1_V2_ROOM_REPAIR_PRIORITIES.map(candidate =>
    createValidationIssue(
      LEVEL1_V2_VALIDATION_CATEGORIES.DEFERRED_REPAIR,
      `${candidate.roomId} (${candidate.priority}): ${candidate.issue}`,
      candidate
    )
  );

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    deferredRepairs: formatIssues(deferredRepairs),
    issues: [...issues, ...deferredRepairs]
  };
}

export function summarizeLevel1V2RoomAssetManifest(roomLayoutAnchors = null) {
  const roomsMissingPlacementNotes = [];
  const assetsMissingFallbackPrefab = [];
  const placementZonesNotFound = [];
  const unknownFallbackPrefabs = [];
  let totalAssetRules = 0;

  Object.entries(LEVEL1_V2_ROOM_ASSET_MANIFEST).forEach(([roomId, room]) => {
    if (!Array.isArray(room.placementNotes) || room.placementNotes.length === 0) {
      roomsMissingPlacementNotes.push(roomId);
    }

    const anchorZoneIds = roomLayoutAnchors?.[roomId] ? collectAnchorZoneIds(roomLayoutAnchors[roomId]) : null;

    Object.entries(room.allowedAssets ?? {}).forEach(([assetType, asset]) => {
      totalAssetRules += 1;

      if (!asset.fallbackPrefab) {
        assetsMissingFallbackPrefab.push(`${roomId}.${assetType}`);
      } else if (!fallbackExists(asset.fallbackPrefab)) {
        unknownFallbackPrefabs.push(`${roomId}.${assetType}:${asset.fallbackPrefab}`);
      }

      if (anchorZoneIds) {
        asset.placementZones?.forEach(zoneId => {
          if (!anchorZoneIds.has(zoneId)) {
            placementZonesNotFound.push(`${roomId}.${assetType}:${zoneId}`);
          }
        });
      }
    });
  });

  return {
    totalRoomsCovered: Object.keys(LEVEL1_V2_ROOM_ASSET_MANIFEST).length,
    requiredRoomsCovered: LEVEL1_V2_REQUIRED_ROOMS.filter(roomId => LEVEL1_V2_ROOM_ASSET_MANIFEST[roomId]),
    requiredRoomsMissing: LEVEL1_V2_REQUIRED_ROOMS.filter(roomId => !LEVEL1_V2_ROOM_ASSET_MANIFEST[roomId]),
    totalAssetRules,
    roomsMissingPlacementNotes,
    assetsMissingFallbackPrefab,
    unknownFallbackPrefabs,
    placementZonesNotFound,
    deferredRepairCandidates: LEVEL1_V2_ROOM_REPAIR_PRIORITIES.map(candidate => ({
      ...candidate,
      category: LEVEL1_V2_VALIDATION_CATEGORIES.DEFERRED_REPAIR
    }))
  };
}
