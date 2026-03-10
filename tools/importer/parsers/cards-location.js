/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-location variant.
 * Base: cards.
 * Source: https://www.starbucksreserve.com/about
 * Extracts location cards from .feed_list.is-locations grid.
 *
 * Block library structure: 2 columns per row.
 * Cell 1: image (mandatory)
 * Cell 2: text content with linked location name
 */
export default function parse(element, { document }) {
  const items = element.querySelectorAll('.team6_item');
  const cells = [];

  items.forEach((item) => {
    const img = item.querySelector('.team6_image-wrapper img, .team6_image');
    const link = item.querySelector('a.text-link, a');

    // Skip empty items (no image and no link)
    if (!img && !link) return;

    const imageCell = [];
    if (img) imageCell.push(img);

    const textCell = [];
    if (link) textCell.push(link);

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'cards-location',
    cells,
  });
  element.replaceWith(block);
}
