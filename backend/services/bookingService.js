const { sql } = require("../config/db");

const getAllBookings = async () => {
  const result = await sql.query(`
    SELECT 
      b.booking_id,
      b.user_id,
      u.first_name + ' ' + u.last_name AS name,
      u.Emp_id,
      b.slot_id,

      CAST(b.booking_start AS DATE) AS booking_date,
      FORMAT(b.booking_start, 'HH:mm') AS start_time,
FORMAT(b.booking_end, 'HH:mm') AS end_time,

      b.status,
      b.booking_stat
    FROM Booking b
    JOIN Users u ON b.user_id = u.user_id
    WHERE b.booking_stat IN (0,1)
    ORDER BY b.booking_start DESC
  `);

  return { success: true, bookings: result.recordset };
};

const getMyBookings = async (user_id) => {

  const result = await sql.query`
    SELECT 
      booking_id,
      slot_id,
      booking_start,
      booking_end,
      status
    FROM Booking
    WHERE user_id = ${user_id}
    AND booking_stat = 1
  `;

  return {
    success: true,
    bookings: result.recordset
  };
};

const createBooking = async ({ slotId, user_id, emp_id, booking_start, booking_end }) => {

  // ✅ STEP 1: check user already has booking
  const existingUser = await sql.query`
    SELECT * FROM Booking
    WHERE user_id = ${user_id}
    AND booking_stat = 1
    AND status IN ('BOOKED','PARKED')
  `;

  if (existingUser.recordset.length > 0) {
    throw new Error("You already have an active booking");
  }

  // ✅ STEP 2: check slot occupied
  const existingSlot = await sql.query`
    SELECT * FROM Booking
    WHERE slot_id = ${slotId}
    AND booking_stat = 1
    AND status IN ('BOOKED','PARKED')
  `;

  if (existingSlot.recordset.length > 0) {
    throw new Error("Slot already occupied");
  }

  // ✅ STEP 3: close old bookings (safety cleanup)
  await sql.query`
    UPDATE Booking
    SET 
      booking_stat = 0,
      end_time = GETDATE(),
      status = 'COMPLETED'
    WHERE user_id = ${user_id}
    AND booking_stat = 1
  `;

  // ✅ STEP 4: insert new booking
  const booking_id = null;
  const booking_stat = 1;

  await sql.query`
    EXEC sp_Booking_Save
      @booking_id = ${booking_id},
      @user_id = ${user_id},
      @emp_id = ${emp_id},
      @slot_id = ${slotId},
      @booking_stat = ${booking_stat},
      @booking_start = ${booking_start},
      @booking_end = ${booking_end}
  `;

  return { success: true };
};

const cancelBooking = async (bookingId, user_id) => {

  await sql.query`
    UPDATE Booking
    SET 
      booking_stat = 0,
      status = 'CANCELLED',
      end_time = GETDATE()
    WHERE booking_id = ${bookingId}   -- ✅ use correct PK
    AND user_id = ${user_id}
  `;

  // audit log
  await sql.query`
    INSERT INTO Booking_Audit
    (
      Booking_ID,
      changed_by,
      old_status_id,
      new_status_id,
      booking_hist
    )
    VALUES
    (
      ${bookingId},
      ${user_id},
      1,
      0,
      'CANCELLED'
    )
  `;

  return { success: true, message: "Booking cancelled successfully" };
};

module.exports = {
  getAllBookings,
  getMyBookings,
  createBooking,
  cancelBooking
};