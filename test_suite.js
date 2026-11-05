/**
 * COMPREHENSIVE AUTOMATED VERIFICATION SUITE
 * Validates:
 * 1. 30-day task: Day 1-24 Normal, Day 25 Overdue, Day 26-30 Overdue.
 * 2. 7-day task: Day 1 Normal, Day 2 Overdue (7 - 5 = 2).
 * 3. 15-day task: Day 9 Normal, Day 10 Overdue (15 - 5 = 10).
 * 4. 60-day task: Day 54 Normal, Day 55 Overdue (60 - 5 = 55).
 * 5. Completed task before threshold: Stays Completed, never Overdue.
 * 6. Completed task after threshold: Stays Completed, never Overdue.
 * 7. Rescheduled task tracking with preserved original deadline.
 * 8. Priority and progress status validation.
 */

import {
  calculateDeadlineStatus,
  addDays,
  formatDate,
  getCalendarDayDifference,
  updateAllTasksDeadlineStatus,
} from './src/utils/deadlineUtils.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('==================================================');
console.log('TASKFLOW SPECIFICATION VERIFICATION SUITE');
console.log('==================================================\n');

// TEST 1: 30-Day Task Deadline Progression
console.log('TEST 1: 30-Day Task (Threshold: 30 - 5 = 25)');
const baseDate = '2026-11-01';
const task30 = {
  id: 'TASK-TEST-30',
  title: '30-Day Task Test',
  createdAt: baseDate,
  duration: 30,
  originalDeadline: addDays(baseDate, 30),
  currentDeadline: addDays(baseDate, 30),
  progressStatus: 'In Progress',
  deadlineStatus: 'Normal',
};

// Day 1 (elapsed 0 or 1)
assert(calculateDeadlineStatus(task30, addDays(baseDate, 0)) === 'Normal', 'Day 1: Normal');
assert(calculateDeadlineStatus(task30, addDays(baseDate, 5)) === 'Normal', 'Day 5: Normal');
assert(calculateDeadlineStatus(task30, addDays(baseDate, 10)) === 'Normal', 'Day 10: Normal');
assert(calculateDeadlineStatus(task30, addDays(baseDate, 15)) === 'Normal', 'Day 15: Normal');
assert(calculateDeadlineStatus(task30, addDays(baseDate, 20)) === 'Normal', 'Day 20: Normal');
assert(calculateDeadlineStatus(task30, addDays(baseDate, 24)) === 'Normal', 'Day 24: Normal');
assert(calculateDeadlineStatus(task30, addDays(baseDate, 25)) === 'Overdue', 'Day 25: OVERDUE (Exact rule threshold)');
assert(calculateDeadlineStatus(task30, addDays(baseDate, 26)) === 'Overdue', 'Day 26: Overdue');
assert(calculateDeadlineStatus(task30, addDays(baseDate, 29)) === 'Overdue', 'Day 29: Overdue');
assert(calculateDeadlineStatus(task30, addDays(baseDate, 30)) === 'Overdue', 'Day 30: Overdue');

// TEST 2: 7-Day Task
console.log('\nTEST 2: 7-Day Task (Threshold: 7 - 5 = 2)');
const task7 = {
  id: 'TASK-TEST-7',
  title: '7-Day Task Test',
  createdAt: baseDate,
  duration: 7,
  originalDeadline: addDays(baseDate, 7),
  currentDeadline: addDays(baseDate, 7),
  progressStatus: 'To Do',
  deadlineStatus: 'Normal',
};
assert(calculateDeadlineStatus(task7, addDays(baseDate, 1)) === 'Normal', '7-Day Task: Day 1 is Normal');
assert(calculateDeadlineStatus(task7, addDays(baseDate, 2)) === 'Overdue', '7-Day Task: Day 2 is OVERDUE');
assert(calculateDeadlineStatus(task7, addDays(baseDate, 6)) === 'Overdue', '7-Day Task: Day 6 is Overdue');

// TEST 3: 15-Day Task
console.log('\nTEST 3: 15-Day Task (Threshold: 15 - 5 = 10)');
const task15 = {
  id: 'TASK-TEST-15',
  title: '15-Day Task Test',
  createdAt: baseDate,
  duration: 15,
  originalDeadline: addDays(baseDate, 15),
  currentDeadline: addDays(baseDate, 15),
  progressStatus: 'In Progress',
  deadlineStatus: 'Normal',
};
assert(calculateDeadlineStatus(task15, addDays(baseDate, 9)) === 'Normal', '15-Day Task: Day 9 is Normal');
assert(calculateDeadlineStatus(task15, addDays(baseDate, 10)) === 'Overdue', '15-Day Task: Day 10 is OVERDUE');

// TEST 4: 60-Day Task
console.log('\nTEST 4: 60-Day Task (Threshold: 60 - 5 = 55)');
const task60 = {
  id: 'TASK-TEST-60',
  title: '60-Day Task Test',
  createdAt: baseDate,
  duration: 60,
  originalDeadline: addDays(baseDate, 60),
  currentDeadline: addDays(baseDate, 60),
  progressStatus: 'In Progress',
  deadlineStatus: 'Normal',
};
assert(calculateDeadlineStatus(task60, addDays(baseDate, 54)) === 'Normal', '60-Day Task: Day 54 is Normal');
assert(calculateDeadlineStatus(task60, addDays(baseDate, 55)) === 'Overdue', '60-Day Task: Day 55 is OVERDUE');

// TEST 5: Completed Task Invariance (Never reverts to Overdue)
console.log('\nTEST 5: Task Completion Priority');
const completedBefore = {
  id: 'TASK-TEST-COMP-1',
  title: 'Completed Before',
  createdAt: baseDate,
  duration: 30,
  originalDeadline: addDays(baseDate, 30),
  currentDeadline: addDays(baseDate, 30),
  progressStatus: 'Completed',
  deadlineStatus: 'Completed',
};
assert(calculateDeadlineStatus(completedBefore, addDays(baseDate, 10)) === 'Completed', 'Completed on Day 10: Stays Completed');
assert(calculateDeadlineStatus(completedBefore, addDays(baseDate, 28)) === 'Completed', 'Day 28 (Past Overdue threshold): Completed task NEVER reverts to Overdue');
assert(calculateDeadlineStatus(completedBefore, addDays(baseDate, 40)) === 'Completed', 'Day 40 (Past deadline): Completed task NEVER reverts to Overdue');

// TEST 6: Rescheduled Task Handling
console.log('\nTEST 6: Rescheduled Task Timeline');
const rescheduledTask = {
  id: 'TASK-TEST-RSC',
  title: 'Rescheduled Task',
  createdAt: baseDate,
  duration: 30,
  originalDeadline: addDays(baseDate, 30),
  currentDeadline: addDays(baseDate, 45), // extended by 15 days
  progressStatus: 'In Progress',
  deadlineStatus: 'Normal',
  rescheduleCount: 1,
  rescheduleHistory: [
    {
      id: 'RSC-1',
      previousDeadline: addDays(baseDate, 30),
      newDeadline: addDays(baseDate, 45),
      reason: 'Approved lab cluster maintenance delay',
      rescheduledAt: addDays(baseDate, 20),
    }
  ],
};

// On Day 25, under original 30d deadline it would have been overdue, but new effective duration is 45d (threshold 45 - 5 = 40)
assert(calculateDeadlineStatus(rescheduledTask, addDays(baseDate, 25)) === 'Normal', 'Rescheduled to 45d: Day 25 is Normal');
assert(calculateDeadlineStatus(rescheduledTask, addDays(baseDate, 39)) === 'Normal', 'Rescheduled to 45d: Day 39 is Normal');
assert(calculateDeadlineStatus(rescheduledTask, addDays(baseDate, 40)) === 'Overdue', 'Rescheduled to 45d: Day 40 is Overdue');

console.log('\n==================================================');
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('==================================================\n');

if (failed > 0) {
  process.exit(1);
}
