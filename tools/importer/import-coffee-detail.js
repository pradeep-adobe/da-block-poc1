/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import columnsCoffeeParser from './parsers/columns-coffee.js';
import cardsBrewParser from './parsers/cards-brew.js';
import cardsFeedParser from './parsers/cards-feed.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/starbucksreserve-cleanup.js';
import sectionsTransformer from './transformers/starbucksreserve-sections.js';

// PARSER REGISTRY
const parsers = {
  'columns-coffee': columnsCoffeeParser,
  'cards-brew': cardsBrewParser,
  'cards-feed': cardsFeedParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'coffee-detail',
  description: 'Individual coffee detail pages with origin info, tasting notes, brewing recommendations, and imagery',
  blocks: [
    {
      name: 'columns-coffee',
      instances: ['.coffee-header_component'],
    },
    {
      name: 'cards-brew',
      instances: ['.feed_list.is-brew-guides'],
    },
    {
      name: 'cards-feed',
      instances: ['.section_featured-feed:not(.divier-top) .feed_list', '.section_featured-feed.divier-top .feed_list'],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Coffee Header',
      selector: '.coffee-header_component',
      style: null,
      blocks: ['columns-coffee'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'Coffee Details',
      selector: '.section_coffee-content-right',
      style: null,
      blocks: [],
      defaultContent: ['.layout3_content-copy'],
    },
    {
      id: 'section-3',
      name: 'Brew Guides',
      selector: '.section_brew-feed',
      style: null,
      blocks: ['cards-brew'],
      defaultContent: [],
    },
    {
      id: 'section-4',
      name: 'Related Stories',
      selector: '.section_featured-feed:not(.divier-top)',
      style: null,
      blocks: ['cards-feed'],
      defaultContent: [],
    },
    {
      id: 'section-5',
      name: 'Select Coffees',
      selector: '.section_featured-feed.divier-top',
      style: null,
      blocks: ['cards-feed'],
      defaultContent: [],
    },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
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
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

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
