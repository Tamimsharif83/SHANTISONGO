const mongoose = require('mongoose');
require('dotenv').config();

const monthlyShareSchema = new mongoose.Schema({
    memberName: String,
    memberId: String,
    amount: Number,
    month: String,
    date: Date,
    status: { type: String, enum: ['Pending', 'Authorized'], default: 'Pending' }
});

const MonthlyShare = mongoose.model('MonthlyShare', monthlyShareSchema);

async function checkMembers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Get all members with their month data
        const membersData = await MonthlyShare.aggregate([
            { $match: { status: 'Authorized' } },
            { $group: {
                _id: '$memberId',
                memberName: { $first: '$memberName' },
                months: { $push: '$month' },
                count: { $sum: 1 }
            }},
            { $sort: { count: -1 } }
        ]);

        const withoutApril = [];
        const withApril = [];

        membersData.forEach(member => {
            const hasApril = member.months.some(m => m.includes('April'));
            if (hasApril) {
                withApril.push({ id: member._id, name: member.memberName, months: member.count });
            } else {
                withoutApril.push({ id: member._id, name: member.memberName, months: member.count });
            }
        });

        console.log(`\n📊 Members Analysis:`);
        console.log(`✅ Members WITH April'26 data: ${withApril.length}`);
        console.log(`❌ Members WITHOUT April'26 data: ${withoutApril.length}`);
        console.log(`   Total members: ${membersData.length}`);

        if (withoutApril.length > 0 && withoutApril.length <= 20) {
            console.log(`\n❌ Members missing April data:`);
            withoutApril.forEach(m => {
                console.log(`   - ${m.id} (${m.name}): ${m.months} months`);
            });
        } else if (withoutApril.length > 20) {
            console.log(`\n❌ Members missing April data (showing first 20 of ${withoutApril.length}):`);
            withoutApril.slice(0, 20).forEach(m => {
                console.log(`   - ${m.id} (${m.name}): ${m.months} months`);
            });
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkMembers();
