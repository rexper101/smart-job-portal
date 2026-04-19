import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiHome, FiSearch } from 'react-icons/fi';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-[calc(100vh-128px)] flex items-center justify-center px-4">
      <div className="text-center animate-slide-up max-w-md">
        {/* Illustration */}
        <div className="relative mb-8 inline-block">
          <div className="text-[120px] leading-none select-none">🔍</div>
          <div className="absolute -top-2 -right-2 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-500 font-bold text-lg">!</span>
          </div>
        </div>

        <h1 className="text-7xl font-extrabold text-indigo-600 mb-3 tracking-tight">404</h1>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Page Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          Oops! The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate(-1)} className="btn-secondary">
            <FiArrowLeft className="w-4 h-4" /> Go Back
          </button>
          <Link to="/" className="btn-primary">
            <FiHome className="w-4 h-4" /> Home
          </Link>
          <Link to="/jobs" className="btn-secondary">
            <FiSearch className="w-4 h-4" /> Browse Jobs
          </Link>
        </div>
      </div>
    </div>
  );
}
