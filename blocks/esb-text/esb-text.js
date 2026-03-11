export default function decorate(block) {
  const wrapper = document.createElement('div');
  wrapper.className = 'esb-text-content';
  while (block.firstElementChild) {
    const row = block.firstElementChild;
    const cells = [...row.children];
    cells.forEach((cell) => {
      while (cell.firstChild) wrapper.appendChild(cell.firstChild);
    });
    row.remove();
  }
  block.appendChild(wrapper);
}
