/**
 * Focus Timer Component
 * Provides a 25-minute Pomodoro-style countdown timer
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

class FocusTimer {
  /**
   * Initialize the focus timer with 25-minute duration
   * @param {HTMLElement} containerElement - DOM element for rendering the timer
   * @param {PerformanceMonitor} performanceMonitor - Optional performance monitor
   */
  constructor(containerElement, performanceMonitor = null) {
    if (!containerElement) {
      throw new Error('Container element is required for FocusTimer');
    }

    this.containerElement = containerElement;
    this.performanceMonitor = performanceMonitor;
    this.totalSeconds = 1500; // 25 minutes in seconds
    this.remainingSeconds = 1500;
    this.isRunning = false;
    this.intervalId = null;
    
    // Cache DOM elements for optimized rendering
    this.cachedElements = {
      display: null,
      completionMessage: null,
      startBtn: null,
      stopBtn: null,
      resetBtn: null
    };
    
    // Get reference to duration input and set button
    this.durationInput = document.getElementById('timer-duration');
    this.setDurationBtn = document.querySelector('.btn-set-duration');
  }

  /**
   * Initialize the timer display and controls
   * Sets up the DOM structure for the timer
   */
  init() {
    this.render();
    this.attachDurationListener();
  }

  /**
   * Start the countdown timer
   * Begins counting down from current remainingSeconds value
   */
  start() {
    // Prevent starting if already running
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    
    // Update display immediately when starting
    this.updateDisplay();

    // Set up interval to decrement every second
    this.intervalId = setInterval(() => {
      // Measure timer update performance
      const updateFn = () => {
        if (this.remainingSeconds > 0) {
          this.remainingSeconds--;
          this.updateDisplay(); // Update display every second
        } else {
          // Stop automatically when reaching zero
          this.stop();
          this.updateDisplay(); // Show completion message
        }
      };

      if (this.performanceMonitor) {
        this.performanceMonitor.measureTimerUpdate(updateFn);
      } else {
        updateFn();
      }
    }, 1000);
  }

  /**
   * Stop (pause) the countdown timer
   * Preserves the current remainingSeconds value
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    // Clear the interval to stop countdown
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    // Update display to reflect stopped state
    this.updateDisplay();
  }

  /**
   * Reset the timer to initial duration
   * Stops the timer if running and resets to totalSeconds
   */
  reset() {
    // Stop the timer if it's running
    if (this.isRunning) {
      this.stop();
    }

    // Reset to initial duration
    this.remainingSeconds = this.totalSeconds;
    
    // Update display to show reset time
    this.updateDisplay();
  }

  /**
   * Set a new timer duration
   * @param {number} minutes - Duration in minutes (1-120)
   */
  setDuration(minutes) {
    // Validate input
    const validMinutes = Math.max(1, Math.min(120, Math.floor(minutes)));
    
    // Stop timer if running
    if (this.isRunning) {
      this.stop();
    }
    
    // Update total and remaining seconds
    this.totalSeconds = validMinutes * 60;
    this.remainingSeconds = this.totalSeconds;
    
    // Update the input field to reflect validated value
    if (this.durationInput) {
      this.durationInput.value = validMinutes;
    }
    
    // Update display
    this.updateDisplay();
  }

  /**
   * Attach event listener to duration set button
   */
  attachDurationListener() {
    if (this.setDurationBtn && this.durationInput) {
      this.setDurationBtn.addEventListener('click', () => {
        const minutes = parseInt(this.durationInput.value, 10);
        if (!isNaN(minutes)) {
          this.setDuration(minutes);
        }
      });
      
      // Also allow Enter key to set duration
      this.durationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const minutes = parseInt(this.durationInput.value, 10);
          if (!isNaN(minutes)) {
            this.setDuration(minutes);
          }
        }
      });
    }
  }

  /**
   * Format seconds into MM:SS display format
   * @param {number} seconds - Total seconds to format
   * @returns {string} Formatted time string (MM:SS)
   */
  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Zero-pad minutes (00-25) and seconds (00-59)
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${paddedMinutes}:${paddedSeconds}`;
  }

  /**
   * Optimized display update - only updates text content, not full re-render
   * Minimizes DOM manipulation for smooth timer updates
   */
  updateDisplay() {
    // If elements are cached, use optimized update
    if (this.cachedElements.display) {
      const timerDisplay = this.formatTime(this.remainingSeconds);
      const isCompleted = this.remainingSeconds === 0;
      
      // Update only the text content (minimal DOM manipulation)
      this.cachedElements.display.textContent = timerDisplay;
      
      // Update completion state
      if (isCompleted) {
        this.cachedElements.display.classList.add('completed');
        if (this.cachedElements.completionMessage) {
          this.cachedElements.completionMessage.style.display = 'block';
        }
      } else {
        this.cachedElements.display.classList.remove('completed');
        if (this.cachedElements.completionMessage) {
          this.cachedElements.completionMessage.style.display = 'none';
        }
      }
      
      // Update button states
      if (this.cachedElements.startBtn) {
        this.cachedElements.startBtn.disabled = this.isRunning;
      }
      if (this.cachedElements.stopBtn) {
        this.cachedElements.stopBtn.disabled = !this.isRunning;
      }
    } else {
      // First render - create full structure
      this.render();
    }
  }

  /**
   * Render the timer display and controls to the DOM
   * Updates the display with current time and completion status
   */
  render() {
    const timerDisplay = this.formatTime(this.remainingSeconds);

    // Check if timer has completed
    const isCompleted = this.remainingSeconds === 0;
    const completionMessage = isCompleted ? '<div class="timer-complete">Session Complete!</div>' : '';

    this.containerElement.innerHTML = `
      <div class="timer-display ${isCompleted ? 'completed' : ''}">${timerDisplay}</div>
      ${completionMessage}
      <div class="timer-controls">
        <button class="btn-start" ${this.isRunning ? 'disabled' : ''}>Start</button>
        <button class="btn-stop" ${!this.isRunning ? 'disabled' : ''}>Stop</button>
        <button class="btn-reset">Reset</button>
      </div>
    `;

    // Cache DOM elements for optimized updates
    this.cachedElements.display = this.containerElement.querySelector('.timer-display');
    this.cachedElements.completionMessage = this.containerElement.querySelector('.timer-complete');
    this.cachedElements.startBtn = this.containerElement.querySelector('.btn-start');
    this.cachedElements.stopBtn = this.containerElement.querySelector('.btn-stop');
    this.cachedElements.resetBtn = this.containerElement.querySelector('.btn-reset');

    // Attach event listeners to buttons
    this.attachEventListeners();
  }

  /**
   * Attach event listeners to timer control buttons
   */
  attachEventListeners() {
    const startBtn = this.containerElement.querySelector('.btn-start');
    const stopBtn = this.containerElement.querySelector('.btn-stop');
    const resetBtn = this.containerElement.querySelector('.btn-reset');

    if (startBtn) {
      startBtn.addEventListener('click', () => this.start());
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', () => this.stop());
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.reset());
    }
  }

  /**
   * Clean up resources when component is destroyed
   */
  destroy() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }
}

// Export for use in other modules (ES module)
export default FocusTimer;
