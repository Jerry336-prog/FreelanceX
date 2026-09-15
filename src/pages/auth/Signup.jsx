import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, Camera, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, login } = useAuth();
  
  const [accountType, setAccountType] = useState('client');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!formData.agreeTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const dataPayload = new FormData();
      dataPayload.append('firstname', formData.firstName.trim());
      dataPayload.append('lastname', formData.lastName.trim());
      dataPayload.append('email', formData.email.trim());
      dataPayload.append('password', formData.password);
      dataPayload.append('role', accountType);

      if (selectedFile) {
        dataPayload.append('profileImage', selectedFile);
      }

      const res = await signup(dataPayload);

      // If token wasn't returned by signup, auto-login to get JWT token
      if (!res?.token && !localStorage.getItem('token')) {
        try {
          await login({
            email: formData.email.trim(),
            password: formData.password,
          });
        } catch (loginErr) {
          console.warn('Auto-login after signup:', loginErr);
        }
      }

      // The dashboard detects incomplete setup from the user record, so the
      // reminder is reliable across future logins as well as this first visit.
      if (accountType === 'client') {
        navigate('/client');
      } else {
        navigate('/freelancer');
      }
    } catch (err) {
      console.error('Signup failed:', err);
      setError(err?.message || 'Failed to create account. Please try again.');
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
          Create your {accountType === 'client' ? 'Client' : 'Freelancer'} account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-slate-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Account Type Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                I want to...
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none transition-all ${accountType === 'client' ? 'bg-white border-blue-600 ring-1 ring-blue-600' : 'bg-white border-slate-300 hover:border-slate-400'}`}>
                  <input type="radio" name="account_type" value="client" className="sr-only" checked={accountType === 'client'} onChange={() => setAccountType('client')} />
                  <span className="flex flex-1">
                    <span className="flex flex-col">
                      <span className="block text-sm font-medium text-slate-900 flex items-center gap-2">
                        <Briefcase className={`w-5 h-5 ${accountType === 'client' ? 'text-blue-600' : 'text-slate-400'}`} />
                        Hire talent
                      </span>
                      <span className="mt-1 flex items-center text-xs text-slate-500">
                        I need to find freelancers for projects.
                      </span>
                    </span>
                  </span>
                  {accountType === 'client' && <span className="pointer-events-none absolute -inset-px rounded-lg border-2 border-blue-600" aria-hidden="true" />}
                </label>
                
                <label className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none transition-all ${accountType === 'freelancer' ? 'bg-white border-blue-600 ring-1 ring-blue-600' : 'bg-white border-slate-300 hover:border-slate-400'}`}>
                  <input type="radio" name="account_type" value="freelancer" className="sr-only" checked={accountType === 'freelancer'} onChange={() => setAccountType('freelancer')} />
                  <span className="flex flex-1">
                    <span className="flex flex-col">
                      <span className="block text-sm font-medium text-slate-900 flex items-center gap-2">
                        <User className={`w-5 h-5 ${accountType === 'freelancer' ? 'text-blue-600' : 'text-slate-400'}`} />
                        Work as a freelancer
                      </span>
                      <span className="mt-1 flex items-center text-xs text-slate-500">
                        I want to find freelance projects.
                      </span>
                    </span>
                  </span>
                  {accountType === 'freelancer' && <span className="pointer-events-none absolute -inset-px rounded-lg border-2 border-blue-600" aria-hidden="true" />}
                </label>
              </div>
            </div>

            {/* Profile Photo Upload */}
            <div className="flex flex-col items-center gap-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative w-24 h-24 rounded-full cursor-pointer group"
              >
                <div className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors ${
                  imagePreview ? 'border-blue-400' : 'border-slate-300 bg-slate-50 group-hover:border-blue-400 group-hover:bg-blue-50'
                }`}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-slate-300 group-hover:text-blue-400 transition-colors" />
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <p className="text-xs text-slate-500">
                {imagePreview ? (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="text-blue-600 hover:underline font-medium">Change photo</button>
                ) : (
                  <><span className="text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => fileInputRef.current?.click()}>Upload profile photo</span> (optional)</>  
                )}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                name="profileImage"
                id="profile-image"
                accept="image/jpeg,image/png,image/jpg"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="first-name" className="block text-sm font-medium text-slate-700">
                  First name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="firstName"
                    id="first-name"
                    autoComplete="given-name"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g. Jane"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="last-name" className="block text-sm font-medium text-slate-700">
                  Last name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="lastName"
                    id="last-name"
                    autoComplete="family-name"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g. Doe"
                  />
                </div>
              </div>
            </div>

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
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700">
                  Confirm password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="agreeTerms"
                type="checkbox"
                required
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-slate-700">
                I agree to the{' '}
                <a href="#" className="font-semibold text-blue-600 hover:text-blue-500">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="font-semibold text-blue-600 hover:text-blue-500">
                  Privacy Policy
                </a>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  `Create ${accountType === 'client' ? 'Client' : 'Freelancer'} Account`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
