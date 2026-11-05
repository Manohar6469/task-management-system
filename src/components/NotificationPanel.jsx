import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  Check,
  Trash2,
  X,
  ExternalLink,
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';

export default function NotificationPanel({ isOpen, onClose }) {
  const { currentUser } = useAuth();
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotification,
  } = useTasks();

  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  if (!isOpen) return null;

  // Filter notifications for current user
  const userNotifs = notifications.filter(
    n => !currentUser || n.userId === currentUser.id || n.userId === 'ALL'
  );

  const displayedNotifs = filter === 'unread'
    ? userNotifs.filter(n => !n.read)
    : userNotifs;

  const unreadCount = userNotifs.filter(n => !n.read).length;

  const getNotifIcon = (type) => {
    switch (type) {
      case 'deadline':
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case 'completion':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'reschedule':
        return <Calendar className="w-4 h-4 text-amber-500" />;
      case 'assignment':
      default:
        return <Clock className="w-4 h-4 text-brand-500" />;
    }
  };

  return (
    <div 
      className="absolute right-0 top-12 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-premium border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllNotificationsAsRead(currentUser?.id)}
              className="p-1 text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Mark all as read"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 px-4 pt-2 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`pb-2 px-2 font-medium border-b-2 transition-colors ${
            filter === 'all'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          All ({userNotifs.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`pb-2 px-2 font-medium border-b-2 transition-colors ${
            filter === 'unread'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notification List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
        {displayedNotifs.length === 0 ? (
          <div className="py-10 text-center text-slate-400 dark:text-slate-500">
            <Bell className="w-8 h-8 mx-auto mb-2 stroke-1 opacity-50" />
            <p className="text-xs">No notifications to display</p>
          </div>
        ) : (
          displayedNotifs.map((n) => (
            <div
              key={n.id}
              className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                !n.read ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
              }`}
            >
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                {getNotifIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {n.createdAt}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                  {n.message}
                </p>
                <div className="flex items-center justify-between mt-2 pt-1">
                  {!n.read && (
                    <button
                      onClick={() => markNotificationAsRead(n.id)}
                      className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <Check className="w-3 h-3" /> Mark read
                    </button>
                  )}
                  <button
                    onClick={() => clearNotification(n.id)}
                    className="ml-auto text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-1 rounded transition-colors"
                    title="Dismiss"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
