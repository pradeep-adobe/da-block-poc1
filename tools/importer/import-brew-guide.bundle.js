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

  // tools/importer/import-brew-guide.js
  var import_brew_guide_exports = {};
  __export(import_brew_guide_exports, {
    default: () => import_brew_guide_default
  });

  // tools/importer/parsers/columns-coffee.js
  function parse(element, { document }) {
    const contentDiv = element.querySelector(".layout3_content");
    const imgDiv = element.querySelector(".image-right_image-wrapper img, ._2-image-right_image-1");
    const textCell = [];
    if (contentDiv) {
      const heading = contentDiv.querySelector("h1, h2, h3");
      if (heading) textCell.push(heading);
      const subtitle = contentDiv.querySelector(".text-style-subheading, p");
      if (subtitle) textCell.push(subtitle);
    }
    const imageCell = [];
    if (imgDiv) imageCell.push(imgDiv);
    const cells = [[textCell, imageCell]];
    const block = WebImporter.Blocks.createBlock(document, {
      name: "columns-coffee",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-brew.js
  function parse2(element, { document }) {
    const items = element.querySelectorAll(".team6_item");
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector(".team6_image-wrapper img, .team6_image");
      const title = item.querySelector("h3, .text-style-subheading");
      const link = item.querySelector("a.link, a");
      if (!img && !title && !link) return;
      const imageCell = [];
      if (img) imageCell.push(img);
      const textCell = [];
      if (title) textCell.push(title);
      if (link) textCell.push(link);
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, {
      name: "cards-brew",
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

  // tools/importer/transformers/starbucksreserve-sections.js
  var H2 = { before: "beforeTransform", after: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === H2.after) {
      const { document } = payload;
      const template = payload.template;
      if (!template || !template.sections || template.sections.length < 2) {
        return;
      }
      const sections = template.sections;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const selector = Array.isArray(section.selector) ? section.selector : [section.selector];
        let sectionEl = null;
        for (const sel of selector) {
          sectionEl = element.querySelector(sel);
          if (sectionEl) break;
        }
        if (!sectionEl) continue;
        if (section.style) {
          const metaBlock = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.append(metaBlock);
        }
        if (i > 0) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-brew-guide.js
  var parsers = {
    "columns-coffee": parse,
    "cards-brew": parse2
  };
  var PAGE_TEMPLATE = {
    name: "brew-guide",
    blocks: [
      {
        name: "columns-coffee",
        instances: [".coffee-header_component"]
      },
      {
        name: "cards-brew",
        instances: [".feed_list.is-brew-guides"]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
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
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_brew_guide_default = {
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
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_brew_guide_exports);
})();
