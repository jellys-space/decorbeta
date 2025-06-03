// Sparkly mouse trail logic
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

document.addEventListener('DOMContentLoaded', () => {
  // Sparkle effects for avatars
  const wrappers = document.querySelectorAll('.artist-avatar-wrapper');

  wrappers.forEach(wrapper => {
    setInterval(() => {
      const sparkle = document.createElement('div');
      sparkle.classList.add('avatar-sparkle');

      const size = Math.random() * 4 + 4;
      sparkle.style.width = `${size}px`;
      sparkle.style.height = `${size}px`;

      const angle = Math.random() * 2 * Math.PI;
      const radius = 120;
      const centerX = 120;
      const centerY = 120;

      sparkle.style.left = `${centerX + radius * Math.cos(angle) - size / 2}px`;
      sparkle.style.top = `${centerY + radius * Math.sin(angle) - size / 2}px`;

      wrapper.appendChild(sparkle);

      sparkle.animate([
        { opacity: 0, transform: 'scale(0.8)' },
        { opacity: 1, transform: 'scale(1)', offset: 0.2 },
        { opacity: 0, transform: 'scale(1.4)' }
      ], {
        duration: 2500,
        easing: 'ease-in-out',
        iterations: 1
      });

      setTimeout(() => {
        sparkle.remove();
      }, 2500);
    }, 400);
  });

  // Device detection
  const isMobile = /iPhone|iPad|iPod|Android|webOS/i.test(navigator.userAgent);
  if (isMobile) {
    document.querySelectorAll('.artist-card').forEach(card => {
      card.classList.add('mobile-banner');
    });
  }

  // Modal Logic
const jellyCard = document.getElementById('jelly-card');
const desktopModal = document.getElementById('jelly-modal-desktop');
const mobileModal = document.getElementById('jelly-modal-mobile');

function openModal(modal) {
  modal.classList.add('active');
  const content = modal.querySelector('.modal-content');
  requestAnimationFrame(() => {
    content.classList.add('modal-show');
  });
}

function closeModal(modal) {
  const content = modal.querySelector('.modal-content');
  content.classList.remove('modal-show');
  setTimeout(() => {
    modal.classList.remove('active');
  }, 250); // match transition duration
}

jellyCard.addEventListener('click', () => {
  const isMobile = /android|iphone|ipad|ipod|blackberry|windows phone|opera mini/i.test(navigator.userAgent);
  const modal = isMobile ? mobileModal : desktopModal;
  openModal(modal);
});

[desktopModal, mobileModal].forEach(modal => {
  const closeBtn = modal.querySelector('.modal-close');

  closeBtn.addEventListener('click', () => closeModal(modal));

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(modal);
  });
});


});
