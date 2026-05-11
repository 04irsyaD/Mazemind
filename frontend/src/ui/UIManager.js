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

    // Buttons
    document.getElementById('btn-start').addEventListener('click', () => {
      this.game.startLevel();
    });

    const exploreButton = document.getElementById('btn-explore');
    if (exploreButton) {
      exploreButton.hidden = !this.game.areDeveloperToolsEnabled();
      exploreButton.addEventListener('click', () => {
        this.game.startLevel({ freeExplore: true });
      });
    }

    document.getElementById('btn-next').addEventListener('click', () => {
      this.game.startLevel(); // For now, just restart level 1
    });

    document.getElementById('btn-retry').addEventListener('click', () => {
      this.game.startLevel();
    });
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
      this.checkpointCounter.innerText = `Checkpoints ${current}/${total}`;
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
        : 'FPS inspect mode. Gameplay restrictions disabled.';
    }

    if (this.debugToolsLine) {
      this.debugToolsLine.innerText = [
        `F1 Helpers ${state.debugVisible ? 'On' : 'Off'}`,
        `F2 Fly ${state.flyMode ? 'On' : 'Off'}`,
        `F3 Collision ${state.collisionEnabled ? 'On' : 'Off'}`,
        `F4 Crushers ${state.crushersVisible ? 'On' : 'Off'}`
      ].join(' | ');
    }
  }
}
