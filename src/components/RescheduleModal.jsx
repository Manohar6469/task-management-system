import React, { useState } from 'react';
import { Calendar, Clock, AlertTriangle, History, ArrowRight, X } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { formatDate } from '../utils/deadlineUtils';

export default function RescheduleModal({ isOpen, task, onClose }) {
  const { rescheduleTask, simulatedDate } = useTasks();
  const [newDeadline, setNewDeadline] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !task) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!newDeadline) {
      setError('Please select a new requested deadline.');
      return;
    }

    if (!reason.trim()) {
      setError('A valid justification reason is required for rescheduling.');
      return;
    }

    try {
      rescheduleTask(task.id, newDeadline, reason);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to reschedule task.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-premium border border-slate-200 dark:border-slate-800 p-6 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Reschedule Task Deadline
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {task.courseName} • ID: {task.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Context Summary */}
        <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <h4 className="text-sm font-medium text-slate-900 dark:text-white">
            {task.title}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Original Deadline:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                {task.originalDeadline}
              </p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Current Deadline:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                {task.currentDeadline}
              </p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Attempts So Far:</span>
              <p className="font-semibold text-amber-600 dark:text-amber-400">
                {task.rescheduleCount || 0} times
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 flex-1 overflow-y-auto pr-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs border border-rose-200 dark:border-rose-900/60 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              New Requested Deadline *
            </label>
            <input
              type="date"
              required
              value={newDeadline}
              onChange={(e) => setNewDeadline(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-slate-900 dark:text-white"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Note: The original deadline ({task.originalDeadline}) will remain preserved for academic audit history.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Justification & Reason *
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain the academic justification or unforeseen circumstance necessitating this deadline extension..."
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* Reschedule History Timeline */}
          {task.rescheduleHistory && task.rescheduleHistory.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2.5">
                <History className="w-3.5 h-3.5 text-slate-400" />
                Rescheduling History Log ({task.rescheduleHistory.length})
              </h5>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {task.rescheduleHistory.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      <span className="font-mono">Log #{task.rescheduleHistory.length - idx}</span>
                      <span>Recorded: {item.rescheduledAt}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs text-slate-800 dark:text-slate-200">
                      <span>{item.previousDeadline}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="text-brand-600 dark:text-brand-400 font-semibold">{item.newDeadline}</span>
                    </div>
                    <p className="mt-1 text-slate-600 dark:text-slate-300 italic text-[11px]">
                      "{item.reason}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
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
              className="px-5 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" /> Save Rescheduled Deadline
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
