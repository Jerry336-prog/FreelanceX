import React, { useState } from 'react';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = (role) => {
    if (role === 'admin') return '/admin';
    if (role === 'client') return '/client';
    return '/freelancer';
  };

  const dashboardPath = user ? getDashboardPath(user.role) : '/';
  const roleLabel = user?.role === 'admin' ? 'Admin' : user?.role === 'client' ? 'Client' : 'Freelancer';
  const displayName = user?.firstname
    ? `${user.firstname} ${user.lastname || ''}`.trim()
    : user?.companyName || user?.email?.split('@')[0] || 'My Account';

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    await logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Browse Jobs', href: '#browse-jobs' },
    { name: 'Freelancers', href: '#freelancers' },
    { name: 'About', href: '#about' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="inline-flex items-center" aria-label="FreelanceX home">
              <img src="/freelancex-logo.svg" alt="FreelanceX" className="h-8 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop Auth / User Info */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                {/* Tapping user profile pill takes user back to their dashboard */}
                <Link
                  to={dashboardPath}
                  className="flex items-center gap-3 p-1.5 pr-4.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-blue-300 transition-all shadow-xs group"
                  title={`Return to your ${roleLabel} Dashboard`}
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-blue-100 border border-blue-300 flex items-center justify-center flex-shrink-0 text-blue-700 font-bold text-xs">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{displayName[0]?.toUpperCase() || 'U'}</span>
                    )}
                  </div>
                  <div className="text-left leading-tight">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-[130px]">
                      {displayName}
                    </p>
                    <p className="text-[10px] font-semibold text-blue-600 capitalize flex items-center gap-1">
                      <span>{roleLabel} Dashboard</span>
                      <span>➔</span>
                    </p>
                  </div>
                </Link>

                {/* Explicit Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Log out of account"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                  Log In
                </Link>
                <Link to="/signup" className="text-sm font-medium bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-slate-800 transition-colors shadow-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-600 hover:text-slate-900 focus:outline-none p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-3 text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-md"
              >
                {link.name}
              </a>
            ))}

            {isAuthenticated && user ? (
              <div className="pt-4 px-1 space-y-2 border-t border-slate-100">
                <Link
                  to={dashboardPath}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{displayName[0]?.toUpperCase() || 'U'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{displayName}</p>
                    <p className="text-xs text-blue-600 font-semibold">{roleLabel} Dashboard</p>
                  </div>
                  <LayoutDashboard className="w-5 h-5 text-blue-600 flex-shrink-0" />
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors border border-red-200"
                >
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
              </div>
            ) : (
              <div className="pt-4 flex flex-col space-y-3 px-3">
                <Link to="/login" className="w-full text-center text-base font-medium text-slate-700 bg-slate-100 py-3 rounded-lg hover:bg-slate-200 transition-colors">
                  Log In
                </Link>
                <Link to="/signup" className="w-full text-center text-base font-medium text-white bg-blue-600 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
