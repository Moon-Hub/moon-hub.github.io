// Imports (leave as-is in your project)
import { enableDragDrop, updateCounts } from './drag-drop.js';
import { namesInput, seatsPerTableInput, animStyleSelect, animSpeedInput, toasts } from './constants.js';

// Global storage for Tagify instances keyed by person name
const tagifyMap = new Map();

// Helper to trim and lowercase names for consistent comparisons
function normalizeName(str) {
  return (str || '').trim().toLowerCase();
}

// Existing speed label logic (as in your file)
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

  const seatsPerTable = parseInt(seatsPerTableInput.value, 10);
  const maxTables = Math.ceil(names.length / seatsPerTable);

  openGroupLockModal(names);

  // Limit table selector inputs (doesnt go over max tables)
  document.querySelectorAll('[id^="table-"]').forEach(input => {
    input.addEventListener('keydown', e => {
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
      input.value = '';
    }
  });

  // Visual lock toggle
  const lockList = document.getElementById('groupLockList');
  const toggles = lockList.querySelectorAll('.group-lock-toggle');

  toggles.forEach(toggle => {
    const label = lockList.querySelector(`label[for="${toggle.id}"]`);
    const icon = label.querySelector('i');

    icon.className = toggle.checked ? 'bi bi-lock-fill' : 'bi bi-unlock-fill';

    toggle.addEventListener('change', () => {
      icon.className = toggle.checked ? 'bi bi-lock-fill' : 'bi bi-unlock-fill';
    });
  });
});

function openGroupLockModal(names) {
  const container = document.getElementById('groupLockList');
  container.innerHTML = '';
  tagifyMap.clear(); // reset any previous instances

  names.forEach((name, index) => {
    const div = document.createElement('div');
    div.className = 'col-lg-6';
    div.innerHTML = `
      <div class="card p-2 d-flex flex-row justify-content-between align-items-center rounded-0">
        <span class="flex-fill me-3"><strong>${name}</strong></span>
          <div class="card p-2 d-flex flex-row justify content-between align-items-center rounded-0">
            <div class="me-3 d-flex flex-row align-items-center flex-fill" title="Exclusions">
              <label class="form-check-label px-2 ico-size" for="excl-${index}"><i class="bi bi-exclamation-octagon-fill"></i></label>
              <input class="tag-input form-control rounded-0" id="excl-${index}" data-person="${name}" />
            </div>
            <div class="form-check ms-0 me-3 ps-0 mb-0 d-flex flex-row align-items-center justify-content-center lock-check" title="Group Lock">
              <input class="form-check-input group-lock-toggle rounded-0 d-none" type="checkbox" id="lock-${index}">
              <label class="form-check-label ps-2 ico-size" for="lock-${index}"><i class="bi bi-unlock-fill"></i></label>
            </div>
            <div class="d-flex flex-row align-items-center" title="Set To Table">
              <label for="table-${index}" class="form-label me-2 mb-0 ico-size"><i class="bi bi-grid-3x3-gap-fill"></i></label>
              <input type="number" class="form-control rounded-0" id="table-${index}" value="1" min="1" title="Use arrows to select tables">
            </div>
          </div>
      </div>
    `;
    container.appendChild(div);
  });

  // Initialise Tagify for each exclusion input and store instance in tagifyMap
  const allNames = names.map(n => n.trim()).filter(Boolean);

  document.querySelectorAll('.tag-input').forEach(input => {
    const personName = (input.dataset.person || '').trim();
    const whitelist = allNames.filter(n => normalizeName(n) !== normalizeName(personName));

    const instance = new Tagify(input, {
      whitelist, // Names pased in
      enforceWhitelist: true, // Cannot be any other values other than whitelist
      editTags: false, // Stop tags from being editable, must be closed
      dropdown: { enabled: 3 }, // dropdown suggestion appears after 3 chars
      maxTags: 3, // No more than X tags
    });

    tagifyMap.set(personName, instance);
  });

  const modal = new bootstrap.Modal(document.getElementById('groupLockModal'));
  modal.show();
}

document.getElementById('confirmGroupLock').addEventListener('click', () => {
  const lockedGroups = [];
  const exclusionsMap = {};
  const cards = document.querySelectorAll('#groupLockList > .col-lg-6');

  cards.forEach((card, i) => {
    const name = (card.querySelector('span strong').textContent || '').trim();
    const isLocked = card.querySelector(`#lock-${i}`).checked;
    const tableNum = parseInt(card.querySelector(`#table-${i}`).value, 10);

    // Read exclusions from Tagify instance stored in tagifyMap
    const tagify = tagifyMap.get(name);
    const excl = tagify ? tagify.value.map(t => (t.value || '').trim()).filter(Boolean) : [];
    exclusionsMap[name] = excl;

    if (name && isLocked && tableNum) {
      lockedGroups.push({ name, table: tableNum });
    }
  });

  generateTableWithLocks(lockedGroups, exclusionsMap);
});

function isSeatValid(candidateName, table, exclusionsMap = {}) {
  const cNorm = normalizeName(candidateName);
  const candEx = (exclusionsMap[candidateName] || []).map(normalizeName);

  return table.every(seatedName => {
    const sNorm = normalizeName(seatedName);
    const seatersEx = (exclusionsMap[seatedName] || []).map(normalizeName);
    return !candEx.includes(sNorm) && !seatersEx.includes(cNorm);
  });
}

function generateTableWithLocks(lockedGroups, exclusionsMap = {}) {
  const seatsPerTable = parseInt(seatsPerTableInput.value, 10);
  const animStyle = animStyleSelect.value;
  const animSpeed = parseFloat(animSpeedInput.value);
  const output = document.getElementById('output');

  let names = namesInput.value.split('\n').map(n => n.trim()).filter(n => n);

  if (dedupeSwitch.checked) names = [...new Set(names)];
  if (shuffleSwitch.checked) names.sort(() => Math.random() - 0.5);

  const lockedNames = lockedGroups.map(g => g.name);
  const unlockedNames = names.filter(n => !lockedNames.includes(n));

  output.innerHTML = '';
  const colClass = 'col-md-6';
  const tableMap = {};

  // Insert locked groups
  lockedGroups.forEach(({ name, table }) => {
    if (!tableMap[table]) tableMap[table] = [];
    tableMap[table].push(name);
  });

  const usedTableNums = new Set(lockedGroups.map(g => g.table));
  let remaining = [...unlockedNames];

  // Fill existing tables with exclusion check
  for (const tableNum of usedTableNums) {
    const current = tableMap[tableNum] || [];

    while (current.length < seatsPerTable && remaining.length > 0) {
      const candidateIndex = remaining.findIndex(name =>
        isSeatValid(name, current, exclusionsMap)
      );

      if (candidateIndex === -1) break; // no one fits here

      current.push(remaining.splice(candidateIndex, 1)[0]);
    }

    tableMap[tableNum] = current;
  }

  // Create new tables with exclusion check
  let nextTableNum = 1;
  while (remaining.length > 0) {
    while (usedTableNums.has(nextTableNum)) nextTableNum++;

    const newTable = [];

    while (newTable.length < seatsPerTable && remaining.length > 0) {
      const candidateIndex = remaining.findIndex(name =>
        isSeatValid(name, newTable, exclusionsMap)
      );

      if (candidateIndex === -1) break; // no one fits here

      newTable.push(remaining.splice(candidateIndex, 1)[0]);
    }

    tableMap[nextTableNum] = newTable;
    nextTableNum++;
  }

  // Optional: see if anybody couldn't be seated
  if (remaining.length > 0) {
    // console.warn(`Unseated due to exclusions:`, remaining);
    toasts.except.textContent = 'Unseated due to exclusions: ' + remaining
    toasts.except.show();
  }

  const headerColors = ['bg-primary','bg-secondary','bg-success','bg-danger','bg-warning','bg-info','bg-dark'];

  // Render tables
  Object.entries(tableMap).forEach(([tableNum, tableNames], i) => {
    const card = document.createElement('div');
    card.className = `${colClass} mb-3 anim-card-${animStyle}`;
    card.style.setProperty('--anim-duration', animSpeed + 's');

    const randomColor = headerColors[Math.floor(Math.random() * headerColors.length)];

    card.innerHTML = `
      <div class="card h-100 rounded-0">
        <div class="card-header d-flex justify-content-between align-items-center px-2 py-1 text-white ${randomColor} rounded-0 font-big">
          <span><strong>Table ${tableNum}</strong></span>
          <span class="badge bg-secondary badge-cap">${tableNames.length}/${seatsPerTable}</span>
        </div>
        <ul class="list-group list-group-flush min-height" data-table="${tableNum}">
          ${tableNames.map(n => `
            <li class="list-group-item font-big px-2 py-1 fw-bold" style="--anim-duration:${animSpeed}s">
              ${n}<span class="drag-handle"><i class="bi bi-grip-vertical"></i></span>
            </li>`).join('')}
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