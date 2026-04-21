const mongoose = require("mongoose");
const path = require("path");
const Application = require("../models/Application");

// Load environment variables from parent directory
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// MongoDB connection string
const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error("❌ Error: MONGODB_URI not found in .env file");
  process.exit(1);
}

async function deleteAllApplications() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Delete all applications
    const result = await Application.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} application(s)`);

    // Close the connection
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Confirm before deleting
console.log("⚠️  WARNING: This will delete ALL membership applications from the database!");
console.log("⚠️  This action cannot be undone!");
console.log("\nStarting deletion in 3 seconds...");

setTimeout(() => {
  deleteAllApplications();
}, 3000);
