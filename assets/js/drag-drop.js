import { seatsPerTableInput } from "./constants.js";
import { toasts } from "./constants.js";


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
      },

      onMove: evt => {
        const from = evt.from;
        const to = evt.to;
        const related = evt.related;
        const isSame = from === to;

        // Prevent leaving a table empty
        if (!isSame && from.children.length === 1) {
          toasts.full.show?.("Can't leave a table empty");
          from.classList.add('shake');
          setTimeout(() => from.classList.remove('shake'), 400);
          return false;
        }

        // Seat cap logic
        if (!isSame && to.children.length >= seatsPerTable) {
          if (swapMode) {
            // In swap mode, only allow if hovering a real item
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
        updateCounts();
      }

    });

    sortables.push(sortable);

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