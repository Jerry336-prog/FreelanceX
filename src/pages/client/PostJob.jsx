import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paperclip, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { jobService } from '../../services/api';

const PostJob = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [skills, setSkills] = useState('');
  const [budget, setBudget] = useState('');
  const [budgetType, setBudgetType] = useState('fixed');
  const [jobType, setJobType] = useState('remote');
  const [deadline, setDeadline] = useState('');
  const [attachments, setAttachments] = useState([]);
  
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Job title is required';
    if (!description.trim() || description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }
    if (!category) newErrors.category = 'Category is required';
    if (!budget || Number(budget) <= 0) newErrors.budget = 'A valid positive budget is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePublish = async (e, isDraft = false) => {
    e?.preventDefault();
    setServerError('');
    
    if (!isDraft && !validate()) return;
    if (isDraft && !title.trim()) {
      setErrors({ title: 'Title is required to save a draft' });
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedSkills = skills
        ? skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const payload = new FormData();
      payload.append('title', title.trim());
      payload.append('description', description.trim() || 'Draft job description');
      payload.append('category', category || 'development');
      payload.append('skills', formattedSkills.join(','));
      payload.append('budget', String(Number(budget) || 100));
      payload.append('budgetType', budgetType);
      payload.append('jobType', jobType);
      if (deadline) payload.append('deadline', deadline);
      payload.append('status', isDraft ? 'draft' : 'open');
      attachments.forEach((file) => payload.append('attachments', file));

      await jobService.createJob(payload);
      setIsSuccess(true);
      setTimeout(() => navigate('/client/jobs'), 1800);
    } catch (err) {
      console.error('Create job error:', err);
      setServerError(err?.message || 'Failed to publish job. Please try again.');
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Job Successfully Posted!</h1>
        <p className="text-lg text-slate-600 mb-6">Your project is now live on the marketplace and freelancers can start applying.</p>
        <p className="text-sm text-slate-400">Redirecting to your active jobs list...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Post a New Job</h1>
        <p className="text-slate-500 mt-1">Provide project requirements to attract vetted freelancers.</p>
      </div>

      {serverError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 space-y-8">
          
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Job Title</label>
            <input
              type="text"
              placeholder="e.g. Full Stack React & Node.js Developer for Marketplace"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: '' });
              }}
              className={`block w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-shadow bg-slate-50 text-sm font-medium ${
                errors.title ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
              }`}
            />
            {errors.title && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Job Description</label>
            <p className="text-xs text-slate-500 mb-3">Outline deliverables, technical scope, and project expectations.</p>
            <textarea
              rows={8}
              placeholder="Describe what you need built, key milestones, and any specific requirements..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors({ ...errors, description: '' });
              }}
              className={`block w-full p-4 border rounded-xl focus:outline-none focus:ring-2 transition-shadow bg-slate-50 text-sm leading-relaxed ${
                errors.description ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
              }`}
            />
            {errors.description && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Category</label>
              <select 
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (errors.category) setErrors({ ...errors, category: '' });
                }}
                className={`block w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 bg-slate-50 text-sm font-medium ${
                  errors.category ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
                }`}
              >
                <option value="">Select a category</option>
                <option value="development">Web & Mobile Development</option>
                <option value="design">Design & UI/UX</option>
                <option value="writing">Content & Copywriting</option>
                <option value="marketing">Digital Marketing & SEO</option>
                <option value="data">Data Science & AI</option>
              </select>
              {errors.category && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.category}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Required Skills</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. React, Node.js, Tailwind, MongoDB (comma-separated)"
                className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-sm font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Budget Type</label>
              <div className="flex rounded-xl overflow-hidden border border-slate-200 p-1 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setBudgetType('fixed')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    budgetType === 'fixed'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Fixed Price
                </button>
                <button
                  type="button"
                  onClick={() => setBudgetType('hourly')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    budgetType === 'hourly'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Hourly Rate
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                {budgetType === 'fixed' ? 'Budget Amount (₦ NGN)' : 'Hourly Rate (₦/hr)'}
              </label>
              <input
                type="number"
                min="1"
                placeholder={budgetType === 'fixed' ? 'e.g. 250000' : 'e.g. 5000'}
                value={budget}
                onChange={(e) => {
                  setBudget(e.target.value);
                  if (errors.budget) setErrors({ ...errors, budget: '' });
                }}
                className={`block w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-shadow bg-slate-50 text-sm font-medium ${
                  errors.budget ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
                }`}
              />
              {errors.budget && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.budget}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Project Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Project Files (Optional)</label>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-600"><Paperclip className="w-4 h-4" />Attach PDF, Word, Excel, or ZIP files<input className="sr-only" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.zip" onChange={(e) => setAttachments(Array.from(e.target.files || []).slice(0, 5))} /></label>
              {attachments.length > 0 && <p className="mt-2 text-xs text-slate-600">{attachments.map((file) => file.name).join(', ')}</p>}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 p-6 md:p-8 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-200">
          <button 
            type="button" 
            onClick={(e) => handlePublish(e, true)}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm text-sm"
          >
            Save as Draft
          </button>
          
          <button 
            type="button" 
            onClick={(e) => handlePublish(e, false)}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm flex items-center justify-center gap-2 text-sm disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing Job...
              </>
            ) : (
              'Publish Job Now'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostJob;
