import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, PlusCircle, Briefcase, Users, 
  CreditCard, MessageSquare, Bell, User, 
  Settings, LogOut, X, FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBadges } from '../../context/BadgeContext';

const ClientSidebar = ({ isOpen, setIsOpen }) => {
  const { logout } = useAuth();
  const { hasUnattendedBadge, markPathAttended } = useBadges();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/client', icon: <LayoutDashboard className="w-5 h-5" />, end: true },
    { name: 'Post a Job', path: '/client/post-job', icon: <PlusCircle className="w-5 h-5" /> },
    { name: 'My Jobs', path: '/client/jobs', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'Proposals', path: '/client/proposals', icon: <FileText className="w-5 h-5" /> },
    { name: 'Contracts', path: '/client/contracts', icon: <Users className="w-5 h-5" /> },
    { name: 'Payments', path: '/client/payments', icon: <CreditCard className="w-5 h-5" /> },
    { name: 'Messages', path: '/client/messages', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'Notifications', path: '/client/notifications', icon: <Bell className="w-5 h-5" /> },
    { name: 'Company Profile', path: '/client/profile', icon: <User className="w-5 h-5" /> },
    { name: 'Settings', path: '/client/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 h-dvh w-64 overflow-hidden bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col
        lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 flex-shrink-0">
          <NavLink to="/" className="inline-flex items-center" aria-label="FreelanceX home">
            <img src="/freelancex-logo.svg" alt="FreelanceX" className="h-7 w-auto" />
          </NavLink>
          <button 
            className="lg:hidden text-slate-500 hover:text-slate-900"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-hidden py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const hasBadge = hasUnattendedBadge(item.path, item.name);
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.end}
                onClick={() => {
                  markPathAttended(item.path);
                  setIsOpen(false);
                }}
                className={({ isActive }) => `
                  flex items-center justify-between px-4 py-3 rounded-xl transition-colors font-medium text-sm
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span>{item.name}</span>
                </div>
                {hasBadge && (
                  <span className="relative flex h-2.5 w-2.5 ml-2 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default ClientSidebar;
