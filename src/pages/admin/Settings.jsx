import React, { useState, useEffect } from 'react';
import { 
  User, CreditCard, Globe, 
  CheckCircle, AlertCircle, Loader2, Shield 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import FeedbackModal from '../../components/ui/FeedbackModal';
import { adminService, userService } from '../../services/api';

const AdminSettings = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const registeredName = user
    ? [user.firstname, user.lastname].filter(Boolean).join(' ') || user.name || 'Admin'
    : 'Admin';

  // Admin Profile Form
  const [profileForm, setProfileForm] = useState({
    name: registeredName,
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
  });

  useEffect(() => {
    if (user) {
      const name = [user.firstname, user.lastname].filter(Boolean).join(' ') || user.name || '';
      setProfileForm((prev) => ({
        ...prev,
        name: name || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  useEffect(() => {
    adminService.getSettings().then((settings) => {
      setPlatformConfig((current) => ({ ...current, ...settings }));
      setPaymentConfig((current) => ({ ...current, payoutSchedule: settings.payoutSchedule || current.payoutSchedule, minPayoutAmount: settings.minPayoutAmount ?? current.minPayoutAmount }));
    }).catch((err) => setErrorMsg(err?.message || 'Unable to load platform settings'));
  }, []);

  // Platform Config
  const [platformConfig, setPlatformConfig] = useState({
    platformName: 'FreelanceX',
    serviceFee: 10,
    allowFreelancerSignup: true,
    allowClientSignup: true,
    disputeSystem: true,
    maintenanceMode: false,
  });

  // Payment Config
  const [paymentConfig, setPaymentConfig] = useState({
    escrowHoldDays: 7,
    payoutSchedule: 'daily',
    minPayoutAmount: 50,
    stripeLiveMode: true,
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cacheMessage, setCacheMessage] = useState('');

  const clearAlerts = () => {
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    clearAlerts();
  };

  const handleSave = (e, message) => {
    e.preventDefault();
    setSaving(true);
    clearAlerts();
    const settings = { ...platformConfig, payoutSchedule: paymentConfig.payoutSchedule, minPayoutAmount: paymentConfig.minPayoutAmount };
    adminService.updateSettings(settings)
      .then(() => setSuccessMsg(message || 'Settings saved successfully!'))
      .catch((err) => setErrorMsg(err?.message || 'Unable to save settings'))
      .finally(() => setSaving(false));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const userId = user?._id || user?.id;
    const nameParts = profileForm.name.trim().split(/\s+/).filter(Boolean);

    if (!userId || !nameParts.length) {
      setErrorMsg('Enter your full name before saving your administrator profile.');
      return;
    }

    setSaving(true);
    clearAlerts();
    try {
      const updated = await userService.updateProfile(userId, {
        firstname: nameParts[0],
        lastname: nameParts.slice(1).join(' ') || user?.lastname || nameParts[0],
      });
      updateUser(updated.user || updated);
      setSuccessMsg('Admin profile updated!');
    } catch (err) {
      setErrorMsg(err?.message || 'Unable to save admin profile');
    } finally {
      setSaving(false);
    }
  };

  const navItems = [
    { id: 'profile', label: 'Admin Profile', icon: <User className="w-5 h-5" /> },
    { id: 'platform', label: 'Platform Config', icon: <Globe className="w-5 h-5" /> },
    { id: 'payments', label: 'Payment Gateway', icon: <CreditCard className="w-5 h-5" /> },
  ];

  const initial = (profileForm.name || 'A')[0]?.toUpperCase() || 'A';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <FeedbackModal open={Boolean(cacheMessage)} onClose={() => setCacheMessage('')} title="Cache purged" message={cacheMessage} variant="success" />
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
        <p className="text-slate-500 mt-1">Configure FreelanceX platform behavior, payments, and administrative preferences.</p>
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
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">

          {/* TAB 1: ADMIN PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-150">
              <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900">Admin Profile</h2>
                <p className="text-xs text-slate-500 mt-0.5">Your personal credentials and master admin permissions.</p>
              </div>
              <form onSubmit={handleProfileSave} className="p-6 space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl border-2 border-indigo-200 bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-2xl uppercase overflow-hidden">
                      {user?.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={profileForm.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        initial
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-900">{profileForm.name}</p>
                    <p className="text-slate-500 text-sm">{profileForm.email}</p>
                    <span className="inline-flex items-center gap-1 mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      <Shield className="w-3 h-3" /> Master Administrator
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-900 font-medium text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-900 font-medium text-sm"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2 text-sm disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Save Admin Profile
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: PLATFORM CONFIG */}
          {activeTab === 'platform' && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-150">
              <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900">Platform Configuration</h2>
                <p className="text-xs text-slate-500 mt-0.5">Control global platform names, commission rates, and feature flags.</p>
              </div>
              <form onSubmit={(e) => handleSave(e, 'Platform configuration updated!')} className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Platform Name</label>
                    <input
                      type="text"
                      value={platformConfig.platformName}
                      onChange={(e) => setPlatformConfig({ ...platformConfig, platformName: e.target.value })}
                      className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Platform Service Fee (%)</label>
                    <input
                      type="number"
                      value={platformConfig.serviceFee}
                      onChange={(e) => setPlatformConfig({ ...platformConfig, serviceFee: Number(e.target.value) })}
                      className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <p className="text-sm font-bold text-slate-900">Platform Feature Flags</p>
                  {[
                    { key: 'allowFreelancerSignup', label: 'Allow new freelancer registrations' },
                    { key: 'allowClientSignup', label: 'Allow new client registrations' },
                    { key: 'disputeSystem', label: 'Enable milestone dispute system' },
                    { key: 'maintenanceMode', label: 'Maintenance mode (disable all public routes)' },
                  ].map((flag) => (
                    <div key={flag.key} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <p className="text-sm font-medium text-slate-700">{flag.label}</p>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={platformConfig[flag.key]}
                          onChange={(e) => setPlatformConfig({ ...platformConfig, [flag.key]: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2 text-sm disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Save Configuration
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: PAYMENTS & SETTLEMENT */}
          {activeTab === 'payments' && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-150">
              <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900">Payment Gateway & Settlement Rules</h2>
                <p className="text-xs text-slate-500 mt-0.5">Configure payment settlement schedules and minimum payouts.</p>
              </div>
              <form onSubmit={(e) => handleSave(e, 'Payment gateway configuration updated!')} className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Payment Verification Window (Days)</label>
                    <input
                      type="number"
                      value={paymentConfig.escrowHoldDays}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, escrowHoldDays: Number(e.target.value) })}
                      className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-sm font-medium"
                    />
                    <span className="text-xs text-slate-400 mt-1 block">Days given to verify deliverables before automated payment review.</span>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Minimum Payout Amount (₦ NGN)</label>
                    <input
                      type="number"
                      value={paymentConfig.minPayoutAmount}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, minPayoutAmount: Number(e.target.value) })}
                      className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2 text-sm disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Save Payment Rules
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Platform Cache Purge */}
          <div className="bg-white border border-red-200 rounded-2xl shadow-sm p-6 flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Danger Zone</h3>
              <p className="text-xs text-slate-500">Irreversible platform actions. Proceed with caution.</p>
            </div>
            <button
              type="button"
              onClick={() => setCacheMessage('Platform cache successfully purged.')}
              className="px-5 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors border border-red-200 whitespace-nowrap"
            >
              Purge Cache
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
