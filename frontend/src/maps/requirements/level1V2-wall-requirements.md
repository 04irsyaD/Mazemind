# Level 1 V2 Wall Requirements

Detailed per-room wall planning is defined in level1V2-room-wall-requirements.md.

## Current MVP Wall Status
- Only outer boundary walls are allowed in the current MVP.
- All interior grid cells must remain CELL_PATH.
- Internal room walls are intentionally disabled for stability.
- Room shells are not allowed in MVP.
- Doors are not allowed in MVP.
- Wall/divider placement preview mode may show low floor markers only.
- Preview markers are not wallSegments, collisionVolumes, walls, or dividers.
- Placement slot mode may show floor slot markers sourced from approved floor zones only.

## Why Internal Walls Are Restricted
- Previous internal wall attempts caused blocky/incorrect office layout.
- Grid-cell walls are visually too thick.
- Door openings became unreliable.
- Objective route stability is higher priority for MVP.

## Allowed Wall Types
Current MVP:
- outer boundary wall only

Future approved wall types:
- single test separator
- partial divider wall
- low office divider
- cubicle partition
- archive rack divider

## Forbidden Wall Types
- full room shell generated automatically
- internal grid-cell room walls
- door-based wall systems
- thin-wall renderer without approval
- wall segments that block central route
- walls that block objectives
- walls that require moving objective positions

## Wall Implementation Phases
Phase 0:
Outer boundary only.

Phase 1:
Floor zone preview and optional floor-level placement markers only.

Placement slot preview:
- `placementSlotMode: true`
- `placementSlotSource: approved-floor-zones`
- `placementSlotStatus: preview-only`
- Slot markers must not become wallSegments or collisionVolumes.

Phase 2:
Office Maze Lite dividers, requirements-approved only.

Phase 3:
One test separator wall only.

Phase 4:
Partial A divider only if approved.

Phase 5:
C/F route-shaping dividers only if route remains playable.

Phase 6:
Full wall system is future work after MVP.

## Wall Validation Rules
Every wall change must validate:
- floor zone bounds unchanged
- objective order unchanged
- objective positions unchanged
- player can complete A -> C -> D -> F -> H
- Documents can reach 5/5
- reset works
- no objective is blocked
- central route remains passable
- no undefined label text
- build passes

## Do Not Proceed Rule
If requirements are missing or unclear, do not implement wall changes.
Create or update requirements first.
