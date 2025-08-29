export const namesInput = document.getElementById('names');
export const output = document.getElementById('output');
export const seatsPerTableInput = document.getElementById('seatsPerTable');
export const shuffleSwitch = document.getElementById('shuffleSwitch');
export const dedupeSwitch = document.getElementById('dedupeSwitch');
export const animStyleSelect = document.getElementById('animStyle');
export const animSpeedInput = document.getElementById('animSpeed');
export const animSpeedLabel = document.getElementById('animSpeedLabel');

// Toasts
export const toasts = {
      full: new bootstrap.Toast(document.getElementById('fullToast')),
      save: new bootstrap.Toast(document.getElementById('saveToast')),
      load: new bootstrap.Toast(document.getElementById('loadToast'))
};