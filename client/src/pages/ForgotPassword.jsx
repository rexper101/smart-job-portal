import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import toast from 'react-hot-toast';
import { FiMail, FiArrowLeft, FiSend } from 'react-icons/fi';

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axiosInstance.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 mb-4">
            <FiMail className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Forgot Password?</h1>
          <p className="text-slate-500 mt-2 text-sm">Enter your email and we'll send a reset OTP.</p>
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center py-4">
              <p className="text-5xl mb-4">📬</p>
              <h3 className="font-bold text-slate-800 text-lg mb-2">Check Your Email!</h3>
              <p className="text-slate-500 text-sm mb-4">Reset OTP sent to <span className="font-semibold text-indigo-600">{email}</span></p>
              <p className="text-xs text-slate-400">OTP expires in 15 minutes.</p>
              <button onClick={() => setSent(false)} className="btn-secondary w-full mt-4">Try different email</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" className="form-input pl-10" required />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Sending...' : <><FiSend className="w-4 h-4" /> Send Reset OTP</>}
              </button>
            </form>
          )}
        </div>
        {sent && (
          <Link to="/reset-password" className="btn-secondary w-full mt-4 justify-center">
            Enter OTP and reset password
          </Link>
        )}

        <Link to="/login" className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 mx-auto mt-5 justify-center">
          <FiArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
      </div>
    </div>
  );
}