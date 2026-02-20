const mongoose = require('mongoose');

const expenditureSchema = new mongoose.Schema({
    voucherNo: {
        type: String,
        required: true,
        trim: true
    },
    head: {
        type: String,
        required: true,
        trim: true
    },
    subHead: {
        type: String,
        default: '',
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
    comment: {
        type: String,
        default: '',
        trim: true
    },
    payslipImage: {
        // Stored as base64 data URL (optional)
        type: String,
        default: null
    },
    enteredBy: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Expenditure', expenditureSchema);
