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
  img.loading = 'lazy';
  block.appendChild(img);

  // Fade-in on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        block.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(block);
}
