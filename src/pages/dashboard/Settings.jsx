import React, { useState, useEffect } from 'react';
import {
  User, CreditCard,
  CheckCircle, Loader2, AlertCircle,
  Trash2, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/api';
import FeedbackModal from '../../components/ui/FeedbackModal';
import PaystackPayoutAccount from '../../components/dashboard/PaystackPayoutAccount';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('account');

  // Account State
  const [accountForm, setAccountForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    timezone: '(UTC-05:00) Eastern Time',
    language: 'English',
  });

  // Notification State
  const [notifications, setNotifications] = useState({
    emailJobAlerts: true,
    emailProposals: true,
    emailMessages: true,
    emailMarketing: false,
    pushNotifications: true,
    smsAlerts: false,
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

  // Save Account Details
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
        phone: accountForm.phone.trim(),
      };
      const res = await userService.updateProfile(userId, payload);
      updateUser(res.user || res);
      setSuccessMsg('Account details saved successfully!');
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to update account details');
    } finally {
      setSaving(false);
    }
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

  const navItems = [
    { id: 'account', label: 'Account Details', icon: <User className="w-5 h-5" /> },
    { id: 'payments', label: 'Payout & Bank Info', icon: <CreditCard className="w-5 h-5" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <FeedbackModal open={Boolean(accountDeletionMessage)} onClose={() => setAccountDeletionMessage('')} title="Contact support to delete your account" message={accountDeletionMessage} variant="info" />
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account and payout information.</p>
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
                <p className="text-xs text-slate-500 mt-0.5">Basic contact information linked to your FreelanceX account.</p>
              </div>
              
              <form onSubmit={handleSaveAccount} className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">First Name</label>
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
                  <label className="block text-sm font-bold text-slate-900 mb-2">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={accountForm.email}
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 font-medium cursor-not-allowed text-sm"
                  />
                  <span className="text-xs text-slate-400 mt-1 block">Primary login email address.</span>
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
                      <option>(UTC-08:00) Pacific Time</option>
                      <option>(UTC-05:00) Eastern Time</option>
                      <option>(UTC+00:00) London, Dublin</option>
                      <option>(UTC+01:00) Paris, Berlin, Rome</option>
                      <option>(UTC+05:30) Mumbai, New Delhi</option>
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
                      <option>Chinese</option>
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
                    Save Account
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* PAYMENTS & PAYOUT METHODS */}
          {activeTab === 'payments' && (
            <PaystackPayoutAccount />
          )}

          {/* NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-150">
              <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900">Notification Preferences</h2>
                <p className="text-xs text-slate-500 mt-0.5">Choose how and when FreelanceX reaches out to you.</p>
              </div>

              <form onSubmit={handleSaveNotifications} className="p-6 space-y-4 divide-y divide-slate-100">
                {[
                  { key: 'emailJobAlerts', title: 'New Matching Job Alerts', desc: 'Instant emails when jobs matching your skills are posted.' },
                  { key: 'emailProposals', title: 'Proposal Status Updates', desc: 'Alerts when clients accept, shortlist, or decline your proposals.' },
                  { key: 'emailMessages', title: 'Direct Messages & Chat', desc: 'Get notified when a client or recruiter sends you a message.' },
                  { key: 'pushNotifications', title: 'In-App & Browser Push Notifications', desc: 'Real-time alert banners on desktop and mobile web.' },
                  { key: 'emailMarketing', title: 'Platform Tips & Community Digests', desc: 'Weekly curated freelance growth tips and product updates.' },
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

          {/* Delete Account Danger Zone */}
          <div className="bg-white border border-red-200 rounded-2xl shadow-sm p-6 flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Delete Account</h3>
              <p className="text-xs text-slate-500">Permanently delete your account, contracts, and proposal history.</p>
            </div>
            <button
              type="button"
              onClick={() => setAccountDeletionMessage('To delete your account, please contact support@freelancex.io.')}
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

export default Settings;
