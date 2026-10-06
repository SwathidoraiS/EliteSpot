const cron = require("node-cron");
const { sql } = require("../config/db");
const { sendCancellationEmail, sendParkingReminderEmail} = require("../utils/emailService");
const logger = require("../utils/logger");

/**
 * Start auto-cancel cron job
 */
const startAutoCancelService = () => {

  logger.info("Auto cancel service started");

  cron.schedule("*/1 * * * *", async () => {

    try {

      // ==========================================
      // 15-MINUTE PARKING REMINDER
      // ==========================================

      const parkingReminderResult = await sql.query(`
        SELECT
          b.booking_id,
          b.user_id,
          FORMAT(b.booking_start, 'HH:mm') AS booking_time,
          u.first_name,
          u.last_name,
          u.Email
        FROM Booking b
        INNER JOIN Users u
          ON b.user_id = u.user_id
        WHERE
          b.booking_stat = 1
          AND b.status = 'BOOKED'
          AND b.parking_reminder_sent = 0
          AND DATEADD(MINUTE, 15, b.booking_start) <= GETDATE()
          AND DATEADD(MINUTE, 30, b.booking_start) > GETDATE()
      `);

      logger.info("Parking reminder check completed", {
        bookingsFound: parkingReminderResult.recordset.length
      });

      // ==========================================
      // SEND 15-MINUTE PARKING REMINDER
      // ==========================================

      for (const booking of parkingReminderResult.recordset) {

        logger.info("Sending parking reminder email", {
          bookingId: booking.booking_id,
          userId: booking.user_id,
          email: booking.Email
        });

        await sendParkingReminderEmail(
          booking.Email,
          `${booking.first_name} ${booking.last_name}`,
          booking.booking_time
        );

        await sql.query`
          UPDATE Booking
          SET parking_reminder_sent = 1
          WHERE booking_id = ${booking.booking_id}
        `;

        logger.info("Parking reminder marked as sent", {
          bookingId: booking.booking_id,
          userId: booking.user_id,
          email: booking.Email
        });
      }

      // ==========================================
      // 30-MINUTE AUTO CANCEL
      // ==========================================

      const result = await sql.query(`
        UPDATE Booking
        SET
          booking_stat = 0,
          status = 'CANCELLED'
        OUTPUT
          INSERTED.booking_id,
          INSERTED.user_id,
          FORMAT(INSERTED.booking_start,'HH:mm') AS booking_time
        WHERE
          booking_stat = 1
          AND status = 'BOOKED'
          AND DATEADD(MINUTE, 30, booking_start) <= GETDATE()
      `);

      logger.info("Auto-cancel check completed", {
          bookingsFound: result.recordset.length
      });

      // ==========================================
      // SEND CANCELLATION EMAIL
      // ==========================================

      for (const booking of result.recordset) {

        const userResult = await sql.query`
          SELECT
            first_name,
            last_name,
            Email
          FROM Users
          WHERE user_id = ${booking.user_id}
        `;

        if (userResult.recordset.length === 0) continue;

        const user = userResult.recordset[0];

        logger.info("Sending cancellation email", {
            bookingId: booking.booking_id,
            userId: booking.user_id,
            email: user.Email
        });

        await sendCancellationEmail(
          user.Email,
          `${user.first_name} ${user.last_name}`,
          booking.booking_time
        );

        logger.info("Cancellation email sent successfully", {
            bookingId: booking.booking_id,
            userId: booking.user_id,
            email: user.Email
        });
      }

    } catch (err) {

      logger.error("Auto cancel service failed", {
          error: err.message,
          stack: err.stack
      });

    }

  });

};

module.exports = startAutoCancelService;