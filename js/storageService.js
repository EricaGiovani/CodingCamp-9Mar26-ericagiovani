/**
 * StorageService - Abstracts Local Storage operations with error handling
 * Provides namespaced keys and JSON serialization/deserialization
 */
class StorageService {
  /**
   * Creates a new StorageService instance
   * @param {string} namespace - Namespace prefix for all storage keys
   * @param {PerformanceMonitor} performanceMonitor - Optional performance monitor
   */
  constructor(namespace = 'productivity-dashboard', performanceMonitor = null) {
    this.namespace = namespace;
    this.performanceMonitor = performanceMonitor;
    this._checkStorageAvailability();
  }

  /**
   * Checks if Local Storage is available
   * @private
   */
  _checkStorageAvailability() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      this.isAvailable = true;
    } catch (error) {
      console.warn('Local Storage is not available:', error);
      this.isAvailable = false;
    }
  }

  /**
   * Generates a namespaced key
   * @private
   * @param {string} key - The key to namespace
   * @returns {string} Namespaced key
   */
  _getNamespacedKey(key) {
    return `${this.namespace}:${key}`;
  }

  /**
   * Saves data to Local Storage
   * @param {string} key - Storage key (will be namespaced)
   * @param {*} data - Data to save (will be JSON serialized)
   * @returns {boolean} True if save was successful, false otherwise
   */
  save(key, data) {
    const saveFn = () => {
      if (!this.isAvailable) {
        console.error('Storage is not available');
        return false;
      }

      try {
        const namespacedKey = this._getNamespacedKey(key);
        const serializedData = JSON.stringify(data);
        localStorage.setItem(namespacedKey, serializedData);
        return true;
      } catch (error) {
        if (error.name === 'QuotaExceededError') {
          console.error('Storage quota exceeded:', error);
          // Could emit an event or call a callback here for UI notification
        } else {
          console.error('Error saving to storage:', error);
        }
        return false;
      }
    };

    if (this.performanceMonitor) {
      return this.performanceMonitor.measureStorage(`save:${key}`, saveFn);
    }
    return saveFn();
  }

  /**
   * Loads data from Local Storage
   * @param {string} key - Storage key (will be namespaced)
   * @returns {*} Parsed data, or null if key doesn't exist or error occurs
   */
  load(key) {
    const loadFn = () => {
      if (!this.isAvailable) {
        console.error('Storage is not available');
        return null;
      }

      try {
        const namespacedKey = this._getNamespacedKey(key);
        const serializedData = localStorage.getItem(namespacedKey);
        
        if (serializedData === null) {
          return null;
        }

        return JSON.parse(serializedData);
      } catch (error) {
        console.error('Error loading from storage (corrupted data?):', error);
        // Return null for corrupted data to allow graceful recovery
        return null;
      }
    };

    if (this.performanceMonitor) {
      return this.performanceMonitor.measureStorage(`load:${key}`, loadFn);
    }
    return loadFn();
  }

  /**
   * Removes a specific key from Local Storage
   * @param {string} key - Storage key to remove (will be namespaced)
   * @returns {boolean} True if removal was successful, false otherwise
   */
  remove(key) {
    if (!this.isAvailable) {
      console.error('Storage is not available');
      return false;
    }

    try {
      const namespacedKey = this._getNamespacedKey(key);
      localStorage.removeItem(namespacedKey);
      return true;
    } catch (error) {
      console.error('Error removing from storage:', error);
      return false;
    }
  }

  /**
   * Clears all namespaced keys from Local Storage
   * @returns {boolean} True if clear was successful, false otherwise
   */
  clear() {
    if (!this.isAvailable) {
      console.error('Storage is not available');
      return false;
    }

    try {
      const keysToRemove = [];
      const prefix = `${this.namespace}:`;
      
      // Find all keys with our namespace
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }
      
      // Remove all namespaced keys
      keysToRemove.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }
}

// Export for use in other modules (ES module)
export default StorageService;
