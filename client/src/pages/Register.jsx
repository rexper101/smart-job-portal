import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiBriefcase, FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'user',      label: '👤 Job Seeker',  desc: 'Browse and apply to jobs' },
  { value: 'recruiter', label: '🏢 Recruiter',    desc: 'Post jobs and hire talent' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Please fill in all fields.'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    try {
      setLoading(true);
      const data = await register(form);
      navigate('/verify-email', { state: { userId: data.userId, email: data.email || form.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white mb-4 shadow-lg shadow-indigo-200">
            <FiBriefcase className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Create your account</h1>
          <p className="text-slate-500 mt-1 text-sm">Join SmartHire — it's free!</p>
        </div>

        <div className="card p-8">
          <form onSubmit={onSubmit} className="space-y-5">

            {/* Role Selector */}
            <div>
              <label className="form-label">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map(({ value, label, desc }) => (
                  <button key={value} type="button"
                    onClick={() => setForm({ ...form, role: value })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      form.role === value
                        ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                        : 'border-slate-200 hover:border-indigo-300 bg-white'
                    }`}>
                    <p className="text-sm font-semibold text-slate-700">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="form-label">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input name="name" type="text" placeholder="John Doe"
                  value={form.name} onChange={onChange} className="form-input pl-10" required />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input name="email" type="email" placeholder="you@example.com"
                  value={form.email} onChange={onChange} className="form-input pl-10" required />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input name="password" type={showPass ? 'text' : 'password'}
                  placeholder="At least 6 characters" value={form.password} onChange={onChange}
                  className="form-input pl-10 pr-10" required minLength={6} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength */}
              <div className="mt-2 flex gap-1">
                {[1,2,3].map((n) => (
                  <div key={n} className={`h-1 flex-1 rounded-full transition-colors ${
                    form.password.length >= n*3
                      ? form.password.length >= 9 ? 'bg-emerald-500' : 'bg-amber-400'
                      : 'bg-slate-200'
                  }`} />
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}