const express = require('express');
const router = express.Router();
const FixedDepositRequest = require('../models/FixedDepositRequest');
const User = require('../models/User');

// ─── MEMBER: Submit new fixed deposit request ─────────────────
router.post('/', async (req, res) => {
    try {
        const { userId, proposedDuration, amount, memberComment } = req.body;
        if (!userId || !proposedDuration || !amount) {
            return res.status(400).json({ success: false, message: 'userId, proposedDuration and amount are required.' });
        }
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        const request = await FixedDepositRequest.create({
            userId,
            memberID: user.memberID,
            memberName: user.fullName,
            proposedDuration: parseInt(proposedDuration),
            amount: Math.round(parseFloat(amount)),
            memberComment: memberComment || ''
        });

        res.status(201).json({ success: true, request });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── MEMBER: Get own requests ─────────────────────────────────
router.get('/member/:userId', async (req, res) => {
    try {
        const requests = await FixedDepositRequest.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json({ success: true, requests });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── ADMIN: Get all requests ──────────────────────────────────
router.get('/all', async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        const requests = await FixedDepositRequest.find(filter)
            .populate('userId', 'fullName memberID profilePicture email phone address nid')
            .sort({ createdAt: -1 });
        res.json({ success: true, requests });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── ADMIN: Pending count (for badge) ────────────────────────
router.get('/stats/pending-count', async (req, res) => {
    try {
        const pendingCount        = await FixedDepositRequest.countDocuments({ status: 'pending' });
        const paymentCount        = await FixedDepositRequest.countDocuments({ status: 'payment_submitted' });
        const entryConfirmedCount = await FixedDepositRequest.countDocuments({ status: 'entry_confirmed' });
        res.json({ success: true, pendingCount, paymentCount, entryConfirmedCount, total: pendingCount + paymentCount + entryConfirmedCount });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
// ─── ADMIN: Lookup member info by memberID (for admin FDR form) ───
router.get('/member-info/:memberID', async (req, res) => {
    try {
        const user = await User.findOne({ memberID: req.params.memberID.trim().toUpperCase() });
        if (!user) return res.status(404).json({ success: false, message: 'Member not found with this Member ID.' });
        const fdHistory = await FixedDepositRequest.find({ userId: user._id, status: 'completed' })
            .select('requestId amount acknowledgedDuration interestRate completedAt')
            .sort({ completedAt: -1 }).limit(5);
        res.json({
            success: true,
            user: { _id: user._id, fullName: user.fullName, memberID: user.memberID, numberOfShares: user.numberOfShares, email: user.email, phone: user.phone, profilePicture: user.profilePicture },
            fdHistory
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── ADMIN: Direct FDR creation (bypasses member request flow) ───
router.post('/admin-create', async (req, res) => {
    try {
        const { memberID, amount, duration, interestRate, depositDate, paymentMethod, notes, createdBy } = req.body;
        if (!memberID || !amount || !duration || !interestRate || !paymentMethod) {
            return res.status(400).json({ success: false, message: 'memberID, amount, duration, interestRate and paymentMethod are required.' });
        }
        const user = await User.findOne({ memberID: memberID.trim().toUpperCase() });
        if (!user) return res.status(404).json({ success: false, message: 'Member not found.' });

        const deposit = depositDate ? new Date(depositDate) : new Date();
        const maturity = new Date(deposit);
        maturity.setMonth(maturity.getMonth() + parseInt(duration));

        const amountPaisa = Math.round(parseFloat(amount) * 100);

        const request = await FixedDepositRequest.create({
            userId: user._id,
            memberID: user.memberID,
            memberName: user.fullName,
            proposedDuration: parseInt(duration),
            amount: amountPaisa,
            memberComment: notes || '',
            status: 'entry_confirmed',
            acknowledgedDuration: parseInt(duration),
            interestRate: parseFloat(interestRate),
            acknowledgedBy: createdBy || 'Admin',
            acknowledgedAt: deposit,
            paymentMethod: paymentMethod,
            paymentSubmittedAt: deposit,
            entryConfirmedBy: createdBy || 'Admin',
            entryConfirmedAt: new Date(),
            depositDate: deposit,
            maturityDate: maturity,
            adminCreated: true
        });
        res.status(201).json({ success: true, request });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
// ─── ADMIN: Get single request with full user details ─────────
router.get('/:id', async (req, res) => {
    try {
        const request = await FixedDepositRequest.findById(req.params.id)
            .populate('userId', 'fullName memberID profilePicture email phone address nid numberOfShares');
        if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });
        res.json({ success: true, request });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── ADMIN: Acknowledge (approve with terms) ──────────────────
router.patch('/:id/acknowledge', async (req, res) => {
    try {
        const { acknowledgedDuration, interestRate, adminComment, acknowledgedBy } = req.body;
        if (!acknowledgedDuration || !interestRate) {
            return res.status(400).json({ success: false, message: 'Duration and interest rate are required.' });
        }
        const request = await FixedDepositRequest.findByIdAndUpdate(req.params.id, {
            status: 'acknowledged',
            acknowledgedDuration: parseInt(acknowledgedDuration),
            interestRate: parseFloat(interestRate),
            adminComment: adminComment || '',
            acknowledgedBy: acknowledgedBy || 'Admin',
            acknowledgedAt: new Date()
        }, { new: true });
        if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });
        res.json({ success: true, request });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── ADMIN: Reject ────────────────────────────────────────────
router.patch('/:id/reject', async (req, res) => {
    try {
        const { rejectionReason, rejectedBy } = req.body;
        const request = await FixedDepositRequest.findByIdAndUpdate(req.params.id, {
            status: 'rejected',
            rejectionReason: rejectionReason || '',
            rejectedBy: rejectedBy || 'Admin',
            rejectedAt: new Date()
        }, { new: true });
        if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });
        res.json({ success: true, request });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── MEMBER: Submit payment details ──────────────────────────
router.patch('/:id/payment', async (req, res) => {
    try {
        const { paymentMethod, transactionId, paymentComment, paymentDocument } = req.body;
        if (!paymentMethod) {
            return res.status(400).json({ success: false, message: 'Payment method is required.' });
        }
        if (paymentMethod !== 'hand_cash' && !paymentDocument) {
            return res.status(400).json({ success: false, message: 'Payment document / screenshot is required.' });
        }
        const request = await FixedDepositRequest.findByIdAndUpdate(req.params.id, {
            status: 'payment_submitted',
            paymentMethod,
            transactionId: transactionId || '',
            paymentComment: paymentComment || '',
            paymentDocument,
            paymentSubmittedAt: new Date()
        }, { new: true });
        if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });
        res.json({ success: true, request });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── DATA ENTRY: Confirm entry (payment_submitted → entry_confirmed) ─
router.patch('/:id/confirm-entry', async (req, res) => {
    try {
        const { confirmedBy } = req.body;
        const request = await FixedDepositRequest.findByIdAndUpdate(req.params.id, {
            status: 'entry_confirmed',
            entryConfirmedBy: confirmedBy || 'Admin',
            entryConfirmedAt: new Date()
        }, { new: true });
        if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });
        res.json({ success: true, request });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── AUTHORIZE: Authorize FD (entry_confirmed → completed) ───────────
router.patch('/:id/authorize', async (req, res) => {
    try {
        const { authorizedBy } = req.body;
        const request = await FixedDepositRequest.findByIdAndUpdate(req.params.id, {
            status: 'completed',
            authorizedFDBy: authorizedBy || 'Admin',
            authorizedFDAt: new Date(),
            completedBy: authorizedBy || 'Admin',
            completedAt: new Date()
        }, { new: true });
        if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });
        res.json({ success: true, request });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── ADMIN: Complete (legacy, keep for compatibility) ─────────────────
router.patch('/:id/complete', async (req, res) => {
    try {
        const { completedBy } = req.body;
        const request = await FixedDepositRequest.findByIdAndUpdate(req.params.id, {
            status: 'completed',
            completedBy: completedBy || 'Admin',
            completedAt: new Date()
        }, { new: true });
        if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });
        res.json({ success: true, request });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── ADMIN: Pending count (for badge) ────────────────────────
// NOTE: This duplicate is now removed — route moved above /:id

// ─── ADMIN: Cancel FD (entry_confirmed → cancelled) ─────────────────────
router.patch('/:id/cancel', async (req, res) => {
    try {
        const { cancelledBy, cancelReason } = req.body;
        const request = await FixedDepositRequest.findByIdAndUpdate(req.params.id, {
            status: 'cancelled',
            cancelledBy: cancelledBy || 'Admin',
            cancelledAt: new Date(),
            cancelReason: cancelReason || ''
        }, { new: true });
        if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });
        res.json({ success: true, request });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
