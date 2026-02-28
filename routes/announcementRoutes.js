const express = require('express');
const router = express.Router();
const {
    createAnnouncement,
    getAnnouncements,
    getAllAnnouncementsAdmin,
    getAnnouncementById,
    updateAnnouncement,
    deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect, adminOnly } = require('../middleware/auth');

// Student + Admin: active, non-expired announcements (filtered by block for students)
router.get('/', protect, getAnnouncements);

// Admin: all announcements including expired
router.get('/all', protect, adminOnly, getAllAnnouncementsAdmin);

// Student + Admin: Create (Admins can target any block, students target their own)
router.post('/', protect, createAnnouncement);
router.get('/:id', protect, getAnnouncementById);
router.put('/:id', protect, adminOnly, updateAnnouncement);
router.delete('/:id', protect, adminOnly, deleteAnnouncement);

module.exports = router;
