import React, { useState, useEffect, useCallback } from 'react';
import Tabs from '../../components/ui/Tabs';
import StatusBadge from '../../components/ui/StatusBadge';
import { DollarSign, Calendar, MoreVertical, Search, FileText, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { contractService } from '../../services/api';

const MyContracts = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await contractService.getMyContracts();
      setContracts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch contracts error:', err);
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
  const cancelledCount = contracts.filter((c) => c.status === 'cancelled' || c.status === 'disputed').length;

  const tabs = [
    { id: 'all', label: 'All Contracts', count: contracts.length },
    { id: 'active', label: 'In Progress', count: activeCount },
    { id: 'submitted', label: 'Under Review', count: submittedCount },
    { id: 'completed', label: 'Completed', count: completedCount },
    { id: 'cancelled', label: 'Cancelled', count: cancelledCount },
  ];

  const filteredContracts = contracts.filter((c) => {
    const matchesTab =
      activeTab === 'all'
        ? true
        : activeTab === 'cancelled'
        ? c.status === 'cancelled' || c.status === 'disputed'
        : c.status === activeTab;

    const matchesSearch =
      !searchTerm.trim() ||
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.clientId?.companyName?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Contracts</h1>
          <p className="text-slate-500 mt-1">Manage ongoing project milestones, submissions, and payments.</p>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search contracts..."
            className="block w-full sm:w-64 pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
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
            <p className="text-sm font-medium">Loading your contracts...</p>
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="p-16 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-700 font-bold text-base">No contracts found</p>
            <p className="text-slate-400 text-xs mt-1">When clients accept your proposals, active contracts will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6 bg-slate-50/50">
            {filteredContracts.map((contract) => {
              const contractId = contract._id || contract.id;
              const client = contract.clientId || {};
              const clientName = client.companyName || `${client.firstname || 'Client'} ${client.lastname || ''}`.trim();
              const formattedAmount = `₦${Number(contract.agreedAmount || 0).toLocaleString()}`;
              const deadlineStr = contract.deadline
                ? new Date(contract.deadline).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Flexible';

              return (
                <div key={contractId} className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between h-full shadow-sm">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <StatusBadge status={contract.status} />
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        contract.paymentStatus === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : contract.paymentStatus === 'payment_sent'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {contract.paymentStatus === 'payment_sent' ? 'Payment Sent' : contract.paymentStatus === 'paid' ? 'Payment Confirmed' : contract.paymentStatus || 'Unpaid'}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-sm md:text-base text-slate-900 line-clamp-2 mb-1">
                      {contract.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mb-6">Client: {clientName}</p>
                    
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

                    {contract.status === 'active' && (
                      <div className="mb-6">
                        <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                          <span>Milestone Progress</span>
                          <span>{contract.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${contract.progress || 0}%` }} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                    <Link 
                      to={`/freelancer/contracts/${contractId}`}
                      className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors text-center"
                    >
                      View Details
                    </Link>

                    {contract.status === 'active' && (
                      <Link 
                        to={`/freelancer/contracts/${contractId}/submit`}
                        className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors text-center shadow-sm"
                      >
                        Submit Work
                      </Link>
                    )}

                    {contract.status === 'revision_requested' && (
                      <>
                        <Link 
                          to={`/freelancer/messages?recipient=${client._id || ''}&contractId=${contractId}&action=revision_inquiry`}
                          className="py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors text-center shadow-sm"
                        >
                          Discuss Revision
                        </Link>
                        <Link 
                          to={`/freelancer/contracts/${contractId}/submit`}
                          className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors text-center shadow-sm"
                        >
                          Edit Deliverables
                        </Link>
                      </>
                    )}

                    {contract.status === 'submitted' && (
                      <Link 
                        to={`/freelancer/contracts/${contractId}/submit`}
                        className="py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors text-center shadow-sm"
                      >
                        Edit Deliverables
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyContracts;
