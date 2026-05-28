# Level 1 V2 Maze Lite Placement Plan

## 1. Purpose

Level 1 V2 needs stronger maze feeling without returning to unstable internal grid walls.

Maze feeling should come from:
- low office dividers
- cubicle partitions
- archive rack lanes
- route baffles

## 2. Current MVP Baseline

- Floor zones are approved.
- Route `A -> C -> D -> F -> H` is approved.
- Objectives `5/5` are working.
- Internal walls are disabled.
- Maze Lite is currently paused.
- All interior grid cells are `CELL_PATH`.

## 3. Divider Rules

- Total divider target: 6 to 8
- Absolute max: 10
- Visual-only first
- Collision disabled in first implementation
- No divider may block objective markers
- No divider may cover room labels
- No divider may block central route
- No divider may be placed in A start area
- No divider may require moving objectives
- No GLB or online models
- Procedural only

## 4. Proposed Divider Placement

### C / Main Workstation Hall

- 2 cubicle dividers
- positions around x 18-25, y 4-7
- purpose: make workstation area feel structured
- must not block objective at `{ x: 21.5, y: 5.5 }`

### F / Records Archive

- 2 archive rack dividers
- positions around x 4-10, y 18-21
- purpose: create archive aisle feeling
- must not block objective at `{ x: 7, y: 20 }`

### D / Boardroom

- 1 low divider or formal table boundary
- position around x 19-24, y 11-14
- purpose: make boardroom feel less empty
- must not block objective at `{ x: 21.5, y: 12.5 }`

### H / Level 2 Access

- 1 final access lane marker
- position around x 15-16, y 18-21
- purpose: make final destination readable
- must not block objective at `{ x: 15.5, y: 20 }`

### Central Route

- optional 1 small route baffle only if safe
- visual-only
- must not block route

Do not place dividers in:
- A
- E
- directly on R central route unless explicitly approved
- directly on labels
- directly on objective markers

## 5. Collision Plan

Phase 1:
- visual-only dividers
- collision disabled
- collisionVolumes remain empty

Phase 2, future only:
- limited collision after route validation
- requires user approval

## 6. Validation Checklist

Before implementation:
- user approves this plan

After implementation:
- floor zone bounds unchanged
- objective positions unchanged
- objective order unchanged
- Documents still 0/5 to 5/5
- route still A -> C -> D -> F -> H
- no internal walls added
- all interior cells remain CELL_PATH
- no collision volumes added
- build passes

## 7. Recommendation

Implement visual-only Maze Lite dividers first.

Do not enable collision until MVP route is re-tested and approved.
