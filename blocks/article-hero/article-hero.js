/**
 * Article Hero Block — Full-width hero image(s) with title overlay.
 * Used on story/article pages to create an immersive hero section.
 *
 * Content structure (rows):
 *   Row 1: H1 title
 *   Row 2+: Hero image(s)
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 2) return;

  // Extract title from first row
  const titleRow = rows[0];
  const h1 = titleRow.querySelector('h1');

  // Extract images from remaining rows
  const images = [];
  for (let i = 1; i < rows.length; i += 1) {
    const img = rows[i].querySelector('img');
    if (img) images.push(img);
  }

  if (!h1 || images.length === 0) return;

  block.textContent = '';

  // Title container
  const titleContainer = document.createElement('div');
  titleContainer.className = 'article-hero-title';
  titleContainer.appendChild(h1);

  // Image container
  const imageContainer = document.createElement('div');
  imageContainer.className = 'article-hero-images';
  images.forEach((img) => {
    img.loading = 'eager';
    imageContainer.appendChild(img);
  });

  block.appendChild(titleContainer);
  block.appendChild(imageContainer);
}
