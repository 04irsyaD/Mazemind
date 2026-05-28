# Level 1 V2 Maze Lite Requirements

## Current MVP Status

- Office Maze Lite divider objects are disabled until formal room/asset requirements are approved.
- The stable MVP should remain floor zones, room labels, MVP procedural markers, and objectives only.
- No divider clutter should be added during the MVP freeze state.
- `collisionVolumes` must remain empty while Maze Lite dividers are disabled.

## Maze Lite Purpose

Office Maze Lite is a future route-shaping layer for Level 1 V2.

Its purpose is to make the floorplan feel more maze-like without returning to unstable internal grid walls.

## Allowed Future Divider Categories

Future approved divider categories may include:

- cubicle partition
- low office divider
- route baffle
- workstation divider
- archive rack divider
- filing cabinet divider

## Current Forbidden Changes

- Do not add Maze Lite dividers during the MVP freeze.
- Do not add collision-enabled dividers without approved placement requirements.
- Do not add divider collision volumes while dividers are disabled.
- Do not add full internal grid walls.
- Do not add room shell walls.
- Do not add doors.
- Do not add online or GLB models.
- Do not move objectives to fit dividers.
- Do not block room labels, objective markers, or the central route.

## Future Placement Requirements

Before any Maze Lite divider is implemented, it must have:

- approved room ID
- approved position
- approved size
- approved rotation
- clear maze role
- collision decision
- route reachability validation
- note explaining why it improves navigation

## Future Validation Rules

Any future Maze Lite pass must validate:

- floor zone bounds unchanged
- room labels readable
- objective order unchanged
- objective positions unchanged
- route `A -> C -> D -> F -> H` playable
- Documents can reach `5/5`
- reset restores `0/5` and the first objective
- no objective sits inside a collision volume
- player start does not sit inside a collision volume
- central route remains passable
- no GLB or online model references
- build passes

## Do Not Proceed Rule

If room, asset, or divider placement requirements are missing, do not implement Maze Lite objects.

Create or update requirements first.
