# Level 1 V2 Maze Lite Implementation Plan

## 0. Current Guardrail Status

Level 1 V2 is currently in `mvp-guarded` mode.

Do not implement wall, divider, or object changes from this plan unless:

1. `frontend/src/maps/requirements/level1V2-requirements.json` allows the change.
2. The user explicitly approves the exact change.
3. `npm run validate:level1v2` passes before and after the change.

If validation fails, do not proceed.

Current runtime state:
- maze-lite Phase 1 visual dividers enabled only for approved JSON placements
- grid wall segments disabled
- collisionVolumes empty
- only outer boundary walls allowed

Conflict note:
- `f-archive-divider-02` at `{ x: 10, y: 20.5 }` is omitted because it overlaps the approved central route bounds.

## 1. Purpose

Level 1 V2 currently works as a floorplan route MVP.

The next phase should add maze feeling safely using office-style dividers, not internal grid walls.

The plan must preserve:
- floor zones
- objective route
- room labels
- document counter 0/5 to 5/5
- no internal wall bugs

## 2. Precondition Check

Before implementing any divider, confirm:

- requirements files exist
- requirements audit has no blocking mismatch
- floor zones are approved
- objective route works
- documents reach 5/5
- reset works
- no internal grid walls
- all interior cells remain CELL_PATH

If any item fails:
Do not implement maze-lite dividers.

## 3. Maze Lite Strategy

Maze Lite means office navigation shaped by:
- cubicle partitions
- archive rack lanes
- low office dividers
- route baffles

Do not use:
- full internal grid walls
- room shell walls
- doors
- thin-wall renderer
- GLB/online models

## 4. Phased Implementation Plan

### Phase 1 - Visual-only divider preview

- Add 4 to 6 visual-only dividers.
- No collision.
- No route blocking.
- Validate visual placement only.

### Phase 2 - Limited route shaping

- Increase to 6 to 8 dividers max.
- Still visual-only unless approved.
- Focus C and F first.

### Phase 3 - Optional collision test

- Enable collision on only 1 divider.
- Confirm route A -> C -> D -> F -> H still works.
- If collision causes problems, revert.

### Phase 4 - Approved blocking dividers

- Maximum 6 collision-enabled dividers.
- Only after testing.
- Never block central route or objective markers.

## 5. Room-by-Room Divider Plan

### A / front-admin-intake

- 0 maze dividers.
- Keep start area clear.

### B / canteen

- optional 1 low divider, visual-only.
- Not needed for MVP.

### E / toilet

- 0 dividers.
- Keep small room clear.

### F / records-archive

- 2 archive rack dividers.
- Visual-only first.
- Should suggest archive aisles.
- Must not block archive-record objective at `{ x: 7, y: 20 }`.

### C / main-workstation-hall

- 2 or 3 cubicle/workstation dividers.
- Visual-only first.
- Should suggest office lanes.
- Must not block workstation-log objective at `{ x: 21.5, y: 5.5 }`.

### D / boardroom-review

- 1 formal low divider or meeting boundary marker.
- Visual-only.
- Must not block pending-ledger objective.

### H / level2-access

- 1 final access divider, visual-only first.
- Must not block level2-access-note objective.

### G / secondary-workstation

- optional 1 workstation divider.
- Visual-only.

### R / central-route

- maximum 1 or 2 route baffles.
- Visual-only first.
- Must not block movement.
- Must not confuse player.

## 6. Proposed First Implementation Set

Propose only the first safe set.

Total 6 dividers max:

1. C cubicle divider 1
2. C cubicle divider 2
3. F archive rack divider 1
4. F archive rack divider 2
5. D low formal divider
6. H final access divider

All visual-only.
No collisionVolumes.
No blocking.

Approximate positions are proposal only.

### C divider 1

- roomId: main-workstation-hall
- position: `{ x: 18, y: 4.5 }`
- type: cubiclePartition
- collision: false

### C divider 2

- roomId: main-workstation-hall
- position: `{ x: 25, y: 6.5 }`
- type: cubiclePartition
- collision: false

### F divider 1

- roomId: records-archive
- position: `{ x: 5, y: 18.5 }`
- type: archiveRackDivider
- collision: false

### F divider 2

- roomId: records-archive
- position: `{ x: 10, y: 20.5 }`
- type: archiveRackDivider
- collision: false

### D divider

- roomId: boardroom-review
- position: `{ x: 18, y: 12 }`
- type: lowOfficeDivider
- collision: false

### H divider

- roomId: level2-access
- position: `{ x: 16, y: 18.5 }`
- type: levelAccessDivider
- collision: false

## 7. Forbidden Placements

- Do not place divider on playerStart.
- Do not place divider on objective positions.
- Do not place divider on central route choke points.
- Do not place divider over room labels.
- Do not place divider outside room bounds.
- Do not place divider touching outer boundary wall.
- Do not place divider in A start area.
- Do not place divider in E toilet.
- Do not place divider that requires moving objective markers.

## 8. Validation Required Before Code

Before implementation, user must approve:
- divider count
- divider rooms
- divider positions
- collision false
- no floor zone movement
- no objective movement

Validation after implementation must check:
- all objectives reachable
- Documents still reach 5/5
- reset works
- no undefined text
- no internal grid walls
- all interior cells CELL_PATH
- no GLB/online models
- build passes

## 9. Recommendation

Implement Phase 1 only after user approval.

Phase 1 should add visual-only dividers with no collision.

Do not implement collision until after visual placement is approved.
