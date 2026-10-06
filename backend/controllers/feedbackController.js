const {
  addFeedback,
  getAllFeedback,
} = require("../services/feedbackService");

/**
 * 💬 Controller: Add Feedback
 */
const createFeedback = async (req, res) => {
  try {
    const { message, rating } = req.body;

    const user_id = req.user.user_id;

    // ✅ Validation
    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Feedback cannot be empty" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Invalid rating" });
    }

    //const wordCount = message.trim().split(/\s+/).filter(Boolean).length;

    {/* if (wordCount > 300) {
      return res.status(400).json({
        error: "Feedback cannot exceed 300 words",
      });
    } */}

    // ✅ Save to DB
    await addFeedback(message, rating, user_id);

    return res.json({
      success: true,
      message: "Feedback submitted anonymously",
    });

  } catch (err) {
    console.error("Feedback Error:", err.message);

    return res.status(500).json({
      error: "Failed to submit feedback",
    });
  }
};

/**
 * 📥 Controller: Get All Feedback (Admin)
 */
const fetchAllFeedback = async (req, res) => {
  try {
    const data = await getAllFeedback();

    return res.json(data);

  } catch (err) {
    console.error("Fetch Feedback Error:", err.message);

    return res.status(500).json({
      error: "Error fetching feedback",
    });
  }
};

module.exports = {
  createFeedback,
  fetchAllFeedback,
};