import * as THREE from 'three';
import { CONSTANTS } from './Constants.js';

const rendererSize = new THREE.Vector2();

export function devLog(...args) {
  if (CONSTANTS.DEV_MODE) {
    console.log(...args);
  }
}

export function sceneDiagnostics(scene, camera, renderer) {
  if (!CONSTANTS.DEV_MODE) return null;

  if (renderer) {
    renderer.getSize(rendererSize);
  }

  return {
    children: scene?.children.length ?? 0,
    cameraPosition: camera?.position.toArray().map(value => Number(value.toFixed(2))),
    rendererSize: renderer ? rendererSize.toArray() : null,
  };
}
