import { CONSTANTS } from '../core/Constants.js';

export class GameStateSystem {
  constructor(uiManager) {
    this.state = CONSTANTS.STATE_MENU;
    this.uiManager = uiManager;
  }

  setState(newState, data = null) {
    this.state = newState;
    
    switch (this.state) {
      case CONSTANTS.STATE_MENU:
        this.uiManager.showScreen('start-screen');
        break;
      case CONSTANTS.STATE_PLAYING:
        this.uiManager.hideAllScreens();
        this.uiManager.showHUD();
        break;
      case CONSTANTS.STATE_DEV_EXPLORE:
        this.uiManager.hideAllScreens();
        this.uiManager.showHUD();
        this.uiManager.showDebugPanel();
        this.uiManager.updateStatus('Free Explore: progression, traps, crushers, and death are disabled.');
        break;
      case CONSTANTS.STATE_WIN:
        this.uiManager.hideHUD();
        this.uiManager.showScreen('win-screen');
        break;
      case CONSTANTS.STATE_LOSE:
        this.uiManager.hideHUD();
        this.uiManager.updateVillainText(data?.taunt || 'Public exit rejected. Assigned tasks remain unverified.');
        this.uiManager.showScreen('lose-screen');
        break;
    }
  }

  isState(checkState) {
    return this.state === checkState;
  }
}
