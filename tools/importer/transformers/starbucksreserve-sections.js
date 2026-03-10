/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: starbucksreserve sections.
 * Adds section breaks (<hr>) between sections defined in page-templates.json.
 * Adds section-metadata blocks for sections with style values.
 * Runs in afterTransform only.
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.after) {
    const { document } = payload;
    const template = payload.template;

    if (!template || !template.sections || template.sections.length < 2) {
      return;
    }

    const sections = template.sections;

    // Process sections in reverse order to avoid index shifts
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      const selector = Array.isArray(section.selector) ? section.selector : [section.selector];

      let sectionEl = null;
      for (const sel of selector) {
        sectionEl = element.querySelector(sel);
        if (sectionEl) break;
      }

      if (!sectionEl) continue;

      // Add section-metadata block if section has a style
      if (section.style) {
        const metaBlock = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.append(metaBlock);
      }

      // Add <hr> before section (except first section, and only if there's content before it)
      if (i > 0) {
        const hr = document.createElement('hr');
        sectionEl.before(hr);
      }
    }
  }
}
