import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, CheckCircle, Clock, FileText, DollarSign, Calendar, ShieldCheck, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import { contractService } from '../../services/api';

const ContractDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState(false);

  useEffect(() => {
    const fetchContract = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await contractService.getContractById(id);
        setContract(data);
      } catch (err) {
        console.error('Fetch contract error:', err);
        setError(err?.message || 'Contract not found');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchContract();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-24 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium">Loading contract details...</p>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl inline-flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error || 'Contract could not be loaded'}</span>
        </div>
        <div>
          <button
            onClick={() => navigate('/freelancer/contracts')}
            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 transition-colors shadow-sm"
          >
            Back to Contracts
          </button>
        </div>
      </div>
    );
  }

  const handleConfirmPayment = async () => {
    setConfirming(true);
    setError('');
    try {
      await contractService.confirmPayment(id);
      setConfirmSuccess(true);
      const updated = await contractService.getContractById(id);
      setContract(updated);
    } catch (err) {
      console.error('Confirm payment error:', err);
      setError(err?.message || 'Failed to confirm payment');
    } finally {
      setConfirming(false);
    }
  };

  const client = contract.clientId || {};
  const clientName = client.companyName || `${client.firstname || 'Client'} ${client.lastname || ''}`.trim();
  const formattedAmount = `₦${Number(contract.agreedAmount || 0).toLocaleString()}`;
  const startDateStr = contract.createdAt
    ? new Date(contract.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  const deadlineStr = contract.deadline
    ? new Date(contract.deadline).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Flexible';

  let workSubmissionData = null;
  if (contract.workSubmission) {
    try {
      workSubmissionData = JSON.parse(contract.workSubmission);
    } catch {
      workSubmissionData = { description: contract.workSubmission };
    }
  }

  const isPaymentSent = contract.paymentStatus === 'payment_sent';
  const isPaid = contract.paymentStatus === 'paid';

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-6">
      <button 
        onClick={() => navigate('/freelancer/contracts')} 
        className="flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Contracts
      </button>

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-900">{contract.title}</h1>
            <StatusBadge status={contract.status} />
          </div>
          <p className="text-slate-500 text-sm font-medium">Client: <strong className="text-slate-800">{clientName}</strong></p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <Link
            to={`/freelancer/messages?recipient=${client._id || ''}`}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm shadow-sm"
          >
            <MessageSquare className="w-4 h-4" />
            Message Client
          </Link>

          {isPaymentSent && !isPaid && (
            <button
              onClick={handleConfirmPayment}
              disabled={confirming}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors shadow-sm text-sm disabled:opacity-60"
            >
              {confirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Confirm Payment Received ({formattedAmount})
            </button>
          )}

          {contract.status === 'active' && (
            <Link 
              to={`/freelancer/contracts/${id}/submit`}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              Submit Deliverables
            </Link>
          )}

          {contract.status === 'submitted' && (
            <Link 
              to={`/freelancer/contracts/${id}/submit`}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-900 transition-colors shadow-sm text-sm"
            >
              <FileText className="w-4 h-4" />
              Edit Deliverables
            </Link>
          )}
        </div>
      </div>

      {contract.status === 'revision_requested' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900 text-base">Revision Requested by Client</h3>
              <p className="text-xs text-amber-800 mt-0.5">
                The client requested updates to your deliverables. Click below to chat with the client about what changes they need, then update and resubmit your deliverables.
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link
              to={`/freelancer/messages?recipient=${client._id || ''}&contractId=${id}&action=revision_inquiry`}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Ask Client What Revision is Needed
            </Link>
            <Link
              to={`/freelancer/contracts/${id}/submit`}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Edit Deliverables
            </Link>
          </div>
        </div>
      )}

      {isPaymentSent && !isPaid && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900 text-base">Payment Sent by Client</h3>
              <p className="text-xs text-amber-800 mt-0.5">
                The client has completed payment of {formattedAmount} via Paystack. Please click below to confirm receipt.
              </p>
            </div>
          </div>
          <button
            onClick={handleConfirmPayment}
            disabled={confirming}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 flex-shrink-0"
          >
            {confirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Confirm Payment Received
          </button>
        </div>
      )}

      {isPaid && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-green-900 text-sm">Payment Confirmed</h3>
            <p className="text-xs text-green-700 mt-0.5">
              Payment of {formattedAmount} has been confirmed and credited to your payout balance.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Work Submission Preview */}
          {workSubmissionData && (
            <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h2 className="text-base font-bold text-slate-900">Submitted Deliverable</h2>
                </div>
                <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full uppercase">
                  {contract.status === 'completed' ? 'Approved' : 'Under Review'}
                </span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100 break-words break-all [overflow-wrap:anywhere] overflow-hidden">
                {workSubmissionData.description}
              </p>
              {workSubmissionData.stagingUrl && (
                <a
                  href={workSubmissionData.stagingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:underline break-all max-w-full overflow-hidden"
                >
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{workSubmissionData.stagingUrl}</span>
                </a>
              )}
            </div>
          )}

          {/* Job Scope & Milestones */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">Project Agreement & Terms</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {contract.jobId?.description || 'All deliverables agreed upon for this contract.'}
            </p>
            
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isPaid ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                  {isPaid ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{contract.title}</p>
                  <p className="text-xs text-slate-500">Target completion: {deadlineStr}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900 text-base">{formattedAmount}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  isPaid
                    ? 'bg-green-100 text-green-700'
                    : isPaymentSent
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {isPaid ? 'Payment Confirmed' : isPaymentSent ? 'Payment Sent' : 'Unpaid'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-6">Contract Overview</h2>
            
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Agreed Value</p>
                <p className="text-2xl font-bold text-slate-900">{formattedAmount}</p>
                <span className="text-xs text-slate-500 font-medium capitalize">{contract.budgetType || 'Fixed'} Contract</span>
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Start Date</p>
                <p className="font-semibold text-slate-900 text-sm">{startDateStr}</p>
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Target Deadline</p>
                <p className="font-semibold text-slate-900 text-sm">{deadlineStr}</p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completion</p>
                  <span className="text-xs font-bold text-slate-900">{contract.progress || 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${contract.progress || 0}%` }}></div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-blue-700 font-bold bg-blue-50 p-2.5 rounded-xl border border-blue-200">
                  <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Direct Paystack Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractDetails;
