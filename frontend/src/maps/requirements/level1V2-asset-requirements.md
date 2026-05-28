# Level 1 V2 Asset Requirements

## MVP Asset Mode

- MVP uses procedural/lightweight assets only.
- No online models unless explicitly approved.
- No GLB assets during MVP stabilization.
- Max total MVP object count should stay reasonable.
- Recommended max is 8-14 Office Maze Lite obstacles.
- Object placement must preserve the approved route and readable room identities.

## Placement Rules

- Each object must stay inside its assigned room zone.
- Objects must not cover labels.
- Objects must not block objectives.
- Objects must not block the central route.
- Objects must not create accidental walls or sealed spaces.
- Objects must not visually imply a different room function than the approved room definition.
- `collisionVolumes` should remain empty unless specifically approved.
- Visual-first separators are preferred over blocking walls.

## Allowed Categories

- intake counter
- document marker
- canteen table
- workstation cluster
- meeting table
- archive rack
- restroom marker
- level access pad
- cubicle partition
- low office divider
- route baffle

## Forbidden Categories

- online models
- downloaded assets
- heavy GLB
- enemies
- traps
- crushers
- full internal wall meshes
- room shell walls
- doors
- anything that breaks objective route

## Stability Requirements

- Any future asset pass must keep the route `A -> C -> D -> F -> H` playable.
- Any future asset pass must keep all objectives visible and reachable.
- Any future asset pass must keep room labels readable.
- Any future asset pass must avoid changing gameplay code unless separately approved.
