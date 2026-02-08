const mongoose = require('mongoose');

const investmentRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    memberID: {
        type: String,
        required: true
    },
    memberName: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    purpose: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true,
        min: 1
    },
    bankName: {
        type: String,
        required: true
    },
    bankBranch: {
        type: String,
        required: true
    },
    bankAccountNo: {
        type: String,
        required: true
    },
    bankAccountType: {
        type: String,
        required: true,
        enum: ['Savings', 'Current', 'Fixed Deposit']
    },
    guarantor: {
        name: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        relationship: {
            type: String,
            required: true
        }
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    adminNote: {
        type: String,
        default: ''
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: {
        type: Date
    },
    applicationDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Generate investment request ID
investmentRequestSchema.virtual('requestId').get(function() {
    const year = this.applicationDate.getFullYear();
    const month = String(this.applicationDate.getMonth() + 1).padStart(2, '0');
    const sequence = this._id.toString().slice(-4).toUpperCase();
    return `INV-${year}-${month}-${sequence}`;
});

// Ensure virtuals are included in JSON output
investmentRequestSchema.set('toJSON', { virtuals: true });
investmentRequestSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('InvestmentRequest', investmentRequestSchema);
