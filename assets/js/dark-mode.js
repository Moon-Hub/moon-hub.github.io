// Dark mode toggle
    document.getElementById('darkToggle').addEventListener('click', () => {
      const html = document.documentElement;
      const isLight = html.getAttribute('data-bs-theme') === 'light';
      html.setAttribute('data-bs-theme', isLight ? 'dark' : 'light');
      document.getElementById('darkIcon').innerHTML = isLight ? '<i class="bi bi-sun-fill"></i>' : '<i class="bi bi-moon-stars-fill"></i>';

    });