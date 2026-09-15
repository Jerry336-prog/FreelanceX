import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, DollarSign, Loader2, MapPin, Search, X } from 'lucide-react';
import { jobService } from '../services/api';

const timeAgo = (date) => {
  if (!date) return 'Recently posted';
  const hours = Math.floor((Date.now() - new Date(date)) / 36e5);
  if (hours < 1) return 'Just posted';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const BrowseJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAccessModal, setShowAccessModal] = useState(false);

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      try {
        const data = await jobService.getJobs({ limit: 3, search: query || undefined });
        setJobs(Array.isArray(data) ? data : data?.jobs || []);
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, [query]);

  return <section id="browse-jobs" className="py-24 bg-white">
    {showAccessModal && <div className="fixed inset-0 z-[60] bg-slate-900/60 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center">
        <button type="button" onClick={() => setShowAccessModal(false)} className="float-right text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        <h3 className="mt-3 text-lg font-bold text-slate-900">Sign in to view this job</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">Create an account or log in to read the full job details and submit a proposal.</p>
        <div className="mt-6 grid grid-cols-2 gap-3"><Link to="/login" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Log in</Link><Link to="/signup" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Sign up</Link></div>
      </div>
    </div>}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mb-12"><h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Explore opportunities</h2><p className="text-lg text-slate-600">Fresh projects posted by clients on FreelanceX.</p></div>
      <form onSubmit={(event) => { event.preventDefault(); setQuery(search.trim()); }} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm mb-10 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow"><Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by title, skill, or keyword..." className="block w-full pl-11 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700">Search</button>
      </form>
      {loading ? <div className="py-16 flex justify-center"><Loader2 className="w-7 h-7 animate-spin text-blue-600" /></div> : jobs.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center text-slate-500">No open jobs match your search yet.</div> : <div className="space-y-4">{jobs.map((job) => {
        const client = job.clientId || {};
        const clientName = client.companyName || `${client.firstname || 'Client'} ${client.lastname || ''}`.trim();
        const budget = job.budgetType === 'hourly' ? `₦${Number(job.budget).toLocaleString()}/hr` : `₦${Number(job.budget).toLocaleString()} fixed`;
        return <article key={job._id || job.id} className="border border-slate-200 rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-shadow"><div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 lg:gap-6"><div className="flex-grow"><h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 leading-snug">{job.title}</h3><div className="flex flex-wrap items-center text-xs sm:text-sm text-slate-500 gap-3 sm:gap-4 mb-4"><span className="flex items-center text-slate-700 font-medium"><MapPin className="w-4 h-4 mr-1 text-slate-400 flex-shrink-0" />{clientName}</span><span className="flex items-center"><Clock className="w-4 h-4 mr-1 flex-shrink-0" />{timeAgo(job.createdAt)}</span><span className="flex items-center"><DollarSign className="w-4 h-4 mr-1 flex-shrink-0" />{job.category || 'Project'}</span></div><div className="flex flex-wrap gap-2">{(job.skills || []).slice(0, 6).map((skill) => <span key={skill} className="px-2.5 sm:px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">{skill}</span>)}</div></div><div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between gap-3 lg:w-48 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6"><p className="text-base sm:text-lg font-bold text-slate-900">{budget}</p><button type="button" onClick={() => setShowAccessModal(true)} className="px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:border-blue-600 hover:text-blue-600">View Job</button></div></div></article>;
      })}</div>}
    </div>
  </section>;
};

export default BrowseJobs;
