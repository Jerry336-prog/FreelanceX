import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, MapPin, Clock, DollarSign, ChevronRight, Loader2, AlertCircle, Briefcase } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { jobService } from '../../services/api';

const BrowseJobs = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBudgetType, setSelectedBudgetType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedBudgetType !== 'all') params.budgetType = selectedBudgetType;

      const data = await jobService.getJobs(params);
      setJobs(Array.isArray(data) ? data : data.jobs || []);
    } catch (err) {
      console.error('Fetch jobs error:', err);
      setError(err?.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedBudgetType]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  // Sort
  const sortedJobs = [...jobs].sort((a, b) => {
    if (sortBy === 'highest_budget') {
      return (b.budget || 0) - (a.budget || 0);
    }
    if (sortBy === 'lowest_proposals') {
      return (a.proposalCount || 0) - (b.proposalCount || 0);
    }
    // Newest
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Browse Jobs</h1>
          <p className="text-slate-500 mt-1">Explore open projects and submit proposals to top clients.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-500">
          <span>Sort by:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-slate-200 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest</option>
            <option value="highest_budget">Highest Budget</option>
            <option value="lowest_proposals">Fewest Proposals</option>
          </select>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by keyword, skill (e.g. React, Python), or title..."
              className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            />
          </div>
          <button 
            type="submit"
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm shadow-sm"
          >
            Search
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-600">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="development">Development</option>
            <option value="design">Design & Creative</option>
            <option value="writing">Writing & Translation</option>
            <option value="marketing">Sales & Marketing</option>
          </select>

          <select
            value={selectedBudgetType}
            onChange={(e) => setSelectedBudgetType(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Budget Types</option>
            <option value="fixed">Fixed Price</option>
            <option value="hourly">Hourly Rate</option>
          </select>

          {(searchTerm || selectedCategory !== 'all' || selectedBudgetType !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedBudgetType('all');
              }}
              className="text-blue-600 hover:underline font-semibold ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Job List */}
      {loading ? (
        <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Finding matching job opportunities...</p>
        </div>
      ) : sortedJobs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Open Jobs Found</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
            Try adjusting your search terms or filters to find other projects.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedJobs.map((job) => {
            const jobId = job._id || job.id;
            const client = job.clientId || {};
            const clientName = client.companyName || `${client.firstname || 'Client'} ${client.lastname || ''}`.trim();
            const formattedBudget = `₦${Number(job.budget || 0).toLocaleString()}`;
            const timeAgo = job.createdAt
              ? new Date(job.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })
              : 'Recent';

            return (
              <div 
                key={jobId} 
                onClick={() => navigate(`/freelancer/jobs/${jobId}`)}
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
              >
                <div className="mb-3 pr-8">
                  <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {job.title}
                  </h2>
                  <div className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-2">
                    <span>Client: <strong className="text-slate-700">{clientName}</strong></span>
                    {client.location && (
                      <span className="flex items-center text-slate-400">
                        <MapPin className="w-3 h-3 mr-0.5" /> {client.location}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center text-xs text-slate-500 gap-4 mb-4">
                  <span className="flex items-center font-bold text-slate-800 text-sm">
                    <DollarSign className="w-4 h-4 mr-0.5 text-slate-400" />
                    {formattedBudget} <span className="font-normal text-slate-500 ml-1">({job.budgetType === 'hourly' ? '/hr' : 'Fixed Price'})</span>
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {job.jobType || 'Remote'}
                  </span>
                  <span className="flex items-center">
                    Posted {timeAgo}
                  </span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-semibold text-[10px] uppercase">
                    {job.category || 'General'}
                  </span>
                </div>

                <p className="text-slate-600 text-sm mb-6 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-1.5">
                    {(job.skills || []).map((skill, sIndex) => (
                      <span key={sIndex} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <p className="text-xs text-slate-500 font-semibold">{job.proposalCount || 0} proposals</p>
                    <button className="flex-1 sm:flex-none px-5 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-xs shadow-sm">
                      View & Apply
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BrowseJobs;
