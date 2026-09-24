const express = require("express");
const router = express.Router();
const Job = require("../../models/Job");
const PlacementEligibility = require("../../models/PlacementEligibility");

// Seed default job listings if empty
const DEFAULT_JOBS = [
  {
    title: "Full Stack MERN Developer",
    company: "TechCorp Solutions",
    location: "Remote (India / US)",
    salary: "₹10 - 16 LPA",
    type: "Full-time",
    category: "Web Development",
    description: "Build high-throughput React & Node.js microservices with MongoDB & Redis.",
    skills: ["React.js", "Node.js", "MongoDB", "Express", "TailwindCSS"],
    requiredCertificate: "Full Stack Web Development",
    naukriUrl: "https://www.naukri.com/mern-stack-developer-jobs",
    linkedInUrl: "https://www.linkedin.com/jobs/search/?keywords=mern%20stack",
  },
  {
    title: "Senior Frontend Engineer (React / Next.js)",
    company: "CloudScale Systems",
    location: "Bengaluru, KA (Hybrid)",
    salary: "₹14 - 22 LPA",
    type: "Full-time",
    category: "Web Development",
    description: "Lead frontend architecture for our SaaS analytics portal using Next.js 15 and TypeScript.",
    skills: ["React", "Next.js", "TypeScript", "Redux", "GraphQL"],
    requiredCertificate: "React & Modern Frontend Architecture",
    naukriUrl: "https://www.naukri.com/react-js-developer-jobs",
    linkedInUrl: "https://www.linkedin.com/jobs/search/?keywords=react%20developer",
  },
  {
    title: "Backend API Engineer (Node.js & Microservices)",
    company: "DataStream Tech",
    location: "Remote",
    salary: "₹12 - 18 LPA",
    type: "Full-time",
    category: "Backend Development",
    description: "Design REST & WebSockets APIs, integrate Elasticsearch & Docker for scale.",
    skills: ["Node.js", "Express", "PostgreSQL", "Docker", "Elasticsearch"],
    requiredCertificate: "Backend Engineering & Node.js",
    naukriUrl: "https://www.naukri.com/node-js-developer-jobs",
    linkedInUrl: "https://www.linkedin.com/jobs/search/?keywords=node.js",
  },
];

// Get all jobs
router.get("/", async (req, res) => {
  try {
    let jobs = await Job.find().sort({ createdAt: -1 });
    if (jobs.length === 0) {
      jobs = await Job.insertMany(DEFAULT_JOBS);
    }
    return res.json({ success: true, data: jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return res.status(500).json({ success: false, message: "Error fetching jobs" });
  }
});

// Create new job posting (Admin / Instructor)
router.post("/create", async (req, res) => {
  try {
    const { title, company, location, salary, type, category, description, skills, requiredCertificate, naukriUrl } = req.body;
    if (!title || !company || !description) {
      return res.status(400).json({ success: false, message: "Title, company, and description are required" });
    }

    const newJob = new Job({
      title,
      company,
      location: location || "Remote",
      salary: salary || "Competitive",
      type: type || "Full-time",
      category: category || "Web Development",
      description,
      skills: Array.isArray(skills) ? skills : (skills || "").split(",").map(s => s.trim()),
      requiredCertificate: requiredCertificate || "Full Stack Web Development",
      naukriUrl: naukriUrl || "https://www.naukri.com",
    });

    await newJob.save();
    return res.json({ success: true, data: newJob, message: "Job posted successfully!" });
  } catch (error) {
    console.error("Error creating job:", error);
    return res.status(500).json({ success: false, message: "Failed to post job" });
  }
});

// Apply for job with certificate
router.post("/apply", async (req, res) => {
  try {
    const { jobId, userId, userName, userEmail, certificateId } = req.body;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const alreadyApplied = job.applicants.some(a => a.userId === userId);
    if (alreadyApplied) {
      return res.json({ success: true, message: "Already applied to this position", job });
    }

    job.applicants.push({ userId, userName, userEmail, certificateId });
    await job.save();

    return res.json({
      success: true,
      message: "Application submitted successfully! Shared profile & certificate with recruiter.",
      job,
    });
  } catch (error) {
    console.error("Error applying to job:", error);
    return res.status(500).json({ success: false, message: "Application error" });
  }
});

// Submit placement assessment
router.post("/assessment/submit", async (req, res) => {
  try {
    const { userId, userEmail, userName, courseId, certificateId, score } = req.body;
    const isEligible = score >= 60;

    const record = await PlacementEligibility.findOneAndUpdate(
      { userId, courseId },
      { userId, userEmail, userName, courseId, certificateId, score, isEligible, passedAt: new Date() },
      { upsert: true, new: true }
    );

    return res.json({
      success: true,
      data: record,
      isEligible,
      message: isEligible
        ? "🎉 Congratulations! You passed the Placement Test and unlocked direct Job Portal access!"
        : "You scored below 60%. Please review course materials and re-take the test.",
    });
  } catch (error) {
    console.error("Error submitting assessment:", error);
    return res.status(500).json({ success: false, message: "Assessment submission failed" });
  }
});

// Check eligibility
router.get("/eligibility/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const records = await PlacementEligibility.find({ userId, isEligible: true });
    return res.json({ success: true, eligibleCount: records.length, records });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error checking eligibility" });
  }
});

module.exports = router;
