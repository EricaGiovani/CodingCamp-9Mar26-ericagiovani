# Testing Guide

## Running Tests

### Option 1: Automated Tests with Vitest (Recommended)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run all tests:
   ```bash
   npm test
   ```

3. Run tests in watch mode:
   ```bash
   npm run test:watch
   ```

4. Run tests with coverage:
   ```bash
   npm run test:coverage
   ```

### Option 2: Manual Browser Tests

If you don't have Node.js installed or prefer to test in the browser:

1. Open `tests/storageService.manual.test.html` in your web browser
2. Click "Run All Tests" button
3. View the test results displayed on the page

This manual test file tests all the core functionality of the StorageService without requiring any build tools.

## Test Structure

- `tests/setup.js` - Test environment setup (localStorage mock)
- `tests/unit/storageService.test.js` - Unit tests for StorageService
- `tests/storageService.manual.test.html` - Browser-based manual tests

## What's Being Tested

The StorageService tests cover:

1. **Constructor**: Default and custom namespaces, storage availability
2. **save()**: String/object/array serialization, namespacing, error handling
3. **load()**: Deserialization, missing keys, corrupted data handling
4. **remove()**: Key removal with namespacing
5. **clear()**: Clearing all namespaced keys while preserving others
6. **Namespacing**: Isolation between different namespaces
7. **Round-trip**: Data integrity through save/load cycles
8. **Error Handling**: Quota exceeded, corrupted data, unavailable storage
