const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { sendApprovalEmail } = require("../utils/emailService");

const router = express.Router();

// LOGIN API
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user by memberID, username, or email
    const user = await User.findOne({
      $or: [
        { memberID: username },
        { username: username },
        { email: username }
      ]
    });

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
      userId: user._id,
      memberID: user.memberID,
      email: user.email,
      fullName: user.fullName
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

// UPDATE PROFILE PICTURE API
router.post("/update-profile-picture", async (req, res) => {
  const { userId, profilePicture } = req.body;

  if (!userId) {
    return res.status(400).json({ msg: "User ID is required" });
  }

  try {
    await User.findByIdAndUpdate(userId, {
      profilePicture: profilePicture || null
    });

    res.json({ msg: "Profile picture updated successfully", profilePicture });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET USER PROFILE API
router.get("/user-profile/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select('fullName memberID email profilePicture numberOfShares');
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ 
      fullName: user.fullName,
      memberID: user.memberID,
      email: user.email,
      profilePicture: user.profilePicture,
      numberOfShares: user.numberOfShares || 0
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// CREATE MEMBER DIRECTLY (Admin only)
router.post("/create-member", async (req, res) => {
  const { fullName, memberID, email, password, numberOfShares, phone, nid, address, profilePicture } = req.body;

  // Validation
  if (!fullName || !memberID || !email || !password) {
    return res.status(400).json({ msg: "Full name, member ID, email, and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ msg: "Password must be at least 6 characters" });
  }

  try {
    // Check if memberID or email already exists
    const existingUser = await User.findOne({ 
      $or: [{ memberID }, { email }] 
    });

    if (existingUser) {
      return res.status(400).json({ msg: "Member ID or email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username: email,
      email: email,
      memberID: memberID,
      fullName: fullName,
      password: hashedPassword,
      role: "member",
      firstLogin: true,
      numberOfShares: numberOfShares || 0,
      profilePicture: profilePicture || null
    });

    await newUser.save();

    // Send email with credentials
    const emailResult = await sendApprovalEmail(
      email,
      fullName,
      memberID,
      password  // Send plain password in email
    );

    if (emailResult.success) {
      console.log(`✅ Member creation email sent to ${email}`);
    } else {
      console.error(`⚠️ Failed to send email to ${email}:`, emailResult.error);
      // Continue even if email fails - user account is still created
    }

    res.json({ 
      msg: "Member created successfully",
      memberID: memberID,
      email: email,
      emailSent: emailResult.success
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


module.exports = router;
