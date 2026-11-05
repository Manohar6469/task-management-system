import React, { useState } from 'react';
import { Plus, CheckSquare, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import TaskTable from '../../components/TaskTable';
import TaskModal from '../../components/TaskModal';

export default function TaskManagement() {
  const { tasks } = useTasks();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const totalTasks = tasks.length;
  const overdueCount = tasks.filter(t => t.deadlineStatus === 'Overdue' && t.progressStatus !== 'Completed').length;
  const inProgressCount = tasks.filter(t => t.progressStatus === 'In Progress').length;
  const completedCount = tasks.filter(t => t.progressStatus === 'Completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Institutional Task Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Oversee, create, assign, and audit tasks across all academic courses and students.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 rounded-xl shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create & Assign Task</span>
        </button>
      </div>

      {/* Mini status bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Total System Tasks</span>
          <span className="text-base font-bold text-slate-900 dark:text-white font-mono">{totalTasks}</span>
        </div>
        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">Overdue (Section 6)</span>
          <span className="text-base font-bold text-rose-600 dark:text-rose-400 font-mono">{overdueCount}</span>
        </div>
        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">In Progress</span>
          <span className="text-base font-bold text-indigo-600 dark:text-indigo-400 font-mono">{inProgressCount}</span>
        </div>
        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Completed</span>
          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">{completedCount}</span>
        </div>
      </div>

      {/* Full Task Table */}
      <TaskTable
        tasks={tasks}
        onEditTask={(task) => setTaskToEdit(task)}
        showUserColumn={true}
        title="Admin All Tasks"
      />

      {/* Create / Edit Modal */}
      <TaskModal
        isOpen={showCreateModal || !!taskToEdit}
        taskToEdit={taskToEdit}
        onClose={() => {
          setShowCreateModal(false);
          setTaskToEdit(null);
        }}
      />
    </div>
  );
}
