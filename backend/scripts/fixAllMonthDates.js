/**
 * fixAllMonthDates.js
 * 
 * One-time migration: fixes ALL MonthlyShare entries where the `date` was
 * stored in local time (UTC+6) instead of UTC, causing every month to be
 * shifted back (e.g. March 1 local → Feb 28 UTC, April 1 local → March 31 UTC).
 * 
 * Strategy: Use the `month` field (e.g. "April'26", "March'26") as the
 * SOURCE OF TRUTH to set the correct UTC date, ignoring the broken `date` field.
 * 
 * Run ONCE on Azure: node backend/scripts/fixAllMonthDates.js
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MonthlyShare = require('../models/MonthlyShare');

const MONTH_NAME_TO_UTC_INDEX = {
    'Jan': 0, 'Feb': 1, 'March': 2, 'April': 3,
    'May': 4, 'June': 5, 'July': 6, 'August': 7,
    'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
};

// Parse "April'26" or "March'26" or "2026-04" into { monthIndex, year }
function parseMonthField(monthStr) {
    if (!monthStr) return null;

    // Format: "April'26", "March'26", "May'25" etc.
    const labelMatch = monthStr.match(/^(Jan|Feb|March|April|May|June|July|August|Sep|Oct|Nov|Dec)'(\d{2})$/i);
    if (labelMatch) {
        const monthName = labelMatch[1];
        // Capitalize first letter to match our map keys
        const normalizedName = monthName.charAt(0).toUpperCase() + monthName.slice(1).toLowerCase();
        // Fix: "March" and "August" need full name
        const finalName = Object.keys(MONTH_NAME_TO_UTC_INDEX).find(
            k => k.toLowerCase() === monthName.toLowerCase()
        );
        if (!finalName) return null;
        const monthIndex = MONTH_NAME_TO_UTC_INDEX[finalName];
        const shortYear = parseInt(labelMatch[2], 10);
        const year = 2000 + shortYear;
        return { monthIndex, year };
    }

    // Format: "2026-04" (YYYY-MM)
    const isoMatch = monthStr.match(/^(\d{4})-(\d{2})$/);
    if (isoMatch) {
        const year = parseInt(isoMatch[1], 10);
        const monthIndex = parseInt(isoMatch[2], 10) - 1; // 0-based
        return { monthIndex, year };
    }

    return null;
}

async function fixAllMonthDates() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected');

        const entries = await MonthlyShare.find({});
        console.log(`📋 Total entries to scan: ${entries.length}`);

        let fixed = 0;
        let skipped = 0;
        let errors = 0;

        for (const entry of entries) {
            const parsed = parseMonthField(entry.month);
            if (!parsed) {
                console.warn(`⚠️  Could not parse month field: "${entry.month}" for ${entry.memberId}`);
                errors++;
                continue;
            }

            const { monthIndex, year } = parsed;
            // Correct date: always 1st of the month, midnight UTC
            const correctDate = new Date(Date.UTC(year, monthIndex, 1));
            const currentDate = new Date(entry.date);

            // Check if already correct (within same UTC month and year)
            const alreadyCorrect =
                currentDate.getUTCFullYear() === year &&
                currentDate.getUTCMonth() === monthIndex &&
                currentDate.getUTCDate() === 1;

            if (alreadyCorrect) {
                skipped++;
                continue;
            }

            // Fix it
            entry.date = correctDate;
            await entry.save();
            fixed++;
            console.log(`✅ Fixed: ${entry.memberName} | ${entry.month} | ${currentDate.toISOString()} → ${correctDate.toISOString()}`);
        }

        console.log(`\n📊 Migration complete:`);
        console.log(`   Fixed:         ${fixed}`);
        console.log(`   Already OK:    ${skipped}`);
        console.log(`   Parse errors:  ${errors}`);
        console.log(`   Total scanned: ${entries.length}`);

    } catch (error) {
        console.error('❌ Migration failed:', error.message || error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 MongoDB disconnected');
    }
}

fixAllMonthDates();
