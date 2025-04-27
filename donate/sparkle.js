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
  