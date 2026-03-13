import { describe, it, expect, beforeEach, vi } from 'vitest';
import TaskList from '../../js/taskList.js';

describe('TaskList', () => {
  let taskList;
  let mockContainer;
  let mockStorageService;

  beforeEach(() => {
    // Create mock DOM container
    mockContainer = document.createElement('div');
    
    // Create mock storage service
    mockStorageService = {
      load: vi.fn(),
      save: vi.fn(),
      remove: vi.fn()
    };

    taskList = new TaskList(mockContainer, mockStorageService);
  });

  describe('constructor', () => {
    it('should initialize with empty tasks array', () => {
      expect(taskList.tasks).toEqual([]);
    });

    it('should store containerElement reference', () => {
      expect(taskList.containerElement).toBe(mockContainer);
    });

    it('should store storageService reference', () => {
      expect(taskList.storageService).toBe(mockStorageService);
    });

    it('should set storageKey to "tasks"', () => {
      expect(taskList.storageKey).toBe('tasks');
    });
  });

  describe('init', () => {
    it('should load tasks from storage when available', () => {
      const savedTasks = [
        { id: 'task-1', text: 'Test task', completed: false, createdAt: Date.now() }
      ];
      mockStorageService.load.mockReturnValue(savedTasks);

      taskList.init();

      expect(mockStorageService.load).toHaveBeenCalledWith('tasks');
      expect(taskList.tasks).toEqual(savedTasks);
    });

    it('should initialize with empty array when storage is empty', () => {
      mockStorageService.load.mockReturnValue(null);

      taskList.init();

      expect(taskList.tasks).toEqual([]);
    });

    it('should initialize with empty array when storage returns non-array', () => {
      mockStorageService.load.mockReturnValue({ invalid: 'data' });

      taskList.init();

      expect(taskList.tasks).toEqual([]);
    });
  });

  describe('generateTaskId', () => {
    it('should generate ID with correct format', () => {
      const id = taskList.generateTaskId();
      expect(id).toMatch(/^task-\d+-\d+$/);
    });

    it('should generate unique IDs', () => {
      const id1 = taskList.generateTaskId();
      const id2 = taskList.generateTaskId();
      expect(id1).not.toBe(id2);
    });

    it('should include timestamp in ID', () => {
      const beforeTime = Date.now();
      const id = taskList.generateTaskId();
      const afterTime = Date.now();

      const timestamp = parseInt(id.split('-')[1]);
      expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(timestamp).toBeLessThanOrEqual(afterTime);
    });

    it('should include random component in ID', () => {
      const id = taskList.generateTaskId();
      const parts = id.split('-');
      expect(parts).toHaveLength(3);
      expect(parts[0]).toBe('task');
      expect(parts[2]).toMatch(/^\d+$/);
    });
  });

  describe('addTask', () => {
    beforeEach(() => {
      // Mock render method
      taskList.render = vi.fn();
    });

    it('should add valid task to tasks array', () => {
      const result = taskList.addTask('Buy groceries');
      
      expect(result).toBe(true);
      expect(taskList.tasks).toHaveLength(1);
      expect(taskList.tasks[0].text).toBe('Buy groceries');
    });

    it('should trim whitespace from task text', () => {
      taskList.addTask('  Task with spaces  ');
      
      expect(taskList.tasks[0].text).toBe('Task with spaces');
    });

    it('should reject empty string', () => {
      const result = taskList.addTask('');
      
      expect(result).toBe(false);
      expect(taskList.tasks).toHaveLength(0);
    });

    it('should reject whitespace-only string', () => {
      const result = taskList.addTask('   ');
      
      expect(result).toBe(false);
      expect(taskList.tasks).toHaveLength(0);
    });

    it('should reject string with only tabs and newlines', () => {
      const result = taskList.addTask('\t\n\r  ');
      
      expect(result).toBe(false);
      expect(taskList.tasks).toHaveLength(0);
    });

    it('should reject task text exceeding 500 characters', () => {
      const longText = 'a'.repeat(501);
      const result = taskList.addTask(longText);
      
      expect(result).toBe(false);
      expect(taskList.tasks).toHaveLength(0);
    });

    it('should accept task text with exactly 500 characters', () => {
      const maxText = 'a'.repeat(500);
      const result = taskList.addTask(maxText);
      
      expect(result).toBe(true);
      expect(taskList.tasks).toHaveLength(1);
      expect(taskList.tasks[0].text).toBe(maxText);
    });

    it('should create task with unique ID', () => {
      taskList.addTask('First task');
      taskList.addTask('Second task');
      
      expect(taskList.tasks[0].id).not.toBe(taskList.tasks[1].id);
      expect(taskList.tasks[0].id).toMatch(/^task-\d+-\d+$/);
      expect(taskList.tasks[1].id).toMatch(/^task-\d+-\d+$/);
    });

    it('should create task with completed set to false', () => {
      taskList.addTask('New task');
      
      expect(taskList.tasks[0].completed).toBe(false);
    });

    it('should create task with createdAt timestamp', () => {
      const beforeTime = Date.now();
      taskList.addTask('New task');
      const afterTime = Date.now();
      
      expect(taskList.tasks[0].createdAt).toBeGreaterThanOrEqual(beforeTime);
      expect(taskList.tasks[0].createdAt).toBeLessThanOrEqual(afterTime);
    });

    it('should persist task to storage', () => {
      taskList.addTask('New task');
      
      expect(mockStorageService.save).toHaveBeenCalledWith('tasks', taskList.tasks);
    });

    it('should call render after adding task', () => {
      taskList.addTask('New task');
      
      expect(taskList.render).toHaveBeenCalled();
    });

    it('should not persist or render when validation fails', () => {
      taskList.addTask('');
      
      expect(mockStorageService.save).not.toHaveBeenCalled();
      expect(taskList.render).not.toHaveBeenCalled();
    });

    it('should maintain task order (creation order)', () => {
      taskList.addTask('First');
      taskList.addTask('Second');
      taskList.addTask('Third');
      
      expect(taskList.tasks[0].text).toBe('First');
      expect(taskList.tasks[1].text).toBe('Second');
      expect(taskList.tasks[2].text).toBe('Third');
    });
  });

  describe('updateTask', () => {
    beforeEach(() => {
      // Mock render method
      taskList.render = vi.fn();
      // Add some initial tasks
      taskList.addTask('Original task');
      // Clear mock calls from setup
      mockStorageService.save.mockClear();
      taskList.render.mockClear();
    });

    it('should update task text when task exists', () => {
      const taskId = taskList.tasks[0].id;
      const result = taskList.updateTask(taskId, 'Updated task');
      
      expect(result).toBe(true);
      expect(taskList.tasks[0].text).toBe('Updated task');
    });

    it('should trim whitespace from new text', () => {
      const taskId = taskList.tasks[0].id;
      taskList.updateTask(taskId, '  Updated with spaces  ');
      
      expect(taskList.tasks[0].text).toBe('Updated with spaces');
    });

    it('should reject empty string', () => {
      const taskId = taskList.tasks[0].id;
      const originalText = taskList.tasks[0].text;
      const result = taskList.updateTask(taskId, '');
      
      expect(result).toBe(false);
      expect(taskList.tasks[0].text).toBe(originalText);
    });

    it('should reject whitespace-only string', () => {
      const taskId = taskList.tasks[0].id;
      const originalText = taskList.tasks[0].text;
      const result = taskList.updateTask(taskId, '   ');
      
      expect(result).toBe(false);
      expect(taskList.tasks[0].text).toBe(originalText);
    });

    it('should reject string with only tabs and newlines', () => {
      const taskId = taskList.tasks[0].id;
      const originalText = taskList.tasks[0].text;
      const result = taskList.updateTask(taskId, '\t\n\r  ');
      
      expect(result).toBe(false);
      expect(taskList.tasks[0].text).toBe(originalText);
    });

    it('should return false when task ID not found', () => {
      const result = taskList.updateTask('non-existent-id', 'New text');
      
      expect(result).toBe(false);
    });

    it('should preserve task ID when updating', () => {
      const taskId = taskList.tasks[0].id;
      taskList.updateTask(taskId, 'Updated task');
      
      expect(taskList.tasks[0].id).toBe(taskId);
    });

    it('should preserve completed status when updating', () => {
      const taskId = taskList.tasks[0].id;
      taskList.tasks[0].completed = true;
      
      taskList.updateTask(taskId, 'Updated task');
      
      expect(taskList.tasks[0].completed).toBe(true);
    });

    it('should preserve createdAt timestamp when updating', () => {
      const taskId = taskList.tasks[0].id;
      const originalCreatedAt = taskList.tasks[0].createdAt;
      
      taskList.updateTask(taskId, 'Updated task');
      
      expect(taskList.tasks[0].createdAt).toBe(originalCreatedAt);
    });

    it('should persist updated task to storage', () => {
      const taskId = taskList.tasks[0].id;
      taskList.updateTask(taskId, 'Updated task');
      
      expect(mockStorageService.save).toHaveBeenCalledWith('tasks', taskList.tasks);
    });

    it('should call render after updating task', () => {
      const taskId = taskList.tasks[0].id;
      taskList.updateTask(taskId, 'Updated task');
      
      expect(taskList.render).toHaveBeenCalled();
    });

    it('should not persist or render when validation fails', () => {
      const taskId = taskList.tasks[0].id;
      taskList.updateTask(taskId, '');
      
      expect(mockStorageService.save).not.toHaveBeenCalled();
      expect(taskList.render).not.toHaveBeenCalled();
    });

    it('should not persist or render when task not found', () => {
      taskList.updateTask('non-existent-id', 'New text');
      
      expect(mockStorageService.save).not.toHaveBeenCalled();
      expect(taskList.render).not.toHaveBeenCalled();
    });

    it('should update correct task when multiple tasks exist', () => {
      taskList.addTask('Second task');
      taskList.addTask('Third task');
      mockStorageService.save.mockClear();
      taskList.render.mockClear();
      
      const secondTaskId = taskList.tasks[1].id;
      taskList.updateTask(secondTaskId, 'Updated second task');
      
      expect(taskList.tasks[0].text).toBe('Original task');
      expect(taskList.tasks[1].text).toBe('Updated second task');
      expect(taskList.tasks[2].text).toBe('Third task');
    });
  });

  describe('deleteTask', () => {
    beforeEach(() => {
      // Mock render method
      taskList.render = vi.fn();
      // Add some initial tasks
      taskList.addTask('First task');
      taskList.addTask('Second task');
      taskList.addTask('Third task');
      // Clear mock calls from setup
      mockStorageService.save.mockClear();
      taskList.render.mockClear();
    });

    it('should delete task when task exists', () => {
      const taskId = taskList.tasks[1].id;
      const result = taskList.deleteTask(taskId);
      
      expect(result).toBe(true);
      expect(taskList.tasks).toHaveLength(2);
      expect(taskList.tasks[0].text).toBe('First task');
      expect(taskList.tasks[1].text).toBe('Third task');
    });

    it('should return false when task ID not found', () => {
      const result = taskList.deleteTask('non-existent-id');
      
      expect(result).toBe(false);
      expect(taskList.tasks).toHaveLength(3);
    });

    it('should persist updated tasks to storage after deletion', () => {
      const taskId = taskList.tasks[0].id;
      taskList.deleteTask(taskId);
      
      expect(mockStorageService.save).toHaveBeenCalledWith('tasks', taskList.tasks);
      expect(taskList.tasks).toHaveLength(2);
    });

    it('should call render immediately after deletion', () => {
      const taskId = taskList.tasks[0].id;
      taskList.deleteTask(taskId);
      
      expect(taskList.render).toHaveBeenCalled();
    });

    it('should not persist or render when task not found', () => {
      taskList.deleteTask('non-existent-id');
      
      expect(mockStorageService.save).not.toHaveBeenCalled();
      expect(taskList.render).not.toHaveBeenCalled();
    });

    it('should delete first task correctly', () => {
      const firstTaskId = taskList.tasks[0].id;
      taskList.deleteTask(firstTaskId);
      
      expect(taskList.tasks).toHaveLength(2);
      expect(taskList.tasks[0].text).toBe('Second task');
      expect(taskList.tasks[1].text).toBe('Third task');
    });

    it('should delete last task correctly', () => {
      const lastTaskId = taskList.tasks[2].id;
      taskList.deleteTask(lastTaskId);
      
      expect(taskList.tasks).toHaveLength(2);
      expect(taskList.tasks[0].text).toBe('First task');
      expect(taskList.tasks[1].text).toBe('Second task');
    });

    it('should handle deleting all tasks', () => {
      const task1Id = taskList.tasks[0].id;
      const task2Id = taskList.tasks[1].id;
      const task3Id = taskList.tasks[2].id;
      
      taskList.deleteTask(task1Id);
      taskList.deleteTask(task2Id);
      taskList.deleteTask(task3Id);
      
      expect(taskList.tasks).toHaveLength(0);
    });

    it('should maintain correct task order after deletion', () => {
      const middleTaskId = taskList.tasks[1].id;
      taskList.deleteTask(middleTaskId);
      
      expect(taskList.tasks[0].text).toBe('First task');
      expect(taskList.tasks[1].text).toBe('Third task');
    });
  });

  describe('toggleTaskComplete', () => {
    beforeEach(() => {
      // Mock render method
      taskList.render = vi.fn();
      // Add some initial tasks
      taskList.addTask('Task 1');
      taskList.addTask('Task 2');
      taskList.addTask('Task 3');
      // Clear mock calls from setup
      mockStorageService.save.mockClear();
      taskList.render.mockClear();
    });

    it('should toggle task from incomplete to complete', () => {
      const taskId = taskList.tasks[0].id;
      expect(taskList.tasks[0].completed).toBe(false);
      
      const result = taskList.toggleTaskComplete(taskId);
      
      expect(result).toBe(true);
      expect(taskList.tasks[0].completed).toBe(true);
    });

    it('should toggle task from complete to incomplete', () => {
      const taskId = taskList.tasks[0].id;
      taskList.tasks[0].completed = true;
      
      const result = taskList.toggleTaskComplete(taskId);
      
      expect(result).toBe(true);
      expect(taskList.tasks[0].completed).toBe(false);
    });

    it('should toggle task multiple times correctly', () => {
      const taskId = taskList.tasks[0].id;
      
      // First toggle: false -> true
      taskList.toggleTaskComplete(taskId);
      expect(taskList.tasks[0].completed).toBe(true);
      
      // Second toggle: true -> false
      taskList.toggleTaskComplete(taskId);
      expect(taskList.tasks[0].completed).toBe(false);
      
      // Third toggle: false -> true
      taskList.toggleTaskComplete(taskId);
      expect(taskList.tasks[0].completed).toBe(true);
    });

    it('should return false when task ID not found', () => {
      const result = taskList.toggleTaskComplete('non-existent-id');
      
      expect(result).toBe(false);
    });

    it('should preserve task ID when toggling', () => {
      const taskId = taskList.tasks[0].id;
      taskList.toggleTaskComplete(taskId);
      
      expect(taskList.tasks[0].id).toBe(taskId);
    });

    it('should preserve task text when toggling', () => {
      const taskId = taskList.tasks[0].id;
      const originalText = taskList.tasks[0].text;
      
      taskList.toggleTaskComplete(taskId);
      
      expect(taskList.tasks[0].text).toBe(originalText);
    });

    it('should preserve createdAt timestamp when toggling', () => {
      const taskId = taskList.tasks[0].id;
      const originalCreatedAt = taskList.tasks[0].createdAt;
      
      taskList.toggleTaskComplete(taskId);
      
      expect(taskList.tasks[0].createdAt).toBe(originalCreatedAt);
    });

    it('should persist updated task to storage', () => {
      const taskId = taskList.tasks[0].id;
      taskList.toggleTaskComplete(taskId);
      
      expect(mockStorageService.save).toHaveBeenCalledWith('tasks', taskList.tasks);
    });

    it('should call render after toggling task', () => {
      const taskId = taskList.tasks[0].id;
      taskList.toggleTaskComplete(taskId);
      
      expect(taskList.render).toHaveBeenCalled();
    });

    it('should not persist or render when task not found', () => {
      taskList.toggleTaskComplete('non-existent-id');
      
      expect(mockStorageService.save).not.toHaveBeenCalled();
      expect(taskList.render).not.toHaveBeenCalled();
    });

    it('should toggle correct task when multiple tasks exist', () => {
      const secondTaskId = taskList.tasks[1].id;
      
      taskList.toggleTaskComplete(secondTaskId);
      
      expect(taskList.tasks[0].completed).toBe(false);
      expect(taskList.tasks[1].completed).toBe(true);
      expect(taskList.tasks[2].completed).toBe(false);
    });

    it('should handle toggling multiple different tasks', () => {
      const task1Id = taskList.tasks[0].id;
      const task3Id = taskList.tasks[2].id;
      
      taskList.toggleTaskComplete(task1Id);
      taskList.toggleTaskComplete(task3Id);
      
      expect(taskList.tasks[0].completed).toBe(true);
      expect(taskList.tasks[1].completed).toBe(false);
      expect(taskList.tasks[2].completed).toBe(true);
    });

    it('should maintain task order after toggling', () => {
      const task2Id = taskList.tasks[1].id;
      taskList.toggleTaskComplete(task2Id);
      
      expect(taskList.tasks).toHaveLength(3);
      expect(taskList.tasks[0].text).toBe('Task 1');
      expect(taskList.tasks[1].text).toBe('Task 2');
      expect(taskList.tasks[2].text).toBe('Task 3');
    });

    it('should preserve all task properties except completed', () => {
      const taskId = taskList.tasks[0].id;
      const originalTask = { ...taskList.tasks[0] };
      
      taskList.toggleTaskComplete(taskId);
      
      expect(taskList.tasks[0].id).toBe(originalTask.id);
      expect(taskList.tasks[0].text).toBe(originalTask.text);
      expect(taskList.tasks[0].createdAt).toBe(originalTask.createdAt);
      expect(taskList.tasks[0].completed).toBe(!originalTask.completed);
    });
  });
});

