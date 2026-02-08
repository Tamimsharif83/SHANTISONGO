const express = require('express');
const router = express.Router();
const InvestmentRecovery = require('../models/InvestmentRecovery');
const InvestmentAccount = require('../models/InvestmentAccount');

// Create new recovery entry (pending status)
router.post('/create', async (req, res) => {
    try {
        const {
            investmentAccountId,
            installmentAmount,
            monthNumber,
            recoveryDate,
            remarks,
            enteredBy
        } = req.body;

        // Validate required fields
        if (!investmentAccountId || !installmentAmount || !monthNumber || !recoveryDate || !enteredBy) {
            return res.status(400).json({ 
                message: 'All required fields must be provided' 
            });
        }

        // Get investment account details
        const account = await InvestmentAccount.findById(investmentAccountId);
        if (!account) {
            return res.status(404).json({ message: 'Investment account not found' });
        }

        // Check if recovery already exists for this month
        const existingRecovery = await InvestmentRecovery.findOne({
            investmentAccountId,
            monthNumber,
            status: { $in: ['pending', 'authorized'] }
        });

        if (existingRecovery) {
            return res.status(400).json({ 
                message: `Recovery entry for Month ${monthNumber} already exists with status: ${existingRecovery.status}` 
            });
        }

        // Generate recovery ID
        const recoveryId = await InvestmentRecovery.generateRecoveryId();

        // Calculate profit/interest for this installment
        const profitInterest = account.monthlyProfit;

        // Create recovery entry
        const recovery = new InvestmentRecovery({
            recoveryId,
            investmentAccountId: account._id,
            investmentAccountNumber: account.investmentAccountNumber,
            memberID: account.memberID,
            memberName: account.memberName,
            installmentAmount,
            profitInterest,
            monthNumber,
            recoveryDate: new Date(recoveryDate),
            remarks: remarks || '',
            enteredBy,
            status: 'pending'
        });

        await recovery.save();

        // Populate response
        const populatedRecovery = await InvestmentRecovery.findById(recovery._id)
            .populate('enteredBy', 'fullName')
            .populate('investmentAccountId');

        res.status(201).json({
            message: 'Recovery entry created successfully and sent for authorization',
            recovery: populatedRecovery
        });
    } catch (error) {
        console.error('Error creating recovery entry:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all recovery entries (with optional status filter)
router.get('/all', async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};

        const recoveries = await InvestmentRecovery.find(filter)
            .populate('enteredBy', 'fullName')
            .populate('authorizedBy', 'fullName')
            .populate('investmentAccountId')
            .sort({ createdAt: -1 });

        res.json(recoveries);
    } catch (error) {
        console.error('Error fetching recoveries:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get recovery by ID
router.get('/:id', async (req, res) => {
    try {
        const recovery = await InvestmentRecovery.findById(req.params.id)
            .populate('enteredBy', 'fullName')
            .populate('authorizedBy', 'fullName')
            .populate('investmentAccountId');

        if (!recovery) {
            return res.status(404).json({ message: 'Recovery entry not found' });
        }

        res.json(recovery);
    } catch (error) {
        console.error('Error fetching recovery:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Authorize recovery entry
router.patch('/:id/authorize', async (req, res) => {
    try {
        const { authorizedBy } = req.body;

        if (!authorizedBy) {
            return res.status(400).json({ message: 'Authorized by user ID is required' });
        }

        const recovery = await InvestmentRecovery.findById(req.params.id);
        
        if (!recovery) {
            return res.status(404).json({ message: 'Recovery entry not found' });
        }

        if (recovery.status !== 'pending') {
            return res.status(400).json({ 
                message: `Cannot authorize recovery with status: ${recovery.status}` 
            });
        }

        // Update recovery status
        recovery.status = 'authorized';
        recovery.authorizedBy = authorizedBy;
        recovery.authorizedAt = new Date();
        recovery.updatedAt = new Date();
        await recovery.save();

        // Update investment account payment status
        const account = await InvestmentAccount.findById(recovery.investmentAccountId);
        if (account) {
            const payment = account.monthlyPayments.find(p => p.month === recovery.monthNumber);
            if (payment) {
                payment.status = 'paid';
                payment.paidDate = recovery.recoveryDate;
                payment.amountPaid = recovery.installmentAmount;
                await account.save();
            }
        }

        const populatedRecovery = await InvestmentRecovery.findById(recovery._id)
            .populate('enteredBy', 'fullName')
            .populate('authorizedBy', 'fullName')
            .populate('investmentAccountId');

        res.json({
            message: 'Recovery entry authorized and investment account updated successfully',
            recovery: populatedRecovery
        });
    } catch (error) {
        console.error('Error authorizing recovery:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Reject recovery entry
router.patch('/:id/reject', async (req, res) => {
    try {
        const { authorizedBy, remarks } = req.body;

        const recovery = await InvestmentRecovery.findById(req.params.id);
        
        if (!recovery) {
            return res.status(404).json({ message: 'Recovery entry not found' });
        }

        if (recovery.status !== 'pending') {
            return res.status(400).json({ 
                message: `Cannot reject recovery with status: ${recovery.status}` 
            });
        }

        recovery.status = 'rejected';
        recovery.authorizedBy = authorizedBy;
        recovery.authorizedAt = new Date();
        recovery.remarks = remarks || recovery.remarks;
        recovery.updatedAt = new Date();
        await recovery.save();

        const populatedRecovery = await InvestmentRecovery.findById(recovery._id)
            .populate('enteredBy', 'fullName')
            .populate('authorizedBy', 'fullName');

        res.json({
            message: 'Recovery entry rejected successfully',
            recovery: populatedRecovery
        });
    } catch (error) {
        console.error('Error rejecting recovery:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete recovery entry (only pending ones)
router.delete('/:id', async (req, res) => {
    try {
        const recovery = await InvestmentRecovery.findById(req.params.id);
        
        if (!recovery) {
            return res.status(404).json({ message: 'Recovery entry not found' });
        }

        if (recovery.status !== 'pending') {
            return res.status(403).json({ 
                message: 'Only pending recovery entries can be deleted' 
            });
        }

        await InvestmentRecovery.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Recovery entry deleted successfully' });
    } catch (error) {
        console.error('Error deleting recovery:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
