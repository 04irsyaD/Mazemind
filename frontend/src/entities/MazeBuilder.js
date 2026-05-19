import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneModelGraph } from 'three/addons/utils/SkeletonUtils.js';
import {
  DEFAULT_MODEL_TRANSFORM,
  getAssetTag,
  getModelFallbackPrefab,
  getModelId,
  getModelPreset,
  getModelPresetKey,
  getModelUrl,
  hasModelAssetMetadata,
  isExternalModelUrl,
  isLocalModelUrl,
  isModelAllowedForObject
} from '../assets/modelAssets.js';
import { CONSTANTS } from '../core/Constants.js';
import { devLog } from '../core/Debug.js';

const gltfLoader = new GLTFLoader();
const localModelCache = new Map();
const modelFailureCache = new Map();
const modelWarningCache = new Set();
const MODEL_FAILURE_RETRY_MS = 30_000;

function hasRecentModelFailure(url) {
  const failureTime = modelFailureCache.get(url);
  if (!failureTime) return false;
  if (Date.now() - failureTime < MODEL_FAILURE_RETRY_MS) return true;
  modelFailureCache.delete(url);
  return false;
}

function loadLocalModel(url) {
  if (hasRecentModelFailure(url)) {
    return Promise.reject(new Error(`Recent model load failure cached for ${url}`));
  }

  if (!localModelCache.has(url)) {
    devLog('MazeBuilder: loading local model asset', url);
    const loadPromise = new Promise((resolve, reject) => {
      gltfLoader.load(
        url,
        gltf => {
          const modelScene = gltf.scene ?? gltf.scenes?.[0];
          if (!modelScene) {
            reject(new Error(`No scene found in model asset: ${url}`));
            return;
          }
          resolve(modelScene);
        },
        undefined,
        reject
      );
    })
      .then(modelScene => {
        modelFailureCache.delete(url);
        return modelScene;
      })
      .catch(error => {
        localModelCache.delete(url);
        modelFailureCache.set(url, Date.now());
        throw error;
      });

    localModelCache.set(url, loadPromise);
  }

  return localModelCache.get(url);
}

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function safeVector3(value, fallback) {
  if (!Array.isArray(value)) return fallback;
  return [
    finiteNumber(value[0], fallback[0]),
    finiteNumber(value[1], fallback[1]),
    finiteNumber(value[2], fallback[2])
  ];
}

function safeModelScale(value) {
  if (typeof value === 'number') {
    const scale = finiteNumber(value, 1);
    return scale > 0 ? [scale, scale, scale] : [1, 1, 1];
  }

  return safeVector3(value, [1, 1, 1]).map(component => (component > 0 ? component : 1));
}

function modelValue(config, key) {
  return config?.[key] ?? config?.metadata?.[key];
}

function resolveModelAssetConfig(config) {
  const preset = getModelPreset(config) ?? {};

  return {
    modelUrl: getModelUrl(config),
    modelId: getModelId(config),
    assetTag: getAssetTag(config),
    presetKey: getModelPresetKey(config),
    fallbackPrefab: getModelFallbackPrefab(config),
    scale: safeModelScale(modelValue(config, 'modelScale') ?? preset.scale ?? DEFAULT_MODEL_TRANSFORM.scale),
    rotation: safeVector3(
      modelValue(config, 'modelRotation') ?? preset.rotation ?? DEFAULT_MODEL_TRANSFORM.rotation,
      DEFAULT_MODEL_TRANSFORM.rotation
    ),
    yOffset: finiteNumber(modelValue(config, 'modelYOffset') ?? preset.yOffset, DEFAULT_MODEL_TRANSFORM.yOffset),
    maxInstances: finiteNumber(preset.maxInstances, Infinity)
  };
}

export class MazeBuilder {
  constructor(scene) {
    this.scene = scene;
    this.wallMesh = null;
    this.floorMeshes = [];
    this.guideMeshes = [];
    this.signageHandles = [];
    this.floorZoneMats = new Map();
    this.modelLoadGeneration = 0;
    this.modelInstanceCounts = new Map();
    
    // Materials
    this.wallMat = new THREE.MeshStandardMaterial({ 
      color: CONSTANTS.COLORS.WALL,
      emissive: CONSTANTS.COLORS.WALL_EMISSIVE,
      emissiveIntensity: 0.07,
      roughness: 0.76,
      metalness: 0.02
    });
    
    this.pathMat = new THREE.MeshStandardMaterial({ 
      color: CONSTANTS.COLORS.PATH,
      roughness: 0.88,
      metalness: 0.04
    });

    this.pathAccentMat = new THREE.MeshStandardMaterial({
      color: CONSTANTS.COLORS.PATH_ACCENT,
      roughness: 0.84,
      metalness: 0.04
    });

    this.ceilingMat = new THREE.MeshStandardMaterial({
      color: 0xb9c1c2,
      emissive: 0x111819,
      emissiveIntensity: 0.055,
      roughness: 0.88,
      metalness: 0.02,
      side: THREE.DoubleSide
    });

    this.checkpointFloorMat = new THREE.MeshStandardMaterial({
      color: 0x7f9aa0,
      emissive: CONSTANTS.COLORS.CHECKPOINT_INACTIVE,
      emissiveIntensity: 0.08,
      roughness: 0.72,
      metalness: 0.04
    });

    this.triggerFloorMat = new THREE.MeshStandardMaterial({
      color: 0x775149,
      emissive: CONSTANTS.COLORS.TRIGGER,
      emissiveIntensity: 0.07,
      roughness: 0.78,
      metalness: 0.04
    });

    this.goalFloorMat = new THREE.MeshStandardMaterial({
      color: 0x9eb5ad,
      emissive: CONSTANTS.COLORS.GOAL,
      emissiveIntensity: 0.075,
      roughness: 0.68,
      metalness: 0.04
    });

    this.geometries = {
      wall: new THREE.BoxGeometry(CONSTANTS.CELL_SIZE, CONSTANTS.WALL_HEIGHT, CONSTANTS.CELL_SIZE),
      floor: new THREE.PlaneGeometry(CONSTANTS.CELL_SIZE, CONSTANTS.CELL_SIZE)
    };
  }

  build(mapData) {
    devLog('MazeBuilder: Building map...');
    this.clear();

    const grid = mapData.grid;
    const height = grid.length;
    const width = grid[0].length;
    
    // Count walls for InstancedMesh
    let wallCount = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (grid[y][x] === CONSTANTS.CELL_WALL) wallCount++;
      }
    }

    // Create InstancedMesh for walls
    this.wallMesh = new THREE.InstancedMesh(this.geometries.wall, this.wallMat, wallCount);
    this.wallMesh.castShadow = true;
    this.wallMesh.receiveShadow = true;

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    let wallIndex = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cellType = grid[y][x];
        const worldX = x * CONSTANTS.CELL_SIZE;
        const worldZ = y * CONSTANTS.CELL_SIZE;

        if (cellType === CONSTANTS.CELL_WALL) {
          // Add wall
          dummy.position.set(worldX, CONSTANTS.WALL_HEIGHT / 2, worldZ);
          dummy.updateMatrix();
          this.wallMesh.setMatrixAt(wallIndex, dummy.matrix);
          
          // Slight color variation
          color.setHex(CONSTANTS.COLORS.WALL);
          color.offsetHSL(0, 0, (((x * 17 + y * 31) % 7) - 3) * 0.005);
          this.wallMesh.setColorAt(wallIndex, color);
          
          wallIndex++;
        } else {
          // Add floor (path, goal, or trap all have a floor base)
          const floorTile = new THREE.Mesh(this.geometries.floor, this.getFloorMaterial(cellType, x, y, mapData));
          floorTile.rotation.x = -Math.PI / 2;
          floorTile.position.set(worldX, this.getFloorHeight(mapData, x, y), worldZ);
          floorTile.receiveShadow = true;
          this.scene.add(floorTile);
          this.floorMeshes.push(floorTile);
        }
      }
    }

    this.wallMesh.instanceMatrix.needsUpdate = true;
    if (this.wallMesh.instanceColor) this.wallMesh.instanceColor.needsUpdate = true;
    
    this.scene.add(this.wallMesh);
    this.addWallDetails(mapData);
    this.addFloorSeams(mapData);
    this.addNavigationGuides(mapData);
  }

  clear() {
    this.modelLoadGeneration++;
    this.modelInstanceCounts.clear();

    if (this.wallMesh) {
      this.scene.remove(this.wallMesh);
      this.wallMesh = null;
    }
    
    this.floorMeshes.forEach(mesh => {
      this.scene.remove(mesh);
    });
    this.floorMeshes = [];

    this.guideMeshes.forEach(mesh => {
      this.scene.remove(mesh);
      if (mesh.userData?.cachedModelAsset) return;
      mesh.traverse?.(node => {
        node.geometry?.dispose?.();
        if (Array.isArray(node.material)) {
          node.material.forEach(material => {
            material.map?.dispose?.();
            material.dispose?.();
          });
        } else {
          node.material?.map?.dispose?.();
          node.material?.dispose?.();
        }
      });
      if (!mesh.traverse) {
        mesh.material?.map?.dispose?.();
        mesh.geometry?.dispose?.();
        mesh.material?.dispose?.();
      }
    });
    this.guideMeshes = [];
    this.signageHandles = [];
  }

  getFloorMaterial(cellType, x, y, mapData) {
    if (cellType === CONSTANTS.CELL_CHECKPOINT) return this.checkpointFloorMat;
    if (cellType === CONSTANTS.CELL_TRIGGER) return this.triggerFloorMat;
    if (cellType === CONSTANTS.CELL_GOAL) return this.goalFloorMat;
    const zone = this.getFloorZone(mapData, x, y);
    if (zone) return this.getFloorZoneMaterial(zone);
    return (x + y) % 5 === 0 ? this.pathAccentMat : this.pathMat;
  }

  getFloorZone(mapData, x, y) {
    return mapData.floorZones?.find(zone => (
      x >= zone.x1 && x <= zone.x2 &&
      y >= zone.y1 && y <= zone.y2
    ));
  }

  getFloorHeight(mapData, x, y) {
    return this.getFloorZone(mapData, x, y)?.height ?? 0;
  }

  getFloorZoneMaterial(zone) {
    const key = zone.id ?? `${zone.color}-${zone.emissive}-${zone.emissiveIntensity}`;
    if (!this.floorZoneMats.has(key)) {
      this.floorZoneMats.set(key, new THREE.MeshStandardMaterial({
        color: zone.color ?? CONSTANTS.COLORS.PATH,
        emissive: zone.emissive ?? 0x000000,
        emissiveIntensity: zone.emissiveIntensity ?? 0.08,
        roughness: zone.roughness ?? 0.78,
        metalness: zone.metalness ?? 0.08
      }));
    }
    return this.floorZoneMats.get(key);
  }

  addNavigationGuides(mapData) {
    this.addCeiling(mapData);
    this.addCeilingGrid(mapData);

    mapData.guideStrips?.forEach(config => {
      const length = (config.length ?? 1) * CONSTANTS.CELL_SIZE;
      const width = config.width ?? 0.16;
      const geometry = config.axis === 'z'
        ? new THREE.PlaneGeometry(width, length)
        : new THREE.PlaneGeometry(length, width);
      const material = new THREE.MeshBasicMaterial({
        color: config.color ?? CONSTANTS.COLORS.CHECKPOINT_INACTIVE,
        transparent: true,
        opacity: config.opacity ?? 0.18,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const strip = new THREE.Mesh(geometry, material);
      strip.rotation.x = -Math.PI / 2;
      strip.position.set(
        config.x * CONSTANTS.CELL_SIZE,
        this.getFloorHeight(mapData, config.x, config.y) + 0.045,
        config.y * CONSTANTS.CELL_SIZE
      );
      this.scene.add(strip);
      this.guideMeshes.push(strip);
    });

    mapData.navigationNodes?.forEach(config => {
      const color = config.color ?? CONSTANTS.COLORS.CHECKPOINT_INACTIVE;
      const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: config.emissiveIntensity ?? 0.55,
        roughness: 0.48,
        metalness: 0.1
      });
      const node = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.18, 0.34, 12), material);
      const floorHeight = this.getFloorHeight(mapData, config.x, config.y);
      node.position.set(
        config.x * CONSTANTS.CELL_SIZE,
        floorHeight + 0.18,
        config.y * CONSTANTS.CELL_SIZE
      );
      node.castShadow = false;
      node.receiveShadow = false;
      this.scene.add(node);
      this.guideMeshes.push(node);

    });

    this.addArchitecture(mapData);
  }

  addCeiling(mapData) {
    const width = mapData.grid[0].length;
    const height = mapData.grid.length;
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(width * CONSTANTS.CELL_SIZE, height * CONSTANTS.CELL_SIZE),
      this.ceilingMat.clone()
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(
      ((width - 1) * CONSTANTS.CELL_SIZE) / 2,
      CONSTANTS.WALL_HEIGHT,
      ((height - 1) * CONSTANTS.CELL_SIZE) / 2
    );
    ceiling.receiveShadow = true;
    this.scene.add(ceiling);
    this.guideMeshes.push(ceiling);
  }

  addWallDetails(mapData) {
    const zones = mapData.wallDetailZones ?? [];
    if (!zones.length) return;

    const grid = mapData.grid;
    const sides = [];
    const directions = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 }
    ];

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x] === CONSTANTS.CELL_WALL || !this.isInDetailZone(zones, x, y)) continue;

        directions.forEach(({ dx, dy }) => {
          const nx = x + dx;
          const ny = y + dy;
          if (grid[ny]?.[nx] === undefined || grid[ny][nx] !== CONSTANTS.CELL_WALL) return;
          sides.push({ x, y, dx, dy });
        });
      }
    }

    if (!sides.length) return;

    this.addWallDetailMesh(sides, {
      centerY: 0.18,
      height: 0.18,
      thickness: 0.075,
      lengthScale: 0.92,
      material: new THREE.MeshStandardMaterial({
        color: 0xa2aaac,
        emissive: 0x070a0b,
        emissiveIntensity: 0.025,
        roughness: 0.84,
        metalness: 0.02
      })
    });

    this.addWallDetailMesh(sides, {
      centerY: 1.25,
      height: 0.08,
      thickness: 0.045,
      lengthScale: 0.86,
      material: new THREE.MeshStandardMaterial({
        color: 0xb7c0c2,
        emissive: 0x080c0d,
        emissiveIntensity: 0.018,
        roughness: 0.86,
        metalness: 0.02
      })
    });
  }

  addWallDetailMesh(sides, { centerY, height, thickness, lengthScale, material }) {
    const xFaces = sides.filter(side => side.dx !== 0);
    const zFaces = sides.filter(side => side.dy !== 0);
    const longSide = CONSTANTS.CELL_SIZE * lengthScale;

    if (xFaces.length) {
      const mesh = new THREE.InstancedMesh(
        new THREE.BoxGeometry(thickness, height, longSide),
        material.clone(),
        xFaces.length
      );
      this.populateWallDetailMesh(mesh, xFaces, centerY);
      this.scene.add(mesh);
      this.guideMeshes.push(mesh);
    }

    if (zFaces.length) {
      const mesh = new THREE.InstancedMesh(
        new THREE.BoxGeometry(longSide, height, thickness),
        material.clone(),
        zFaces.length
      );
      this.populateWallDetailMesh(mesh, zFaces, centerY);
      this.scene.add(mesh);
      this.guideMeshes.push(mesh);
    }

    material.dispose();
  }

  populateWallDetailMesh(mesh, sides, centerY) {
    const dummy = new THREE.Object3D();
    sides.forEach((side, index) => {
      const pathSideOffset = 0.035;
      dummy.position.set(
        (side.x + side.dx * 0.5) * CONSTANTS.CELL_SIZE - side.dx * pathSideOffset,
        centerY,
        (side.y + side.dy * 0.5) * CONSTANTS.CELL_SIZE - side.dy * pathSideOffset
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.castShadow = false;
    mesh.receiveShadow = true;
  }

  addFloorSeams(mapData) {
    mapData.floorZones
      ?.filter(zone => zone.floorLineColor)
      .forEach(zone => {
        const step = zone.floorLineStep ?? 1;
        const y = (zone.height ?? 0) + 0.018;
        const xStart = (zone.x1 - 0.5) * CONSTANTS.CELL_SIZE;
        const xEnd = (zone.x2 + 0.5) * CONSTANTS.CELL_SIZE;
        const zStart = (zone.y1 - 0.5) * CONSTANTS.CELL_SIZE;
        const zEnd = (zone.y2 + 0.5) * CONSTANTS.CELL_SIZE;
        const positions = [];

        for (let x = zone.x1 - 0.5; x <= zone.x2 + 0.5; x += step) {
          const worldX = x * CONSTANTS.CELL_SIZE;
          positions.push(worldX, y, zStart, worldX, y, zEnd);
        }
        for (let z = zone.y1 - 0.5; z <= zone.y2 + 0.5; z += step) {
          const worldZ = z * CONSTANTS.CELL_SIZE;
          positions.push(xStart, y, worldZ, xEnd, y, worldZ);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const material = new THREE.LineBasicMaterial({
          color: zone.floorLineColor,
          transparent: true,
          opacity: zone.floorLineOpacity ?? 0.22,
          depthWrite: false
        });
        const lines = new THREE.LineSegments(geometry, material);
        this.scene.add(lines);
        this.guideMeshes.push(lines);
      });
  }

  addCeilingGrid(mapData) {
    const zones = mapData.ceilingDetailZones ?? [];
    if (!zones.length) return;

    const y = CONSTANTS.WALL_HEIGHT - 0.018;
    const seamWidth = 0.018;
    const seamHeight = 0.006;
    const material = new THREE.MeshBasicMaterial({
      color: 0x7f898b,
      transparent: true,
      opacity: 0.052,
      depthWrite: false
    });
    const xSegments = [];
    const zSegments = [];

    zones.forEach(zone => {
      const baseStep = zone.step ?? 2;
      const tileWidth = (zone.tileWidth ?? baseStep * 1.5) * CONSTANTS.CELL_SIZE;
      const tileDepth = (zone.tileDepth ?? baseStep) * CONSTANTS.CELL_SIZE;
      const segmentGap = (zone.segmentGap ?? 0.12) * CONSTANTS.CELL_SIZE;
      const xStart = (zone.x1 - 0.5) * CONSTANTS.CELL_SIZE;
      const xEnd = (zone.x2 + 0.5) * CONSTANTS.CELL_SIZE;
      const zStart = (zone.y1 - 0.5) * CONSTANTS.CELL_SIZE;
      const zEnd = (zone.y2 + 0.5) * CONSTANTS.CELL_SIZE;
      const xs = this.createCeilingTileStops(xStart, xEnd, tileWidth);
      const zs = this.createCeilingTileStops(zStart, zEnd, tileDepth);

      zs.forEach(z => {
        for (let index = 0; index < xs.length - 1; index++) {
          const start = xs[index] + segmentGap;
          const end = xs[index + 1] - segmentGap;
          if (end <= start) continue;
          xSegments.push({
            x: (start + end) / 2,
            z,
            length: end - start
          });
        }
      });

      xs.forEach(x => {
        for (let index = 0; index < zs.length - 1; index++) {
          const start = zs[index] + segmentGap;
          const end = zs[index + 1] - segmentGap;
          if (end <= start) continue;
          zSegments.push({
            x,
            z: (start + end) / 2,
            length: end - start
          });
        }
      });
    });

    if (xSegments.length) {
      const mesh = new THREE.InstancedMesh(
        new THREE.BoxGeometry(1, seamHeight, seamWidth),
        material.clone(),
        xSegments.length
      );
      this.populateCeilingSeams(mesh, xSegments, y, 'x');
      this.scene.add(mesh);
      this.guideMeshes.push(mesh);
    }

    if (zSegments.length) {
      const mesh = new THREE.InstancedMesh(
        new THREE.BoxGeometry(seamWidth, seamHeight, 1),
        material.clone(),
        zSegments.length
      );
      this.populateCeilingSeams(mesh, zSegments, y, 'z');
      this.scene.add(mesh);
      this.guideMeshes.push(mesh);
    }

    material.dispose();
  }

  createCeilingTileStops(start, end, step) {
    const stops = [start];
    for (let value = start + step; value < end - 0.001; value += step) {
      stops.push(value);
    }
    stops.push(end);
    return stops;
  }

  populateCeilingSeams(mesh, segments, y, axis) {
    const dummy = new THREE.Object3D();
    segments.forEach((segment, index) => {
      dummy.position.set(segment.x, y, segment.z);
      dummy.scale.set(
        axis === 'x' ? segment.length : 1,
        1,
        axis === 'z' ? segment.length : 1
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
  }

  addCeilingLightFrame(group, outerWidth, outerDepth, material) {
    const frameThickness = 0.045;
    const frameHeight = 0.022;
    const y = CONSTANTS.WALL_HEIGHT - 0.033;
    const pieces = [
      {
        size: [outerWidth, frameHeight, frameThickness],
        position: [0, y, -outerDepth / 2 + frameThickness / 2]
      },
      {
        size: [outerWidth, frameHeight, frameThickness],
        position: [0, y, outerDepth / 2 - frameThickness / 2]
      },
      {
        size: [frameThickness, frameHeight, outerDepth],
        position: [-outerWidth / 2 + frameThickness / 2, y, 0]
      },
      {
        size: [frameThickness, frameHeight, outerDepth],
        position: [outerWidth / 2 - frameThickness / 2, y, 0]
      }
    ];

    pieces.forEach(piece => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(...piece.size),
        material
      );
      mesh.position.set(...piece.position);
      mesh.castShadow = false;
      mesh.receiveShadow = true;
      group.add(mesh);
    });
  }

  isInDetailZone(zones, x, y) {
    return zones.some(zone => (
      x >= zone.x1 && x <= zone.x2 &&
      y >= zone.y1 && y <= zone.y2
    ));
  }

  addCeilingLights(mapData) {
    mapData.ceilingLights?.forEach(config => {
      const width = (config.width ?? 1.4) * CONSTANTS.CELL_SIZE;
      const depth = Math.max((config.depth ?? 0.16) * CONSTANTS.CELL_SIZE, 0.22 * CONSTANTS.CELL_SIZE);
      const outerWidth = width + 0.18;
      const outerDepth = depth + 0.16;
      const lightColor = config.color ?? CONSTANTS.COLORS.FLUORESCENT;
      const group = new THREE.Group();
      group.position.set(
        config.x * CONSTANTS.CELL_SIZE,
        0,
        config.y * CONSTANTS.CELL_SIZE
      );

      const recess = new THREE.Mesh(
        new THREE.BoxGeometry(outerWidth, 0.012, outerDepth),
        new THREE.MeshStandardMaterial({
          color: config.frameColor ?? 0x7f898b,
          emissive: 0x070b0c,
          emissiveIntensity: 0.02,
          roughness: 0.72,
          metalness: 0.08
        })
      );
      recess.position.y = CONSTANTS.WALL_HEIGHT - 0.022;
      recess.castShadow = false;
      recess.receiveShadow = true;
      group.add(recess);

      const frameMaterial = new THREE.MeshStandardMaterial({
        color: config.frameColor ?? 0x8d989a,
        emissive: 0x080d0e,
        emissiveIntensity: 0.018,
        roughness: 0.68,
        metalness: 0.12
      });
      this.addCeilingLightFrame(group, outerWidth, outerDepth, frameMaterial);

      const diffuser = new THREE.Mesh(
        new THREE.BoxGeometry(width, 0.014, depth),
        new THREE.MeshStandardMaterial({
          color: config.fixtureColor ?? new THREE.Color(lightColor).lerp(new THREE.Color(0x89928f), 0.42),
          emissive: lightColor,
          emissiveIntensity: config.emissiveIntensity ?? (config.flicker ? 0.16 : 0.24),
          roughness: 0.62,
          metalness: 0.01,
          transparent: true,
          opacity: 0.9
        })
      );
      diffuser.position.y = CONSTANTS.WALL_HEIGHT - 0.041;
      diffuser.castShadow = false;
      diffuser.receiveShadow = false;
      group.add(diffuser);

      this.scene.add(group);
      this.guideMeshes.push(group);

      const light = new THREE.PointLight(
        lightColor,
        config.intensity ?? 0.28,
        config.distance ?? 8
      );
      light.position.set(group.position.x, CONSTANTS.WALL_HEIGHT - 0.35, group.position.z);
      this.scene.add(light);
      this.guideMeshes.push(light);
    });
  }

  addAreaLights(mapData) {
    mapData.areaLights?.forEach(config => {
      const light = new THREE.PointLight(
        config.color ?? CONSTANTS.COLORS.CHECKPOINT_INACTIVE,
        config.intensity ?? 0.35,
        config.distance ?? 8
      );
      light.position.set(
        config.x * CONSTANTS.CELL_SIZE,
        config.height ?? 2,
        config.y * CONSTANTS.CELL_SIZE
      );
      this.scene.add(light);
      this.guideMeshes.push(light);
    });
  }

  addArchitecture(mapData) {
    mapData.architecture?.forEach(config => {
      if (config.type === 'platform') {
        this.addPlatform(config);
        return;
      }
      if (config.type === 'frame') {
        this.addFrame(config);
        return;
      }
      if (config.type === 'beam') {
        this.addBeam(config);
        return;
      }
      if (config.type === 'column') {
        this.addColumn(config);
        return;
      }
      if (config.type === 'monolith') {
        this.addMonolith(config);
        return;
      }
      if (config.type === 'receptionDesk') this.addReceptionDesk(config);
      if (config.type === 'taskTerminal') this.addTaskTerminal(config);
      if (config.type === 'waitingChairs') this.addWaitingChairs(config);
      if (config.type === 'sofa') this.addSofa(config);
      if (config.type === 'coffeeTable') this.addCoffeeTable(config);
      if (config.type === 'plant') this.addPlant(config);
      if (config.type === 'cubicleCluster') this.addCubicleCluster(config);
      if (config.type === 'serverRackRow') this.addServerRackRow(config);
      if (config.type === 'meetingTable') this.addMeetingTable(config);
      if (config.type === 'glassWall') this.addGlassWall(config);
      if (config.type === 'copyMachine') this.addCopyMachine(config);
      if (config.type === 'windowBand') this.addWindowBand(config);
      if (config.type === 'doorSlab') this.addDoorSlab(config);
      if (config.type === 'sign') this.addSign(config);
    });
  }

  addPlatform(config) {
    const height = config.height ?? 0.12;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(
        (config.width ?? 1) * CONSTANTS.CELL_SIZE,
        height,
        (config.depth ?? 1) * CONSTANTS.CELL_SIZE
      ),
      this.createArchitectureMaterial(config, 0x27344d)
    );
    mesh.position.set(
      config.x * CONSTANTS.CELL_SIZE,
      (config.yOffset ?? 0) + height / 2,
      config.y * CONSTANTS.CELL_SIZE
    );
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this.guideMeshes.push(mesh);
  }

  addColumn(config) {
    const height = config.height ?? CONSTANTS.WALL_HEIGHT * 0.85;
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(config.radius ?? 0.16, config.radius ?? 0.16, height, 14),
      this.createArchitectureMaterial(config, 0x3d4663)
    );
    mesh.position.set(
      config.x * CONSTANTS.CELL_SIZE,
      height / 2,
      config.y * CONSTANTS.CELL_SIZE
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this.guideMeshes.push(mesh);
  }

  addFrame(config) {
    if (config.metadata?.prefab === 'emergencyDoorFrame') {
      this.addEmergencyDoorFrame(config);
      return;
    }

    const height = config.height ?? 2.18;
    const postWidth = config.postWidth ?? 0.18;
    const span = (config.width ?? 2.4) * CONSTANTS.CELL_SIZE;
    const material = this.createArchitectureMaterial(config, 0x3d4663);
    const centerX = config.x * CONSTANTS.CELL_SIZE;
    const centerZ = config.y * CONSTANTS.CELL_SIZE;
    const acrossX = config.axis === 'z';
    const offsets = [-span / 2, span / 2];

    offsets.forEach(offset => {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(postWidth, height, postWidth),
        material
      );
      post.position.set(
        centerX + (acrossX ? offset : 0),
        height / 2,
        centerZ + (acrossX ? 0 : offset)
      );
      post.castShadow = true;
      post.receiveShadow = true;
      this.scene.add(post);
      this.guideMeshes.push(post);
    });

    const beam = new THREE.Mesh(
      new THREE.BoxGeometry(
        acrossX ? span + postWidth : postWidth,
        0.18,
        acrossX ? postWidth : span + postWidth
      ),
      material
    );
    beam.position.set(centerX, height, centerZ);
    beam.castShadow = true;
    beam.receiveShadow = true;
    this.scene.add(beam);
    this.guideMeshes.push(beam);
  }

  addEmergencyDoorFrame(config) {
    const group = new THREE.Group();
    const height = config.height ?? 2.18;
    const postWidth = config.postWidth ?? 0.115;
    const span = (config.width ?? 2.32) * CONSTANTS.CELL_SIZE;
    const depth = config.frameDepth ?? 0.32;
    const headerHeight = config.headerHeight ?? 0.24;
    const acrossX = config.axis === 'z';
    const frameMaterial = this.createArchitectureMaterial(config, 0x4f5556);
    const panelMaterial = this.createArchitectureMaterial({
      color: config.panelColor ?? 0x2f3435,
      roughness: 0.82,
      metalness: 0.18
    }, 0x2f3435);
    const accentMaterial = this.createArchitectureMaterial({
      color: config.accentColor ?? 0x9f5548,
      emissive: config.accentEmissive ?? 0x140403,
      emissiveIntensity: config.accentEmissiveIntensity ?? 0.045,
      roughness: 0.7,
      metalness: 0.14
    }, 0x9f5548);

    const addFrameBox = (alongOffset, centerY, scaleAlong, scaleY, material) => {
      const position = acrossX ? [alongOffset, centerY, 0] : [0, centerY, alongOffset];
      const scale = acrossX ? [scaleAlong, scaleY, depth] : [depth, scaleY, scaleAlong];
      this.addBoxToGroup(group, position, scale, material);
    };

    const postOffsets = [-span / 2, span / 2];
    postOffsets.forEach(offset => {
      addFrameBox(offset, height / 2, postWidth, height, frameMaterial);
      addFrameBox(offset, 0.84, postWidth * 1.55, 0.64, panelMaterial);
      addFrameBox(offset, 0.14, postWidth * 2.15, 0.18, panelMaterial);
    });

    addFrameBox(0, height, span + postWidth * 2.2, headerHeight, frameMaterial);
    addFrameBox(0, height - 0.16, span * 0.62, 0.06, accentMaterial);
    addFrameBox(-span * 0.32, height - 0.36, span * 0.16, 0.05, accentMaterial);
    addFrameBox(span * 0.32, height - 0.36, span * 0.16, 0.05, accentMaterial);

    group.position.set(
      config.x * CONSTANTS.CELL_SIZE,
      0,
      config.y * CONSTANTS.CELL_SIZE
    );
    this.scene.add(group);
    this.guideMeshes.push(group);
  }

  addBeam(config) {
    const beamDepth = config.depth ?? config.size?.depth ?? 0.18;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(
        config.axis === 'z' ? beamDepth : (config.length ?? 1) * CONSTANTS.CELL_SIZE,
        config.height ?? 0.16,
        config.axis === 'z' ? (config.length ?? 1) * CONSTANTS.CELL_SIZE : beamDepth
      ),
      this.createArchitectureMaterial(config, 0x34384f)
    );
    mesh.position.set(
      config.x * CONSTANTS.CELL_SIZE,
      config.yPos ?? 2.28,
      config.y * CONSTANTS.CELL_SIZE
    );
    mesh.castShadow = true;
    this.scene.add(mesh);
    this.guideMeshes.push(mesh);
  }

  addMonolith(config) {
    const height = config.height ?? 1.2;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(
        (config.width ?? 0.35) * CONSTANTS.CELL_SIZE,
        height,
        (config.depth ?? 0.25) * CONSTANTS.CELL_SIZE
      ),
      this.createArchitectureMaterial(config, 0x315063)
    );
    mesh.position.set(
      config.x * CONSTANTS.CELL_SIZE,
      height / 2,
      config.y * CONSTANTS.CELL_SIZE
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this.guideMeshes.push(mesh);
  }

  addReceptionDesk(config) {
    const width = config.width ?? 2.2;
    const depth = config.depth ?? 0.45;
    const panelMaterial = this.createArchitectureMaterial({
      ...config,
      color: config.panelColor ?? config.color
    }, 0x4b4f4f);
    const topMaterial = this.createArchitectureMaterial({
      ...config,
      color: config.topColor ?? config.color,
      roughness: config.topRoughness ?? 0.66
    }, 0x6b6255);
    const trimMaterial = this.createArchitectureMaterial({ color: config.trimColor ?? 0x2f3436 }, 0x2f3436);
    this.addPropBox(config.x, 0.45, config.y, width, 0.48, depth, panelMaterial);
    this.addPropBox(config.x, 0.72, config.y, width * 1.03, 0.08, depth * 1.05, topMaterial);
    this.addPropBox(config.x, 0.9, config.y - 0.18, width * 0.86, 0.18, 0.14, trimMaterial);
    this.addPropBox(config.x, 0.67, config.y - depth * 0.24, width * 0.9, 0.08, 0.035, trimMaterial);
  }

  addTaskTerminal(config) {
    if (config.desktop) {
      this.addDesktopTerminal(config);
      return;
    }

    const baseMaterial = this.createArchitectureMaterial({
      ...config,
      color: config.bodyColor ?? 0x5d686c
    }, 0x5d686c);
    const screenMaterial = new THREE.MeshStandardMaterial({
      color: 0x081114,
      emissive: config.color ?? CONSTANTS.COLORS.AI_CYAN,
      emissiveIntensity: 0.36,
      roughness: 0.28,
      metalness: 0.05
    });

    this.addPropBox(config.x, 0.48, config.y + 0.22, 0.42, 0.55, 0.32, baseMaterial);
    const screen = this.addPropBox(config.x, 0.95, config.y - 0.08, 0.58, 0.36, 0.08, screenMaterial);
    screen.rotation.x = -0.12;
  }

  addDesktopTerminal(config) {
    const baseMaterial = this.createArchitectureMaterial({
      ...config,
      color: config.bodyColor ?? 0x667175
    }, 0x667175);
    const screenMaterial = new THREE.MeshStandardMaterial({
      color: 0x071013,
      emissive: config.color ?? CONSTANTS.COLORS.AI_CYAN,
      emissiveIntensity: 0.32,
      roughness: 0.22,
      metalness: 0.04
    });
    const surfaceHeight = config.surfaceHeight ?? 0.9;

    this.addMeterBox(config.x, surfaceHeight + 0.055, config.y, 0.34, 0.08, 0.2, baseMaterial);
    this.addMeterBox(config.x, surfaceHeight + 0.22, config.y - 0.08, 0.08, 0.28, 0.08, baseMaterial);
    const screen = this.addMeterBox(config.x, surfaceHeight + 0.43, config.y - 0.1, 0.82, 0.46, 0.06, screenMaterial);
    screen.rotation.x = -0.08;

    if (config.text) {
      const textScreen = new THREE.Mesh(
        new THREE.PlaneGeometry(0.74, 0.38),
        new THREE.MeshBasicMaterial({
          map: this.createTerminalTexture(config.text, config.color ?? CONSTANTS.COLORS.AI_CYAN),
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: false
        })
      );
      textScreen.position.set(
        config.x * CONSTANTS.CELL_SIZE,
        surfaceHeight + 0.43,
        (config.y - 0.087) * CONSTANTS.CELL_SIZE
      );
      textScreen.rotation.x = -0.08;
      this.scene.add(textScreen);
      this.guideMeshes.push(textScreen);
    }
  }

  addWaitingChairs(config) {
    const count = config.count ?? 3;
    const spacing = config.spacing ?? 0.72;
    for (let index = 0; index < count; index++) {
      this.addStaticChair(
        config.x + (config.axis === 'z' ? 0 : index * spacing),
        config.y + (config.axis === 'z' ? index * spacing : 0),
        config.rotation ?? 0,
        config.color ?? 0x4b5256
      );
    }
  }

  addSofa(config) {
    const material = this.createArchitectureMaterial(config, 0x596064);
    const width = config.width ?? 2.1;
    this.addMeterBox(config.x, 0.46, config.y, width, 0.32, 0.82, material);
    this.addMeterBox(config.x, 0.9, config.y + 0.32, width, 0.76, 0.16, material);
    this.addMeterBox(config.x - width / CONSTANTS.CELL_SIZE / 2 - 0.04, 0.68, config.y, 0.16, 0.5, 0.82, material);
    this.addMeterBox(config.x + width / CONSTANTS.CELL_SIZE / 2 + 0.04, 0.68, config.y, 0.16, 0.5, 0.82, material);
  }

  addCoffeeTable(config) {
    const material = this.createArchitectureMaterial(config, 0x7b725f);
    const legMaterial = this.createArchitectureMaterial({ color: 0x33393c }, 0x33393c);
    this.addMeterBox(config.x, 0.42, config.y, config.width ?? 1.25, 0.1, config.depth ?? 0.72, material);
    for (const x of [-0.42, 0.42]) {
      for (const z of [-0.24, 0.24]) {
        this.addMeterBox(
          config.x + x / CONSTANTS.CELL_SIZE,
          0.22,
          config.y + z / CONSTANTS.CELL_SIZE,
          0.08,
          0.36,
          0.08,
          legMaterial
        );
      }
    }
  }

  addPlant(config) {
    if (hasModelAssetMetadata(config)) {
      this.addModelBackedProp(config, () => this.addProceduralPlant(config));
      return;
    }

    this.addProceduralPlant(config);
  }

  addModelBackedProp(config, fallback) {
    const modelAsset = resolveModelAssetConfig(config);

    if (!isModelAllowedForObject(config)) {
      this.warnModelAssetOnce(
        `disallowed:${config.type}:${config.metadata?.prefab}`,
        `Skipped model for unsupported prefab "${config.metadata?.prefab ?? config.type}". Using procedural fallback.`
      );
      fallback();
      return;
    }

    if (!modelAsset.modelUrl) {
      this.warnModelAssetOnce(
        `missing-url:${modelAsset.presetKey ?? config.metadata?.prefab ?? config.type}`,
        `Model-enabled prefab "${config.metadata?.prefab ?? config.type}" is missing modelUrl. Using procedural fallback.`
      );
      fallback();
      return;
    }

    if (!modelAsset.modelId && !modelAsset.assetTag) {
      this.warnModelAssetOnce(
        `missing-id:${modelAsset.modelUrl}`,
        `Model asset "${modelAsset.modelUrl}" is missing modelId/assetTag metadata.`
      );
    }

    if (modelAsset.fallbackPrefab !== 'procedural') {
      this.warnModelAssetOnce(
        `fallback:${modelAsset.modelUrl}`,
        `Model asset "${modelAsset.modelUrl}" should declare fallbackPrefab: "procedural" for this pilot.`
      );
    }

    if (!isLocalModelUrl(modelAsset.modelUrl)) {
      const sourceType = isExternalModelUrl(modelAsset.modelUrl) ? 'external' : 'non-local';
      this.warnModelAssetOnce(
        `non-local:${modelAsset.modelUrl}`,
        `Skipped ${sourceType} model URL "${modelAsset.modelUrl}". Using procedural fallback.`
      );
      fallback();
      return;
    }

    const instanceCount = this.recordModelInstance(modelAsset);
    if (instanceCount > modelAsset.maxInstances) {
      this.warnModelAssetOnce(
        `max-instances:${modelAsset.modelUrl}`,
        `Model asset "${modelAsset.modelUrl}" exceeded maxInstances (${modelAsset.maxInstances}). Using procedural fallback for extra instances.`
      );
      fallback();
      return;
    }

    const loadGeneration = this.modelLoadGeneration;
    loadLocalModel(modelAsset.modelUrl)
      .then(sourceModel => {
        if (loadGeneration !== this.modelLoadGeneration) return;

        try {
          const model = cloneModelGraph(sourceModel);
          this.configureModelInstance(model, config, modelAsset);
          this.scene.add(model);
          this.guideMeshes.push(model);
        } catch (error) {
          this.warnModelAssetOnce(
            `clone:${modelAsset.modelUrl}`,
            `Could not clone model "${modelAsset.modelUrl}". Using procedural fallback.`,
            error
          );
          fallback();
        }
      })
      .catch(error => {
        if (loadGeneration !== this.modelLoadGeneration) return;
        this.warnModelAssetOnce(
          `load:${modelAsset.modelUrl}`,
          `Could not load model "${modelAsset.modelUrl}". Using procedural fallback.`,
          error
        );
        fallback();
      });
  }

  recordModelInstance(modelAsset) {
    const key = modelAsset.modelUrl;
    const count = (this.modelInstanceCounts.get(key) ?? 0) + 1;
    this.modelInstanceCounts.set(key, count);
    return count;
  }

  configureModelInstance(model, config, modelAsset) {
    model.position.set(
      config.x * CONSTANTS.CELL_SIZE,
      modelAsset.yOffset,
      config.y * CONSTANTS.CELL_SIZE
    );
    model.rotation.set(modelAsset.rotation[0], modelAsset.rotation[1], modelAsset.rotation[2]);
    model.scale.set(modelAsset.scale[0], modelAsset.scale[1], modelAsset.scale[2]);
    model.userData.cachedModelAsset = true;
    model.userData.modelUrl = modelAsset.modelUrl;
    model.traverse(node => {
      if (!node.isMesh) return;
      node.castShadow = true;
      node.receiveShadow = true;
      node.frustumCulled = true;
    });
  }

  warnModelAssetOnce(key, message, error) {
    if (modelWarningCache.has(key)) return;
    modelWarningCache.add(key);

    if (CONSTANTS.DEV_MODE) {
      console.warn(`MazeBuilder model asset: ${message}`, error ?? '');
    }
  }

  addProceduralPlant(config) {
    const potMaterial = this.createArchitectureMaterial({ color: config.potColor ?? 0x6d6457 }, 0x6d6457);
    const leafMaterial = this.createArchitectureMaterial({
      color: config.color ?? 0x3f654d,
      emissive: 0x020503,
      emissiveIntensity: 0.03,
      roughness: 0.8
    }, 0x3f654d);
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.32, 16), potMaterial);
    pot.position.set(config.x * CONSTANTS.CELL_SIZE, 0.16, config.y * CONSTANTS.CELL_SIZE);
    pot.castShadow = true;
    pot.receiveShadow = true;
    this.scene.add(pot);
    this.guideMeshes.push(pot);

    const leaves = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 8), leafMaterial);
    leaves.position.set(config.x * CONSTANTS.CELL_SIZE, 0.78, config.y * CONSTANTS.CELL_SIZE);
    leaves.scale.set(0.86, 1.05, 0.78);
    leaves.castShadow = true;
    this.scene.add(leaves);
    this.guideMeshes.push(leaves);
  }

  addCubicleCluster(config) {
    const partitionMaterial = this.createArchitectureMaterial({
      color: config.partitionColor ?? config.color ?? 0xd2d7d8,
      roughness: 0.82,
      metalness: 0.03
    }, 0xd2d7d8);
    const frostedMaterial = new THREE.MeshStandardMaterial({
      color: config.frostedColor ?? 0xd9eeee,
      emissive: config.frostedEmissive ?? 0x11191a,
      emissiveIntensity: 0.025,
      transparent: true,
      opacity: config.frostedOpacity ?? 0.34,
      roughness: 0.18,
      metalness: 0.02
    });
    const desktopMaterial = this.createArchitectureMaterial({
      color: config.deskColor ?? 0xd7d1c1,
      roughness: 0.6,
      metalness: 0.025
    }, 0xd7d1c1);
    const deskBodyMaterial = this.createArchitectureMaterial({
      color: config.deskBodyColor ?? 0xc2c8c7,
      roughness: 0.76,
      metalness: 0.04
    }, 0xc2c8c7);
    const trimMaterial = this.createArchitectureMaterial({
      color: config.trimColor ?? 0x6f7c80,
      roughness: 0.72,
      metalness: 0.1
    }, 0x6f7c80);
    const monitorBackMaterial = this.createArchitectureMaterial({
      color: config.monitorBackColor ?? 0x262d31,
      roughness: 0.58,
      metalness: 0.12
    }, 0x262d31);
    const screenMaterial = new THREE.MeshStandardMaterial({
      color: 0x071013,
      emissive: config.monitorColor ?? 0x7fb8be,
      emissiveIntensity: config.monitorIntensity ?? 0.09,
      roughness: 0.22,
      metalness: 0.04
    });
    const keyboardMaterial = this.createArchitectureMaterial({
      color: config.keyboardColor ?? 0x30383b,
      roughness: 0.64,
      metalness: 0.08
    }, 0x30383b);
    const trayMaterial = this.createArchitectureMaterial({
      color: config.trayColor ?? 0x9fa9aa,
      roughness: 0.78,
      metalness: 0.04
    }, 0x9fa9aa);
    const columns = config.columns ?? 2;
    const rows = config.rows ?? 2;
    const spacingX = config.spacingX ?? 1.35;
    const spacingY = config.spacingY ?? 1.45;
    const rotation = config.rotation ?? 0;
    const skipCells = new Set((config.skipCells ?? []).map(cell => `${cell.row}:${cell.col}`));
    const materials = {
      partitionMaterial,
      frostedMaterial,
      desktopMaterial,
      deskBodyMaterial,
      trimMaterial,
      monitorBackMaterial,
      screenMaterial,
      keyboardMaterial,
      trayMaterial
    };

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        if (skipCells.has(`${row}:${col}`)) continue;
        const x = config.x + col * spacingX;
        const y = config.y + row * spacingY;
        this.addWorkstation(config, materials, x, y, rotation, { row, col });
      }
    }
  }

  addWorkstation(config, materials, gridX, gridY, rotation, context) {
    const group = new THREE.Group();
    const deskWidth = config.deskWidth ?? 3.25;
    const deskDepth = config.deskDepth ?? 1.62;
    const halfWidth = deskWidth / 2;
    const halfDepth = deskDepth / 2;
    const partitionHeight = config.partitionHeight ?? 0.58;
    const partitionCenterY = 0.78;
    const frostedHeight = config.frostedHeight ?? 0.16;
    const frostedCenterY = partitionCenterY + partitionHeight / 2 + frostedHeight / 2 - 0.02;

    group.position.set(gridX * CONSTANTS.CELL_SIZE, 0, gridY * CONSTANTS.CELL_SIZE);
    group.rotation.y = rotation;

    this.addBoxToGroup(group, [0, 0.75, 0], [deskWidth, 0.11, deskDepth], materials.desktopMaterial);
    this.addBoxToGroup(group, [0, 0.69, 0], [deskWidth * 0.94, 0.045, deskDepth * 0.9], materials.deskBodyMaterial);
    this.addBoxToGroup(group, [0, 0.48, halfDepth - 0.14], [deskWidth * 0.82, 0.36, 0.09], materials.deskBodyMaterial);
    this.addBoxToGroup(group, [0, 0.68, halfDepth - 0.18], [deskWidth * 0.86, 0.055, 0.055], materials.trimMaterial);
    this.addBoxToGroup(group, [0, 0.78, -halfDepth + 0.16], [deskWidth * 0.76, 0.035, 0.08], materials.trimMaterial);

    for (const x of [-halfWidth + 0.22, halfWidth - 0.22]) {
      for (const z of [-halfDepth + 0.2, halfDepth - 0.2]) {
        this.addBoxToGroup(group, [x, 0.38, z], [0.09, 0.66, 0.09], materials.trimMaterial);
      }
    }

    this.addBoxToGroup(group, [0, partitionCenterY, -halfDepth - 0.07], [deskWidth + 0.28, partitionHeight, 0.07], materials.partitionMaterial);
    this.addBoxToGroup(group, [0, frostedCenterY, -halfDepth - 0.075], [deskWidth + 0.16, frostedHeight, 0.045], materials.frostedMaterial);

    const sidePartitionDepth = deskDepth * 0.62;
    for (const side of [-1, 1]) {
      this.addBoxToGroup(
        group,
        [side * (halfWidth + 0.055), 0.76, -halfDepth + sidePartitionDepth / 2],
        [0.07, 0.52, sidePartitionDepth],
        materials.partitionMaterial
      );
      this.addBoxToGroup(
        group,
        [side * (halfWidth + 0.06), 1.05, -halfDepth + sidePartitionDepth / 2],
        [0.045, 0.12, sidePartitionDepth * 0.92],
        materials.frostedMaterial
      );
    }

    this.addBoxToGroup(group, [0, 1.16, -0.36], [0.96, 0.52, 0.055], materials.screenMaterial);
    this.addBoxToGroup(group, [0, 1.16, -0.395], [1.06, 0.6, 0.05], materials.monitorBackMaterial);
    this.addBoxToGroup(group, [0, 0.89, -0.3], [0.1, 0.3, 0.08], materials.monitorBackMaterial);
    this.addBoxToGroup(group, [0, 0.79, -0.25], [0.46, 0.045, 0.28], materials.monitorBackMaterial);
    this.addBoxToGroup(group, [0, 0.82, 0.2], [1.02, 0.035, 0.26], materials.keyboardMaterial);
    this.addBoxToGroup(group, [0.67, 0.825, 0.22], [0.18, 0.03, 0.18], materials.keyboardMaterial);
    this.addBoxToGroup(group, [-0.66, 0.825, 0.18], [0.22, 0.025, 0.16], materials.trayMaterial);

    if ((context.row + context.col) % 3 === 1) {
      const trayX = -halfWidth + 0.42;
      this.addBoxToGroup(group, [trayX, 0.82, 0.2], [0.46, 0.05, 0.32], materials.trayMaterial);
      this.addBoxToGroup(group, [trayX, 0.89, 0.2], [0.44, 0.035, 0.3], materials.trayMaterial);
    }

    if ((context.row + context.col) % 4 === 2) {
      this.addBoxToGroup(group, [halfWidth - 0.5, 0.8, -0.05], [0.5, 0.04, 0.36], materials.monitorBackMaterial);
      const laptopScreen = this.addBoxToGroup(group, [halfWidth - 0.5, 0.96, -0.24], [0.48, 0.28, 0.035], materials.screenMaterial);
      laptopScreen.rotation.x = -0.35;
    }

    this.addChairToGroup(
      group,
      [0, 0, halfDepth + 0.64],
      Math.PI,
      config.chairColor ?? 0x252c31,
      config.chairAccentColor ?? 0x405a63
    );

    this.scene.add(group);
    this.guideMeshes.push(group);
  }

  addServerRackRow(config) {
    const count = config.count ?? 3;
    const material = this.createArchitectureMaterial(config, 0x222832);
    const lightMaterial = new THREE.MeshBasicMaterial({
      color: config.emissive ?? CONSTANTS.COLORS.AI_CYAN,
      transparent: true,
      opacity: 0.55
    });

    for (let i = 0; i < count; i++) {
      const x = config.x + (config.axis === 'z' ? 0 : i * 1.35);
      const y = config.y + (config.axis === 'z' ? i * 1.35 : 0);
      this.addPropBox(x, 1.05, y, 0.72, 1.9, 0.34, material);
      this.addPropBox(x, 1.28, y - 0.18, 0.5, 0.04, 0.025, lightMaterial);
      this.addPropBox(x, 0.86, y - 0.18, 0.5, 0.04, 0.025, lightMaterial);
    }
  }

  addMeetingTable(config) {
    const material = this.createArchitectureMaterial(config, 0x4a4f52);
    this.addPropBox(config.x, 0.72, config.y, config.width ?? 2.2, 0.14, config.depth ?? 1.0, material);
    this.addPropBox(config.x - 0.65, 0.36, config.y, 0.08, 0.72, 0.08, material);
    this.addPropBox(config.x + 0.65, 0.36, config.y, 0.08, 0.72, 0.08, material);
  }

  addGlassWall(config) {
    const length = (config.length ?? 2) * CONSTANTS.CELL_SIZE;
    const height = config.height ?? 1.78;
    const baseY = config.baseY ?? 0.08;
    const glassThickness = config.glassThickness ?? 0.035;
    const frameThickness = config.frameThickness ?? 0.055;
    const railDepth = config.railDepth ?? 0.11;
    const innerLength = Math.max(frameThickness, length - frameThickness * 2);
    const group = new THREE.Group();

    const glassMaterial = new THREE.MeshStandardMaterial({
      color: config.color ?? CONSTANTS.COLORS.OFFICE_GLASS,
      emissive: config.emissive ?? 0x071214,
      emissiveIntensity: config.emissiveIntensity ?? 0.035,
      transparent: true,
      opacity: config.opacity ?? 0.17,
      roughness: config.roughness ?? 0.22,
      metalness: config.metalness ?? 0.02,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const frameMaterial = this.createArchitectureMaterial({
      color: config.frameColor ?? 0x748286,
      roughness: config.frameRoughness ?? 0.56,
      metalness: config.frameMetalness ?? 0.34
    }, 0x748286);
    const frostedMaterial = new THREE.MeshStandardMaterial({
      color: config.frostedColor ?? 0xd7e8e8,
      emissive: config.frostedEmissive ?? 0x0c1718,
      emissiveIntensity: config.frostedEmissiveIntensity ?? 0.025,
      transparent: true,
      opacity: config.frostedOpacity ?? 0.28,
      roughness: config.frostedRoughness ?? 0.42,
      metalness: 0.02,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    const addPart = (position, scale, material, castsShadow = true, receivesShadow = castsShadow) => {
      const mesh = this.addBoxToGroup(group, position, scale, material);
      mesh.castShadow = castsShadow;
      mesh.receiveShadow = receivesShadow;
      return mesh;
    };

    addPart(
      [0, baseY + height / 2, 0],
      [innerLength, height, glassThickness],
      glassMaterial,
      false
    );

    if (config.frosted !== false) {
      const frostedHeight = config.frostedHeight ?? 0.22;
      const frostedY = Math.min(
        baseY + height - frostedHeight / 2 - frameThickness,
        Math.max(
          baseY + frostedHeight / 2 + frameThickness,
          config.frostedY ?? baseY + height * 0.56
        )
      );
      addPart(
        [0, frostedY, 0],
        [innerLength, frostedHeight, glassThickness + 0.018],
        frostedMaterial,
        false
      );
    }

    const postHeight = height + frameThickness;
    const postY = baseY + height / 2;
    addPart([-length / 2, postY, 0], [frameThickness, postHeight, railDepth], frameMaterial);
    addPart([length / 2, postY, 0], [frameThickness, postHeight, railDepth], frameMaterial);

    const postSpacing = (config.postSpacing ?? 1.45) * CONSTANTS.CELL_SIZE;
    if (postSpacing > 0 && length > postSpacing) {
      const segmentCount = Math.ceil(length / postSpacing);
      for (let i = 1; i < segmentCount; i++) {
        const offset = -length / 2 + (length * i) / segmentCount;
        addPart([offset, postY, 0], [frameThickness, postHeight, railDepth], frameMaterial);
      }
    }

    if (config.topRail !== false) {
      const railHeight = typeof config.topRail === 'number' ? config.topRail : frameThickness;
      addPart(
        [0, baseY + height - railHeight / 2, 0],
        [length + frameThickness, railHeight, railDepth],
        frameMaterial
      );
    }

    if (config.baseRail !== false) {
      const railHeight = typeof config.baseRail === 'number' ? config.baseRail : frameThickness;
      addPart(
        [0, baseY + railHeight / 2, 0],
        [length + frameThickness, railHeight, railDepth],
        frameMaterial
      );
    }

    group.position.set(config.x * CONSTANTS.CELL_SIZE, 0, config.y * CONSTANTS.CELL_SIZE);
    group.rotation.y = config.axis === 'z' ? Math.PI / 2 : 0;
    this.scene.add(group);
    this.guideMeshes.push(group);
  }

  addCopyMachine(config) {
    const material = this.createArchitectureMaterial(config, 0x6d746f);
    const darkMaterial = this.createArchitectureMaterial({ color: 0x4a5254 }, 0x4a5254);
    this.addPropBox(config.x, 0.55, config.y, 0.9, 0.75, 0.62, material);
    this.addPropBox(config.x, 1.02, config.y - 0.12, 0.78, 0.18, 0.45, darkMaterial);
  }

  addWindowBand(config) {
    const material = new THREE.MeshStandardMaterial({
      color: config.color ?? CONSTANTS.COLORS.OFFICE_GLASS,
      emissive: config.color ?? CONSTANTS.COLORS.OFFICE_GLASS,
      emissiveIntensity: config.emissiveIntensity ?? 0.08,
      transparent: true,
      opacity: config.opacity ?? 0.22,
      roughness: 0.08,
      metalness: 0.02
    });
    const length = (config.length ?? 3) * CONSTANTS.CELL_SIZE;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(
        config.axis === 'z' ? 0.05 : length,
        1.15,
        config.axis === 'z' ? length : 0.05
      ),
      material
    );
    mesh.position.set(config.x * CONSTANTS.CELL_SIZE, 1.55, config.y * CONSTANTS.CELL_SIZE);
    this.scene.add(mesh);
    this.guideMeshes.push(mesh);
  }

  addDoorSlab(config) {
    const material = this.createArchitectureMaterial(config, 0x2d5645);
    this.addPropBox(config.x, 1.12, config.y, config.width ?? 1.5, 2.15, 0.12, material);
    this.addPropBox(config.x + 0.52, 1.08, config.y - 0.08, 0.08, 0.16, 0.04, new THREE.MeshStandardMaterial({
      color: CONSTANTS.COLORS.GOAL,
      emissive: CONSTANTS.COLORS.GOAL,
      emissiveIntensity: 0.55
    }));
  }

  addSign(config) {
    const createMaterial = text => new THREE.MeshBasicMaterial({
      map: this.createTextTexture(text, config.color ?? 0xcfe9e8),
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const material = createMaterial(config.text ?? 'SIGN');
    const handle = {
      id: config.id ?? config.text,
      channelId: config.channelId ?? 'department-labels',
      setText: text => {
        material.map?.dispose?.();
        material.map = this.createTextTexture(text, config.color ?? 0xcfe9e8);
        material.needsUpdate = true;
      }
    };
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry((config.width ?? 1.8) * CONSTANTS.CELL_SIZE, config.panelHeight ?? config.size?.height ?? 0.52),
      material
    );
    mesh.position.set(
      config.x * CONSTANTS.CELL_SIZE,
      config.height ?? 2.08,
      config.y * CONSTANTS.CELL_SIZE
    );
    mesh.rotation.y = config.rotation ?? 0;
    this.scene.add(mesh);
    this.guideMeshes.push(mesh);
    this.signageHandles.push(handle);
  }

  getSignageHandles() {
    return this.signageHandles;
  }

  addPropBox(gridX, centerY, gridY, widthCells, height, depthCells, material) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(widthCells * CONSTANTS.CELL_SIZE, height, depthCells * CONSTANTS.CELL_SIZE),
      material
    );
    mesh.position.set(gridX * CONSTANTS.CELL_SIZE, centerY, gridY * CONSTANTS.CELL_SIZE);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this.guideMeshes.push(mesh);
    return mesh;
  }

  addMeterBox(gridX, centerY, gridY, width, height, depth, material) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.position.set(gridX * CONSTANTS.CELL_SIZE, centerY, gridY * CONSTANTS.CELL_SIZE);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this.guideMeshes.push(mesh);
    return mesh;
  }

  addStaticChair(gridX, gridY, rotation = 0, color = 0x303336) {
    const group = new THREE.Group();
    group.position.set(gridX * CONSTANTS.CELL_SIZE, 0, gridY * CONSTANTS.CELL_SIZE);
    group.rotation.y = rotation;
    this.addChairParts(group, color, 0x40545c);
    this.scene.add(group);
    this.guideMeshes.push(group);
  }

  addChairToGroup(parent, position, rotation = 0, color = 0x303336, accentColor = 0x40545c) {
    const group = new THREE.Group();
    group.position.set(position[0], position[1], position[2]);
    group.rotation.y = rotation;
    this.addChairParts(group, color, accentColor);
    parent.add(group);
  }

  addChairParts(group, color, accentColor = 0x40545c) {
    const chairMaterial = this.createArchitectureMaterial({ color, roughness: 0.74, metalness: 0.04 }, color);
    const accentMaterial = this.createArchitectureMaterial({ color: accentColor, roughness: 0.7, metalness: 0.04 }, accentColor);
    const metalMaterial = this.createArchitectureMaterial({ color: 0x242a2d, roughness: 0.58, metalness: 0.22 }, 0x242a2d);

    this.addBoxToGroup(group, [0, 0.44, 0], [0.74, 0.16, 0.64], chairMaterial);
    this.addBoxToGroup(group, [0, 0.535, -0.02], [0.58, 0.035, 0.46], accentMaterial);
    this.addBoxToGroup(group, [0, 0.43, 0.28], [0.72, 0.1, 0.12], accentMaterial);
    this.addBoxToGroup(group, [0, 0.87, 0.28], [0.76, 0.68, 0.12], chairMaterial);
    this.addBoxToGroup(group, [0, 0.9, 0.205], [0.54, 0.44, 0.035], accentMaterial);
    this.addBoxToGroup(group, [-0.35, 1.19, 0.28], [0.08, 0.22, 0.1], chairMaterial);
    this.addBoxToGroup(group, [0.35, 1.19, 0.28], [0.08, 0.22, 0.1], chairMaterial);
    this.addBoxToGroup(group, [-0.49, 0.66, 0.02], [0.09, 0.34, 0.54], chairMaterial);
    this.addBoxToGroup(group, [0.49, 0.66, 0.02], [0.09, 0.34, 0.54], chairMaterial);
    this.addBoxToGroup(group, [0, 0.24, 0], [0.11, 0.32, 0.11], metalMaterial);
    this.addBoxToGroup(group, [0, 0.1, 0], [0.86, 0.06, 0.08], metalMaterial);
    this.addBoxToGroup(group, [0, 0.1, 0], [0.08, 0.06, 0.86], metalMaterial);
    for (const x of [-0.42, 0.42]) {
      this.addBoxToGroup(group, [x, 0.07, 0], [0.1, 0.08, 0.14], metalMaterial);
    }
    for (const z of [-0.42, 0.42]) {
      this.addBoxToGroup(group, [0, 0.07, z], [0.14, 0.08, 0.1], metalMaterial);
    }
  }

  addBoxToGroup(group, position, scale, material) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(scale[0], scale[1], scale[2]), material);
    mesh.position.set(position[0], position[1], position[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  }

  createTextTexture(text, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = 'rgba(4, 8, 10, 0.78)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = `#${color.toString(16).padStart(6, '0')}`;
    context.lineWidth = 8;
    context.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
    const lines = `${text}`.split('\n');
    const longestLine = lines.reduce((longest, line) => Math.max(longest, line.length), 0);
    const fontSize = lines.length > 1 ? 52 : longestLine > 22 ? 58 : 72;
    context.font = `700 ${fontSize}px Arial, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    const lineHeight = fontSize * 1.08;
    const firstY = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, index) => {
      context.fillText(line, canvas.width / 2, firstY + index * lineHeight);
    });
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  createTerminalTexture(text, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 768;
    canvas.height = 432;
    const context = canvas.getContext('2d');
    context.fillStyle = 'rgba(4, 10, 12, 0.96)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = `#${color.toString(16).padStart(6, '0')}`;
    context.lineWidth = 6;
    context.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);
    context.fillStyle = '#d9eee9';
    context.font = '700 34px Arial, sans-serif';
    context.textAlign = 'left';
    context.textBaseline = 'top';
    text.split('\n').forEach((line, index) => {
      context.fillText(line, 44, 64 + index * 52);
    });
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  createArchitectureMaterial(config, fallbackColor) {
    return new THREE.MeshStandardMaterial({
      color: config.color ?? fallbackColor,
      emissive: config.emissive ?? 0x000000,
      emissiveIntensity: config.emissive ? (config.emissiveIntensity ?? 0.22) : 0,
      roughness: config.roughness ?? 0.68,
      metalness: config.metalness ?? 0.12
    });
  }
}
