const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true
  },

  shareAmount: {
    type: Number,
    default: 0
  },

  nid: {
    type: String,
    required: true
  },

  nidImage: {
    type: String, // Base64 encoded image
    required: true
  },

  address: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  appliedDate: {
    type: Date,
    default: Date.now
  },

  // Admin fields (filled when approved)
  approvedDate: {
    type: Date,
    default: null
  },

  approvedBy: {
    type: String,
    default: null
  },

  rejectedDate: {
    type: Date,
    default: null
  },

  rejectedBy: {
    type: String,
    default: null
  },

  // Member credentials (filled when approved)
  memberID: {
    type: String,
    default: null
  },

  initialPassword: {
    type: String,
    default: null
  },

  userCreated: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("Application", ApplicationSchema);
