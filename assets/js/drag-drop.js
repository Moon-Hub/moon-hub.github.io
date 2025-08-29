import { toasts } from "./constants.js";

let currentPreview = null;

// Drag-and-drop
export function enableDragDrop() {
  const draggables = document.querySelectorAll('.list-group-item');
  const containers = document.querySelectorAll('.list-group');

  draggables.forEach(item => {
    item.setAttribute('draggable', true);
    item.addEventListener('dragstart', () => {
      item.classList.add('cursor-grabbing');
      setTimeout(() => item.classList.add('invisible'), 0);
    });
    item.addEventListener('dragend', () => {
      item.classList.remove('cursor-grabbing', 'invisible');
      clearPreview();
    });
  });

  containers.forEach(container => {
    container.addEventListener('dragover', e => handleDragOver(e, container));
    container.addEventListener('dragleave', clearPreview);
    container.addEventListener('drop', e => {
      e.preventDefault();
      clearPreview();
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
      document.querySelectorAll('.list-group').forEach(container => {
        const count = container.children.length;
        const badge = container.parentElement.querySelector('.badge-cap');
        badge.textContent = `${count}/${seatsPerTable}`;
        badge.className = `badge badge-cap ${count >= seatsPerTable ? 'bg-danger' : 'bg-secondary'}`;
      });
    }