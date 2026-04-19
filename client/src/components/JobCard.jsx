/**
 * JobCard Component
 * Displays a single job listing in a card format
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiDollarSign, FiClock, FiUsers, FiArrowRight, FiBookmark } from 'react-icons/fi';

// ── Badge colour map ───────────────────────────────────────────────────────────
const jobTypeColors = {
  'Full-time':  'bg-emerald-100 text-emerald-700',
  'Part-time':  'bg-sky-100 text-sky-700',
  'Remote':     'bg-violet-100 text-violet-700',
  'Internship': 'bg-amber-100 text-amber-700',
  'Contract':   'bg-orange-100 text-orange-700',
};

const expColors = {
  'Entry Level':  'bg-teal-50 text-teal-700',
  'Mid Level':    'bg-blue-50 text-blue-700',
  'Senior Level': 'bg-purple-50 text-purple-700',
  'Executive':    'bg-rose-50 text-rose-700',
};

// ── Time ago helper ───────────────────────────────────────────────────────────
const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)        return 'Just now';
  if (diff < 3600)      return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)     return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000)   return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 2592000)}mo ago`;
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function JobCard({ job, compact = false }) {
  const {
    _id, title, company, location, salary, jobType,
    experienceLevel, applicationCount, createdAt, category,
  } = job;

  return (
    <div className="card p-5 flex flex-col gap-4 group animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Company initial avatar */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {company?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 truncate">{company}</p>
              <span className="text-xs text-slate-400">{category}</span>
            </div>
          </div>

          <h3 className="font-semibold text-slate-800 dark:text-white text-base leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
            {title}
          </h3>
        </div>

        {/* Bookmark (decorative) */}
        <button className="p-1.5 rounded-lg text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 transition-colors flex-shrink-0">
          <FiBookmark className="w-4 h-4" />
        </button>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
        <span className="flex items-center gap-1"><FiMapPin className="w-3 h-3 text-indigo-400" />{location}</span>
        <span className="flex items-center gap-1"><FiDollarSign className="w-3 h-3 text-emerald-400" />{salary || 'Not Disclosed'}</span>
        <span className="flex items-center gap-1"><FiClock className="w-3 h-3 text-amber-400" />{timeAgo(createdAt)}</span>
        {applicationCount > 0 && (
          <span className="flex items-center gap-1"><FiUsers className="w-3 h-3 text-rose-400" />{applicationCount} applied</span>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        <span className={`badge ${jobTypeColors[jobType] || 'bg-slate-100 text-slate-600'}`}>{jobType}</span>
        <span className={`badge ${expColors[experienceLevel] || 'bg-slate-100 text-slate-600'}`}>{experienceLevel}</span>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-2 border-t border-slate-50">
        <Link
          to={`/jobs/${_id}`}
          className="flex items-center justify-center gap-1.5 w-full text-sm font-semibold text-indigo-600 hover:text-indigo-700 group-hover:gap-3 transition-all duration-200"
        >
          View Details <FiArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
