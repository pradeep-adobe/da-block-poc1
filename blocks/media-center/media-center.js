/**
 * Media Center block — displays a centered image/logo between sections.
 *
 * Content model (one row, one cell):
 *   Cell 1: <p><img src="..."></p>
 *
 * Adds fade-in animation on scroll.
 */
export default function decorate(block) {
  const img = block.querySelector('img');
  if (!img) return;

  block.textContent = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'media-center-wrapper';
  img.loading = 'lazy';
  wrapper.appendChild(img);
  block.appendChild(wrapper);

  // Fade-in on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        wrapper.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(block);
}
