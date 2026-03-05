# Key Points Block

Block with **class-based selectors** so DA ↔ UE authoring stays stable when optional points are removed (no value shifting).

## Why “Key Points”

- **Relevant block name** for presentations: e.g. “Key Points” with 6 optional items.
- Uses **class selectors** (`.key-points-item-1` … `.key-points-item-6`) instead of `nth-child`, so removing a point in UE does not shift other values.

## How to test in both editors

**In DA:** Add a block named **key-points**, one row, six columns (e.g. “Point 1” … “Point 6”).

**In UE:** Open the same page, edit or remove any point (e.g. clear Point 5), save, refresh. Point 5 should be empty and Point 6 should still show its value (no shift).

## Files

- `key-points.js` – adds slot classes and keeps 6 slots.
- `key-points.css` – layout and empty state.
- UE model: `ue/models/blocks/key-points.json` – class selectors + `unsafeHTML` with fixed 6-slot structure.
