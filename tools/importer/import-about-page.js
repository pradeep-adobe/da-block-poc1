/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import columnsInfoParser from './parsers/columns-info.js';
import cardsLocationParser from './parsers/cards-location.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/starbucksreserve-cleanup.js';
import sectionsTransformer from './transformers/starbucksreserve-sections.js';

// PARSER REGISTRY
const parsers = {
  'columns-info': columnsInfoParser,
  'cards-location': cardsLocationParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'about-page',
  description: 'About page with hero header, full-width image, two-column content sections, and location feed grid',
  urls: [
    'https://www.starbucksreserve.com/about',
  ],
  blocks: [
    {
      name: 'columns-info',
      instances: ['.image-left_component', '.image-right_component'],
    },
    {
      name: 'cards-location',
      instances: ['.feed_list.is-locations'],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Page Header',
      selector: '.section_header',
      style: null,
      blocks: [],
      defaultContent: ['.section_header h1', '.section_header .text-style-subheading'],
    },
    {
      id: 'section-2',
      name: 'Full-Width Image',
      selector: '.section_full-width-image',
      style: null,
      blocks: [],
      defaultContent: ['.full-width-image.is-landscape'],
    },
    {
      id: 'section-3',
      name: 'What is Starbucks Reserve',
      selector: '.section_image-left',
      style: null,
      blocks: ['columns-info'],
      defaultContent: [],
    },
    {
      id: 'section-4',
      name: 'Where To Find Us',
      selector: '.section_image-right',
      style: null,
      blocks: ['columns-info'],
      defaultContent: [],
    },
    {
      id: 'section-5',
      name: 'Roasteries Location Feed',
      selector: '.section_location-feed',
      style: null,
      blocks: ['cards-location'],
      defaultContent: [],
    },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook.
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration.
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup + section breaks)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
