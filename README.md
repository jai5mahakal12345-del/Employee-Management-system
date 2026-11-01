# StaffPulse - Enterprise Employee Management System

> Modern, full-stack Employee Management and Attendance Tracking System built with React 19, TypeScript, Express, Tailwind CSS, and PostgreSQL (via Drizzle ORM).

![StaffPulse Banner](https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80)

## Overview

**StaffPulse** is an enterprise-grade web application designed for HR departments, operations teams, and engineering managers to streamline employee records, monitor real-time entry and exit attendance movements, track compensation metrics, and manage departmental structures with high-performance relational database persistence.

---

## Key Features

- **Employee Directory Management**:
  - Full CRUD operations: Create, View, Update, and Delete employee profiles.
  - Comprehensive employee fields: Name, Email, Phone, Employee ID Code, Department, Job Title, Employment Type, Status, Annual Salary, Hire Date, Primary Location, Bio, and Emergency Contact.
  - Dual viewing modes: High-density data table view and visual card grid view.

- **Independent Employment Status vs. Physical Entry/Exit**:
  - **Work Status Tracking**: Clearly distinguishes between `Active`, `On Leave`, `Remote`, and `Terminated` status with quick inline selectors.
  - **Live Presence & Attendance Movement**: Separate tracking for physical entrance (`🟢 Entered / In`) and departure (`⚪ Exited / Out`) with live entry/exit timestamps.
  - **One-Click Clock In / Clock Out**: Quick attendance recording directly from table rows, card widgets, or the employee profile drawer.

- **Audited Access & Movement Logs (`attendance_logs`)**:
  - Dedicated access ledger recording exact movement types (`ENTRY` vs. `EXIT`), timestamps, turnstile/access points, and notes.
  - Interactive search and movement-type filtering (`All`, `Entries Only`, `Exits Only`).

- **Executive Analytics & KPI Metrics**:
  - Live calculations for total headcount, in-office presence count, active workforce, total payroll expenditure, and average annual salary.
  - Real-time department distribution and employment type breakdown.

- **Organizational Department Control**:
  - Manage company departments with unique department codes (e.g. `ENG`, `PRD`, `MKT`, `SAL`, `HR`, `FIN`) and headcount counters.

- **Directory Export**:
  - One-click CSV export containing full employee profiles, employment status, and entry/exit timestamps.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS, Lucide React Icons |
| **Backend** | Express 4, Node.js (native ESM) |
| **Database** | PostgreSQL / Google Cloud SQL |
| **ORM & Migrations** | Drizzle ORM (`drizzle-orm`), Drizzle Kit (`drizzle-kit`), `pg` |
| **Authentication** | Firebase Authentication (Client & Admin SDK) |
| **Build Tooling** | Vite 8, TSX |

---

## Project Structure

```
employee-management/
├── .env.example                # Sample database and server configuration
├── firebase-applet-config.json # Firebase client & admin configuration
├── index.html                  # HTML entry point with metadata
├── package.json                # Dependencies and scripts
├── server.ts                   # Express web server & REST API
├── tsconfig.json               # TypeScript compiler options
├── vite.config.ts              # Vite build setup with Tailwind CSS
└── src/
    ├── App.tsx                 # Main application orchestrator
    ├── index.css               # Global Tailwind CSS imports
    ├── main.tsx                # React DOM mount point
    ├── components/             # Reusable UI components
    │   ├── AttendanceLogsModal.tsx
    │   ├── DepartmentModal.tsx
    │   ├── EmployeeDetailDrawer.tsx
    │   ├── EmployeeGrid.tsx
    │   ├── EmployeeModal.tsx
    │   ├── EmployeeTable.tsx
    │   ├── FilterToolbar.tsx
    │   ├── Navbar.tsx
    │   └── StatsCards.tsx
    ├── context/                # React Context providers (AuthContext)
    ├── db/                     # Relational schema, pool, and queries
    │   ├── drizzle.config.ts
    │   ├── employees.ts
    │   ├── index.ts
    │   ├── schema.ts
    │   └── users.ts
    ├── lib/                    # Firebase client and admin instances
    ├── middleware/             # Express token verification middleware
    └── types/                  # TypeScript interface definitions
```

---

## Getting Started

### 1. Prerequisites
- Node.js (version 20 or higher recommended)
- PostgreSQL database (local or Cloud SQL)

### 2. Installation
Clone the repository and install packages:
```bash
git clone https://github.com/your-username/staffpulse-employee-management.git
cd staffpulse-employee-management
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update your database credentials in `.env`:
```env
SQL_HOST="localhost"
SQL_DB_NAME="employee_management"
SQL_USER="postgres"
SQL_PASSWORD="your_password"
SQL_ADMIN_USER="postgres"
SQL_ADMIN_PASSWORD="your_password"
PORT=3000
```

### 4. Database Setup
Push the Drizzle ORM schema to your database:
```bash
npm run db:push
```

### 5. Run the Application
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status check |
| `GET` | `/api/stats` | Aggregated dashboard KPI metrics |
| `GET` | `/api/departments` | List all departments |
| `POST` | `/api/departments` | Create a new department |
| `GET` | `/api/employees` | Search and filter employees |
| `GET` | `/api/employees/:id` | Get employee profile details |
| `POST` | `/api/employees` | Register a new employee |
| `PUT` | `/api/employees/:id` | Update an existing employee record |
| `DELETE` | `/api/employees/:id` | Remove an employee record |
| `POST` | `/api/employees/:id/attendance` | Record an Entry (`ENTRY`) or Exit (`EXIT`) |
| `GET` | `/api/attendance-logs` | Retrieve entry/exit movement history |

---

## License

This project is licensed under the MIT License.
