/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-coffee variant.
 * Base: columns.
 * Source: https://www.starbucksreserve.com/coffee/costa-rica-hacienda-alsacia
 * Extracts coffee header with title/subtitle on left, product image on right.
 *
 * Block library structure: 2 columns per row.
 * Cell 1: text content (heading + subtitle)
 * Cell 2: product image
 */
export default function parse(element, { document }) {
  const contentDiv = element.querySelector('.layout3_content');
  const imgDiv = element.querySelector('.image-right_image-wrapper img, ._2-image-right_image-1');

  const textCell = [];
  if (contentDiv) {
    const heading = contentDiv.querySelector('h1, h2, h3');
    if (heading) textCell.push(heading);

    const subtitle = contentDiv.querySelector('.text-style-subheading, p');
    if (subtitle) textCell.push(subtitle);
  }

  const imageCell = [];
  if (imgDiv) imageCell.push(imgDiv);

  const cells = [[textCell, imageCell]];

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'columns-coffee',
    cells,
  });
  element.replaceWith(block);
}
