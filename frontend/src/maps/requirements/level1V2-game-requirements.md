# Level 1 V2 Game Requirements

## MVP Status
Level 1 V2 is currently a stable MVP office floorplan route with maze-lite intent.

It uses:
- approved floor zones
- room labels
- lightweight procedural markers
- objective route
- document collection flow

It intentionally does not use:
- internal grid walls
- final room shells
- doors
- online models
- GLB assets
- enemies
- traps
- crushers

## Route Flow

Current route:

A -> C -> D -> F -> H

Objective order:
1. Retrieve Shift Assignment Form.
2. Check workstation logs.
3. Review pending ledger.
4. Collect archive record.
5. Proceed to Level 2 access.

## Document Counter

Documents must progress:

0/5 -> 1/5 -> 2/5 -> 3/5 -> 4/5 -> 5/5

## Completion

Final completion text:

"Level 1 V2 route complete."

Optional secondary text:

"Level 2 access ready. MVP route complete."

Do not trigger broken Level 2 transition.

## Reset Behavior

Reset must:
- return Documents to 0/5
- restore active objective to A
- restore task text to "Retrieve Shift Assignment Form."
- clear completed objective state
- keep floor zones unchanged
- keep room markers unchanged

## Developer Panel

Developer panel should show:
- documents count
- objective index
- active objective id
- active room id
- flow complete/incomplete
- no undefined text
