import React, { useState, useEffect, useCallback } from 'react';
import Tabs from '../../components/ui/Tabs';
import StatusBadge from '../../components/ui/StatusBadge';
import { DollarSign, Calendar, FileText, Loader2, AlertCircle, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { contractService } from '../../services/api';

const ClientContracts = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await contractService.getMyContracts();
      setContracts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch client contracts error:', err);
      setError(err?.message || 'Failed to load contracts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const activeCount = contracts.filter((c) => c.status === 'active').length;
  const submittedCount = contracts.filter((c) => c.status === 'submitted').length;
  const completedCount = contracts.filter((c) => c.status === 'completed').length;
  const cancelledCount = contracts.filter((c) => c.status === 'cancelled').length;

  const tabs = [
    { id: 'all', label: 'All Contracts', count: contracts.length },
    { id: 'submitted', label: 'Needs Review', count: submittedCount },
    { id: 'active', label: 'In Progress', count: activeCount },
    { id: 'completed', label: 'Completed & Paid', count: completedCount },
    { id: 'cancelled', label: 'Cancelled', count: cancelledCount },
  ];

  const filteredContracts = contracts.filter((c) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'cancelled') return c.status === 'cancelled';
    return c.status === activeTab;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Contracts & Hiring</h1>
        <p className="text-slate-500 mt-1">Manage active project contracts, review submitted work, and release payments.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 pt-6 border-b border-slate-200 bg-slate-50">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium">Loading project contracts...</p>
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="p-16 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-700 font-bold text-base">No contracts found in this tab.</p>
            <p className="text-slate-400 text-xs mt-1">Accepting a proposal from candidates will generate an active contract.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6 bg-slate-50/50">
            {filteredContracts.map((contract) => {
              const contractId = contract._id || contract.id;
              const freelancer = contract.freelancerId || {};
              const freelancerName = `${freelancer.firstname || 'Freelancer'} ${freelancer.lastname || ''}`.trim();
              const formattedAmount = `₦${Number(contract.agreedAmount || 0).toLocaleString()}`;
              const deadlineStr = contract.deadline
                ? new Date(contract.deadline).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Flexible';

              const isNeedsReview = contract.status === 'submitted';

              return (
                <div key={contractId} className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 hover:shadow-md hover:border-blue-200 transition-all group flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <StatusBadge status={contract.status} />
                      {isNeedsReview && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full animate-pulse">
                          Review Deliverables
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm md:text-base text-slate-900 line-clamp-2 mb-3">
                      {contract.title}
                    </h3>

                    {/* Freelancer info */}
                    <div className="flex items-center gap-3 mb-6 p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 flex-shrink-0 bg-white flex items-center justify-center">
                        {freelancer.profileImage ? (
                          <img src={freelancer.profileImage} alt={freelancerName} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{freelancerName}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{freelancer.professionalTitle || 'Hired Talent'}</p>
                      </div>
                    </div>

                    <div className="space-y-2.5 mb-6 text-xs text-slate-700">
                      <div className="flex items-center font-bold text-slate-900">
                        <DollarSign className="w-4 h-4 mr-1.5 text-slate-400" />
                        <span>{formattedAmount}</span>
                        <span className="font-normal text-slate-500 ml-1">({contract.budgetType || 'Fixed'})</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
                        <span>Due {deadlineStr}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/client/contracts/${contractId}`}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all text-center block ${
                      isNeedsReview
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {isNeedsReview ? 'Review & Approve Work' : 'Manage Contract'}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientContracts;
