/**
 * Collage block — displays 4 images in an asymmetric grid alongside text content.
 *
 * Content model (one row, two cells):
 *   Cell 1: <p> with 4 <img> elements (image grid)
 *   Cell 2: <h2> + <p> description + <p><a> CTA
 *
 * Variants:
 *   collage-left  → images on left, text on right (default)
 *   collage-right → text on left, images on right
 *
 * Each image gets a subtle parallax translateY on scroll.
 */
export default function decorate(block) {
  const isRight = block.classList.contains('right');
  const rows = [...block.children];
  if (rows.length === 0) return;

  // Expect a single row with two cells: images + text
  const row = rows[0];
  const cells = [...row.children];
  if (cells.length < 2) return;

  const imagesCell = cells[0];
  const textCell = cells[1];

  // Extract all images from the images cell
  const images = [...imagesCell.querySelectorAll('img')];
  if (images.length === 0) return;

  // Build the collage structure
  block.textContent = '';

  // Image grid wrapper
  const imageGrid = document.createElement('div');
  imageGrid.className = 'collage-images';

  images.forEach((img, i) => {
    const wrapper = document.createElement('div');
    wrapper.className = `collage-img collage-img-${i + 1}`;
    wrapper.setAttribute('data-parallax-speed', getParallaxSpeed(i));
    img.loading = i < 2 ? 'eager' : 'lazy';
    wrapper.appendChild(img);
    imageGrid.appendChild(wrapper);
  });

  // Text content wrapper
  const textContent = document.createElement('div');
  textContent.className = 'collage-content';
  if (isRight) textContent.classList.add('text-right');

  // Move all children from text cell
  while (textCell.firstChild) {
    textContent.appendChild(textCell.firstChild);
  }

  // Decorate CTA links
  const links = textContent.querySelectorAll('a');
  links.forEach((a) => {
    if (a.closest('h2') || a.closest('h3')) return;
    a.classList.add('collage-cta');
  });

  // Divider line
  const divider = document.createElement('div');
  divider.className = 'collage-divider';

  // Assemble in correct order
  if (isRight) {
    block.appendChild(textContent);
    block.appendChild(imageGrid);
  } else {
    block.appendChild(imageGrid);
    block.appendChild(textContent);
  }
  block.appendChild(divider);

  // Setup parallax scroll effect
  setupParallax(block);
}

function getParallaxSpeed(index) {
  // Different speeds create the staggered parallax effect
  const speeds = [0.03, 0.06, 0.08, 0.04];
  return speeds[index] || 0.04;
}

function setupParallax(block) {
  const images = block.querySelectorAll('.collage-img');
  if (images.length === 0) return;

  let ticking = false;

  function updateParallax() {
    const blockRect = block.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Only animate when block is in view
    if (blockRect.bottom < 0 || blockRect.top > viewportHeight) {
      ticking = false;
      return;
    }

    // Calculate scroll progress relative to viewport
    const scrollProgress = (viewportHeight - blockRect.top) / (viewportHeight + blockRect.height);

    images.forEach((img) => {
      const speed = parseFloat(img.getAttribute('data-parallax-speed') || 0.04);
      const offset = (scrollProgress - 0.5) * speed * viewportHeight;
      img.style.transform = `translateY(${offset}px)`;
    });

    ticking = false;
  }

  // Use IntersectionObserver to only listen to scroll when visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        window.addEventListener('scroll', onScroll, { passive: true });
        updateParallax();
      } else {
        window.removeEventListener('scroll', onScroll);
      }
    });
  }, { threshold: 0 });

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  observer.observe(block);
  // Initial position
  updateParallax();
}
