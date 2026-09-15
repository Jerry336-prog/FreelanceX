import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { authService } from '../../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlToken = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState(urlToken);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (!token) {
      setError('Reset token is missing or invalid');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.resetPassword({
        token,
        newPassword: password,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err?.message || 'Failed to reset password. Link may have expired.');
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
          Set new password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Your new password must be at least 6 characters long.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-slate-200">
          {success ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Password Updated!</h3>
              <p className="text-sm text-slate-600">
                Your password has been reset successfully. Redirecting you to sign in...
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-500"
                >
                  Click here to sign in now
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

              {!urlToken && (
                <div>
                  <label htmlFor="token" className="block text-sm font-medium text-slate-700">
                    Reset Token / Code
                  </label>
                  <div className="mt-1">
                    <input
                      id="token"
                      name="token"
                      type="text"
                      required
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Paste reset token here"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  New password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700">
                  Confirm new password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="••••••••"
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
                      Updating password...
                    </>
                  ) : (
                    <>
                      Reset password
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
