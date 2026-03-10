export default function decorate(block) {
  const rows = [...block.children];

  // Auto-block rows (each row wraps one original element):
  // Row 0: Logo image paragraph
  // Row 1: h1 heading
  // Row 2: Subtitle paragraph ("Discover exquisite coffee")
  // Row 3: Description paragraph
  // Row 4: City links row 1 (Chicago | New York)
  // Row 5: City links row 2 (Shanghai | Tokyo | Milano)
  // Row 6: Hero image/GIF paragraph

  const logoImg = rows[0]?.querySelector('img');
  const heading = rows[1]?.querySelector('h1');
  const subtitle = rows[2]?.querySelector('p');
  const description = rows[3]?.querySelector('p');
  const heroImg = rows[rows.length - 1]?.querySelector('img');

  // Collect city link rows (everything between description and hero image)
  const cityRows = rows.slice(4, rows.length - 1);

  // Clear block and rebuild structure
  block.textContent = '';

  // Logo column
  const logoCol = document.createElement('div');
  logoCol.className = 'home-page-hero-logo';
  if (logoImg) {
    logoImg.loading = 'eager';
    logoCol.appendChild(logoImg);
  }

  // Content column
  const contentCol = document.createElement('div');
  contentCol.className = 'home-page-hero-content';

  if (heading) {
    const h1 = document.createElement('h1');
    const text = heading.textContent;
    // Color the first word in accent color
    const words = text.split(' ');
    if (words.length > 1) {
      const accent = document.createElement('span');
      accent.className = 'accent';
      accent.textContent = words[0];
      h1.appendChild(accent);
      h1.appendChild(document.createTextNode(` ${words.slice(1).join(' ')}`));
    } else {
      h1.textContent = text;
    }
    contentCol.appendChild(h1);
  }

  if (subtitle) {
    const sub = document.createElement('p');
    sub.className = 'home-page-hero-subtitle';
    sub.textContent = subtitle.textContent;
    contentCol.appendChild(sub);
  }

  if (description) {
    const desc = document.createElement('p');
    desc.className = 'home-page-hero-description';
    desc.textContent = description.textContent;
    contentCol.appendChild(desc);
  }

  // City links
  if (cityRows.length > 0) {
    const citiesDiv = document.createElement('div');
    citiesDiv.className = 'home-page-hero-cities';

    cityRows.forEach((row) => {
      const links = row.querySelectorAll('a');
      if (links.length > 0) {
        const p = document.createElement('p');
        links.forEach((link) => p.appendChild(link.cloneNode(true)));
        citiesDiv.appendChild(p);
      }
    });

    contentCol.appendChild(citiesDiv);
  }

  // Image column
  const imageCol = document.createElement('div');
  imageCol.className = 'home-page-hero-image';
  if (heroImg) {
    heroImg.loading = 'eager';
    imageCol.appendChild(heroImg);
  }

  block.appendChild(logoCol);
  block.appendChild(contentCol);
  block.appendChild(imageCol);
}
