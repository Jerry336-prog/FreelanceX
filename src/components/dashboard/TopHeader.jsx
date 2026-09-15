import React from 'react';
import { Menu, Search, Bell, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const TopHeader = ({ onMenuClick }) => {
  const { user } = useAuth();

  const isClient = user?.role === 'client';
  const isAdmin = user?.role === 'admin';
  const roleLabel = isAdmin ? 'Admin' : isClient ? 'Client' : 'Freelancer';

  const profileLink = isAdmin
    ? '/admin/settings'
    : isClient
    ? '/client/profile'
    : '/freelancer/profile';

  const notifLink = isAdmin
    ? '/admin/notifications'
    : isClient
    ? '/client/notifications'
    : '/freelancer/notifications';

  const displayName =
    user?.firstname && user?.lastname
      ? `${user.firstname} ${user.lastname}`
      : user?.companyName || user?.email || 'My Account';

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 lg:px-8 z-30 sticky top-0">
      <div className="flex items-center flex-1">
        <button 
          onClick={onMenuClick}
          className="mr-4 lg:hidden text-slate-500 hover:text-slate-900 focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        {/* Search */}
        <div className="hidden sm:flex max-w-md w-full relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search projects, contracts, messages..."
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4 ml-4">
        <Link to={notifLink} className="relative p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-full transition-colors">
          <Bell className="w-6 h-6" />
          <span className="absolute top-1.5 right-1.5 block w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white"></span>
        </Link>
        
        <Link to={profileLink} className="flex items-center space-x-3 cursor-pointer p-1 rounded-full hover:bg-slate-50 transition-colors">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
            {user?.profileImage ? (
              <img 
                src={user.profileImage} 
                alt={displayName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-bold text-slate-900 leading-tight">{displayName}</p>
            <p className="text-xs font-medium text-slate-500">{roleLabel}</p>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default TopHeader;
