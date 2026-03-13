/**
 * Verification script for getGreeting() logic
 * This script tests all time ranges to verify the greeting logic is correct
 */

import { GreetingDisplay } from '../js/greetingDisplay.js';

// Create a mock container (not used for this verification)
const mockContainer = { innerHTML: '' };
const greetingDisplay = new GreetingDisplay(mockContainer);

console.log('Verifying getGreeting() implementation...\n');

// Test all 24 hours
const testCases = [
  // Good Night (9:00 PM - 4:59 AM)
  { hour: 0, expected: 'Good Night', label: 'Midnight' },
  { hour: 1, expected: 'Good Night', label: '1:00 AM' },
  { hour: 2, expected: 'Good Night', label: '2:00 AM' },
  { hour: 3, expected: 'Good Night', label: '3:00 AM' },
  { hour: 4, expected: 'Good Night', label: '4:00 AM' },
  
  // Good Morning (5:00 AM - 11:59 AM)
  { hour: 5, expected: 'Good Morning', label: '5:00 AM (boundary)' },
  { hour: 6, expected: 'Good Morning', label: '6:00 AM' },
  { hour: 7, expected: 'Good Morning', label: '7:00 AM' },
  { hour: 8, expected: 'Good Morning', label: '8:00 AM' },
  { hour: 9, expected: 'Good Morning', label: '9:00 AM' },
  { hour: 10, expected: 'Good Morning', label: '10:00 AM' },
  { hour: 11, expected: 'Good Morning', label: '11:00 AM' },
  
  // Good Afternoon (12:00 PM - 4:59 PM)
  { hour: 12, expected: 'Good Afternoon', label: 'Noon (boundary)' },
  { hour: 13, expected: 'Good Afternoon', label: '1:00 PM' },
  { hour: 14, expected: 'Good Afternoon', label: '2:00 PM' },
  { hour: 15, expected: 'Good Afternoon', label: '3:00 PM' },
  { hour: 16, expected: 'Good Afternoon', label: '4:00 PM' },
  
  // Good Evening (5:00 PM - 8:59 PM)
  { hour: 17, expected: 'Good Evening', label: '5:00 PM (boundary)' },
  { hour: 18, expected: 'Good Evening', label: '6:00 PM' },
  { hour: 19, expected: 'Good Evening', label: '7:00 PM' },
  { hour: 20, expected: 'Good Evening', label: '8:00 PM' },
  
  // Good Night (9:00 PM - 4:59 AM)
  { hour: 21, expected: 'Good Night', label: '9:00 PM (boundary)' },
  { hour: 22, expected: 'Good Night', label: '10:00 PM' },
  { hour: 23, expected: 'Good Night', label: '11:00 PM' },
];

let passed = 0;
let failed = 0;

testCases.forEach(({ hour, expected, label }) => {
  const testDate = new Date(2024, 0, 1, hour, 0, 0);
  const result = greetingDisplay.getGreeting(testDate);
  const status = result === expected ? '✓ PASS' : '✗ FAIL';
  
  if (result === expected) {
    passed++;
    console.log(`${status} - ${label}: "${result}"`);
  } else {
    failed++;
    console.log(`${status} - ${label}: Expected "${expected}", got "${result}"`);
  }
});

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(50)}`);

if (failed === 0) {
  console.log('\n✓ All tests passed! The getGreeting() implementation is correct.');
  console.log('\nRequirements validated:');
  console.log('  ✓ 2.1: Good Morning (5:00 AM - 11:59 AM)');
  console.log('  ✓ 2.2: Good Afternoon (12:00 PM - 4:59 PM)');
  console.log('  ✓ 2.3: Good Evening (5:00 PM - 8:59 PM)');
  console.log('  ✓ 2.4: Good Night (9:00 PM - 4:59 AM)');
} else {
  console.log('\n✗ Some tests failed. Please review the implementation.');
  process.exit(1);
}
