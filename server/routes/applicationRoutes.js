const express = require('express');
const router = express.Router();
const {
  applyForJob, getMyApplications, getJobApplications,
  updateApplicationStatus, deleteApplication, getAllApplications,
} = require('../controllers/applicationController');
const { protect }   = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.post('/',           protect, authorize('user'), applyForJob);
router.get('/my',          protect, authorize('user'), getMyApplications);
router.get('/job/:jobId',  protect, authorize('recruiter', 'admin'), getJobApplications);
router.get('/',            protect, authorize('admin'), getAllApplications);
router.put('/:id',         protect, authorize('recruiter', 'admin'), updateApplicationStatus);
router.delete('/:id',      protect, authorize('recruiter', 'admin'), deleteApplication);

module.exports = router;