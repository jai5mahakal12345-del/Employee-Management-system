import React from 'react';
import { Mail, Phone, MapPin, Eye, Edit3, Trash2, Calendar, DollarSign, LogIn, LogOut, Clock, ShieldAlert } from 'lucide-react';
import { Employee } from '../types/employee.ts';

interface EmployeeGridProps {
  employees: Employee[];
  loading: boolean;
  onView: (emp: Employee) => void;
  onEdit: (emp: Employee) => void;
  onDelete: (emp: Employee) => void;
  onToggleAttendance: (emp: Employee) => Promise<void>;
  onWorkStatusChange: (emp: Employee, status: string) => Promise<void>;
}

export const EmployeeGrid: React.FC<EmployeeGridProps> = ({
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 animate-pulse h-64" />
        ))}
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center">
        <h3 className="text-base font-semibold text-white mb-1">No employees found</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          No records match the current filter selection.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {employees.map((emp) => {
        const isPresent = emp.presenceStatus === 'In';
        const entryTime = formatTime(emp.lastEntryTime);
        const exitTime = formatTime(emp.lastExitTime);

        return (
          <div
            key={emp.id}
            onClick={() => onView(emp)}
            className="bg-slate-900/70 border border-slate-800/80 hover:border-indigo-500/40 rounded-xl p-5 transition-all shadow-sm hover:shadow-md hover:shadow-indigo-500/5 group flex flex-col justify-between cursor-pointer"
          >
            <div>
              {/* Separate Status Row 1: Code & Work Status (Active / Leave / Remote) */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                  {emp.employeeCode}
                </span>

                {/* Separate Employment Status Pill */}
                <div onClick={(e) => e.stopPropagation()}>
                  <select
                    value={emp.status}
                    onChange={(e) => onWorkStatusChange(emp, e.target.value)}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border outline-none cursor-pointer ${getWorkStatusBadge(
                      emp.status
                    )} bg-slate-950`}
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Remote">Remote</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
              </div>

              {/* Avatar & Name */}
              <div className="flex items-center space-x-3 mb-3">
                <div className="relative">
                  <img
                    src={
                      emp.avatarUrl ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.firstName}_${emp.lastName}`
                    }
                    alt={`${emp.firstName} ${emp.lastName}`}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700 bg-slate-800 shrink-0"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
                      isPresent ? 'bg-emerald-400' : 'bg-slate-500'
                    }`}
                  />
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-semibold text-white group-hover:text-indigo-400 transition-colors truncate">
                    {emp.firstName} {emp.lastName}
                  </h4>
                  <p className="text-xs text-indigo-300 truncate">{emp.jobTitle}</p>
                  <p className="text-[11px] text-slate-400 truncate">{emp.departmentName || 'General'}</p>
                </div>
              </div>

              {/* Separate Status Row 2: Physical Entry / Exit Presence */}
              <div
                className="mb-3 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between"
                onClick={(e) => e.stopPropagation()}
              >
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isPresent
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1 ${
                          isPresent ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                        }`}
                      />
                      {isPresent ? 'Entered (In)' : 'Exited (Out)'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center">
                    <Clock className="w-2.5 h-2.5 mr-1" />
                    {isPresent ? entryTime || 'Today' : exitTime ? `Out: ${exitTime}` : 'Not clocked'}
                  </div>
                </div>

                <button
                  onClick={() => onToggleAttendance(emp)}
                  title={isPresent ? 'Clock Out (Exit)' : 'Clock In (Entry)'}
                  className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors cursor-pointer border flex items-center space-x-1 ${
                    isPresent
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  }`}
                >
                  {isPresent ? (
                    <>
                      <LogOut className="w-3 h-3 mr-0.5" />
                      <span>Clock Out</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-3 h-3 mr-0.5" />
                      <span>Clock In</span>
                    </>
                  )}
                </button>
              </div>

              {/* Details */}
              <div className="space-y-1.5 text-xs text-slate-400 mb-4 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/50">
                <div className="flex items-center truncate">
                  <Mail className="w-3.5 h-3.5 mr-2 text-slate-500 shrink-0" />
                  <span className="truncate">{emp.email}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/40 text-[11px]">
                  <span className="flex items-center text-slate-400">
                    <MapPin className="w-3 h-3 mr-1 text-slate-500" />
                    {emp.location || 'HQ'}
                  </span>
                  <span className="font-medium text-slate-300">{emp.employmentType}</span>
                </div>
              </div>
            </div>

            {/* Footer: Salary & Actions */}
            <div
              className="pt-3 border-t border-slate-800/80 flex items-center justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <span className="text-[10px] uppercase text-slate-500 block">Annual Comp</span>
                <span className="text-sm font-semibold font-mono text-emerald-400">
                  {formatCurrency(emp.salary)}
                </span>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onView(emp)}
                  title="View Full Profile"
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
            </div>
          </div>
        );
      })}
    </div>
  );
};
