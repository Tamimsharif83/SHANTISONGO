require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// 🔗 MongoDB connect (SECURE)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("DB connected"))
  .catch(err => console.error(err));

async function createAdmin() {
  const username = "admin";
  const plainPassword = "Admin@123"; // initial password

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
