export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  createdAt?: string;
}

export interface Employee {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  departmentId: number;
  departmentName?: string;
  departmentCode?: string;
  jobTitle: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Intern' | string;
  status: 'Active' | 'On Leave' | 'Remote' | 'Terminated' | string;
  presenceStatus: 'In' | 'Out' | string; // 'In' = Entered/Present, 'Out' = Exited/Away
  lastEntryTime?: string | null;
  lastExitTime?: string | null;
  salary: number;
  hireDate: string;
  location?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  emergencyContact?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceLog {
  id: number;
  employeeId: number;
  type: 'ENTRY' | 'EXIT';
  timestamp: string;
  location: string;
  notes?: string | null;
  firstName: string;
  lastName: string;
  employeeCode: string;
  jobTitle: string;
  departmentName: string;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
  currentlyInOffice: number;
  currentlyOut: number;
  totalDepartments: number;
  averageSalary: number;
  totalPayroll: number;
  departmentDistribution: { name: string; count: number }[];
  employmentTypeDistribution: Record<string, number>;
}
