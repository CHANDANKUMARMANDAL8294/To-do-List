# FlowDo — Modern Task Management Web App 🚀

> **Task 04 — Midterm Internship Project**  
> A high-performance, aesthetically refined To-Do & Productivity Web Application engineered with vanilla web technologies, featuring real-time task management, category organization, smart deadline tracking, and interactive feedback.

---

## 🌟 Key Features & Requirements

### 1. Task Management (Add & Maintain)
- **Quick Add Bar**: Quickly type task titles and assign deadlines or priorities with a single keystroke.
- **Detailed Task Modal**: Form with fields for:
  - Task Title
  - Notes / Description
  - Category / List selection
  - Due Date & Due Time
  - Priority selector (Low, Medium, High)
  - Interactive Subtasks / Checklist builder
- **Edit Tasks**: Update title, notes, priority, list, or deadline anytime with the edit dialog.
- **Delete with Undo**: Delete tasks with a safety toast notification offering an immediate "Undo" action.
- **Star & Pin**: Pin high-priority tasks to the top of your list.

### 2. Organize in Lists & Categories
- **Smart Views**:
  - **All Tasks**: Comprehensive view across all categories.
  - **Today's Tasks**: Automatically filters tasks scheduled for today.
  - **Upcoming Deadlines**: Identifies pending tasks due in future dates.
  - **Starred & Important**: Displays critical pinned tasks.
- **Custom Lists**:
  - Built-in categories: *Work & Projects*, *Personal Life*, *Internship & Study*, *Shopping*, *Health & Fitness*.
  - Ability to create custom lists with user-defined names and accent color badges.
  - Dynamic task counter badges on every list item.

### 3. Completion & Interactive Feedback
- **Mark Completed**: Smooth strike-through transitions and animated SVG checkmarks.
- **Celebration Confetti**: Physics-based canvas confetti burst on task completion.
- **Web Audio Micro-Interactions**: Gentle synthesized chimes on completion, creation, and deletion (zero external audio files, 100% offline).
- **Productivity Score**: Dynamic circular/bar tracker showing completion rate (%) and motivational status.

### 4. Smart Date & Time Engine
- **Deadline Badges**:
  - 🔴 **Overdue**: Pulsing red indicator for missed deadlines.
  - 🟡 **Due Today**: Amber alert badge with specific time.
  - 🔵 **Tomorrow / Upcoming**: Indigo formatted time badges (e.g. `Oct 25, 6:00 PM`).
- Native HTML5 date and time pickers with custom validation.

### 5. Search, Filter & Sort
- **Instant Search**: Search through task titles, notes, and subtasks with live filtering.
- **Status & Priority Filters**: Quickly filter between *All*, *Pending*, *Completed*, *High*, *Medium*, and *Low*.
- **Multi-criteria Sorting**:
  - Deadline (Earliest First)
  - Deadline (Latest First)
  - Priority (High to Low)
  - Recently Created
  - Alphabetical (A to Z)

### 6. Design & Persistence
- **Glassmorphic Dark / Light Mode**: Seamless theme toggle persisted in `localStorage`.
- **Data Persistence**: Automatic `localStorage` saving.
- **Backup & Restore**: Export tasks and lists as JSON files, restore from backup, or reset to starter demo data.
- **Fully Responsive**: Mobile drawer navigation with backdrop filter and touch-friendly targets.

---

## 🛠️ Technology Stack

- **HTML5**: Semantic tags (`<main>`, `<aside>`, `<header>`, `<dialog>`), accessibility attributes (`aria-label`).
- **CSS3 (Vanilla)**:
  - Custom Properties (CSS Variables) for dark/light theme tokens.
  - CSS Flexbox & CSS Grid for fluid layouts.
  - Hardware-accelerated keyframe animations.
  - Responsive media queries.
- **JavaScript (ES6+)**:
  - Clean modular architecture (`storage.js`, `audio.js`, `confetti.js`, `app.js`).
  - Web Audio API (`AudioContext`) for synthesized sound effects.
  - HTML5 2D Canvas for particle physics.
  - LocalStorage API for offline persistence.

---

## 📂 Project Structure

```
d:/TO-Do-Web App/
│
├── index.html            # Main HTML application shell & modal structures
│
├── css/
│   ├── variables.css     # Design tokens, color schemes (Dark/Light), typography
│   ├── style.css         # Shell layout, sidebar, topbar, stats cards, filters
│   ├── components.css    # Task cards, custom checkboxes, badges, modals, toasts
│   └── animations.css    # Keyframe animations (pop, pulse, strike, slide)
│
├── js/
│   ├── storage.js        # LocalStorage manager, demo dataset, export/import JSON
│   ├── audio.js          # Web Audio API procedural UI sound effects
│   ├── confetti.js       # High-performance HTML5 Canvas confetti engine
│   └── app.js            # Core application state, event handlers & DOM renderer
│
└── README.md             # Project documentation & presentation guide
```

---

## 🚀 How to Run the Project

No build step or dependency installation is required! You can open and test this application in multiple ways:

### Option 1: Direct File Opening
Double-click `index.html` in your file explorer to open it directly in any modern web browser (Chrome, Edge, Firefox, Safari).

### Option 2: Local HTTP Server (Python)
Run the following command in PowerShell / Terminal:
```bash
python -m http.server 5500
```
Then visit: `http://localhost:5500`

### Option 3: Node / npx serve
```bash
npx serve .
```

---

## ⌨️ Keyboard Shortcuts
- `/` or `Ctrl + K`: Focus search bar immediately.
- `Escape`: Close any active modal or mobile drawer.
- `Enter`: Add task from quick-input bar or add subtask in modal.
