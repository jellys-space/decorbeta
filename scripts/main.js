document.addEventListener('DOMContentLoaded', () => {
  /********************************
   * 1) EXISTING DECORATION DOWNLOAD LOGIC
   ********************************/
  const decorationCells = document.querySelectorAll('.decoration-cell');

  decorationCells.forEach(cell => {
    cell.addEventListener('click', () => {
      const imagePath = cell.getAttribute('data-image');
      const link = document.createElement('a');
      link.href = imagePath;
      link.download = imagePath.split('/').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  });

  /********************************
   * 1b) DECORATION IMAGE LAZY LOADING
   ********************************/
  const lazyImages = document.querySelectorAll('.decoration-cell img, .default-avatar');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    });

    lazyImages.forEach(img => {
      if (!img.dataset.src) {
        img.dataset.src = img.src;
        img.src = '';
      }
      imageObserver.observe(img);
    });
  } else {
    // Fallback for older browsers
    lazyImages.forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
    });
  }

  /********************************
   * 2) CONFETTI: HELPER FUNCTION
   ********************************/
  function spawnConfettiPiece(container) {
    const confetti = document.createElement('img');

    const confettiImages = [
      'styles/1jelly.png',
      'styles/2jelly.png',
      'styles/3jelly.png',
      'styles/4jelly.png'
    ];

    const randomImage = confettiImages[Math.floor(Math.random() * confettiImages.length)];
    confetti.src = randomImage;
    confetti.classList.add('confetti-piece');

    const animationName = Math.random() < 0.5 ? 'confettiDriftCW' : 'confettiDriftCCW';
    confetti.style.animationName = animationName;

    const size = Math.floor(Math.random() * 20) + 30;
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;

    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.top = '-50px';

    const smallDelay = Math.random() * 0.5;
    confetti.style.animationDelay = `${smallDelay}s`;

    const duration = 10 + Math.random() * 10;
    confetti.style.animationDuration = `${duration}s`;

    confetti.addEventListener('animationend', () => {
      container.removeChild(confetti);
    });

    container.appendChild(confetti);
  }

  /********************************
   * 3) CONFETTI: CONTINUOUS SPAWN
   ********************************/
  const container = document.querySelector('.confetti-container');
  if (!container) return;

  for (let i = 0; i < 5; i++) {
    spawnConfettiPiece(container);
  }

  setInterval(() => {
    spawnConfettiPiece(container);
  }, 1000);

  /********************************
   * 3) SPARKLY MOUSE TRAIL
   ********************************/
  window.addEventListener('mousemove', function(e) {
    const arr = [1, 0.9, 0.8, 0.5, 0.2];

    arr.forEach(function(i) {
      const x = (1 - i) * 75;
      const star = document.createElement('div');
      star.className = 'star';

      star.style.top = e.clientY + Math.round(Math.random() * x - x / 2) + 'px';
      star.style.left = e.clientX + Math.round(Math.random() * x - x / 2) + 'px';

      document.body.appendChild(star);

      window.setTimeout(function() {
        document.body.removeChild(star);
      }, Math.round(Math.random() * i * 600));
    });
  }, false);

  /********************************
   * 4) ARTIST LINK VISITED STATE
   ********************************/
  const artistLinks = document.querySelectorAll('.artist-info a');

  artistLinks.forEach(link => {
    const linkKey = `visited-${link.href}`;

    if (localStorage.getItem(linkKey)) {
      link.classList.add('visited-artist-link');
    }

    link.addEventListener('click', () => {
      localStorage.setItem(linkKey, 'true');
    });
  });

  /********************************
   * 5) EASTER EGG: 10 QUICK CLICKS ON #jellyHomeImg
   ********************************/
  (function() {
    const jellyHomeImg = document.getElementById('jellyHomeImg');
    const easterEggModal = document.getElementById('easterEggModal');
    if (!jellyHomeImg || !easterEggModal) return;

    let clickCount = 0;
    let lastClickTime = 0;
    const maxGap = 2000; // 2 seconds

    jellyHomeImg.addEventListener('click', () => {
      const now = Date.now();
      if (now - lastClickTime > maxGap) {
        clickCount = 0;
      }
      lastClickTime = now;
      clickCount++;

      if (clickCount >= 10) {
        showEasterEgg();
        clickCount = 0;
      }
    });

    let rotateAnimationId = null;

    function showEasterEgg() {
      easterEggModal.classList.add('show');
      const modalContent = easterEggModal.querySelector('.modal-content');
      let angle = 0;

      function rotateGradient() {
        angle = (angle + 0.5) % 360;
        modalContent.style.setProperty('--angle', angle + 'deg');
        rotateAnimationId = requestAnimationFrame(rotateGradient);
      }

      rotateGradient();

      easterEggModal.addEventListener('click', hideEasterEgg, { once: true });
    }

    function hideEasterEgg() {
      easterEggModal.classList.remove('show');
      if (rotateAnimationId) {
        cancelAnimationFrame(rotateAnimationId);
        rotateAnimationId = null;
      }
    }
  })();

});
