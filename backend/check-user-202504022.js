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

async function checkMember() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const memberId = '202504022';
        const entries = await MonthlyShare.find({ memberId, status: 'Authorized' }).sort({ date: 1 });

        console.log(`\n📊 Member 202504022 (M. M. Tamim Sharif):`);
        console.log(`   Total entries: ${entries.length}`);

        const months = new Set();
        entries.forEach(entry => {
            months.add(entry.month);
            console.log(`   - ${entry.month}: ₹${entry.amount}`);
        });

        console.log(`\n✅ Has April'26 data: ${Array.from(months).some(m => m.includes('April'))}`);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkMember();
