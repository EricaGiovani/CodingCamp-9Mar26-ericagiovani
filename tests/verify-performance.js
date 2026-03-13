/**
 * Performance Verification Script
 * Verifies that performance monitoring is correctly integrated
 */

// Mock performance API for Node.js
global.performance = {
  now: () => Date.now()
};

// Mock console methods to capture output
const logs = [];
const originalLog = console.log;
const originalWarn = console.warn;

console.log = (...args) => {
  logs.push({ type: 'log', message: args.join(' ') });
  originalLog(...args);
};

console.warn = (...args) => {
  logs.push({ type: 'warn', message: args.join(' ') });
  originalWarn(...args);
};

// Test 1: Verify PerformanceMonitor class structure
console.log('\n=== Test 1: PerformanceMonitor Structure ===');
try {
  // Read the performance monitor file
  const fs = require('fs');
  const path = require('path');
  const perfMonitorPath = path.join(__dirname, '../js/performanceMonitor.js');
  const perfMonitorCode = fs.readFileSync(perfMonitorPath, 'utf8');
  
  // Check for required methods
  const requiredMethods = [
    'startInitialLoad',
    'endInitialLoad',
    'measureInteraction',
    'measureTimerUpdate',
    'measureStorage',
    'getSummary',
    'logReport'
  ];
  
  let allMethodsPresent = true;
  requiredMethods.forEach(method => {
    if (perfMonitorCode.includes(method)) {
      console.log(`✓ Method ${method} found`);
    } else {
      console.log(`✗ Method ${method} NOT found`);
      allMethodsPresent = false;
    }
  });
  
  if (allMethodsPresent) {
    console.log('✓ All required methods present');
  } else {
    console.log('✗ Some methods missing');
  }
} catch (error) {
  console.error('✗ Error reading performance monitor:', error.message);
}

// Test 2: Verify Dashboard integration
console.log('\n=== Test 2: Dashboard Integration ===');
try {
  const fs = require('fs');
  const path = require('path');
  const dashboardPath = path.join(__dirname, '../js/dashboard.js');
  const dashboardCode = fs.readFileSync(dashboardPath, 'utf8');
  
  const checks = [
    { name: 'Import performanceMonitor', pattern: /import.*performanceMonitor.*from.*performanceMonitor/ },
    { name: 'startInitialLoad call', pattern: /performanceMonitor\.startInitialLoad/ },
    { name: 'endInitialLoad call', pattern: /performanceMonitor\.endInitialLoad/ },
    { name: 'measureInteraction call', pattern: /performanceMonitor\.measureInteraction/ }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(dashboardCode)) {
      console.log(`✓ ${check.name} found`);
    } else {
      console.log(`✗ ${check.name} NOT found`);
    }
  });
} catch (error) {
  console.error('✗ Error reading dashboard:', error.message);
}

// Test 3: Verify FocusTimer optimization
console.log('\n=== Test 3: FocusTimer Optimization ===');
try {
  const fs = require('fs');
  const path = require('path');
  const timerPath = path.join(__dirname, '../js/focusTimer.js');
  const timerCode = fs.readFileSync(timerPath, 'utf8');
  
  const checks = [
    { name: 'Performance monitor parameter', pattern: /constructor.*performanceMonitor/ },
    { name: 'Cached elements', pattern: /cachedElements/ },
    { name: 'updateDisplay method', pattern: /updateDisplay\(\)/ },
    { name: 'measureTimerUpdate call', pattern: /measureTimerUpdate/ }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(timerCode)) {
      console.log(`✓ ${check.name} found`);
    } else {
      console.log(`✗ ${check.name} NOT found`);
    }
  });
} catch (error) {
  console.error('✗ Error reading focus timer:', error.message);
}

// Test 4: Verify StorageService optimization
console.log('\n=== Test 4: StorageService Optimization ===');
try {
  const fs = require('fs');
  const path = require('path');
  const storagePath = path.join(__dirname, '../js/storageService.js');
  const storageCode = fs.readFileSync(storagePath, 'utf8');
  
  const checks = [
    { name: 'Performance monitor parameter', pattern: /constructor.*performanceMonitor/ },
    { name: 'measureStorage in save', pattern: /measureStorage.*save/ },
    { name: 'measureStorage in load', pattern: /measureStorage.*load/ }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(storageCode)) {
      console.log(`✓ ${check.name} found`);
    } else {
      console.log(`✗ ${check.name} NOT found`);
    }
  });
} catch (error) {
  console.error('✗ Error reading storage service:', error.message);
}

// Test 5: Verify TaskList optimization
console.log('\n=== Test 5: TaskList Render Optimization ===');
try {
  const fs = require('fs');
  const path = require('path');
  const taskListPath = path.join(__dirname, '../js/taskList.js');
  const taskListCode = fs.readFileSync(taskListPath, 'utf8');
  
  const checks = [
    { name: 'DocumentFragment usage', pattern: /DocumentFragment/ },
    { name: 'Optimized empty state check', pattern: /innerHTML !== '<p class="empty-state">/ }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(taskListCode)) {
      console.log(`✓ ${check.name} found`);
    } else {
      console.log(`✗ ${check.name} NOT found`);
    }
  });
} catch (error) {
  console.error('✗ Error reading task list:', error.message);
}

// Test 6: Verify QuickLinks optimization
console.log('\n=== Test 6: QuickLinks Render Optimization ===');
try {
  const fs = require('fs');
  const path = require('path');
  const quickLinksPath = path.join(__dirname, '../js/quickLinks.js');
  const quickLinksCode = fs.readFileSync(quickLinksPath, 'utf8');
  
  const checks = [
    { name: 'DocumentFragment usage', pattern: /DocumentFragment/ },
    { name: 'Optimized empty state check', pattern: /innerHTML !== '<p class="empty-state">/ }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(quickLinksCode)) {
      console.log(`✓ ${check.name} found`);
    } else {
      console.log(`✗ ${check.name} NOT found`);
    }
  });
} catch (error) {
  console.error('✗ Error reading quick links:', error.message);
}

console.log('\n=== Verification Complete ===\n');

// Summary
const totalChecks = logs.filter(l => l.message.includes('✓') || l.message.includes('✗')).length;
const passedChecks = logs.filter(l => l.message.includes('✓')).length;
const failedChecks = logs.filter(l => l.message.includes('✗')).length;

console.log(`Total checks: ${totalChecks}`);
console.log(`Passed: ${passedChecks}`);
console.log(`Failed: ${failedChecks}`);

if (failedChecks === 0) {
  console.log('\n✓ All performance optimizations verified!');
  process.exit(0);
} else {
  console.log('\n✗ Some checks failed. Review the output above.');
  process.exit(1);
}
