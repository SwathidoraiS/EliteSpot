const { sql } = require("../config/db");
const logger = require("../utils/logger");
/**
 * 💬 Add feedback to DB
 */
const addFeedback = async (message, rating, user_id) => {

  logger.info("Feedback submission requested", {
      userId: user_id,
      rating
  });

  await sql.query`
    INSERT INTO Feedback (message, rating)
    VALUES (${message}, ${rating})
  `;

  logger.info("Feedback saved successfully", {
      userId: user_id,
      rating
  });

  await sql.query`
    UPDATE Users
    SET feedback_given = 1
    WHERE user_id = ${user_id}
  `;

  logger.info("User feedback status updated", {
      userId: user_id
  });
};

/**
 * 📥 Get all feedback (Admin)
 */
const getAllFeedback = async () => {

  logger.info("Fetching all feedback");

  const result = await sql.query`
    SELECT * FROM feedback ORDER BY created_at DESC
  `;

  logger.info("Feedback fetched successfully", {
      totalFeedback: result.recordset.length
  });

  return result.recordset;
};

module.exports = {
  addFeedback,
  getAllFeedback,
};