import * as THREE from 'three';
import { CONSTANTS } from './Constants.js';
import { Scene } from './Scene.js';
import { InputManager } from './InputManager.js';
import { EventBus } from './EventBus.js';
import { EntityManager } from './EntityManager.js';
import { GameManager } from './GameManager.js';
import { LevelRuntime } from './LevelRuntime.js';
import { getTaskObjectives } from './LevelDefinition.js';
import { devLog, sceneDiagnostics } from './Debug.js';
import { MazeBuilder } from '../entities/MazeBuilder.js';
import { Player } from '../entities/Player.js';
import { CameraSystem } from '../systems/CameraSystem.js';
import { GameStateSystem } from '../systems/GameStateSystem.js';
import { DeveloperExploreSystem } from '../systems/DeveloperExploreSystem.js';
import { DepartmentControlSystem } from '../systems/DepartmentControlSystem.js';
import { LightingSystem } from '../systems/LightingSystem.js';
import { ProgressionSystem } from '../systems/ProgressionSystem.js';
import { AudioSystem } from '../systems/AudioSystem.js';
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
    this.departmentControlSystem = new DepartmentControlSystem(this.eventBus);
    this.lightingSystem = new LightingSystem(this.sceneManager.scene);
    this.audioSystem = new AudioSystem();
    this.progressionSystem = new ProgressionSystem(this.eventBus, this.uiManager, this.departmentControlSystem);
    this.levelRuntime = new LevelRuntime({
      scene: this.sceneManager.scene,
      eventBus: this.eventBus,
      entityManager: this.entityManager,
      mazeBuilder: this.mazeBuilder,
      lightingSystem: this.lightingSystem,
      departmentControlSystem: this.departmentControlSystem
    });
    
    this.checkpointActive = false;
    this.levelEnding = false;
    this.running = false;
    this.animationFrame = null;
    this.eventUnsubscribers = [];
    this.lastDelta = 0;
    
    this.clock = new THREE.Clock();
    this.setupEvents();
    
    this.stateSystem.setState(CONSTANTS.STATE_MENU);
  }

  setupEvents() {
    this.eventUnsubscribers.push(this.eventBus.on(CONSTANTS.EVENTS.CHECKPOINT_ACTIVATED, payload => {
      this.gameManager.collectCheckpoint(payload);
      this.checkpointActive = this.gameManager.hasAllCheckpoints();
      devLog('Game: Checkpoint activated');
    }));

    this.eventUnsubscribers.push(this.eventBus.on(CONSTANTS.EVENTS.FINAL_ROUTE_UNLOCKED, () => {
      if (this.isFreeExplore()) return;
      this.uiManager.updateStatus('The department accepted the route. The public exit is no longer pretending.');
    }));

    this.eventUnsubscribers.push(this.eventBus.on(CONSTANTS.EVENTS.FAKE_EXIT_ATTEMPTED, () => {
      if (this.isFreeExplore()) return;
      this.uiManager.updateStatus('Public exit rejected. The department is rearranging records.');
    }));

    this.eventUnsubscribers.push(this.eventBus.on(CONSTANTS.EVENTS.CRUSHER_WARNING, () => {
      if (this.isFreeExplore()) return;
      this.cameraSystem.shake(0.22, 0.8);
      this.uiManager.showWarning('Emergency wall moving. Use the side lane.');
    }));

    this.eventUnsubscribers.push(this.eventBus.on(CONSTANTS.EVENTS.CRUSHER_ACTIVATED, () => {
      if (this.isFreeExplore()) return;
      this.cameraSystem.shake(0.32, 0.55);
    }));

    this.eventUnsubscribers.push(this.eventBus.on(CONSTANTS.EVENTS.PLAYER_KILLED, payload => {
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
    }));

    this.eventUnsubscribers.push(this.eventBus.on(CONSTANTS.EVENTS.GOAL_REACHED, () => {
      if (this.isFreeExplore()) return;
      if (this.levelEnding) return;
      this.levelEnding = true;
      this.stateSystem.setState(CONSTANTS.STATE_WIN);
    }));

    this.eventUnsubscribers.push(this.eventBus.on(CONSTANTS.EVENTS.GOAL_LOCKED, payload => {
      if (this.isFreeExplore()) return;
      this.cameraSystem.shake(0.18, 0.45);
      if (payload.triggerId) {
        this.eventBus.emit(CONSTANTS.EVENTS.TRIGGER_ENTERED, { id: payload.triggerId });
      }
      this.uiManager.updateStatus(payload?.taunt || 'Exit is locked.');
      devLog('Game: Goal locked until checkpoint is active', payload);
    }));
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
    void this.audioSystem.start();
    devLog('Game: Starting level...');
    this.eventBus.emit(CONSTANTS.EVENTS.LEVEL_RESET);
    this.entityManager.clear();
    this.inputManager.resetTransient();
    this.checkpointActive = false;
    this.levelEnding = false;
    const runtime = this.levelRuntime.load(level1);
    const level = runtime.level;
    this.collisionSystem = runtime.collisionSystem;
    const startWorldX = level.playerStart.x * CONSTANTS.CELL_SIZE;
    const startWorldZ = level.playerStart.y * CONSTANTS.CELL_SIZE;
    const startHeight = this.collisionSystem.getFloorHeightAt(startWorldX, startWorldZ);
    const playerStart = { ...level.playerStart, height: startHeight };
    this.gameManager.reset({
      totalCheckpoints: getTaskObjectives(level).length,
      playerStart,
    });
    this.progressionSystem.reset(level);

    this.developerExploreSystem.reset(level, this.entityManager, {
      debugVisible: freeExplore,
      roomsVisible: freeExplore,
      routeVisible: freeExplore
    });

    // Setup Player
    this.player.setPosition(level.playerStart.x, level.playerStart.y, startHeight);
    this.cameraSystem.reset(level.playerStart.yaw ?? 0, level.playerStart.pitch ?? 0);
    this.cameraSystem.snap(this.player.mesh.position);

    this.stateSystem.setState(freeExplore ? CONSTANTS.STATE_DEV_EXPLORE : CONSTANTS.STATE_PLAYING);
    this.syncDeveloperVisuals();
    if (freeExplore) {
      this.uiManager.updateProgress(0, getTaskObjectives(level).length);
      this.uiManager.updateDebugPanel(this.createDebugPanelState());
    } else {
      this.uiManager.hideDebugPanel();
    }
    devLog('Game: State changed to PLAYING.', sceneDiagnostics(
      this.sceneManager.scene,
      this.sceneManager.camera,
      this.sceneManager.renderer
    ));
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.clock.start();
    this.update();
  }

  update() {
    if (!this.running) return;
    this.animationFrame = requestAnimationFrame(this.update.bind(this));

    const delta = Math.min(this.clock.getDelta(), CONSTANTS.MAX_DELTA);
    this.lastDelta = delta;

    if (this.stateSystem.isState(CONSTANTS.STATE_PLAYING)) {
      this.updateGameplay(delta);

      if (!this.levelEnding) {
        for (let trap of this.entityManager.findByType('trap')) {
          if (!trap.triggered && trap.checkCollision(this.player.position.x, this.player.position.z)) {
            this.eventBus.emit(CONSTANTS.EVENTS.PLAYER_KILLED, {
              reason: 'trap',
              taunt: 'The floor filing system rejected your route.'
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
      this.levelRuntime.update(delta);
      this.entityManager.update(delta, this.createUpdateContext());
    }

    this.inputManager.update();

    this.sceneManager.render();
  }

  updateGameplay(delta) {
    this.handleGameplayDebugToggles();
    const inputVec = this.inputManager.getMovementVector();
    this.cameraSystem.applyMouseLook(this.inputManager.consumeMouseDelta());
    this.player.update(delta, inputVec, this.collisionSystem, this.cameraSystem.getYaw());
    this.cameraSystem.update(this.player.mesh.position, delta);
    this.updateDebugHelpers();
    this.monitorFinalRouteEntry();
    this.levelRuntime.update(delta);
    this.entityManager.update(delta, this.createUpdateContext());
  }

  updateFreeExplore(delta) {
    const inputVec = this.inputManager.getMovementVector();
    this.cameraSystem.applyMouseLook(this.inputManager.consumeMouseDelta());
    this.developerExploreSystem.update(delta, this.inputManager, this.cameraSystem, this.player, this.uiManager);
    this.syncDeveloperVisuals();
    this.uiManager.updateDebugPanel(this.createDebugPanelState());

    if (!this.developerExploreSystem.flyMode) {
      const collisionSystem = this.developerExploreSystem.getCollisionSystem(this.collisionSystem);
      this.player.update(delta, inputVec, collisionSystem, this.cameraSystem.getYaw());
      this.cameraSystem.update(this.player.mesh.position, delta);
    }

    this.updateDebugHelpers();
    this.levelRuntime.update(delta);
    this.entityManager.update(delta, this.createUpdateContext());
  }

  createUpdateContext() {
    return {
      player: this.player,
      checkpointActive: this.gameManager.hasAllCheckpoints(),
      isFreeExplore: this.isFreeExplore(),
      eventBus: this.eventBus,
      collisionSystem: this.collisionSystem,
      gameManager: this.gameManager,
      departmentControl: this.departmentControlSystem,
      progressionSystem: this.progressionSystem,
      progressionState: this.progressionSystem.getState(),
      level: this.levelRuntime.level,
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

  handleGameplayDebugToggles() {
    if (!this.areDeveloperToolsEnabled()) return;

    const changed = this.developerExploreSystem.handleDebugToggleInput(this.inputManager, null, null, {
      allowExploreControls: false
    });
    if (!changed) return;

    this.syncDeveloperVisuals();
    if (this.developerExploreSystem.debugVisible) {
      this.uiManager.showDebugPanel();
      this.uiManager.updateDebugPanel(this.createDebugPanelState());
      return;
    }

    this.uiManager.hideDebugPanel();
  }

  syncDeveloperVisuals() {
    const helpersVisible = this.areDeveloperToolsEnabled() && this.developerExploreSystem.debugVisible;
    this.sceneManager.setDeveloperHelpersVisible(helpersVisible);
    this.player.mesh.visible = helpersVisible && this.developerExploreSystem.flyMode;
  }

  createDebugPanelState() {
    const gridX = this.collisionSystem?.worldToGrid(this.player.position.x) ?? 0;
    const gridY = this.collisionSystem?.worldToGrid(this.player.position.z) ?? 0;
    const progression = this.progressionSystem.getState();
    const department = this.departmentControlSystem.getState();
    const runtime = this.levelRuntime.getState();
    return {
      ...this.developerExploreSystem.getState(),
      checkpointsCollected: progression.completedTasks,
      totalCheckpoints: progression.totalTasks,
      exitUnlocked: progression.finalRouteUnlocked,
      progressionState: progression.state,
      freeExplore: this.isFreeExplore(),
      playerGrid: `${gridX},${gridY}`,
      departmentController: department.controllerId,
      lightChannels: runtime.lights?.channels ?? [],
      routeBlockers: runtime.routeBlockers ?? 0,
      collisionVolumes: runtime.collisionVolumes ?? 0,
      fps: this.lastDelta > 0 ? Math.round(1 / this.lastDelta) : 0
    };
  }

  monitorFinalRouteEntry() {
    if (!this.progressionSystem.finalRouteUnlocked || this.progressionSystem.finalRouteEntered) return;
    const room = this.collisionSystem?.worldToRoom(this.levelRuntime.level, this.player.position.x, this.player.position.z);
    if (room?.id === 'final-route') {
      this.progressionSystem.enterFinalRoute();
    }
  }

  dispose() {
    this.running = false;
    if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame);
    this.eventUnsubscribers.forEach(unsub => unsub());
    this.eventUnsubscribers = [];
    this.levelRuntime.dispose();
    this.developerExploreSystem.dispose();
    this.progressionSystem.dispose();
    this.audioSystem.dispose();
    this.uiManager.dispose?.();
    this.inputManager.dispose();
    this.sceneManager.dispose();
    this.eventBus.clear();
  }
}
