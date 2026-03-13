import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import QuickLinks from '../../js/quickLinks.js';

describe('QuickLinks - render method (Task 6.5)', () => {
  let quickLinks;
  let mockStorageService;
  let mockContainer;
  let dom;

  beforeEach(() => {
    // Create a JSDOM instance with proper HTML structure
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div id="quick-links" class="links-component">
            <div class="links-list-container"></div>
          </div>
        </body>
      </html>
    `);

    // Set up global document and window
    global.document = dom.window.document;
    global.window = dom.window;

    // Create mock storage service
    mockStorageService = {
      save: vi.fn(),
      load: vi.fn(() => []),
      remove: vi.fn(),
      clear: vi.fn()
    };

    // Get the container element
    mockContainer = document.getElementById('quick-links');

    // Create QuickLinks instance
    quickLinks = new QuickLinks(mockContainer, mockStorageService);
    quickLinks.init();
  });

  describe('Empty state handling', () => {
    it('should display empty state message when no links exist', () => {
      quickLinks.render();
      
      const emptyState = mockContainer.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.textContent).toContain('No quick links yet');
    });

    it('should not display link items when empty', () => {
      quickLinks.render();
      
      const linkItems = mockContainer.querySelectorAll('.link-item');
      expect(linkItems).toHaveLength(0);
    });
  });

  describe('Link rendering', () => {
    it('should render link as clickable button with title text', () => {
      quickLinks.addLink('https://example.com', 'Example Site');
      
      const linkButton = mockContainer.querySelector('.link-button');
      expect(linkButton).toBeTruthy();
      expect(linkButton.textContent.trim()).toBe('Example Site');
      expect(linkButton.tagName).toBe('BUTTON');
    });

    it('should render multiple links', () => {
      quickLinks.addLink('https://example1.com', 'Example 1');
      quickLinks.addLink('https://example2.com', 'Example 2');
      quickLinks.addLink('https://example3.com', 'Example 3');
      
      const linkButtons = mockContainer.querySelectorAll('.link-button');
      expect(linkButtons).toHaveLength(3);
      expect(linkButtons[0].textContent.trim()).toBe('Example 1');
      expect(linkButtons[1].textContent.trim()).toBe('Example 2');
      expect(linkButtons[2].textContent.trim()).toBe('Example 3');
    });

    it('should add delete button for each link', () => {
      quickLinks.addLink('https://example1.com', 'Example 1');
      quickLinks.addLink('https://example2.com', 'Example 2');
      
      const deleteButtons = mockContainer.querySelectorAll('.btn-delete-link');
      expect(deleteButtons).toHaveLength(2);
    });

    it('should store URL in data attribute', () => {
      quickLinks.addLink('https://example.com', 'Example Site');
      
      const linkButton = mockContainer.querySelector('.link-button');
      expect(linkButton.getAttribute('data-url')).toBe('https://example.com');
    });

    it('should store link ID in data attribute', () => {
      quickLinks.addLink('https://example.com', 'Example Site');
      const linkId = quickLinks.links[0].id;
      
      const linkItem = mockContainer.querySelector('.link-item');
      expect(linkItem.getAttribute('data-link-id')).toBe(linkId);
    });
  });

  describe('HTML sanitization (XSS prevention)', () => {
    it('should sanitize title to prevent XSS attacks', () => {
      quickLinks.addLink('https://example.com', '<script>alert("XSS")</script>');
      
      const innerHTML = mockContainer.innerHTML;
      // Should not contain actual script tags
      expect(innerHTML).not.toContain('<script>alert("XSS")</script>');
      
      // Should contain escaped version
      const linkButton = mockContainer.querySelector('.link-button');
      expect(linkButton.textContent).toContain('<script>');
    });

    it('should sanitize URL to prevent XSS attacks', () => {
      quickLinks.addLink('javascript:alert("XSS")', 'Malicious Link');
      
      // The URL validation should reject this, but if it somehow gets through,
      // the render should sanitize it
      if (quickLinks.links.length > 0) {
        const linkButton = mockContainer.querySelector('.link-button');
        const url = linkButton.getAttribute('data-url');
        expect(url).not.toContain('javascript:');
      }
    });

    it('should escape HTML entities in title', () => {
      quickLinks.addLink('https://example.com', 'Test & <Company>');
      
      const linkButton = mockContainer.querySelector('.link-button');
      const innerHTML = mockContainer.innerHTML;
      
      // Should contain escaped entities
      expect(innerHTML).toContain('&amp;');
      expect(innerHTML).toContain('&lt;');
      expect(innerHTML).toContain('&gt;');
      
      // But textContent should show the original characters
      expect(linkButton.textContent).toContain('&');
      expect(linkButton.textContent).toContain('<');
      expect(linkButton.textContent).toContain('>');
    });

    it('should handle special characters safely', () => {
      quickLinks.addLink('https://example.com', '"><img src=x onerror=alert(1)>');
      
      const innerHTML = mockContainer.innerHTML;
      // Should not contain unescaped quotes or img tags
      expect(innerHTML).not.toContain('onerror=alert(1)');
    });
  });

  describe('Event handlers', () => {
    it('should attach click handler to link button', () => {
      // Mock handleLinkClick
      quickLinks.handleLinkClick = vi.fn();
      
      quickLinks.addLink('https://example.com', 'Example Site');
      
      const linkButton = mockContainer.querySelector('.link-button');
      linkButton.click();
      
      expect(quickLinks.handleLinkClick).toHaveBeenCalledWith('https://example.com');
    });

    it('should attach click handler to delete button', () => {
      quickLinks.addLink('https://example.com', 'Example Site');
      const linkId = quickLinks.links[0].id;
      
      // Mock deleteLink
      const originalDelete = quickLinks.deleteLink;
      quickLinks.deleteLink = vi.fn();
      
      const deleteButton = mockContainer.querySelector('.btn-delete-link');
      deleteButton.click();
      
      expect(quickLinks.deleteLink).toHaveBeenCalledWith(linkId);
      
      // Restore original
      quickLinks.deleteLink = originalDelete;
    });

    it('should handle multiple link button clicks', () => {
      quickLinks.handleLinkClick = vi.fn();
      
      quickLinks.addLink('https://example1.com', 'Example 1');
      quickLinks.addLink('https://example2.com', 'Example 2');
      
      const linkButtons = mockContainer.querySelectorAll('.link-button');
      linkButtons[0].click();
      linkButtons[1].click();
      
      expect(quickLinks.handleLinkClick).toHaveBeenCalledTimes(2);
      expect(quickLinks.handleLinkClick).toHaveBeenNthCalledWith(1, 'https://example1.com');
      expect(quickLinks.handleLinkClick).toHaveBeenNthCalledWith(2, 'https://example2.com');
    });
  });

  describe('Accessibility', () => {
    it('should add aria-label to link buttons', () => {
      quickLinks.addLink('https://example.com', 'Example Site');
      
      const linkButton = mockContainer.querySelector('.link-button');
      expect(linkButton.getAttribute('aria-label')).toContain('Example Site');
    });

    it('should add aria-label to delete buttons', () => {
      quickLinks.addLink('https://example.com', 'Example Site');
      
      const deleteButton = mockContainer.querySelector('.btn-delete-link');
      expect(deleteButton.getAttribute('aria-label')).toContain('Delete');
      expect(deleteButton.getAttribute('aria-label')).toContain('Example Site');
    });
  });

  describe('Re-rendering', () => {
    it('should clear previous content when re-rendering', () => {
      quickLinks.addLink('https://example1.com', 'Example 1');
      quickLinks.addLink('https://example2.com', 'Example 2');
      
      let linkButtons = mockContainer.querySelectorAll('.link-button');
      expect(linkButtons).toHaveLength(2);
      
      // Delete one link (which triggers re-render)
      const linkId = quickLinks.links[0].id;
      quickLinks.deleteLink(linkId);
      
      linkButtons = mockContainer.querySelectorAll('.link-button');
      expect(linkButtons).toHaveLength(1);
      expect(linkButtons[0].textContent.trim()).toBe('Example 2');
    });

    it('should show empty state after deleting all links', () => {
      quickLinks.addLink('https://example.com', 'Example Site');
      const linkId = quickLinks.links[0].id;
      
      quickLinks.deleteLink(linkId);
      
      const emptyState = mockContainer.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.textContent).toContain('No quick links yet');
    });
  });

  describe('Error handling', () => {
    it('should handle missing links-list-container gracefully', () => {
      // Create container without links-list-container
      const badContainer = document.createElement('div');
      const badQuickLinks = new QuickLinks(badContainer, mockStorageService);
      badQuickLinks.init();
      
      // Should not throw error
      expect(() => {
        badQuickLinks.render();
      }).not.toThrow();
    });

    it('should log error when container not found', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const badContainer = document.createElement('div');
      const badQuickLinks = new QuickLinks(badContainer, mockStorageService);
      badQuickLinks.init();
      badQuickLinks.render();
      
      expect(consoleSpy).toHaveBeenCalledWith('Links list container not found');
      
      consoleSpy.mockRestore();
    });
  });
});
