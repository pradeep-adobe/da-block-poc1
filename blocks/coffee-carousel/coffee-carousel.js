/**
 * Coffee Carousel Block — "Next Coffee" navigation link.
 * Shows a single "Next Coffee →" link pointing to the next coffee
 * in the collection, based on the current page's position in the list.
 *
 * Content structure (rows):
 *   Each row: a paragraph containing an <a> link to a coffee page
 *   All links have text "Next Coffee" with different href targets
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  // Extract all coffee links (use raw href to preserve relative paths)
  const links = [];
  rows.forEach((row) => {
    const anchor = row.querySelector('a');
    if (anchor) {
      links.push(anchor.getAttribute('href'));
    }
  });

  if (links.length === 0) return;

  // Normalize a path for comparison (strip /content prefix and trailing slash)
  const normalize = (p) => p.replace(/^\/content/, '').replace(/\/$/, '');

  // Find current page in the list to determine "next"
  const currentPath = normalize(window.location.pathname);
  const currentIndex = links.findIndex((href) => normalize(href) === currentPath);

  // Determine next coffee: if found, pick next (wrap around); if not found, pick first
  let nextHref;
  if (currentIndex >= 0 && currentIndex < links.length - 1) {
    nextHref = links[currentIndex + 1];
  } else if (currentIndex === links.length - 1) {
    nextHref = links[0]; // wrap around
  } else {
    nextHref = links[0]; // current page not in list, show first
  }

  // If serving from /content/ prefix, ensure link also has it
  const contentPrefix = window.location.pathname.startsWith('/content') ? '/content' : '';
  if (contentPrefix && !nextHref.startsWith('/content')) {
    nextHref = contentPrefix + nextHref;
  }

  block.textContent = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'coffee-carousel-next';

  const a = document.createElement('a');
  a.href = nextHref;
  a.className = 'coffee-carousel-link';

  const text = document.createElement('span');
  text.textContent = 'Next Coffee';

  // Arrow SVG matching the live site
  const arrow = document.createElement('span');
  arrow.className = 'coffee-carousel-arrow';
  arrow.innerHTML = '<svg width="18" height="8" viewBox="0 0 18 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 5V3H15V5H0ZM18 4L14 8V0L18 4Z" fill="currentColor"/></svg>';

  a.appendChild(text);
  a.appendChild(arrow);
  wrapper.appendChild(a);
  block.appendChild(wrapper);
}
