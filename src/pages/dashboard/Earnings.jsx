import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, Clock, CheckCircle, TrendingUp, Download, Loader2, AlertCircle } from 'lucide-react';
import { paymentService, contractService } from '../../services/api';

const Earnings = () => {
  const [payments, setPayments] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [historyData, contractsData] = await Promise.all([
        paymentService.getPaymentHistory().catch(() => []),
        contractService.getMyContracts().catch(() => []),
      ]);
      setPayments(Array.isArray(historyData) ? historyData : []);
      setContracts(Array.isArray(contractsData) ? contractsData : []);
    } catch (err) {
      console.error('Fetch earnings data error:', err);
      setError(err?.message || 'Failed to load earnings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived statistics from live data
  const clearedPayments = payments.filter((p) => p.status === 'released' || p.status === 'successful');
  const totalEarnings = clearedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const pendingEscrow = contracts
    .filter((c) => c.status === 'active' || c.status === 'submitted')
    .reduce((sum, c) => sum + (c.totalAmount || c.amount || 0), 0);

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const last30DaysEarnings = clearedPayments
    .filter((p) => new Date(p.createdAt || p.date).getTime() >= thirtyDaysAgo)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const earningStats = [
    { label: 'Total Earnings', value: `₦${totalEarnings.toLocaleString()}`, subtext: 'Lifetime earnings on platform' },
    { label: 'Available Balance', value: `₦${totalEarnings.toLocaleString()}`, subtext: 'Ready to withdraw' },
    { label: 'Pending Payment', value: `₦${pendingEscrow.toLocaleString()}`, subtext: 'In active contracts or review' },
    { label: 'Last 30 Days', value: `₦${last30DaysEarnings.toLocaleString()}`, subtext: 'Cleared within 30 days' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Earnings Overview</h1>
          <p className="text-slate-500 mt-1">Detailed breakdown of your financial activity.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
          <p className="text-sm">Calculating earnings...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {earningStats.map((stat, idx) => (
              <div key={idx} className="bg-white p-4 md:p-6 border border-slate-200 rounded-2xl shadow-sm">
                <p className="text-xs md:text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                <p className="text-xl md:text-3xl font-bold text-slate-900 mb-2">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.subtext}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Cleared Transactions</h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 text-slate-700">
                {clearedPayments.length} Total
              </span>
            </div>
            <div className="overflow-x-auto">
              {clearedPayments.length === 0 ? (
                <div className="p-10 text-center text-slate-500">
                  <p className="font-semibold text-slate-700">No cleared payments yet</p>
                  <p className="text-sm text-slate-400 mt-1">
                    When clients approve your milestone submissions, your payments will appear here.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-slate-100 text-sm text-slate-500">
                      <th className="px-6 py-4 font-medium">Description / Contract</th>
                      <th className="px-6 py-4 font-medium">Date Cleared</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clearedPayments.map((trx) => {
                      const desc = trx.contractId?.title || 'Contract Milestone Release';
                      const dateStr = trx.createdAt
                        ? new Date(trx.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—';

                      return (
                        <tr key={trx._id || trx.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-bold text-slate-900">{desc}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{dateStr}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 capitalize">
                              {trx.status || 'Cleared'}
                            </span>
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
          </div>
        </>
      )}
    </div>
  );
};

export default Earnings;
