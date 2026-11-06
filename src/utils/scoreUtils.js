/**
 * FRIENDS SCORE & LEADERBOARD UTILITIES
 * Calculates student productivity scores based on completed academic tasks.
 * Rules:
 * - Points awarded only for successfully completed tasks.
 * - Incomplete and Overdue tasks earn 0 points.
 * - Prevents duplicate points for the same task.
 * - Configurable by Administrator.
 */

import { getCalendarDayDifference } from './deadlineUtils';

export const STORAGE_KEYS_SCORE = {
  RULES: 'taskflow_scoring_rules',
  RESET_TIMESTAMP: 'taskflow_score_reset_timestamp',
};

// Default Admin-Configurable Scoring Rules
export const DEFAULT_SCORING_RULES = {
  basePoints: 50,
  pointsByPriority: {
    High: 100,
    Medium: 50,
    Low: 25,
  },
  requireOnTime: true, // Do not award points for overdue tasks
};

export function getStoredScoringRules() {
  const data = localStorage.getItem(STORAGE_KEYS_SCORE.RULES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS_SCORE.RULES, JSON.stringify(DEFAULT_SCORING_RULES));
    return DEFAULT_SCORING_RULES;
  }
  try {
    return { ...DEFAULT_SCORING_RULES, ...JSON.parse(data) };
  } catch (e) {
    console.error('Error parsing scoring rules', e);
    return DEFAULT_SCORING_RULES;
  }
}

export function saveStoredScoringRules(rules) {
  localStorage.setItem(STORAGE_KEYS_SCORE.RULES, JSON.stringify(rules));
}

export function getStoredScoreResetTimestamp() {
  return localStorage.getItem(STORAGE_KEYS_SCORE.RESET_TIMESTAMP) || null;
}

export function setStoredScoreResetTimestamp(timestamp) {
  if (timestamp) {
    localStorage.setItem(STORAGE_KEYS_SCORE.RESET_TIMESTAMP, timestamp);
  } else {
    localStorage.removeItem(STORAGE_KEYS_SCORE.RESET_TIMESTAMP);
  }
}

/**
 * Checks if a task is eligible for completion points
 * Must be completed AND not overdue at time of completion.
 */
export function isTaskEligibleForPoints(task) {
  if (task.progressStatus !== 'Completed') {
    return false; // Incomplete tasks earn 0 points
  }

  // Calculate elapsed days at completion
  const completionDate = task.completedAt || task.createdAt;
  const elapsedAtCompletion = getCalendarDayDifference(task.createdAt, completionDate);
  const duration = Number(task.duration) || 30;
  const threshold = duration - 5;

  // Requirement: Do not award points for overdue tasks
  // (Overdue threshold is duration - 5, or past currentDeadline)
  if (elapsedAtCompletion >= threshold) {
    return false;
  }

  // Also check if completion date was past the final deadline
  if (task.currentDeadline && completionDate > task.currentDeadline) {
    return false;
  }

  return true;
}

/**
 * Calculate points for an individual task
 */
export function getTaskPoints(task, rules = DEFAULT_SCORING_RULES) {
  if (!isTaskEligibleForPoints(task)) {
    return 0;
  }

  const priority = task.priority || 'Medium';
  const points = rules.pointsByPriority?.[priority] ?? rules.basePoints ?? 50;
  return Number(points);
}

/**
 * Calculates a specific user's total score from their assigned tasks
 */
export function calculateUserScore(userId, tasks, rules = DEFAULT_SCORING_RULES, resetTimestamp = null) {
  if (!userId || !tasks || !tasks.length) {
    return {
      totalScore: 0,
      completedEligibleCount: 0,
      completedOverdueCount: 0,
      totalCompleted: 0,
    };
  }

  const userTasks = tasks.filter(t => t.assignedUserId === userId);
  let totalScore = 0;
  let completedEligibleCount = 0;
  let completedOverdueCount = 0;
  let totalCompleted = 0;

  // Track task IDs to strictly guarantee no duplicate points
  const evaluatedTaskIds = new Set();

  userTasks.forEach(task => {
    if (evaluatedTaskIds.has(task.id)) return;
    evaluatedTaskIds.add(task.id);

    if (task.progressStatus === 'Completed') {
      totalCompleted++;

      // Check if completion was after reset timestamp
      if (resetTimestamp && task.completedAt && task.completedAt < resetTimestamp) {
        return;
      }

      if (isTaskEligibleForPoints(task)) {
        completedEligibleCount++;
        totalScore += getTaskPoints(task, rules);
      } else {
        completedOverdueCount++;
      }
    }
  });

  return {
    totalScore,
    completedEligibleCount,
    completedOverdueCount,
    totalCompleted,
  };
}

/**
 * Generates the complete leaderboard for registered users
 * Sorted in descending order of total scores.
 */
export function calculateLeaderboard(users, tasks, rules = DEFAULT_SCORING_RULES, resetTimestamp = null) {
  if (!users || !users.length) return [];

  // Exclude admin if desired, or include students (users with role === 'User')
  // We include all registered students/users so all classmates compete
  const studentUsers = users.filter(u => u.role === 'User' || !u.isPrimaryAdmin);

  const leaderboardData = studentUsers.map(user => {
    const stats = calculateUserScore(user.id, tasks, rules, resetTimestamp);
    return {
      userId: user.id,
      username: user.username || user.email.split('@')[0],
      fullName: user.fullName,
      email: user.email,
      department: user.department || 'General',
      avatar: user.avatar,
      totalScore: stats.totalScore,
      completedEligibleCount: stats.completedEligibleCount,
      completedOverdueCount: stats.completedOverdueCount,
      totalCompleted: stats.totalCompleted,
    };
  });

  // Sort descending by total score, then by completed on-time tasks, then by name
  leaderboardData.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    if (b.completedEligibleCount !== a.completedEligibleCount) {
      return b.completedEligibleCount - a.completedEligibleCount;
    }
    return a.fullName.localeCompare(b.fullName);
  });

  // Assign ranks with 1-based index
  return leaderboardData.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}
