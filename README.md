# TaskFlow – Smart Professional Academic Task Management System

TaskFlow is a modern, responsive SaaS web application built with **React**, **Vite**, **Tailwind CSS**, and **React Router DOM**. It is designed for university faculty, administrators, and students to manage coursework deliverables, academic deadlines, progress tracking, and productivity analytics.

Inspired by industry-leading task systems like **Linear**, **ClickUp**, **Asana**, and **Monday.com**, TaskFlow provides a dual-portal architecture:
- 🛡️ **Institutional Admin Portal**: Comprehensive administrative oversight, student directory, cross-department task assignment, real-time analytics, and completion audit reports.
- 🎓 **Student User Portal**: Individual task workspace, prominent overdue deadline tracking, daily schedule planning, interactive calendar, and visual Kanban board.

---

## ⚡ Key Highlights & Core Features

### 1. Dual-Portal Role-Based Architecture
- **Admin Portal**:
  - **Admin Dashboard**: Summary metrics (Total Users, Total Tasks, Completed, Pending, Overdue, In Progress) and interactive **Recharts** visualizations (Task Status Donut, Student Productivity Bar, Priority Distribution, Monthly Volume Trend).
  - **User Management**: Add, view, edit, and delete students with confirmation dialogs, search, role filters, and live per-user deliverable statistics.
  - **Task Management**: Create and assign coursework to students, edit task details, adjust assignments, audit reschedule histories, and filter/search tasks.
  - **Reports & Analytics**: Institutional completion rates, overdue percentages, course-wise performance, and one-click **CSV Export** & printable audit views.
  - **Admin Profile**: Update administrative details, department affiliations, change credentials, and sign out.
- **User / Student Portal**:
  - **User Dashboard**: Personalized welcome banner, key metrics, quick links, and a **prominently highlighted Overdue Task section**.
  - **My Tasks**: Table and Grid views for student coursework with filtering by course, priority, and progress status, plus sorting and CSV export.
  - **Daily Planner**: Category tabs (Due Today, Overdue, Pending, Upcoming, Completed) with direct inline progress status toggling.
  - **Calendar View**: Monthly, Weekly, and Daily calendar views with color-coded status badges and one-click task detail inspection.
  - **Kanban Board**: Drag-and-drop workflow across **To Do**, **In Progress**, and **Completed** columns with instant progress persistence.
  - **Student Profile**: Manage academic department, profile info, update password, and view completion milestones.

### 2. Automatic Deadline Status Calculation Logic (Section 6)
TaskFlow strictly enforces individual duration-based deadline tracking:
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
- **Restrictions Enforced**:
  - Only three clean statuses used: `Normal`, `Overdue`, and `Completed`. No emergency or popup reminder clutter.

### 3. Controlled Task Rescheduling System (Section 7)
- Students and administrators can request or perform controlled rescheduling of tasks.
- Preserves the `originalDeadline` permanently for academic auditing.
- Records `rescheduleHistory` with previous deadline, new deadline, justification reason, and timestamp.
- Increments `rescheduleCount` and adjusts deadline tracking accordingly without automatically marking the task completed.

### 4. Interactive Academic Date Simulator Bar
- An interactive bar allows examiners and reviewers to test deadline transitions in real-time.
- Test buttons include **Today**, **+10 Days**, **Day 24 (Normal)**, **Day 25 (Overdue!)**, and a custom date picker.

---

## 🔑 Predefined Demo Credentials

TaskFlow comes pre-seeded with rich mock data and demo accounts:

| Role | Email Address | Password | Name |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@taskflow.com` | `Admin@123` | System Administrator |
| **Student** | `alex@student.com` | `User@123` | Alex Rivera |
| **Student** | `sarah@student.com` | `User@123` | Sarah Jenkins |
| **Student** | `david@student.com` | `User@123` | David Chen |

> *Quick-fill buttons are provided on the Login page for one-click access.*

---

## 🛠️ Technology Stack

- **Framework**: React.js 19
- **Build Tool**: Vite 8
- **Language**: JavaScript (ES6+ / JSX)
- **Routing**: React Router DOM 7
- **Styling**: Tailwind CSS 3 (Custom dark/light mode palette, glassmorphism, responsive drawers)
- **Icons**: Lucide React
- **Data Visualization**: Recharts (Pie, Bar, Line, Area charts)
- **Data Persistence**: Browser Local Storage (Session, Users, Tasks, Notifications, Theme)
- **Hosting / Deployment Target**: Vercel (`vercel.json` SPA rewrite configured)

---

## 📁 Suggested Project Structure

```
taskflow/
├── public/
├── src/
│   ├── components/
│   │   ├── AppLayout.jsx              # Main shell with sidebar & navbar
│   │   ├── ConfirmationModal.jsx      # Reusable confirmation dialog
│   │   ├── Navbar.jsx                 # Top bar with profile & notifications
│   │   ├── NotificationPanel.jsx      # In-app notification dropdown
│   │   ├── ProtectedRoute.jsx         # Role-based route guard
│   │   ├── RescheduleModal.jsx        # Controlled rescheduling modal
│   │   ├── Sidebar.jsx                # Responsive navigation sidebar
│   │   ├── StatCard.jsx               # Dashboard metric cards
│   │   ├── SystemDateSimulator.jsx    # Date simulator for instant testing
│   │   ├── TaskCard.jsx               # Card component with overdue details
│   │   ├── TaskModal.jsx              # Create/Edit task modal
│   │   └── TaskTable.jsx              # Dynamic data table with multi-filters
│   ├── context/
│   │   ├── AuthContext.jsx            # User state, session & admin CRUD
│   │   ├── TaskContext.jsx            # Task state, automatic deadlines & notifs
│   │   └── ThemeContext.jsx           # Dark / Light theme toggle
│   ├── pages/
│   │   ├── Login.jsx                  # Sign-in with quick-fill buttons
│   │   ├── Signup.jsx                 # Student self-registration (role restricted)
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx     # Metrics & Recharts visualizations
│   │   │   ├── AdminProfile.jsx       # Admin profile & credentials
│   │   │   ├── Reports.jsx            # Institutional analytics & CSV export
│   │   │   ├── TaskManagement.jsx     # Institutional task assignment
│   │   │   └── UserManagement.jsx     # Student directory & performance
│   │   └── user/
│   │       ├── Calendar.jsx           # Month/Week/Day academic calendar
│   │       ├── DailyPlanner.jsx       # Daily milestone planner
│   │       ├── KanbanBoard.jsx        # Drag-and-drop workflow board
│   │       ├── MyTasks.jsx            # Student tasks directory (Table & Grid)
│   │       ├── UserDashboard.jsx      # Student dashboard with prominent overdue list
│   │       └── UserProfile.jsx        # Student personal profile
│   ├── utils/
│   │   ├── deadlineUtils.js           # Section 6 deadline calculation logic
│   │   ├── localStorage.js            # Initial seed data & storage sync
│   │   └── taskUtils.js               # Badges, IDs & CSV export utility
│   ├── App.jsx                        # Master router configuration
│   ├── index.css                      # Tailwind base and custom utilities
│   └── main.jsx                       # Application entrypoint
├── index.html                         # HTML template with Inter typography
├── package.json                       # Dependencies & build scripts
├── postcss.config.js                  # PostCSS configuration
├── tailwind.config.js                 # Tailwind CSS theme configuration
├── test_suite.js                      # Automated specification verification test
├── vercel.json                        # Vercel SPA rewrite configuration
└── README.md                          # Documentation
```

---

## 🚀 Installation & Local Development

### Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on v24.18.0)
- **npm**: v9.0.0 or higher

### Steps to Run
1. Open your terminal and navigate to the project directory:
   ```bash
   cd taskflow
   ```
2. Install project dependencies:
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the URL shown in your terminal (typically `http://localhost:5173`).

---

## 🧪 Running the Automated Verification Suite

An automated test suite (`test_suite.js`) validates all deadline calculation requirements from Section 6 and 7:

```bash
node test_suite.js
```

**Test results verified**:
- ✅ 30-Day Task: Day 1–24 Normal, Day 25 Overdue, Day 26–30 Overdue.
- ✅ 7-Day Task: Day 1 Normal, Day 2 Overdue.
- ✅ 15-Day Task: Day 9 Normal, Day 10 Overdue.
- ✅ 60-Day Task: Day 54 Normal, Day 55 Overdue.
- ✅ Completed tasks never revert to Overdue.
- ✅ Rescheduled tasks adjust tracking while preserving original deadline.

---

## 📦 Production Build

To verify and create an optimized production build:
```bash
npm run build
```
The compiled assets will be generated in the `dist/` directory.

To test the production build locally:
```bash
npm run preview
```

---

## 🌐 Deployment Instructions

### Deploy to Vercel
This repository includes a `vercel.json` file configured with the required single-page application (SPA) rewrite:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### Option A: Via Vercel Web Dashboard (Recommended)
1. Push your repository to GitHub (see GitHub instructions below).
2. Visit [vercel.com](https://vercel.com) and log in.
3. Click **Add New Project** and select your GitHub repository.
4. Framework Preset will be automatically detected as **Vite**.
5. Click **Deploy**. Vercel will build and assign a live production URL.

#### Option B: Via Vercel CLI
1. Install the Vercel CLI globally:
   ```bash
   npm i -g vercel
   ```
2. Run `vercel` in the project root:
   ```bash
   vercel
   ```
3. Follow the CLI prompts to deploy. For production deployment, run:
   ```bash
   vercel --prod
   ```

---

## 🐙 GitHub Upload Instructions

To publish this project to GitHub:

1. Initialize a git repository (if not already initialized):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Complete TaskFlow Task Management System"
   ```
2. Create a new repository on [GitHub](https://github.com/new) named `taskflow`.
3. Link and push your local branch:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-username>/taskflow.git
   git push -u origin main
   ```

---

## 📄 Academic Integrity & Security Notice
This application is designed as an academic demonstration of modern frontend architecture, state management, and real-time reactive deadline algorithms. Local Storage is utilized for client-side persistence and demo convenience.
