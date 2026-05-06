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

const userSchema = new mongoose.Schema({
    memberID: String,
    fullName: String,
    numberOfShares: Number
});

const MonthlyShare = mongoose.model('MonthlyShare', monthlyShareSchema);
const User = mongoose.model('User', userSchema);

// Replicate the API logic
function getFiscalYearStart(dateValue) {
    const date = new Date(dateValue);
    const year = date.getFullYear();
    const month = date.getMonth();
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

function getFiscalMonthIndex(dateValue) {
    const month = new Date(dateValue).getMonth();
    const map = {
        4: 0, 5: 1, 6: 2, 7: 3, 8: 4, 9: 5, 10: 6, 11: 7,
        0: 8, 1: 9, 2: 10, 3: 11
    };
    return map[month];
}

function fiscalMonthLabel(index, startYear) {
    const FISCAL_MONTHS = ['May', 'June', 'July', 'August', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'March', 'April'];
    const monthName = FISCAL_MONTHS[index];
    const year = index >= 8 ? startYear + 1 : startYear;
    const shortYear = String(year).slice(2);
    return `${monthName}'${shortYear}`;
}

async function testMemberCurve(memberId) {
    try {
        console.log(`\n🔍 Testing member curve API for: ${memberId}\n`);
        
        const user = await User.findOne({ memberID: memberId });
        if (!user) {
            console.log('❌ Member not found!');
            return;
        }

        const entries = await MonthlyShare.find({ memberId, status: 'Authorized' }).sort({ date: 1 });
        console.log(`📊 Found ${entries.length} authorized entries for this member`);

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

        // Display results
        curveData.forEach(year => {
            console.log(`\n📅 Year: ${year.yearLabel}`);
            console.log(`   Months with data: ${year.numberOfMonths}`);
            console.log(`   Total savings: ₹${year.totalSavings}`);
            console.log(`   Month breakdown:`);
            year.monthLabels.forEach((label, index) => {
                if (year.values[index] > 0) {
                    console.log(`     ✅ ${label}: ₹${year.values[index]}`);
                } else {
                    console.log(`     ⚪ ${label}: ₹0`);
                }
            });
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function main() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get a sample member
        const members = await User.find({ role: 'member' }).limit(3);
        if (members.length === 0) {
            console.log('No members found');
            return;
        }

        for (const member of members) {
            await testMemberCurve(member.memberID);
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

main();
