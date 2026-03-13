/**
 * Unit tests for FocusTimer component
 * Tests core timer logic and state management
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import FocusTimer from '../../js/focusTimer.js';

describe('FocusTimer', () => {
  let container;
  let timer;

  beforeEach(() => {
    // Create a mock container element
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Use fake timers for testing setInterval
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Clean up
    if (timer) {
      timer.destroy();
    }
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with 25 minutes (1500 seconds)', () => {
      timer = new FocusTimer(container);
      
      expect(timer.totalSeconds).toBe(1500);
      expect(timer.remainingSeconds).toBe(1500);
    });

    it('should initialize with isRunning as false', () => {
      timer = new FocusTimer(container);
      
      expect(timer.isRunning).toBe(false);
    });

    it('should initialize with null intervalId', () => {
      timer = new FocusTimer(container);
      
      expect(timer.intervalId).toBe(null);
    });

    it('should throw error if container element is missing', () => {
      expect(() => new FocusTimer(null)).toThrow('Container element is required');
    });
  });

  describe('start()', () => {
    it('should set isRunning to true', () => {
      timer = new FocusTimer(container);
      timer.start();
      
      expect(timer.isRunning).toBe(true);
    });

    it('should create an interval', () => {
      timer = new FocusTimer(container);
      timer.start();
      
      expect(timer.intervalId).not.toBe(null);
    });

    it('should decrement remainingSeconds every second', () => {
      timer = new FocusTimer(container);
      timer.start();
      
      expect(timer.remainingSeconds).toBe(1500);
      
      vi.advanceTimersByTime(1000);
      expect(timer.remainingSeconds).toBe(1499);
      
      vi.advanceTimersByTime(1000);
      expect(timer.remainingSeconds).toBe(1498);
    });

    it('should not start if already running', () => {
      timer = new FocusTimer(container);
      timer.start();
      const firstIntervalId = timer.intervalId;
      
      timer.start(); // Try to start again
      
      expect(timer.intervalId).toBe(firstIntervalId);
    });
  });

  describe('stop()', () => {
    it('should set isRunning to false', () => {
      timer = new FocusTimer(container);
      timer.start();
      timer.stop();
      
      expect(timer.isRunning).toBe(false);
    });

    it('should clear the interval', () => {
      timer = new FocusTimer(container);
      timer.start();
      timer.stop();
      
      expect(timer.intervalId).toBe(null);
    });

    it('should preserve remainingSeconds value', () => {
      timer = new FocusTimer(container);
      timer.start();
      
      vi.advanceTimersByTime(5000); // 5 seconds pass
      expect(timer.remainingSeconds).toBe(1495);
      
      timer.stop();
      expect(timer.remainingSeconds).toBe(1495); // Should be preserved
    });

    it('should not error if called when not running', () => {
      timer = new FocusTimer(container);
      
      expect(() => timer.stop()).not.toThrow();
    });
  });

  describe('reset()', () => {
    it('should reset remainingSeconds to 1500', () => {
      timer = new FocusTimer(container);
      timer.start();
      
      vi.advanceTimersByTime(10000); // 10 seconds pass
      expect(timer.remainingSeconds).toBe(1490);
      
      timer.reset();
      expect(timer.remainingSeconds).toBe(1500);
    });

    it('should stop the timer if running', () => {
      timer = new FocusTimer(container);
      timer.start();
      
      timer.reset();
      
      expect(timer.isRunning).toBe(false);
      expect(timer.intervalId).toBe(null);
    });

    it('should work when timer is not running', () => {
      timer = new FocusTimer(container);
      timer.remainingSeconds = 500; // Manually set to some value
      
      timer.reset();
      
      expect(timer.remainingSeconds).toBe(1500);
    });
  });

  describe('Timer completion', () => {
    it('should stop automatically when reaching zero', () => {
      timer = new FocusTimer(container);
      timer.remainingSeconds = 2; // Start near zero for faster test
      timer.start();
      
      vi.advanceTimersByTime(2000); // Advance to zero
      
      expect(timer.remainingSeconds).toBe(0);
      expect(timer.isRunning).toBe(false);
      expect(timer.intervalId).toBe(null);
    });

    it('should not go below zero', () => {
      timer = new FocusTimer(container);
      timer.remainingSeconds = 1;
      timer.start();
      
      vi.advanceTimersByTime(3000); // Advance past zero
      
      expect(timer.remainingSeconds).toBe(0);
    });
  });

  describe('destroy()', () => {
    it('should clear the interval', () => {
      timer = new FocusTimer(container);
      timer.start();
      
      timer.destroy();
      
      expect(timer.intervalId).toBe(null);
    });

    it('should set isRunning to false', () => {
      timer = new FocusTimer(container);
      timer.start();
      
      timer.destroy();
      
      expect(timer.isRunning).toBe(false);
    });
  });

  describe('formatTime()', () => {
    beforeEach(() => {
      timer = new FocusTimer(container);
    });

    it('should format 1500 seconds as 25:00', () => {
      expect(timer.formatTime(1500)).toBe('25:00');
    });

    it('should format 0 seconds as 00:00', () => {
      expect(timer.formatTime(0)).toBe('00:00');
    });

    it('should format 1 second as 00:01', () => {
      expect(timer.formatTime(1)).toBe('00:01');
    });

    it('should format 59 seconds as 00:59', () => {
      expect(timer.formatTime(59)).toBe('00:59');
    });

    it('should format 60 seconds as 01:00', () => {
      expect(timer.formatTime(60)).toBe('01:00');
    });

    it('should format 61 seconds as 01:01', () => {
      expect(timer.formatTime(61)).toBe('01:01');
    });

    it('should format 1499 seconds as 24:59', () => {
      expect(timer.formatTime(1499)).toBe('24:59');
    });

    it('should zero-pad minutes (00-25)', () => {
      expect(timer.formatTime(0)).toBe('00:00');
      expect(timer.formatTime(60)).toBe('01:00');
      expect(timer.formatTime(540)).toBe('09:00');
      expect(timer.formatTime(600)).toBe('10:00');
    });

    it('should zero-pad seconds (00-59)', () => {
      expect(timer.formatTime(1)).toBe('00:01');
      expect(timer.formatTime(9)).toBe('00:09');
      expect(timer.formatTime(10)).toBe('00:10');
      expect(timer.formatTime(59)).toBe('00:59');
    });
  });

  describe('init() and render()', () => {
    beforeEach(() => {
      timer = new FocusTimer(container);
    });

    it('should render timer display on init', () => {
      timer.init();
      
      const display = container.querySelector('.timer-display');
      expect(display).not.toBe(null);
      expect(display.textContent).toBe('25:00');
    });

    it('should render control buttons on init', () => {
      timer.init();
      
      const startBtn = container.querySelector('.btn-start');
      const stopBtn = container.querySelector('.btn-stop');
      const resetBtn = container.querySelector('.btn-reset');
      
      expect(startBtn).not.toBe(null);
      expect(stopBtn).not.toBe(null);
      expect(resetBtn).not.toBe(null);
    });

    it('should update display when timer is running', () => {
      timer.init();
      timer.start();
      
      vi.advanceTimersByTime(1000);
      
      const display = container.querySelector('.timer-display');
      expect(display.textContent).toBe('24:59');
    });

    it('should show completion message when timer reaches zero', () => {
      timer.init();
      timer.remainingSeconds = 1;
      timer.start();
      
      vi.advanceTimersByTime(1000);
      
      const completionMsg = container.querySelector('.timer-complete');
      expect(completionMsg).not.toBe(null);
      expect(completionMsg.textContent).toBe('Session Complete!');
    });

    it('should disable start button when running', () => {
      timer.init();
      timer.start();
      
      const startBtn = container.querySelector('.btn-start');
      expect(startBtn.disabled).toBe(true);
    });

    it('should disable stop button when not running', () => {
      timer.init();
      
      const stopBtn = container.querySelector('.btn-stop');
      expect(stopBtn.disabled).toBe(true);
    });

    it('should update display on reset', () => {
      timer.init();
      timer.remainingSeconds = 500;
      timer.reset();
      
      const display = container.querySelector('.timer-display');
      expect(display.textContent).toBe('25:00');
    });
  });
});
