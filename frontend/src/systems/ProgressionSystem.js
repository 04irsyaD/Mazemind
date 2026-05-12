import { CONSTANTS } from '../core/Constants.js';
import { getTaskObjectives } from '../core/LevelDefinition.js';

export class ProgressionSystem {
  constructor(eventBus, uiManager, departmentControlSystem) {
    this.eventBus = eventBus;
    this.uiManager = uiManager;
    this.departmentControlSystem = departmentControlSystem;
    this.unsubscribers = [];
    this.reset();
    this.bindEvents();
  }

  bindEvents() {
    this.unsubscribers.push(this.eventBus.on(CONSTANTS.EVENTS.CHECKPOINT_COLLECTED, payload => {
      this.completeObjective(payload.id, payload.label);
    }));

    this.unsubscribers.push(this.eventBus.on(CONSTANTS.EVENTS.TRIGGER_ENTERED, payload => {
      if (this.fakeExitTriggerIds.has(payload.id)) {
        this.attemptFakeExit(payload.id);
      }
    }));

    this.unsubscribers.push(this.eventBus.on(CONSTANTS.EVENTS.GOAL_REACHED, payload => {
      if (this.canCompleteFinalExit(payload?.id)) {
        this.setState('complete');
      }
    }));
  }

  reset(level = null) {
    this.level = level;
    this.taskObjectives = getTaskObjectives(level ?? {});
    this.taskIds = new Set(this.taskObjectives.map(objective => objective.id));
    this.completedTaskIds = new Set();
    this.fakeExitTriggerIds = new Set(
      (level?.hazards ?? [])
        .filter(hazard => hazard.type === 'fakeExitTrigger')
        .map(hazard => hazard.id)
    );
    this.fakeExitAttempted = false;
    this.crusherArmed = false;
    this.finalRouteUnlocked = false;
    this.finalRouteEntered = false;
    this.state = 'tasksIncomplete';
    this.emitState();
  }

  completeObjective(id, label = id) {
    if (!this.taskIds.has(id) || this.completedTaskIds.has(id)) return false;

    this.completedTaskIds.add(id);
    this.eventBus.emit(CONSTANTS.EVENTS.OBJECTIVE_COMPLETED, {
      id,
      label,
      completed: this.completedTaskIds.size,
      total: this.taskIds.size
    });

    if (this.hasAllTasks()) {
      this.finalRouteUnlocked = true;
      this.departmentControlSystem?.setRouteLocked('records-hall', false, 'tasks-verified');
      this.departmentControlSystem?.setLightChannelScale('ai-cyan', 1.15);
      this.setState('finalRouteUnlocked');
      this.eventBus.emit(CONSTANTS.EVENTS.FINAL_ROUTE_UNLOCKED, this.getState());
      this.eventBus.emit(CONSTANTS.EVENTS.EXIT_UNLOCKED, this.getState());
      return true;
    }

    this.setState(this.fakeExitAttempted ? 'crusherArmed' : 'tasksIncomplete');
    return true;
  }

  attemptFakeExit(triggerId) {
    if (this.finalRouteUnlocked || this.fakeExitAttempted) return false;

    this.fakeExitAttempted = true;
    this.crusherArmed = true;
    this.departmentControlSystem?.setRouteLocked('records-hall', true, 'fake-exit-attempted');
    this.departmentControlSystem?.setLightChannelScale('emergency', 1.28);
    this.departmentControlSystem?.setSignageText('department-labels', 'PUBLIC EXIT DENIED\nTRANSFER INCOMPLETE', 'fake-exit-attempted');
    this.setState('crusherArmed');
    this.eventBus.emit(CONSTANTS.EVENTS.FAKE_EXIT_ATTEMPTED, { triggerId, ...this.getState() });
    this.eventBus.emit(CONSTANTS.EVENTS.CRUSHER_ARMED, { triggerId, ...this.getState() });
    return true;
  }

  enterFinalRoute() {
    if (!this.finalRouteUnlocked || this.finalRouteEntered) return false;
    this.finalRouteEntered = true;
    this.setState('finalRouteEntered');
    this.eventBus.emit(CONSTANTS.EVENTS.FINAL_ROUTE_ENTERED, this.getState());
    return true;
  }

  canCompleteFinalExit() {
    return this.finalRouteUnlocked || this.state === 'complete';
  }

  hasAllTasks() {
    return this.taskIds.size > 0 && this.completedTaskIds.size >= this.taskIds.size;
  }

  setState(state) {
    this.state = state;
    this.emitState();
  }

  emitState() {
    this.eventBus?.emit(CONSTANTS.EVENTS.PROGRESSION_STATE_CHANGED, this.getState());
  }

  getState() {
    return {
      state: this.state,
      completedTasks: this.completedTaskIds.size,
      totalTasks: this.taskIds.size,
      completedTaskIds: [...this.completedTaskIds],
      fakeExitAttempted: this.fakeExitAttempted,
      crusherArmed: this.crusherArmed,
      finalRouteUnlocked: this.finalRouteUnlocked,
      finalRouteEntered: this.finalRouteEntered
    };
  }

  dispose() {
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];
  }
}
