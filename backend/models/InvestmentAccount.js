const mongoose = require('mongoose');

const investmentAccountSchema = new mongoose.Schema({
    investmentAccountNumber: {
        type: String,
        required: true,
        unique: true
    },
    investmentRequestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InvestmentRequest',
        required: true
    },
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
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    profitPercentage: {
        type: Number,
        required: true
    },
    monthlyProfit: {
        type: Number,
        required: true
    },
    totalProfit: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'defaulted'],
        default: 'active'
    },
    purpose: {
        type: String,
        required: true
    },
    bankDetails: {
        bankName: String,
        bankBranch: String,
        bankAccountNo: String,
        bankAccountType: String
    },
    guarantor: {
        name: String,
        phone: String,
        relationship: String
    },
    monthlyPayments: [{
        month: Number,
        dueDate: Date,
        paidDate: Date,
        amountPaid: Number,
        status: {
            type: String,
            enum: ['pending', 'paid', 'overdue'],
            default: 'pending'
        }
    }],
    adminNote: {
        type: String,
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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

// Generate investment account number
investmentAccountSchema.statics.generateAccountNumber = async function() {
    const currentYear = new Date().getFullYear();
    const prefix = `INV${currentYear}`;
    
    // Find the latest account number for this year
    const latestAccount = await this.findOne({
        investmentAccountNumber: new RegExp(`^${prefix}`)
    }).sort({ investmentAccountNumber: -1 });
    
    let sequenceNumber = 1;
    if (latestAccount) {
        const lastNumber = parseInt(latestAccount.investmentAccountNumber.substring(prefix.length));
        sequenceNumber = lastNumber + 1;
    }
    
    return `${prefix}${sequenceNumber.toString().padStart(6, '0')}`;
};

// Generate transaction ID
investmentAccountSchema.statics.generateTransactionId = async function() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TXN${timestamp}${random}`;
};

// Calculate monthly profit
investmentAccountSchema.methods.calculateMonthlyProfit = function() {
    const annualProfit = this.amount * (this.profitPercentage / 100);
    this.monthlyProfit = annualProfit / 12;
    this.totalProfit = (annualProfit / 12) * this.duration;
    this.totalAmount = this.amount + this.totalProfit;
    return this.monthlyProfit;
};

// Generate monthly payment schedule
investmentAccountSchema.methods.generatePaymentSchedule = function() {
    const payments = [];
    const startDate = new Date(this.startDate);
    
    for (let i = 1; i <= this.duration; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        
        payments.push({
            month: i,
            dueDate: dueDate,
            amountPaid: 0,
            status: 'pending'
        });
    }
    
    this.monthlyPayments = payments;
};

module.exports = mongoose.model('InvestmentAccount', investmentAccountSchema);
