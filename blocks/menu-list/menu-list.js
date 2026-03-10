/**
 * Menu List Block — Structured menu link lists grouped by location.
 * Displays location headings with organized menu links and booking CTAs.
 *
 * Content structure (rows):
 *   Each row: content from the detected menu pattern
 *   H2 = location heading, H3 = venue name, links = menu items / CTAs
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  // Collect all content into a flat list of elements
  const elements = [];
  rows.forEach((row) => {
    [...row.querySelectorAll('h2, h3, p, a')].forEach((el) => {
      if (el.tagName === 'A' && el.closest('p')) return; // skip links inside <p>, we'll get them from <p>
      elements.push(el);
    });
  });

  block.textContent = '';

  let currentGroup = null;
  let currentVenue = null;

  rows.forEach((row) => {
    const cell = row.firstElementChild || row;
    const h2 = cell.querySelector('h2');
    const h3 = cell.querySelector('h3');
    const links = [...cell.querySelectorAll('a')].filter((a) => a.closest('p'));

    if (h2) {
      // New location group
      currentGroup = document.createElement('div');
      currentGroup.className = 'menu-list-group';

      const heading = document.createElement('h2');
      heading.className = 'menu-list-location';
      heading.textContent = h2.textContent;
      currentGroup.appendChild(heading);

      block.appendChild(currentGroup);
      currentVenue = null;
    }

    if (h3) {
      // New venue within the current location
      currentVenue = document.createElement('div');
      currentVenue.className = 'menu-list-venue';

      const venueName = document.createElement('h3');
      venueName.className = 'menu-list-venue-name';
      venueName.textContent = h3.textContent;
      currentVenue.appendChild(venueName);

      const linkList = document.createElement('ul');
      linkList.className = 'menu-list-links';
      currentVenue.appendChild(linkList);

      if (currentGroup) {
        currentGroup.appendChild(currentVenue);
      } else {
        block.appendChild(currentVenue);
      }
    }

    if (links.length > 0 && currentVenue) {
      const linkList = currentVenue.querySelector('.menu-list-links');
      links.forEach((a) => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = a.href;
        link.textContent = a.textContent;

        // Mark booking links differently
        const text = a.textContent.toLowerCase();
        if (text.includes('book')) {
          link.className = 'menu-list-cta';
        }

        li.appendChild(link);
        linkList.appendChild(li);
      });
    }
  });
}
