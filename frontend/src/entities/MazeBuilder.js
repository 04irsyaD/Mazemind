import * as THREE from 'three';
import { CONSTANTS } from '../core/Constants.js';
import { devLog } from '../core/Debug.js';

export class MazeBuilder {
  constructor(scene) {
    this.scene = scene;
    this.wallMesh = null;
    this.floorMeshes = [];
    
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
          const floorTile = new THREE.Mesh(this.geometries.floor, this.getFloorMaterial(cellType, x, y));
          floorTile.rotation.x = -Math.PI / 2;
          floorTile.position.set(worldX, 0, worldZ);
          floorTile.receiveShadow = true;
          this.scene.add(floorTile);
          this.floorMeshes.push(floorTile);
        }
      }
    }

    this.wallMesh.instanceMatrix.needsUpdate = true;
    if (this.wallMesh.instanceColor) this.wallMesh.instanceColor.needsUpdate = true;
    
    this.scene.add(this.wallMesh);
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
  }

  getFloorMaterial(cellType, x, y) {
    if (cellType === CONSTANTS.CELL_CHECKPOINT) return this.checkpointFloorMat;
    if (cellType === CONSTANTS.CELL_TRIGGER) return this.triggerFloorMat;
    if (cellType === CONSTANTS.CELL_GOAL) return this.goalFloorMat;
    return (x + y) % 5 === 0 ? this.pathAccentMat : this.pathMat;
  }
}
