const express = require('express');
const router = express.Router();
const InvestmentRequest = require('../models/InvestmentRequest');
const User = require('../models/User');

// Create new investment request (Member)
router.post('/', async (req, res) => {
    try {
        const { userId, amount, purpose, duration, monthlyInstallment, collateral, guarantor } = req.body;
        
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Get user information
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const investmentRequest = new InvestmentRequest({
            userId: userId,
            memberID: user.memberID,
            memberName: user.fullName,
            amount,
            purpose,
            duration,
            monthlyInstallment,
            collateral,
            guarantor,
            status: 'pending'
        });

        await investmentRequest.save();
        
        res.status(201).json({
            message: 'Investment request submitted successfully',
            request: investmentRequest
        });
    } catch (error) {
        console.error('Error creating investment request:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all investment requests for a member
router.get('/my-requests/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const requests = await InvestmentRequest.find({ userId: userId })
            .sort({ applicationDate: -1 });
        
        res.json(requests);
    } catch (error) {
        console.error('Error fetching investment requests:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single investment request details
router.get('/:id', async (req, res) => {
    try {
        const request = await InvestmentRequest.findById(req.params.id);
        
        if (!request) {
            return res.status(404).json({ message: 'Investment request not found' });
        }

        res.json(request);
    } catch (error) {
        console.error('Error fetching investment request:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all investment requests (Admin only)
router.get('/admin/all', async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        
        const requests = await InvestmentRequest.find(filter)
            .populate('userId', 'fullName email memberID')
            .populate('reviewedBy', 'fullName')
            .sort({ applicationDate: -1 });
        
        res.json(requests);
    } catch (error) {
        console.error('Error fetching all investment requests:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update investment request status (Admin only)
router.patch('/:id/status', async (req, res) => {
    try {
        const { status, adminNote, reviewerId } = req.body;
        
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const request = await InvestmentRequest.findById(req.params.id);
        
        if (!request) {
            return res.status(404).json({ message: 'Investment request not found' });
        }

        request.status = status;
        request.adminNote = adminNote || '';
        if (reviewerId) {
            request.reviewedBy = reviewerId;
        }
        request.reviewedAt = new Date();

        await request.save();
        
        // Populate the response
        const populatedRequest = await InvestmentRequest.findById(request._id)
            .populate('userId', 'fullName email memberID')
            .populate('reviewedBy', 'fullName');
        
        res.json({
            message: `Investment request ${status} successfully`,
            request: populatedRequest
        });
    } catch (error) {
        console.error('Error updating investment request:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get investment statistics (Admin only)
router.get('/admin/statistics', async (req, res) => {
    try {
        const pendingCount = await InvestmentRequest.countDocuments({ status: 'pending' });
        const approvedCount = await InvestmentRequest.countDocuments({ status: 'approved' });
        const rejectedCount = await InvestmentRequest.countDocuments({ status: 'rejected' });
        
        const totalAmountRequested = await InvestmentRequest.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        const approvedAmount = await InvestmentRequest.aggregate([
            { $match: { status: 'approved' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        res.json({
            pendingCount,
            approvedCount,
            rejectedCount,
            totalAmountRequested: totalAmountRequested[0]?.total || 0,
            approvedAmount: approvedAmount[0]?.total || 0
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
