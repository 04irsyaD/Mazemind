import * as THREE from 'three';
import { CONSTANTS } from '../core/Constants.js';
import { devLog } from '../core/Debug.js';

export class MazeBuilder {
  constructor(scene) {
    this.scene = scene;
    this.wallMesh = null;
    this.floorMeshes = [];
    this.guideMeshes = [];
    this.signageHandles = [];
    this.floorZoneMats = new Map();
    
    // Materials
    this.wallMat = new THREE.MeshStandardMaterial({ 
      color: CONSTANTS.COLORS.WALL,
      emissive: CONSTANTS.COLORS.WALL_EMISSIVE,
      emissiveIntensity: 0.13,
      roughness: 0.82,
      metalness: 0.06
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
      color: 0x41494c,
      emissive: 0x020404,
      emissiveIntensity: 0.05,
      roughness: 0.92,
      metalness: 0.02,
      side: THREE.DoubleSide
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
          color.offsetHSL(0, 0, (((x * 17 + y * 31) % 7) - 3) * 0.008);
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
      this.wallMesh = null;
    }
    
    this.floorMeshes.forEach(mesh => {
      this.scene.remove(mesh);
    });
    this.floorMeshes = [];

    this.guideMeshes.forEach(mesh => {
      this.scene.remove(mesh);
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

  addCeilingLights(mapData) {
    mapData.ceilingLights?.forEach(config => {
      const fixture = new THREE.Mesh(
        new THREE.BoxGeometry(
          (config.width ?? 1.4) * CONSTANTS.CELL_SIZE,
          0.045,
          (config.depth ?? 0.16) * CONSTANTS.CELL_SIZE
        ),
        new THREE.MeshStandardMaterial({
          color: config.fixtureColor ?? new THREE.Color(config.color ?? CONSTANTS.COLORS.FLUORESCENT)
            .lerp(new THREE.Color(0x89928f), 0.42),
          emissive: config.color ?? CONSTANTS.COLORS.FLUORESCENT,
          emissiveIntensity: config.emissiveIntensity ?? (config.flicker ? 0.16 : 0.24),
          roughness: 0.58,
          metalness: 0.02
        })
      );
      fixture.position.set(
        config.x * CONSTANTS.CELL_SIZE,
        CONSTANTS.WALL_HEIGHT - 0.035,
        config.y * CONSTANTS.CELL_SIZE
      );
      this.scene.add(fixture);
      this.guideMeshes.push(fixture);

      const light = new THREE.PointLight(
        config.color ?? CONSTANTS.COLORS.FLUORESCENT,
        config.intensity ?? 0.28,
        config.distance ?? 8
      );
      light.position.set(fixture.position.x, CONSTANTS.WALL_HEIGHT - 0.35, fixture.position.z);
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

  addReceptionDesk(config) {
    const material = this.createArchitectureMaterial(config, 0x4b4f4f);
    const trimMaterial = this.createArchitectureMaterial({ color: config.trimColor ?? 0x2f3436 }, 0x2f3436);
    this.addPropBox(config.x, 0.48, config.y, config.width ?? 2.2, 0.28, config.depth ?? 0.45, material);
    this.addPropBox(config.x, 0.9, config.y - 0.18, (config.width ?? 2.2) * 0.86, 0.18, 0.14, trimMaterial);
  }

  addTaskTerminal(config) {
    if (config.desktop) {
      this.addDesktopTerminal(config);
      return;
    }

    const baseMaterial = this.createArchitectureMaterial(config, 0x303941);
    const screenMaterial = new THREE.MeshStandardMaterial({
      color: 0x081114,
      emissive: config.color ?? CONSTANTS.COLORS.AI_CYAN,
      emissiveIntensity: 0.55,
      roughness: 0.28,
      metalness: 0.05
    });

    this.addPropBox(config.x, 0.48, config.y + 0.22, 0.42, 0.55, 0.32, baseMaterial);
    const screen = this.addPropBox(config.x, 0.95, config.y - 0.08, 0.58, 0.36, 0.08, screenMaterial);
    screen.rotation.x = -0.12;
  }

  addDesktopTerminal(config) {
    const baseMaterial = this.createArchitectureMaterial(config, 0x2e363b);
    const screenMaterial = new THREE.MeshStandardMaterial({
      color: 0x071013,
      emissive: config.color ?? CONSTANTS.COLORS.AI_CYAN,
      emissiveIntensity: 0.48,
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
    const material = this.createArchitectureMaterial(config, 0x4b5358);
    const deskMaterial = this.createArchitectureMaterial({ color: 0x5c574e }, 0x5c574e);
    const columns = config.columns ?? 2;
    const rows = config.rows ?? 2;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const x = config.x + col * 2.1;
        const y = config.y + row * 2.0;
        this.addPropBox(x, 0.58, y, 0.95, 0.08, 0.58, deskMaterial);
        this.addPropBox(x + 0.48, 0.82, y, 0.04, 0.86, 0.78, material);
        this.addPropBox(x, 0.82, y + 0.46, 0.94, 0.86, 0.04, material);
        this.addMeterBox(x - 0.18, 0.76, y - 0.14, 0.56, 0.34, 0.05, new THREE.MeshStandardMaterial({
          color: 0x071013,
          emissive: config.monitorColor ?? 0x8da6a8,
          emissiveIntensity: 0.16,
          roughness: 0.24
        }));
        this.addStaticChair(x - 0.18, y + 0.48, Math.PI, config.chairColor ?? 0x25282a);
      }
    }
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
    const material = new THREE.MeshStandardMaterial({
      color: config.color ?? CONSTANTS.COLORS.OFFICE_GLASS,
      emissive: config.color ?? CONSTANTS.COLORS.OFFICE_GLASS,
      emissiveIntensity: 0.08,
      transparent: true,
      opacity: 0.28,
      roughness: 0.08,
      metalness: 0.02
    });
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(
        config.axis === 'z' ? 0.06 : length,
        1.9,
        config.axis === 'z' ? length : 0.06
      ),
      material
    );
    mesh.position.set(config.x * CONSTANTS.CELL_SIZE, 1.1, config.y * CONSTANTS.CELL_SIZE);
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this.guideMeshes.push(mesh);
  }

  addCopyMachine(config) {
    const material = this.createArchitectureMaterial(config, 0x6d746f);
    const darkMaterial = this.createArchitectureMaterial({ color: 0x25292b }, 0x25292b);
    this.addPropBox(config.x, 0.55, config.y, 0.9, 0.75, 0.62, material);
    this.addPropBox(config.x, 1.02, config.y - 0.12, 0.78, 0.18, 0.45, darkMaterial);
  }

  addWindowBand(config) {
    const material = new THREE.MeshStandardMaterial({
      color: config.color ?? CONSTANTS.COLORS.OFFICE_GLASS,
      emissive: config.color ?? CONSTANTS.COLORS.OFFICE_GLASS,
      emissiveIntensity: 0.18,
      transparent: true,
      opacity: 0.24,
      roughness: 0.05,
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
      new THREE.PlaneGeometry((config.width ?? 1.8) * CONSTANTS.CELL_SIZE, 0.52),
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
    const chairMaterial = this.createArchitectureMaterial({ color, roughness: 0.72 }, color);
    const metalMaterial = this.createArchitectureMaterial({ color: 0x2f3438, metalness: 0.18 }, 0x2f3438);
    this.addBoxToGroup(group, [0, 0.43, 0], [0.72, 0.16, 0.68], chairMaterial);
    this.addBoxToGroup(group, [0, 0.86, 0.29], [0.72, 0.72, 0.12], chairMaterial);
    for (const x of [-0.24, 0.24]) {
      for (const z of [-0.2, 0.2]) {
        this.addBoxToGroup(group, [x, 0.2, z], [0.08, 0.4, 0.08], metalMaterial);
      }
    }
    this.scene.add(group);
    this.guideMeshes.push(group);
  }

  addBoxToGroup(group, position, scale, material) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(scale[0], scale[1], scale[2]), material);
    mesh.position.set(position[0], position[1], position[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
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
