const express = require('express');
const router = express.Router();
const {
    createComplaint,
    getMyComplaints,
    getComplaintById,
    getAllComplaints,
    updateComplaint,
    getComplaintStats,
    getLeaderboard,
} = require('../controllers/complaintController');
const { protect, adminOnly } = require('../middleware/auth');

// Student routes
router.post('/', protect, createComplaint);
router.get('/my', protect, getMyComplaints);

// Admin routes
router.get('/stats', protect, adminOnly, getComplaintStats);
router.get('/leaderboard', protect, adminOnly, getLeaderboard);
router.get('/', protect, adminOnly, getAllComplaints);
router.put('/:id', protect, adminOnly, updateComplaint);

// Shared route (role checked inside controller)
router.get('/:id', protect, getComplaintById);

module.exports = router;
