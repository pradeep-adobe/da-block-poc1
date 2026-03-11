import { createOptimizedPicture, fetchPlaceholders } from '../../scripts/aem.js';

const PLACEHOLDER_KEYS = {
  stories: 'relatedCardsStoriesCtaLabel',
  coffee: 'relatedCardsCoffeeCtaLabel',
};

const metadataCache = {};

/**
 * Strip common site-name suffixes from page titles.
 */
function cleanTitle(raw) {
  return raw
    .replace(/\s*[|–—]\s*Starbucks Reserve[®™()R]*\s*$/i, '')
    .replace(/[""\u201D]+$/, '')
    .trim();
}

/**
 * Fetch and parse metadata from a page's .plain.html content.
 * Returns an object with lowercase keys (title, image, category, description).
 */
async function fetchPageMetadata(url) {
  if (metadataCache[url]) return metadataCache[url];

  // In local dev the content directory lives under /content/
  const prefix = window.location.pathname.startsWith('/content/') ? '/content' : '';
  const fetchUrl = `${prefix}${url}.plain.html`;

  try {
    const resp = await fetch(fetchUrl);
    if (!resp.ok) return null;

    const html = await resp.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const metaBlock = doc.querySelector('.metadata');
    if (!metaBlock) return null;

    const meta = {};
    [...metaBlock.children].forEach((row) => {
      const key = row.children[0]?.textContent?.trim().toLowerCase();
      const valueCell = row.children[1];
      if (key && valueCell) {
        const img = valueCell.querySelector('img');
        meta[key] = img ? img.getAttribute('src') : valueCell.textContent.trim();
      }
    });

    metadataCache[url] = meta;
    return meta;
  } catch {
    return null;
  }
}

export default async function decorate(block) {
  const isStories = block.classList.contains('stories');
  const isCoffee = block.classList.contains('coffee');
  const variantKey = isStories ? 'stories' : isCoffee ? 'coffee' : null;

  // Resolve CTA label from placeholders
  let ctaLabel;
  if (variantKey) {
    try {
      const placeholders = await fetchPlaceholders();
      ctaLabel = placeholders[PLACEHOLDER_KEYS[variantKey]];
    } catch { /* ctaLabel stays undefined */ }
  }

  // Each authored row contains a single link — the target page URL
  const urls = [...block.children].map((row) => {
    const link = row.querySelector('a');
    return link ? link.getAttribute('href') : null;
  }).filter(Boolean);

  // Fetch metadata for all target pages in parallel
  const metadataResults = await Promise.all(urls.map(fetchPageMetadata));

  // Build card list
  const ul = document.createElement('ul');
  urls.forEach((url, i) => {
    const meta = metadataResults[i];
    if (!meta) return;

    const li = document.createElement('li');

    // Card image
    if (meta.image) {
      const imageDiv = document.createElement('div');
      imageDiv.className = 'related-cards-card-image';
      imageDiv.append(
        createOptimizedPicture(meta.image, cleanTitle(meta.title || ''), false, [{ width: '750' }]),
      );
      li.append(imageDiv);
    }

    // Card body
    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'related-cards-card-body';

    if (isStories && meta.category) {
      const catP = document.createElement('p');
      catP.textContent = meta.category;
      bodyDiv.append(catP);
    }

    const heading = document.createElement(isStories ? 'h2' : 'h3');
    heading.textContent = cleanTitle(meta.title || '');
    bodyDiv.append(heading);

    if (ctaLabel) {
      const ctaP = document.createElement('p');
      const ctaA = document.createElement('a');
      ctaA.href = url;
      ctaA.textContent = ctaLabel;
      ctaP.append(ctaA);
      bodyDiv.append(ctaP);
    }

    li.append(bodyDiv);
    ul.append(li);
  });

  block.textContent = '';
  block.append(ul);
}
