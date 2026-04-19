/**
 * Job Routes
 * GET    /api/jobs           - Get all jobs (public, with filters)
 * GET    /api/jobs/my-jobs   - Get recruiter's own jobs (private)
 * GET    /api/jobs/:id       - Get single job (public)
 * POST   /api/jobs           - Create job (recruiter/admin)
 * PUT    /api/jobs/:id       - Update job (recruiter/admin)
 * DELETE /api/jobs/:id       - Delete job (recruiter/admin)
 */

const express = require('express');
const router = express.Router();
const {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
} = require('../controllers/jobController');
const { protect }   = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// Public routes
router.get('/', getAllJobs);
router.get('/:id', getJobById);

// Private routes (authenticated)
router.get('/recruiter/my-jobs', protect, authorize('recruiter', 'admin'), getMyJobs);
router.post('/',    protect, authorize('recruiter', 'admin'), createJob);
router.put('/:id',  protect, authorize('recruiter', 'admin'), updateJob);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJob);

module.exports = router;
