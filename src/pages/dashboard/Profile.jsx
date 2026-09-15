import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, MapPin, Briefcase, DollarSign, CheckCircle, 
  Loader2, Plus, X, Phone, User as UserIcon, ExternalLink, 
  FolderPlus, Trash2, Award, Sparkles 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('overview');

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    professionalTitle: '',
    location: '',
    phone: '',
    hourlyRate: '',
    bio: '',
    availability: 'available',
    experience: 'intermediate',
  });

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  
  // Portfolio
  const [portfolio, setPortfolio] = useState([]);
  const [newProject, setNewProject] = useState({ title: '', link: '', description: '' });
  const [showAddProject, setShowAddProject] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Hydrate form
  useEffect(() => {
    if (user) {
      setFormData({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        professionalTitle: user.professionalTitle || '',
        location: user.location || '',
        phone: user.phone || '',
        hourlyRate: user.hourlyRate ? String(user.hourlyRate) : '',
        bio: user.bio || '',
        availability: user.availability || 'available',
        experience: user.experience || 'intermediate',
      });
      setSkills(Array.isArray(user.skills) ? user.skills : []);
      setPortfolio(Array.isArray(user.portfolio) ? user.portfolio : []);
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

  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProject.title.trim()) return;
    setPortfolio([...portfolio, { ...newProject }]);
    setNewProject({ title: '', link: '', description: '' });
    setShowAddProject(false);
  };

  const handleRemoveProject = (index) => {
    setPortfolio(portfolio.filter((_, idx) => idx !== index));
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
      payload.append('professionalTitle', formData.professionalTitle.trim());
      payload.append('location', formData.location.trim());
      payload.append('phone', formData.phone.trim());
      payload.append('hourlyRate', formData.hourlyRate ? Number(formData.hourlyRate) : '');
      payload.append('bio', formData.bio.trim());
      payload.append('availability', formData.availability);
      payload.append('experience', formData.experience);
      
      skills.forEach((skill) => {
        payload.append('skills[]', skill);
      });

      if (selectedFile) {
        payload.append('profileImage', selectedFile);
      }

      const res = await userService.updateProfile(userId, payload);
      const updatedUser = res.user || res;
      updateUser(updatedUser);
      setSuccessMsg('Profile updated successfully!');
    } catch (err) {
      console.error('Update profile error:', err);
      setErrorMsg(err?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Profile Overview' },
    { id: 'skills', label: 'Skills & Tech Stack' },
    { id: 'portfolio', label: 'Portfolio Projects' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-500 mt-1">Manage your public freelancer identity and showcase your work.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/freelancer"
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
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2 animate-in fade-in">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Banner & Avatar */}
        <div className="h-32 bg-gradient-to-r from-blue-700 to-indigo-900 relative" />
        
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-6">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-md flex items-center justify-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-12 h-12 text-slate-300" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                title="Change Photo"
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
                {user?.isVerified ? 'Verified Freelancer' : 'Active Account'}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-slate-200 mb-6">
            <nav className="flex space-x-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <form onSubmit={handleSave} className="space-y-6 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                    required
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 font-medium text-sm"
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
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 font-medium text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Professional Title</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="professionalTitle"
                      value={formData.professionalTitle}
                      onChange={handleChange}
                      placeholder="e.g. Senior Full Stack Developer"
                      className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 font-medium text-sm"
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
                      placeholder="+1 (555) 000-0000"
                      className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 font-medium text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Location</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. New York, USA"
                      className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 font-medium text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Hourly Rate (₦/hr)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="number"
                      name="hourlyRate"
                      value={formData.hourlyRate}
                      onChange={handleChange}
                      placeholder="5000"
                      className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 font-medium text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Experience Level</label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 font-medium text-sm"
                  >
                    <option value="entry">Entry Level</option>
                    <option value="intermediate">Intermediate Level</option>
                    <option value="expert">Expert / Senior</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Professional Overview</label>
                <textarea
                  rows={5}
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Describe your expertise, past achievements, and working style..."
                  className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 font-medium text-sm"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 text-sm disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Save Overview
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Your Skills & Technologies</h3>
                <p className="text-xs text-slate-500 mb-4">Add skills to help clients discover you for relevant projects.</p>
                
                <div className="flex flex-wrap gap-2 mb-4 min-h-[48px] p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  {skills.length === 0 ? (
                    <span className="text-xs text-slate-400 self-center">No skills added yet.</span>
                  ) : (
                    skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-semibold rounded-lg border border-blue-100 flex items-center gap-2"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-blue-400 hover:text-blue-700 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill(e);
                      }
                    }}
                    placeholder="Type skill (e.g. React, Python, UI/UX) and press Add..."
                    className="block w-full sm:w-80 px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Add Skill
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 text-sm disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Save Skills
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PORTFOLIO */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Featured Projects</h3>
                  <p className="text-xs text-slate-500">Showcase past projects, live links, and case studies.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddProject(!showAddProject)}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <FolderPlus className="w-4 h-4" />
                  Add Project
                </button>
              </div>

              {showAddProject && (
                <form onSubmit={handleAddProject} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 animate-in zoom-in-95">
                  <h4 className="text-sm font-bold text-slate-900">New Project Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Project Title</label>
                      <input
                        type="text"
                        required
                        value={newProject.title}
                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                        placeholder="e.g. E-Commerce Dashboard"
                        className="block w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Live URL / Repo</label>
                      <input
                        type="url"
                        value={newProject.link}
                        onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                        placeholder="https://..."
                        className="block w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      placeholder="Brief overview of what you built..."
                      className="block w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddProject(false)}
                      className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                    >
                      Add to List
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-2 gap-4">
                {portfolio.length === 0 ? (
                  <div className="col-span-2 py-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                    <p className="text-sm text-slate-500 font-medium">No portfolio projects added yet.</p>
                    <p className="text-xs text-slate-400 mt-1">Click "Add Project" above to highlight your best work.</p>
                  </div>
                ) : (
                  portfolio.map((proj, idx) => (
                    <div key={idx} className="p-4 border border-slate-200 rounded-xl bg-white space-y-2 relative group shadow-sm">
                      <div className="flex items-start justify-between">
                        <h4 className="font-bold text-slate-900 text-sm">{proj.title}</h4>
                        <button
                          type="button"
                          onClick={() => handleRemoveProject(idx)}
                          className="text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-semibold pt-1"
                        >
                          <span>Visit Project</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;
