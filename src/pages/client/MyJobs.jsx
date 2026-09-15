import React, { useState, useEffect, useCallback } from 'react';
import Tabs from '../../components/ui/Tabs';
import StatusBadge from '../../components/ui/StatusBadge';
import { DollarSign, Clock, Users, Trash2, Loader2, AlertCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { jobService } from '../../services/api';

// ─── Confirm Modal ────────────────────────────────────────────────────────────
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, isLoading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in">
        <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm shadow-sm transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Delete Job
          </button>
        </div>
      </div>
    </div>
  );
};

const MyJobs = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, jobId: null, isLoading: false });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await jobService.getMyJobs();
      setJobs(Array.isArray(data) ? data : data.jobs || []);
    } catch (err) {
      console.error('Fetch my jobs error:', err);
      setError(err?.message || 'Failed to load your jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const openDeleteModal = (jobId) => setDeleteModal({ isOpen: true, jobId, isLoading: false });
  const closeDeleteModal = () => setDeleteModal({ isOpen: false, jobId: null, isLoading: false });

  const handleDeleteJob = async () => {
    const { jobId } = deleteModal;
    setDeleteModal((prev) => ({ ...prev, isLoading: true }));
    try {
      await jobService.deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => (j._id || j.id) !== jobId));
      closeDeleteModal();
    } catch (err) {
      setError(err?.message || 'Failed to delete job');
      closeDeleteModal();
    }
  };

  const openCount = jobs.filter((j) => j.status === 'open').length;
  const draftCount = jobs.filter((j) => j.status === 'draft').length;
  const inProgressCount = jobs.filter((j) => j.status === 'in_progress').length;
  const completedCount = jobs.filter((j) => j.status === 'completed' || j.status === 'closed').length;

  const tabs = [
    { id: 'all', label: 'All Jobs', count: jobs.length },
    { id: 'open', label: 'Open / Active', count: openCount },
    { id: 'in_progress', label: 'In Progress', count: inProgressCount },
    { id: 'draft', label: 'Drafts', count: draftCount },
    { id: 'completed', label: 'Completed', count: completedCount },
  ];

  const filteredJobs = jobs.filter((j) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'completed') return j.status === 'completed' || j.status === 'closed';
    return j.status === activeTab;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Job Posting?"
        message="This will permanently delete the job posting and all associated proposals. This action cannot be undone."
        onConfirm={handleDeleteJob}
        onCancel={closeDeleteModal}
        isLoading={deleteModal.isLoading}
      />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Jobs</h1>
          <p className="text-slate-500 mt-1">Manage your job postings, track applicant bids, and create contracts.</p>
        </div>
        <Link 
          to="/client/post-job" 
          className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm inline-block text-center text-sm"
        >
          Post a New Job
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 pt-6 border-b border-slate-200 bg-slate-50">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium">Loading your posted jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-slate-600 text-base font-semibold">No jobs found in this category.</p>
            <p className="text-slate-400 text-xs mt-1">Post a new job to start receiving proposals from top freelancers.</p>
            <Link
              to="/client/post-job"
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
            >
              Post a Job Now
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredJobs.map((job) => {
              const jobId = job._id || job.id;
              const formattedBudget = `₦${Number(job.budget || 0).toLocaleString()}`;
              const timeAgo = job.createdAt
                ? new Date(job.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Recently';

              return (
                <div key={jobId} className="p-6 hover:bg-slate-50 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <Link 
                        to={`/client/jobs/${jobId}/proposals`}
                        className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        {job.title}
                      </Link>
                      <StatusBadge status={job.status === 'open' ? 'Active' : job.status} />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center font-bold text-slate-800">
                        <DollarSign className="w-3.5 h-3.5 mr-0.5 text-slate-400" />
                        {formattedBudget} <span className="font-normal text-slate-500 ml-1">({job.budgetType || 'Fixed'})</span>
                      </span>
                      <span className="flex items-center">
                        <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {job.proposalCount || 0} proposals received
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        Posted {timeAgo}
                      </span>
                      {job.category && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium uppercase tracking-wider text-[10px]">
                          {job.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full lg:w-auto">
                    <Link 
                      to={`/client/jobs/${jobId}/proposals`}
                      className="flex-1 lg:flex-none text-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-xs shadow-sm"
                    >
                      View Proposals ({job.proposalCount || 0})
                    </Link>

                    <button
                      onClick={() => openDeleteModal(jobId)}
                      title="Delete Job"
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJobs;
