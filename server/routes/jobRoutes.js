const express = require('express');
const router = express.Router();
const { getAllJobs, getJobById, createJob, updateJob, deleteJob, getMyJobs } = require('../controllers/jobController');
const { protect } = require('../middleware/auth');

router.get('/',                   getAllJobs);
router.get('/:id',                getJobById);
router.get('/recruiter/my-jobs',  protect, getMyJobs);
router.post('/',                  protect, createJob);
router.put('/:id',                protect, updateJob);
router.delete('/:id',             protect, deleteJob);

module.exports = router;