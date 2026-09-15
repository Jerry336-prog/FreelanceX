import React, { useState, useEffect, useCallback } from 'react';
import Tabs from '../../components/ui/Tabs';
import StatusBadge from '../../components/ui/StatusBadge';
import { Search, Eye, UserX, UserCheck, X, AlertTriangle, Loader2, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/api';

const Users = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState(null); // { type: 'suspend'|'activate'|'deactivate', user }
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 20,
      };
      if (activeTab !== 'all') params.role = activeTab;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const data = await adminService.getUsers(params);
      setUsers(data?.users || []);
      setTotalUsers(data?.total || 0);
      setTotalPages(data?.pages || 1);
    } catch (err) {
      console.error('Fetch users error:', err);
      setError(err?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [activeTab, statusFilter, search, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleStatusUpdate = async () => {
    if (!modal?.user) return;
    setActionLoading(true);
    try {
      const newStatus = modal.type === 'suspend' ? 'suspended' : 'active';
      await adminService.updateUserStatus(modal.user._id || modal.user.id, newStatus);
      setUsers((prev) =>
        prev.map((u) => ((u._id || u.id) === (modal.user._id || modal.user.id) ? { ...u, status: newStatus } : u))
      );
      setModal(null);
    } catch (err) {
      setError(err?.message || 'Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  };

  const tabs = [
    { id: 'all', label: 'All Users', count: totalUsers },
    { id: 'freelancer', label: 'Freelancers' },
    { id: 'client', label: 'Clients' },
    { id: 'admin', label: 'Admins' },
  ];

  const roleColor = {
    freelancer: 'bg-blue-50 text-blue-700 border-blue-200',
    client: 'bg-purple-50 text-purple-700 border-purple-200',
    admin: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Confirm Modal */}
      {modal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {modal.type === 'suspend' ? 'Suspend User' : 'Activate User'}
              </h2>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl mb-6 border border-slate-200">
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-lg uppercase">
                {modal.user.firstname?.[0] || modal.user.name?.[0] || 'U'}
              </div>
              <div>
                <p className="font-bold text-slate-900">
                  {modal.user.firstname ? `${modal.user.firstname} ${modal.user.lastname || ''}` : modal.user.name}
                </p>
                <p className="text-sm text-slate-500">{modal.user.email}</p>
              </div>
            </div>
            <p className="text-slate-600 mb-8 text-sm">
              {modal.type === 'suspend' &&
                'This user will be prevented from logging in and their active listings will be paused.'}
              {modal.type === 'activate' && 'This user will regain full access to the platform.'}
            </p>
            <div className="flex gap-4">
              <button
                disabled={actionLoading}
                onClick={() => setModal(null)}
                className="flex-1 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleStatusUpdate}
                className={`flex-1 px-6 py-3 font-semibold rounded-xl shadow-sm text-white flex items-center justify-center gap-2 ${
                  modal.type === 'suspend' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {modal.type === 'suspend' ? 'Suspend User' : 'Activate User'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Users</h1>
          <p className="text-slate-500 mt-1">View, moderate, and manage all platform users.</p>
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
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={(tab) => {
              setActiveTab(tab);
              setPage(1);
            }}
          />
        </div>

        {/* Search & Filter Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm bg-slate-50"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="border border-slate-200 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="deactivated">Deactivated</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
              <p className="text-sm">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p className="font-semibold text-slate-700">No users found</p>
              <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-sm text-slate-500">
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => {
                  const fullName = user.firstname
                    ? `${user.firstname} ${user.lastname || ''}`.trim()
                    : user.name || 'User';
                  const joined = user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—';

                  return (
                    <tr key={user._id || user.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-600 text-sm uppercase">
                            {fullName[0] || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{fullName}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${
                            roleColor[user.role] || 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{joined}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={user.status || 'active'} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {user.status === 'active' ? (
                            <button
                              onClick={() => setModal({ type: 'suspend', user })}
                              className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Suspend User"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setModal({ type: 'activate', user })}
                              className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Activate User"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
            <p className="text-sm text-slate-500">
              Showing page {page} of {totalPages} ({totalUsers} total)
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors text-slate-600 font-medium"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg font-medium">
                {page}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors text-slate-600 font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
