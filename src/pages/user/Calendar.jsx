import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { formatDate, addDays } from '../../utils/deadlineUtils';
import TaskModal from '../../components/TaskModal';

export default function CalendarView() {
  const { currentUser } = useAuth();
  const { tasks, simulatedDate } = useTasks();

  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'day'
  const [currentDate, setCurrentDate] = useState(() => {
    return simulatedDate ? new Date(simulatedDate) : new Date();
  });

  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter tasks for logged-in user
  const myTasks = useMemo(() => {
    return tasks.filter(t => t.assignedUserId === currentUser?.id);
  }, [tasks, currentUser]);

  // Navigate Calendar
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') {
      next.setMonth(next.getMonth() - 1);
    } else if (viewMode === 'week') {
      next.setDate(next.getDate() - 7);
    } else {
      next.setDate(next.getDate() - 1);
    }
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') {
      next.setMonth(next.getMonth() + 1);
    } else if (viewMode === 'week') {
      next.setDate(next.getDate() + 7);
    } else {
      next.setDate(next.getDate() + 1);
    }
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(simulatedDate ? new Date(simulatedDate) : new Date());
  };

  // Helper to format month title
  const monthTitle = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Generate Days for Monthly Calendar Grid
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startingDayIndex = firstDay.getDay(); // 0 is Sunday
    const totalDays = lastDay.getDate();

    const days = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date: d, isCurrentMonth: false, dateStr: formatDate(d) });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, isCurrentMonth: true, dateStr: formatDate(d) });
    }

    // Next month padding to fill 35 or 42 cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false, dateStr: formatDate(d) });
    }

    return days;
  }, [currentDate]);

  // Generate Days for Weekly View (7 days)
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push({ date: d, dateStr: formatDate(d) });
    }
    return days;
  }, [currentDate]);

  // Tasks grouped by deadline date
  const tasksByDate = useMemo(() => {
    const map = {};
    myTasks.forEach(task => {
      const dateKey = task.currentDeadline || task.originalDeadline;
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(task);
    });
    return map;
  }, [myTasks]);

  // Visual indicators (Section 5.4: Normal, Overdue, Completed)
  const getTaskVisualBadge = (task) => {
    if (task.progressStatus === 'Completed') {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800';
    }
    if (task.deadlineStatus === 'Overdue') {
      return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800 font-semibold ring-1 ring-red-400';
    }
    return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800';
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Academic Calendar Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Displaying coursework deliverables mapped to their strict deadline target dates.
          </p>
        </div>

        {/* View Switcher & Action */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'day'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              Day
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Navigation Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {monthTitle}
          </h2>
          <button
            onClick={handleToday}
            className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>

        {/* Legend Indicators (Section 5.4) */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="text-slate-600 dark:text-slate-300">Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-slate-600 dark:text-slate-300 font-medium text-rose-600 dark:text-rose-400">Overdue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600 dark:text-slate-300">Completed</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-subtle overflow-hidden">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 text-center py-2.5 text-xs font-semibold text-slate-500 bg-slate-50 dark:bg-slate-800/40">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800">
            {monthDays.map((dayObj, idx) => {
              const dayTasks = tasksByDate[dayObj.dateStr] || [];
              const isToday = dayObj.dateStr === (simulatedDate || formatDate(new Date()));

              return (
                <div
                  key={idx}
                  className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors ${
                    !dayObj.isCurrentMonth
                      ? 'bg-slate-50/50 dark:bg-slate-950/40 opacity-40'
                      : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/30'
                  } ${isToday ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-semibold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                        isToday
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {dayObj.date.getDate()}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {dayTasks.length} task{dayTasks.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Tasks on this day */}
                  <div className="space-y-1 overflow-y-auto max-h-24">
                    {dayTasks.map(task => (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTaskForDetails(task)}
                        className={`p-1.5 rounded-lg text-[10px] border cursor-pointer truncate transition-transform hover:scale-[1.02] ${getTaskVisualBadge(task)}`}
                        title={`Click to view details: ${task.title} (${task.deadlineStatus})`}
                      >
                        <span className="font-bold mr-1">{task.courseName.split(' ')[0]}:</span>
                        <span>{task.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-subtle overflow-hidden">
          <div className="grid grid-cols-7 divide-x divide-slate-100 dark:divide-slate-800">
            {weekDays.map((dayObj, idx) => {
              const dayTasks = tasksByDate[dayObj.dateStr] || [];
              const isToday = dayObj.dateStr === (simulatedDate || formatDate(new Date()));

              return (
                <div key={idx} className="min-h-[350px] p-3 flex flex-col">
                  <div className="text-center pb-2 border-b border-slate-100 dark:border-slate-800 mb-3">
                    <p className="text-xs font-medium text-slate-400">
                      {dayObj.date.toLocaleDateString('default', { weekday: 'short' })}
                    </p>
                    <span className={`mt-1 inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                      isToday ? 'bg-brand-600 text-white' : 'text-slate-800 dark:text-white'
                    }`}>
                      {dayObj.date.getDate()}
                    </span>
                  </div>

                  <div className="space-y-2 flex-1 overflow-y-auto">
                    {dayTasks.map(task => (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTaskForDetails(task)}
                        className={`p-2 rounded-xl text-xs border cursor-pointer ${getTaskVisualBadge(task)}`}
                      >
                        <p className="font-bold text-[11px] truncate">{task.courseName}</p>
                        <p className="font-semibold mt-0.5">{task.title}</p>
                        <div className="mt-2 text-[10px] flex items-center justify-between">
                          <span>{task.priority}</span>
                          <span className="font-mono">{task.progressStatus}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAY VIEW */}
      {viewMode === 'day' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-subtle p-6 max-w-2xl mx-auto">
          <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Daily Milestone Schedule</span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              {currentDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
          </div>

          <div className="mt-4 space-y-3">
            {(tasksByDate[formatDate(currentDate)] || []).length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No task deadlines scheduled for this day.</p>
              </div>
            ) : (
              (tasksByDate[formatDate(currentDate)] || []).map(task => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskForDetails(task)}
                  className={`p-4 rounded-2xl border cursor-pointer hover:shadow-elevated transition-all ${getTaskVisualBadge(task)}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{task.courseName}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/30">
                      {task.deadlineStatus}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold mt-1 text-slate-900 dark:text-white">
                    {task.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {task.description}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Task Details / Edit Modal (Section 5.4: Clicking calendar task opens task details) */}
      <TaskModal
        isOpen={!!selectedTaskForDetails}
        taskToEdit={selectedTaskForDetails}
        onClose={() => setSelectedTaskForDetails(null)}
      />

      <TaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
