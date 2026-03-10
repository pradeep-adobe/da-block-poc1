/**
 * Quote Block — Styled pull quote with optional attribution.
 * Used in story/article pages for highlighted quotes.
 *
 * Content structure (rows):
 *   Row 1: Quote text
 *   Row 2 (optional): Attribution
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  const quoteText = rows[0]?.textContent?.trim() || '';
  const attribution = rows.length > 1 ? rows[1]?.textContent?.trim() : '';

  block.textContent = '';

  const blockquote = document.createElement('blockquote');
  blockquote.className = 'quote-text';

  const p = document.createElement('p');
  // Remove surrounding quotes if present
  p.textContent = quoteText.replace(/^[""\u201C]+|[""\u201D]+$/g, '');
  blockquote.appendChild(p);

  block.appendChild(blockquote);

  if (attribution) {
    const cite = document.createElement('cite');
    cite.className = 'quote-attribution';
    cite.textContent = attribution.replace(/^[-\u2014\u2013]\s*/, '');
    block.appendChild(cite);
  }
}
