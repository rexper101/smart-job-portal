import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiBriefcase, FiPlus, FiX } from 'react-icons/fi';

const JOB_TYPES    = ['Full-time','Part-time','Remote','Internship','Contract'];
const CATEGORIES   = ['Technology','Design','Marketing','Sales','Finance','Healthcare','Education','Engineering','HR','Other'];
const EXP_LEVELS   = ['Entry Level','Mid Level','Senior Level','Executive'];

export default function PostJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [reqInput, setReqInput] = useState('');

  const [form, setForm] = useState({
    title: '', company: '', location: '', salary: '', description: '',
    requirements: [], jobType: 'Full-time', category: 'Technology',
    experienceLevel: 'Entry Level', deadline: '',
  });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addRequirement = () => {
    const trimmed = reqInput.trim();
    if (trimmed && !form.requirements.includes(trimmed)) {
      setForm({ ...form, requirements: [...form.requirements, trimmed] });
      setReqInput('');
    }
  };

  const removeRequirement = (i) => {
    setForm({ ...form, requirements: form.requirements.filter((_, idx) => idx !== i) });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.company || !form.location || !form.description) {
      toast.error('Please fill in all required fields.'); return;
    }
    if (form.description.length < 30) {
      toast.error('Description must be at least 30 characters.'); return;
    }
    try {
      setLoading(true);
      const { data } = await jobAPI.create(form);
      toast.success('Job posted successfully! 🎉');
      navigate(`/jobs/${data.job._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app py-10 max-w-3xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <FiBriefcase className="w-8 h-8 text-indigo-600" /> Post a New Job
        </h1>
        <p className="text-slate-500 mt-1">Fill in the details to attract the best candidates.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-slate-800 dark:text-white text-base border-b border-slate-100 pb-3">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Job Title <span className="text-red-500">*</span></label>
              <input name="title" value={form.title} onChange={onChange} placeholder="e.g. Frontend Developer" className="form-input" required />
            </div>
            <div>
              <label className="form-label">Company Name <span className="text-red-500">*</span></label>
              <input name="company" value={form.company} onChange={onChange} placeholder="e.g. Acme Corp" className="form-input" required />
            </div>
            <div>
              <label className="form-label">Location <span className="text-red-500">*</span></label>
              <input name="location" value={form.location} onChange={onChange} placeholder="e.g. Mumbai, India" className="form-input" required />
            </div>
            <div>
              <label className="form-label">Salary</label>
              <input name="salary" value={form.salary} onChange={onChange} placeholder="e.g. ₹8-12 LPA" className="form-input" />
            </div>
          </div>
        </div>

        {/* Classification */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-slate-800 dark:text-white text-base border-b border-slate-100 pb-3">Job Classification</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Job Type</label>
              <select name="jobType" value={form.jobType} onChange={onChange} className="form-input">
                {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Category</label>
              <select name="category" value={form.category} onChange={onChange} className="form-input">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Experience Level</label>
              <select name="experienceLevel" value={form.experienceLevel} onChange={onChange} className="form-input">
                {EXP_LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="form-label">Application Deadline <span className="text-slate-400 font-normal">(optional)</span></label>
            <input type="date" name="deadline" value={form.deadline} onChange={onChange}
              min={new Date().toISOString().split('T')[0]} className="form-input max-w-xs" />
          </div>
        </div>

        {/* Description */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-slate-800 dark:text-white text-base border-b border-slate-100 pb-3">Job Details</h2>
          <div>
            <label className="form-label">Job Description <span className="text-red-500">*</span></label>
            <textarea name="description" value={form.description} onChange={onChange} rows={7}
              placeholder="Describe the role, responsibilities, and what a typical day looks like..."
              className="form-input resize-none" required />
            <p className="text-xs text-slate-400 mt-1">{form.description.length} characters (min 30)</p>
          </div>

          {/* Requirements */}
          <div>
            <label className="form-label">Requirements <span className="text-slate-400 font-normal">(optional)</span></label>
            <div className="flex gap-2">
              <input value={reqInput} onChange={(e) => setReqInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                placeholder="e.g. 3+ years of React experience" className="form-input flex-1" />
              <button type="button" onClick={addRequirement} className="btn-secondary">
                <FiPlus className="w-4 h-4" />
              </button>
            </div>
            {form.requirements.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.requirements.map((req, i) => (
                  <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-sm border border-indigo-100">
                    {req}
                    <button type="button" onClick={() => removeRequirement(i)} className="hover:text-red-500">
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 py-3">
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Posting...
              </span>
            ) : '🚀 Post Job'}
          </button>
        </div>
      </form>
    </div>
  );
}
