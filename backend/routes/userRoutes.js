const express = require('express');
const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  getNotifications,
  markNotificationRead,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Profile routes (Authenticated)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Notifications routes (Authenticated)
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);

module.exports = router;
