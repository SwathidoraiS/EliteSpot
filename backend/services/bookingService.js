const { sql } = require("../config/db");

const getAllBookings = async () => {
  const result = await sql.query(`
    SELECT * FROM Booking
    WHERE booking_stat = 1
  `);

  return { success: true, bookings: result.recordset };
};

const createBooking = async ({ slotId }) => {

  console.log(">>>" + slotId + "<<<");
  console.log("Length:", slotId.length);

  const booking_id = null;
  const user_id = 1;
  const booking_stat = 1;

  await sql.query`
    EXEC sp_Booking_Save
      @booking_id = ${booking_id},
      @user_id = ${user_id},
      @slot_id = ${slotId},
      @booking_stat = ${booking_stat}
  `;

  return { success: true };
};
const cancelBooking = async (bookingId) => {

  await sql.query`
    UPDATE Booking
    SET booking_stat = 0,
        end_time = GETDATE()
    WHERE booking_id = ${bookingId}
  `;

  return { success: true, message: "Booking cancelled successfully" };
};


module.exports = {
  getAllBookings,
  createBooking,
  cancelBooking
};