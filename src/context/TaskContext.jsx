import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getStoredTasks,
  saveStoredTasks,
  getStoredNotifications,
  saveStoredNotifications,
  getStoredCourses,
  saveStoredCourses,
} from '../utils/localStorage';
import {
  formatDate,
  addDays,
  calculateDeadlineStatus,
  updateAllTasksDeadlineStatus,
  getSimulatedOrCurrentDate,
  setSimulatedDate,
  getElapsedDays,
  getCalendarDayDifference,
} from '../utils/deadlineUtils';
import {
  generateTaskId,
  generateNotificationId,
  generateRescheduleId,
} from '../utils/taskUtils';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState(() => getStoredTasks());
  const [courses, setCourses] = useState(() => getStoredCourses());
  const [notifications, setNotifications] = useState(() => getStoredNotifications());
  const [simulatedDate, setSimulatedDateState] = useState(() => getSimulatedOrCurrentDate());

  // Helper to sync tasks to localStorage
  const syncTasks = useCallback((newTasks) => {
    setTasks(newTasks);
    saveStoredTasks(newTasks);
  }, []);

  // Helper to sync courses to localStorage
  const syncCourses = useCallback((newCourses) => {
    setCourses(newCourses);
    saveStoredCourses(newCourses);
  }, []);

  // Helper to sync notifications to localStorage
  const syncNotifications = useCallback((newNotifs) => {
    setNotifications(newNotifs);
    saveStoredNotifications(newNotifs);
  }, []);

  // Check and run automatic deadline status update across all tasks
  const evaluateDeadlines = useCallback((currentRefDate = null) => {
    const activeDate = currentRefDate || simulatedDate || formatDate(new Date());
    setTasks(prevTasks => {
      const { updatedTasks, hasChanges } = updateAllTasksDeadlineStatus(prevTasks, activeDate);
      if (hasChanges) {
        saveStoredTasks(updatedTasks);
        
        // Check for new overdue transitions to notify without duplication
        updatedTasks.forEach(task => {
          if (task.deadlineStatus === 'Overdue' && task.progressStatus !== 'Completed') {
            // Check if user already has an unread or existing overdue notification for this task
            setNotifications(prevNotifs => {
              const alreadyNotified = prevNotifs.some(
                n => n.taskId === task.id && n.type === 'deadline'
              );
              if (!alreadyNotified) {
                const notif = {
                  id: generateNotificationId(),
                  userId: task.assignedUserId,
                  title: 'Deadline Status: Overdue',
                  message: `Task "${task.title}" in ${task.courseName} is now OVERDUE (Threshold reached).`,
                  type: 'deadline',
                  taskId: task.id,
                  read: false,
                  createdAt: activeDate,
                };
                const next = [notif, ...prevNotifs];
                saveStoredNotifications(next);
                return next;
              }
              return prevNotifs;
            });
          }
        });

        return updatedTasks;
      }
      return prevTasks;
    });
  }, [simulatedDate]);

  // Run deadline evaluations on mount and on date change
  useEffect(() => {
    evaluateDeadlines(simulatedDate);
  }, [simulatedDate, evaluateDeadlines]);

  // COURSE MANAGEMENT (Primary Admin permissions)
  const createCourse = (courseData) => {
    const newCourse = {
      id: `COURSE-${Date.now().toString(36).toUpperCase()}`,
      code: courseData.code?.trim().toUpperCase() || 'CRS',
      name: courseData.name?.trim() || `${courseData.code} Course`,
      department: courseData.department?.trim() || 'General',
      description: courseData.description?.trim() || '',
      createdAt: formatDate(new Date()),
    };

    const updated = [newCourse, ...courses];
    syncCourses(updated);
    return newCourse;
  };

  const updateCourse = (courseId, updatedFields) => {
    const prevCourse = courses.find(c => c.id === courseId);
    const oldName = prevCourse?.name;
    const newName = updatedFields.name?.trim();

    const updatedCourses = courses.map(c => {
      if (c.id === courseId) {
        return { ...c, ...updatedFields };
      }
      return c;
    });
    syncCourses(updatedCourses);

    // If course name changed, cascade update to tasks referencing this course
    if (oldName && newName && oldName !== newName) {
      const updatedTasks = tasks.map(t => {
        if (t.courseName === oldName) {
          return { ...t, courseName: newName };
        }
        return t;
      });
      syncTasks(updatedTasks);
    }
  };

  const deleteCourse = (courseId) => {
    const updated = courses.filter(c => c.id !== courseId);
    syncCourses(updated);
  };

  // Create Task
  const createTask = (taskData) => {
    const today = simulatedDate || formatDate(new Date());
    const duration = Number(taskData.duration) || 30;
    const createdAt = taskData.createdAt || today;
    const originalDeadline = taskData.originalDeadline || addDays(createdAt, duration);
    const currentDeadline = originalDeadline;

    const newTask = {
      id: generateTaskId(),
      title: taskData.title.trim(),
      description: taskData.description?.trim() || '',
      courseName: taskData.courseName.trim(),
      assignedUserId: taskData.assignedUserId,
      priority: taskData.priority || 'Medium',
      progressStatus: taskData.progressStatus || 'To Do',
      deadlineStatus: 'Normal', // evaluated below
      createdAt: createdAt,
      duration: duration,
      originalDeadline: originalDeadline,
      currentDeadline: currentDeadline,
      completedAt: taskData.progressStatus === 'Completed' ? today : null,
      rescheduleCount: 0,
      rescheduleHistory: [],
    };

    // Evaluate initial deadline status strictly
    newTask.deadlineStatus = calculateDeadlineStatus(newTask, today);

    const updatedTasks = [newTask, ...tasks];
    syncTasks(updatedTasks);

    // Create assigned notification if assigned to user
    if (newTask.assignedUserId) {
      const notif = {
        id: generateNotificationId(),
        userId: newTask.assignedUserId,
        title: 'New Task Assigned',
        message: `You were assigned "${newTask.title}" for course ${newTask.courseName}.`,
        type: 'assignment',
        taskId: newTask.id,
        read: false,
        createdAt: today,
      };
      syncNotifications([notif, ...notifications]);
    }

    return newTask;
  };

  // Update Task
  const updateTask = (taskId, updatedFields) => {
    const today = simulatedDate || formatDate(new Date());

    const updatedTasks = tasks.map(task => {
      if (task.id !== taskId) return task;

      const merged = { ...task, ...updatedFields };

      // Section 6.6: If marked Completed
      if (updatedFields.progressStatus === 'Completed') {
        merged.progressStatus = 'Completed';
        merged.deadlineStatus = 'Completed';
        if (!merged.completedAt) {
          merged.completedAt = today;
        }

        // Section 6.6: Stop all deadline notifications for that task
        setNotifications(prevNotifs => {
          const filtered = prevNotifs.filter(
            n => !(n.taskId === taskId && n.type === 'deadline')
          );
          // Add completion notification
          const completionNotif = {
            id: generateNotificationId(),
            userId: merged.assignedUserId,
            title: 'Task Completed',
            message: `Task "${merged.title}" marked as Completed. Deadline tracking stopped.`,
            type: 'completion',
            taskId: merged.id,
            read: false,
            createdAt: today,
          };
          const next = [completionNotif, ...filtered];
          saveStoredNotifications(next);
          return next;
        });
      } else if (task.progressStatus === 'Completed' && updatedFields.progressStatus && updatedFields.progressStatus !== 'Completed') {
        merged.completedAt = null;
        merged.deadlineStatus = calculateDeadlineStatus(merged, today);
      } else {
        merged.deadlineStatus = calculateDeadlineStatus(merged, today);
      }

      return merged;
    });

    syncTasks(updatedTasks);
  };

  // Mark task completed (quick helper)
  const markTaskComplete = (taskId) => {
    updateTask(taskId, { progressStatus: 'Completed' });
  };

  // Delete Task
  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    syncTasks(updatedTasks);

    // Remove any orphaned notifications
    const updatedNotifs = notifications.filter(n => n.taskId !== taskId);
    syncNotifications(updatedNotifs);
  };

  // Reschedule Task (Section 7)
  const rescheduleTask = (taskId, newDeadline, reason) => {
    if (!newDeadline || !reason.trim()) {
      throw new Error('New deadline date and justification reason are required.');
    }

    const today = simulatedDate || formatDate(new Date());

    const updatedTasks = tasks.map(task => {
      if (task.id !== taskId) return task;

      const historyEntry = {
        id: generateRescheduleId(),
        previousDeadline: task.currentDeadline,
        newDeadline: newDeadline,
        reason: reason.trim(),
        rescheduledAt: today,
      };

      const updatedHistory = [historyEntry, ...(task.rescheduleHistory || [])];
      
      const rescheduledTask = {
        ...task,
        currentDeadline: newDeadline,
        rescheduleCount: (task.rescheduleCount || 0) + 1,
        rescheduleHistory: updatedHistory,
      };

      rescheduledTask.deadlineStatus = calculateDeadlineStatus(rescheduledTask, today);
      return rescheduledTask;
    });

    syncTasks(updatedTasks);

    const targetTask = tasks.find(t => t.id === taskId);
    if (targetTask) {
      const notif = {
        id: generateNotificationId(),
        userId: targetTask.assignedUserId,
        title: 'Task Rescheduled',
        message: `Task "${targetTask.title}" deadline rescheduled to ${newDeadline}.`,
        type: 'reschedule',
        taskId: taskId,
        read: false,
        createdAt: today,
      };
      syncNotifications([notif, ...notifications]);
    }
  };

  // Date Simulation Controls
  const updateSimulatedDate = (newDateStr) => {
    setSimulatedDate(newDateStr);
    const dateToUse = newDateStr || formatDate(new Date());
    setSimulatedDateState(dateToUse);
    evaluateDeadlines(dateToUse);
  };

  // Notification Operations
  const markNotificationAsRead = (notifId) => {
    const updated = notifications.map(n => (n.id === notifId ? { ...n, read: true } : n));
    syncNotifications(updated);
  };

  const markAllNotificationsAsRead = (userId) => {
    const updated = notifications.map(n => {
      if (!userId || n.userId === userId || n.userId === 'ALL') {
        return { ...n, read: true };
      }
      return n;
    });
    syncNotifications(updated);
  };

  const clearNotification = (notifId) => {
    const updated = notifications.filter(n => n.id !== notifId);
    syncNotifications(updated);
  };

  const clearAllNotifications = (userId) => {
    const updated = notifications.filter(n => userId && n.userId !== userId && n.userId !== 'ALL');
    syncNotifications(updated);
  };

  // User-scoped tasks helper
  const getUserTasks = useCallback((userId) => {
    return tasks.filter(t => t.assignedUserId === userId);
  }, [tasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        courses,
        notifications,
        simulatedDate,
        createCourse,
        updateCourse,
        deleteCourse,
        createTask,
        updateTask,
        deleteTask,
        markTaskComplete,
        rescheduleTask,
        evaluateDeadlines,
        updateSimulatedDate,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotification,
        clearAllNotifications,
        getUserTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
