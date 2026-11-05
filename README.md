# TaskFlow – Smart Professional Academic Task Management System

TaskFlow is a modern, responsive SaaS web application built with **React**, **Vite**, **Tailwind CSS**, and **React Router DOM**. It is designed for university faculty, administrators, and students to manage coursework deliverables, academic deadlines, progress tracking, and productivity analytics.

Inspired by industry-leading task systems like **Linear**, **ClickUp**, **Asana**, and **Monday.com**, TaskFlow provides a dual-portal architecture:
- 🛡️ **Institutional Admin Portal**: Comprehensive administrative oversight, course curriculum management, student directory, cross-department task assignment, real-time analytics, and completion audit reports.
- 🎓 **Student User Portal**: Individual task workspace, prominent overdue deadline tracking, daily schedule planning, interactive calendar, and visual Kanban board.

---

## 👑 Personal Primary Admin Account: Manohar

1. **Owner Governance**: **Manohar** is established as the sole Primary Administrator and Project Owner.
2. **Initial Setup & Provisioning**:
   - Access the Initial Admin Setup screen at: **`/admin-setup`** (or click the prominent prompt on the login screen).
   - The username is strictly locked to **`Manohar`**.
   - Set your personal password (minimum 6 characters).
   - Enter your preferred email address (default: `manohar@taskflow.com`) and department.
   - Once completed, the setup is **permanently locked**. No other user can create or elevate themselves to an Admin account.
3. **Cryptographic Password Security**:
   - Zero plaintext passwords in LocalStorage.
   - All passwords are encrypted using client-side **SHA-256 with cryptographic salt** via the standard Web Crypto API (`crypto.subtle`).
4. **Flexible Login**:
   - You can log in using either your username (**`Manohar`**) or your registered email address along with your personal password.
5. **Route Protection**:
   - Only your Admin account has access to the Admin Dashboard and administrative subroutes. Regular students are redirected away if attempting direct URL access.
   - Normal users registering via `/signup` are strictly restricted to the `User` role.

---

## 🛠️ Admin Permissions & Capabilities

As Primary Administrator, **Manohar** has full permissions across the institution:
- 📚 **Course Management (`/admin/courses`)**: Create, edit, and delete academic courses with codes, titles, departments, and descriptions. Changes to course names cascade to associated tasks.
- 📋 **Task Management (`/admin/tasks`)**: Create, edit, and delete coursework tasks across all courses and students.
- 👥 **User Management (`/admin/users`)**: View registered students, inspect individual completion stats, add student accounts, and edit profiles. The Primary Admin account is protected from deletion.
- 🎯 **Task Assignments**: Assign tasks to any student, modify assigned owners, and adjust priorities (`Low`, `Medium`, `High`).
- ⏱️ **Deadline Management**: Set original task durations (7, 15, 30, 60 days, or custom) and manage deadline schedules.
- 🔄 **Controlled Rescheduling**: Audit and review rescheduling requests, reasons, and previous deadline histories.
- 📊 **Reports & Analytics (`/admin/reports`)**: Access institutional completion percentages, course-wise outcomes, student productivity rosters, and export reports to CSV.

---

## ⚡ Core Features & Deadline Logic (Section 6)

### Automatic Deadline Tracking Rule
$$\text{Elapsed Days} = \text{Current Date} - \text{Task Creation Date}$$
$$\text{Overdue Threshold} = \text{Task Duration} - 5$$

- **Mathematical Rule**:
  - If a task's `progressStatus === "Completed"`, its deadline status is strictly **`Completed`**.
  - Else if $\text{Elapsed Days} \ge \text{Task Duration} - 5$, status automatically switches to **`Overdue`**.
  - Otherwise, status is **`Normal`**.
- **Verified Examples**:
  - **30-Day Task**: Day 1–24 displays **Normal**; Day 25 onwards automatically switches to **Overdue** (marked overdue 5 days prior to original deadline).
  - **7-Day Task**: Overdue starting from **Day 2** ($7 - 5 = 2$).
  - **15-Day Task**: Overdue starting from **Day 10** ($15 - 5 = 10$).
  - **60-Day Task**: Overdue starting from **Day 55** ($60 - 5 = 55$).
- **Completion Priority**:
  - Marking a task completed immediately stops deadline tracking and sets `deadlineStatus = "Completed"`.
  - **Completed tasks never revert to Overdue**, even if the calendar date advances past the deadline.
- **Allowed Statuses**: `Normal`, `Overdue`, and `Completed`.

---

## 🎛️ Interactive Academic Date Simulator Bar

To test deadline transitions in real-time, click the top simulator bar:
- **Today**: Resets to real-world date.
- **+10 Days**: Simulates date 10 days forward.
- **Day 24 (Normal)**: Verifies 30-day task remains Normal.
- **Day 25 (Overdue!)**: Verifies 30-day task automatically switches to Overdue.
- **Custom Date**: Select any calendar date.

---

## 📁 Modified Files Summary

| File | Purpose / Modifications Made |
| :--- | :--- |
| [`src/utils/cryptoUtils.js`](file:///C:/Users/MANOHAR/.gemini/antigravity/scratch/taskflow/src/utils/cryptoUtils.js) | **New file**: Web Crypto API implementation for SHA-256 salted password hashing and verification. |
| [`src/pages/AdminSetup.jsx`](file:///C:/Users/MANOHAR/.gemini/antigravity/scratch/taskflow/src/pages/AdminSetup.jsx) | **New file**: Initial provisioning setup page for Primary Admin (Manohar) with custom password and locked username. |
| [`src/pages/admin/CourseManagement.jsx`](file:///C:/Users/MANOHAR/.gemini/antigravity/scratch/taskflow/src/pages/admin/CourseManagement.jsx) | **New file**: Complete course CRUD interface (create, edit, delete courses, search, filter by department). |
| [`src/utils/localStorage.js`](file:///C:/Users/MANOHAR/.gemini/antigravity/scratch/taskflow/src/utils/localStorage.js) | Removed hardcoded demo admin credentials; added courses store, admin setup lock, and SHA-256 hashed passwords. |
| [`src/context/AuthContext.jsx`](file:///C:/Users/MANOHAR/.gemini/antigravity/scratch/taskflow/src/context/AuthContext.jsx) | Implemented `setupPrimaryAdmin`, username/email login support, SHA-256 hash checking, and primary admin deletion protection. |
| [`src/context/TaskContext.jsx`](file:///C:/Users/MANOHAR/.gemini/antigravity/scratch/taskflow/src/context/TaskContext.jsx) | Added `courses` state and full course CRUD operations (`createCourse`, `updateCourse`, `deleteCourse`). |
| [`src/components/Sidebar.jsx`](file:///C:/Users/MANOHAR/.gemini/antigravity/scratch/taskflow/src/components/Sidebar.jsx) | Added Course Management link to Admin navigation and Primary Admin Owner badge. |
| [`src/components/TaskModal.jsx`](file:///C:/Users/MANOHAR/.gemini/antigravity/scratch/taskflow/src/components/TaskModal.jsx) | Connected dynamic course datalist to course name input. |
| [`src/pages/Login.jsx`](file:///C:/Users/MANOHAR/.gemini/antigravity/scratch/taskflow/src/pages/Login.jsx) | Replaced hardcoded admin demo button with dynamic Primary Admin status / setup trigger and username login. |
| [`src/pages/Signup.jsx`](file:///C:/Users/MANOHAR/.gemini/antigravity/scratch/taskflow/src/pages/Signup.jsx) | Integrated SHA-256 password hashing for new student registrations; enforced student role restrictions. |
| [`src/pages/admin/AdminProfile.jsx`](file:///C:/Users/MANOHAR/.gemini/antigravity/scratch/taskflow/src/pages/admin/AdminProfile.jsx) | Added Primary Admin & Owner badge, username display for Manohar, and async hashed password updates. |
| [`src/pages/admin/UserManagement.jsx`](file:///C:/Users/MANOHAR/.gemini/antigravity/scratch/taskflow/src/pages/admin/UserManagement.jsx) | Protected Manohar primary admin account from deletion and updated password hashing for user management. |
| [`src/pages/user/UserProfile.jsx`](file:///C:/Users/MANOHAR/.gemini/antigravity/scratch/taskflow/src/pages/user/UserProfile.jsx) | Updated student password change to use SHA-256 cryptographic hashing. |
| [`src/App.jsx`](file:///C:/Users/MANOHAR/.gemini/antigravity/scratch/taskflow/src/App.jsx) | Registered `/admin-setup` public route and `/admin/courses` admin route. |
| [`test_suite.js`](file:///C:/Users/MANOHAR/.gemini/antigravity/scratch/taskflow/test_suite.js) | Added automated test assertions for SHA-256 password hashing and validation (27 tests passing). |

---

## 🧪 Automated Verification Suite

Run the test suite to verify deadline algorithms and cryptographic hashing:
```bash
node test_suite.js
```
Output:
```
==================================================
TASKFLOW SPECIFICATION VERIFICATION SUITE
==================================================
...
TEST SUMMARY: 27 PASSED, 0 FAILED
==================================================
```

---

## 🚀 Running the Project

```bash
# 1. Navigate to the project directory
cd C:\Users\MANOHAR\.gemini\antigravity\scratch\taskflow

# 2. Run the development server
npm run dev
```
Open `http://localhost:5173` in your browser.
- If this is your first run, you will see a prompt on the login screen to complete **Primary Admin Setup (Manohar)** or visit `http://localhost:5173/admin-setup`.
- Enter your password to initialize your account.
- You will be immediately logged in and redirected to the **Admin Dashboard**.
