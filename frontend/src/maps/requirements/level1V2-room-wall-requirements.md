# Level 1 V2 Per-Room Wall Requirements

## 1. Purpose

This document defines wall and barrier requirements per room for Level 1 V2.

It exists because global wall requirements are not enough to safely implement walls. Every wall change must follow this document before code implementation.

Level 1 V2 should become an Office Maze Lite level, but without returning to unstable full room shell walls.

Important principles:
- Do not generate full room shells automatically.
- Do not wrap every room with complete walls.
- Do not use door-based wall systems yet.
- Use short, controlled wall/barrier segments only.
- Preserve route A -> C -> D -> F -> H.
- Preserve Documents 0/5 -> 5/5.
- Preserve objective positions.
- Preserve approved floor zones.

## 2. Global Wall Unit Rules

Use current grid planning:
- Grid: 32 x 24
- Approved room bounds must not change.
- Interior cells remain CELL_PATH unless a wall phase explicitly approves a wall cell.
- Wall implementation should start with short segments only.

Wall sizing rule:
- 1 grid cell is treated as one planning unit.
- Approximate visual size depends on current CELL_SIZE.
- Do not create wall segments longer than 6 cells in a single segment during Phase 1.
- Prefer 2-5 cell segments.
- Wall height should be office partition height first, not full ceiling wall, unless renderer only supports full wall.
- If renderer only supports full wall blocks, keep segment count and length low.

Wall collision rule:
- Wall segments are blocking.
- Wall must not overlap objective positions.
- Wall must not block central route.
- Wall must not trap player.
- Wall must not require moving objective positions.

Forbidden global wall behavior:
- no full room shells
- no automatic room boundary walls
- no doors
- no thin-wall renderer unless separately approved
- no wall around A-H from room bounds
- no wall that blocks objective route

## 3. Approved Room Bounds

A / front-admin-intake:
`{ x1: 2, y1: 3, x2: 9, y2: 7 }`

B / canteen:
`{ x1: 2, y1: 8, x2: 9, y2: 12 }`

E / toilet:
`{ x1: 2, y1: 13, x2: 6, y2: 15 }`

F / records-archive:
`{ x1: 2, y1: 17, x2: 12, y2: 22 }`

R / central-route:
`{ x1: 10, y1: 3, x2: 13, y2: 22 }`

C / main-workstation-hall:
`{ x1: 14, y1: 3, x2: 29, y2: 8 }`

D / boardroom-review:
`{ x1: 14, y1: 10, x2: 29, y2: 15 }`

H / level2-access:
`{ x1: 14, y1: 17, x2: 17, y2: 22 }`

G / secondary-workstation:
`{ x1: 19, y1: 17, x2: 29, y2: 22 }`

## 4. Per Room Wall Requirements Table

| Code | Room ID | Wall Purpose | Allowed Wall Type | Target Wall Count | Max Wall Count | Target Segment Length | Max Segment Length | Access Rule | Forbidden Wall | Phase |
|---|---|---|---|---|---|---|---|---|---|---|
| A | front-admin-intake | suggest front admin bay without closing spawn area | short admin counter/back divider only | 0-1 | 1 | 2-3 cells | 3 cells | must remain open toward central route | full room shell, east-side closed wall, wall on playerStart/objective | optional after C/F walls are stable |
| B | canteen | light boundary hint only | low divider or table boundary | 0 | 1 | 2 cells | 3 cells | east side toward central route must remain readable | full canteen room shell, blocking path to B marker | future optional |
| E | toilet | mark small restroom zone | marker only, no wall in MVP | 0 | 0 | none | none | keep visible and simple | any blocking wall in MVP | future |
| F | records-archive | create archive aisle / maze feeling | archive rack divider, short aisle wall | 2 | 3 | 3-5 cells | 6 cells | objective at `{ x: 7, y: 20 }` must remain reachable | full archive shell, wall covering objective, wall closing route access | Phase 1 priority |
| C | main-workstation-hall | create cubicle lane / workstation maze feeling | cubicle divider, workstation lane wall | 2 | 3 | 3-5 cells | 6 cells | objective at `{ x: 21.5, y: 5.5 }` must remain reachable | full workstation shell, wall blocking route from central route | Phase 1 priority |
| D | boardroom-review | suggest formal boardroom boundary | short low wall/divider, partial front boundary | 1 | 2 | 3-5 cells | 6 cells | objective at `{ x: 21.5, y: 12.5 }` must remain reachable | closed boardroom box, centered door system | Phase 2 optional |
| H | level2-access | create final approach lane | short access lane divider | 1 | 1 | 2-4 cells | 4 cells | objective at `{ x: 15.5, y: 20 }` must remain reachable | wall blocking final access point | Phase 1 or Phase 2 |
| G | secondary-workstation | light secondary work area structure | short workstation divider | 0-1 | 1 | 2-4 cells | 4 cells | do not block G area from lower route | full room shell | future optional |
| R | central-route | create slight route bend without blocking spine | short staggered baffle only | 0-1 | 2 | 2-3 cells | 3 cells | central route must remain passable top-to-bottom | any wall spanning full route width | only after C/F approved |

## 5. Phased Per-Room Wall Plan

Phase 0:
Current stable MVP.
Outer boundary only.
No internal walls.

Phase 1:
Add only priority maze walls:
- C workstation lane: max 2 wall segments
- F archive aisle: max 2 wall segments
- H final approach: max 1 wall segment

Maximum total Phase 1 walls: 5 segments.

Phase 1 must not include:
- A walls
- B walls
- E walls
- G walls
- full room shells
- doors
- central route full blockage

Phase 2:
Optional after successful testing:
- D boardroom partial boundary: max 1 segment
- R central route baffle: max 1 segment
- G small divider: max 1 segment

Phase 3:
Only after approval:
- A admin bay divider or counter-style wall
- B low divider

Phase 4:
Future:
- improved wall renderer / thin wall system
- proper room shells
- doors

## 6. Recommended Phase 1 Wall Segments

These are proposed only, not implemented until user approval.

C / Main Workstation Hall:

1. c-workstation-lane-wall-01
- Segment: x 17 to 22, y 4
- Length: 6 cells max
- Purpose: create upper workstation lane
- Must not block C objective at `{ x: 21.5, y: 5.5 }`

2. c-workstation-lane-wall-02
- Segment: x 24 to 28, y 7
- Length: 5 cells
- Purpose: create lower workstation lane
- Must leave approach from central route

F / Records Archive:

3. f-archive-aisle-wall-01
- Segment: x 4 to 9, y 18
- Length: 6 cells
- Purpose: archive aisle top rack
- Must not block F objective at `{ x: 7, y: 20 }`

4. f-archive-aisle-wall-02
- Segment: x 5 to 11, y 21
- Length: 7 cells
- Note: exceeds preferred 6-cell max, should be shortened to x 5 to 10 unless approved
- Purpose: archive aisle bottom rack
- Must leave route to objective

H / Level 2 Access:

5. h-final-approach-wall-01
- Segment: x 17, y 18 to 21
- Length: 4 cells
- Purpose: create final approach lane
- Must not block H objective at `{ x: 15.5, y: 20 }`

Before implementation, adjust any segment exceeding max length.

## 7. Access Rules

- A must remain open from player start.
- R central route must remain continuous.
- C objective must be reachable from R.
- D objective must be reachable from R.
- F objective must be reachable from R/lower route.
- H objective must be reachable after F.
- No wall may force moving objectives.
- No wall may require door logic.
- No wall may create a dead-end that traps the player.

## 8. Validation Before Implementation

Before coding wall changes:
- User must approve exact segment list.
- Segment count must be within phase limit.
- Segment length must be within max.
- Segment must not overlap objective.
- Segment must not overlap playerStart.
- Segment must not overlap labels if labels are physical.
- Route A -> C -> D -> F -> H must remain possible on paper.

After coding:
- npm run build must pass.
- Documents must reach 5/5.
- Reset must work.
- No undefined text.
- No accidental full room shell.
- No central route blockage.

## 9. Do Not Proceed Rule

If any wall requirement is unclear:
- do not implement walls
- update this document first
- request user approval

If any wall causes route failure:
- rollback the wall
- do not patch around it by moving objectives
- revise the wall plan instead
