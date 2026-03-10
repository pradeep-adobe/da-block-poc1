export default function decorate(block) {
  const wrapper = document.createElement('div');
  wrapper.className = 'esb-divider-line';

  // Check if block contains an image (decorative divider PNG)
  const img = block.querySelector('img');
  if (img) {
    img.setAttribute('loading', 'lazy');
    img.setAttribute('alt', img.alt || 'Decorative divider');
    wrapper.append(img);
  }

  block.textContent = '';
  block.append(wrapper);
}
