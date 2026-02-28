const Announcement = require('../models/Announcement');

// @desc    Create a new announcement
// @route   POST /api/announcements
// @access  Private (Admin only)
const createAnnouncement = async (req, res) => {
    try {
        const { title, description, category, priority, targetBlock, expiryDate } = req.body;

        // Security: Students can only announce to their own block
        let finalTargetBlock = targetBlock;
        if (req.user.role === 'student') {
            finalTargetBlock = req.user.hostelBlock || 'General';
        }

        const announcement = await Announcement.create({
            title,
            description,
            category: category || 'General',
            priority: priority || 'Normal',
            targetBlock: finalTargetBlock || null,
            expiryDate: expiryDate || null,
            createdBy: req.user._id,
        });

        await announcement.populate('createdBy', 'name email role');

        res.status(201).json({
            success: true,
            message: 'Announcement created successfully',
            announcement,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all active, non-expired announcements
// @route   GET /api/announcements
// @access  Private (All)
const getAnnouncements = async (req, res) => {
    try {
        const now = new Date();

        // Build filter: active + not expired
        const filter = {
            isActive: true,
            $or: [
                { expiryDate: null },
                { expiryDate: { $gt: now } },
            ],
        };

        // Students: also filter by targetBlock (null = all, or matching their block)
        if (req.user.role === 'student' && req.user.hostelBlock) {
            filter.$and = [
                {
                    $or: [
                        { targetBlock: null },
                        { targetBlock: req.user.hostelBlock },
                    ],
                },
            ];
        }

        const announcements = await Announcement.find(filter)
            .populate('createdBy', 'name role')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: announcements.length, announcements });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get ALL announcements (including expired) for admin view
// @route   GET /api/announcements/all
// @access  Private (Admin only)
const getAllAnnouncementsAdmin = async (req, res) => {
    try {
        const announcements = await Announcement.find()
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: announcements.length, announcements });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single announcement by ID
// @route   GET /api/announcements/:id
// @access  Private (All)
const getAnnouncementById = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id).populate('createdBy', 'name email');

        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }

        res.status(200).json({ success: true, announcement });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update an announcement
// @route   PUT /api/announcements/:id
// @access  Private (Admin only)
const updateAnnouncement = async (req, res) => {
    try {
        const { title, description, category, priority, targetBlock, expiryDate, isActive } = req.body;

        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }

        if (title !== undefined) announcement.title = title;
        if (description !== undefined) announcement.description = description;
        if (category !== undefined) announcement.category = category;
        if (priority !== undefined) announcement.priority = priority;
        if (targetBlock !== undefined) announcement.targetBlock = targetBlock || null;
        if (expiryDate !== undefined) announcement.expiryDate = expiryDate || null;
        if (isActive !== undefined) announcement.isActive = isActive;

        await announcement.save();
        await announcement.populate('createdBy', 'name email');

        res.status(200).json({
            success: true,
            message: 'Announcement updated successfully',
            announcement,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin only)
const deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndDelete(req.params.id);

        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }

        res.status(200).json({ success: true, message: 'Announcement deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createAnnouncement,
    getAnnouncements,
    getAllAnnouncementsAdmin,
    getAnnouncementById,
    updateAnnouncement,
    deleteAnnouncement,
};
