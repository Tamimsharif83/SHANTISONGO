const mongoose = require('mongoose');
require('dotenv').config();

const monthlyShareSchema = new mongoose.Schema({
    memberName: String,
    memberId: String,
    amount: Number,
    month: String,
    date: Date,
    status: String
});

const MonthlyShare = mongoose.model('MonthlyShare', monthlyShareSchema);

async function diagnose() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Check what the TOTAL across all authorized members is for each month
        const monthTotals = await MonthlyShare.aggregate([
            { $match: { status: 'Authorized' } },
            { $group: {
                _id: '$month',
                totalAmount: { $sum: '$amount' },
                memberCount: { $sum: 1 }
            }},
            { $sort: { totalAmount: -1 } }
        ]);

        console.log('\n=== ORGANIZATION-WIDE TOTALS ===\n');
        const monthOrder = ['May', 'June', 'July', 'August', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'March', 'April'];
        const totals = {};
        monthTotals.forEach(item => totals[item._id] = item.totalAmount);

        monthOrder.forEach(month => {
            const values = monthTotals.filter(m => m._id.includes(month));
            if (values.length > 0) {
                values.forEach(v => {
                    console.log(`${v._id}: ₹${v.totalAmount} (${v.memberCount} contributors)`);
                });
            }
        });

        // Grand total
        const grandTotal = monthTotals.reduce((sum, m) => sum + m.totalAmount, 0);
        console.log(`\n💰 Grand Total: ₹${grandTotal}`);
        console.log(`📊 Months with data: ${monthTotals.length}`);

        // Check CSV total
        console.log('\n=== CSV TOTALS (from data) ===');
        console.log('May\'25: ₹117,000');
        console.log('June\'25: ₹121,000');
        console.log('July\'25: ₹134,000');
        console.log('August\'25: ₹114,000');
        console.log('Sep\'25: ₹142,000');
        console.log('Oct\'25: ₹160,000');
        console.log('Nov\'25: ₹162,000');
        console.log('Dec\'25: ₹154,000');
        console.log('Jan\'26: ₹123,000');
        console.log('Feb\'26: ₹151,000');
        console.log('March\'26: ₹187,000');
        console.log('April\'26: ₹203,000');
        console.log('Grand Total: ₹1,768,000');
        console.log('Total Months: 12');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

diagnose();
