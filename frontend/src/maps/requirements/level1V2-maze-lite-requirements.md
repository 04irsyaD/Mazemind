# Level 1 V2 Maze Lite Requirements

## Definition
Level 1 V2 should feel like an office maze, but not through unstable internal grid walls.

Maze feeling should come from:
- cubicle partitions
- archive rack lanes
- low office dividers
- route baffles
- workstation divider placement

## Current Status
Office Maze Lite Phase 1 is paused until user-approved screenshot/top-down placement exists.

Current Phase 1 divider rendering must remain disabled.

All current wall/divider placement preview markers and placement slots were rejected by user visual review. They must not render and must not be converted into objects, dividers, or walls.

Wall/divider placement preview mode is disabled:
- `mazeLitePlacementPreview: false`
- `mazeLitePhase1Enabled: false`
- `wallPlacementMode: disabled`

Rejected preview marker data may remain in requirements/code only if it is `enabled: false`, `rejected: true`, `approved: false`, and `status: rejected-by-user`.

The requested `f-archive-divider-02` placement is omitted because `{ x: 10, y: 20.5 }` overlaps the approved central route bounds.

The previous active placements are now disabled proposal records only:
- `c-workstation-divider-01`
- `c-workstation-divider-02`
- `f-archive-divider-01`

Future divider positions must be approved from visual screenshot/top-down review. Bounds validation alone is not enough.

Placement slot mode is disabled:
- `placementSlotMode: false`
- `placementSlotSource: approved-floor-zones`
- `placementSlotStatus: rejected-by-user`

Future objects, dividers, or walls must be planned from a manually approved top-down placement map. Do not generate slots from room bounds alone and do not place anything from raw coordinates without explicit approval.

## Allowed Maze Lite Elements
- cubiclePartition
- archiveRackDivider
- filingCabinetDivider
- workstationDivider
- lowOfficeDivider
- routeBaffle

## Quantity Limits
- Total divider target: 6-10
- Absolute maximum: 12
- A start area: 0 dividers
- B: max 1 low divider
- C: max 3 dividers
- D: max 1 divider
- E: 0 dividers
- F: max 3 archive dividers
- G: max 1 divider
- H: max 1 access divider
- R central route: max 2 route baffles, must not block route

## Collision Strategy
Phase 1:
- visual-only dividers

Phase 2:
- collision-enabled dividers only after route validation

Rules:
- no divider may block an objective
- no divider may cover labels
- no divider may block central route
- no divider may sit on playerStart
- no divider may be larger than a wall block
- no divider may require moving objective positions

## Approval Rule
If divider placement requirements are unclear, do not implement dividers.
Update requirements first.

## Placement Exclusion Rules
- Do not place dividers in previously problematic visual bug area.
- Do not place dividers near the front-left camera review area unless explicitly approved.
- Do not place dividers where they dominate the first-person view.
- Do not place dividers just because they are inside room bounds; visual approval is required.
- Phase 1 dividers are paused until user-approved screenshot/top-down positions are recorded in `level1V2-requirements.json`.

## Placement Preview Candidates
Current preview candidates are rejected and must not render:
- W1 `main-workstation-hall` at `{ x: 20.5, y: 4.5 }`
- W2 `main-workstation-hall` at `{ x: 24.5, y: 5.8 }`
- W3 `records-archive` at `{ x: 5.5, y: 19 }`
- W4 `records-archive` at `{ x: 8.5, y: 20.5 }`

## Placement Slots
Current placement slots are rejected and must not render:
- A1 `front-admin-intake` at `{ x: 5.5, y: 6.2 }`
- B1 `canteen` at `{ x: 5.5, y: 10.5 }`
- C1 `main-workstation-hall` at `{ x: 19.5, y: 5.0 }`
- C2 `main-workstation-hall` at `{ x: 25.5, y: 5.8 }`
- C-D1 `main-workstation-hall` at `{ x: 22.0, y: 7.0 }`
- D1 `boardroom-review` at `{ x: 21.5, y: 12.5 }`
- F1 `records-archive` at `{ x: 5.0, y: 19.0 }`
- F2 `records-archive` at `{ x: 8.0, y: 20.5 }`
- F-D1 `records-archive` at `{ x: 7.5, y: 18.2 }`
- G1 `secondary-workstation` at `{ x: 24.0, y: 20.0 }`
- H1 `level2-access` at `{ x: 15.5, y: 20.0 }`

No rejected slot or marker may be converted without explicit user approval.
