const mongoose = require('mongoose');

const investmentRecoverySchema = new mongoose.Schema({
    recoveryId: {
        type: String,
        required: true,
        unique: true
    },
    investmentAccountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InvestmentAccount',
        required: true
    },
    investmentAccountNumber: {
        type: String,
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
    installmentAmount: {
        type: Number,
        required: true
    },
    profitInterest: {
        type: Number,
        required: true
    },
    monthNumber: {
        type: mongoose.Schema.Types.Mixed,  // Can be Number or String ('all')
        required: true
    },
    recoveryDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'authorized', 'rejected'],
        default: 'pending'
    },
    enteredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    authorizedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    authorizedAt: {
        type: Date
    },
    remarks: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Generate recovery ID
investmentRecoverySchema.statics.generateRecoveryId = async function() {
    const currentYear = new Date().getFullYear();
    const prefix = `REC${currentYear}`;
    
    const latestRecovery = await this.findOne({
        recoveryId: new RegExp(`^${prefix}`)
    }).sort({ recoveryId: -1 });
    
    let sequenceNumber = 1;
    if (latestRecovery) {
        const lastNumber = parseInt(latestRecovery.recoveryId.substring(prefix.length));
        sequenceNumber = lastNumber + 1;
    }
    
    return `${prefix}${sequenceNumber.toString().padStart(6, '0')}`;
};

module.exports = mongoose.model('InvestmentRecovery', investmentRecoverySchema);
