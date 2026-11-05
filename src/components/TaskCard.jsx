import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Edit2,
  Trash2,
  RefreshCw,
  History,
  Check,
  BookOpen,
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import {
  getPriorityBadgeClasses,
  getProgressBadgeClasses,
  getDeadlineBadgeClasses,
} from '../utils/taskUtils';
import { getElapsedDays } from '../utils/deadlineUtils';
import RescheduleModal from './RescheduleModal';
import ConfirmationModal from './ConfirmationModal';

export default function TaskCard({
  task,
  onEdit,
  draggable = false,
  onDragStart,
  showActions = true,
}) {
  const { markTaskComplete, deleteTask, simulatedDate } = useTasks();
  const [showReschedule, setShowReschedule] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const elapsedDays = getElapsedDays(task, simulatedDate);
  const isOverdue = task.deadlineStatus === 'Overdue';
  const isCompleted = task.progressStatus === 'Completed';

  return (
    <>
      <div
        draggable={draggable}
        onDragStart={onDragStart}
        className={`group bg-white dark:bg-slate-900 rounded-2xl p-4 border transition-all duration-200 relative ${
          isOverdue
            ? 'border-red-300 dark:border-red-900/80 shadow-sm bg-gradient-to-br from-white via-white to-red-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-red-950/20'
            : isCompleted
            ? 'border-emerald-200/80 dark:border-emerald-900/40 opacity-90'
            : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-subtle hover:shadow-elevated'
        }`}
      >
        {/* Top Badges & Menu */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Priority Badge */}
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getPriorityBadgeClasses(task.priority)}`}>
              {task.priority}
            </span>

            {/* Deadline Status Badge - ONLY Normal, Overdue, Completed */}
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getDeadlineBadgeClasses(task.deadlineStatus)}`}>
              {task.deadlineStatus}
            </span>

            {/* Reschedule Badge if rescheduled */}
            {task.rescheduleCount > 0 && (
              <span 
                onClick={() => setShowReschedule(true)}
                className="cursor-pointer px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 flex items-center gap-1 hover:bg-amber-100"
                title={`Rescheduled ${task.rescheduleCount} time(s). Click to view history.`}
              >
                <History className="w-2.5 h-2.5" /> {task.rescheduleCount}x
              </span>
            )}
          </div>

          {/* Quick Menu */}
          {showActions && (
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-6 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-premium py-1 z-40 text-xs">
                    {!isCompleted && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          markTaskComplete(task.id);
                        }}
                        className="w-full px-3 py-1.5 text-left text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark Done
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowReschedule(true);
                      }}
                      className="w-full px-3 py-1.5 text-left text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Reschedule
                    </button>
                    {onEdit && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onEdit(task);
                        }}
                        className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="w-full px-3 py-1.5 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Course Name */}
        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-brand-600 dark:text-brand-400">
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{task.courseName}</span>
        </div>

        {/* Task Title */}
        <h4 className={`mt-1 text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 ${
          isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
        }`}>
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Overdue Specific Information (Section 5.1 & 6) */}
        {isOverdue && !isCompleted && (
          <div className="mt-3 p-2 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 text-xs">
            <div className="flex items-center justify-between text-rose-700 dark:text-rose-300 font-medium">
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> OVERDUE
              </span>
              <span>Elapsed: {elapsedDays} days</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 flex justify-between">
              <span>Duration: {task.duration}d</span>
              <span>Orig: {task.originalDeadline}</span>
            </div>
          </div>
        )}

        {/* Bottom Details & Deadlines */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{task.currentDeadline}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {!isCompleted ? (
              <button
                type="button"
                onClick={() => markTaskComplete(task.id)}
                className="px-2 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1"
                title="Mark as completed"
              >
                <Check className="w-3 h-3" /> Done
              </button>
            ) : (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <RescheduleModal
        isOpen={showReschedule}
        task={task}
        onClose={() => setShowReschedule(false)}
      />

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This task and its history will be permanently deleted.`}
        confirmText="Delete Task"
        isDanger={true}
        onConfirm={() => deleteTask(task.id)}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
