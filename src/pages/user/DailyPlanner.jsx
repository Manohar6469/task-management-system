import React, { useState, useMemo } from 'react';
import {
  ListTodo,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Check,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { formatDate, getElapsedDays } from '../../utils/deadlineUtils';
import { getPriorityBadgeClasses, getDeadlineBadgeClasses } from '../../utils/taskUtils';
import TaskModal from '../../components/TaskModal';
import RescheduleModal from '../../components/RescheduleModal';

export default function DailyPlanner() {
  const { currentUser } = useAuth();
  const { tasks, updateTask, markTaskComplete, simulatedDate } = useTasks();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'today' | 'overdue' | 'pending' | 'completed' | 'upcoming'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTaskForReschedule, setSelectedTaskForReschedule] = useState(null);

  const todayStr = simulatedDate || formatDate(new Date());

  // Filter tasks for this user
  const myTasks = useMemo(() => {
    return tasks.filter(t => t.assignedUserId === currentUser?.id);
  }, [tasks, currentUser]);

  // Section 5.3 Groups:
  // Today's tasks: tasks whose currentDeadline is today and not completed
  const todayTasks = useMemo(() => {
    return myTasks.filter(t => (t.currentDeadline === todayStr || t.originalDeadline === todayStr) && t.progressStatus !== 'Completed');
  }, [myTasks, todayStr]);

  // Overdue tasks
  const overdueTasks = useMemo(() => {
    return myTasks.filter(t => t.deadlineStatus === 'Overdue' && t.progressStatus !== 'Completed');
  }, [myTasks]);

  // Pending tasks (To Do)
  const pendingTasks = useMemo(() => {
    return myTasks.filter(t => t.progressStatus === 'To Do');
  }, [myTasks]);

  // Completed tasks
  const completedTasks = useMemo(() => {
    return myTasks.filter(t => t.progressStatus === 'Completed');
  }, [myTasks]);

  // Upcoming tasks: active tasks due after today
  const upcomingTasks = useMemo(() => {
    return myTasks.filter(t => {
      if (t.progressStatus === 'Completed' || t.deadlineStatus === 'Overdue') return false;
      const dl = t.currentDeadline || t.originalDeadline;
      return dl > todayStr;
    });
  }, [myTasks, todayStr]);

  const displayedList = useMemo(() => {
    switch (activeTab) {
      case 'today':
        return todayTasks;
      case 'overdue':
        return overdueTasks;
      case 'pending':
        return pendingTasks;
      case 'completed':
        return completedTasks;
      case 'upcoming':
        return upcomingTasks;
      case 'all':
      default:
        return myTasks;
    }
  }, [activeTab, myTasks, todayTasks, overdueTasks, pendingTasks, completedTasks, upcomingTasks]);

  const handleStatusChange = (taskId, newStatus) => {
    updateTask(taskId, { progressStatus: newStatus });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Today's Focus Date: {todayStr}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Daily Academic Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Plan your daily milestones and update coursework progress in real-time.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 rounded-xl shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Daily Task</span>
        </button>
      </div>

      {/* Categories Bar (Section 5.3) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setActiveTab('today')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            activeTab === 'today'
              ? 'bg-brand-50 border-brand-500 dark:bg-brand-950/60 dark:border-brand-600 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">Due Today</span>
            <span className="font-mono text-base font-bold text-slate-900 dark:text-white">{todayTasks.length}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Due {todayStr}</p>
        </button>

        <button
          onClick={() => setActiveTab('overdue')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            activeTab === 'overdue'
              ? 'bg-rose-50 border-rose-500 dark:bg-rose-950/60 dark:border-rose-600 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Overdue</span>
            <span className="font-mono text-base font-bold text-rose-600 dark:text-rose-400">{overdueTasks.length}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Requires immediate action</p>
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            activeTab === 'pending'
              ? 'bg-slate-100 border-slate-400 dark:bg-slate-800 dark:border-slate-600 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pending (To Do)</span>
            <span className="font-mono text-base font-bold text-slate-900 dark:text-white">{pendingTasks.length}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting kick-off</p>
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            activeTab === 'upcoming'
              ? 'bg-indigo-50 border-indigo-500 dark:bg-indigo-950/60 dark:border-indigo-600 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Upcoming</span>
            <span className="font-mono text-base font-bold text-slate-900 dark:text-white">{upcomingTasks.length}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Future deadlines</p>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`p-3 rounded-2xl border text-left transition-all col-span-2 sm:col-span-1 ${
            activeTab === 'completed'
              ? 'bg-emerald-50 border-emerald-500 dark:bg-emerald-950/60 dark:border-emerald-600 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Completed</span>
            <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">{completedTasks.length}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Delivered coursework</p>
        </button>
      </div>

      {/* Task List (Clean, organized layout allowing direct progress update) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-subtle p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {activeTab === 'all' ? 'All Daily Planner Items' : `${activeTab.toUpperCase()} Tasks`} ({displayedList.length})
            </h3>
          </div>
          {activeTab !== 'all' && (
            <button
              onClick={() => setActiveTab('all')}
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
            >
              Show All
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
          {displayedList.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No tasks in this category.</p>
            </div>
          ) : (
            displayedList.map(task => {
              const isOverdue = task.deadlineStatus === 'Overdue';
              const isDone = task.progressStatus === 'Completed';
              const elapsed = getElapsedDays(task, simulatedDate);

              return (
                <div
                  key={task.id}
                  className={`py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    isOverdue && !isDone
                      ? 'bg-rose-50/40 dark:bg-rose-950/20 px-3 rounded-2xl my-1'
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Direct Quick Toggle Button */}
                    <button
                      onClick={() => handleStatusChange(task.id, isDone ? 'In Progress' : 'Completed')}
                      className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 dark:border-slate-600 hover:border-brand-500 text-transparent hover:text-brand-500'
                      }`}
                      title={isDone ? 'Mark In Progress' : 'Mark Completed'}
                    >
                      <Check className="w-4 h-4" />
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> {task.courseName}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getPriorityBadgeClasses(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getDeadlineBadgeClasses(task.deadlineStatus)}`}>
                          {task.deadlineStatus}
                        </span>
                        {task.rescheduleCount > 0 && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                            ({task.rescheduleCount}x rescheduled)
                          </span>
                        )}
                      </div>

                      <h4 className={`text-sm font-semibold text-slate-900 dark:text-white ${
                        isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''
                      }`}>
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {task.description}
                        </p>
                      )}

                      {/* Overdue Alert banner if overdue */}
                      {isOverdue && !isDone && (
                        <div className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Overdue: {elapsed} elapsed days of {task.duration} day duration</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side: Progress Status selector and Actions */}
                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                    <div className="text-right text-xs">
                      <span className="text-slate-400 block text-[10px]">Current Deadline</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {task.currentDeadline}
                      </span>
                    </div>

                    {/* Direct Progress Status Dropdown */}
                    <select
                      value={task.progressStatus}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className="px-2.5 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>

                    <button
                      onClick={() => setSelectedTaskForReschedule(task)}
                      className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/60 rounded-lg transition-colors"
                      title="Reschedule task deadline"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <RescheduleModal
        isOpen={!!selectedTaskForReschedule}
        task={selectedTaskForReschedule}
        onClose={() => setSelectedTaskForReschedule(null)}
      />
    </div>
  );
}
