const express = require('express');
const router = express.Router();
const MonthlyShare = require('../models/MonthlyShare');
const User = require('../models/User');

const FISCAL_MONTHS = ['May', 'June', 'July', 'August', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'March', 'April'];

function getFiscalYearStart(dateValue) {
    const date = new Date(dateValue);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();  // Use UTC to avoid timezone shifting April -> March
    return month >= 4 ? year : year - 1;
}

function getFiscalStatus(startYear, endYear) {
    const now = new Date();
    const fiscalStart = new Date(startYear, 4, 1);
    const fiscalEnd = new Date(endYear, 3, 30, 23, 59, 59, 999);

    if (now >= fiscalStart && now <= fiscalEnd) return { key: 'running', label: 'Running' };
    if (now > fiscalEnd) return { key: 'past', label: 'Past' };
    return { key: 'upcoming', label: 'Upcoming' };
}

function fiscalMonthLabel(index, startYear) {
    const monthName = FISCAL_MONTHS[index];
    const year = index >= 8 ? startYear + 1 : startYear;
    const shortYear = String(year).slice(2);
    return `${monthName}'${shortYear}`;
}

function getFiscalMonthIndex(dateValue) {
    const month = new Date(dateValue).getUTCMonth();  // Use UTC to avoid timezone shifting
    const map = {
        4: 0,
        5: 1,
        6: 2,
        7: 3,
        8: 4,
        9: 5,
        10: 6,
        11: 7,
        0: 8,
        1: 9,
        2: 10,
        3: 11
    };
    return map[month];
}

// Get all monthly share entries
router.get('/', async (req, res) => {
    try {
        const entries = await MonthlyShare.find().sort({ createdAt: -1 });
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get pending entries only
router.get('/pending', async (req, res) => {
    try {
        const entries = await MonthlyShare.find({ status: 'Pending' }).sort({ createdAt: -1 });
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all members with share information
router.get('/all-members', async (req, res) => {
    try {
        const members = await User.find({ role: 'member' })
            .select('memberID fullName numberOfShares profilePicture email')
            .sort({ memberID: 1 });
        res.json(members);
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
            email: user.email,
            numberOfShares: user.numberOfShares,
            profilePicture: user.profilePicture
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get member dashboard statistics summary
router.get('/member-summary/:memberId', async (req, res) => {
    try {
        const memberId = req.params.memberId;
        const user = await User.findOne({ memberID: memberId });

        if (!user) {
            return res.status(404).json({ message: 'Member not found' });
        }

        const entries = await MonthlyShare.find({ memberId, status: 'Authorized' }).sort({ date: 1 });
        const totalSavings = entries.reduce((sum, item) => sum + item.amount, 0);
        const latestEntry = entries.length > 0 ? entries[entries.length - 1] : null;
        const monthlyDeposit = latestEntry ? latestEntry.amount : 0;

        res.json({
            memberId,
            memberName: user.fullName,
            totalShareValue: (user.numberOfShares || 0) * 1000,
            totalFixedDeposit: 0,
            monthlyDeposit,
            totalInvestmentReceived: 0,
            totalOutstanding: 0,
            numberOfInstallments: 0,
            closingDate: 'N/A',
            totalSavings
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get member-specific savings curve data by fiscal year (May -> April)
router.get('/member-curve/:memberId', async (req, res) => {
    try {
        const memberId = req.params.memberId;
        const user = await User.findOne({ memberID: memberId });
        if (!user) {
            return res.status(404).json({ message: 'Member not found' });
        }

        const entries = await MonthlyShare.find({ memberId, status: 'Authorized' }).sort({ date: 1 });
        const byFiscalYear = new Map();

        entries.forEach(entry => {
            const fiscalStart = getFiscalYearStart(entry.date);
            const fiscalEnd = fiscalStart + 1;
            const fiscalKey = `${fiscalStart}-${fiscalEnd}`;
            const monthIndex = getFiscalMonthIndex(entry.date);

            if (monthIndex === undefined) return;

            if (!byFiscalYear.has(fiscalKey)) {
                byFiscalYear.set(fiscalKey, {
                    fiscalStart,
                    fiscalEnd,
                    values: new Array(12).fill(0)
                });
            }

            byFiscalYear.get(fiscalKey).values[monthIndex] += entry.amount;
        });

        const curveData = Array.from(byFiscalYear.values())
            .sort((a, b) => b.fiscalStart - a.fiscalStart)
            .map(item => {
                const status = getFiscalStatus(item.fiscalStart, item.fiscalEnd);
                return {
                    yearKey: `${item.fiscalStart}-${item.fiscalEnd}`,
                    yearLabel: `${item.fiscalStart}-${item.fiscalEnd} (${status.label})`,
                    status: status.key,
                    monthLabels: item.values.map((_, index) => fiscalMonthLabel(index, item.fiscalStart)),
                    values: item.values,
                    numberOfMonths: item.values.filter(value => value > 0).length,
                    totalSavings: item.values.reduce((sum, value) => sum + value, 0)
                };
            });

        res.json({
            memberId,
            memberName: user.fullName,
            curveData
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new monthly share entry
router.post('/', async (req, res) => {
    try {
        // Validate member ID exists
        const user = await User.findOne({ memberID: req.body.memberId });
        if (!user) {
            return res.status(404).json({ message: 'Member ID not found in database' });
        }

        const entry = new MonthlyShare({
            memberName: user.fullName,
            memberId: user.memberID,
            amount: req.body.amount,
            month: req.body.month,
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
        const entry = await MonthlyShare.findById(req.params.id);
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
        const entry = await MonthlyShare.findById(req.params.id);
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