const { sql } = require("../config/db");
const logger = require("../utils/logger");
/**
 * Get all bookings (Admin)
 * Includes user details and formatted time/date
 */
const getAllBookings = async () => {
  try {
    logger.info("Fetching all bookings");
    const result = await sql.query(`
    SELECT 
      b.booking_id,
      b.user_id,
      u.first_name + ' ' + u.last_name AS name,
      u.Emp_id,
      b.slot_id,
      b.booking_start,
      b.booking_end,
      b.status,
      b.booking_stat
    FROM Booking b
    JOIN Users u ON b.user_id = u.user_id
    WHERE b.booking_stat IN (0,1)
    ORDER BY b.created_date DESC
  `);

    logger.info("All bookings fetched successfully", {
      totalBookings: result.recordset.length
    });

    return { success: true, bookings: result.recordset };
  }
  catch (error) {
    console.error("❌ getAllBookings controller error:", error);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    next(error);
  }
};

/**
 * Get bookings of logged-in user
 */
const getMyBookings = async (user_id) => {

  logger.info("Fetching user bookings", {
    userId: user_id
  });

  const result = await sql.query`
   SELECT
     b.booking_id,
     b.slot_id,
     b.booking_start,
     b.booking_end,
     b.status,
     br.purpose
   FROM Booking b
   LEFT JOIN BusinessTripRequest br
     ON br.user_id = b.user_id
     AND br.slot_id = b.slot_id
     AND br.from_datetime = b.booking_start
     AND br.to_datetime = b.booking_end
     AND br.status = 'APPROVED'
   WHERE b.user_id = ${user_id}
     AND b.booking_stat = 1
 `;

  logger.info("User bookings fetched successfully", {
    userId: user_id,
    totalBookings: result.recordset.length
  });

  return {
    success: true,
    bookings: result.recordset
  };
};

/**
 * Create new booking
 */
const createBooking = async ({ slotId, user_id, emp_id, booking_start, booking_end }) => {

  logger.info("Booking request received", {
    userId: user_id,
    empId: emp_id,
    slotId,
    bookingStart: booking_start,
    bookingEnd: booking_end
  });

  // ✅ STEP 1: check user already has booking
  const existingUser = await sql.query`
    SELECT * FROM Booking
    WHERE user_id = ${user_id}
    AND booking_stat = 1
    AND status IN ('BOOKED','PARKED')
  `;

  if (existingUser.recordset.length > 0) {

    logger.warn("Booking rejected - User already has an active booking", {
      userId: user_id,
      empId: emp_id
    });

    throw new Error("You already have an active booking");
  }

  // ✅ STEP 2: check slot occupied
  const existingSlot = await sql.query`
    SELECT * FROM Booking
    WHERE slot_id = ${slotId}
    AND booking_stat = 1
    AND status IN ('BOOKED','PARKED')

    AND (
        booking_start < ${booking_end}
        AND booking_end > ${booking_start}
    )
  `;

  if (existingSlot.recordset.length > 0) {

    logger.warn("Booking rejected - Slot already occupied", {
      slotId,
      userId: user_id
    });

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

  logger.info("Old active bookings cleaned", {
    userId: user_id
  });

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

  logger.info("Booking created successfully", {
    userId: user_id,
    empId: emp_id,
    slotId,
    bookingStart: booking_start,
    bookingEnd: booking_end
  });

  // Total bookings of this user
  const bookingCountResult = await sql.query`
  SELECT COUNT(*) AS totalBookings
  FROM Booking
  WHERE user_id = ${user_id}
`;

  const totalBookings = bookingCountResult.recordset[0].totalBookings;

  // Has the user already submitted feedback?
  const userResult = await sql.query`
  SELECT feedback_given
  FROM Users
  WHERE user_id = ${user_id}
`;

  const feedbackCompleted = userResult.recordset[0].feedback_given;

  const showFeedback =
    totalBookings === 1 &&
    feedbackCompleted === false;

  logger.info("Booking feedback status evaluated", {
    userId: user_id,
    totalBookings,
    feedbackCompleted,
    showFeedback
  });

  return { success: true, showFeedback };
};

/**
 * Edit existing booking
 */
const editBooking = async ({
  bookingId,
  user_id,
  slotId,
  booking_start,
  booking_end
}) => {

  logger.info("Booking edit requested", {
    bookingId,
    userId: user_id,
    slotId,
    bookingStart: booking_start,
    bookingEnd: booking_end
  });

  // STEP 1: Check that this booking belongs to the logged-in user
  const bookingResult = await sql.query`
    SELECT *
    FROM Booking
    WHERE booking_id = ${bookingId}
    AND user_id = ${user_id}
    AND booking_stat = 1
  `;

  if (bookingResult.recordset.length === 0) {
    logger.warn("Booking edit rejected - Booking not found", {
      bookingId,
      userId: user_id
    });

    throw new Error("Booking not found");
  }

  // Keep the current status
  const currentBooking = bookingResult.recordset[0];

  // STEP 2: Check whether the new slot/time is already occupied
  // Exclude the booking being edited itself
  const existingSlot = await sql.query`
    SELECT *
    FROM Booking
    WHERE slot_id = ${slotId}
    AND booking_id <> ${bookingId}
    AND booking_stat = 1
    AND status IN ('BOOKED', 'PARKED')
    AND (
      booking_start < ${booking_end}
      AND booking_end > ${booking_start}
    )
  `;

  if (existingSlot.recordset.length > 0) {

    logger.warn("Booking edit rejected - Slot already occupied", {
      bookingId,
      slotId,
      userId: user_id
    });

    throw new Error("Slot already occupied for the selected time");
  }

  // STEP 2.5: check Business Trip hold
  const existingBusinessTrip = await sql.query`
 SELECT *
 FROM BusinessTripRequest
 WHERE slot_id = ${slotId}
   AND status IN ('PENDING', 'APPROVED')
   AND from_datetime < ${booking_end}
   AND to_datetime > ${booking_start}
`;
  if (existingBusinessTrip.recordset.length > 0) {
    logger.warn(
      "Booking rejected - Slot held by Multiple Day request",
      {
        slotId,
        userId: user_id,
        bookingStart: booking_start,
        bookingEnd: booking_end
      }
    );
    throw new Error(
      "Slot is temporarily held for a Multiple Day request"
    );
  }
  // STEP 3: Update booking
  await sql.query`
    UPDATE Booking
    SET
      slot_id = ${slotId},
      booking_start = ${booking_start},
      booking_end = ${booking_end}
    WHERE booking_id = ${bookingId}
    AND user_id = ${user_id}
    AND booking_stat = 1
  `;

  logger.info("Booking edited successfully", {
    bookingId,
    userId: user_id,
    slotId,
    bookingStart: booking_start,
    bookingEnd: booking_end
  });

  return {
    success: true,
    message: "Booking updated successfully"
  };
};

/**
 * Cancel booking
 */
const cancelBooking = async (bookingId, user_id) => {

  logger.info("Booking cancellation requested", {
    bookingId,
    userId: user_id
  });

  await sql.query`
    UPDATE Booking
    SET 
      booking_stat = 0,
      status = 'CANCELLED',
      end_time = GETDATE()
    WHERE booking_id = ${bookingId}   -- ✅ use correct PK
    AND user_id = ${user_id}
  `;

  logger.info("Booking cancelled successfully", {
    bookingId,
    userId: user_id
  });

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

  logger.info("Booking audit record created", {
    bookingId,
    userId: user_id,
    action: "CANCELLED"
  });

  logger.info("Booking cancellation completed", {
    bookingId,
    userId: user_id
  });

  return { success: true, message: "Booking cancelled successfully" };
};

module.exports = {
  getAllBookings,
  getMyBookings,
  createBooking,
  editBooking,
  cancelBooking
};