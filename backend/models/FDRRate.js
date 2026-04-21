const mongoose = require('mongoose');

const fdrRateSchema = new mongoose.Schema(
    {
        months: { type: Number, required: true, unique: true, min: 1 },
        rate:   { type: Number, required: true, min: 0, max: 100 },
        createdBy: { type: String, default: 'Admin' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('FDRRate', fdrRateSchema);
