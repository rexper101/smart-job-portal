/**
 * Job Controller
 * Full CRUD operations for job listings
 */

const Job = require('../models/Job');
const Application = require('../models/Application');

// ─── Get All Jobs (with search, filter, pagination) ───────────────────────────
/**
 * @desc    Get all active job listings with optional filters
 * @route   GET /api/jobs
 * @access  Public
 */
const getAllJobs = async (req, res) => {
  try {
    const { search, location, jobType, category, experienceLevel, page = 1, limit = 9 } = req.query;

    const query = { isActive: true };

    // Full-text search using MongoDB text index
    if (search) {
      query.$text = { $search: search };
    }

    // Location filter (case-insensitive)
    if (location && location.trim()) {
      query.location = { $regex: location.trim(), $options: 'i' };
    }

    // Exact enum filters
    if (jobType)         query.jobType = jobType;
    if (category)        query.category = category;
    if (experienceLevel) query.experienceLevel = experienceLevel;

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Job.countDocuments(query);

    const jobs = await Job.find(query)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: jobs.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      jobs,
    });
  } catch (error) {
    console.error('Get Jobs Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Single Job ───────────────────────────────────────────────────────────
/**
 * @desc    Get a single job by ID
 * @route   GET /api/jobs/:id
 * @access  Public
 */
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Create Job ───────────────────────────────────────────────────────────────
/**
 * @desc    Post a new job listing
 * @route   POST /api/jobs
 * @access  Private (Recruiter / Admin)
 */
const createJob = async (req, res) => {
  try {
    const { title, company, location, salary, description, requirements, jobType, category, experienceLevel, deadline } = req.body;

    if (!title || !company || !location || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title, company, location, and description are required.',
      });
    }

    const job = await Job.create({
      title,
      company,
      location,
      salary: salary || 'Not Disclosed',
      description,
      requirements: requirements || [],
      jobType: jobType || 'Full-time',
      category: category || 'Technology',
      experienceLevel: experienceLevel || 'Entry Level',
      deadline: deadline || null,
      postedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Job posted successfully! 🎉',
      job,
    });
  } catch (error) {
    console.error('Create Job Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Job ───────────────────────────────────────────────────────────────
/**
 * @desc    Update a job listing
 * @route   PUT /api/jobs/:id
 * @access  Private (Owner Recruiter / Admin)
 */
const updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    // Only the recruiter who posted it (or admin) can update
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this job.' });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('postedBy', 'name email');

    res.json({ success: true, message: 'Job updated successfully!', job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete Job ───────────────────────────────────────────────────────────────
/**
 * @desc    Delete a job listing and all its applications
 * @route   DELETE /api/jobs/:id
 * @access  Private (Owner Recruiter / Admin)
 */
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this job.' });
    }

    await job.deleteOne();
    // Cascade delete all applications for this job
    await Application.deleteMany({ jobId: req.params.id });

    res.json({ success: true, message: 'Job deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get My Posted Jobs (Recruiter) ──────────────────────────────────────────
/**
 * @desc    Get all jobs posted by the logged-in recruiter
 * @route   GET /api/jobs/my-jobs
 * @access  Private (Recruiter / Admin)
 */
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllJobs, getJobById, createJob, updateJob, deleteJob, getMyJobs };
