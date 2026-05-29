# Level 1 V2 SVG Pattern Conversion Plan

## 1. Purpose
This document records how `final.svg` should be treated as the approved visual pattern reference for Level 1 V2. The SVG is a planning artifact for access gaps, object candidates, wall/divider line candidates, and objective route intent.

It is not a runtime map file. No SVG element may be directly converted into gameplay walls, collision, doors, room shells, or blocking objects.

Direct implementation from the SVG is forbidden.

## 2. SVG Source File
- Source file: `final.svg`
- Repository source file: `final.svg` at the project root
- Local reference supplied by user: `C:\Users\ROG\Downloads\final.svg`
- Machine-readable extraction: `level1V2-svg-pattern.json`
- Current status: pattern reference only
- Direct implementation allowed: no
- User approval required before conversion: yes

## 3. Room Mapping
The SVG room labels map to the existing Level 1 V2 room IDs. Do not rename runtime rooms.

| SVG code | SVG label | Existing room ID |
|---|---|---|
| A | Front Admin | `front-admin-intake` |
| B | Canteen | `canteen` |
| E | Toilet | `toilet` |
| F | Records Archive | `records-archive` |
| R | Central Route | `central-route` |
| C | Workstation Hall | `main-workstation-hall` |
| D | Boardroom | `boardroom-review` |
| H | Level 2 Access | `level2-access` |
| G | Secondary Office | `secondary-workstation` |

Important: if the SVG uses `secondary-office`, map it to `secondary-workstation`. Do not introduce a runtime room ID named `secondary-office`.

## 4. Access Mapping
Access entries from the SVG are metadata-only. They document visual gaps and route intent, not gameplay doors.

| ID | From | To | Access type | Implementation status | Notes |
|---|---|---|---|---|---|
| `A_TO_B` | `front-admin-intake` | `canteen` | `visual-access-gap` | `metadata-only` | SVG door-gap label A->B on A/B shared boundary. |
| `A_TO_R` | `front-admin-intake` | `central-route` | `open-route-access` | `metadata-only` | SVG door-gap label A->R on A east edge. |
| `B_TO_E` | `canteen` | `toilet` | `visual-access-gap` | `metadata-only` | SVG label B->E/F. Metadata maps the room side to `toilet`; lower-left route/F approach remains a note only. |
| `E_TO_R` | `toilet` | `central-route` | `visual-access-gap` | `metadata-only` | SVG door-gap label E->R. |
| `F_TO_R` | `records-archive` | `central-route` | `visual-access-gap` | `metadata-only` | SVG door-gap label F->R. |
| `R_TO_C` | `central-route` | `main-workstation-hall` | `open-route-access` | `metadata-only` | SVG door-gap label R->C. |
| `R_TO_D` | `central-route` | `boardroom-review` | `open-route-access` | `metadata-only` | SVG door-gap label R->D. |
| `D_TO_H` | `boardroom-review` | `level2-access` | `progression-access` | `metadata-only` | SVG door-gap label D->H. |
| `H_TO_EXIT` | `level2-access` | `exit / future level 2` | `final-exit-access` | `metadata-only` | SVG door-gap label H->EXIT plus bottom exit marker. |

Do not implement actual doors, blocking door objects, or door collision from these entries.

## 5. Object Placement Mapping
Object placement candidates are metadata-only. They may inform a later approved pass, but they are not converted in this phase.

| ID | Room ID | Object type | Role | Implementation status | Collision | Notes |
|---|---|---|---|---|---|---|
| `A01` | `front-admin-intake` | `intake-counter` | admin/intake object | `already-mvp-or-candidate` | false | Existing MVP object remains independent of SVG conversion approval. |
| `B01` | `canteen` | `canteen-table` | canteen identity object | `candidate` | false | Candidate only. |
| `E01` | `toilet` | `restroom-marker` | room identity marker | `candidate` | false | Candidate only. |
| `C01` | `main-workstation-hall` | `workstation-cluster` | workstation object | `candidate` | false | Candidate only. |
| `C02` | `main-workstation-hall` | `workstation-cluster` | workstation object | `candidate` | false | Candidate only. |
| `C03` | `main-workstation-hall` | `workstation-cluster` | workstation object | `candidate` | false | Additional SVG workstation label, metadata only. |
| `C04` | `main-workstation-hall` | `workstation-cluster` | workstation object | `candidate` | false | Additional SVG workstation label, metadata only. |
| `D01` | `boardroom-review` | `meeting-table` | boardroom identity object | `candidate` | false | Shape: ellipse. Collision remains false for MVP. |
| `F01` | `records-archive` | `archive-rack` | archive identity object | `candidate` | false | Collision remains false for MVP. |
| `F02` | `records-archive` | `archive-rack` | archive identity object | `candidate` | false | Collision remains false for MVP. |
| `H01` | `level2-access` | `level-access-pad` | final access object | `candidate` | false | Candidate only. |
| `G01` | `secondary-workstation` | `workstation-cluster` | secondary workstation object | `candidate` | false | SVG label maps from Secondary Office to existing `secondary-workstation`. |
| `G02` | `secondary-workstation` | `workstation-cluster` | secondary workstation object | `candidate` | false | SVG label maps from Secondary Office to existing `secondary-workstation`. |

Do not add these objects to gameplay yet. Do not add collision or blocking behavior.

## 6. Wall/Divider Line Mapping
Wall/divider entries are line-based candidates only. They are not structural walls, room shells, or collision geometry.

| ID | Room ID | Wall type | Start | End | Orientation | Thickness | Height | Solid | Collision | Blocking | Implementation status | Approval required | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `A-BAY-WEST` | `front-admin-intake` | `low_office_divider / semi-open-bay-hint` | `{ x: 96, y: 118 }` | `{ x: 96, y: 228 }` | vertical | 5 SVG px | 0 | false | false | false | `line-preview-only` | true | Visual bay hint only. |
| `A-BAY-NORTH` | `front-admin-intake` | `low_office_divider / semi-open-bay-hint` | `{ x: 96, y: 118 }` | `{ x: 272, y: 118 }` | horizontal | 5 SVG px | 0 | false | false | false | `line-preview-only` | true | Visual bay hint only. |
| `A-BAY-SOUTH` | `front-admin-intake` | `low_office_divider / semi-open-bay-hint` | `{ x: 96, y: 228 }` | `{ x: 272, y: 228 }` | horizontal | 5 SVG px | 0 | false | false | false | `line-preview-only` | true | Source SVG has this as two dashed segments split around the A->B access gap. |
| `C-DIV-01` | `main-workstation-hall` | `cubicle_partition` | `{ x: 448, y: 202 }` | `{ x: 580, y: 202 }` | horizontal | 5 SVG px | 0 | false | false | false | `line-preview-only` | true | Workstation row divider candidate. |
| `F-RACK-01` | `records-archive` | `archive_rack_divider` | `{ x: 151, y: 457 }` | `{ x: 272, y: 457 }` | horizontal | 5 SVG px | 0 | false | false | false | `line-preview-only` | true | Archive rack alignment candidate. |
| `F-RACK-02` | `records-archive` | `archive_rack_divider` | `{ x: 151, y: 518 }` | `{ x: 272, y: 518 }` | horizontal | 5 SVG px | 0 | false | false | false | `line-preview-only` | true | Archive rack alignment candidate. |
| `D-HINT-01` | `boardroom-review` | `low_office_divider` | `{ x: 448, y: 367 }` | `{ x: 624, y: 367 }` | horizontal | 5 SVG px | 0 | false | false | false | `line-preview-only` | true | Boardroom hint divider only. |
| `H-BAY-01` | `level2-access` | `low_office_divider / access-bay-hint` | `{ x: 364, y: 448 }` | `{ x: 364, y: 536 }` | vertical | 5 SVG px | 0 | false | false | false | `line-preview-only` | true | Access bay hint only. |

Do not render these as real wall meshes yet. Do not use `wallSegments` for them. Do not make them solid.

## 7. Conversion Phases
Phase 0: Current MVP remains unchanged. Floor zones, labels, objective route, documents counter, reset behavior, `wallSegments`, and `collisionVolumes` stay guarded.

Phase 1: Store the SVG extraction in `level1V2-svg-pattern.json` and this conversion plan only.

Phase 2: If explicitly approved, create non-gameplay preview rendering that cannot block the route and does not use `wallSegments` or collision.

Phase 3: If explicitly approved after visual review, convert selected object candidates one at a time as visual-only procedural props.

Phase 4: If explicitly approved after route testing, convert selected divider candidates one at a time as non-colliding visual dividers.

Phase 5: Only after a separate approval, evaluate collision or structural wall behavior. This is future work and is forbidden in the current pass.

## 8. Forbidden Conversions
- Do not directly convert SVG lines into `wallSegments`.
- Do not convert SVG outer walls into structural walls.
- Do not generate room shell walls from room rectangles.
- Do not create gameplay doors from door-gap labels.
- Do not add door collision.
- Do not add `collisionVolumes`.
- Do not add blocking objects.
- Do not move floor zones.
- Do not move room labels.
- Do not move objective positions.
- Do not change objective order.
- Do not rename current Level 1 V2 rooms.
- Do not introduce `secondary-office` as a runtime room ID.
- Do not use GLB files, online models, or downloaded assets.
- Do not modify old `level1.js`.

## 9. Validation Rules
Validation must confirm:
- `level1V2-svg-pattern.json` exists.
- `directImplementationAllowed` is false.
- Every wall line candidate has `approved: false`.
- Every wall line candidate has `collision: false`.
- Every wall line candidate has `blocking: false`.
- Every wall line candidate has `solid: false`.
- Every wall line candidate uses an existing room ID.
- No candidate uses `secondary-office` as a runtime room ID.
- No SVG candidate is converted into `wallSegments`.
- No structural walls are added.
- No `collisionVolumes` are added.
- Objective positions remain unchanged.
- Floor zone bounds remain unchanged.
- Objective route remains A -> C -> D -> F -> H.

## 10. Implementation Recommendation
Keep this pass documentation-only plus machine-readable metadata. Do not modify `level1V2.js` unless a later validator-approved preview mode is created.

The next safe step, after explicit user approval, would be a separate visual preview layer that reads selected entries from `level1V2-svg-pattern.json` without creating walls, collision, doors, or blocking props.
