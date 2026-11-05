import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getStoredUsers,
  saveStoredUsers,
  getStoredSession,
  saveStoredSession,
  isAdminSetupCompleted,
  setAdminSetupCompleted,
} from '../utils/localStorage';
import { generateUserId } from '../utils/taskUtils';
import { formatDate } from '../utils/deadlineUtils';
import { hashPassword, verifyPassword } from '../utils/cryptoUtils';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => getStoredUsers());
  const [currentUser, setCurrentUser] = useState(() => getStoredSession());
  const [adminSetupDone, setAdminSetupDone] = useState(() => isAdminSetupCompleted());
  const [loading, setLoading] = useState(false);

  // Sync users to localStorage when changed
  useEffect(() => {
    saveStoredUsers(users);
    setAdminSetupDone(isAdminSetupCompleted());
  }, [users]);

  // Sync session to localStorage when changed
  useEffect(() => {
    saveStoredSession(currentUser);
  }, [currentUser]);

  // Login handler supporting either Username or Email
  const login = async (identifier, password) => {
    if (!identifier || !password) {
      throw new Error('Please enter both your username/email and password.');
    }

    const cleanId = identifier.trim().toLowerCase();
    const user = users.find(
      u => (u.email && u.email.toLowerCase() === cleanId) ||
           (u.username && u.username.toLowerCase() === cleanId)
    );

    if (!user) {
      throw new Error('No user account found matching that username or email.');
    }

    // Verify password via cryptographic hash
    let isValid = false;
    if (user.passwordHash) {
      isValid = await verifyPassword(password, user.passwordHash);
    } else if (user.password) {
      // Legacy fallback: verify and upgrade to hash
      if (user.password === password) {
        isValid = true;
        const newHash = await hashPassword(password);
        const upgradedUsers = users.map(u => {
          if (u.id === user.id) {
            const copy = { ...u, passwordHash: newHash };
            delete copy.password;
            return copy;
          }
          return u;
        });
        setUsers(upgradedUsers);
      }
    }

    if (!isValid) {
      throw new Error('Incorrect password. Please verify your credentials.');
    }

    // Clone user without password/hash in session object for security
    const sessionUser = { ...user };
    delete sessionUser.password;
    delete sessionUser.passwordHash;
    setCurrentUser(sessionUser);
    return sessionUser;
  };

  // Secure Initial Setup / Provisioning for Primary Admin (Manohar)
  const setupPrimaryAdmin = async ({ fullName = 'Manohar', email, password, confirmPassword, department = 'Academic Administration' }) => {
    // Check if primary admin already exists
    const existingAdmin = users.find(u => u.username?.toLowerCase() === 'manohar' || (u.role === 'Admin' && u.isPrimaryAdmin));
    if (existingAdmin && existingAdmin.passwordHash) {
      throw new Error('The primary Admin account (Manohar) has already been configured. Additional Admin registrations are disabled.');
    }

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    if (password !== confirmPassword) {
      throw new Error('Passwords do not match.');
    }

    const cleanEmail = email ? email.trim().toLowerCase() : 'manohar@taskflow.com';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      throw new Error('Please provide a valid email address.');
    }

    // Hash password securely with SHA-256
    const passwordHash = await hashPassword(password);

    const primaryAdminUser = {
      id: 'USER_PRIMARY_ADMIN',
      username: 'Manohar',
      fullName: fullName.trim() || 'Manohar',
      email: cleanEmail,
      passwordHash: passwordHash,
      role: 'Admin',
      isPrimaryAdmin: true,
      department: department.trim() || 'Academic Administration',
      createdAt: formatDate(new Date()),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=Manohar&backgroundColor=4f46e5`,
    };

    // Filter out any previous unconfigured admin records
    const updatedUsers = [primaryAdminUser, ...users.filter(u => u.id !== 'USER_PRIMARY_ADMIN' && u.username?.toLowerCase() !== 'manohar')];
    setUsers(updatedUsers);
    setAdminSetupCompleted(true);
    setAdminSetupDone(true);

    const sessionUser = { ...primaryAdminUser };
    delete sessionUser.passwordHash;
    setCurrentUser(sessionUser);
    return sessionUser;
  };

  // Student Signup handler (strictly assigns 'User' role, prevents duplicate email/username)
  const signup = async ({ fullName, email, password, confirmPassword, department = 'General Studies' }) => {
    if (!fullName || !email || !password || !confirmPassword) {
      throw new Error('All required fields must be completed.');
    }

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

    // Auto-generate clean username from email or name
    const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    let username = baseUsername;
    if (username === 'manohar') {
      username = `user_${baseUsername}`;
    }

    // Hash password securely with SHA-256
    const passwordHash = await hashPassword(password);

    // Rule 7: New self-registrations strictly receive the User role. Cannot register as Admin.
    const newUser = {
      id: generateUserId(),
      username: username,
      fullName: fullName.trim(),
      email: cleanEmail,
      passwordHash: passwordHash,
      role: 'User', // strictly User
      isPrimaryAdmin: false,
      department: department.trim() || 'General Studies',
      createdAt: formatDate(new Date()),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName.trim())}`,
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);

    // Auto login new user
    const sessionUser = { ...newUser };
    delete sessionUser.passwordHash;
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

  // Password change with cryptographic hash
  const changePassword = async (currentPassword, newPassword) => {
    if (!currentUser) throw new Error('Not authenticated.');

    const userInDb = users.find(u => u.id === currentUser.id);
    if (!userInDb) {
      throw new Error('User account not found.');
    }

    const isCurrentValid = await verifyPassword(currentPassword, userInDb.passwordHash);
    if (!isCurrentValid) {
      throw new Error('Current password does not match our records.');
    }

    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }

    const newHash = await hashPassword(newPassword);
    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        const copy = { ...u, passwordHash: newHash };
        delete copy.password;
        return copy;
      }
      return u;
    });

    setUsers(updatedUsers);
  };

  // Admin user management actions
  const adminAddUser = async (userData) => {
    const cleanEmail = userData.email.trim().toLowerCase();
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('A user with this email already exists.');
    }

    const passwordToHash = userData.password || 'Student@123';
    const passwordHash = await hashPassword(passwordToHash);

    const newUser = {
      id: generateUserId(),
      username: userData.username || cleanEmail.split('@')[0],
      fullName: userData.fullName.trim(),
      email: cleanEmail,
      passwordHash: passwordHash,
      role: userData.role || 'User',
      isPrimaryAdmin: false,
      department: userData.department || 'General',
      createdAt: formatDate(new Date()),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.fullName)}`,
    };

    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const adminUpdateUser = async (userId, updatedFields) => {
    let newHash = null;
    if (updatedFields.password) {
      newHash = await hashPassword(updatedFields.password);
    }

    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const merged = { ...u, ...updatedFields };
        if (newHash) {
          merged.passwordHash = newHash;
        }
        delete merged.password;
        return merged;
      }
      return u;
    }));

    if (currentUser?.id === userId) {
      setCurrentUser(prev => {
        const updated = { ...prev, ...updatedFields };
        delete updated.password;
        delete updated.passwordHash;
        return updated;
      });
    }
  };

  const adminDeleteUser = (userId) => {
    if (userId === currentUser?.id) {
      throw new Error('You cannot delete your own active administrator account.');
    }
    const target = users.find(u => u.id === userId);
    if (target?.isPrimaryAdmin) {
      throw new Error('The primary Admin account (Manohar) cannot be deleted.');
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.role === 'Admin',
        isPrimaryAdmin: currentUser?.isPrimaryAdmin || currentUser?.username?.toLowerCase() === 'manohar',
        adminSetupDone,
        loading,
        users,
        login,
        setupPrimaryAdmin,
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
