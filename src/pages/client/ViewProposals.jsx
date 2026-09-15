import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, DollarSign, Clock, MessageSquare, Briefcase,
  Loader2, CheckCircle, AlertCircle, User as UserIcon, X, Star,
  Paperclip, FileText, Download, ExternalLink, LayoutGrid, List
} from 'lucide-react';
import { jobService, proposalService } from '../../services/api';

// ─── Confirm Modal ───────────────────────────────────────────────────────────
const ConfirmModal = ({ isOpen, title, message, confirmText, confirmClass, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in">
        <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 rounded-xl text-white font-semibold text-sm shadow-sm transition-colors ${confirmClass || 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ViewProposals = () => {
  const { id } = useParams(); // may be undefined when visiting /client/proposals
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [allJobs, setAllJobs] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [acceptedFreelancer, setAcceptedFreelancer] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeViewMode = isMobile ? 'list' : viewMode;

  // Modal state
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, proposalId: null });

  // ── Load data ──
  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (id) {
        // Viewing proposals for a specific job
        const [jobData, proposalsData] = await Promise.all([
          jobService.getJobById(id).catch(() => null),
          proposalService.getProposalsForJob(id).catch(() => []),
        ]);
        setJob(jobData);
        setProposals(Array.isArray(proposalsData) ? proposalsData : []);
      } else {
        // No job ID – fetch all client's jobs and then all their proposals
        const jobsData = await jobService.getMyJobs().catch(() => []);
        const jobsList = Array.isArray(jobsData) ? jobsData : (jobsData?.jobs || []);
        setAllJobs(jobsList);

        if (jobsList.length > 0) {
          const proposalArrays = await Promise.all(
            jobsList.map((j) =>
              proposalService
                .getProposalsForJob(j._id || j.id)
                .then((res) => {
                  const list = Array.isArray(res) ? res : [];
                  return list.map((p) => ({ ...p, _jobData: j }));
                })
                .catch(() => [])
            )
          );
          setProposals(proposalArrays.flat());
        } else {
          setProposals([]);
        }
      }
    } catch (err) {
      console.error('Error loading proposals:', err);
      setError(err?.message || 'Failed to load proposals');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Accept proposal ──
  const openAcceptModal = (proposalId) => {
    setConfirmModal({ isOpen: true, type: 'accept', proposalId });
  };

  const openRejectModal = (proposalId) => {
    setConfirmModal({ isOpen: true, type: 'reject', proposalId });
  };

  const closeModal = () => setConfirmModal({ isOpen: false, type: null, proposalId: null });

  const handleConfirm = async () => {
    const { type, proposalId } = confirmModal;
    closeModal();
    setProcessingId(proposalId);
    setError('');

    try {
      if (type === 'accept') {
        await proposalService.acceptProposal(proposalId);
        const proposal = proposals.find((item) => (item._id || item.id) === proposalId);
        setAcceptedFreelancer(proposal?.freelancerId || null);
        setSuccessMsg('Proposal accepted! Contract has been generated.');
      } else if (type === 'reject') {
        await proposalService.rejectProposal(proposalId);
        setProposals((prev) =>
          prev.map((p) => ((p._id || p.id) === proposalId ? { ...p, status: 'rejected' } : p))
        );
        setSuccessMsg('Proposal declined.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error(`${type} proposal error:`, err);
      setError(err?.message || `Failed to ${type} proposal`);
    } finally {
      setProcessingId(null);
    }
  };

  // ── Render ──
  const totalProposals = proposals.length;
  const pendingCount = proposals.filter((p) => p.status === 'pending').length;

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-6">
      {acceptedFreelancer && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 p-4 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center">
            <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border border-slate-200 flex items-center justify-center">
              {acceptedFreelancer.profileImage ? <img src={acceptedFreelancer.profileImage} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-7 h-7 text-slate-300" />}
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900">You hired {`${acceptedFreelancer.firstname || 'your freelancer'} ${acceptedFreelancer.lastname || ''}`.trim()}!</h2>
            <p className="mt-2 text-sm text-slate-600">View their public profile, or continue to manage the new contract.</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link to={`/client/freelancers/${acceptedFreelancer._id || acceptedFreelancer.id}`} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">View profile</Link>
              <button onClick={() => { setAcceptedFreelancer(null); navigate('/client/contracts'); }} className="rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">View contract</button>
            </div>
          </div>
        </div>
      )}
      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.type === 'accept' ? 'Hire This Freelancer?' : 'Decline This Proposal?'}
        message={
          confirmModal.type === 'accept'
            ? 'This will accept the proposal and generate an active project contract.'
            : 'This will decline the proposal. The freelancer will be notified.'
        }
        confirmText={confirmModal.type === 'accept' ? 'Yes, Hire Them' : 'Yes, Decline'}
        confirmClass={
          confirmModal.type === 'accept'
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-red-500 hover:bg-red-600'
        }
        onConfirm={handleConfirm}
        onCancel={closeModal}
      />

      {/* Header */}
      <Link
        to="/client/jobs"
        className="flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Posted Jobs
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {id ? 'Review Proposals' : 'All Incoming Proposals'}
          </h1>
          <p className="text-slate-500 mt-1">
            {job ? (
              <>
                <strong className="text-slate-800">{job.title}</strong> •{' '}
                {totalProposals} proposal{totalProposals !== 1 ? 's' : ''} received
              </>
            ) : (
              <>
                {totalProposals} proposal{totalProposals !== 1 ? 's' : ''} across all your jobs
                {pendingCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                    {pendingCount} pending review
                  </span>
                )}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="ml-auto text-green-600 hover:text-green-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Fetching proposals...</p>
        </div>
      ) : proposals.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Proposals Yet</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
            {id
              ? "Freelancers are reviewing your posting. You'll receive notifications as proposals arrive."
              : "You haven't received any proposals yet. Post a job to start receiving bids from freelancers."}
          </p>
          {!id && (
            <Link
              to="/client/post-job"
              className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-sm"
            >
              Post a Job
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="px-1">
              <p className="text-sm font-bold text-slate-900">Proposal view</p>
              <p className="text-xs text-slate-500">Switch between quick cards and a detailed list.</p>
            </div>
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  activeViewMode === 'grid' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  activeViewMode === 'list' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
            </div>
          </div>

          <div className={activeViewMode === 'grid' ? 'grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6' : 'space-y-4'}>
            {proposals.map((proposal) => {
              const proposalId = proposal._id || proposal.id;
              const freelancer = typeof proposal.freelancerId === 'object' && proposal.freelancerId !== null ? proposal.freelancerId : {};
              const freelancerIdStr = typeof proposal.freelancerId === 'string' ? proposal.freelancerId : (freelancer._id || freelancer.id || '');
              const fullName = `${freelancer.firstname || 'Freelancer'} ${freelancer.lastname || ''}`.trim();
              const isAccepted = proposal.status === 'accepted';
              const isRejected = proposal.status === 'rejected';
              const jobLabel = proposal._jobData?.title || proposal.jobId?.title || null;
              const attachments = Array.isArray(proposal.attachments) ? proposal.attachments.filter(Boolean) : [];

              const getFileName = (url) => {
                try {
                  const raw = decodeURIComponent(url.split('/').pop().split('?')[0]);
                  return raw.replace(/^v\d+_/, '').replace(/_/g, ' ');
                } catch {
                  return 'Attached File';
                }
              };

              const getFileIcon = (url = '') => {
                const ext = url.split('.').pop().toLowerCase().split('?')[0];
                if (ext === 'pdf') return '📄';
                if (['doc', 'docx'].includes(ext)) return '📝';
                if (['xls', 'xlsx'].includes(ext)) return '📊';
                if (['zip', 'rar'].includes(ext)) return '🗜️';
                return '📎';
              };

              if (activeViewMode === 'list') {
                return (
                  <div key={proposalId} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-blue-200 hover:shadow-md transition-all">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-200 bg-white flex-shrink-0 flex items-center justify-center">
                          {freelancer.profileImage ? (
                            <img src={freelancer.profileImage} alt={fullName} className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-8 h-8 text-slate-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-base font-bold text-slate-900">{fullName}</h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isAccepted ? 'bg-green-100 text-green-700' : isRejected ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'
                            }`}>
                              {proposal.status || 'Pending'}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-blue-600">{freelancer.professionalTitle || 'Freelance Specialist'}</p>
                          {jobLabel && <p className="mt-1 text-xs text-slate-500 line-clamp-1">Proposal for: <span className="font-semibold text-slate-700">{jobLabel}</span></p>}
                          <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-2">{proposal.coverLetter || 'No cover letter provided.'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 lg:w-64 flex-shrink-0">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bid</p>
                          <p className="text-sm font-bold text-slate-900">₦{Number(proposal.bidAmount || 0).toLocaleString()}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Delivery</p>
                          <p className="text-sm font-bold text-slate-900">{proposal.deliveryTime || 7} days</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <div className="flex flex-wrap gap-2">
                        <Link to={`/client/freelancers/${freelancer._id || freelancer.id || ''}`} className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50">View Profile</Link>
                        <Link to={`/client/messages?recipient=${freelancerIdStr}`} className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Message</Link>
                      </div>
                      {!isAccepted && !isRejected ? (
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => openRejectModal(proposalId)} disabled={processingId === proposalId} className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-red-50 hover:text-red-600">Decline</button>
                          <button onClick={() => openAcceptModal(proposalId)} disabled={processingId === proposalId} className="px-4 py-2 rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-700 inline-flex items-center gap-1.5">
                            {processingId === proposalId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Briefcase className="w-3.5 h-3.5" />}
                            Hire Freelancer
                          </button>
                        </div>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold ${isAccepted ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                          {isAccepted ? <CheckCircle className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          {isAccepted ? 'Contract Active' : 'Proposal Declined'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div key={proposalId} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-w-0">
                  <div className="p-4 md:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col justify-between">
                    <div>
                      {!id && jobLabel && (
                        <div className="mb-3 px-2.5 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-[11px] md:text-xs font-semibold text-blue-700 flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="line-clamp-2">{jobLabel}</span>
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3 md:gap-4 mb-4">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border border-slate-200 bg-white flex-shrink-0 flex items-center justify-center">
                          {freelancer.profileImage ? <img src={freelancer.profileImage} alt={fullName} className="w-full h-full object-cover" /> : <UserIcon className="w-7 h-7 md:w-8 md:h-8 text-slate-300" />}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm md:text-base font-bold text-slate-900 leading-tight line-clamp-2">{fullName}</h3>
                          <p className="text-xs font-semibold text-blue-600 mt-0.5">{freelancer.professionalTitle || 'Freelance Specialist'}</p>
                          {freelancer.location && <p className="text-xs text-slate-500 flex items-center mt-1"><MapPin className="w-3 h-3 mr-1 text-slate-400 flex-shrink-0" /> <span className="line-clamp-1">{freelancer.location}</span></p>}
                          {freelancer.rating > 0 && <p className="text-xs text-amber-600 flex items-center gap-1 mt-1 font-medium"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{freelancer.rating?.toFixed(1)} ({freelancer.totalReviews || 0} reviews)</p>}
                        </div>
                      </div>
                      {freelancer.skills && freelancer.skills.length > 0 && (
                        <div className="mb-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Skills</p>
                          <div className="flex flex-wrap gap-1.5">{freelancer.skills.slice(0, 5).map((skill, idx) => <span key={idx} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-md">{skill}</span>)}</div>
                        </div>
                      )}
                    </div>
                    <div className="pt-4 border-t border-slate-200">
                      <Link to={`/client/freelancers/${freelancer._id || freelancer.id || ''}`} className="w-full block text-center py-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-xs shadow-sm">View Public Profile</Link>
                    </div>
                  </div>

                  <div className="p-4 md:p-5 flex flex-1 flex-col justify-between space-y-5">
                    <div>
                      <div className="grid grid-cols-2 gap-2.5 mb-5">
                        <div className="bg-slate-50 px-3 md:px-4 py-2.5 rounded-xl border border-slate-200">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bid Amount</p>
                          <p className="text-sm md:text-lg font-bold text-slate-900">₦{Number(proposal.bidAmount || 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-50 px-3 md:px-4 py-2.5 rounded-xl border border-slate-200">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delivery Time</p>
                          <p className="text-sm md:text-lg font-bold text-slate-900">{proposal.deliveryTime || 7} Days</p>
                        </div>
                        <div className="col-span-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isAccepted ? 'bg-green-100 text-green-700' : isRejected ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'}`}>{proposal.status || 'Pending'}</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 text-sm mb-2">Cover Letter & Pitch</h4>
                        <p className="text-slate-700 text-xs md:text-sm leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-3 md:p-4 rounded-xl border border-slate-100 line-clamp-5">{proposal.coverLetter || 'No cover letter provided.'}</p>
                      </div>

                      {attachments.length > 0 && (
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm mb-2.5 flex items-center gap-2"><Paperclip className="w-4 h-4 text-blue-600" />Attached Documents ({attachments.length})</h4>
                          <div className="grid grid-cols-2 gap-2.5">
                            {attachments.map((fileUrl, index) => {
                              const fileName = getFileName(fileUrl);
                              const fileIcon = getFileIcon(fileUrl);
                              return <a key={index} href={fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2.5 md:p-3 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-blue-50/60 hover:border-blue-200 transition-all group"><div className="flex items-center gap-2.5 min-w-0 pr-2"><span className="text-lg flex-shrink-0">{fileIcon}</span><span className="text-[11px] md:text-xs font-semibold text-slate-700 group-hover:text-blue-700 truncate">{fileName}</span></div><div className="flex items-center gap-1 text-slate-400 group-hover:text-blue-600 flex-shrink-0"><Download className="w-3.5 h-3.5" /><ExternalLink className="w-3 h-3 opacity-60" /></div></a>;
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
                      {!isAccepted && !isRejected && (
                        <>
                          <button onClick={() => openAcceptModal(proposalId)} disabled={processingId === proposalId} className="w-full px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 text-xs md:text-sm disabled:opacity-60">{processingId === proposalId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4" />}Hire Freelancer</button>
                          <Link to={`/client/messages?recipient=${freelancerIdStr}`} className="w-full px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-xs md:text-sm shadow-sm"><MessageSquare className="w-4 h-4" /> Message</Link>
                          <button onClick={() => openRejectModal(proposalId)} disabled={processingId === proposalId} className="w-full px-4 py-2 text-slate-500 hover:text-red-600 font-medium transition-colors text-xs md:text-sm">Decline</button>
                        </>
                      )}
                      {isAccepted && <div className="flex items-center justify-center gap-2 text-green-700 text-xs md:text-sm font-bold bg-green-50 px-4 py-2 rounded-xl border border-green-200"><CheckCircle className="w-4 h-4" /> Contract Active</div>}
                      {isRejected && <div className="flex items-center justify-center gap-2 text-red-600 text-xs md:text-sm font-medium bg-red-50 px-4 py-2 rounded-xl border border-red-100"><X className="w-4 h-4" /> Proposal Declined</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default ViewProposals;
