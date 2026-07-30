const express = require('express');
const {
  getAdminDashboard,
  getCompanies,
  approveCompany,
  rejectCompany,
  deleteCompany,
  getStudents,
  deleteStudent,
  createAnnouncement,
  getAnnouncements,
  getPlacementReports,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Announcements can be viewed by all users
router.get('/announcements', getAnnouncements);

// Administrative restricted routes
router.use(authorize('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/companies', getCompanies);
router.put('/companies/:id/approve', approveCompany);
router.put('/companies/:id/reject', rejectCompany);
router.delete('/companies/:id', deleteCompany);
router.get('/students', getStudents);
router.delete('/students/:id', deleteStudent);
router.post('/announcements', createAnnouncement);
router.get('/reports', getPlacementReports);

module.exports = router;

