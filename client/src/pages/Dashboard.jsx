/**
 * Dashboard Page
 * Role-based dashboard:
 *  - Recruiter: posted jobs, applicant management
 *  - User:      quick stats, recent applications, job suggestions
 *  - Admin:     system overview
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobAPI, applicationAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import {
  FiBriefcase, FiUsers, FiFileText, FiPlusCircle,
  FiEye, FiTrash2, FiEdit, FiChevronRight, FiTrendingUp,
  FiCheckCircle, FiClock, FiXCircle, FiToggleLeft, FiToggleRight,
} from 'react-icons/fi';

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color = 'indigo', sub }) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald:'bg-emerald-50 text-emerald-600',
    amber:  'bg-amber-50  text-amber-600',
    rose:   'bg-rose-50   text-rose-600',
    violet: 'bg-violet-50 text-violet-600',
  };
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{value}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

// ── Recruiter Dashboard ───────────────────────────────────────────────────────
const RecruiterDashboard = ({ user }) => {
  const [jobs,         setJobs]         = useState([]);
  const [applicants,   setApplicants]   = useState({});   // { jobId: [apps] }
  const [expandedJob,  setExpandedJob]  = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [updatingApp,  setUpdatingApp]  = useState(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await jobAPI.getMyJobs();
      setJobs(data.jobs);
    } catch { toast.error('Failed to load your jobs.'); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const loadApplicants = async (jobId) => {
    if (expandedJob === jobId) { setExpandedJob(null); return; }
    try {
      const { data } = await applicationAPI.getJobApps(jobId);
      setApplicants((prev) => ({ ...prev, [jobId]: data.applications }));
      setExpandedJob(jobId);
    } catch { toast.error('Failed to load applicants.'); }
  };

  const updateStatus = async (appId, status, jobId) => {
    try {
      setUpdatingApp(appId);
      await applicationAPI.updateStatus(appId, status);
      setApplicants((prev) => ({
        ...prev,
        [jobId]: prev[jobId].map((a) => a._id === appId ? { ...a, status } : a),
      }));
      toast.success(`Status updated to "${status}"`);
    } catch { toast.error('Failed to update status.'); }
    finally { setUpdatingApp(null); }
  };

  const deleteJob = async (jobId) => {
    if (!window.confirm('Delete this job and all its applications?')) return;
    try {
      await jobAPI.remove(jobId);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      toast.success('Job deleted.');
    } catch { toast.error('Failed to delete.'); }
  };

  const totalApps = jobs.reduce((sum, j) => sum + (j.applicationCount || 0), 0);
  const activeJobs = jobs.filter((j) => j.isActive).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={FiBriefcase}  label="Total Jobs"     value={jobs.length}  color="indigo" />
        <StatCard icon={FiToggleRight} label="Active Jobs"   value={activeJobs}   color="emerald"/>
        <StatCard icon={FiUsers}      label="Total Applicants" value={totalApps}  color="violet" />
        <StatCard icon={FiTrendingUp} label="Avg. Apps/Job"  value={jobs.length ? (totalApps/jobs.length).toFixed(1) : 0} color="amber" />
      </div>

      {/* Quick action */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Your Job Listings</h2>
        <Link to="/post-job" className="btn-primary">
          <FiPlusCircle className="w-4 h-4" /> Post a Job
        </Link>
      </div>

      {loading ? <Spinner /> : jobs.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-4">📋</p>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-white mb-2">No jobs posted yet</h3>
          <p className="text-slate-500 mb-5">Post your first job listing to start receiving applications.</p>
          <Link to="/post-job" className="btn-primary">Post Your First Job</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job._id} className="card overflow-hidden">
              {/* Job row */}
              <div className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  {job.company?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-white">{job.title}</h3>
                      <p className="text-sm text-slate-500">{job.company} · {job.location} · {job.jobType}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`badge text-xs ${job.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {job.isActive ? '● Active' : '○ Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <FiUsers className="w-3.5 h-3.5" /> {job.applicationCount} applicants
                    </span>
                    <span className="text-xs text-slate-400">
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                    {/* Actions */}
                    <div className="ml-auto flex items-center gap-1">
                      <button onClick={() => loadApplicants(job._id)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-medium transition-colors">
                        <FiUsers className="w-3.5 h-3.5" />
                        {expandedJob === job._id ? 'Hide' : 'View'} Applicants
                        <FiChevronRight className={`w-3 h-3 transition-transform ${expandedJob === job._id ? 'rotate-90' : ''}`} />
                      </button>
                      <Link to={`/jobs/${job._id}/edit`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                        <FiEdit className="w-4 h-4" />
                      </Link>
                      <button onClick={() => deleteJob(job._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Applicants panel */}
              {expandedJob === job._id && (
                <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  {!applicants[job._id] ? (
                    <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"/></div>
                  ) : applicants[job._id].length === 0 ? (
                    <p className="text-center py-6 text-sm text-slate-500">No applications yet for this job.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                      {applicants[job._id].map((app) => (
                        <div key={app._id} className="px-5 py-4 flex items-start gap-4 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm flex-shrink-0">
                            {app.userId?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div>
                                <p className="font-medium text-slate-800 dark:text-white text-sm">{app.userId?.name}</p>
                                <p className="text-xs text-slate-500">{app.userId?.email}</p>
                                {app.userId?.skills?.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {app.userId.skills.slice(0,4).map((s) => (
                                      <span key={s} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs">{s}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <StatusBadge status={app.status} />
                                <select
                                  value={app.status}
                                  disabled={updatingApp === app._id}
                                  onChange={(e) => updateStatus(app._id, e.target.value, job._id)}
                                  className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer">
                                  {['applied','reviewing','selected','rejected'].map((s) => (
                                    <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            {app.coverLetter && (
                              <p className="text-xs text-slate-500 mt-2 line-clamp-2 italic">"{app.coverLetter}"</p>
                            )}
                            {app.resume && (
                              <a href={app.resume} target="_blank" rel="noopener noreferrer"
                                className="text-xs text-indigo-500 hover:underline mt-1 inline-block">📎 View Resume</a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── User Dashboard ────────────────────────────────────────────────────────────
const UserDashboard = ({ user }) => {
  const [apps,    setApps]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await applicationAPI.getMyApps();
        setApps(data.applications);
      } catch { toast.error('Failed to load applications.'); }
      finally  { setLoading(false); }
    })();
  }, []);

  const statusCount = (s) => apps.filter((a) => a.status === s).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={FiFileText}   label="Total Applied"   value={apps.length}          color="indigo" />
        <StatCard icon={FiClock}      label="Under Review"    value={statusCount('reviewing')} color="amber" />
        <StatCard icon={FiCheckCircle}label="Selected"        value={statusCount('selected')}  color="emerald"/>
        <StatCard icon={FiXCircle}    label="Rejected"        value={statusCount('rejected')}  color="rose"  />
      </div>

      {/* Tips banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-bold mb-1">🚀 Ready to apply?</h3>
          <p className="text-indigo-100 text-sm">Browse thousands of fresh opportunities updated daily.</p>
        </div>
        <Link to="/jobs" className="flex-shrink-0 px-4 py-2 bg-white text-indigo-700 font-bold rounded-xl text-sm hover:bg-yellow-50 transition-colors">
          Browse Jobs
        </Link>
      </div>

      {/* Recent applications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Recent Applications</h2>
          <Link to="/applications" className="text-sm text-indigo-600 hover:underline font-medium">View all →</Link>
        </div>

        {loading ? <Spinner /> : apps.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-5xl mb-4">📨</p>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-white mb-2">No applications yet</h3>
            <p className="text-slate-500 mb-5">Start applying to jobs you love and track your progress here.</p>
            <Link to="/jobs" className="btn-primary">Find Jobs</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {apps.slice(0, 5).map((app) => (
              <Link key={app._id} to={`/jobs/${app.jobId?._id}`}
                className="card p-4 flex items-center gap-4 hover:border-indigo-200 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-sm">
                  {app.jobId?.company?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 dark:text-white text-sm group-hover:text-indigo-600 transition-colors truncate">
                    {app.jobId?.title || 'Job Deleted'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {app.jobId?.company} · {app.jobId?.location}
                  </p>
                </div>
                <div className="flex-shrink-0"><StatusBadge status={app.status} /></div>
                <p className="text-xs text-slate-400 flex-shrink-0 hidden sm:block">
                  {new Date(app.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Profile completion hint */}
      <div className="card p-5 bg-amber-50 border-amber-100">
        <h3 className="font-semibold text-amber-800 mb-1 text-sm">💡 Complete Your Profile</h3>
        <p className="text-amber-700 text-xs mb-3">A complete profile with skills and bio increases your chances of getting selected.</p>
        <Link to="/profile" className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline">Update Profile →</Link>
      </div>
    </div>
  );
};

// ── Admin Dashboard ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await applicationAPI.getAll();
        setApps(data.applications);
      } catch { toast.error('Failed to load data.'); }
      finally  { setLoading(false); }
    })();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="card p-6 bg-gradient-to-r from-slate-800 to-slate-900 text-white border-none">
        <h2 className="font-bold text-lg mb-1">👑 Admin Overview</h2>
        <p className="text-slate-300 text-sm">You have full access to manage all platform data.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={FiFileText} label="Total Applications" value={apps.length} color="indigo" />
        <StatCard icon={FiCheckCircle} label="Selected" value={apps.filter(a=>a.status==='selected').length} color="emerald" />
        <StatCard icon={FiXCircle} label="Rejected" value={apps.filter(a=>a.status==='rejected').length} color="rose" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">All Applications</h2>
        {loading ? <Spinner /> : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    {['Applicant','Job','Company','Status','Applied On'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                  {apps.slice(0, 20).map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800 dark:text-white">{app.userId?.name}</p>
                        <p className="text-xs text-slate-400">{app.userId?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{app.jobId?.title}</td>
                      <td className="px-4 py-3 text-slate-500">{app.jobId?.company}</td>
                      <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{new Date(app.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const roleLabel = { admin: '👑 Admin', recruiter: '🏢 Recruiter', user: '👤 Job Seeker' };

  return (
    <div className="container-app py-10">
      {/* Welcome header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-indigo-200">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              {greet()}, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full">
              {roleLabel[user?.role]}
            </span>
          </div>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm ml-15">
          {user?.role === 'recruiter' ? 'Manage your job listings and review applicants.' :
           user?.role === 'admin'     ? 'Full system access — manage users, jobs, and applications.' :
           'Track your applications and discover new opportunities.'}
        </p>
      </div>

      {/* Role-based content */}
      {user?.role === 'recruiter' && <RecruiterDashboard user={user} />}
      {user?.role === 'user'      && <UserDashboard      user={user} />}
      {user?.role === 'admin'     && <AdminDashboard />}
    </div>
  );
}
