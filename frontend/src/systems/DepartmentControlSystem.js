import { CONSTANTS } from '../core/Constants.js';

export class DepartmentControlSystem {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.controllerId = 'department-intelligence';
    this.routeLocks = new Map();
    this.lightChannels = new Map();
    this.signageChannels = new Map();
    this.fakeExits = [];
    this.loopCandidates = [];
    this.routeHandles = new Map();
    this.lightChannelHandles = new Map();
    this.signageHandles = new Map();
  }

  reset(mapData) {
    const config = mapData.aiManipulation ?? {};
    this.controllerId = config.controllerId ?? 'department-intelligence';
    this.routeLocks.clear();
    this.lightChannels.clear();
    this.signageChannels.clear();
    this.routeHandles.clear();
    this.lightChannelHandles.clear();
    this.signageHandles.clear();
    this.fakeExits = [...(config.fakeExits ?? [])];
    this.loopCandidates = [...(config.loopCandidates ?? [])];

    config.lockableRoutes?.forEach(route => {
      this.routeLocks.set(route.id, {
        ...route,
        locked: false
      });
    });

    config.lightChannels?.forEach(channel => {
      this.lightChannels.set(channel.id, {
        ...channel,
        intensityScale: 1
      });
    });

    config.signageChannels?.forEach(channel => {
      this.signageChannels.set(channel.id, {
        ...channel,
        overrideText: null
      });
    });
  }

  setRouteLocked(routeId, locked, reason = 'manual') {
    const route = this.routeLocks.get(routeId);
    if (!route || route.locked === locked) return false;

    route.locked = locked;
    route.reason = reason;
    this.routeHandles.get(routeId)?.forEach(handle => handle.setLocked?.(locked, reason));
    this.eventBus?.emit(CONSTANTS.EVENTS.AI_ROUTE_LOCK_CHANGED, {
      id: routeId,
      locked,
      reason
    });
    return true;
  }

  setLightChannelScale(channelId, intensityScale) {
    const channel = this.lightChannels.get(channelId);
    if (!channel) return false;

    channel.intensityScale = intensityScale;
    this.lightChannelHandles.get(channelId)?.forEach(handle => handle.setIntensityScale?.(intensityScale));
    this.eventBus?.emit(CONSTANTS.EVENTS.AI_LIGHT_CHANNEL_CHANGED, {
      id: channelId,
      intensityScale
    });
    return true;
  }

  setSignageText(channelId, text, reason = 'manual') {
    const channel = this.signageChannels.get(channelId);
    if (!channel) return false;

    channel.overrideText = text;
    channel.reason = reason;
    this.signageHandles.get(channelId)?.forEach(handle => handle.setText?.(text, reason));
    this.eventBus?.emit(CONSTANTS.EVENTS.AI_SIGNAGE_CHANGED, {
      id: channelId,
      text,
      reason
    });
    return true;
  }

  registerRouteHandle(routeId, handle) {
    if (!this.routeHandles.has(routeId)) this.routeHandles.set(routeId, new Set());
    this.routeHandles.get(routeId).add(handle);
    const route = this.routeLocks.get(routeId);
    if (route) handle.setLocked?.(route.locked, route.reason ?? 'reset');
    return () => this.routeHandles.get(routeId)?.delete(handle);
  }

  registerLightChannelHandle(channelId, handle) {
    if (!this.lightChannelHandles.has(channelId)) this.lightChannelHandles.set(channelId, new Set());
    this.lightChannelHandles.get(channelId).add(handle);
    const channel = this.lightChannels.get(channelId);
    if (channel) handle.setIntensityScale?.(channel.intensityScale);
    return () => this.lightChannelHandles.get(channelId)?.delete(handle);
  }

  registerSignageHandle(channelId, handle) {
    if (!this.signageHandles.has(channelId)) this.signageHandles.set(channelId, new Set());
    this.signageHandles.get(channelId).add(handle);
    const channel = this.signageChannels.get(channelId);
    if (channel?.overrideText) handle.setText?.(channel.overrideText, channel.reason ?? 'reset');
    return () => this.signageHandles.get(channelId)?.delete(handle);
  }

  getState() {
    return {
      controllerId: this.controllerId,
      routeLocks: [...this.routeLocks.values()],
      lightChannels: [...this.lightChannels.values()],
      signageChannels: [...this.signageChannels.values()],
      fakeExits: this.fakeExits,
      loopCandidates: this.loopCandidates,
      registeredRouteHandles: [...this.routeHandles.values()].reduce((sum, handles) => sum + handles.size, 0),
      registeredLightHandles: [...this.lightChannelHandles.values()].reduce((sum, handles) => sum + handles.size, 0),
      registeredSignageHandles: [...this.signageHandles.values()].reduce((sum, handles) => sum + handles.size, 0)
    };
  }
}
