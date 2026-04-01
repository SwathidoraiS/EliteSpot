const cron = require("node-cron");
const { sql } = require("../config/db");

/**
 * Start auto-cancel cron job
 */
const startAutoCancelService = () => {

  if (process.env.NODE_ENV === "development") {
    console.log("🔥 Auto cancel service started");
  }

  cron.schedule("*/1 * * * *", async () => {
    try {
      const result = await sql.query(`
        UPDATE Booking
        SET 
          booking_stat = 0,
          status = 'CANCELLED'
        OUTPUT INSERTED.booking_id
        WHERE 
          booking_stat = 1
          AND status = 'BOOKED'
          AND DATEADD(MINUTE, 15, booking_start) <= GETDATE()
      `);

      // Dev-only log
      if (process.env.NODE_ENV === "development") {
        console.log("🚫 Cancelled:", result.recordset.length);
      }

    } catch (err) {
      console.error("❌ Auto cancel error:", err.message);
    }
  });
};

module.exports = startAutoCancelService;