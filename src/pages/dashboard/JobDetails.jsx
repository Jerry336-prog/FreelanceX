import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, DollarSign, MapPin, ShieldCheck, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { jobService } from '../../services/api';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await jobService.getJobById(id);
        setJob(data);
      } catch (err) {
        console.error('Fetch job details error:', err);
        setError(err?.message || 'Job not found');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchJob();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium">Loading project details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl inline-flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error || 'This job could not be found'}</span>
        </div>
        <div>
          <button
            onClick={() => navigate('/freelancer/jobs')}
            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 transition-colors shadow-sm"
          >
            Back to Open Jobs
          </button>
        </div>
      </div>
    );
  }

  const client = job.clientId || {};
  const clientName = client.companyName || `${client.firstname || 'Client'} ${client.lastname || ''}`.trim();
  const formattedBudget = `₦${Number(job.budget || 0).toLocaleString()}`;
  const timeAgo = job.createdAt
    ? new Date(job.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  const deadlineFormatted = job.deadline
    ? new Date(job.deadline).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Flexible';
  const hasApplied = Boolean(job.application?.applied);

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-6">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Jobs
      </button>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="p-8 border-b border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 leading-tight">{job.title}</h1>
              <div className="flex flex-wrap items-center text-xs text-slate-500 gap-4">
                <span className="flex items-center"><Clock className="w-4 h-4 mr-1 text-slate-400" /> Posted {timeAgo}</span>
                {client.location && (
                  <span className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-slate-400" /> {client.location}</span>
                )}
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded-md uppercase text-[10px]">
                  {job.category || 'General'}
                </span>
              </div>
            </div>

            {hasApplied ? (
              <div className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-green-50 text-green-700 border border-green-200 rounded-xl font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" /> Applied
              </div>
            ) : job.status === 'open' ? (
              <button 
                onClick={() => navigate(`/freelancer/jobs/${id}/apply`)}
                className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-sm"
              >
                Apply for this Job
              </button>
            ) : (
              <span className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-wider">
                Applications closed
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Main Content */}
          <div className="md:col-span-2 p-8 space-y-8">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3">Job Description</h3>
              <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                {job.description}
              </div>
            </div>

            {job.skills && job.skills.length > 0 && (
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3">Required Skills & Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span key={index} className="px-3.5 py-1.5 bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="bg-slate-50/70 p-8 space-y-8">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Project Scope</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <DollarSign className="w-5 h-5 text-slate-400 mr-2.5 mt-0.5" />
                  <div>
                    <p className="text-base font-bold text-slate-900">{formattedBudget}</p>
                    <p className="text-xs text-slate-500">{job.budgetType === 'hourly' ? 'Hourly Rate (₦/hr)' : 'Fixed Price Project'}</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Clock className="w-5 h-5 text-slate-400 mr-2.5 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{deadlineFormatted}</p>
                    <p className="text-xs text-slate-500">Target Delivery Date</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">About the Client</h3>
              <p className="font-bold text-slate-900 text-sm mb-2">{clientName}</p>
              
              <div className="flex items-center text-xs text-green-700 font-bold bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 inline-flex">
                <ShieldCheck className="w-4 h-4 mr-1.5 text-green-600" />
                Verified Client
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Competition</h3>
              <p className="text-sm text-slate-700">
                <strong className="text-slate-900 font-bold">{job.proposalCount || 0}</strong> proposals submitted
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default JobDetails;
