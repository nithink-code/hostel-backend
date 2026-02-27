const Complaint = require('../models/Complaint');

// @desc    Submit a new complaint
// @route   POST /api/complaints
// @access  Private (Student)
const createComplaint = async (req, res) => {
    try {
        const { title, description, category, priority } = req.body;

        const complaint = await Complaint.create({
            student: req.user._id,
            title,
            description,
            category,
            priority: priority || 'Medium',
            roomNumber: req.user.roomNumber,
            hostelBlock: req.user.hostelBlock,
        });

        await complaint.populate('student', 'name email roomNumber hostelBlock');

        res.status(201).json({
            success: true,
            message: 'Complaint submitted successfully',
            complaint,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get complaints for logged-in student
// @route   GET /api/complaints/my
// @access  Private (Student)
const getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ student: req.user._id })
            .populate('student', 'name email roomNumber hostelBlock')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: complaints.length, complaints });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single complaint by ID (student can only view their own)
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id).populate(
            'student',
            'name email roomNumber hostelBlock'
        );

        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }

        // Students can only view their own complaints
        if (
            req.user.role === 'student' &&
            complaint.student._id.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        res.status(200).json({ success: true, complaint });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all complaints (Admin)
// @route   GET /api/complaints
// @access  Private (Admin)
const getAllComplaints = async (req, res) => {
    try {
        const { category, status, priority } = req.query;

        const filter = {};
        if (category) filter.category = category;
        if (status) filter.status = status;
        if (priority) filter.priority = priority;

        const complaints = await Complaint.find(filter)
            .populate('student', 'name email roomNumber hostelBlock')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: complaints.length, complaints });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update complaint status and remark (Admin)
// @route   PUT /api/complaints/:id
// @access  Private (Admin)
const updateComplaint = async (req, res) => {
    try {
        const { status, adminRemark } = req.body;

        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }

        if (status) complaint.status = status;
        if (adminRemark !== undefined) complaint.adminRemark = adminRemark;

        await complaint.save();
        await complaint.populate('student', 'name email roomNumber hostelBlock');

        res.status(200).json({
            success: true,
            message: 'Complaint updated successfully',
            complaint,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get complaint statistics (Admin)
// @route   GET /api/complaints/stats
// @access  Private (Admin)
const getComplaintStats = async (req, res) => {
    try {
        const total = await Complaint.countDocuments();
        const pending = await Complaint.countDocuments({ status: 'Pending' });
        const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
        const resolved = await Complaint.countDocuments({ status: 'Resolved' });
        const rejected = await Complaint.countDocuments({ status: 'Rejected' });

        const byCategory = await Complaint.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        const byPriority = await Complaint.aggregate([
            { $group: { _id: '$priority', count: { $sum: 1 } } },
        ]);

        res.status(200).json({
            success: true,
            stats: {
                total,
                pending,
                inProgress,
                resolved,
                rejected,
                byCategory,
                byPriority,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createComplaint,
    getMyComplaints,
    getComplaintById,
    getAllComplaints,
    updateComplaint,
    getComplaintStats,
};
