import { CONSTANTS } from '../../core/Constants.js';

const DEFAULT_MOUNT_HEIGHT = 1.9;
const DEFAULT_WALL_MOUNT_OFFSET = 0.465;

const metersToCells = meters => Number((meters / CONSTANTS.CELL_SIZE).toFixed(3));

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);

const stripUndefined = value => {
  if (Array.isArray(value)) return value.map(stripUndefined);
  if (!isObject(value)) return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entryValue]) => entryValue !== undefined)
      .map(([key, entryValue]) => [key, stripUndefined(entryValue)])
  );
};

const normalizeSize = (object, fallback = {}) => ({
  width: object.size?.width ?? object.width ?? object.length ?? fallback.width ?? 1,
  height: object.size?.height ?? object.panelHeight ?? fallback.height ?? object.height ?? 1,
  depth: object.size?.depth ?? object.depth ?? object.railDepth ?? fallback.depth ?? 1
});

const normalizePosition = object => {
  const mapX = object.x ?? object.position?.x ?? 0;
  const mapY = object.y ?? object.position?.z ?? 0;
  const verticalY = object.positionY ?? (object.type === 'sign' ? object.height : object.position?.y) ?? 0;

  return { x: mapX, y: verticalY, z: mapY };
};

const metadataFor = (prefab, object) => stripUndefined({
  prefab,
  roomId: object.roomId,
  anchor: normalizeAnchor(object.anchor, object.room),
  mount: object.mount,
  face: object.face ?? object.wall,
  purpose: object.purpose,
  modelId: object.modelId ?? null,
  modelUrl: object.modelUrl ?? null,
  assetTag: object.assetTag,
  visualOnly: object.visualOnly ?? false
});

const withoutPrefabOnlyFields = object => {
  const {
    allowOversize,
    maxWidth,
    mountHeight,
    room,
    wall,
    positionY,
    ...publicFields
  } = object;

  return publicFields;
};

const createPrefabObject = (prefab, defaults, config = {}) => {
  const merged = {
    ...defaults,
    ...config
  };
  const x = merged.x ?? merged.position?.x ?? 0;
  const y = merged.y ?? merged.position?.z ?? 0;
  const rotation = merged.rotation ?? 0;
  const size = normalizeSize(merged, defaults.size);
  const publicFields = withoutPrefabOnlyFields({
    ...merged,
    x,
    y,
    rotation,
    size
  });

  return stripUndefined({
    ...publicFields,
    position: normalizePosition({ ...publicFields, x, y, rotation }),
    metadata: metadataFor(prefab, merged)
  });
};

export function resolveWallRotation(wall) {
  const normalizedWall = String(wall ?? '').toLowerCase();
  const rotations = {
    north: Math.PI,
    south: 0,
    east: -Math.PI / 2,
    west: Math.PI / 2
  };

  return rotations[normalizedWall] ?? 0;
}

export function normalizeAnchor(anchor, room) {
  if (!anchor) return undefined;
  if (typeof anchor === 'string') return { id: anchor };

  const roomBounds = room?.roomBounds ?? room;
  return stripUndefined({
    ...anchor,
    roomId: anchor.roomId ?? room?.id,
    roomBounds
  });
}

export function mountToWall(room, wall, options = {}) {
  const roomBounds = room?.roomBounds ?? room ?? {};
  const x1 = roomBounds.x1 ?? 0;
  const x2 = roomBounds.x2 ?? x1;
  const y1 = roomBounds.y1 ?? 0;
  const y2 = roomBounds.y2 ?? y1;
  const centerX = (x1 + x2) / 2;
  const centerY = (y1 + y2) / 2;
  const offset = options.wallOffset ?? DEFAULT_WALL_MOUNT_OFFSET;
  const normalizedWall = String(wall ?? '').toLowerCase();

  const mounted = {
    wall: normalizedWall,
    mount: options.mount ?? 'wall',
    height: options.mountHeight ?? options.height ?? DEFAULT_MOUNT_HEIGHT,
    rotation: options.rotation ?? resolveWallRotation(normalizedWall)
  };

  if (normalizedWall === 'north') {
    return { ...mounted, x: options.x ?? options.coord ?? centerX, y: y1 - offset };
  }
  if (normalizedWall === 'south') {
    return { ...mounted, x: options.x ?? options.coord ?? centerX, y: y2 + offset };
  }
  if (normalizedWall === 'east') {
    return { ...mounted, x: x2 + offset, y: options.y ?? options.coord ?? centerY };
  }
  if (normalizedWall === 'west') {
    return { ...mounted, x: x1 - offset, y: options.y ?? options.coord ?? centerY };
  }

  return { ...mounted, x: options.x ?? centerX, y: options.y ?? centerY };
}

const signWithDefaults = (prefab, defaults, config = {}) => {
  const wall = config.wall ?? config.face ?? defaults.wall ?? defaults.face;
  const mounted = config.room && wall ? mountToWall(config.room, wall, config) : {};
  const sizeInput = {
    ...defaults.size,
    ...config.size
  };
  const maxWidth = config.maxWidth ?? defaults.maxWidth ?? sizeInput.width;
  const signWidth = config.allowOversize ? sizeInput.width : Math.min(sizeInput.width, maxWidth);
  const size = {
    width: signWidth,
    height: sizeInput.height,
    depth: sizeInput.depth
  };
  const signConfig = {
    type: 'sign',
    channelId: 'department-labels',
    color: 0xcfe9e8,
    mount: 'wall',
    purpose: 'wayfinding',
    ...defaults,
    ...config,
    x: config.x ?? mounted.x ?? defaults.x ?? 0,
    y: config.y ?? mounted.y ?? defaults.y ?? 0,
    rotation: config.rotation ?? mounted.rotation ?? resolveWallRotation(wall),
    height: config.mountHeight ?? config.height ?? mounted.height ?? defaults.mountHeight ?? DEFAULT_MOUNT_HEIGHT,
    width: config.width ?? metersToCells(signWidth),
    panelHeight: config.panelHeight ?? size.height,
    depth: config.depth ?? size.depth,
    size,
    wall
  };

  return createPrefabObject(prefab, signConfig);
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
  purpose: 'workstation-cluster',
  size: { width: 7.0, height: 1.42, depth: 5.5 }
};

export function validatePrefabObject(object) {
  const errors = [];
  const visit = (value, path) => {
    if (value === undefined) errors.push(`${path} is undefined`);
    if (typeof value === 'number' && Number.isNaN(value)) errors.push(`${path} is NaN`);
    if (Array.isArray(value)) value.forEach((entry, index) => visit(entry, `${path}[${index}]`));
    if (isObject(value)) Object.entries(value).forEach(([key, entryValue]) => visit(entryValue, `${path}.${key}`));
  };

  if (!object || !isObject(object)) {
    return { valid: false, errors: ['Prefab object must be an object'] };
  }

  if (!object.type) errors.push('type is required');
  if (!object.position) errors.push('position is required');
  if (typeof object.rotation !== 'number') errors.push('rotation is required');
  if (!object.size && !object.scale) errors.push('size or scale is required');
  if (!object.metadata?.prefab) errors.push('metadata.prefab is required');

  visit(object, 'object');

  if (object.size) {
    Object.entries(object.size).forEach(([key, value]) => {
      if (typeof value === 'number' && value <= 0) errors.push(`size.${key} must be positive`);
    });
  }

  if (object.type === 'sign') {
    if ((object.size?.width ?? 0) > 2.2) errors.push('sign size.width is too large');
    if ((object.size?.height ?? 0) > 0.55) errors.push('sign size.height is too large');
    if ((object.width ?? 0) > 0.75) errors.push('sign renderer width is too large');
    if (!object.metadata?.roomId) errors.push('sign metadata.roomId is required');
    if (!object.metadata?.anchor?.id) errors.push('sign metadata.anchor.id is required');
  }

  return { valid: errors.length === 0, errors };
}

export function validatePrefabObjects(objects) {
  return objects.map((object, index) => ({
    index,
    ...validatePrefabObject(object)
  }));
}

export const officeProps = {
  wallSign(config = {}) {
    return signWithDefaults('wallSign', {
      size: { width: 1.6, height: 0.32, depth: 0.04 },
      maxWidth: 1.8,
      mount: 'wall',
      purpose: 'wayfinding'
    }, config);
  },

  departmentSign(config = {}) {
    return signWithDefaults('departmentSign', {
      size: { width: 2.0, height: 0.38, depth: 0.05 },
      maxWidth: 2.1,
      mount: 'wall',
      purpose: 'department-label'
    }, config);
  },

  exitSign(config = {}) {
    return signWithDefaults('exitSign', {
      size: { width: 1.1, height: 0.28, depth: 0.04 },
      maxWidth: 1.25,
      color: 0x86f7b2,
      mount: 'doorway',
      purpose: 'exit-wayfinding'
    }, config);
  },

  warningSign(config = {}) {
    return signWithDefaults('warningSign', {
      size: { width: 1.4, height: 0.35, depth: 0.04 },
      maxWidth: 1.5,
      color: 0xffb2a8,
      mount: 'wall',
      purpose: 'warning'
    }, config);
  },

  receptionDesk(config = {}) {
    return createPrefabObject('receptionDesk', {
      type: 'receptionDesk',
      width: 2.25,
      depth: 0.5,
      size: { width: 2.25, height: 0.94, depth: 0.5 },
      ...deskMaterialDefaults,
      purpose: 'reception-counter'
    }, config);
  },

  intakeDesk(config = {}) {
    return createPrefabObject('intakeDesk', {
      type: 'receptionDesk',
      width: 3.15,
      depth: 0.78,
      size: { width: 3.15, height: 0.94, depth: 0.78 },
      ...deskMaterialDefaults,
      color: 0xb9bdb9,
      panelColor: 0xaeb5b2,
      topColor: 0xd5d7d0,
      trimColor: 0x879496,
      purpose: 'intake-counter'
    }, config);
  },

  officeDesk(config = {}) {
    return createPrefabObject('officeDesk', {
      type: 'receptionDesk',
      width: 1.4,
      depth: 0.75,
      size: { width: 1.4, height: 0.94, depth: 0.75 },
      ...deskMaterialDefaults,
      purpose: 'office-desk'
    }, config);
  },

  officeSofa(config = {}) {
    return createPrefabObject('officeSofa', {
      type: 'sofa',
      width: 2.1,
      color: 0x6f7d82,
      size: { width: 2.1, height: 0.98, depth: 0.82 },
      purpose: 'waiting-seating'
    }, config);
  },

  waitingChairs(config = {}) {
    return createPrefabObject('waitingChairs', {
      type: 'waitingChairs',
      count: 2,
      spacing: 0.7,
      color: 0x394147,
      size: { width: 0.55, height: 0.92, depth: 0.55 },
      purpose: 'waiting-seating'
    }, config);
  },

  officeChairSet(config = {}) {
    return createPrefabObject('officeChairSet', {
      type: 'waitingChairs',
      count: 2,
      spacing: 0.7,
      color: 0x394147,
      size: { width: 0.55, height: 0.92, depth: 0.55 },
      purpose: 'office-chair-set'
    }, config);
  },

  coffeeTable(config = {}) {
    return createPrefabObject('coffeeTable', {
      type: 'coffeeTable',
      width: 1.1,
      depth: 0.55,
      color: 0xb8b8b0,
      size: { width: 1.1, height: 0.47, depth: 0.55 },
      purpose: 'waiting-table'
    }, config);
  },

  pottedPlant(config = {}) {
    return createPrefabObject('pottedPlant', {
      type: 'plant',
      color: 0x4f765f,
      potColor: 0x8c8980,
      size: { width: 0.48, height: 1.2, depth: 0.48 },
      purpose: 'corner-softener'
    }, config);
  },

  copyMachine(config = {}) {
    return createPrefabObject('copyMachine', {
      type: 'copyMachine',
      color: 0xc9cfcb,
      size: { width: 0.9, height: 1.12, depth: 0.62 },
      purpose: 'office-equipment'
    }, config);
  },

  serverRackRow(config = {}) {
    return createPrefabObject('serverRackRow', {
      type: 'serverRackRow',
      count: 4,
      axis: 'x',
      color: 0x3b4650,
      emissive: 0x20395f,
      emissiveIntensity: 0.12,
      size: { width: 4.8, height: 1.9, depth: 0.34 },
      purpose: 'records-storage'
    }, config);
  },

  meetingTable(config = {}) {
    return createPrefabObject('meetingTable', {
      type: 'meetingTable',
      width: 2.3,
      depth: 1.0,
      color: 0xa7afb1,
      size: { width: 2.3, height: 0.79, depth: 1.0 },
      purpose: 'review-table'
    }, config);
  },

  monolithTerminal(config = {}) {
    return createPrefabObject('monolithTerminal', {
      type: 'monolith',
      width: 0.44,
      depth: 0.2,
      height: 1.25,
      color: 0x625b70,
      emissive: 0x967fb0,
      emissiveIntensity: 0.16,
      size: { width: 0.44, height: 1.25, depth: 0.2 },
      purpose: 'terminal-monolith'
    }, config);
  },

  workstationCluster(config = {}) {
    return createPrefabObject('workstationCluster', workstationDefaults, config);
  },

  workstationClusterLeft(config = {}) {
    return createPrefabObject('workstationClusterLeft', {
      ...workstationDefaults,
      rotation: Math.PI / 2,
      frostedOpacity: 0.28
    }, config);
  },

  workstationClusterRight(config = {}) {
    return createPrefabObject('workstationClusterRight', {
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
    return createPrefabObject('reviewGlassPartition', {
      type: 'glassWall',
      axis: 'z',
      length: 2.8,
      color: 0xb7d4dc,
      opacity: 0.15,
      frameColor: 0x6f858a,
      frostedOpacity: 0.26,
      boundaryAligned: true,
      size: { width: 2.8, height: 1.78, depth: 0.11 },
      purpose: 'review-boundary'
    }, config);
  },

  officeFrontGlass(config = {}) {
    return createPrefabObject('officeFrontGlass', {
      type: 'glassWall',
      axis: 'x',
      length: 4.0,
      color: 0xd0d6c8,
      opacity: 0.16,
      frameColor: 0x747d7a,
      frostedOpacity: 0.22,
      postSpacing: 1.25,
      boundaryAligned: true,
      size: { width: 4.0, height: 1.78, depth: 0.11 },
      purpose: 'office-front-boundary'
    }, config);
  },

  emergencyDoorFrame(config = {}) {
    return createPrefabObject('emergencyDoorFrame', {
      type: 'frame',
      axis: 'x',
      width: 2.32,
      height: 2.18,
      postWidth: 0.115,
      frameDepth: 0.32,
      headerHeight: 0.24,
      color: 0x4f5556,
      panelColor: 0x2f3435,
      accentColor: 0x9f5548,
      emissive: 0x100302,
      emissiveIntensity: 0.04,
      roughness: 0.76,
      metalness: 0.24,
      roomId: 'crusher-corridor',
      mount: 'corridor-frame',
      visualOnly: true,
      size: { width: 2.32, height: 2.18, depth: 0.32 },
      purpose: 'emergency-records-housing'
    }, config);
  },

  emergencyWarningTrim(config = {}) {
    return createPrefabObject('emergencyWarningTrim', {
      type: 'beam',
      axis: 'x',
      length: 11.0,
      height: 0.085,
      depth: 0.12,
      yPos: 2.18,
      color: 0x5d5551,
      emissive: 0x100302,
      emissiveIntensity: 0.055,
      roughness: 0.78,
      metalness: 0.16,
      roomId: 'crusher-corridor',
      mount: 'corridor-edge',
      edgeAligned: true,
      visualOnly: true,
      size: { width: 11.0, height: 0.085, depth: 0.12 },
      purpose: 'warning-trim'
    }, config);
  },

  finalDoorSlab(config = {}) {
    return createPrefabObject('finalDoorSlab', {
      type: 'doorSlab',
      width: 1.6,
      color: 0xaebdb8,
      emissive: 0x0a2013,
      emissiveIntensity: 0.08,
      visualOnly: true,
      size: { width: 1.6, height: 2.15, depth: 0.12 },
      purpose: 'final-door'
    }, config);
  },

  observationWindowBand(config = {}) {
    return createPrefabObject('observationWindowBand', {
      type: 'windowBand',
      axis: 'z',
      length: 5,
      color: 0xa6dce4,
      emissiveIntensity: 0.08,
      visualOnly: true,
      size: { width: 0.05, height: 1.15, depth: 5 },
      purpose: 'observation-window'
    }, config);
  }
};
