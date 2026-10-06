const cron = require("node-cron");
const { sql } = require("../config/db");
const { sendReminderEmail } = require("../utils/emailService");
const logger = require("../utils/logger");
cron.schedule("* * * * *", async () => {
  try {
    logger.info("Reminder email scheduler started");
    const result = await sql.query`
      SELECT
        b.booking_id,
        FORMAT(b.booking_start, 'HH:mm') AS booking_time,
        u.first_name,
        u.last_name,
        u.Email
      FROM Booking b
      JOIN Users u
        ON b.user_id = u.user_id
      WHERE
        b.status = 'BOOKED'
        AND b.reminder_sent = 0
        AND DATEADD(MINUTE, -5, b.booking_start) <= GETDATE()
        AND b.booking_start > GETDATE()
    `;

    logger.info("Reminder booking check completed", {
        bookingsFound: result.recordset.length
    });

    for (const booking of result.recordset) {

      const fullName = `${booking.first_name} ${booking.last_name}`;

        logger.info("Sending booking reminder email", {
            bookingId: booking.booking_id,
            email: booking.Email,
            bookingTime: booking.booking_time
        });

        await sendReminderEmail(
            booking.Email,
            fullName,
            booking.booking_time
        );

        logger.info("Booking reminder email sent", {
            bookingId: booking.booking_id,
            email: booking.Email
        });

        await sql.query`
          UPDATE Booking
          SET reminder_sent = 1
          WHERE booking_id = ${booking.booking_id}
        `;

        logger.info("Booking marked as reminder sent", {
            bookingId: booking.booking_id
        });
    }

  } catch (err) {
    logger.error("Reminder scheduler failed", {
        error: err.message,
        stack: err.stack
    });
  }
});