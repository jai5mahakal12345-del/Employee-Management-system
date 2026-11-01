import React from 'react';
import { Search, Filter, LayoutGrid, List, Download, RefreshCw, UserCheck, Clock, Users } from 'lucide-react';
import { Department } from '../types/employee.ts';

interface FilterToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedDepartment: number;
  onDepartmentChange: (deptId: number) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedPresence: string;
  onPresenceChange: (presence: string) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  departments: Department[];
  onRefresh: () => void;
  onExportCsv: () => void;
  totalFiltered: number;
  statusCounts?: {
    all: number;
    active: number;
    onLeave: number;
    remote: number;
  };
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  search,
  onSearchChange,
  selectedDepartment,
  onDepartmentChange,
  selectedStatus,
  onStatusChange,
  selectedType,
  onTypeChange,
  selectedPresence,
  onPresenceChange,
  viewMode,
  onViewModeChange,
  departments,
  onRefresh,
  onExportCsv,
  totalFiltered,
  statusCounts,
}) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 mb-6 shadow-sm space-y-3">
      {/* Top row: Search & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, role, email, or code..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all"
          />
        </div>

        {/* Dropdowns & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => onDepartmentChange(Number(e.target.value))}
            className="bg-slate-950/80 border border-slate-800 text-slate-300 text-xs sm:text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            <option value={0}>All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name} ({dept.code})
              </option>
            ))}
          </select>

          {/* Entry/Exit Physical Presence Filter */}
          <select
            value={selectedPresence}
            onChange={(e) => onPresenceChange(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 text-slate-300 text-xs sm:text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            <option value="All">Entry/Exit: All</option>
            <option value="In">🟢 Present (Clocked In)</option>
            <option value="Out">⚪ Away (Clocked Out)</option>
          </select>

          {/* Employment Type */}
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 text-slate-300 text-xs sm:text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            <option value="All">All Work Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Intern">Intern</option>
          </select>

          {/* Quick Refresh */}
          <button
            onClick={onRefresh}
            title="Refresh database records"
            className="p-2 text-slate-400 hover:text-slate-200 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCsv}
            title="Export directory as CSV"
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs sm:text-sm text-slate-300 hover:text-white bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Dedicated Second Row: Employment Status Segmented Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center">
            <UserCheck className="w-3.5 h-3.5 mr-1 text-slate-500" /> Employment Status:
          </span>

          <button
            onClick={() => onStatusChange('All')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedStatus === 'All'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Staff {statusCounts ? `(${statusCounts.all})` : ''}
          </button>

          <button
            onClick={() => onStatusChange('Active')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1 ${
              selectedStatus === 'Active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-950/80 text-slate-400 hover:text-emerald-400 border border-slate-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1" />
            <span>Active</span>
            {statusCounts ? <span className="text-[10px] opacity-80">({statusCounts.active})</span> : null}
          </button>

          <button
            onClick={() => onStatusChange('On Leave')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1 ${
              selectedStatus === 'On Leave'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-950/80 text-slate-400 hover:text-amber-400 border border-slate-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1" />
            <span>On Leave</span>
            {statusCounts ? <span className="text-[10px] opacity-80">({statusCounts.onLeave})</span> : null}
          </button>

          <button
            onClick={() => onStatusChange('Remote')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1 ${
              selectedStatus === 'Remote'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-950/80 text-slate-400 hover:text-blue-400 border border-slate-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1" />
            <span>Remote</span>
            {statusCounts ? <span className="text-[10px] opacity-80">({statusCounts.remote})</span> : null}
          </button>

          <button
            onClick={() => onStatusChange('Terminated')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1 ${
              selectedStatus === 'Terminated'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-950/80 text-slate-400 hover:text-rose-400 border border-slate-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1" />
            <span>Terminated</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span>Showing <strong className="text-slate-200">{totalFiltered}</strong> records</span>
          {(search || selectedDepartment !== 0 || selectedStatus !== 'All' || selectedType !== 'All' || selectedPresence !== 'All') && (
            <button
              onClick={() => {
                onSearchChange('');
                onDepartmentChange(0);
                onStatusChange('All');
                onTypeChange('All');
                onPresenceChange('All');
              }}
              className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer ml-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
