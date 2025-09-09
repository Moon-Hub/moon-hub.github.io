import { seatsPerTableInput, shuffleSwitch, dedupeSwitch, animStyleSelect, animSpeedInput, animSpeedLabel } from "./constants.js";

// Initialise defaults if no settings exist
if (localStorage.getItem("settings") === null) {
  const seatsPerTable = parseInt(seatsPerTableInput.value, 10);
  const animStyle = animStyleSelect.value;
  const animSpeed = parseFloat(animSpeedInput.value);
  const containerSize = 'container-xl'; // default fallback

  localStorage.setItem('settings', JSON.stringify({
    seatsPerTable,
    shuffle: shuffleSwitch.checked,
    dedupe: dedupeSwitch.checked,
    animStyle,
    animSpeed,
    containerSize
  }));
}

// Save Current Settings
document.getElementById('saveSettingsBtn').addEventListener('click', () => {
  const seatsPerTable = parseInt(seatsPerTableInput.value, 10);
  const animStyle = animStyleSelect.value;
  const animSpeed = parseFloat(animSpeedInput.value);

  const settings = JSON.parse(localStorage.getItem('settings')) || {};
  settings.seatsPerTable = seatsPerTable;
  settings.shuffle = shuffleSwitch.checked;
  settings.dedupe = dedupeSwitch.checked;
  settings.animStyle = animStyle;
  settings.animSpeed = animSpeed;
  settings.containerSize = settings.containerSize || 'container-xl'; // fallback

  localStorage.setItem('settings', JSON.stringify(settings));
});

// Load Saved Settings
const savedSettings = localStorage.getItem('settings');
if (savedSettings) {
  const s = JSON.parse(savedSettings);
  seatsPerTableInput.value = s.seatsPerTable;
  shuffleSwitch.checked = s.shuffle;
  dedupeSwitch.checked = s.dedupe;
  animStyleSelect.value = s.animStyle;
  animSpeedInput.value = s.animSpeed;
  animSpeedLabel.textContent = s.animSpeed + 'x';
  // Container size handled in DOMContentLoaded
}

// Live update animSpeed label
animSpeedInput.addEventListener('input', () => {
  const animSpeed = parseFloat(animSpeedInput.value);
  animSpeedLabel.textContent = animSpeed + 'x';
});

// Apply container size on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('appContainer');
  // const navContainer = document.getElementById('navContainer');
  const buttons = document.querySelectorAll('[data-size]');
  const sizes = ['container-xl', 'container-xxl', 'container-fluid'];

  const savedSettings = JSON.parse(localStorage.getItem('settings'));
  if (savedSettings && savedSettings.containerSize) {
    sizes.forEach(cls => {
      appContainer.classList.remove(cls);
      //navContainer.classList.remove(cls);
    });

    appContainer.classList.add(savedSettings.containerSize);
    //navContainer.classList.add(savedSettings.containerSize);

    // Highlight the correct button
    buttons.forEach(btn => {
      const btnSize = `container-${btn.getAttribute('data-size')}`;
      if (btnSize === savedSettings.containerSize) {
        btn.classList.add('active');
        btn.textContent = "On";
      } else {
        btn.classList.remove('active');
        btn.textContent = "Set";
      }
    });
  }

  // Button click handler
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const size = button.getAttribute('data-size');

      // Remove all container size classes
      sizes.forEach(cls => {
        appContainer.classList.remove(cls);
        navContainer.classList.remove(cls);
      });

      // Add the selected container class
      const containerClass = `container-${size}`;
      appContainer.classList.add(containerClass);
      //navContainer.classList.add(containerClass);

      // Highlight active button
      buttons.forEach(btn => {
        btn.classList.remove('active');
        btn.textContent = "Set";
      });
      button.classList.add('active');
      button.textContent = "On";

      const settings = JSON.parse(localStorage.getItem('settings')) || {};
      settings.containerSize = containerClass;
      localStorage.setItem('settings', JSON.stringify(settings));
    });
  });
});