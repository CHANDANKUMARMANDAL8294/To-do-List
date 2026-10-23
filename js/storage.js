/**
 * Storage Manager for To-Do Web App
 * Handles localStorage persistence, initial demo data, export & import.
 */

const STORAGE_KEYS = {
  TASKS: 'flowdo_tasks_v1',
  LISTS: 'flowdo_lists_v1',
  THEME: 'flowdo_theme_v1',
  SOUND: 'flowdo_sound_v1'
};

// Default lists
const DEFAULT_LISTS = [
  { id: 'work', name: 'Work & Projects', color: '#6366f1', icon: 'briefcase' },
  { id: 'personal', name: 'Personal Life', color: '#ec4899', icon: 'user' },
  { id: 'studies', name: 'Internship & Study', color: '#06b6d4', icon: 'book' },
  { id: 'shopping', name: 'Shopping & Groceries', color: '#8b5cf6', icon: 'shopping-bag' },
  { id: 'fitness', name: 'Health & Fitness', color: '#10b981', icon: 'activity' }
];

// Helper to format date strings relative to today
function getDateOffset(days, hours = 17, minutes = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hours, minutes, 0, 0);
  const pad = n => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hh}:${mm}`;
}

// Initial demo tasks to wow examiners and users
const DEMO_TASKS = [
  {
    id: 'demo-1',
    title: 'Complete Midterm Internship Project Evaluation',
    notes: 'Finalize To-Do Web App codebase, verify list filtering, test due date alerts and prepare walkthrough presentation.',
    listId: 'studies',
    dueDate: getDateOffset(0, 18, 0), // Today 6:00 PM
    priority: 'high',
    completed: false,
    starred: true,
    createdAt: Date.now() - 3600000 * 5,
    subtasks: [
      { id: 'st-1', text: 'Design glassmorphic UI & theme engine', completed: true },
      { id: 'st-2', text: 'Implement Date & Time picker with smart badges', completed: true },
      { id: 'st-3', text: 'Test interactive list organization and editing', completed: false }
    ]
  },
  {
    id: 'demo-2',
    title: 'Review System Architecture with Team Lead',
    notes: 'Present client-side offline storage strategy and performance benchmarks.',
    listId: 'work',
    dueDate: getDateOffset(1, 11, 30), // Tomorrow 11:30 AM
    priority: 'medium',
    completed: false,
    starred: true,
    createdAt: Date.now() - 3600000 * 8,
    subtasks: [
      { id: 'st-4', text: 'Draft 5-minute slide deck', completed: true },
      { id: 'st-5', text: 'Include unit test results and screenshots', completed: false }
    ]
  },
  {
    id: 'demo-3',
    title: 'Morning 5km Run & Core Workout',
    notes: 'Hydrate well and track average heart rate using fitness tracker.',
    listId: 'fitness',
    dueDate: getDateOffset(0, 7, 0), // Past today morning (likely overdue or completed)
    priority: 'low',
    completed: true,
    starred: false,
    createdAt: Date.now() - 3600000 * 24,
    subtasks: []
  },
  {
    id: 'demo-4',
    title: 'Order ergonomics monitor arm and desk mat',
    notes: 'Check for student/intern discounts before placing the order.',
    listId: 'shopping',
    dueDate: getDateOffset(3, 20, 0), // 3 days later
    priority: 'low',
    completed: false,
    starred: false,
    createdAt: Date.now() - 3600000 * 12,
    subtasks: []
  },
  {
    id: 'demo-5',
    title: 'Call family and plan weekend dinner',
    notes: 'Confirm restaurant reservations for Saturday evening.',
    listId: 'personal',
    dueDate: getDateOffset(2, 19, 30),
    priority: 'medium',
    completed: false,
    starred: false,
    createdAt: Date.now() - 3600000 * 2,
    subtasks: []
  }
];

class StorageManager {
  static getTasks() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!data) {
        this.saveTasks(DEMO_TASKS);
        return DEMO_TASKS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading tasks from localStorage', e);
      return DEMO_TASKS;
    }
  }

  static saveTasks(tasks) {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Error saving tasks to localStorage', e);
    }
  }

  static getLists() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LISTS);
      if (!data) {
        this.saveLists(DEFAULT_LISTS);
        return DEFAULT_LISTS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading lists from localStorage', e);
      return DEFAULT_LISTS;
    }
  }

  static saveLists(lists) {
    try {
      localStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(lists));
    } catch (e) {
      console.error('Error saving lists to localStorage', e);
    }
  }

  static getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
  }

  static saveTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }

  static getSoundEnabled() {
    const val = localStorage.getItem(STORAGE_KEYS.SOUND);
    return val !== null ? val === 'true' : true;
  }

  static saveSoundEnabled(enabled) {
    localStorage.setItem(STORAGE_KEYS.SOUND, String(enabled));
  }

  static resetToDefaults() {
    this.saveTasks(DEMO_TASKS);
    this.saveLists(DEFAULT_LISTS);
    return { tasks: DEMO_TASKS, lists: DEFAULT_LISTS };
  }

  static exportData() {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      tasks: this.getTasks(),
      lists: this.getLists()
    };
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", jsonStr);
    dlAnchorElem.setAttribute("download", `todo_backup_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchorElem.click();
  }

  static importData(jsonContent) {
    try {
      const parsed = JSON.parse(jsonContent);
      if (Array.isArray(parsed.tasks) && Array.isArray(parsed.lists)) {
        this.saveTasks(parsed.tasks);
        this.saveLists(parsed.lists);
        return { success: true, tasks: parsed.tasks, lists: parsed.lists };
      }
      throw new Error('Invalid backup file structure.');
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}
