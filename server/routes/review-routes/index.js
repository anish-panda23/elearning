const express = require("express");
const { addReview, getCourseReviews } = require("../../controllers/review-controller/index");

const router = express.Router();

router.post("/add", addReview);
router.get("/:courseId", getCourseReviews);

module.exports = router;
