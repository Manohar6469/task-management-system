/**
 * DEADLINE TRACKING & STATUS UTILITIES
 * Implements strict rules specified in Section 6 & 7:
 * - Elapsed Days = Current Date - Task Creation Date
 * - Overdue Threshold = Task Duration - 5
 * - If progressStatus === "Completed" -> deadlineStatus = "Completed"
 * - Else if elapsedDays >= task.duration - 5 -> deadlineStatus = "Overdue"
 * - Else -> deadlineStatus = "Normal"
 * - Allowed statuses ONLY: "Normal", "Overdue", "Completed"
 * - Completed tasks NEVER revert to Overdue
 */

// Format date to YYYY-MM-DD
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Add days to a date string YYYY-MM-DD
export function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + Number(days));
  return formatDate(d);
}

// Difference in calendar days: endDate - startDate
export function getCalendarDayDifference(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  
  const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((utcEnd - utcStart) / msPerDay);
}

/**
 * Calculates current deadline status for a task
 * @param {Object} task
 * @param {string} currentDateStr - optional reference date YYYY-MM-DD (defaults to today)
 * @returns {string} "Normal" | "Overdue" | "Completed"
 */
export function calculateDeadlineStatus(task, currentDateStr = null) {
  // Rule 6.6: Task completion takes priority over all calculations
  if (task.progressStatus === 'Completed' || task.deadlineStatus === 'Completed') {
    return 'Completed';
  }

  const todayStr = currentDateStr || getSimulatedOrCurrentDate();
  
  // Calculate elapsed days from creation
  const elapsedDays = getCalendarDayDifference(task.createdAt, todayStr);
  
  // Effective duration
  // If task was rescheduled, currentDeadline may have shifted, recalculating total span from createdAt
  let duration = Number(task.duration) || 30;
  if (task.currentDeadline && task.createdAt) {
    const calculatedDuration = getCalendarDayDifference(task.createdAt, task.currentDeadline);
    if (calculatedDuration > 0) {
      duration = calculatedDuration;
    }
  }

  const threshold = duration - 5;

  // Rule 6.2: Main formula
  if (elapsedDays >= threshold) {
    return 'Overdue';
  }

  return 'Normal';
}

/**
 * Calculates elapsed days for display in Overdue Task section
 */
export function getElapsedDays(task, currentDateStr = null) {
  const todayStr = currentDateStr || getSimulatedOrCurrentDate();
  const diff = getCalendarDayDifference(task.createdAt, todayStr);
  return Math.max(0, diff);
}

/**
 * Calculates days remaining until current deadline (can be negative if past deadline)
 */
export function getRemainingDays(task, currentDateStr = null) {
  const todayStr = currentDateStr || getSimulatedOrCurrentDate();
  return getCalendarDayDifference(todayStr, task.currentDeadline || task.originalDeadline);
}

/**
 * Re-evaluates all tasks in an array and returns updated tasks
 */
export function updateAllTasksDeadlineStatus(tasks, currentDateStr = null) {
  const refDate = currentDateStr || getSimulatedOrCurrentDate();
  let hasChanges = false;

  const updatedTasks = tasks.map(task => {
    // If completed, never change to Overdue
    if (task.progressStatus === 'Completed') {
      if (task.deadlineStatus !== 'Completed') {
        hasChanges = true;
        return { ...task, deadlineStatus: 'Completed' };
      }
      return task;
    }

    const newStatus = calculateDeadlineStatus(task, refDate);
    if (task.deadlineStatus !== newStatus) {
      hasChanges = true;
      return { ...task, deadlineStatus: newStatus };
    }
    return task;
  });

  return { updatedTasks, hasChanges };
}

/**
 * Date simulation helper for verification and testing
 */
export const SIMULATED_DATE_KEY = 'taskflow_simulated_date';

export function getSimulatedOrCurrentDate() {
  const stored = localStorage.getItem(SIMULATED_DATE_KEY);
  if (stored) {
    return stored;
  }
  return formatDate(new Date());
}

export function setSimulatedDate(dateStr) {
  if (dateStr) {
    localStorage.setItem(SIMULATED_DATE_KEY, dateStr);
  } else {
    localStorage.removeItem(SIMULATED_DATE_KEY);
  }
}
