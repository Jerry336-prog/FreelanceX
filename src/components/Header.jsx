import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            <a href="#" className="inline-flex items-center" aria-label="FreelanceX home">
              <img src="/freelancex-logo.svg" alt="FreelanceX" className="h-8 w-auto" />
            </a>
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

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Log In
            </Link>
            <Link to="/signup" className="text-sm font-medium bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-slate-800 transition-colors shadow-sm">
              Sign Up
            </Link>
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
            <div className="pt-4 flex flex-col space-y-3 px-3">
              <Link to="/login" className="w-full text-center text-base font-medium text-slate-700 bg-slate-100 py-3 rounded-lg hover:bg-slate-200 transition-colors">
                Log In
              </Link>
              <Link to="/signup" className="w-full text-center text-base font-medium text-white bg-blue-600 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
