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
     b.user_id,
     b.slot_id,
     b.booking_start,
     b.booking_end,
     b.status,
     CASE
       WHEN EXISTS (
         SELECT 1
         FROM BusinessTripRequest br
         WHERE br.booking_id = b.booking_id
           AND br.status IN ('APPROVED' , 'PENDING')
       )
       OR EXISTS (
         SELECT 1
         FROM BusinessTripRequest br
         WHERE br.user_id = b.user_id
           AND br.slot_id = b.slot_id
           AND br.from_datetime = b.booking_start
           AND br.to_datetime = b.booking_end
           AND br.status = 'APPROVED'
       )
       THEN 1
       ELSE 0
     END AS is_business_trip,
     (
       SELECT TOP 1 br.purpose
       FROM BusinessTripRequest br
       WHERE (
         br.booking_id = b.booking_id
         OR (
           br.user_id = b.user_id
           AND br.slot_id = b.slot_id
           AND br.from_datetime = b.booking_start
           AND br.to_datetime = b.booking_end
         )
       )
       AND br.status = 'APPROVED'
       ORDER BY br.created_at DESC
     ) AS purpose
   FROM Booking b
   WHERE b.user_id = ${user_id}
     AND b.booking_stat = 1
   ORDER BY b.booking_start DESC
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
const createBooking = async ({
  slotId,
  user_id,
  emp_id,
  booking_start,
  booking_end
}) => {
  logger.info("Booking request received", {
    userId: user_id,
    empId: emp_id,
    slotId,
    bookingStart: booking_start,
    bookingEnd: booking_end
  });
  // =====================================================
  // STEP 1: GET USER'S ACTIVE NORMAL BOOKINGS
  // =====================================================

  // Business Trip bookings are excluded here.
  const existingNormalBookings = await sql.query`
  SELECT
    b.booking_id,
    b.slot_id,
    b.booking_start,
    b.booking_end,
    b.status
  FROM Booking b
  WHERE b.user_id = ${user_id}
    AND b.booking_stat = 1
    AND b.status IN ('BOOKED', 'PARKED')
    AND NOT EXISTS (
      SELECT 1
      FROM BusinessTripRequest br
      WHERE br.user_id = b.user_id
        AND br.slot_id = b.slot_id
        AND br.from_datetime = b.booking_start
        AND br.to_datetime = b.booking_end
        AND br.status = 'APPROVED'
    )
`;


  // =====================================================
  // STEP 2: MAXIMUM 2 NORMAL BOOKINGS
  // =====================================================

  if (existingNormalBookings.recordset.length >= 2) {
    logger.warn(
      "Booking rejected - User already has 2 active normal bookings",
      {
        userId: user_id,
        empId: emp_id
      }
    );
    throw new Error("Maximum Normal Bookings Reached");
  }


  // =====================================================
  // STEP 3: CHECK USER NORMAL BOOKING OVERLAP
  // =====================================================

  const overlappingUserBooking = await sql.query`
  SELECT booking_id
  FROM Booking
  WHERE user_id = ${user_id}
    AND booking_stat = 1
    AND status IN ('BOOKED', 'PARKED')
    AND booking_start < ${booking_end}
    AND booking_end > ${booking_start}
    AND NOT EXISTS (
      SELECT 1
      FROM BusinessTripRequest br
      WHERE br.user_id = Booking.user_id
        AND br.slot_id = Booking.slot_id
        AND br.from_datetime = Booking.booking_start
        AND br.to_datetime = Booking.booking_end
        AND br.status = 'APPROVED'
    )
`;

  console.log("New Booking:", { booking_start, booking_end });
  console.log("Overlapping Bookings:", overlappingUserBooking.recordset);

  if (overlappingUserBooking.recordset.length > 0) {
    logger.warn(
      "Booking rejected - User normal booking time overlap",
      {
        userId: user_id,
        existingBookingId:
          overlappingUserBooking.recordset[0].booking_id,
        bookingStart: booking_start,
        bookingEnd: booking_end
      }
    );
    throw new Error("Booking Time Overlap");
  }

  // =====================================================
  // STEP 4: CHECK SLOT OCCUPIED
  // =====================================================
  const existingSlot = await sql.query`
   SELECT booking_id
   FROM Booking
   WHERE slot_id = ${slotId}
     AND booking_stat = 1
     AND status IN ('BOOKED', 'PARKED')
     AND booking_start < ${booking_end}
     AND booking_end > ${booking_start}
 `;
  if (existingSlot.recordset.length > 0) {
    logger.warn("Booking rejected - Slot already occupied", {
      slotId,
      userId: user_id
    });
    throw new Error("Slot already occupied");
  }
  // =====================================================
  // STEP 5: INSERT NEW NORMAL BOOKING
  // =====================================================
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
  // =====================================================
  // STEP 6: FEEDBACK CHECK
  // =====================================================
  const bookingCountResult = await sql.query`
   SELECT COUNT(*) AS totalBookings
   FROM Booking
   WHERE user_id = ${user_id}
 `;
  const totalBookings =
    bookingCountResult.recordset[0].totalBookings;
  const userResult = await sql.query`
   SELECT feedback_given
   FROM Users
   WHERE user_id = ${user_id}
 `;
  const feedbackCompleted =
    userResult.recordset[0].feedback_given;
  const showFeedback =
    totalBookings === 1 &&
    feedbackCompleted === false;
  logger.info("Booking feedback status evaluated", {
    userId: user_id,
    totalBookings,
    feedbackCompleted,
    showFeedback
  });
  return {
    success: true,
    showFeedback
  };
};
/**
 * Edit existing booking
 */
const editBooking = async ({
  bookingId,
  user_id,
  slotId,
  booking_start,
  booking_end,
  purpose
}) => {
  logger.info("Booking edit requested", {
    bookingId,
    userId: user_id,
    slotId,
    bookingStart: booking_start,
    bookingEnd: booking_end
  });
  // =====================================================
  // STEP 1: CHECK BOOKING BELONGS TO USER
  // =====================================================
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
  const currentBooking = bookingResult.recordset[0];
  // =====================================================
  // STEP 2: CHECK IF THIS IS A BUSINESS TRIP
  // =====================================================
  const businessTripResult = await sql.query`
   SELECT request_id, status
   FROM BusinessTripRequest
   WHERE user_id = ${user_id}
     AND slot_id = ${currentBooking.slot_id}
     AND from_datetime = ${currentBooking.booking_start}
     AND to_datetime = ${currentBooking.booking_end}
     AND status = 'APPROVED'
 `;
  const isBusinessTrip = businessTripResult.recordset.length > 0;
  // =====================================================
  // STEP 3: CHECK SLOT OCCUPANCY
  // Exclude current booking
  // =====================================================
  const existingSlot = await sql.query`
   SELECT booking_id
   FROM Booking
   WHERE slot_id = ${slotId}
     AND booking_id <> ${bookingId}
     AND booking_stat = 1
     AND status IN ('BOOKED', 'PARKED')
     AND booking_start < ${booking_end}
     AND booking_end > ${booking_start}
 `;
  if (existingSlot.recordset.length > 0) {
    logger.warn("Booking edit rejected - Slot already occupied", {
      bookingId,
      slotId,
      userId: user_id
    });
    throw new Error("Slot already occupied for the selected time");
  }
  // =====================================================
  // STEP 4: CHECK BUSINESS TRIP HOLD
  // =====================================================
  const existingBusinessTrip = await sql.query`
    SELECT br.request_id
    FROM BusinessTripRequest br
    LEFT JOIN Booking b
      ON b.user_id = br.user_id
      AND b.slot_id = br.slot_id
      AND b.booking_start = br.from_datetime
      AND b.booking_end = br.to_datetime
    WHERE br.slot_id = ${slotId}
      AND (
        br.status = 'PENDING'
        OR (
          br.status = 'APPROVED'
          AND b.booking_stat = 1
          AND b.status IN ('BOOKED', 'PARKED')
        )
      )
      AND br.from_datetime < ${booking_end}
      AND br.to_datetime > ${booking_start}
    `;
  // Ignore the Business Trip belonging to the booking
  const conflictingBusinessTrip =
    existingBusinessTrip.recordset.filter(
      (request) =>
        !(
          isBusinessTrip &&
          request.request_id ===
          businessTripResult.recordset[0]?.request_id
        )
    );
  if (!isBusinessTrip && conflictingBusinessTrip.length > 0) {
    logger.warn(
      "Booking edit rejected - Slot held by Multiple Days Booking",
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
  // =====================================================
  // STEP 5: USER BOOKING LIMIT / OVERLAP CHECK
  // =====================================================
  const userBookingsResult = await sql.query`
  SELECT
    b.booking_id,
    b.slot_id,
    b.booking_start,
    b.booking_end
  FROM Booking b
  WHERE b.user_id = ${user_id}
    AND b.booking_stat = 1
    AND b.status IN ('BOOKED', 'PARKED')
    AND b.booking_id <> ${bookingId}
    AND NOT EXISTS (
      SELECT 1
      FROM BusinessTripRequest br
      WHERE br.user_id = b.user_id
        AND br.slot_id = b.slot_id
        AND br.from_datetime = b.booking_start
        AND br.to_datetime = b.booking_end
        AND br.status = 'APPROVED'
    )
  `;
  const otherBookings = userBookingsResult.recordset;
  // =====================================================
  // NORMAL BOOKING EDIT
  // =====================================================
  if (!isBusinessTrip) {
    // Maximum 2 Normal bookings
    if (otherBookings.length >= 2) {
      logger.warn(
        "Booking edit rejected - Maximum normal bookings reached",
        {
          userId: user_id,
          bookingId
        }
      );
      throw new Error("Maximum Normal Bookings Reached");
    }
    // Normal booking cannot overlap another user booking
    const overlappingBooking = otherBookings.find(
      (booking) =>
        new Date(booking.booking_start) <
        new Date(booking_end) &&
        new Date(booking.booking_end) >
        new Date(booking_start)
    );
    if (overlappingBooking) {
      logger.warn(
        "Booking edit rejected - User booking time overlap",
        {
          userId: user_id,
          bookingId,
          conflictingBookingId:
            overlappingBooking.booking_id
        }
      );
      console.log("Hit: Normal vs Normal Overlap");
      throw new Error("Booking Time Overlap");
    }
    // Normal booking cannot overlap an active Business Trip
    const overlappingBusinessTrip = await sql.query`
      SELECT br.request_id
      FROM BusinessTripRequest br
      INNER JOIN Booking b
        ON b.user_id = br.user_id
        AND b.slot_id = br.slot_id
        AND b.booking_start = br.from_datetime
        AND b.booking_end = br.to_datetime
      WHERE br.user_id = ${user_id}
        AND br.status = 'APPROVED'
        AND b.booking_stat = 1
        AND b.status IN ('BOOKED', 'PARKED')
        AND br.from_datetime < ${booking_end}
        AND br.to_datetime > ${booking_start}
        AND b.booking_id <> ${bookingId}
      `;

    if (overlappingBusinessTrip.recordset.length > 0) {
      throw new Error("Multiple Days Time Overlap");
    }
  }
  // =====================================================
  // BUSINESS TRIP EDIT
  // =====================================================
  if (isBusinessTrip) {
    // Business Trip cannot overlap any other user booking
    // =====================================================
    // CHECK NORMAL BOOKING TIME OVERLAP
    // Let SQL Server compare the datetime values directly
    // =====================================================
    const overlappingBooking = await sql.query`
    SELECT TOP 1
    booking_id,
      booking_start,
      booking_end
    FROM Booking
    WHERE user_id = ${user_id}
      AND booking_stat = 1
      AND status IN('BOOKED', 'PARKED')
      AND booking_id <> ${bookingId}
      AND booking_start < ${booking_end}
      AND booking_end > ${booking_start}
      AND NOT EXISTS(
        SELECT 1
        FROM BusinessTripRequest br
        WHERE br.user_id = Booking.user_id
          AND br.slot_id = Booking.slot_id
          AND br.from_datetime = Booking.booking_start
          AND br.to_datetime = Booking.booking_end
          AND br.status = 'APPROVED'
      )
      `;
    console.log("========== EDIT OVERLAP DEBUG ==========");
    console.log("Booking being edited:", bookingId);
    console.log("User:", user_id);
    console.log("New slot:", slotId);
    console.log("New start:", booking_start);
    console.log("New end:", booking_end);
    console.log(
      "SQL overlap result:",
      overlappingBooking.recordset
    );
    console.log("========================================");
    if (overlappingBooking.recordset.length > 0) {
      logger.warn(
        "Booking edit rejected - User booking time overlap",
        {
          userId: user_id,
          bookingId,
          conflictingBooking:
            overlappingBooking.recordset[0]
        }
      );
      throw new Error("Booking Time Overlap");
    }
    // Business Trip cannot overlap another Business Trip
    const overlappingBusinessTrip = await sql.query`
      SELECT br.request_id
      FROM BusinessTripRequest br
      INNER JOIN Booking b
        ON b.user_id = br.user_id
        AND b.slot_id = br.slot_id
        AND b.booking_start = br.from_datetime
        AND b.booking_end = br.to_datetime
      WHERE br.user_id = ${user_id}
        AND br.status = 'APPROVED'
        AND b.booking_stat = 1
        AND b.status IN ('BOOKED', 'PARKED')
        AND br.from_datetime < ${booking_end}
        AND br.to_datetime > ${booking_start}
        AND br.request_id <> ${businessTripResult.recordset[0].request_id}
      `;
    console.log(
      "ACTIVE Business Trip conflicts:",
      overlappingBusinessTrip.recordset
    );
    if (overlappingBusinessTrip.recordset.length > 0) {
      throw new Error("Multiple Days Booking Time Overlap");
    }
  }

  // =====================================================
  // BUSINESS TRIP EDIT: SUBMIT FOR ADMIN APPROVAL
  // =====================================================
  if (isBusinessTrip) {
    if (!purpose?.trim()) {
      throw new Error("Multiple Days Booking purpose is required");
    }
    // Keep the existing Booking unchanged.
    // Store the requested changes as a new pending request.
    await sql.query`
     INSERT INTO BusinessTripRequest (
       user_id,
       slot_id,
       from_datetime,
       to_datetime,
       purpose,
       status,
       booking_id
     )
     VALUES (
       ${user_id},
       ${slotId},
       ${booking_start},
       ${booking_end},
       ${purpose.trim()},
       'PENDING',
       ${bookingId}
     )
   `;
    logger.info("Multiple Days Booking edit submitted for approval", {
      bookingId,
      userId: user_id,
      slotId,
      bookingStart: booking_start,
      bookingEnd: booking_end
    });
    return {
      success: true,
      message: "Multiple Days Booking edit request submitted for admin approval"
    };
  }

  // =====================================================
  // STEP 6: UPDATE BOOKING
  // =====================================================
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
  // =====================================================
  // STEP 7: UPDATE BUSINESS TRIP REQUEST
  // =====================================================
  if (isBusinessTrip) {

    if (!purpose?.trim()) {
      throw new Error("Multiple Days Booking purpose is required");
    }
    await sql.query`
     UPDATE BusinessTripRequest
    SET
    slot_id = ${slotId},
    from_datetime = ${booking_start},
    to_datetime = ${booking_end},
    purpose = ${purpose.trim()}
     WHERE request_id =
      ${businessTripResult.recordset[0].request_id}
    `;
  }
  logger.info("Booking edited successfully", {
    bookingId,
    userId: user_id,
    slotId,
    bookingStart: booking_start,
    bookingEnd: booking_end,
    isBusinessTrip
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
    WHERE booking_id = ${bookingId} -- ✅ use correct PK
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