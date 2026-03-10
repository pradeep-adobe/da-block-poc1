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
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
    buildLocationBlock(main);
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
