export const CONSTANTS = {
  DEV_MODE: import.meta.env.DEV,

  // Grid settings
  GRID_SIZE: 25,
  CELL_SIZE: 3.2,
  WALL_HEIGHT: 2.75,
  PLAYER_EYE_HEIGHT: 1.62,
  PLAYER_COLLISION_RADIUS: 0.38,
  
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
    BACKGROUND: 0x0a0a1a,
    WALL: 0x30334c,
    WALL_EMISSIVE: 0x070914,
    PATH: 0x20233c,
    PATH_ACCENT: 0x282d50,
    PLAYER: 0x00d4ff,
    PLAYER_EMISSIVE: 0x00aacc,
    GOAL: 0x00ff88,
    GOAL_LOCKED: 0xff7a1a,
    TRAP: 0xff4444,
    CHECKPOINT_INACTIVE: 0x28d8ff,
    CHECKPOINT_ACTIVE: 0x7afcff,
    FURNITURE: 0x8d745f,
    FURNITURE_ALERT: 0xff7a1a,
    OFFICE_GLASS: 0x79d7ff,
    TRIGGER: 0xff7a1a,
    CRUSHER: 0x6f7685,
    WARNING: 0xff3300,
  },

  // Game settings
  PLAYER_SPEED: 4.7,
  MOUSE_SENSITIVITY: 0.0022,
  HEAD_BOB_AMOUNT: 0.026,
  HEAD_BOB_SPEED: 8.4,
  CAMERA_FOLLOW_DAMPING: 5.5,
  CAMERA_LERP: 0.08,
  CAMERA_FRUSTUM_SIZE: 34,
  CAMERA_SHAKE_DECAY: 4.5,

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
