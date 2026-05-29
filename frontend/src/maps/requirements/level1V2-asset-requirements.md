# Level 1 V2 Asset Requirements

## MVP Asset Policy
- Use procedural/lightweight assets only.
- Do not use online models.
- Do not download assets.
- Do not use GLB assets during MVP stabilization.
- Do not add heavy geometry.
- Do not add high-poly assets.

## Placement Rules
Every asset must:
- stay inside its intended room bounds
- not cover room labels
- not cover objective markers
- not block player start
- not block central route
- not block objective route
- not overlap outer boundary walls

## SVG Pattern Conversion Status
- `A01` is the only SVG object candidate currently approved for controlled MVP visual conversion.
- `A01` must remain visual-only, non-colliding, and non-blocking.
- No other SVG object candidate may be converted without explicit user approval.

## Collision Rules
- Decorative assets should be non-blocking if possible.
- Divider assets may use collision only after requirements approval.
- collisionVolumes should remain empty unless specifically approved.
- Never add collision that blocks A -> C -> D -> F -> H.

## Allowed Asset Categories
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

## Forbidden Asset Categories
- online model
- downloaded model
- heavy GLB
- enemies
- traps
- crushers
- full internal wall meshes
- room shell walls
- doors
- anything blocking the MVP route

## Target Sizes
- document marker: small, non-blocking
- desk/counter: medium, should not block label/objective
- archive rack: narrow, may shape route only if approved
- cubicle divider: narrow, not giant wall
- route baffle: small and must leave route passable
