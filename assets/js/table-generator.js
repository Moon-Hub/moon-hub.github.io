import { enableDragDrop, updateCounts } from './drag-drop.js';
import { namesInput, seatsPerTableInput, animStyleSelect, animSpeedInput } from './constants.js';

    let seatsPerTable = parseInt(seatsPerTableInput.value, 10);
    let animStyle = animStyleSelect.value;
    let animSpeed = parseFloat(animSpeedInput.value);

    animSpeedInput.addEventListener('input', () => {
      animSpeed = parseFloat(animSpeedInput.value);
      animSpeedLabel.textContent = animSpeed + 'x';
    });

    document.getElementById('generateBtn').addEventListener('click', () => {
      let names = namesInput.value.split('\n').map(n => n.trim()).filter(n => n);
      if (dedupeSwitch.checked) names = [...new Set(names)];
      if (shuffleSwitch.checked) names.sort(() => Math.random() - 0.5);

      output.innerHTML = '';
      const colClass = 'col-md-6';
      let tableCount = 0;

      for (let i = 0; i < names.length; i += seatsPerTable) {
        tableCount++;
        const tableNames = names.slice(i, i + seatsPerTable);
        const card = document.createElement('div');
        card.className = `${colClass} mb-3 anim-card-${animStyle}`;
        card.style.setProperty('--anim-duration', animSpeed + 's');
        card.innerHTML = `
          <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span>Table ${tableCount}</span>
              <span class="badge bg-secondary badge-cap">${tableNames.length}/${seatsPerTable}</span>
            </div>
            <ul class="list-group list-group-flush min-height" data-table="${tableCount}">
              ${tableNames.map(n => `<li class="list-group-item anim-item-${animStyle}" style="--anim-duration:${animSpeed}s">${n}<span class="drag-handle"><i class="bi bi-grip-vertical"></i></span></li>`).join('')}
            </ul>
          </div>
        `;
        if (tableCount % 2 === 1) {
          const row = document.createElement('div');
          row.className = 'row';
          row.appendChild(card);
          output.appendChild(row);
        } else {
          output.lastElementChild.appendChild(card);
        }
      }
      enableDragDrop();
      updateCounts(); // ✅ Fix: ensure badges are correct immediately
    });