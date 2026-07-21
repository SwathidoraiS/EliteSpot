const cron = require("node-cron");
const { sql } = require("../config/db");
const { sendCancellationEmail } = require("../utils/emailService");

/**
 * Start auto-cancel cron job
 */
const startAutoCancelService = () => {

  console.log("🔥 Auto cancel service started");

  cron.schedule("*/1 * * * *", async () => {

    try {

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
          AND DATEADD(MINUTE, 15, booking_start) <= GETDATE()
      `);

      console.log(result.recordset);
      // ✅ Send cancellation email
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

        await sendCancellationEmail(
          user.Email,
          `${user.first_name} ${user.last_name}`,
          booking.booking_time
        );

        console.log(`📧 Cancellation email sent to ${user.Email}`);
      }

    } catch (err) {

      console.error("❌ Auto cancel error:", err.message);

    }

  });

};

module.exports = startAutoCancelService;