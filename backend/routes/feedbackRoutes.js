const express = require("express");
const router = express.Router();

/**
 * 💬 Feedback Controller
 */
const {
  createFeedback,
  fetchAllFeedback,
} = require("../controllers/feedbackController");

/**
 * 📌 POST /api/feedback
 * Add feedback
 */
router.post("/", createFeedback);

/**
 * 📌 GET /api/feedback/all
 * Get all feedback (Admin)
 */
router.get("/all", fetchAllFeedback);

module.exports = router;