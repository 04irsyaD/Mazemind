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
Office Maze Lite divider implementation is paused until requirements are approved.

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
