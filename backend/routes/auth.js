const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// LOGIN API
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid password" });
    }

    res.json({
      msg: "Login success",
      role: user.role,
      firstLogin: user.firstLogin,
      userId: user._id
    });

  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// CHANGE PASSWORD API
router.post("/change-password", async (req, res) => {
  const { userId, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ msg: "Password too short" });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
      firstLogin: false
    });

    res.json({ msg: "Password changed successfully" });

  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// UPDATE PASSWORD API (with old password verification)
router.post("/update-password", async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ msg: "Old password and new password are required" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ msg: "New password must be at least 6 characters" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Old password is incorrect" });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, {
      password: hashedPassword
    });

    res.json({ msg: "Password updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


module.exports = router;
