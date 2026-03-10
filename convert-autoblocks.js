/**
 * Converts auto-block patterns in content HTML files into explicitly authored
 * block tables so they appear correctly in DA authoring.
 */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, 'content');

/**
 * Wraps elements in an authored block table:
 * <div class="block-name"><div><div>...row content...</div></div>...</div>
 */
function wrapInBlock(doc, blockName, elements) {
  const block = doc.createElement('div');
  block.className = blockName;
  elements.forEach((el) => {
    const row = doc.createElement('div');
    const cell = doc.createElement('div');
    if (el.nodeType === 1) {
      cell.appendChild(el.cloneNode(true));
    } else {
      cell.innerHTML = el;
    }
    row.appendChild(cell);
    block.appendChild(row);
  });
  return block;
}

/**
 * Convert location-section on homepage
 */
function convertLocationSection(doc) {
  const allPs = [...doc.querySelectorAll('p')];
  const roasteriesP = allPs.find(
    (p) => p.textContent.trim() === 'Roasteries' && !p.querySelector('a') && !p.querySelector('img'),
  );
  if (!roasteriesP) return false;
  if (doc.querySelector('.location-section')) return false;

  const section = roasteriesP.parentElement;
  const elements = [roasteriesP];
  let el = roasteriesP.nextElementSibling;

  while (el && el.parentElement === section) {
    if (el.tagName === 'P' && !el.querySelector('a') && !el.querySelector('img') && el.textContent.trim()
        && el.textContent.trim() !== 'Roasteries') break;
    elements.push(el);
    const link = el.querySelector('a');
    if (link && link.textContent.toLowerCase().includes('find')) break;
    el = el.nextElementSibling;
  }

  if (elements.length < 4) return false;

  const block = wrapInBlock(doc, 'location-section', elements);
  roasteriesP.before(block);
  elements.forEach((e) => e.remove());
  console.log('  -> Converted location-section');
  return true;
}

/**
 * Convert coffee-carousel on coffee pages
 */
function convertCoffeeCarousel(doc) {
  if (doc.querySelector('.coffee-carousel')) return false;
  const allLinks = [...doc.querySelectorAll('p > a')];
  const nextCoffeeLinks = allLinks.filter((a) => a.textContent.trim() === 'Next Coffee');
  if (nextCoffeeLinks.length < 3) return false;

  const paragraphs = nextCoffeeLinks.map((a) => a.closest('p'));
  const section = paragraphs[0].parentElement;
  if (!paragraphs.every((p) => p.parentElement === section)) return false;

  const block = wrapInBlock(doc, 'coffee-carousel', paragraphs);
  paragraphs[0].before(block);
  paragraphs.forEach((p) => p.remove());
  console.log('  -> Converted coffee-carousel');
  return true;
}

/**
 * Convert article-hero on story pages
 */
function convertArticleHero(doc) {
  if (doc.querySelector('.article-hero')) return false;
  // Skip homepage
  if (doc.querySelector('.home-page-hero')) return false;

  const main = doc.body || doc.documentElement;
  const sections = [...main.children].filter((el) => el.tagName === 'DIV');
  if (sections.length < 2) return false;

  const firstSection = sections[0];
  const secondSection = sections[1];

  const h1 = firstSection.querySelector('h1');
  if (!h1) return false;

  // First section should mainly contain H1
  const children = [...firstSection.children].filter(
    (el) => !(el.tagName === 'DIV' && el.classList.contains('metadata')),
  );
  const nonTrivial = children.filter((el) => el !== h1 && el.textContent.trim() !== '');
  if (nonTrivial.length > 0) return false;

  // Second section should start with image paragraph(s)
  const firstChild = secondSection.firstElementChild;
  if (!firstChild) return false;
  if (!(firstChild.tagName === 'P' && firstChild.querySelector('img') && !firstChild.querySelector('a'))) return false;
  // Skip if first section has images (homepage)
  if (firstSection.querySelector('img')) return false;

  // Collect hero images from start of second section
  const heroImages = [];
  let el = secondSection.firstElementChild;
  while (el) {
    if (el.tagName === 'P' && el.querySelector('img') && !el.querySelector('a')) {
      heroImages.push(el);
      el = el.nextElementSibling;
    } else {
      break;
    }
  }

  if (heroImages.length === 0) return false;

  const blockElements = [h1, ...heroImages];
  const block = wrapInBlock(doc, 'article-hero', blockElements);
  firstSection.prepend(block);
  h1.remove();
  heroImages.forEach((img) => img.remove());
  console.log('  -> Converted article-hero');
  return true;
}

/**
 * Convert accordion on FAQ page
 */
function convertAccordion(doc) {
  if (doc.querySelector('.accordion')) return false;

  const sections = [...(doc.body || doc.documentElement).children].filter((el) => el.tagName === 'DIV');

  let converted = false;
  sections.forEach((section) => {
    const strongs = [...section.querySelectorAll('p > strong')];
    if (strongs.length < 5) return;
    if (section.querySelector('.accordion, .cards-feed, .columns-coffee')) return;

    const firstH3 = section.querySelector('h3');
    const startEl = firstH3 || strongs[0].closest('p');
    if (!startEl) return;

    // Collect all FAQ elements
    const faqElements = [];
    let el = startEl;
    while (el && el.parentElement === section) {
      if (el.tagName === 'P' && (el.textContent.trim() === '\u200D' || el.textContent.trim() === '')) {
        el = el.nextElementSibling;
        continue;
      }
      if (el.textContent.trim() === 'Related Stories') break;
      if (el.classList && el.classList.contains('cards-feed')) break;

      if (el.tagName === 'H3') {
        faqElements.push({ type: 'heading', el });
        el = el.nextElementSibling;
        continue;
      }

      const strong = el.querySelector('strong');
      if (strong && el.tagName === 'P') {
        const question = strong.textContent;
        const answerParts = [];
        let next = el.nextElementSibling;
        while (next && next.parentElement === section) {
          if (next.querySelector('strong') && next.tagName === 'P') break;
          if (next.tagName === 'H3') break;
          if (next.textContent.trim() === 'Related Stories') break;
          if (next.textContent.trim() === '' || next.textContent.trim() === '\u200D') {
            next = next.nextElementSibling;
            continue;
          }
          answerParts.push(next);
          next = next.nextElementSibling;
        }

        let answer = answerParts.map((p) => p.outerHTML).join('');
        if (!answer) {
          const html = el.innerHTML;
          const afterStrong = html.split('</strong>')[1];
          if (afterStrong) answer = afterStrong.replace(/^[\s<br>]+/, '');
        }

        faqElements.push({ type: 'qa', question, answer, origEl: el, answerEls: answerParts });
        el = next;
        continue;
      }

      el = el.nextElementSibling;
    }

    if (faqElements.length < 3) return;

    // Build the block
    const block = doc.createElement('div');
    block.className = 'accordion';
    faqElements.forEach((item) => {
      const row = doc.createElement('div');
      if (item.type === 'heading') {
        const cell = doc.createElement('div');
        cell.appendChild(item.el.cloneNode(true));
        row.appendChild(cell);
      } else {
        const qCell = doc.createElement('div');
        qCell.textContent = item.question;
        const aCell = doc.createElement('div');
        aCell.innerHTML = item.answer;
        row.appendChild(qCell);
        row.appendChild(aCell);
      }
      block.appendChild(row);
    });

    // Insert block and remove originals
    startEl.before(block);
    const toRemove = [];
    el = block.nextElementSibling;
    while (el && el.parentElement === section) {
      if (el.textContent.trim() === 'Related Stories') break;
      if (el.classList && el.classList.contains('cards-feed')) break;
      toRemove.push(el);
      el = el.nextElementSibling;
    }
    toRemove.forEach((r) => r.remove());
    // Also remove collected headings
    faqElements.forEach((item) => {
      if (item.type === 'heading' && item.el.parentElement) item.el.remove();
    });

    converted = true;
    console.log('  -> Converted accordion');
  });
  return converted;
}

/**
 * Convert menu-list on menus page
 */
function convertMenuList(doc) {
  if (doc.querySelector('.menu-list')) return false;

  const sections = [...(doc.body || doc.documentElement).children].filter((el) => el.tagName === 'DIV');
  let converted = false;

  sections.forEach((section) => {
    const h1 = section.querySelector('h1');
    if (!h1 || h1.textContent.trim().toLowerCase() !== 'menus') return;

    const h2s = [...section.querySelectorAll('h2')];
    const menuH2s = h2s.filter((h) => {
      const text = h.textContent.toLowerCase();
      return text.includes('chicago') || text.includes('new york');
    });
    if (menuH2s.length === 0) return;

    const startEl = menuH2s[0];
    const menuElements = [];
    let el = startEl;
    while (el && el.parentElement === section) {
      menuElements.push(el);
      el = el.nextElementSibling;
    }

    if (menuElements.length < 4) return;

    const block = wrapInBlock(doc, 'menu-list', menuElements);
    startEl.before(block);
    menuElements.forEach((e) => e.remove());
    converted = true;
    console.log('  -> Converted menu-list');
  });

  return converted;
}

/**
 * Convert promo blocks on various pages (not homepage)
 */
function convertPromo(doc) {
  if (doc.querySelector('.home-page-hero')) return false;

  const sections = [...(doc.body || doc.documentElement).children].filter((el) => el.tagName === 'DIV');
  let converted = false;

  sections.forEach((section) => {
    if (section.querySelector('.promo')) return;
    const headings = [...section.querySelectorAll('h2')];
    headings.forEach((h2) => {
      const text = h2.textContent.trim().toLowerCase();
      if (text !== 'locations' && !text.includes('visit starbucks')) return;

      const promoElements = [h2];
      let el = h2.nextElementSibling;
      while (el && el.parentElement === section) {
        if (el.tagName === 'H2' && el !== h2) break;
        if (el.classList && (el.classList.contains('cards-feed') || el.classList.contains('cards-brew'))) break;
        promoElements.push(el);
        const a = el.querySelector('a');
        if (a) break;
        el = el.nextElementSibling;
      }

      if (promoElements.length < 3) return;

      const block = wrapInBlock(doc, 'promo', promoElements);
      h2.before(block);
      promoElements.forEach((e) => e.remove());
      converted = true;
      console.log('  -> Converted promo');
    });
  });

  return converted;
}

/**
 * Process a single content file
 */
function processFile(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const dom = new JSDOM(`<!DOCTYPE html><html><body>${html}</body></html>`);
  const doc = dom.window.document;

  let changed = false;

  changed = convertLocationSection(doc) || changed;
  changed = convertCoffeeCarousel(doc) || changed;
  changed = convertArticleHero(doc) || changed;
  changed = convertAccordion(doc) || changed;
  changed = convertMenuList(doc) || changed;
  changed = convertPromo(doc) || changed;

  if (changed) {
    // Extract the content back (children of body)
    const sections = [...doc.body.children];
    const newHtml = sections.map((s) => s.outerHTML).join('\n');
    fs.writeFileSync(filePath, newHtml);
    return true;
  }
  return false;
}

// Process all .plain.html files
function processAll() {
  const files = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    entries.forEach((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(fullPath);
      else if (entry.name.endsWith('.plain.html')) files.push(fullPath);
    });
  }
  walk(CONTENT_DIR);

  let totalChanged = 0;
  files.sort().forEach((file) => {
    const rel = path.relative(CONTENT_DIR, file);
    console.log(`Processing: ${rel}`);
    if (processFile(file)) {
      totalChanged += 1;
    }
  });
  console.log(`\nDone. ${totalChanged} files updated.`);
}

processAll();
