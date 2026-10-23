/**
 * Main Application Controller for To-Do Web App
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    tasks: StorageManager.getTasks(),
    lists: StorageManager.getLists(),
    activeFilter: 'all', // 'all' | 'pending' | 'completed' | 'high' | 'medium' | 'low'
    activeListId: 'all', // 'all' | 'today' | 'upcoming' | 'important' | specific list id
    searchQuery: '',
    sortBy: 'dueDate-asc',
    theme: StorageManager.getTheme(),
    soundEnabled: StorageManager.getSoundEnabled(),
    editingTaskId: null,
    modalSubtasks: [],
    lastDeletedTask: null
  };

  // DOM Elements
  const elements = {
    html: document.documentElement,
    confettiCanvas: document.getElementById('confettiCanvas'),
    sidebar: document.getElementById('sidebar'),
    sidebarBackdrop: document.getElementById('sidebarBackdrop'),
    sidebarToggleBtn: document.getElementById('sidebarToggleBtn'),
    sidebarCloseBtn: document.getElementById('sidebarCloseBtn'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    soundToggleBtn: document.getElementById('soundToggleBtn'),
    backupBtn: document.getElementById('backupBtn'),
    openAddModalBtn: document.getElementById('openAddModalBtn'),
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    viewTitle: document.getElementById('viewTitle'),
    viewSubtitle: document.getElementById('viewSubtitle'),
    activeFilterChips: document.querySelectorAll('.filter-chip'),
    sortSelect: document.getElementById('sortSelect'),
    taskListPending: document.getElementById('taskListPending'),
    taskListCompleted: document.getElementById('taskListCompleted'),
    completedSectionDivider: document.getElementById('completedSectionDivider'),
    emptyState: document.getElementById('emptyState'),
    customListsContainer: document.getElementById('customListsContainer'),
    // Stats
    statTotal: document.getElementById('statTotal'),
    statPending: document.getElementById('statPending'),
    statCompleted: document.getElementById('statCompleted'),
    statOverdue: document.getElementById('statOverdue'),
    prodProgressBar: document.getElementById('prodProgressBar'),
    prodPercentText: document.getElementById('prodPercentText'),
    prodMotivationText: document.getElementById('prodMotivationText'),
    // Counters
    countAll: document.getElementById('countAll'),
    countToday: document.getElementById('countToday'),
    countUpcoming: document.getElementById('countUpcoming'),
    countImportant: document.getElementById('countImportant'),
    // Quick Add
    quickTaskForm: document.getElementById('quickTaskForm'),
    quickTaskInput: document.getElementById('quickTaskInput'),
    quickDateBtn: document.getElementById('quickDateBtn'),
    quickPriorityBtn: document.getElementById('quickPriorityBtn'),
    // Modals
    taskModal: document.getElementById('taskModal'),
    taskModalTitle: document.getElementById('taskModalTitle'),
    taskForm: document.getElementById('taskForm'),
    taskFormTitle: document.getElementById('taskFormTitle'),
    taskFormNotes: document.getElementById('taskFormNotes'),
    taskFormList: document.getElementById('taskFormList'),
    taskFormDate: document.getElementById('taskFormDate'),
    taskFormTime: document.getElementById('taskFormTime'),
    taskFormSubtaskInput: document.getElementById('taskFormSubtaskInput'),
    taskFormAddSubtaskBtn: document.getElementById('taskFormAddSubtaskBtn'),
    modalSubtasksList: document.getElementById('modalSubtasksList'),
    taskModalCloseBtn: document.getElementById('taskModalCloseBtn'),
    taskModalCancelBtn: document.getElementById('taskModalCancelBtn'),
    // Add List Modal
    addListBtn: document.getElementById('addListBtn'),
    listModal: document.getElementById('listModal'),
    listModalCloseBtn: document.getElementById('listModalCloseBtn'),
    listModalCancelBtn: document.getElementById('listModalCancelBtn'),
    listForm: document.getElementById('listForm'),
    listNameInput: document.getElementById('listNameInput'),
    // Backup & Restore Modal
    backupModal: document.getElementById('backupModal'),
    backupModalCloseBtn: document.getElementById('backupModalCloseBtn'),
    exportJsonBtn: document.getElementById('exportJsonBtn'),
    importJsonInput: document.getElementById('importJsonInput'),
    resetDemoBtn: document.getElementById('resetDemoBtn'),
    // Toast
    toastContainer: document.getElementById('toastContainer')
  };

  // Quick State for Quick Add
  let quickSelectedDate = '';
  let quickSelectedPriority = 'medium';

  // Initialize Engines
  ConfettiFX.init(elements.confettiCanvas);
  SoundEffects.init(state.soundEnabled);

  // Apply Theme
  function applyTheme(theme) {
    state.theme = theme;
    elements.html.setAttribute('data-theme', theme);
    StorageManager.saveTheme(theme);
    const sunIcon = elements.themeToggleBtn.querySelector('.icon-sun');
    const moonIcon = elements.themeToggleBtn.querySelector('.icon-moon');
    if (theme === 'dark') {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    } else {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    }
  }

  // Apply Sound Setting
  function applySoundSetting(enabled) {
    state.soundEnabled = enabled;
    SoundEffects.isEnabled = enabled;
    StorageManager.saveSoundEnabled(enabled);
    const soundOn = elements.soundToggleBtn.querySelector('.icon-sound-on');
    const soundOff = elements.soundToggleBtn.querySelector('.icon-sound-off');
    if (enabled) {
      soundOn.style.display = 'block';
      soundOff.style.display = 'none';
    } else {
      soundOn.style.display = 'none';
      soundOff.style.display = 'block';
    }
  }

  // Toast Notification System
  function showToast(message, type = 'info', actionText = null, onAction = null) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const textSpan = document.createElement('span');
    textSpan.textContent = message;
    toast.appendChild(textSpan);

    if (actionText && onAction) {
      const actionBtn = document.createElement('button');
      actionBtn.className = 'toast-action-btn';
      actionBtn.textContent = actionText;
      actionBtn.onclick = () => {
        onAction();
        toast.remove();
      };
      toast.appendChild(actionBtn);
    }

    elements.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  // Date Formatting and Badge Calculations
  function getDueStatus(dueDateStr) {
    if (!dueDateStr) return null;
    const due = new Date(dueDateStr);
    const now = new Date();
    
    // Reset time for day comparisons
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDateDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    
    const diffTime = dueDateDay.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    const isPastExact = due.getTime() < now.getTime();

    // Time format e.g. "3:30 PM"
    const timeStr = due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const monthStr = due.toLocaleDateString([], { month: 'short', day: 'numeric' });

    if (isPastExact && diffDays <= 0) {
      return {
        label: `Overdue (${diffDays === 0 ? 'Today ' + timeStr : monthStr})`,
        class: 'due-overdue',
        isOverdue: true
      };
    } else if (diffDays === 0) {
      return {
        label: `Today, ${timeStr}`,
        class: 'due-today',
        isOverdue: false
      };
    } else if (diffDays === 1) {
      return {
        label: `Tomorrow, ${timeStr}`,
        class: 'due-upcoming',
        isOverdue: false
      };
    } else {
      return {
        label: `${monthStr}, ${timeStr}`,
        class: 'due-upcoming',
        isOverdue: false
      };
    }
  }

  // Populate Categories in Form Selects
  function populateListDropdowns() {
    elements.taskFormList.innerHTML = '';
    state.lists.forEach(l => {
      const opt = document.createElement('option');
      opt.value = l.id;
      opt.textContent = l.name;
      elements.taskFormList.appendChild(opt);
    });
  }

  // Render Sidebar Lists
  function renderSidebarLists() {
    elements.customListsContainer.innerHTML = '';

    state.lists.forEach(list => {
      const count = state.tasks.filter(t => t.listId === list.id && !t.completed).length;
      const li = document.createElement('li');

      const btn = document.createElement('button');
      btn.className = `nav-item-btn ${state.activeListId === list.id ? 'active' : ''}`;
      btn.dataset.listId = list.id;
      btn.innerHTML = `
        <div class="item-left">
          <span class="list-color-dot" style="background-color: ${list.color};"></span>
          <span>${escapeHTML(list.name)}</span>
        </div>
        <span class="nav-counter">${count}</span>
      `;

      btn.addEventListener('click', () => {
        SoundEffects.playClickSound();
        state.activeListId = list.id;
        document.querySelectorAll('.nav-item-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateViewHeader();
        renderTasks();
        closeMobileSidebar();
      });

      li.appendChild(btn);
      elements.customListsContainer.appendChild(li);
    });
  }

  // Update Top Stats & Productivity Card
  function updateStats() {
    const total = state.tasks.length;
    const completed = state.tasks.filter(t => t.completed).length;
    const pending = total - completed;

    const now = new Date().getTime();
    const overdue = state.tasks.filter(t => {
      if (t.completed || !t.dueDate) return false;
      return new Date(t.dueDate).getTime() < now;
    }).length;

    elements.statTotal.textContent = total;
    elements.statPending.textContent = pending;
    elements.statCompleted.textContent = completed;
    elements.statOverdue.textContent = overdue;

    // Productivity Percentage
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    elements.prodProgressBar.style.width = `${percentage}%`;
    elements.prodPercentText.textContent = `${percentage}% Completed`;

    if (percentage === 100 && total > 0) {
      elements.prodMotivationText.textContent = "All caught up! Outstanding job! 🚀";
    } else if (percentage >= 70) {
      elements.prodMotivationText.textContent = "Almost there! Keep up the momentum! 🔥";
    } else if (percentage >= 30) {
      elements.prodMotivationText.textContent = "Great progress so far! Keep going! 💪";
    } else {
      elements.prodMotivationText.textContent = "Let's organize and conquer today! ✨";
    }

    // Sidebar Smart Counts
    elements.countAll.textContent = pending;

    // Today count
    const todayDate = new Date();
    const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth()+1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
    const todayPending = state.tasks.filter(t => {
      if (t.completed || !t.dueDate) return false;
      return t.dueDate.startsWith(todayStr);
    }).length;
    elements.countToday.textContent = todayPending;

    // Upcoming count
    const upcomingPending = state.tasks.filter(t => {
      if (t.completed || !t.dueDate) return false;
      return new Date(t.dueDate).getTime() > todayDate.getTime();
    }).length;
    elements.countUpcoming.textContent = upcomingPending;

    // Important count
    const importantPending = state.tasks.filter(t => !t.completed && t.starred).length;
    elements.countImportant.textContent = importantPending;
  }

  // Update Main View Title & Subtitle
  function updateViewHeader() {
    let title = 'All Tasks';
    let subtitle = 'View, manage and prioritize all your tasks';

    if (state.activeListId === 'all') {
      title = 'All Tasks';
      subtitle = 'Organized overview across all lists and categories';
    } else if (state.activeListId === 'today') {
      title = "Today's Schedule";
      subtitle = 'Tasks with deadlines scheduled for today';
    } else if (state.activeListId === 'upcoming') {
      title = 'Upcoming Deadlines';
      subtitle = 'Tasks due in the coming days and weeks';
    } else if (state.activeListId === 'important') {
      title = 'Starred & Important';
      subtitle = 'High-priority starred items requiring prompt attention';
    } else {
      const currentList = state.lists.find(l => l.id === state.activeListId);
      if (currentList) {
        title = currentList.name;
        subtitle = `Tasks categorized under ${currentList.name}`;
      }
    }

    if (state.searchQuery) {
      title = `Search: "${state.searchQuery}"`;
      subtitle = 'Showing all tasks matching your search query';
    }

    elements.viewTitle.innerHTML = title;
    elements.viewSubtitle.textContent = subtitle;
  }

  // Filter and Sort Tasks
  function getFilteredAndSortedTasks() {
    let filtered = [...state.tasks];

    // 1. Sidebar List Filter
    if (state.activeListId === 'today') {
      const todayDate = new Date();
      const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth()+1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
      filtered = filtered.filter(t => t.dueDate && t.dueDate.startsWith(todayStr));
    } else if (state.activeListId === 'upcoming') {
      const now = new Date().getTime();
      filtered = filtered.filter(t => t.dueDate && new Date(t.dueDate).getTime() > now);
    } else if (state.activeListId === 'important') {
      filtered = filtered.filter(t => t.starred);
    } else if (state.activeListId !== 'all') {
      filtered = filtered.filter(t => t.listId === state.activeListId);
    }

    // 2. Status / Priority Filter Chips
    if (state.activeFilter === 'pending') {
      filtered = filtered.filter(t => !t.completed);
    } else if (state.activeFilter === 'completed') {
      filtered = filtered.filter(t => t.completed);
    } else if (['high', 'medium', 'low'].includes(state.activeFilter)) {
      filtered = filtered.filter(t => t.priority === state.activeFilter);
    }

    // 3. Search Query Filter
    if (state.searchQuery.trim() !== '') {
      const q = state.searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.notes && t.notes.toLowerCase().includes(q)) ||
        (t.subtasks && t.subtasks.some(st => st.text.toLowerCase().includes(q)))
      );
    }

    // 4. Sorting
    const priorityWeight = { high: 3, medium: 2, low: 1 };

    filtered.sort((a, b) => {
      // Pinned / Starred tasks always stay on top if uncompleted
      if (a.starred !== b.starred && !a.completed && !b.completed) {
        return a.starred ? -1 : 1;
      }

      switch (state.sortBy) {
        case 'dueDate-asc':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'dueDate-desc':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        case 'priority-desc':
          return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
        case 'createdAt-desc':
          return (b.createdAt || 0) - (a.createdAt || 0);
        case 'title-asc':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }

  // Render Tasks List to DOM
  function renderTasks() {
    elements.taskListPending.innerHTML = '';
    elements.taskListCompleted.innerHTML = '';

    const allFiltered = getFilteredAndSortedTasks();
    const pendingTasks = allFiltered.filter(t => !t.completed);
    const completedTasks = allFiltered.filter(t => t.completed);

    if (allFiltered.length === 0) {
      elements.emptyState.style.display = 'flex';
      elements.completedSectionDivider.style.display = 'none';
    } else {
      elements.emptyState.style.display = 'none';
    }

    // Render Pending
    pendingTasks.forEach(task => {
      const card = createTaskCardElement(task);
      elements.taskListPending.appendChild(card);
    });

    // Render Completed
    if (completedTasks.length > 0) {
      elements.completedSectionDivider.style.display = 'flex';
      completedTasks.forEach(task => {
        const card = createTaskCardElement(task);
        elements.taskListCompleted.appendChild(card);
      });
    } else {
      elements.completedSectionDivider.style.display = 'none';
    }

    updateStats();
    renderSidebarLists();
  }

  // Create Task Card DOM Element
  function createTaskCardElement(task) {
    const li = document.createElement('li');
    li.className = `task-card animate-slide-up priority-${task.priority}-border ${task.completed ? 'completed' : ''}`;
    li.dataset.taskId = task.id;

    // List info
    const list = state.lists.find(l => l.id === task.listId) || { name: 'General', color: '#6366f1' };
    const dueInfo = getDueStatus(task.dueDate);

    // Subtasks summary
    const totalSubtasks = (task.subtasks || []).length;
    const completedSubtasks = (task.subtasks || []).filter(st => st.completed).length;
    const subtaskPercent = totalSubtasks === 0 ? 0 : Math.round((completedSubtasks / totalSubtasks) * 100);

    li.innerHTML = `
      <div class="task-main-row">
        <label class="task-checkbox-wrap" title="Mark task ${task.completed ? 'incomplete' : 'complete'}">
          <input type="checkbox" class="task-checkbox-input" ${task.completed ? 'checked' : ''}>
          <div class="task-checkbox-custom">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </label>

        <div class="task-content">
          <div class="task-title-line">
            <span class="task-title">${escapeHTML(task.title)}</span>
          </div>

          ${task.notes ? `<p class="task-notes">${escapeHTML(task.notes)}</p>` : ''}

          <div class="task-meta-row">
            <!-- List badge -->
            <span class="meta-badge badge-category">
              <span class="list-color-dot" style="background-color: ${list.color};"></span>
              ${escapeHTML(list.name)}
            </span>

            <!-- Priority badge -->
            <span class="meta-badge badge-priority-${task.priority}">
              ${capitalize(task.priority)} Priority
            </span>

            <!-- Due Date Badge -->
            ${dueInfo ? `
              <span class="meta-badge badge-due ${dueInfo.class}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                ${dueInfo.label}
              </span>
            ` : ''}
          </div>

          <!-- Subtasks Widget if any exist -->
          ${totalSubtasks > 0 ? `
            <div class="subtasks-wrapper">
              <div class="subtasks-header" data-action="toggle-subtasks">
                <div class="subtasks-progress-indicator">
                  <div class="subtasks-bar">
                    <div class="subtasks-fill" style="width: ${subtaskPercent}%;"></div>
                  </div>
                  <span>${completedSubtasks}/${totalSubtasks} Subtasks</span>
                </div>
                <svg class="subtasks-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>

              <div class="subtasks-list" style="display: none;">
                ${task.subtasks.map(st => `
                  <div class="subtask-item ${st.completed ? 'completed' : ''}" data-subtask-id="${st.id}">
                    <div class="subtask-check ${st.completed ? 'checked' : ''}">
                      ${st.completed ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>` : ''}
                    </div>
                    <span>${escapeHTML(st.text)}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <div class="task-actions">
          <button class="task-action-btn star-btn ${task.starred ? 'starred' : ''}" title="${task.starred ? 'Unstar task' : 'Star / Pin task'}" data-action="star">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${task.starred ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </button>

          <button class="task-action-btn edit-btn" title="Edit task" data-action="edit">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>

          <button class="task-action-btn delete-btn" title="Delete task" data-action="delete">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;

    // Bind Event Listeners on Card
    const checkInput = li.querySelector('.task-checkbox-input');
    checkInput.addEventListener('change', (e) => {
      toggleTaskCompletion(task.id, e.target.checked, e);
    });

    li.querySelector('[data-action="star"]').addEventListener('click', () => {
      toggleStarTask(task.id);
    });

    li.querySelector('[data-action="edit"]').addEventListener('click', () => {
      openEditModal(task);
    });

    li.querySelector('[data-action="delete"]').addEventListener('click', () => {
      deleteTask(task.id);
    });

    // Subtask dropdown toggle
    const subtasksHeader = li.querySelector('[data-action="toggle-subtasks"]');
    if (subtasksHeader) {
      subtasksHeader.addEventListener('click', () => {
        const listDiv = li.querySelector('.subtasks-list');
        const chevron = li.querySelector('.subtasks-chevron');
        const isHidden = listDiv.style.display === 'none';
        listDiv.style.display = isHidden ? 'flex' : 'none';
        chevron.classList.toggle('expanded', isHidden);
      });

      // Subtask item check clicks
      li.querySelectorAll('.subtask-item').forEach(subItem => {
        subItem.addEventListener('click', () => {
          const stId = subItem.dataset.subtaskId;
          toggleSubtaskCompletion(task.id, stId);
        });
      });
    }

    return li;
  }

  // Toggle Task Completion
  function toggleTaskCompletion(taskId, isCompleted, event) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.completed = isCompleted;
    StorageManager.saveTasks(state.tasks);

    if (isCompleted) {
      SoundEffects.playCompleteSound();
      if (event) {
        const rect = event.target.getBoundingClientRect();
        ConfettiFX.fire(rect.left + 10, rect.top + 10);
      }
      showToast(`Completed "${task.title}" 🎉`, 'success');
    } else {
      SoundEffects.playClickSound();
    }

    renderTasks();
  }

  // Toggle Subtask Completion
  function toggleSubtaskCompletion(taskId, subtaskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return;

    const st = task.subtasks.find(s => s.id === subtaskId);
    if (!st) return;

    st.completed = !st.completed;
    StorageManager.saveTasks(state.tasks);
    SoundEffects.playClickSound();
    renderTasks();
  }

  // Toggle Star / Pin
  function toggleStarTask(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.starred = !task.starred;
    StorageManager.saveTasks(state.tasks);
    SoundEffects.playClickSound();
    renderTasks();
  }

  // Delete Task with Undo Support
  function deleteTask(taskId) {
    const index = state.tasks.findIndex(t => t.id === taskId);
    if (index === -1) return;

    state.lastDeletedTask = {
      task: state.tasks[index],
      index: index
    };

    const taskTitle = state.tasks[index].title;
    state.tasks.splice(index, 1);
    StorageManager.saveTasks(state.tasks);

    SoundEffects.playDeleteSound();
    renderTasks();

    showToast(`Deleted "${taskTitle}"`, 'info', 'Undo', () => {
      if (state.lastDeletedTask) {
        state.tasks.splice(state.lastDeletedTask.index, 0, state.lastDeletedTask.task);
        StorageManager.saveTasks(state.tasks);
        state.lastDeletedTask = null;
        SoundEffects.playAddSound();
        renderTasks();
        showToast('Restored task! ✨', 'success');
      }
    });
  }

  // Quick Add Task Form Submit
  elements.quickTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = elements.quickTaskInput.value.trim();
    if (!title) return;

    let targetListId = 'work';
    if (!['all', 'today', 'upcoming', 'important'].includes(state.activeListId)) {
      targetListId = state.activeListId;
    }

    // Default due date: if in "today" list or user picked today shortcut
    let dueDate = '';
    if (state.activeListId === 'today' || quickSelectedDate === 'today') {
      const d = new Date();
      d.setHours(18, 0, 0, 0);
      dueDate = d.toISOString().slice(0, 16);
    } else if (quickSelectedDate === 'tomorrow') {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(18, 0, 0, 0);
      dueDate = d.toISOString().slice(0, 16);
    }

    const newTask = {
      id: 'task-' + Date.now(),
      title: title,
      notes: '',
      listId: targetListId,
      dueDate: dueDate,
      priority: quickSelectedPriority,
      completed: false,
      starred: false,
      createdAt: Date.now(),
      subtasks: []
    };

    state.tasks.unshift(newTask);
    StorageManager.saveTasks(state.tasks);

    elements.quickTaskInput.value = '';
    quickSelectedDate = '';
    quickSelectedPriority = 'medium';
    elements.quickDateBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
      Set Due Date
    `;
    elements.quickPriorityBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
      Priority: Medium
    `;

    SoundEffects.playAddSound();
    renderTasks();
    showToast(`Added "${newTask.title}"`, 'success');
  });

  // Quick Date Shortcut Picker
  elements.quickDateBtn.addEventListener('click', () => {
    SoundEffects.playClickSound();
    if (!quickSelectedDate) {
      quickSelectedDate = 'today';
      elements.quickDateBtn.innerHTML = `📅 Today`;
    } else if (quickSelectedDate === 'today') {
      quickSelectedDate = 'tomorrow';
      elements.quickDateBtn.innerHTML = `📅 Tomorrow`;
    } else {
      quickSelectedDate = '';
      elements.quickDateBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        Set Due Date
      `;
    }
  });

  // Quick Priority Toggle
  elements.quickPriorityBtn.addEventListener('click', () => {
    SoundEffects.playClickSound();
    if (quickSelectedPriority === 'low') {
      quickSelectedPriority = 'medium';
    } else if (quickSelectedPriority === 'medium') {
      quickSelectedPriority = 'high';
    } else {
      quickSelectedPriority = 'low';
    }
    elements.quickPriorityBtn.innerHTML = `⚡ ${capitalize(quickSelectedPriority)}`;
  });

  // Modal Task Add / Edit Flow
  function openAddModal() {
    state.editingTaskId = null;
    state.modalSubtasks = [];
    elements.taskModalTitle.textContent = 'Create New Task';
    elements.taskForm.reset();

    // Set default category to current list if valid
    if (!['all', 'today', 'upcoming', 'important'].includes(state.activeListId)) {
      elements.taskFormList.value = state.activeListId;
    }

    // Set default date to today 18:00
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    elements.taskFormDate.value = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
    elements.taskFormTime.value = "18:00";

    selectModalPriority('medium');
    renderModalSubtasks();
    elements.taskModal.classList.add('active');
    elements.taskFormTitle.focus();
  }

  function openEditModal(task) {
    state.editingTaskId = task.id;
    state.modalSubtasks = JSON.parse(JSON.stringify(task.subtasks || []));
    elements.taskModalTitle.textContent = 'Edit Task Details';

    elements.taskFormTitle.value = task.title;
    elements.taskFormNotes.value = task.notes || '';
    elements.taskFormList.value = task.listId || state.lists[0].id;

    if (task.dueDate) {
      const parts = task.dueDate.split('T');
      elements.taskFormDate.value = parts[0] || '';
      elements.taskFormTime.value = parts[1] ? parts[1].slice(0, 5) : '12:00';
    } else {
      elements.taskFormDate.value = '';
      elements.taskFormTime.value = '';
    }

    selectModalPriority(task.priority || 'medium');
    renderModalSubtasks();
    elements.taskModal.classList.add('active');
    elements.taskFormTitle.focus();
  }

  function closeTaskModal() {
    elements.taskModal.classList.remove('active');
    state.editingTaskId = null;
    state.modalSubtasks = [];
  }

  // Priority Selector in Modal
  let selectedModalPriority = 'medium';
  const priorityButtons = document.querySelectorAll('.priority-radio-btn');

  function selectModalPriority(priority) {
    selectedModalPriority = priority;
    priorityButtons.forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.priority === priority);
    });
  }

  priorityButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      selectModalPriority(btn.dataset.priority);
      SoundEffects.playClickSound();
    });
  });

  // Modal Subtasks Management
  elements.taskFormAddSubtaskBtn.addEventListener('click', addSubtaskToModal);
  elements.taskFormSubtaskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSubtaskToModal();
    }
  });

  function addSubtaskToModal() {
    const text = elements.taskFormSubtaskInput.value.trim();
    if (!text) return;

    state.modalSubtasks.push({
      id: 'st-' + Date.now() + Math.random().toString(36).substr(2, 4),
      text: text,
      completed: false
    });

    elements.taskFormSubtaskInput.value = '';
    renderModalSubtasks();
  }

  function renderModalSubtasks() {
    elements.modalSubtasksList.innerHTML = '';
    state.modalSubtasks.forEach((st, idx) => {
      const tag = document.createElement('div');
      tag.className = 'modal-subtask-tag';
      tag.innerHTML = `
        <span>${escapeHTML(st.text)}</span>
        <span class="remove-tag-btn" title="Remove subtask">&times;</span>
      `;
      tag.querySelector('.remove-tag-btn').addEventListener('click', () => {
        state.modalSubtasks.splice(idx, 1);
        renderModalSubtasks();
      });
      elements.modalSubtasksList.appendChild(tag);
    });
  }

  // Save Task Form Submission (Add or Edit)
  elements.taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = elements.taskFormTitle.value.trim();
    if (!title) return;

    const notes = elements.taskFormNotes.value.trim();
    const listId = elements.taskFormList.value;
    const dateVal = elements.taskFormDate.value;
    const timeVal = elements.taskFormTime.value || '12:00';

    let dueDate = '';
    if (dateVal) {
      dueDate = `${dateVal}T${timeVal}`;
    }

    if (state.editingTaskId) {
      // Edit existing task
      const task = state.tasks.find(t => t.id === state.editingTaskId);
      if (task) {
        task.title = title;
        task.notes = notes;
        task.listId = listId;
        task.dueDate = dueDate;
        task.priority = selectedModalPriority;
        task.subtasks = state.modalSubtasks;
        StorageManager.saveTasks(state.tasks);
        SoundEffects.playAddSound();
        showToast('Task updated successfully!', 'success');
      }
    } else {
      // Create new task
      const newTask = {
        id: 'task-' + Date.now(),
        title: title,
        notes: notes,
        listId: listId,
        dueDate: dueDate,
        priority: selectedModalPriority,
        completed: false,
        starred: false,
        createdAt: Date.now(),
        subtasks: state.modalSubtasks
      };
      state.tasks.unshift(newTask);
      StorageManager.saveTasks(state.tasks);
      SoundEffects.playAddSound();
      showToast(`Created task "${title}"`, 'success');
    }

    closeTaskModal();
    renderTasks();
  });

  // Add Custom List Modal Flow
  let selectedListColor = '#6366f1';
  const colorOptions = document.querySelectorAll('.color-option');

  colorOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      colorOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      selectedListColor = opt.dataset.color;
    });
  });

  elements.addListBtn.addEventListener('click', () => {
    SoundEffects.playClickSound();
    elements.listForm.reset();
    elements.listModal.classList.add('active');
    elements.listNameInput.focus();
  });

  elements.listModalCloseBtn.addEventListener('click', () => elements.listModal.classList.remove('active'));
  elements.listModalCancelBtn.addEventListener('click', () => elements.listModal.classList.remove('active'));

  elements.listForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = elements.listNameInput.value.trim();
    if (!name) return;

    const newList = {
      id: 'list-' + Date.now(),
      name: name,
      color: selectedListColor,
      icon: 'folder'
    };

    state.lists.push(newList);
    StorageManager.saveLists(state.lists);
    populateListDropdowns();
    renderSidebarLists();

    elements.listModal.classList.remove('active');
    SoundEffects.playAddSound();
    showToast(`Created list "${name}"`, 'success');
  });

  // Backup & Restore Modal Flow
  elements.backupBtn.addEventListener('click', () => {
    SoundEffects.playClickSound();
    elements.backupModal.classList.add('active');
  });

  elements.backupModalCloseBtn.addEventListener('click', () => {
    elements.backupModal.classList.remove('active');
  });

  elements.exportJsonBtn.addEventListener('click', () => {
    StorageManager.exportData();
    showToast('Exported backup file!', 'success');
  });

  elements.importJsonInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const res = StorageManager.importData(event.target.result);
      if (res.success) {
        state.tasks = res.tasks;
        state.lists = res.lists;
        populateListDropdowns();
        renderSidebarLists();
        renderTasks();
        elements.backupModal.classList.remove('active');
        showToast('Tasks restored from backup! 🚀', 'success');
      } else {
        showToast('Failed to import backup: ' + res.error, 'error');
      }
    };
    reader.readAsText(file);
  });

  elements.resetDemoBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all tasks to demo data?')) {
      const reset = StorageManager.resetToDefaults();
      state.tasks = reset.tasks;
      state.lists = reset.lists;
      populateListDropdowns();
      renderSidebarLists();
      renderTasks();
      elements.backupModal.classList.remove('active');
      showToast('Reset to demo dataset!', 'info');
    }
  });

  // Filter Chips Click
  elements.activeFilterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      SoundEffects.playClickSound();
      elements.activeFilterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.activeFilter = chip.dataset.filter;
      renderTasks();
    });
  });

  // Sort Dropdown Change
  elements.sortSelect.addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    renderTasks();
  });

  // Search Input Handler
  elements.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    elements.clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
    updateViewHeader();
    renderTasks();
  });

  elements.clearSearchBtn.addEventListener('click', () => {
    elements.searchInput.value = '';
    state.searchQuery = '';
    elements.clearSearchBtn.style.display = 'none';
    updateViewHeader();
    renderTasks();
  });

  // Smart Views Click (All, Today, Upcoming, Important)
  document.querySelectorAll('.sidebar-nav-list [data-view]').forEach(item => {
    item.addEventListener('click', () => {
      SoundEffects.playClickSound();
      document.querySelectorAll('.nav-item-btn').forEach(b => b.classList.remove('active'));
      item.classList.add('active');
      state.activeListId = item.dataset.view;
      updateViewHeader();
      renderTasks();
      closeMobileSidebar();
    });
  });

  // Mobile Sidebar Drawer
  function openMobileSidebar() {
    elements.sidebar.classList.add('open');
    elements.sidebarBackdrop.classList.add('active');
  }

  function closeMobileSidebar() {
    elements.sidebar.classList.remove('open');
    elements.sidebarBackdrop.classList.remove('active');
  }

  elements.sidebarToggleBtn.addEventListener('click', openMobileSidebar);
  elements.sidebarCloseBtn.addEventListener('click', closeMobileSidebar);
  elements.sidebarBackdrop.addEventListener('click', closeMobileSidebar);

  // Theme & Sound Toggle Listeners
  elements.themeToggleBtn.addEventListener('click', () => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });

  elements.soundToggleBtn.addEventListener('click', () => {
    applySoundSetting(!state.soundEnabled);
  });

  // Modal open/close listeners
  elements.openAddModalBtn.addEventListener('click', openAddModal);
  elements.taskModalCloseBtn.addEventListener('click', closeTaskModal);
  elements.taskModalCancelBtn.addEventListener('click', closeTaskModal);

  // Close modals on clicking overlay backdrop
  [elements.taskModal, elements.listModal, elements.backupModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      elements.taskModal.classList.remove('active');
      elements.listModal.classList.remove('active');
      elements.backupModal.classList.remove('active');
      closeMobileSidebar();
    }
    // Ctrl+K or '/' to focus search
    if ((e.ctrlKey && e.key.toLowerCase() === 'k') || (e.key === '/' && document.activeElement !== elements.searchInput && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA')) {
      e.preventDefault();
      elements.searchInput.focus();
    }
  });

  // Helper Functions
  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function capitalize(s) {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // Initial Initialization
  applyTheme(state.theme);
  applySoundSetting(state.soundEnabled);
  populateListDropdowns();
  renderSidebarLists();
  updateViewHeader();
  renderTasks();
});
