import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Briefcase, DollarSign, FileText, TrendingUp, AlertTriangle,
  Loader2, AlertCircle, Link as LinkIcon,
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { Link } from 'react-router-dom';
import { adminService, notificationService } from '../../services/api';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`;
const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const secs = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (secs < 60) return 'Just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  const days = Math.floor(secs / 86400);
  return days === 1 ? 'Yesterday' : `${days}d ago`;
};
const notifColor = {
  payment: 'bg-green-500', contract: 'bg-blue-500', proposal: 'bg-indigo-500',
  message: 'bg-violet-500', system: 'bg-slate-400', dispute: 'bg-red-500',
  user: 'bg-orange-500', job: 'bg-teal-500',
};

// ── Admin Overview ─────────────────────────────────────────────────────────
const Overview = () => {
  const [platformStats, setPlatformStats] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsData, paymentsData, notifsData] = await Promise.all([
        adminService.getStats().catch(() => null),
        adminService.getPayments().catch(() => []),
        notificationService.getNotifications().catch(() => []),
      ]);
      setPlatformStats(statsData);
      setRecentPayments(Array.isArray(paymentsData) ? paymentsData.slice(0, 6) : []);
      setNotifications(Array.isArray(notifsData) ? notifsData.slice(0, 5) : []);
    } catch (err) {
      setError(err?.message || 'Failed to load platform stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const s = platformStats;
  const stats = s
    ? [
        { label: 'Total Users', value: String(s.users?.total ?? 0), subtext: `${s.users?.freelancers ?? 0} freelancers · ${s.users?.clients ?? 0} clients`, icon: <Users className="w-5 h-5" />, color: 'indigo' },
        { label: 'Freelancers', value: String(s.users?.freelancers ?? 0), subtext: 'Registered', icon: <Users className="w-5 h-5" />, color: 'blue' },
        { label: 'Clients', value: String(s.users?.clients ?? 0), subtext: 'Registered', icon: <Users className="w-5 h-5" />, color: 'purple' },
        { label: 'Active Jobs', value: String(s.jobs?.active ?? 0), subtext: `${s.jobs?.total ?? 0} total jobs`, icon: <Briefcase className="w-5 h-5" />, color: 'green' },
        { label: 'Active Contracts', value: String(s.contracts?.active ?? 0), subtext: `${s.contracts?.total ?? 0} total`, icon: <FileText className="w-5 h-5" />, color: 'blue' },
        { label: 'Total Volume', value: fmt(s.financials?.totalVolume), subtext: 'Released payments', icon: <DollarSign className="w-5 h-5" />, color: 'green' },
        { label: 'Platform Revenue', value: fmt((s.financials?.totalVolume || 0) * 0.05), subtext: '~5% service fee', icon: <TrendingUp className="w-5 h-5" />, color: 'indigo' },
        { label: 'Open Disputes', value: String(s.disputes?.open ?? 0), subtext: 'Needs attention', icon: <AlertTriangle className="w-5 h-5" />, color: 'red' },
      ]
    : [];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Overview</h1>
          <p className="text-slate-500 mt-1">Live stats and activity for FreelanceX.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/reports"
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            View Reports
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Recent Payments Table */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Recent Transactions</h2>
            <Link to="/admin/payments" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All</Link>
          </div>
          {loading ? (
            <div className="p-10 flex justify-center"><Loader2 className="w-7 h-7 animate-spin text-indigo-500" /></div>
          ) : recentPayments.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium">No transactions yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-400 font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Contract / Job</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Freelancer</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentPayments.map((trx) => {
                    const tid = trx._id || trx.id;
                    const client = trx.clientId || {};
                    const fl = trx.freelancerId || {};
                    const clientName = client.companyName || `${client.firstname || ''} ${client.lastname || ''}`.trim() || '—';
                    const flName = `${fl.firstname || ''} ${fl.lastname || ''}`.trim() || '—';
                    const dateStr = trx.createdAt
                      ? new Date(trx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                      : '—';
                    return (
                      <tr key={tid} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900 line-clamp-1">
                            {trx.contractId?.title || trx.jobId?.title || 'Contract Payment'}
                          </p>
                          <p className="text-xs font-mono text-slate-400">{String(tid).slice(-8).toUpperCase()}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{clientName}</td>
                        <td className="px-6 py-4 text-slate-600">{flName}</td>
                        <td className="px-6 py-4 text-slate-500">{dateStr}</td>
                        <td className="px-6 py-4"><StatusBadge status={['released', 'successful'].includes(trx.status) ? 'Completed' : trx.status} /></td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900">{fmt(trx.amount)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Platform Alerts + Recent Activity */}
        <div className="space-y-6">

          {/* Key Metrics Quick Links */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-3">
            <h2 className="text-base font-bold text-slate-900 mb-4">Quick Actions</h2>
            {[
              { label: 'Manage Users', to: '/admin/users', color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
              { label: 'Review Disputes', to: '/admin/disputes', color: 'bg-red-50 text-red-700 hover:bg-red-100' },
              { label: 'Platform Jobs', to: '/admin/jobs', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
              { label: 'All Contracts', to: '/admin/contracts', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
              { label: 'Payment Records', to: '/admin/payments', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${item.color}`}
              >
                {item.label}
                <span>→</span>
              </Link>
            ))}
          </div>

          {/* Recent Notifications / Activity */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
              <h2 className="text-base font-bold text-slate-900">Recent Activity</h2>
            </div>
            <div className="p-5">
              {loading ? (
                <div className="flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div>
              ) : notifications.length === 0 ? (
                <p className="text-sm text-slate-400 text-center">No recent activity.</p>
              ) : (
                <div className="space-y-5">
                  {notifications.map((n, idx) => {
                    const nid = n._id || n.id;
                    return (
                      <div key={nid} className="flex gap-3 relative">
                        {idx !== notifications.length - 1 && (
                          <div className="absolute top-7 left-3 bottom-[-20px] w-px bg-slate-200" />
                        )}
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${notifColor[n.type] || 'bg-slate-400'}`}>
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 leading-snug">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-xs text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
