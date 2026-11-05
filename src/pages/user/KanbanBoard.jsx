import React, { useState, useMemo } from 'react';
import {
  Columns,
  Plus,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  ArrowLeft,
  GripVertical,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import TaskCard from '../../components/TaskCard';
import TaskModal from '../../components/TaskModal';

const COLUMNS = [
  { id: 'To Do', label: 'To Do', color: 'slate', icon: Layers },
  { id: 'In Progress', label: 'In Progress', color: 'brand', icon: Clock },
  { id: 'Completed', label: 'Completed', color: 'emerald', icon: CheckCircle2 },
];

export default function KanbanBoard() {
  const { currentUser } = useAuth();
  const { tasks, updateTask } = useTasks();

  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createColumnTarget, setCreateColumnTarget] = useState('To Do');

  // Filter tasks strictly for this user
  const myTasks = useMemo(() => {
    return tasks.filter(t => t.assignedUserId === currentUser?.id);
  }, [tasks, currentUser]);

  // Group tasks by column
  const tasksByColumn = useMemo(() => {
    const grouped = {
      'To Do': [],
      'In Progress': [],
      'Completed': [],
    };
    myTasks.forEach(task => {
      const col = task.progressStatus || 'To Do';
      if (grouped[col]) {
        grouped[col].push(task);
      } else {
        grouped['To Do'].push(task);
      }
    });
    return grouped;
  }, [myTasks]);

  // HTML5 Drag and drop handlers
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = (e, columnId) => {
    if (dragOverColumn === columnId) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e, targetColumnId) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = draggedTaskId || e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    // Immediately update progress status
    updateTask(taskId, { progressStatus: targetColumnId });
    setDraggedTaskId(null);
  };

  const handleMoveColumn = (taskId, targetColumnId) => {
    updateTask(taskId, { progressStatus: targetColumnId });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Visual Kanban Workflow
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Drag and drop tasks between workflow stages to immediately update progress status.
          </p>
        </div>

        <button
          onClick={() => {
            setCreateColumnTarget('To Do');
            setShowCreateModal(true);
          }}
          className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 rounded-xl shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Kanban Board Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {COLUMNS.map((col) => {
          const colTasks = tasksByColumn[col.id] || [];
          const Icon = col.icon;
          const isDragOver = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={(e) => handleDragLeave(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`bg-slate-100/70 dark:bg-slate-900/60 rounded-3xl p-4 border transition-all min-h-[500px] flex flex-col ${
                isDragOver
                  ? 'border-brand-500 dark:border-brand-500 bg-brand-50/40 dark:bg-brand-950/30 ring-2 ring-brand-400/40'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${
                    col.id === 'Completed'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                      : col.id === 'In Progress'
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {col.label}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {colTasks.length}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setCreateColumnTarget(col.id);
                    setShowCreateModal(true);
                  }}
                  className="p-1 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg"
                  title={`Add task directly to ${col.label}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Tasks List with Drag & Drop */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="h-36 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs text-center p-4">
                    <p>No tasks in {col.label}</p>
                    <p className="text-[10px] mt-1 text-slate-400">
                      Drag tasks here or click + to add
                    </p>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="cursor-grab active:cursor-grabbing transition-transform"
                    >
                      <TaskCard
                        task={task}
                        onEdit={(t) => setTaskToEdit(t)}
                      />

                      {/* Accessible quick column shifter buttons */}
                      <div className="mt-1 flex items-center justify-end gap-1 px-1 text-[10px] text-slate-400">
                        {col.id !== 'To Do' && (
                          <button
                            onClick={() => handleMoveColumn(task.id, col.id === 'Completed' ? 'In Progress' : 'To Do')}
                            className="hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-0.5 font-medium"
                          >
                            <ArrowLeft className="w-2.5 h-2.5" /> Move Left
                          </button>
                        )}
                        {col.id !== 'Completed' && (
                          <button
                            onClick={() => handleMoveColumn(task.id, col.id === 'To Do' ? 'In Progress' : 'Completed')}
                            className="hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-0.5 font-medium ml-2"
                          >
                            Move Right <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
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
