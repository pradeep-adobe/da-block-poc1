import {
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateLinkedPictures,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';

/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds the home-page-hero auto block from flat default content.
 * Detects the hero pattern: logo img + h1 + subtitle + description + city links + hero image.
 * @param {Element} main The main element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  if (!h1) return;

  const section = h1.closest('div');
  const logo = section.querySelector(':scope > p:first-child > img');
  if (!logo) return;

  // Collect hero elements: everything from the logo paragraph up to (and including) the GIF image
  const heroElements = [];
  let el = logo.parentElement;
  while (el && el.parentElement === section) {
    heroElements.push(el);
    // Stop after we find a paragraph containing a GIF or single image AFTER the city links
    if (el.tagName === 'P' && el.querySelector('img') && heroElements.length > 5) break;
    el = el.nextElementSibling;
  }

  if (heroElements.length < 6) return;

  // Build the block: each hero element becomes a row
  const rows = heroElements.map((elem) => [{ elems: [elem] }]);
  const block = buildBlock('home-page-hero', rows);
  section.prepend(block);
}

/**
 * Builds the location-section auto block from flat default content.
 * Detects the pattern: "Roasteries" text + alternating image/link pairs + "Find a location" CTA.
 * @param {Element} main The main element
 */
function buildLocationBlock(main) {
  // Find the "Roasteries" paragraph (plain text, no links, no images)
  const allPs = [...main.querySelectorAll('p')];
  const roasteriesP = allPs.find((p) => p.textContent.trim() === 'Roasteries' && !p.querySelector('a') && !p.querySelector('img'));
  if (!roasteriesP) return;

  const section = roasteriesP.parentElement;
  const elements = [roasteriesP];
  let el = roasteriesP.nextElementSibling;

  // Collect image/link pairs and the "Find a location" CTA
  while (el && el.parentElement === section) {
    // Stop before "Related Stories" or any non-location content
    if (el.tagName === 'P' && !el.querySelector('a') && !el.querySelector('img') && el.textContent.trim()) break;
    elements.push(el);
    // Stop after "Find a location" link
    const link = el.querySelector('a');
    if (link && link.textContent.toLowerCase().includes('find')) break;
    el = el.nextElementSibling;
  }

  if (elements.length < 4) return;

  // Save insertion point before buildBlock moves the elements
  const insertAfter = roasteriesP.previousElementSibling;
  const rows = elements.map((elem) => [{ elems: [elem] }]);
  const block = buildBlock('location-section', rows);

  if (insertAfter) {
    insertAfter.after(block);
  } else {
    section.prepend(block);
  }
}

/**
 * Builds the article-hero auto block for story pages.
 * Detects: section with only H1, followed by a section starting with images.
 * Combines title + hero images into an article-hero block.
 * @param {Element} main The main element
 */
function buildArticleHeroBlock(main) {
  const sections = [...main.children];
  if (sections.length < 2) return;

  const firstSection = sections[0];
  const secondSection = sections[1];

  // First section must contain only an H1 (and nothing else significant)
  const h1 = firstSection.querySelector('h1');
  if (!h1) return;
  const firstSectionChildren = [...firstSection.children].filter((el) => el.tagName !== 'DIV' || !el.classList.contains('metadata'));
  const hasOnlyH1 = firstSectionChildren.length === 1 && firstSectionChildren[0].tagName === 'H1';
  const isWrappedH1 = firstSectionChildren.length === 0 && firstSection.querySelector(':scope > h1');
  if (!hasOnlyH1 && !isWrappedH1 && firstSectionChildren.length > 1) {
    // Check if non-h1 children are trivial (empty paragraphs)
    const nonH1 = firstSectionChildren.filter((el) => el !== h1 && el.textContent.trim() !== '');
    if (nonH1.length > 0) return;
  }

  // Second section must start with image paragraph(s)
  const firstChild = secondSection.firstElementChild;
  if (!firstChild) return;
  const startsWithImage = firstChild.tagName === 'P' && firstChild.querySelector('img') && !firstChild.querySelector('a');
  if (!startsWithImage) return;

  // Skip homepage (has logo-based hero already)
  if (firstSection.querySelector('img')) return;

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

  if (heroImages.length === 0) return;

  // Build the block: H1 row + image rows
  const rows = [[{ elems: [h1] }]];
  heroImages.forEach((img) => rows.push([{ elems: [img] }]));

  const block = buildBlock('article-hero', rows);
  firstSection.prepend(block);
}

/**
 * Builds the coffee-carousel auto block for coffee detail pages.
 * Detects: consecutive "Next Coffee" link paragraphs after the columns-coffee block.
 * @param {Element} main The main element
 */
function buildCoffeeCarouselBlock(main) {
  const allLinks = [...main.querySelectorAll('p > a')];
  const nextCoffeeLinks = allLinks.filter((a) => a.textContent.trim() === 'Next Coffee');
  if (nextCoffeeLinks.length < 3) return;

  // Get the parent paragraphs
  const paragraphs = nextCoffeeLinks.map((a) => a.closest('p'));
  const section = paragraphs[0].parentElement;

  // Verify they're all siblings in the same section
  if (!paragraphs.every((p) => p.parentElement === section)) return;

  // Save insertion point
  const insertBefore = paragraphs[0];
  const insertRef = insertBefore.previousElementSibling;

  const rows = paragraphs.map((p) => [{ elems: [p] }]);
  const block = buildBlock('coffee-carousel', rows);

  if (insertRef) {
    insertRef.after(block);
  } else {
    section.prepend(block);
  }
}

/**
 * Builds the accordion auto block for the FAQ page.
 * Detects: H3 category headings + bold-question/answer pairs on the FAQ page.
 * @param {Element} main The main element
 */
function buildAccordionBlock(main) {
  // Look for FAQ-style content: section with multiple <strong> elements (questions)
  const sections = [...main.children];
  sections.forEach((section) => {
    const strongs = [...section.querySelectorAll('p > strong')];
    // Need at least 5 Q&A pairs to be considered FAQ content
    if (strongs.length < 5) return;

    // Check that this isn't inside an existing block
    if (section.querySelector('.accordion, .cards-feed, .columns-coffee')) return;

    // Find the start: first H3 or first strong/question
    const firstH3 = section.querySelector('h3');
    const startEl = firstH3 || strongs[0].closest('p');
    if (!startEl) return;

    // Collect all FAQ elements (H3 headings + Q&A pairs)
    const faqElements = [];
    let el = startEl;
    while (el && el.parentElement === section) {
      // Skip empty paragraphs
      if (el.tagName === 'P' && el.textContent.trim() === '\u200D') {
        el = el.nextElementSibling;
        // eslint-disable-next-line no-continue
        continue;
      }
      if (el.tagName === 'P' && el.textContent.trim() === '') {
        el = el.nextElementSibling;
        // eslint-disable-next-line no-continue
        continue;
      }

      // Stop at "Related Stories" or cards-feed
      if (el.textContent.trim() === 'Related Stories') break;
      if (el.classList?.contains('cards-feed')) break;

      // H3 = category heading
      if (el.tagName === 'H3') {
        faqElements.push(el);
        el = el.nextElementSibling;
        // eslint-disable-next-line no-continue
        continue;
      }

      // Strong paragraph = question, followed by answer paragraph(s)
      const strong = el.querySelector('strong');
      if (strong && el.tagName === 'P') {
        const question = el;
        const answerParts = [];
        let next = el.nextElementSibling;

        // Collect answer paragraphs until next question, heading, or end
        while (next && next.parentElement === section) {
          if (next.querySelector('strong') && next.tagName === 'P') break;
          if (next.tagName === 'H3') break;
          if (next.textContent.trim() === 'Related Stories') break;
          if (next.textContent.trim() === '' || next.textContent.trim() === '\u200D') {
            next = next.nextElementSibling;
            // eslint-disable-next-line no-continue
            continue;
          }
          answerParts.push(next);
          next = next.nextElementSibling;
        }

        // Create a row with question and answer
        const questionDiv = document.createElement('div');
        questionDiv.textContent = strong.textContent;

        const answerDiv = document.createElement('div');
        answerParts.forEach((part) => answerDiv.appendChild(part.cloneNode(true)));
        // If no separate answer paragraphs, use text after strong in same paragraph
        if (answerParts.length === 0) {
          const html = question.innerHTML;
          const afterStrong = html.split('</strong>')[1];
          if (afterStrong) {
            answerDiv.innerHTML = afterStrong.replace(/^[\s<br>]+/, '');
          }
        }

        faqElements.push({ question: questionDiv, answer: answerDiv });

        // Skip past answer paragraphs
        el = next;
        // eslint-disable-next-line no-continue
        continue;
      }

      el = el.nextElementSibling;
    }

    if (faqElements.length < 3) return;

    // Build rows for the accordion block
    const rows = faqElements.map((item) => {
      if (item.tagName === 'H3') {
        // Category heading row (single cell)
        return [{ elems: [item] }];
      }
      // Q&A row (two cells)
      return [item.question, item.answer];
    });

    const insertRef = startEl.previousElementSibling;
    const block = buildBlock('accordion', rows);

    if (insertRef) {
      insertRef.after(block);
    } else {
      section.prepend(block);
    }

    // Remove original elements that were moved/cloned
    const toRemove = [];
    el = block.nextElementSibling;
    while (el && el.parentElement === section) {
      if (el.textContent.trim() === 'Related Stories') break;
      if (el.classList?.contains('cards-feed')) break;
      toRemove.push(el);
      el = el.nextElementSibling;
    }
    toRemove.forEach((r) => r.remove());
  });
}

/**
 * Builds the menu-list auto block for the menus page.
 * Detects: H2 location headings + H3 venue names + consecutive link paragraphs.
 * @param {Element} main The main element
 */
function buildMenuListBlock(main) {
  const sections = [...main.children];
  sections.forEach((section) => {
    const h1 = section.querySelector('h1');
    // Only target the menus page: has H1 "Menus" and multiple H2+H3+link groups
    if (!h1 || h1.textContent.trim().toLowerCase() !== 'menus') return;

    const h2s = [...section.querySelectorAll('h2')];
    const h3s = [...section.querySelectorAll('h3')];
    if (h2s.length < 2 || h3s.length < 2) return;

    // Find start of actual menu location content (city-specific H2s, not the intro "STARBUCKS RESERVE MENUS" H2)
    const menuH2s = h2s.filter((h) => {
      const text = h.textContent.toLowerCase();
      return text.includes('chicago') || text.includes('new york');
    });
    if (menuH2s.length === 0) return;

    const startEl = menuH2s[0];

    // Collect all menu elements from startEl to end
    const menuElements = [];
    let el = startEl;
    while (el && el.parentElement === section) {
      menuElements.push(el);
      el = el.nextElementSibling;
    }

    if (menuElements.length < 4) return;

    const insertRef = startEl.previousElementSibling;
    const rows = menuElements.map((elem) => [{ elems: [elem] }]);
    const block = buildBlock('menu-list', rows);

    if (insertRef) {
      insertRef.after(block);
    } else {
      section.prepend(block);
    }
  });
}

/**
 * Builds the promo auto block for CTA sections.
 * Detects: "Locations" or "Visit" sections with H2 + H3 + paragraph + CTA link.
 * @param {Element} main The main element
 */
function buildPromoBlock(main) {
  // Skip homepage — it uses a collage layout that depends on specific child ordering
  if (main.querySelector('.home-page-hero')) return;

  const sections = [...main.children];
  sections.forEach((section) => {
    // Look for promo patterns: H2 "Locations"/"Visit" followed by H3 + paragraph + link
    const headings = [...section.querySelectorAll('h2')];
    headings.forEach((h2) => {
      const text = h2.textContent.trim().toLowerCase();
      if (text !== 'locations' && !text.includes('visit starbucks')) return;

      // Collect: H2 + next H3 + paragraph(s) + CTA link
      const promoElements = [h2];
      let el = h2.nextElementSibling;
      while (el && el.parentElement === section) {
        // Stop at another H2 or at a block
        if (el.tagName === 'H2' && el !== h2) break;
        if (el.classList?.contains('cards-feed') || el.classList?.contains('cards-brew')) break;
        promoElements.push(el);
        // Stop after finding a CTA link
        const a = el.querySelector('a');
        if (a) break;
        el = el.nextElementSibling;
      }

      if (promoElements.length < 3) return;

      const insertRef = h2.previousElementSibling;
      const rows = promoElements.map((elem) => [{ elems: [elem] }]);
      const block = buildBlock('promo', rows);

      if (insertRef) {
        insertRef.after(block);
      } else {
        section.prepend(block);
      }
    });
  });
}

/**
 * Removes empty columns-coffee blocks (failed migration artifacts).
 * These are blocks where all cells are empty divs.
 * @param {Element} main The main element
 */
function removeEmptyBlocks(main) {
  const emptyBlocks = [...main.querySelectorAll('.columns-coffee')];
  emptyBlocks.forEach((block) => {
    const cells = [...block.querySelectorAll('div > div > div')];
    const allEmpty = cells.every((cell) => cell.textContent.trim() === '' && !cell.querySelector('img'));
    if (allEmpty) {
      // Remove the section wrapper if it only contains this empty block
      const section = block.closest('div');
      const siblings = [...section.children].filter((el) => el !== block);
      if (siblings.length === 0) {
        section.remove();
      } else {
        block.remove();
      }
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
    buildLocationBlock(main);
    buildArticleHeroBlock(main);
    buildCoffeeCarouselBlock(main);
    buildAccordionBlock(main);
    buildMenuListBlock(main);
    buildPromoBlock(main);
    removeEmptyBlocks(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  decorateLinkedPictures(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();

const { searchParams, origin } = new URL(window.location.href);
const branch = searchParams.get('nx') || 'main';

export const NX_ORIGIN = branch === 'local' || origin.includes('localhost') ? 'http://localhost:6456/nx' : 'https://da.live/nx';

(async function loadDa() {
  /* eslint-disable import/no-unresolved */
  if (searchParams.get('dapreview')) {
    import('https://da.live/scripts/dapreview.js')
      .then(({ default: daPreview }) => daPreview(loadPage));
  }
  if (searchParams.get('daexperiment')) {
    import(`${NX_ORIGIN}/public/plugins/exp/exp.js`);
  }
}());
