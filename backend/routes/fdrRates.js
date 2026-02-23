const express = require('express');
const router  = express.Router();
const FDRRate = require('../models/FDRRate');

// GET all rates (sorted by months)
router.get('/', async (req, res) => {
    try {
        const rates = await FDRRate.find().sort({ months: 1 });
        res.json({ success: true, rates });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST create
router.post('/', async (req, res) => {
    try {
        const { months, rate, createdBy } = req.body;
        if (!months || !rate) return res.status(400).json({ success: false, message: 'months and rate are required.' });
        const existing = await FDRRate.findOne({ months: parseInt(months) });
        if (existing) return res.status(400).json({ success: false, message: `A rate for ${months} months already exists.` });
        const doc = await FDRRate.create({ months: parseInt(months), rate: parseFloat(rate), createdBy: createdBy || 'Admin' });
        res.json({ success: true, rate: doc });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT update
router.put('/:id', async (req, res) => {
    try {
        const { rate } = req.body;
        if (rate === undefined) return res.status(400).json({ success: false, message: 'rate is required.' });
        const doc = await FDRRate.findByIdAndUpdate(req.params.id, { rate: parseFloat(rate) }, { new: true });
        if (!doc) return res.status(404).json({ success: false, message: 'Rate not found.' });
        res.json({ success: true, rate: doc });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        await FDRRate.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
