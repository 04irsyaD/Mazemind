# Level 1 V2 Per-Room Wall Requirements Audit

## 1. Audit Summary

FAIL / MISMATCH FOUND

The per-room wall requirements mostly protect the stable MVP, but Phase 1 wall implementation is blocked as written. Two issues must be resolved before code implementation:

- `f-archive-aisle-wall-02` is 7 cells long, exceeding the Phase 1 max segment length of 6 cells.
- The per-room document uses `Phase 1` for C/F/H wall implementation, while the global wall requirements define `Phase 1` as floor zone preview only.

No gameplay code was changed during this audit.

## 2. Files Checked

- `frontend/src/maps/level1V2.js`
- `frontend/src/maps/requirements/level1V2-room-wall-requirements.md`
- `frontend/src/maps/requirements/level1V2-wall-requirements.md`
- `frontend/src/maps/requirements/level1V2-maze-lite-requirements.md`
- `frontend/src/maps/requirements/level1V2-implementation-rules.md`
- `frontend/src/maps/requirements/level1V2-objective-requirements.md`

## 3. Requirement Checklist

| Check | Status | Notes |
|---|---|---|
| Per-room wall file exists | PASS | `level1V2-room-wall-requirements.md` exists. |
| Preserves approved room bounds | PASS | Bounds match current `level1V2.js`. |
| Preserves objective positions | PASS | Objectives remain fixed in the plan. |
| Forbids full room shells | PASS | Full room shells are explicitly forbidden. |
| Forbids doors | PASS | Door-based systems are explicitly forbidden. |
| Keeps A start area safe | PASS | A walls are excluded from the first wall phase and must remain open. |
| Keeps central route passable | PASS | R route must remain continuous; no full-width route wall is allowed. |
| Phase 1 uses only C, F, and H | PASS | Proposed Phase 1 segments are only in C, F, and H. |
| Segment lengths within max limits | FAIL | `f-archive-aisle-wall-02` is 7 cells; Phase 1 max is 6 cells. |
| Any proposed segments too long | FAIL | `f-archive-aisle-wall-02` needs adjustment before implementation. |
| Any segments too close to objectives | PASS WITH NOTES | No segment directly overlaps objectives, but C wall 1 and F wall 2 are close enough to require manual route/play validation. |
| Plan requires moving objectives | PASS | The plan explicitly forbids moving objectives. |
| Allows route A -> C -> D -> F -> H | PASS WITH NOTES | Route intent is preserved on paper, but final passability must be tested after exact implementation. |
| Matches global wall requirements | FAIL | Phase numbering conflicts with global wall requirements. |

## 4. Phase 1 Segment Audit

| Segment | Proposed Location | Length | Limit | Objective Risk | Status |
|---|---|---:|---:|---|---|
| c-workstation-lane-wall-01 | x 17 to 22, y 4 | 6 | 6 | Near C objective at `{ x: 21.5, y: 5.5 }`, but not directly overlapping | PASS WITH NOTES |
| c-workstation-lane-wall-02 | x 24 to 28, y 7 | 5 | 6 | Does not overlap C objective; must leave central route approach open | PASS |
| f-archive-aisle-wall-01 | x 4 to 9, y 18 | 6 | 6 | Does not overlap F objective at `{ x: 7, y: 20 }` | PASS |
| f-archive-aisle-wall-02 | x 5 to 11, y 21 | 7 | 6 | Near F objective and exceeds max length | NEEDS ADJUSTMENT BEFORE IMPLEMENTATION |
| h-final-approach-wall-01 | x 17, y 18 to 21 | 4 | 4 | Does not overlap H objective at `{ x: 15.5, y: 20 }`; must not close access lane | PASS |

## 5. Current Code State

Current `level1V2.js` remains stable:

- Grid size is `32 x 24`.
- Only outer boundary cells are `CELL_WALL`.
- All interior cells remain `CELL_PATH`.
- `wallSegments` is empty.
- `doorways` is empty.
- `collisionVolumes` is empty.
- `mazeLiteDividers` and `mazeLiteObstacles` are empty.
- Objective route remains `A -> C -> D -> F -> H`.
- Document target remains `5`.

## 6. Objective Safety

Approved objective positions are unchanged:

- `shift-assignment-form`: `{ x: 5.5, y: 5.5 }`
- `workstation-log`: `{ x: 21.5, y: 5.5 }`
- `pending-ledger`: `{ x: 21.5, y: 12.5 }`
- `archive-record`: `{ x: 7, y: 20 }`
- `level2-access-note`: `{ x: 15.5, y: 20 }`

No proposed segment requires moving an objective. Any future implementation must preserve these positions.

## 7. Required Adjustments Before Implementation

Before wall implementation starts:

- Shorten `f-archive-aisle-wall-02` from `x 5 to 11` to a maximum 6-cell span, such as `x 5 to 10`, or get explicit approval for the 7-cell exception.
- Reconcile phase naming between `level1V2-wall-requirements.md` and `level1V2-room-wall-requirements.md`.
- User must approve the exact final segment list.

## 8. Recommendation

FAIL: requirements must be corrected first

Phase 1 wall implementation is blocked as written. It can become safe after the F segment length is adjusted and the phase mismatch with global wall requirements is resolved.
