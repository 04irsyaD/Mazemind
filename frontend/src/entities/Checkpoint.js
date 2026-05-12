import * as THREE from 'three';
import { CONSTANTS } from '../core/Constants.js';

export class Checkpoint {
  constructor(scene, eventBus, config) {
    this.scene = scene;
    this.eventBus = eventBus;
    this.type = 'checkpoint';
    this.id = config.id;
    this.label = config.label ?? config.id;
    this.radius = config.radius ?? CONSTANTS.CELL_SIZE * 0.6;
    this.visualType = config.visualType ?? 'terminal';
    this.activated = false;
    this.group = new THREE.Group();
    this.group.position.set(config.x * CONSTANTS.CELL_SIZE, config.height ?? 0, config.y * CONSTANTS.CELL_SIZE);
    this.group.rotation.y = config.rotation ?? 0;

    if (this.visualType === 'document') {
      this.createDocumentVisual(config);
    } else {
      this.createTerminalVisual();
    }

    this.time = 0;
    this.scene.add(this.group);
  }

  update(delta, context) {
    this.time += delta;
    if (this.screen?.material) {
      this.screen.material.emissiveIntensity = (this.activated ? 0.7 : 0.24) + Math.sin(this.time * 2.8) * 0.08;
    }
    if (this.paperMaterial) {
      this.paperMaterial.emissiveIntensity = (this.activated ? 0.16 : 0.035) + Math.sin(this.time * 1.8) * 0.012;
    }

    if (context?.isFreeExplore) return;
    if (this.activated) return;

    const distance = Math.hypot(
      context.player.position.x - this.group.position.x,
      context.player.position.z - this.group.position.z
    );

    if (distance <= this.radius) {
      this.activate();
    }
  }

  activate() {
    this.activated = true;
    this.material.color.setHex(CONSTANTS.COLORS.CHECKPOINT_ACTIVE);
    this.material.emissive.setHex(CONSTANTS.COLORS.CHECKPOINT_ACTIVE);
    this.material.emissiveIntensity = 0.8;
    if (this.light) {
      this.light.color.setHex(CONSTANTS.COLORS.CHECKPOINT_ACTIVE);
      this.light.intensity = this.visualType === 'document' ? 0.45 : 1.2;
    }
    this.eventBus.emit(CONSTANTS.EVENTS.CHECKPOINT_ACTIVATED, {
      id: this.id,
      label: this.label,
      respawnPoint: new THREE.Vector3(this.group.position.x, this.group.position.y, this.group.position.z),
    });
  }

  createTerminalVisual() {
    this.material = new THREE.MeshStandardMaterial({
      color: CONSTANTS.COLORS.CHECKPOINT_INACTIVE,
      emissive: CONSTANTS.COLORS.CHECKPOINT_INACTIVE,
      emissiveIntensity: 0.25,
      transparent: true,
      opacity: 0.85,
    });

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.78, 0.9, 0.08, 24),
      this.material
    );
    base.position.y = 0.04;
    this.group.add(base);

    const consoleMat = new THREE.MeshStandardMaterial({
      color: 0x303941,
      roughness: 0.58,
      metalness: 0.14
    });

    const console = new THREE.Mesh(
      new THREE.BoxGeometry(0.84, 0.92, 0.48),
      consoleMat
    );
    console.position.y = 0.5;
    console.castShadow = true;
    console.receiveShadow = true;
    this.group.add(console);

    const screen = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.36, 0.06),
      this.material
    );
    screen.position.set(0, 0.98, -0.25);
    screen.rotation.x = -0.18;
    this.screen = screen;
    this.group.add(screen);

    this.light = new THREE.PointLight(CONSTANTS.COLORS.CHECKPOINT_INACTIVE, 0.7, 4);
    this.light.position.y = 1.1;
    this.group.add(this.light);
  }

  createDocumentVisual(config) {
    const paperColor = config.paperColor ?? 0xded8c8;
    this.paperMaterial = new THREE.MeshStandardMaterial({
      color: paperColor,
      emissive: CONSTANTS.COLORS.CHECKPOINT_INACTIVE,
      emissiveIntensity: 0.035,
      roughness: 0.86,
      metalness: 0.02
    });
    this.material = this.paperMaterial;

    const surfaceHeight = config.surfaceHeight ?? 0.86;
    const paper = new THREE.Mesh(
      new THREE.BoxGeometry(0.78, 0.025, 1.02),
      this.paperMaterial
    );
    paper.position.y = surfaceHeight + 0.02;
    paper.castShadow = true;
    paper.receiveShadow = true;
    this.group.add(paper);

    const print = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 0.94),
      new THREE.MeshBasicMaterial({
        map: this.createDocumentTexture(config.documentTitle ?? 'SHIFT ASSIGNMENT\nFORM'),
        transparent: true,
        side: THREE.DoubleSide
      })
    );
    print.rotation.x = -Math.PI / 2;
    print.position.y = surfaceHeight + 0.035;
    this.group.add(print);

    const outlineMat = new THREE.MeshBasicMaterial({
      color: CONSTANTS.COLORS.CHECKPOINT_INACTIVE,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const outline = new THREE.Mesh(new THREE.RingGeometry(0.58, 0.62, 4), outlineMat);
    outline.rotation.x = -Math.PI / 2;
    outline.rotation.z = Math.PI / 4;
    outline.position.y = surfaceHeight + 0.042;
    this.group.add(outline);

    this.light = new THREE.PointLight(CONSTANTS.COLORS.CHECKPOINT_INACTIVE, 0.22, 3.6);
    this.light.position.y = surfaceHeight + 0.45;
    this.group.add(this.light);
  }

  createDocumentTexture(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 768;
    const context = canvas.getContext('2d');
    context.fillStyle = '#e9e3d3';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#4d5658';
    context.lineWidth = 18;
    context.strokeRect(32, 32, canvas.width - 64, canvas.height - 64);
    context.fillStyle = '#273033';
    context.font = '700 48px Arial, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'top';
    text.split('\n').forEach((line, index) => {
      context.fillText(line, canvas.width / 2, 88 + index * 58);
    });
    context.font = '28px Arial, sans-serif';
    for (let i = 0; i < 8; i++) {
      const y = 250 + i * 48;
      context.fillRect(92, y, 328 - (i % 3) * 46, 8);
    }
    context.strokeStyle = '#6b7f87';
    context.lineWidth = 10;
    context.strokeRect(318, 580, 110, 74);
    context.font = '700 24px Arial, sans-serif';
    context.fillText('NIGHT', 373, 600);
    context.fillText('SHIFT', 373, 628);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  dispose() {
    this.scene.remove(this.group);
    this.group.traverse(child => {
      child.geometry?.dispose?.();
      child.material?.map?.dispose?.();
      child.material?.dispose?.();
    });
  }
}
