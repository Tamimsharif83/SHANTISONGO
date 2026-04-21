const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const User = require("../models/User");
const Application = require("../models/Application");
const MonthlyShare = require("../models/MonthlyShare");
const SavingsAccount = require("../models/SavingsAccount");
const InvestmentRequest = require("../models/InvestmentRequest");
const InvestmentAccount = require("../models/InvestmentAccount");
const InvestmentRecovery = require("../models/InvestmentRecovery");

async function cleanupDatabase() {
    try {
        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ MongoDB connected");

        // Delete all members (keep only admin)
        console.log("\n🗑️  Deleting all members (keeping admin)...");
        const deletedUsers = await User.deleteMany({ role: "member" });
        console.log(`✅ Deleted ${deletedUsers.deletedCount} member(s)`);

        // Delete all applications
        console.log("\n🗑️  Deleting all applications...");
        const deletedApplications = await Application.deleteMany({});
        console.log(`✅ Deleted ${deletedApplications.deletedCount} application(s)`);

        // Delete all monthly shares
        console.log("\n🗑️  Deleting all monthly share records...");
        const deletedShares = await MonthlyShare.deleteMany({});
        console.log(`✅ Deleted ${deletedShares.deletedCount} monthly share record(s)`);

        // Delete all savings accounts
        console.log("\n🗑️  Deleting all savings account records...");
        const deletedSavings = await SavingsAccount.deleteMany({});
        console.log(`✅ Deleted ${deletedSavings.deletedCount} savings account record(s)`);

        // Delete all investment requests
        console.log("\n🗑️  Deleting all investment requests...");
        const deletedInvestments = await InvestmentRequest.deleteMany({});
        console.log(`✅ Deleted ${deletedInvestments.deletedCount} investment request(s)`);

        // Delete all investment accounts
        console.log("\n🗑️  Deleting all investment accounts...");
        const deletedAccounts = await InvestmentAccount.deleteMany({});
        console.log(`✅ Deleted ${deletedAccounts.deletedCount} investment account(s)`);

        // Delete all investment recovery entries
        console.log("\n🗑️  Deleting all investment recovery entries...");
        const deletedRecoveries = await InvestmentRecovery.deleteMany({});
        console.log(`✅ Deleted ${deletedRecoveries.deletedCount} investment recovery(ies)`);

        // Check remaining admin
        const adminCount = await User.countDocuments({ role: "admin" });
        console.log(`\n✅ ${adminCount} admin account(s) remaining`);

        console.log("\n✅ Database cleanup completed successfully!");
        
    } catch (error) {
        console.error("❌ Error cleaning up database:", error);
    } finally {
        await mongoose.connection.close();
        console.log("\n🔌 MongoDB connection closed");
        process.exit();
    }
}

cleanupDatabase();
