const { sql } = require("../config/db");

/**
 * 💬 Add feedback to DB
 */
const addFeedback = async (message, rating) => {
  await sql.query`
    INSERT INTO feedback (message, rating)
    VALUES (${message}, ${rating})
  `;
};

/**
 * 📥 Get all feedback (Admin)
 */
const getAllFeedback = async () => {
  const result = await sql.query`
    SELECT * FROM feedback ORDER BY created_at DESC
  `;

  return result.recordset;
};

module.exports = {
  addFeedback,
  getAllFeedback,
};