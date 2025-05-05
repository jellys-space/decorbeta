document.addEventListener('DOMContentLoaded', () => {

  /********************************
   * 1) DECORATION MODAL LOGIC (Dual Modal Support)
   ********************************/
  const decorationWraps = document.querySelectorAll('.decoration-wrap');
  const isMobile = /iPhone|iPad|iPod|Android|webOS/i.test(navigator.userAgent);

  const modal = document.getElementById(isMobile ? 'decorationModalMobile' : 'decorationModalDesktop');
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
      modalInner.style.transform = 'scale(1)';
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
  downloadButton.addEventListener("click", async () => {
  const imagePath = modalDecorationImg.src;
  const rawFileName = imagePath.split("/").pop();
  const fileName = rawFileName.replace(/%20/g, " ");

  // Fetch original PNG file
  const req = await fetch(imagePath);
  const buff = await req.arrayBuffer();
  const view = new DataView(buff);

  const sig = buff.slice(0, 8);

  // Parse PNG chunks
  const splitChunks = () => {
    const chunks = [];
    let offset = 8;

    while (offset < buff.byteLength) {
      const length = view.getUint32(offset);
      const type = new TextDecoder().decode(new Uint8Array(buff, offset + 4, 4));
      const data = new Uint8Array(buff, offset + 8, length);
      const crc = view.getUint32(offset + 8 + length);

      chunks.push({ length, type, data, crc });
      offset += 12 + length;
    }

    return chunks;
  };

  const chunks = splitChunks();

  // CRC helper
  const crcTable = (() => {
    let c;
    let table = [];
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[n] = c;
    }
    return table;
  })();

  const crc32 = (buff) => {
    let crc = ~0;
    for (let i = 0; i < buff.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ buff[i]) & 0xff];
    }
    return ~crc >>> 0;
  };

  // Create a random tEXt chunk
  const keyword = "HashScramble";
  const random = Math.random().toString(30).slice(2);
  const textData = new TextEncoder().encode(keyword + "\0" + random);

  const createChunk = (type, data) => {
    const input = new Uint8Array(type.length + data.length);
    input.set(new TextEncoder().encode(type), 0);
    input.set(data, type.length);
    const crc = crc32(input);
    return { type, data, crc };
  };

  const randomChunk = createChunk("tEXt", textData);

  // Rebuild chunks with our injected one before IEND
  const newChunks = [];
  chunks.forEach((chunk) => {
    if (chunk.type === "IEND") newChunks.push(randomChunk);
    newChunks.push(chunk);
  });

  // Reassemble binary PNG
  const parts = [sig];
  newChunks.forEach((chunk) => {
    const lengthBuf = new Uint8Array(4);
    new DataView(lengthBuf.buffer).setUint32(0, chunk.data.length);
    parts.push(lengthBuf);

    const typeBuf = new TextEncoder().encode(chunk.type);
    parts.push(typeBuf);
    parts.push(chunk.data);

    const crcBuf = new Uint8Array(4);
    new DataView(crcBuf.buffer).setUint32(0, chunk.crc);
    parts.push(crcBuf);
  });

  const blob = new Blob(parts, { type: "image/png" });
  const url = URL.createObjectURL(blob);

  // Trigger download
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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
  (function() {
    const jellyHomeImg = document.getElementById('jellyHomeImg');
    const easterEggModal = document.getElementById('easterEggModal');
    if (!jellyHomeImg || !easterEggModal) return;

    let clickCount = 0;
    let lastClickTime = 0;
    const maxGap = 2000;

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

// Insert this entire block at the bottom of your existing main.js

/********************************
 * 6) PAGINATION (On-Demand DOM with Ellipsis + Force Pagebreak Support + Patched Lazy Load)
 ********************************/

function setupPagination() {
  const originalCategories = Array.from(document.querySelectorAll('.category'));
  const categoriesPerPage = 5;
  const pageData = [];
  let currentPageGroup = [];

  originalCategories.forEach(cat => {
    const clone = cat.cloneNode(true);
    if (cat.hasAttribute('data-force-pagebreak')) {
      if (currentPageGroup.length) {
        pageData.push([...currentPageGroup]);
        currentPageGroup = [];
      }
      pageData.push([clone]);
    } else {
      currentPageGroup.push(clone);
      if (currentPageGroup.length === categoriesPerPage) {
        pageData.push([...currentPageGroup]);
        currentPageGroup = [];
      }
    }
    cat.remove();
  });

  if (currentPageGroup.length) {
    pageData.push([...currentPageGroup]);
  }

  let currentPage = 1;

  const topContainer = document.createElement('div');
  topContainer.id = 'paginationTop';
  const bottomContainer = document.createElement('div');
  bottomContainer.id = 'paginationBottom';

  const categoriesWrapper = document.getElementById('categories-container');
  categoriesWrapper.parentNode.insertBefore(topContainer, categoriesWrapper);
  categoriesWrapper.parentNode.insertBefore(bottomContainer, categoriesWrapper.nextSibling);

  function reinitImageLazyLoading(container) {
    const lazyImages = container.querySelectorAll('.decoration-cell img, .default-avatar');
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
          img.removeAttribute('src');
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
  }

  function rebindModalEvents() {
    const newWraps = document.querySelectorAll('.decoration-wrap');
    newWraps.forEach(wrap => {
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

        scrollPosition = window.scrollY || window.pageYOffset;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollPosition}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.width = '100%';

        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
        modalInner.style.transform = 'scale(1)';
      });
    });
  }

  function renderPage(page, fromBottom = false) {
    currentPage = page;
    categoriesWrapper.innerHTML = '';
    pageData[page - 1].forEach(cat => {
      categoriesWrapper.appendChild(cat.cloneNode(true));
    });
    renderPagination(topContainer, false);
    renderPagination(bottomContainer, true);
    reinitImageLazyLoading(categoriesWrapper);
    rebindModalEvents();

    if (fromBottom) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function renderPagination(container, isBottom) {
    container.innerHTML = '';
    const nav = document.createElement('div');
    nav.className = 'pagination-nav';
    const totalPages = pageData.length;
    const maxVisiblePages = 10;

    const back = document.createElement('button');
    back.innerHTML = '❮ Back';
    back.className = 'pagination-btn';
    if (currentPage === 1) back.disabled = true;
    back.addEventListener('click', () => {
      if (currentPage > 1) renderPage(currentPage - 1, isBottom);
    });
    nav.appendChild(back);

    const addButton = (label) => {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.className = 'pagination-circle';
      if (label === currentPage) btn.classList.add('active');
      btn.addEventListener('click', () => renderPage(label, isBottom));
      nav.appendChild(btn);
    };

    const addEllipsis = () => {
      const span = document.createElement('span');
      span.textContent = '...';
      span.style.color = '#6d6e73';
      span.style.padding = '0 0.4rem';
      nav.appendChild(span);
    };

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) addButton(i);
    } else {
      const visibleRange = 7;
      if (currentPage <= 5) {
        for (let i = 1; i <= visibleRange; i++) addButton(i);
        addEllipsis();
        addButton(totalPages);
      } else if (currentPage >= totalPages - 4) {
        addButton(1);
        addEllipsis();
        for (let i = totalPages - visibleRange + 1; i <= totalPages; i++) addButton(i);
      } else {
        addButton(1);
        addEllipsis();
        for (let i = currentPage - 2; i <= currentPage + 2; i++) addButton(i);
        addEllipsis();
        addButton(totalPages);
      }
    }

    const next = document.createElement('button');
    next.innerHTML = 'Next ❯';
    next.className = 'pagination-btn';
    if (currentPage === totalPages) next.disabled = true;
    next.addEventListener('click', () => {
      if (currentPage < totalPages) renderPage(currentPage + 1, isBottom);
    });
    nav.appendChild(next);
    container.appendChild(nav);
  }

  renderPage(1);
}

window.addEventListener('DOMContentLoaded', setupPagination);

});
