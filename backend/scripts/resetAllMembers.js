const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const User = require("../models/User");

async function resetAllMembers() {
  const defaultPassword = "member123";

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("DB connected");

    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const result = await User.updateMany(
      { role: "member" },
      {
        $set: {
          password: hashedPassword,
          firstLogin: true
        }
      }
    );

    console.log("Member accounts reset complete");
    console.log("Affected members:", result.modifiedCount);
    console.log("Default password:", defaultPassword);
  } catch (err) {
    console.error("Failed to reset member accounts:", err.message || err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

resetAllMembers();
