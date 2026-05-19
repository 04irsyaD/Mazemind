export const DEFAULT_MODEL_TRANSFORM = {
  scale: [1, 1, 1],
  rotation: [0, 0, 0],
  positionOffset: [0, 0, 0],
  yOffset: 0,
  fallbackPrefab: 'procedural'
};

export const MODEL_PRESETS = {
  'potted-plant-basic': {
    scale: [2.0, 2.0, 2.0],
    rotation: [0, 0, 0],
    yOffset: 0,
    maxInstances: 8,
    fallbackPrefab: 'procedural'
  },
  'office-chair-basic': {
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
    yOffset: 0,
    maxInstances: 32,
    fallbackPrefab: 'procedural',
    materialOverrides: {
      Chair: { color: 0x2f3a44, roughness: 0.82, metalness: 0.03 },
      Grey: { color: 0x4a4f54, roughness: 0.72, metalness: 0.08 }
    }
  },
  'copy-machine-basic': {
    scale: [3.2, 4.8, 1.8],
    rotation: [0, 0, 0],
    yOffset: 0,
    maxInstances: 4,
    fallbackPrefab: 'procedural',
    materialOverrides: {
      Material: { color: 0xb8bec0, roughness: 0.78, metalness: 0.02 }
    }
  },
  'meeting-table-basic': {
    scale: [2.6, 2.1, 2.25],
    rotation: [0, 0, 0],
    positionOffset: [-1.108, 0, 0.503],
    yOffset: 0,
    maxInstances: 2,
    fallbackPrefab: 'procedural',
    materialOverrides: {
      wood: { color: 0x4f5454, roughness: 0.76, metalness: 0.04 }
    }
  },
  'coffee-table-basic': {
    scale: [1.6, 1.6, 1.6],
    rotation: [0, 0, 0],
    yOffset: 0,
    maxInstances: 4,
    fallbackPrefab: 'procedural'
  }
};

const LOCAL_MODEL_URL_PATTERN = /^\/assets\/models\/[a-z0-9_./-]+\.(glb|gltf)$/i;
const MODEL_ENABLED_TYPES = new Set([
  'plant',
  'waitingChairs',
  'coffeeTable',
  'copyMachine',
  'receptionDesk',
  'meetingTable'
]);
const MODEL_ENABLED_PREFABS = new Set([
  'pottedPlant',
  'waitingChairs',
  'officeChairSet',
  'coffeeTable',
  'copyMachine',
  'receptionDesk',
  'intakeDesk',
  'officeDesk',
  'meetingTable'
]);

export function getModelUrl(config) {
  return config?.modelUrl ?? config?.metadata?.modelUrl;
}

export function getModelId(config) {
  return config?.modelId ?? config?.metadata?.modelId;
}

export function getAssetTag(config) {
  return config?.assetTag ?? config?.metadata?.assetTag;
}

export function getModelPresetKey(config) {
  return getModelId(config) ?? getAssetTag(config);
}

export function getModelPreset(config) {
  return MODEL_PRESETS[getModelPresetKey(config)] ?? null;
}

export function hasModelAssetMetadata(config) {
  return Boolean(getModelUrl(config) || getModelId(config) || getAssetTag(config));
}

export function getModelFallbackPrefab(config) {
  return (
    config?.fallbackPrefab ??
    config?.metadata?.fallbackPrefab ??
    getModelPreset(config)?.fallbackPrefab ??
    DEFAULT_MODEL_TRANSFORM.fallbackPrefab
  );
}

export function isExternalModelUrl(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url);
}

export function isLocalModelUrl(url) {
  return (
    typeof url === 'string' &&
    LOCAL_MODEL_URL_PATTERN.test(url) &&
    !url.includes('..') &&
    !url.includes('//')
  );
}

export function isModelAllowedForObject(config) {
  const prefab = config?.metadata?.prefab;
  return MODEL_ENABLED_TYPES.has(config?.type) || MODEL_ENABLED_PREFABS.has(prefab);
}
