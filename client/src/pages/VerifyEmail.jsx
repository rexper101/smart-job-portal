import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import toast from 'react-hot-toast';
import { FiMail, FiArrowLeft } from 'react-icons/fi';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;
  const email  = location.state?.email;

  const [otp,       setOtp]       = useState(['', '', '', '', '', '']);
  const [loading,   setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputs = useRef([]);

  useEffect(() => { if (!userId) navigate('/register'); }, [userId, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0)
      inputs.current[index - 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) { setOtp(pasted.split('')); inputs.current[5]?.focus(); }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) { toast.error('Enter the complete 6-digit OTP.'); return; }
    try {
      setLoading(true);
      const { data } = await axiosInstance.post('/auth/verify-email', { userId, otp: otpString });
      localStorage.setItem('sjp_token', data.token);
      toast.success(data.message);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed.');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      await axiosInstance.post('/auth/resend-otp', { userId });
      toast.success('New OTP sent!');
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } catch (err) {
      toast.error('Failed to resend OTP.');
    } finally { setResending(false); }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 mb-4">
            <FiMail className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Verify Your Email</h1>
          <p className="text-slate-500 mt-2 text-sm">
            OTP sent to <span className="font-semibold text-indigo-600">{email}</span>
          </p>
        </div>

        <div className="card p-8">
          <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input key={index} ref={(el) => (inputs.current[index] = el)}
                type="text" inputMode="numeric" maxLength={1} value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-xl transition-all focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 ${
                  digit ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white'}`}
              />
            ))}
          </div>

          <button onClick={handleVerify} disabled={loading || otp.join('').length !== 6} className="btn-primary w-full py-3 mb-4">
            {loading ? 'Verifying...' : '✅ Verify Email'}
          </button>

          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-sm text-slate-500">Resend in <span className="font-bold text-indigo-600">{countdown}s</span></p>
            ) : (
              <button onClick={handleResend} disabled={resending} className="text-sm font-semibold text-indigo-600 hover:underline">
                {resending ? 'Sending...' : '🔄 Resend OTP'}
              </button>
            )}
          </div>
        </div>

        <button onClick={() => navigate('/register')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 mx-auto mt-5">
          <FiArrowLeft className="w-4 h-4" /> Back to Register
        </button>
      </div>
    </div>
  );
}