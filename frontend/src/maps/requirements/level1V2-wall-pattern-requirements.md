# Level 1 V2 Wall Pattern Requirements

## Current Source Reference
`final.svg` is now the visual source reference for the Level 1 V2 wall/object/access pattern.

The SVG captures approved visual intent for:
- room layout
- floor zones
- wall/divider line candidates
- object placement candidates
- access route
- door/gap directions
- objective route

## Required Conversion Path
All future conversion work must pass through:
- `level1V2-svg-pattern-conversion-plan.md`
- `level1V2-svg-pattern.json`

Direct implementation from the SVG is forbidden.

## Current Implementation Status
- The current MVP remains boundary-only.
- `wallSegments` must remain empty.
- `collisionVolumes` must remain empty.
- All interior cells must remain `CELL_PATH`.
- Floor zones must not move.
- Room labels must not move.
- Objective positions and objective order must not change.

## Candidate Rules
- Access candidates are metadata-only.
- Object candidates are metadata-only.
- Wall/divider candidates are line-preview-only.
- Every wall/divider candidate must have `approved: false` until a future explicit approval.
- Every wall/divider candidate must have `collision: false`.
- Every wall/divider candidate must have `blocking: false`.
- Every wall/divider candidate must have `solid: false`.
- No candidate may use `secondary-office` as a runtime room ID.
- SVG `secondary-office` must map to existing room ID `secondary-workstation`.

## Forbidden Conversions
- Do not add internal grid walls.
- Do not add structural walls.
- Do not add room shell walls.
- Do not add gameplay doors.
- Do not add door collision.
- Do not add `collisionVolumes`.
- Do not add blocking objects.
- Do not use `wallSegments` for SVG divider candidates.
- Do not convert SVG object candidates into runtime objects without explicit user approval.
- Do not use GLB files, online models, or downloaded assets.
- Do not modify old `level1.js`.

## Validation
`npm run validate:level1v2` must fail if:
- `level1V2-svg-pattern.json` is missing.
- direct SVG implementation is allowed.
- a wall/divider candidate is approved by default.
- a wall/divider candidate has collision or blocking enabled.
- a wall/divider candidate uses an unknown room ID.
- any candidate uses `secondary-office` as a runtime room ID.
- a wall/divider candidate is converted into `wallSegments`.
- structural walls or collision volumes are added.

The validator must not weaken the existing MVP guardrails.
