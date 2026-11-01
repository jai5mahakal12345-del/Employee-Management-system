import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AuthProvider } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { StatsCards } from './components/StatsCards.tsx';
import { FilterToolbar } from './components/FilterToolbar.tsx';
import { EmployeeTable } from './components/EmployeeTable.tsx';
import { EmployeeGrid } from './components/EmployeeGrid.tsx';
import { EmployeeModal } from './components/EmployeeModal.tsx';
import { EmployeeDetailDrawer } from './components/EmployeeDetailDrawer.tsx';
import { DepartmentModal } from './components/DepartmentModal.tsx';
import { AttendanceLogsModal } from './components/AttendanceLogsModal.tsx';
import { Employee, Department, DashboardStats, AttendanceLog } from './types/employee.ts';
import { AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';

export function EmployeeApp() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Filters & Views
  const [search, setSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedPresence, setSelectedPresence] = useState('All'); // 'All' | 'In' | 'Out'
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Modals & Drawers
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [selectedEmployeeForDetail, setSelectedEmployeeForDetail] = useState<Employee | null>(null);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [empRes, deptRes, statsRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/departments'),
        fetch('/api/stats'),
      ]);

      if (!empRes.ok || !deptRes.ok) {
        throw new Error('Failed to load records from server');
      }

      const empData = await empRes.json();
      const deptData = await deptRes.json();
      const statsData = statsRes.ok ? await statsRes.json() : null;

      setEmployees(empData);
      setDepartments(deptData);
      setStats(statsData);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      showToast(err.message || 'Error communicating with database', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAttendanceLogs = useCallback(async () => {
    try {
      setLoadingLogs(true);
      const res = await fetch('/api/attendance-logs');
      if (res.ok) {
        const data = await res.json();
        setAttendanceLogs(data);
      }
    } catch (err) {
      console.warn('Failed to load attendance logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadAttendanceLogs();
  }, [loadData, loadAttendanceLogs]);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (selectedDepartment !== 0 && emp.departmentId !== selectedDepartment) {
        return false;
      }
      if (selectedStatus !== 'All' && emp.status !== selectedStatus) {
        return false;
      }
      if (selectedType !== 'All' && emp.employmentType !== selectedType) {
        return false;
      }
      if (selectedPresence !== 'All' && emp.presenceStatus !== selectedPresence) {
        return false;
      }
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
        const matchName = fullName.includes(query);
        const matchEmail = emp.email.toLowerCase().includes(query);
        const matchCode = emp.employeeCode.toLowerCase().includes(query);
        const matchRole = emp.jobTitle.toLowerCase().includes(query);
        const matchDept = (emp.departmentName || '').toLowerCase().includes(query);
        if (!matchName && !matchEmail && !matchCode && !matchRole && !matchDept) {
          return false;
        }
      }
      return true;
    });
  }, [employees, selectedDepartment, selectedStatus, selectedType, selectedPresence, search]);

  // Employee counts per department
  const employeeCountByDept = useMemo(() => {
    const map: Record<string, number> = {};
    for (const emp of employees) {
      const dName = emp.departmentName || 'General';
      map[dName] = (map[dName] || 0) + 1;
    }
    return map;
  }, [employees]);

  // Employment status counts (Active, On Leave, Remote)
  const statusCounts = useMemo(() => {
    return {
      all: employees.length,
      active: employees.filter((e) => e.status === 'Active').length,
      onLeave: employees.filter((e) => e.status === 'On Leave').length,
      remote: employees.filter((e) => e.status === 'Remote').length,
    };
  }, [employees]);

  // Handlers
  const handleOpenAddEmployee = () => {
    setEmployeeToEdit(null);
    setIsEmployeeModalOpen(true);
  };

  const handleEditEmployee = (emp: Employee) => {
    setEmployeeToEdit(emp);
    setIsEmployeeModalOpen(true);
    if (selectedEmployeeForDetail?.id === emp.id) {
      setSelectedEmployeeForDetail(null);
    }
  };

  const handleSaveEmployee = async (formData: any) => {
    if (employeeToEdit) {
      // Update
      const res = await fetch(`/api/employees/${employeeToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update employee');
      }
      const updated = await res.json();
      showToast(`Employee ${updated.firstName} ${updated.lastName} updated successfully.`);
    } else {
      // Create
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create employee');
      }
      const created = await res.json();
      showToast(`Employee ${created.firstName} ${created.lastName} registered successfully.`);
    }
    await loadData();
  };

  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/employees/${employeeToDelete.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete record');
      }
      showToast(`Removed employee ${employeeToDelete.firstName} ${employeeToDelete.lastName}.`);
      setEmployeeToDelete(null);
      if (selectedEmployeeForDetail?.id === employeeToDelete.id) {
        setSelectedEmployeeForDetail(null);
      }
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Delete operation failed', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleQuickStatusChange = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Status update failed');
      const updated = await res.json();
      if (selectedEmployeeForDetail && selectedEmployeeForDetail.id === id) {
        setSelectedEmployeeForDetail(updated);
      }
      showToast(`Employment status set to ${status}`);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Could not update status', 'error');
    }
  };

  // Toggle Entry (Clock In) or Exit (Clock Out)
  const handleToggleAttendance = async (emp: Employee) => {
    const isCurrentlyIn = emp.presenceStatus === 'In';
    const nextType: 'ENTRY' | 'EXIT' = isCurrentlyIn ? 'EXIT' : 'ENTRY';

    try {
      const res = await fetch(`/api/employees/${emp.id}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: nextType,
          location: 'Front Turnstile Access Point',
          notes: nextType === 'ENTRY' ? 'Morning Check-In' : 'End of Day Exit',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to record entry/exit movement');
      }

      const data = await res.json();
      showToast(
        nextType === 'ENTRY'
          ? `🟢 ${emp.firstName} ${emp.lastName} clocked IN (Entry recorded)`
          : `⚪ ${emp.firstName} ${emp.lastName} clocked OUT (Exit recorded)`
      );

      if (selectedEmployeeForDetail && selectedEmployeeForDetail.id === emp.id) {
        setSelectedEmployeeForDetail(data.employee);
      }

      await loadData();
      await loadAttendanceLogs();
    } catch (err: any) {
      showToast(err.message || 'Attendance recording failed', 'error');
    }
  };

  const handleRecordAttendance = async (id: number, type: 'ENTRY' | 'EXIT') => {
    try {
      const res = await fetch(`/api/employees/${id}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          location: type === 'ENTRY' ? 'Main Building Turnstile' : 'Front Desk Exit',
          notes: `Status changed to ${type}`,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to record attendance');
      }

      const data = await res.json();
      showToast(
        type === 'ENTRY'
          ? `🟢 Clocked IN (Entry registered)`
          : `⚪ Clocked OUT (Exit registered)`
      );

      if (selectedEmployeeForDetail && selectedEmployeeForDetail.id === id) {
        setSelectedEmployeeForDetail(data.employee);
      }

      await loadData();
      await loadAttendanceLogs();
    } catch (err: any) {
      showToast(err.message || 'Attendance recording failed', 'error');
    }
  };

  const handleAddDepartment = async (deptData: { name: string; code: string; description: string }) => {
    const res = await fetch('/api/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deptData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add department');
    }
    showToast(`Department ${deptData.name} created.`);
    await loadData();
  };

  const handleExportCsv = () => {
    if (employees.length === 0) {
      showToast('No records to export', 'error');
      return;
    }
    const headers = [
      'ID',
      'Employee Code',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Department',
      'Job Title',
      'Employment Type',
      'Status',
      'Entry/Exit Presence',
      'Last Entry Timestamp',
      'Last Exit Timestamp',
      'Annual Salary',
      'Hire Date',
      'Location',
    ];
    const rows = filteredEmployees.map((e) => [
      e.id,
      `"${e.employeeCode}"`,
      `"${e.firstName}"`,
      `"${e.lastName}"`,
      `"${e.email}"`,
      `"${e.phone || ''}"`,
      `"${e.departmentName || ''}"`,
      `"${e.jobTitle}"`,
      `"${e.employmentType}"`,
      `"${e.status}"`,
      `"${e.presenceStatus === 'In' ? 'Present (In)' : 'Exited (Out)'}"`,
      `"${e.lastEntryTime || ''}"`,
      `"${e.lastExitTime || ''}"`,
      e.salary,
      `"${e.hireDate}"`,
      `"${e.location || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `employees_attendance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Employee directory & entry/exit status exported to CSV.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 px-4 py-3 rounded-xl shadow-xl border bg-slate-900 text-sm transition-all animate-bounce">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span className="text-slate-200">{toastMessage.text}</span>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        onAddEmployee={handleOpenAddEmployee}
        onManageDepartments={() => setIsDeptModalOpen(true)}
        onViewAttendanceLogs={() => {
          loadAttendanceLogs();
          setIsAttendanceModalOpen(true);
        }}
        employeeCount={employees.length}
        inOfficeCount={stats?.currentlyInOffice || 0}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Stats Overview */}
        <StatsCards stats={stats} loading={loading} />

        {/* Filters and View controls */}
        <FilterToolbar
          search={search}
          onSearchChange={setSearch}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={setSelectedDepartment}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          selectedPresence={selectedPresence}
          onPresenceChange={setSelectedPresence}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          departments={departments}
          onRefresh={loadData}
          onExportCsv={handleExportCsv}
          totalFiltered={filteredEmployees.length}
          statusCounts={statusCounts}
        />

        {/* Directory View */}
        {viewMode === 'table' ? (
          <EmployeeTable
            employees={filteredEmployees}
            loading={loading}
            onView={(emp) => setSelectedEmployeeForDetail(emp)}
            onEdit={handleEditEmployee}
            onDelete={(emp) => setEmployeeToDelete(emp)}
            onToggleAttendance={handleToggleAttendance}
            onWorkStatusChange={(emp, st) => handleQuickStatusChange(emp.id, st)}
          />
        ) : (
          <EmployeeGrid
            employees={filteredEmployees}
            loading={loading}
            onView={(emp) => setSelectedEmployeeForDetail(emp)}
            onEdit={handleEditEmployee}
            onDelete={(emp) => setEmployeeToDelete(emp)}
            onToggleAttendance={handleToggleAttendance}
            onWorkStatusChange={(emp, st) => handleQuickStatusChange(emp.id, st)}
          />
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {employeeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Confirm Employee Deletion</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Are you sure you want to permanently delete the profile of{' '}
              <strong className="text-slate-200">
                {employeeToDelete.firstName} {employeeToDelete.lastName}
              </strong>{' '}
              ({employeeToDelete.employeeCode})? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setEmployeeToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 active:bg-rose-700 disabled:opacity-50 rounded-lg shadow-sm transition-all cursor-pointer flex items-center space-x-1.5"
              >
                {deleting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>Delete Record</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals & Drawers */}
      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onSave={handleSaveEmployee}
        employee={employeeToEdit}
        departments={departments}
      />

      <EmployeeDetailDrawer
        employee={selectedEmployeeForDetail}
        onClose={() => setSelectedEmployeeForDetail(null)}
        onEdit={handleEditEmployee}
        onDelete={(emp) => setEmployeeToDelete(emp)}
        onQuickStatusChange={handleQuickStatusChange}
        onRecordAttendance={handleRecordAttendance}
      />

      <DepartmentModal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        departments={departments}
        onAddDepartment={handleAddDepartment}
        employeeCountByDept={employeeCountByDept}
      />

      <AttendanceLogsModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        logs={attendanceLogs}
        loading={loadingLogs}
        onRefresh={loadAttendanceLogs}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80 py-5 text-center text-xs text-slate-500">
        <p>Enterprise Employee Management System &bull; Live Attendance & Entry/Exit Tracking</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <EmployeeApp />
    </AuthProvider>
  );
}
