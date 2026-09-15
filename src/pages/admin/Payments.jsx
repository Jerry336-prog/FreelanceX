import React, { useState, useEffect, useCallback } from 'react';
import Tabs from '../../components/ui/Tabs';
import StatusBadge from '../../components/ui/StatusBadge';
import StatCard from '../../components/ui/StatCard';
import { DollarSign, TrendingUp, Clock, RefreshCcw, Search, Eye, Loader2, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/api';

const Payments = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminService.getPayments();
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch admin payments error:', err);
      setError(err?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const totalVolume = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const released = payments.filter((p) => p.status === 'released' || p.status === 'successful');
  const pending = payments.filter((p) => p.status === 'in_escrow' || p.status === 'pending');
  const refunded = payments.filter((p) => p.status === 'refunded');

  const tabs = [
    { id: 'all', label: 'All Transactions', count: payments.length },
    { id: 'pending', label: 'Pending Confirmation', count: pending.length },
    { id: 'released', label: 'Released', count: released.length },
    { id: 'refunded', label: 'Refunded', count: refunded.length },
  ];

  const filtered = payments.filter((trx) => {
    const s = search.toLowerCase();
    const clientName = trx.clientId
      ? `${trx.clientId.firstname || ''} ${trx.clientId.lastname || ''}`.trim() || trx.clientId.email
      : '';
    const freelancerName = trx.freelancerId
      ? `${trx.freelancerId.firstname || ''} ${trx.freelancerId.lastname || ''}`.trim() || trx.freelancerId.email
      : '';
    const jobTitle = trx.contractId?.title || 'Contract Payment';
    const tid = (trx._id || trx.id || '').toString();

    const matchSearch =
      !s ||
      tid.toLowerCase().includes(s) ||
      jobTitle.toLowerCase().includes(s) ||
      clientName.toLowerCase().includes(s) ||
      freelancerName.toLowerCase().includes(s);

    const matchTab =
      activeTab === 'all'
        ? true
        : activeTab === 'pending'
        ? trx.status === 'in_escrow' || trx.status === 'pending'
        : activeTab === 'released'
        ? trx.status === 'released' || trx.status === 'successful'
        : trx.status === activeTab;

    return matchSearch && matchTab;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payment Management</h1>
          <p className="text-slate-500 mt-1">Monitor all financial activity on the platform.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Financial Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Volume"
          value={`₦${totalVolume.toLocaleString()}`}
          subtext="All recorded transactions"
          icon={<TrendingUp className="w-5 h-5" />}
          color="indigo"
        />
        <StatCard
          label="Pending Confirmation"
          value={`₦${pending.reduce((s, p) => s + (p.amount || 0), 0).toLocaleString()}`}
          subtext={`${pending.length} pending confirmation`}
          icon={<Clock className="w-5 h-5" />}
          color="orange"
        />
        <StatCard
          label="Released Payouts"
          value={`₦${released.reduce((s, p) => s + (p.amount || 0), 0).toLocaleString()}`}
          subtext={`${released.length} disbursed`}
          icon={<DollarSign className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          label="Refund Total"
          value={`₦${refunded.reduce((s, p) => s + (p.amount || 0), 0).toLocaleString()}`}
          subtext={`${refunded.length} refunds`}
          icon={<RefreshCcw className="w-5 h-5" />}
          color="red"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 pt-6 border-b border-slate-200 bg-slate-50">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        <div className="px-6 py-4 border-b border-slate-100">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by ID, contract, or user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
              <p className="text-sm">Loading transactions...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p className="font-semibold text-slate-700">No transactions found</p>
              <p className="text-sm text-slate-400 mt-1">Try adjusting your search or tab.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-sm text-slate-500">
                  <th className="px-6 py-4 font-medium">Transaction ID</th>
                  <th className="px-6 py-4 font-medium">Contract / Purpose</th>
                  <th className="px-6 py-4 font-medium">Client</th>
                  <th className="px-6 py-4 font-medium">Freelancer</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((trx) => {
                  const tid = (trx._id || trx.id || '').toString();
                  const jobTitle = trx.contractId?.title || 'Contract Payment';
                  const clientName = trx.clientId
                    ? `${trx.clientId.firstname || ''} ${trx.clientId.lastname || ''}`.trim() || trx.clientId.email
                    : 'Unknown';
                  const freelancerName = trx.freelancerId
                    ? `${trx.freelancerId.firstname || ''} ${trx.freelancerId.lastname || ''}`.trim() ||
                      trx.freelancerId.email
                    : 'Unknown';
                  const dateStr = trx.createdAt
                    ? new Date(trx.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—';

                  return (
                    <tr key={tid} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        {tid.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 max-w-[160px] truncate">
                        {jobTitle}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{clientName}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{freelancerName}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{dateStr}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={trx.status} />
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">
                        ₦{Number(trx.amount || 0).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <p className="text-sm text-slate-500">
            Showing {filtered.length} of {payments.length} transactions
          </p>
        </div>
      </div>
    </div>
  );
};

export default Payments;
