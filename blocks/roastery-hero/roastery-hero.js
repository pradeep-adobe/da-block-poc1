/**
 * Roastery Hero Block — Title + description + nav tabs + hero image.
 * Used on roastery overview and highlights pages.
 *
 * Content model (rows):
 *   Row 1: H1 title
 *   Row 2: Description paragraph
 *   Row 3: Nav links (multiple <a> in one cell)
 *   Row 4: Hero image (optional — may have anchor links before it on highlights pages)
 *   Additional rows: Floor anchor links or map image
 */
export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'roastery-hero-wrapper';

  // Row 1: Title
  const titleRow = rows[0];
  if (titleRow) {
    const titleDiv = document.createElement('div');
    titleDiv.className = 'roastery-hero-title';
    const h1 = titleRow.querySelector('h1');
    if (h1) {
      titleDiv.appendChild(h1);
    } else {
      const newH1 = document.createElement('h1');
      newH1.textContent = titleRow.textContent.trim();
      titleDiv.appendChild(newH1);
    }
    wrapper.appendChild(titleDiv);
  }

  // Row 2: Description
  if (rows[1]) {
    const descDiv = document.createElement('div');
    descDiv.className = 'roastery-hero-description';
    const cells = [...rows[1].children];
    cells.forEach((cell) => {
      while (cell.firstChild) descDiv.appendChild(cell.firstChild);
    });
    wrapper.appendChild(descDiv);
  }

  // Row 3: Navigation tabs
  if (rows[2]) {
    const navDiv = document.createElement('nav');
    navDiv.className = 'roastery-hero-nav';
    const links = rows[2].querySelectorAll('a');
    links.forEach((link) => {
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.textContent;
      // Mark active link based on current URL
      if (window.location.pathname === new URL(a.href, window.location.origin).pathname) {
        a.classList.add('active');
      }
      navDiv.appendChild(a);
    });
    wrapper.appendChild(navDiv);
  }

  // Remaining rows: anchor links, images, or map content
  for (let i = 3; i < rows.length; i += 1) {
    const row = rows[i];
    const img = row.querySelector('img');
    const links = row.querySelectorAll('a');

    if (img && links.length === 0) {
      // Hero image or map image
      const imageDiv = document.createElement('div');
      imageDiv.className = 'roastery-hero-image';
      img.loading = 'eager';
      imageDiv.appendChild(img);
      wrapper.appendChild(imageDiv);
    } else if (links.length > 0 && !img) {
      // Floor anchor links
      const anchorsDiv = document.createElement('div');
      anchorsDiv.className = 'roastery-hero-anchors';
      links.forEach((link) => {
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = link.textContent;
        anchorsDiv.appendChild(a);
      });
      wrapper.appendChild(anchorsDiv);
    }
  }

  block.appendChild(wrapper);
}
