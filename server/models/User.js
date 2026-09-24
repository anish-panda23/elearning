const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: String,
  userEmail: String,
  password: String,
  role: { type: String, default: "user" },
  googleId: String,
  isGoogleUser: { type: Boolean, default: false },
  isTwoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: String,
});

module.exports = mongoose.model("User", UserSchema);

