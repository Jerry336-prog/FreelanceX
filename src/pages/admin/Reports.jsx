import React, { useState, useEffect, useCallback } from 'react';
import StatCard from '../../components/ui/StatCard';
import { DollarSign, Users, Briefcase, FileText, TrendingUp, BarChart2, Loader2, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/api';

const Reports = () => {
  const [activeReport, setActiveReport] = useState('revenue');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminService.getStats();
      setStats(data || {});
    } catch (err) {
      console.error('Fetch report stats error:', err);
      setError(err?.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const reportTypes = [
    { id: 'revenue', label: 'Revenue', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'users', label: 'User Growth', icon: <Users className="w-4 h-4" /> },
    { id: 'jobs', label: 'Jobs', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'contracts', label: 'Contracts', icon: <FileText className="w-4 h-4" /> },
  ];

  const totalUsers = stats?.users?.total || 0;
  const freelancers = stats?.users?.freelancers || 0;
  const clients = stats?.users?.clients || 0;
  const totalJobs = stats?.jobs?.total || 0;
  const activeJobs = stats?.jobs?.active || 0;
  const totalContracts = stats?.contracts?.total || 0;
  const activeContracts = stats?.contracts?.active || 0;
  const totalVolume = stats?.financials?.totalVolume || 0;

  const summaryStats = {
    revenue: [
      { label: 'Total Volume', value: `₦${totalVolume.toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, color: 'indigo' },
      { label: 'Platform Revenue', value: `₦${((totalVolume || 0) * 0.05).toLocaleString()}`, icon: <TrendingUp className="w-5 h-5" />, color: 'green' },
      { label: 'Platform Contracts', value: totalContracts.toString(), icon: <FileText className="w-5 h-5" />, color: 'blue' },
      { label: 'Active Jobs Value', value: activeJobs.toString(), icon: <BarChart2 className="w-5 h-5" />, color: 'orange' },
    ],
    users: [
      { label: 'Total Users', value: totalUsers.toLocaleString(), icon: <Users className="w-5 h-5" />, color: 'indigo' },
      { label: 'Freelancers', value: freelancers.toLocaleString(), icon: <Users className="w-5 h-5" />, color: 'blue' },
      { label: 'Clients', value: clients.toLocaleString(), icon: <Users className="w-5 h-5" />, color: 'purple' },
      { label: 'Admins', value: (totalUsers - freelancers - clients).toString(), icon: <TrendingUp className="w-5 h-5" />, color: 'green' },
    ],
    jobs: [
      { label: 'Total Jobs', value: totalJobs.toLocaleString(), icon: <Briefcase className="w-5 h-5" />, color: 'indigo' },
      { label: 'Active / Open', value: activeJobs.toLocaleString(), icon: <Briefcase className="w-5 h-5" />, color: 'green' },
      { label: 'Completed / Closed', value: Math.max(0, totalJobs - activeJobs).toLocaleString(), icon: <Briefcase className="w-5 h-5" />, color: 'blue' },
      { label: 'Contracts Bound', value: totalContracts.toLocaleString(), icon: <FileText className="w-5 h-5" />, color: 'orange' },
    ],
    contracts: [
      { label: 'Total Contracts', value: totalContracts.toLocaleString(), icon: <FileText className="w-5 h-5" />, color: 'indigo' },
      { label: 'Active in Progress', value: activeContracts.toLocaleString(), icon: <FileText className="w-5 h-5" />, color: 'green' },
      { label: 'Completed', value: Math.max(0, totalContracts - activeContracts).toLocaleString(), icon: <FileText className="w-5 h-5" />, color: 'blue' },
      { label: 'Revision Requests', value: '0', icon: <FileText className="w-5 h-5" />, color: 'purple' },
    ],
  };

  const currentStats = summaryStats[activeReport] || summaryStats.revenue;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Reports</h1>
          <p className="text-slate-500 mt-1">Live analytics and metrics across the FreelanceX network.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Report Type Selector */}
      <div className="flex flex-wrap gap-2">
        {reportTypes.map((r) => (
          <button
            key={r.id}
            onClick={() => setActiveReport(r.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeReport === r.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {r.icon}
            {r.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
          <p className="text-sm">Loading platform analytics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {currentStats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports;
