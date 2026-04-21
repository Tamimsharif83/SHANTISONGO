const express = require('express');
const router = express.Router();
const InterestRate = require('../models/InterestRate');

// Get all interest rates
router.get('/all', async (req, res) => {
    try {
        const rates = await InterestRate.find().sort({ duration: 1 });
        res.json({ success: true, interestRates: rates });
    } catch (error) {
        console.error('Error fetching interest rates:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// Create new interest rate
router.post('/create', async (req, res) => {
    try {
        const { duration, interestRate, createdBy } = req.body;

        if (!duration || interestRate === undefined || interestRate === null || !createdBy) {
            return res.status(400).json({ success: false, message: 'Duration, interest rate, and creator are required' });
        }

        const existingRate = await InterestRate.findOne({ duration: Number(duration) });
        if (existingRate) {
            return res.status(400).json({ success: false, message: 'Interest rate for ' + duration + ' months already exists' });
        }

        const newRate = new InterestRate({
            duration: Number(duration),
            interestRate: Number(interestRate),
            createdBy
        });

        await newRate.save();
        res.status(201).json({ success: true, message: 'Interest rate created successfully', rate: newRate });
    } catch (error) {
        console.error('Error creating interest rate:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// Update interest rate
router.put('/update/:id', async (req, res) => {
    try {
        const { interestRate } = req.body;

        if (interestRate === undefined || interestRate === null || interestRate === '') {
            return res.status(400).json({ success: false, message: 'Interest rate is required' });
        }

        const rate = await InterestRate.findByIdAndUpdate(
            req.params.id,
            { interestRate: Number(interestRate) },
            { new: true }
        );

        if (!rate) {
            return res.status(404).json({ success: false, message: 'Interest rate not found' });
        }

        res.json({ success: true, message: 'Interest rate updated successfully', rate });
    } catch (error) {
        console.error('Error updating interest rate:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// Delete interest rate
router.delete('/delete/:id', async (req, res) => {
    try {
        const rate = await InterestRate.findByIdAndDelete(req.params.id);

        if (!rate) {
            return res.status(404).json({ success: false, message: 'Interest rate not found' });
        }

        res.json({ success: true, message: 'Interest rate deleted successfully' });
    } catch (error) {
        console.error('Error deleting interest rate:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// Get interest rate by duration
// Returns 200 with found:false (not 404) so browser console stays clean
router.get('/duration/:duration', async (req, res) => {
    try {
        const rate = await InterestRate.findOne({ duration: Number(req.params.duration) });

        if (!rate) {
            return res.json({ success: false, found: false, message: 'No interest rate configured for this duration' });
        }

        res.json({ success: true, found: true, interestRate: rate });
    } catch (error) {
        console.error('Error fetching interest rate:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

module.exports = router;
