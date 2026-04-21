require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const InvestmentRequest = require('../models/InvestmentRequest');
const InvestmentAccount = require('../models/InvestmentAccount');

const deleteInvestmentData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Delete all investment accounts
        const accountsDeleted = await InvestmentAccount.deleteMany({});
        console.log(`✅ Deleted ${accountsDeleted.deletedCount} investment accounts`);

        // Delete all investment requests
        const requestsDeleted = await InvestmentRequest.deleteMany({});
        console.log(`✅ Deleted ${requestsDeleted.deletedCount} investment requests`);

        console.log('\n🎉 All investment-related data has been deleted successfully!');
        console.log('You can now test the investment flow from the beginning.\n');

        // Close connection
        await mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error deleting investment data:', error);
        process.exit(1);
    }
};

// Run the script
deleteInvestmentData();
