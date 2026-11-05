/**
 * TASK HELPER UTILITIES
 */

// Generate unique task ID
export function generateTaskId() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `TASK-${randomNum}`;
}

// Generate unique user ID
export function generateUserId() {
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `USER_${randomNum}`;
}

// Generate unique notification ID
export function generateNotificationId() {
  return `NOTIF-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`;
}

// Generate unique reschedule ID
export function generateRescheduleId() {
  return `RSC-${Date.now().toString(36).toUpperCase()}`;
}

// Priority badge classes
export function getPriorityBadgeClasses(priority) {
  switch (priority) {
    case 'High':
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60';
    case 'Medium':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60';
    case 'Low':
    default:
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60';
  }
}

// Progress status badge classes
export function getProgressBadgeClasses(status) {
  switch (status) {
    case 'Completed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60';
    case 'In Progress':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/60';
    case 'To Do':
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  }
}

// Deadline status badge classes - ONLY "Normal", "Overdue", "Completed" allowed
export function getDeadlineBadgeClasses(deadlineStatus) {
  switch (deadlineStatus) {
    case 'Completed':
      return 'bg-emerald-100/70 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
    case 'Overdue':
      return 'bg-red-100 text-red-800 border-red-300 font-semibold animate-pulse dark:bg-red-950/80 dark:text-red-300 dark:border-red-800';
    case 'Normal':
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  }
}

// Export data to CSV
export function exportToCSV(data, filename = 'taskflow_export.csv') {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const rows = data.map(obj => 
    headers.map(header => {
      let val = obj[header];
      if (typeof val === 'object' && val !== null) {
        val = JSON.stringify(val);
      }
      return `"${String(val || '').replace(/"/g, '""')}"`;
    }).join(',')
  );

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
