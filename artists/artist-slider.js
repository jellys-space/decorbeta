/********************************
 * ARTIST PAGE SLIDER (Final Animation Fix)
 ********************************/

function setupArtistSlider() {
  const entries = Array.from(document.querySelectorAll('#artistTemplates .artist-entry'));
  const pages = entries.map(entry => entry.outerHTML);
  let currentPage = 0;
  let isTransitioning = false;

  const display = document.getElementById('artistDisplay');
  const leftBtn = document.querySelector('.artist-nav.left');
  const rightBtn = document.querySelector('.artist-nav.right');

  function showArtist(direction = null) {
    if (isTransitioning) return;
    isTransitioning = true;
    disableButtons();

    const wrapper = document.createElement('div');
    wrapper.innerHTML = pages[currentPage];
    const newArtist = wrapper.firstElementChild;
    newArtist.classList.add('artist-entry');

    // Add initial animation class
    if (direction === 'left') {
      newArtist.classList.add('slide-in-left');
    } else if (direction === 'right') {
      newArtist.classList.add('slide-in-right');
    }

    // Append to DOM
    display.appendChild(newArtist);

    // Handle outgoing element
    const existing = [...display.querySelectorAll('.artist-entry')].filter(e => e !== newArtist)[0];

    if (existing) {
      if (direction === 'left') {
        existing.classList.add('slide-out-right');
      } else if (direction === 'right') {
        existing.classList.add('slide-out-left');
      }

      // Wait for animation to finish before cleanup
      setTimeout(() => {
        if (existing && existing.parentNode === display) {
          display.removeChild(existing);
        }

        // Cleanup slide classes from newArtist (in case of re-entry later)
        newArtist.classList.remove('slide-in-left', 'slide-in-right');

        isTransitioning = false;
        updateButtons();
      }, 600);
    } else {
      // No existing element — just show
      setTimeout(() => {
        newArtist.classList.remove('slide-in-left', 'slide-in-right');
        isTransitioning = false;
        updateButtons();
      }, 600);
    }
  }

  function disableButtons() {
    leftBtn.disabled = true;
    rightBtn.disabled = true;
  }

  function updateButtons() {
    leftBtn.disabled = currentPage === 0 || isTransitioning;
    rightBtn.disabled = currentPage === pages.length - 1 || isTransitioning;
  }

  leftBtn.addEventListener('click', () => {
    if (currentPage > 0 && !isTransitioning) {
      currentPage--;
      showArtist('left');
    }
  });

  rightBtn.addEventListener('click', () => {
    if (currentPage < pages.length - 1 && !isTransitioning) {
      currentPage++;
      showArtist('right');
    }
  });

  showArtist();
}

window.addEventListener('DOMContentLoaded', setupArtistSlider);
