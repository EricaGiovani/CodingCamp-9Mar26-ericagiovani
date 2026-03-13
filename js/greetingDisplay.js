/**
 * GreetingDisplay Component
 * 
 * Displays current time, date, and time-based greeting.
 * Updates every second to keep time current.
 * 
 * Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4
 */

export class GreetingDisplay {
  /**
   * Creates a new GreetingDisplay instance
   * @param {HTMLElement} containerElement - DOM element to render the greeting display
   * @param {Object} storageService - Storage service for persisting user name
   * @throws {Error} If containerElement is not provided or not found
   */
  constructor(containerElement, storageService) {
    if (!containerElement) {
      throw new Error('GreetingDisplay: containerElement is required');
    }
    
    this.containerElement = containerElement;
    this.storageService = storageService;
    this.intervalId = null;
    this.userName = null;
  }

  /**
   * Initializes the greeting display and starts the update interval
   */
  init() {
    // Load saved user name from storage
    this.loadUserName();
    
    // Initial render
    this.updateDisplay();
    
    // Update every second (1000ms)
    this.intervalId = setInterval(() => {
      this.updateDisplay();
    }, 1000);
    
    // Set up name input handler
    this.setupNameInput();
  }

  /**
   * Updates the display with current time, date, and greeting
   * @private
   */
  updateDisplay() {
    const now = new Date();
    
    const timeString = this.formatTime(now);
    const dateString = this.formatDate(now);
    const greeting = this.getGreeting(now);
    
    this.render(greeting, timeString, dateString);
  }

  /**
   * Formats time in 12-hour format with AM/PM
   * @param {Date} date - Date object to format
   * @returns {string} Formatted time string (e.g., "3:45:12 PM")
   * @private
   */
  formatTime(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    
    // Determine AM/PM
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours === 0 ? 12 : hours; // 0 should be 12
    
    // Zero-pad minutes and seconds
    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = String(seconds).padStart(2, '0');
    
    return `${hours}:${minutesStr}:${secondsStr} ${ampm}`;
  }

  /**
   * Formats date with day of week, month, and day
   * @param {Date} date - Date object to format
   * @returns {string} Formatted date string (e.g., "Monday, January 1")
   * @private
   */
  formatDate(date) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayOfWeek = daysOfWeek[date.getDay()];
    const month = months[date.getMonth()];
    const day = date.getDate();
    
    return `${dayOfWeek}, ${month} ${day}`;
  }

  /**
   * Determines the appropriate greeting based on the current hour
   * @param {Date} date - Date object to get hour from
   * @returns {string} Time-based greeting with optional user name
   * @private
   */
  getGreeting(date) {
    const hour = date.getHours();
    let greeting = '';
    
    // 5:00 AM - 11:59 AM: Good Morning
    if (hour >= 5 && hour < 12) {
      greeting = 'Good Morning';
    }
    // 12:00 PM - 4:59 PM: Good Afternoon
    else if (hour >= 12 && hour < 17) {
      greeting = 'Good Afternoon';
    }
    // 5:00 PM - 8:59 PM: Good Evening
    else if (hour >= 17 && hour < 21) {
      greeting = 'Good Evening';
    }
    // 9:00 PM - 4:59 AM: Good Night
    else {
      greeting = 'Good Night';
    }
    
    // Add user name if available
    if (this.userName) {
      greeting += `, ${this.userName}`;
    }
    
    return greeting;
  }

  /**
   * Loads the user name from storage
   * @private
   */
  loadUserName() {
    if (this.storageService) {
      this.userName = this.storageService.load('userName');
    }
  }

  /**
   * Saves the user name to storage
   * @param {string} name - The user's name
   * @private
   */
  saveUserName(name) {
    const trimmedName = name.trim();
    
    if (trimmedName) {
      this.userName = trimmedName;
      if (this.storageService) {
        this.storageService.save('userName', trimmedName);
      }
    } else {
      this.userName = null;
      if (this.storageService) {
        this.storageService.remove('userName');
      }
    }
    
    // Update display immediately
    this.updateDisplay();
  }

  /**
   * Sets up the name input event handlers
   * @private
   */
  setupNameInput() {
    // Use event delegation since the input is re-rendered every second
    this.containerElement.addEventListener('click', (e) => {
      if (e.target.id === 'save-name-btn') {
        const input = this.containerElement.querySelector('#user-name-input');
        if (input) {
          this.saveUserName(input.value);
        }
      }
    });
    
    // Handle Enter key in input field
    this.containerElement.addEventListener('keypress', (e) => {
      if (e.target.id === 'user-name-input' && e.key === 'Enter') {
        this.saveUserName(e.target.value);
      }
    });
  }

  /**
   * Renders the greeting display to the DOM
   * @param {string} greeting - The greeting message
   * @param {string} time - Formatted time string
   * @param {string} date - Formatted date string
   * @private
   */
  render(greeting, time, date) {
    this.containerElement.innerHTML = `
      <div class="greeting-display">
        <h1 class="greeting-message">${greeting}</h1>
        <div class="time-display">${time}</div>
        <div class="date-display">${date}</div>
        <div class="name-input-container">
          <input 
            type="text" 
            id="user-name-input" 
            class="user-name-input" 
            placeholder="Enter your name..." 
            value="${this.userName || ''}"
            maxlength="50"
            aria-label="Your name"
          >
          <button 
            type="button" 
            id="save-name-btn" 
            class="btn-save-name"
            aria-label="Save name"
          >
            Save
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Cleans up the interval and stops updates
   */
  destroy() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
