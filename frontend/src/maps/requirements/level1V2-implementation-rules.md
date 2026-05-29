# Level 1 V2 Implementation Rules

## DO NOT
- Do not change approved floor zone bounds.
- Do not move objective positions.
- Do not change objective order.
- Do not add internal grid walls.
- Do not add room shell walls.
- Do not add doors.
- Do not use thin-wall rendering.
- Do not add online models.
- Do not add GLB assets.
- Do not add enemies/traps/crushers.
- Do not modify old level1.js.
- Do not change global CONSTANTS.
- Do not change player/camera/FOV.
- Do not block central route.
- Do not add collision volumes unless explicitly approved.

## DO
- Keep all interior grid cells as CELL_PATH.
- Keep only outer boundary walls.
- Validate route A -> C -> D -> F -> H.
- Keep document target 5.
- Keep room labels readable.
- Keep markers and objectives unobstructed.
- Use procedural lightweight objects.
- Before any Level 1 V2 wall/divider/object change, run:
  `npm run validate:level1v2`
- If validation fails, do not proceed.
- Run npm run build.
- Report changed files and validation result.

## Required Validation
Before any Level 1 V2 wall/divider/object change:

```bash
npm run validate:level1v2
```

If validation fails:
Do not proceed.

Future changes must validate:
- floor zone bounds unchanged
- objective route unchanged
- all interior cells CELL_PATH unless approved otherwise
- objective positions inside room bounds
- no undefined text
- no GLB/external asset references
- build passes
