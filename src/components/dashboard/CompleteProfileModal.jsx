import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, X, CheckCircle2, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CompleteProfileModal = ({ role = 'freelancer' }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // This is deliberately not stored in session/local storage. A user who
    // postpones setup sees it again after their next login until they save it.
    setIsOpen(Boolean(user) && user.profileSetupCompleted !== true);
  }, [user]);

  const handleDismiss = () => {
    setIsOpen(false);
  };

  const handleGoToProfile = () => {
    setIsOpen(false);
    const destination = role === 'admin'
      ? '/admin/settings'
      : role === 'client'
        ? '/client/profile'
        : '/freelancer/profile';
    navigate(destination);
  };

  if (!isOpen) return null;

  const isClient = role === 'client';
  const isAdmin = role === 'admin';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 transform transition-all animate-in zoom-in-95 duration-200">
        
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 pt-8 pb-10 text-white relative">
          <button
            onClick={handleDismiss}
            className="absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold text-blue-100 mb-4 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Account setup needed</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
            {isAdmin ? 'Complete your admin profile' : isClient ? 'Complete your company profile' : 'Complete your freelancer profile'}
          </h2>
          <p className="text-blue-100 text-sm leading-relaxed">
            {isAdmin
              ? 'Review and save your administrator profile so your account setup is complete.'
              : isClient
              ? 'Add your company details and industry information to attract the best talent on the platform.'
              : 'Add your professional title, skills, hourly rate, and overview to start applying for jobs.'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-8 space-y-6">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              What you need to complete:
            </p>
            <ul className="space-y-2 text-sm text-slate-700">
              {isAdmin ? (
                <>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Review your administrator name and account email</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Save the profile to confirm your account setup</span>
                  </li>
                </>
              ) : isClient ? (
                <>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Company name & business overview</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Location & industry sector</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Company logo & banner branding</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Professional title & primary skills</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Hourly rate (₦/hr) & experience level</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Bio & professional summary</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleGoToProfile}
              className="flex-1 py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-md hover:shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 text-sm"
            >
              <span>{isAdmin ? 'Go to Settings' : 'Go to Profile & Edit'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleDismiss}
              className="py-3 px-5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl transition-colors text-sm text-center"
            >
              I'll do this later
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CompleteProfileModal;
