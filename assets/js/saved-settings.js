import { seatsPerTableInput, shuffleSwitch, dedupeSwitch, animStyleSelect, animSpeedInput, animSpeedLabel } from "./constants.js";

if(localStorage.getItem("settings") === null) {
    // Default Values
    seatsPerTable = parseInt(seatsPerTableInput.value, 10);
    animStyle = animStyleSelect.value;
    animSpeed = parseFloat(animSpeedInput.value);
        localStorage.setItem('settings', JSON.stringify({
            seatsPerTable, shuffle: shuffleSwitch.checked, dedupe: dedupeSwitch.checked,
            animStyle, animSpeed
        }));
    };


// Save Current Settings
document.getElementById('saveSettingsBtn').addEventListener('click', () => {
    seatsPerTable = parseInt(seatsPerTableInput.value, 10);
    animStyle = animStyleSelect.value;
    animSpeed = parseFloat(animSpeedInput.value);
    localStorage.setItem('settings', JSON.stringify({
        seatsPerTable, shuffle: shuffleSwitch.checked, dedupe: dedupeSwitch.checked,
        animStyle, animSpeed
    }));
});

// Load Saved settings
const savedSettings = localStorage.getItem('settings');

if (savedSettings) {
      const s = JSON.parse(savedSettings);
      seatsPerTable = s.seatsPerTable;
      seatsPerTableInput.value = s.seatsPerTable;
      shuffleSwitch.checked = s.shuffle;
      dedupeSwitch.checked = s.dedupe;
      animStyle = s.animStyle;
      animStyleSelect.value = s.animStyle;
      animSpeed = s.animSpeed;
      animSpeedInput.value = s.animSpeed;
      animSpeedLabel.textContent = s.animSpeed + 'x';
      // Container not required as default is xl
}

animSpeedInput.addEventListener('input', () => {
    animSpeed = parseFloat(animSpeedInput.value);
    animSpeedLabel.textContent = animSpeed + 'x';
});


document.addEventListener('DOMContentLoaded', () => {

    const appContainer = document.getElementById('appContainer');
    const navContainer = document.getElementById('navContainer');
    const buttons = document.querySelectorAll('[data-size]');
    const sizes = ['container-xl', 'container-xxl', 'container-fluid'];

    const savedSettings = JSON.parse(localStorage.getItem('settings'));
    if (savedSettings && savedSettings.containerSize) {
        sizes.forEach(cls => appContainer.classList.remove(cls));
        sizes.forEach(cls => navContainer.classList.remove(cls));

        appContainer.classList.add(savedSettings.containerSize);
        navContainer.classList.add(savedSettings.containerSize);

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


    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const size = button.getAttribute('data-size');

            // Remove all container size classes
            sizes.forEach(cls => appContainer.classList.remove(cls));
            sizes.forEach(cls => navContainer.classList.remove(cls));

            // Add the selected container class
            const containerClass = `container-${size}`;
            appContainer.classList.add(containerClass);
            navContainer.classList.add(containerClass);

            // Optional: highlight active button
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

