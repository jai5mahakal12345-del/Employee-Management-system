import { db } from './index.ts';
import { departments, employees, attendanceLogs } from './schema.ts';
import { eq, desc, ilike, or, and } from 'drizzle-orm';

export interface EmployeeFilterOptions {
  search?: string;
  departmentId?: number;
  status?: string;
  employmentType?: string;
  presenceStatus?: string; // 'In' or 'Out'
}

export async function getDepartments() {
  try {
    return await db.select().from(departments).orderBy(departments.name);
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw new Error('Failed to fetch departments', { cause: error });
  }
}

export async function createDepartment(data: { name: string; code: string; description?: string }) {
  try {
    const result = await db
      .insert(departments)
      .values({
        name: data.name,
        code: data.code.toUpperCase(),
        description: data.description || '',
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Error creating department:', error);
    throw new Error('Failed to create department', { cause: error });
  }
}

export async function getEmployees(filters?: EmployeeFilterOptions) {
  try {
    const conditions = [];

    if (filters?.departmentId && filters.departmentId > 0) {
      conditions.push(eq(employees.departmentId, filters.departmentId));
    }

    if (filters?.status && filters.status !== 'All') {
      conditions.push(eq(employees.status, filters.status));
    }

    if (filters?.employmentType && filters.employmentType !== 'All') {
      conditions.push(eq(employees.employmentType, filters.employmentType));
    }

    if (filters?.presenceStatus && filters.presenceStatus !== 'All') {
      conditions.push(eq(employees.presenceStatus, filters.presenceStatus));
    }

    if (filters?.search && filters.search.trim().length > 0) {
      const s = `%${filters.search.trim()}%`;
      conditions.push(
        or(
          ilike(employees.firstName, s),
          ilike(employees.lastName, s),
          ilike(employees.email, s),
          ilike(employees.jobTitle, s),
          ilike(employees.employeeCode, s)
        )
      );
    }

    const query = db
      .select({
        id: employees.id,
        employeeCode: employees.employeeCode,
        firstName: employees.firstName,
        lastName: employees.lastName,
        email: employees.email,
        phone: employees.phone,
        departmentId: employees.departmentId,
        departmentName: departments.name,
        departmentCode: departments.code,
        jobTitle: employees.jobTitle,
        employmentType: employees.employmentType,
        status: employees.status,
        presenceStatus: employees.presenceStatus,
        lastEntryTime: employees.lastEntryTime,
        lastExitTime: employees.lastExitTime,
        salary: employees.salary,
        hireDate: employees.hireDate,
        location: employees.location,
        avatarUrl: employees.avatarUrl,
        bio: employees.bio,
        emergencyContact: employees.emergencyContact,
        createdAt: employees.createdAt,
        updatedAt: employees.updatedAt,
      })
      .from(employees)
      .innerJoin(departments, eq(employees.departmentId, departments.id))
      .orderBy(desc(employees.id));

    if (conditions.length > 0) {
      return await query.where(and(...conditions));
    }

    return await query;
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw new Error('Failed to fetch employees', { cause: error });
  }
}

export async function getEmployeeById(id: number) {
  try {
    const rows = await db
      .select({
        id: employees.id,
        employeeCode: employees.employeeCode,
        firstName: employees.firstName,
        lastName: employees.lastName,
        email: employees.email,
        phone: employees.phone,
        departmentId: employees.departmentId,
        departmentName: departments.name,
        departmentCode: departments.code,
        jobTitle: employees.jobTitle,
        employmentType: employees.employmentType,
        status: employees.status,
        presenceStatus: employees.presenceStatus,
        lastEntryTime: employees.lastEntryTime,
        lastExitTime: employees.lastExitTime,
        salary: employees.salary,
        hireDate: employees.hireDate,
        location: employees.location,
        avatarUrl: employees.avatarUrl,
        bio: employees.bio,
        emergencyContact: employees.emergencyContact,
        createdAt: employees.createdAt,
        updatedAt: employees.updatedAt,
      })
      .from(employees)
      .innerJoin(departments, eq(employees.departmentId, departments.id))
      .where(eq(employees.id, id));

    return rows[0] || null;
  } catch (error) {
    console.error(`Error fetching employee #${id}:`, error);
    throw new Error('Failed to fetch employee details', { cause: error });
  }
}

export async function createEmployee(data: {
  employeeCode?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentId: number;
  jobTitle: string;
  employmentType?: string;
  status?: string;
  salary: number;
  hireDate: string;
  location?: string;
  avatarUrl?: string;
  bio?: string;
  emergencyContact?: string;
}) {
  try {
    const code =
      data.employeeCode && data.employeeCode.trim() !== ''
        ? data.employeeCode.trim().toUpperCase()
        : `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

    const result = await db
      .insert(employees)
      .values({
        employeeCode: code,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone || '',
        departmentId: data.departmentId,
        jobTitle: data.jobTitle.trim(),
        employmentType: data.employmentType || 'Full-time',
        status: data.status || 'Active',
        presenceStatus: 'Out',
        salary: Number(data.salary) || 0,
        hireDate: data.hireDate || new Date().toISOString().split('T')[0],
        location: data.location || 'Headquarters',
        avatarUrl: data.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.firstName}_${data.lastName}`,
        bio: data.bio || '',
        emergencyContact: data.emergencyContact || '',
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error creating employee:', error);
    throw new Error('Failed to create employee', { cause: error });
  }
}

export async function updateEmployee(
  id: number,
  data: Partial<{
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    departmentId: number;
    jobTitle: string;
    employmentType: string;
    status: string;
    presenceStatus: string;
    salary: number;
    hireDate: string;
    location: string;
    avatarUrl: string;
    bio: string;
    emergencyContact: string;
  }>
) {
  try {
    const updatePayload: any = {
      updatedAt: new Date(),
    };

    if (data.employeeCode !== undefined) updatePayload.employeeCode = data.employeeCode.toUpperCase();
    if (data.firstName !== undefined) updatePayload.firstName = data.firstName;
    if (data.lastName !== undefined) updatePayload.lastName = data.lastName;
    if (data.email !== undefined) updatePayload.email = data.email.toLowerCase();
    if (data.phone !== undefined) updatePayload.phone = data.phone;
    if (data.departmentId !== undefined) updatePayload.departmentId = data.departmentId;
    if (data.jobTitle !== undefined) updatePayload.jobTitle = data.jobTitle;
    if (data.employmentType !== undefined) updatePayload.employmentType = data.employmentType;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.presenceStatus !== undefined) updatePayload.presenceStatus = data.presenceStatus;
    if (data.salary !== undefined) updatePayload.salary = Number(data.salary);
    if (data.hireDate !== undefined) updatePayload.hireDate = data.hireDate;
    if (data.location !== undefined) updatePayload.location = data.location;
    if (data.avatarUrl !== undefined) updatePayload.avatarUrl = data.avatarUrl;
    if (data.bio !== undefined) updatePayload.bio = data.bio;
    if (data.emergencyContact !== undefined) updatePayload.emergencyContact = data.emergencyContact;

    const result = await db
      .update(employees)
      .set(updatePayload)
      .where(eq(employees.id, id))
      .returning();

    return result[0];
  } catch (error) {
    console.error(`Error updating employee #${id}:`, error);
    throw new Error('Failed to update employee', { cause: error });
  }
}

export async function deleteEmployee(id: number) {
  try {
    // Also remove logs associated with this employee
    await db.delete(attendanceLogs).where(eq(attendanceLogs.employeeId, id));
    const result = await db.delete(employees).where(eq(employees.id, id)).returning();
    return result[0];
  } catch (error) {
    console.error(`Error deleting employee #${id}:`, error);
    throw new Error('Failed to delete employee', { cause: error });
  }
}

// Record an Entry (Clock In) or Exit (Clock Out)
export async function recordAttendanceLog(data: {
  employeeId: number;
  type: 'ENTRY' | 'EXIT';
  location?: string;
  notes?: string;
}) {
  try {
    const now = new Date();

    // 1. Insert attendance log
    const logResult = await db
      .insert(attendanceLogs)
      .values({
        employeeId: data.employeeId,
        type: data.type,
        timestamp: now,
        location: data.location || (data.type === 'ENTRY' ? 'Main Office Entrance' : 'Office Exit Turnstile'),
        notes: data.notes || '',
      })
      .returning();

    // 2. Update employee presenceStatus and timestamp
    const isEntry = data.type === 'ENTRY';
    const updatedEmployee = await db
      .update(employees)
      .set({
        presenceStatus: isEntry ? 'In' : 'Out',
        ...(isEntry ? { lastEntryTime: now } : { lastExitTime: now }),
        updatedAt: now,
      })
      .where(eq(employees.id, data.employeeId))
      .returning();

    return {
      log: logResult[0],
      employee: updatedEmployee[0],
    };
  } catch (error) {
    console.error('Error recording attendance entry/exit:', error);
    throw new Error('Failed to record attendance movement', { cause: error });
  }
}

// Get recent attendance logs
export async function getAttendanceLogs(employeeId?: number, limit = 50) {
  try {
    const baseQuery = db
      .select({
        id: attendanceLogs.id,
        employeeId: attendanceLogs.employeeId,
        type: attendanceLogs.type,
        timestamp: attendanceLogs.timestamp,
        location: attendanceLogs.location,
        notes: attendanceLogs.notes,
        firstName: employees.firstName,
        lastName: employees.lastName,
        employeeCode: employees.employeeCode,
        jobTitle: employees.jobTitle,
        departmentName: departments.name,
      })
      .from(attendanceLogs)
      .innerJoin(employees, eq(attendanceLogs.employeeId, employees.id))
      .innerJoin(departments, eq(employees.departmentId, departments.id))
      .orderBy(desc(attendanceLogs.timestamp))
      .limit(limit);

    if (employeeId && employeeId > 0) {
      return await baseQuery.where(eq(attendanceLogs.employeeId, employeeId));
    }

    return await baseQuery;
  } catch (error) {
    console.error('Error fetching attendance logs:', error);
    throw new Error('Failed to fetch attendance history', { cause: error });
  }
}

export async function getDashboardStats() {
  try {
    const all = await db
      .select({
        id: employees.id,
        status: employees.status,
        presenceStatus: employees.presenceStatus,
        employmentType: employees.employmentType,
        salary: employees.salary,
        departmentId: employees.departmentId,
        departmentName: departments.name,
      })
      .from(employees)
      .innerJoin(departments, eq(employees.departmentId, departments.id));

    const allDepts = await db.select().from(departments);

    const totalEmployees = all.length;
    const activeEmployees = all.filter((e) => e.status === 'Active' || e.status === 'Remote').length;
    const onLeaveEmployees = all.filter((e) => e.status === 'On Leave').length;
    const currentlyInOffice = all.filter((e) => e.presenceStatus === 'In').length;
    const currentlyOut = all.filter((e) => e.presenceStatus === 'Out').length;
    const totalPayroll = all.reduce((acc, curr) => acc + (curr.salary || 0), 0);
    const averageSalary = totalEmployees > 0 ? Math.round(totalPayroll / totalEmployees) : 0;

    const departmentCounts: Record<string, { count: number; name: string }> = {};
    for (const d of allDepts) {
      departmentCounts[d.name] = { count: 0, name: d.name };
    }
    for (const e of all) {
      if (departmentCounts[e.departmentName]) {
        departmentCounts[e.departmentName].count += 1;
      } else {
        departmentCounts[e.departmentName] = { count: 1, name: e.departmentName };
      }
    }

    const typeCounts: Record<string, number> = {
      'Full-time': 0,
      'Part-time': 0,
      Contract: 0,
      Intern: 0,
    };
    for (const e of all) {
      typeCounts[e.employmentType] = (typeCounts[e.employmentType] || 0) + 1;
    }

    return {
      totalEmployees,
      activeEmployees,
      onLeaveEmployees,
      currentlyInOffice,
      currentlyOut,
      totalDepartments: allDepts.length,
      averageSalary,
      totalPayroll,
      departmentDistribution: Object.values(departmentCounts),
      employmentTypeDistribution: typeCounts,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new Error('Failed to calculate employee statistics', { cause: error });
  }
}

export async function seedInitialDataIfEmpty() {
  try {
    const existingDepts = await db.select().from(departments);
    let deptMap: Record<string, number> = {};

    if (existingDepts.length === 0) {
      const insertedDepts = await db
        .insert(departments)
        .values([
          { name: 'Engineering', code: 'ENG', description: 'Software architecture, platform, and infrastructure' },
          { name: 'Product & Design', code: 'PRD', description: 'User experience, product management, and interface design' },
          { name: 'Marketing', code: 'MKT', description: 'Brand strategy, growth marketing, and communications' },
          { name: 'Sales & BD', code: 'SAL', description: 'Enterprise sales, account executive, and partnerships' },
          { name: 'Human Resources', code: 'HR', description: 'Talent acquisition, employee experience, and people ops' },
          { name: 'Finance & Ops', code: 'FIN', description: 'Financial planning, accounting, and legal operations' },
        ])
        .returning();

      for (const d of insertedDepts) {
        deptMap[d.name] = d.id;
      }
    } else {
      for (const d of existingDepts) {
        deptMap[d.name] = d.id;
      }
    }

    const existingEmployees = await db.select().from(employees);
    if (existingEmployees.length === 0 && Object.keys(deptMap).length > 0) {
      const now = new Date();
      const morning8 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 45, 0);
      const morning9 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 15, 0);

      const inserted = await db.insert(employees).values([
        {
          employeeCode: 'EMP-1001',
          firstName: 'Elena',
          lastName: 'Rostova',
          email: 'elena.rostova@acme.corp',
          phone: '+1 (555) 234-8901',
          departmentId: deptMap['Engineering'] || Object.values(deptMap)[0],
          jobTitle: 'Principal Cloud Architect',
          employmentType: 'Full-time',
          status: 'Active',
          presenceStatus: 'In',
          lastEntryTime: morning8,
          salary: 168000,
          hireDate: '2022-03-15',
          location: 'San Francisco, CA',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&crop=faces',
          bio: 'Leads distributed backend systems and Cloud SQL database architecture with 10+ years experience.',
          emergencyContact: 'Alex Rostova (+1 555-234-8909)',
        },
        {
          employeeCode: 'EMP-1002',
          firstName: 'Marcus',
          lastName: 'Vance',
          email: 'marcus.vance@acme.corp',
          phone: '+1 (555) 345-6789',
          departmentId: deptMap['Product & Design'] || Object.values(deptMap)[0],
          jobTitle: 'Head of Product Design',
          employmentType: 'Full-time',
          status: 'Active',
          presenceStatus: 'In',
          lastEntryTime: morning9,
          salary: 152000,
          hireDate: '2021-08-10',
          location: 'New York, NY',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&fit=crop&crop=faces',
          bio: 'Passionate about crafting intuitive enterprise tools and clean design systems.',
          emergencyContact: 'Sarah Vance (+1 555-345-6780)',
        },
        {
          employeeCode: 'EMP-1003',
          firstName: 'Aaliyah',
          lastName: 'Patel',
          email: 'aaliyah.patel@acme.corp',
          phone: '+1 (555) 456-7890',
          departmentId: deptMap['Engineering'] || Object.values(deptMap)[0],
          jobTitle: 'Senior Full Stack Engineer',
          employmentType: 'Full-time',
          status: 'Remote',
          presenceStatus: 'In',
          lastEntryTime: morning9,
          salary: 142000,
          hireDate: '2023-01-20',
          location: 'Austin, TX',
          avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&fit=crop&crop=faces',
          bio: 'Specializes in React, Node.js microservices, and database performance optimization.',
          emergencyContact: 'Kavita Patel (+1 555-456-7899)',
        },
        {
          employeeCode: 'EMP-1004',
          firstName: 'David',
          lastName: 'Kim',
          email: 'david.kim@acme.corp',
          phone: '+1 (555) 567-8901',
          departmentId: deptMap['Human Resources'] || Object.values(deptMap)[0],
          jobTitle: 'Director of People & Culture',
          employmentType: 'Full-time',
          status: 'Active',
          presenceStatus: 'Out',
          lastExitTime: morning8,
          salary: 135000,
          hireDate: '2020-05-18',
          location: 'Headquarters',
          avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&fit=crop&crop=faces',
          bio: 'Fosters high-performing team culture, onboarding excellence, and inclusive workplace policies.',
          emergencyContact: 'Grace Kim (+1 555-567-8908)',
        },
        {
          employeeCode: 'EMP-1005',
          firstName: 'Sophia',
          lastName: 'Hernandez',
          email: 'sophia.hernandez@acme.corp',
          phone: '+1 (555) 678-9012',
          departmentId: deptMap['Marketing'] || Object.values(deptMap)[0],
          jobTitle: 'Growth Marketing Lead',
          employmentType: 'Full-time',
          status: 'On Leave',
          presenceStatus: 'Out',
          salary: 125000,
          hireDate: '2022-11-04',
          location: 'Seattle, WA',
          avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&fit=crop&crop=faces',
          bio: 'Drives customer acquisition campaigns, brand storytelling, and product-led growth metrics.',
          emergencyContact: 'Mateo Hernandez (+1 555-678-9010)',
        },
        {
          employeeCode: 'EMP-1006',
          firstName: 'James',
          lastName: 'O\'Connor',
          email: 'james.oconnor@acme.corp',
          phone: '+1 (555) 789-0123',
          departmentId: deptMap['Finance & Ops'] || Object.values(deptMap)[0],
          jobTitle: 'Senior Financial Analyst',
          employmentType: 'Full-time',
          status: 'Active',
          presenceStatus: 'In',
          lastEntryTime: morning8,
          salary: 128000,
          hireDate: '2023-04-12',
          location: 'Headquarters',
          avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&fit=crop&crop=faces',
          bio: 'Oversees budget forecasts, financial audits, and operational runway modeling.',
          emergencyContact: 'Claire O\'Connor (+1 555-789-0120)',
        },
        {
          employeeCode: 'EMP-1007',
          firstName: 'Liam',
          lastName: 'Chen',
          email: 'liam.chen@acme.corp',
          phone: '+1 (555) 890-1234',
          departmentId: deptMap['Engineering'] || Object.values(deptMap)[0],
          jobTitle: 'DevOps & Site Reliability Engineer',
          employmentType: 'Contract',
          status: 'Remote',
          presenceStatus: 'Out',
          salary: 110000,
          hireDate: '2024-02-01',
          location: 'Toronto, Canada',
          avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&fit=crop&crop=faces',
          bio: 'Manages CI/CD pipelines, Kubernetes deployments, and Cloud SQL connection health.',
          emergencyContact: 'Mei Chen (+1 555-890-1230)',
        },
        {
          employeeCode: 'EMP-1008',
          firstName: 'Amara',
          lastName: 'Nwosu',
          email: 'amara.nwosu@acme.corp',
          phone: '+1 (555) 901-2345',
          departmentId: deptMap['Sales & BD'] || Object.values(deptMap)[0],
          jobTitle: 'Senior Enterprise Account Executive',
          employmentType: 'Full-time',
          status: 'Active',
          presenceStatus: 'In',
          lastEntryTime: morning9,
          salary: 145000,
          hireDate: '2022-09-15',
          location: 'Chicago, IL',
          avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&fit=crop&crop=faces',
          bio: 'Drives key enterprise software contracts and revenue partnerships across North America.',
          emergencyContact: 'Chidi Nwosu (+1 555-901-2340)',
        },
      ]).returning();

      // Seed initial attendance entries for initial employees
      for (const emp of inserted) {
        if (emp.presenceStatus === 'In') {
          await db.insert(attendanceLogs).values({
            employeeId: emp.id,
            type: 'ENTRY',
            timestamp: emp.lastEntryTime || morning8,
            location: 'Main Office Turnstile A',
            notes: 'Badge scan entry',
          });
        }
      }
    }
  } catch (error) {
    console.warn('Initial seeding note (non-fatal):', error);
  }
}
