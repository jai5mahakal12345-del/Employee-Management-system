import React from 'react';
import { Users, UserCheck, DollarSign, Building2, TrendingUp, LogIn, LogOut } from 'lucide-react';
import { DashboardStats } from '../types/employee.ts';

interface StatsCardsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, loading }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 animate-pulse h-28" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Headcount',
      value: stats.totalEmployees,
      subtext: `${stats.totalDepartments} Departments & Teams`,
      icon: Users,
      color: 'from-blue-500/20 to-indigo-500/10 text-indigo-400 border-indigo-500/30',
      iconBg: 'bg-indigo-500/10 text-indigo-400',
    },
    {
      title: 'Current Presence',
      value: `${stats.currentlyInOffice || 0} In Office`,
      subtext: `${stats.currentlyOut || 0} Exited / Away`,
      icon: LogIn,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
    },
    {
      title: 'Active Workforce',
      value: stats.activeEmployees,
      subtext: `${stats.onLeaveEmployees} On Leave / Inactive`,
      icon: UserCheck,
      color: 'from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/30',
      iconBg: 'bg-purple-500/10 text-purple-400',
    },
    {
      title: 'Annual Payroll',
      value: formatCurrency(stats.totalPayroll),
      subtext: `Avg: ${formatCurrency(stats.averageSalary)} / yr`,
      icon: TrendingUp,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30',
      iconBg: 'bg-amber-500/10 text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-5 shadow-sm transition-all relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{card.title}</span>
              <div className={`p-2 rounded-lg ${card.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight mb-1">{card.value}</div>
            <p className="text-xs text-slate-400 truncate">{card.subtext}</p>
          </div>
        );
      })}
    </div>
  );
};
