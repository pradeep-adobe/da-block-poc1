export default function decorate(block) {
  const wrapper = document.createElement('div');
  wrapper.className = 'text-block-content';
  while (block.firstElementChild) {
    const row = block.firstElementChild;
    // Unwrap the row/cell structure — move inner content up
    const cells = [...row.children];
    cells.forEach((cell) => {
      while (cell.firstChild) wrapper.appendChild(cell.firstChild);
    });
    row.remove();
  }
  block.appendChild(wrapper);
}
