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

  // tools/importer/import-about-page.js
  var import_about_page_exports = {};
  __export(import_about_page_exports, {
    default: () => import_about_page_default
  });

  // tools/importer/parsers/columns-info.js
  function parse(element, { document }) {
    const isImageLeft = element.classList.contains("image-left_component");
    const isImageRight = element.classList.contains("image-right_component");
    const img = element.querySelector(".image-wrapper img, .image-left_image, .image-right_image-wrapper img, .image-right_image");
    const contentContainer = element.querySelector(".image-left_content, .image-right_content");
    const contentCell = [];
    if (contentContainer) {
      const heading = contentContainer.querySelector("h1, h2, h3, h4, h5, h6");
      if (heading) contentCell.push(heading);
      const paragraphs = contentContainer.querySelectorAll(":scope > p, :scope > div > p");
      paragraphs.forEach((p) => {
        if (p.textContent.trim()) contentCell.push(p);
      });
      const ctas = contentContainer.querySelectorAll("a.button, a.link, a.is-link");
      ctas.forEach((cta) => contentCell.push(cta));
    }
    const imageCell = [];
    if (img) imageCell.push(img);
    let cells;
    if (isImageRight) {
      cells = [contentCell, imageCell];
    } else {
      cells = [imageCell, contentCell];
    }
    const block = WebImporter.Blocks.createBlock(document, {
      name: "columns-info",
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

  // tools/importer/import-about-page.js
  var parsers = {
    "columns-info": parse,
    "cards-location": parse2
  };
  var PAGE_TEMPLATE = {
    name: "about-page",
    description: "About page with hero header, full-width image, two-column content sections, and location feed grid",
    urls: [
      "https://www.starbucksreserve.com/about"
    ],
    blocks: [
      {
        name: "columns-info",
        instances: [".image-left_component", ".image-right_component"]
      },
      {
        name: "cards-location",
        instances: [".feed_list.is-locations"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Page Header",
        selector: ".section_header",
        style: null,
        blocks: [],
        defaultContent: [".section_header h1", ".section_header .text-style-subheading"]
      },
      {
        id: "section-2",
        name: "Full-Width Image",
        selector: ".section_full-width-image",
        style: null,
        blocks: [],
        defaultContent: [".full-width-image.is-landscape"]
      },
      {
        id: "section-3",
        name: "What is Starbucks Reserve",
        selector: ".section_image-left",
        style: null,
        blocks: ["columns-info"],
        defaultContent: []
      },
      {
        id: "section-4",
        name: "Where To Find Us",
        selector: ".section_image-right",
        style: null,
        blocks: ["columns-info"],
        defaultContent: []
      },
      {
        id: "section-5",
        name: "Roasteries Location Feed",
        selector: ".section_location-feed",
        style: null,
        blocks: ["cards-location"],
        defaultContent: []
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
  var import_about_page_default = {
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
  return __toCommonJS(import_about_page_exports);
})();
