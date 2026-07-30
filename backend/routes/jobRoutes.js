const express = require('express');
const { createJob, updateJob, deleteJob, getJobs, getJobById } = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getJobs);
router.get('/:id', protect, getJobById);
router.post('/', protect, authorize('company'), createJob);
router.put('/:id', protect, authorize('company'), updateJob);
router.delete('/:id', protect, authorize('company'), deleteJob);

module.exports = router;
