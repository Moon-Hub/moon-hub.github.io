import { seatsPerTableInput, toasts } from "./constants.js";


export function enableDragDrop() {
  const appContainer = document.getElementById('appContainer');
  const containers = appContainer.querySelectorAll('.list-group');
  const seatsPerTable = parseInt(seatsPerTableInput.value, 10);
  const sortables = [];


  let swapMode = false;       // user intent

  containers.forEach(container => {
    const sortable = Sortable.create(container, {
      group: 'tables',
      animation: 150,
      fallbackTolerance: 3,
      swap: false,
      swapClass: 'swap-highlight',
      swapOnDrop: true,

      onStart: evt => {
        if (evt.originalEvent?.shiftKey) {
          swapMode = true;
          sortables.forEach(s => s.option('swap', true));
          toasts.swap.show();
        }
        binZone.classList.toggle('hidden'); // Show bin
        binZone.classList.toggle('visible'); // Show bin
      },

      onMove: evt => {
        const from = evt.from;
        const to = evt.to;
        const related = evt.related;
        const isSame = from === to;      
        const isBin = to.id === 'binZone';

        // 🛑 Block swap into bin
        if (swapMode && isBin) {
          return false;
        }

        // Prevent leaving a table empty
        if (!isSame && from.children.length === 1) {
          toasts.full.show?.("Can't leave a table empty");
          from.classList.add('shake');
          setTimeout(() => from.classList.remove('shake'), 400);
          return false;
        }

        // Seat cap logic
        if (!isSame && to.children.length >= seatsPerTable && !isBin) {
          if (swapMode) {
            if (!related) return false;
          } else {
            return false;
          }
        }


        // In swap mode, block if no valid target to swap with
        if (swapMode && !related) {
          return false;
        }

        return true;
      },

      onEnd: () => {
        swapMode = false;
        sortables.forEach(s => s.option('swap', false));
        binZone.classList.toggle('visible'); // Hide bin
        setTimeout(() => binZone.classList.toggle('hidden'), 300); // Wait for fade-out
        updateCounts();
      }

    });

    sortables.push(sortable);
    const binZone = document.getElementById('binZone');

Sortable.create(binZone, {
  group: 'tables',
  animation: 150,
  swap: false,
  sort: false, // prevent sorting inside bin
  onAdd: evt => {
    const item = evt.item;
    const from = evt.from;

    // Prevent deleting if it would leave a table empty
    if (from.classList.contains('list-group') && from.children.length === 0) {
      toasts.del.show();
      binZone.classList.add('shake');
      setTimeout(() => binZone.classList.remove('shake'), 400);
      return;
    }

      // Remove item from DOM
      item.remove();
    
      // Remove name from textarea
      const nameInput = document.getElementById('names');
      const nameToRemove = item.textContent.trim().toLowerCase();

      let lines = nameInput.value
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.toLowerCase() !== nameToRemove);

      nameInput.value = lines.join('\n');




    updateCounts();
  }
});

  });

  
}

export function updateCounts() {

  const appContainer = document.getElementById('appContainer');
  const containers = appContainer.querySelectorAll('.list-group');
  const seatsPerTable = parseInt(seatsPerTableInput.value, 10);

  containers.forEach(container => {
    const count = container.children.length;
    const badge = container.parentElement.querySelector('.badge-cap');
    badge.textContent = `${count}/${seatsPerTable}`;
    badge.className = `badge badge-cap ${count >= seatsPerTable ? 'bg-danger' : 'bg-secondary'}`;
  });
}