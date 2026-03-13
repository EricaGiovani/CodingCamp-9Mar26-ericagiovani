/**
 * Performance Monitor
 * Tracks and validates performance metrics for the dashboard
 * 
 * Requirements: 12.1, 12.2, 12.3, 12.4
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      initialLoad: null,
      interactions: [],
      timerUpdates: [],
      storageOperations: []
    };
    this.thresholds = {
      initialLoad: 1000, // 1 second
      interaction: 100, // 100ms
      timerUpdate: 100, // 100ms (should be smooth)
      storage: 100 // 100ms
    };
    this.enabled = true;
  }

  /**
   * Marks the start of initial load
   */
  startInitialLoad() {
    if (!this.enabled) return;
    this.initialLoadStart = performance.now();
  }

  /**
   * Marks the end of initial load and validates against threshold
   * @returns {Object} Load time metrics
   */
  endInitialLoad() {
    if (!this.enabled || !this.initialLoadStart) return null;
    
    const loadTime = performance.now() - this.initialLoadStart;
    this.metrics.initialLoad = {
      duration: loadTime,
      timestamp: Date.now(),
      withinThreshold: loadTime <= this.thresholds.initialLoad
    };

    if (!this.metrics.initialLoad.withinThreshold) {
      console.warn(`Initial load took ${loadTime.toFixed(2)}ms (threshold: ${this.thresholds.initialLoad}ms)`);
    } else {
      console.log(`✓ Initial load: ${loadTime.toFixed(2)}ms (within ${this.thresholds.initialLoad}ms threshold)`);
    }

    return this.metrics.initialLoad;
  }

  /**
   * Measures an interaction (button click, form submit, etc.)
   * @param {string} name - Name of the interaction
   * @param {Function} fn - Function to measure
   * @returns {*} Result of the function
   */
  async measureInteraction(name, fn) {
    if (!this.enabled) return await fn();

    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;

    const metric = {
      name,
      duration,
      timestamp: Date.now(),
      withinThreshold: duration <= this.thresholds.interaction
    };

    this.metrics.interactions.push(metric);

    if (!metric.withinThreshold) {
      console.warn(`Interaction "${name}" took ${duration.toFixed(2)}ms (threshold: ${this.thresholds.interaction}ms)`);
    }

    return result;
  }

  /**
   * Measures a timer update
   * @param {Function} fn - Function to measure
   * @returns {*} Result of the function
   */
  measureTimerUpdate(fn) {
    if (!this.enabled) return fn();

    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;

    const metric = {
      duration,
      timestamp: Date.now(),
      withinThreshold: duration <= this.thresholds.timerUpdate
    };

    this.metrics.timerUpdates.push(metric);

    // Only warn if consistently slow (more than 5 slow updates)
    const recentSlowUpdates = this.metrics.timerUpdates
      .slice(-10)
      .filter(m => !m.withinThreshold);

    if (recentSlowUpdates.length > 5) {
      console.warn(`Timer updates are slow: ${duration.toFixed(2)}ms (threshold: ${this.thresholds.timerUpdate}ms)`);
    }

    return result;
  }

  /**
   * Measures a storage operation
   * @param {string} operation - Name of the operation (save, load, etc.)
   * @param {Function} fn - Function to measure
   * @returns {*} Result of the function
   */
  measureStorage(operation, fn) {
    if (!this.enabled) return fn();

    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;

    const metric = {
      operation,
      duration,
      timestamp: Date.now(),
      withinThreshold: duration <= this.thresholds.storage
    };

    this.metrics.storageOperations.push(metric);

    if (!metric.withinThreshold) {
      console.warn(`Storage operation "${operation}" took ${duration.toFixed(2)}ms (threshold: ${this.thresholds.storage}ms)`);
    }

    return result;
  }

  /**
   * Gets a summary of all performance metrics
   * @returns {Object} Performance summary
   */
  getSummary() {
    const summary = {
      initialLoad: this.metrics.initialLoad,
      interactions: {
        total: this.metrics.interactions.length,
        withinThreshold: this.metrics.interactions.filter(m => m.withinThreshold).length,
        average: this.metrics.interactions.length > 0
          ? this.metrics.interactions.reduce((sum, m) => sum + m.duration, 0) / this.metrics.interactions.length
          : 0,
        max: this.metrics.interactions.length > 0
          ? Math.max(...this.metrics.interactions.map(m => m.duration))
          : 0
      },
      timerUpdates: {
        total: this.metrics.timerUpdates.length,
        withinThreshold: this.metrics.timerUpdates.filter(m => m.withinThreshold).length,
        average: this.metrics.timerUpdates.length > 0
          ? this.metrics.timerUpdates.reduce((sum, m) => sum + m.duration, 0) / this.metrics.timerUpdates.length
          : 0,
        max: this.metrics.timerUpdates.length > 0
          ? Math.max(...this.metrics.timerUpdates.map(m => m.duration))
          : 0
      },
      storageOperations: {
        total: this.metrics.storageOperations.length,
        withinThreshold: this.metrics.storageOperations.filter(m => m.withinThreshold).length,
        average: this.metrics.storageOperations.length > 0
          ? this.metrics.storageOperations.reduce((sum, m) => sum + m.duration, 0) / this.metrics.storageOperations.length
          : 0,
        max: this.metrics.storageOperations.length > 0
          ? Math.max(...this.metrics.storageOperations.map(m => m.duration))
          : 0
      }
    };

    return summary;
  }

  /**
   * Logs a formatted performance report to console
   */
  logReport() {
    const summary = this.getSummary();
    
    console.log('\n=== Performance Report ===');
    
    if (summary.initialLoad) {
      console.log(`\nInitial Load: ${summary.initialLoad.duration.toFixed(2)}ms ${summary.initialLoad.withinThreshold ? '✓' : '✗'}`);
    }
    
    console.log(`\nInteractions (${summary.interactions.total} total):`);
    console.log(`  Within threshold: ${summary.interactions.withinThreshold}/${summary.interactions.total}`);
    console.log(`  Average: ${summary.interactions.average.toFixed(2)}ms`);
    console.log(`  Max: ${summary.interactions.max.toFixed(2)}ms`);
    
    console.log(`\nTimer Updates (${summary.timerUpdates.total} total):`);
    console.log(`  Within threshold: ${summary.timerUpdates.withinThreshold}/${summary.timerUpdates.total}`);
    console.log(`  Average: ${summary.timerUpdates.average.toFixed(2)}ms`);
    console.log(`  Max: ${summary.timerUpdates.max.toFixed(2)}ms`);
    
    console.log(`\nStorage Operations (${summary.storageOperations.total} total):`);
    console.log(`  Within threshold: ${summary.storageOperations.withinThreshold}/${summary.storageOperations.total}`);
    console.log(`  Average: ${summary.storageOperations.average.toFixed(2)}ms`);
    console.log(`  Max: ${summary.storageOperations.max.toFixed(2)}ms`);
    
    console.log('\n========================\n');
  }

  /**
   * Enables or disables performance monitoring
   * @param {boolean} enabled - Whether to enable monitoring
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Clears all collected metrics
   */
  reset() {
    this.metrics = {
      initialLoad: null,
      interactions: [],
      timerUpdates: [],
      storageOperations: []
    };
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Expose globally for debugging
if (typeof window !== 'undefined') {
  window.performanceMonitor = performanceMonitor;
}

export default performanceMonitor;
