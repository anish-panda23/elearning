const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  courseId: { type: String, required: true, index: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  reviewText: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

// Prevent duplicate reviews
ReviewSchema.index({ courseId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Review", ReviewSchema);
