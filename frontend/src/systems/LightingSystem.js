import * as THREE from 'three';
import { CONSTANTS } from '../core/Constants.js';

export class LightingSystem {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.records = [];
    this.channelScales = new Map();
    this.level = null;
    this.time = 0;
  }

  build(level, departmentControlSystem = null) {
    this.clear();
    this.level = level;

    level.lightingZones?.forEach(zone => {
      this.channelScales.set(zone.channelId, 1);
    });

    level.ceilingLights?.forEach(config => {
      this.addCeilingLight(config, departmentControlSystem);
    });

    level.areaLights?.forEach(config => {
      this.addAreaLight(config, departmentControlSystem);
    });
  }

  addCeilingLight(config, departmentControlSystem) {
    const channelId = config.channelId ?? this.resolveLightChannel(config.x, config.y);
    const fixtureColor = config.fixtureColor ?? this.resolveFixtureColor(config.color ?? CONSTANTS.COLORS.FLUORESCENT);
    const fixture = new THREE.Mesh(
      new THREE.BoxGeometry(
        (config.width ?? 1.4) * CONSTANTS.CELL_SIZE,
        0.045,
        (config.depth ?? 0.16) * CONSTANTS.CELL_SIZE
      ),
      new THREE.MeshStandardMaterial({
        color: fixtureColor,
        emissive: config.color ?? CONSTANTS.COLORS.FLUORESCENT,
        emissiveIntensity: config.emissiveIntensity ?? (config.flicker ? 0.16 : 0.24),
        roughness: 0.58,
        metalness: 0.02
      })
    );
    fixture.position.set(
      config.x * CONSTANTS.CELL_SIZE,
      CONSTANTS.WALL_HEIGHT - 0.035,
      config.y * CONSTANTS.CELL_SIZE
    );
    this.group.add(fixture);
    this.addFixtureFrame(config, fixture.position);

    const light = new THREE.PointLight(
      config.color ?? CONSTANTS.COLORS.FLUORESCENT,
      config.intensity ?? 0.25,
      config.distance ?? 8
    );
    light.position.set(fixture.position.x, CONSTANTS.WALL_HEIGHT - 0.35, fixture.position.z);
    this.group.add(light);

    this.addRecord({
      id: config.id ?? `ceiling-${config.x}-${config.y}`,
      channelId,
      fixture,
      light,
      baseIntensity: light.intensity,
      baseEmissiveIntensity: fixture.material.emissiveIntensity,
      flicker: !!config.flicker,
      phase: this.seedPhase(`${config.x}:${config.y}`)
    }, departmentControlSystem);
  }

  addFixtureFrame(config, position) {
    const width = (config.width ?? 1.4) * CONSTANTS.CELL_SIZE;
    const depth = (config.depth ?? 0.16) * CONSTANTS.CELL_SIZE;
    const thickness = config.frameThickness ?? 0.055;
    const material = new THREE.MeshStandardMaterial({
      color: config.frameColor ?? 0x4b5658,
      emissive: 0x010202,
      emissiveIntensity: 0.035,
      roughness: 0.82,
      metalness: 0.08
    });
    const frameY = CONSTANTS.WALL_HEIGHT - 0.028;
    const frameParts = [
      {
        geometry: new THREE.BoxGeometry(width + thickness * 2, 0.035, thickness),
        x: position.x,
        z: position.z - depth / 2 - thickness / 2
      },
      {
        geometry: new THREE.BoxGeometry(width + thickness * 2, 0.035, thickness),
        x: position.x,
        z: position.z + depth / 2 + thickness / 2
      },
      {
        geometry: new THREE.BoxGeometry(thickness, 0.035, depth),
        x: position.x - width / 2 - thickness / 2,
        z: position.z
      },
      {
        geometry: new THREE.BoxGeometry(thickness, 0.035, depth),
        x: position.x + width / 2 + thickness / 2,
        z: position.z
      }
    ];

    frameParts.forEach(part => {
      const mesh = new THREE.Mesh(part.geometry, material.clone());
      mesh.position.set(part.x, frameY, part.z);
      mesh.castShadow = false;
      mesh.receiveShadow = true;
      this.group.add(mesh);
    });
    material.dispose();
  }

  addAreaLight(config, departmentControlSystem) {
    const channelId = config.channelId ?? this.resolveLightChannel(config.x, config.y);
    const light = new THREE.PointLight(
      config.color ?? CONSTANTS.COLORS.FLUORESCENT,
      config.intensity ?? 0.25,
      config.distance ?? 8
    );
    light.position.set(
      config.x * CONSTANTS.CELL_SIZE,
      config.height ?? 2,
      config.y * CONSTANTS.CELL_SIZE
    );
    this.group.add(light);

    this.addRecord({
      id: config.id ?? `area-${config.x}-${config.y}`,
      channelId,
      light,
      baseIntensity: light.intensity,
      flicker: !!config.flicker,
      phase: this.seedPhase(`area:${config.x}:${config.y}`)
    }, departmentControlSystem);
  }

  addRecord(record, departmentControlSystem) {
    this.records.push(record);
    if (!this.channelScales.has(record.channelId)) {
      this.channelScales.set(record.channelId, 1);
    }

    departmentControlSystem?.registerLightChannelHandle(record.channelId, {
      setIntensityScale: scale => this.setChannelScale(record.channelId, scale)
    });
  }

  update(delta) {
    this.time += delta;
    for (const record of this.records) {
      const scale = this.channelScales.get(record.channelId) ?? 1;
      const flicker = record.flicker
        ? 0.88 + Math.sin(this.time * 5.8 + record.phase) * 0.08 + Math.sin(this.time * 16.5 + record.phase) * 0.035
        : 1;
      if (record.light) {
        record.light.intensity = record.baseIntensity * scale * flicker;
      }
      if (record.fixture?.material) {
        record.fixture.material.emissiveIntensity = record.baseEmissiveIntensity * scale * flicker;
      }
    }
  }

  setChannelScale(channelId, scale) {
    this.channelScales.set(channelId, THREE.MathUtils.clamp(scale, 0, 1.6));
  }

  getState() {
    return {
      channels: [...this.channelScales.entries()].map(([id, scale]) => ({ id, scale })),
      lights: this.records.length
    };
  }

  resolveLightChannel(x, y) {
    const room = this.level?.spaces?.find(space => (
      x >= space.x1 && x <= space.x2 &&
      y >= space.y1 && y <= space.y2
    ));
    const zone = this.level?.lightingZones?.find(candidate => candidate.rooms?.includes(room?.id));
    return zone?.channelId ?? 'normal-office';
  }

  resolveFixtureColor(color) {
    return new THREE.Color(color).lerp(new THREE.Color(0x89928f), 0.42);
  }

  seedPhase(seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    return (hash % 628) / 100;
  }

  clear() {
    for (const child of [...this.group.children]) {
      this.group.remove(child);
      child.geometry?.dispose?.();
      if (Array.isArray(child.material)) {
        child.material.forEach(material => material.dispose?.());
      } else {
        child.material?.dispose?.();
      }
    }
    this.records = [];
    this.channelScales.clear();
    this.time = 0;
  }

  dispose() {
    this.clear();
    this.scene.remove(this.group);
  }
}
