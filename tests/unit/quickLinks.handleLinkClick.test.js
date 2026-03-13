/**
 * Unit tests for QuickLinks.handleLinkClick method
 * Tests link click handling with security attributes
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import QuickLinks from '../../js/quickLinks.js';

describe('QuickLinks - handleLinkClick', () => {
  let quickLinks;
  let containerElement;
  let mockStorageService;
  let windowOpenSpy;

  beforeEach(() => {
    // Create mock container element
    containerElement = document.createElement('div');
    
    // Create mock storage service
    mockStorageService = {
      save: vi.fn(),
      load: vi.fn(() => []),
      remove: vi.fn(),
      clear: vi.fn()
    };

    // Create QuickLinks instance
    quickLinks = new QuickLinks(containerElement, mockStorageService);
    quickLinks.init();

    // Spy on window.open
    windowOpenSpy = vi.spyOn(window, 'open').mockReturnValue({});
  });

  afterEach(() => {
    windowOpenSpy.mockRestore();
  });

  it('should open URL in new tab with _blank target', () => {
    const testUrl = 'https://example.com';
    
    quickLinks.handleLinkClick(testUrl);
    
    expect(windowOpenSpy).toHaveBeenCalledWith(
      testUrl,
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('should use noopener and noreferrer security attributes', () => {
    const testUrl = 'https://secure-site.com';
    
    quickLinks.handleLinkClick(testUrl);
    
    const callArgs = windowOpenSpy.mock.calls[0];
    expect(callArgs[2]).toBe('noopener,noreferrer');
  });

  it('should handle URLs with different protocols', () => {
    const httpUrl = 'http://example.com';
    const httpsUrl = 'https://example.com';
    
    quickLinks.handleLinkClick(httpUrl);
    quickLinks.handleLinkClick(httpsUrl);
    
    expect(windowOpenSpy).toHaveBeenCalledTimes(2);
    expect(windowOpenSpy).toHaveBeenNthCalledWith(1, httpUrl, '_blank', 'noopener,noreferrer');
    expect(windowOpenSpy).toHaveBeenNthCalledWith(2, httpsUrl, '_blank', 'noopener,noreferrer');
  });

  it('should handle URLs with query parameters', () => {
    const urlWithParams = 'https://example.com/page?param1=value1&param2=value2';
    
    quickLinks.handleLinkClick(urlWithParams);
    
    expect(windowOpenSpy).toHaveBeenCalledWith(
      urlWithParams,
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('should handle URLs with hash fragments', () => {
    const urlWithHash = 'https://example.com/page#section';
    
    quickLinks.handleLinkClick(urlWithHash);
    
    expect(windowOpenSpy).toHaveBeenCalledWith(
      urlWithHash,
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('should not throw error if window.open is blocked', () => {
    // Simulate popup blocker by returning null
    windowOpenSpy.mockReturnValue(null);
    
    expect(() => {
      quickLinks.handleLinkClick('https://example.com');
    }).not.toThrow();
  });

  it('should handle multiple consecutive clicks', () => {
    const url1 = 'https://site1.com';
    const url2 = 'https://site2.com';
    const url3 = 'https://site3.com';
    
    quickLinks.handleLinkClick(url1);
    quickLinks.handleLinkClick(url2);
    quickLinks.handleLinkClick(url3);
    
    expect(windowOpenSpy).toHaveBeenCalledTimes(3);
    expect(windowOpenSpy).toHaveBeenNthCalledWith(1, url1, '_blank', 'noopener,noreferrer');
    expect(windowOpenSpy).toHaveBeenNthCalledWith(2, url2, '_blank', 'noopener,noreferrer');
    expect(windowOpenSpy).toHaveBeenNthCalledWith(3, url3, '_blank', 'noopener,noreferrer');
  });
});
