import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Mail,
  Shield,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function UserManagement() {
  const { users, adminAddUser, adminUpdateUser, adminDeleteUser, currentUser } = useAuth();
  const { tasks } = useTasks();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [error, setError] = useState('');

  // Add / Edit form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'User',
    department: '',
  });

  // Calculate task statistics for each user dynamically
  const userStats = useMemo(() => {
    const statsMap = {};
    users.forEach(u => {
      const uTasks = tasks.filter(t => t.assignedUserId === u.id);
      const total = uTasks.length;
      const completed = uTasks.filter(t => t.progressStatus === 'Completed').length;
      const inProgress = uTasks.filter(t => t.progressStatus === 'In Progress').length;
      const pending = uTasks.filter(t => t.progressStatus === 'To Do').length;
      const overdue = uTasks.filter(t => t.deadlineStatus === 'Overdue' && t.progressStatus !== 'Completed').length;

      statsMap[u.id] = { total, completed, inProgress, pending, overdue };
    });
    return statsMap;
  }, [users, tasks]);

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        user.fullName.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.id.toLowerCase().includes(search.toLowerCase()) ||
        (user.department && user.department.toLowerCase().includes(search.toLowerCase()));

      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const handleOpenAddModal = () => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      role: 'User',
      department: 'Computer Science',
    });
    setError('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (user) => {
    setSelectedUserForEdit(user);
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      password: '', // optional on edit
      role: user.role || 'User',
      department: user.department || '',
    });
    setError('');
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    setError('');

    try {
      if (selectedUserForEdit) {
        // Edit mode
        const updates = {
          fullName: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          role: formData.role,
          department: formData.department.trim(),
        };
        if (formData.password) {
          updates.password = formData.password;
        }
        adminUpdateUser(selectedUserForEdit.id, updates);
        setSelectedUserForEdit(null);
      } else {
        // Add mode
        adminAddUser(formData);
        setShowAddModal(false);
      }
    } catch (err) {
      setError(err.message || 'Operation failed.');
    }
  };

  const handleDeleteConfirm = () => {
    if (!userToDelete) return;
    try {
      adminDeleteUser(userToDelete.id);
      setUserToDelete(null);
    } catch (err) {
      alert(err.message || 'Error deleting user.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            User & Student Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage student registrations, academic roles, and inspect individual task completion performance.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 rounded-xl shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students by name, email, or department..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="User">Students (User)</option>
            <option value="Admin">Administrators (Admin)</option>
          </select>
          <span className="text-slate-400 font-mono text-xs ml-2">
            Total: {filteredUsers.length}
          </span>
        </div>
      </div>

      {/* Users Table with Task Statistics (Section 4.2) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 select-none">
              <tr>
                <th className="py-3 px-4 font-semibold">User Profile</th>
                <th className="py-3 px-4 font-semibold">User ID</th>
                <th className="py-3 px-4 font-semibold">Role & Dept</th>
                <th className="py-3 px-4 font-semibold text-center">Total Tasks</th>
                <th className="py-3 px-4 font-semibold text-center">Completed</th>
                <th className="py-3 px-4 font-semibold text-center">Pending (To Do)</th>
                <th className="py-3 px-4 font-semibold text-center">Overdue</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No registered users matched your query</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const stats = userStats[user.id] || { total: 0, completed: 0, inProgress: 0, pending: 0, overdue: 0 };
                  const isCurrent = user.id === currentUser?.id;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & Email */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.fullName)}`}
                            alt=""
                            className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white truncate">
                              {user.fullName} {isCurrent && <span className="text-brand-600 text-[10px]">(You)</span>}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3" /> {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* User ID */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-xs text-slate-600 dark:text-slate-300">
                        {user.id}
                        <div className="text-[10px] text-slate-400">
                          Joined {user.createdAt || 'N/A'}
                        </div>
                      </td>

                      {/* Role & Dept */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${
                          user.role === 'Admin'
                            ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800'
                            : 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950/40 dark:text-brand-300 dark:border-brand-800'
                        }`}>
                          {user.role}
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[140px]">
                          {user.department || 'General'}
                        </p>
                      </td>

                      {/* Total Tasks */}
                      <td className="py-3 px-4 text-center whitespace-nowrap font-semibold text-slate-800 dark:text-slate-200">
                        {stats.total}
                      </td>

                      {/* Completed Tasks */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {stats.completed}
                        </span>
                      </td>

                      {/* Pending Tasks */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          {stats.pending}
                        </span>
                      </td>

                      {/* Overdue Tasks */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {stats.overdue > 0 ? (
                          <span className="inline-flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {stats.overdue}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">0</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {!isCurrent && (
                            <button
                              onClick={() => setUserToDelete(user)}
                              className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {(showAddModal || selectedUserForEdit) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-premium"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {selectedUserForEdit ? 'Edit User Profile' : 'Add New User'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedUserForEdit(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs border border-rose-200 dark:border-rose-900/60 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Maria Gonzalez"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@university.edu"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department / Major
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. Data Science"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                >
                  <option value="User">User (Student / Scholar)</option>
                  <option value="Admin">Admin (System Administrator)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {selectedUserForEdit ? 'Password (Leave blank to keep existing)' : 'Password *'}
                </label>
                <input
                  type="password"
                  required={!selectedUserForEdit}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedUserForEdit(null);
                  }}
                  className="px-3.5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm"
                >
                  {selectedUserForEdit ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!userToDelete}
        title="Delete User Account"
        message={`Are you sure you want to delete user "${userToDelete?.fullName}" (${userToDelete?.email})? All individual records will be permanently removed.`}
        confirmText="Delete Account"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onClose={() => setUserToDelete(null)}
      />
    </div>
  );
}
