import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, MessageSquare, CheckCircle, Clock, FileText, 
  Download, AlertTriangle, X, Loader2, AlertCircle, 
  DollarSign, Calendar, ExternalLink, ShieldCheck, User as UserIcon, MoreVertical 
} from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import { contractService } from '../../services/api';
import FeedbackModal from '../../components/ui/FeedbackModal';

const ClientContractDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals & Action States
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [actionSuccessTitle, setActionSuccessTitle] = useState('Success');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const fetchContract = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await contractService.getContractById(id);
      setContract(data);
    } catch (err) {
      console.error('Fetch contract error:', err);
      setError(err?.message || 'Contract details not found');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchContract();
  }, [id, fetchContract]);

  const handleApproveWork = async () => {
    setIsProcessing(true);
    setError('');
    try {
      await contractService.approveWork(id);
      setShowApproveModal(false);
      navigate(`/client/payments?contractId=${id}&pay=true`);
    } catch (err) {
      console.error('Approve error:', err);
      setError(err?.message || 'Failed to approve work');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestRevision = async (e) => {
    e.preventDefault();
    if (!revisionNotes.trim()) return;

    setIsProcessing(true);
    setError('');
    try {
      await contractService.requestRevision(id, { notes: revisionNotes.trim() });
      setActionSuccessTitle('Revision request sent');
      setActionSuccessMsg('Revision request sent to the freelancer.');
      setShowRevisionModal(false);
      setRevisionNotes('');
      fetchContract();
    } catch (err) {
      console.error('Revision error:', err);
      setError(err?.message || 'Failed to request revision');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-24 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium">Loading contract overview...</p>
      </div>
    );
  }

  if (error && !contract) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl inline-flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error || 'Contract could not be loaded'}</span>
        </div>
        <div>
          <button
            onClick={() => navigate('/client/contracts')}
            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 transition-colors shadow-sm"
          >
            Back to Contracts
          </button>
        </div>
      </div>
    );
  }

  const freelancer = contract.freelancerId || {};
  const freelancerName = `${freelancer.firstname || 'Freelancer'} ${freelancer.lastname || ''}`.trim();
  const formattedAmount = `₦${Number(contract.agreedAmount || 0).toLocaleString()}`;
  const isSubmitted = contract.status === 'submitted';
  const isCompleted = contract.status === 'completed';

  let workSubmissionData = null;
  if (contract.workSubmission) {
    try {
      workSubmissionData = JSON.parse(contract.workSubmission);
    } catch {
      workSubmissionData = { description: contract.workSubmission };
    }
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-6">
      <FeedbackModal
        open={Boolean(actionSuccessMsg)}
        onClose={() => setActionSuccessMsg('')}
        title={actionSuccessTitle}
        message={actionSuccessMsg}
        variant="success"
      />
      {/* Approve Work Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Approve Work Deliverables</h2>
              <button onClick={() => setShowApproveModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              Are you satisfied with the deliverables submitted by <strong className="text-slate-900">{freelancerName}</strong>?
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Payment Amount Due</p>
              <p className="font-bold text-slate-900 text-2xl">{formattedAmount}</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex gap-2.5 mb-8">
              <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 leading-normal">
                Approving work will direct you straight to the Payments page where you can click <strong>"Pay with Paystack"</strong> to complete payment.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApproveWork}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white font-semibold rounded-xl text-sm hover:bg-green-700 shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Approve & Pay {formattedAmount}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <form onSubmit={handleRequestRevision} className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Request Revision</h2>
              <button type="button" onClick={() => setShowRevisionModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Specify what changes or adjustments you require before approving this milestone.
            </p>

            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-700 mb-2">Revision Instructions</label>
              <textarea
                rows={4}
                required
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="Please adjust the following items..."
                className="block w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-sm"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowRevisionModal(false)}
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Send Request
              </button>
            </div>
          </form>
        </div>
      )}

      <button onClick={() => navigate('/client/contracts')} className="flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors inline-flex">
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Contracts
      </button>

      {actionSuccessMsg && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0 flex items-center justify-center">
              {freelancer.profileImage ? (
                <img src={freelancer.profileImage} alt={freelancerName} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-slate-900">{contract.title}</h1>
                <StatusBadge status={contract.status} />
              </div>
              <p className="text-slate-500 text-sm font-medium">
                Hired Freelancer: <Link to={`/client/freelancers/${freelancer._id || ''}`} className="text-blue-600 font-bold hover:underline">{freelancerName}</Link>
              </p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Link 
              to={`/client/messages?recipient=${freelancer._id || ''}`} 
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              Message
            </Link>
            <div className="relative">
              <button type="button" onClick={() => setShowProfileMenu((open) => !open)} className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50" aria-label="More freelancer options"><MoreVertical className="w-5 h-5" /></button>
              {showProfileMenu && <div className="absolute right-0 top-12 z-20 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"><Link to={`/client/freelancers/${freelancer._id || ''}`} className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">View public profile</Link></div>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">

          {/* Submitted Work for Review Banner */}
          {isSubmitted && workSubmissionData && (
            <div className="bg-white border-2 border-blue-400 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Work Submitted for Review</h2>
                  <p className="text-xs text-slate-500">Deliverables ready for your inspection and release</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words break-all [overflow-wrap:anywhere] overflow-hidden">
                {workSubmissionData.description}
              </div>

              {workSubmissionData.stagingUrl && (
                <a
                  href={workSubmissionData.stagingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 font-bold hover:underline break-all max-w-full overflow-hidden"
                >
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{workSubmissionData.stagingUrl}</span>
                </a>
              )}

              <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setShowApproveModal(true)} 
                  className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center gap-2 text-sm"
                >
                  <CheckCircle className="w-4 h-4" /> Approve Work & Proceed to Payment
                </button>
                <button 
                  onClick={() => setShowRevisionModal(true)}
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm"
                >
                  Request Revision
                </button>
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-green-900 text-base">Work Deliverables Approved</h3>
                  <p className="text-xs text-green-700 mt-0.5">
                    {contract.paymentStatus === 'paid'
                      ? `Payment of ${formattedAmount} confirmed by freelancer.`
                      : contract.paymentStatus === 'payment_sent'
                      ? `Payment of ${formattedAmount} sent via Paystack. Awaiting freelancer confirmation.`
                      : `Please proceed to payment to finalize contract settlement.`}
                  </p>
                </div>
              </div>
              {contract.paymentStatus === 'unpaid' && (
                <button
                  onClick={() => navigate(`/client/payments?contractId=${contract._id}&pay=true`)}
                  className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex-shrink-0"
                >
                  Pay with Paystack
                </button>
              )}
            </div>
          )}

          {/* Project Details & Agreement */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">Project Agreement Terms</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {contract.jobId?.description || 'All specifications agreed upon during hiring.'}
            </p>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-sm">{contract.title}</p>
                <p className="text-xs text-slate-500">Fixed Milestone Contract</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900 text-base">{formattedAmount}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  contract.paymentStatus === 'paid'
                    ? 'bg-green-100 text-green-700'
                    : contract.paymentStatus === 'payment_sent'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {contract.paymentStatus === 'paid' ? 'Payment Confirmed' : contract.paymentStatus === 'payment_sent' ? 'Payment Sent' : 'Unpaid'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-6">Contract Summary</h2>
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Contract Budget</p>
                <p className="text-2xl font-bold text-slate-900">{formattedAmount}</p>
                <span className="text-xs text-slate-500 capitalize">{contract.budgetType || 'Fixed'} Pricing</span>
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-blue-700 font-bold bg-blue-50 p-2.5 rounded-xl border border-blue-200">
                  <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Secure Paystack Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientContractDetails;
