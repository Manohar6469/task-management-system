import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Plus,
  Sun,
  Moon,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import NotificationPanel from './NotificationPanel';
import TaskModal from './TaskModal';

export default function Navbar({ onOpenSidebar }) {
  const { currentUser, isAdmin, logout } = useAuth();
  const { notifications } = useTasks();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);

  // Unread notifications for this user
  const userNotifs = notifications.filter(
    n => !currentUser || n.userId === currentUser.id || n.userId === 'ALL'
  );
  const unreadCount = userNotifs.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
        {/* Left Side: Mobile Menu Button & Portal Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            title="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-900 dark:text-white">
              {isAdmin ? 'Academic Administration' : 'Student Portal'}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 dark:text-slate-400">
              {currentUser?.department || 'Task & Deadline Management'}
            </span>
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Create Task button */}
          <button
            onClick={() => setShowCreateTaskModal(true)}
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{isAdmin ? 'Assign Task' : 'New Task'}</span>
          </button>

          {/* Theme Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Toggle theme mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Notification Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifPanel(!showNotifPanel);
                setShowUserDropdown(false);
              }}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            <NotificationPanel
              isOpen={showNotifPanel}
              onClose={() => setShowNotifPanel(false)}
            />
          </div>

          {/* User Profile Avatar Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowNotifPanel(false);
              }}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <img
                src={currentUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser?.fullName || 'User')}`}
                alt=""
                className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <span className="hidden md:inline text-xs font-semibold text-slate-800 dark:text-slate-200">
                {currentUser?.fullName?.split(' ')[0]}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserDropdown && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowUserDropdown(false)}
                />
                <div className="absolute right-0 top-12 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-premium border border-slate-200 dark:border-slate-800 py-2 z-40 text-xs animate-in fade-in duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      {currentUser?.fullName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {currentUser?.email}
                    </p>
                    <span className="mt-1 inline-block px-2 py-0.5 text-[10px] font-bold rounded-md bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                      {currentUser?.role}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        navigate(isAdmin ? '/admin/profile' : '/user/profile');
                      }}
                      className="w-full px-4 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-slate-400" /> Profile & Settings
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        handleLogout();
                      }}
                      className="w-full px-4 py-2 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
      />
    </>
  );
}
