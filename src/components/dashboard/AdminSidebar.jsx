import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Briefcase, FileText,
  CreditCard, AlertTriangle, BarChart2,
  Bell, Settings, LogOut, X, Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBadges } from '../../context/BadgeContext';

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const { hasUnattendedBadge, markPathAttended } = useBadges();
  const navigate = useNavigate();

  const adminName = user
    ? [user.firstname, user.lastname].filter(Boolean).join(' ') || user.name || 'Admin'
    : 'Admin';
  const adminEmail = user?.email || 'admin@freelancex.io';
  const initial = adminName[0]?.toUpperCase() || 'A';

  const handleLogout = async () => {
    if (logout) await logout();
    navigate('/login');
  };
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" />, end: true },
    { name: 'Users', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { name: 'Jobs', path: '/admin/jobs', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'Proposals', path: '/admin/proposals', icon: <FileText className="w-5 h-5" /> },
    { name: 'Contracts', path: '/admin/contracts', icon: <FileText className="w-5 h-5" /> },
    { name: 'Payments', path: '/admin/payments', icon: <CreditCard className="w-5 h-5" /> },
    { name: 'Disputes', path: '/admin/disputes', icon: <AlertTriangle className="w-5 h-5" /> },
    { name: 'Reports', path: '/admin/reports', icon: <BarChart2 className="w-5 h-5" /> },
    { name: 'Notifications', path: '/admin/notifications', icon: <Bell className="w-5 h-5" /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

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
          <button className="lg:hidden text-slate-500 hover:text-slate-900" onClick={() => setIsOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Admin Badge */}
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Admin Control Panel</span>
          </div>
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

        {/* Admin Profile */}
        <div className="p-4 border-t border-slate-100 flex-shrink-0 space-y-2">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 flex-shrink-0 bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={adminName} className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{adminName}</p>
              <p className="text-xs text-slate-500 truncate">{adminEmail}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            type="button"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
