import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import AdminSidebar from '../components/dashboard/AdminSidebar';
import FloatingHomeButton from '../components/dashboard/FloatingHomeButton';
import { Menu, Search, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CompleteProfileModal from '../components/dashboard/CompleteProfileModal';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  const adminName = user
    ? [user.firstname, user.lastname].filter(Boolean).join(' ') || user.name || 'Admin'
    : 'Admin';
  const initial = adminName[0]?.toUpperCase() || 'A';

  return (
    <div className="h-dvh overflow-hidden bg-slate-50 font-sans text-slate-900 flex">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Admin Top Header */}
        <header className="h-20 flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 lg:px-8 z-30 sticky top-0">
          <div className="flex items-center flex-1">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="mr-4 lg:hidden text-slate-500 hover:text-slate-900"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="hidden sm:flex max-w-md w-full relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search users, jobs, contracts..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 ml-4">
            <Link to="/admin/notifications" className="relative p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-full transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1.5 right-1.5 block w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </Link>

            <Link to="/admin/settings" className="flex items-center space-x-3 cursor-pointer p-1 rounded-full hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-200 bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={adminName} className="w-full h-full object-cover" />
                ) : (
                  initial
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-bold text-slate-900 leading-tight">{adminName}</p>
                <p className="text-xs font-medium text-indigo-600 capitalize">{user?.role || 'Administrator'}</p>
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <FloatingHomeButton />
      <CompleteProfileModal role="admin" />
    </div>
  );
};

export default AdminLayout;
