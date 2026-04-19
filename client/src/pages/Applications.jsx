/**
 * Applications Page
 * Full application tracker for Job Seekers
 * Shows all applications with status, job details, and ability to withdraw
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { applicationAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import {
  FiFileText, FiMapPin, FiDollarSign, FiBriefcase,
  FiClock, FiTrash2, FiExternalLink, FiFilter, FiSearch,
  FiCheckCircle, FiXCircle, FiAlertCircle,
} from 'react-icons/fi';

// ── Status filter tabs ────────────────────────────────────────────────────────
const STATUS_TABS = [
  { label: 'All',       value: '',          icon: FiFileText,    color: 'slate' },
  { label: 'Applied',   value: 'applied',   icon: FiAlertCircle, color: 'blue' },
  { label: 'Reviewing', value: 'reviewing', icon: FiClock,       color: 'amber' },
  { label: 'Selected',  value: 'selected',  icon: FiCheckCircle, color: 'emerald' },
  { label: 'Rejected',  value: 'rejected',  icon: FiXCircle,     color: 'red' },
];

const TAB_COLORS = {
  slate:   'border-slate-500   bg-slate-50   text-slate-700',
  blue:    'border-blue-500    bg-blue-50    text-blue-700',
  amber:   'border-amber-500   bg-amber-50   text-amber-700',
  emerald: 'border-emerald-500 bg-emerald-50 text-emerald-700',
  red:     'border-red-500     bg-red-50     text-red-700',
};

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 3600)    return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)   return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
};

export default function Applications() {
  const [apps,       setApps]       = useState([]);
  const [filtered,   setFiltered]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState('');
  const [search,     setSearch]     = useState('');
  const [withdrawing,setWithdrawing]= useState(null);
  const [expanded,   setExpanded]   = useState(null);

  const fetchApps = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await applicationAPI.getMyApps();
      setApps(data.applications);
      setFiltered(data.applications);
    } catch {
      toast.error('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  // Apply tab + search filter
  useEffect(() => {
    let result = apps;
    if (activeTab) result = result.filter((a) => a.status === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((a) =>
        a.jobId?.title?.toLowerCase().includes(q) ||
        a.jobId?.company?.toLowerCase().includes(q) ||
        a.jobId?.location?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [apps, activeTab, search]);

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Withdraw this application? This cannot be undone.')) return;
    try {
      setWithdrawing(appId);
      await applicationAPI.withdraw(appId);
      setApps((prev) => prev.filter((a) => a._id !== appId));
      toast.success('Application withdrawn.');
    } catch {
      toast.error('Failed to withdraw application.');
    } finally {
      setWithdrawing(null);
    }
  };

  const countByStatus = (s) => apps.filter((a) => a.status === s).length;

  return (
    <div className="container-app py-10 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">My Applications</h1>
        <p className="text-slate-500 dark:text-slate-400">
          {loading ? 'Loading...' : `${apps.length} total application${apps.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Progress overview */}
      {apps.length > 0 && !loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Applied',   count: countByStatus('applied'),   color: 'bg-blue-500',    bg: 'bg-blue-50',    text: 'text-blue-700'    },
            { label: 'Reviewing', count: countByStatus('reviewing'), color: 'bg-amber-500',   bg: 'bg-amber-50',   text: 'text-amber-700'   },
            { label: 'Selected',  count: countByStatus('selected'),  color: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
            { label: 'Rejected',  count: countByStatus('rejected'),  color: 'bg-red-500',     bg: 'bg-red-50',     text: 'text-red-700'     },
          ].map(({ label, count, bg, text }) => (
            <div key={label} className={`card p-4 ${bg} border-none`}>
              <p className={`text-2xl font-extrabold ${text}`}>{count}</p>
              <p className={`text-sm font-medium ${text} opacity-80`}>{label}</p>
              {apps.length > 0 && (
                <div className="mt-2 h-1.5 bg-white/60 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${text.replace('text','bg')} opacity-70 transition-all duration-500`}
                    style={{ width: `${(count / apps.length) * 100}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title, company, or location..."
            className="form-input pl-9" />
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_TABS.map(({ label, value, icon: Icon, color }) => {
          const cnt = value ? countByStatus(value) : apps.length;
          const isActive = activeTab === value;
          return (
            <button key={value} onClick={() => setActiveTab(value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all duration-150 ${
                isActive ? `${TAB_COLORS[color]} border-current shadow-sm` : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white dark:bg-slate-800 dark:text-slate-300'
              }`}>
              <Icon className="w-3.5 h-3.5" /> {label}
              <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/60' : 'bg-slate-100 dark:bg-slate-700'}`}>{cnt}</span>
            </button>
          );
        })}
      </div>

      {/* Application list */}
      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-5xl mb-4">{activeTab ? '🔍' : '📨'}</p>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-white mb-2">
            {activeTab || search ? 'No matching applications' : 'No applications yet'}
          </h3>
          <p className="text-slate-500 mb-5 text-sm">
            {activeTab || search ? 'Try a different filter or search term.' : 'Start applying to jobs and track your progress here.'}
          </p>
          {!activeTab && !search && (
            <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => {
            const job = app.jobId;
            const isExpanded = expanded === app._id;

            return (
              <div key={app._id} className={`card overflow-hidden transition-all duration-200 ${isExpanded ? 'border-indigo-200 shadow-indigo-50' : ''}`}>
                {/* Main row */}
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Company avatar */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold text-lg flex items-center justify-center flex-shrink-0">
                      {job?.company?.charAt(0) || '?'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-800 dark:text-white truncate">
                            {job?.title || <span className="text-slate-400 italic">Job no longer available</span>}
                          </h3>
                          <p className="text-sm text-slate-500 mt-0.5">{job?.company}</p>
                        </div>
                        <StatusBadge status={app.status} />
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400">
                        {job?.location && (
                          <span className="flex items-center gap-1"><FiMapPin className="w-3 h-3" />{job.location}</span>
                        )}
                        {job?.salary && (
                          <span className="flex items-center gap-1"><FiDollarSign className="w-3 h-3" />{job.salary}</span>
                        )}
                        {job?.jobType && (
                          <span className="flex items-center gap-1"><FiBriefcase className="w-3 h-3" />{job.jobType}</span>
                        )}
                        <span className="flex items-center gap-1"><FiClock className="w-3 h-3" />Applied {timeAgo(app.createdAt)}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3">
                        {job?._id && (
                          <Link to={`/jobs/${job._id}`}
                            className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                            <FiExternalLink className="w-3 h-3" /> View Job
                          </Link>
                        )}
                        {(app.coverLetter || app.resume) && (
                          <button onClick={() => setExpanded(isExpanded ? null : app._id)}
                            className="text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors ml-2">
                            {isExpanded ? '▲ Less' : '▼ Details'}
                          </button>
                        )}
                        <button
                          onClick={() => handleWithdraw(app._id)}
                          disabled={withdrawing === app._id}
                          className="ml-auto flex items-center gap-1 text-xs text-red-400 hover:text-red-600 font-medium transition-colors disabled:opacity-50">
                          <FiTrash2 className="w-3.5 h-3.5" />
                          {withdrawing === app._id ? 'Withdrawing...' : 'Withdraw'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 px-5 py-4 space-y-3 animate-slide-up">
                    {app.resume && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Resume</p>
                        <a href={app.resume} target="_blank" rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:underline break-all">
                          📎 {app.resume}
                        </a>
                      </div>
                    )}
                    {app.coverLetter && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Cover Letter</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                          {app.coverLetter}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Status progress bar */}
                <div className="px-5 pb-3">
                  <div className="flex items-center gap-1">
                    {['applied','reviewing','selected','rejected'].map((s, i) => {
                      const steps = ['applied','reviewing','selected'];
                      const isRejected = app.status === 'rejected';
                      const idx = steps.indexOf(app.status);
                      const filled = isRejected
                        ? s === 'rejected'
                        : s !== 'rejected' && steps.indexOf(s) <= idx;
                      return (
                        <React.Fragment key={s}>
                          <div className={`h-1.5 flex-1 rounded-full transition-colors ${
                            filled
                              ? isRejected ? 'bg-red-400' : 'bg-indigo-500'
                              : 'bg-slate-200 dark:bg-slate-700'
                          }`} />
                        </React.Fragment>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>Applied</span>
                    <span>Reviewing</span>
                    <span>Decision</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer CTA */}
      {filtered.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm mb-3">Looking for more opportunities?</p>
          <Link to="/jobs" className="btn-primary">Browse All Jobs</Link>
        </div>
      )}
    </div>
  );
}
