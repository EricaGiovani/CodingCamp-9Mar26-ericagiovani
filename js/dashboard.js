/**
 * Dashboard Controller
 * Main controller that initializes and coordinates all dashboard components
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.4
 */

import StorageService from './storageService.js';
import { GreetingDisplay } from './greetingDisplay.js';
import FocusTimer from './focusTimer.js';
import TaskList from './taskList.js';
import QuickLinks from './quickLinks.js';
import performanceMonitor from './performanceMonitor.js';

/**
 * Dashboard class - Manages initialization and coordination of all components
 */
class Dashboard {
  constructor() {
    this.components = {};
    this.storageService = null;
    this.isInitialized = false;
  }

  /**
   * Initializes all dashboard components in the correct order
   * Implements error boundary for component initialization failures
   */
  async init() {
    // Prevent duplicate initialization
    if (this.isInitialized) {
      console.warn('Dashboard already initialized');
      return;
    }

    try {
      // Start performance monitoring for initial load
      performanceMonitor.startInitialLoad();
      
      console.log('Initializing Productivity Dashboard...');

      // Step 1: Initialize StorageService with namespace
      this.initStorageService();

      // Step 2: Initialize GreetingDisplay
      this.initGreetingDisplay();

      // Step 3: Initialize FocusTimer
      this.initFocusTimer();

      // Step 4: Initialize TaskList
      this.initTaskList();

      // Step 5: Initialize QuickLinks
      this.initQuickLinks();

      // Mark as initialized
      this.isInitialized = true;
      
      // End performance monitoring for initial load
      performanceMonitor.endInitialLoad();
      
      console.log('Dashboard initialization complete');

    } catch (error) {
      // Error boundary - catch and log initialization failures
      console.error('Dashboard initialization failed:', error);
      this.handleInitializationError(error);
      throw error; // Re-throw to allow caller to handle
    }
  }

  /**
   * Initializes the StorageService with namespace "productivity-dashboard"
   * @private
   */
  initStorageService() {
    try {
      this.storageService = new StorageService('productivity-dashboard', performanceMonitor);
      this.components.storageService = this.storageService;
      console.log('✓ StorageService initialized');
    } catch (error) {
      console.error('Failed to initialize StorageService:', error);
      throw new Error('StorageService initialization failed: ' + error.message);
    }
  }

  /**
   * Initializes the GreetingDisplay component
   * @private
   */
  initGreetingDisplay() {
    try {
      const container = document.querySelector('#greeting-display .greeting-content');
      
      if (!container) {
        throw new Error('Greeting display container not found');
      }

      const greetingDisplay = new GreetingDisplay(container, this.storageService);
      greetingDisplay.init();
      
      this.components.greetingDisplay = greetingDisplay;
      console.log('✓ GreetingDisplay initialized');
    } catch (error) {
      console.error('Failed to initialize GreetingDisplay:', error);
      throw new Error('GreetingDisplay initialization failed: ' + error.message);
    }
  }

  /**
   * Initializes the FocusTimer component
   * @private
   */
  initFocusTimer() {
    try {
      const container = document.querySelector('#focus-timer .timer-content');
      
      if (!container) {
        throw new Error('Focus timer container not found');
      }

      const focusTimer = new FocusTimer(container, performanceMonitor);
      focusTimer.init();
      
      this.components.focusTimer = focusTimer;
      console.log('✓ FocusTimer initialized');
    } catch (error) {
      console.error('Failed to initialize FocusTimer:', error);
      throw new Error('FocusTimer initialization failed: ' + error.message);
    }
  }

  /**
   * Initializes the TaskList component with storage service
   * @private
   */
  initTaskList() {
    try {
      const container = document.querySelector('#task-list .task-list-container');
      
      if (!container) {
        throw new Error('Task list container not found');
      }

      if (!this.storageService) {
        throw new Error('StorageService not available for TaskList');
      }

      const taskList = new TaskList(container, this.storageService);
      taskList.init();
      
      // Set up form submission handler
      this.setupTaskForm(taskList);
      
      this.components.taskList = taskList;
      console.log('✓ TaskList initialized');
    } catch (error) {
      console.error('Failed to initialize TaskList:', error);
      throw new Error('TaskList initialization failed: ' + error.message);
    }
  }

  /**
   * Sets up the task form submission handler
   * @private
   * @param {TaskList} taskList - The TaskList instance
   */
  setupTaskForm(taskList) {
    const form = document.querySelector('#task-form');
    const input = document.querySelector('#task-input');

    if (!form || !input) {
      console.warn('Task form or input not found');
      return;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const text = input.value;
      
      // Measure interaction performance
      performanceMonitor.measureInteraction('addTask', () => {
        const success = taskList.addTask(text);
        
        if (success) {
          input.value = '';
          input.focus();
        }
      });
    });

    // Set up sort button handler
    const sortButton = document.querySelector('#btn-sort-tasks');
    if (sortButton) {
      sortButton.addEventListener('click', () => {
        performanceMonitor.measureInteraction('sortTasks', () => {
          taskList.sortTasksAlphabetically();
        });
      });
    }
  }

  /**
   * Initializes the QuickLinks component with storage service
   * @private
   */
  initQuickLinks() {
    try {
      const container = document.querySelector('#quick-links');
      
      if (!container) {
        throw new Error('Quick links container not found');
      }

      if (!this.storageService) {
        throw new Error('StorageService not available for QuickLinks');
      }

      const quickLinks = new QuickLinks(container, this.storageService);
      quickLinks.init();
      
      this.components.quickLinks = quickLinks;
      console.log('✓ QuickLinks initialized');
    } catch (error) {
      console.error('Failed to initialize QuickLinks:', error);
      throw new Error('QuickLinks initialization failed: ' + error.message);
    }
  }

  /**
   * Handles initialization errors by displaying user-friendly messages
   * @private
   * @param {Error} error - The error that occurred
   */
  handleInitializationError(error) {
    // Display error message to user
    const errorContainer = document.createElement('div');
    errorContainer.className = 'dashboard-error';
    errorContainer.innerHTML = `
      <h2>Initialization Error</h2>
      <p>The dashboard failed to initialize properly. Please refresh the page to try again.</p>
      <p class="error-details">Error: ${error.message}</p>
    `;
    
    // Insert error message at the top of the page
    const dashboardContainer = document.querySelector('.dashboard-container');
    if (dashboardContainer) {
      dashboardContainer.insertBefore(errorContainer, dashboardContainer.firstChild);
    }
  }

  /**
   * Cleans up all components (useful for testing or page unload)
   */
  destroy() {
    try {
      // Destroy components that have destroy methods
      if (this.components.greetingDisplay) {
        this.components.greetingDisplay.destroy();
      }
      
      if (this.components.focusTimer) {
        this.components.focusTimer.destroy();
      }
      
      // Clear component references
      this.components = {};
      this.storageService = null;
      this.isInitialized = false;
      
      console.log('Dashboard destroyed');
    } catch (error) {
      console.error('Error during dashboard cleanup:', error);
    }
  }
}

export default Dashboard;
