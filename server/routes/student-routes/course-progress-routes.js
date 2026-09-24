const express = require("express");
const {
  getCurrentCourseProgress,
  markCurrentLectureAsViewed,
  resetCurrentCourseProgress,
  getProgressSummaryForStudent,
} = require("../../controllers/student-controller/course-progress-controller");

const router = express.Router();

router.get("/get/:userId/:courseId", getCurrentCourseProgress);
router.get("/summary/:userId", getProgressSummaryForStudent);
router.post("/mark-lecture-viewed", markCurrentLectureAsViewed);
router.post("/reset-progress", resetCurrentCourseProgress);
module.exports = router;
