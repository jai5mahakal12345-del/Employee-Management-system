import React from 'react';
import { Users, UserPlus, Building2, LogIn, LogOut, Shield, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface NavbarProps {
  onAddEmployee: () => void;
  onManageDepartments: () => void;
  onViewAttendanceLogs: () => void;
  employeeCount: number;
  inOfficeCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onAddEmployee,
  onManageDepartments,
  onViewAttendanceLogs,
  employeeCount,
  inOfficeCount = 0,
}) => {
  const { user, signInWithGoogle, signOut, loading } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">StaffPulse</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Enterprise HR
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Employee Management & Relational Database System
              </p>
            </div>
          </div>

          {/* Actions & User */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Attendance & Entry/Exit Logs */}
            <button
              onClick={onViewAttendanceLogs}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-emerald-300 hover:text-white bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer"
            >
              <Clock className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Entry/Exit Logs</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300">
                {inOfficeCount} In
              </span>
            </button>

            <button
              onClick={onManageDepartments}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-slate-400" />
              <span className="hidden md:inline">Departments</span>
            </button>

            <button
              onClick={onAddEmployee}
              className="inline-flex items-center space-x-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Employee</span>
            </button>

            {/* Auth section */}
            <div className="pl-2 border-l border-slate-800 flex items-center">
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse" />
              ) : user ? (
                <div className="flex items-center space-x-2">
                  <div className="relative group">
                    <img
                      src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName || user.email}`}
                      alt={user.displayName || 'User'}
                      className="w-8 h-8 rounded-full border border-indigo-500/40 object-cover"
                    />
                    <div className="absolute right-0 top-full mt-2 hidden group-hover:block w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-3 z-50">
                      <p className="text-xs font-semibold text-white truncate">{user.displayName || 'Signed In'}</p>
                      <p className="text-[11px] text-slate-400 truncate mb-2">{user.email}</p>
                      <div className="flex items-center text-[10px] text-emerald-400 mb-2 font-mono">
                        <Shield className="w-3 h-3 mr-1" /> Authenticated
                      </div>
                      <button
                        onClick={signOut}
                        className="w-full text-left text-xs text-rose-400 hover:text-rose-300 flex items-center pt-2 border-t border-slate-800 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 mr-1.5" /> Sign out
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={signOut}
                    title="Sign Out"
                    className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors hidden sm:block cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
