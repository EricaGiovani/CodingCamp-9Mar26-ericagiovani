import { describe, it, expect, beforeEach, vi } from 'vitest';
import QuickLinks from '../../js/quickLinks.js';

describe('QuickLinks - addLink method (Task 6.2)', () => {
  let quickLinks;
  let mockStorageService;
  let mockContainer;

  beforeEach(() => {
    // Create mock storage service
    mockStorageService = {
      save: vi.fn(),
      load: vi.fn(() => []),
      remove: vi.fn(),
      clear: vi.fn()
    };

    // Create mock container element
    mockContainer = document.createElement('div');

    // Create QuickLinks instance
    quickLinks = new QuickLinks(mockContainer, mockStorageService);
    quickLinks.init();
  });

  describe('URL validation and normalization', () => {
    it('should add link with valid URL including protocol', () => {
      const result = quickLinks.addLink('https://example.com', 'Example');
      
      expect(result).toBe(true);
      expect(quickLinks.links).toHaveLength(1);
      expect(quickLinks.links[0].url).toBe('https://example.com');
      expect(quickLinks.links[0].title).toBe('Example');
    });

    it('should prepend https:// if protocol is missing', () => {
      const result = quickLinks.addLink('example.com', 'Example');
      
      expect(result).toBe(true);
      expect(quickLinks.links[0].url).toBe('https://example.com');
    });

    it('should accept http:// protocol', () => {
      const result = quickLinks.addLink('http://example.com', 'Example');
      
      expect(result).toBe(true);
      expect(quickLinks.links[0].url).toBe('http://example.com');
    });

    it('should reject invalid URL format', () => {
      const result = quickLinks.addLink('not a valid url', 'Invalid');
      
      expect(result).toBe(false);
      expect(quickLinks.links).toHaveLength(0);
    });

    it('should trim whitespace from URL', () => {
      const result = quickLinks.addLink('  https://example.com  ', 'Example');
      
      expect(result).toBe(true);
      expect(quickLinks.links[0].url).toBe('https://example.com');
    });
  });

  describe('Title validation', () => {
    it('should trim whitespace from title', () => {
      const result = quickLinks.addLink('https://example.com', '  Example Site  ');
      
      expect(result).toBe(true);
      expect(quickLinks.links[0].title).toBe('Example Site');
    });

    it('should reject empty title', () => {
      const result = quickLinks.addLink('https://example.com', '');
      
      expect(result).toBe(false);
      expect(quickLinks.links).toHaveLength(0);
    });

    it('should reject whitespace-only title', () => {
      const result = quickLinks.addLink('https://example.com', '   ');
      
      expect(result).toBe(false);
      expect(quickLinks.links).toHaveLength(0);
    });

    it('should enforce maximum title length of 100 characters', () => {
      const longTitle = 'a'.repeat(101);
      const result = quickLinks.addLink('https://example.com', longTitle);
      
      expect(result).toBe(false);
      expect(quickLinks.links).toHaveLength(0);
    });

    it('should accept title with exactly 100 characters', () => {
      const maxTitle = 'a'.repeat(100);
      const result = quickLinks.addLink('https://example.com', maxTitle);
      
      expect(result).toBe(true);
      expect(quickLinks.links[0].title).toBe(maxTitle);
    });
  });

  describe('Link object creation', () => {
    it('should create link with unique ID', () => {
      quickLinks.addLink('https://example1.com', 'Example 1');
      quickLinks.addLink('https://example2.com', 'Example 2');
      
      expect(quickLinks.links[0].id).toBeDefined();
      expect(quickLinks.links[1].id).toBeDefined();
      expect(quickLinks.links[0].id).not.toBe(quickLinks.links[1].id);
    });

    it('should create link with correct structure', () => {
      quickLinks.addLink('https://example.com', 'Example');
      const link = quickLinks.links[0];
      
      expect(link).toHaveProperty('id');
      expect(link).toHaveProperty('url');
      expect(link).toHaveProperty('title');
      expect(link).toHaveProperty('createdAt');
      expect(typeof link.id).toBe('string');
      expect(typeof link.url).toBe('string');
      expect(typeof link.title).toBe('string');
      expect(typeof link.createdAt).toBe('number');
    });

    it('should set createdAt timestamp', () => {
      const beforeTime = Date.now();
      quickLinks.addLink('https://example.com', 'Example');
      const afterTime = Date.now();
      
      const link = quickLinks.links[0];
      expect(link.createdAt).toBeGreaterThanOrEqual(beforeTime);
      expect(link.createdAt).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('Storage persistence', () => {
    it('should persist link to storage', () => {
      quickLinks.addLink('https://example.com', 'Example');
      
      expect(mockStorageService.save).toHaveBeenCalledWith('links', quickLinks.links);
    });

    it('should add link to links array', () => {
      expect(quickLinks.links).toHaveLength(0);
      
      quickLinks.addLink('https://example.com', 'Example');
      
      expect(quickLinks.links).toHaveLength(1);
    });

    it('should maintain multiple links in array', () => {
      quickLinks.addLink('https://example1.com', 'Example 1');
      quickLinks.addLink('https://example2.com', 'Example 2');
      quickLinks.addLink('https://example3.com', 'Example 3');
      
      expect(quickLinks.links).toHaveLength(3);
      expect(mockStorageService.save).toHaveBeenCalledTimes(3);
    });
  });

  describe('Render method integration', () => {
    it('should call render method if it exists', () => {
      quickLinks.render = vi.fn();
      
      quickLinks.addLink('https://example.com', 'Example');
      
      expect(quickLinks.render).toHaveBeenCalled();
    });

    it('should not throw error if render method does not exist', () => {
      expect(() => {
        quickLinks.addLink('https://example.com', 'Example');
      }).not.toThrow();
    });
  });
});

describe('QuickLinks - deleteLink method (Task 6.3)', () => {
  let quickLinks;
  let mockStorageService;
  let mockContainer;

  beforeEach(() => {
    // Create mock storage service
    mockStorageService = {
      save: vi.fn(),
      load: vi.fn(() => []),
      remove: vi.fn(),
      clear: vi.fn()
    };

    // Create mock container element
    mockContainer = document.createElement('div');

    // Create QuickLinks instance
    quickLinks = new QuickLinks(mockContainer, mockStorageService);
    quickLinks.init();
  });

  describe('Link deletion', () => {
    it('should delete link from links array', () => {
      // Add a link first
      quickLinks.addLink('https://example.com', 'Example');
      const linkId = quickLinks.links[0].id;
      
      expect(quickLinks.links).toHaveLength(1);
      
      // Delete the link
      const result = quickLinks.deleteLink(linkId);
      
      expect(result).toBe(true);
      expect(quickLinks.links).toHaveLength(0);
    });

    it('should return false if link not found', () => {
      const result = quickLinks.deleteLink('non-existent-id');
      
      expect(result).toBe(false);
      expect(quickLinks.links).toHaveLength(0);
    });

    it('should delete correct link when multiple links exist', () => {
      // Add multiple links
      quickLinks.addLink('https://example1.com', 'Example 1');
      quickLinks.addLink('https://example2.com', 'Example 2');
      quickLinks.addLink('https://example3.com', 'Example 3');
      
      const linkToDelete = quickLinks.links[1];
      const linkId = linkToDelete.id;
      
      expect(quickLinks.links).toHaveLength(3);
      
      // Delete the middle link
      const result = quickLinks.deleteLink(linkId);
      
      expect(result).toBe(true);
      expect(quickLinks.links).toHaveLength(2);
      expect(quickLinks.links.find(link => link.id === linkId)).toBeUndefined();
      expect(quickLinks.links[0].title).toBe('Example 1');
      expect(quickLinks.links[1].title).toBe('Example 3');
    });

    it('should not affect other links when deleting one', () => {
      // Add multiple links
      quickLinks.addLink('https://example1.com', 'Example 1');
      quickLinks.addLink('https://example2.com', 'Example 2');
      
      const link1 = quickLinks.links[0];
      const link2 = quickLinks.links[1];
      
      // Delete the first link
      quickLinks.deleteLink(link1.id);
      
      // Verify second link is unchanged
      expect(quickLinks.links).toHaveLength(1);
      expect(quickLinks.links[0].id).toBe(link2.id);
      expect(quickLinks.links[0].url).toBe(link2.url);
      expect(quickLinks.links[0].title).toBe(link2.title);
      expect(quickLinks.links[0].createdAt).toBe(link2.createdAt);
    });
  });

  describe('Storage persistence', () => {
    it('should persist updated links array to storage after deletion', () => {
      // Add a link
      quickLinks.addLink('https://example.com', 'Example');
      const linkId = quickLinks.links[0].id;
      
      // Reset mock to clear previous calls
      mockStorageService.save.mockClear();
      
      // Delete the link
      quickLinks.deleteLink(linkId);
      
      // Verify storage was updated
      expect(mockStorageService.save).toHaveBeenCalledWith('links', quickLinks.links);
      expect(mockStorageService.save).toHaveBeenCalledTimes(1);
    });

    it('should persist empty array after deleting last link', () => {
      // Add a link
      quickLinks.addLink('https://example.com', 'Example');
      const linkId = quickLinks.links[0].id;
      
      // Reset mock
      mockStorageService.save.mockClear();
      
      // Delete the link
      quickLinks.deleteLink(linkId);
      
      // Verify empty array was saved
      expect(mockStorageService.save).toHaveBeenCalledWith('links', []);
    });

    it('should not call storage save if link not found', () => {
      // Add a link
      quickLinks.addLink('https://example.com', 'Example');
      
      // Reset mock
      mockStorageService.save.mockClear();
      
      // Try to delete non-existent link
      quickLinks.deleteLink('non-existent-id');
      
      // Verify storage was not called
      expect(mockStorageService.save).not.toHaveBeenCalled();
    });
  });

  describe('Render method integration', () => {
    it('should call render method after deletion if it exists', () => {
      // Add a link
      quickLinks.addLink('https://example.com', 'Example');
      const linkId = quickLinks.links[0].id;
      
      // Add render method
      quickLinks.render = vi.fn();
      
      // Delete the link
      quickLinks.deleteLink(linkId);
      
      expect(quickLinks.render).toHaveBeenCalled();
    });

    it('should not throw error if render method does not exist', () => {
      // Add a link
      quickLinks.addLink('https://example.com', 'Example');
      const linkId = quickLinks.links[0].id;
      
      // Delete without render method
      expect(() => {
        quickLinks.deleteLink(linkId);
      }).not.toThrow();
    });

    it('should not call render if link not found', () => {
      quickLinks.render = vi.fn();
      
      // Try to delete non-existent link
      quickLinks.deleteLink('non-existent-id');
      
      // Verify render was not called
      expect(quickLinks.render).not.toHaveBeenCalled();
    });
  });
});
