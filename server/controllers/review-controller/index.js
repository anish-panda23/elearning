const Review = require("../../models/Review");

// POST /reviews — create or update a review
const addReview = async (req, res) => {
  try {
    const { courseId, userId, userName, rating, reviewText } = req.body;

    if (!courseId || !userId || !rating) {
      return res.status(400).json({ success: false, message: "courseId, userId, and rating are required" });
    }

    const review = await Review.findOneAndUpdate(
      { courseId, userId },
      { courseId, userId, userName, rating, reviewText, createdAt: Date.now() },
      { upsert: true, new: true }
    );

    return res.json({ success: true, data: review });
  } catch (err) {
    console.error("Add review error:", err);
    return res.status(500).json({ success: false, message: "Failed to save review" });
  }
};

// GET /reviews/:courseId — get all reviews for a course + stats
const getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;
    const reviews = await Review.find({ courseId }).sort({ createdAt: -1 }).lean();

    const total = reviews.length;
    const avgRating = total > 0
      ? +(reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
      : 0;

    // Distribution: count of 1-5 star ratings
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => { distribution[r.rating] = (distribution[r.rating] || 0) + 1; });

    return res.json({
      success: true,
      data: {
        reviews,
        stats: { total, avgRating, distribution },
      },
    });
  } catch (err) {
    console.error("Get reviews error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch reviews" });
  }
};

module.exports = { addReview, getCourseReviews };
