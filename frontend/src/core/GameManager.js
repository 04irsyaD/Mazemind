import * as THREE from 'three';
import { CONSTANTS } from './Constants.js';

export class GameManager {
  constructor(eventBus, uiManager) {
    this.eventBus = eventBus;
    this.uiManager = uiManager;
    this.totalCheckpoints = 0;
    this.checkpointsCollected = 0;
    this.collectedCheckpointIds = new Set();
    this.respawnPoint = new THREE.Vector3();
    this.exitUnlocked = false;
  }

  reset({ totalCheckpoints, playerStart }) {
    this.totalCheckpoints = totalCheckpoints;
    this.checkpointsCollected = 0;
    this.collectedCheckpointIds.clear();
    this.exitUnlocked = false;
    this.respawnPoint.set(playerStart.x * CONSTANTS.CELL_SIZE, 0, playerStart.y * CONSTANTS.CELL_SIZE);
    this.uiManager.updateProgress(this.checkpointsCollected, this.totalCheckpoints);
    this.uiManager.updateStatus('Collect all 5 office checkpoints before exiting.');
  }

  collectCheckpoint(checkpoint) {
    if (this.collectedCheckpointIds.has(checkpoint.id)) return false;

    // Checkpoints are one-shot: collecting one also becomes the new respawn anchor.
    this.collectedCheckpointIds.add(checkpoint.id);
    this.checkpointsCollected += 1;
    this.respawnPoint.copy(checkpoint.respawnPoint);
    this.uiManager.updateProgress(this.checkpointsCollected, this.totalCheckpoints);
    this.uiManager.updateStatus(`${checkpoint.label} secured. Respawn point updated.`);

    this.eventBus.emit(CONSTANTS.EVENTS.CHECKPOINT_COLLECTED, {
      ...checkpoint,
      checkpointsCollected: this.checkpointsCollected,
      totalCheckpoints: this.totalCheckpoints,
    });

    if (this.hasAllCheckpoints()) {
      this.exitUnlocked = true;
      this.uiManager.updateStatus('All checkpoints collected. Exit door unlocked.');
      this.eventBus.emit(CONSTANTS.EVENTS.EXIT_UNLOCKED);
    }

    return true;
  }

  hasAllCheckpoints() {
    return this.checkpointsCollected >= this.totalCheckpoints && this.totalCheckpoints > 0;
  }

  respawnPlayer(player) {
    // Death is recoverable in the office-maze loop; the player returns to the latest safe room.
    player.respawnAt(this.respawnPoint);
    this.eventBus.emit(CONSTANTS.EVENTS.PLAYER_RESPAWNED, {
      position: this.respawnPoint.clone(),
    });
  }
}
