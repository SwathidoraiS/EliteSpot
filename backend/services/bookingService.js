const { sql } = require("../config/db");

const getAllBookings = async () => {
  const result = await sql.query(`
    SELECT * FROM Booking
  `);

  return { success: true, bookings: result.recordset };
};

const createBooking = async ({ booking_id, user_id, slot_id, booking_stat }) => {

  await sql.query`
    EXEC sp_Booking_Save
      @booking_id = ${booking_id},
      @user_id = ${user_id},
      @slot_id = ${slot_id},
      @booking_stat = ${booking_stat}
  `;

  return { success: true, message: "Booking saved successfully ✅" };
};

const cancelBooking = async (bookingId) => {

  await sql.query`
    EXEC sp_Booking_Save
      @booking_id = ${bookingId},
      @user_id = NULL,
      @slot_id = NULL,
      @booking_stat = 0
  `;

  return { success: true, message: "Booking cancelled successfully" };
};


module.exports = {
  getAllBookings,
  createBooking,
  cancelBooking
};