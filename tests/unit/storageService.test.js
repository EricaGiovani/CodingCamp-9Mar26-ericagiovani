import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import StorageService from '../../js/storageService.js';

describe('StorageService', () => {
  let storageService;

  beforeEach(() => {
    localStorage.clear();
    storageService = new StorageService('productivity-dashboard');
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('constructor', () => {
    it('should create instance with default namespace', () => {
      const service = new StorageService();
      expect(service.namespace).toBe('productivity-dashboard');
    });

    it('should create instance with custom namespace', () => {
      const service = new StorageService('custom-namespace');
      expect(service.namespace).toBe('custom-namespace');
    });

    it('should check storage availability on initialization', () => {
      expect(storageService.isAvailable).toBe(true);
    });
  });

  describe('save()', () => {
    it('should save string data to localStorage', () => {
      const result = storageService.save('test-key', 'test-value');
      expect(result).toBe(true);
      expect(localStorage.getItem('productivity-dashboard:test-key')).toBe('"test-value"');
    });

    it('should save object data with JSON serialization', () => {
      const data = { name: 'Task 1', completed: false };
      const result = storageService.save('task', data);
      expect(result).toBe(true);
      
      const stored = localStorage.getItem('productivity-dashboard:task');
      expect(JSON.parse(stored)).toEqual(data);
    });

    it('should save array data with JSON serialization', () => {
      const data = [1, 2, 3, 4, 5];
      const result = storageService.save('numbers', data);
      expect(result).toBe(true);
      
      const stored = localStorage.getItem('productivity-dashboard:numbers');
      expect(JSON.parse(stored)).toEqual(data);
    });

    it('should use namespaced keys', () => {
      storageService.save('tasks', []);
      expect(localStorage.getItem('productivity-dashboard:tasks')).toBeDefined();
      expect(localStorage.getItem('tasks')).toBeNull();
    });

    it('should handle quota exceeded error', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock localStorage.setItem to throw QuotaExceededError
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        const error = new Error('Quota exceeded');
        error.name = 'QuotaExceededError';
        throw error;
      });

      const result = storageService.save('large-data', 'x'.repeat(10000000));
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Storage quota exceeded:',
        expect.any(Error)
      );

      // Restore original setItem
      localStorage.setItem = originalSetItem;
      consoleErrorSpy.mockRestore();
    });

    it('should return false when storage is unavailable', () => {
      storageService.isAvailable = false;
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = storageService.save('key', 'value');
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Storage is not available');
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('load()', () => {
    it('should load and deserialize saved data', () => {
      const data = { id: '1', text: 'Test task', completed: false };
      storageService.save('task', data);
      
      const loaded = storageService.load('task');
      expect(loaded).toEqual(data);
    });

    it('should return null for non-existent keys', () => {
      const result = storageService.load('non-existent-key');
      expect(result).toBeNull();
    });

    it('should handle corrupted data gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Manually set corrupted data
      localStorage.setItem('productivity-dashboard:corrupted', '{invalid json}');
      
      const result = storageService.load('corrupted');
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error loading from storage (corrupted data?):',
        expect.any(Error)
      );
      
      consoleErrorSpy.mockRestore();
    });

    it('should use namespaced keys when loading', () => {
      localStorage.setItem('productivity-dashboard:test', '"namespaced"');
      localStorage.setItem('test', '"not-namespaced"');
      
      const result = storageService.load('test');
      expect(result).toBe('namespaced');
    });

    it('should return null when storage is unavailable', () => {
      storageService.isAvailable = false;
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = storageService.load('key');
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Storage is not available');
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('remove()', () => {
    it('should remove a specific key from storage', () => {
      storageService.save('task', { id: '1' });
      expect(localStorage.getItem('productivity-dashboard:task')).toBeDefined();
      
      const result = storageService.remove('task');
      expect(result).toBe(true);
      expect(localStorage.getItem('productivity-dashboard:task')).toBeNull();
    });

    it('should use namespaced keys when removing', () => {
      localStorage.setItem('productivity-dashboard:test', 'value');
      localStorage.setItem('test', 'other-value');
      
      storageService.remove('test');
      expect(localStorage.getItem('productivity-dashboard:test')).toBeNull();
      expect(localStorage.getItem('test')).toBe('other-value');
    });

    it('should return true even if key does not exist', () => {
      const result = storageService.remove('non-existent');
      expect(result).toBe(true);
    });

    it('should return false when storage is unavailable', () => {
      storageService.isAvailable = false;
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = storageService.remove('key');
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Storage is not available');
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('clear()', () => {
    it('should clear all namespaced keys', () => {
      storageService.save('tasks', []);
      storageService.save('links', []);
      storageService.save('settings', {});
      
      expect(localStorage.length).toBe(3);
      
      const result = storageService.clear();
      expect(result).toBe(true);
      expect(localStorage.length).toBe(0);
    });

    it('should only clear namespaced keys, not other keys', () => {
      storageService.save('tasks', []);
      localStorage.setItem('other-app:data', 'value');
      localStorage.setItem('standalone-key', 'value');
      
      expect(localStorage.length).toBe(3);
      
      storageService.clear();
      expect(localStorage.length).toBe(2);
      expect(localStorage.getItem('other-app:data')).toBe('value');
      expect(localStorage.getItem('standalone-key')).toBe('value');
    });

    it('should return true when clearing empty storage', () => {
      const result = storageService.clear();
      expect(result).toBe(true);
    });

    it('should return false when storage is unavailable', () => {
      storageService.isAvailable = false;
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = storageService.clear();
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Storage is not available');
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('namespacing', () => {
    it('should isolate data between different namespaces', () => {
      const service1 = new StorageService('app1');
      const service2 = new StorageService('app2');
      
      service1.save('data', 'value1');
      service2.save('data', 'value2');
      
      expect(service1.load('data')).toBe('value1');
      expect(service2.load('data')).toBe('value2');
    });

    it('should use correct namespaced keys for tasks and links', () => {
      storageService.save('tasks', [{ id: '1' }]);
      storageService.save('links', [{ id: '2' }]);
      
      expect(localStorage.getItem('productivity-dashboard:tasks')).toBeDefined();
      expect(localStorage.getItem('productivity-dashboard:links')).toBeDefined();
    });
  });

  describe('round-trip persistence', () => {
    it('should preserve data through save and load cycle', () => {
      const originalData = {
        id: 'task-123',
        text: 'Complete project',
        completed: false,
        createdAt: 1234567890
      };
      
      storageService.save('task', originalData);
      const loadedData = storageService.load('task');
      
      expect(loadedData).toEqual(originalData);
    });

    it('should handle complex nested objects', () => {
      const complexData = {
        tasks: [
          { id: '1', text: 'Task 1', completed: false },
          { id: '2', text: 'Task 2', completed: true }
        ],
        metadata: {
          version: '1.0',
          lastModified: Date.now()
        }
      };
      
      storageService.save('complex', complexData);
      const loaded = storageService.load('complex');
      
      expect(loaded).toEqual(complexData);
    });
  });
});
