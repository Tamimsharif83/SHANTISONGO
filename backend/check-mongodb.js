const mongoose = require('mongoose');
require('dotenv').config();

const monthlyShareSchema = new mongoose.Schema({
    memberName: String,
    memberId: String,
    amount: Number,
    month: String,
    date: Date,
    status: { type: String, enum: ['Pending', 'Authorized'], default: 'Pending' },
    entryBy: String,
    authorizedBy: String,
    authorizedAt: Date,
    createdAt: { type: Date, default: Date.now }
});

const MonthlyShare = mongoose.model('MonthlyShare', monthlyShareSchema);

async function diagnoseData() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB!');

        // Total count
        const total = await MonthlyShare.countDocuments();
        console.log(`\n📊 Total MonthlyShare entries: ${total}`);

        // Count by status
        const byStatus = await MonthlyShare.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        console.log('\n📌 Entries by Status:');
        byStatus.forEach(item => console.log(`   ${item._id}: ${item.count}`));

        // Check for April entries
        const aprilEntries = await MonthlyShare.find({ month: /April/i });
        console.log(`\n📅 April entries found: ${aprilEntries.length}`);
        if (aprilEntries.length > 0) {
            console.log('   Status breakdown:');
            const aprilByStatus = {};
            aprilEntries.forEach(entry => {
                if (!aprilByStatus[entry.status]) aprilByStatus[entry.status] = 0;
                aprilByStatus[entry.status]++;
            });
            Object.entries(aprilByStatus).forEach(([status, count]) => {
                console.log(`     - ${status}: ${count} entries`);
            });
        }

        // Check month distribution (authorized only)
        const monthDistribution = await MonthlyShare.aggregate([
            { $match: { status: 'Authorized' } },
            { $group: { _id: '$month', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
            { $sort: { _id: 1 } }
        ]);
        console.log('\n📈 Authorized entries by Month:');
        const monthOrder = ['May', 'June', 'July', 'August', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'March', 'April'];
        monthOrder.forEach(month => {
            const found = monthDistribution.find(item => item._id.includes(month));
            if (found) {
                console.log(`   ✅ ${found._id}: ${found.count} entries, Total: ₹${found.totalAmount}`);
            } else {
                console.log(`   ❌ ${month}: 0 entries`);
            }
        });

        console.log('\n✅ Diagnostic complete!');
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

diagnoseData();
