import React, { useState, useEffect } from 'react';
import { CheckSquare, X, Calendar, AlertCircle } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { formatDate, addDays } from '../utils/deadlineUtils';

export default function TaskModal({ isOpen, taskToEdit = null, onClose }) {
  const { createTask, updateTask, simulatedDate } = useTasks();
  const { users, currentUser, isAdmin } = useAuth();

  const isEditMode = !!taskToEdit;
  const today = simulatedDate || formatDate(new Date());

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseName, setCourseName] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [progressStatus, setProgressStatus] = useState('To Do');
  const [durationPreset, setDurationPreset] = useState('30');
  const [customDuration, setCustomDuration] = useState('30');
  const [createdAt, setCreatedAt] = useState(today);
  const [error, setError] = useState('');

  // Populate fields if in edit mode
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setCourseName(taskToEdit.courseName || '');
      setAssignedUserId(taskToEdit.assignedUserId || currentUser?.id || '');
      setPriority(taskToEdit.priority || 'Medium');
      setProgressStatus(taskToEdit.progressStatus || 'To Do');
      setCreatedAt(taskToEdit.createdAt || today);
      const dur = String(taskToEdit.duration || 30);
      if (['7', '15', '30', '60'].includes(dur)) {
        setDurationPreset(dur);
      } else {
        setDurationPreset('custom');
        setCustomDuration(dur);
      }
    } else {
      // Create mode defaults
      setTitle('');
      setDescription('');
      setCourseName('');
      setAssignedUserId(currentUser?.id || '');
      setPriority('Medium');
      setProgressStatus('To Do');
      setDurationPreset('30');
      setCustomDuration('30');
      setCreatedAt(today);
    }
    setError('');
  }, [taskToEdit, isOpen, currentUser, today]);

  if (!isOpen) return null;

  const effectiveDuration = durationPreset === 'custom' ? Number(customDuration) || 1 : Number(durationPreset);
  const calculatedDeadline = addDays(createdAt, effectiveDuration);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Task Title is required.');
      return;
    }

    if (!courseName.trim()) {
      setError('Course Name is required.');
      return;
    }

    const assignedTo = isAdmin ? assignedUserId || currentUser?.id : currentUser?.id;
    if (!assignedTo) {
      setError('Please assign the task to a valid student/user.');
      return;
    }

    if (effectiveDuration <= 0) {
      setError('Task duration must be at least 1 day.');
      return;
    }

    try {
      if (isEditMode) {
        updateTask(taskToEdit.id, {
          title: title.trim(),
          description: description.trim(),
          courseName: courseName.trim(),
          assignedUserId: assignedTo,
          priority,
          progressStatus,
          duration: effectiveDuration,
        });
      } else {
        createTask({
          title: title.trim(),
          description: description.trim(),
          courseName: courseName.trim(),
          assignedUserId: assignedTo,
          priority,
          progressStatus,
          createdAt,
          duration: effectiveDuration,
          originalDeadline: calculatedDeadline,
        });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Error saving task.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-premium border border-slate-200 dark:border-slate-800 p-6 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {isEditMode ? 'Edit Task Details' : 'Create New Task'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 flex-1 overflow-y-auto pr-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs border border-rose-200 dark:border-rose-900/60 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement Neural Network Optimization"
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Course Name *
              </label>
              <input
                type="text"
                required
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g. CS510 Machine Learning"
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-slate-900 dark:text-white"
              />
            </div>

            {isAdmin ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assign to User *
                </label>
                <select
                  value={assignedUserId}
                  onChange={(e) => setAssignedUserId(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-slate-900 dark:text-white"
                >
                  <option value="">Select Student / User</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.role}) - {u.email}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Owner
                </label>
                <input
                  type="text"
                  disabled
                  value={`${currentUser?.fullName} (You)`}
                  className="w-full px-3.5 py-2 text-sm bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-500 cursor-not-allowed"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline project specifications, milestone requirements, or rubric details..."
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* Duration Selection (Section 6.4: 7, 15, 30, 60 or Custom) */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Task Duration & Automatic Overdue Threshold
            </label>
            <div className="grid grid-cols-5 gap-2">
              {['7', '15', '30', '60'].map(days => (
                <button
                  type="button"
                  key={days}
                  onClick={() => setDurationPreset(days)}
                  className={`py-1.5 px-2 text-xs font-medium rounded-lg border text-center transition-all ${
                    durationPreset === days
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {days} Days
                </button>
              ))}
              <button
                type="button"
                onClick={() => setDurationPreset('custom')}
                className={`py-1.5 px-2 text-xs font-medium rounded-lg border text-center transition-all ${
                  durationPreset === 'custom'
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Custom
              </button>
            </div>

            {durationPreset === 'custom' && (
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  placeholder="Enter custom duration in days"
                  className="w-32 px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none"
                />
                <span className="text-xs text-slate-500">Days</span>
              </div>
            )}

            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
              <span>Automatic Overdue Threshold: <strong>Day {Math.max(0, effectiveDuration - 5)}</strong> onwards</span>
              <span>Deadline: <strong className="font-mono text-slate-800 dark:text-slate-200">{calculatedDeadline}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-slate-900 dark:text-white"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Progress Status
              </label>
              <select
                value={progressStatus}
                onChange={(e) => setProgressStatus(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-slate-900 dark:text-white"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {!isEditMode && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Task Creation Date
              </label>
              <input
                type="date"
                value={createdAt}
                onChange={(e) => setCreatedAt(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-slate-900 dark:text-white"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Tip: You can set an earlier creation date (e.g., 25 days ago) to test the Day 25 Overdue rule!
              </p>
            </div>
          )}

          {/* Footer buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 rounded-xl shadow-sm transition-all"
            >
              {isEditMode ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
