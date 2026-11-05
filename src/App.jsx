import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

// Auth Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminSetup from './pages/AdminSetup';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import CourseManagement from './pages/admin/CourseManagement';
import UserManagement from './pages/admin/UserManagement';
import TaskManagement from './pages/admin/TaskManagement';
import Reports from './pages/admin/Reports';
import AdminProfile from './pages/admin/AdminProfile';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import MyTasks from './pages/user/MyTasks';
import DailyPlanner from './pages/user/DailyPlanner';
import CalendarView from './pages/user/Calendar';
import KanbanBoard from './pages/user/KanbanBoard';
import UserProfile from './pages/user/UserProfile';

function RootRedirect() {
  const { currentUser, isAuthenticated } = useAuth();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role === 'Admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/user/dashboard" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TaskProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/admin-setup" element={<AdminSetup />} />

              {/* Admin Portal Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRole="Admin">
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="courses" element={<CourseManagement />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="tasks" element={<TaskManagement />} />
                <Route path="reports" element={<Reports />} />
                <Route path="profile" element={<AdminProfile />} />
              </Route>

              {/* User Portal Routes */}
              <Route
                path="/user"
                element={
                  <ProtectedRoute allowedRole="User">
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/user/dashboard" replace />} />
                <Route path="dashboard" element={<UserDashboard />} />
                <Route path="tasks" element={<MyTasks />} />
                <Route path="daily-planner" element={<DailyPlanner />} />
                <Route path="calendar" element={<CalendarView />} />
                <Route path="kanban" element={<KanbanBoard />} />
                <Route path="profile" element={<UserProfile />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </BrowserRouter>
        </TaskProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
