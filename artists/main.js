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

      const video = card.querySelector('video.artist-banner');
      if (video) {
        const fallbackImg = video.querySelector('img');
        if (fallbackImg) {
          const img = fallbackImg.cloneNode(true);
          card.replaceChild(img, video);
        }
      }
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

// === SEELE MODAL LOGIC ===
const seeleCard = document.getElementById('seele-card');
const seeleDesktop = document.getElementById('seele-modal-desktop');
const seeleMobile = document.getElementById('seele-modal-mobile');

function openSeeleModal(modal) {
  modal.classList.add('active');
  const content = modal.querySelector('.seele-modal-content');
  requestAnimationFrame(() => {
    content.classList.add('modal-show');
  });
}

function closeSeeleModal(modal) {
  const content = modal.querySelector('.seele-modal-content');
  content.classList.remove('modal-show');
  setTimeout(() => {
    modal.classList.remove('active');
  }, 250);
}

seeleCard.addEventListener('click', () => {
  const isMobile = /android|iphone|ipad|ipod|blackberry|windows phone|opera mini/i.test(navigator.userAgent);
  const modal = isMobile ? seeleMobile : seeleDesktop;
  openSeeleModal(modal);
});

[seeleDesktop, seeleMobile].forEach(modal => {
  const closeBtn = modal.querySelector('.seele-modal-close');
  closeBtn.addEventListener('click', () => closeSeeleModal(modal));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeSeeleModal(modal);
  });
});

// === Ca-Cawthon Modal Logic ===
const cacawthonCard = document.getElementById('cacawthon-card');
const cacawthonDesktop = document.getElementById('cacawthon-modal-desktop');
const cacawthonMobile = document.getElementById('cacawthon-modal-mobile');

function openCacawthonModal(modal) {
  modal.classList.add('active');
  const content = modal.querySelector('.cacawthon-modal-content');
  requestAnimationFrame(() => {
    content.classList.add('modal-show');
  });
}

function closeCacawthonModal(modal) {
  const content = modal.querySelector('.cacawthon-modal-content');
  content.classList.remove('modal-show');
  setTimeout(() => {
    modal.classList.remove('active');
  }, 250);
}

cacawthonCard.addEventListener('click', () => {
  const isMobile = /android|iphone|ipad|ipod|blackberry|windows phone|opera mini/i.test(navigator.userAgent);
  const modal = isMobile ? cacawthonMobile : cacawthonDesktop;
  openCacawthonModal(modal);
});

[cacawthonDesktop, cacawthonMobile].forEach(modal => {
  const closeBtn = modal.querySelector('.cacawthon-modal-close');
  closeBtn.addEventListener('click', () => closeCacawthonModal(modal));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeCacawthonModal(modal);
  });
});

// === Nuki Modal Logic ===
const nukiCard = document.getElementById('nuki-card');
const nukiDesktop = document.getElementById('nuki-modal-desktop');
const nukiMobile = document.getElementById('nuki-modal-mobile');

function openNukiModal(modal) {
  modal.classList.add('active');
  const content = modal.querySelector('.nuki-modal-content');
  requestAnimationFrame(() => {
    content.classList.add('modal-show');
  });
}

function closeNukiModal(modal) {
  const content = modal.querySelector('.nuki-modal-content');
  content.classList.remove('modal-show');
  setTimeout(() => {
    modal.classList.remove('active');
  }, 250);
}

nukiCard.addEventListener('click', () => {
  const isMobile = /android|iphone|ipad|ipod|blackberry|windows phone|opera mini/i.test(navigator.userAgent);
  const modal = isMobile ? nukiMobile : nukiDesktop;
  openNukiModal(modal);
});

[nukiDesktop, nukiMobile].forEach(modal => {
  const closeBtn = modal.querySelector('.nuki-modal-close');
  closeBtn.addEventListener('click', () => closeNukiModal(modal));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeNukiModal(modal);
  });
});

// === Serenemist Modal Logic ===
const serenemistCard = document.getElementById('serenemist-card');
const serenemistDesktop = document.getElementById('serenemist-modal-desktop');
const serenemistMobile = document.getElementById('serenemist-modal-mobile');

function openSerenemistModal(modal) {
  modal.classList.add('active');
  const content = modal.querySelector('.serenemist-modal-content');
  requestAnimationFrame(() => {
    content.classList.add('modal-show');
  });
}

function closeSerenemistModal(modal) {
  const content = modal.querySelector('.serenemist-modal-content');
  content.classList.remove('modal-show');
  setTimeout(() => {
    modal.classList.remove('active');
  }, 250);
}

serenemistCard.addEventListener('click', () => {
  const isMobile = /android|iphone|ipad|ipod|blackberry|windows phone|opera mini/i.test(navigator.userAgent);
  const modal = isMobile ? serenemistMobile : serenemistDesktop;
  openSerenemistModal(modal);
});

[serenemistDesktop, serenemistMobile].forEach(modal => {
  const closeBtn = modal.querySelector('.serenemist-modal-close');
  closeBtn.addEventListener('click', () => closeSerenemistModal(modal));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeSerenemistModal(modal);
  });
});

// === Alide Modal Logic ===
const alideCard = document.getElementById('alide-card');
const alideDesktop = document.getElementById('alide-modal-desktop');
const alideMobile = document.getElementById('alide-modal-mobile');

function openAlideModal(modal) {
  modal.classList.add('active');
  const content = modal.querySelector('.alide-modal-content');
  requestAnimationFrame(() => {
    content.classList.add('modal-show');
  });
}

function closeAlideModal(modal) {
  const content = modal.querySelector('.alide-modal-content');
  content.classList.remove('modal-show');
  setTimeout(() => {
    modal.classList.remove('active');
  }, 250);
}

alideCard.addEventListener('click', () => {
  const isMobile = /android|iphone|ipad|ipod|blackberry|windows phone|opera mini/i.test(navigator.userAgent);
  const modal = isMobile ? alideMobile : alideDesktop;
  openAlideModal(modal);
});

[alideDesktop, alideMobile].forEach(modal => {
  const closeBtn = modal.querySelector('.alide-modal-close');
  closeBtn.addEventListener('click', () => closeAlideModal(modal));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeAlideModal(modal);
  });
});

// === Cal Modal Logic ===
const calCard = document.getElementById('cal-card');
const calDesktop = document.getElementById('cal-modal-desktop');
const calMobile = document.getElementById('cal-modal-mobile');

function openCalModal(modal) {
  modal.classList.add('active');
  const content = modal.querySelector('.cal-modal-content');
  requestAnimationFrame(() => {
    content.classList.add('modal-show');
  });
}

function closeCalModal(modal) {
  const content = modal.querySelector('.cal-modal-content');
  content.classList.remove('modal-show');
  setTimeout(() => {
    modal.classList.remove('active');
  }, 250);
}

calCard.addEventListener('click', () => {
  const isMobile = /android|iphone|ipad|ipod|blackberry|windows phone|opera mini/i.test(navigator.userAgent);
  const modal = isMobile ? calMobile : calDesktop;
  openCalModal(modal);
});

[calDesktop, calMobile].forEach(modal => {
  const closeBtn = modal.querySelector('.cal-modal-close');
  closeBtn.addEventListener('click', () => closeCalModal(modal));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeCalModal(modal);
  });
});

// === Phineas Modal Logic ===
const phineasCard = document.getElementById('phineas-card');
const phineasDesktop = document.getElementById('phineas-modal-desktop');
const phineasMobile = document.getElementById('phineas-modal-mobile');

function openPhineasModal(modal) {
  modal.classList.add('active');
  const content = modal.querySelector('.phineas-modal-content');
  requestAnimationFrame(() => {
    content.classList.add('modal-show');
  });
}

function closePhineasModal(modal) {
  const content = modal.querySelector('.phineas-modal-content');
  content.classList.remove('modal-show');
  setTimeout(() => {
    modal.classList.remove('active');
  }, 250);
}

phineasCard.addEventListener('click', () => {
  const isMobile = /android|iphone|ipad|ipod|blackberry|windows phone|opera mini/i.test(navigator.userAgent);
  const modal = isMobile ? phineasMobile : phineasDesktop;
  openPhineasModal(modal);
});

[phineasDesktop, phineasMobile].forEach(modal => {
  const closeBtn = modal.querySelector('.phineas-modal-close');
  closeBtn.addEventListener('click', () => closePhineasModal(modal));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closePhineasModal(modal);
  });
});

// === Shadow Modal Logic ===
const shadowCard = document.getElementById('shadow-card');
const shadowDesktop = document.getElementById('shadow-modal-desktop');
const shadowMobile = document.getElementById('shadow-modal-mobile');

function openShadowModal(modal) {
  modal.classList.add('active');
  const content = modal.querySelector('.shadow-modal-content');
  requestAnimationFrame(() => {
    content.classList.add('modal-show');
  });
}

function closeShadowModal(modal) {
  const content = modal.querySelector('.shadow-modal-content');
  content.classList.remove('modal-show');
  setTimeout(() => {
    modal.classList.remove('active');
  }, 250);
}

shadowCard.addEventListener('click', () => {
  const isMobile = /android|iphone|ipad|ipod|blackberry|windows phone|opera mini/i.test(navigator.userAgent);
  const modal = isMobile ? shadowMobile : shadowDesktop;
  openShadowModal(modal);
});

[shadowDesktop, shadowMobile].forEach(modal => {
  const closeBtn = modal.querySelector('.shadow-modal-close');
  closeBtn.addEventListener('click', () => closeShadowModal(modal));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeShadowModal(modal);
  });
});

// === Palco Modal Logic ===
const palcoCard = document.getElementById('palco-card');
const palcoDesktop = document.getElementById('palco-modal-desktop');
const palcoMobile = document.getElementById('palco-modal-mobile');

function openPalcoModal(modal) {
  modal.classList.add('active');
  const content = modal.querySelector('.palco-modal-content');
  requestAnimationFrame(() => {
    content.classList.add('modal-show');
  });
}

function closePalcoModal(modal) {
  const content = modal.querySelector('.palco-modal-content');
  content.classList.remove('modal-show');
  setTimeout(() => {
    modal.classList.remove('active');
  }, 250);
}

palcoCard.addEventListener('click', () => {
  const isMobile = /android|iphone|ipad|ipod|blackberry|windows phone|opera mini/i.test(navigator.userAgent);
  const modal = isMobile ? palcoMobile : palcoDesktop;
  openPalcoModal(modal);
});

[palcoDesktop, palcoMobile].forEach(modal => {
  const closeBtn = modal.querySelector('.palco-modal-close');
  closeBtn.addEventListener('click', () => closePalcoModal(modal));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closePalcoModal(modal);
  });
});

// === Foxy Modal Logic ===
const foxyCard = document.getElementById('foxy-card');
const foxyDesktop = document.getElementById('foxy-modal-desktop');
const foxyMobile = document.getElementById('foxy-modal-mobile');

function openFoxyModal(modal) {
  modal.classList.add('active');
  const content = modal.querySelector('.foxy-modal-content');
  requestAnimationFrame(() => {
    content.classList.add('modal-show');
  });
}

function closeFoxyModal(modal) {
  const content = modal.querySelector('.foxy-modal-content');
  content.classList.remove('modal-show');
  setTimeout(() => {
    modal.classList.remove('active');
  }, 250);
}

foxyCard.addEventListener('click', () => {
  const isMobile = /android|iphone|ipad|ipod|blackberry|windows phone|opera mini/i.test(navigator.userAgent);
  const modal = isMobile ? foxyMobile : foxyDesktop;
  openFoxyModal(modal);
});

[foxyDesktop, foxyMobile].forEach(modal => {
  const closeBtn = modal.querySelector('.foxy-modal-close');
  closeBtn.addEventListener('click', () => closeFoxyModal(modal));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeFoxyModal(modal);
  });
});

// === T8dy1 Modal Logic ===
const t8dy1Card = document.getElementById('t8dy1-card');
const t8dy1Desktop = document.getElementById('t8dy1-modal-desktop');
const t8dy1Mobile = document.getElementById('t8dy1-modal-mobile');

function openT8dy1Modal(modal) {
  modal.classList.add('active');
  const content = modal.querySelector('.t8dy1-modal-content');
  requestAnimationFrame(() => {
    content.classList.add('modal-show');
  });
}

function closeT8dy1Modal(modal) {
  const content = modal.querySelector('.t8dy1-modal-content');
  content.classList.remove('modal-show');
  setTimeout(() => {
    modal.classList.remove('active');
  }, 250);
}

t8dy1Card.addEventListener('click', () => {
  const isMobile = /android|iphone|ipad|ipod|blackberry|windows phone|opera mini/i.test(navigator.userAgent);
  const modal = isMobile ? t8dy1Mobile : t8dy1Desktop;
  openT8dy1Modal(modal);
});

[t8dy1Desktop, t8dy1Mobile].forEach(modal => {
  const closeBtn = modal.querySelector('.t8dy1-modal-close');
  closeBtn.addEventListener('click', () => closeT8dy1Modal(modal));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeT8dy1Modal(modal);
  });
});

// === Sharr Modal Logic ===
const sharrCard = document.getElementById('sharr-card');
const sharrDesktop = document.getElementById('sharr-modal-desktop');
const sharrMobile = document.getElementById('sharr-modal-mobile');

function openSharrModal(modal) {
  modal.classList.add('active');
  const content = modal.querySelector('.sharr-modal-content');
  requestAnimationFrame(() => {
    content.classList.add('modal-show');
  });
}

function closeSharrModal(modal) {
  const content = modal.querySelector('.sharr-modal-content');
  content.classList.remove('modal-show');
  setTimeout(() => {
    modal.classList.remove('active');
  }, 250);
}

sharrCard.addEventListener('click', () => {
  const isMobile = /android|iphone|ipad|ipod|blackberry|windows phone|opera mini/i.test(navigator.userAgent);
  const modal = isMobile ? sharrMobile : sharrDesktop;
  openSharrModal(modal);
});

[sharrDesktop, sharrMobile].forEach(modal => {
  const closeBtn = modal.querySelector('.sharr-modal-close');
  closeBtn.addEventListener('click', () => closeSharrModal(modal));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeSharrModal(modal);
  });
});

// === Zin Modal Logic ===
const zinCard = document.getElementById('zin-card');
const zinDesktop = document.getElementById('zin-modal-desktop');
const zinMobile = document.getElementById('zin-modal-mobile');

function openZinModal(modal) {
  modal.classList.add('active');
  const content = modal.querySelector('.zin-modal-content');
  requestAnimationFrame(() => {
    content.classList.add('modal-show');
  });
}

function closeZinModal(modal) {
  const content = modal.querySelector('.zin-modal-content');
  content.classList.remove('modal-show');
  setTimeout(() => {
    modal.classList.remove('active');
  }, 250);
}

zinCard.addEventListener('click', () => {
  const isMobile = /android|iphone|ipad|ipod|blackberry|windows phone|opera mini/i.test(navigator.userAgent);
  const modal = isMobile ? zinMobile : zinDesktop;
  openZinModal(modal);
});

[zinDesktop, zinMobile].forEach(modal => {
  const closeBtn = modal.querySelector('.zin-modal-close');
  closeBtn.addEventListener('click', () => closeZinModal(modal));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeZinModal(modal);
  });
});

// === Doger Modal Logic ===
const dogerCard = document.getElementById('doger-card');
const dogerDesktop = document.getElementById('doger-modal-desktop');
const dogerMobile = document.getElementById('doger-modal-mobile');

function openDogerModal(modal) {
  modal.classList.add('active');
  const content = modal.querySelector('.doger-modal-content');
  requestAnimationFrame(() => {
    content.classList.add('modal-show');
  });
}

function closeDogerModal(modal) {
  const content = modal.querySelector('.doger-modal-content');
  content.classList.remove('modal-show');
  setTimeout(() => {
    modal.classList.remove('active');
  }, 250);
}

dogerCard.addEventListener('click', () => {
  const isMobile = /android|iphone|ipad|ipod|blackberry|windows phone|opera mini/i.test(navigator.userAgent);
  const modal = isMobile ? dogerMobile : dogerDesktop;
  openDogerModal(modal);
});

[dogerDesktop, dogerMobile].forEach(modal => {
  const closeBtn = modal.querySelector('.doger-modal-close');
  closeBtn.addEventListener('click', () => closeDogerModal(modal));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeDogerModal(modal);
  });
});

// === Prince Modal Logic ===
const princeCard = document.getElementById('prince-card');
const princeDesktop = document.getElementById('prince-modal-desktop');
const princeMobile = document.getElementById('prince-modal-mobile');

function openPrinceModal(modal) {
  modal.classList.add('active');
  const content = modal.querySelector('.prince-modal-content');
  requestAnimationFrame(() => {
    content.classList.add('modal-show');
  });
}

function closePrinceModal(modal) {
  const content = modal.querySelector('.prince-modal-content');
  content.classList.remove('modal-show');
  setTimeout(() => {
    modal.classList.remove('active');
  }, 250);
}

princeCard.addEventListener('click', () => {
  const isMobile = /android|iphone|ipad|ipod|blackberry|windows phone|opera mini/i.test(navigator.userAgent);
  const modal = isMobile ? princeMobile : princeDesktop;
  openPrinceModal(modal);
});

[princeDesktop, princeMobile].forEach(modal => {
  const closeBtn = modal.querySelector('.prince-modal-close');
  closeBtn.addEventListener('click', () => closePrinceModal(modal));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closePrinceModal(modal);
  });
});

// === Xavvi Modal Logic ===
const xavviCard = document.getElementById('xavvi-card');
const xavviDesktop = document.getElementById('xavvi-modal-desktop');
const xavviMobile = document.getElementById('xavvi-modal-mobile');

function openXavviModal(modal) {
  modal.classList.add('active');
  const content = modal.querySelector('.xavvi-modal-content');
  requestAnimationFrame(() => {
    content.classList.add('modal-show');
  });
}

function closeXavviModal(modal) {
  const content = modal.querySelector('.xavvi-modal-content');
  content.classList.remove('modal-show');
  setTimeout(() => {
    modal.classList.remove('active');
  }, 250);
}

xavviCard.addEventListener('click', () => {
  const isMobile = /android|iphone|ipad|ipod|blackberry|windows phone|opera mini/i.test(navigator.userAgent);
  const modal = isMobile ? xavviMobile : xavviDesktop;
  openXavviModal(modal);
});

[xavviDesktop, xavviMobile].forEach(modal => {
  const closeBtn = modal.querySelector('.xavvi-modal-close');
  closeBtn.addEventListener('click', () => closeXavviModal(modal));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeXavviModal(modal);
  });
});

// === Nexell Modal Logic ===
const nexellCard = document.getElementById('nexell-card');
const nexellDesktop = document.getElementById('nexell-modal-desktop');
const nexellMobile = document.getElementById('nexell-modal-mobile');

function openNexellModal(modal) {
  modal.classList.add('active');
  const content = modal.querySelector('.nexell-modal-content');
  requestAnimationFrame(() => {
    content.classList.add('modal-show');
  });
}

function closeNexellModal(modal) {
  const content = modal.querySelector('.nexell-modal-content');
  content.classList.remove('modal-show');
  setTimeout(() => {
    modal.classList.remove('active');
  }, 250);
}

nexellCard.addEventListener('click', () => {
  const isMobile = /android|iphone|ipad|ipod|blackberry|windows phone|opera mini/i.test(navigator.userAgent);
  const modal = isMobile ? nexellMobile : nexellDesktop;
  openNexellModal(modal);
});

[nexellDesktop, nexellMobile].forEach(modal => {
  const closeBtn = modal.querySelector('.nexell-modal-close');
  closeBtn.addEventListener('click', () => closeNexellModal(modal));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeNexellModal(modal);
  });
});

// === Sharsame Modal Logic ===
const sharsameCard = document.getElementById('sharsame-card');
const sharsameDesktop = document.getElementById('sharsame-modal-desktop');
const sharsameMobile = document.getElementById('sharsame-modal-mobile');

function openSharsameModal(modal) {
  modal.classList.add('active');
  const content = modal.querySelector('.sharsame-modal-content');
  requestAnimationFrame(() => {
    content.classList.add('modal-show');
  });
}

function closeSharsameModal(modal) {
  const content = modal.querySelector('.sharsame-modal-content');
  content.classList.remove('modal-show');
  setTimeout(() => {
    modal.classList.remove('active');
  }, 250);
}

sharsameCard.addEventListener('click', () => {
  const isMobile = /android|iphone|ipad|ipod|blackberry|windows phone|opera mini/i.test(navigator.userAgent);
  const modal = isMobile ? sharsameMobile : sharsameDesktop;
  openSharsameModal(modal);
});

[sharsameDesktop, sharsameMobile].forEach(modal => {
  const closeBtn = modal.querySelector('.sharsame-modal-close');
  closeBtn.addEventListener('click', () => closeSharsameModal(modal));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeSharsameModal(modal);
  });
});

// === Jenku Modal Logic ===
const jenkuCard = document.getElementById('jenku-card');
const jenkuDesktop = document.getElementById('jenku-modal-desktop');
const jenkuMobile = document.getElementById('jenku-modal-mobile');

function openJenkuModal(modal) {
  modal.classList.add('active');
  const content = modal.querySelector('.jenku-modal-content');
  requestAnimationFrame(() => {
    content.classList.add('modal-show');
  });
}

function closeJenkuModal(modal) {
  const content = modal.querySelector('.jenku-modal-content');
  content.classList.remove('modal-show');
  setTimeout(() => {
    modal.classList.remove('active');
  }, 250);
}

jenkuCard.addEventListener('click', () => {
  const isMobile = /android|iphone|ipad|ipod|blackberry|windows phone|opera mini/i.test(navigator.userAgent);
  const modal = isMobile ? jenkuMobile : jenkuDesktop;
  openJenkuModal(modal);
});

[jenkuDesktop, jenkuMobile].forEach(modal => {
  const closeBtn = modal.querySelector('.jenku-modal-close');
  closeBtn.addEventListener('click', () => closeJenkuModal(modal));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeJenkuModal(modal);
  });
});

// === Glassconsumer Modal Logic ===
const glassconsumerCard = document.getElementById('glassconsumer-card');
const glassconsumerDesktop = document.getElementById('glassconsumer-modal-desktop');
const glassconsumerMobile = document.getElementById('glassconsumer-modal-mobile');

function openGlassconsumerModal(modal) {
  modal.classList.add('active');
  const content = modal.querySelector('.glassconsumer-modal-content');
  requestAnimationFrame(() => {
    content.classList.add('modal-show');
  });
}

function closeGlassconsumerModal(modal) {
  const content = modal.querySelector('.glassconsumer-modal-content');
  content.classList.remove('modal-show');
  setTimeout(() => {
    modal.classList.remove('active');
  }, 250);
}

glassconsumerCard.addEventListener('click', () => {
  const isMobile = /android|iphone|ipad|ipod|blackberry|windows phone|opera mini/i.test(navigator.userAgent);
  const modal = isMobile ? glassconsumerMobile : glassconsumerDesktop;
  openGlassconsumerModal(modal);
});

[glassconsumerDesktop, glassconsumerMobile].forEach(modal => {
  const closeBtn = modal.querySelector('.glassconsumer-modal-close');
  closeBtn.addEventListener('click', () => closeGlassconsumerModal(modal));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeGlassconsumerModal(modal);
  });
});


});
