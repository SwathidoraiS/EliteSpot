const cron = require("node-cron");
const { sql } = require("../config/db");
const { sendReminderEmail } = require("../utils/emailService");
cron.schedule("* * * * *", async () => {
  try {
    console.log("⏰ Reminder job running...");
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

    for (const booking of result.recordset) {

      const fullName = `${booking.first_name} ${booking.last_name}`;

        await sendReminderEmail(
            booking.Email,
            fullName,
            booking.booking_time
        );
      console.log("Sending reminder to:", booking.Email);

      await sql.query`
        UPDATE Booking
        SET reminder_sent = 1
        WHERE booking_id = ${booking.booking_id}
      `;
    }

  } catch (err) {
    console.error(err);
  }
});