import * as THREE from 'three';
import { CONSTANTS } from '../core/Constants.js';
import { devLog } from '../core/Debug.js';

export class MazeBuilder {
  constructor(scene) {
    this.scene = scene;
    this.wallMesh = null;
    this.floorMeshes = [];
    this.guideMeshes = [];
    this.floorZoneMats = new Map();
    
    // Materials
    this.wallMat = new THREE.MeshStandardMaterial({ 
      color: CONSTANTS.COLORS.WALL,
      emissive: CONSTANTS.COLORS.WALL_EMISSIVE,
      emissiveIntensity: 0.35,
      roughness: 0.72,
      metalness: 0.12
    });
    
    this.pathMat = new THREE.MeshStandardMaterial({ 
      color: CONSTANTS.COLORS.PATH,
      roughness: 0.84,
      metalness: 0.1
    });

    this.pathAccentMat = new THREE.MeshStandardMaterial({
      color: CONSTANTS.COLORS.PATH_ACCENT,
      roughness: 0.84,
      metalness: 0.1
    });

    this.checkpointFloorMat = new THREE.MeshStandardMaterial({
      color: 0x123847,
      emissive: CONSTANTS.COLORS.CHECKPOINT_INACTIVE,
      emissiveIntensity: 0.12,
      roughness: 0.72,
      metalness: 0.08
    });

    this.triggerFloorMat = new THREE.MeshStandardMaterial({
      color: 0x432011,
      emissive: CONSTANTS.COLORS.TRIGGER,
      emissiveIntensity: 0.08,
      roughness: 0.78,
      metalness: 0.08
    });

    this.goalFloorMat = new THREE.MeshStandardMaterial({
      color: 0x173a2d,
      emissive: CONSTANTS.COLORS.GOAL,
      emissiveIntensity: 0.1,
      roughness: 0.72,
      metalness: 0.08
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
          color.offsetHSL(0, 0, (Math.random() - 0.5) * 0.05);
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
    this.addNavigationGuides(mapData);
  }

  clear() {
    if (this.wallMesh) {
      this.scene.remove(this.wallMesh);
      this.wallMesh.dispose();
      this.wallMesh = null;
    }
    
    this.floorMeshes.forEach(mesh => {
      this.scene.remove(mesh);
    });
    this.floorMeshes = [];

    this.guideMeshes.forEach(mesh => {
      this.scene.remove(mesh);
      mesh.geometry?.dispose?.();
      mesh.material?.dispose?.();
    });
    this.guideMeshes = [];
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

      const light = new THREE.PointLight(
        color,
        config.intensity ?? 0.38,
        config.distance ?? 7.5
      );
      light.position.set(node.position.x, floorHeight + 1.45, node.position.z);
      this.scene.add(light);
      this.guideMeshes.push(light);
    });

    this.addAreaLights(mapData);
    this.addArchitecture(mapData);
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
      }
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

  addBeam(config) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(
        config.axis === 'z' ? 0.18 : (config.length ?? 1) * CONSTANTS.CELL_SIZE,
        config.height ?? 0.16,
        config.axis === 'z' ? (config.length ?? 1) * CONSTANTS.CELL_SIZE : 0.18
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
