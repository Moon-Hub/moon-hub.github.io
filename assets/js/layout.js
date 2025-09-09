import { enableDragDrop, updateCounts } from './drag-drop.js';
import { animStyleSelect, output, toasts } from './constants.js';
import { seatsPerTableInput, animSpeedInput } from './constants.js';

// Save Layout
document.getElementById('saveBtn').addEventListener('click', () => {
const appContainer = document.querySelector('#appContainer');
        const layout = [];
        appContainer.querySelectorAll('.list-group').forEach(container => {
        layout.push([...container.querySelectorAll('.list-group-item')].map(li => li.childNodes[0].textContent));
    });
      localStorage.setItem('layout', JSON.stringify(layout));
      toasts.save.show();
    });

// Load Layout
document.getElementById('loadBtn').addEventListener('click', () => {
  const layout = JSON.parse(localStorage.getItem('layout') || '[]');
  const animStyle = animStyleSelect.value;
  const seatsPerTable = parseInt(seatsPerTableInput.value, 10);
  const animSpeed = parseFloat(animSpeedInput.value,10);

  if (!layout.length) return;
  output.innerHTML = '';
  const colClass = 'col-md-6';
  layout.forEach((tableNames, idx) => {
    const headerColors = ['bg-primary','bg-secondary','bg-success','bg-danger','bg-warning','bg-info','bg-dark'];
    const randomColor = headerColors[Math.floor(Math.random() * headerColors.length)];
    const card = document.createElement('div');
    card.className = `${colClass} mb-3 anim-card-${animStyle}`;
    card.innerHTML = `
      <div class="card h-100 rounded-0">
        <div class="card-header d-flex justify-content-between align-items-center px-2 py-1 text-white ${randomColor} rounded-0 font-big">
          <span><strong>Table ${idx + 1}</strong></span>
          <span class="badge bg-secondary badge-cap">${tableNames.length}/${seatsPerTable}</span>
        </div>
        <ul class="list-group list-group-flush min-height" data-table="${idx + 1}">
          ${tableNames.map(n => `
            <li class="list-group-item font-big px-2 py-1 fw-bold" style="--anim-duration:${animSpeed}s">
              ${n}<span class="drag-handle"><i class="bi bi-grip-vertical"></i></span>
            </li>`).join('')}
        </ul>
      </div>
        `;
    if ((idx + 1) % 2 === 1) {
      const row = document.createElement('div');
      row.className = 'row';
      row.appendChild(card);
      output.appendChild(row);
    } else {
      output.lastElementChild.appendChild(card);
    }
  });
  enableDragDrop();
  updateCounts(); // Fix: ensure badges are correct after loading
});

// Clear Layout
    document.getElementById('clearBtn').addEventListener('click', () => {
      output.innerHTML = '';
    });