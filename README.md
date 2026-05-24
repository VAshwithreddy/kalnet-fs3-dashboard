# 🏫 Kalnet FS3 — School Management Admin Dashboard

A high-end, dark-themed **School Management Administrative Dashboard** built with **Next.js**, **Tailwind CSS v4**, and **Recharts**. It provides role-based access control (RBAC), rich analytics, interactive reports, and a polished glassmorphism UI.

---

## 🚀 Features

### 🔐 Authentication & Role-Based Access Control (RBAC)
- **Simulated login screen** with two selectable roles: **Admin** and **Teacher**
- Admin role gets full access to all dashboard sections
- Teacher role is blocked with a **403 – Access Forbidden** screen
- Auth state is managed globally via React Context (`AuthContext`)

### 📊 Dashboard Overview (`/admin/dashboard`)
- **6 school-specific metric cards**, each displaying:
  - Total Students
  - Active Teachers
  - Upcoming Events
  - Pending Fee Payments
  - New Admissions (this month)
  - Average Attendance Rate
- **Mixed Trend Chart** — Combined bar + line chart showing monthly Admissions vs. Fee Collections
- **Activity Chart** — Visualises platform activity over the past week

### 👥 User Management (`/admin/users`)
- Tabular list of school staff with columns: Name, Role, Status, Last Active
- Role badges with color-coded labels (`Admin`, `Teacher`, `Staff`)
- Active / Inactive status indicators
- Action buttons for editing and deleting users (UI-ready)
- **Role-based controls**: only Admins can see privileged actions

### 📄 Reports (`/admin/reports`)
- Filterable reports table (filter by category: Attendance, Finance, Academic, Events)
- Displays report title, category badge, date, and status (Published / Draft / Pending)
- **CSV Export** — one-click download of the filtered report list as a `.csv` file
- Report counts and metadata shown per filter

### 🗂️ Sidebar Navigation
- Fixed sidebar with icon + label navigation links:
  - Dashboard · Users · Activity · Reports · Settings
- Active-route highlighting with primary color accent
- User profile section at the bottom with logout button
- **Responsive transitions** on hover states

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.2.4 | Full-stack React framework (App Router) |
| **React** | 19.2.4 | UI library |
| **Tailwind CSS** | v4 | Utility-first styling |
| **Recharts** | ^3.8.1 | Chart components (Bar, Line, Area) |
| **Framer Motion** | ^12 | Animations & micro-interactions |
| **Lucide React** | ^1.8 | Icon library |
| **TypeScript** | ^5 | Type safety |
| **Prisma** | ^6.19.3 | ORM and database connection |

---

## 🎨 Design System

The UI uses a **dark-mode glassmorphism** design system defined in `globals.css`:

| Token | Description |
|---|---|
| `--color-bg-app` | Main background (`#0B0C0F`) |
| `--color-bg-card` | Card surface (`#13151A`) |
| `--color-primary` | Brand accent (`#6366F1` – indigo) |
| `--color-sidebar` | Sidebar background (`#0F1014`) |
| `--color-danger` | Error / forbidden color (`#EF4444`) |
| `--color-success` | Positive metric color (`#22C55E`) |

---

## ⚙️ Local Setup

### Prerequisites
- **Node.js** v18 or later
- **pnpm** package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/VAshwithreddy/kalnet-fs3-dashboard.git
cd kalnet-fs3-dashboard

# Install dependencies
pnpm install

# Setup database (SQLite)
pnpm prisma generate
pnpm prisma db push
pnpm tsx prisma/seed.ts # to populate test data

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 How to Use

1. Open the app — you will see the **role selection login screen**
2. Click **"Log in as Admin"** to access the full dashboard
3. Use the **sidebar** to navigate between Dashboard, Users, Reports, etc.
4. On the **Reports** page, use the category filter tabs and click **Export CSV** to download data
5. Click **Log out** in the sidebar footer to return to the login screen
6. Try **"Log in as Teacher"** — you will be blocked by the 403 Access Forbidden screen

