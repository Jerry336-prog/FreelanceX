import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, Clock, Paperclip, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { jobService, proposalService } from '../../services/api';

const SubmitProposal = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  // Form State
  const [price, setPrice] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('7');
  const [coverLetter, setCoverLetter] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const data = await jobService.getJobById(id);
        setJob(data);
        if (data?.budget) {
          setPrice(String(data.budget));
        }
      } catch (err) {
        console.error('Fetch job error:', err);
        setServerError('Job details could not be loaded');
      } finally {
        setLoadingJob(false);
      }
    };

    if (id) fetchJob();
  }, [id]);

  const validate = () => {
    const newErrors = {};
    if (!price || Number(price) <= 0) newErrors.price = 'Please enter a valid bid amount';
    if (!coverLetter.trim() || coverLetter.trim().length < 30) {
      newErrors.coverLetter = 'Cover letter must be at least 30 characters';
    }
    if (!agreed) newErrors.agreed = 'You must agree to the Terms of Service';
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
      payload.append('jobId', id);
      payload.append('bidAmount', String(Number(price)));
      payload.append('deliveryTime', String(Number(deliveryDays) || 7));
      payload.append('coverLetter', coverLetter.trim());
      attachments.forEach((file) => payload.append('attachments', file));

      await proposalService.createProposal(payload);
      setIsSuccess(true);
      setTimeout(() => navigate('/freelancer/proposals'), 1800);
    } catch (err) {
      console.error('Submit proposal error:', err);
      setServerError(err?.message || 'Failed to submit proposal');
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Proposal Submitted!</h1>
        <p className="text-lg text-slate-600 mb-6">Your bid and cover letter have been sent to the client.</p>
        <p className="text-sm text-slate-400">Redirecting to your active proposals...</p>
      </div>
    );
  }

  if (job && (job.application?.applied || job.status !== 'open')) {
    const applied = job.application?.applied;
    return (
      <div className="max-w-2xl mx-auto py-24 text-center">
        <div className={`w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center ${applied ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
          {applied ? <CheckCircle className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{applied ? 'You have already applied' : 'Applications are closed'}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">{applied ? 'Your application has been saved. You cannot submit another application for this job.' : 'This job is no longer accepting applications from freelancers.'}</p>
        <button onClick={() => navigate(applied ? '/freelancer/proposals' : '/freelancer/jobs')} className="mt-6 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 transition-colors">
          {applied ? 'View My Applications' : 'Browse Jobs'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12 space-y-6">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Job Details
      </button>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Submit Proposal</h1>
        <p className="text-slate-500 text-sm mt-1">Present your solution, timeline, and terms to the client.</p>
      </div>

      {serverError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Job Summary Card */}
      {job && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Job Summary</h2>
          <h3 className="font-bold text-slate-900 text-base mb-1">{job.title}</h3>
          <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">
            {job.description}
          </p>
          <div className="flex flex-wrap gap-6 text-xs font-semibold">
            <div className="flex items-center text-slate-700">
              <DollarSign className="w-3.5 h-3.5 mr-0.5 text-slate-400" />
              <span>Budget:</span> <span className="ml-1 text-slate-900 font-bold">₦{Number(job.budget || 0).toLocaleString()} ({job.budgetType})</span>
            </div>
            <div className="flex items-center text-slate-700">
              <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
              <span>Job Type:</span> <span className="ml-1 text-slate-900 capitalize">{job.jobType || 'Remote'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-8 space-y-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Your Bid Amount (₦ NGN)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="text-slate-400 font-bold text-sm">₦</span>
                </div>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 50000"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    if (errors.price) setErrors({ ...errors, price: '' });
                  }}
                  className={`block w-full pl-9 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 bg-slate-50 text-sm font-medium ${
                    errors.price ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
                  }`}
                />
              </div>
              {errors.price && (
                <p className="mt-2 text-xs text-red-600 flex items-center">
                  <AlertCircle className="w-3.5 h-3.5 mr-1" />
                  {errors.price}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Estimated Delivery Time</label>
              <select 
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
                className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-sm font-medium"
              >
                <option value="3">Within 3 days</option>
                <option value="7">1 week (7 days)</option>
                <option value="14">2 weeks (14 days)</option>
                <option value="30">1 month (30 days)</option>
                <option value="60">2 months (60 days)</option>
                <option value="90">3+ months</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Cover Letter & Approach</label>
            <p className="text-xs text-slate-500 mb-3">Introduce yourself, outline your approach to the project, and mention relevant achievements.</p>
            <textarea
              rows={8}
              placeholder="Hi there! I'd love to help with this project. Here is how I plan to deliver your requirements..."
              value={coverLetter}
              onChange={(e) => {
                setCoverLetter(e.target.value);
                if (errors.coverLetter) setErrors({ ...errors, coverLetter: '' });
              }}
              className={`block w-full p-4 border rounded-xl focus:outline-none focus:ring-2 bg-slate-50 text-sm leading-relaxed ${
                errors.coverLetter ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
              }`}
            />
            {errors.coverLetter && (
              <p className="mt-2 text-xs text-red-600 flex items-center">
                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                {errors.coverLetter}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Supporting Files (Optional)</label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-600">
              <Paperclip className="w-4 h-4" />
              Attach PDF, Word, Excel, Images, or ZIP files
              <input 
                className="sr-only" 
                type="file" 
                multiple 
                accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.png,.jpg,.jpeg,.webp,image/*" 
                onChange={(e) => setAttachments(Array.from(e.target.files || []).slice(0, 5))} 
              />
            </label>
            {attachments.length > 0 && <p className="mt-2 text-xs text-slate-600">{attachments.map((file) => file.name).join(', ')}</p>}
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-200">
          <div>
            <label className="flex items-start cursor-pointer">
              <input 
                type="checkbox" 
                checked={agreed}
                onChange={(e) => {
                  setAgreed(e.target.checked);
                  if (errors.agreed) setErrors({ ...errors, agreed: '' });
                }}
                className="mt-1 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" 
              />
              <span className="ml-2 text-xs text-slate-600 max-w-sm">
                I understand and agree to the FreelanceX Payment Terms and Service Agreement.
              </span>
            </label>
            {errors.agreed && (
              <p className="mt-2 text-xs text-red-600 flex items-center ml-6">
                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                {errors.agreed}
              </p>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting Bid...
              </>
            ) : (
              'Submit Proposal Now'
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default SubmitProposal;
