# Technical Design Document: Productivity Dashboard

## Overview

The Productivity Dashboard is a client-side web application that provides time management and task organization tools. The application consists of four main components: a greeting display with current time/date, a 25-minute focus timer, a to-do list manager, and a quick links organizer. All data persistence is handled through the browser's Local Storage API, making the application fully functional without any backend infrastructure.

The design emphasizes simplicity, performance, and maintainability by using vanilla JavaScript, HTML, and CSS without external dependencies or frameworks. The architecture follows a component-based approach where each major feature is encapsulated in its own module with clear interfaces and responsibilities.

## Architecture

### System Architecture

The application follows a modular, component-based architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    Dashboard (Main)                      │
│  - Application initialization                            │
│  - Component coordination                                │
│  - Global state management                               │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┬──────────────┐
        │                 │                 │              │
┌───────▼────────┐ ┌──────▼──────┐ ┌───────▼──────┐ ┌────▼─────┐
│   Greeting     │ │    Focus    │ │   Task List  │ │  Quick   │
│   Display      │ │    Timer    │ │   Manager    │ │  Links   │
└───────┬────────┘ └──────┬──────┘ └───────┬──────┘ └────┬─────┘
        │                 │                 │              │
        │                 │                 │              │
        └─────────────────┴─────────────────┴──────────────┘
                          │
                ┌─────────▼──────────┐
                │  Storage Service   │
                │  (Local Storage)   │
                └────────────────────┘
```

### Component Responsibilities

**Dashboard (Main Controller)**
- Initializes all components on page load
- Coordinates inter-component communication if needed
- Manages global application state
- Handles error boundaries

**Greeting Display Component**
- Displays current time in 12-hour format
- Displays current date with day of week
- Updates time every second
- Determines and displays time-based greeting

**Focus Timer Component**
- Manages 25-minute countdown timer
- Handles start, stop, and reset operations
- Updates display every second when active
- Signals completion when timer reaches zero

**Task List Manager Component**
- Creates, reads, updates, and deletes tasks
- Manages task completion status
- Persists all changes to Local Storage
- Renders task list UI

**Quick Links Component**
- Creates and deletes quick links
- Opens links in new tabs
- Persists all changes to Local Storage
- Renders links as clickable buttons

**Storage Service**
- Abstracts Local Storage API operations
- Provides consistent interface for data persistence
- Handles serialization/deserialization
- Manages storage keys and namespacing

### Data Flow

1. **Initialization Flow**: Dashboard → Storage Service → Components (load saved data)
2. **User Action Flow**: Component → Storage Service → Local Storage → Component (update UI)
3. **Timer Flow**: Focus Timer → Internal State → UI Update (every second)
4. **Greeting Flow**: Greeting Display → Date/Time API → UI Update (every second)

## Components and Interfaces

### Greeting Display Component

**Module**: `greetingDisplay.js`

**Public Interface**:
```javascript
class GreetingDisplay {
  constructor(containerElement)
  init()
  destroy()
}
```

**Responsibilities**:
- Render time in 12-hour format with AM/PM
- Render date with day of week, month, and day
- Update display every second using setInterval
- Calculate and display appropriate greeting based on current hour

**Internal State**:
- `intervalId`: Reference to setInterval for cleanup
- `containerElement`: DOM element for rendering

**Time-Based Greeting Logic**:
- 5:00 AM - 11:59 AM: "Good Morning"
- 12:00 PM - 4:59 PM: "Good Afternoon"
- 5:00 PM - 8:59 PM: "Good Evening"
- 9:00 PM - 4:59 AM: "Good Night"

### Focus Timer Component

**Module**: `focusTimer.js`

**Public Interface**:
```javascript
class FocusTimer {
  constructor(containerElement)
  init()
  start()
  stop()
  reset()
  destroy()
}
```

**Responsibilities**:
- Initialize with 25-minute duration (1500 seconds)
- Count down from current time when started
- Pause countdown when stopped
- Reset to 25 minutes when reset
- Display time in MM:SS format
- Signal completion when reaching zero

**Internal State**:
- `totalSeconds`: Total duration (1500)
- `remainingSeconds`: Current countdown value
- `isRunning`: Boolean flag for timer state
- `intervalId`: Reference to setInterval for cleanup
- `containerElement`: DOM element for rendering

**Timer Logic**:
- Uses setInterval with 1000ms interval
- Decrements remainingSeconds each tick
- Stops automatically at zero
- Displays completion message when finished

### Task List Manager Component

**Module**: `taskList.js`

**Public Interface**:
```javascript
class TaskList {
  constructor(containerElement, storageService)
  init()
  addTask(text)
  updateTask(taskId, newText)
  deleteTask(taskId)
  toggleTaskComplete(taskId)
  destroy()
}
```

**Responsibilities**:
- Manage array of task objects
- Create new tasks with unique IDs
- Update existing task text
- Toggle task completion status
- Delete tasks
- Persist all changes to storage
- Render task list UI with edit/delete controls

**Internal State**:
- `tasks`: Array of task objects
- `containerElement`: DOM element for rendering
- `storageService`: Reference to storage service

**Task Object Structure**:
```javascript
{
  id: string,           // Unique identifier (timestamp-based)
  text: string,         // Task description
  completed: boolean,   // Completion status
  createdAt: number     // Timestamp for ordering
}
```

**Validation Rules**:
- Task text cannot be empty or whitespace-only
- Task text must be trimmed before saving
- Empty submissions are rejected

### Quick Links Component

**Module**: `quickLinks.js`

**Public Interface**:
```javascript
class QuickLinks {
  constructor(containerElement, storageService)
  init()
  addLink(url, title)
  deleteLink(linkId)
  destroy()
}
```

**Responsibilities**:
- Manage array of link objects
- Create new links with unique IDs
- Delete links
- Open links in new tabs
- Persist all changes to storage
- Render links as clickable buttons

**Internal State**:
- `links`: Array of link objects
- `containerElement`: DOM element for rendering
- `storageService`: Reference to storage service

**Link Object Structure**:
```javascript
{
  id: string,      // Unique identifier (timestamp-based)
  url: string,     // Full URL including protocol
  title: string,   // Display name for the link
  createdAt: number // Timestamp for ordering
}
```

**URL Validation**:
- URLs must include protocol (http:// or https://)
- If protocol is missing, prepend "https://"
- Basic URL format validation

### Storage Service

**Module**: `storageService.js`

**Public Interface**:
```javascript
class StorageService {
  constructor(namespace)
  save(key, data)
  load(key)
  remove(key)
  clear()
}
```

**Responsibilities**:
- Abstract Local Storage API
- Handle JSON serialization/deserialization
- Provide namespaced keys to avoid conflicts
- Handle storage errors gracefully

**Storage Keys**:
- `productivity-dashboard:tasks`: Task list data
- `productivity-dashboard:links`: Quick links data

**Error Handling**:
- Catch and log storage quota exceeded errors
- Return null for missing keys
- Return empty arrays for corrupted data

## Data Models

### Task Model

```javascript
{
  id: string,           // Format: "task-{timestamp}-{random}"
  text: string,         // 1-500 characters, trimmed
  completed: boolean,   // Default: false
  createdAt: number     // Unix timestamp in milliseconds
}
```

**Constraints**:
- `id`: Must be unique, immutable after creation
- `text`: Required, non-empty after trimming, max 500 characters
- `completed`: Boolean, defaults to false
- `createdAt`: Set once at creation, used for ordering

### Link Model

```javascript
{
  id: string,      // Format: "link-{timestamp}-{random}"
  url: string,     // Valid URL with protocol
  title: string,   // 1-100 characters, trimmed
  createdAt: number // Unix timestamp in milliseconds
}
```

**Constraints**:
- `id`: Must be unique, immutable after creation
- `url`: Required, must be valid URL format
- `title`: Required, non-empty after trimming, max 100 characters
- `createdAt`: Set once at creation, used for ordering

### Timer State Model

```javascript
{
  totalSeconds: number,      // Always 1500 (25 minutes)
  remainingSeconds: number,  // 0 to 1500
  isRunning: boolean        // Timer active state
}
```

**Constraints**:
- `totalSeconds`: Constant value of 1500
- `remainingSeconds`: Integer between 0 and 1500 inclusive
- `isRunning`: Boolean flag

### Greeting State Model

```javascript
{
  currentTime: Date,    // Current date/time
  greeting: string,     // One of four greeting messages
  formattedTime: string, // "HH:MM:SS AM/PM"
  formattedDate: string  // "Day, Month Date"
}
```

**Constraints**:
- `greeting`: Must be one of: "Good Morning", "Good Afternoon", "Good Evening", "Good Night"
- `formattedTime`: 12-hour format with AM/PM
- `formattedDate`: Format: "Monday, January 1"


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified several areas where properties can be consolidated:

**Consolidations Made**:
1. Task persistence properties (4.2, 5.3, 6.4, 7.2, 8.1) can be unified into a single round-trip property
2. Link persistence properties (9.2, 9.4, 10.1) can be unified into a single round-trip property
3. Greeting time range properties (2.1-2.4) test the same behavior across different ranges - combined into one property with multiple ranges
4. Task completion toggle properties (6.1, 6.3) test the same mechanism - combined into one bidirectional property
5. Display properties for tasks (7.3, 8.2) and links (10.2) are covered by the core CRUD operations

### Property 1: Time Format Validation

*For any* valid Date object, when formatted for display, the output string must contain a time in 12-hour format (1-12), minutes (00-59), seconds (00-59), and an AM/PM indicator.

**Validates: Requirements 1.1**

### Property 2: Date Format Validation

*For any* valid Date object, when formatted for display, the output string must contain the day of week name, month name, and day of month number.

**Validates: Requirements 1.2**

### Property 3: Greeting Correctness

*For any* hour of the day (0-23), the greeting function must return "Good Morning" for hours 5-11, "Good Afternoon" for hours 12-16, "Good Evening" for hours 17-20, and "Good Night" for hours 21-4.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

### Property 4: Timer Stop Preserves State

*For any* timer state with remaining seconds between 0 and 1500, stopping the timer must preserve the exact remaining seconds value.

**Validates: Requirements 3.3**

### Property 5: Timer Reset Returns to Initial State

*For any* timer state with any remaining seconds value, resetting the timer must set remaining seconds to exactly 1500.

**Validates: Requirements 3.4**

### Property 6: Timer Display Format

*For any* number of remaining seconds between 0 and 1500, the formatted display must match the pattern MM:SS where MM is 00-25 and SS is 00-59.

**Validates: Requirements 3.6**

### Property 7: Valid Task Creation

*For any* non-empty, non-whitespace string, adding it as a task must result in the task list length increasing by exactly one.

**Validates: Requirements 4.1**

### Property 8: Task Persistence Round-Trip

*For any* task object, saving it to storage and then loading from storage must produce an equivalent task object with the same id, text, completed status, and createdAt timestamp.

**Validates: Requirements 4.2, 5.3, 6.4, 7.2, 8.1, 8.2**

### Property 9: Task Creation Order Preservation

*For any* sequence of task additions, the displayed task list must maintain the order in which tasks were created, with earlier tasks appearing before later tasks.

**Validates: Requirements 4.3**

### Property 10: Whitespace Task Rejection

*For any* string composed entirely of whitespace characters (spaces, tabs, newlines), attempting to add it as a task must not change the task list length.

**Validates: Requirements 4.4, 5.4**

### Property 11: Task Edit Preserves Identity

*For any* existing task and any valid new text, updating the task text must preserve the task's id, completed status, and createdAt timestamp while changing only the text field.

**Validates: Requirements 5.2**

### Property 12: Task Completion Toggle

*For any* task, toggling its completion status must change the completed field from false to true or from true to false, while preserving all other task properties.

**Validates: Requirements 6.1, 6.3**

### Property 13: Completed Task Visual Indication

*For any* task with completed status set to true, the rendered HTML must include a visual indicator (such as a CSS class, strikethrough, or checkmark) that distinguishes it from incomplete tasks.

**Validates: Requirements 6.2**

### Property 14: Task Deletion Removes from List

*For any* task list and any task in that list, deleting the task must result in a task list that does not contain that task's id.

**Validates: Requirements 7.1, 7.3**

### Property 15: Link Persistence Round-Trip

*For any* link object, saving it to storage and then loading from storage must produce an equivalent link object with the same id, url, title, and createdAt timestamp.

**Validates: Requirements 9.2, 9.4, 10.1, 10.2**

### Property 16: Valid Link Creation

*For any* valid URL string, adding it as a link must result in the links list length increasing by exactly one.

**Validates: Requirements 9.1**

### Property 17: Link Click Opens Correct URL

*For any* link object with a URL, clicking the link must trigger opening that exact URL in a new browser tab.

**Validates: Requirements 9.3**

### Property 18: Link Deletion Removes from List

*For any* links list and any link in that list, deleting the link must result in a links list that does not contain that link's id.

**Validates: Requirements 9.4**

### Property 19: Links Rendered as Clickable Elements

*For any* link object, the rendered HTML must include a clickable element (button or anchor tag) with the link's title as display text.

**Validates: Requirements 9.5**

## Error Handling

### Storage Errors

**Quota Exceeded**:
- Catch `QuotaExceededError` when writing to Local Storage
- Display user-friendly error message: "Storage limit reached. Please delete some items."
- Log error details to console for debugging
- Prevent data loss by keeping in-memory state intact

**Corrupted Data**:
- Wrap JSON.parse in try-catch blocks
- If parsing fails, log error and return empty array/object
- Display notification: "Saved data could not be loaded. Starting fresh."
- Clear corrupted data from storage to prevent repeated errors

**Storage Unavailable**:
- Check for Local Storage availability on initialization
- If unavailable (private browsing, disabled), show warning message
- Fall back to in-memory storage (data lost on page refresh)
- Display persistent banner: "Storage disabled. Changes will not be saved."

### Timer Errors

**Invalid State Transitions**:
- Prevent starting an already running timer (no-op)
- Prevent stopping an already stopped timer (no-op)
- Validate remaining seconds is always between 0 and 1500
- Reset to valid state if corruption detected

**Interval Cleanup**:
- Always clear intervals in destroy() method
- Clear interval when timer reaches zero
- Clear interval on stop() to prevent memory leaks
- Store interval ID for proper cleanup

### Input Validation Errors

**Task Input**:
- Trim whitespace before validation
- Reject empty strings after trimming
- Enforce maximum length (500 characters)
- Sanitize HTML to prevent XSS attacks
- Display inline error message for invalid input

**Link Input**:
- Validate URL format using URL constructor
- Prepend "https://" if protocol missing
- Reject invalid URL formats with error message
- Enforce maximum title length (100 characters)
- Sanitize HTML in title display

### Component Initialization Errors

**Missing DOM Elements**:
- Check for container element existence in constructor
- Throw descriptive error if element not found
- Provide clear error message with expected element ID
- Fail fast to prevent silent failures

**Duplicate Initialization**:
- Track initialization state with boolean flag
- Prevent multiple init() calls on same instance
- Log warning if re-initialization attempted
- Clean up previous state before re-initializing

## Testing Strategy

### Overview

The testing strategy employs a dual approach combining unit tests for specific examples and edge cases with property-based tests for universal correctness guarantees. This ensures both concrete behavior validation and comprehensive input coverage.

### Property-Based Testing

**Framework**: fast-check (JavaScript property-based testing library)

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with feature name and property number
- Tag format: `Feature: productivity-dashboard, Property {N}: {description}`

**Property Test Coverage**:

1. **Greeting Display Properties** (Properties 1-3)
   - Generate random Date objects across full range
   - Test time formatting, date formatting, and greeting logic
   - Cover all hours (0-23) and edge cases (midnight, noon)

2. **Focus Timer Properties** (Properties 4-6)
   - Generate random timer states (0-1500 seconds)
   - Test stop, reset, and display formatting
   - Cover boundary values (0, 1, 1499, 1500)

3. **Task Management Properties** (Properties 7-14)
   - Generate random task objects with varied text
   - Generate random whitespace strings for rejection tests
   - Test CRUD operations, ordering, and persistence
   - Cover empty lists, single items, and large lists

4. **Quick Links Properties** (Properties 15-19)
   - Generate random URLs (valid and edge cases)
   - Generate random link objects
   - Test CRUD operations and persistence
   - Cover various URL formats (http, https, with/without www)

**Generators**:
```javascript
// Example generators for property tests
const arbitraryTask = fc.record({
  id: fc.string(),
  text: fc.string(1, 500),
  completed: fc.boolean(),
  createdAt: fc.integer()
});

const arbitraryWhitespace = fc.stringOf(
  fc.constantFrom(' ', '\t', '\n', '\r')
);

const arbitraryURL = fc.webUrl();

const arbitraryTimerSeconds = fc.integer(0, 1500);

const arbitraryHour = fc.integer(0, 23);
```

### Unit Testing

**Framework**: Jest or Vitest (modern JavaScript testing)

**Unit Test Focus Areas**:

1. **Specific Examples**
   - Timer initializes to 25 minutes (Requirement 3.1)
   - Timer starts from 25 minutes (Requirement 3.2)
   - Timer completion at zero (Requirement 3.5)
   - Time display updates every second (Requirement 1.3)
   - Empty storage displays empty list (Requirements 8.3, 10.3)

2. **Edge Cases**
   - Midnight and noon time formatting
   - Boundary hours for greetings (4:59 AM, 5:00 AM, etc.)
   - Timer at zero seconds
   - Maximum length task text (500 characters)
   - Maximum length link title (100 characters)
   - URLs with special characters

3. **Error Conditions**
   - Storage quota exceeded
   - Corrupted JSON in storage
   - Invalid URL formats
   - Missing DOM elements
   - Duplicate initialization attempts

4. **Integration Points**
   - Component initialization sequence
   - Storage service integration
   - DOM event handling
   - Interval cleanup on destroy

**Test Organization**:
```
tests/
├── unit/
│   ├── greetingDisplay.test.js
│   ├── focusTimer.test.js
│   ├── taskList.test.js
│   ├── quickLinks.test.js
│   └── storageService.test.js
├── properties/
│   ├── greetingDisplay.properties.test.js
│   ├── focusTimer.properties.test.js
│   ├── taskList.properties.test.js
│   └── quickLinks.properties.test.js
└── integration/
    └── dashboard.integration.test.js
```

### Testing Balance

**Unit Tests**: Focus on specific scenarios, edge cases, and error handling
- Approximately 30-40 unit tests covering concrete examples
- Fast execution (< 1 second total)
- Clear, descriptive test names

**Property Tests**: Focus on universal correctness across input space
- 19 property tests (one per correctness property)
- 100+ iterations each = 1900+ test cases
- Comprehensive input coverage through randomization

**Integration Tests**: Focus on component interaction
- Dashboard initialization
- Cross-component data flow
- Storage service integration
- End-to-end user workflows

### Manual Testing Checklist

**Browser Compatibility**:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (latest)

**Visual Design Verification**:
- [ ] Consistent color scheme (Requirement 13.1)
- [ ] Font sizes ≥ 14px (Requirement 13.2)
- [ ] Component separation (Requirement 13.3)
- [ ] Contrast ratios (Requirement 13.4)
- [ ] Hover/active states (Requirement 13.5)

**Performance Verification**:
- [ ] Initial load < 1 second (Requirement 12.1)
- [ ] Interaction response < 100ms (Requirement 12.2)
- [ ] Timer updates smoothly (Requirement 12.3)
- [ ] Storage operations < 100ms (Requirement 12.4)

**Accessibility**:
- [ ] Keyboard navigation works for all interactive elements
- [ ] Screen reader compatibility
- [ ] Focus indicators visible
- [ ] ARIA labels where appropriate

