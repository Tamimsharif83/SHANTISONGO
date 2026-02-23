const mongoose = require('mongoose');

const fixedDepositRequestSchema = new mongoose.Schema({
    // Member submission
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    memberID: { type: String, required: true },
    memberName: { type: String, required: true },

    proposedDuration: { type: Number, required: true }, // months
    amount: { type: Number, required: true },           // in paisa
    memberComment: { type: String, default: '' },

    // Status: pending → acknowledged / rejected
    //         acknowledged → payment_submitted → completed
    status: {
        type: String,
        enum: ['pending', 'acknowledged', 'rejected', 'payment_submitted', 'completed'],
        default: 'pending'
    },

    // Admin acknowledgement
    acknowledgedDuration: { type: Number },   // months (admin can change)
    interestRate: { type: Number },            // percent
    adminComment: { type: String, default: '' },
    acknowledgedBy: { type: String },
    acknowledgedAt: { type: Date },

    // Admin rejection
    rejectedBy: { type: String },
    rejectedAt: { type: Date },
    rejectionReason: { type: String, default: '' },

    // Member payment submission
    paymentMethod: {
        type: String,
        enum: ['bank', 'hand_cash', 'mobile_banking'],
    },
    transactionId: { type: String, default: '' },
    paymentComment: { type: String, default: '' },
    paymentDocument: { type: String, default: '' }, // base64
    paymentSubmittedAt: { type: Date },

    // Completion by admin
    completedBy: { type: String },
    completedAt: { type: Date },

}, { timestamps: true });

// Virtual readable ID
fixedDepositRequestSchema.virtual('requestId').get(function () {
    const year = this.createdAt ? this.createdAt.getFullYear() : new Date().getFullYear();
    const seq = this._id.toString().slice(-5).toUpperCase();
    return `FD-${year}-${seq}`;
});
fixedDepositRequestSchema.set('toJSON', { virtuals: true });
fixedDepositRequestSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('FixedDepositRequest', fixedDepositRequestSchema);
