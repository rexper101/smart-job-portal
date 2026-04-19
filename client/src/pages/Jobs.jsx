/**
 * Jobs Page
 * Browse all jobs with search, filters, and pagination
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { jobAPI } from '../services/api';
import JobCard from '../components/JobCard';
import Spinner from '../components/Spinner';
import { FiSearch, FiFilter, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const JOB_TYPES    = ['Full-time', 'Part-time', 'Remote', 'Internship', 'Contract'];
const CATEGORIES   = ['Technology','Design','Marketing','Sales','Finance','Healthcare','Education','Engineering','HR','Other'];
const EXP_LEVELS   = ['Entry Level','Mid Level','Senior Level','Executive'];

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs,       setJobs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);

  const [filters, setFilters] = useState({
    search:          searchParams.get('search')          || '',
    location:        searchParams.get('location')        || '',
    jobType:         searchParams.get('jobType')         || '',
    category:        searchParams.get('category')        || '',
    experienceLevel: searchParams.get('experienceLevel') || '',
    page:            parseInt(searchParams.get('page'))  || 1,
  });

  const [showFilters, setShowFilters] = useState(false);

  // ── Fetch jobs ─────────────────────────────────────────────────────────────
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      // Remove empty params
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v !== 0));
      const { data } = await jobAPI.getAll(params);
      setJobs(data.jobs);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      toast.error('Failed to fetch jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  // Sync filters to URL params
  useEffect(() => {
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  const clearFilters = () => setFilters({ search:'', location:'', jobType:'', category:'', experienceLevel:'', page:1 });
  const hasActiveFilters = filters.jobType || filters.category || filters.experienceLevel || filters.location;

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="container-app py-10 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">Find Your Next Job</h1>
        <p className="text-slate-500 dark:text-slate-400">
          {loading ? 'Searching...' : `${total.toLocaleString()} job${total !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Job title, keyword, or company..."
            value={filters.search}
            onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
            className="form-input pl-11 py-3"
          />
        </div>
        <div className="relative hidden sm:block">
          <input type="text" placeholder="Location..." value={filters.location}
            onChange={(e) => updateFilter('location', e.target.value)}
            className="form-input py-3 w-40" />
        </div>
        <button type="submit" className="btn-primary">Search</button>
        <button type="button" onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary relative ${hasActiveFilters ? 'border-indigo-500 text-indigo-700' : ''}`}>
          <FiFilter className="w-4 h-4" />
          {hasActiveFilters && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full" />}
        </button>
      </form>

      {/* Filter panel */}
      {showFilters && (
        <div className="card p-5 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up">
          {/* Job Type */}
          <div>
            <label className="form-label">Job Type</label>
            <select value={filters.jobType} onChange={(e) => updateFilter('jobType', e.target.value)} className="form-input">
              <option value="">All Types</option>
              {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {/* Category */}
          <div>
            <label className="form-label">Category</label>
            <select value={filters.category} onChange={(e) => updateFilter('category', e.target.value)} className="form-input">
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {/* Experience */}
          <div>
            <label className="form-label">Experience Level</label>
            <select value={filters.experienceLevel} onChange={(e) => updateFilter('experienceLevel', e.target.value)} className="form-input">
              <option value="">All Levels</option>
              {EXP_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {hasActiveFilters && (
            <div className="sm:col-span-3 flex justify-end">
              <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-medium">
                <FiX className="w-4 h-4" /> Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-5">
          {[['jobType', filters.jobType], ['category', filters.category], ['experienceLevel', filters.experienceLevel], ['location', filters.location]].map(([key, val]) =>
            val ? (
              <span key={key} className="flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                {val}
                <button onClick={() => updateFilter(key, '')} className="hover:text-indigo-900"><FiX className="w-3 h-3" /></button>
              </span>
            ) : null
          )}
        </div>
      )}

      {/* Job grid */}
      {loading ? (
        <Spinner />
      ) : jobs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <h3 className="text-xl font-semibold text-slate-700 dark:text-white mb-2">No jobs found</h3>
          <p className="text-slate-500 mb-4">Try adjusting your search filters.</p>
          <button onClick={clearFilters} className="btn-primary">Clear All Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => <JobCard key={job._id} job={job} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
            disabled={filters.page <= 1}
            className="p-2 rounded-xl border border-slate-200 hover:border-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <FiChevronLeft className="w-5 h-5" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p}
              onClick={() => setFilters((prev) => ({ ...prev, page: p }))}
              className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${p === filters.page ? 'bg-indigo-600 text-white shadow-sm' : 'border border-slate-200 text-slate-600 hover:border-indigo-400'}`}>
              {p}
            </button>
          ))}

          <button
            onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
            disabled={filters.page >= totalPages}
            className="p-2 rounded-xl border border-slate-200 hover:border-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <FiChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
