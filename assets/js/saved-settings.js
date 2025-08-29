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
}

animSpeedInput.addEventListener('input', () => {
    animSpeed = parseFloat(animSpeedInput.value);
    animSpeedLabel.textContent = animSpeed + 'x';
});