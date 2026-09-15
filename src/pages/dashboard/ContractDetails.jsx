import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, MessageSquare, CheckCircle, Clock, FileText, DollarSign, Calendar, ShieldCheck, 
  Loader2, AlertCircle, ExternalLink, Paperclip, Eye, Download, X, Image as ImageIcon 
} from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import { contractService } from '../../services/api';

const isImageAttachment = (attObj) => {
  if (!attObj) return false;
  if (typeof attObj === 'object') {
    if (attObj.isImage) return true;
    if (attObj.type && attObj.type.startsWith('image/')) return true;
    if (attObj.resource_type === 'image') return true;
    if (attObj.url && isImageAttachment(attObj.url)) return true;
    if (attObj.name && isImageAttachment(attObj.name)) return true;
  }
  if (typeof attObj === 'string') {
    const s = attObj.toLowerCase();
    if (s.startsWith('data:image/')) return true;
    if (s.startsWith('blob:')) return true;
    if (s.includes('/image/upload/')) return true;
    if (s.match(/\.(jpeg|jpg|gif|png|webp|svg|avif|bmp|tiff)($|\?)/i)) return true;
  }
  return false;
};

const isPdfAttachment = (attObj) => {
  if (!attObj) return false;
  if (typeof attObj === 'object') {
    if (attObj.name && attObj.name.toLowerCase().endsWith('.pdf')) return true;
    if (attObj.type === 'application/pdf') return true;
    if (attObj.url && isPdfAttachment(attObj.url)) return true;
  }
  if (typeof attObj === 'string') {
    const s = attObj.toLowerCase();
    if (s.match(/\.pdf($|\?)/i)) return true;
    if (s.includes('/raw/upload/') && s.includes('pdf')) return true;
  }
  return false;
};

const handleDownloadFile = async (url, fileName) => {
  if (!url) return;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName || 'deliverable_document.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    window.open(url, '_blank');
  }
};

const ContractDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null);

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

              {workSubmissionData.description && (
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100 overflow-hidden">
                  {workSubmissionData.description}
                </p>
              )}

              {workSubmissionData.stagingUrl && (
                <a
                  href={workSubmissionData.stagingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:underline max-w-full overflow-hidden"
                >
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{workSubmissionData.stagingUrl}</span>
                </a>
              )}

              {/* Submitted Files List */}
              {Array.isArray(workSubmissionData.files) && workSubmissionData.files.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-2.5">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Submitted Deliverable Files ({workSubmissionData.files.length})</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {workSubmissionData.files.map((fileItem, fileIdx) => {
                      const fileUrl = typeof fileItem === 'string' ? fileItem : fileItem?.url || fileItem?.path || '';
                      const fileName = (typeof fileItem === 'object' && fileItem?.name)
                        ? fileItem.name
                        : (fileUrl.split('/').pop().split('?')[0] || `Deliverable_${fileIdx + 1}`);

                      const isImg = isImageAttachment(fileUrl) || isImageAttachment(fileItem);
                      const isPdf = isPdfAttachment(fileUrl) || isPdfAttachment(fileItem);

                      return (
                        <div
                          key={fileIdx}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/90 transition-all text-xs group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            {isImg ? (
                              <ImageIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            ) : isPdf ? (
                              <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
                            ) : (
                              <Paperclip className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                            )}
                            <span className="font-semibold text-slate-800 truncate max-w-[150px]" title={fileName}>
                              {fileName}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewMedia({ url: fileUrl, type: isImg ? 'image' : (isPdf ? 'pdf' : 'doc'), title: fileName })}
                              className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 rounded-lg transition-colors font-semibold flex items-center gap-1 shadow-xs text-xs"
                              title="View file"
                            >
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadFile(fileUrl, fileName)}
                              className="p-1.5 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Download file"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
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

      {/* ── Centered Media & Document Lightbox Modal ── */}
      {previewMedia && (
        <div
          className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-in fade-in"
          onClick={() => setPreviewMedia(null)}
        >
          <div
            className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 flex-shrink-0">
              <div className="flex items-center gap-2.5 min-w-0 pr-4">
                {previewMedia.type === 'image' ? (
                  <Eye className="w-5 h-5 text-blue-600 flex-shrink-0" />
                ) : (
                  <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                )}
                <h3 className="font-bold text-slate-900 text-sm truncate">
                  {previewMedia.title || 'Deliverable Preview'}
                </h3>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleDownloadFile(previewMedia.url, previewMedia.title)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                <a
                  href={previewMedia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setPreviewMedia(null)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body Content */}
            <div className="p-6 overflow-auto flex-1 flex items-center justify-center bg-slate-950/5 min-h-[350px]">
              {previewMedia.type === 'image' || isImageAttachment(previewMedia.url) ? (
                <img
                  src={previewMedia.url}
                  alt={previewMedia.title || 'Preview'}
                  className="max-w-full max-h-[72vh] object-contain rounded-xl shadow-lg border border-slate-200"
                />
              ) : previewMedia.type === 'pdf' || isPdfAttachment(previewMedia.url) ? (
                <iframe
                  src={previewMedia.url}
                  className="w-full h-[72vh] rounded-xl border border-slate-200 shadow-sm"
                  title="PDF Document Preview"
                />
              ) : (
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(previewMedia.url)}&embedded=true`}
                  className="w-full h-[72vh] rounded-xl border border-slate-200 shadow-sm"
                  title="Document Preview"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractDetails;
