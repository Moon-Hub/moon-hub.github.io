  const html = document.documentElement;
  const darkIcon = document.getElementById('darkIcon');
  const darkText = document.getElementById('darkIconText');

  // 🌘 Apply theme on page load
  const savedTheme = localStorage.getItem('theme');
  const initialTheme = savedTheme || 'light';
  html.setAttribute('data-bs-theme', initialTheme);

  // 🖼 Update icon and text
  const updateToggleUI = (theme) => {
    if (theme === 'light') {
      darkIcon.innerHTML = '<i class="bi bi-sun-fill"></i>';
      darkText.textContent = 'Light';
    } else {
      darkIcon.innerHTML = '<i class="bi bi-moon-stars-fill"></i>';
      darkText.textContent = 'Dark';
    }
  };

  updateToggleUI(initialTheme);

  // 🕹 Toggle theme on click
  document.getElementById('darkToggle').addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateToggleUI(newTheme);
  });
