import * as THREE from 'three';
import { CONSTANTS } from './Constants.js';
import { Scene } from './Scene.js';
import { InputManager } from './InputManager.js';
import { EventBus } from './EventBus.js';
import { EntityManager } from './EntityManager.js';
import { GameManager } from './GameManager.js';
import { devLog, sceneDiagnostics } from './Debug.js';
import { MazeBuilder } from '../entities/MazeBuilder.js';
import { Player } from '../entities/Player.js';
import { Goal } from '../entities/Goal.js';
import { Trap } from '../entities/Trap.js';
import { Checkpoint } from '../entities/Checkpoint.js';
import { TriggerZone } from '../entities/TriggerZone.js';
import { CrusherWall } from '../entities/CrusherWall.js';
import { SentientObject } from '../entities/SentientObject.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { CameraSystem } from '../systems/CameraSystem.js';
import { GameStateSystem } from '../systems/GameStateSystem.js';
import { DeveloperExploreSystem } from '../systems/DeveloperExploreSystem.js';
import { UIManager } from '../ui/UIManager.js';

// Map Data
import { level1 } from '../maps/level1.js';

export class Game {
  constructor() {
    this.sceneManager = new Scene('game-container');
    this.eventBus = new EventBus();
    this.entityManager = new EntityManager();
    this.inputManager = new InputManager();
    this.uiManager = new UIManager(this);
    this.gameManager = new GameManager(this.eventBus, this.uiManager);
    this.stateSystem = new GameStateSystem(this.uiManager);
    
    this.mazeBuilder = new MazeBuilder(this.sceneManager.scene);
    this.player = new Player(this.sceneManager.scene);
    this.cameraSystem = new CameraSystem(this.sceneManager.camera);
    this.developerExploreSystem = new DeveloperExploreSystem(this.sceneManager.scene);
    
    this.goal = null;
    this.checkpointActive = false;
    this.levelEnding = false;
    
    this.clock = new THREE.Clock();
    this.setupEvents();
    
    this.stateSystem.setState(CONSTANTS.STATE_MENU);
  }

  setupEvents() {
    this.eventBus.on(CONSTANTS.EVENTS.CHECKPOINT_ACTIVATED, payload => {
      this.gameManager.collectCheckpoint(payload);
      this.checkpointActive = this.gameManager.hasAllCheckpoints();
      devLog('Game: Checkpoint activated');
    });

    this.eventBus.on(CONSTANTS.EVENTS.CRUSHER_WARNING, () => {
      if (this.isFreeExplore()) return;
      this.cameraSystem.shake(0.22, 0.8);
      this.uiManager.showWarning('Crusher moving. Back up.');
    });

    this.eventBus.on(CONSTANTS.EVENTS.CRUSHER_ACTIVATED, () => {
      if (this.isFreeExplore()) return;
      this.cameraSystem.shake(0.32, 0.55);
    });

    this.eventBus.on(CONSTANTS.EVENTS.PLAYER_KILLED, payload => {
      if (this.isFreeExplore()) return;
      if (this.levelEnding) return;
      if (payload?.respawn !== false) {
        this.cameraSystem.shake(0.32, 0.55);
        this.uiManager.updateStatus(payload?.taunt || 'Knocked out. Respawning at last checkpoint.');
        this.gameManager.respawnPlayer(this.player);
        this.cameraSystem.snap(this.player.mesh.position);
        return;
      }

      this.levelEnding = true;
      this.stateSystem.setState(CONSTANTS.STATE_LOSE, payload);
    });

    this.eventBus.on(CONSTANTS.EVENTS.GOAL_REACHED, () => {
      if (this.isFreeExplore()) return;
      if (this.levelEnding) return;
      this.levelEnding = true;
      this.stateSystem.setState(CONSTANTS.STATE_WIN);
    });

    this.eventBus.on(CONSTANTS.EVENTS.GOAL_LOCKED, payload => {
      if (this.isFreeExplore()) return;
      this.cameraSystem.shake(0.18, 0.45);
      if (payload.triggerId) {
        this.eventBus.emit(CONSTANTS.EVENTS.TRIGGER_ENTERED, { id: payload.triggerId });
      }
      this.uiManager.updateStatus(payload?.taunt || 'Exit is locked.');
      devLog('Game: Goal locked until checkpoint is active', payload);
    });
  }

  areDeveloperToolsEnabled() {
    return CONSTANTS.DEVELOPER_TOOLS_ENABLED;
  }

  isFreeExplore() {
    return this.stateSystem.isState(CONSTANTS.STATE_DEV_EXPLORE);
  }

  startLevel(options = {}) {
    const freeExplore = !!options.freeExplore && this.areDeveloperToolsEnabled();
    this.inputManager.requestPointerLock(this.sceneManager.renderer.domElement);
    devLog('Game: Starting level...');
    this.eventBus.emit(CONSTANTS.EVENTS.LEVEL_RESET);
    this.entityManager.clear();
    this.goal = null;
    this.checkpointActive = false;
    this.levelEnding = false;
    this.gameManager.reset({
      totalCheckpoints: level1.checkpoints?.length ?? 0,
      playerStart: level1.playerStart,
    });

    // Load Map
    this.mazeBuilder.build(level1);
    this.collisionSystem = new CollisionSystem(level1);

    // Setup Goal and Traps
    for (let y = 0; y < level1.grid.length; y++) {
      for (let x = 0; x < level1.grid[y].length; x++) {
        const cell = level1.grid[y][x];
        if (cell === CONSTANTS.CELL_GOAL) {
          const goalConfig = level1.goals?.find(goal => goal.x === x && goal.y === y) ?? {};
          this.goal = this.entityManager.add(new Goal(this.sceneManager.scene, x, y, this.eventBus, goalConfig));
        } else if (cell === CONSTANTS.CELL_TRAP) {
          this.entityManager.add(new Trap(this.sceneManager.scene, x, y));
        }
      }
    }

    level1.checkpoints?.forEach(config => {
      this.entityManager.add(new Checkpoint(this.sceneManager.scene, this.eventBus, config));
    });

    level1.triggers?.forEach(config => {
      this.entityManager.add(new TriggerZone(this.sceneManager.scene, this.eventBus, config));
    });

    level1.crushers?.forEach(config => {
      this.entityManager.add(new CrusherWall(this.sceneManager.scene, this.eventBus, config));
    });

    level1.sentientObjects?.forEach(config => {
      this.entityManager.add(new SentientObject(this.sceneManager.scene, this.eventBus, config));
    });

    this.developerExploreSystem.reset(level1, this.entityManager);

    // Setup Player
    this.player.setPosition(level1.playerStart.x, level1.playerStart.y);
    this.cameraSystem.snap(this.player.mesh.position);

    this.stateSystem.setState(freeExplore ? CONSTANTS.STATE_DEV_EXPLORE : CONSTANTS.STATE_PLAYING);
    if (freeExplore) {
      this.uiManager.updateProgress(0, level1.checkpoints?.length ?? 0);
      this.uiManager.updateDebugPanel(this.developerExploreSystem.getState());
    }
    devLog('Game: State changed to PLAYING.', sceneDiagnostics(
      this.sceneManager.scene,
      this.sceneManager.camera,
      this.sceneManager.renderer
    ));
  }

  update() {
    requestAnimationFrame(this.update.bind(this));

    const delta = this.clock.getDelta();

    if (this.stateSystem.isState(CONSTANTS.STATE_PLAYING)) {
      this.updateGameplay(delta);

      if (!this.levelEnding) {
        for (let trap of this.entityManager.findByType('trap')) {
          if (!trap.triggered && trap.checkCollision(this.player.position.x, this.player.position.z)) {
            this.eventBus.emit(CONSTANTS.EVENTS.PLAYER_KILLED, {
              reason: 'trap',
              taunt: 'Kamu pikir bisa kabur dari sini? Hahaha!'
            });
          }
        }
      }
    } else if (this.stateSystem.isState(CONSTANTS.STATE_DEV_EXPLORE)) {
      this.updateFreeExplore(delta);
    } else if (this.stateSystem.isState(CONSTANTS.STATE_LOSE) || this.stateSystem.isState(CONSTANTS.STATE_WIN)) {
      // Continue updating goal/traps animation even if not playing
      this.cameraSystem.update(this.player.mesh.position, delta);
      this.updateDebugHelpers();
      this.entityManager.update(delta, this.createUpdateContext());
    }

    this.inputManager.update();

    this.sceneManager.render();
  }

  updateGameplay(delta) {
    const inputVec = this.inputManager.getMovementVector();
    this.cameraSystem.applyMouseLook(this.inputManager.consumeMouseDelta());
    this.player.update(delta, inputVec, this.collisionSystem, this.cameraSystem.getYaw());
    this.cameraSystem.update(this.player.mesh.position, delta);
    this.updateDebugHelpers();
    this.entityManager.update(delta, this.createUpdateContext());
  }

  updateFreeExplore(delta) {
    const inputVec = this.inputManager.getMovementVector();
    this.cameraSystem.applyMouseLook(this.inputManager.consumeMouseDelta());
    this.developerExploreSystem.update(delta, this.inputManager, this.cameraSystem, this.player, this.uiManager);

    if (!this.developerExploreSystem.flyMode) {
      const collisionSystem = this.developerExploreSystem.getCollisionSystem(this.collisionSystem);
      this.player.update(delta, inputVec, collisionSystem, this.cameraSystem.getYaw());
      this.cameraSystem.update(this.player.mesh.position, delta);
    }

    this.updateDebugHelpers();
    this.entityManager.update(delta, this.createUpdateContext());
  }

  createUpdateContext() {
    return {
      player: this.player,
      checkpointActive: this.checkpointActive,
      isFreeExplore: this.isFreeExplore(),
      eventBus: this.eventBus,
      collisionSystem: this.collisionSystem,
      gameManager: this.gameManager,
    };
  }

  updateDebugHelpers() {
    if (this.sceneManager.cameraTargetHelper) {
      this.sceneManager.cameraTargetHelper.position.x = this.cameraSystem.lookTarget.x;
      this.sceneManager.cameraTargetHelper.position.y = this.cameraSystem.lookTarget.y;
      this.sceneManager.cameraTargetHelper.position.z = this.cameraSystem.lookTarget.z;
    }

    this.sceneManager.cameraFrustumHelper?.update();
  }
}
