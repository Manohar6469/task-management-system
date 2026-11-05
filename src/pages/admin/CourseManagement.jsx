import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function CourseManagement() {
  const { courses, tasks, createCourse, updateCourse, deleteCourse } = useTasks();

  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCourseForEdit, setSelectedCourseForEdit] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    department: 'Computer Science',
    description: '',
  });

  // Unique departments for filter
  const departments = useMemo(() => {
    const set = new Set(courses.map(c => c.department).filter(Boolean));
    return Array.from(set);
  }, [courses]);

  // Compute task count per course
  const courseTaskCounts = useMemo(() => {
    const counts = {};
    courses.forEach(c => {
      counts[c.id] = tasks.filter(t => t.courseName === c.name || t.courseName.startsWith(c.code)).length;
    });
    return counts;
  }, [courses, tasks]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const q = search.toLowerCase();
      const matchesSearch =
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        (c.department && c.department.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q));

      const matchesDept = departmentFilter === 'ALL' || c.department === departmentFilter;
      return matchesSearch && matchesDept;
    });
  }, [courses, search, departmentFilter]);

  const handleOpenAddModal = () => {
    setFormData({
      code: '',
      name: '',
      department: 'Computer Science',
      description: '',
    });
    setError('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (course) => {
    setSelectedCourseForEdit(course);
    setFormData({
      code: course.code || '',
      name: course.name || '',
      department: course.department || '',
      description: course.description || '',
    });
    setError('');
  };

  const handleSaveCourse = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.code.trim() || !formData.name.trim()) {
      setError('Course code and course title are required.');
      return;
    }

    try {
      if (selectedCourseForEdit) {
        updateCourse(selectedCourseForEdit.id, {
          code: formData.code.trim().toUpperCase(),
          name: formData.name.trim(),
          department: formData.department.trim(),
          description: formData.description.trim(),
        });
        setSelectedCourseForEdit(null);
      } else {
        createCourse({
          code: formData.code.trim().toUpperCase(),
          name: formData.name.trim(),
          department: formData.department.trim(),
          description: formData.description.trim(),
        });
        setShowAddModal(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to save course.');
    }
  };

  const handleDeleteConfirm = () => {
    if (!courseToDelete) return;
    deleteCourse(courseToDelete.id);
    setCourseToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Academic Course Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create, configure, and maintain academic courses, syllabus modules, and course-linked tasks.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 rounded-xl shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Course</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses by code, title, or department..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 outline-none"
          >
            <option value="ALL">All Departments</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <span className="text-slate-400 font-mono text-xs ml-2">
            Total: {filteredCourses.length}
          </span>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No academic courses found matching your search.</p>
          </div>
        ) : (
          filteredCourses.map(course => {
            const taskCount = courseTaskCounts[course.id] || 0;

            return (
              <div
                key={course.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-subtle hover:shadow-elevated transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-md font-mono text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                      {course.code}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {taskCount} Linked Task{taskCount !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {course.name}
                  </h3>

                  <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mt-0.5">
                    {course.department}
                  </p>

                  {course.description && (
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {course.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {course.id}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(course)}
                      className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit Course"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCourseToDelete(course)}
                      className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Course Modal */}
      {(showAddModal || selectedCourseForEdit) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-premium"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-600" />
                <span>{selectedCourseForEdit ? 'Edit Course Details' : 'Create Academic Course'}</span>
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedCourseForEdit(null);
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

            <form onSubmit={handleSaveCourse} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Course Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS450"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Course Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS450 Distributed Systems"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department / Faculty
                </label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineering"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Course Description & Scope
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe curriculum focus, project deliverables and requirements..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedCourseForEdit(null);
                  }}
                  className="px-3.5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm"
                >
                  {selectedCourseForEdit ? 'Save Changes' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!courseToDelete}
        title="Delete Course"
        message={`Are you sure you want to delete course "${courseToDelete?.name}" (${courseToDelete?.code})?`}
        confirmText="Delete Course"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onClose={() => setCourseToDelete(null)}
      />
    </div>
  );
}
