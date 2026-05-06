/**
 * fixAprilDates.js
 * 
 * One-time migration: finds MonthlyShare entries whose `date` was stored as
 * March 31 UTC (due to timezone shift from April 1 local time in UTC+6),
 * and corrects them to April 1 UTC.
 * 
 * Run once on Azure: node backend/scripts/fixAprilDates.js
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MonthlyShare = require('../models/MonthlyShare');

async function fixAprilDates() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected');

        // Find all entries where date is March 31 (UTC month = 2, day = 31)
        // These were originally April 1 but got shifted back 6 hours (UTC+6 → UTC)
        const entries = await MonthlyShare.find({});
        
        let fixed = 0;
        let skipped = 0;

        for (const entry of entries) {
            const d = new Date(entry.date);
            const utcMonth = d.getUTCMonth(); // 0=Jan, 2=March, 3=April
            const utcDay = d.getUTCDate();

            // March 31 UTC = was April 1 local (UTC+6 offset shifted it back)
            if (utcMonth === 2 && utcDay === 31) {
                // Also check the stored `month` field to confirm it's meant to be April
                // month field is like "April'26"
                const monthField = (entry.month || '').toLowerCase();
                const isApril = monthField.includes('april');

                if (isApril) {
                    // Fix: set to April 1 UTC
                    const correctYear = d.getUTCFullYear();
                    entry.date = new Date(Date.UTC(correctYear, 3, 1)); // April 1 UTC
                    await entry.save();
                    fixed++;
                    console.log(`✅ Fixed: ${entry.memberName} (${entry.memberId}) — ${entry.month} → April 1, ${correctYear} UTC`);
                } else {
                    skipped++;
                }
            }
        }

        console.log(`\n📊 Migration complete:`);
        console.log(`   Fixed:   ${fixed} entries`);
        console.log(`   Skipped: ${skipped} (March 31 entries that were legitimately March)`);
        console.log(`   Total scanned: ${entries.length}`);

    } catch (error) {
        console.error('❌ Migration failed:', error.message || error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 MongoDB connection closed');
    }
}

fixAprilDates();
