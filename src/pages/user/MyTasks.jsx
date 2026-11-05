import React, { useState, useMemo } from 'react';
import { Plus, LayoutGrid, List, CheckSquare, Search, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import TaskTable from '../../components/TaskTable';
import TaskCard from '../../components/TaskCard';
import TaskModal from '../../components/TaskModal';

export default function MyTasks() {
  const { currentUser } = useAuth();
  const { tasks } = useTasks();

  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  // Strict user isolation (Section 5.2)
  const myTasks = useMemo(() => {
    return tasks.filter(t => t.assignedUserId === currentUser?.id);
  }, [tasks, currentUser]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Coursework & Tasks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your individual assignments, deadlines, progress statuses, and priority rankings.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View toggle */}
          <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
              title="Grid card view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {viewMode === 'table' ? (
        <TaskTable
          tasks={myTasks}
          onEditTask={(task) => setTaskToEdit(task)}
          showUserColumn={false}
          title="Student Tasks"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myTasks.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400">
              <CheckSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">You have not created any coursework tasks yet.</p>
            </div>
          ) : (
            myTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(t) => setTaskToEdit(t)}
              />
            ))
          )}
        </div>
      )}

      {/* Task Creation / Edit Modal */}
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
