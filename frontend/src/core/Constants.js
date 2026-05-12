export const CONSTANTS = {
  DEV_MODE: import.meta.env.DEV,

  // Grid settings
  GRID_SIZE: 45,
  CELL_SIZE: 3.6,
  WALL_HEIGHT: 3.05,
  PLAYER_EYE_HEIGHT: 1.66,
  PLAYER_COLLISION_RADIUS: 0.48,
  
  // Cell types
  CELL_WALL: 0,
  CELL_PATH: 1,
  CELL_GOAL: 2,
  CELL_TRAP: 3,
  CELL_CHECKPOINT: 4,
  CELL_TRIGGER: 5,
  CELL_CRUSHER: 6,

  // Colors
  COLORS: {
    BACKGROUND: 0x0a0d10,
    WALL: 0x596267,
    WALL_EMISSIVE: 0x030505,
    PATH: 0x434b50,
    PATH_ACCENT: 0x4c5559,
    PLAYER: 0x8bdcff,
    PLAYER_EMISSIVE: 0x4bb8d8,
    GOAL: 0x86f7b2,
    GOAL_LOCKED: 0xb85035,
    TRAP: 0xb85035,
    CHECKPOINT_INACTIVE: 0x6bc7dc,
    CHECKPOINT_ACTIVE: 0xb7f7ff,
    FURNITURE: 0x756b5f,
    FURNITURE_ALERT: 0xb85035,
    OFFICE_GLASS: 0x8ac7d9,
    TRIGGER: 0xd58a4a,
    CRUSHER: 0x727a80,
    WARNING: 0xc43c24,
    FLUORESCENT: 0xcfe9e8,
    AI_CYAN: 0x6bc7dc,
    EMERGENCY_RED: 0xb85035,
  },

  // Game settings
  PLAYER_SPEED: 3.05,
  PLAYER_ACCELERATION: 10.5,
  PLAYER_DECELERATION: 13,
  PLAYER_STOP_EPSILON: 0.025,
  MOUSE_SENSITIVITY: 0.00155,
  MAX_MOUSE_DELTA: 120,
  MAX_DELTA: 0.05,
  HEAD_BOB_AMOUNT: 0.0035,
  HEAD_BOB_SPEED: 4.2,
  CAMERA_FOLLOW_DAMPING: 9.5,
  CAMERA_LERP: 0.08,
  CAMERA_FRUSTUM_SIZE: 34,
  CAMERA_SHAKE_DECAY: 5.2,

  EVENTS: {
    CHECKPOINT_ACTIVATED: 'checkpoint:activated',
    CHECKPOINT_COLLECTED: 'checkpoint:collected',
    EXIT_UNLOCKED: 'exit:unlocked',
    TRIGGER_ENTERED: 'trigger:entered',
    GOAL_REACHED: 'goal:reached',
    GOAL_LOCKED: 'goal:locked',
    CRUSHER_WARNING: 'crusher:warning',
    CRUSHER_ACTIVATED: 'crusher:activated',
    PLAYER_KILLED: 'player:killed',
    PLAYER_RESPAWNED: 'player:respawned',
    LEVEL_RESET: 'level:reset',
    OBJECTIVE_COMPLETED: 'objective:completed',
    FAKE_EXIT_ATTEMPTED: 'fake-exit:attempted',
    CRUSHER_ARMED: 'crusher:armed',
    FINAL_ROUTE_UNLOCKED: 'final-route:unlocked',
    FINAL_ROUTE_ENTERED: 'final-route:entered',
    PROGRESSION_STATE_CHANGED: 'progression:state-changed',
    AI_ROUTE_LOCK_CHANGED: 'ai:route-lock-changed',
    AI_LIGHT_CHANNEL_CHANGED: 'ai:light-channel-changed',
    AI_SIGNAGE_CHANGED: 'ai:signage-changed',
  },
  
  // States
  STATE_MENU: 0,
  STATE_PLAYING: 1,
  STATE_WIN: 2,
  STATE_LOSE: 3,
  STATE_DEV_EXPLORE: 4,

  // Developer tools
  DEVELOPER_TOOLS_ENABLED: import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true',
  FREE_FLY_SPEED: 9.5
};
