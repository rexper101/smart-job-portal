const express = require('express');
const router = express.Router();
const {
  applyForJob, getMyApplications, getJobApplications,
  updateApplicationStatus, deleteApplication, getAllApplications,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.post('/',           protect, applyForJob);
router.get('/my',          protect, getMyApplications);
router.get('/job/:jobId',  protect, getJobApplications);
router.get('/',            protect, authorize('admin'), getAllApplications);
router.put('/:id',         protect, updateApplicationStatus);
router.delete('/:id',      protect, deleteApplication);

module.exports = router;