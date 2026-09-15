import React, { useState, useEffect, useCallback } from 'react';
import Tabs from '../../components/ui/Tabs';
import StatusBadge from '../../components/ui/StatusBadge';
import { Clock, DollarSign, Loader2, AlertCircle, FileText, ArrowRight, XCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { proposalService } from '../../services/api';

// ─── Confirm Modal ────────────────────────────────────────────────────────────
const ConfirmModal = ({ isOpen, title, message, confirmText, onConfirm, onCancel, isLoading }) => {
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
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm shadow-sm transition-colors flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

const MyProposals = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [withdrawModal, setWithdrawModal] = useState({ isOpen: false, proposalId: null });

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await proposalService.getMyProposals();
      setProposals(Array.isArray(data) ? data : data.proposals || []);
    } catch (err) {
      console.error('Fetch my proposals error:', err);
      setError(err?.message || 'Failed to load your proposals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const openWithdrawModal = (proposalId) => setWithdrawModal({ isOpen: true, proposalId });
  const closeWithdrawModal = () => setWithdrawModal({ isOpen: false, proposalId: null });

  const handleWithdraw = async () => {
    const proposalId = withdrawModal.proposalId;
    closeWithdrawModal();
    setWithdrawingId(proposalId);
    try {
      await proposalService.withdrawProposal(proposalId);
      setProposals((prev) =>
        prev.map((p) => (p._id === proposalId ? { ...p, status: 'withdrawn' } : p))
      );
    } catch (err) {
      setError(err?.message || 'Failed to withdraw proposal');
    } finally {
      setWithdrawingId(null);
    }
  };

  const pendingCount = proposals.filter((p) => p.status === 'pending').length;
  const acceptedCount = proposals.filter((p) => p.status === 'accepted').length;
  const rejectedCount = proposals.filter((p) => p.status === 'rejected' || p.status === 'withdrawn').length;

  const tabs = [
    { id: 'all', label: 'All Proposals', count: proposals.length },
    { id: 'pending', label: 'Pending / Under Review', count: pendingCount },
    { id: 'accepted', label: 'Accepted (Contracts)', count: acceptedCount },
    { id: 'rejected', label: 'Archived / Declined', count: rejectedCount },
  ];

  const filteredProposals = proposals.filter((p) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'rejected') return p.status === 'rejected' || p.status === 'withdrawn';
    return p.status === activeTab;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <ConfirmModal
        isOpen={withdrawModal.isOpen}
        title="Withdraw Proposal?"
        message="Are you sure you want to withdraw this proposal? This job remains closed to new applications."
        confirmText="Withdraw"
        onConfirm={handleWithdraw}
        onCancel={closeWithdrawModal}
      />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Proposals</h1>
          <p className="text-slate-500 mt-1">Manage and track your active bids submitted to clients.</p>
        </div>
        <Link
          to="/freelancer/jobs"
          className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm inline-block text-center text-sm"
        >
          Browse Open Jobs
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 pt-6 border-b border-slate-200 bg-slate-50">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium">Loading your submitted proposals...</p>
          </div>
        ) : filteredProposals.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FileText className="w-7 h-7" />
            </div>
            <p className="text-slate-700 font-bold text-base">No proposals in this category</p>
            <p className="text-slate-400 text-xs mt-1">Explore available projects and submit your first bid.</p>
            <Link
              to="/freelancer/jobs"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
            >
              <span>Browse Jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredProposals.map((proposal) => {
              const proposalId = proposal._id || proposal.id;
              const job = proposal.jobId || {};
              const client = job.clientId || {};
              const clientName = client.companyName || `${client.firstname || 'Client'} ${client.lastname || ''}`.trim();
              const dateSubmitted = proposal.createdAt
                ? new Date(proposal.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Recent';

              return (
                <div key={proposalId} className="p-6 hover:bg-slate-50 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-1.5">
                      <Link 
                        to={`/freelancer/jobs/${job._id || ''}`}
                        className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        {job.title || 'Job Proposal'}
                      </Link>
                      <StatusBadge status={proposal.status} />
                    </div>
                    
                    <p className="text-xs font-medium text-slate-500 mb-3">
                      Client: <strong className="text-slate-700">{clientName || 'Confidential Client'}</strong>
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center font-bold text-slate-800">
                        <DollarSign className="w-3.5 h-3.5 mr-0.5 text-slate-400" />
                        ₦{Number(proposal.bidAmount || 0).toLocaleString()}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {proposal.deliveryTime || 7} days delivery
                      </span>
                      <span>Submitted on {dateSubmitted}</span>
                    </div>

                    <p className="text-slate-600 text-xs mt-3 line-clamp-1 italic bg-slate-50 p-2 rounded-lg border border-slate-100 max-w-2xl">
                      "{proposal.coverLetter}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full lg:w-auto">
                    {proposal.status === 'accepted' ? (
                      <Link 
                        to="/freelancer/contracts"
                        className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-xs shadow-sm flex items-center gap-1.5"
                      >
                        <span>View Contract</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <Link 
                        to={`/freelancer/jobs/${job._id || ''}`}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-800 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-xs shadow-sm"
                      >
                        View Job
                      </Link>
                    )}

                    {proposal.status === 'pending' && (
                      <button
                        onClick={() => openWithdrawModal(proposalId)}
                        disabled={withdrawingId === proposalId}
                        title="Withdraw Proposal"
                        className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-xl transition-colors disabled:opacity-50"
                      >
                        {withdrawingId === proposalId ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          'Withdraw'
                        )}
                      </button>
                    )}
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

export default MyProposals;
