import React, { useState, useEffect, useCallback } from 'react';
import StatusBadge from '../../components/ui/StatusBadge';
import { Search, Eye, Loader2, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/api';

const Contracts = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter.toLowerCase();
      const data = await adminService.getContracts(params);
      setContracts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch admin contracts error:', err);
      setError(err?.message || 'Failed to load contracts');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const filtered = contracts.filter((c) => {
    const s = search.toLowerCase();
    const freelancerName = c.freelancerId
      ? `${c.freelancerId.firstname || ''} ${c.freelancerId.lastname || ''}`.trim() || c.freelancerId.email
      : '';
    const clientName = c.clientId
      ? `${c.clientId.firstname || ''} ${c.clientId.lastname || ''}`.trim() ||
        c.clientId.companyName ||
        c.clientId.email
      : '';
    const jobTitle = c.title || c.jobId?.title || '';
    const cid = (c._id || c.id || '').toString();

    return (
      !s ||
      jobTitle.toLowerCase().includes(s) ||
      freelancerName.toLowerCase().includes(s) ||
      clientName.toLowerCase().includes(s) ||
      cid.toLowerCase().includes(s)
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manage Contracts</h1>
        <p className="text-slate-500 mt-1">Inspect and manage all contracts across the platform.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 bg-slate-50">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by job, freelancer, client, or contract ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="submitted">Submitted</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="disputed">Disputed</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
              <p className="text-sm">Loading contracts...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p className="font-semibold text-slate-700">No contracts found</p>
              <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-sm text-slate-500">
                  <th className="px-6 py-4 font-medium">Contract ID</th>
                  <th className="px-6 py-4 font-medium">Job / Title</th>
                  <th className="px-6 py-4 font-medium">Freelancer</th>
                  <th className="px-6 py-4 font-medium">Client</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Payment Status</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => {
                  const freelancerName = c.freelancerId
                    ? `${c.freelancerId.firstname || ''} ${c.freelancerId.lastname || ''}`.trim() ||
                      c.freelancerId.email
                    : 'Unknown';
                  const clientName = c.clientId
                    ? `${c.clientId.firstname || ''} ${c.clientId.lastname || ''}`.trim() ||
                      c.clientId.companyName ||
                      c.clientId.email
                    : 'Unknown';
                  const jobTitle = c.title || c.jobId?.title || 'Contract';
                  const cid = (c._id || c.id || '').toString();

                  return (
                    <tr key={cid} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        {cid.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900 text-sm max-w-[180px] truncate">
                        {jobTitle}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{freelancerName}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{clientName}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        ₦{Number(c.totalAmount || c.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold capitalize text-slate-600">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                          {c.paymentStatus || 'unpaid'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={c.status} />
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
            Showing {filtered.length} of {contracts.length} contracts
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contracts;
