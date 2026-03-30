const cron = require("node-cron");
const { sql } = require("../config/db");

console.log("🔥 Auto cancel service started");

cron.schedule("*/1 * * * *", async () => {
  try {
    console.log("⏳ Checking expired bookings at", new Date());

    const result = await sql.query(`
      UPDATE Booking
      SET booking_stat = 0
      OUTPUT INSERTED.booking_id, INSERTED.booking_start
      WHERE 
        booking_stat = 1
        AND status = 'BOOKED'
        AND DATEADD(MINUTE, 1, created_at) <= GETDATE()
    `);

    console.log("🚫 Cancelled bookings:", result.recordset);

  } catch (err) {
    console.error("❌ Auto cancel error:", err);
  }
});