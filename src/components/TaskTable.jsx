import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Edit2,
  Trash2,
  RefreshCw,
  Check,
  AlertCircle,
  History,
  CheckCircle2,
  Calendar,
  User,
  Download,
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import {
  getPriorityBadgeClasses,
  getProgressBadgeClasses,
  getDeadlineBadgeClasses,
  exportToCSV,
} from '../utils/taskUtils';
import { getElapsedDays } from '../utils/deadlineUtils';
import RescheduleModal from './RescheduleModal';
import ConfirmationModal from './ConfirmationModal';

export default function TaskTable({
  tasks,
  onEditTask,
  showUserColumn = true,
  title = 'Tasks',
  allowExport = true,
}) {
  const { markTaskComplete, deleteTask, updateTask, simulatedDate } = useTasks();
  const { users } = useAuth();

  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [progressFilter, setProgressFilter] = useState('ALL');
  const [deadlineFilter, setDeadlineFilter] = useState('ALL');
  const [userFilter, setUserFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt'); // 'createdAt' | 'deadline' | 'priority'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  const [selectedTaskForReschedule, setSelectedTaskForReschedule] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Extract unique courses for filtering
  const courses = useMemo(() => {
    const set = new Set(tasks.map(t => t.courseName).filter(Boolean));
    return Array.from(set);
  }, [tasks]);

  // Filtered & Sorted Tasks
  const processedTasks = useMemo(() => {
    let result = [...tasks];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        t =>
          t.title.toLowerCase().includes(q) ||
          t.courseName.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Dropdown filters
    if (courseFilter !== 'ALL') {
      result = result.filter(t => t.courseName === courseFilter);
    }
    if (priorityFilter !== 'ALL') {
      result = result.filter(t => t.priority === priorityFilter);
    }
    if (progressFilter !== 'ALL') {
      result = result.filter(t => t.progressStatus === progressFilter);
    }
    if (deadlineFilter !== 'ALL') {
      result = result.filter(t => t.deadlineStatus === deadlineFilter);
    }
    if (userFilter !== 'ALL') {
      result = result.filter(t => t.assignedUserId === userFilter);
    }

    // Sorting
    result.sort((a, b) => {
      let valA, valB;
      if (sortBy === 'deadline') {
        valA = new Date(a.currentDeadline || a.originalDeadline).getTime();
        valB = new Date(b.currentDeadline || b.originalDeadline).getTime();
      } else if (sortBy === 'priority') {
        const pMap = { High: 3, Medium: 2, Low: 1 };
        valA = pMap[a.priority] || 0;
        valB = pMap[b.priority] || 0;
      } else {
        // createdAt
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [tasks, search, courseFilter, priorityFilter, progressFilter, deadlineFilter, userFilter, sortBy, sortOrder]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleExport = () => {
    exportToCSV(
      processedTasks.map(t => ({
        ID: t.id,
        Title: t.title,
        Course: t.courseName,
        AssignedTo: users.find(u => u.id === t.assignedUserId)?.fullName || t.assignedUserId,
        Priority: t.priority,
        ProgressStatus: t.progressStatus,
        DeadlineStatus: t.deadlineStatus,
        CreatedAt: t.createdAt,
        DurationDays: t.duration,
        OriginalDeadline: t.originalDeadline,
        CurrentDeadline: t.currentDeadline,
        RescheduleCount: t.rescheduleCount || 0,
        CompletedAt: t.completedAt || 'N/A',
      })),
      `taskflow_${title.toLowerCase().replace(/\s+/g, '_')}.csv`
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle overflow-hidden">
      {/* Controls Bar */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, course, or task ID..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-slate-900 dark:text-white"
            />
          </div>

          {/* Export & Reset */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {allowExport && (
              <button
                onClick={handleExport}
                className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5"
                title="Export filtered records to CSV"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-medium">Filters:</span>
          </div>

          {/* Course filter */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 outline-none"
          >
            <option value="ALL">All Courses</option>
            {courses.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Progress status filter */}
          <select
            value={progressFilter}
            onChange={(e) => setProgressFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 outline-none"
          >
            <option value="ALL">All Progress</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Deadline status filter */}
          <select
            value={deadlineFilter}
            onChange={(e) => setDeadlineFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 outline-none"
          >
            <option value="ALL">All Deadlines</option>
            <option value="Normal">Normal</option>
            <option value="Overdue">Overdue</option>
            <option value="Completed">Completed</option>
          </select>

          {/* User filter for admin */}
          {showUserColumn && (
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="ALL">All Assigned Users</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.fullName}</option>
              ))}
            </select>
          )}

          {/* Reset Filters */}
          {(courseFilter !== 'ALL' || priorityFilter !== 'ALL' || progressFilter !== 'ALL' || deadlineFilter !== 'ALL' || userFilter !== 'ALL' || search) && (
            <button
              onClick={() => {
                setSearch('');
                setCourseFilter('ALL');
                setPriorityFilter('ALL');
                setProgressFilter('ALL');
                setDeadlineFilter('ALL');
                setUserFilter('ALL');
              }}
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline px-1.5 py-1"
            >
              Clear filters
            </button>
          )}

          <div className="ml-auto text-xs text-slate-400 font-mono">
            Showing {processedTasks.length} of {tasks.length}
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 select-none">
            <tr>
              <th className="py-3 px-4 font-semibold">Task ID & Course</th>
              <th className="py-3 px-4 font-semibold">Title & Description</th>
              {showUserColumn && (
                <th className="py-3 px-4 font-semibold">Assigned Student</th>
              )}
              <th 
                onClick={() => toggleSort('priority')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-700 dark:hover:text-slate-200"
              >
                <div className="flex items-center gap-1">
                  <span>Priority</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 font-semibold">Progress</th>
              <th className="py-3 px-4 font-semibold">Deadline Status</th>
              <th 
                onClick={() => toggleSort('deadline')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-700 dark:hover:text-slate-200"
              >
                <div className="flex items-center gap-1">
                  <span>Deadlines</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {processedTasks.length === 0 ? (
              <tr>
                <td colSpan={showUserColumn ? 8 : 7} className="py-12 text-center text-slate-400">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No tasks found matching your criteria</p>
                </td>
              </tr>
            ) : (
              processedTasks.map((task) => {
                const assignedUser = users.find(u => u.id === task.assignedUserId);
                const isOverdue = task.deadlineStatus === 'Overdue';
                const isCompleted = task.progressStatus === 'Completed';
                const elapsedDays = getElapsedDays(task, simulatedDate);

                return (
                  <tr
                    key={task.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      isOverdue
                        ? 'bg-rose-50/30 dark:bg-rose-950/20'
                        : ''
                    }`}
                  >
                    {/* Task ID & Course */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {task.id}
                      </span>
                      <p className="text-[11px] font-medium text-brand-600 dark:text-brand-400 truncate max-w-[130px]">
                        {task.courseName}
                      </p>
                    </td>

                    {/* Title & Description */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {task.title}
                      </div>
                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                      {task.rescheduleCount > 0 && (
                        <span 
                          onClick={() => setSelectedTaskForReschedule(task)}
                          className="cursor-pointer inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 hover:underline"
                        >
                          <History className="w-2.5 h-2.5" /> Rescheduled {task.rescheduleCount} time(s)
                        </span>
                      )}
                    </td>

                    {/* Assigned User */}
                    {showUserColumn && (
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <img
                            src={assignedUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(assignedUser?.fullName || 'User')}`}
                            alt=""
                            className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                          />
                          <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                            {assignedUser?.fullName || 'Unassigned'}
                          </span>
                        </div>
                      </td>
                    )}

                    {/* Priority */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${getPriorityBadgeClasses(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>

                    {/* Progress Status (Interactive dropdown) */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={task.progressStatus}
                        onChange={(e) => updateTask(task.id, { progressStatus: e.target.value })}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold border outline-none ${getProgressBadgeClasses(task.progressStatus)}`}
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>

                    {/* Deadline Status Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border w-fit ${getDeadlineBadgeClasses(task.deadlineStatus)}`}>
                          {task.deadlineStatus}
                        </span>
                        {isOverdue && !isCompleted && (
                          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium mt-0.5">
                            Elapsed: {elapsedDays}d / {task.duration}d
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Deadlines */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-xs">
                      <div>
                        <span className="text-slate-900 dark:text-slate-100 font-semibold">
                          {task.currentDeadline}
                        </span>
                      </div>
                      {task.currentDeadline !== task.originalDeadline && (
                        <div className="text-[10px] text-slate-400">
                          Orig: {task.originalDeadline}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isCompleted && (
                          <button
                            onClick={() => markTaskComplete(task.id)}
                            className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors"
                            title="Mark Completed"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedTaskForReschedule(task)}
                          className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg transition-colors"
                          title="Reschedule Deadline"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        {onEditTask && (
                          <button
                            onClick={() => onEditTask(task)}
                            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit Task"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setTaskToDelete(task)}
                          className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <RescheduleModal
        isOpen={!!selectedTaskForReschedule}
        task={selectedTaskForReschedule}
        onClose={() => setSelectedTaskForReschedule(null)}
      />

      <ConfirmationModal
        isOpen={!!taskToDelete}
        title="Delete Task"
        message={`Are you sure you want to permanently delete "${taskToDelete?.title}"?`}
        confirmText="Delete"
        isDanger={true}
        onConfirm={() => taskToDelete && deleteTask(taskToDelete.id)}
        onClose={() => setTaskToDelete(null)}
      />
    </div>
  );
}
