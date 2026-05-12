export class InputManager {
  constructor() {
    this.keys = {};
    this.previousKeys = {};
    this.mouseDelta = { x: 0, y: 0 };
    this.pointerLocked = false;
    this.lockElement = null;

    this.handleKeyDown = (e) => {
      this.keys[e.code] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
    };

    this.handleKeyUp = (e) => {
      this.keys[e.code] = false;
    };

    this.handlePointerLockChange = () => {
      this.pointerLocked = document.pointerLockElement !== null;
    };

    this.handleMouseMove = (e) => {
      if (!this.pointerLocked) return;

      this.mouseDelta.x += e.movementX;
      this.mouseDelta.y += e.movementY;
    };

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    document.addEventListener('pointerlockchange', this.handlePointerLockChange);
    window.addEventListener('mousemove', this.handleMouseMove);
  }

  update() {
    // Copy current state to previous state for key-down-once checks if needed
    this.previousKeys = { ...this.keys };
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
  }

  isKeyDown(code) {
    return !!this.keys[code];
  }

  wasKeyPressed(code) {
    return !!this.keys[code] && !this.previousKeys[code];
  }

  getMovementVector() {
    let dx = 0;
    let dz = 0;

    if (this.isKeyDown('KeyW') || this.isKeyDown('ArrowUp')) dz -= 1;
    if (this.isKeyDown('KeyS') || this.isKeyDown('ArrowDown')) dz += 1;
    if (this.isKeyDown('KeyA') || this.isKeyDown('ArrowLeft')) dx -= 1;
    if (this.isKeyDown('KeyD') || this.isKeyDown('ArrowRight')) dx += 1;

    // Normalize for diagonal movement
    if (dx !== 0 && dz !== 0) {
      const length = Math.sqrt(dx * dx + dz * dz);
      dx /= length;
      dz /= length;
    }

    return { x: dx, z: dz };
  }

  consumeMouseDelta() {
    const delta = { ...this.mouseDelta };
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    return delta;
  }

  requestPointerLock(element = document.body) {
    this.lockElement = element;
    element.requestPointerLock?.();
  }

  resetTransient() {
    this.previousKeys = { ...this.keys };
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
  }

  dispose() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    document.removeEventListener('pointerlockchange', this.handlePointerLockChange);
    window.removeEventListener('mousemove', this.handleMouseMove);
  }
}
