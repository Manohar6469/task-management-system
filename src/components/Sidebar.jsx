import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  BarChart3,
  Calendar,
  Columns,
  ListTodo,
  User,
  LogOut,
  Moon,
  Sun,
  Layers,
  AlertCircle,
  X,
  Sparkles,
  Shield,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar({ isOpen, onClose }) {
  const { currentUser, isAdmin, logout } = useAuth();
  const { tasks } = useTasks();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Compute overdue count for badge
  const userTasks = isAdmin
    ? tasks
    : tasks.filter(t => t.assignedUserId === currentUser?.id);
  const overdueCount = userTasks.filter(t => t.deadlineStatus === 'Overdue' && t.progressStatus !== 'Completed').length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminNavItems = [
    { label: 'Admin Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Course Management', to: '/admin/courses', icon: BookOpen },
    { label: 'User Management', to: '/admin/users', icon: Users },
    { 
      label: 'Task Management', 
      to: '/admin/tasks', 
      icon: CheckSquare, 
      badge: overdueCount > 0 ? overdueCount : null,
      badgeColor: 'bg-rose-500' 
    },
    { label: 'Reports & Analytics', to: '/admin/reports', icon: BarChart3 },
    { label: 'Admin Profile', to: '/admin/profile', icon: User },
  ];

  const userNavItems = [
    { 
      label: 'Dashboard', 
      to: '/user/dashboard', 
      icon: LayoutDashboard,
      badge: overdueCount > 0 ? `${overdueCount} Overdue` : null,
      badgeColor: 'bg-rose-500'
    },
    { label: 'My Tasks', to: '/user/tasks', icon: CheckSquare },
    { label: 'Daily Planner', to: '/user/daily-planner', icon: ListTodo },
    { label: 'Calendar View', to: '/user/calendar', icon: Calendar },
    { label: 'Kanban Board', to: '/user/kanban', icon: Columns },
    { label: 'My Profile', to: '/user/profile', icon: User },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                TaskFlow
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                  {isAdmin ? 'Admin' : 'Student'}
                </span>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portal Switcher for Demo (if Admin, can preview User portal) */}
        {isAdmin && (
          <div className="px-4 pt-3">
            <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-brand-700 dark:text-brand-300">
                <Shield className="w-3.5 h-3.5" />
                <span>Admin View</span>
              </div>
              <NavLink
                to="/user/dashboard"
                onClick={onClose}
                className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                User View →
              </NavLink>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {isAdmin ? 'Administration Portal' : 'Workspace & Productivity'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold shadow-subtle'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm ${item.badgeColor || 'bg-brand-600'}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom User Profile & Theme bar */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          {/* Quick theme toggle */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300">
            <span className="text-[11px] font-medium">Theme Mode</span>
            <button
              onClick={toggleTheme}
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
              title="Toggle theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px]">Dark</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-[11px]">Light</span>
                </>
              )}
            </button>
          </div>

          {/* User mini badge & logout */}
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={currentUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser?.fullName || 'User')}`}
                alt=""
                className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {currentUser?.fullName}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {currentUser?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
