/**
 * Promo Block — Call-to-action section with heading, text, and CTA link.
 * Used for promotional sections like "Visit Us", "Locations", etc.
 *
 * Content structure (rows):
 *   Row 1+: Elements from the detected promo pattern
 *   Typically: H2/H3 heading + paragraph description + CTA link
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  // Collect all headings, paragraphs, and links
  const headings = [];
  const paragraphs = [];
  let ctaLink = null;

  rows.forEach((row) => {
    const cell = row.firstElementChild || row;
    const h = cell.querySelector('h2, h3');
    const ps = [...cell.querySelectorAll('p')];
    const a = cell.querySelector('a');

    if (h) headings.push(h);
    ps.forEach((p) => {
      if (!p.querySelector('a')) {
        paragraphs.push(p);
      }
    });
    if (a && !ctaLink) ctaLink = a;
  });

  block.textContent = '';

  const content = document.createElement('div');
  content.className = 'promo-content';

  headings.forEach((h) => content.appendChild(h));
  paragraphs.forEach((p) => content.appendChild(p));

  if (ctaLink) {
    const cta = document.createElement('div');
    cta.className = 'promo-cta';
    const a = document.createElement('a');
    a.href = ctaLink.href;
    a.textContent = ctaLink.textContent;
    a.className = 'button';
    cta.appendChild(a);
    content.appendChild(cta);
  }

  block.appendChild(content);
}
