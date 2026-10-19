const cron = require("node-cron");
const { sql } = require("../config/db");
const emailService = require("../utils/emailService");
const startParkingEndReminderJob = () => {
 // Run every minute
 cron.schedule("* * * * *", async () => {
   try {
     const result = await sql.query`
       SELECT
         b.booking_id,
         b.booking_end,
         u.email,
         u.first_name,
         u.last_name,
         b.slot_id
       FROM Booking b
       INNER JOIN Users u
         ON b.user_id = u.user_id
       WHERE b.booking_stat = 1
         AND b.status IN ('BOOKED', 'PARKED')
         AND b.reminder_15min_sent = 0
         AND b.booking_end > GETDATE()
         AND b.booking_end <= DATEADD(MINUTE, 15, GETDATE())
     `;
     for (const booking of result.recordset) {
       try {
         await emailService.sendParkingEndReminderEmail({
           email: booking.email,
           firstName: `${booking.first_name} ${booking.last_name}` ,
           slotId: booking.slot_id,
           bookingEnd: booking.booking_end
         });
         await sql.query`
           UPDATE Booking
           SET reminder_15min_sent = 1
           WHERE booking_id = ${booking.booking_id}
         `;
         console.log(
           `✅ 15-minute parking reminder sent for booking ${booking.booking_id}`
         );
       } catch (emailError) {
         console.error(
           `❌ Failed to send reminder for booking ${booking.booking_id}`,
           emailError
         );
       }
     }
   } catch (error) {
     console.error("❌ Parking reminder job failed:", error);
   }
 });
 console.log("⏰ Parking 15-minute reminder job started");

};



module.exports = startParkingEndReminderJob;