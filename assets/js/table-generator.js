import { enableDragDrop, updateCounts } from './drag-drop.js';
import { namesInput, seatsPerTableInput, animStyleSelect, animSpeedInput, toasts } from './constants.js';

    animSpeedInput.addEventListener('input', () => {
      animSpeed = parseFloat(animSpeedInput.value);
      animSpeedLabel.textContent = animSpeed + 'x';
    });

document.getElementById('generateBtn').addEventListener('click', () => {

  let names = namesInput.value.split('\n').map(n => n.trim()).filter(n => n);
  if (dedupeSwitch.checked) names = [...new Set(names)];

  if (names.length === 0) {
    toasts.empty.show();
    return;
  }


  let maxTables = Math.ceil(names.length / seatsPerTable);
  openGroupLockModal(names)

  // Stops the table selector input from exceeding max tables
  document.querySelectorAll('[id^="table-"]').forEach(input => {
      input.addEventListener('keydown', e => {
      // Allow arrow keys, tab, and other navigation
        const allowedKeys = [
          'ArrowUp', 'ArrowDown', 'Tab', 'Shift', 'Control', 'Alt',
          'Home', 'End', 'Escape'
        ];
        if (!allowedKeys.includes(e.key)) {
          e.preventDefault();
        }
      });

      input.max = maxTables;
      if (parseInt(input.value, 10) > maxTables) {
        input.value = ''; // or clamp to maxTables
      }
    });
    
  //Visual Lock Change
  const lockList = document.getElementById('groupLockList');
  const toggles = lockList.querySelectorAll('.group-lock-toggle');

  toggles.forEach(toggle => {
    const label = lockList.querySelector(`label[for="${toggle.id}"]`);
    const icon = label.querySelector('i');

    // Sync initial state
    icon.className = toggle.checked ? 'bi bi-lock-fill' : 'bi bi-unlock-fill';

    // Toggle icon on checkbox change
    toggle.addEventListener('change', () => {
      icon.className = toggle.checked ? 'bi bi-lock-fill' : 'bi bi-unlock-fill';
    });
  });
});

function openGroupLockModal(names) {
  const container = document.getElementById('groupLockList');
  container.innerHTML = '';

  names.forEach((name, index) => {
    const div = document.createElement('div');
    div.className = 'col-lg-6';
    div.innerHTML = `
      <div class="card p-2 d-flex flex-row align-items-center rounded-0">
        <strong class="flex-grow-1">${name}</strong>
        <div class="form-check mx-3 mb-0 d-flex flex-row align-items-center">
          <input class="form-check-input group-lock-toggle rounded-0" type="checkbox" id="lock-${index}">
          <label class="form-check-label ps-2" for="lock-${index}"><i class="bi bi-unlock-fill"></i></label>
        </div>
        <div class="d-flex flex-row align-items-center">
          <label for="table-${index}" class="form-label me-2 mb-0 small">Table:</label>
          <input type="number" class="form-control form-control-sm rounded-0" id="table-${index}" value="1" min="1" title="Use arrows to select tables">
        </div>
      </div>
    `;
    container.appendChild(div);
  });

  const modal = new bootstrap.Modal(document.getElementById('groupLockModal'));
  modal.show();
}

document.getElementById('confirmGroupLock').addEventListener('click', () => {
  const lockedGroups = [];
  const names = document.querySelectorAll('#groupLockList .card');

  names.forEach((card, i) => {
    const name = card.querySelector('strong').textContent;
    const isLocked = card.querySelector(`#lock-${i}`).checked;
    const tableNum = parseInt(card.querySelector(`#table-${i}`).value);

    if (isLocked && tableNum) {
      lockedGroups.push({ name, table: tableNum });
    }
  });

  // Pass lockedGroups to your table generator
  generateTableWithLocks(lockedGroups);
});

function generateTableWithLocks(lockedGroups) {
    
  let seatsPerTable;
  seatsPerTable = parseInt(seatsPerTableInput.value, 10);
  let animStyle = animStyleSelect.value;
  let animSpeed = parseFloat(animSpeedInput.value);


  let names = namesInput.value.split('\n').map(n => n.trim()).filter(n => n);
  if (dedupeSwitch.checked) names = [...new Set(names)];
  if (shuffleSwitch.checked) names.sort(() => Math.random() - 0.5);

  // Remove locked names from pool
  const lockedNames = lockedGroups.map(g => g.name);
  const unlockedNames = names.filter(n => !lockedNames.includes(n));

  output.innerHTML = '';
  const colClass = 'col-md-6';
  let tableMap = {};

  // Insert locked groups
  lockedGroups.forEach(({ name, table }) => {
    if (!tableMap[table]) tableMap[table] = [];
    tableMap[table].push(name);
  });

const usedTableNums = new Set(lockedGroups.map(g => g.table));
let remaining = [...unlockedNames];

// Fill existing tables first
for (const tableNum of usedTableNums) {
  const current = tableMap[tableNum] || [];
  while (current.length < seatsPerTable && remaining.length > 0) {
    current.push(remaining.shift());
  }
  tableMap[tableNum] = current;
}

// Start new tables from 1 upward, skipping used ones
let nextTableNum = 1;
while (remaining.length > 0) {
  while (usedTableNums.has(nextTableNum)) nextTableNum++;
  const newTable = [];
  while (newTable.length < seatsPerTable && remaining.length > 0) {
    newTable.push(remaining.shift());
  }
  tableMap[nextTableNum] = newTable;
  nextTableNum++;
}

  // Render tables
  Object.entries(tableMap).forEach(([tableNum, tableNames], i) => {
    const card = document.createElement('div');
    card.className = `${colClass} mb-3 anim-card-${animStyle}`;
    card.style.setProperty('--anim-duration', animSpeed + 's');
    card.innerHTML = `
      <div class="card h-100 rounded-0">
        <div class="card-header d-flex justify-content-between align-items-center px-2 py-1">
          <span>Table ${tableNum}</span>
          <span class="badge bg-secondary badge-cap">${tableNames.length}</span>
        </div>
        <ul class="list-group list-group-flush min-height" data-table="${tableNum}">
          ${tableNames.map(n => `<li class="list-group-item px-2 py-1" style="--anim-duration:${animSpeed}s">${n}<span class="drag-handle"><i class="bi bi-grip-vertical"></i></span></li>`).join('')}
        </ul>
      </div>
    `;
    if (i % 2 === 0) {
      const row = document.createElement('div');
      row.className = 'row';
      row.appendChild(card);
      output.appendChild(row);
    } else {
      output.lastElementChild.appendChild(card);
    }
  });

  enableDragDrop();
  updateCounts();

}




