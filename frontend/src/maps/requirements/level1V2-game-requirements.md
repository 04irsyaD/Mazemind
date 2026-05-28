# Level 1 V2 Game Requirements

## MVP Purpose

Level 1 V2 is currently an MVP floorplan-office route, not a final full-wall maze.

The purpose of this MVP is to preserve a stable, playable office route while future art, asset, and level-system work is planned separately.

## Map Mode

- Level 1 V2 uses an Office Maze Lite floorplan mode.
- Floor zones define room identity and readable layout.
- Visual separators may be used to communicate office structure.
- Internal room walls are intentionally disabled for the MVP.
- Only outer boundary walls should define the playable perimeter.

## Player Start

- The player starts in the Front Admin / Employee Intake area.
- The initial active objective must be objective A.
- The initial task text must be `Retrieve Shift Assignment Form.`

## Document Counter Behavior

- The document counter must display progress from `0/5` to `5/5`.
- Each completed objective increments the counter by one.
- The target must remain `5`.
- The counter must never show undefined, NaN, or a value above `5/5`.

## Objective Route

The current route is:

`A -> C -> D -> F -> H`

The route must remain stable unless explicitly approved by the user.

## Completion Behavior

After objective 5 is completed:

- Documents must show `5/5`.
- The final task text must be:

`Level 1 V2 route complete.`

- Optional secondary completion text may communicate that Level 2 access is ready.
- Completion must not automatically transition to Level 2 during the MVP.

## Reset Behavior

Reset must:

- return Documents to `0/5`
- return active objective to A
- return task text to `Retrieve Shift Assignment Form.`
- clear completed objective state
- keep floor zones and markers unchanged

## Developer Panel Requirements

- The developer panel must not mutate approved floor zone bounds by default.
- The developer panel must not move markers or objectives without explicit user approval.
- Any debug display should preserve readable room labels.
- Any reset action exposed through the panel must follow the reset behavior above.
- Debug helpers must not create internal walls, blockers, traps, or additional objectives in Level 1 V2.

## Known Intentional Limitations

- internal room walls are disabled
- room shells are not final
- assets are procedural placeholders
- online/GLB models are not used
- Level 2 transition is not implemented yet
