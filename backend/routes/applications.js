const express = require("express");
const Application = require("../models/Application");
const { sendApprovalEmail } = require("../utils/emailService");

const router = express.Router();

// SUBMIT APPLICATION (from signup/apply form)
router.post("/submit", async (req, res) => {
  const { fullName, email, phone, shareAmount, nid, nidImage, address } = req.body;

  // Basic validation
  if (!fullName || !email || !phone || !nid || !nidImage || !address) {
    return res.status(400).json({ msg: "All required fields must be provided" });
  }

  try {
    // Check if email or NID already exists
    const existingApp = await Application.findOne({
      $or: [{ email: email }, { nid: nid }]
    });

    if (existingApp) {
      return res.status(400).json({ msg: "An application with this email or NID already exists" });
    }

    // Create new application
    const newApplication = new Application({
      fullName,
      email,
      phone,
      shareAmount: shareAmount || 0,
      nid,
      nidImage,
      address,
      status: "pending",
      appliedDate: new Date()
    });

    await newApplication.save();

    res.json({
      msg: "Application submitted successfully",
      applicationId: newApplication._id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET ALL APPLICATIONS (for admin dashboard)
router.get("/all", async (req, res) => {
  try {
    const applications = await Application.find().sort({ appliedDate: -1 });
    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET SINGLE APPLICATION BY ID
router.get("/:id", async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ msg: "Application not found" });
    }
    res.json(application);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// APPROVE APPLICATION
router.put("/approve/:id", async (req, res) => {
  const { approvedBy, memberID, initialPassword } = req.body;

  // Validate required fields
  if (!memberID || !initialPassword) {
    return res.status(400).json({ msg: "Member ID and initial password are required" });
  }

  if (initialPassword.length < 6) {
    return res.status(400).json({ msg: "Password must be at least 6 characters" });
  }

  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ msg: "Application not found" });
    }

    if (application.status !== "pending") {
      return res.status(400).json({ msg: "Application has already been processed" });
    }

    // Check if memberID already exists
    const User = require("../models/User");
    const bcrypt = require("bcryptjs");
    
    const existingUser = await User.findOne({ $or: [{ memberID }, { email: application.email }] });
    if (existingUser) {
      return res.status(400).json({ msg: "Member ID or email already exists" });
    }

    // Hash the initial password
    const hashedPassword = await bcrypt.hash(initialPassword, 10);

    // Create user account
    const newUser = new User({
      username: application.email,
      email: application.email,
      memberID: memberID,
      fullName: application.fullName,
      password: hashedPassword,
      role: "member",
      firstLogin: true,
      applicationId: application._id,
      numberOfShares: application.shareAmount || 0
    });

    await newUser.save();

    // Update application
    application.status = "approved";
    application.approvedDate = new Date();
    application.approvedBy = approvedBy || "Admin";
    application.memberID = memberID;
    application.initialPassword = initialPassword; // Store plain text for admin reference
    application.userCreated = true;

    await application.save();

    // Send approval email with credentials
    const emailResult = await sendApprovalEmail(
      application.email,
      application.fullName,
      memberID,
      initialPassword
    );

    if (emailResult.success) {
      console.log(`✅ Approval email sent to ${application.email}`);
    } else {
      console.error(`⚠️ Failed to send email to ${application.email}:`, emailResult.error);
      // Continue even if email fails - user account is still created
    }

    res.json({
      msg: "Application approved and user account created successfully",
      application,
      memberID,
      emailSent: emailResult.success
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// REJECT APPLICATION
router.put("/reject/:id", async (req, res) => {
  const { rejectedBy } = req.body;

  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ msg: "Application not found" });
    }

    if (application.status !== "pending") {
      return res.status(400).json({ msg: "Application has already been processed" });
    }

    application.status = "rejected";
    application.rejectedDate = new Date();
    application.rejectedBy = rejectedBy || "Admin";

    await application.save();

    res.json({
      msg: "Application rejected",
      application
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE APPLICATION
router.delete("/:id", async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ msg: "Application not found" });
    }

    await Application.findByIdAndDelete(req.params.id);

    res.json({ msg: "Application deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
