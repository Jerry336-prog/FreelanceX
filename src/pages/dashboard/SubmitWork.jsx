import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Paperclip, AlertCircle, CheckCircle, Loader2, Globe } from 'lucide-react';
import { contractService } from '../../services/api';

const SubmitWork = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contract, setContract] = useState(null);
  const [loadingContract, setLoadingContract] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const [description, setDescription] = useState('');
  const [stagingUrl, setStagingUrl] = useState('');
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const data = await contractService.getContractById(id);
        setContract(data);
        if (data.workSubmission) {
          try {
            const delivery = JSON.parse(data.workSubmission);
            setDescription(delivery.description || '');
            setStagingUrl(delivery.stagingUrl || '');
          } catch {
            setDescription(data.workSubmission);
          }
        }
      } catch (err) {
        console.error('Fetch contract error:', err);
        setServerError('Contract details could not be loaded');
      } finally {
        setLoadingContract(false);
      }
    };

    if (id) fetchContract();
  }, [id]);

  const validate = () => {
    const newErrors = {};
    if (!description.trim() || description.trim().length < 20) {
      newErrors.description = 'Work description must be at least 20 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('description', description.trim());
      if (stagingUrl.trim()) payload.append('stagingUrl', stagingUrl.trim());
      files.forEach((file) => payload.append('files', file));

      if (contract?.status === 'active') {
        await contractService.submitWork(id, payload);
      } else {
        await contractService.updateDelivery(id, payload);
      }
      setIsSuccess(true);
      setTimeout(() => navigate(`/freelancer/contracts/${id}`), 1800);
    } catch (err) {
      console.error('Submit work error:', err);
      setServerError(err?.message || 'Failed to submit deliverables');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center animate-in fade-in">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Delivery Sent for Review!</h1>
        <p className="text-lg text-slate-600 mb-6">Your client has been notified to review the latest delivery.</p>
        <p className="text-sm text-slate-400">Redirecting to contract overview...</p>
      </div>
    );
  }

  const canSubmitInitialDelivery = contract?.status === 'active';
  const canUpdateDelivery = ['submitted', 'revision_requested'].includes(contract?.status);

  if (!loadingContract && !canSubmitInitialDelivery && !canUpdateDelivery) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900">Delivery is unavailable</h1>
        <p className="text-sm text-slate-500 mt-2">This contract is not in a state where its delivery can be changed.</p>
        <button onClick={() => navigate(`/freelancer/contracts/${id}`)} className="mt-6 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm">Back to Contract</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12 space-y-6">
      <button 
        onClick={() => navigate(`/freelancer/contracts/${id}`)} 
        className="flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Contract
      </button>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">{canUpdateDelivery ? 'Update Delivery' : 'Submit Work for Review'}</h1>
        <p className="text-slate-500 text-sm mt-1">{contract?.title || 'Deliverable Submission'}</p>
      </div>

      {serverError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-8 space-y-6">
          
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Work Deliverables & Summary</label>
            <p className="text-xs text-slate-500 mb-3">Detail what you completed, notes for the client, and how to verify features. Updates replace the current delivery and are kept in the delivery history.</p>
            <textarea
              rows={7}
              placeholder="I have completed all requirements for this milestone. Here is the summary of work done..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors({ ...errors, description: '' });
              }}
              className={`block w-full p-4 border rounded-xl focus:outline-none focus:ring-2 bg-slate-50 text-sm leading-relaxed ${
                errors.description ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
              }`}
            />
            {errors.description && (
              <p className="mt-2 text-xs text-red-600 flex items-center">
                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                {errors.description}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Supporting Files (Optional)</label>
            <p className="text-xs text-slate-500 mb-3">PDF, Word, Excel, or ZIP files, up to 10 MB each (maximum five files).</p>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-600">
              <Paperclip className="w-4 h-4" />
              Choose files
              <input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.zip" className="sr-only" onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 5))} />
            </label>
            {files.length > 0 && <p className="mt-2 text-xs text-slate-600">{files.map((file) => file.name).join(', ')}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Live Demo / Staging URL (Optional)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Globe className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="url"
                placeholder="https://staging.example.com or GitHub repo link"
                value={stagingUrl}
                onChange={(e) => setStagingUrl(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 md:p-8 flex justify-end border-t border-slate-200">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2 text-sm disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {canUpdateDelivery ? 'Updating Delivery...' : 'Submitting Deliverables...'}
              </>
            ) : (
              canUpdateDelivery ? 'Update Delivery for Review' : 'Submit Deliverables for Review'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitWork;
