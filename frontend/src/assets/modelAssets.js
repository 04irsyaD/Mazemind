export const DEFAULT_MODEL_TRANSFORM = {
  scale: [1, 1, 1],
  rotation: [0, 0, 0],
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
  }
};

const LOCAL_MODEL_URL_PATTERN = /^\/assets\/models\/[a-z0-9_./-]+\.(glb|gltf)$/i;
const MODEL_ENABLED_TYPES = new Set(['plant']);
const MODEL_ENABLED_PREFABS = new Set(['pottedPlant']);

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
