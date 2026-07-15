(() => {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const previousButton = document.getElementById('prev');
  const nextButton = document.getElementById('next');
  const fullscreenButton = document.getElementById('fullscreen');
  const motionToggleButton = document.querySelector('.motion-toggle');
  const motionVideo = document.querySelector('.motion-video');
  const counter = document.getElementById('counter');
  const progress = document.getElementById('progress');

  if (!slides.length || !previousButton || !nextButton || !counter || !progress) return;

  const hashNumber = Number.parseInt(window.location.hash.slice(1), 10);
  let current = Number.isFinite(hashNumber) ? Math.min(Math.max(hashNumber - 1, 0), slides.length - 1) : 0;

  const render = () => {
    slides.forEach((slide, index) => {
      const active = index === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    if (motionVideo) {
      const motionSlideActive = motionVideo.closest('.slide')?.classList.contains('is-active');
      if (motionSlideActive) {
        motionVideo.currentTime = 0;
        motionVideo.play()
          .then(() => { if (motionToggleButton) motionToggleButton.textContent = 'PAUSE'; })
          .catch(() => { if (motionToggleButton) motionToggleButton.textContent = 'PLAY'; });
      } else {
        motionVideo.pause();
      }
    }
    counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    progress.style.width = `${((current + 1) / slides.length) * 100}%`;
    window.history.replaceState(null, '', `#${current + 1}`);
  };

  const goTo = (index) => {
    current = (index + slides.length) % slides.length;
    render();
  };

  previousButton.addEventListener('click', () => goTo(current - 1));
  nextButton.addEventListener('click', () => goTo(current + 1));
  fullscreenButton?.addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch (_) {
      // Fullscreen can be unavailable in embedded browsers. Navigation still works.
    }
  });

  motionToggleButton?.addEventListener('click', () => {
    if (!motionVideo) return;
    if (motionVideo.paused) {
      motionVideo.play().then(() => { motionToggleButton.textContent = 'PAUSE'; }).catch(() => {});
    } else {
      motionVideo.pause();
      motionToggleButton.textContent = 'PLAY';
    }
  });

  document.addEventListener('keydown', (event) => {
    if (['ArrowRight', 'PageDown', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      goTo(current + 1);
    }
    if (['ArrowLeft', 'PageUp', 'Backspace'].includes(event.key)) {
      event.preventDefault();
      goTo(current - 1);
    }
    if (event.key === 'Home') goTo(0);
    if (event.key === 'End') goTo(slides.length - 1);
  });

  let touchStartX = null;
  document.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0]?.clientX ?? null;
  }, { passive: true });
  document.addEventListener('touchend', (event) => {
    if (touchStartX === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX;
    const delta = endX - touchStartX;
    if (Math.abs(delta) > 48) goTo(current + (delta < 0 ? 1 : -1));
    touchStartX = null;
  }, { passive: true });

  window.addEventListener('hashchange', () => {
    const requested = Number.parseInt(window.location.hash.slice(1), 10);
    if (Number.isFinite(requested)) {
      current = Math.min(Math.max(requested - 1, 0), slides.length - 1);
      render();
    }
  });

  render();
})();
