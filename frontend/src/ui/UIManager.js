export class UIManager {
  constructor(game) {
    this.game = game;
    
    // Screens
    this.startScreen = document.getElementById('start-screen');
    this.winScreen = document.getElementById('win-screen');
    this.loseScreen = document.getElementById('lose-screen');
    this.hud = document.getElementById('hud');
    this.villainText = document.getElementById('villain-text');
    this.checkpointCounter = document.getElementById('checkpoint-counter');
    this.statusText = document.getElementById('status-text');
    this.warningText = document.getElementById('warning-text');
    this.debugPanel = document.getElementById('debug-panel');
    this.debugModeLine = document.getElementById('debug-mode-line');
    this.debugToolsLine = document.getElementById('debug-tools-line');
    this.debugStateLine = document.getElementById('debug-state-line');
    this.debugRoomLine = document.getElementById('debug-room-line');
    this.listeners = [];

    // Buttons
    this.bindButton('btn-start', () => this.game.startLevel());

    const exploreButton = document.getElementById('btn-explore');
    if (exploreButton) {
      exploreButton.hidden = !this.game.areDeveloperToolsEnabled();
      this.bindButton('btn-explore', () => this.game.startLevel({ freeExplore: true }));
    }

    this.bindButton('btn-next', () => this.game.startLevel());
    this.bindButton('btn-retry', () => this.game.startLevel());
  }

  bindButton(id, handler) {
    const element = document.getElementById(id);
    if (!element) return;
    element.addEventListener('click', handler);
    this.listeners.push({ element, type: 'click', handler });
  }

  hideAllScreens() {
    this.startScreen.classList.remove('active');
    this.startScreen.classList.add('hidden');
    
    this.winScreen.classList.remove('active');
    this.winScreen.classList.add('hidden');
    
    this.loseScreen.classList.remove('active');
    this.loseScreen.classList.add('hidden');
  }

  showScreen(screenId) {
    this.hideAllScreens();
    const screen = document.getElementById(screenId);
    if (screen) {
      screen.classList.remove('hidden');
      screen.classList.add('active');
    }
  }

  showHUD() {
    this.hud.classList.remove('hidden');
  }

  hideHUD() {
    this.hud.classList.add('hidden');
    this.hideDebugPanel();
  }

  updateVillainText(text) {
    if (this.villainText) {
      this.villainText.innerText = `"${text}"`;
    }
  }

  updateProgress(current, total) {
    if (this.checkpointCounter) {
      this.checkpointCounter.innerText = `Tasks ${current}/${total}`;
    }
  }

  updateStatus(text) {
    if (this.statusText) {
      this.statusText.innerText = text;
    }
  }

  showWarning(text) {
    if (!this.warningText) return;

    this.warningText.innerText = text;
    this.warningText.classList.remove('hidden');
    window.clearTimeout(this.warningTimeout);
    this.warningTimeout = window.setTimeout(() => {
      this.warningText.classList.add('hidden');
    }, 1800);
  }

  showDebugPanel() {
    this.debugPanel?.classList.remove('hidden');
  }

  hideDebugPanel() {
    this.debugPanel?.classList.add('hidden');
  }

  updateDebugPanel(state) {
    if (!this.debugPanel) return;

    if (this.debugModeLine) {
      this.debugModeLine.innerText = state.flyMode
        ? 'Fly camera active. Space up, Shift down.'
        : state.freeExplore
          ? 'FPS inspect mode. Gameplay restrictions disabled.'
          : 'Gameplay debug visuals. Progression remains active.';
    }

    if (this.debugToolsLine) {
      this.debugToolsLine.innerText = [
        `F1 Helpers ${state.debugVisible ? 'On' : 'Off'}`,
        `F2 Fly ${state.flyMode ? 'On' : 'Off'}`,
        `F3 Collision ${state.collisionEnabled ? 'On' : 'Off'}`,
        `F4 Crushers ${state.crushersVisible ? 'On' : 'Off'}`,
        `F5 Solids ${state.collisionVisible ? 'On' : 'Off'}`,
        `F6 Rooms ${state.roomsVisible ? 'On' : 'Off'}`,
        `F7 Route ${state.routeVisible ? 'On' : 'Off'}`
      ].join(' | ');
    }

    if (this.debugStateLine) {
      this.debugStateLine.innerText = [
        `Tasks ${state.checkpointsCollected ?? 0}/${state.totalCheckpoints ?? 0}`,
        `Flow ${state.progressionState ?? 'unknown'}`,
        `Exit ${state.exitUnlocked ? 'Unlocked' : 'Locked'}`,
        `Player ${state.playerGrid ?? '-'}`,
        `FPS ${state.fps ?? '-'}`
      ].join(' | ');
    }

    if (this.debugRoomLine) {
      const lightSummary = state.lightChannels?.map(channel => `${channel.id}:${channel.scale.toFixed(2)}`).join(' ');
      this.debugRoomLine.innerText = state.activeRoom
        ? `Room: ${state.activeRoom}`
        : 'Room: outside authored space';
      if (lightSummary) {
        this.debugRoomLine.innerText += ` | Lights ${lightSummary}`;
      }
      this.debugRoomLine.innerText += ` | Volumes ${state.collisionVolumes ?? 0} | Locks ${state.routeBlockers ?? 0}`;
    }
  }

  dispose() {
    this.listeners.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    this.listeners = [];
    window.clearTimeout(this.warningTimeout);
  }
}
