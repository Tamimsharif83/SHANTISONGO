const express = require('express');
const router = express.Router();
const MonthlyShare = require('../models/MonthlyShare');
const User = require('../models/User');

const FISCAL_MONTHS = ['May', 'June', 'July', 'August', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'March', 'April'];

// Maps fiscal month name -> fiscal index (0=May, 11=April)
const MONTH_TO_FISCAL_INDEX = {
    'May': 0, 'June': 1, 'July': 2, 'August': 3,
    'Sep': 4, 'Oct': 5, 'Nov': 6, 'Dec': 7,
    'Jan': 8, 'Feb': 9, 'March': 10, 'April': 11
};

// Maps fiscal month name -> calendar month index (for UTC date math)
const MONTH_TO_CALENDAR_INDEX = {
    'Jan': 0, 'Feb': 1, 'March': 2, 'April': 3,
    'May': 4, 'June': 5, 'July': 6, 'August': 7,
    'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
};

/**
 * Parse the `month` field stored in MongoDB.
 * Handles two formats:
 *   "April'26"  -> { fiscalStart: 2025, fiscalIndex: 11, monthName: 'April' }
 *   "2026-04"   -> { fiscalStart: 2025, fiscalIndex: 11, monthName: 'April' }
 * Returns null if unparseable.
 */
function parseMonthField(monthStr) {
    if (!monthStr) return null;

    // Format 1: "April'26", "March'26", "May'25"
    const labelMatch = String(monthStr).match(
        /^(Jan|Feb|March|April|May|June|July|August|Sep|Oct|Nov|Dec)'(\d{2})$/i
    );
    if (labelMatch) {
        // Find the canonical key (case-insensitive)
        const monthName = Object.keys(MONTH_TO_FISCAL_INDEX).find(
            k => k.toLowerCase() === labelMatch[1].toLowerCase()
        );
        if (!monthName) return null;

        const shortYear = parseInt(labelMatch[2], 10);
        const calYear = 2000 + shortYear;

        // Fiscal year: Jan-April belong to previous fiscal year start
        const fiscalStart = ['Jan', 'Feb', 'March', 'April'].includes(monthName)
            ? calYear - 1
            : calYear;

        return {
            monthName,
            fiscalStart,
            fiscalIndex: MONTH_TO_FISCAL_INDEX[monthName]
        };
    }

    // Format 2: "2026-04" (YYYY-MM) from admin form submissions
    const isoMatch = String(monthStr).match(/^(\d{4})-(\d{2})$/);
    if (isoMatch) {
        const calYear = parseInt(isoMatch[1], 10);
        const calMonthIndex = parseInt(isoMatch[2], 10) - 1; // 0-based

        // Find month name from calendar index
        const monthName = Object.keys(MONTH_TO_CALENDAR_INDEX).find(
            k => MONTH_TO_CALENDAR_INDEX[k] === calMonthIndex
        );
        if (!monthName) return null;

        const fiscalStart = calMonthIndex <= 3 // Jan(0) to April(3)
            ? calYear - 1
            : calYear;

        return {
            monthName,
            fiscalStart,
            fiscalIndex: MONTH_TO_FISCAL_INDEX[monthName]
        };
    }

    return null;
}

function getFiscalStatus(startYear, endYear) {
    const now = new Date();
    const fiscalStart = new Date(Date.UTC(startYear, 4, 1));               // May 1 UTC
    const fiscalEnd = new Date(Date.UTC(endYear, 3, 30, 23, 59, 59, 999)); // April 30 UTC
    if (now >= fiscalStart && now <= fiscalEnd) return { key: 'running', label: 'Running' };
    if (now > fiscalEnd) return { key: 'past', label: 'Past' };
    return { key: 'upcoming', label: 'Upcoming' };
}

function fiscalMonthLabel(index, startYear) {
    const monthName = FISCAL_MONTHS[index];
    const year = index >= 8 ? startYear + 1 : startYear;
    return `${monthName}'${String(year).slice(2)}`;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

router.get('/', async (req, res) => {
    try {
        const entries = await MonthlyShare.find().sort({ createdAt: -1 });
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/pending', async (req, res) => {
    try {
        const entries = await MonthlyShare.find({ status: 'Pending' }).sort({ createdAt: -1 });
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

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

router.get('/validate-member/:memberId', async (req, res) => {
    try {
        const user = await User.findOne({ memberID: req.params.memberId });
        if (!user) return res.status(404).json({ message: 'Member ID not found' });
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

router.get('/member-summary/:memberId', async (req, res) => {
    try {
        const memberId = req.params.memberId;
        const user = await User.findOne({ memberID: memberId });
        if (!user) return res.status(404).json({ message: 'Member not found' });

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

// ─── KEY FIX: member-curve uses `month` string, NOT `date`, for fiscal grouping ──
router.get('/member-curve/:memberId', async (req, res) => {
    try {
        const memberId = req.params.memberId;
        const user = await User.findOne({ memberID: memberId });
        if (!user) return res.status(404).json({ message: 'Member not found' });

        const entries = await MonthlyShare.find({ memberId, status: 'Authorized' });
        const byFiscalYear = new Map();

        entries.forEach(entry => {
            // Use the `month` string field as source of truth — never trust `date` for timezone reasons
            const parsed = parseMonthField(entry.month);
            if (!parsed) {
                console.warn(`Could not parse month field: "${entry.month}" for ${entry.memberId}`);
                return;
            }

            // Only include FY2025 onwards
            if (parsed.fiscalStart < 2025) return;

            const fiscalKey = `${parsed.fiscalStart}-${parsed.fiscalStart + 1}`;

            if (!byFiscalYear.has(fiscalKey)) {
                byFiscalYear.set(fiscalKey, {
                    fiscalStart: parsed.fiscalStart,
                    fiscalEnd: parsed.fiscalStart + 1,
                    values: new Array(12).fill(0)
                });
            }

            byFiscalYear.get(fiscalKey).values[parsed.fiscalIndex] += entry.amount;
        });

        const curveData = Array.from(byFiscalYear.values())
            .sort((a, b) => b.fiscalStart - a.fiscalStart)
            .map(item => {
                const status = getFiscalStatus(item.fiscalStart, item.fiscalEnd);
                return {
                    yearKey: `${item.fiscalStart}-${item.fiscalEnd}`,
                    yearLabel: `${item.fiscalStart}-${item.fiscalEnd} (${status.label})`,
                    status: status.key,
                    monthLabels: item.values.map((_, i) => fiscalMonthLabel(i, item.fiscalStart)),
                    values: item.values,
                    numberOfMonths: item.values.filter(v => v > 0).length,
                    totalSavings: item.values.reduce((s, v) => s + v, 0)
                };
            });

        res.json({ memberId, memberName: user.fullName, curveData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const user = await User.findOne({ memberID: req.body.memberId });
        if (!user) return res.status(404).json({ message: 'Member ID not found in database' });

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

router.put('/:id/authorize', async (req, res) => {
    try {
        const entry = await MonthlyShare.findById(req.params.id);
        if (!entry) return res.status(404).json({ message: 'Entry not found' });

        entry.status = 'Authorized';
        entry.authorizedBy = req.body.authorizedBy || 'Admin';
        entry.authorizedAt = new Date();

        const updatedEntry = await entry.save();
        res.json(updatedEntry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const entry = await MonthlyShare.findById(req.params.id);
        if (!entry) return res.status(404).json({ message: 'Entry not found' });

        await entry.deleteOne();
        res.json({ message: 'Entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
