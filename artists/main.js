// sparkly mouse trail logic
window.addEventListener('mousemove', function(e) {
    // Adjust how many stars + distribution
    const arr = [1, 0.9, 0.8, 0.5, 0.2];
  
    arr.forEach(function(i) {
      const x = (1 - i) * 75;
      const star = document.createElement('div');
      star.className = 'star';
  
      // Random offset around the cursor
      star.style.top = e.clientY + Math.round(Math.random() * x - x / 2) + 'px';
      star.style.left = e.clientX + Math.round(Math.random() * x - x / 2) + 'px';

  
      document.body.appendChild(star);
  
      // Remove star after random time
      window.setTimeout(function() {
        document.body.removeChild(star);
      }, Math.round(Math.random() * i * 600));
    });
  }, false);

  document.addEventListener('DOMContentLoaded', () => {
    const wrappers = document.querySelectorAll('.artist-avatar-wrapper');
  
    wrappers.forEach(wrapper => {
      setInterval(() => {
        const sparkle = document.createElement('div');
        sparkle.classList.add('avatar-sparkle');
  
        // Tiny random size (between 4px and 8px)
        const size = Math.random() * 4 + 4; // 4px to 8px
        sparkle.style.width = `${size}px`;
        sparkle.style.height = `${size}px`;
  
        // Circular random position
        const angle = Math.random() * 2 * Math.PI;
        const radius = 120; // distance from center
        const centerX = 120;
        const centerY = 120;
  
        sparkle.style.left = `${centerX + radius * Math.cos(angle) - size / 2}px`;
        sparkle.style.top = `${centerY + radius * Math.sin(angle) - size / 2}px`;
  
        wrapper.appendChild(sparkle);
  
        // Animate sparkle: FADE IN, FLOAT, FADE OUT
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
      }, 400); // Create sparkles faster (every 0.4s now!)
    });

const isMobile = /iPhone|iPad|iPod|Android|webOS/i.test(navigator.userAgent);

if (isMobile) {
  document.querySelectorAll('.artist-card').forEach(card => {
    card.classList.add('mobile-banner');
  });
}

// === Jelly modal logic (combined desktop & mobile) ===
const jellyCard = document.getElementById("jelly-card");
const jellyModal = document.getElementById("jelly-modal");
const jellyModalMobile = document.getElementById("jelly-modal-mobile");

const jellyContent = jellyModal.querySelector(".modal-content");
const jellyContentMobile = jellyModalMobile.querySelector(".modal-content.mobile"); // ✅ fixed selector

const jellyClose = jellyModal.querySelector(".modal-close");
const jellyCloseMobile = jellyModalMobile.querySelector(".modal-close");

jellyCard.addEventListener("click", () => {
  if (isMobile) {
    jellyModalMobile.classList.add("active");
    jellyContentMobile.style.animation = "modalZoomIn 0.18s forwards";
  } else {
    jellyModal.classList.add("active");
    jellyContent.style.animation = "modalZoomIn 0.18s forwards";
  }
});

jellyClose.addEventListener("click", () => {
  jellyContent.style.animation = "modalZoomOut 0.14s forwards";
  setTimeout(() => {
    jellyModal.classList.remove("active");
  }, 140);
});

jellyCloseMobile.addEventListener("click", () => {
  jellyContentMobile.style.animation = "modalZoomOut 0.14s forwards";
  setTimeout(() => {
    jellyModalMobile.classList.remove("active");
  }, 140);
});

window.addEventListener("click", (e) => {
  if (e.target === jellyModal) {
    jellyContent.style.animation = "modalZoomOut 0.14s forwards";
    setTimeout(() => {
      jellyModal.classList.remove("active");
    }, 140);
  }
  if (e.target === jellyModalMobile) {
    jellyContentMobile.style.animation = "modalZoomOut 0.14s forwards";
    setTimeout(() => {
      jellyModalMobile.classList.remove("active");
    }, 140);
  }
});


});
