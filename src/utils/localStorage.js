import { formatDate, addDays, calculateDeadlineStatus } from './deadlineUtils';

export const STORAGE_KEYS = {
  USERS: 'taskflow_users',
  TASKS: 'taskflow_tasks',
  SESSION: 'taskflow_session',
  NOTIFICATIONS: 'taskflow_notifications',
  THEME: 'taskflow_theme',
  COURSES: 'taskflow_courses',
  ADMIN_SETUP: 'taskflow_admin_setup_completed',
};

// SHA-256 hash for seed student accounts (password: 'User@123', salt: 'taskflow_secure_salt_2026')
const SEED_STUDENT_PASSWORD_HASH = 'fccef0a918088868c74e620cc2ebdda4a553f34e6b7811943ace4e80b06a6b88';

// Initial Seed Users (Students only - no hardcoded admin credentials)
const INITIAL_STUDENT_USERS = [
  {
    id: 'USER_001',
    username: 'alex',
    fullName: 'Alex Rivera',
    email: 'alex@student.com',
    passwordHash: SEED_STUDENT_PASSWORD_HASH,
    role: 'User',
    department: 'Software Engineering',
    createdAt: '2026-10-01',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    isPrimaryAdmin: false,
  },
  {
    id: 'USER_002',
    username: 'sarah',
    fullName: 'Sarah Jenkins',
    email: 'sarah@student.com',
    passwordHash: SEED_STUDENT_PASSWORD_HASH,
    role: 'User',
    department: 'Data Science',
    createdAt: '2026-10-10',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    isPrimaryAdmin: false,
  },
  {
    id: 'USER_003',
    username: 'david',
    fullName: 'David Chen',
    email: 'david@student.com',
    passwordHash: SEED_STUDENT_PASSWORD_HASH,
    role: 'User',
    department: 'Artificial Intelligence',
    createdAt: '2026-10-15',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isPrimaryAdmin: false,
  },
];

// Initial Seed Courses for Admin Course Management
const INITIAL_COURSES = [
  {
    id: 'COURSE-001',
    code: 'CS450',
    name: 'CS450 Distributed Systems',
    department: 'Software Engineering',
    description: 'Paxos consensus, Raft cluster election algorithms, replication models, and distributed network partitions.',
    createdAt: '2026-09-01',
  },
  {
    id: 'COURSE-002',
    code: 'CS510',
    name: 'CS510 Advanced Machine Learning',
    department: 'Artificial Intelligence',
    description: 'Ensemble methods, deep neural networks, hyperparameter optimization, and Bayesian validation.',
    createdAt: '2026-09-01',
  },
  {
    id: 'COURSE-003',
    code: 'CS340',
    name: 'CS340 Database Management',
    department: 'Computer Science',
    description: 'Relational schema design, B-Tree indices, query optimization, and transaction ACID properties.',
    createdAt: '2026-09-01',
  },
  {
    id: 'COURSE-004',
    code: 'CS460',
    name: 'CS460 Computer Vision',
    department: 'Computer Science',
    description: 'Object detection, YOLOv8 model benchmarks, convolutional feature extractors, and pedestrian tracking.',
    createdAt: '2026-09-01',
  },
  {
    id: 'COURSE-005',
    code: 'CS410',
    name: 'CS410 Compiler Construction',
    department: 'Computer Science',
    description: 'Intermediate three-address code representation, basic block loop optimizations, and LLVM IR generation.',
    createdAt: '2026-09-01',
  },
  {
    id: 'COURSE-006',
    code: 'CS480',
    name: 'CS480 Cybersecurity',
    department: 'Cybersecurity',
    description: 'Static vulnerability audits, cross-site scripting (XSS) remediation, and secure session management.',
    createdAt: '2026-09-01',
  },
  {
    id: 'COURSE-007',
    code: 'BIO300',
    name: 'BIO300 Computational Biology',
    department: 'Bioinformatics',
    description: 'RNA-Seq differential gene expression analysis, volcano plots, and DESeq2 normalization in R.',
    createdAt: '2026-09-01',
  },
  {
    id: 'COURSE-008',
    code: 'CS530',
    name: 'CS530 Reinforcement Learning',
    department: 'Artificial Intelligence',
    description: 'Deep Q-Networks (DQN), experience replay buffers, and dynamic grid obstacle path optimization.',
    createdAt: '2026-09-01',
  },
];

// Helper to compute dates relative to today for dynamic demo freshness
function getRelativeDate(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return formatDate(d);
}

// Initial Seed Tasks
const INITIAL_TASKS = [
  // 30-day task created 26 days ago -> Day 26: OVERDUE (30 - 5 = 25 threshold)
  {
    id: 'TASK-1001',
    title: 'Complete Distributed Systems Project',
    description: 'Implement Paxos consensus protocol with Raft cluster election algorithms and stress test under partitioned node conditions.',
    courseName: 'CS450 Distributed Systems',
    assignedUserId: 'USER_001',
    priority: 'High',
    progressStatus: 'In Progress',
    deadlineStatus: 'Overdue',
    createdAt: getRelativeDate(-26),
    duration: 30,
    originalDeadline: getRelativeDate(4),
    currentDeadline: getRelativeDate(4),
    completedAt: null,
    rescheduleCount: 0,
    rescheduleHistory: [],
  },
  // 30-day task created 10 days ago -> Day 10: NORMAL
  {
    id: 'TASK-1002',
    title: 'Machine Learning Classification Pipeline',
    description: 'Train XGBoost and Random Forest ensembles on Kaggle housing dataset with Bayesian hyperparameter tuning and cross-validation.',
    courseName: 'CS510 Advanced Machine Learning',
    assignedUserId: 'USER_001',
    priority: 'Medium',
    progressStatus: 'In Progress',
    deadlineStatus: 'Normal',
    createdAt: getRelativeDate(-10),
    duration: 30,
    originalDeadline: getRelativeDate(20),
    currentDeadline: getRelativeDate(20),
    completedAt: null,
    rescheduleCount: 0,
    rescheduleHistory: [],
  },
  // 7-day task created 3 days ago -> Day 3: OVERDUE (7 - 5 = 2 threshold)
  {
    id: 'TASK-1003',
    title: 'Database Schema Migration & Index Tuning',
    description: 'Design B-Tree indices on foreign key join fields and benchmark query execution plan costs using EXPLAIN ANALYZE in PostgreSQL.',
    courseName: 'CS340 Database Management',
    assignedUserId: 'USER_001',
    priority: 'High',
    progressStatus: 'To Do',
    deadlineStatus: 'Overdue',
    createdAt: getRelativeDate(-3),
    duration: 7,
    originalDeadline: getRelativeDate(4),
    currentDeadline: getRelativeDate(4),
    completedAt: null,
    rescheduleCount: 0,
    rescheduleHistory: [],
  },
  // 15-day task created 6 days ago -> Day 6: NORMAL (15 - 5 = 10 threshold)
  {
    id: 'TASK-1004',
    title: 'Computer Vision Object Tracking Benchmark',
    description: 'Annotate bounding boxes using YOLOv8 model weights and compare mAP@0.5 scores on pedestrian security video feeds.',
    courseName: 'CS460 Computer Vision',
    assignedUserId: 'USER_001',
    priority: 'Low',
    progressStatus: 'To Do',
    deadlineStatus: 'Normal',
    createdAt: getRelativeDate(-6),
    duration: 15,
    originalDeadline: getRelativeDate(9),
    currentDeadline: getRelativeDate(9),
    completedAt: null,
    rescheduleCount: 0,
    rescheduleHistory: [],
  },
  // Rescheduled task with history
  {
    id: 'TASK-1005',
    title: 'Compiler Design: LLVM IR Code Generation',
    description: 'Generate intermediate three-address code representations and optimize basic block loops for mini-C programming language grammar.',
    courseName: 'CS410 Compiler Construction',
    assignedUserId: 'USER_001',
    priority: 'High',
    progressStatus: 'In Progress',
    deadlineStatus: 'Normal',
    createdAt: getRelativeDate(-12),
    duration: 35,
    originalDeadline: getRelativeDate(-2),
    currentDeadline: getRelativeDate(23),
    completedAt: null,
    rescheduleCount: 1,
    rescheduleHistory: [
      {
        id: 'RSC-001',
        previousDeadline: getRelativeDate(-2),
        newDeadline: getRelativeDate(23),
        reason: 'Required laboratory cluster access extension due to scheduled GPU cluster maintenance window.',
        rescheduledAt: getRelativeDate(-3),
      }
    ],
  },
  // Completed task - MUST remain Completed and NEVER revert to Overdue
  {
    id: 'TASK-1006',
    title: 'Web Application Security Audit & OWASP Report',
    description: 'Performed static vulnerability analysis and cross-site scripting (XSS) remediation on authentication session headers.',
    courseName: 'CS480 Cybersecurity',
    assignedUserId: 'USER_001',
    priority: 'Medium',
    progressStatus: 'Completed',
    deadlineStatus: 'Completed',
    createdAt: getRelativeDate(-28),
    duration: 30,
    originalDeadline: getRelativeDate(2),
    currentDeadline: getRelativeDate(2),
    completedAt: getRelativeDate(-5),
    rescheduleCount: 0,
    rescheduleHistory: [],
  },
  // Additional tasks for Sarah Jenkins (USER_002)
  {
    id: 'TASK-2001',
    title: 'Exploratory Genomics Data Analysis in R',
    description: 'Clean RNA-Seq expression matrices and identify differential gene expression volcano plots using DESeq2 library.',
    courseName: 'BIO300 Computational Biology',
    assignedUserId: 'USER_002',
    priority: 'High',
    progressStatus: 'In Progress',
    deadlineStatus: 'Overdue',
    createdAt: getRelativeDate(-27),
    duration: 30,
    originalDeadline: getRelativeDate(3),
    currentDeadline: getRelativeDate(3),
    completedAt: null,
    rescheduleCount: 0,
    rescheduleHistory: [],
  },
  {
    id: 'TASK-2002',
    title: 'Neural Network Optimization with PyTorch',
    description: 'Implement AdamW optimizer with cosine learning rate scheduling and evaluate gradient clipping stability.',
    courseName: 'CS510 Advanced Machine Learning',
    assignedUserId: 'USER_002',
    priority: 'Medium',
    progressStatus: 'Completed',
    deadlineStatus: 'Completed',
    createdAt: getRelativeDate(-20),
    duration: 25,
    originalDeadline: getRelativeDate(5),
    currentDeadline: getRelativeDate(5),
    completedAt: getRelativeDate(-2),
    rescheduleCount: 0,
    rescheduleHistory: [],
  },
  // Additional task for David Chen (USER_003)
  {
    id: 'TASK-3001',
    title: 'Reinforcement Learning Maze Navigator',
    description: 'Train Deep Q-Network (DQN) with experience replay buffer to solve dynamic obstacle grid maze environment.',
    courseName: 'CS530 Reinforcement Learning',
    assignedUserId: 'USER_003',
    priority: 'High',
    progressStatus: 'To Do',
    deadlineStatus: 'Normal',
    createdAt: getRelativeDate(-5),
    duration: 30,
    originalDeadline: getRelativeDate(25),
    currentDeadline: getRelativeDate(25),
    completedAt: null,
    rescheduleCount: 0,
    rescheduleHistory: [],
  }
];

// Initial Seed Notifications
const INITIAL_NOTIFICATIONS = [
  {
    id: 'NOTIF-001',
    userId: 'USER_001',
    title: 'Deadline Status: Overdue',
    message: 'Task "Complete Distributed Systems Project" in CS450 Distributed Systems has reached the overdue threshold (Day 25+).',
    type: 'deadline',
    taskId: 'TASK-1001',
    read: false,
    createdAt: getRelativeDate(-1),
  },
  {
    id: 'NOTIF-002',
    userId: 'USER_001',
    title: 'Deadline Status: Overdue',
    message: 'Task "Database Schema Migration & Index Tuning" in CS340 Database Management has reached overdue threshold (Day 2+ of 7-day duration).',
    type: 'deadline',
    taskId: 'TASK-1003',
    read: false,
    createdAt: getRelativeDate(-1),
  },
  {
    id: 'NOTIF-003',
    userId: 'USER_001',
    title: 'Task Rescheduled',
    message: 'Task "Compiler Design: LLVM IR Code Generation" current deadline was rescheduled.',
    type: 'reschedule',
    taskId: 'TASK-1005',
    read: true,
    createdAt: getRelativeDate(-3),
  },
  {
    id: 'NOTIF-004',
    userId: 'USER_001',
    title: 'Task Completed',
    message: 'Task "Web Application Security Audit & OWASP Report" was marked completed. Deadline tracking ceased.',
    type: 'completion',
    taskId: 'TASK-1006',
    read: true,
    createdAt: getRelativeDate(-5),
  }
];

export function getStoredUsers() {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_STUDENT_USERS));
    return INITIAL_STUDENT_USERS;
  }
  try {
    const parsed = JSON.parse(data);
    // Remove legacy generic demo admin if present
    const cleaned = parsed.filter(u => u.email !== 'admin@taskflow.com' || u.username === 'Manohar');
    return cleaned;
  } catch (e) {
    console.error('Error parsing stored users', e);
    return INITIAL_STUDENT_USERS;
  }
}

export function saveStoredUsers(users) {
  // Never save plaintext passwords
  const sanitized = users.map(u => {
    const copy = { ...u };
    delete copy.password;
    return copy;
  });
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(sanitized));
}

export function getStoredCourses() {
  const data = localStorage.getItem(STORAGE_KEYS.COURSES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(INITIAL_COURSES));
    return INITIAL_COURSES;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Error parsing stored courses', e);
    return INITIAL_COURSES;
  }
}

export function saveStoredCourses(courses) {
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
}

export function isAdminSetupCompleted() {
  const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_SETUP);
  if (stored === 'true') return true;
  // Also verify if a primary admin user with username Manohar exists in users list
  const users = getStoredUsers();
  const primaryAdmin = users.find(u => (u.username?.toLowerCase() === 'manohar' || u.role === 'Admin') && u.passwordHash);
  return !!primaryAdmin;
}

export function setAdminSetupCompleted(status) {
  localStorage.setItem(STORAGE_KEYS.ADMIN_SETUP, status ? 'true' : 'false');
}

export function getStoredTasks() {
  const data = localStorage.getItem(STORAGE_KEYS.TASKS);
  let tasks = INITIAL_TASKS;
  if (data) {
    try {
      tasks = JSON.parse(data);
    } catch (e) {
      console.error('Error parsing stored tasks', e);
    }
  }

  // Ensure deadline statuses match the strict logic
  const calculated = tasks.map(t => {
    const status = calculateDeadlineStatus(t);
    return { ...t, deadlineStatus: status };
  });

  return calculated;
}

export function saveStoredTasks(tasks) {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

export function getStoredSession() {
  const data = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (!data) return null;
  try {
    const session = JSON.parse(data);
    // Sanitize session to ensure no password is present
    delete session.password;
    return session;
  } catch (e) {
    return null;
  }
}

export function saveStoredSession(session) {
  if (session) {
    const sanitized = { ...session };
    delete sanitized.password;
    delete sanitized.passwordHash;
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sanitized));
  } else {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }
}

export function getStoredNotifications(userId = null) {
  const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  let notifications = INITIAL_NOTIFICATIONS;
  if (data) {
    try {
      notifications = JSON.parse(data);
    } catch (e) {
      console.error('Error parsing notifications', e);
    }
  } else {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  }

  if (userId) {
    return notifications.filter(n => n.userId === userId || n.userId === 'ALL');
  }
  return notifications;
}

export function saveStoredNotifications(notifications) {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
}

export function getStoredTheme() {
  return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
}

export function saveStoredTheme(theme) {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
}
