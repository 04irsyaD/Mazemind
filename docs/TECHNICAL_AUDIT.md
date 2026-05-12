# MazeMind Technical Audit

Date: 2026-05-12

## Identity Failure

MazeMind drifted toward "maze game with horror props" because the runtime treated the level as a tile grid first and an office second. The intended experience is a lonely employee moving through a believable department that slowly becomes wrong. Every system must protect atmosphere, spatial readability, and psychological environmental control before adding mechanics.

## Engine Flow

- Entry point: `frontend/src/main.js` creates `Game` and starts the animation loop.
- Renderer and global scene ownership: `core/Scene.js`.
- Main loop, level start, restart, event wiring, entity spawning, player update, camera update, and UI debug state were all centralized in `core/Game.js`.
- Entity lifecycle is owned by `EntityManager`, but level construction was manually scattered through `Game.startLevel`.
- Cleanup improved from the prototype, but runtime systems still needed clearer ownership to avoid duplicated lights, entities, and listeners on restart.

Root flaw: `Game` had too many reasons to change. Level loading, progression, lighting, and AI manipulation must be delegated to dedicated runtime systems.

## Map And Architecture Flow

- `maps/level1.js` contains authored office rooms, but the collision/build source is still a grid.
- `MazeBuilder` converts each wall cell into instanced cubes and each non-wall cell into floor tiles.
- Architecture props are decorative unless they are represented in collision data.
- Room identity, lighting, checkpoints, fake exit, crusher, and AI manipulation metadata are stored in the same file but were not represented as a formal level contract.

Root flaw: the level data mixed authored environment intent with derived grid artifacts. The grid must become runtime output, not the conceptual design source.

## FPS Flow

- Mouse look is handled by `InputManager` and applied in `CameraSystem`.
- Movement is controlled by `Player.update`, with `CollisionSystem` handling grid and capsule-footprint tests.
- Recent improvements added acceleration, deterministic camera shake, yaw reset, and stepped collision.
- Remaining failure: floor height is visual-only unless sampled by movement/camera, and office props need collision volumes so the space feels architectural rather than decorative.

Root flaw: traversal comfort still depends on grid clearance, not authored walkable office volumes.

## Progression Flow

- Checkpoints update `GameManager`.
- Goals validate completion in `Goal`.
- Fake exit pressure is a `TriggerZone`.
- Crusher activation lives in `CrusherWall`.
- `Game` translates some events into UI, camera shake, win/lose, and respawn.

Root flaw: progression state is distributed across entities. The fake exit, final route, crusher arming, and task verification need one authoritative state machine.

## Lighting And Atmosphere Flow

- Global ambient/hemisphere/directional lights live in `Scene`.
- Area lights, ceiling fixtures, navigation nodes, and emissive props are built in `MazeBuilder`.
- Department AI light-channel data exists but does not yet drive real lights.

Root flaw: lighting is authored as static decoration. It needs runtime channel ownership so the department intelligence can subtly manipulate safety, danger, and wrongness without visual spam.

## Debug Flow

- Free Explore provides fly mode, collision toggle, room labels, route helpers, trigger rings, checkpoint markers, and crusher paths.
- These tools are useful, but debug helpers must remain non-invasive and disabled outside the explicit debug state.

Root flaw: debug visibility and gameplay state inspection need to include progression and lighting/AI channels so tuning supports atmosphere and navigation rather than only geometry.

## Priority Fix Order

1. Preserve the current office-horror direction and document root causes.
2. Introduce a `LevelDefinition` contract and runtime loader.
3. Centralize progression state.
4. Move map lights under a `LightingSystem`.
5. Add floor-height and prop-collision support to FPS traversal.
6. Expand AI manipulation handles for route, signage, and lighting changes.
7. Keep browser build output clean and restart/disposal stable.
