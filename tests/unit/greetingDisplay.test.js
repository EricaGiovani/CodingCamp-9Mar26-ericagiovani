/**
 * Unit tests for GreetingDisplay component
 * Tests time-based greeting logic, time formatting, and date formatting
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GreetingDisplay } from '../../js/greetingDisplay.js';

describe('GreetingDisplay', () => {
  let container;
  let greetingDisplay;

  beforeEach(() => {
    // Create a container element for testing
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up
    if (greetingDisplay) {
      greetingDisplay.destroy();
    }
    document.body.removeChild(container);
  });

  describe('getGreeting()', () => {
    beforeEach(() => {
      greetingDisplay = new GreetingDisplay(container);
    });

    // Test "Good Morning" time range (5:00 AM - 11:59 AM)
    it('should return "Good Morning" at 5:00 AM', () => {
      const date = new Date('2024-01-01T05:00:00');
      expect(greetingDisplay.getGreeting(date)).toBe('Good Morning');
    });

    it('should return "Good Morning" at 8:30 AM', () => {
      const date = new Date('2024-01-01T08:30:00');
      expect(greetingDisplay.getGreeting(date)).toBe('Good Morning');
    });

    it('should return "Good Morning" at 11:59 AM', () => {
      const date = new Date('2024-01-01T11:59:59');
      expect(greetingDisplay.getGreeting(date)).toBe('Good Morning');
    });

    // Test "Good Afternoon" time range (12:00 PM - 4:59 PM)
    it('should return "Good Afternoon" at 12:00 PM', () => {
      const date = new Date('2024-01-01T12:00:00');
      expect(greetingDisplay.getGreeting(date)).toBe('Good Afternoon');
    });

    it('should return "Good Afternoon" at 2:30 PM', () => {
      const date = new Date('2024-01-01T14:30:00');
      expect(greetingDisplay.getGreeting(date)).toBe('Good Afternoon');
    });

    it('should return "Good Afternoon" at 4:59 PM', () => {
      const date = new Date('2024-01-01T16:59:59');
      expect(greetingDisplay.getGreeting(date)).toBe('Good Afternoon');
    });

    // Test "Good Evening" time range (5:00 PM - 8:59 PM)
    it('should return "Good Evening" at 5:00 PM', () => {
      const date = new Date('2024-01-01T17:00:00');
      expect(greetingDisplay.getGreeting(date)).toBe('Good Evening');
    });

    it('should return "Good Evening" at 7:30 PM', () => {
      const date = new Date('2024-01-01T19:30:00');
      expect(greetingDisplay.getGreeting(date)).toBe('Good Evening');
    });

    it('should return "Good Evening" at 8:59 PM', () => {
      const date = new Date('2024-01-01T20:59:59');
      expect(greetingDisplay.getGreeting(date)).toBe('Good Evening');
    });

    // Test "Good Night" time range (9:00 PM - 4:59 AM)
    it('should return "Good Night" at 9:00 PM', () => {
      const date = new Date('2024-01-01T21:00:00');
      expect(greetingDisplay.getGreeting(date)).toBe('Good Night');
    });

    it('should return "Good Night" at 11:30 PM', () => {
      const date = new Date('2024-01-01T23:30:00');
      expect(greetingDisplay.getGreeting(date)).toBe('Good Night');
    });

    it('should return "Good Night" at midnight', () => {
      const date = new Date('2024-01-01T00:00:00');
      expect(greetingDisplay.getGreeting(date)).toBe('Good Night');
    });

    it('should return "Good Night" at 2:30 AM', () => {
      const date = new Date('2024-01-01T02:30:00');
      expect(greetingDisplay.getGreeting(date)).toBe('Good Night');
    });

    it('should return "Good Night" at 4:59 AM', () => {
      const date = new Date('2024-01-01T04:59:59');
      expect(greetingDisplay.getGreeting(date)).toBe('Good Night');
    });

    // Test boundary transitions
    it('should transition from "Good Night" to "Good Morning" at 5:00 AM', () => {
      const nightDate = new Date('2024-01-01T04:59:59');
      const morningDate = new Date('2024-01-01T05:00:00');
      
      expect(greetingDisplay.getGreeting(nightDate)).toBe('Good Night');
      expect(greetingDisplay.getGreeting(morningDate)).toBe('Good Morning');
    });

    it('should transition from "Good Morning" to "Good Afternoon" at noon', () => {
      const morningDate = new Date('2024-01-01T11:59:59');
      const afternoonDate = new Date('2024-01-01T12:00:00');
      
      expect(greetingDisplay.getGreeting(morningDate)).toBe('Good Morning');
      expect(greetingDisplay.getGreeting(afternoonDate)).toBe('Good Afternoon');
    });

    it('should transition from "Good Afternoon" to "Good Evening" at 5:00 PM', () => {
      const afternoonDate = new Date('2024-01-01T16:59:59');
      const eveningDate = new Date('2024-01-01T17:00:00');
      
      expect(greetingDisplay.getGreeting(afternoonDate)).toBe('Good Afternoon');
      expect(greetingDisplay.getGreeting(eveningDate)).toBe('Good Evening');
    });

    it('should transition from "Good Evening" to "Good Night" at 9:00 PM', () => {
      const eveningDate = new Date('2024-01-01T20:59:59');
      const nightDate = new Date('2024-01-01T21:00:00');
      
      expect(greetingDisplay.getGreeting(eveningDate)).toBe('Good Evening');
      expect(greetingDisplay.getGreeting(nightDate)).toBe('Good Night');
    });
  });

  describe('formatTime()', () => {
    beforeEach(() => {
      greetingDisplay = new GreetingDisplay(container);
    });

    it('should format midnight as 12:00:00 AM', () => {
      const date = new Date('2024-01-01T00:00:00');
      expect(greetingDisplay.formatTime(date)).toBe('12:00:00 AM');
    });

    it('should format noon as 12:00:00 PM', () => {
      const date = new Date('2024-01-01T12:00:00');
      expect(greetingDisplay.formatTime(date)).toBe('12:00:00 PM');
    });

    it('should format morning time correctly', () => {
      const date = new Date('2024-01-01T09:15:30');
      expect(greetingDisplay.formatTime(date)).toBe('9:15:30 AM');
    });

    it('should format afternoon time correctly', () => {
      const date = new Date('2024-01-01T15:45:12');
      expect(greetingDisplay.formatTime(date)).toBe('3:45:12 PM');
    });

    it('should zero-pad minutes and seconds', () => {
      const date = new Date('2024-01-01T08:05:09');
      expect(greetingDisplay.formatTime(date)).toBe('8:05:09 AM');
    });
  });

  describe('formatDate()', () => {
    beforeEach(() => {
      greetingDisplay = new GreetingDisplay(container);
    });

    it('should format date with day of week, month, and day', () => {
      const date = new Date('2024-01-01T12:00:00');
      expect(greetingDisplay.formatDate(date)).toBe('Monday, January 1');
    });

    it('should format different dates correctly', () => {
      const date = new Date('2024-12-25T12:00:00');
      expect(greetingDisplay.formatDate(date)).toBe('Wednesday, December 25');
    });
  });

  describe('constructor', () => {
    it('should throw error if containerElement is not provided', () => {
      expect(() => new GreetingDisplay(null)).toThrow('GreetingDisplay: containerElement is required');
    });

    it('should store containerElement reference', () => {
      greetingDisplay = new GreetingDisplay(container);
      expect(greetingDisplay.containerElement).toBe(container);
    });
  });

  describe('init() and destroy()', () => {
    it('should start interval on init', () => {
      greetingDisplay = new GreetingDisplay(container);
      greetingDisplay.init();
      expect(greetingDisplay.intervalId).not.toBeNull();
    });

    it('should clear interval on destroy', () => {
      greetingDisplay = new GreetingDisplay(container);
      greetingDisplay.init();
      const intervalId = greetingDisplay.intervalId;
      greetingDisplay.destroy();
      expect(greetingDisplay.intervalId).toBeNull();
    });

    it('should render greeting display on init', () => {
      greetingDisplay = new GreetingDisplay(container);
      greetingDisplay.init();
      expect(container.querySelector('.greeting-display')).not.toBeNull();
      expect(container.querySelector('.greeting-message')).not.toBeNull();
      expect(container.querySelector('.time-display')).not.toBeNull();
      expect(container.querySelector('.date-display')).not.toBeNull();
    });
  });
});
