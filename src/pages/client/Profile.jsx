import React, { useState, useEffect, useRef } from 'react';
import { Camera, MapPin, Briefcase, Globe, Phone, CheckCircle, Loader2, Building2, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/api';

const ClientProfile = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    companyName: '',
    website: '',
    phone: '',
    location: '',
    bio: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Hydrate client data
  useEffect(() => {
    if (user) {
      setFormData({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        companyName: user.companyName || '',
        website: user.website || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
      });
      if (user.profileImage) {
        setImagePreview(user.profileImage);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setSuccessMsg('');
      setErrorMsg('');
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    const userId = user?._id || user?.id;
    if (!userId) {
      setErrorMsg('User session not found. Please log in again.');
      return;
    }

    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const payload = new FormData();
      payload.append('firstname', formData.firstname.trim());
      payload.append('lastname', formData.lastname.trim());
      payload.append('companyName', formData.companyName.trim());
      payload.append('website', formData.website.trim());
      payload.append('phone', formData.phone.trim());
      payload.append('location', formData.location.trim());
      payload.append('bio', formData.bio.trim());

      if (selectedFile) {
        payload.append('profileImage', selectedFile);
      }

      const res = await userService.updateProfile(userId, payload);
      const updatedUser = res.user || res;
      updateUser(updatedUser);
      setSuccessMsg('Client profile updated successfully!');
    } catch (err) {
      console.error('Update client profile error:', err);
      setErrorMsg(err?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Client Profile</h1>
          <p className="text-slate-500 mt-1">Manage your public-facing company identity and hiring profile.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/client"
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-center text-sm"
          >
            Dashboard
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 text-sm disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-900 relative" />

        <div className="px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-6">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white bg-slate-100 overflow-hidden shadow-md flex items-center justify-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Company logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-12 h-12 text-slate-300" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-colors"
                title="Change Logo"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                name="profileImage"
                accept="image/jpeg,image/png,image/jpg"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            <div className="flex items-center gap-4 text-sm font-medium">
              <div className="flex items-center text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                <CheckCircle className="w-4 h-4 mr-1" />
                {user?.isVerified ? 'Verified Client' : 'Active Account'}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">First Name / Representative</label>
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 font-medium"
                  placeholder="e.g. Jordan"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 font-medium"
                  placeholder="e.g. Lee"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Company / Business Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 font-medium"
                    placeholder="e.g. Acme Innovations Inc."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Website URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 font-medium"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Location / HQ</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 font-medium"
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 font-medium"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Company Overview & Mission</label>
              <textarea
                rows={5}
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Describe your company, what products/services you build, and why freelancers love working with you..."
                className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 font-medium"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  'Save Profile'
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ClientProfile;
