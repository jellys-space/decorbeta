document.addEventListener('DOMContentLoaded', () => {

  /********************************
   * 1) DECORATION MODAL LOGIC
   ********************************/
  const decorationWraps = document.querySelectorAll('.decoration-wrap');

  const modal = document.getElementById('decorationModal');
  const modalInner = modal.querySelector('.modal-inner');
  const modalDefaultAvatar = modal.querySelector('.modal-default-avatar');
  const modalDecorationImg = modal.querySelector('.modal-decoration-img');
  const modalTitle = modal.querySelector('.modal-decoration-title');
  const modalArtist = modal.querySelector('.modal-artist-name');
  const modalCommission = modal.querySelector('.modal-commission-info');
  const downloadButton = modal.querySelector('.download-button');

  let scrollPosition = 0;

  decorationWraps.forEach(wrap => {
    wrap.addEventListener('click', () => {
      const cell = wrap.querySelector('.decoration-cell');
      if (!cell) return;

      const imagePath = cell.getAttribute('data-image');
      const decorationAlt = cell.querySelector('.decoration-img').alt;

      modalDefaultAvatar.src = 'images/default-avatar.png';
      modalDecorationImg.src = imagePath;
      modalDecorationImg.alt = decorationAlt;

      modalTitle.textContent = decorationAlt;

      const artistName = cell.getAttribute('data-artist') || '';
      modalArtist.textContent = artistName ? `by ${artistName}` : '';

      const commissionElement = cell.querySelector('.commission-message');

      if (commissionElement && commissionElement.innerHTML.trim().length > 0) {
        modalCommission.innerHTML = commissionElement.innerHTML;
        modalCommission.style.display = 'block';
      } else {
        modalCommission.innerHTML = '';
        modalCommission.style.display = 'none';
      }

      

      // SHOW MODAL
      scrollPosition = window.scrollY || window.pageYOffset;

      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPosition}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';

      modal.style.visibility = 'visible';
      modal.style.opacity = '1';
      modal.style.pointerEvents = 'auto';
    });
  });

  // Close modal on click outside modal-content
  modal.addEventListener('click', (e) => {
    const modalContent = modal.querySelector('.modal-content');
    if (!modalContent.contains(e.target)) {
      closeModal();
    }
  });

  // Download button action
  downloadButton.addEventListener('click', () => {
    const imagePath = modalDecorationImg.src;
    const link = document.createElement('a');
    link.href = imagePath;
    const fileName = decodeURIComponent(imagePath.split('/').pop());
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });  

  // ESC key or F5 closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.visibility === 'visible') {
      closeModal();
    }
    if (e.key === 'F5' && modal.style.visibility === 'visible') {
      e.preventDefault(); // Stop browser refresh
      closeModal(true); // Reload manually after closing
    }
  });

  // HELPER: close modal cleanly
  function closeModal(forceReload = false) {
    modal.style.opacity = '0';
    modalInner.style.transform = 'scale(0.95)';

    setTimeout(() => {
      modal.style.visibility = 'hidden';
      modal.style.pointerEvents = 'none';

      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';

      window.scrollTo(0, scrollPosition);

      if (forceReload) {
        location.reload();
      }
    }, 200); // matches fade duration
  }

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
  if (container) {
    for (let i = 0; i < 5; i++) {
      spawnConfettiPiece(container);
    }

    setInterval(() => {
      spawnConfettiPiece(container);
    }, 1000);
  }

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
(function () {
  const jellyHomeImg = document.getElementById('jellyHomeImg');
  const easterEggModal = document.getElementById('easterEggModal');
  const modalContent = easterEggModal?.querySelector('.easter-modal-content');
  if (!jellyHomeImg || !easterEggModal || !modalContent) return;

  let clickCount = 0;
  let lastClickTime = 0;
  const maxGap = 2000; // Max time between clicks (ms)
  let rotateAnimationId = null;

  // Track clicks on the jelly image
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

  function showEasterEgg() {
    easterEggModal.classList.add('show');

    // Start animated gradient
    let angle = 0;
    function rotateGradient() {
      angle = (angle + 0.5) % 360;
      modalContent.style.setProperty('--angle', angle + 'deg');
      rotateAnimationId = requestAnimationFrame(rotateGradient);
    }
    rotateGradient();

    // Wait one frame to avoid immediate closure from same click
    requestAnimationFrame(() => {
      const outsideClickHandler = (e) => {
        if (!modalContent.contains(e.target)) {
          hideEasterEgg();
          document.removeEventListener('click', outsideClickHandler);
        }
      };
      document.addEventListener('click', outsideClickHandler);
    });
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
