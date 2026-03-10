export default function decorate(block) {
  const rows = [...block.children];

  // Auto-block rows:
  // Row 0: "Roasteries" title paragraph
  // Rows 1-10: Alternating image/link paragraphs (5 location pairs)
  // Row 11: "Find a location" CTA paragraph

  const titleRow = rows[0];
  const titleText = titleRow?.textContent?.trim() || 'Roasteries';
  const ctaRow = rows[rows.length - 1];
  const ctaLink = ctaRow?.querySelector('a');
  const locationRows = rows.slice(1, rows.length - 1);

  // Clear block and rebuild
  block.textContent = '';

  // Vertical label
  const label = document.createElement('div');
  label.className = 'location-section-label';
  label.textContent = titleText;

  // Locations grid
  const grid = document.createElement('div');
  grid.className = 'location-section-grid';

  // Parse location pairs (image paragraph + link paragraph)
  for (let i = 0; i < locationRows.length; i += 2) {
    const imgRow = locationRows[i];
    const linkRow = locationRows[i + 1];
    if (!linkRow) break;

    const img = imgRow?.querySelector('img');
    const link = linkRow?.querySelector('a');
    if (!link) continue;

    const card = document.createElement('div');
    card.className = 'location-section-card';

    if (img) {
      const imgWrap = document.createElement('div');
      imgWrap.className = 'location-section-img';
      img.loading = 'lazy';
      imgWrap.appendChild(img);
      card.appendChild(imgWrap);
    }

    const name = document.createElement('a');
    name.href = link.href;
    name.className = 'location-section-name';
    name.textContent = link.textContent;
    card.appendChild(name);

    grid.appendChild(card);
  }

  // CTA
  const cta = document.createElement('div');
  cta.className = 'location-section-cta';
  if (ctaLink) {
    const a = document.createElement('a');
    a.href = ctaLink.href;
    a.textContent = ctaLink.textContent;
    cta.appendChild(a);
  }

  block.appendChild(label);
  block.appendChild(grid);
  block.appendChild(cta);
}
