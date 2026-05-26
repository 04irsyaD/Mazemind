import * as THREE from 'three';
import { CONSTANTS } from '../core/Constants.js';

export class Checkpoint {
  constructor(scene, eventBus, config) {
    this.scene = scene;
    this.eventBus = eventBus;
    this.type = 'checkpoint';
    this.id = config.id;
    this.label = config.label ?? config.id;
    this.radius = config.interactionRadius ?? config.radius ?? CONSTANTS.CELL_SIZE * 0.6;
    this.promptRadius = config.promptRadius ?? this.radius + CONSTANTS.CELL_SIZE * 0.45;
    this.visualType = config.visualType ?? 'terminal';
    this.roomId = config.roomId;
    this.taskText = config.taskText;
    this.nextTaskText = config.nextTaskText;
    this.completionText = config.completionText;
    this.order = config.order;
    this.objectiveIndex = Number.isFinite(config.objectiveIndex) ? config.objectiveIndex : null;
    this.sequenceAware = this.objectiveIndex !== null;
    this.promptText = config.promptText;
    this.interactionPrompt = config.interactionPrompt ?? config.promptText;
    this.completeText = config.completeText;
    this.finalFeedbackText = config.finalFeedbackText;
    this.activeGlow = config.activeGlow ?? false;
    this.inactiveGlow = config.inactiveGlow ?? false;
    this.markerColor = config.markerColor ?? CONSTANTS.COLORS.CHECKPOINT_INACTIVE;
    this.activeColor = config.activeColor ?? CONSTANTS.COLORS.CHECKPOINT_ACTIVE;
    this.completedColor = config.completedColor ?? 0x3f4b4d;
    this.routeHint = config.routeHint;
    this.promptShown = false;
    this.activated = false;
    this.group = new THREE.Group();
    this.group.position.set(config.x * CONSTANTS.CELL_SIZE, config.height ?? 0, config.y * CONSTANTS.CELL_SIZE);
    this.group.rotation.y = config.rotation ?? 0;

    if (this.visualType === 'document') {
      this.createDocumentVisual(config);
    } else {
      this.createTerminalVisual();
    }
    if (this.sequenceAware && this.routeHint === 'active-objective-beacon') {
      this.createActiveObjectiveBeacon();
    }

    this.time = 0;
    this.scene.add(this.group);
  }

  update(delta, context) {
    this.time += delta;
    if (this.sequenceAware) {
      this.updateSequencedObjective(delta, context);
      return;
    }

    if (this.screen?.material) {
      this.screen.material.emissiveIntensity = (this.activated ? 0.7 : 0.24) + Math.sin(this.time * 2.8) * 0.08;
    }
    if (this.paperMaterial) {
      this.paperMaterial.emissiveIntensity = (this.activated ? 0.16 : 0.045) + Math.sin(this.time * 1.8) * 0.012;
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

  updateSequencedObjective(delta, context) {
    const flowState = this.getSequencedObjectiveState(context);
    this.applySequencedVisual(flowState);

    if (context?.isFreeExplore) return;
    if (flowState !== 'active') return;

    const distance = Math.hypot(
      context.player.position.x - this.group.position.x,
      context.player.position.z - this.group.position.z
    );

    if (distance <= this.radius) {
      this.activate();
      return;
    }

    if (distance <= this.promptRadius && !this.promptShown) {
      context.uiManager?.showWarning(this.interactionPrompt ?? `Approach to collect ${this.label}.`);
      this.promptShown = true;
    }

    if (distance > this.promptRadius) {
      this.promptShown = false;
    }
  }

  getSequencedObjectiveState(context) {
    const completedTaskIds = new Set(context?.progressionState?.completedTaskIds ?? []);
    if (this.activated || completedTaskIds.has(this.id)) return 'completed';

    const completedTasks = context?.progressionState?.completedTasks ?? 0;
    return this.objectiveIndex === completedTasks ? 'active' : 'future';
  }

  applySequencedVisual(flowState) {
    if (flowState === 'completed') {
      this.applyVisualColors(this.completedColor, 0.02, 0.22, 0.04);
      this.applyBeaconState(false);
      return;
    }

    if (flowState === 'active') {
      const pulse = Math.sin(this.time * 3.2) * 0.08;
      const baseGlow = this.activeGlow ? 0.34 : 0.18;
      this.applyVisualColors(this.activeColor, baseGlow + pulse, 0.64, baseGlow + pulse);
      this.applyBeaconState(true, pulse);
      return;
    }

    const futureGlow = this.inactiveGlow ? 0.11 : 0.035;
    this.applyVisualColors(this.markerColor, futureGlow, 0.22, 0.055);
    this.applyBeaconState(false);
  }

  applyVisualColors(color, emissiveIntensity, outlineOpacity, lightIntensity) {
    if (this.visualType === 'document') {
      this.material?.color?.setHex(this.paperColor ?? 0xf1eee3);
    } else {
      this.material?.color?.setHex(color);
    }

    this.material?.emissive?.setHex(color);
    if (this.material) this.material.emissiveIntensity = emissiveIntensity;

    if (this.outlineMaterial) {
      this.outlineMaterial.color.setHex(color);
      this.outlineMaterial.opacity = outlineOpacity;
    }

    if (this.light) {
      this.light.color.setHex(color);
      this.light.intensity = lightIntensity;
    }
  }

  applyBeaconState(visible, pulse = 0) {
    if (!this.beaconGroup) return;

    this.beaconGroup.visible = visible;
    if (!visible) return;

    const scale = 1 + Math.max(0, pulse) * 0.9;
    this.beaconGroup.scale.set(scale, 1, scale);
    if (this.beaconMaterial) {
      this.beaconMaterial.opacity = 0.16 + Math.max(0, pulse) * 0.5;
      this.beaconMaterial.emissiveIntensity = 0.24 + Math.max(0, pulse) * 0.8;
    }
    if (this.beaconRingMaterial) {
      this.beaconRingMaterial.opacity = 0.46 + Math.max(0, pulse) * 0.7;
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
      order: this.order,
      objectiveIndex: this.objectiveIndex,
      roomId: this.roomId,
      taskText: this.taskText,
      nextTaskText: this.nextTaskText,
      completionText: this.completionText,
      completeText: this.completeText,
      finalFeedbackText: this.finalFeedbackText,
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
      color: 0x5c686b,
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
    const paperColor = config.paperColor ?? 0xf1eee3;
    this.paperColor = paperColor;
    this.paperMaterial = new THREE.MeshStandardMaterial({
      color: paperColor,
      emissive: CONSTANTS.COLORS.CHECKPOINT_INACTIVE,
      emissiveIntensity: 0.045,
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
    this.outlineMaterial = outlineMat;
    this.group.add(outline);

    this.light = new THREE.PointLight(CONSTANTS.COLORS.CHECKPOINT_INACTIVE, 0.26, 4.2);
    this.light.position.y = surfaceHeight + 0.45;
    this.group.add(this.light);
  }

  createActiveObjectiveBeacon() {
    this.beaconGroup = new THREE.Group();
    this.beaconGroup.visible = false;

    this.beaconMaterial = new THREE.MeshStandardMaterial({
      color: this.activeColor,
      emissive: this.activeColor,
      emissiveIntensity: 0.24,
      transparent: true,
      opacity: 0.16,
      roughness: 0.62,
      depthWrite: false
    });

    const column = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 1.2, 12),
      this.beaconMaterial
    );
    column.position.y = 0.72;
    this.beaconGroup.add(column);

    this.beaconRingMaterial = new THREE.MeshBasicMaterial({
      color: this.activeColor,
      transparent: true,
      opacity: 0.46,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.34, 0.38, 28),
      this.beaconRingMaterial
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 1.34;
    this.beaconGroup.add(ring);

    this.group.add(this.beaconGroup);
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
