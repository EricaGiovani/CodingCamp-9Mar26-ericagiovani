/**
 * TaskList - Manages the to-do list functionality
 * Handles CRUD operations for tasks and persists to storage
 */
class TaskList {
  /**
   * Creates a new TaskList instance
   * @param {HTMLElement} containerElement - DOM element for rendering the task list
   * @param {StorageService} storageService - Storage service instance for persistence
   */
  constructor(containerElement, storageService) {
    this.containerElement = containerElement;
    this.storageService = storageService;
    this.tasks = [];
    this.storageKey = 'tasks';
  }

  /**
   * Initializes the task list by loading saved tasks from storage
   */
  init() {
    const savedTasks = this.storageService.load(this.storageKey);
    
    if (savedTasks && Array.isArray(savedTasks)) {
      this.tasks = savedTasks;
    } else {
      this.tasks = [];
    }
  }

  /**
   * Generates a unique task ID
   * @private
   * @returns {string} Unique task ID in format "task-{timestamp}-{random}"
   */
  generateTaskId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `task-${timestamp}-${random}`;
  }
  /**
   * Adds a new task to the list
   * @param {string} text - The task text
   * @returns {boolean} True if task was added, false if validation failed
   */
  addTask(text) {
    // Trim whitespace from input
    const trimmedText = text.trim();

    // Reject empty or whitespace-only strings
    if (trimmedText.length === 0) {
      return false;
    }

    // Enforce maximum length of 500 characters
    if (trimmedText.length > 500) {
      return false;
    }

    // Create task object with unique ID, text, completed=false, and createdAt timestamp
    const task = {
      id: this.generateTaskId(),
      text: trimmedText,
      completed: false,
      createdAt: Date.now()
    };

    // Add task to tasks array
    this.tasks.push(task);

    // Persist to storage within 100ms
    this.storageService.save(this.storageKey, this.tasks);

    // Re-render task list
    this.render();

    return true;
  }

  /**
   * Updates an existing task's text
   * @param {string} taskId - The ID of the task to update
   * @param {string} newText - The new text for the task
   * @returns {boolean} True if task was updated, false if validation failed or task not found
   */
  updateTask(taskId, newText) {
    // Find task by ID in tasks array
    const task = this.tasks.find(t => t.id === taskId);
    
    if (!task) {
      return false;
    }

    // Trim whitespace from new text
    const trimmedText = newText.trim();

    // Reject empty or whitespace-only strings
    if (trimmedText.length === 0) {
      return false;
    }

    // Update only the text field, preserve id, completed, and createdAt
    task.text = trimmedText;

    // Persist to storage within 100ms
    this.storageService.save(this.storageKey, this.tasks);

    // Re-render task list
    this.render();

    return true;
  }
  /**
   * Toggles the completion status of a task
   * @param {string} taskId - The ID of the task to toggle
   * @returns {boolean} True if task was toggled, false if task not found
   */
  toggleTaskComplete(taskId) {
    // Find task by ID in tasks array
    const task = this.tasks.find(t => t.id === taskId);
    
    if (!task) {
      return false;
    }

    // Toggle completed field between true and false
    task.completed = !task.completed;

    // Persist to storage within 100ms
    this.storageService.save(this.storageKey, this.tasks);

    // Re-render task list with visual indication for completed tasks
    this.render();

    return true;
  }

  /**
   * Deletes a task from the list
   * @param {string} taskId - The ID of the task to delete
   * @returns {boolean} True if task was deleted, false if task not found
   */
  deleteTask(taskId) {
    // Find task index by ID in tasks array
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
      return false;
    }

    // Remove task from tasks array
    this.tasks.splice(taskIndex, 1);

    // Persist to storage within 100ms
    this.storageService.save(this.storageKey, this.tasks);

    // Re-render task list immediately
    this.render();

    return true;
  }

  /**
   * Sorts tasks alphabetically by text (case-insensitive)
   * Updates localStorage and re-renders the UI
   */
  sortTasksAlphabetically() {
    // Sort tasks array alphabetically by text (case-insensitive)
    this.tasks.sort((a, b) => {
      const textA = a.text.toLowerCase();
      const textB = b.text.toLowerCase();
      return textA.localeCompare(textB);
    });

    // Persist sorted tasks to storage
    this.storageService.save(this.storageKey, this.tasks);

    // Re-render task list with sorted order
    this.render();
  }


  /**
   * Sanitizes HTML to prevent XSS attacks
   * @private
   * @param {string} str - String to sanitize
   * @returns {string} Sanitized string
   */
  sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Renders the task list UI
   * Optimized to minimize DOM manipulation
   * @private
   */
  render() {
    // Get the container element (should be .task-list-container)
    const container = this.containerElement;
    
    // Handle empty list state
    if (this.tasks.length === 0) {
      // Only update if content has changed
      if (container.innerHTML !== '<p class="empty-state">No tasks yet. Add one to get started!</p>') {
        container.innerHTML = '<p class="empty-state">No tasks yet. Add one to get started!</p>';
      }
      return;
    }

    // Sort tasks by creation order (earliest first)
    const sortedTasks = [...this.tasks].sort((a, b) => a.createdAt - b.createdAt);

    // Generate HTML for each task
    const tasksHTML = sortedTasks.map(task => {
      const sanitizedText = this.sanitizeHTML(task.text);
      const completedClass = task.completed ? 'completed' : '';
      const checkedAttr = task.completed ? 'checked' : '';

      return `
        <div class="task-item ${completedClass}" data-task-id="${task.id}">
          <input 
            type="checkbox" 
            class="task-checkbox" 
            ${checkedAttr}
            aria-label="Mark task as ${task.completed ? 'incomplete' : 'complete'}"
          >
          <span class="task-text">${sanitizedText}</span>
          <div class="task-actions">
            <button class="btn-edit" aria-label="Edit task">Edit</button>
            <button class="btn-delete" aria-label="Delete task">Delete</button>
          </div>
        </div>
      `;
    }).join('');

    // Use DocumentFragment for efficient DOM updates
    const fragment = document.createDocumentFragment();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = tasksHTML;
    
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
    }

    // Clear and update container in one operation
    container.innerHTML = '';
    container.appendChild(fragment);

    // Attach event listeners to all task items
    this.attachEventListeners();
  }

  /**
   * Attaches event listeners to task items
   * @private
   */
  attachEventListeners() {
    const container = this.containerElement;

    // Add event listeners for checkboxes
    const checkboxes = container.querySelectorAll('.task-checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const taskItem = e.target.closest('.task-item');
        const taskId = taskItem.dataset.taskId;
        this.toggleTaskComplete(taskId);
      });
    });

    // Add event listeners for edit buttons
    const editButtons = container.querySelectorAll('.btn-edit');
    editButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const taskItem = e.target.closest('.task-item');
        const taskId = taskItem.dataset.taskId;
        this.handleEditTask(taskId, taskItem);
      });
    });

    // Add event listeners for delete buttons
    const deleteButtons = container.querySelectorAll('.btn-delete');
    deleteButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const taskItem = e.target.closest('.task-item');
        const taskId = taskItem.dataset.taskId;
        this.deleteTask(taskId);
      });
    });
  }

  /**
   * Handles editing a task
   * @private
   * @param {string} taskId - The ID of the task to edit
   * @param {HTMLElement} taskItem - The task item DOM element
   */
  handleEditTask(taskId, taskItem) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    const taskTextSpan = taskItem.querySelector('.task-text');
    const currentText = task.text;

    // Replace task text with input field
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'task-edit-input';
    input.value = currentText;
    input.setAttribute('aria-label', 'Edit task text');

    // Replace the span with input
    taskTextSpan.replaceWith(input);
    input.focus();
    input.select();

    // Handle save on Enter key or blur
    const saveEdit = () => {
      const newText = input.value;
      if (newText.trim() !== '') {
        this.updateTask(taskId, newText);
      } else {
        // If empty, restore original text
        this.render();
      }
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        saveEdit();
      } else if (e.key === 'Escape') {
        // Cancel edit and restore original
        this.render();
      }
    });

    input.addEventListener('blur', saveEdit);
  }
}

// Export for use in other modules (ES module)
export default TaskList;
