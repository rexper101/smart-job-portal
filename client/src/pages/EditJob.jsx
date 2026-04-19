import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jobAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiX } from 'react-icons/fi';

const JOB_TYPES  = ['Full-time','Part-time','Remote','Internship','Contract'];
const CATEGORIES = ['Technology','Design','Marketing','Sales','Finance','Healthcare','Education','Engineering','HR','Other'];
const EXP_LEVELS = ['Entry Level','Mid Level','Senior Level','Executive'];

export default function EditJob() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching,setFetching]= useState(true);
  const [reqInput,setReqInput]= useState('');
  const [form, setForm]       = useState({
    title:'',company:'',location:'',salary:'',description:'',
    requirements:[],jobType:'Full-time',category:'Technology',
    experienceLevel:'Entry Level',deadline:'',isActive:true,
  });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await jobAPI.getById(id);
        const job = data.job;
        setForm({
          title: job.title, company: job.company, location: job.location,
          salary: job.salary || '', description: job.description,
          requirements: job.requirements || [], jobType: job.jobType,
          category: job.category, experienceLevel: job.experienceLevel,
          deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
          isActive: job.isActive,
        });
      } catch { toast.error('Failed to load job.'); navigate('/dashboard'); }
      finally   { setFetching(false); }
    })();
  }, [id, navigate]);

  const onChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const addReq = () => {
    const t = reqInput.trim();
    if (t && !form.requirements.includes(t)) { setForm({ ...form, requirements:[...form.requirements,t] }); setReqInput(''); }
  };

  const removeReq = (i) => setForm({ ...form, requirements: form.requirements.filter((_,idx) => idx !== i) });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await jobAPI.update(id, form);
      toast.success('Job updated successfully!');
      navigate(`/jobs/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update.');
    } finally { setLoading(false); }
  };

  if (fetching) return <div className="flex justify-center items-center min-h-64"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"/></div>;

  return (
    <div className="container-app py-10 max-w-3xl animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-8">Edit Job</h1>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-slate-800 dark:text-white border-b border-slate-100 pb-3">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[['title','Job Title'],['company','Company'],['location','Location'],['salary','Salary']].map(([name, label]) => (
              <div key={name}>
                <label className="form-label">{label}</label>
                <input name={name} value={form[name]} onChange={onChange} className="form-input" />
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-slate-800 dark:text-white border-b border-slate-100 pb-3">Classification</h2>
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
          <div className="flex items-center gap-3">
            <input type="checkbox" id="isActive" name="isActive" checked={form.isActive} onChange={onChange}
              className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer" />
            <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">
              Job is active (visible to applicants)
            </label>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-slate-800 dark:text-white border-b border-slate-100 pb-3">Job Details</h2>
          <div>
            <label className="form-label">Description</label>
            <textarea name="description" value={form.description} onChange={onChange} rows={7} className="form-input resize-none" />
          </div>
          <div>
            <label className="form-label">Requirements</label>
            <div className="flex gap-2">
              <input value={reqInput} onChange={(e) => setReqInput(e.target.value)}
                onKeyDown={(e) => e.key==='Enter' && (e.preventDefault(), addReq())}
                placeholder="Add a requirement..." className="form-input flex-1" />
              <button type="button" onClick={addReq} className="btn-secondary"><FiPlus className="w-4 h-4" /></button>
            </div>
            {form.requirements.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.requirements.map((req, i) => (
                  <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-sm border border-indigo-100">
                    {req} <button type="button" onClick={() => removeReq(i)}><FiX className="w-3 h-3 hover:text-red-500" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(`/jobs/${id}`)} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 py-3">
            {loading ? 'Saving...' : '✅ Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
