var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-home-page.js
  var import_home_page_exports = {};
  __export(import_home_page_exports, {
    default: () => import_home_page_default
  });

  // tools/importer/parsers/cards-feed.js
  function parse(element, { document }) {
    const items = element.querySelectorAll(".feed_item");
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector(".feed_image-wrapper img, .feed_image");
      const label = item.querySelector(".feed_item-label");
      const title = item.querySelector("h2, h3, .feed_item-title");
      const link = item.querySelector("a.link, a");
      if (!img && !title && !link) return;
      const imageCell = [];
      if (img) imageCell.push(img);
      const textCell = [];
      if (label) textCell.push(label);
      if (title) textCell.push(title);
      if (link) textCell.push(link);
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, {
      name: "cards-feed",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-location.js
  function parse2(element, { document }) {
    const items = element.querySelectorAll(".team6_item");
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector(".team6_image-wrapper img, .team6_image");
      const link = item.querySelector("a.text-link, a");
      if (!img && !link) return;
      const imageCell = [];
      if (img) imageCell.push(img);
      const textCell = [];
      if (link) textCell.push(link);
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, {
      name: "cards-location",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/transformers/starbucksreserve-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        "#consent_blackbar",
        "#truste-consent-track",
        "#teconsent",
        "iframe.ta-display-none",
        ".w-nav-overlay"
      ]);
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        ".navbar18_component",
        ".footer4_component",
        ".w-embed.w-iframe",
        ".global-styles",
        "noscript",
        "iframe",
        "link"
      ]);
    }
  }

  // tools/importer/import-home-page.js
  var parsers = {
    "cards-feed": parse,
    "cards-location": parse2
  };
  var PAGE_TEMPLATE = {
    name: "home-page",
    description: "Home page with hero section, collage sections, featured coffee feed, roastery locations, and related stories",
    blocks: [
      { name: "cards-feed", instances: [".section_featured-feed .feed_list"] },
      { name: "cards-location", instances: [".section_location-feed .team6_list"] }
    ],
    sections: []
  };
  var transformers = [transform];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed:`, e);
      }
    });
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
  var import_home_page_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name}:`, e);
          }
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index");
      return [{ element: main, path, report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) } }];
    }
  };
  return __toCommonJS(import_home_page_exports);
})();
