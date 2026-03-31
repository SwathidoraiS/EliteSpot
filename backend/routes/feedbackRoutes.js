const express = require("express");
const router = express.Router();
const { sql } = require("../config/db");

// ADD FEEDBACK
router.post("/", async (req, res) => {
  try {
    const { message, rating } = req.body;

    // validation
    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Feedback cannot be empty" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Invalid rating" });
    }

    const wordCount = message.trim().split(/\s+/).filter(Boolean).length;

    if (wordCount > 300) {
    return res.status(400).json({
        error: "Feedback cannot exceed 300 words"
    });
    }

    await sql.query`
      INSERT INTO feedback (message, rating)
      VALUES (${message}, ${rating})
    `;

    res.json({ success: true, message: "Feedback submitted anonymously" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
});

// GET ALL FEEDBACK (Admin)
router.get("/all", async (req, res) => {
  try {
    const result = await sql.query`
      SELECT * FROM feedback ORDER BY created_at DESC
    `;

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: "Error fetching feedback" });
  }
});

module.exports = router;