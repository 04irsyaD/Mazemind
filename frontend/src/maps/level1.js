import { CONSTANTS } from '../core/Constants.js';
import { OfficeMazeGenerator } from './OfficeMazeGenerator.js';
import { officeProps } from './prefabs/officeProps.js';

const W = 45;
const H = 31;

const rooms = [
  {
    id: 'front-reception',
    label: 'Reception / Waiting Area',
    x1: 2,
    y1: 18,
    x2: 12,
    y2: 21,
    color: 0xd8dcdd,
    purpose: 'spawn',
    mood: 'quiet corporate'
  },
  {
    id: 'employee-intake',
    label: 'Employee Intake Desk',
    x1: 2,
    y1: 14,
    x2: 12,
    y2: 17,
    color: 0xd3dcdd,
    purpose: 'first document',
    mood: 'administrative'
  },
  {
    id: 'main-workstation-hall',
    label: 'Main Workstation Hall',
    x1: 2,
    y1: 4,
    x2: 19,
    y2: 12,
    color: 0xb9c2c5,
    purpose: 'exploration',
    mood: 'empty night office'
  },
  {
    id: 'archive',
    label: 'Records Archive',
    x1: 3,
    y1: 23,
    x2: 15,
    y2: 28,
    color: 0x8f9ba5,
    purpose: 'exploration',
    mood: 'cold storage'
  },
  {
    id: 'checkpoint-chamber',
    label: 'Counsellor / Review Room',
    x1: 18,
    y1: 12,
    x2: 24,
    y2: 18,
    color: 0xc7e1e4,
    purpose: 'document review',
    mood: 'judged'
  },
  {
    id: 'wrong-department',
    label: 'Accounts / Records Office',
    x1: 25,
    y1: 4,
    x2: 35,
    y2: 10,
    color: 0xc7cbc2,
    purpose: 'right department wing',
    mood: 'too orderly'
  },
  {
    id: 'utility-break',
    label: 'Staff Room',
    x1: 18,
    y1: 23,
    x2: 28,
    y2: 28,
    color: 0xa9b2a6,
    purpose: 'quiet detour',
    mood: 'stale'
  },
  {
    id: 'crusher-corridor',
    label: 'Emergency Records Hall',
    x1: 25,
    y1: 14,
    x2: 37,
    y2: 16,
    color: 0xb75a4d,
    purpose: 'fair threat corridor',
    mood: 'warning'
  },
  {
    id: 'fake-exit',
    label: 'Public Exit',
    x1: 38,
    y1: 12,
    x2: 42,
    y2: 18,
    color: 0xd6e4db,
    purpose: 'false hope',
    mood: 'too clean'
  },
  {
    id: 'final-route',
    label: 'Unknown Department Transfer Corridor',
    x1: 36,
    y1: 22,
    x2: 42,
    y2: 28,
    color: 0xc0dfe3,
    purpose: 'final route',
    mood: 'psychologically wrong'
  }
];

const roomLayoutSpecs = {
  globalRules: [
    'Every object must belong to the purpose of its room.',
    'Every room must preserve a main empty movement lane.',
    'Connectors should stay empty except for signs, door frames, or corridor trims.',
    'Do not place isolated columns anywhere.',
    'Glass is rare and only belongs in Review Room or Accounts when boundary-aligned.',
    'If glass does not read as an intentional boundary, remove it.',
    'Signs must be mounted near entrances or walls and must not dominate the camera.',
    'Large signs should not sit close to the main player path.',
    'No object should occupy more than 25-30 percent of a small room width unless it is a desk or counter.',
    'Main routes require at least 1.5-2.0 cells of clear walking width.',
    'Reception and Workstation main aisles require 2.5-3.5 cells of clear walking width.'
  ],
  rooms: {
    'front-reception': {
      role: 'Safe front office / waiting area.',
      playerEntry: 'Player starts in this room near the front waiting area.',
      playerExit: 'Natural route leads north toward Employee Intake.',
      focalPoint: 'Reception counter and intake direction, with the center route kept open.',
      furnitureZones: [
        'Reception desk belongs against one side/front boundary, never in the center path.',
        'Sofa and waiting chairs belong near walls or in a side waiting zone.',
        'Coffee table belongs only beside sofa/chair seating.',
        'Plants belong in corners.',
        'Signage belongs near a wall or entry point, not floating in the middle.'
      ],
      clearPath: {
        route: 'spawn -> employee-intake',
        minWidthCells: 2.5,
        rules: ['Keep the center route from player spawn toward Employee Intake open.']
      },
      allowedArchitecture: ['receptionDesk', 'sofa', 'waitingChairs', 'coffeeTable', 'plant', 'sign'],
      forbiddenArchitecture: ['glassWall', 'column', 'cubicleCluster', 'serverRackRow', 'beam', 'large random frames'],
      objectCountLimits: {
        receptionDesk: 1,
        sofa: 1,
        waitingChairs: '2-3',
        coffeeTable: 1,
        plant: '1-2',
        sign: 2
      },
      dimensionRules: {
        receptionDesk: { widthCells: [2.0, 2.6], depthCells: [0.45, 0.7] },
        sofa: { widthCells: [1.6, 2.4], depthCells: [0.45, 0.75] },
        waitingChair: { widthCells: [0.35, 0.55], depthCells: [0.35, 0.55] },
        coffeeTable: { widthCells: [0.7, 1.2], depthCells: [0.35, 0.65] },
        plant: { widthCells: [0.25, 0.45] },
        sign: { widthCells: [1.0, 1.5] }
      },
      glassPolicy: {
        allowed: false,
        rule: 'No glassWall in Reception.'
      },
      signagePolicy: {
        maxCount: 2,
        placement: 'Near the wall or entry; never in the center movement lane.'
      },
      notes: [
        'This is the safe first read of the office.',
        'Do not add random architectural clutter here.'
      ]
    },
    'employee-intake': {
      role: 'Administrative first-task desk.',
      playerEntry: 'Entered from Reception.',
      playerExit: 'Exits toward Main Workstation Hall.',
      focalPoint: 'Intake desk with terminal and Shift Assignment Form.',
      furnitureZones: [
        'Intake desk should be the focal point.',
        'Terminal and form should sit on or near the desk.',
        'Desk must not block the route to Workstation Hall.',
        'Signage should be near or behind the desk, not in the walkway.'
      ],
      clearPath: {
        route: 'front-reception -> employee-intake -> main-workstation-hall',
        minWidthCells: 2.0,
        rules: ['Keep a continuous clear lane through the intake desk area.']
      },
      allowedArchitecture: ['receptionDesk', 'intakeDesk', 'taskTerminal', 'sign', 'small cabinet', 'copyMachine'],
      forbiddenArchitecture: ['glassWall', 'column', 'cubicleCluster', 'serverRackRow', 'large random props'],
      objectCountLimits: {
        desk: '1 total receptionDesk or intakeDesk',
        taskTerminal: '1 desktop terminal',
        sign: 1,
        smallCabinet: 1,
        copyMachine: 1
      },
      dimensionRules: {
        intakeDesk: { widthCells: [2.8, 3.4], depthCells: [0.65, 0.9] },
        taskTerminal: { widthCells: [0.3, 0.8] },
        sign: { widthCells: [1.0, 1.5] }
      },
      glassPolicy: {
        allowed: false,
        rule: 'No glassWall in Employee Intake.'
      },
      signagePolicy: {
        maxCount: 1,
        placement: 'Mounted near or behind the desk, outside the walking lane.'
      },
      notes: [
        'Shift Assignment Form remains the first task focal point.',
        'Do not change task count or objective order.'
      ]
    },
    'main-workstation-hall': {
      role: 'Main open office workspace.',
      playerEntry: 'Entered from Employee Intake.',
      playerExit: 'Central aisle continues toward Assigned Desk File and later zones.',
      focalPoint: 'Assigned Desk File reachable from the main aisle.',
      furnitureZones: [
        'Central aisle must be visually clear.',
        'Cubicle clusters should sit on left/right sides of the aisle.',
        'Desks should form organized rows, not scattered blocks.',
        'Desks should face inward or align consistently.',
        'Task desk must be reachable from the aisle.',
        'Printer/copyMachine belongs near a wall, not in the aisle.',
        'Signage should mark entrance or far wall, not float over desks.'
      ],
      clearPath: {
        route: 'employee-intake -> assigned-desk-file -> review intake',
        centralAisleWidthCells: [2.5, 3.5],
        minClusterWallGapCells: [0.6, 1.0],
        rules: ['Keep the route to Assigned Desk File clear.']
      },
      allowedArchitecture: ['cubicleCluster', 'copyMachine', 'printer', 'plant', 'sign', 'taskTerminal'],
      forbiddenArchitecture: ['glassWall', 'column', 'serverRackRow', 'emergency beams', 'tall maze-like partitions'],
      objectCountLimits: {
        cubicleCluster: 2,
        copyMachine: 1,
        printer: 1,
        plant: 1,
        sign: 1,
        totalDeskUnits: '12-24'
      },
      dimensionRules: {
        cubicleCluster: { maxCount: 2, maxFootprintCells: [6, 7] },
        desk: { widthCells: [1.1, 1.6], depthCells: [0.55, 0.9] },
        partition: { heightMeters: [0.45, 0.75] },
        chair: { widthCells: [0.35, 0.5], depthCells: [0.35, 0.55] },
        monitor: { widthCells: [0.25, 0.45] }
      },
      glassPolicy: {
        allowed: false,
        rule: 'No glassWall in Main Workstation Hall.'
      },
      signagePolicy: {
        maxCount: 1,
        placement: 'Entrance or far wall only; keep signs out of desk rows.'
      },
      notes: [
        'This room should read as an organized open office, not a maze.',
        'Do not add columns or emergency corridor pieces here.'
      ]
    },
    archive: {
      role: 'Records storage / back room.',
      playerEntry: 'Entered from the service connector.',
      playerExit: 'Returns toward Employee Intake or continues along the existing critical route.',
      focalPoint: 'Archive Index Packet near racks or a small table.',
      furnitureZones: [
        'Rack rows belong along walls or in parallel rows.',
        'Central aisle must remain clear.',
        'Document/objective should sit near a rack or small table.',
        'Signage should be near the entrance.'
      ],
      clearPath: {
        route: 'archive entrance -> archive-index-packet',
        aisleWidthCells: [1.8, 2.2],
        rules: ['Objective must be reachable without squeezing.']
      },
      allowedArchitecture: ['serverRackRow', 'archive racks', 'small table', 'taskTerminal', 'sign'],
      forbiddenArchitecture: ['glassWall', 'column', 'cubicleCluster', 'sofa', 'reception furniture'],
      objectCountLimits: {
        serverRackRow: '2-3',
        archiveRackRows: '2-3',
        smallTable: 1,
        taskTerminal: 1,
        sign: 1,
        racksPerRow: '3-5'
      },
      dimensionRules: {
        rack: { widthCells: [0.6, 0.9], depthCells: [0.6, 0.9], heightMeters: [1.7, 2.1] },
        rackRow: { maxLengthCells: 5, rackCount: [3, 5] }
      },
      glassPolicy: {
        allowed: false,
        rule: 'No glassWall in Archive.'
      },
      signagePolicy: {
        maxCount: 1,
        placement: 'Near the entrance, wall-mounted.'
      },
      notes: [
        'The room should read as storage/archive, not office seating.',
        'Keep rack rows legible and parallel.'
      ]
    },
    'checkpoint-chamber': {
      role: 'Counsellor / Review Room. Observed, uncomfortable, formal.',
      playerEntry: 'Entered from workstation/review intake.',
      playerExit: 'Exits toward wrong department, staff room, or emergency route.',
      focalPoint: 'Review table with terminal/document point.',
      furnitureZones: [
        'Meeting/review table should be central or slightly back from entrance.',
        'Terminal/document point should be near the table.',
        'Glass may be used only if it forms a clear room boundary.',
        'No scattered glass pieces.',
        'Signage should be near doorway/entrance.'
      ],
      clearPath: {
        route: 'review entry -> review-ledger -> exits',
        doorwayWidthCells: [1.5, 2.0],
        rules: ['Table must not block the room entrance.']
      },
      allowedArchitecture: ['meetingTable', 'taskTerminal', 'glassWall', 'sign', 'chairs'],
      forbiddenArchitecture: ['cubicleCluster', 'serverRackRow', 'standalone columns', 'random glass panels'],
      objectCountLimits: {
        meetingTable: 1,
        taskTerminal: 1,
        glassWall: '1-2',
        sign: 1,
        chairs: '2-4'
      },
      dimensionRules: {
        meetingTable: { widthCells: [2.0, 2.6], depthCells: [0.8, 1.2] },
        glassWall: { preferredLengthCells: [2.0, 3.5], heightMeters: [1.6, 1.8], opacity: [0.12, 0.18], minPanelLengthCells: 1.8 }
      },
      glassPolicy: {
        allowed: true,
        maxCount: 2,
        rule: 'Only boundary-aligned glass. No short panels unless used as a small side screen.'
      },
      signagePolicy: {
        maxCount: 1,
        placement: 'Near doorway or entrance wall.'
      },
      notes: [
        'The room should feel formal and observed.',
        'Glass must read as architecture, not visual noise.'
      ]
    },
    'wrong-department': {
      role: 'Accounts / Records Office. Too orderly, bureaucratic, controlled.',
      playerEntry: 'Entered from review/department transfer.',
      playerExit: 'Leads the player toward the false public exit route.',
      focalPoint: 'Transfer Notice / terminal / monolith.',
      furnitureZones: [
        'Desks/cabinets should sit against walls or form a small organized office.',
        'Terminal/monolith should be the focal point.',
        'Optional glass front only if it clearly reads as office frontage.',
        'If glass looks like a long fence, remove it.',
        'Signage should be near entrance/front wall.'
      ],
      clearPath: {
        route: 'department transfer -> transfer notice',
        objectiveClearanceCells: [1.5, 2.0],
        rules: ['Keep clear space around the terminal/objective.']
      },
      allowedArchitecture: ['desk', 'cabinet', 'taskTerminal', 'monolith', 'sign', 'glassWall'],
      forbiddenArchitecture: ['column', 'cubicleCluster', 'serverRackRow', 'long random glass fence'],
      objectCountLimits: {
        desk: 'limited',
        cabinet: 'limited',
        taskTerminal: 1,
        monolith: 1,
        sign: 1,
        glassWall: 1
      },
      dimensionRules: {
        desk: { widthCells: [1.2, 1.8], depthCells: [0.55, 0.9] },
        cabinet: { widthCells: [0.6, 1.0], depthCells: [0.35, 0.6] },
        monolith: { widthCells: [0.35, 0.6], depthCells: [0.2, 0.4] },
        taskTerminal: { widthCells: [0.35, 0.6], depthCells: [0.2, 0.4] },
        glassWall: { maxLengthCells: 4.8, preferredLengthCells: [2.5, 4.8] }
      },
      glassPolicy: {
        allowed: true,
        maxCount: 1,
        rule: 'Only boundary-aligned office frontage. Remove if it reads as a fence.'
      },
      signagePolicy: {
        maxCount: 1,
        placement: 'Near entrance or front wall.'
      },
      notes: [
        'This room should feel orderly and controlled.',
        'Do not add workstation clusters or rack rows.'
      ]
    },
    'utility-break': {
      role: 'Staff break room. Stale, abandoned, formerly human.',
      playerEntry: 'Optional detour from review area.',
      playerExit: 'Returns to the review/transfer area.',
      focalPoint: 'Small staff-room utility cluster near a wall.',
      furnitureZones: [
        'copyMachine, small table, and cabinet/fridge-like objects should sit near a wall.',
        'Center should remain partly open.',
        'Signage belongs near entrance.'
      ],
      clearPath: {
        route: 'staff room entry -> open center',
        minWidthCells: 1.5,
        rules: ['Keep the entry path clear.']
      },
      allowedArchitecture: ['copyMachine', 'small table', 'chair set', 'cabinet', 'fridge-like object', 'sign'],
      forbiddenArchitecture: ['glassWall', 'column', 'cubicleCluster', 'serverRackRow'],
      objectCountLimits: {
        copyMachine: 1,
        smallTable: 1,
        chairSet: 1,
        cabinet: '1-2',
        fridgeLikeObject: '1-2',
        sign: 1
      },
      dimensionRules: {
        copyMachine: { widthCells: [0.7, 1.0], depthCells: [0.5, 0.8] },
        smallTable: { widthCells: [0.8, 1.3], depthCells: [0.6, 1.0] },
        chair: { widthCells: [0.35, 0.5], depthCells: [0.35, 0.55] },
        cabinet: { widthCells: [0.6, 1.0], depthCells: [0.4, 0.7] },
        fridgeLikeObject: { widthCells: [0.6, 1.0], depthCells: [0.4, 0.7] }
      },
      glassPolicy: {
        allowed: false,
        rule: 'No glassWall in Staff Room.'
      },
      signagePolicy: {
        maxCount: 1,
        placement: 'Near entrance, wall-mounted.'
      },
      notes: [
        'The room is a quiet detour and should not become visually busy.',
        'Leave the middle partly open.'
      ]
    },
    'fake-exit': {
      role: 'Clean false public exit / false hope.',
      playerEntry: 'Entered from the records/emergency route after review.',
      playerExit: 'False exit pressure trigger redirects progression to the final route.',
      focalPoint: 'Exit sign and door direction.',
      furnitureZones: [
        'Exit sign and door should be the focal point.',
        'Use minimal props only.',
        'Path to trigger must remain clear.',
        'No visual clutter.'
      ],
      clearPath: {
        route: 'records hall -> fake exit trigger',
        minWidthCells: 1.5,
        rules: ['Path to fake exit trigger must be clear.']
      },
      allowedArchitecture: ['doorSlab', 'exit sign', 'sign', 'minimal wall trim'],
      forbiddenArchitecture: ['glassWall', 'column', 'cubicleCluster', 'serverRackRow', 'large furniture', 'clutter'],
      objectCountLimits: {
        doorSlab: 1,
        exitSign: 1,
        wallTrim: 'minimal'
      },
      dimensionRules: {
        doorSlab: { widthCells: [1.4, 1.8], heightMeters: [2.0, 2.3] },
        exitSign: { widthCells: [1.0, 1.4] }
      },
      glassPolicy: {
        allowed: false,
        rule: 'No glassWall in Fake Exit.'
      },
      signagePolicy: {
        maxCount: 1,
        placement: 'Exit sign should be focal but not block or dominate the path.'
      },
      notes: [
        'Area should feel too clean and suspicious.',
        'Do not add clutter or extra furniture.'
      ]
    },
    'crusher-corridor': {
      role: 'Emergency Records Hall / fair threat corridor.',
      playerEntry: 'Entered from Review Room through Emergency Records Intake.',
      playerExit: 'Leads toward the false public exit while crusher logic remains unchanged.',
      focalPoint: 'Readable danger lane through the corridor.',
      furnitureZones: [
        'Corridor should be long and clear.',
        'Frames should mark entrance/exit.',
        'Beams should read as warning trims, not random rails.',
        'Red warning signage/lights are allowed.'
      ],
      clearPath: {
        route: 'crusher start/end lane',
        rules: [
          'Crusher lane must be fully clear.',
          'Playable width must remain predictable and fair.'
        ]
      },
      allowedArchitecture: ['frame', 'beam', 'warning trim', 'sign'],
      forbiddenArchitecture: ['glassWall', 'column', 'furniture', 'random rail-like beams'],
      objectCountLimits: {
        frame: 2,
        beam: 2,
        warningTrim: 2,
        sign: 1
      },
      dimensionRules: {
        frame: { widthCells: [2.0, 2.8] },
        warningBeam: { placement: 'match corridor edge only' },
        warningSign: { widthCells: [1.0, 1.5] }
      },
      glassPolicy: {
        allowed: false,
        rule: 'No glassWall in Crusher Corridor.'
      },
      signagePolicy: {
        maxCount: 1,
        placement: 'Warning sign near entrance/edge, outside the lane.'
      },
      notes: [
        'This is a fairness-critical corridor.',
        'Do not add anything that obscures the danger lane or changes crusher behavior.'
      ]
    },
    'final-route': {
      role: 'Sterile transfer corridor / ending approach.',
      playerEntry: 'Entered after the fake exit afterimage route opens.',
      playerExit: 'Final approach to transfer/ending.',
      focalPoint: 'Final door/window band/terminal direction.',
      furnitureZones: [
        'Use a minimal corridor layout.',
        'Final door, window band, or terminal should be focal.',
        'No office clutter.'
      ],
      clearPath: {
        route: 'final route entry -> final access door',
        minWidthCells: 1.5,
        rules: ['Path to final door must be clear.']
      },
      allowedArchitecture: ['doorSlab', 'windowBand', 'sign', 'terminal'],
      forbiddenArchitecture: ['column', 'cubicleCluster', 'reception props', 'random glass', 'furniture clutter'],
      objectCountLimits: {
        doorSlab: 1,
        windowBand: 1,
        sign: '1-2',
        terminal: '1-2'
      },
      dimensionRules: {
        doorSlab: { widthCells: [1.4, 1.8], heightMeters: [2.0, 2.3] },
        windowBand: { maxLengthCells: 5.0, preferredLengthCells: [3.0, 5.0] },
        sign: { widthCells: [1.0, 1.5] },
        terminal: { widthCells: [1.0, 1.5] }
      },
      glassPolicy: {
        allowed: false,
        rule: 'No random glass in Final Route; use windowBand only if needed.'
      },
      signagePolicy: {
        maxCount: 2,
        placement: 'Near final door/window band, outside the walking path.'
      },
      notes: [
        'Keep this route sterile and uncluttered.',
        'Do not change final route logic or final access behavior.'
      ]
    }
  }
};

const roomLayoutAnchors = {
  'front-reception': {
    roomBounds: { x1: 2, y1: 18, x2: 12, y2: 21 },
    entranceSide: 'south/front spawn side',
    exitSide: 'north via reception-to-intake',
    focalPoint: {
      id: 'reception-waiting-orientation',
      x: 4.2,
      y: 21.05,
      radiusCells: 1.4,
      notes: 'Reception desk anchors the waiting read without blocking the spawn-to-intake lane.'
    },
    mainAisle: {
      id: 'spawn-to-intake-clear-lane',
      connectorIds: ['reception-to-intake'],
      points: [
        { x: 8.2, y: 20.65 },
        { x: 7.4, y: 19.35 },
        { x: 7.0, y: 17.5 }
      ],
      widthCells: 2.5,
      rule: 'Keep the player start and center route clear from spawn to Employee Intake.'
    },
    furnitureZones: [
      {
        id: 'seatingZone',
        allowedTypes: ['sofa', 'coffeeTable'],
        bounds: { x1: 3.0, y1: 18.8, x2: 5.3, y2: 20.1 },
        anchoredObjects: ['sofa', 'coffeeTable']
      },
      {
        id: 'sideWaitingChairZone',
        allowedTypes: ['waitingChairs'],
        bounds: { x1: 10.6, y1: 18.6, x2: 11.5, y2: 20.2 },
        anchoredObjects: ['waitingChairs'],
        notes: 'Existing chairs stay against the side wall, outside the center route.'
      },
      {
        id: 'receptionDeskZone',
        allowedTypes: ['receptionDesk'],
        bounds: { x1: 3.0, y1: 20.65, x2: 5.5, y2: 21.35 },
        center: { x: 4.2, y: 21.05 },
        anchoredObjects: ['front-reception-desk']
      },
      {
        id: 'plantZones',
        allowedTypes: ['plant'],
        zones: [
          { x1: 2.35, y1: 18.15, x2: 3.15, y2: 18.8 },
          { x1: 11.0, y1: 20.35, x2: 11.8, y2: 21.05 }
        ],
        anchoredObjects: ['front-left-plant', 'front-right-plant']
      }
    ],
    signageZones: [
      {
        id: 'entryWallSignZone',
        allowedTypes: ['sign'],
        bounds: { x1: 3.4, y1: 21.85, x2: 5.1, y2: 22.2 },
        anchoredObjects: ['night-entry-sign'],
        mount: 'south wall'
      }
    ],
    forbiddenZones: [
      {
        id: 'spawnArea',
        bounds: { x1: 7.2, y1: 20.1, x2: 9.2, y2: 21.1 },
        rule: 'No architecture in the player start area.'
      },
      {
        id: 'centerRouteToIntake',
        pathRef: 'spawn-to-intake-clear-lane',
        widthCells: 2.5,
        rule: 'No props or signs in the direct spawn-to-intake lane.'
      }
    ],
    clearPathWidthCells: 2.5,
    notes: [
      'Safe first room: furniture reads as waiting area, not a maze.',
      'Do not place filler objects in open center space.'
    ]
  },
  'employee-intake': {
    roomBounds: { x1: 2, y1: 14, x2: 12, y2: 17 },
    entranceSide: 'south from reception',
    exitSide: 'north toward main-workstation-hall',
    focalPoint: {
      id: 'shift-assignment-form',
      objectiveId: 'shift-assignment-form',
      x: 5.35,
      y: 16.16,
      radiusCells: 2.35,
      notes: 'The form and intake desk are the only focal read.'
    },
    mainAisle: {
      id: 'reception-to-intake-to-workstation-path',
      connectorIds: ['reception-to-intake', 'intake-to-workstations'],
      points: [
        { x: 7.0, y: 17.5 },
        { x: 5.35, y: 16.16 },
        { x: 8.0, y: 13.0 }
      ],
      widthCells: 2.0,
      rule: 'Keep a continuous route from Reception past the desk to Workstation Hall.'
    },
    furnitureZones: [
      {
        id: 'intakeDeskZone',
        allowedTypes: ['receptionDesk', 'intakeDesk', 'taskTerminal'],
        bounds: { x1: 3.6, y1: 15.75, x2: 6.95, y2: 16.75 },
        center: { x: 5.35, y: 16.25 },
        anchoredObjects: ['employee-intake-desk', 'shift-assignment-terminal']
      },
      {
        id: 'optionalSideCabinetZone',
        allowedTypes: ['small cabinet', 'copyMachine'],
        bounds: { x1: 9.6, y1: 15.1, x2: 11.4, y2: 16.8 },
        notes: 'Optional wall-only utility zone; leave empty unless there is a clear purpose.'
      }
    ],
    signageZones: [
      {
        id: 'behindIntakeDeskSignZone',
        allowedTypes: ['sign'],
        bounds: { x1: 4.7, y1: 16.9, x2: 6.1, y2: 17.2 },
        anchoredObjects: ['intake-sign'],
        mount: 'south wall behind intake desk'
      }
    ],
    forbiddenZones: [
      {
        id: 'workstationConnectorMouth',
        bounds: { x1: 6.0, y1: 13.9, x2: 10.0, y2: 14.8 },
        rule: 'Do not place objects in the connector to Workstation Hall.'
      },
      {
        id: 'centerMovementLane',
        pathRef: 'reception-to-intake-to-workstation-path',
        widthCells: 2.0,
        rule: 'Keep the desk approachable without forcing a squeeze around it.'
      }
    ],
    clearPathWidthCells: 2.0,
    notes: [
      'This room introduces the first task and should stay administrative.',
      'Do not add side furniture unless it remains wall-mounted or wall-adjacent.'
    ]
  },
  'main-workstation-hall': {
    roomBounds: { x1: 2, y1: 4, x2: 19, y2: 12 },
    entranceSide: 'south from employee-intake',
    exitSide: 'east/northeast toward checkpoint-chamber',
    focalPoint: {
      id: 'assigned-desk-file',
      objectiveId: 'assigned-desk-file',
      x: 8.0,
      y: 7.0,
      radiusCells: 2.45,
      notes: 'Assigned Desk File sits on the aisle edge and must stay readable from the main path.'
    },
    mainAisle: {
      id: 'workstation-central-aisle',
      connectorIds: ['intake-to-workstations', 'workstation-to-review'],
      points: [
        { x: 8.0, y: 12.0 },
        { x: 8.0, y: 7.0 },
        { x: 12.0, y: 7.0 },
        { x: 18.2, y: 12.4 }
      ],
      widthCells: [2.5, 3.5],
      rule: 'Central aisle stays open between left and right workstation rows.'
    },
    furnitureZones: [
      {
        id: 'leftWorkstationRows',
        allowedTypes: ['cubicleCluster'],
        bounds: { x1: 3.2, y1: 4.8, x2: 7.1, y2: 10.4 },
        center: { x: 3.7, y: 5.25 },
        anchoredObjects: ['left-cubicle-cluster']
      },
      {
        id: 'assignedDeskTerminalZone',
        allowedTypes: ['taskTerminal'],
        bounds: { x1: 7.6, y1: 6.6, x2: 8.4, y2: 7.4 },
        center: { x: 8.0, y: 7.0 },
        anchoredObjects: ['assigned-desk-terminal'],
        notes: 'Only the objective marker belongs inside the interaction radius.'
      },
      {
        id: 'rightWorkstationRows',
        allowedTypes: ['cubicleCluster'],
        bounds: { x1: 12.0, y1: 4.8, x2: 16.4, y2: 10.4 },
        center: { x: 12.5, y: 5.25 },
        anchoredObjects: ['right-cubicle-cluster']
      },
      {
        id: 'printerZone',
        allowedTypes: ['copyMachine', 'printer'],
        bounds: { x1: 17.7, y1: 4.8, x2: 18.8, y2: 5.9 },
        center: { x: 18.25, y: 5.25 },
        anchoredObjects: ['main-hall-copy-machine']
      }
    ],
    signageZones: [
      {
        id: 'mainHallEntryWallSignZone',
        allowedTypes: ['sign'],
        bounds: { x1: 10.5, y1: 11.85, x2: 12.2, y2: 12.25 },
        anchoredObjects: ['main-hall-sign'],
        mount: 'south entrance wall, offset from connector center'
      }
    ],
    forbiddenZones: [
      {
        id: 'centralAisle',
        pathRef: 'workstation-central-aisle',
        widthCells: [2.5, 3.5],
        rule: 'No desk rows, signs, glass, or utility props in the central aisle.'
      },
      {
        id: 'reviewConnectorMouth',
        bounds: { x1: 16.8, y1: 11.0, x2: 20.0, y2: 14.0 },
        rule: 'Keep the connector to review clear.'
      },
      {
        id: 'assignedDeskFileInteractionRadius',
        center: { x: 8.0, y: 7.0 },
        radiusCells: 2.45,
        rule: 'No additional architecture inside the objective radius beyond assignedDeskTerminalZone.'
      }
    ],
    clearPathWidthCells: [2.5, 3.5],
    notes: [
      'Workstation rows stay organized on the sides.',
      'The room should never be solved by weaving through random desks.'
    ]
  },
  archive: {
    roomBounds: { x1: 3, y1: 23, x2: 15, y2: 28 },
    entranceSide: 'north/service connector from intake/archive aisle',
    exitSide: 'north back toward the intake/archive service aisle',
    focalPoint: {
      id: 'archive-index-packet',
      objectiveId: 'archive-index-packet',
      x: 7.0,
      y: 25.0,
      radiusCells: 2.45,
      notes: 'Archive Index Packet sits between rack rows with the center aisle kept open.'
    },
    mainAisle: {
      id: 'archive-rack-aisle',
      connectorIds: ['intake-to-archive'],
      points: [
        { x: 10.5, y: 23.5 },
        { x: 7.0, y: 25.0 }
      ],
      widthCells: [1.8, 2.2],
      rule: 'Keep the aisle between rack rows open from entrance to objective.'
    },
    furnitureZones: [
      {
        id: 'rackRowNorth',
        allowedTypes: ['serverRackRow', 'archive racks'],
        bounds: { x1: 4.5, y1: 23.6, x2: 9.6, y2: 24.4 },
        center: { x: 7.0, y: 24.0 },
        anchoredObjects: ['archive-racks-north']
      },
      {
        id: 'archiveIndexPacketZone',
        allowedTypes: ['taskTerminal', 'small table'],
        bounds: { x1: 6.5, y1: 24.55, x2: 7.5, y2: 25.45 },
        center: { x: 7.0, y: 25.0 },
        anchoredObjects: ['archive-index-terminal'],
        notes: 'Only the archive objective marker belongs in the aisle.'
      },
      {
        id: 'rackRowSouth',
        allowedTypes: ['serverRackRow', 'archive racks'],
        bounds: { x1: 4.5, y1: 26.6, x2: 9.6, y2: 27.4 },
        center: { x: 7.0, y: 27.0 },
        anchoredObjects: ['archive-racks-south']
      }
    ],
    signageZones: [
      {
        id: 'archiveEntranceSignZone',
        allowedTypes: ['sign'],
        bounds: { x1: 6.2, y1: 21.85, x2: 7.8, y2: 22.25 },
        anchoredObjects: ['archive-sign'],
        mount: 'north entrance wall'
      }
    ],
    forbiddenZones: [
      {
        id: 'aisleBetweenRackRows',
        bounds: { x1: 4.4, y1: 24.45, x2: 10.0, y2: 26.45 },
        rule: 'No additional racks or furniture in the aisle.'
      },
      {
        id: 'archiveObjectiveRadius',
        center: { x: 7.0, y: 25.0 },
        radiusCells: 2.45,
        rule: 'No objects may crowd the archive objective.'
      }
    ],
    clearPathWidthCells: [1.8, 2.2],
    notes: [
      'Racks should remain parallel and legible.',
      'Do not turn storage into a workstation room.'
    ]
  },
  'checkpoint-chamber': {
    roomBounds: { x1: 18, y1: 12, x2: 24, y2: 18 },
    entranceSide: 'west/southwest from workstation-to-review',
    exitSide: 'east/north/south toward wrong-department, staff, and emergency route',
    focalPoint: {
      id: 'review-ledger',
      objectiveId: 'review-ledger',
      x: 21.0,
      y: 15.0,
      radiusCells: 2.7,
      notes: 'Review Ledger and terminal remain centered near the formal meeting table.'
    },
    mainAisle: {
      id: 'review-entry-table-exits',
      connectorIds: ['workstation-to-review', 'review-to-wrong-dept', 'review-to-break', 'review-to-records'],
      points: [
        { x: 18.6, y: 13.2 },
        { x: 21.0, y: 15.0 },
        { x: 23.4, y: 15.0 },
        { x: 22.0, y: 18.0 }
      ],
      widthCells: [1.5, 2.0],
      rule: 'Entry, table approach, and onward exits stay readable.'
    },
    furnitureZones: [
      {
        id: 'meetingTableZone',
        allowedTypes: ['meetingTable', 'chairs'],
        bounds: { x1: 19.75, y1: 15.55, x2: 22.25, y2: 16.85 },
        center: { x: 21.0, y: 16.2 },
        anchoredObjects: ['review-table']
      },
      {
        id: 'terminalZone',
        allowedTypes: ['taskTerminal'],
        bounds: { x1: 20.55, y1: 14.55, x2: 21.45, y2: 15.45 },
        center: { x: 21.0, y: 15.0 },
        anchoredObjects: ['review-ledger-terminal']
      }
    ],
    glassZones: [
      {
        id: 'westBoundaryPartition',
        allowedTypes: ['glassWall'],
        bounds: { x1: 17.95, y1: 14.9, x2: 18.2, y2: 17.9 },
        center: { x: 18.05, y: 16.4 },
        axis: 'z',
        maxLengthCells: 2.8,
        anchoredObjects: ['review-west-glassWall'],
        rule: 'Boundary-aligned side partition only; it must not cross the entry-to-table path.'
      }
    ],
    signageZones: [
      {
        id: 'reviewDoorwaySignZone',
        allowedTypes: ['sign'],
        bounds: { x1: 18.4, y1: 10.9, x2: 20.0, y2: 11.3 },
        anchoredObjects: ['review-sign'],
        mount: 'northwest review doorway'
      }
    ],
    forbiddenZones: [
      {
        id: 'connectorExits',
        bounds: [
          { x1: 17.0, y1: 11.0, x2: 20.0, y2: 14.0 },
          { x1: 22.0, y1: 10.0, x2: 25.0, y2: 12.0 },
          { x1: 21.0, y1: 18.0, x2: 23.0, y2: 23.0 },
          { x1: 24.0, y1: 14.0, x2: 26.0, y2: 16.0 }
        ],
        rule: 'Doorways and connector mouths stay empty.'
      },
      {
        id: 'reviewEntrance',
        bounds: { x1: 18.0, y1: 12.0, x2: 20.2, y2: 14.2 },
        rule: 'No furniture or glass may block the review entrance.'
      },
      {
        id: 'routeThroughTableAndObjective',
        pathRef: 'review-entry-table-exits',
        widthCells: [1.5, 2.0],
        rule: 'Table and terminal remain approachable without blocking exits.'
      }
    ],
    clearPathWidthCells: [1.5, 2.0],
    notes: [
      'Glass is justified only as a room boundary.',
      'Meeting table can feel formal, but it cannot become a door plug.'
    ]
  },
  'wrong-department': {
    roomBounds: { x1: 25, y1: 4, x2: 35, y2: 10 },
    entranceSide: 'west/southwest from review-to-wrong-dept',
    exitSide: 'south/southwest back toward the emergency records route',
    focalPoint: {
      id: 'transfer-notice',
      objectiveId: 'transfer-notice',
      x: 31.0,
      y: 7.0,
      radiusCells: 2.5,
      notes: 'Transfer Notice and monolith define the controlled Accounts read.'
    },
    mainAisle: {
      id: 'accounts-entry-to-monolith',
      connectorIds: ['review-to-wrong-dept'],
      points: [
        { x: 25.0, y: 10.8 },
        { x: 28.0, y: 9.2 },
        { x: 31.0, y: 7.0 }
      ],
      widthCells: [1.5, 2.0],
      rule: 'Keep the entrance-to-objective route open.'
    },
    furnitureZones: [
      {
        id: 'wallDeskCabinetZones',
        allowedTypes: ['desk', 'cabinet'],
        zones: [
          { x1: 25.4, y1: 4.4, x2: 28.0, y2: 5.4 },
          { x1: 33.0, y1: 5.0, x2: 34.6, y2: 9.4 }
        ],
        notes: 'Optional desks and cabinets must hug the walls only.'
      },
      {
        id: 'terminalZone',
        allowedTypes: ['taskTerminal'],
        bounds: { x1: 30.55, y1: 6.55, x2: 31.45, y2: 7.45 },
        center: { x: 31.0, y: 7.0 },
        anchoredObjects: ['transfer-notice-terminal']
      },
      {
        id: 'monolithZone',
        allowedTypes: ['monolith'],
        bounds: { x1: 30.6, y1: 7.55, x2: 31.4, y2: 8.25 },
        center: { x: 31.0, y: 7.9 },
        anchoredObjects: ['accounts-monolith']
      }
    ],
    glassZones: [
      {
        id: 'accountsFrontBoundary',
        allowedTypes: ['glassWall'],
        bounds: { x1: 28.8, y1: 10.45, x2: 33.2, y2: 10.85 },
        center: { x: 31.0, y: 10.65 },
        axis: 'x',
        maxLengthCells: 4.0,
        anchoredObjects: ['accounts-front-glassWall'],
        rule: 'Reads as front office boundary only; remove if extended into a fence.'
      }
    ],
    signageZones: [
      {
        id: 'accountsFrontSignZone',
        allowedTypes: ['sign'],
        bounds: { x1: 30.2, y1: 9.85, x2: 31.8, y2: 10.25 },
        anchoredObjects: ['wrong-dept-sign'],
        mount: 'front wall near glass boundary'
      }
    ],
    forbiddenZones: [
      {
        id: 'transferNoticeObjectiveRadius',
        center: { x: 31.0, y: 7.0 },
        radiusCells: 2.5,
        rule: 'No extra desks, cabinets, or glass near the objective.'
      },
      {
        id: 'accountsEntrancePath',
        pathRef: 'accounts-entry-to-monolith',
        widthCells: [1.5, 2.0],
        rule: 'Entrance path must not be narrowed by office frontage or wall furniture.'
      }
    ],
    clearPathWidthCells: [1.5, 2.0],
    notes: [
      'The existing glass count stays at one and is justified as frontage.',
      'Do not use workstation clusters in this room.'
    ]
  },
  'utility-break': {
    roomBounds: { x1: 18, y1: 23, x2: 28, y2: 28 },
    entranceSide: 'north from review-to-break connector',
    exitSide: 'north back to checkpoint-chamber',
    focalPoint: {
      id: 'staff-utility-cluster',
      x: 18.85,
      y: 25.15,
      radiusCells: 1.2,
      notes: 'Copy machine and utility cluster stay near the west wall.'
    },
    mainAisle: {
      id: 'staff-room-entry-open-center',
      connectorIds: ['review-to-break'],
      points: [
        { x: 22.0, y: 23.0 },
        { x: 22.0, y: 25.2 }
      ],
      widthCells: 1.5,
      rule: 'Entry into the center remains open.'
    },
    furnitureZones: [
      {
        id: 'copyCabinetZone',
        allowedTypes: ['copyMachine', 'cabinet', 'fridge-like object'],
        bounds: { x1: 18.3, y1: 24.4, x2: 20.1, y2: 26.1 },
        center: { x: 18.85, y: 25.15 },
        anchoredObjects: ['utility-copier']
      },
      {
        id: 'smallBreakTableZone',
        allowedTypes: ['small table', 'chair set'],
        bounds: { x1: 24.4, y1: 25.5, x2: 27.4, y2: 27.5 },
        notes: 'Optional table zone only; keep it against the wall.'
      }
    ],
    signageZones: [
      {
        id: 'staffEntranceSignZone',
        allowedTypes: ['sign'],
        bounds: { x1: 21.8, y1: 21.85, x2: 23.2, y2: 22.25 },
        anchoredObjects: ['staff-sign'],
        mount: 'north entry wall'
      }
    ],
    forbiddenZones: [
      {
        id: 'centerEntryArea',
        bounds: { x1: 20.7, y1: 23.0, x2: 23.5, y2: 26.0 },
        rule: 'No copy machines, tables, or cabinets in the center entry area.'
      }
    ],
    clearPathWidthCells: 1.5,
    notes: [
      'The room should remain a quiet detour.',
      'No glass and no cubicles belong here.'
    ]
  },
  'fake-exit': {
    roomBounds: { x1: 38, y1: 12, x2: 42, y2: 18 },
    entranceSide: 'west from emergency/fake exit route',
    exitSide: 'east wall false exit direction; north afterimage route after trigger',
    focalPoint: {
      id: 'public-exit-sign-and-door-direction',
      x: 41.85,
      y: 13.65,
      radiusCells: 1.2,
      notes: 'The Public Exit sign reads from the wall without occupying the route to the trigger.'
    },
    mainAisle: {
      id: 'fake-exit-trigger-route',
      connectorIds: ['fake-exit-afterimage'],
      points: [
        { x: 36.0, y: 15.0 },
        { x: 40.0, y: 15.0 },
        { x: 40.5, y: 18.0 }
      ],
      widthCells: 2.0,
      rule: 'Direct path to fake-exit trigger and exit direction stays empty.'
    },
    furnitureZones: [
      {
        id: 'noFurnitureZone',
        allowedTypes: [],
        bounds: { x1: 38, y1: 12, x2: 42, y2: 18 },
        rule: 'No furniture or clutter in the false exit room.'
      }
    ],
    signageZones: [
      {
        id: 'publicExitWallSignZone',
        allowedTypes: ['sign'],
        bounds: { x1: 41.7, y1: 13.1, x2: 42.1, y2: 14.2 },
        anchoredObjects: ['fake-exit-sign'],
        mount: 'east wall'
      }
    ],
    forbiddenZones: [
      {
        id: 'pathToFakeExitTrigger',
        pathRef: 'fake-exit-trigger-route',
        widthCells: 2.0,
        rule: 'No props, frames, or signs in the whole path to the fake exit trigger.'
      }
    ],
    clearPathWidthCells: 2.0,
    notes: [
      'This area should feel clean and suspicious, not furnished.',
      'Signage may guide the player but cannot become a blocker.'
    ]
  },
  'crusher-corridor': {
    roomBounds: { x1: 25, y1: 14, x2: 37, y2: 16 },
    entranceSide: 'east/west corridor',
    exitSide: 'east/west corridor',
    focalPoint: {
      id: 'clear-crusher-lane',
      x1: 25.0,
      y1: 15.0,
      x2: 37.0,
      y2: 15.0,
      notes: 'The lane between x 25-37 at y 15 must remain visually and physically clear.'
    },
    mainAisle: {
      id: 'full-crusher-lane',
      hazardIds: ['records-hall-crusher'],
      points: [
        { x: 25.0, y: 15.0 },
        { x: 37.0, y: 15.0 }
      ],
      widthCells: 'full corridor',
      rule: 'The entire crusher lane is the aisle.'
    },
    furnitureZones: [
      {
        id: 'noFurnitureZone',
        allowedTypes: [],
        bounds: { x1: 25, y1: 14, x2: 37, y2: 16 },
        rule: 'No furniture in the fairness-critical corridor.'
      }
    ],
    frameZones: [
      {
        id: 'westEntranceFrame',
        allowedTypes: ['frame'],
        bounds: { x1: 24.8, y1: 13.7, x2: 25.2, y2: 16.3 },
        center: { x: 25.0, y: 15.0 },
        anchoredObjects: ['records-hall-west-frame']
      },
      {
        id: 'eastExitFrame',
        allowedTypes: ['frame'],
        bounds: { x1: 36.8, y1: 13.7, x2: 37.2, y2: 16.3 },
        center: { x: 37.0, y: 15.0 },
        anchoredObjects: ['records-hall-east-frame']
      }
    ],
    beamZones: [
      {
        id: 'northEdgeWarningBeam',
        allowedTypes: ['beam', 'warning trim'],
        bounds: { x1: 25.2, y1: 13.9, x2: 36.8, y2: 14.2 },
        center: { x: 31.0, y: 14.05 },
        anchoredObjects: ['records-hall-north-beam']
      },
      {
        id: 'southEdgeWarningBeam',
        allowedTypes: ['beam', 'warning trim'],
        bounds: { x1: 25.2, y1: 15.8, x2: 36.8, y2: 16.1 },
        center: { x: 31.0, y: 15.95 },
        anchoredObjects: ['records-hall-south-beam']
      }
    ],
    signageZones: [
      {
        id: 'corridorEntryEdgeSignZone',
        allowedTypes: ['sign'],
        bounds: { x1: 25.0, y1: 13.8, x2: 26.5, y2: 14.2 },
        notes: 'Warning signs belong near an entry edge only; no current sign is placed here.'
      }
    ],
    forbiddenZones: [
      {
        id: 'centerLane',
        bounds: { x1: 25.0, y1: 14.3, x2: 37.0, y2: 15.7 },
        rule: 'Never place architecture in the center crusher lane.'
      }
    ],
    clearPathWidthCells: 'full corridor',
    notes: [
      'Frames mark thresholds only.',
      'Beams stay on corridor edges and must never read as rails through the lane.'
    ]
  },
  'final-route': {
    roomBounds: { x1: 36, y1: 22, x2: 42, y2: 28 },
    entranceSide: 'north/from fake-exit afterimage',
    exitSide: 'south/east at final access door',
    focalPoint: {
      id: 'final-access-door',
      objectiveId: 'final-access-door',
      x: 41.0,
      y: 27.0,
      radiusCells: 1.6,
      notes: 'Final Access Door remains the end of the sterile approach.'
    },
    mainAisle: {
      id: 'afterimage-to-final-door',
      connectorIds: ['fake-exit-afterimage', 'final-bend'],
      points: [
        { x: 40.5, y: 22.0 },
        { x: 40.0, y: 24.0 },
        { x: 41.0, y: 27.0 }
      ],
      widthCells: [1.8, 2.0],
      rule: 'Path to final access door remains clean and centered.'
    },
    furnitureZones: [
      {
        id: 'finalDoorZone',
        allowedTypes: ['doorSlab'],
        bounds: { x1: 40.1, y1: 27.55, x2: 41.9, y2: 28.05 },
        center: { x: 41.0, y: 27.8 },
        anchoredObjects: ['final-door-slab'],
        notes: 'Only the final door slab belongs here.'
      }
    ],
    windowZone: {
      id: 'eastObservationWindowBand',
      allowedTypes: ['windowBand'],
      bounds: { x1: 41.9, y1: 22.2, x2: 42.2, y2: 27.4 },
      center: { x: 42.05, y: 24.8 },
      axis: 'z',
      anchoredObjects: ['final-route-window-band'],
      rule: 'Optional observation/window band stays along the wall only.'
    },
    signageZones: [
      {
        id: 'finalDoorWindowSignageZone',
        allowedTypes: ['sign'],
        bounds: { x1: 40.0, y1: 26.6, x2: 42.1, y2: 28.0 },
        notes: 'Any final-route sign belongs near the final door or window band; no current sign is placed here.'
      }
    ],
    forbiddenZones: [
      {
        id: 'centerCorridor',
        pathRef: 'afterimage-to-final-door',
        widthCells: [1.8, 2.0],
        rule: 'No furniture, random glass, or clutter in the center corridor.'
      }
    ],
    clearPathWidthCells: [1.8, 2.0],
    notes: [
      'Keep this route sterile and minimal.',
      'WindowBand is not counted as random glass and stays wall-bound.'
    ]
  }
};

const connectors = [
  { id: 'reception-to-intake', label: 'Employee Intake Hall', x1: 4, y1: 17, x2: 10, y2: 18, from: 'front-reception', to: 'employee-intake' },
  { id: 'intake-to-workstations', label: 'Main Workstation Entry', x1: 6, y1: 12, x2: 10, y2: 14, from: 'employee-intake', to: 'main-workstation-hall' },
  { id: 'intake-to-archive', label: 'Archive Service Aisle', x1: 10, y1: 17, x2: 11, y2: 24, from: 'employee-intake', to: 'archive' },
  { id: 'workstation-to-review', label: 'Review Intake', x1: 17, y1: 11, x2: 20, y2: 14, from: 'main-workstation-hall', to: 'checkpoint-chamber' },
  { id: 'review-to-wrong-dept', label: 'Department Transfer', x1: 22, y1: 10, x2: 25, y2: 12, from: 'checkpoint-chamber', to: 'wrong-department' },
  { id: 'review-to-break', label: 'Staff Service Bend', x1: 21, y1: 18, x2: 23, y2: 23, from: 'checkpoint-chamber', to: 'utility-break' },
  { id: 'review-to-records', label: 'Emergency Records Intake', x1: 24, y1: 14, x2: 26, y2: 16, from: 'checkpoint-chamber', to: 'crusher-corridor' },
  { id: 'fake-exit-afterimage', label: 'Exit Afterimage', x1: 40, y1: 18, x2: 41, y2: 24, from: 'fake-exit', to: 'final-route' },
  { id: 'final-bend', label: 'Department Afterimage Bend', x1: 36, y1: 24, x2: 42, y2: 28, from: 'final-route', to: 'final-route' }
];

const objectives = [
  {
    id: 'shift-assignment-form',
    type: 'task',
    label: 'Shift Assignment Form',
    x: 5.35,
    y: 16.16,
    radius: 2.35,
    roomId: 'employee-intake',
    visualType: 'document',
    documentTitle: 'SHIFT ASSIGNMENT\nFORM',
    surfaceHeight: 0.92,
    markFloor: false
  },
  { id: 'assigned-desk-file', type: 'task', label: 'Assigned Desk File', x: 8, y: 7, radius: 2.45, roomId: 'main-workstation-hall' },
  { id: 'archive-index-packet', type: 'task', label: 'Archive Index Packet', x: 7, y: 25, radius: 2.45, height: -0.03, roomId: 'archive' },
  { id: 'review-ledger', type: 'task', label: 'Review Ledger', x: 21, y: 15, radius: 2.7, height: 0.08, roomId: 'checkpoint-chamber' },
  { id: 'transfer-notice', type: 'task', label: 'Transfer Notice', x: 31, y: 7, radius: 2.5, height: 0.04, roomId: 'wrong-department' },
  {
    id: 'final-access-door',
    type: 'finalExit',
    label: 'Final Access Door',
    x: 41,
    y: 27,
    height: -0.04,
    roomId: 'final-route',
    requiresState: 'finalRouteUnlocked',
    lockTriggerId: 'fake-exit-pressure'
  }
];

const hazards = [
  {
    id: 'fake-exit-pressure',
    type: 'fakeExitTrigger',
    x: 36,
    y: 15,
    radius: 2.7,
    height: -0.08,
    requiresCheckpointInactive: true,
    routeId: 'records-hall'
  },
  {
    id: 'records-hall-crusher',
    type: 'crusher',
    triggerId: 'fake-exit-pressure',
    start: { x: 37, y: 15 },
    end: { x: 25, y: 15 },
    delay: 3.2,
    speed: 2.1,
    killRadius: 0.72,
    laneCoverage: 0.58,
    telegraphWidth: 0.42
  }
];

const storyBeats = [
  { id: 'first-task', roomId: 'employee-intake', tone: 'ordinary', text: 'Assigned work begins with a form on the intake desk.' },
  { id: 'wrong-department-reveal', roomId: 'wrong-department', tone: 'incorrect', text: 'Department signage stops matching the floor plan.' },
  { id: 'fake-exit', roomId: 'fake-exit', tone: 'false-hope', text: 'The public exit appears before the department accepts the employee.' },
  { id: 'afterimage', roomId: 'final-route', tone: 'impossible', text: 'The office repeats itself as an afterimage.' }
];

const manipulationNodes = [
  { id: 'records-hall-lock', type: 'routeLock', routeId: 'records-hall', x: 25, y: 15 },
  { id: 'fake-exit-signage', type: 'signage', channelId: 'department-labels', x: 38.5, y: 13 },
  { id: 'afterimage-light', type: 'lighting', channelId: 'ai-cyan', x: 40, y: 24 }
];

const lightingZones = [
  { id: 'normal-office', channelId: 'normal-office', rooms: ['front-reception', 'employee-intake', 'main-workstation-hall'], mood: 'sterile' },
  { id: 'review-cyan', channelId: 'ai-cyan', rooms: ['checkpoint-chamber', 'final-route'], mood: 'observed' },
  { id: 'records-warning', channelId: 'emergency', rooms: ['crusher-corridor'], mood: 'danger' },
  { id: 'wrong-department-muted', channelId: 'wrongness', rooms: ['wrong-department', 'archive'], mood: 'incorrect' },
  { id: 'staff-muted', channelId: 'staff-muted', rooms: ['utility-break'], mood: 'stale' },
  { id: 'false-exit-clean', channelId: 'false-exit', rooms: ['fake-exit'], mood: 'too clean' }
];

const collisionVolumes = [
  { id: 'front-reception-desk', x: 4.2, y: 21.05, width: 2.25, depth: 0.5 },
  { id: 'employee-intake-desk', x: 5.35, y: 16.25, width: 3.15, depth: 0.78 },
  { id: 'archive-racks-north', x: 7.0, y: 24.0, width: 4.8, depth: 0.5 },
  { id: 'archive-racks-south', x: 7.0, y: 27.0, width: 4.8, depth: 0.5 },
  { id: 'review-table', x: 21, y: 16.2, width: 2.3, depth: 1.0 },
  { id: 'utility-copier', x: 18.85, y: 25.15, width: 0.9, depth: 0.62 },
  { id: 'wrong-department-monolith', x: 31, y: 7.9, width: 0.44, depth: 0.2 }
];

function createGrid() {
  return OfficeMazeGenerator.buildCollisionGrid({
    width: W,
    height: H,
    spaces: rooms,
    connectors,
    objectives,
    hazards
  });
}

const collisionGrid = createGrid();

function getRoom(id) {
  const room = rooms.find(candidate => candidate.id === id);
  if (!room) {
    throw new Error(`Unknown room lighting target: ${id}`);
  }
  return room;
}

function getRoomCenter(roomOrId) {
  const room = typeof roomOrId === 'string' ? getRoom(roomOrId) : roomOrId;
  return {
    x: (room.x1 + room.x2) / 2,
    y: (room.y1 + room.y2) / 2
  };
}

function distributePositions(min, max, count, inset = 1) {
  if (count <= 1) return [(min + max) / 2];
  const start = min + inset;
  const end = max - inset;
  return Array.from({ length: count }, (_, index) => start + ((end - start) * index) / (count - 1));
}

function valueFor(value, context) {
  return typeof value === 'function' ? value(context) : value;
}

function ceilingLightGrid(roomId, options) {
  const room = getRoom(roomId);
  const xs = options.xs ?? distributePositions(room.x1, room.x2, options.columns ?? 1, options.insetX ?? 1.1);
  const ys = options.ys ?? distributePositions(room.y1, room.y2, options.rows ?? 1, options.insetY ?? 1.1);
  const lights = [];

  ys.forEach((y, row) => {
    xs.forEach((x, column) => {
      const index = lights.length;
      const context = { x, y, row, column, index };
      lights.push({
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2)),
        width: valueFor(options.width ?? 0.9, context),
        depth: valueFor(options.depth ?? 0.1, context),
        color: valueFor(options.color ?? 0xcfe9e8, context),
        fixtureColor: valueFor(options.fixtureColor ?? 0x8f9b98, context),
        frameColor: valueFor(options.frameColor ?? 0x8d989a, context),
        emissiveIntensity: valueFor(options.emissiveIntensity ?? 0.09, context),
        intensity: valueFor(options.intensity ?? 0.16, context),
        distance: valueFor(options.distance ?? 9.5, context),
        flicker: valueFor(options.flicker ?? false, context)
      });
    });
  });

  return lights;
}

function softFillLights(roomId, fills) {
  const center = getRoomCenter(roomId);
  return fills.map(fill => ({
    x: fill.x ?? Number((center.x + (fill.dx ?? 0)).toFixed(2)),
    y: fill.y ?? Number((center.y + (fill.dy ?? 0)).toFixed(2)),
    color: fill.color,
    intensity: fill.intensity,
    distance: fill.distance,
    height: fill.height
  }));
}

function buildRoomLighting() {
  const ceilingLights = [];
  const areaLights = [];

  const addCeiling = lights => ceilingLights.push(...lights);
  const addFill = lights => areaLights.push(...lights);

  addCeiling(ceilingLightGrid('front-reception', {
    xs: [4.2, 7.5, 10.8],
    ys: [19.15, 21.05],
    color: ({ row }) => (row === 0 ? 0xe1ecea : 0xd6e3e1),
    fixtureColor: 0xb6c0be,
    frameColor: 0x9aa4a6,
    width: 0.78,
    emissiveIntensity: 0.135,
    intensity: ({ column }) => (column === 1 ? 0.42 : 0.34),
    distance: 12.5
  }));
  addFill(softFillLights('front-reception', [
    { x: 7.4, y: 20.05, color: 0xdfeae8, intensity: 0.72, distance: 16, height: 2.25 },
    { x: 4.15, y: 20.9, color: 0xc9d4d3, intensity: 0.28, distance: 11.5, height: 1.45 },
    { x: 10.95, y: 19.4, color: 0xc6d1d0, intensity: 0.24, distance: 10.5, height: 1.5 },
    { x: 8.9, y: 21.15, color: 0xbec9ca, intensity: 0.22, distance: 10.5, height: 1.55 }
  ]));

  addCeiling(ceilingLightGrid('employee-intake', {
    xs: [4.35, 7.0, 9.85],
    ys: [15.1, 16.65],
    color: 0xdce9e7,
    fixtureColor: 0xb2bebb,
    frameColor: 0x97a2a4,
    width: 0.72,
    emissiveIntensity: 0.13,
    intensity: ({ column }) => (column === 1 ? 0.38 : 0.32),
    distance: 11.5
  }));
  addFill(softFillLights('employee-intake', [
    { x: 5.45, y: 16.25, color: 0xe0ecea, intensity: 0.68, distance: 13.5, height: 2.2 },
    { x: 5.6, y: 16.55, color: 0x8ccbd2, intensity: 0.2, distance: 5.5, height: 1.2 },
    { x: 9.65, y: 16.25, color: 0xc7d3d1, intensity: 0.26, distance: 10.5, height: 1.5 }
  ]));

  addCeiling(ceilingLightGrid('main-workstation-hall', {
    xs: [4.0, 7.6, 11.2, 14.8, 18.0],
    ys: [5.2, 7.6, 10.0, 12.2],
    color: ({ row }) => (row >= 2 ? 0xd6e8e7 : 0xcbdfe1),
    fixtureColor: ({ row }) => (row >= 2 ? 0xa7b4b3 : 0x9ca9aa),
    frameColor: 0x879395,
    width: ({ column }) => (column === 4 ? 0.82 : 0.88),
    emissiveIntensity: ({ row }) => (row >= 2 ? 0.115 : 0.1),
    intensity: ({ row, column }) => {
      if (row >= 2 && column >= 1 && column <= 3) return 0.34;
      if (column === 1 || column === 2 || column === 3) return 0.3;
      return 0.24;
    },
    distance: ({ row }) => (row >= 2 ? 13 : 12),
    flicker: ({ row, column }) => row === 1 && column === 3
  }));
  addFill(softFillLights('main-workstation-hall', [
    { x: 8.2, y: 11.5, color: 0xd7e8e6, intensity: 0.48, distance: 15, height: 2.35 },
    { x: 12.6, y: 9.1, color: 0xc9dde0, intensity: 0.38, distance: 14, height: 2.25 },
    { x: 7.7, y: 7.0, color: 0xbacccd, intensity: 0.3, distance: 12.5, height: 1.45 },
    { x: 14.7, y: 6.9, color: 0xbacccd, intensity: 0.28, distance: 12.5, height: 1.45 },
    { x: 3.1, y: 10.4, color: 0xb6c5c7, intensity: 0.2, distance: 12, height: 1.6 },
    { x: 18.2, y: 10.1, color: 0xb6c5c7, intensity: 0.2, distance: 12.5, height: 1.65 },
    { x: 3.2, y: 5.5, color: 0xaec0c3, intensity: 0.18, distance: 11, height: 1.55 },
    { x: 18.1, y: 6.0, color: 0xaec0c3, intensity: 0.18, distance: 11, height: 1.55 }
  ]));

  addCeiling(ceilingLightGrid('archive', {
    xs: [5.0, 9.0, 13.0],
    ys: [24.0, 26.7],
    color: 0xb9c9df,
    fixtureColor: 0x8895a0,
    frameColor: 0x77838b,
    width: 0.92,
    emissiveIntensity: 0.09,
    intensity: ({ row }) => (row === 0 ? 0.24 : 0.2),
    distance: 10.5
  }));
  addFill(softFillLights('archive', [
    { x: 7, y: 25, color: 0xa8bbd8, intensity: 0.34, distance: 11.5, height: 1.9 },
    { x: 12.2, y: 26.5, color: 0x8fa2b8, intensity: 0.18, distance: 9, height: 1.45 }
  ]));

  addCeiling(ceilingLightGrid('checkpoint-chamber', {
    xs: [19.2, 22.4],
    ys: [13.0, 16.6],
    color: 0xc0eef2,
    fixtureColor: 0x8fb0b4,
    frameColor: 0x789297,
    width: 1.0,
    emissiveIntensity: 0.13,
    intensity: ({ column }) => (column === 1 ? 0.38 : 0.32),
    distance: 11.5
  }));
  addFill(softFillLights('checkpoint-chamber', [
    { x: 21, y: 15, color: 0xbff1f5, intensity: 0.56, distance: 13.5, height: 2.65 },
    { x: 21, y: 16.4, color: 0x8fcfd8, intensity: 0.22, distance: 8, height: 1.25 }
  ]));

  addCeiling(ceilingLightGrid('wrong-department', {
    xs: [27.0, 31.0, 34.0],
    ys: [6.0, 8.6],
    color: 0xd9dccd,
    fixtureColor: 0xb0b0a3,
    frameColor: 0x96988f,
    width: 0.9,
    emissiveIntensity: 0.105,
    intensity: 0.3,
    distance: 11.5
  }));
  addFill(softFillLights('wrong-department', [
    { x: 31, y: 7, color: 0xdadcc9, intensity: 0.34, distance: 12, height: 2.55 },
    { x: 26.2, y: 8.8, color: 0xc4c8ba, intensity: 0.18, distance: 9.5, height: 1.5 }
  ]));

  addCeiling(ceilingLightGrid('utility-break', {
    xs: [20.5, 23.0, 25.5],
    ys: [25.4],
    color: 0xcbd5c4,
    fixtureColor: 0x929b8c,
    frameColor: 0x7f897f,
    width: 0.82,
    emissiveIntensity: 0.08,
    intensity: 0.22,
    distance: 9.8
  }));
  addFill(softFillLights('utility-break', [
    { x: 20, y: 25, color: 0xbec9b8, intensity: 0.22, distance: 9.5, height: 1.65 },
    { x: 25.8, y: 26.2, color: 0xaebaa9, intensity: 0.16, distance: 8.5, height: 1.45 }
  ]));

  addCeiling(ceilingLightGrid('crusher-corridor', {
    xs: [27.2, 31.0, 34.8],
    ys: [15.0],
    color: 0xd45c48,
    fixtureColor: 0x8a655d,
    frameColor: 0x735a55,
    width: 0.95,
    emissiveIntensity: 0.135,
    intensity: ({ column }) => (column === 1 ? 0.46 : 0.36),
    distance: 12.5
  }));
  addFill(softFillLights('crusher-corridor', [
    { x: 31, y: 15, color: 0xd45c48, intensity: 0.62, distance: 15, height: 2.2 },
    { x: 25.8, y: 15, color: 0xc97868, intensity: 0.24, distance: 9.5, height: 1.35 },
    { x: 36.2, y: 15, color: 0xc97868, intensity: 0.24, distance: 9.5, height: 1.35 },
    { x: 31, y: 15.75, color: 0xcab5af, intensity: 0.16, distance: 11, height: 1.7 }
  ]));

  addCeiling(ceilingLightGrid('fake-exit', {
    xs: [38.6, 40.8],
    ys: [13.9, 16.4],
    color: 0xe5f2ec,
    fixtureColor: 0xb8c7bf,
    frameColor: 0x95a39d,
    width: 0.82,
    emissiveIntensity: 0.13,
    intensity: 0.4,
    distance: 11.5
  }));
  addFill(softFillLights('fake-exit', [
    { x: 40, y: 15, color: 0xe4f2ec, intensity: 0.5, distance: 12.5, height: 2.25 },
    { x: 38.5, y: 13.3, color: 0xa8d9bd, intensity: 0.18, distance: 8.5, height: 1.5 }
  ]));

  addCeiling(ceilingLightGrid('final-route', {
    xs: [37.0, 40.5],
    ys: [23.0, 26.3],
    color: ({ row }) => (row === 0 ? 0xc4edf0 : 0xe4f2f0),
    fixtureColor: 0x9fb8ba,
    frameColor: 0x819b9f,
    width: 0.95,
    emissiveIntensity: 0.13,
    intensity: ({ row }) => (row === 0 ? 0.34 : 0.38),
    distance: 11.5
  }));
  addFill(softFillLights('final-route', [
    { x: 40, y: 24, color: 0xa6dde5, intensity: 0.46, distance: 12.5, height: 2.4 },
    { x: 41, y: 27, color: 0xe2f1ef, intensity: 0.28, distance: 9, height: 1.8 }
  ]));

  return { ceilingLights, areaLights };
}

const roomLighting = buildRoomLighting();

export const level1 = {
  schemaVersion: 1,
  id: 'department-incorrect',
  title: 'Department Incorrect',
  estimatedMinutes: 20,
  spaces: rooms,
  connectors,
  objectives,
  hazards,
  storyBeats,
  manipulationNodes,
  lightingZones,
  collisionVolumes,
  collisionGrid,
  grid: collisionGrid,
  rooms,
  roomLayoutSpecs,
  roomLayoutAnchors,
  playerStart: { x: 8.2, y: 20.65, yaw: 0.03, pitch: -0.045 },
  goals: objectives.filter(objective => objective.type === 'finalExit').map(objective => ({
    id: objective.id,
    x: objective.x,
    y: objective.y,
    height: objective.height,
    requiresAllCheckpoints: true,
    lockTriggerId: objective.lockTriggerId
  })),
  checkpoints: objectives.filter(objective => objective.type === 'task'),
  triggers: hazards.filter(hazard => hazard.type === 'fakeExitTrigger'),
  crushers: hazards.filter(hazard => hazard.type === 'crusher'),
  sentientObjects: [],
  floorZones: [
    { id: 'front-reception', x1: 2, y1: 18, x2: 12, y2: 21, color: 0xb8bbb6, emissive: 0x151a19, emissiveIntensity: 0.045, roughness: 0.66, metalness: 0.05, height: 0, floorLineColor: 0x8f9896, floorLineOpacity: 0.24 },
    { id: 'employee-intake', x1: 2, y1: 14, x2: 12, y2: 17, color: 0xb0bab7, emissive: 0x141b1a, emissiveIntensity: 0.045, roughness: 0.7, metalness: 0.04, height: 0, floorLineColor: 0x879290, floorLineOpacity: 0.22 },
    { id: 'main-workstation-hall', x1: 2, y1: 4, x2: 19, y2: 12, color: 0x8f9c9e, emissive: 0x0f1618, emissiveIntensity: 0.04, roughness: 0.84, height: 0, floorLineColor: 0x748185, floorLineOpacity: 0.2, floorLineStep: 2 },
    { id: 'archive', x1: 3, y1: 23, x2: 15, y2: 28, color: 0x5f6d75, emissive: 0x0b1016, emissiveIntensity: 0.055, roughness: 0.86, height: -0.03, floorLineColor: 0x4f5b62, floorLineOpacity: 0.16, floorLineStep: 2 },
    { id: 'checkpoint-chamber', x1: 18, y1: 12, x2: 24, y2: 18, color: 0x809aa0, emissive: 0x0c1b1f, emissiveIntensity: 0.07, roughness: 0.78, height: 0.08, floorLineColor: 0x6f858a, floorLineOpacity: 0.18 },
    { id: 'wrong-department', x1: 25, y1: 4, x2: 35, y2: 10, color: 0xa6aba2, emissive: 0x12140f, emissiveIntensity: 0.04, roughness: 0.78, height: 0.04, floorLineColor: 0x858b82, floorLineOpacity: 0.18, floorLineStep: 2 },
    { id: 'utility-break', x1: 18, y1: 23, x2: 28, y2: 28, color: 0x7f897d, emissive: 0x10140e, emissiveIntensity: 0.035, roughness: 0.86, height: 0, floorLineColor: 0x6e796e, floorLineOpacity: 0.14, floorLineStep: 2 },
    { id: 'crusher-corridor', x1: 25, y1: 14, x2: 37, y2: 16, color: 0x72564f, emissive: 0x210805, emissiveIntensity: 0.09, roughness: 0.78, height: -0.08, floorLineColor: 0x8b6a60, floorLineOpacity: 0.16 },
    { id: 'fake-exit', x1: 38, y1: 12, x2: 42, y2: 18, color: 0xb8c7bf, emissive: 0x101a15, emissiveIntensity: 0.055, roughness: 0.68, height: -0.04, floorLineColor: 0x94a59d, floorLineOpacity: 0.2 },
    { id: 'final-route', x1: 36, y1: 22, x2: 42, y2: 28, color: 0x9fbfc3, emissive: 0x0b1d20, emissiveIntensity: 0.08, roughness: 0.68, height: -0.04, floorLineColor: 0x80a3a8, floorLineOpacity: 0.16, floorLineStep: 2 }
  ],
  wallDetailZones: [
    { id: 'reception-intake-trim', x1: 2, y1: 14, x2: 12, y2: 21 },
    { id: 'workstation-entry-trim', x1: 2, y1: 4, x2: 20, y2: 14 },
    { id: 'archive-service-trim', x1: 3, y1: 17, x2: 15, y2: 28 },
    { id: 'review-office-trim', x1: 17, y1: 10, x2: 25, y2: 19 },
    { id: 'department-wing-trim', x1: 24, y1: 4, x2: 35, y2: 13 },
    { id: 'staff-transfer-trim', x1: 18, y1: 18, x2: 28, y2: 28 },
    { id: 'exit-service-trim', x1: 25, y1: 12, x2: 42, y2: 28 }
  ],
  ceilingDetailZones: [
    { id: 'reception-intake-ceiling', x1: 2, y1: 14, x2: 12, y2: 21, step: 1 },
    { id: 'workstation-entry-ceiling', x1: 2, y1: 4, x2: 19, y2: 12, step: 2 },
    { id: 'archive-ceiling', x1: 3, y1: 23, x2: 15, y2: 28, step: 2 },
    { id: 'review-ceiling', x1: 18, y1: 12, x2: 24, y2: 18, step: 1.5 },
    { id: 'records-office-ceiling', x1: 25, y1: 4, x2: 35, y2: 10, step: 2 },
    { id: 'staff-ceiling', x1: 18, y1: 23, x2: 28, y2: 28, step: 2 },
    { id: 'exit-transfer-ceiling', x1: 25, y1: 12, x2: 42, y2: 28, step: 2 }
  ],
  guideStrips: [],
  navigationNodes: [],
  areaLights: roomLighting.areaLights,
  ceilingLights: roomLighting.ceilingLights,
  routes: [
    {
      id: 'critical-path',
      label: 'Critical Route',
      color: 0x86f7b2,
      points: [
        { x: 8.2, y: 20.65 },
        { x: 5.35, y: 16.16 },
        { x: 8, y: 7 },
        { x: 7, y: 25 },
        { x: 21, y: 15 },
        { x: 31, y: 7 },
        { x: 36, y: 15 },
        { x: 40, y: 24 },
        { x: 41, y: 27 }
      ]
    },
    {
      id: 'crusher-path',
      label: 'Crusher Travel',
      color: 0xc43c24,
      points: [
        { x: 37, y: 15 },
        { x: 25, y: 15 }
      ]
    }
  ],
  aiManipulation: {
    controllerId: 'department-intelligence',
    lockableRoutes: [
      { id: 'entry-loop', from: 'front-reception', to: 'employee-intake', anchor: { x: 8, y: 17 } },
      { id: 'records-hall', from: 'checkpoint-chamber', to: 'fake-exit', anchor: { x: 25, y: 15 } },
      { id: 'final-afterimage', from: 'fake-exit', to: 'final-route', anchor: { x: 40, y: 19 } }
    ],
    lightChannels: [
      { id: 'normal-office', rooms: ['front-reception', 'employee-intake', 'main-workstation-hall'] },
      { id: 'ai-cyan', rooms: ['checkpoint-chamber', 'final-route'] },
      { id: 'emergency', rooms: ['crusher-corridor'] },
      { id: 'wrongness', rooms: ['wrong-department', 'archive'] },
      { id: 'staff-muted', rooms: ['utility-break'] },
      { id: 'false-exit', rooms: ['fake-exit'] }
    ],
    signageChannels: [
      { id: 'department-labels', rooms: ['front-reception', 'employee-intake', 'main-workstation-hall', 'wrong-department', 'fake-exit'] }
    ],
    fakeExits: [
      { id: 'public-exit', room: 'fake-exit', triggerId: 'fake-exit-pressure' }
    ],
    loopCandidates: [
      { id: 'archive-return-loop', rooms: ['archive', 'employee-intake'] }
    ]
  },
  // Architecture placement contract:
  // - Use officeProps prefabs instead of raw architecture objects when possible.
  // - Use officeProps signage prefabs for all signs.
  // - Do not add raw sign objects unless absolutely necessary.
  // - Signs must follow roomLayoutSpecs and future roomLayoutAnchors.
  // - Signs should be wayfinding, not debug labels.
  // - Do not add raw glassWall/sign/frame/beam objects manually unless absolutely necessary.
  // - All future props should follow roomLayoutSpecs and roomLayoutAnchors.
  // - Empty space is allowed; do not fill empty space with random props.
  // - Every architecture object must belong to a roomLayoutSpecs allowed object type.
  // - Every architecture object must sit inside a roomLayoutAnchors furniture/signage/glass/frame/window zone.
  // - If an object is not tied to a zone, remove it or move it to the nearest valid zone.
  // - Do not fill empty space just because it is empty.
  architecture: [
    officeProps.receptionDesk({ x: 4.2, y: 21.05, roomId: 'front-reception', anchor: 'receptionDeskZone' }),
    officeProps.intakeDesk({ x: 5.35, y: 16.25, roomId: 'employee-intake', anchor: 'intakeDeskZone' }),
    officeProps.officeSofa({ x: 3.35, y: 19.18, roomId: 'front-reception', anchor: 'seatingZone' }),
    officeProps.waitingChairs({ x: 11.05, y: 19.05, axis: 'z', rotation: -Math.PI / 2, roomId: 'front-reception', anchor: 'sideWaitingChairZone' }),
    officeProps.coffeeTable({ x: 4.25, y: 19.32, roomId: 'front-reception', anchor: 'seatingZone' }),
    officeProps.pottedPlant({ x: 2.7, y: 18.35, roomId: 'front-reception', anchor: 'plantZones' }),
    officeProps.pottedPlant({ x: 11.45, y: 20.7, color: 0x4b6f5a, potColor: 0x8a877f, roomId: 'front-reception', anchor: 'plantZones' }),
    officeProps.wallSign({ id: 'night-entry-sign', x: 4.2, y: 22.05, text: 'NIGHT SHIFT\nENTRY', height: 1.94, rotation: Math.PI, roomId: 'front-reception', anchor: 'entryWallSignZone', face: 'south', purpose: 'entry-label' }),
    officeProps.departmentSign({ id: 'intake-sign', x: 5.35, y: 17.05, text: 'EMPLOYEE\nINTAKE', color: 0xd8ebe7, width: 1.12, height: 1.9, rotation: Math.PI, roomId: 'employee-intake', anchor: 'behindIntakeDeskSignZone', face: 'south' }),
    officeProps.departmentSign({ id: 'main-hall-sign', x: 11.2, y: 12.05, text: 'MAIN WORKSTATION\nHALL', width: 1.18, height: 1.92, roomId: 'main-workstation-hall', anchor: 'mainHallEntryWallSignZone', face: 'south' }),
    {
      type: 'taskTerminal',
      x: 5.85,
      y: 16.35,
      color: 0xa6dce4,
      desktop: true,
      surfaceHeight: 0.92,
      text: 'Welcome to Records Department.\nRetrieve your Shift Assignment Form.'
    },
    officeProps.departmentSign({ id: 'wrong-dept-sign', x: 31, y: 10.05, text: 'ACCOUNTS /\nRECORDS OFFICE', color: 0xd0d1bd, width: 1.18, height: 1.92, roomId: 'wrong-department', anchor: 'accountsFrontSignZone', face: 'south' }),
    officeProps.exitSign({ id: 'fake-exit-sign', x: 41.85, y: 13.65, text: 'PUBLIC\nEXIT', height: 1.96, rotation: -Math.PI / 2, roomId: 'fake-exit', anchor: 'publicExitWallSignZone', face: 'east' }),
    officeProps.wallSign({ id: 'archive-sign', x: 7, y: 22.05, text: 'RECORDS\nARCHIVE', color: 0xaebcff, width: 1.08, height: 1.9, rotation: Math.PI, roomId: 'archive', anchor: 'archiveEntranceSignZone', face: 'north' }),
    officeProps.departmentSign({ id: 'review-sign', x: 19.2, y: 11.05, text: 'COUNSELLOR /\nREVIEW', color: 0xb7f7ff, width: 1.12, height: 1.9, roomId: 'checkpoint-chamber', anchor: 'reviewDoorwaySignZone', face: 'north' }),
    officeProps.wallSign({ id: 'staff-sign', x: 22.5, y: 22.05, text: 'STAFF\nROOM', color: 0xc5d0b6, width: 1.0, height: 1.9, rotation: Math.PI, roomId: 'utility-break', anchor: 'staffEntranceSignZone', face: 'north' }),
    { type: 'taskTerminal', x: 8, y: 7, color: 0xbde1e0 },
    { type: 'taskTerminal', x: 7, y: 25, color: 0xa8bbd8 },
    { type: 'taskTerminal', x: 21, y: 15, color: 0xb7eef4 },
    { type: 'taskTerminal', x: 31, y: 7, color: 0xdadcc9 },
    officeProps.workstationClusterLeft({ x: 3.7, y: 5.25, roomId: 'main-workstation-hall', anchor: 'leftWorkstationRows' }),
    officeProps.workstationClusterRight({ x: 12.5, y: 5.25, roomId: 'main-workstation-hall', anchor: 'rightWorkstationRows' }),
    officeProps.copyMachine({ x: 18.25, y: 5.25, roomId: 'main-workstation-hall', anchor: 'printerZone' }),
    officeProps.serverRackRow({ x: 5, y: 24, roomId: 'archive', anchor: 'rackRowNorth' }),
    officeProps.serverRackRow({ x: 5, y: 27, color: 0x37414a, roomId: 'archive', anchor: 'rackRowSouth' }),
    officeProps.meetingTable({ x: 21, y: 16.2, roomId: 'checkpoint-chamber', anchor: 'meetingTableZone' }),
    officeProps.reviewGlassPartition({ x: 18.05, y: 16.4, axis: 'z', roomId: 'checkpoint-chamber', anchor: 'westBoundaryPartition' }),
    officeProps.officeFrontGlass({ x: 31, y: 10.65, axis: 'x', roomId: 'wrong-department', anchor: 'accountsFrontBoundary' }),
    officeProps.copyMachine({ x: 18.85, y: 25.15, color: 0xb1b8b4, roomId: 'utility-break', anchor: 'copyCabinetZone' }),
    officeProps.monolithTerminal({ x: 31, y: 7.9, roomId: 'wrong-department', anchor: 'monolithZone' }),
    officeProps.emergencyDoorFrame({ x: 25, y: 15, color: 0x7a615a, emissive: 0x1b0603, emissiveIntensity: 0.12, anchor: 'westEntranceFrame' }),
    officeProps.emergencyDoorFrame({ x: 37, y: 15, color: 0x90a79a, emissive: 0x07150d, emissiveIntensity: 0.08, anchor: 'eastExitFrame' }),
    officeProps.emergencyWarningTrim({ x: 31, y: 14.05, anchor: 'northEdgeWarningBeam' }),
    officeProps.emergencyWarningTrim({ x: 31, y: 15.95, anchor: 'southEdgeWarningBeam' }),
    officeProps.observationWindowBand({ x: 42.05, y: 24.8, roomId: 'final-route', anchor: 'eastObservationWindowBand' }),
    officeProps.finalDoorSlab({ x: 41, y: 27.8, roomId: 'final-route', anchor: 'finalDoorZone' })
  ]
};
