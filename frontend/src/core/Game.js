import * as THREE from 'three';
import { CONSTANTS } from './Constants.js';
import { Scene } from './Scene.js';
import { InputManager } from './InputManager.js';
import { EventBus } from './EventBus.js';
import { EntityManager } from './EntityManager.js';
import { devLog, sceneDiagnostics } from './Debug.js';
import { MazeBuilder } from '../entities/MazeBuilder.js';
import { Player } from '../entities/Player.js';
import { Goal } from '../entities/Goal.js';
import { Trap } from '../entities/Trap.js';
import { Checkpoint } from '../entities/Checkpoint.js';
import { TriggerZone } from '../entities/TriggerZone.js';
import { CrusherWall } from '../entities/CrusherWall.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { CameraSystem } from '../systems/CameraSystem.js';
import { GameStateSystem } from '../systems/GameStateSystem.js';
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
    this.stateSystem = new GameStateSystem(this.uiManager);
    
    this.mazeBuilder = new MazeBuilder(this.sceneManager.scene);
    this.player = new Player(this.sceneManager.scene);
    this.cameraSystem = new CameraSystem(this.sceneManager.camera);
    
    this.goal = null;
    this.checkpointActive = false;
    this.levelEnding = false;
    
    this.clock = new THREE.Clock();
    this.setupEvents();
    
    this.stateSystem.setState(CONSTANTS.STATE_MENU);
  }

  setupEvents() {
    this.eventBus.on(CONSTANTS.EVENTS.CHECKPOINT_ACTIVATED, () => {
      this.checkpointActive = true;
      devLog('Game: Checkpoint activated');
    });

    this.eventBus.on(CONSTANTS.EVENTS.CRUSHER_WARNING, () => {
      this.cameraSystem.shake(0.22, 0.8);
    });

    this.eventBus.on(CONSTANTS.EVENTS.CRUSHER_ACTIVATED, () => {
      this.cameraSystem.shake(0.32, 0.55);
    });

    this.eventBus.on(CONSTANTS.EVENTS.PLAYER_KILLED, payload => {
      if (this.levelEnding) return;
      this.levelEnding = true;
      this.stateSystem.setState(CONSTANTS.STATE_LOSE, payload);
    });
  }

  startLevel() {
    devLog('Game: Starting level...');
    this.eventBus.emit(CONSTANTS.EVENTS.LEVEL_RESET);
    this.entityManager.clear();
    this.goal = null;
    this.checkpointActive = false;
    this.levelEnding = false;

    // Load Map
    this.mazeBuilder.build(level1);
    this.collisionSystem = new CollisionSystem(level1);

    // Setup Goal and Traps
    for (let y = 0; y < level1.grid.length; y++) {
      for (let x = 0; x < level1.grid[y].length; x++) {
        const cell = level1.grid[y][x];
        if (cell === CONSTANTS.CELL_GOAL) {
          this.goal = this.entityManager.add(new Goal(this.sceneManager.scene, x, y));
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

    // Setup Player
    this.player.setPosition(level1.playerStart.x, level1.playerStart.y);
    this.cameraSystem.snap(this.player.mesh.position);

    this.stateSystem.setState(CONSTANTS.STATE_PLAYING);
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
      // Input
      const inputVec = this.inputManager.getMovementVector();
      
      // Update Player
      this.player.update(delta, inputVec, this.collisionSystem);
      
      // Update Camera
      this.cameraSystem.update(this.player.mesh.position, delta);

      this.entityManager.update(delta, this.createUpdateContext());

      if (this.goal?.checkCollision(this.player.position.x, this.player.position.z)) {
        this.levelEnding = true;
        this.stateSystem.setState(CONSTANTS.STATE_WIN);
      }

      // Check Trap Collision
      for (let trap of this.entityManager.findByType('trap')) {
        if (!trap.triggered && trap.checkCollision(this.player.position.x, this.player.position.z)) {
          this.eventBus.emit(CONSTANTS.EVENTS.PLAYER_KILLED, {
            reason: 'trap',
            taunt: 'Kamu pikir bisa kabur dari sini? Hahaha!'
          });
        }
      }
    } else if (this.stateSystem.isState(CONSTANTS.STATE_LOSE) || this.stateSystem.isState(CONSTANTS.STATE_WIN)) {
      // Continue updating goal/traps animation even if not playing
      this.cameraSystem.update(this.player.mesh.position, delta);
      this.entityManager.update(delta, this.createUpdateContext());
    }

    this.inputManager.update();

    this.sceneManager.render();
  }

  createUpdateContext() {
    return {
      player: this.player,
      checkpointActive: this.checkpointActive,
      eventBus: this.eventBus,
      collisionSystem: this.collisionSystem,
    };
  }
}
