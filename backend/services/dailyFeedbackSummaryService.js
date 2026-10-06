const cron = require("node-cron");
const { sql } = require("../config/db");

const {
  sendDailyFeedbackSummaryEmail
} = require("../utils/emailService");

const logger = require("../utils/logger");


/**
 * Start daily feedback summary service
 */
const startDailyFeedbackSummaryService = () => {

  logger.info("Daily feedback summary service started");

  // Every day at 23:59
  cron.schedule("59 23 * * *", async () => {

    try {

      logger.info("Starting daily feedback summary job");


      // ==========================================
      // GET TODAY'S DATE
      // ==========================================

      const dateResult = await sql.query(`
        SELECT CAST(GETDATE() AS DATE) AS today
      `);

      const today = dateResult.recordset[0].today;

      const summaryDate = new Date(today)
        .toISOString()
        .split("T")[0];


      // ==========================================
      // CHECK IF TODAY'S SUMMARY WAS ALREADY SENT
      // ==========================================

      const existingResult = await sql.query`
        SELECT
          id,
          status
        FROM DailyFeedbackSummaryLog
        WHERE summary_date = ${summaryDate}
      `;

      if (
        existingResult.recordset.length > 0 &&
        existingResult.recordset[0].status === "SENT"
      ) {

        logger.info("Daily feedback summary already sent", {
          summaryDate
        });

        return;
      }


      // ==========================================
      // GET TODAY'S FEEDBACK
      // ==========================================

      const feedbackResult = await sql.query`
        SELECT
          id,
          message,
          created_at,
          rating
        FROM Feedback
        WHERE
          CAST(created_at AS DATE) = ${summaryDate}
        ORDER BY created_at ASC
      `;


      logger.info("Today's feedback retrieved", {
        summaryDate,
        feedbackCount: feedbackResult.recordset.length
      });


      // ==========================================
      // NO FEEDBACK → DO NOTHING
      // ==========================================

      if (feedbackResult.recordset.length === 0) {

        logger.info("No feedback received today. No email will be sent.", {
          summaryDate
        });

        return;
      }


      // ==========================================
      // GET ALL ADMINS
      // ==========================================

      const adminResult = await sql.query(`
        SELECT
          user_id,
          first_name,
          last_name,
          Email
        FROM Users
        WHERE role = 'admin'
          AND Email IS NOT NULL
      `);


      if (adminResult.recordset.length === 0) {

        logger.warn("No admin users found", {
          summaryDate
        });

        return;
      }


      // ==========================================
      // CREATE SUMMARY LOG
      // ==========================================

      if (existingResult.recordset.length === 0) {

        await sql.query`
          INSERT INTO DailyFeedbackSummaryLog
          (
            summary_date,
            status
          )
          VALUES
          (
            ${summaryDate},
            'PENDING'
          )
        `;

      } else {

        await sql.query`
          UPDATE DailyFeedbackSummaryLog
          SET status = 'PENDING'
          WHERE summary_date = ${summaryDate}
        `;
      }


      // ==========================================
      // SEND EMAIL TO ALL ADMINS
      // ==========================================

      for (const admin of adminResult.recordset) {

        const adminName =
          `${admin.first_name} ${admin.last_name}`.trim();

        logger.info("Sending daily feedback summary", {
          summaryDate,
          adminId: admin.user_id,
          email: admin.Email
        });

        await sendDailyFeedbackSummaryEmail(
          admin.Email,
          adminName,
          feedbackResult.recordset,
          summaryDate
        );

        logger.info("Daily feedback summary sent", {
          summaryDate,
          adminId: admin.user_id,
          email: admin.Email
        });
      }


      // ==========================================
      // MARK SUMMARY AS SENT
      // ==========================================

      await sql.query`
        UPDATE DailyFeedbackSummaryLog
        SET
          status = 'SENT',
          sent_at = GETDATE()
        WHERE summary_date = ${summaryDate}
      `;


      logger.info("Daily feedback summary completed successfully", {
        summaryDate,
        feedbackCount: feedbackResult.recordset.length,
        adminCount: adminResult.recordset.length
      });


    } catch (err) {

      logger.error("Daily feedback summary service failed", {
        error: err.message,
        stack: err.stack
      });

    }

  });

};


module.exports = startDailyFeedbackSummaryService;