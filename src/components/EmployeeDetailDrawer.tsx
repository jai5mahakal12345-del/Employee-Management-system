import React from 'react';
import {
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Building2,
  Briefcase,
  UserCheck,
  Edit3,
  Trash2,
  HeartPulse,
  LogIn,
  LogOut,
  Clock,
} from 'lucide-react';
import { Employee } from '../types/employee.ts';

interface EmployeeDetailDrawerProps {
  employee: Employee | null;
  onClose: () => void;
  onEdit: (emp: Employee) => void;
  onDelete: (emp: Employee) => void;
  onQuickStatusChange: (id: number, status: string) => Promise<void>;
  onRecordAttendance: (id: number, type: 'ENTRY' | 'EXIT') => Promise<void>;
}

export const EmployeeDetailDrawer: React.FC<EmployeeDetailDrawerProps> = ({
  employee,
  onClose,
  onEdit,
  onDelete,
  onQuickStatusChange,
  onRecordAttendance,
}) => {
  if (!employee) return null;

  const isPresent = employee.presenceStatus === 'In';

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatTimestamp = (ts?: string | null) => {
    if (!ts) return 'Not recorded';
    try {
      const d = new Date(ts);
      return `${d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })} at ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return ts;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Remote':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'On Leave':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Terminated':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-slate-900 border-l sm:border border-slate-800 sm:rounded-2xl w-full max-w-lg h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="relative bg-gradient-to-r from-indigo-950/80 to-slate-900 p-6 border-b border-slate-800">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start space-x-4">
              <div className="relative">
                <img
                  src={
                    employee.avatarUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.firstName}_${employee.lastName}`
                  }
                  alt={`${employee.firstName} ${employee.lastName}`}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/40 bg-slate-800 shrink-0 shadow-md"
                />
                <span
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                    isPresent ? 'bg-emerald-400' : 'bg-slate-500'
                  }`}
                  title={isPresent ? 'In Office' : 'Out of Office'}
                />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-lg font-bold text-white truncate">
                    {employee.firstName} {employee.lastName}
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                    {employee.employeeCode}
                  </span>
                </div>
                <p className="text-sm font-medium text-indigo-300 truncate">{employee.jobTitle}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span
                    className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                      employee.status
                    )}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
                    {employee.status}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {employee.departmentName || 'General'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Entry & Exit Attendance Movement Card */}
          <div className="p-4 bg-slate-950/70 border-b border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Entry & Exit Attendance
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                    isPresent
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isPresent ? '🟢 Currently Present (In)' : '⚪ Currently Exited (Out)'}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2">
                <button
                  disabled={isPresent}
                  onClick={() => onRecordAttendance(employee.id, 'ENTRY')}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-white transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Clock In</span>
                </button>
                <button
                  disabled={!isPresent}
                  onClick={() => onRecordAttendance(employee.id, 'EXIT')}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:pointer-events-none text-white transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Clock Out</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                <div className="text-[10px] text-slate-500 flex items-center mb-1">
                  <LogIn className="w-3 h-3 text-emerald-400 mr-1" /> Last Entry
                </div>
                <div className="text-slate-200 font-semibold">{formatTimestamp(employee.lastEntryTime)}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                <div className="text-[10px] text-slate-500 flex items-center mb-1">
                  <LogOut className="w-3 h-3 text-amber-400 mr-1" /> Last Exit
                </div>
                <div className="text-slate-200 font-semibold">{formatTimestamp(employee.lastExitTime)}</div>
              </div>
            </div>
          </div>

          {/* Quick status toggle */}
          <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Employment Status:</span>
            <div className="flex items-center space-x-1">
              {['Active', 'Remote', 'On Leave'].map((st) => (
                <button
                  key={st}
                  disabled={employee.status === st}
                  onClick={() => onQuickStatusChange(employee.id, st)}
                  className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    employee.status === st
                      ? 'bg-indigo-600 text-white cursor-default'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Content sections */}
          <div className="p-6 space-y-5">
            {/* Contact details */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Contact Information
              </h4>
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-2 text-xs sm:text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-indigo-400" /> Email Address
                  </span>
                  <a href={`mailto:${employee.email}`} className="text-indigo-400 hover:underline font-mono">
                    {employee.email}
                  </a>
                </div>
                {employee.phone && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                    <span className="text-slate-400 flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-emerald-400" /> Phone Number
                    </span>
                    <a href={`tel:${employee.phone}`} className="text-slate-200 hover:underline font-mono">
                      {employee.phone}
                    </a>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <span className="text-slate-400 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-amber-400" /> Primary Location
                  </span>
                  <span className="text-slate-200">{employee.location || 'Headquarters'}</span>
                </div>
              </div>
            </div>

            {/* Employment & Compensation */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Employment & Compensation
              </h4>
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-2 text-xs sm:text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-emerald-400" /> Annual Base Salary
                  </span>
                  <span className="text-emerald-400 font-mono font-semibold">
                    {formatCurrency(employee.salary)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <span className="text-slate-400 flex items-center">
                    <Briefcase className="w-4 h-4 mr-2 text-blue-400" /> Employment Type
                  </span>
                  <span className="text-slate-200 font-medium">{employee.employmentType}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <span className="text-slate-400 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-purple-400" /> Start / Hire Date
                  </span>
                  <span className="text-slate-200 font-mono">{employee.hireDate}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <span className="text-slate-400 flex items-center">
                    <Building2 className="w-4 h-4 mr-2 text-cyan-400" /> Department Code
                  </span>
                  <span className="text-slate-200 font-mono uppercase">{employee.departmentCode || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            {employee.bio && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Biography & Summary
                </h4>
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {employee.bio}
                </div>
              </div>
            )}

            {/* Emergency Contact */}
            {employee.emergencyContact && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Emergency Contact
                </h4>
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 flex items-center">
                  <HeartPulse className="w-4 h-4 mr-2 text-rose-400 shrink-0" />
                  <span>{employee.emergencyContact}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={() => onDelete(employee)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Record</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => onEdit(employee)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
