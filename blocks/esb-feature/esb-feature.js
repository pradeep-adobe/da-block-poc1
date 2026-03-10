import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  rows.forEach((row) => {
    const cols = [...row.children];
    const feature = document.createElement('div');
    feature.className = 'esb-feature-item';

    cols.forEach((col) => {
      const pic = col.querySelector('picture');
      const img = col.querySelector('img');

      if (pic || (img && col.children.length === 1)) {
        // Image column
        const imageDiv = document.createElement('div');
        imageDiv.className = 'esb-feature-image';
        if (img) {
          const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '800' }]);
          imageDiv.append(optimized);
        }
        feature.append(imageDiv);
      } else {
        // Content column
        const contentDiv = document.createElement('div');
        contentDiv.className = 'esb-feature-content';
        while (col.firstElementChild) contentDiv.append(col.firstElementChild);
        feature.append(contentDiv);
      }
    });

    block.append(feature);
  });
}
