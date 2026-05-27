# Level 1 V2 MVP Status

## MVP Status

Level 1 V2 MVP is frozen as the current stable baseline.

This document captures the approved state for the Level 1 V2 MVP and should be used as the regression reference before any future map, gameplay, or art pass.

No gameplay, layout, marker, objective, wall, door, room-shell, enemy, trap, crusher, online-model, or GLB asset changes are included in this freeze pass.

## Approved Features

- Floor zone layout is approved.
- A-H room placement is approved.
- Room labels are readable.
- MVP procedural objects are visible.
- Objective route works.
- Documents counter works from `0/5` to `5/5`.
- Completion text works.
- No internal wall bugs are currently observed.
- No crashes are currently observed.

Current map note: Level 1 V2 uses floor zones, labels, lightweight procedural markers, and the objective route.

## Intentional Limitations

- Internal walls are intentionally disabled for MVP stability.
- The map does not include room shells.
- The map does not include doors.
- The map does not include enemies, traps, crushers, or combat pressure.
- The map does not include online models or GLB assets.
- Procedural objects are lightweight MVP readability markers, not final dressing.
- The current baseline prioritizes stable navigation, objective clarity, and readable room identity over environmental density.

## Final Demo Route

The final demo route is:

1. Start in A.
2. Collect `Shift Assignment Form`.
3. Go to C.
4. Check `Workstation Log`.
5. Go to D.
6. Review `Pending Ledger`.
7. Go to F.
8. Collect `Archive Record`.
9. Go to H.
10. Confirm `Level 2 Access`.
11. Confirm the route completion message.

Expected completion text:

```text
Level 1 V2 route complete.
```

## Manual Test Checklist

- [ ] Start in A.
- [ ] Collect `Shift Assignment Form`.
- [ ] Confirm `Documents 1/5`.
- [ ] Go to C.
- [ ] Check `Workstation Log`.
- [ ] Confirm `Documents 2/5`.
- [ ] Go to D.
- [ ] Review `Pending Ledger`.
- [ ] Confirm `Documents 3/5`.
- [ ] Go to F.
- [ ] Collect `Archive Record`.
- [ ] Confirm `Documents 4/5`.
- [ ] Go to H.
- [ ] Confirm `Level 2 Access`.
- [ ] Confirm `Documents 5/5`.
- [ ] Confirm `Level 1 V2 route complete.`
- [ ] Press reset.
- [ ] Confirm reset returns to `0/5` and first task.

## Future Improvements

Future work should start from this stable baseline and stay incremental.

- Add any internal wall or room-shell work only after a separate wall-specific approval pass.
- Add one room or route change at a time, with manual route validation after each step.
- Keep the A-H room identity and approved floor zone placement intact unless a new layout review explicitly replaces the baseline.
- Upgrade procedural markers into richer props only after navigation and objective behavior remain stable.
- Consider final lighting, audio, and environmental dressing after the layout and objective route are locked.
- Add future Level 2 transition behavior after the Level 1 V2 MVP route remains stable.
