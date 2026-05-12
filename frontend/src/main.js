import { Game } from './core/Game.js';

window.addEventListener('DOMContentLoaded', () => {
  window.__mazemindGame?.dispose?.();
  const game = new Game();
  window.__mazemindGame = game;
  game.start();

  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      game.dispose();
      if (window.__mazemindGame === game) {
        window.__mazemindGame = null;
      }
    });
  }
});
