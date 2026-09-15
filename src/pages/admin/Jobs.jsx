import React, { useState, useEffect, useCallback } from 'react';
import StatusBadge from '../../components/ui/StatusBadge';
import { Search, Eye, Edit, Trash2, X, Loader2, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/api';
import { Link } from 'react-router-dom';

const Jobs = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter.toLowerCase();
      const data = await adminService.getJobs(params);
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch admin jobs error:', err);
      setError(err?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const filtered = jobs.filter((j) => {
    const s = search.toLowerCase();
    const clientName = j.clientId
      ? `${j.clientId.firstname || ''} ${j.clientId.lastname || ''} ${j.clientId.companyName || ''}`.trim()
      : '';
    const matchSearch =
      !s ||
      (j.title && j.title.toLowerCase().includes(s)) ||
      clientName.toLowerCase().includes(s) ||
      (j.category && j.category.toLowerCase().includes(s));
    return matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manage Jobs</h1>
        <p className="text-slate-500 mt-1">Monitor and moderate all job postings on the platform.</p>
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
              placeholder="Search jobs, categories, or clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
              <p className="text-sm">Loading jobs...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p className="font-semibold text-slate-700">No jobs found</p>
              <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-sm text-slate-500">
                  <th className="px-6 py-4 font-medium">Job Title</th>
                  <th className="px-6 py-4 font-medium">Client</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Budget</th>
                  <th className="px-6 py-4 font-medium">Proposals</th>
                  <th className="px-6 py-4 font-medium">Posted</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((job) => {
                  const clientName = job.clientId
                    ? `${job.clientId.firstname || ''} ${job.clientId.lastname || ''}`.trim() ||
                      job.clientId.companyName ||
                      job.clientId.email
                    : 'Unknown Client';
                  const budgetStr =
                    job.budgetType === 'fixed'
                      ? `₦${job.budget?.toLocaleString() || '0'}`
                      : job.budgetType === 'hourly'
                      ? `₦${job.hourlyRate?.from || 0} - ₦${job.hourlyRate?.to || 0}/hr`
                      : `₦${job.budget?.toLocaleString() || '0'}`;
                  const postedStr = job.createdAt
                    ? new Date(job.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—';

                  return (
                    <tr key={job._id || job.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-semibold text-slate-900 max-w-[200px] truncate">
                        {job.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{clientName}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 capitalize">{job.category || 'General'}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">{budgetStr}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{job.proposalCount || 0}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{postedStr}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Link
                            to={`/freelancer/jobs/${job._id || job.id}`}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View Public Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
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
            Showing {filtered.length} of {jobs.length} jobs
          </p>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
