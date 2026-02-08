const express = require('express');
const router = express.Router();
const InvestmentRequest = require('../models/InvestmentRequest');
const User = require('../models/User');
const MonthlyShare = require('../models/MonthlyShare');
const SavingsAccount = require('../models/SavingsAccount');

// Create new investment request (Member)
router.post('/', async (req, res) => {
    try {
        const { userId, amount, purpose, duration, bankName, bankBranch, bankAccountNo, bankAccountType, guarantor } = req.body;
        
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
            bankName,
            bankBranch,
            bankAccountNo,
            bankAccountType,
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

// Get single investment request details with member history
router.get('/:id', async (req, res) => {
    try {
        const request = await InvestmentRequest.findById(req.params.id);
        
        if (!request) {
            return res.status(404).json({ message: 'Investment request not found' });
        }

        // Fetch member's financial history
        const memberHistory = await getMemberFinancialHistory(request.userId, request.memberID, request.applicationDate);
        
        // Fetch member's profile picture
        const user = await User.findById(request.userId).select('profilePicture');
        const profilePicture = user ? user.profilePicture : null;

        res.json({
            ...request.toObject(),
            memberHistory,
            memberProfilePicture: profilePicture
        });
    } catch (error) {
        console.error('Error fetching investment request:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Helper function to get member financial history
async function getMemberFinancialHistory(userId, memberId, applicationDate) {
    try {
        // Calculate total share amount before application date
        const totalShares = await MonthlyShare.aggregate([
            {
                $match: {
                    memberId: memberId,
                    status: 'Authorized',
                    date: { $lt: new Date(applicationDate) }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        // Calculate total savings amount before application date
        const totalSavings = await SavingsAccount.aggregate([
            {
                $match: {
                    memberId: memberId,
                    status: 'Authorized',
                    date: { $lt: new Date(applicationDate) }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        // Get previous investments before this application
        const previousInvestments = await InvestmentRequest.find({
            userId: userId,
            applicationDate: { $lt: new Date(applicationDate) }
        });

        // Calculate total previous investment amount
        const totalPreviousInvestment = previousInvestments.reduce((sum, inv) => {
            if (inv.status === 'approved') {
                return sum + inv.amount;
            }
            return sum;
        }, 0);

        // Count cleared and pending investments
        const clearedInvestments = previousInvestments.filter(inv => 
            inv.status === 'approved' && inv.cleared === true
        ).length;
        
        const pendingInvestments = previousInvestments.filter(inv => 
            inv.status === 'approved' && inv.cleared !== true
        ).length;

        return {
            totalShareAmount: totalShares[0]?.total || 0,
            totalSavingsAmount: totalSavings[0]?.total || 0,
            totalPreviousInvestment,
            clearedInvestmentsCount: clearedInvestments,
            pendingInvestmentsCount: pendingInvestments,
            previousInvestments: previousInvestments.map(inv => ({
                amount: inv.amount,
                status: inv.status,
                purpose: inv.purpose,
                date: inv.applicationDate
            }))
        };
    } catch (error) {
        console.error('Error fetching member history:', error);
        return {
            totalShareAmount: 0,
            totalSavingsAmount: 0,
            totalPreviousInvestment: 0,
            clearedInvestmentsCount: 0,
            pendingInvestmentsCount: 0,
            previousInvestments: []
        };
    }
}

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

// Delete investment request (Member only - only pending requests)
router.delete('/:id', async (req, res) => {
    try {
        const request = await InvestmentRequest.findById(req.params.id);
        
        if (!request) {
            return res.status(404).json({ message: 'Investment request not found' });
        }

        // Only allow deletion of pending requests
        if (request.status !== 'pending') {
            return res.status(403).json({ 
                message: 'Cannot delete request. Only pending requests can be deleted.' 
            });
        }

        await InvestmentRequest.findByIdAndDelete(req.params.id);
        
        res.json({ 
            message: 'Investment request deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting investment request:', error);
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
