const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, default: "Remote / Hybrid" },
    salary: { type: String, default: "$80,000 - $120,000 / year" },
    type: { type: String, default: "Full-time" }, // Full-time | Internship | Contract
    category: { type: String, default: "Web Development" },
    description: { type: String, required: true },
    skills: [String],
    requiredCertificate: { type: String, default: "Full Stack Web Development" },
    naukriUrl: { type: String, default: "https://www.naukri.com" },
    linkedInUrl: { type: String, default: "https://www.linkedin.com/jobs" },
    applicants: [
      {
        userId: String,
        userName: String,
        userEmail: String,
        certificateId: String,
        appliedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", JobSchema);
