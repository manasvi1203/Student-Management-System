# TaskFlow — Modern Productivity & To-Do Application

A minimalist, high-performance To-Do and Task Management dashboard built with pure **HTML5**, **CSS3**, and **Vanilla JavaScript** (no external framework or library dependencies). TaskFlow is designed with a light aesthetic, purple and blue gradient accents, smooth micro-interactions, and instant persistence via browser `LocalStorage`.

---

## 🚀 Live Preview & Overview

- **Design Philosophy**: Minimalist, clean, and intuitive with a subtle light background, rounded cards, refined typography (`Plus Jakarta Sans`), and accessible color contrast.
- **Color Palette**: Electric Indigo (`#6366f1`), Royal Purple (`#8b5cf6`), Sky Blue (`#3b82f6`), crisp white card surfaces, and soft ambient glows.
- **Responsiveness**: Fully responsive layout designed for mobile phones, tablets, laptops, and ultra-wide desktop monitors.

---

## ✨ Features

### 1. Task Dashboard & Analytics
- **Total Tasks**: Real-time counter of all created tasks.
- **Completed Tasks**: Live count of finished tasks.
- **Pending Tasks**: Tracks ongoing items.
- **Dynamic Completion Rate**: Visual percentage and an animated progress bar indicating your completion progress.

### 2. Task Creation & Input Validation
- **Title Validation**: Required task title with real-time feedback and empty input prevention.
- **Optional Description**: Multi-line details, sub-notes, or reference links.
- **Priority Selector**: Low (🟢), Medium (🟡), and High (🔴) priority indicators.
- **Due Date Picker**: Choose specific target deadlines.
- **Category Tags**: Organize by `💼 Work`, `🏡 Personal`, `📚 Study`, `🧘 Health`, `💰 Finance`, or `✨ Other`.

### 3. Comprehensive Task Management
- **One-Click Toggle**: Mark tasks completed with an animated custom checkbox and strike-through styling.
- **Full Editing**: Modify titles, descriptions, due dates, priorities, or categories at any time with pre-filled inputs.
- **Custom Delete Confirmation**: Avoid accidental deletions with a smooth modal prompt.
- **Creation Timestamps**: View when tasks were added (`Created Nov 1, 2026`).
- **Overdue Indicator**: Automatically highlights overdue tasks with warning badges (`⚠️ Overdue`) if the deadline has passed.

### 4. Search & Multi-Level Filtering
- **Instant Search**: Live search filtering by task title or description keywords with a quick clear (`×`) button.
- **Filter Tabs**:
  - All Tasks
  - Pending Tasks
  - Completed Tasks
  - High Priority
  - Medium Priority
  - Low Priority
- **Category Filter**: Filter specifically by Work, Personal, Study, Health, or Finance.

### 5. LocalStorage & First-Run Experience
- **Auto-Persistence**: All actions (create, edit, toggle, delete) immediately synchronize with `localStorage`.
- **First Launch Experience**: Pre-loaded with 4 helpful starter tasks so the dashboard looks populated and demonstrates overdue, pending, and completed states.

### 6. User Experience & Micro-Interactions
- **Toast Notifications**: Non-intrusive feedback toasts for task creation, status updates, edits, and deletions.
- **Empty States**: Helpful illustrations and context-aware messages when no tasks match current filters or search queries.
- **Keyboard Friendly**: Press <kbd>Esc</kbd> to close open modals at any time, with automatic input focus on launch.

---

## 📁 File Structure

```text
Todo-List-Application/
├── index.html       # Semantic HTML5 markup, dashboard structure, and modal dialogs
├── style.css        # Modern CSS3 styling, design tokens, animations, and responsive rules
├── script.js        # Vanilla JavaScript ES6+ state management, CRUD, filters, and LocalStorage
└── README.md        # Comprehensive documentation and setup instructions
```

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| **HTML5** | Semantic tags (`<header>`, `<main>`, `<section>`, `<dialog>`, `<nav>`) |
| **CSS3** | CSS variables, Flexbox, Grid, keyframe animations, glassmorphism, responsive media queries |
| **Vanilla JavaScript (ES6+)** | State management, DOM manipulation, custom event handling |
| **LocalStorage API** | Browser-native client-side data persistence |
| **Google Fonts** | `Plus Jakarta Sans` for typography |

---

## 💻 How to Run in Visual Studio Code

You can run this project in Visual Studio Code in two simple ways:

### Method 1: Using the VS Code "Live Server" Extension (Recommended)

1. Open **Visual Studio Code**.
2. Go to **File** > **Open Folder...** and select the `Todo-List-Application` folder.
3. If you haven't already, install the **Live Server** extension:
   - Click the **Extensions** icon on the left sidebar (or press `Ctrl+Shift+X` / `Cmd+Shift+X`).
   - Search for **Live Server** (by *Ritwick Dey*) and click **Install**.
4. In the VS Code file explorer, right-click on `index.html`.
5. Select **"Open with Live Server"** (or click the **"Go Live"** button in the bottom status bar).
6. Your default browser will automatically open `http://127.0.0.1:5500/index.html` with hot-reloading enabled.

---

### Method 2: Direct Browser Launch (No Extensions Needed)

1. Open the `Todo-List-Application` folder on your computer in **File Explorer** (Windows) or **Finder** (macOS).
2. Double-click `index.html`.
3. It will immediately open and run smoothly in Google Chrome, Microsoft Edge, Mozilla Firefox, Brave, or Safari!
4. Alternatively, inside VS Code:
   - Right-click `index.html` in the file explorer.
   - Choose **"Copy Path"**.
   - Paste the path into your web browser's address bar and press **Enter**.

---

## 🧪 Testing the Features

1. **Dashboard Updates**: Check off a task and observe the "Completed Tasks" counter and progress bar update immediately.
2. **Add a Task**: Click the "+ New Task" button, fill in the fields, and hit "Save Task". Notice the success toast.
3. **Empty Validation**: Open the modal and hit "Save Task" without entering a title to see the validation highlight.
4. **Search**: Type words like `"Review"` or `"Design"` into the search box to see real-time filtering.
5. **Filters**: Switch between "Pending", "Completed", and priority tabs like "High Priority".
6. **Overdue Highlighting**: Add a task with yesterday's date to see the overdue alert badge appear.
7. **Persistence**: Refresh the page or close your browser tab; all your tasks and their statuses will remain saved.

---

## 📄 License
This project is open-source and free to use for personal and commercial projects.

