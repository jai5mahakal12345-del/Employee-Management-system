import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table (synced with Firebase Auth)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').default('Admin'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Departments table
export const departments = pgTable('departments', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  code: text('code').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Employees table
export const employees = pgTable('employees', {
  id: serial('id').primaryKey(),
  employeeCode: text('employee_code').notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  departmentId: integer('department_id')
    .references(() => departments.id)
    .notNull(),
  jobTitle: text('job_title').notNull(),
  employmentType: text('employment_type').notNull().default('Full-time'), // Full-time, Part-time, Contract, Intern
  status: text('status').notNull().default('Active'), // Active, On Leave, Remote, Terminated
  presenceStatus: text('presence_status').notNull().default('Out'), // 'In' (Entered/Present), 'Out' (Exited/Away)
  lastEntryTime: timestamp('last_entry_time'),
  lastExitTime: timestamp('last_exit_time'),
  salary: integer('salary').notNull().default(0),
  hireDate: text('hire_date').notNull(), // Format: YYYY-MM-DD
  location: text('location').default('Headquarters'),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  emergencyContact: text('emergency_contact'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Attendance Logs table (entry and exit logs with timestamps)
export const attendanceLogs = pgTable('attendance_logs', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id')
    .references(() => employees.id)
    .notNull(),
  type: text('type').notNull(), // 'ENTRY' or 'EXIT'
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  location: text('location').default('Main Campus Entrance'),
  notes: text('notes'),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({}));

export const departmentsRelations = relations(departments, ({ many }) => ({
  employees: many(employees),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  department: one(departments, {
    fields: [employees.departmentId],
    references: [departments.id],
  }),
  attendanceLogs: many(attendanceLogs),
}));

export const attendanceLogsRelations = relations(attendanceLogs, ({ one }) => ({
  employee: one(employees, {
    fields: [attendanceLogs.employeeId],
    references: [employees.id],
  }),
}));
