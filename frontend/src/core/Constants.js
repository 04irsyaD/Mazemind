export const CONSTANTS = {
  // Grid settings
  GRID_SIZE: 11,
  CELL_SIZE: 2, // 1 cell = 2x2 world units
  
  // Cell types
  CELL_WALL: 0,
  CELL_PATH: 1,
  CELL_GOAL: 2,
  CELL_TRAP: 3,

  // Colors
  COLORS: {
    BACKGROUND: 0x0a0a1a,
    WALL: 0x2a2a3d,
    PATH: 0x151525,
    PLAYER: 0x00d4ff,
    PLAYER_EMISSIVE: 0x00aacc,
    GOAL: 0x00ff88,
    TRAP: 0xff4444,
  },

  // Game settings
  PLAYER_SPEED: 6,
  CAMERA_LERP: 0.08,
  
  // States
  STATE_MENU: 0,
  STATE_PLAYING: 1,
  STATE_WIN: 2,
  STATE_LOSE: 3
};
