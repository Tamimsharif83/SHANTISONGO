const mongoose = require('mongoose');

const interestRateSchema = new mongoose.Schema({
    duration: {
        type: Number,
        required: true,
        unique: true
    },
    interestRate: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    createdBy: {
        type: String,
        required: true
    }
}, { timestamps: true, collection: 'InsertInterest' });

module.exports = mongoose.model('InterestRate', interestRateSchema);
