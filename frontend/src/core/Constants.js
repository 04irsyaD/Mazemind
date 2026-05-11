export const CONSTANTS = {
  DEV_MODE: import.meta.env.DEV,

  // Grid settings
  GRID_SIZE: 11,
  CELL_SIZE: 2, // 1 cell = 2x2 world units
  
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
    WALL: 0x2a2a3d,
    PATH: 0x151525,
    PLAYER: 0x00d4ff,
    PLAYER_EMISSIVE: 0x00aacc,
    GOAL: 0x00ff88,
    TRAP: 0xff4444,
    CHECKPOINT_INACTIVE: 0xffc857,
    CHECKPOINT_ACTIVE: 0x00ff88,
    TRIGGER: 0xff7a1a,
    CRUSHER: 0x6f7685,
    WARNING: 0xff3300,
  },

  // Game settings
  PLAYER_SPEED: 6,
  CAMERA_LERP: 0.08,
  CAMERA_SHAKE_DECAY: 4.5,

  EVENTS: {
    CHECKPOINT_ACTIVATED: 'checkpoint:activated',
    TRIGGER_ENTERED: 'trigger:entered',
    CRUSHER_WARNING: 'crusher:warning',
    CRUSHER_ACTIVATED: 'crusher:activated',
    PLAYER_KILLED: 'player:killed',
    LEVEL_RESET: 'level:reset',
  },
  
  // States
  STATE_MENU: 0,
  STATE_PLAYING: 1,
  STATE_WIN: 2,
  STATE_LOSE: 3
};
