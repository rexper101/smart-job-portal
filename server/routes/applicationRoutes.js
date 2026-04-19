/**
 * Application Routes
 * POST   /api/applications              - Apply for a job (user)
 * GET    /api/applications/my           - Get user's applications (user)
 * GET    /api/applications/job/:jobId   - Get applicants for a job (recruiter/admin)
 * GET    /api/applications              - Get all applications (admin)
 * PUT    /api/applications/:id          - Update application status (recruiter/admin)
 * DELETE /api/applications/:id          - Withdraw application (user/admin)
 */

const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  deleteApplication,
  getAllApplications,
} = require('../controllers/applicationController');
const { protect }   = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.post('/',                   protect, authorize('user'), applyForJob);
router.get('/my',                  protect, authorize('user'), getMyApplications);
router.get('/job/:jobId',          protect, authorize('recruiter', 'admin'), getJobApplications);
router.get('/',                    protect, authorize('admin'), getAllApplications);
router.put('/:id',                 protect, authorize('recruiter', 'admin'), updateApplicationStatus);
router.delete('/:id',              protect, deleteApplication);

module.exports = router;
