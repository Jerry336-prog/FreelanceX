import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, Clock, Briefcase, CheckCircle, ArrowRight, Loader2, AlertCircle, Bell } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { contractService, proposalService, paymentService, notificationService } from '../../services/api';

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
const notifColor = { payment: 'bg-green-500', contract: 'bg-blue-500', proposal: 'bg-indigo-500', message: 'bg-violet-500', system: 'bg-slate-400' };

// ── Component ─────────────────────────────────────────────────────────────────
const Overview = () => {
  const { user } = useAuth();

  const [contracts, setContracts] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [contractsData, proposalsData, paymentsData, notifsData] = await Promise.all([
        contractService.getMyContracts().catch(() => []),
        proposalService.getMyProposals().catch(() => []),
        paymentService.getPaymentHistory().catch(() => []),
        notificationService.getNotifications().catch(() => []),
      ]);
      setContracts(Array.isArray(contractsData) ? contractsData : []);
      setProposals(Array.isArray(proposalsData) ? proposalsData : []);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      setNotifications(Array.isArray(notifsData) ? notifsData.slice(0, 5) : []);
    } catch (err) {
      setError(err?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Derived stats ────────────────────────────────────────────────────────
  const activeContracts = contracts.filter((c) => ['active', 'submitted', 'revision_requested'].includes(c.status));
  const completedCount = contracts.filter((c) => c.status === 'completed').length;
  const paidContractsSum = contracts
    .filter((c) => c.paymentStatus === 'paid')
    .reduce((s, c) => s + Number(c.agreedAmount || 0), 0);
  const successfulPaymentsSum = payments
    .filter((p) => p.status === 'successful' || p.status === 'released')
    .reduce((s, p) => s + Number(p.amount || 0), 0);
  const totalEarnings = Math.max(successfulPaymentsSum, paidContractsSum);
  const pendingEarnings = contracts
    .filter((c) => ['active', 'submitted', 'revision_requested'].includes(c.status) && c.paymentStatus !== 'paid')
    .reduce((s, c) => s + Number(c.agreedAmount || 0), 0);

  const stats = [
    { label: 'Total Earnings', value: fmt(totalEarnings), icon: <DollarSign className="w-5 h-5 text-green-600" />, bg: 'bg-green-50' },
    { label: 'Pending Payment', value: fmt(pendingEarnings), icon: <Clock className="w-5 h-5 text-yellow-600" />, bg: 'bg-yellow-50' },
    { label: 'Active Contracts', value: String(activeContracts.length), icon: <Briefcase className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50' },
    { label: 'Completed Jobs', value: String(completedCount), icon: <CheckCircle className="w-5 h-5 text-indigo-600" />, bg: 'bg-indigo-50' },
    { label: 'Total Proposals', value: String(proposals.length), icon: <Bell className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50' },
  ];

  const recentProposals = proposals.slice(0, 5);

  const firstName = user?.firstname || 'there';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {firstName}! 👋</h1>
          <p className="text-slate-500 mt-1">Here's what's happening with your freelance business today.</p>
        </div>
        <Link
          to="/freelancer/jobs"
          className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 self-start"
        >
          Browse Jobs
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                {stat.icon}
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">

          {/* Active Contracts */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Active Contracts</h2>
              <Link to="/freelancer/contracts" className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</Link>
            </div>
            {loading ? (
              <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
            ) : activeContracts.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Briefcase className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium">No active contracts yet</p>
                <p className="text-xs mt-1">Win a proposal to start a contract.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activeContracts.slice(0, 4).map((c) => {
                  const cid = c._id || c.id;
                  const client = c.clientId || {};
                  const clientName = client.companyName || `${client.firstname || 'Client'} ${client.lastname || ''}`.trim();
                  const deadline = c.deadline
                    ? new Date(c.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Flexible';
                  return (
                    <div key={cid} className="p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-4">
                        <div>
                          <h3 className="font-bold text-slate-900">{c.title}</h3>
                          <p className="text-sm text-slate-500">Client: {clientName}</p>
                        </div>
                        <div className="text-left sm:text-right flex-shrink-0">
                          <p className="font-bold text-slate-900">{fmt(c.agreedAmount)}</p>
                          <p className="text-sm text-slate-500">Due {deadline}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-slate-100 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${c.progress || 0}%` }} />
                        </div>
                        <span className="text-sm font-medium text-slate-600 flex-shrink-0">{c.progress || 0}%</span>
                        <Link
                          to={`/freelancer/contracts/${cid}`}
                          className="text-sm font-semibold text-blue-600 hover:text-blue-700 px-3 py-1 border border-blue-200 rounded-lg bg-blue-50 flex-shrink-0"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Proposals */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Recent Proposals</h2>
              <Link to="/freelancer/proposals" className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</Link>
            </div>
            {loading ? (
              <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
            ) : recentProposals.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="text-sm font-medium">No proposals submitted yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-slate-100 text-sm text-slate-500">
                      <th className="px-6 py-4 font-medium">Job Title</th>
                      <th className="px-6 py-4 font-medium">Bid</th>
                      <th className="px-6 py-4 font-medium">Date</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentProposals.map((p) => {
                      const pid = p._id || p.id;
                      const jobTitle = p.jobId?.title || 'Job listing';
                      const bid = fmt(p.bidAmount || p.budget);
                      const date = p.createdAt
                        ? new Date(p.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                        : '—';
                      return (
                        <tr key={pid} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <p className="font-medium text-slate-900 line-clamp-1">{jobTitle}</p>
                            <p className="text-xs text-slate-500">{p.deliveryTime || ''}</p>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-900">{bid}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{date}</td>
                          <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">

          {/* CTA Card */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl" />
            <h3 className="text-xl font-bold mb-2 relative z-10">Find new projects</h3>
            <p className="text-blue-100 mb-6 text-sm relative z-10">Browse the latest jobs matching your skills.</p>
            <Link
              to="/freelancer/jobs"
              className="inline-flex items-center justify-center w-full bg-white text-slate-900 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors relative z-10"
            >
              Browse Jobs
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          {/* Recent Notifications */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
              <Link to="/freelancer/notifications" className="text-xs text-blue-600 hover:underline font-semibold">View All</Link>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-blue-400" /></div>
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
