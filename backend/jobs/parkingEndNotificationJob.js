const cron = require("node-cron");
const { sql } = require("../config/db");
const emailService = require("../utils/emailService");
const startParkingEndNotificationJob = () => {
 // Run every minute
 cron.schedule("* * * * *", async () => {
   try {
     const result = await sql.query`
       SELECT
         b.booking_id,
         b.booking_end,
         b.status,
         b.slot_id,
         u.email,
         u.first_name,
         u.last_name
       FROM Booking b
       INNER JOIN Users u
        ON b.user_id = u.user_id
        WHERE (
            (b.status = 'PARKED' AND b.booking_stat = 1)
            OR
            (b.status = 'COMPLETED' AND b.booking_stat = 0)
            )
            AND b.parking_end_notification_sent = 0
            AND b.booking_end <= DATEADD(MINUTE, -5, GETDATE())
            `;
 
     for (const booking of result.recordset) {
       try {
         if (booking.status === "COMPLETED") {
           await emailService.sendParkingFinishedEmail({
             email: booking.email,
             firstName: `${booking.first_name} ${booking.last_name}` ,
             slotId: booking.slot_id,
             endTime: booking.booking_end
           });
           console.log(
             `✅ Parking finished email sent for booking ${booking.booking_id}`
           );
         } else if (booking.status === "PARKED") {
           await emailService.sendParkingStillParkedEmail({
             email: booking.email,
             firstName: `${booking.first_name} ${booking.last_name}`,
             slotId: booking.slot_id,
             endTime: booking.booking_end
           });
           console.log(
             `⚠️ Still-parked email sent for booking ${booking.booking_id}`
           );
         }
         await sql.query`
           UPDATE Booking
           SET parking_end_notification_sent = 1
           WHERE booking_id = ${booking.booking_id}
         `;
       } catch (emailError) {
         console.error(
           `❌ Failed to send parking-end notification for booking ${booking.booking_id}`,
           emailError
         );
       }
     }
   } catch (error) {
     console.error(
       "❌ Parking end notification job failed:",
       error
     );
   }
 });
 console.log("⏰ Parking 5-minute-after-end notification job started");
};
module.exports = startParkingEndNotificationJob;