const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        loanRequestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'LoanRequest',
            required: [true, 'loanRequestId is required'],
            index: true,
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'senderId is required'],
            // Points to either Customer._id or User._id based on senderType
        },
        senderType: {
            type: String,
            enum: ['customer', 'lender'],
            required: [true, 'senderType is required'],
        },
        text: {
            type: String,
            trim: true,
            maxlength: [5000, 'Message text too long'],
        },
        fileUrl: {
            type: String,
            trim: true,
        },
        fileType: {
            type: String,
            enum: ['image', 'pdf', 'document', 'other'],
        },
    },
    { timestamps: true }
);

// Ensure at least text or fileUrl is provided
messageSchema.pre('save', function (next) {
    if (!this.text && !this.fileUrl) {
        return next(new Error('Message must have either text or a file attachment'));
    }
    next();
});

// Index for fetching messages in a room ordered by time
messageSchema.index({ loanRequestId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
