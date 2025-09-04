const zoomControl = document.getElementById('zoomControl');
const zoomLabel = document.getElementById('zoomLabel');
const zoomOutput = document.getElementById('zoomOutput');
const appContainer = document.getElementById('output');

zoomControl.addEventListener('input', () => {
  const zoomValue = parseInt(zoomControl.value, 10);
  zoomOutput.textContent = `${zoomValue}%`;
  const scale = zoomValue / 100;

  appContainer.style.transform = `scale(${scale})`;
  appContainer.style.transformOrigin = 'top center';
});
