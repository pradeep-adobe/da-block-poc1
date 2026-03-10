/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-info variant.
 * Base: columns.
 * Source: https://www.starbucksreserve.com/about
 * Handles both image-left and image-right two-column layouts.
 *
 * Block library structure: 2 columns per row.
 * Cell 1: image or text content
 * Cell 2: text content or image
 */
export default function parse(element, { document }) {
  // Determine layout direction
  const isImageLeft = element.classList.contains('image-left_component');
  const isImageRight = element.classList.contains('image-right_component');

  // Extract image
  const img = element.querySelector('.image-wrapper img, .image-left_image, .image-right_image-wrapper img, .image-right_image');

  // Extract text content container
  const contentContainer = element.querySelector('.image-left_content, .image-right_content');

  // Build content cell elements
  const contentCell = [];
  if (contentContainer) {
    const heading = contentContainer.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) contentCell.push(heading);

    const paragraphs = contentContainer.querySelectorAll(':scope > p, :scope > div > p');
    paragraphs.forEach((p) => {
      if (p.textContent.trim()) contentCell.push(p);
    });

    // CTA links
    const ctas = contentContainer.querySelectorAll('a.button, a.link, a.is-link');
    ctas.forEach((cta) => contentCell.push(cta));
  }

  // Build image cell
  const imageCell = [];
  if (img) imageCell.push(img);

  // Arrange cells based on layout direction
  let cells;
  if (isImageRight) {
    // Text on left, image on right
    cells = [contentCell, imageCell];
  } else {
    // Image on left, text on right (default)
    cells = [imageCell, contentCell];
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'columns-info',
    cells,
  });
  element.replaceWith(block);
}
