/**
 * JobDetail Page
 * Full job description with apply modal for logged-in users
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobAPI, applicationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';
import {
  FiMapPin, FiDollarSign, FiClock, FiBriefcase, FiUsers,
  FiArrowLeft, FiSend, FiX, FiCheckCircle, FiEdit, FiTrash2,
} from 'react-icons/fi';

const jobTypeColors = {
  'Full-time':'bg-emerald-100 text-emerald-700','Part-time':'bg-sky-100 text-sky-700',
  'Remote':'bg-violet-100 text-violet-700','Internship':'bg-amber-100 text-amber-700','Contract':'bg-orange-100 text-orange-700',
};

export default function JobDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [job,       setJob]       = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [applied,   setApplied]   = useState(false);
  const [form,      setForm]      = useState({ resume: '', coverLetter: '' });
  const [submitting,setSubmitting]= useState(false);
  const [deleting,  setDeleting]  = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await jobAPI.getById(id);
        setJob(data.job);
      } catch {
        toast.error('Job not found.');
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await applicationAPI.apply({ jobId: id, ...form });
      setApplied(true);
      setShowModal(false);
      toast.success('Application submitted! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this job? This cannot be undone.')) return;
    try {
      setDeleting(true);
      await jobAPI.remove(id);
      toast.success('Job deleted successfully.');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to delete job.');
    } finally {
      setDeleting(false);
    }
  };

  const isOwner = user && job && (user._id === job.postedBy?._id || user.role === 'admin');
  const canApply = isAuthenticated && user?.role === 'user' && !applied;

  if (loading) return <Spinner fullscreen />;
  if (!job)    return null;

  return (
    <div className="container-app py-10 animate-fade-in max-w-5xl">
      {/* Back */}
      <Link to="/jobs" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
        <FiArrowLeft className="w-4 h-4" /> Back to Jobs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main Content ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header card */}
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                  {job.company?.charAt(0)}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800 dark:text-white">{job.title}</h1>
                  <p className="text-slate-500 text-sm">{job.company} · {job.category}</p>
                </div>
              </div>
              {isOwner && (
                <div className="flex gap-2">
                  <Link to={`/jobs/${id}/edit`} className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                    <FiEdit className="w-4 h-4" />
                  </Link>
                  <button onClick={handleDelete} disabled={deleting} className="p-2 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-slate-500 mb-4">
              <span className="flex items-center gap-1.5"><FiMapPin className="w-4 h-4 text-indigo-400" />{job.location}</span>
              <span className="flex items-center gap-1.5"><FiDollarSign className="w-4 h-4 text-emerald-400" />{job.salary || 'Not Disclosed'}</span>
              <span className="flex items-center gap-1.5"><FiUsers className="w-4 h-4 text-rose-400" />{job.applicationCount} applicants</span>
              <span className="flex items-center gap-1.5"><FiClock className="w-4 h-4 text-amber-400" />
                {new Date(job.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={`badge ${jobTypeColors[job.jobType] || 'bg-slate-100 text-slate-600'}`}>{job.jobType}</span>
              <span className="badge bg-indigo-100 text-indigo-700">{job.experienceLevel}</span>
              {job.deadline && (
                <span className="badge bg-red-100 text-red-600">Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="card p-6">
            <h2 className="font-semibold text-slate-800 dark:text-white mb-3 text-lg">Job Description</h2>
            <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
              {job.description}
            </div>
          </div>

          {/* Requirements */}
          {job.requirements?.length > 0 && (
            <div className="card p-6">
              <h2 className="font-semibold text-slate-800 dark:text-white mb-3 text-lg">Requirements</h2>
              <ul className="space-y-2">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <FiCheckCircle className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">
          {/* Apply card */}
          <div className="card p-5 sticky top-20">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Apply for this Position</h3>

            {applied ? (
              <div className="text-center py-4">
                <p className="text-3xl mb-2">🎉</p>
                <p className="text-sm font-semibold text-emerald-600">Application Submitted!</p>
                <Link to="/applications" className="btn-secondary mt-3 w-full">View My Applications</Link>
              </div>
            ) : !isAuthenticated ? (
              <div className="text-center">
                <p className="text-sm text-slate-500 mb-3">Sign in to apply for this job</p>
                <Link to="/login" className="btn-primary w-full">Sign In to Apply</Link>
                <Link to="/register" className="btn-secondary w-full mt-2">Create Account</Link>
              </div>
            ) : user?.role !== 'user' ? (
              <p className="text-sm text-slate-500 text-center">Only Job Seekers can apply for jobs.</p>
            ) : (
              <button onClick={() => setShowModal(true)} className="btn-primary w-full py-3">
                <FiSend className="w-4 h-4" /> Apply Now
              </button>
            )}

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 space-y-2 text-xs text-slate-500">
              <div className="flex justify-between"><span>Posted by</span><span className="font-medium">{job.postedBy?.name}</span></div>
              <div className="flex justify-between"><span>Job Type</span><span className="font-medium">{job.jobType}</span></div>
              <div className="flex justify-between"><span>Experience</span><span className="font-medium">{job.experienceLevel}</span></div>
              <div className="flex justify-between"><span>Category</span><span className="font-medium">{job.category}</span></div>
            </div>
          </div>

          {/* Recruiter actions */}
          {isOwner && (
            <div className="card p-5">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-3 text-sm">Recruiter Actions</h3>
              <Link to={`/jobs/${id}/edit`} className="btn-secondary w-full mb-2">Edit Job</Link>
              <Link to={`/dashboard?job=${id}`} className="btn-primary w-full">View Applicants</Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Apply Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
              <h2 className="font-bold text-slate-800 dark:text-white">Apply: {job.title}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleApply} className="p-5 space-y-4">
              <div>
                <label className="form-label">Resume URL <span className="text-slate-400 font-normal">(optional)</span></label>
                <input type="url" value={form.resume} onChange={(e) => setForm({ ...form, resume: e.target.value })}
                  placeholder="https://your-resume-link.com" className="form-input" />
                <p className="text-xs text-slate-400 mt-1">Link to your LinkedIn profile, Google Drive, or portfolio.</p>
              </div>
              <div>
                <label className="form-label">Cover Letter <span className="text-slate-400 font-normal">(optional)</span></label>
                <textarea value={form.coverLetter} onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
                  rows={4} maxLength={1000} placeholder="Tell the recruiter why you're a great fit..."
                  className="form-input resize-none" />
                <p className="text-xs text-slate-400 mt-1">{form.coverLetter.length}/1000</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</span> : <><FiSend className="w-4 h-4" /> Submit Application</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
