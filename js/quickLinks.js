/**
 * QuickLinks - Manages user-defined website shortcuts
 * Handles CRUD operations for links and persists to storage
 */
class QuickLinks {
  /**
   * Creates a new QuickLinks instance
   * @param {HTMLElement} containerElement - DOM element for rendering the quick links
   * @param {StorageService} storageService - Storage service instance for persistence
   */
  constructor(containerElement, storageService) {
    this.containerElement = containerElement;
    this.storageService = storageService;
    this.links = [];
    this.storageKey = 'links';
  }

  /**
   * Initializes the quick links by loading saved links from storage
   */
  init() {
    const savedLinks = this.storageService.load(this.storageKey);
    
    if (savedLinks && Array.isArray(savedLinks)) {
      this.links = savedLinks;
    } else {
      this.links = [];
    }
    
    // Set up form event listener
    this.setupFormListener();
    
    // Render the links (including empty state if no links exist)
    this.render();
  }

  /**
   * Sets up the form submission event listener
   * @private
   */
  setupFormListener() {
    const form = this.containerElement.querySelector('#links-form');
    
    if (!form) {
      console.error('Links form not found');
      return;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const urlInput = form.querySelector('#link-url-input');
      const titleInput = form.querySelector('#link-title-input');
      
      if (!urlInput || !titleInput) {
        console.error('Form inputs not found');
        return;
      }

      const url = urlInput.value;
      const title = titleInput.value;
      
      // Attempt to add the link
      const success = this.addLink(url, title);
      
      if (success) {
        // Clear the form inputs on success
        urlInput.value = '';
        titleInput.value = '';
        urlInput.focus();
      } else {
        // Could add error handling/user feedback here
        console.warn('Failed to add link - validation failed');
      }
    });
  }

  /**
   * Generates a unique link ID
   * @private
   * @returns {string} Unique link ID in format "link-{timestamp}-{random}"
   */
  generateLinkId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `link-${timestamp}-${random}`;
  }
  /**
   * Adds a new link to the quick links list
   * @param {string} url - The URL to add (protocol will be prepended if missing)
   * @param {string} title - The display title for the link
   * @returns {boolean} True if link was added successfully, false otherwise
   */
  addLink(url, title) {
    // Validate and sanitize title
    const trimmedTitle = title.trim();

    // Reject empty titles
    if (!trimmedTitle) {
      return false;
    }

    // Enforce maximum title length of 100 characters
    if (trimmedTitle.length > 100) {
      return false;
    }

    // Validate and normalize URL
    let normalizedUrl = url.trim();

    // Prepend "https://" if protocol is missing
    if (!normalizedUrl.match(/^https?:\/\//i)) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    // Validate URL format using URL constructor
    try {
      new URL(normalizedUrl);
    } catch (error) {
      // Invalid URL format
      return false;
    }

    // Create link object with unique ID, url, title, and createdAt timestamp
    const link = {
      id: this.generateLinkId(),
      url: normalizedUrl,
      title: trimmedTitle,
      createdAt: Date.now()
    };

    // Add link to links array
    this.links.push(link);

    // Persist to storage within 100ms
    this.storageService.save(this.storageKey, this.links);

    // Re-render links list (will be implemented in task 6.5)
    if (typeof this.render === 'function') {
      this.render();
    }

    return true;
  }
  /**
   * Deletes a link from the quick links list
   * @param {string} linkId - The ID of the link to delete
   * @returns {boolean} True if link was deleted successfully, false if not found
   */
  deleteLink(linkId) {
    // Find the index of the link with the given ID
    const linkIndex = this.links.findIndex(link => link.id === linkId);

    // If link not found, return false
    if (linkIndex === -1) {
      return false;
    }

    // Remove link from links array
    this.links.splice(linkIndex, 1);

    // Persist updated array to storage
    this.storageService.save(this.storageKey, this.links);

    // Re-render links list immediately
    if (typeof this.render === 'function') {
      this.render();
    }

    return true;
  }
  /**
   * Handles click event to open a link in a new tab
   * @param {string} url - The URL to open
   */
  handleLinkClick(url) {
    // Open URL in new tab with security attributes
    // Using noopener and noreferrer for security:
    // - noopener: Prevents the new page from accessing window.opener
    // - noreferrer: Prevents the browser from sending the referrer header
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    
    // Fallback: If window.open was blocked or failed, the newWindow will be null
    // In that case, we could notify the user, but for now we'll just let it fail silently
    // as this is typically caused by popup blockers
  }
  /**
   * Sanitizes text to prevent XSS attacks
   * @private
   * @param {string} text - The text to sanitize
   * @returns {string} Sanitized text safe for HTML insertion
   */
  sanitizeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Renders the quick links list to the DOM
   * Displays links as clickable buttons with delete functionality
   * Optimized to minimize DOM manipulation
   */
  render() {
    // Find the links list container
    const linksListContainer = this.containerElement.querySelector('.links-list-container');

    if (!linksListContainer) {
      console.error('Links list container not found');
      return;
    }

    // Handle empty list state
    if (this.links.length === 0) {
      // Only update if content has changed
      if (linksListContainer.innerHTML !== '<p class="empty-state">No quick links yet. Add your favorite websites!</p>') {
        linksListContainer.innerHTML = '<p class="empty-state">No quick links yet. Add your favorite websites!</p>';
      }
      return;
    }

    // Generate HTML for all links
    const linksHTML = this.links.map(link => {
      // Sanitize title to prevent XSS attacks
      const sanitizedTitle = this.sanitizeHTML(link.title);

      return `
        <div class="link-item" data-link-id="${link.id}">
          <button class="link-button" data-url="${this.sanitizeHTML(link.url)}" aria-label="Open ${sanitizedTitle}">
            ${sanitizedTitle}
          </button>
          <button class="btn-delete-link" data-link-id="${link.id}" aria-label="Delete ${sanitizedTitle}">
            ×
          </button>
        </div>
      `;
    }).join('');

    // Use DocumentFragment for efficient DOM updates
    const fragment = document.createDocumentFragment();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = linksHTML;
    
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
    }

    // Clear and update container in one operation
    linksListContainer.innerHTML = '';
    linksListContainer.appendChild(fragment);

    // Attach event listeners to link buttons
    const linkButtons = linksListContainer.querySelectorAll('.link-button');
    linkButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const url = e.target.getAttribute('data-url');
        this.handleLinkClick(url);
      });
    });

    // Attach event listeners to delete buttons
    const deleteButtons = linksListContainer.querySelectorAll('.btn-delete-link');
    deleteButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const linkId = e.target.getAttribute('data-link-id');
        this.deleteLink(linkId);
      });
    });
  }
}

// Export for use in other modules (ES module)
export default QuickLinks;
