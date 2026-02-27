const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            maxlength: [1000, 'Description cannot exceed 1000 characters'],
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: [
                'Plumbing',
                'Electrical',
                'Furniture',
                'Cleaning',
                'Internet/WiFi',
                'Pest Control',
                'Security',
                'Other',
            ],
        },
        priority: {
            type: String,
            required: [true, 'Priority is required'],
            enum: ['Low', 'Medium', 'High', 'Urgent'],
            default: 'Medium',
        },
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
            default: 'Pending',
        },
        adminRemark: {
            type: String,
            trim: true,
            maxlength: [500, 'Remark cannot exceed 500 characters'],
        },
        resolvedAt: {
            type: Date,
        },
        roomNumber: {
            type: String,
            trim: true,
        },
        hostelBlock: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

// Middleware: set resolvedAt when status changes to Resolved
ComplaintSchema.pre('save', function (next) {
    if (this.isModified('status') && this.status === 'Resolved' && !this.resolvedAt) {
        this.resolvedAt = new Date();
    }
    next();
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
