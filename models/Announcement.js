const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [120, 'Title cannot exceed 120 characters'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: ['Water', 'Electricity', 'Mess', 'Inspection', 'General'],
            default: 'General',
        },
        priority: {
            type: String,
            required: [true, 'Priority is required'],
            enum: ['Normal', 'Important', 'Urgent'],
            default: 'Normal',
        },
        targetBlock: {
            type: String,
            trim: true,
            default: null, // null = all students
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        expiryDate: {
            type: Date,
            default: null, // null = never expires
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// Virtual: check if announcement is currently active and not expired
AnnouncementSchema.virtual('isExpired').get(function () {
    if (!this.expiryDate) return false;
    return new Date() > this.expiryDate;
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);
