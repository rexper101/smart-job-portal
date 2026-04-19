/**
 * Profile Page
 * View and edit the authenticated user's profile
 * Includes: personal info, skills, bio, contact details
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  FiUser, FiMail, FiMapPin, FiPhone, FiGlobe,
  FiEdit2, FiSave, FiX, FiPlus, FiAward, FiBriefcase,
} from 'react-icons/fi';

// ── Skill input chip component ────────────────────────────────────────────────
const SkillInput = ({ skills, onChange }) => {
  const [input, setInput] = useState('');

  const add = () => {
    const t = input.trim();
    if (t && !skills.includes(t) && skills.length < 20) {
      onChange([...skills, t]);
      setInput('');
    }
  };

  const remove = (skill) => onChange(skills.filter((s) => s !== skill));

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="e.g. React, Node.js, Python..." className="form-input flex-1" />
        <button type="button" onClick={add} className="btn-secondary px-3">
          <FiPlus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span key={skill} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-sm border border-indigo-100 font-medium">
            {skill}
            <button type="button" onClick={() => remove(skill)}
              className="hover:text-red-500 transition-colors"><FiX className="w-3 h-3" /></button>
          </span>
        ))}
        {skills.length === 0 && (
          <p className="text-xs text-slate-400 italic">Add skills to improve your profile visibility.</p>
        )}
      </div>
    </div>
  );
};

// ── Info row (read-only view) ─────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value, color = 'indigo' }) => (
  <div className="flex items-center gap-3">
    <div className={`w-9 h-9 rounded-lg bg-${color}-50 flex items-center justify-center flex-shrink-0`}>
      <Icon className={`w-4 h-4 text-${color}-500`} />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{value || <span className="italic text-slate-400">Not provided</span>}</p>
    </div>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);

  const [form, setForm] = useState({
    name:     user?.name     || '',
    bio:      user?.bio      || '',
    skills:   user?.skills   || [],
    location: user?.location || '',
    phone:    user?.phone    || '',
    website:  user?.website  || '',
  });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name cannot be empty.'); return; }
    try {
      setSaving(true);
      const { data } = await authAPI.updateProfile(form);
      updateUser(data.user);
      toast.success('Profile updated successfully! ✅');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => {
    setForm({
      name: user?.name || '', bio: user?.bio || '', skills: user?.skills || [],
      location: user?.location || '', phone: user?.phone || '', website: user?.website || '',
    });
    setEditing(false);
  };

  const roleBadge = {
    admin:     { label: '👑 Admin',       color: 'bg-purple-100 text-purple-700' },
    recruiter: { label: '🏢 Recruiter',   color: 'bg-blue-100   text-blue-700' },
    user:      { label: '👤 Job Seeker',  color: 'bg-emerald-100 text-emerald-700' },
  }[user?.role] || {};

  // Profile completeness score
  const fields = [user?.bio, user?.skills?.length, user?.location, user?.phone, user?.website];
  const score  = Math.round((fields.filter(Boolean).length / fields.length) * 100);

  return (
    <div className="container-app py-10 max-w-4xl animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left sidebar ── */}
        <div className="space-y-5">
          {/* Avatar card */}
          <div className="card p-6 text-center">
            <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-extrabold text-4xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-4">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h2 className="font-bold text-lg text-slate-800 dark:text-white">{user?.name}</h2>
            <p className="text-sm text-slate-500 mb-2">{user?.email}</p>
            <span className={`badge ${roleBadge.color} text-xs font-semibold px-3 py-1`}>{roleBadge.label}</span>
            <p className="text-xs text-slate-400 mt-3">
              Member since {new Date(user?.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
            </p>
          </div>

          {/* Completeness */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-700 dark:text-white text-sm">Profile Strength</h3>
              <span className={`text-sm font-bold ${score === 100 ? 'text-emerald-600' : score >= 60 ? 'text-amber-500' : 'text-red-500'}`}>{score}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${score === 100 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
                style={{ width: `${score}%` }} />
            </div>
            {score < 100 && (
              <p className="text-xs text-slate-400 mt-2">
                {!user?.bio && '• Add a bio  '}
                {!user?.location && '• Add location  '}
                {!user?.phone && '• Add phone  '}
                {!user?.skills?.length && '• Add skills'}
              </p>
            )}
          </div>

          {/* Quick info (view mode) */}
          {!editing && (
            <div className="card p-5 space-y-4">
              <InfoRow icon={FiMail}    label="Email"    value={user?.email} />
              <InfoRow icon={FiMapPin}  label="Location" value={user?.location} color="rose" />
              <InfoRow icon={FiPhone}   label="Phone"    value={user?.phone}    color="emerald" />
              {user?.website && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
                    <FiGlobe className="w-4 h-4 text-violet-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Website</p>
                    <a href={user.website} target="_blank" rel="noopener noreferrer"
                      className="text-sm font-medium text-indigo-600 hover:underline truncate block">{user.website}</a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Main content ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Edit / View toggle */}
          <div className="flex justify-end">
            {!editing ? (
              <button onClick={() => setEditing(true)} className="btn-primary">
                <FiEdit2 className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={onCancel} className="btn-secondary"><FiX className="w-4 h-4" /> Cancel</button>
                <button onClick={onSave} disabled={saving} className="btn-primary">
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : <><FiSave className="w-4 h-4" /> Save Changes</>}
                </button>
              </div>
            )}
          </div>

          {/* ── View Mode ── */}
          {!editing ? (
            <>
              {/* Bio */}
              <div className="card p-6">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                  <FiUser className="w-4 h-4 text-indigo-500" /> About Me
                </h3>
                {user?.bio ? (
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{user.bio}</p>
                ) : (
                  <p className="text-slate-400 italic text-sm">No bio added yet. Click "Edit Profile" to add one.</p>
                )}
              </div>

              {/* Skills */}
              <div className="card p-6">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <FiAward className="w-4 h-4 text-indigo-500" /> Skills & Expertise
                </h3>
                {user?.skills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill) => (
                      <span key={skill} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl text-sm font-medium border border-indigo-100 dark:border-indigo-800">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-sm">No skills added yet. Skills help recruiters find you!</p>
                )}
              </div>

              {/* Account info */}
              <div className="card p-6">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <FiBriefcase className="w-4 h-4 text-indigo-500" /> Account Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Account Role</span>
                    <span className={`font-semibold badge ${roleBadge.color}`}>{roleBadge.label}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Member Since</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {new Date(user?.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* ── Edit Mode ── */
            <form onSubmit={onSave} className="space-y-5">
              <div className="card p-6 space-y-4">
                <h3 className="font-semibold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">Personal Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Full Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input name="name" value={form.name} onChange={onChange}
                        placeholder="Your full name" className="form-input pl-10" required />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Location</label>
                    <div className="relative">
                      <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input name="location" value={form.location} onChange={onChange}
                        placeholder="e.g. Mumbai, India" className="form-input pl-10" />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Phone Number</label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input name="phone" value={form.phone} onChange={onChange}
                        placeholder="+91 98765 43210" className="form-input pl-10" />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Website / Portfolio</label>
                    <div className="relative">
                      <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input name="website" value={form.website} onChange={onChange}
                        placeholder="https://yourportfolio.com" className="form-input pl-10" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="form-label">Bio</label>
                  <textarea name="bio" value={form.bio} onChange={onChange} rows={4}
                    placeholder="Tell recruiters about yourself — your experience, goals, and what makes you unique..."
                    className="form-input resize-none" maxLength={300} />
                  <p className="text-xs text-slate-400 mt-1">{form.bio.length}/300 characters</p>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-semibold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3 mb-4 flex items-center gap-2">
                  <FiAward className="w-4 h-4 text-indigo-500" /> Skills
                </h3>
                <SkillInput skills={form.skills} onChange={(updated) => setForm({ ...form, skills: updated })} />
                <p className="text-xs text-slate-400 mt-2">Press Enter or click + to add a skill. Max 20 skills.</p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
