# Level 1 V2 Room Requirements

## Approved Room Requirements

| Code | Room ID | Room Function | Bounds | Allowed Asset | Ideal Count | Max Count | Placement Zone | Forbidden Object | Fallback Procedural |
|---|---|---|---|---|---|---|---|---|---|
| A | front-admin-intake | Front Admin / Employee Intake | `{ x1: 2, y1: 3, x2: 9, y2: 7 }` | intake desk, document marker, admin counter | 2 | 3 | Inside A bounds, away from label and objective marker | toilet, archive rack, meeting table, canteen table, online model, heavy GLB asset | simple desk block, counter block, document marker |
| B | canteen | Canteen | `{ x1: 2, y1: 8, x2: 9, y2: 12 }` | canteen table only | 1 | 2 | Inside B bounds, clear of labels and route edges | toilet, archive rack, meeting table, workstation cluster, online model, heavy GLB asset | simple lunch table block |
| E | toilet | Toilet | `{ x1: 2, y1: 13, x2: 6, y2: 15 }` | restroom marker only | 1 | 1 | Inside E bounds, readable as a marker only | archive rack, meeting table, canteen table, workstation cluster, online model, heavy GLB asset | small restroom sign or marker block |
| F | records-archive | Records Archive | `{ x1: 2, y1: 17, x2: 12, y2: 22 }` | archive racks/cabinets | 2 | 4 | Inside F bounds, never blocking archive objective | toilet, meeting table, canteen table, online model, heavy GLB asset | low archive rack blocks or cabinet blocks |
| C | main-workstation-hall | Main Workstation Hall | `{ x1: 14, y1: 3, x2: 29, y2: 8 }` | workstation clusters/cubicle dividers | 2 | 4 | Inside C bounds, leaving objective reachable | toilet, archive rack unless approved, meeting table, canteen table, online model, heavy GLB asset | low cubicle blocks and desk clusters |
| D | boardroom-review | Boardroom / Review Room | `{ x1: 14, y1: 10, x2: 29, y2: 15 }` | meeting table/formal review marker | 1 | 2 | Inside D bounds, centered or near review objective without blocking it | toilet, archive rack unless approved, canteen table, online model, heavy GLB asset | simple meeting table block and review marker |
| H | level2-access | Lift / Stairs to Level 2 | `{ x1: 14, y1: 17, x2: 17, y2: 22 }` | level access pad/lift marker | 1 | 1 | Inside H bounds, objective reachable from central route | toilet, archive rack unless approved, meeting table, canteen table, online model, heavy GLB asset | lift pad block or access marker |
| G | secondary-workstation | Secondary Workstation / Accounts Processing | `{ x1: 19, y1: 17, x2: 29, y2: 22 }` | small workstation cluster | 1 | 3 | Inside G bounds, away from labels and route movement | toilet, archive rack unless approved, meeting table, canteen table, online model, heavy GLB asset | compact desk cluster blocks |
| Central route | central-route | Main route spine | `{ x1: 10, y1: 3, x2: 13, y2: 22 }` | route baffle or low office divider only when explicitly approved | 0 | 2 | Must preserve route movement and objective access | normal room furniture, toilet, archive rack, meeting table, canteen table, online model, heavy GLB asset | low non-blocking visual baffle |

## Room Rules

- A allows intake desk, document marker, admin counter.
- B allows canteen table only.
- E allows restroom marker only.
- F allows archive racks/cabinets.
- C allows workstation clusters/cubicle dividers.
- D allows meeting table/formal review marker.
- H allows level access pad/lift marker.
- G allows small workstation cluster.
- Central route should not contain normal room furniture.

## Global Forbidden Objects

- no toilet in A/B/C/D/F/G/H
- no archive racks in A/B/C/D/H unless explicitly approved
- no meeting table outside D
- no canteen table outside B
- no online model without approval
- no heavy GLB asset in MVP
