import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  // Build slides
  const track = document.createElement('div');
  track.className = 'esb-carousel-track';

  const slides = [];
  rows.forEach((row, i) => {
    const slide = document.createElement('div');
    slide.className = 'esb-carousel-slide';
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-label', `${i + 1} / ${rows.length}`);

    const cols = [...row.children];
    // Column 0: image
    const imgCol = cols[0];
    const pic = imgCol?.querySelector('picture');
    const img = imgCol?.querySelector('img');
    if (pic) {
      const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '1200' }]);
      slide.append(optimized);
    } else if (img) {
      slide.append(img);
    }

    // Column 1: caption text
    if (cols[1]) {
      const caption = document.createElement('div');
      caption.className = 'esb-carousel-caption';
      caption.textContent = cols[1].textContent.trim();
      slide.append(caption);
    }

    slides.push(slide);
    track.append(slide);
  });

  // Carousel viewport (inner container for overflow clipping)
  const wrapper = document.createElement('div');
  wrapper.className = 'esb-carousel-viewport';
  wrapper.append(track);

  // Description text — check for a paragraph after slides
  const descBlock = block.closest('.section')?.querySelector('.default-content-wrapper p');

  // Navigation arrows
  const nav = document.createElement('div');
  nav.className = 'esb-carousel-nav';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'esb-carousel-prev';
  prevBtn.setAttribute('aria-label', 'Previous slide');
  prevBtn.innerHTML = '&#8249;';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'esb-carousel-next';
  nextBtn.setAttribute('aria-label', 'Next slide');
  nextBtn.innerHTML = '&#8250;';

  nav.append(prevBtn, nextBtn);

  // Dot indicators
  const dots = document.createElement('ul');
  dots.className = 'esb-carousel-dots';
  slides.forEach((_, i) => {
    const dot = document.createElement('li');
    const btn = document.createElement('button');
    btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
    if (i === 0) btn.classList.add('active');
    btn.addEventListener('click', () => goToSlide(i));
    dot.append(btn);
    dots.append(dot);
  });

  block.append(wrapper, nav, dots);

  // State
  let current = 0;
  let autoTimer = null;

  function goToSlide(index) {
    current = ((index % slides.length) + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.querySelectorAll('button').forEach((b, i) => {
      b.classList.toggle('active', i === current);
    });
  }

  prevBtn.addEventListener('click', () => {
    goToSlide(current - 1);
    resetAutoAdvance();
  });

  nextBtn.addEventListener('click', () => {
    goToSlide(current + 1);
    resetAutoAdvance();
  });

  // Auto-advance
  function startAutoAdvance() {
    if (slides.length <= 1) return;
    autoTimer = setInterval(() => goToSlide(current + 1), 5000);
  }

  function resetAutoAdvance() {
    clearInterval(autoTimer);
    startAutoAdvance();
  }

  // Pause on hover/focus
  block.addEventListener('mouseenter', () => clearInterval(autoTimer));
  block.addEventListener('mouseleave', () => startAutoAdvance());
  block.addEventListener('focusin', () => clearInterval(autoTimer));
  block.addEventListener('focusout', () => startAutoAdvance());

  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  block.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  block.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToSlide(current + 1);
      else goToSlide(current - 1);
      resetAutoAdvance();
    }
  }, { passive: true });

  // Keyboard navigation
  block.setAttribute('tabindex', '0');
  block.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      goToSlide(current - 1);
      resetAutoAdvance();
    } else if (e.key === 'ArrowRight') {
      goToSlide(current + 1);
      resetAutoAdvance();
    }
  });

  startAutoAdvance();
}
