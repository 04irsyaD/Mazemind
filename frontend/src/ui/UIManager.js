export class UIManager {
  constructor(game) {
    this.game = game;
    
    // Screens
    this.startScreen = document.getElementById('start-screen');
    this.winScreen = document.getElementById('win-screen');
    this.loseScreen = document.getElementById('lose-screen');
    this.hud = document.getElementById('hud');
    this.villainText = document.getElementById('villain-text');

    // Buttons
    document.getElementById('btn-start').addEventListener('click', () => {
      this.game.startLevel();
    });

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
  }

  updateVillainText(text) {
    if (this.villainText) {
      this.villainText.innerText = `"${text}"`;
    }
  }
}
