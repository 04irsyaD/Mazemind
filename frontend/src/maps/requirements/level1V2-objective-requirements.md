# Level 1 V2 Objective Requirements

## Objective Route

| Order | Objective ID | Room | Position | Task Text | Prompt Text | Completion Text |
|---|---|---|---|---|---|---|
| 1 | shift-assignment-form | front-admin-intake | `{ x: 5.5, y: 5.5 }` | Retrieve Shift Assignment Form. | Press E to retrieve Shift Assignment Form | Shift Assignment Form collected. |
| 2 | workstation-log | main-workstation-hall | `{ x: 21.5, y: 5.5 }` | Check workstation logs. | Press E to check workstation logs | Workstation Log checked. |
| 3 | pending-ledger | boardroom-review | `{ x: 21.5, y: 12.5 }` | Review pending ledger. | Press E to review pending ledger | Pending Ledger reviewed. |
| 4 | archive-record | records-archive | `{ x: 7, y: 20 }` | Collect archive record. | Press E to collect archive record | Archive Record collected. |
| 5 | level2-access-note | level2-access | `{ x: 15.5, y: 20 }` | Proceed to Level 2 access. | Press E to proceed to Level 2 access | Level 2 access confirmed. |

## Final

Task Text: Level 1 V2 route complete.

Optional Secondary Text: Level 2 access ready. MVP route complete.

## Rules
- objective order must not change without approval
- document target must remain 5
- objective positions must stay inside room bounds
- objectives must remain reachable
- reset must restore objective 1
