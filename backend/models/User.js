const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  memberID: {
    type: String,
    unique: true,
    sparse: true
  },

  fullName: {
    type: String,
    required: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    default: "member" // admin / member
  },

  firstLogin: {
    type: Boolean,
    default: true
  },

  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  },

  profilePicture: {
    type: String,
    default: null
  },

  numberOfShares: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("User", UserSchema);
