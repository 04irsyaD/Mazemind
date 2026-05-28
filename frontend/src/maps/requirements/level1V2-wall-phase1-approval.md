# Level 1 V2 Wall Phase 1 Approval

## 1. Purpose

This document locks the exact Phase 1 wall segments before implementation.

Phase 1 goal:
Add minimal blocking wall/barrier segments so Level 1 V2 feels more like a maze while preserving the stable MVP route:

A -> C -> D -> F -> H

## 2. Hard Constraints

- Do not create full room shells.
- Do not create doors.
- Do not wrap rooms.
- Do not change floor zone bounds.
- Do not move objectives.
- Do not change objective order.
- Do not block central route.
- Do not block player start.
- Do not block objective positions.
- Do not use online models or GLB assets.
- Build must pass.
- Documents must still reach 5/5.

## 3. Approved Phase 1 Wall Segments

Use exactly these 5 wall segments.

### 1. C Workstation Lane Wall 01

ID:
c-workstation-lane-wall-01

Room:
main-workstation-hall

Segment:
x1: 17, y1: 4, x2: 22, y2: 4

Length:
6 cells

Purpose:
Create upper workstation lane.

Safety:
Must not block C objective at:
{ x: 21.5, y: 5.5 }

### 2. C Workstation Lane Wall 02

ID:
c-workstation-lane-wall-02

Room:
main-workstation-hall

Segment:
x1: 24, y1: 7, x2: 28, y2: 7

Length:
5 cells

Purpose:
Create lower workstation lane.

Safety:
Must leave approach from central route.

### 3. F Archive Aisle Wall 01

ID:
f-archive-aisle-wall-01

Room:
records-archive

Segment:
x1: 4, y1: 18, x2: 9, y2: 18

Length:
6 cells

Purpose:
Create top archive aisle.

Safety:
Must not block F objective at:
{ x: 7, y: 20 }

### 4. F Archive Aisle Wall 02

ID:
f-archive-aisle-wall-02

Room:
records-archive

Segment:
x1: 5, y1: 21, x2: 10, y2: 21

Length:
6 cells

Purpose:
Create bottom archive aisle.

Safety:
Shortened from x 5..11 to x 5..10 to satisfy 6-cell maximum.

### 5. H Final Approach Wall 01

ID:
h-final-approach-wall-01

Room:
level2-access

Segment:
x1: 17, y1: 18, x2: 17, y2: 21

Length:
4 cells

Purpose:
Create final access lane.

Safety:
Must not block H objective at:
{ x: 15.5, y: 20 }

## 4. Not Included in Phase 1

Do not include:
- A walls
- B walls
- E walls
- G walls
- central route baffle
- D boardroom wall
- full room shells
- doors

Reason:
Phase 1 must stay minimal and easy to rollback.

## 5. Implementation Rule

When Phase 1 is implemented:
- only these exact wall segments may be added
- no automatic wall generation
- no room-boundary conversion to walls
- no inferred wall extension
- no extra segments

## 6. Validation After Implementation

Implementation must validate:
- wall count is exactly 5
- no full room shell exists
- no doors exist
- floor zone bounds unchanged
- objective positions unchanged
- central route remains passable
- A -> C -> D -> F -> H remains reachable
- Documents reaches 5/5
- reset works
- build passes

## 7. Rollback Rule

If any wall breaks route, objective interaction, or visual clarity:
- rollback that wall segment
- do not move objectives to compensate
- update requirements before retrying

## 8. Approval Status

Status:
Approved for Phase 1 implementation after user confirmation.
