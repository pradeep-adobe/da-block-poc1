/**
 * Highlights Block — Floor/venue showcase for roastery design pages.
 * Each instance represents one floor with its venues.
 *
 * Content model (rows):
 *   Row 1: Floor number (col 1) | Floor title H2 (col 2)
 *   Row 2: Description text (col 1) | Optional CTA link (col 2)
 *   Row 3+: Venue image (col 1) | Venue name (col 2) — repeating
 */
export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  // Row 1: Floor header
  const headerRow = rows[0];
  if (headerRow) {
    const cols = [...headerRow.children];
    const headerDiv = document.createElement('div');
    headerDiv.className = 'highlights-header';

    // Floor number
    const numDiv = document.createElement('div');
    numDiv.className = 'highlights-floor-number';
    numDiv.textContent = cols[0]?.textContent?.trim() || '';
    headerDiv.appendChild(numDiv);

    // Floor title
    const titleDiv = document.createElement('div');
    titleDiv.className = 'highlights-floor-title';
    const h2 = cols[1]?.querySelector('h2');
    if (h2) {
      titleDiv.appendChild(h2);
    } else if (cols[1]) {
      const newH2 = document.createElement('h2');
      newH2.textContent = cols[1].textContent.trim();
      titleDiv.appendChild(newH2);
    }
    headerDiv.appendChild(titleDiv);

    block.appendChild(headerDiv);
  }

  // Row 2: Description + optional CTA
  if (rows[1]) {
    const cols = [...rows[1].children];
    const descDiv = document.createElement('div');
    descDiv.className = 'highlights-description';

    // Description text
    if (cols[0]) {
      while (cols[0].firstChild) descDiv.appendChild(cols[0].firstChild);
    }

    // Optional CTA
    if (cols[1]) {
      const ctaLink = cols[1].querySelector('a');
      if (ctaLink) {
        const ctaDiv = document.createElement('div');
        ctaDiv.className = 'highlights-cta';
        ctaDiv.appendChild(ctaLink);
        descDiv.appendChild(ctaDiv);
      }
    }

    block.appendChild(descDiv);
  }

  // Row 3+: Venue gallery
  const venueRows = rows.slice(2);
  if (venueRows.length > 0) {
    const gallery = document.createElement('div');
    gallery.className = 'highlights-gallery';

    venueRows.forEach((row) => {
      const cols = [...row.children];
      const venue = document.createElement('div');
      venue.className = 'highlights-venue';

      // Image column
      const img = cols[0]?.querySelector('img');
      if (img) {
        const imgDiv = document.createElement('div');
        imgDiv.className = 'highlights-venue-image';
        img.loading = 'lazy';
        imgDiv.appendChild(img);
        venue.appendChild(imgDiv);
      }

      // Name column
      if (cols[1]) {
        const nameDiv = document.createElement('div');
        nameDiv.className = 'highlights-venue-name';
        nameDiv.textContent = cols[1].textContent.trim();
        venue.appendChild(nameDiv);
      }

      gallery.appendChild(venue);
    });

    block.appendChild(gallery);
  }
}
