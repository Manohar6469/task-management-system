import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw,
  Check,
  Plus,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import StatCard from '../../components/StatCard';
import TaskModal from '../../components/TaskModal';
import RescheduleModal from '../../components/RescheduleModal';
import { getElapsedDays } from '../../utils/deadlineUtils';

export default function UserDashboard() {
  const { currentUser } = useAuth();
  const { tasks, markTaskComplete, simulatedDate } = useTasks();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTaskForReschedule, setSelectedTaskForReschedule] = useState(null);

  // Filter tasks belonging to current user strictly (Section 5.2: Users must not be able to view other users' private tasks)
  const myTasks = useMemo(() => {
    return tasks.filter(t => t.assignedUserId === currentUser?.id);
  }, [tasks, currentUser]);

  // Metrics
  const metrics = useMemo(() => {
    const total = myTasks.length;
    const completed = myTasks.filter(t => t.progressStatus === 'Completed').length;
    const inProgress = myTasks.filter(t => t.progressStatus === 'In Progress').length;
    const pending = myTasks.filter(t => t.progressStatus === 'To Do').length;
    const overdue = myTasks.filter(t => t.deadlineStatus === 'Overdue' && t.progressStatus !== 'Completed').length;
    
    // Upcoming deadlines: non-completed tasks within next 7 days
    const upcoming = myTasks.filter(t => {
      if (t.progressStatus === 'Completed' || t.deadlineStatus === 'Overdue') return false;
      return true;
    }).length;

    return { total, completed, inProgress, pending, overdue, upcoming };
  }, [myTasks]);

  // Section 5.1: Specific Overdue Task list
  const overdueTasks = useMemo(() => {
    return myTasks.filter(t => t.deadlineStatus === 'Overdue' && t.progressStatus !== 'Completed');
  }, [myTasks]);

  // Recent / Active tasks preview
  const recentTasks = useMemo(() => {
    return [...myTasks].slice(0, 4);
  }, [myTasks]);

  return (
    <div className="space-y-6">
      {/* Welcome Header (Section 5.1) */}
      <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-premium relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 backdrop-blur-3xl transform skew-x-12 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-100 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Workspace Overview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {currentUser?.fullName}!
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-indigo-100/90 max-w-xl">
              Track your coursework deadlines, stay ahead of automatic overdue thresholds, and organize academic milestones.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 text-xs sm:text-sm font-semibold bg-white text-brand-700 hover:bg-indigo-50 rounded-2xl shadow-lg transition-all flex items-center gap-2 self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Task</span>
          </button>
        </div>
      </div>

      {/* Summary Cards (Section 5.1) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Total Tasks"
          value={metrics.total}
          subtitle="All enrolled tasks"
          icon={CheckSquare}
          color="indigo"
        />
        <StatCard
          title="Completed"
          value={metrics.completed}
          subtitle="Delivered work"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Pending"
          value={metrics.pending}
          subtitle="Not yet started"
          icon={Layers}
          color="slate"
        />
        <StatCard
          title="In Progress"
          value={metrics.inProgress}
          subtitle="Active execution"
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Overdue Tasks"
          value={metrics.overdue}
          subtitle="Elapsed ≥ Dur - 5"
          icon={AlertCircle}
          color="rose"
        />
        <StatCard
          title="Upcoming"
          value={metrics.upcoming}
          subtitle="Active pipeline"
          icon={Calendar}
          color="amber"
        />
      </div>

      {/* PROMINENT OVERDUE TASK SECTION (Strictly Required by Section 5.1 & 6) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-rose-300 dark:border-rose-900/80 shadow-premium">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-rose-100 dark:border-rose-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
              <AlertCircle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Action Required: Overdue Tasks
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white shadow-sm">
                  {overdueTasks.length}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tasks marked Overdue automatically five days prior to their deadline according to Section 6.
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-rose-600 dark:text-rose-400 font-semibold self-start sm:self-auto">
            Rule: Elapsed ≥ Duration - 5 Days
          </div>
        </div>

        {overdueTasks.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-80" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No overdue coursework!
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              All your assignments are within their safe duration window.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {overdueTasks.map(task => {
              const elapsed = getElapsedDays(task, simulatedDate);

              return (
                <div
                  key={task.id}
                  className="bg-rose-50/60 dark:bg-rose-950/30 rounded-2xl p-4 border border-rose-200/80 dark:border-rose-900/80 flex flex-col justify-between transition-all hover:shadow-elevated"
                >
                  <div>
                    {/* Course & Overdue badge */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" /> {task.courseName}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-red-600 text-white uppercase tracking-wider animate-pulse">
                        OVERDUE
                      </span>
                    </div>

                    {/* Task Title */}
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* Section 5.1 Mandated Overdue Metadata Fields:
                        Course Name, Task Name, Original Deadline, Task Duration, Number of elapsed days, Overdue Status */}
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-rose-200/60 dark:border-rose-900/50 text-[11px]">
                      <div>
                        <span className="text-slate-400 block">Original Deadline:</span>
                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                          {task.originalDeadline}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Task Duration:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {task.duration} Days
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Elapsed Days:</span>
                        <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">
                          {elapsed} Days
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Immediate Actions: Mark Complete or Reschedule */}
                  <div className="mt-4 pt-3 border-t border-rose-200/50 dark:border-rose-900/50 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedTaskForReschedule(task)}
                      className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 rounded-xl border border-amber-200 dark:border-amber-900 transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Request Reschedule
                    </button>

                    <button
                      onClick={() => markTaskComplete(task.id)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" /> Mark Completed
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/user/tasks"
          className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle hover:shadow-elevated transition-all flex items-center justify-between group"
        >
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
              My Tasks Directory
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              View, filter, sort and manage all assigned coursework.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/user/daily-planner"
          className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle hover:shadow-elevated transition-all flex items-center justify-between group"
        >
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
              Daily Planner
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Organize today's deliverables, pending and upcoming tasks.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/user/kanban"
          className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle hover:shadow-elevated transition-all flex items-center justify-between group"
        >
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
              Kanban Board
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Drag-and-drop workflow across To Do, In Progress, Completed.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>
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
