# Level 1 V2 Room Requirements

## Room-Specific Requirements

## Placement Slot Source of Truth

Level 1 V2 object/divider placement must use approved colored floor zones as the source of truth.

Current slot mode:
- `placementSlotMode: true`
- `placementSlotSource: approved-floor-zones`
- `placementSlotStatus: preview-only`

New objects and dividers must reference an approved placement slot before becoming real rendered assets. Raw coordinate placement is not allowed unless explicitly approved.

| Code | Room ID | Room Function | Bounds | Allowed Asset | Ideal Count | Max Count | Placement Zone | Forbidden Object | Fallback Procedural |
|---|---|---|---|---|---|---|---|---|---|
| A | front-admin-intake | Front Admin / Employee Intake | `{ x1: 2, y1: 3, x2: 9, y2: 7 }` | intake counter, document marker, small terminal | 1-2 | 3 | Inside A bounds, clear of player start, room label, and objective marker | archive rack, toilet object, meeting table, large divider | simple admin counter block |
| B | canteen | Canteen | `{ x1: 2, y1: 8, x2: 9, y2: 12 }` | canteen table, small break table | 1 | 2 | Inside B bounds, clear of room label and route edge | toilet, archive rack, meeting table | simple table block |
| E | toilet | Toilet | `{ x1: 2, y1: 13, x2: 6, y2: 15 }` | restroom marker only | 1 | 1 | Inside E bounds, marker-only placement | workstation, archive rack, meeting table | restroom sign/marker block |
| F | records-archive | Records Archive | `{ x1: 2, y1: 17, x2: 12, y2: 22 }` | archive rack, filing cabinet, archive marker | 2-3 | 4 | Inside F bounds, keeping archive objective reachable | toilet, canteen table, meeting table | shelf/rack block |
| C | main-workstation-hall | Main Workstation Hall | `{ x1: 14, y1: 3, x2: 29, y2: 8 }` | workstation cluster, monitor block, cubicle divider | 2-4 | 5 | Inside C bounds, keeping workstation objective reachable | toilet, archive rack overload, canteen table | simple desk/monitor blocks |
| D | boardroom-review | Boardroom / Review Room | `{ x1: 14, y1: 10, x2: 29, y2: 15 }` | meeting table, review marker | 1-2 | 3 | Inside D bounds, clear of boardroom objective | toilet, archive rack, canteen table | long table block |
| H | level2-access | Lift / Stairs to Level 2 | `{ x1: 14, y1: 17, x2: 17, y2: 22 }` | level access pad, lift marker, stairs marker | 1 | 2 | Inside H bounds, clear of level access objective | workstation cluster, canteen table, archive rack overload | glowing access pad block |
| G | secondary-workstation | Secondary Workstation / Accounts Processing | `{ x1: 19, y1: 17, x2: 29, y2: 22 }` | small workstation cluster, account desk | 1-2 | 3 | Inside G bounds, clear of room label | toilet, canteen table, meeting table | simple workstation block |
| R | central-route | Main route spine | `{ x1: 10, y1: 3, x2: 13, y2: 22 }` | subtle route marker only | 0 | 2 route baffles only after approval | Inside R bounds only if approved, never blocking route | normal room furniture, blocking obstacle | floor color only |

## Preview Placement Slots

The current slots are floor markers only and are pending visual approval:
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
