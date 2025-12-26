const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// 🔗 MongoDB connect
mongoose.connect(
  "mongodb+srv://bankuser:Bank%4012345@bankingdb.uap7cee.mongodb.net/?appName=BankingDB"
);

async function createAdmin() {
  const username = "admin";
  const plainPassword = "Admin@123";

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const admin = new User({
    username,
    password: hashedPassword,
    role: "admin",
    firstLogin: true
  });

  await admin.save();

  console.log("✅ Admin created");
  console.log("Username:", username);
  console.log("Password:", plainPassword);

  mongoose.disconnect();
}

createAdmin();
