import React, { useState, useEffect, useCallback } from 'react';
import StatusBadge from '../../components/ui/StatusBadge';
import { Search, Eye, Loader2, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/api';

const Proposals = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter.toLowerCase();
      const data = await adminService.getProposals(params);
      setProposals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch admin proposals error:', err);
      setError(err?.message || 'Failed to load proposals');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const filtered = proposals.filter((p) => {
    const s = search.toLowerCase();
    const freelancerName = p.freelancerId
      ? typeof p.freelancerId === 'object'
        ? `${p.freelancerId.firstname || ''} ${p.freelancerId.lastname || ''}`.trim() || p.freelancerId.email || ''
        : String(p.freelancerId)
      : '';
    const jobTitle = p.jobId && typeof p.jobId === 'object' ? p.jobId.title || '' : '';
    const client = p.jobId && typeof p.jobId === 'object' ? p.jobId.clientId : null;
    const clientName = client
      ? typeof client === 'object'
        ? `${client.firstname || ''} ${client.lastname || ''}`.trim() || client.companyName || client.email || ''
        : String(client)
      : '';

    return (
      !s ||
      freelancerName.toLowerCase().includes(s) ||
      jobTitle.toLowerCase().includes(s) ||
      clientName.toLowerCase().includes(s)
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manage Proposals</h1>
        <p className="text-slate-500 mt-1">Inspect all freelancer proposals submitted across the platform.</p>
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
              placeholder="Search by freelancer, job, or client..."
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
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
              <p className="text-sm">Loading proposals...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p className="font-semibold text-slate-700">No proposals found</p>
              <p className="text-sm text-slate-400 mt-1">Try adjusting your filters or search.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-sm text-slate-500">
                  <th className="px-6 py-4 font-medium">Freelancer</th>
                  <th className="px-6 py-4 font-medium">Job Title</th>
                  <th className="px-6 py-4 font-medium">Client</th>
                  <th className="px-6 py-4 font-medium">Bid Amount</th>
                  <th className="px-6 py-4 font-medium">Delivery</th>
                  <th className="px-6 py-4 font-medium">Submitted</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => {
                  const freelancerName = p.freelancerId
                    ? typeof p.freelancerId === 'object'
                      ? `${p.freelancerId.firstname || ''} ${p.freelancerId.lastname || ''}`.trim() ||
                        p.freelancerId.email ||
                        'Freelancer'
                      : 'Freelancer'
                    : 'Freelancer';
                  const client = p.jobId && typeof p.jobId === 'object' ? p.jobId.clientId : null;
                  const clientName = client
                    ? typeof client === 'object'
                      ? `${client.firstname || ''} ${client.lastname || ''}`.trim() ||
                        client.companyName ||
                        client.email ||
                        'Client'
                      : 'Client'
                    : 'Client';
                  const jobTitle =
                    p.jobId && typeof p.jobId === 'object' ? p.jobId.title || 'Job' : 'Job';
                  const dateStr = p.createdAt
                    ? new Date(p.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—';

                  return (
                    <tr key={p._id || p.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs uppercase">
                            {freelancerName[0] || 'F'}
                          </div>
                          <span className="font-semibold text-slate-900 text-sm">{freelancerName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 max-w-[180px] truncate font-medium">
                        {jobTitle}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{clientName}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        ₦{Number(p.bidAmount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{p.deliveryTime || 7} days</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{dateStr}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={p.status} />
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
            Showing {filtered.length} of {proposals.length} proposals
          </p>
        </div>
      </div>
    </div>
  );
};

export default Proposals;
