# Level 1 V2 Implementation Rules

These rules exist to protect the approved Level 1 V2 MVP pattern.

## DO NOT

- Do not change approved floor zone bounds.
- Do not move objective positions.
- Do not add internal grid walls.
- Do not add room shell walls.
- Do not add doors.
- Do not use thin-wall rendering.
- Do not add online/GLB models.
- Do not add enemies/traps/crushers.
- Do not modify old level1.js.
- Do not change global CONSTANTS.
- Do not change player/camera/FOV.
- Do not make central route blocked.
- Do not add collision volumes unless explicitly approved.

## DO

- Keep all interior grid cells as `CELL_PATH`.
- Keep only outer boundary walls.
- Validate objective route `A -> C -> D -> F -> H`.
- Keep Documents target `5`.
- Keep room labels readable.
- Keep markers and objectives unobstructed.
- Use procedural lightweight objects.
- Run `npm run build`.
- Report changed files and validation result.

## Required Validation For Future Changes

- floor zone bounds unchanged
- objective route unchanged
- all interior cells `CELL_PATH`
- objective positions inside room bounds
- no undefined text
- no GLB/external asset references
- build passes

## Documentation-Only Change Rule

When a pass is explicitly documentation only:

- create or update Markdown requirement files only
- do not change gameplay code
- do not change `level1V2.js`
- do not change old `level1.js`
- do not modify runtime systems
- do not modify assets or generated build output
