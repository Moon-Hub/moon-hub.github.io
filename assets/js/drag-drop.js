import { toasts } from "./constants.js";

let currentPreview = null;

export function enableDragDrop() {
  const appContainer = document.getElementById('appContainer');
  const containers = appContainer.querySelectorAll('.list-group');

  let swapMode = false;       // user intent
  let lastHover = null;       // highlight the candidate to swap with

  // Allow toggling intent mid-drag
  document.addEventListener('keydown', e => {
    if (e.key === 'Shift') swapMode = true;
  });
  document.addEventListener('keyup', e => {
    if (e.key === 'Shift') swapMode = false;
  });

  containers.forEach(container => {
    const sortable = Sortable.create(container, {
      group: { name: 'tables', pull: true, put: true },
      animation: 150,
      fallbackTolerance: 3,

      // Swap plugin defaults off; we toggle it during drag
      swap: false,
      swapClass: 'swap-highlight',
      swapOnDrop: true,       // only swap when dropping on an item (not while hovering)
      invertSwap: false,      // keep predictable targeting
      swapThreshold: 0.5,
      invertSwap: true,

      onStart: evt => {
        // Snapshot modifier at drag start for consistency; user can still toggle mid-drag
        const shiftAtStart = !!evt.originalEvent?.shiftKey;
        swapMode = swapMode || shiftAtStart;
        sortable.option('swap', swapMode);
      },

      onMove: evt => {
        const { from, to, related, dragged } = evt;
        const isSame = from === to;
        const targetList = to;
        const count = targetList.children.length;
        const fromCount = from.children.length;
        const toCount = to.children.length;


        // Keep target instance in sync with current intent
        const toInst = Sortable.get(to);
        const fromInst = Sortable.get(from);
        if (toInst) toInst.option('swap', swapMode);
        if (fromInst) fromInst.option('swap', swapMode);

        // Manage hover highlight for swap candidate
        if (lastHover && lastHover !== related) {
          lastHover.classList.remove('swap-candidate');
          lastHover = null;
        }
        if (swapMode && related && related !== dragged) {
          related.classList.add('swap-candidate');
          lastHover = related;
        }

        // Prevent removing the last person from a table
        if (!isSame && fromCount === 1) {
          toasts.full.show?.("Can't leave a table empty");
          from.classList.add('shake');
          setTimeout(() => from.classList.remove('shake'), 400);
          return false;
        }

        // Seat cap logic:
        // - Move into full list: block
        // - Swap into full list: allow only if hovering a concrete target item
        if (!isSame) {
          if (!swapMode && count >= seatsPerTable) {
            toasts.full.show();
            targetList.classList.add('shake');
            setTimeout(() => targetList.classList.remove('shake'), 400);
            return false;
          }
          if (swapMode) {
            // If list is full, ensure we actually have a target to swap with
            if (count >= seatsPerTable && !related) {
              toasts.full.show();
              targetList.classList.add('shake');
              setTimeout(() => targetList.classList.remove('shake'), 400);
              return false;
            }
          }
        }

        return true;
      },

      onEnd: evt => {
        // Clean up hover styling
        if (lastHover) {
          lastHover.classList.remove('swap-candidate');
          lastHover = null;
        }

        // Reset swap option on this instance to default off
        sortable.option('swap', false);

        updateCounts();
      }
    });
  });
}


// Drop Preview
function clearPreview() {
  if (currentPreview) {
    currentPreview.classList.remove('drop-preview');
    currentPreview = null;
  }
}

// Drag Over
function handleDragOver(e, container) {
  e.preventDefault();
  const afterElement = getDragAfterElement(container, e.clientY);
  const dragging = document.querySelector('.cursor-grabbing');
  if (!dragging) return;

  const currentCount = container.children.length;
  const isSameList = dragging.parentElement === container;

  // 🔹 Drop‑zone preview logic
  let previewTarget = afterElement || container.lastElementChild;
  if (previewTarget && previewTarget !== dragging) {
    if (currentPreview && currentPreview !== previewTarget) {
      currentPreview.classList.remove('drop-preview');
    }
    currentPreview = previewTarget;
    currentPreview.classList.add('drop-preview');
  }

  // 🔹 Full table swap logic
  if (currentCount >= seatsPerTable && !isSameList) {
    if (afterElement) {
      dragging.classList.remove('invisible');
      swapElementsInPlace(dragging, afterElement);
    } else {
      toasts.full.show();
      container.classList.add('shake');
      setTimeout(() => container.classList.remove('shake'), 400);
    }
    return;
  }

  // 🔹 Normal drop behaviour
  dragging.classList.remove('invisible');
  if (afterElement == null) {
    container.appendChild(dragging);
  } else {
    container.insertBefore(dragging, afterElement);
  }

  updateCounts();
}

  function swapElementsInPlace(a, b) {
    if (a === b) return;

    // Record initial positions
    const aRect = a.getBoundingClientRect();
    const bRect = b.getBoundingClientRect();

    const aParent = a.parentNode;
    const bParent = b.parentNode;

    // Swap instantly in DOM
    const aPh = document.createElement('div');
    const bPh = document.createElement('div');

    aParent.replaceChild(aPh, a);
    bParent.replaceChild(bPh, b);

    aParent.replaceChild(b, aPh);
    bParent.replaceChild(a, bPh);

    // Record final positions
    const aRectAfter = a.getBoundingClientRect();
    const bRectAfter = b.getBoundingClientRect();

    // Apply inverse transform for FLIP
    [a, b].forEach(el => {
      el.classList.add('swap-anim');
      el.style.transform = `translate(${aRect.left - aRectAfter.left}px, ${aRect.top - aRectAfter.top}px)`;
    });

    // Force reflow
    a.offsetWidth;

    // Animate to new position
    [a, b].forEach(el => {
      el.style.transform = '';
    });

    // Add highlight instantly
    setTimeout(() => {
      [a, b].forEach(el => el.classList.add('swap-highlight'));
    }, 20);

    // Determine direction
    let first, second;
    const dx = bRect.left - aRect.left;
    const dy = bRect.top - aRect.top;

    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal swap
      if (dx > 0) { first = a; second = b; } // left→right
      else { first = b; second = a; }        // right→left
    } else {
      // Vertical swap
      if (dy > 0) { first = a; second = b; } // top→bottom
      else { first = b; second = a; }        // bottom→top
    }

    // Calculate stagger based on distance (max extra delay ~200ms)
    const distance = Math.hypot(dx, dy);
    const baseDelay = 100; // ms between fades for adjacent swap
    const maxExtra = 200;  // ms extra for longest swaps
    const maxDistance = Math.max(window.innerWidth, window.innerHeight);
    const extraDelay = Math.min(maxExtra, (distance / maxDistance) * maxExtra);

    const staggerDelay = baseDelay + extraDelay;

    // Remove highlight in staggered order
    setTimeout(() => {
      first.classList.remove('swap-highlight', 'swap-anim');
    }, 450);

    setTimeout(() => {
      second.classList.remove('swap-highlight', 'swap-anim');
    }, 450 + staggerDelay);
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.list-group-item:not(.cursor-grabbing)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
            } else {
            return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    export function updateCounts() {

      const appContainer = document.getElementById('appContainer');
      const containers = appContainer.querySelectorAll('.list-group');

      containers.forEach(container => {
        const count = container.children.length;
        const badge = container.parentElement.querySelector('.badge-cap');
        badge.textContent = `${count}/${seatsPerTable}`;
        badge.className = `badge badge-cap ${count >= seatsPerTable ? 'bg-danger' : 'bg-secondary'}`;
      });
    }