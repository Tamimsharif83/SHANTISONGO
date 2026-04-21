const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
    incomeId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    source: {
        // Source of income description
        type: String,
        required: true,
        trim: true
    },
    amount: {
        // Stored in PAISA (integer), 1 Taka = 100 Paisa
        type: Number,
        required: true,
        min: 1
    },
    date: {
        type: Date,
        required: true
    },
    enteredBy: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'authorized'],
        default: 'pending'
    },
    authorizedBy: {
        type: String,
        default: null
    },
    authorizedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true, collection: 'Income' });

// Auto-generate incomeId: INC{YEAR}{6-digit sequence}
incomeSchema.statics.generateIncomeId = async function () {
    const currentYear = new Date().getFullYear();
    const prefix = `INC${currentYear}`;

    const latest = await this.findOne({
        incomeId: new RegExp(`^${prefix}`)
    }).sort({ incomeId: -1 });

    let seq = 1;
    if (latest) {
        const lastNum = parseInt(latest.incomeId.substring(prefix.length));
        seq = lastNum + 1;
    }

    return `${prefix}${seq.toString().padStart(6, '0')}`;
};

module.exports = mongoose.model('Income', incomeSchema);
