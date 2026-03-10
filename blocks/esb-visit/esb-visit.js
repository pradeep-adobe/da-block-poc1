import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'esb-visit-wrapper';

  rows.forEach((row) => {
    const cols = [...row.children];

    cols.forEach((col) => {
      const pic = col.querySelector('picture');
      const img = col.querySelector('img');

      if (pic || (img && !col.querySelector('h2, h3, h6, p + p'))) {
        // Image column
        const imageDiv = document.createElement('div');
        imageDiv.className = 'esb-visit-image';
        if (img) {
          const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '800' }]);
          imageDiv.append(optimized);
        }
        wrapper.append(imageDiv);
      } else {
        // Info column
        const infoDiv = document.createElement('div');
        infoDiv.className = 'esb-visit-info';
        while (col.firstElementChild) infoDiv.append(col.firstElementChild);
        wrapper.append(infoDiv);
      }
    });
  });

  block.append(wrapper);
}
