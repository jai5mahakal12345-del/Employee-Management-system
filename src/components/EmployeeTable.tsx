import React from 'react';
import { Eye, Edit3, Trash2, Mail, MapPin, Calendar, LogIn, LogOut, Clock, UserCheck, ShieldAlert } from 'lucide-react';
import { Employee } from '../types/employee.ts';

interface EmployeeTableProps {
  employees: Employee[];
  loading: boolean;
  onView: (emp: Employee) => void;
  onEdit: (emp: Employee) => void;
  onDelete: (emp: Employee) => void;
  onToggleAttendance: (emp: Employee) => Promise<void>;
  onWorkStatusChange: (emp: Employee, status: string) => Promise<void>;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  loading,
  onView,
  onEdit,
  onDelete,
  onToggleAttendance,
  onWorkStatusChange,
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatTime = (ts?: string | null) => {
    if (!ts) return null;
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } catch {
      return null;
    }
  };

  const getWorkStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'On Leave':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Remote':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Terminated':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const getDepartmentBadge = (name?: string) => {
    switch (name) {
      case 'Engineering':
        return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';
      case 'Product & Design':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
      case 'Marketing':
        return 'bg-pink-500/10 text-pink-300 border-pink-500/20';
      case 'Sales & BD':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20';
      case 'Human Resources':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
      default:
        return 'bg-slate-500/10 text-slate-300 border-slate-500/20';
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden p-8 text-center">
        <div className="inline-block w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-slate-400">Loading employee directory from database...</p>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <Calendar className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-white mb-1">No employees found</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          No records match the current search or filters. Try adjusting your filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Employee</th>
              <th className="py-3.5 px-4">Department & Role</th>
              {/* Separate Status 1: Work Status */}
              <th className="py-3.5 px-4">Employment Status</th>
              {/* Separate Status 2: Entry / Exit Movement */}
              <th className="py-3.5 px-4">Entry / Exit (Presence)</th>
              <th className="py-3.5 px-4">Annual Salary</th>
              <th className="py-3.5 px-4 hidden lg:table-cell">Location</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {employees.map((emp) => {
              const isPresent = emp.presenceStatus === 'In';
              const entryTime = formatTime(emp.lastEntryTime);
              const exitTime = formatTime(emp.lastExitTime);

              return (
                <tr
                  key={emp.id}
                  className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => onView(emp)}
                >
                  {/* Employee Name & Code */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={
                            emp.avatarUrl ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.firstName}_${emp.lastName}`
                          }
                          alt={`${emp.firstName} ${emp.lastName}`}
                          className="w-9 h-9 rounded-full object-cover border border-slate-700 bg-slate-800"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                            isPresent ? 'bg-emerald-400' : 'bg-slate-500'
                          }`}
                          title={isPresent ? 'Currently In Office' : 'Currently Out'}
                        />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                            {emp.firstName} {emp.lastName}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {emp.employeeCode}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 flex items-center mt-0.5">
                          <Mail className="w-3 h-3 mr-1 text-slate-500" />
                          {emp.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Department & Role */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-200">{emp.jobTitle}</div>
                    <div className="flex items-center space-x-1.5 mt-1">
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${getDepartmentBadge(
                          emp.departmentName
                        )}`}
                      >
                        {emp.departmentName || 'General'}
                      </span>
                      <span className="text-[11px] text-slate-400">{emp.employmentType}</span>
                    </div>
                  </td>

                  {/* SEPARATE COLUMN 1: Employment Status (Active, On Leave, Remote, Terminated) */}
                  <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center space-x-2">
                      <select
                        value={emp.status}
                        onChange={(e) => onWorkStatusChange(emp, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border outline-none cursor-pointer transition-colors ${getWorkStatusBadge(
                          emp.status
                        )} bg-slate-950`}
                      >
                        <option value="Active">Active</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Remote">Remote</option>
                        <option value="Terminated">Terminated</option>
                      </select>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      {emp.status === 'Active'
                        ? 'Regular employment'
                        : emp.status === 'On Leave'
                        ? 'Temporarily away'
                        : emp.status === 'Remote'
                        ? 'Working off-site'
                        : 'Contract ended'}
                    </span>
                  </td>

                  {/* SEPARATE COLUMN 2: Entry / Exit Movement (In vs Out) */}
                  <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${
                          isPresent
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            isPresent ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                          }`}
                        />
                        {isPresent ? 'Entered (In)' : 'Exited (Out)'}
                      </span>

                      {/* Quick clock in / clock out toggle button */}
                      <button
                        onClick={() => onToggleAttendance(emp)}
                        title={isPresent ? 'Click to record EXIT (Clock Out)' : 'Click to record ENTRY (Clock In)'}
                        className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1 border ${
                          isPresent
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                        }`}
                      >
                        {isPresent ? (
                          <>
                            <LogOut className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline text-[10px]">Clock Out</span>
                          </>
                        ) : (
                          <>
                            <LogIn className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline text-[10px]">Clock In</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Timestamp info */}
                    <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-600" />
                      <span>
                        {isPresent
                          ? `In: ${entryTime || 'Today'}`
                          : exitTime
                          ? `Out: ${exitTime}`
                          : 'Not clocked today'}
                      </span>
                    </div>
                  </td>

                  {/* Salary */}
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-200">
                    {formatCurrency(emp.salary)}
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-4 text-slate-400 hidden lg:table-cell">
                    <span className="inline-flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      {emp.location || 'Headquarters'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => onView(emp)}
                        title="View Details & Attendance"
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(emp)}
                        title="Edit Employee"
                        className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(emp)}
                        title="Delete Employee"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
