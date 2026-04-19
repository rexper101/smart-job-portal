/**
 * Home Page
 * Landing page with hero section, stats, features, and recent jobs CTA
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiSearch, FiBriefcase, FiUsers, FiTrendingUp,
  FiShield, FiZap, FiGlobe, FiArrowRight, FiCheckCircle,
} from 'react-icons/fi';

// ── Stats data ────────────────────────────────────────────────────────────────
const STATS = [
  { icon: FiBriefcase, value: '10,000+', label: 'Jobs Posted' },
  { icon: FiUsers,     value: '50,000+', label: 'Registered Users' },
  { icon: FiTrendingUp,value: '8,500+',  label: 'Successful Hires' },
  { icon: FiGlobe,     value: '200+',    label: 'Companies' },
];

const FEATURES = [
  { icon: FiZap,    title: 'Instant Apply',       desc: 'Apply to jobs with a single click. No lengthy forms.' },
  { icon: FiShield, title: 'Verified Companies',  desc: 'Every recruiter account is reviewed before posting.' },
  { icon: FiSearch, title: 'Smart Search',         desc: 'Filter by type, location, salary, and experience level.' },
  { icon: FiUsers,  title: 'Role-Based Portal',   desc: 'Separate dashboards for Job Seekers and Recruiters.' },
];

const CATEGORIES = [
  { label: 'Technology',  emoji: '💻' },
  { label: 'Design',      emoji: '🎨' },
  { label: 'Marketing',   emoji: '📣' },
  { label: 'Finance',     emoji: '💰' },
  { label: 'Healthcare',  emoji: '🏥' },
  { label: 'Engineering', emoji: '⚙️' },
  { label: 'Education',   emoji: '📚' },
  { label: 'HR',          emoji: '🤝' },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs${query ? `?search=${encodeURIComponent(query)}` : ''}`);
  };

  return (
    <div className="animate-fade-in">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 text-white">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-500/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-800/40 rounded-full blur-3xl" />

        <div className="container-app relative z-10 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white text-sm rounded-full border border-white/20 mb-6 font-medium">
              🚀 The Smartest Way to Find Your Next Job
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
              Connect Talent with{' '}
              <span className="text-yellow-300">Opportunity</span>
            </h1>
            <p className="text-indigo-100 text-lg md:text-xl mb-10 leading-relaxed max-w-xl mx-auto">
              Discover thousands of jobs from top companies, or post a listing and find your perfect hire — all in one place.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mx-auto">
              <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search jobs, companies, or keywords..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm font-medium shadow-lg"
                />
              </div>
              <button type="submit" className="px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold rounded-xl transition-colors shadow-lg text-sm whitespace-nowrap">
                Search Jobs
              </button>
            </form>

            {/* Quick links */}
            <div className="flex flex-wrap justify-center gap-2 mt-6 text-xs">
              {['Remote', 'Full-time', 'Internship', 'Senior Level'].map((tag) => (
                <button key={tag} onClick={() => navigate(`/jobs?jobType=${tag}`)} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-colors">
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-slate-800 border-y border-slate-100 dark:border-slate-700">
        <div className="container-app py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-indigo-600" />
                </div>
                <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────────────────── */}
      <section className="container-app py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">Browse by Category</h2>
          <p className="text-slate-500 dark:text-slate-400">Explore opportunities in your field</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.map(({ label, emoji }) => (
            <Link key={label} to={`/jobs?category=${label}`}
              className="card p-5 text-center hover:border-indigo-200 hover:shadow-indigo-100 cursor-pointer group transition-all duration-200">
              <span className="text-3xl mb-2 block">{emoji}</span>
              <p className="text-sm font-semibold text-slate-700 dark:text-white group-hover:text-indigo-600 transition-colors">{label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="bg-indigo-50 dark:bg-slate-800/50 py-16">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">Why SmartHire?</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">We build tools that make job hunting and hiring faster, smarter, and fairer.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6 text-center hover:border-indigo-200 transition-all">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-white mb-2">{title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="container-app py-16">
        <div className="grid md:grid-cols-2 gap-6">
          {/* For Job Seekers */}
          <div className="card p-8 bg-gradient-to-br from-indigo-600 to-violet-600 text-white border-none">
            <h3 className="text-xl font-bold mb-3">Looking for a Job?</h3>
            <ul className="space-y-2 text-indigo-100 text-sm mb-6">
              {['Browse thousands of openings', 'One-click apply', 'Track your applications'].map(item => (
                <li key={item} className="flex items-center gap-2"><FiCheckCircle className="w-4 h-4 text-yellow-300 flex-shrink-0" />{item}</li>
              ))}
            </ul>
            <Link to="/jobs" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 font-bold rounded-xl hover:bg-yellow-50 transition-colors text-sm">
              Find Jobs <FiArrowRight />
            </Link>
          </div>

          {/* For Recruiters */}
          <div className="card p-8 bg-gradient-to-br from-slate-800 to-slate-900 text-white border-none">
            <h3 className="text-xl font-bold mb-3">Hiring Talent?</h3>
            <ul className="space-y-2 text-slate-300 text-sm mb-6">
              {['Post jobs for free', 'Manage applicants easily', 'Find the right candidate fast'].map(item => (
                <li key={item} className="flex items-center gap-2"><FiCheckCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />{item}</li>
              ))}
            </ul>
            <Link to={isAuthenticated ? '/post-job' : '/register'} className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors text-sm">
              Post a Job <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
