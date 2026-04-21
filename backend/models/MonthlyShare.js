const mongoose = require('mongoose');

const monthlyShareSchema = new mongoose.Schema({
    memberName: {
        type: String,
        required: true
    },
    memberId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    month: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Authorized'],
        default: 'Pending'
    },
    entryBy: {
        type: String,
        required: true
    },
    authorizedBy: {
        type: String,
        default: null
    },
    authorizedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('MonthlyShare', monthlyShareSchema);
