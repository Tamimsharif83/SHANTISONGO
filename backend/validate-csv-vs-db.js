const mongoose = require('mongoose');
require('dotenv').config();
const fs = require('fs');

const monthlyShareSchema = new mongoose.Schema({
    memberName: String,
    memberId: String,
    amount: Number,
    month: String,
    date: Date,
    status: String
});

const MonthlyShare = mongoose.model('MonthlyShare', monthlyShareSchema);

async function validate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Parse CSV to get expected members
        const csvPath = '/home/tamim/Documents/SHANTISONGHO/frontend/html/js/Share collection.csv';
        const csvText = fs.readFileSync(csvPath, 'utf8');
        const lines = csvText.split(/\r?\n/);
        
        // Find header row
        const headerIdx = lines.findIndex(l => l.includes("May'") && l.includes("April'"));
        const dataLines = lines.slice(headerIdx + 1).filter(l => l.trim());

        // Extract member IDs and April values from CSV
        const csvMembers = [];
        dataLines.forEach(line => {
            const parts = line.split(',');
            const memberName = parts[0]?.trim();
            const memberId = parts[1]?.trim();
            if (memberName && memberId && memberId !== '202504017' && memberId !== '') { // Skip empty/test rows
                // April is column 17 (index 17)
                const aprilValue = parts[17]?.trim();
                csvMembers.push({ memberId, memberName, hasAprilInCsv: aprilValue && aprilValue !== '-' });
            }
        });

        console.log(`📊 CSV Analysis:`);
        console.log(`   Total members in CSV: ${csvMembers.length}`);
        console.log(`   Members with April'26 in CSV: ${csvMembers.filter(m => m.hasAprilInCsv).length}`);

        // Check database
        const dbMembers = await MonthlyShare.aggregate([
            { $match: { status: 'Authorized' } },
            { $group: {
                _id: '$memberId',
                memberName: { $first: '$memberName' },
                months: { $push: '$month' }
            }}
        ]);

        console.log(`\n📊 Database Analysis:`);
        console.log(`   Total members in DB: ${dbMembers.length}`);
        console.log(`   Members with April'26 in DB: ${dbMembers.filter(m => m.months.some(mo => mo.includes('April'))).length}`);

        // Find mismatches
        console.log(`\n🔍 CSV vs DB Comparison:`);
        const csvInDb = dbMembers.map(m => m._id);
        const csvNotInDb = csvMembers.filter(m => !csvInDb.includes(m.memberId));
        const dbNotInCsv = dbMembers.filter(m => !csvMembers.find(c => c.memberId === m._id));

        if (csvNotInDb.length > 0) {
            console.log(`   CSV members NOT in DB (${csvNotInDb.length}):`);
            csvNotInDb.forEach(m => console.log(`     - ${m.memberId} (${m.memberName})`));
        }

        if (dbNotInCsv.length > 0) {
            console.log(`   DB members NOT in CSV (${dbNotInCsv.length}):`);
            dbNotInCsv.forEach(m => console.log(`     - ${m._id} (${m.memberName})`));
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

validate();
