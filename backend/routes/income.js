const express = require('express');
const router = express.Router();
const Income = require('../models/Income');

// GET next income ID (for preview in form)
router.get('/next-id', async (req, res) => {
    try {
        const nextId = await Income.generateIncomeId();
        res.json({ success: true, incomeId: nextId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET monthly statistics (last 12 months)
router.get('/stats/monthly', async (req, res) => {
    try {
        const stats = await Income.aggregate([
            {
                $group: {
                    _id: { year: { $year: '$date' }, month: { $month: '$date' } },
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
        ]);
        res.json({ success: true, stats });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET all income entries with optional filters
// Query params: search (income ID partial), fromDate (YYYY-MM-DD), toDate (YYYY-MM-DD), sort (asc | desc)
router.get('/', async (req, res) => {
    try {
        const filter = {};

        if (req.query.search) {
            filter.incomeId = new RegExp(req.query.search, 'i');
        }

        if (req.query.fromDate || req.query.toDate) {
            filter.date = {};
            if (req.query.fromDate) filter.date.$gte = new Date(req.query.fromDate);
            if (req.query.toDate) {
                const to = new Date(req.query.toDate);
                to.setUTCHours(23, 59, 59, 999);
                filter.date.$lte = to;
            }
        }

        const sortOrder = req.query.sort === 'asc' ? 1 : -1;
        const entries = await Income.find(filter).sort({ amount: sortOrder, createdAt: -1 });
        res.json({ success: true, entries });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST create income entry
router.post('/', async (req, res) => {
    try {
        const { source, amount, date, enteredBy } = req.body;

        if (!source || !source.trim()) {
            return res.status(400).json({ success: false, message: 'Source of income is required' });
        }
        if (!amount || Number(amount) < 1) {
            return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
        }
        if (!date) {
            return res.status(400).json({ success: false, message: 'Date is required' });
        }

        // Reject future dates (compare UTC midnight)
        const inputDate = new Date(date);
        const todayUTC = new Date();
        todayUTC.setUTCHours(0, 0, 0, 0);
        if (inputDate > todayUTC) {
            return res.status(400).json({ success: false, message: 'Future dates are not allowed' });
        }

        const incomeId = await Income.generateIncomeId();
        const entry = await Income.create({
            incomeId,
            source: source.trim(),
            amount: Math.round(Number(amount)),
            date: new Date(date + 'T12:00:00Z'),
            enteredBy: (enteredBy || 'Admin').trim()
        });

        res.status(201).json({ success: true, entry });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE an income entry
router.delete('/:id', async (req, res) => {
    try {
        const entry = await Income.findByIdAndDelete(req.params.id);
        if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
        res.json({ success: true, message: 'Income entry deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
