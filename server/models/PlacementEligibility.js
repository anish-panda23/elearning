const mongoose = require("mongoose");

const PlacementEligibilitySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    courseId: { type: String, required: true },
    certificateId: { type: String, required: true },
    score: { type: Number, required: true }, // e.g. 80 out of 100
    isEligible: { type: Boolean, default: true },
    passedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlacementEligibility", PlacementEligibilitySchema);
