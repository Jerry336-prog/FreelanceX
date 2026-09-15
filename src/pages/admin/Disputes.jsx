import React, { useState, useEffect, useCallback } from 'react';
import Tabs from '../../components/ui/Tabs';
import StatusBadge from '../../components/ui/StatusBadge';
import { Search, Eye, X, AlertTriangle, CheckCircle, Clock, Loader2, AlertCircle } from 'lucide-react';
import { disputeService } from '../../services/api';

const Disputes = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [detailDispute, setDetailDispute] = useState(null);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDisputes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (activeTab !== 'all') params.status = activeTab;
      const data = await disputeService.getDisputes(params);
      setDisputes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch disputes error:', err);
      setError(err?.message || 'Failed to load disputes');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  const handleResolve = async (decision) => {
    if (!detailDispute) return;
    setActionLoading(true);
    try {
      const resolution =
        decision === 'favor_client'
          ? 'Refund issued to client in full'
          : 'Contract funds disbursed to freelancer';
      await disputeService.resolveDispute(detailDispute._id || detailDispute.id, {
        decision,
        resolution,
      });
      setDisputes((prev) =>
        prev.map((d) =>
          (d._id || d.id) === (detailDispute._id || detailDispute.id) ? { ...d, status: 'resolved' } : d
        )
      );
      setDetailDispute(null);
    } catch (err) {
      setError(err?.message || 'Failed to resolve dispute');
    } finally {
      setActionLoading(false);
    }
  };

  const openCount = disputes.filter((d) => d.status === 'open').length;
  const resolvedCount = disputes.filter((d) => d.status === 'resolved').length;

  const tabs = [
    { id: 'all', label: 'All Disputes', count: disputes.length },
    { id: 'open', label: 'Open', count: openCount },
    { id: 'resolved', label: 'Resolved', count: resolvedCount },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Dispute Detail Modal */}
      {detailDispute && (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Dispute #{((detailDispute._id || detailDispute.id) || '').toString().slice(-8).toUpperCase()}
                </h2>
                <p className="text-sm text-slate-500 mt-1">{detailDispute.reason}</p>
              </div>
              <button
                onClick={() => setDetailDispute(null)}
                className="text-slate-400 hover:text-slate-600 p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client Card */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-3">Client</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center font-bold text-purple-800 uppercase">
                    {detailDispute.clientId?.firstname?.[0] || 'C'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">
                      {detailDispute.clientId
                        ? `${detailDispute.clientId.firstname || ''} ${detailDispute.clientId.lastname || ''}`.trim() ||
                          detailDispute.clientId.email
                        : 'Unknown Client'}
                    </p>
                    <p className="text-xs text-slate-500">{detailDispute.clientId?.email}</p>
                  </div>
                </div>
              </div>

              {/* Freelancer Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Freelancer</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-800 uppercase">
                    {detailDispute.freelancerId?.firstname?.[0] || 'F'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">
                      {detailDispute.freelancerId
                        ? `${detailDispute.freelancerId.firstname || ''} ${detailDispute.freelancerId.lastname || ''}`.trim() ||
                          detailDispute.freelancerId.email
                        : 'Unknown Freelancer'}
                    </p>
                    <p className="text-xs text-slate-500">{detailDispute.freelancerId?.email}</p>
                  </div>
                </div>
              </div>

              {/* Description & Contract Details */}
              <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Contract</p>
                  <p className="font-bold text-slate-900">
                    {detailDispute.contractId?.title || 'Contract ID ' + detailDispute.contractId}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Dispute Description
                  </p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{detailDispute.description}</p>
                </div>
              </div>
            </div>

            {/* Resolution Controls */}
            {detailDispute.status === 'open' && (
              <div className="p-6 border-t border-slate-200 bg-slate-50">
                <p className="text-sm font-bold text-slate-900 mb-4">Admin Resolution</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    disabled={actionLoading}
                    onClick={() => handleResolve('favor_client')}
                    className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2"
                  >
                    {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <CheckCircle className="w-4 h-4" /> Resolve — Favor Client (Refund)
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleResolve('favor_freelancer')}
                    className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                  >
                    {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <CheckCircle className="w-4 h-4" /> Resolve — Favor Freelancer (Release)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dispute Management</h1>
        <p className="text-slate-500 mt-1">Investigate and resolve platform conflicts between clients and freelancers.</p>
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

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
              <p className="text-sm">Loading disputes...</p>
            </div>
          ) : disputes.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p className="font-semibold text-slate-700">No disputes found</p>
              <p className="text-sm text-slate-400 mt-1">Platform disputes will be listed here.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-sm text-slate-500">
                  <th className="px-6 py-4 font-medium">Dispute ID</th>
                  <th className="px-6 py-4 font-medium">Client</th>
                  <th className="px-6 py-4 font-medium">Freelancer</th>
                  <th className="px-6 py-4 font-medium">Contract</th>
                  <th className="px-6 py-4 font-medium">Reason</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {disputes.map((d) => {
                  const did = (d._id || d.id || '').toString();
                  const clientName = d.clientId
                    ? `${d.clientId.firstname || ''} ${d.clientId.lastname || ''}`.trim() || d.clientId.email
                    : 'Client';
                  const freelancerName = d.freelancerId
                    ? `${d.freelancerId.firstname || ''} ${d.freelancerId.lastname || ''}`.trim() ||
                      d.freelancerId.email
                    : 'Freelancer';
                  const dateStr = d.createdAt
                    ? new Date(d.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—';

                  return (
                    <tr key={did} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        {did.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{clientName}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{freelancerName}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-[150px] truncate">
                        {d.contractId?.title || 'Contract'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-[180px] truncate">{d.reason}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{dateStr}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={d.status} />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setDetailDispute(d)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Investigate
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Disputes;
