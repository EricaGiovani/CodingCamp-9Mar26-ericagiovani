/**
 * Dashboard Integration Tests
 * Tests the initialization and coordination of all components
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import Dashboard from '../../js/dashboard.js';

describe('Dashboard Integration', () => {
  let dom;
  let document;
  let window;
  let dashboard;

  beforeEach(() => {
    // Create a mock DOM environment
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div class="dashboard-container">
            <section id="greeting-display">
              <div class="greeting-content"></div>
            </section>
            <section id="focus-timer">
              <div class="timer-content"></div>
            </section>
            <section id="task-list">
              <form id="task-form">
                <input type="text" id="task-input" />
                <button type="submit">Add</button>
              </form>
              <div class="task-list-container"></div>
            </section>
            <section id="quick-links">
              <form id="links-form">
                <input type="url" id="link-url-input" />
                <input type="text" id="link-title-input" />
                <button type="submit">Add</button>
              </form>
              <div class="links-list-container"></div>
            </section>
          </div>
        </body>
      </html>
    `, {
      url: 'http://localhost',
      pretendToBeVisual: true
    });

    document = dom.window.document;
    window = dom.window;

    // Set up global objects for components
    global.document = document;
    global.window = window;
    global.localStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn()
    };

    // Mock setInterval and clearInterval
    global.setInterval = vi.fn((fn, delay) => {
      return setTimeout(fn, delay);
    });
    global.clearInterval = vi.fn((id) => {
      clearTimeout(id);
    });

    dashboard = new Dashboard();
  });

  afterEach(() => {
    if (dashboard) {
      dashboard.destroy();
    }
    vi.clearAllMocks();
  });

  it('should initialize all components successfully', async () => {
    await dashboard.init();

    expect(dashboard.isInitialized).toBe(true);
    expect(dashboard.components.storageService).toBeDefined();
    expect(dashboard.components.greetingDisplay).toBeDefined();
    expect(dashboard.components.focusTimer).toBeDefined();
    expect(dashboard.components.taskList).toBeDefined();
    expect(dashboard.components.quickLinks).toBeDefined();
  });

  it('should initialize StorageService with correct namespace', async () => {
    await dashboard.init();

    expect(dashboard.storageService).toBeDefined();
    expect(dashboard.storageService.namespace).toBe('productivity-dashboard');
  });

  it('should prevent duplicate initialization', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await dashboard.init();
    await dashboard.init(); // Second call

    expect(consoleSpy).toHaveBeenCalledWith('Dashboard already initialized');
    consoleSpy.mockRestore();
  });

  it('should handle initialization errors gracefully', async () => {
    // Remove a required container to trigger error
    const container = document.querySelector('#greeting-display .greeting-content');
    container.remove();

    await expect(dashboard.init()).rejects.toThrow();
    expect(dashboard.isInitialized).toBe(false);
  });

  it('should display error message when initialization fails', async () => {
    // Remove a required container to trigger error
    const container = document.querySelector('#greeting-display .greeting-content');
    container.remove();

    try {
      await dashboard.init();
    } catch (error) {
      // Expected to throw
    }

    const errorContainer = document.querySelector('.dashboard-error');
    expect(errorContainer).toBeTruthy();
    expect(errorContainer.textContent).toContain('Initialization Error');
  });

  it('should clean up components on destroy', async () => {
    await dashboard.init();

    const greetingDisplay = dashboard.components.greetingDisplay;
    const focusTimer = dashboard.components.focusTimer;

    dashboard.destroy();

    expect(dashboard.isInitialized).toBe(false);
    expect(dashboard.components).toEqual({});
    expect(dashboard.storageService).toBeNull();
  });

  it('should initialize components in correct order', async () => {
    const initOrder = [];
    const originalLog = console.log;
    console.log = vi.fn((message) => {
      if (message.includes('✓')) {
        initOrder.push(message);
      }
    });

    await dashboard.init();

    expect(initOrder).toEqual([
      '✓ StorageService initialized',
      '✓ GreetingDisplay initialized',
      '✓ FocusTimer initialized',
      '✓ TaskList initialized',
      '✓ QuickLinks initialized'
    ]);

    console.log = originalLog;
  });

  it('should set up task form submission handler', async () => {
    await dashboard.init();

    const form = document.querySelector('#task-form');
    const input = document.querySelector('#task-input');
    const taskList = dashboard.components.taskList;

    input.value = 'Test task';
    
    const addTaskSpy = vi.spyOn(taskList, 'addTask');
    
    // Trigger form submission
    const submitEvent = new window.Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);

    expect(addTaskSpy).toHaveBeenCalledWith('Test task');
  });
});
