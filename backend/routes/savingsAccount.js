const express = require('express');
const router = express.Router();
const SavingsAccount = require('../models/SavingsAccount');
const User = require('../models/User');

// Get all savings account entries
router.get('/', async (req, res) => {
    try {
        const entries = await SavingsAccount.find().sort({ createdAt: -1 });
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get pending entries only
router.get('/pending', async (req, res) => {
    try {
        const entries = await SavingsAccount.find({ status: 'Pending' }).sort({ createdAt: -1 });
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Validate member ID and get member info
router.get('/validate-member/:memberId', async (req, res) => {
    try {
        const user = await User.findOne({ memberID: req.params.memberId });
        if (!user) {
            return res.status(404).json({ message: 'Member ID not found' });
        }
        res.json({
            memberID: user.memberID,
            fullName: user.fullName,
            email: user.email
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new savings account entry
router.post('/', async (req, res) => {
    try {
        // Validate member ID exists
        const user = await User.findOne({ memberID: req.body.memberId });
        if (!user) {
            return res.status(404).json({ message: 'Member ID not found in database' });
        }

        const entry = new SavingsAccount({
            memberName: user.fullName,
            memberId: user.memberID,
            amount: req.body.amount,
            date: req.body.date,
            entryBy: req.body.entryBy || 'Admin'
        });

        const newEntry = await entry.save();
        res.status(201).json(newEntry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Authorize entry
router.put('/:id/authorize', async (req, res) => {
    try {
        const entry = await SavingsAccount.findById(req.params.id);
        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        entry.status = 'Authorized';
        entry.authorizedBy = req.body.authorizedBy || 'Admin';
        entry.authorizedAt = new Date();

        const updatedEntry = await entry.save();
        res.json(updatedEntry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete entry
router.delete('/:id', async (req, res) => {
    try {
        const entry = await SavingsAccount.findById(req.params.id);
        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        await entry.deleteOne();
        res.json({ message: 'Entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
