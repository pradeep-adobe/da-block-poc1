/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-brew variant.
 * Base: cards.
 * Source: https://www.starbucksreserve.com/coffee/costa-rica-hacienda-alsacia
 * Extracts brew guide cards from .feed_list.is-brew-guides grid.
 *
 * Block library structure: 2 columns per row.
 * Cell 1: image (brew method icon)
 * Cell 2: text content with title and learn link
 */
export default function parse(element, { document }) {
  const items = element.querySelectorAll('.team6_item');
  const cells = [];

  items.forEach((item) => {
    const img = item.querySelector('.team6_image-wrapper img, .team6_image');
    const title = item.querySelector('h3, .text-style-subheading');
    const link = item.querySelector('a.link, a');

    if (!img && !title && !link) return;

    const imageCell = [];
    if (img) imageCell.push(img);

    const textCell = [];
    if (title) textCell.push(title);
    if (link) textCell.push(link);

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'cards-brew',
    cells,
  });
  element.replaceWith(block);
}
