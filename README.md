# 🏫 Kalnet FS3 — School Management Admin Dashboard

A high-end, dark-themed **School Management Administrative Dashboard** built with **Next.js 16**, **Tailwind CSS v4**, and **Recharts**. It provides role-based access control (RBAC), rich analytics, interactive reports, and a polished glassmorphism UI.

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

Custom Tailwind utilities include:
- `.glass-panel` — frosted-glass card style with backdrop blur
- `.stat-card` — metric card with hover lift animation
- `.btn-primary` / `.btn-ghost` — consistent button styles

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Login / Role selection screen
│   ├── layout.tsx                # Root layout with AuthProvider
│   ├── globals.css               # Design tokens & global styles
│   └── admin/
│       ├── layout.tsx            # Admin shell: sidebar + header + RBAC guard
│       ├── dashboard/page.tsx    # Overview metrics & charts
│       ├── users/page.tsx        # User management table
│       └── reports/page.tsx      # Reports table with CSV export
├── components/
│   ├── MetricCard.tsx            # Reusable KPI stat card
│   ├── TrendChart.tsx            # Admissions + Fees mixed chart
│   └── ActivityChart.tsx        # Weekly activity area chart
└── context/
    └── AuthContext.tsx           # Global auth state (role management)
```

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js** v18 or later
- **npm** v9 or later

### Installation

```bash
# Clone the repository
git clone https://github.com/VAshwithreddy/kalnet-fs3-dashboard.git
cd kalnet-fs3-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## 🔑 How to Use

1. Open the app — you will see the **role selection login screen**
2. Click **"Log in as Admin"** to access the full dashboard
3. Use the **sidebar** to navigate between Dashboard, Users, Reports, etc.
4. On the **Reports** page, use the category filter tabs and click **Export CSV** to download data
5. Click **Log out** in the sidebar footer to return to the login screen
6. Try **"Log in as Teacher"** — you will be blocked by the 403 Access Forbidden screen

---

## 📝 Changes Made

### UI Overhaul
- Migrated global CSS to **Tailwind CSS v4** syntax with CSS custom properties
- Implemented a cohesive **dark-mode color palette** with glassmorphism effects
- Added `backdrop-blur`, gradient glows, and smooth hover transitions throughout

### School Management Domain
- Replaced generic metrics with **6 school-specific KPI cards** (Students, Teachers, Events, Fees, Admissions, Attendance)
- Added **combined Bar + Line trend chart** for Admissions vs. Fee Collections per month

### RBAC System
- Built `AuthContext` to manage role state globally across the app
- Admin layout enforces role checks and renders a **403 screen** for non-admins
- Login page allows quick role simulation without a backend

### Reports Feature
- Built an interactive **filterable reports table** with category tabs
- Implemented **CSV export** that respects the active filter selection

### User Management
- Created a **user listing table** with role badges, status indicators, and action buttons

---

## 📜 License

MIT — feel free to use, modify, and distribute.
