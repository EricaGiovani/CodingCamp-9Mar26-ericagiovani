/**
 * Main application entry point
 * Initializes the Productivity Dashboard
 */

import Dashboard from './dashboard.js';

// Create dashboard instance
let dashboard = null;

/**
 * Initialize the dashboard application
 */
async function initDashboard() {
    try {
        dashboard = new Dashboard();
        await dashboard.init();
    } catch (error) {
        console.error('Failed to start dashboard:', error);
    }
}

// Initialize dashboard when DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (dashboard) {
        dashboard.destroy();
    }
});
