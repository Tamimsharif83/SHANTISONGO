require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function createAdmin() {
  const username = "admin";
  const plainPassword = "admin123";
  const email = "admin@shantisongho.local";
  const fullName = "Administrator";

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("DB connected");

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Upsert admin account so this script can both create and reset credentials.
    const admin = await User.findOneAndUpdate(
      { username },
      {
        username,
        email,
        fullName,
        password: hashedPassword,
        role: "admin",
        firstLogin: false
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    console.log("Admin account is ready");
    console.log("ID:", admin.username);
    console.log("Password:", plainPassword);
  } catch (err) {
    console.error("Failed to reset admin credentials:", err.message || err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
