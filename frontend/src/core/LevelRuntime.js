import * as THREE from 'three';
import { CONSTANTS } from './Constants.js';
import { normalizeLevelDefinition, getTaskObjectives, getFinalExitObjective } from './LevelDefinition.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { Goal } from '../entities/Goal.js';
import { Trap } from '../entities/Trap.js';
import { Checkpoint } from '../entities/Checkpoint.js';
import { TriggerZone } from '../entities/TriggerZone.js';
import { CrusherWall } from '../entities/CrusherWall.js';
import { SentientObject } from '../entities/SentientObject.js';

export class LevelRuntime {
  constructor({ scene, eventBus, entityManager, mazeBuilder, lightingSystem, departmentControlSystem }) {
    this.scene = scene;
    this.eventBus = eventBus;
    this.entityManager = entityManager;
    this.mazeBuilder = mazeBuilder;
    this.lightingSystem = lightingSystem;
    this.departmentControlSystem = departmentControlSystem;
    this.level = null;
    this.collisionSystem = null;
    this.routeBlockerGroup = new THREE.Group();
    this.routeBlockerGroup.visible = false;
    this.scene.add(this.routeBlockerGroup);
  }

  load(levelDefinition) {
    this.clear();
    this.level = normalizeLevelDefinition(levelDefinition);

    this.departmentControlSystem.reset(this.level);
    this.mazeBuilder.build(this.level);
    this.registerSignageHandles();

    this.collisionSystem = new CollisionSystem(this.level);
    this.registerRouteBlockers();

    this.lightingSystem.build(this.level, this.departmentControlSystem);
    this.spawnEntities();

    return {
      level: this.level,
      collisionSystem: this.collisionSystem
    };
  }

  spawnEntities() {
    getFinalExitObjective(this.level) && this.spawnGoal(getFinalExitObjective(this.level));
    getTaskObjectives(this.level).forEach(objective => {
      this.entityManager.add(new Checkpoint(this.scene, this.eventBus, {
        id: objective.id,
        label: objective.label,
        x: objective.x,
        y: objective.y,
        radius: objective.radius,
        height: objective.height ?? this.getFloorHeight(objective.x, objective.y)
      }));
    });

    this.level.hazards?.forEach(hazard => {
      if (hazard.type === 'fakeExitTrigger') {
        this.entityManager.add(new TriggerZone(this.scene, this.eventBus, hazard));
      }
      if (hazard.type === 'crusher') {
        this.entityManager.add(new CrusherWall(this.scene, this.eventBus, hazard));
      }
    });

    for (let y = 0; y < this.level.grid.length; y++) {
      for (let x = 0; x < this.level.grid[y].length; x++) {
        if (this.level.grid[y][x] === CONSTANTS.CELL_TRAP) {
          this.entityManager.add(new Trap(this.scene, x, y));
        }
      }
    }

    this.level.sentientObjects?.forEach(config => {
      this.entityManager.add(new SentientObject(this.scene, this.eventBus, config));
    });
  }

  spawnGoal(objective) {
    this.entityManager.add(new Goal(this.scene, objective.x, objective.y, this.eventBus, {
      id: objective.id,
      height: objective.height,
      requiresAllCheckpoints: true,
      lockTriggerId: objective.lockTriggerId
    }));
  }

  registerSignageHandles() {
    this.mazeBuilder.getSignageHandles?.().forEach(handle => {
      this.departmentControlSystem.registerSignageHandle(handle.channelId, handle);
    });
  }

  registerRouteBlockers() {
    this.level.manipulationNodes
      ?.filter(node => node.type === 'routeLock')
      .forEach(node => {
        const volume = {
          id: node.id,
          x: node.x,
          y: node.y,
          width: node.width ?? 0.88,
          depth: node.depth ?? 2.4,
          enabled: false
        };
        this.collisionSystem.setDynamicBlocker(node.id, volume, false);
        this.departmentControlSystem.registerRouteHandle(node.routeId, {
          setLocked: locked => {
            this.collisionSystem.setDynamicBlockerEnabled(node.id, locked);
          }
        });
      });
  }

  update(delta) {
    this.lightingSystem.update(delta);
  }

  getFloorHeight(x, y) {
    return this.level.floorZones?.find(zone => (
      x >= zone.x1 && x <= zone.x2 &&
      y >= zone.y1 && y <= zone.y2
    ))?.height ?? 0;
  }

  getState() {
    return {
      levelId: this.level?.id ?? null,
      lights: this.lightingSystem.getState(),
      collisionVolumes: this.collisionSystem?.staticVolumes?.length ?? 0,
      routeBlockers: this.collisionSystem?.dynamicVolumes?.size ?? 0
    };
  }

  clear() {
    this.entityManager.clear();
    this.mazeBuilder.clear();
    this.lightingSystem.clear();
    this.collisionSystem = null;
    for (const child of [...this.routeBlockerGroup.children]) {
      this.routeBlockerGroup.remove(child);
      child.geometry?.dispose?.();
      child.material?.dispose?.();
    }
  }

  dispose() {
    this.clear();
    this.lightingSystem.dispose();
    this.scene.remove(this.routeBlockerGroup);
  }
}
