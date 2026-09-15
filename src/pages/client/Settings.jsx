import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, CreditCard, Building2, 
  CheckCircle, Loader2, AlertCircle, Smartphone, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/api';
import FeedbackModal from '../../components/ui/FeedbackModal';

const ClientSettings = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('account');

  // Account Form
  const [accountForm, setAccountForm] = useState({
    firstname: '',
    lastname: '',
    companyName: '',
    email: '',
    phone: '',
    timezone: '(UTC-08:00) Pacific Time',
    language: 'English',
  });

  // Security Form
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
  });

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    newProposals: true,
    workSubmitted: true,
    newMessages: true,
    paymentReceipts: true,
    weeklySummary: false,
  });

  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    companyVisibility: 'public', // public | verified_only | anonymous
    allowDirectInvites: true,
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [accountDeletionMessage, setAccountDeletionMessage] = useState('');

  useEffect(() => {
    if (user) {
      setAccountForm((prev) => ({
        ...prev,
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        companyName: user.companyName || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  const clearAlerts = () => {
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    clearAlerts();
  };

  // Save Account
  const handleSaveAccount = async (e) => {
    e.preventDefault();
    const userId = user?._id || user?.id;
    if (!userId) return;

    setSaving(true);
    clearAlerts();

    try {
      const payload = {
        firstname: accountForm.firstname.trim(),
        lastname: accountForm.lastname.trim(),
        companyName: accountForm.companyName.trim(),
        phone: accountForm.phone.trim(),
      };
      const res = await userService.updateProfile(userId, payload);
      updateUser(res.user || res);
      setSuccessMsg('Client account details updated successfully!');
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to update account details');
    } finally {
      setSaving(false);
    }
  };

  // Save Security
  const handleSaveSecurity = (e) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setErrorMsg('New passwords do not match');
      return;
    }
    if (securityForm.newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    clearAlerts();
    setTimeout(() => {
      setSuccessMsg('Password updated successfully!');
      setSecurityForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactorEnabled: securityForm.twoFactorEnabled,
      });
      setSaving(false);
    }, 500);
  };

  // Save Notifications
  const handleSaveNotifications = (e) => {
    e.preventDefault();
    setSaving(true);
    clearAlerts();
    setTimeout(() => {
      setSuccessMsg('Notification preferences updated!');
      setSaving(false);
    }, 400);
  };

  // Save Privacy
  const handleSavePrivacy = (e) => {
    e.preventDefault();
    setSaving(true);
    clearAlerts();
    setTimeout(() => {
      setSuccessMsg('Company privacy settings updated!');
      setSaving(false);
    }, 400);
  };

  const navItems = [
    { id: 'account', label: 'Account Details', icon: <User className="w-5 h-5" /> },
    { id: 'billing', label: 'Billing & Payment', icon: <CreditCard className="w-5 h-5" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <FeedbackModal open={Boolean(accountDeletionMessage)} onClose={() => setAccountDeletionMessage('')} title="Contact support to delete your account" message={accountDeletionMessage} variant="info" />
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your client account preferences, company billing, and security.</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1 bg-white p-2 border border-slate-200 rounded-2xl shadow-sm">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 font-semibold rounded-xl text-sm transition-colors text-left ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-6">

          {/* TAB 1: ACCOUNT DETAILS */}
          {activeTab === 'account' && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-150">
              <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900">Account Details</h2>
                <p className="text-xs text-slate-500 mt-0.5">Contact details and company representation information.</p>
              </div>

              <form onSubmit={handleSaveAccount} className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">First Name / Representative</label>
                    <input
                      type="text"
                      value={accountForm.firstname}
                      onChange={(e) => setAccountForm({ ...accountForm, firstname: e.target.value })}
                      required
                      className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 font-medium text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={accountForm.lastname}
                      onChange={(e) => setAccountForm({ ...accountForm, lastname: e.target.value })}
                      required
                      className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 font-medium text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Company Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={accountForm.companyName}
                      onChange={(e) => setAccountForm({ ...accountForm, companyName: e.target.value })}
                      className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 font-medium text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={accountForm.email}
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 font-medium cursor-not-allowed text-sm"
                  />
                  <span className="text-xs text-slate-400 mt-1 block">Primary login and billing recipient email.</span>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={accountForm.phone}
                    onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 font-medium text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Time Zone</label>
                    <select
                      value={accountForm.timezone}
                      onChange={(e) => setAccountForm({ ...accountForm, timezone: e.target.value })}
                      className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 font-medium text-sm"
                    >
                      <option>(UTC-08:00) Pacific Time (US & Canada)</option>
                      <option>(UTC-05:00) Eastern Time (US & Canada)</option>
                      <option>(UTC+00:00) London, Dublin</option>
                      <option>(UTC+01:00) Paris, Berlin, Madrid</option>
                      <option>(UTC+08:00) Singapore, Hong Kong</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Language</label>
                    <select
                      value={accountForm.language}
                      onChange={(e) => setAccountForm({ ...accountForm, language: e.target.value })}
                      className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 font-medium text-sm"
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 text-sm disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Save Details
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: SECURITY & PASSWORD */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
                  <h2 className="text-lg font-bold text-slate-900">Change Password</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Protect your client account and corporate payment data.</p>
                </div>

                <form onSubmit={handleSaveSecurity} className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Current Password</label>
                    <input
                      type="password"
                      required
                      value={securityForm.currentPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                      placeholder="••••••••"
                      className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 font-medium text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2">New Password</label>
                      <input
                        type="password"
                        required
                        value={securityForm.newPassword}
                        onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                        placeholder="••••••••"
                        className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 font-medium text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={securityForm.confirmPassword}
                        onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 font-medium text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 text-sm disabled:opacity-60"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Update Password
                    </button>
                  </div>
                </form>
              </div>

              {/* 2FA Card */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-slate-900">Two-Factor Authentication (2FA)</h3>
                  </div>
                  <p className="text-sm text-slate-500 max-w-md">
                    Require a verification code on login before releasing milestone funds or posting jobs.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={securityForm.twoFactorEnabled}
                    onChange={(e) => setSecurityForm({ ...securityForm, twoFactorEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: BILLING & PAYMENT */}
          {activeTab === 'billing' && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-150">
              <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Paystack payments</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Choose a secure payment method whenever you fund a contract.</p>
                </div>
                <Link to="/client/payments" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-700"><CreditCard className="h-4 w-4" />View payments</Link>
              </div>

              <div className="p-6 space-y-5">
                <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
                  <div className="flex gap-3"><ShieldCheck className="h-6 w-6 flex-shrink-0 text-blue-600" /><div><p className="font-bold text-slate-900">Your card details stay with Paystack</p><p className="mt-1 text-sm leading-6 text-slate-600">FreelanceX does not collect or store card numbers. Select “Pay with Paystack” beside a contract, then choose card, bank transfer, USSD, or any supported method in the secure Paystack checkout.</p></div></div>
                </div>
                <div className="grid gap-3 border-t border-slate-100 pt-5 text-sm text-slate-600 sm:grid-cols-3">
                  <div><p className="font-bold text-slate-900">1. Approve work</p><p className="mt-1 text-xs leading-5">The contract becomes ready for payment.</p></div>
                  <div><p className="font-bold text-slate-900">2. Pay securely</p><p className="mt-1 text-xs leading-5">Choose a payment method in Paystack checkout.</p></div>
                  <div><p className="font-bold text-slate-900">3. Keep the receipt</p><p className="mt-1 text-xs leading-5">Your payment record appears in Payments.</p></div>
                </div>
                <div className="flex justify-end border-t border-slate-100 pt-5"><Link to="/client/payments" className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">Go to Payments</Link></div>
              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-150">
              <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900">Notification Preferences</h2>
                <p className="text-xs text-slate-500 mt-0.5">Stay updated on new bids, candidate submissions, and project milestones.</p>
              </div>

              <form onSubmit={handleSaveNotifications} className="p-6 space-y-4 divide-y divide-slate-100">
                {[
                  { key: 'newProposals', title: 'New Proposals on Posted Jobs', desc: 'Get an instant notification whenever a freelancer applies to your project.' },
                  { key: 'workSubmitted', title: 'Work Submitted for Approval', desc: 'Alerts when freelancers submit deliverables for milestone review.' },
                  { key: 'newMessages', title: 'Direct Messages & Updates', desc: 'Notify when freelancers send inquiries or project chat messages.' },
                  { key: 'paymentReceipts', title: 'Payment Receipts', desc: 'Receive invoice and payment receipts automatically upon confirmation.' },
                  { key: 'weeklySummary', title: 'Weekly Talent & Hiring Digest', desc: 'A weekly summary of top matching candidates in your industry.' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between pt-4 first:pt-0">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={notifications[item.key]}
                        onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}

                <div className="pt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 text-sm disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Save Preferences
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: PRIVACY */}
          {activeTab === 'privacy' && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-150">
              <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900">Company Privacy & Visibility</h2>
                <p className="text-xs text-slate-500 mt-0.5">Control how your company profile and job postings are shown to candidates.</p>
              </div>

              <form onSubmit={handleSavePrivacy} className="p-6 space-y-6">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-900">Company Profile Visibility</label>
                  <div className="space-y-2">
                    {[
                      { id: 'public', title: 'Public Company Profile (Recommended)', desc: 'Show your logo, company overview, and verified payment badge on jobs.' },
                      { id: 'verified_only', title: 'Verified Freelancers Only', desc: 'Only vetted and verified talent can see detailed corporate data.' },
                      { id: 'anonymous', title: 'Confidential / Anonymous Posting', desc: 'Post jobs without revealing your company brand name.' },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                          privacy.companyVisibility === opt.id
                            ? 'border-blue-600 bg-blue-50/50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="companyVisibility"
                          checked={privacy.companyVisibility === opt.id}
                          onChange={() => setPrivacy({ ...privacy, companyVisibility: opt.id })}
                          className="mt-1 text-blue-600"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-900">{opt.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 text-sm disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Save Privacy
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Delete Account Danger Zone */}
          <div className="bg-white border border-red-200 rounded-2xl shadow-sm p-6 flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Delete Client Account</h3>
              <p className="text-xs text-slate-500">Close your company account and cancel active job postings.</p>
            </div>
            <button
              type="button"
              onClick={() => setAccountDeletionMessage('To delete your client account, please contact support@freelancex.io.')}
              className="px-5 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors border border-red-200 whitespace-nowrap"
            >
              Delete Account
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ClientSettings;
