/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: starbucksreserve cleanup.
 * Selectors from captured DOM of starbucksreserve.com/about.
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Remove cookie/consent banners and overlays (from captured DOM)
    WebImporter.DOMUtils.remove(element, [
      '#consent_blackbar',
      '#truste-consent-track',
      '#teconsent',
      'iframe.ta-display-none',
      '.w-nav-overlay',
    ]);
  }
  if (hookName === H.after) {
    // Remove non-authorable site chrome (from captured DOM)
    WebImporter.DOMUtils.remove(element, [
      '.navbar18_component',
      '.footer4_component',
      '.w-embed.w-iframe',
      '.global-styles',
      'noscript',
      'iframe',
      'link',
    ]);
  }
}
