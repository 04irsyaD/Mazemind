const metadataDefaults = {
  roomId: undefined,
  anchor: undefined,
  mount: undefined,
  face: undefined,
  purpose: undefined,
  modelId: undefined,
  modelUrl: undefined,
  assetTag: undefined,
  scale: undefined,
  rotation: undefined
};

const withDefaults = (defaults, config = {}) => ({
  ...metadataDefaults,
  ...defaults,
  ...config
});

const signWithDefaults = (defaults, config = {}) => {
  const maxWidth = config.maxWidth ?? defaults.maxWidth ?? 1.4;
  const width = config.allowOversize ? (config.width ?? defaults.width) : Math.min(config.width ?? defaults.width, maxWidth);

  return withDefaults({
    type: 'sign',
    channelId: 'department-labels',
    color: 0xcfe9e8,
    height: 2.08,
    width,
    maxWidth,
    ...defaults
  }, {
    ...config,
    width
  });
};

const deskMaterialDefaults = {
  color: 0xb7bbb7,
  panelColor: 0xacb2af,
  topColor: 0xd1d3cd,
  trimColor: 0x8b9698,
  roughness: 0.72,
  metalness: 0.04
};

const workstationDefaults = {
  type: 'cubicleCluster',
  columns: 3,
  rows: 4,
  spacingX: 1.45,
  spacingY: 1.46,
  deskWidth: 3.32,
  deskDepth: 1.64,
  partitionHeight: 0.56,
  frostedOpacity: 0.28,
  color: 0xd8dedf,
  partitionColor: 0xdde3e3,
  frostedColor: 0xe2f2f1,
  deskColor: 0xe2d8c5,
  deskBodyColor: 0xd4dbda,
  trimColor: 0x6d777b,
  monitorColor: 0x6fa8ad,
  monitorIntensity: 0.058,
  chairColor: 0x252d33,
  chairAccentColor: 0x37535c,
  purpose: 'workstation-cluster'
};

export const officeProps = {
  wallSign(config = {}) {
    return signWithDefaults({
      width: 1.05,
      maxWidth: 1.15,
      height: 1.94,
      mount: 'wall',
      purpose: 'wayfinding'
    }, config);
  },

  departmentSign(config = {}) {
    return signWithDefaults({
      width: 1.18,
      maxWidth: 1.4,
      height: 1.96,
      mount: 'wall',
      purpose: 'department-label'
    }, config);
  },

  exitSign(config = {}) {
    return signWithDefaults({
      width: 1.0,
      maxWidth: 1.15,
      height: 1.96,
      color: 0x86f7b2,
      mount: 'doorway',
      purpose: 'exit-wayfinding'
    }, config);
  },

  warningSign(config = {}) {
    return signWithDefaults({
      width: 1.1,
      maxWidth: 1.25,
      height: 1.96,
      color: 0xffb2a8,
      mount: 'wall',
      purpose: 'warning'
    }, config);
  },

  receptionDesk(config = {}) {
    return withDefaults({
      type: 'receptionDesk',
      width: 2.25,
      depth: 0.5,
      ...deskMaterialDefaults,
      purpose: 'reception-counter'
    }, config);
  },

  intakeDesk(config = {}) {
    return withDefaults({
      type: 'receptionDesk',
      width: 3.15,
      depth: 0.78,
      ...deskMaterialDefaults,
      color: 0xb9bdb9,
      panelColor: 0xaeb5b2,
      topColor: 0xd5d7d0,
      trimColor: 0x879496,
      purpose: 'intake-counter'
    }, config);
  },

  officeDesk(config = {}) {
    return withDefaults({
      type: 'receptionDesk',
      width: 1.4,
      depth: 0.75,
      ...deskMaterialDefaults,
      purpose: 'office-desk'
    }, config);
  },

  officeSofa(config = {}) {
    return withDefaults({
      type: 'sofa',
      width: 2.1,
      color: 0x6f7d82,
      purpose: 'waiting-seating'
    }, config);
  },

  waitingChairs(config = {}) {
    return withDefaults({
      type: 'waitingChairs',
      count: 2,
      spacing: 0.7,
      color: 0x394147,
      purpose: 'waiting-seating'
    }, config);
  },

  officeChairSet(config = {}) {
    return withDefaults({
      type: 'waitingChairs',
      count: 2,
      spacing: 0.7,
      color: 0x394147,
      purpose: 'office-chair-set'
    }, config);
  },

  coffeeTable(config = {}) {
    return withDefaults({
      type: 'coffeeTable',
      width: 1.1,
      depth: 0.55,
      color: 0xb8b8b0,
      purpose: 'waiting-table'
    }, config);
  },

  pottedPlant(config = {}) {
    return withDefaults({
      type: 'plant',
      color: 0x4f765f,
      potColor: 0x8c8980,
      purpose: 'corner-softener'
    }, config);
  },

  copyMachine(config = {}) {
    return withDefaults({
      type: 'copyMachine',
      color: 0xc9cfcb,
      purpose: 'office-equipment'
    }, config);
  },

  serverRackRow(config = {}) {
    return withDefaults({
      type: 'serverRackRow',
      count: 4,
      axis: 'x',
      color: 0x3b4650,
      emissive: 0x20395f,
      emissiveIntensity: 0.12,
      purpose: 'records-storage'
    }, config);
  },

  meetingTable(config = {}) {
    return withDefaults({
      type: 'meetingTable',
      width: 2.3,
      depth: 1.0,
      color: 0xa7afb1,
      purpose: 'review-table'
    }, config);
  },

  monolithTerminal(config = {}) {
    return withDefaults({
      type: 'monolith',
      width: 0.44,
      depth: 0.2,
      height: 1.25,
      color: 0x625b70,
      emissive: 0x967fb0,
      emissiveIntensity: 0.16,
      purpose: 'terminal-monolith'
    }, config);
  },

  workstationCluster(config = {}) {
    return withDefaults(workstationDefaults, config);
  },

  workstationClusterLeft(config = {}) {
    return withDefaults({
      ...workstationDefaults,
      rotation: Math.PI / 2,
      frostedOpacity: 0.28
    }, config);
  },

  workstationClusterRight(config = {}) {
    return withDefaults({
      ...workstationDefaults,
      rotation: -Math.PI / 2,
      frostedOpacity: 0.26,
      color: 0xd3dadc,
      partitionColor: 0xd8dfe0,
      frostedColor: 0xdceeee,
      deskColor: 0xdedfd8,
      deskBodyColor: 0xcbd3d2,
      trimColor: 0x667176,
      monitorColor: 0x659da4,
      monitorIntensity: 0.052,
      chairColor: 0x232b31,
      chairAccentColor: 0x344e57
    }, config);
  },

  reviewGlassPartition(config = {}) {
    return withDefaults({
      type: 'glassWall',
      length: 2.8,
      color: 0xb7d4dc,
      opacity: 0.15,
      frameColor: 0x6f858a,
      frostedOpacity: 0.26,
      boundaryAligned: true,
      purpose: 'review-boundary'
    }, config);
  },

  officeFrontGlass(config = {}) {
    return withDefaults({
      type: 'glassWall',
      length: 4.0,
      color: 0xd0d6c8,
      opacity: 0.16,
      frameColor: 0x747d7a,
      frostedOpacity: 0.22,
      postSpacing: 1.25,
      boundaryAligned: true,
      purpose: 'office-front-boundary'
    }, config);
  },

  emergencyDoorFrame(config = {}) {
    return withDefaults({
      type: 'frame',
      axis: 'x',
      width: 2.45,
      roomId: 'crusher-corridor',
      mount: 'doorway',
      purpose: 'entrance-frame'
    }, config);
  },

  emergencyWarningTrim(config = {}) {
    return withDefaults({
      type: 'beam',
      axis: 'x',
      length: 11.4,
      color: 0x72564f,
      emissive: 0x150302,
      emissiveIntensity: 0.1,
      roomId: 'crusher-corridor',
      mount: 'corridor-edge',
      edgeAligned: true,
      purpose: 'warning-trim'
    }, config);
  },

  finalDoorSlab(config = {}) {
    return withDefaults({
      type: 'doorSlab',
      width: 1.6,
      color: 0xaebdb8,
      emissive: 0x0a2013,
      emissiveIntensity: 0.08,
      purpose: 'final-door'
    }, config);
  },

  observationWindowBand(config = {}) {
    return withDefaults({
      type: 'windowBand',
      axis: 'z',
      length: 5,
      color: 0xa6dce4,
      emissiveIntensity: 0.08,
      purpose: 'observation-window'
    }, config);
  }
};
