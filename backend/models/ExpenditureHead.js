const mongoose = require('mongoose');

// Sub-head schema (embedded)
const subHeadSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true }
}, { _id: true });

// Head schema
const expenditureHeadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    subHeads: [subHeadSchema],
    createdBy: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('ExpenditureHead', expenditureHeadSchema);
