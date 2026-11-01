import React, { useState } from 'react';
import { X, Building2, Plus, AlertCircle, Check } from 'lucide-react';
import { Department } from '../types/employee.ts';

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
  onAddDepartment: (data: { name: string; code: string; description: string }) => Promise<void>;
  employeeCountByDept?: Record<string, number>;
}

export const DepartmentModal: React.FC<DepartmentModalProps> = ({
  isOpen,
  onClose,
  departments,
  onAddDepartment,
  employeeCountByDept = {},
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError('Department name and code are required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onAddDepartment({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
      });
      setName('');
      setCode('');
      setDescription('');
      setShowAddForm(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to add department');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Company Departments</h3>
              <p className="text-xs text-slate-400">Organizational units stored in database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Departments */}
        <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Departments ({departments.length})
            </span>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Department</span>
              </button>
            )}
          </div>

          <div className="space-y-2">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white text-sm">{dept.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-indigo-400 border border-indigo-500/20 font-bold uppercase">
                      {dept.code}
                    </span>
                  </div>
                  {dept.description && (
                    <p className="text-xs text-slate-400 mt-1">{dept.description}</p>
                  )}
                </div>
                <div className="text-right shrink-0 ml-3">
                  <span className="text-xs font-semibold text-slate-300">
                    {employeeCountByDept[dept.name] || 0}
                  </span>
                  <span className="text-[10px] text-slate-500 block">staff</span>
                </div>
              </div>
            ))}
          </div>

          {/* Add form */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-indigo-500/30 space-y-3">
              <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                Create New Department
              </h4>

              {error && (
                <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] text-slate-300 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Legal & Compliance"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="LEG"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-indigo-500 uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Mandate and responsibilities"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg cursor-pointer flex items-center space-x-1"
                >
                  {saving && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>Save Department</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
