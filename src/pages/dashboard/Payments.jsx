import React, { useState, useEffect, useCallback } from 'react';
import Tabs from '../../components/ui/Tabs';
import StatusBadge from '../../components/ui/StatusBadge';
import { DollarSign, Download, ArrowDownLeft, ArrowUpRight, Loader2, AlertCircle, CreditCard } from 'lucide-react';
import { paymentService, contractService } from '../../services/api';

const Payments = () => {
  const [activeTab, setActiveTab] = useState('history');
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
      console.error('Fetch payments error:', err);
      setError(err?.message || 'Failed to load payments history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const pendingContracts = contracts.filter((c) => c.paymentStatus === 'payment_sent' || (c.status === 'completed' && c.paymentStatus !== 'paid'));
  const releasedPayments = payments.filter((p) => p.status === 'released' || p.status === 'successful');

  const tabs = [
    { id: 'history', label: 'Transaction History', count: payments.length },
    { id: 'pending', label: 'Pending Confirmation', count: pendingContracts.length },
    { id: 'released', label: 'Confirmed Earnings', count: releasedPayments.length },
  ];

  const handleConfirm = async (contractId) => {
    try {
      await contractService.confirmPayment(contractId);
      loadData();
    } catch (err) {
      setError(err?.message || 'Failed to confirm payment');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments & Earnings</h1>
          <p className="text-slate-500 mt-1">Track your milestone earnings, payments received, and payout history.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 pt-6 border-b border-slate-200 bg-slate-50">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium">Loading payments records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {activeTab === 'pending' && (
              pendingContracts.length === 0 ? (
                <div className="p-16 text-center text-slate-500">
                  <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-700 font-bold text-sm">No Pending Confirmations</p>
                  <p className="text-xs text-slate-400 mt-0.5">Payments sent by clients will appear here for you to confirm.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-white border-b border-slate-100 text-xs text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Contract / Client</th>
                      <th className="px-6 py-4">Target Deadline</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingContracts.map((c) => {
                      const client = c.clientId || {};
                      const clientName = client.companyName || `${client.firstname || 'Client'} ${client.lastname || ''}`.trim();
                      const deadlineStr = c.deadline ? new Date(c.deadline).toLocaleDateString() : 'Flexible';
                      return (
                        <tr key={c._id || c.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-900">{c.title}</p>
                            <p className="text-xs text-slate-500">{clientName}</p>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600">{deadlineStr}</td>
                          <td className="px-6 py-4"><StatusBadge status={c.paymentStatus === 'payment_sent' ? 'Payment Sent' : c.status} /></td>
                          <td className="px-6 py-4 text-right font-bold text-blue-600">₦{Number(c.agreedAmount || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleConfirm(c._id || c.id)}
                              className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                            >
                              Confirm Receipt
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )
            )}

            {activeTab === 'released' && (
              releasedPayments.length === 0 ? (
                <div className="p-16 text-center text-slate-500">
                  <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-700 font-bold text-sm">No Released Funds Yet</p>
                  <p className="text-xs text-slate-400 mt-0.5">When clients approve milestone submissions, payments appear here.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-white border-b border-slate-100 text-xs text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Milestone & Client</th>
                      <th className="px-6 py-4">Date Released</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Released Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {releasedPayments.map((p) => {
                      const client = p.clientId || {};
                      const clientName = client.companyName || `${client.firstname || 'Client'} ${client.lastname || ''}`.trim();
                      const dateStr = p.releasedAt || p.createdAt ? new Date(p.releasedAt || p.createdAt).toLocaleDateString() : 'Recent';
                      return (
                        <tr key={p._id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-900">{p.jobId?.title || 'Milestone Payment'}</p>
                            <p className="text-xs text-slate-500">{clientName}</p>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600">{dateStr}</td>
                          <td className="px-6 py-4"><StatusBadge status="Released" /></td>
                          <td className="px-6 py-4 text-right font-bold text-green-600">+₦{Number(p.amount || 0).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )
            )}

            {activeTab === 'history' && (
              payments.length === 0 ? (
                <div className="p-16 text-center text-slate-500">
                  <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-700 font-bold text-sm">No Transactions Yet</p>
                  <p className="text-xs text-slate-400 mt-0.5">Your lifetime earnings and payout history will be logged here.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-white border-b border-slate-100 text-xs text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Transaction / Reference</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((trx) => {
                      const dateStr = trx.createdAt ? new Date(trx.createdAt).toLocaleDateString() : 'Recent';
                      return (
                        <tr key={trx._id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                              <ArrowDownLeft className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">Milestone Release</p>
                              <p className="text-xs text-slate-400 font-mono">{trx.transactionReference || trx._id}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600">{dateStr}</td>
                          <td className="px-6 py-4"><StatusBadge status={trx.status === 'released' ? 'Completed' : trx.status} /></td>
                          <td className="px-6 py-4 text-right font-bold text-green-600">
                            +₦{Number(trx.amount || 0).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
