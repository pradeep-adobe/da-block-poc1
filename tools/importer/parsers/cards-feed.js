/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-feed variant.
 * Base: cards.
 * Source: https://www.starbucksreserve.com/coffee/costa-rica-hacienda-alsacia
 * Extracts feed cards from .feed_list grids (stories, coffees, etc).
 *
 * Block library structure: 2 columns per row.
 * Cell 1: image
 * Cell 2: text content with optional label, title, and read more link
 */
export default function parse(element, { document }) {
  const items = element.querySelectorAll('.feed_item');
  const cells = [];

  items.forEach((item) => {
    const img = item.querySelector('.feed_image-wrapper img, .feed_image');
    const label = item.querySelector('.feed_item-label');
    const title = item.querySelector('h2, h3, .feed_item-title');
    const link = item.querySelector('a.link, a');

    if (!img && !title && !link) return;

    const imageCell = [];
    if (img) imageCell.push(img);

    const textCell = [];
    if (label) textCell.push(label);
    if (title) textCell.push(title);
    if (link) textCell.push(link);

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'cards-feed',
    cells,
  });
  element.replaceWith(block);
}
