import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getStoredUsers,
  saveStoredUsers,
  getStoredSession,
  saveStoredSession,
} from '../utils/localStorage';
import { generateUserId } from '../utils/taskUtils';
import { formatDate } from '../utils/deadlineUtils';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => getStoredUsers());
  const [currentUser, setCurrentUser] = useState(() => getStoredSession());
  const [loading, setLoading] = useState(false);

  // Sync users to localStorage when changed
  useEffect(() => {
    saveStoredUsers(users);
  }, [users]);

  // Sync session to localStorage when changed
  useEffect(() => {
    saveStoredSession(currentUser);
  }, [currentUser]);

  // Login handler
  const login = (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      throw new Error('No user found with this email address.');
    }

    if (user.password !== password) {
      throw new Error('Incorrect password. Please try again.');
    }

    // Clone user without password in session object for security
    const sessionUser = { ...user };
    delete sessionUser.password;
    setCurrentUser(sessionUser);
    return sessionUser;
  };

  // Signup handler (strictly assigns 'User' role, prevents duplicate email)
  const signup = ({ fullName, email, password, confirmPassword, department = 'General' }) => {
    if (!fullName || !email || !password || !confirmPassword) {
      throw new Error('All fields are required.');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address.');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    if (password !== confirmPassword) {
      throw new Error('Passwords do not match.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    // Strict rule: New registrations must receive the User role by default.
    // Users must not be able to register themselves as Admin.
    const newUser = {
      id: generateUserId(),
      fullName: fullName.trim(),
      email: cleanEmail,
      password: password,
      role: 'User', // strictly User
      department: department.trim() || 'General Studies',
      createdAt: formatDate(new Date()),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName.trim())}`,
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);

    // Auto login new user
    const sessionUser = { ...newUser };
    delete sessionUser.password;
    setCurrentUser(sessionUser);
    return sessionUser;
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
  };

  // Profile update
  const updateProfile = (updatedData) => {
    if (!currentUser) return;

    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, ...updatedData };
      }
      return u;
    });

    setUsers(updatedUsers);
    setCurrentUser(prev => ({ ...prev, ...updatedData }));
  };

  // Password change
  const changePassword = (currentPassword, newPassword) => {
    if (!currentUser) throw new Error('Not authenticated.');
    
    const userInDb = users.find(u => u.id === currentUser.id);
    if (!userInDb || userInDb.password !== currentPassword) {
      throw new Error('Current password is incorrect.');
    }

    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }

    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, password: newPassword };
      }
      return u;
    });

    setUsers(updatedUsers);
  };

  // Admin user management actions
  const adminAddUser = (userData) => {
    const cleanEmail = userData.email.trim().toLowerCase();
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('A user with this email already exists.');
    }

    const newUser = {
      id: generateUserId(),
      fullName: userData.fullName.trim(),
      email: cleanEmail,
      password: userData.password || 'Student@123',
      role: userData.role || 'User',
      department: userData.department || 'General',
      createdAt: formatDate(new Date()),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.fullName)}`,
    };

    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const adminUpdateUser = (userId, updatedFields) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, ...updatedFields };
      }
      return u;
    }));

    if (currentUser?.id === userId) {
      setCurrentUser(prev => ({ ...prev, ...updatedFields }));
    }
  };

  const adminDeleteUser = (userId) => {
    if (userId === currentUser?.id) {
      throw new Error('You cannot delete your own active administrator account.');
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.role === 'Admin',
        loading,
        users,
        login,
        signup,
        logout,
        updateProfile,
        changePassword,
        adminAddUser,
        adminUpdateUser,
        adminDeleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
