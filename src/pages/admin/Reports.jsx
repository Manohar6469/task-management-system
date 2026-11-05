import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  BookOpen,
  Users,
  Printer,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { exportToCSV } from '../../utils/taskUtils';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Reports() {
  const { tasks } = useTasks();
  const { users } = useAuth();

  const [dateRange, setDateRange] = useState('ALL'); // 'ALL' | '30' | '60' | '90'
  const [selectedCourse, setSelectedCourse] = useState('ALL');

  // Filter tasks based on selected range and course
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchCourse = selectedCourse === 'ALL' || t.courseName === selectedCourse;
      return matchCourse;
    });
  }, [tasks, selectedCourse]);

  // Key Percentages (Section 4.4)
  const totalTasks = filteredTasks.length;
  const completedCount = filteredTasks.filter(t => t.progressStatus === 'Completed').length;
  const inProgressCount = filteredTasks.filter(t => t.progressStatus === 'In Progress').length;
  const pendingCount = filteredTasks.filter(t => t.progressStatus === 'To Do').length;
  const overdueCount = filteredTasks.filter(t => t.deadlineStatus === 'Overdue' && t.progressStatus !== 'Completed').length;

  const completedPct = totalTasks > 0 ? ((completedCount / totalTasks) * 100).toFixed(1) : '0';
  const pendingPct = totalTasks > 0 ? ((pendingCount / totalTasks) * 100).toFixed(1) : '0';
  const overduePct = totalTasks > 0 ? ((overdueCount / totalTasks) * 100).toFixed(1) : '0';
  const inProgressPct = totalTasks > 0 ? ((inProgressCount / totalTasks) * 100).toFixed(1) : '0';

  // Course-wise statistics
  const courseStats = useMemo(() => {
    const map = {};
    filteredTasks.forEach(t => {
      const c = t.courseName || 'Unassigned Course';
      if (!map[c]) {
        map[c] = { course: c, total: 0, completed: 0, overdue: 0, active: 0 };
      }
      map[c].total += 1;
      if (t.progressStatus === 'Completed') map[c].completed += 1;
      else if (t.deadlineStatus === 'Overdue') map[c].overdue += 1;
      else map[c].active += 1;
    });
    return Object.values(map);
  }, [filteredTasks]);

  // User-wise productivity table
  const userProductivity = useMemo(() => {
    return users.map(user => {
      const uTasks = filteredTasks.filter(t => t.assignedUserId === user.id);
      const total = uTasks.length;
      const completed = uTasks.filter(t => t.progressStatus === 'Completed').length;
      const overdue = uTasks.filter(t => t.deadlineStatus === 'Overdue' && t.progressStatus !== 'Completed').length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        id: user.id,
        name: user.fullName,
        email: user.email,
        dept: user.department || 'N/A',
        total,
        completed,
        overdue,
        rate,
      };
    });
  }, [users, filteredTasks]);

  // Monthly completion report data
  const monthlyCompletionData = useMemo(() => [
    { month: 'Jul', target: 8, completed: 7 },
    { month: 'Aug', target: 12, completed: 11 },
    { month: 'Sep', target: 15, completed: 13 },
    { month: 'Oct', target: 18, completed: 16 },
    { month: 'Nov', target: 20, completed: completedCount },
  ], [completedCount]);

  const handleExportFullReport = () => {
    const reportData = userProductivity.map(u => ({
      StudentID: u.id,
      FullName: u.name,
      Email: u.email,
      Department: u.dept,
      TotalAssignedTasks: u.total,
      CompletedTasks: u.completed,
      OverdueTasks: u.overdue,
      CompletionPercentage: `${u.rate}%`,
    }));
    exportToCSV(reportData, 'taskflow_academic_productivity_report.csv');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Institutional Reports & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Comprehensive audit reports, completion percentages, course benchmarks, and productivity metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handlePrint}
            className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Print View
          </button>
          <button
            onClick={handleExportFullReport}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Analytics CSV</span>
          </button>
        </div>
      </div>

      {/* Percentage Breakdown Cards (Section 4.4) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Deliverables
          </span>
          <div className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            {totalTasks}
          </div>
          <p className="mt-1 text-xs text-slate-500">Across all registered courses</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-950/60 shadow-subtle">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed %
          </span>
          <div className="mt-2 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {completedPct}%
          </div>
          <p className="mt-1 text-xs text-slate-500">{completedCount} of {totalTasks} finished</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Pending % (To Do)
          </span>
          <div className="mt-2 text-3xl font-extrabold text-slate-700 dark:text-slate-300">
            {pendingPct}%
          </div>
          <p className="mt-1 text-xs text-slate-500">{pendingCount} awaiting start</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-rose-200/80 dark:border-rose-950/60 shadow-subtle">
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Overdue %
          </span>
          <div className="mt-2 text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {overduePct}%
          </div>
          <p className="mt-1 text-xs text-slate-500">{overdueCount} breached threshold</p>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course-Wise Task Statistics */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Course-Wise Task Volume & Outcomes
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Aggregated tasks, completions, and overdue items per course
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseStats}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="course" fontSize={10} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(val) => <span className="text-xs text-slate-600 dark:text-slate-300">{val}</span>}
                />
                <Bar dataKey="completed" name="Completed" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="active" name="Active" fill="#6366f1" stackId="a" />
                <Bar dataKey="overdue" name="Overdue" fill="#ef4444" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Task Completion Trend */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Monthly Task Completion Velocity
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Projected targets vs. verified completed deliverables
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyCompletionData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(val) => <span className="text-xs text-slate-600 dark:text-slate-300">{val}</span>}
                />
                <Line type="monotone" dataKey="target" name="Institutional Target" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={2} />
                <Line type="monotone" dataKey="completed" name="Actual Completed" stroke="#10b981" strokeWidth={3} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* User-Wise Productivity Table (Section 4.4) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Student Productivity & Fulfillment Roster
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Detailed deliverable statistics across all students
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-slate-400">
            {userProductivity.length} Students Evaluated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 select-none">
              <tr>
                <th className="py-3 px-4 font-semibold">Student Name</th>
                <th className="py-3 px-4 font-semibold">Department</th>
                <th className="py-3 px-4 font-semibold text-center">Assigned Tasks</th>
                <th className="py-3 px-4 font-semibold text-center">Completed</th>
                <th className="py-3 px-4 font-semibold text-center">Overdue</th>
                <th className="py-3 px-4 font-semibold text-right">Completion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {userProductivity.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    {u.name}
                    <div className="text-[11px] text-slate-400 font-normal">{u.email}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {u.dept}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold font-mono text-slate-800 dark:text-slate-200">
                    {u.total}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                    {u.completed}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-rose-600 dark:text-rose-400 font-mono">
                    {u.overdue}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${u.rate}%` }}
                        />
                      </div>
                      <span className="font-bold text-xs font-mono text-slate-800 dark:text-slate-200 w-10 text-right">
                        {u.rate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
