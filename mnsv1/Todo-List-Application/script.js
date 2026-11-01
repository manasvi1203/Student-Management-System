/**
 * ============================================================================
 * TaskFlow — Modern To-Do List Application
 * Technology: Vanilla JavaScript (ES6+), HTML5, CSS3, LocalStorage
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 1. STATE & CONSTANTS
// ----------------------------------------------------------------------------
const STORAGE_KEY = 'taskflow_tasks_v1';

// Application State
let tasks = [];
let currentFilter = 'all';        // 'all' | 'pending' | 'completed' | 'high' | 'medium' | 'low'
let currentCategory = 'all';      // 'all' | 'Work' | 'Personal' | 'Study' | ...
let searchQuery = '';
let taskToDeleteId = null;

// Initial sample tasks loaded only on very first app run
const SAMPLE_TASKS = [
  {
    id: 'sample-1',
    title: 'Design high-converting landing page',
    description: 'Create wireframes in Figma and prepare the design tokens for the engineering team.',
    priority: 'High',
    category: 'Work',
    dueDate: getRelativeDateOffset(1), // Tomorrow
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'sample-2',
    title: 'Review weekly pull requests',
    description: 'Check frontend component tests and approve accessibility enhancements.',
    priority: 'Medium',
    category: 'Work',
    dueDate: getRelativeDateOffset(0), // Today
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'sample-3',
    title: 'Complete 30-minute mindfulness & yoga',
    description: 'Evening stretching routine and meditation practice.',
    priority: 'Low',
    category: 'Health',
    dueDate: getRelativeDateOffset(2),
    completed: true,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'sample-4',
    title: 'Budget review & monthly savings plan',
    description: 'Review bank statements, subscriptions, and investment deposits.',
    priority: 'High',
    category: 'Finance',
    dueDate: getRelativeDateOffset(-1), // Yesterday (overdue demonstration)
    completed: false,
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
];

// ----------------------------------------------------------------------------
// 2. DOM ELEMENT REFERENCES
// ----------------------------------------------------------------------------
// Dashboard Stats
const totalTasksCountEl = document.getElementById('totalTasksCount');
const completedTasksCountEl = document.getElementById('completedTasksCount');
const pendingTasksCountEl = document.getElementById('pendingTasksCount');
const completionPercentageEl = document.getElementById('completionPercentage');
const progressBarFillEl = document.getElementById('progressBarFill');

// Filter Tab Badges
const countAllEl = document.getElementById('countAll');
const countPendingEl = document.getElementById('countPending');
const countCompletedEl = document.getElementById('countCompleted');

// Search & Filter Controls
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const categoryFilter = document.getElementById('categoryFilter');
const filterTabs = document.querySelectorAll('.filter-tab');
const currentFilterTitleEl = document.getElementById('currentFilterTitle');
const filteredResultsLabelEl = document.getElementById('filteredResultsLabel');

// Task List & Empty State
const taskListEl = document.getElementById('taskList');
const emptyStateEl = document.getElementById('emptyState');
const emptyStateTitleEl = document.getElementById('emptyStateTitle');
const emptyStateDescEl = document.getElementById('emptyStateDesc');
const emptyStateActionBtn = document.getElementById('emptyStateActionBtn');

// Modals: Add / Edit Task
const taskModalOverlay = document.getElementById('taskModalOverlay');
const taskForm = document.getElementById('taskForm');
const modalTitle = document.getElementById('modalTitle');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const openAddModalBtn = document.getElementById('openAddModalBtn');

// Task Form Inputs
const taskIdInput = document.getElementById('taskIdInput');
const taskTitleInput = document.getElementById('taskTitleInput');
const taskDescInput = document.getElementById('taskDescInput');
const taskPriorityInput = document.getElementById('taskPriorityInput');
const taskCategoryInput = document.getElementById('taskCategoryInput');
const taskDueDateInput = document.getElementById('taskDueDateInput');
const titleError = document.getElementById('titleError');
const submitTaskBtn = document.getElementById('submitTaskBtn');

// Modals: Delete Confirmation
const deleteModalOverlay = document.getElementById('deleteModalOverlay');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Toasts Container
const toastContainer = document.getElementById('toastContainer');

// ----------------------------------------------------------------------------
// 3. INITIALIZATION
// ----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupEventListeners();
});

/**
 * Initializes application data from LocalStorage
 */
function initApp() {
  const storedTasks = localStorage.getItem(STORAGE_KEY);

  if (storedTasks) {
    try {
      tasks = JSON.parse(storedTasks);
    } catch (e) {
      console.error('Failed to parse tasks from localStorage', e);
      tasks = [...SAMPLE_TASKS];
      saveTasksToStorage();
    }
  } else {
    // First time launch: load starter sample tasks
    tasks = [...SAMPLE_TASKS];
    saveTasksToStorage();
  }

  // Update UI and stats
  updateDashboard();
  renderTasks();
}

/**
 * Set up all user interaction event listeners
 */
function setupEventListeners() {
  // Open Task Modal
  openAddModalBtn.addEventListener('click', () => openTaskModal());
  emptyStateActionBtn.addEventListener('click', () => openTaskModal());

  // Close Task Modal
  closeModalBtn.addEventListener('click', closeTaskModal);
  cancelModalBtn.addEventListener('click', closeTaskModal);

  // Close modals on clicking overlay backdrop
  taskModalOverlay.addEventListener('click', (e) => {
    if (e.target === taskModalOverlay) closeTaskModal();
  });

  deleteModalOverlay.addEventListener('click', (e) => {
    if (e.target === deleteModalOverlay) closeDeleteModal();
  });

  // Keyboard shortcut: close active modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!taskModalOverlay.classList.contains('hidden')) closeTaskModal();
      if (!deleteModalOverlay.classList.contains('hidden')) closeDeleteModal();
    }
  });

  // Task Form Submission (Add or Edit)
  taskForm.addEventListener('submit', handleTaskFormSubmit);

  // Clear Title Validation Error on typing
  taskTitleInput.addEventListener('input', () => {
    if (taskTitleInput.value.trim()) {
      taskTitleInput.classList.remove('input-error');
      titleError.classList.add('hidden');
    }
  });

  // Delete Confirmation Buttons
  cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  confirmDeleteBtn.addEventListener('click', handleConfirmDelete);

  // Search Input
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    clearSearchBtn.classList.toggle('hidden', searchQuery.length === 0);
    renderTasks();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.classList.add('hidden');
    searchInput.focus();
    renderTasks();
  });

  // Category Filter Dropdown
  categoryFilter.addEventListener('change', (e) => {
    currentCategory = e.target.value;
    renderTasks();
  });

  // Filter Tabs
  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      filterTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.getAttribute('data-filter');
      updateFilterTitle();
      renderTasks();
    });
  });
}

// ----------------------------------------------------------------------------
// 4. STORAGE OPERATIONS
// ----------------------------------------------------------------------------
/**
 * Saves current tasks array to browser LocalStorage
 */
function saveTasksToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    showToast('Could not save tasks to local storage.', 'danger');
  }
}

// ----------------------------------------------------------------------------
// 5. DASHBOARD & STATS LOGIC
// ----------------------------------------------------------------------------
/**
 * Computes and renders metrics on the dashboard cards
 */
function updateDashboard() {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  // Update counts on cards
  totalTasksCountEl.textContent = total;
  completedTasksCountEl.textContent = completed;
  pendingTasksCountEl.textContent = pending;

  // Update progress bar & percentage text
  completionPercentageEl.textContent = `${percentage}%`;
  progressBarFillEl.style.width = `${percentage}%`;

  // Update numbers inside filter tab pills
  countAllEl.textContent = total;
  countPendingEl.textContent = pending;
  countCompletedEl.textContent = completed;
}

// ----------------------------------------------------------------------------
// 6. TASK FILTERING & RENDERING
// ----------------------------------------------------------------------------
/**
 * Filters tasks based on status, priority, category, and search query
 */
function getFilteredTasks() {
  return tasks.filter((task) => {
    // Filter by Tab (Status or Priority)
    let matchesTab = true;
    if (currentFilter === 'pending') {
      matchesTab = !task.completed;
    } else if (currentFilter === 'completed') {
      matchesTab = task.completed;
    } else if (currentFilter === 'high') {
      matchesTab = task.priority.toLowerCase() === 'high';
    } else if (currentFilter === 'medium') {
      matchesTab = task.priority.toLowerCase() === 'medium';
    } else if (currentFilter === 'low') {
      matchesTab = task.priority.toLowerCase() === 'low';
    }

    // Filter by Category
    const matchesCategory =
      currentCategory === 'all' || task.category === currentCategory;

    // Filter by Search Query (searches title and description)
    const matchesSearch =
      searchQuery === '' ||
      task.title.toLowerCase().includes(searchQuery) ||
      (task.description && task.description.toLowerCase().includes(searchQuery));

    return matchesTab && matchesCategory && matchesSearch;
  });
}

/**
 * Updates the filter header title dynamically
 */
function updateFilterTitle() {
  const filterTitles = {
    all: 'All Tasks',
    pending: 'Pending Tasks',
    completed: 'Completed Tasks',
    high: 'High Priority Tasks',
    medium: 'Medium Priority Tasks',
    low: 'Low Priority Tasks'
  };
  currentFilterTitleEl.textContent = filterTitles[currentFilter] || 'Tasks';
}

/**
 * Main render function for task cards
 */
function renderTasks() {
  const filtered = getFilteredTasks();
  filteredResultsLabelEl.textContent = `${filtered.length} ${filtered.length === 1 ? 'task' : 'tasks'}`;

  // Clear existing list items
  taskListEl.innerHTML = '';

  if (filtered.length === 0) {
    taskListEl.classList.add('hidden');
    emptyStateEl.classList.remove('hidden');

    if (searchQuery) {
      emptyStateTitleEl.textContent = 'No matching tasks';
      emptyStateDescEl.textContent = `No tasks found matching "${searchQuery}". Try a different keyword or reset filters.`;
    } else if (currentCategory !== 'all') {
      emptyStateTitleEl.textContent = `No tasks in ${currentCategory}`;
      emptyStateDescEl.textContent = `You don't have any tasks assigned to ${currentCategory} yet.`;
    } else if (currentFilter !== 'all') {
      emptyStateTitleEl.textContent = `No ${currentFilter} tasks`;
      emptyStateDescEl.textContent = `There are currently no tasks that match this filter.`;
    } else {
      emptyStateTitleEl.textContent = 'No tasks yet';
      emptyStateDescEl.textContent = 'Keep your day organized! Click below to create your first task.';
    }
    return;
  }

  // Hide empty state and show list
  emptyStateEl.classList.add('hidden');
  taskListEl.classList.remove('hidden');

  // Render each task card
  filtered.forEach((task) => {
    const taskCard = createTaskElement(task);
    taskListEl.appendChild(taskCard);
  });
}

/**
 * Builds the DOM element for a single task card
 */
function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = 'task-card';
  li.setAttribute('data-id', task.id);

  const isOverdue = checkIsOverdue(task.dueDate, task.completed);
  if (task.completed) {
    li.classList.add('is-completed');
  }
  if (isOverdue) {
    li.classList.add('is-overdue');
  }

  // Priority badge styling
  const priorityLower = (task.priority || 'medium').toLowerCase();
  const priorityClass = `badge-priority-${priorityLower}`;

  // Category Icon helper
  const categoryIcon = getCategoryIcon(task.category);

  // Due Date Badge Text
  const dueDateDisplay = formatDueDate(task.dueDate);

  // Creation Date Text
  const createdDateDisplay = formatCreatedDate(task.createdAt);

  li.innerHTML = `
    <div class="task-checkbox-wrapper">
      <input 
        type="checkbox" 
        class="custom-checkbox" 
        aria-label="Mark task as ${task.completed ? 'pending' : 'completed'}"
        ${task.completed ? 'checked' : ''}
      >
    </div>

    <div class="task-content">
      <div class="task-title-row">
        <span class="task-title">${escapeHTML(task.title)}</span>
      </div>

      ${task.description ? `<p class="task-desc">${escapeHTML(task.description)}</p>` : ''}

      <div class="task-meta">
        <!-- Priority Pill -->
        <span class="meta-pill ${priorityClass}">
          <span class="priority-dot dot-${priorityLower}"></span>
          ${task.priority} Priority
        </span>

        <!-- Category Pill -->
        <span class="meta-pill badge-category">
          <span>${categoryIcon}</span>
          ${escapeHTML(task.category || 'General')}
        </span>

        <!-- Due Date Pill -->
        ${task.dueDate ? `
          <span class="meta-pill ${isOverdue ? 'badge-overdue' : 'badge-date'}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            ${isOverdue ? '⚠️ Overdue: ' : 'Due: '}${dueDateDisplay}
          </span>
        ` : ''}

        <!-- Created Date Pill -->
        <span class="meta-pill badge-date badge-created">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          ${createdDateDisplay}
        </span>
      </div>
    </div>

    <div class="task-actions">
      <button class="action-btn action-btn-edit" type="button" aria-label="Edit task" title="Edit task">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </button>
      <button class="action-btn action-btn-delete" type="button" aria-label="Delete task" title="Delete task">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </div>
  `;

  // Attach card event handlers
  const checkbox = li.querySelector('.custom-checkbox');
  checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));

  const editBtn = li.querySelector('.action-btn-edit');
  editBtn.addEventListener('click', () => openTaskModal(task));

  const deleteBtn = li.querySelector('.action-btn-delete');
  deleteBtn.addEventListener('click', () => promptDeleteTask(task.id));

  return li;
}

// ----------------------------------------------------------------------------
// 7. TASK CRUD ACTIONS
// ----------------------------------------------------------------------------
/**
 * Toggles a task between completed and pending
 */
function toggleTaskCompletion(taskId) {
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) return;

  const isNowCompleted = !tasks[taskIndex].completed;
  tasks[taskIndex].completed = isNowCompleted;

  saveTasksToStorage();
  updateDashboard();
  renderTasks();

  if (isNowCompleted) {
    showToast(`Task marked as completed! 🎉`, 'success');
  } else {
    showToast(`Task marked as pending.`, 'info');
  }
}

/**
 * Handles Task Form submit (both Add New Task and Edit Task)
 */
function handleTaskFormSubmit(e) {
  e.preventDefault();

  const title = taskTitleInput.value.trim();
  const description = taskDescInput.value.trim();
  const priority = taskPriorityInput.value;
  const category = taskCategoryInput.value;
  const dueDate = taskDueDateInput.value;
  const editingId = taskIdInput.value;

  // Validation: Task title must not be empty
  if (!title) {
    taskTitleInput.classList.add('input-error');
    titleError.classList.remove('hidden');
    taskTitleInput.focus();
    return;
  }

  if (editingId) {
    // Edit existing task
    const taskIndex = tasks.findIndex((t) => t.id === editingId);
    if (taskIndex !== -1) {
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        title,
        description,
        priority,
        category,
        dueDate
      };
      showToast('Task updated successfully!', 'success');
    }
  } else {
    // Create new task
    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title,
      description,
      priority,
      category,
      dueDate,
      completed: false,
      createdAt: new Date().toISOString()
    };
    tasks.unshift(newTask);
    showToast('New task added successfully! ✨', 'success');
  }

  saveTasksToStorage();
  updateDashboard();
  renderTasks();
  closeTaskModal();
}

/**
 * Opens delete confirmation modal
 */
function promptDeleteTask(taskId) {
  taskToDeleteId = taskId;
  deleteModalOverlay.classList.remove('hidden');
}

/**
 * Closes delete confirmation modal
 */
function closeDeleteModal() {
  taskToDeleteId = null;
  deleteModalOverlay.classList.add('hidden');
}

/**
 * Confirms deletion of the selected task
 */
function handleConfirmDelete() {
  if (!taskToDeleteId) return;

  tasks = tasks.filter((t) => t.id !== taskToDeleteId);
  saveTasksToStorage();
  updateDashboard();
  renderTasks();
  closeDeleteModal();
  showToast('Task deleted successfully.', 'danger');
}

// ----------------------------------------------------------------------------
// 8. MODAL WINDOW MANAGEMENT
// ----------------------------------------------------------------------------
/**
 * Opens Add or Edit Task Modal
 * @param {Object} [taskToEdit=null] - If provided, opens in edit mode
 */
function openTaskModal(taskToEdit = null) {
  taskForm.reset();
  taskTitleInput.classList.remove('input-error');
  titleError.classList.add('hidden');

  if (taskToEdit) {
    // Edit Mode
    modalTitle.textContent = 'Edit Task';
    submitTaskBtn.textContent = 'Save Changes';
    taskIdInput.value = taskToEdit.id;
    taskTitleInput.value = taskToEdit.title;
    taskDescInput.value = taskToEdit.description || '';
    taskPriorityInput.value = taskToEdit.priority || 'Medium';
    taskCategoryInput.value = taskToEdit.category || 'Work';
    taskDueDateInput.value = taskToEdit.dueDate || '';
  } else {
    // Create Mode
    modalTitle.textContent = 'Create New Task';
    submitTaskBtn.textContent = 'Create Task';
    taskIdInput.value = '';
    taskPriorityInput.value = 'Medium';
    taskCategoryInput.value = 'Work';
    // Set default due date to tomorrow for convenience
    taskDueDateInput.value = getRelativeDateOffset(1);
  }

  taskModalOverlay.classList.remove('hidden');
  setTimeout(() => taskTitleInput.focus(), 50);
}

/**
 * Closes the Add / Edit Task Modal
 */
function closeTaskModal() {
  taskModalOverlay.classList.add('hidden');
}

// ----------------------------------------------------------------------------
// 9. TOAST NOTIFICATIONS SYSTEM
// ----------------------------------------------------------------------------
/**
 * Displays a toast alert
 * @param {string} message
 * @param {'success'|'danger'|'info'} [type='info']
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconSvg =
    type === 'success'
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
      : type === 'danger'
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;

  toast.innerHTML = `
    <span class="toast-icon">${iconSvg}</span>
    <span class="toast-message">${escapeHTML(message)}</span>
  `;

  toastContainer.appendChild(toast);

  // Automatically dismiss after 3.2 seconds
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => {
      if (toastContainer.contains(toast)) {
        toastContainer.removeChild(toast);
      }
    }, 260);
  }, 3200);
}

// ----------------------------------------------------------------------------
// 10. DATE HELPERS & UTILITIES
// ----------------------------------------------------------------------------
/**
 * Determines whether a task's due date has passed
 */
function checkIsOverdue(dueDateStr, isCompleted) {
  if (!dueDateStr || isCompleted) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Parse YYYY-MM-DD
  const [year, month, day] = dueDateStr.split('-').map(Number);
  const dueDate = new Date(year, month - 1, day);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate < today;
}

/**
 * Returns formatted readable due date
 */
function formatDueDate(dueDateStr) {
  if (!dueDateStr) return 'No due date';

  const [year, month, day] = dueDateStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  targetDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (targetDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (targetDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  } else if (targetDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }

  // Format as "MMM D, YYYY"
  return targetDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: targetDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  });
}

/**
 * Formats ISO string into creation date representation
 */
function formatCreatedDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return 'Created ' + date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Returns a YYYY-MM-DD date string offset from today
 */
function getRelativeDateOffset(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns an emoji/symbol corresponding to the category
 */
function getCategoryIcon(category) {
  switch (category) {
    case 'Work': return '💼';
    case 'Personal': return '🏡';
    case 'Study': return '📚';
    case 'Health': return '🧘';
    case 'Finance': return '💰';
    default: return '✨';
  }
}

/**
 * Sanitizes untrusted user strings before injecting into HTML
 */
function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

