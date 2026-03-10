/* eslint-disable */
/* global WebImporter */

import cardsFeedParser from './parsers/cards-feed.js';
import cleanupTransformer from './transformers/starbucksreserve-cleanup.js';
import sectionsTransformer from './transformers/starbucksreserve-sections.js';

const parsers = {
  'cards-feed': cardsFeedParser,
};

const PAGE_TEMPLATE = {
  name: 'story-article',
  description: 'Story article pages with rich content including hero images, body text, embedded media, and related content',
  blocks: [
    { name: 'cards-feed', instances: ['.section_featured-feed .feed_list'] },
  ],
  sections: [
    { id: 'section-1', name: 'Article Header', selector: '.section_header', style: null, blocks: [], defaultContent: [] },
    { id: 'section-2', name: 'Article Body', selector: ['.section_full-width-image', '.section_image-cta'], style: null, blocks: [], defaultContent: [] },
    { id: 'section-3', name: 'Related Stories', selector: '.section_featured-feed', style: null, blocks: ['cards-feed'], defaultContent: [] },
  ],
};

const transformers = [cleanupTransformer, ...(PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : [])];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => { try { fn.call(null, hookName, element, enhancedPayload); } catch (e) { console.error(`Transformer failed:`, e); } });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
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
      if (parser) { try { parser(block.element, { document, url, params }); } catch (e) { console.error(`Failed to parse ${block.name}:`, e); } }
    });
    executeTransformers('afterTransform', main, payload);
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    const path = WebImporter.FileUtils.sanitizePath(new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''));
    return [{ element: main, path, report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) } }];
  },
};
