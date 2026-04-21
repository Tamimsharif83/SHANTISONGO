const express = require('express');
const router = express.Router();
const ExpenditureHead = require('../models/ExpenditureHead');
const Expenditure = require('../models/Expenditure');

// ============================================================
// EXPENDITURE HEADS & SUB-HEADS
// ============================================================

// GET all heads (with their sub-heads)
router.get('/heads', async (req, res) => {
    try {
        const heads = await ExpenditureHead.find().sort({ name: 1 });
        res.json({ success: true, heads });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST create a new head
router.post('/heads', async (req, res) => {
    try {
        const { name, createdBy } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Head name is required' });
        }
        const existing = await ExpenditureHead.findOne({ name: name.trim() });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Head already exists' });
        }
        const head = await ExpenditureHead.create({ name: name.trim(), createdBy: createdBy || 'Admin', subHeads: [] });
        res.status(201).json({ success: true, head });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE a head (and all its sub-heads)
router.delete('/heads/:headId', async (req, res) => {
    try {
        const head = await ExpenditureHead.findByIdAndDelete(req.params.headId);
        if (!head) return res.status(404).json({ success: false, message: 'Head not found' });
        res.json({ success: true, message: 'Head deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST add a sub-head to an existing head
router.post('/heads/:headId/subheads', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Sub-head name is required' });
        }
        const head = await ExpenditureHead.findById(req.params.headId);
        if (!head) return res.status(404).json({ success: false, message: 'Head not found' });

        const duplicate = head.subHeads.find(s => s.name.toLowerCase() === name.trim().toLowerCase());
        if (duplicate) {
            return res.status(400).json({ success: false, message: 'Sub-head already exists under this head' });
        }
        head.subHeads.push({ name: name.trim() });
        await head.save();
        res.status(201).json({ success: true, head });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE a sub-head from a head
router.delete('/heads/:headId/subheads/:subHeadId', async (req, res) => {
    try {
        const head = await ExpenditureHead.findById(req.params.headId);
        if (!head) return res.status(404).json({ success: false, message: 'Head not found' });
        head.subHeads = head.subHeads.filter(s => s._id.toString() !== req.params.subHeadId);
        await head.save();
        res.json({ success: true, message: 'Sub-head deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ============================================================
// EXPENDITURE ENTRIES
// ============================================================

// GET next voucher number — format: V-{YEAR}-{6-digit-serial}
router.get('/next-voucher', async (req, res) => {
    try {
        const year = new Date().getFullYear();
        const prefix = `V-${year}-`;
        const latest = await Expenditure.findOne({
            voucherNo: new RegExp(`^${prefix.replace('-', '\\-')}`, 'i')
        }).sort({ voucherNo: -1 });
        let seq = 1;
        if (latest) {
            const lastNum = parseInt(latest.voucherNo.substring(prefix.length));
            if (!isNaN(lastNum)) seq = lastNum + 1;
        }
        const voucherNo = `${prefix}${seq.toString().padStart(6, '0')}`;
        res.json({ success: true, voucherNo });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET all expenditure entries (with optional filters)
// Query params: head, subHead, month (YYYY-MM), sort (asc | desc)
router.get('/', async (req, res) => {
    try {
        const filter = { status: 'authorized' };
        if (req.query.head) filter.head = req.query.head;
        if (req.query.subHead) filter.subHead = req.query.subHead;
        if (req.query.month) {
            const [year, month] = req.query.month.split('-').map(Number);
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 1);
            filter.date = { $gte: start, $lt: end };
        }

        const sortOrder = req.query.sort === 'asc' ? 1 : -1;
        const entries = await Expenditure.find(filter).sort({ amount: sortOrder, createdAt: -1 });
        res.json({ success: true, entries });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET monthly statistics
// Returns: [{ _id: { year, month }, total: Number, count: Number }]
router.get('/stats/monthly', async (req, res) => {
    try {
        const stats = await Expenditure.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' }
                    },
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

// GET pending expenditure entries (awaiting authorization)
router.get('/pending', async (req, res) => {
    try {
        const entries = await Expenditure.find({ status: 'pending' }).sort({ createdAt: -1 });
        res.json({ success: true, entries });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PATCH authorize an expenditure entry
router.patch('/:id/authorize', async (req, res) => {
    try {
        const { authorizedBy } = req.body;
        const entry = await Expenditure.findByIdAndUpdate(
            req.params.id,
            { status: 'authorized', authorizedBy: authorizedBy || 'Admin', authorizedAt: new Date() },
            { new: true }
        );
        if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
        res.json({ success: true, entry });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST create expenditure entry
router.post('/', async (req, res) => {
    try {
        const { voucherNo, head, subHead, amount, date, comment, enteredBy, payslipImage } = req.body;
        if (!voucherNo || !head || !amount || !date || !enteredBy) {
            return res.status(400).json({ success: false, message: 'voucherNo, head, amount, date and enteredBy are required' });
        }
        if (Number(amount) < 1) {
            return res.status(400).json({ success: false, message: 'Amount must be at least 1 paisa' });
        }
        // Reject future dates — compare as UTC midnight (HTML date inputs are YYYY-MM-DD, parsed as UTC midnight)
        const inputDate = new Date(date);               // e.g. '2026-02-20' → 2026-02-20T00:00:00.000Z
        const todayUTC = new Date();
        todayUTC.setUTCHours(0, 0, 0, 0);              // today's UTC midnight
        if (inputDate > todayUTC) {
            return res.status(400).json({ success: false, message: 'Future dates are not allowed' });
        }
        const entryDate = new Date(date + 'T12:00:00Z'); // store as UTC noon — safe for any timezone
        const entry = await Expenditure.create({
            voucherNo: voucherNo.trim(),
            head: head.trim(),
            subHead: subHead ? subHead.trim() : '',
            amount: Math.round(Number(amount)),
            date: entryDate,
            comment: comment ? comment.trim() : '',
            enteredBy: enteredBy.trim(),
            payslipImage: payslipImage || null
        });
        res.status(201).json({ success: true, entry });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE an expenditure entry
router.delete('/:id', async (req, res) => {
    try {
        const entry = await Expenditure.findByIdAndDelete(req.params.id);
        if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
        res.json({ success: true, message: 'Entry deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
