import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiBriefcase, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill in all fields.'); return; }
    try {
      setLoading(true);
      const data = await login(form.email, form.password);
      // Redirect based on role
      const role = data.user?.role;
      navigate(role === 'user' ? '/jobs' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Demo credentials helper
  const fillDemo = (role) => {
    const creds = {
      user:      { email: 'seeker@demo.com',    password: 'demo123' },
      recruiter: { email: 'recruiter@demo.com', password: 'demo123' },
    };
    setForm(creds[role]);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white mb-4 shadow-lg shadow-indigo-200">
            <FiBriefcase className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome back!</h1>
          <p className="text-slate-500 mt-1 text-sm">Sign in to your SmartHire account</p>
        </div>

        {/* Demo shortcut buttons */}
        <div className="flex gap-2 mb-5">
          <button onClick={() => fillDemo('user')} type="button" className="flex-1 text-xs py-2 px-3 border border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors font-medium">
            👤 Demo Seeker
          </button>
          <button onClick={() => fillDemo('recruiter')} type="button" className="flex-1 text-xs py-2 px-3 border border-violet-200 text-violet-600 rounded-xl hover:bg-violet-50 transition-colors font-medium">
            🏢 Demo Recruiter
          </button>
        </div>

        {/* Form card */}
        <div className="card p-8">
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="form-label" htmlFor="email">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input id="email" name="email" type="email" placeholder="you@example.com"
                  value={form.email} onChange={onChange} autoComplete="email"
                  className="form-input pl-10" required />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="form-label" htmlFor="password">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input id="password" name="password" type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password" value={form.password} onChange={onChange}
                  autoComplete="current-password" className="form-input pl-10 pr-10" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 font-semibold hover:underline">Create one free</Link>
        </p>
      </div>
    </div>
  );
}
