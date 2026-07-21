const express = require("express");
const router = express.Router();

/**
 * 💬 Feedback Controller
 */
const {
  createFeedback,
  fetchAllFeedback,
} = require("../controllers/feedbackController");
const verifyToken = require("../middlewares/verifyToken");

/**
 * 📌 POST /api/feedback
 * Add feedback
 */
router.post("/", verifyToken, createFeedback);

/**
 * 📌 GET /api/feedback/all
 * Get all feedback (Admin)
 */
router.get("/all", fetchAllFeedback);

module.exports = router;