import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { optionalAuth, requireAuth, type AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser } from './src/db/users.ts';
import {
  getDepartments,
  createDepartment,
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getDashboardStats,
  seedInitialDataIfEmpty,
  recordAttendanceLog,
  getAttendanceLogs,
} from './src/db/employees.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize seed data once asynchronously
seedInitialDataIfEmpty().catch((err) => {
  console.warn('Initial seed non-blocking status:', err?.message);
});

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// User sync (called on client login)
app.post('/api/auth/sync', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { uid, email, name } = req.body;
    const targetUid = req.user?.uid || uid;
    const targetEmail = req.user?.email || email;

    if (!targetUid || !targetEmail) {
      return res.status(400).json({ error: 'UID and Email are required' });
    }

    const user = await getOrCreateUser(targetUid, targetEmail, name || req.user?.name);
    res.json({ success: true, user });
  } catch (error: any) {
    console.error('Failed to sync user:', error);
    res.status(500).json({ error: 'Failed to synchronize user account' });
  }
});

// Get aggregated employee metrics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (error: any) {
    console.error('Failed to fetch employee statistics:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
});

// Departments list
app.get('/api/departments', async (req, res) => {
  try {
    const departments = await getDepartments();
    res.json(departments);
  } catch (error: any) {
    console.error('Failed to fetch departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// Create new department
app.post('/api/departments', async (req, res) => {
  try {
    const { name, code, description } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: 'Department name and code are required' });
    }
    const newDept = await createDepartment({ name, code, description });
    res.status(201).json(newDept);
  } catch (error: any) {
    console.error('Failed to create department:', error);
    res.status(500).json({ error: error.message || 'Failed to create department' });
  }
});

// Get employees with query filters
app.get('/api/employees', async (req, res) => {
  try {
    const { search, departmentId, status, employmentType } = req.query;

    const filters = {
      search: typeof search === 'string' ? search : undefined,
      departmentId: departmentId ? Number(departmentId) : undefined,
      status: typeof status === 'string' ? status : undefined,
      employmentType: typeof employmentType === 'string' ? employmentType : undefined,
    };

    const employees = await getEmployees(filters);
    res.json(employees);
  } catch (error: any) {
    console.error('Failed to fetch employees:', error);
    res.status(500).json({ error: 'Failed to retrieve employee directory' });
  }
});

// Get single employee
app.get('/api/employees/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid employee ID' });
    }

    const employee = await getEmployeeById(id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(employee);
  } catch (error: any) {
    console.error(`Failed to fetch employee #${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to retrieve employee profile' });
  }
});

// Create new employee
app.post('/api/employees', async (req, res) => {
  try {
    const {
      employeeCode,
      firstName,
      lastName,
      email,
      phone,
      departmentId,
      jobTitle,
      employmentType,
      status,
      salary,
      hireDate,
      location,
      avatarUrl,
      bio,
      emergencyContact,
    } = req.body;

    if (!firstName || !lastName || !email || !departmentId || !jobTitle) {
      return res.status(400).json({
        error: 'First name, last name, email, department, and job title are required.',
      });
    }

    const newEmployee = await createEmployee({
      employeeCode,
      firstName,
      lastName,
      email,
      phone,
      departmentId: Number(departmentId),
      jobTitle,
      employmentType,
      status,
      salary: Number(salary) || 0,
      hireDate: hireDate || new Date().toISOString().split('T')[0],
      location,
      avatarUrl,
      bio,
      emergencyContact,
    });

    res.status(201).json(newEmployee);
  } catch (error: any) {
    console.error('Failed to create employee:', error);
    res.status(500).json({ error: error.message || 'Failed to create employee' });
  }
});

// Update employee
app.put('/api/employees/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid employee ID' });
    }

    const updated = await updateEmployee(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(updated);
  } catch (error: any) {
    console.error(`Failed to update employee #${req.params.id}:`, error);
    res.status(500).json({ error: error.message || 'Failed to update employee' });
  }
});

// Delete employee
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid employee ID' });
    }

    const deleted = await deleteEmployee(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ success: true, message: 'Employee removed successfully', employee: deleted });
  } catch (error: any) {
    console.error(`Failed to delete employee #${req.params.id}:`, error);
    res.status(500).json({ error: error.message || 'Failed to delete employee' });
  }
});

// Attendance: Record Entry (Clock In) or Exit (Clock Out)
app.post('/api/employees/:id/attendance', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid employee ID' });
    }

    const { type, location, notes } = req.body;
    if (type !== 'ENTRY' && type !== 'EXIT') {
      return res.status(400).json({ error: "Type must be 'ENTRY' or 'EXIT'" });
    }

    const result = await recordAttendanceLog({
      employeeId: id,
      type,
      location,
      notes,
    });

    res.json({
      success: true,
      message: `Employee successfully registered ${type === 'ENTRY' ? 'ENTRY (Check-In)' : 'EXIT (Check-Out)'}`,
      ...result,
    });
  } catch (error: any) {
    console.error(`Failed to record attendance for employee #${req.params.id}:`, error);
    res.status(500).json({ error: error.message || 'Failed to record entry/exit movement' });
  }
});

// Attendance Logs: Get attendance history
app.get('/api/attendance-logs', async (req, res) => {
  try {
    const { employeeId, limit } = req.query;
    const empId = employeeId ? parseInt(employeeId as string, 10) : undefined;
    const lim = limit ? parseInt(limit as string, 10) : 50;

    const logs = await getAttendanceLogs(empId, lim);
    res.json(logs);
  } catch (error: any) {
    console.error('Failed to fetch attendance logs:', error);
    res.status(500).json({ error: 'Failed to retrieve attendance logs' });
  }
});

// Setup Vite middleware in dev or serve static build in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
  });
}

startServer();
