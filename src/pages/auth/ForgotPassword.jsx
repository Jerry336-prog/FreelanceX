import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { authService } from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.forgotPassword(email.trim());
      setSubmitted(true);
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err?.message || 'Failed to send reset link. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center" aria-label="FreelanceX home">
          <img src="/freelancex-logo.svg" alt="FreelanceX" className="h-10 w-auto" />
        </Link>
        <h2 className="mt-6 text-center text-2xl font-bold text-slate-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-slate-200">
          {submitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Check your inbox</h3>
              <p className="text-sm text-slate-600">
                We've sent a password reset link to <strong className="text-slate-900">{email}</strong> if an account exists.
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-500"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Return to sign in
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Sending reset link...
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </button>
              </div>

              <div className="mt-6 text-center">
                <Link to="/login" className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900">
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back to log in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
