const { sql } = require("../config/db");

/**
 * 💬 Add feedback to DB
 */
const addFeedback = async (message, rating, user_id) => {

  await sql.query`
    INSERT INTO Feedback (message, rating)
    VALUES (${message}, ${rating})
  `;

  await sql.query`
    UPDATE Users
    SET feedback_given = 1
    WHERE user_id = ${user_id}
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