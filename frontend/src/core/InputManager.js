export class InputManager {
  constructor() {
    this.keys = {};
    this.previousKeys = {};
    this.mouseDelta = { x: 0, y: 0 };
    this.pointerLocked = false;

    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      // Prevent default scrolling for arrow keys and space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement !== null;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.pointerLocked) return;

      this.mouseDelta.x += e.movementX;
      this.mouseDelta.y += e.movementY;
    });
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
    return { ...this.mouseDelta };
  }

  requestPointerLock(element = document.body) {
    element.requestPointerLock?.();
  }
}
