function toggleMenu() {
      const menu = document.querySelector('.nav-links');
      menu.classList.toggle('active');
    }
     const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
        favicon.style.borderRadius = '50%';
    }