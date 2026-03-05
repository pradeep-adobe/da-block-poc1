/*
 * Key Points Block
 * Six optional key points with class-based selectors so DA ↔ UE mapping stays stable
 * when fields are removed in UE (no nth-child; each slot has .key-points-item-N).
 */

const TOTAL_SLOTS = 6;
const ITEM_CLASS = 'key-points-item';
const SLOT_CLASS_PREFIX = 'key-points-item-';

export default function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;

  const cells = [...row.children];
  cells.forEach((cell, index) => {
    const slotNum = index + 1;
    cell.classList.add(ITEM_CLASS, `${SLOT_CLASS_PREFIX}${slotNum}`);
  });

  // Ensure exactly TOTAL_SLOTS so structure is stable for UE/DA mapping
  while (row.children.length < TOTAL_SLOTS) {
    const slotNum = row.children.length + 1;
    const emptySlot = document.createElement('div');
    emptySlot.className = `${ITEM_CLASS} ${SLOT_CLASS_PREFIX}${slotNum}`;
    row.appendChild(emptySlot);
  }
}
