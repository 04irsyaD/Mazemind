import * as THREE from 'three';
import { CONSTANTS } from './Constants.js';
import { Scene } from './Scene.js';
import { InputManager } from './InputManager.js';
import { MazeBuilder } from '../entities/MazeBuilder.js';
import { Player } from '../entities/Player.js';
import { Goal } from '../entities/Goal.js';
import { Trap } from '../entities/Trap.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { CameraSystem } from '../systems/CameraSystem.js';
import { GameStateSystem } from '../systems/GameStateSystem.js';
import { UIManager } from '../ui/UIManager.js';

// Map Data
import { level1 } from '../maps/level1.js';

export class Game {
  constructor() {
    this.sceneManager = new Scene('game-container');
    this.inputManager = new InputManager();
    this.uiManager = new UIManager(this);
    this.stateSystem = new GameStateSystem(this.uiManager);
    
    this.mazeBuilder = new MazeBuilder(this.sceneManager.scene);
    this.player = new Player(this.sceneManager.scene);
    this.cameraSystem = new CameraSystem(this.sceneManager.camera);
    
    this.entities = [];
    this.goal = null;
    this.traps = [];
    
    this.clock = new THREE.Clock();
    
    this.stateSystem.setState(CONSTANTS.STATE_MENU);
  }

  startLevel() {
    // Clean up old entities
    if (this.goal) {
      this.sceneManager.scene.remove(this.goal.group);
    }
    this.traps.forEach(trap => this.sceneManager.scene.remove(trap.group));
    this.traps = [];

    // Load Map
    this.mazeBuilder.build(level1);
    this.collisionSystem = new CollisionSystem(level1);

    // Setup Goal and Traps
    for (let y = 0; y < level1.grid.length; y++) {
      for (let x = 0; x < level1.grid[y].length; x++) {
        const cell = level1.grid[y][x];
        if (cell === CONSTANTS.CELL_GOAL) {
          this.goal = new Goal(this.sceneManager.scene, x, y);
        } else if (cell === CONSTANTS.CELL_TRAP) {
          this.traps.push(new Trap(this.sceneManager.scene, x, y));
        }
      }
    }

    // Setup Player
    this.player.setPosition(level1.playerStart.x, level1.playerStart.y);
    this.cameraSystem.snap(this.player.mesh.position);

    this.stateSystem.setState(CONSTANTS.STATE_PLAYING);
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
      this.cameraSystem.update(this.player.mesh.position);

      // Check Goal Collision
      if (this.goal) {
        this.goal.update(delta);
        if (this.goal.checkCollision(this.player.position.x, this.player.position.z)) {
          this.stateSystem.setState(CONSTANTS.STATE_WIN);
        }
      }

      // Check Trap Collision
      for (let trap of this.traps) {
        trap.update(delta);
        if (!trap.triggered && trap.checkCollision(this.player.position.x, this.player.position.z)) {
          this.stateSystem.setState(CONSTANTS.STATE_LOSE);
        }
      }
    } else if (this.stateSystem.isState(CONSTANTS.STATE_LOSE) || this.stateSystem.isState(CONSTANTS.STATE_WIN)) {
      // Continue updating goal/traps animation even if not playing
      if (this.goal) this.goal.update(delta);
      this.traps.forEach(trap => trap.update(delta));
    }

    this.inputManager.update();
    this.sceneManager.render();
  }
}
