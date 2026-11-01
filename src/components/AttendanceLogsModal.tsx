import React, { useState } from 'react';
import { X, LogIn, LogOut, Clock, Search, MapPin, Calendar, CheckCircle } from 'lucide-react';
import { AttendanceLog } from '../types/employee.ts';

interface AttendanceLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AttendanceLog[];
  loading: boolean;
  onRefresh: () => void;
}

export const AttendanceLogsModal: React.FC<AttendanceLogsModalProps> = ({
  isOpen,
  onClose,
  logs,
  loading,
  onRefresh,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'ENTRY' | 'EXIT'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const formatDateTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return {
        date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
    } catch {
      return { date: ts, time: '' };
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filterType !== 'ALL' && log.type !== filterType) return false;
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      const name = `${log.firstName} ${log.lastName}`.toLowerCase();
      return (
        name.includes(s) ||
        log.employeeCode.toLowerCase().includes(s) ||
        log.jobTitle.toLowerCase().includes(s) ||
        (log.location || '').toLowerCase().includes(s)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Entry & Exit Access Logs</h3>
              <p className="text-xs text-slate-400">Live attendance check-in and check-out ledger</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search movement by employee name, code, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 outline-none"
            />
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filterType === 'ALL'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              All Movements ({logs.length})
            </button>
            <button
              onClick={() => setFilterType('ENTRY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filterType === 'ENTRY'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800/60 text-slate-400 hover:text-emerald-400'
              }`}
            >
              Entries Only
            </button>
            <button
              onClick={() => setFilterType('EXIT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filterType === 'EXIT'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800/60 text-slate-400 hover:text-amber-400'
              }`}
            >
              Exits Only
            </button>
          </div>
        </div>

        {/* List of Logs */}
        <div className="p-6 overflow-y-auto space-y-2.5 flex-1">
          {loading ? (
            <div className="py-12 text-center">
              <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400">Loading access timestamps...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-slate-300">No attendance logs found</p>
              <p className="text-xs text-slate-500 mt-1">Clock in or clock out employees to register records.</p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const dt = formatDateTime(log.timestamp);
              const isEntry = log.type === 'ENTRY';
              return (
                <div
                  key={log.id}
                  className="bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3.5 flex items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-center space-x-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isEntry
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {isEntry ? <LogIn className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white text-sm">
                          {log.firstName} {log.lastName}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {log.employeeCode}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isEntry
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {isEntry ? 'Entry (Check In)' : 'Exit (Check Out)'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                        <span>{log.jobTitle}</span>
                        <span>&bull;</span>
                        <span className="flex items-center text-slate-500">
                          <MapPin className="w-3 h-3 mr-1" />
                          {log.location || 'Main Office'}
                        </span>
                        {log.notes && (
                          <>
                            <span>&bull;</span>
                            <span className="italic text-slate-500">"{log.notes}"</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono">
                    <span className="text-xs font-semibold text-slate-200 block">{dt.time}</span>
                    <span className="text-[11px] text-slate-500">{dt.date}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            Total records: <strong className="text-slate-200">{filteredLogs.length}</strong>
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onRefresh}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
            >
              Refresh
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
