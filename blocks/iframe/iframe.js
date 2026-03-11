export default function decorate(block) {
  const rows = [...block.children];
  const link = block.querySelector('a');
  const url = link ? link.href : rows[0]?.textContent?.trim();

  block.textContent = '';

  if (url) {
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('frameborder', '0');
    iframe.title = 'Embedded content';

    const wrapper = document.createElement('div');
    wrapper.className = 'iframe-wrapper';
    wrapper.appendChild(iframe);
    block.appendChild(wrapper);
  }
}
