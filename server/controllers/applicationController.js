/**
 * Application Controller
 * Handles job applications: apply, view, update status, delete
 */

const Application = require('../models/Application');
const Job = require('../models/Job');

// ─── Apply for a Job ──────────────────────────────────────────────────────────
/**
 * @desc    Submit a job application
 * @route   POST /api/applications
 * @access  Private (User / Job Seeker)
 */
const applyForJob = async (req, res) => {
  try {
    const { jobId, resume, coverLetter } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Job ID is required.' });
    }

    // Verify job exists and is still active
    const job = await Job.findById(jobId);
    if (!job || !job.isActive) {
      return res.status(404).json({ success: false, message: 'Job not found or is no longer accepting applications.' });
    }

    // Prevent recruiter/admin from applying to their own jobs
    if (job.postedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot apply to your own job posting.' });
    }

    // Check for duplicate application
    const existingApp = await Application.findOne({ userId: req.user._id, jobId });
    if (existingApp) {
      return res.status(409).json({ success: false, message: 'You have already applied for this job.' });
    }

    const application = await Application.create({
      userId: req.user._id,
      jobId,
      resume: resume || '',
      coverLetter: coverLetter || '',
    });

    // Increment the job's application counter
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

    await application.populate('jobId', 'title company location jobType');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! 🎉 Good luck!',
      application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'You have already applied for this job.' });
    }
    console.error('Apply Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get My Applications (Job Seeker) ─────────────────────────────────────────
/**
 * @desc    Get all applications submitted by the current user
 * @route   GET /api/applications/my
 * @access  Private (User)
 */
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user._id })
      .populate('jobId', 'title company location salary jobType category isActive')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Applications for a Job (Recruiter) ───────────────────────────────────
/**
 * @desc    Get all applicants for a specific job
 * @route   GET /api/applications/job/:jobId
 * @access  Private (Recruiter / Admin)
 */
const getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    // Only the recruiter who owns the job (or admin) can view applicants
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view these applications.' });
    }

    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('userId', 'name email bio skills location phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Application Status (Recruiter) ────────────────────────────────────
/**
 * @desc    Update the status of an application (reviewing/selected/rejected)
 * @route   PUT /api/applications/:id
 * @access  Private (Recruiter / Admin)
 */
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['applied', 'reviewing', 'selected', 'rejected'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}.`,
      });
    }

    const application = await Application.findById(req.params.id).populate('jobId');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Verify recruiter ownership of the job
    if (application.jobId.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this application.' });
    }

    application.status = status;
    await application.save();

    res.json({
      success: true,
      message: `Application status updated to "${status}".`,
      application,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Withdraw Application (User) ─────────────────────────────────────────────
/**
 * @desc    Delete / withdraw a job application
 * @route   DELETE /api/applications/:id
 * @access  Private (Applicant / Admin)
 */
const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Only the applicant or an admin can withdraw
    if (application.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to withdraw this application.' });
    }

    await application.deleteOne();
    await Job.findByIdAndUpdate(application.jobId, { $inc: { applicationCount: -1 } });

    res.json({ success: true, message: 'Application withdrawn successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get All Applications (Admin only) ───────────────────────────────────────
/**
 * @desc    Get all applications in the system (Admin only)
 * @route   GET /api/applications
 * @access  Private (Admin)
 */
const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('userId', 'name email')
      .populate('jobId', 'title company')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  deleteApplication,
  getAllApplications,
};
