import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      const hasImage = div.querySelector('picture') || (div.children.length === 1 && div.querySelector('img'));
      if (hasImage) div.className = 'cards-feed-card-image';
      else div.className = 'cards-feed-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);

  // Detect story cards (have category <p> + <h2>) and add variant class
  const firstBody = block.querySelector('.cards-feed-card-body');
  if (firstBody && firstBody.querySelector('h2')) {
    const firstP = firstBody.querySelector('p');
    if (firstP && !firstP.querySelector('a') && firstP.textContent.includes(':')) {
      block.classList.add('stories');
    }
  }
}
