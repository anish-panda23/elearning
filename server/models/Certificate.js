const mongoose = require("mongoose");

const CertificateSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  courseId: { type: String, required: true },
  userName: { type: String, required: true },
  courseTitle: { type: String, required: true },
  instructorName: { type: String, required: true },
  completionDate: { type: Date, default: Date.now },
  certificateId: { type: String, required: true, unique: true },
  qrCodeDataUrl: String,
});

CertificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("Certificate", CertificateSchema);
