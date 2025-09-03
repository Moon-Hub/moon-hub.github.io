# LotusGrid
A responsive, drag-and-drop table assignment tool for group-based events.

LotusGrid lets you assign people to tables. Whether you're organizing a tournament, dinner party, or collaborative workshop.
This app makes it easy to lock specific groups, enforce seat limits, and dynamically rearrange participants with intuitive visual feedback.

---

## Features

- **Group Locking Modal**  
  Assign individuals to specific tables and lock their placement. Locked groups are preserved during shuffling and table generation.

- **Smart Table Generation**  
  Automatically fills tables based on seat limits, ensuring locked groups are respected and remaining seats are efficiently distributed.

- **Drag-and-Drop with Swap Mode**  
  Rearrange participants across tables using native drag-and-drop. Hold `Shift` to activate swap mode and trade positions between tables.

- **Seat Cap Enforcement**  
  Prevents overfilling tables and disallows moves that would leave a table empty. Visual feedback and toasts guide user actions.

- **Persistent State & Undo-Friendly Architecture**  
  Modular logic supports opt-in features like persistent settings, undo/redo, and responsive layout toggles.

---

## 🛠 Tech Stack

- **HTML5 / CSS3 / Bootstrap 5**
- **JavaScript (ES6+)**
- **SortableJS** for drag-and-drop behavior - provided under the MIT License
- **Custom DOM logic** for swap detection, seat enforcement, and visual feedback

---


## License

MIT — feel free to fork, remix, and adapt.
