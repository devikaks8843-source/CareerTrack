const express = require('express');
const {
  getApplications,
  getApplicationById,
  applyToJob,
  updateApplication,
  addInterviewRound,
  deleteApplication,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', getApplications);
router.get('/:id', getApplicationById);
router.post('/apply', authorize('student'), applyToJob);
router.put('/:id', authorize('student', 'company', 'admin'), updateApplication);
router.post('/:id/round', authorize('company', 'admin'), addInterviewRound);
router.delete('/:id', authorize('student', 'company', 'admin'), deleteApplication);

module.exports = router;
