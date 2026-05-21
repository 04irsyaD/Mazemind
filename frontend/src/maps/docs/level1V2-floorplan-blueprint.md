# Level 1 V2 Floorplan Blueprint

## 1. Reference Image Analysis

The sketch reads as a compact portrait office floorplan. The top edge is treated as the front or north side of the map, while the bottom edge is treated as the rear or south side. The left side holds the public/support rooms stacked vertically, and the right side holds the larger work/review/progression rooms.

Room placement from the reference:

- A is in the upper-left and should feel like the front admin / employee intake area.
- B is below A on the left side and is interpreted as the canteen.
- E is a smaller left-side room below B and should function as the toilet.
- F occupies the lower-left area and is interpreted as the records archive.
- C is in the upper-right and should become the main workstation hall.
- D is in the center-right and should become the boardroom / review room.
- H is near the lower-center/right edge and should become the lift / stairs access to Level 2.
- G is in the lower-right and should become the secondary workstation / accounts processing area.

The central route appears as a vertical route spine running between the left and right room blocks. It connects the front area down through the center of the plan, with left-side access into A, B, E, and F, and right-side access into C, D, H, and G. It should not feel like a long, oversized hallway; it should stay compact and office-horror friendly.

Direct central-route connections:

- A connects from the west/left block into the central route.
- B connects from the west/left block into the central route.
- E appears controlled and should connect narrowly from the left side.
- F should connect from the lower-left archive area into the route.
- C connects from the upper-right side with a wider workstation threshold.
- D connects from the center-right side with a more formal boardroom threshold.
- H connects near the lower route and should read as a clear progression point.
- G should connect from H or the lower route rather than copying C's access style.

Open, semi-open, and controlled-access interpretation:

- A should be semi-open, like a front-admin intake bay rather than a sealed office.
- B can be semi-open with a casual side opening toward the route.
- C should be broader and more open than D, but still bounded enough to support tension.
- D should feel more controlled and formal than C.
- E should be small and controlled with narrow access.
- F should be controlled, not wide open.
- H should be isolated and readable as progression access.
- G should be accessible, but less prominent than C.

Room A should be built first during a later wall-shell pass because it anchors the front-admin feel and will reveal whether the route width and semi-open access style work before the rest of the shell is added.

Ambiguities needing user review:

- The exact front entrance location is not explicit in the sketch.
- The central route width may need adjustment after top-down preview.
- The H and G relationship is unclear; G may connect from H, the lower route, or both.
- D's intended doorway looks centered, but its exact opening width is unclear.
- A may be fully open in the sketch, but this blueprint treats it as semi-open unless user review says otherwise.
- Thick grid-cell walls may make the final implementation feel tighter than this sketch.

## 2. Proposed Grid

Planning grid:

- `GRID_WIDTH = 32`
- `GRID_HEIGHT = 24`

This grid is for planning only. Existing `CELL_SIZE` remains unchanged, and no runtime map code should be edited from this document alone.

The proposed layout intentionally stays compact so the Level 1 V2 shell can feel like an office-horror map instead of a large open office. The markdown blueprint must be reviewed before implementation in `level1V2.js`.

## 3. Proposed Room Bounds

These bounds are proposed planning bounds only. Do not implement them in code until the blueprint is approved.

| Code | Room ID | Function | Bounds | Access Style | Notes |
|---|---|---|---|---|---|
| A | front-admin-intake | Front Admin / Employee Intake | x1 2, y1 3, x2 9, y2 7 | semi-open admin bay / open side toward central route | Upper-left front-facing intake area; should not become a tiny closed room. |
| B | canteen | Canteen | x1 2, y1 8, x2 9, y2 12 | side opening toward central route | Casual support room below A. |
| E | toilet | Toilet | x1 2, y1 13, x2 6, y2 15 | narrow controlled access | Small controlled room below B. |
| F | records-archive | Records Archive | x1 2, y1 17, x2 12, y2 22 | controlled archive access | Lower-left archive zone; future rows can be planned later. |
| R | central-route | Main Vertical Route Spine | x1 10, y1 3, x2 13, y2 22 | main vertical route spine | Compact connector route between left and right room blocks. |
| C | main-workstation-hall | Main Workstation Hall | x1 14, y1 3, x2 29, y2 8 | wider workstation threshold | Upper-right primary work area. |
| D | boardroom-review | Boardroom / Review Room | x1 14, y1 10, x2 29, y2 15 | formal centered access | Center-right formal review room. |
| H | level2-access | Lift / Stairs to Level 2 | x1 14, y1 17, x2 17, y2 22 | progression access | Bottom-center/right access point to the next level. |
| G | secondary-workstation | Secondary Workstation / Accounts Processing | x1 19, y1 17, x2 29, y2 22 | rear/side access from H or lower route | Bottom-right secondary work area. |

## 4. ASCII Floorplan Preview

Legend:

- `#` = outer boundary wall
- `.` = empty/path
- `A` = Front Admin
- `B` = Canteen
- `C` = Main Workstation
- `D` = Boardroom
- `E` = Toilet
- `F` = Archive
- `G` = Secondary Workstation
- `H` = Lift/Stairs
- `R` = central route

```text
################################
#..............................#
#..............................#
#.AAAAAAAA.RRRR.CCCCCCCCCCCC...#
#.AAAAAAAA.RRRR.CCCCCCCCCCCC...#
#.AAAAAAAA.RRRR.CCCCCCCCCCCC...#
#.AAAAAAAA.RRRR.CCCCCCCCCCCC...#
#.AAAAAAAA.RRRR.CCCCCCCCCCCC...#
#.BBBBBBBB.RRRR.CCCCCCCCCCCC...#
#.BBBBBBBB.RRRR................#
#.BBBBBBBB.RRRR.DDDDDDDDDDDD...#
#.BBBBBBBB.RRRR.DDDDDDDDDDDD...#
#.BBBBBBBB.RRRR.DDDDDDDDDDDD...#
#.EEEEE....RRRR.DDDDDDDDDDDD...#
#.EEEEE....RRRR.DDDDDDDDDDDD...#
#.EEEEE....RRRR.DDDDDDDDDDDD...#
#..........RRRR................#
#.FFFFFFFFFFFRRRR.HHHH.GGGGGGGG#
#.FFFFFFFFFFFRRRR.HHHH.GGGGGGGG#
#.FFFFFFFFFFFRRRR.HHHH.GGGGGGGG#
#.FFFFFFFFFFFRRRR.HHHH.GGGGGGGG#
#.FFFFFFFFFFFRRRR.HHHH.GGGGGGGG#
#.FFFFFFFFFFFRRRR.HHHH.GGGGGGGG#
################################
```

## 5. Access Plan

A:

- Access from east side into central route.
- Should not be a tiny doorway.
- Should feel like a front-admin bay.
- Recommended wall style later: north/south/west walls, partial east return wall only if needed.

B:

- Access from east side toward route.
- Canteen can have a wider casual opening.
- Not as formal as D.
- Recommended wall style later: bounded north/south/west sides with a practical east-side opening.

E:

- Narrow access.
- Should not be wide.
- Toilet should feel smaller and more controlled.
- Recommended wall style later: compact shell with a single controlled opening toward the route.

F:

- Controlled archive access.
- Not wide open.
- Future archive rows inside later.
- Recommended wall style later: lower-left shell with a controlled route-facing entrance.

C:

- Wider threshold from central route.
- Large workstation area but not too open.
- Should read as the main work hall from the front half of the map.
- Recommended wall style later: broad room boundary with a route-facing threshold rather than a tiny door.

D:

- Formal boardroom access.
- More centered and controlled than C.
- Should feel like a review room rather than another open workstation.
- Recommended wall style later: centered route-facing opening with a stronger room shell.

H:

- Progression access to Level 2.
- Should be clear and isolated.
- Should not be visually confused with G.
- Recommended wall style later: compact progression bay connected to the lower route.

G:

- Secondary workstation access.
- Prefer access from H or lower route, not identical to C.
- Should feel like a rear/side accounts processing area.
- Recommended wall style later: bounded room with a lower-route or H-adjacent opening.

## 6. Wall Building Strategy

Because the current engine uses thick grid-cell walls, do not build all internal walls immediately.

Recommended phased implementation:

- Phase 0: Empty field baseline with outer boundary only.
- Phase 1: Floor zone preview only for A-H. No internal walls.
- Phase 2: Add only central route boundary markers or a simple separator test. Validate from ASCII/top-down.
- Phase 3: Add A wall shell only. A should be semi-open, not a closed box.
- Phase 4: Add B wall shell. Validate A + B.
- Phase 5: Add E and F. Validate the left side.
- Phase 6: Add C and D. Validate the right side.
- Phase 7: Add H and G. Validate bottom-right progression.
- Phase 8: Only after walls are stable, add object placement.

Do not add furniture until the map shell is approved. Do not add models, objects, objectives, or SOP placement during the wall-shell approval phase.

## 7. Risks and Uncertainty

- Thick wall-cell rendering may make openings look larger or smaller than expected.
- First-person view can make correct top-down placement feel wrong.
- ASCII/top-down validation is needed before 3D wall implementation.
- Room A should not be judged only from first-person because the intake-bay feel depends on route context.
- Door and access style must be reviewed room by room.
- The central route may need adjustment if it feels too corridor-like or too wide in-game.
- H and G may need a user decision once the floor zones are visible.

## 8. Implementation TODO After User Approval

- [ ] User approves A-H floor zone placement.
- [ ] Implement floor zones only in level1V2.js.
- [ ] Validate ASCII map in console.
- [ ] User reviews floor zone placement in game.
- [ ] Add one wall test.
- [ ] Add A shell only.
- [ ] Add B shell only.
- [ ] Continue room-by-room.
- [ ] Add SOP object placement only after walls are approved.
