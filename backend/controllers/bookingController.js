const bookingService = require("../services/bookingService");
const logger = require("../utils/logger");
const { sql } = require("../config/db");
const { sendBusinessTripRequestEmail } = require("../utils/emailService");
/**
 * Get all bookings (Admin)
 */
const getAllBookings = async (req, res, next) => {
  try {
    logger.info("Fetching all bookings from controller");
    const result = await bookingService.getAllBookings();
    logger.info("Bookings returned successfully");

    res.json(result);

  } catch (error) {
    logger.error("Error fetching bookings", {
      message: error.message,
      stack: error.stack
    });

    next(error);
  }
};

/**
 * Get all bookings (Admin)
 */
const getMyBookings = async (req, res, next) => {
  try {
    const user_id = req.user_id;

    const result = await bookingService.getMyBookings(user_id);

    res.json(result);

  } catch (error) {
    next(error);
  }

};

/**
 * Get logged-in user's bookings
 */
const createBooking = async (req, res, next) => {
  try {
    const {
      slotId,
      date,
      fromTime,
      toTime,
      booking_start,
      booking_end,
      purpose
    } = req.body;
    const user_id = req.user_id;
    // =====================================================
    // BUSINESS TRIP REQUEST
    // =====================================================
    if (purpose !== undefined) {
      // Validate required fields
      if (!slotId || !purpose?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Missing Multiple Day Booking Details"
        });
      }
      const start = new Date(booking_start);
      const end = new Date(booking_end);
      // Validate datetime
      if (
        isNaN(start.getTime()) ||
        isNaN(end.getTime())
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid Time Range"
        });
      }
      // End must be after start
      if (start >= end) {
        return res.status(400).json({
          success: false,
          message: "Invalid Time Range"
        });
      }
      // Business Trip cannot start in the past
      const now = new Date();
      if (start < now) {
        return res.status(400).json({
          success: false,
          message: "Cannot Book PastTime"
        });
      }

      // Check if user already has a pending Business Trip request
      const existingUserRequest = await sql.query`
      SELECT request_id
      FROM BusinessTripRequest
      WHERE user_id = ${user_id}
        AND status = 'PENDING'
      `;
      if (existingUserRequest.recordset.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Multiple Day Request Already Pending"
        });
      }
      // Check whether the slot already has an active booking
      const existingBooking = await sql.query`
        SELECT booking_id
        FROM Booking
        WHERE slot_id = ${slotId}
          AND booking_stat = 1
          AND status IN ('BOOKED', 'PARKED')
          AND booking_start < ${booking_end}
          AND booking_end > ${booking_start}
      `;
      if (existingBooking.recordset.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Slot Already Booked"
        });
      }
      // Check whether the slot already has a pending Business Trip request
      const existingRequest = await sql.query`
        SELECT request_id
        FROM BusinessTripRequest
        WHERE slot_id = ${slotId}
          AND status = 'PENDING'
          AND from_datetime < ${booking_end}
          AND to_datetime > ${booking_start}
      `;
      if (existingRequest.recordset.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Slot Already OnHold"
        });
      }
      // Create Business Trip Request
      const requestResult = await sql.query`
        INSERT INTO BusinessTripRequest
        (
          user_id,
          slot_id,
          from_datetime,
          to_datetime,
          purpose,
          status,
          created_at
        )
        OUTPUT INSERTED.request_id
        VALUES
        (
          ${user_id},
          ${slotId},
          ${booking_start},
          ${booking_end},
          ${purpose.trim()},
          'PENDING',
          GETDATE()
        )
      `;
      const requestId = requestResult.recordset[0].request_id;
      // Get employee details
      const userResult = await sql.query`
        SELECT emp_id, first_name, last_name, email
        FROM Users
        WHERE user_id = ${user_id}
        `;
      const user = userResult.recordset[0];
      if (!user) {
        throw new Error("User not found");
      }
      // Get Admin / HR email addresses
      const adminResult = await sql.query`
        SELECT email
        FROM Users
        WHERE role IN ('admin', 'hr')
          AND email IS NOT NULL
        `;
      const adminEmails = adminResult.recordset.map(
        (admin) => admin.email
      );
      if (adminEmails.length > 0) {
        // Send email to each Admin / HR
        for (const email of adminEmails) {
          await sendBusinessTripRequestEmail({
            recipientEmail: email,
            employeeName: `${user.first_name} ${user.last_name}`,
            employeeId: user.emp_id,
            slotId,
            bookingStart: booking_start,
            bookingEnd: booking_end,
            purpose: purpose.trim(),
            requestId
          });
        }
      }
      logger.info("Multiple Day request created", {
        requestId,
        userId: user_id,
        slotId,
        bookingStart: booking_start,
        bookingEnd: booking_end
      });
      return res.json({
        success: true,
        requestId,
        status: "PENDING",
        message: "Multiple Day Request Submitted"
      });
    }
    // =====================================================
    // NORMAL BOOKING
    // =====================================
    if (!slotId || !booking_start || !booking_end) {
      return res.status(400).json({
        success: false,
        message: "Missing Booking Details"
      });
    }

    const start = new Date(booking_start);
    const end = new Date(booking_end);
    // Basic validation
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid Time Range"
      });
    }
    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: "Invalid Time Range"
      });
    }
    // Do not allow booking in the past
    const now = new Date();
    if (start < now) {
      return res.status(400).json({
        success: false,
        message: "Cannot Book PastTime"
      });
    }
    // Only today and tomorrow are allowed.
    // Therefore, an overnight booking starting tomorrow
    // would end on the day after tomorrow and must be rejected.
    // =====================================================
    // NORMAL BOOKING DATE LIMIT
    // Only Today, Tomorrow and Day After Tomorrow
    // =====================================================
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 2);
    const bookingStartDate = new Date(start);
    bookingStartDate.setHours(0, 0, 0, 0);
    const bookingEndDate = new Date(end);
    bookingEndDate.setHours(0, 0, 0, 0);
    // From Date must be within today → day after tomorrow
    if (
      bookingStartDate < today ||
      bookingStartDate > maxDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid Booking Date"
      });
    }
    // To Date must also be within today → day after tomorrow
    if (
      bookingEndDate < today ||
      bookingEndDate > maxDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid Booking Date"
      });
    }
    const emp_id = req.user.Emp_id;
    const result = await bookingService.createBooking({
      slotId,
      user_id,
      emp_id,
      booking_start,
      booking_end
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const editBooking = async (req, res, next) => {
  try {

    const { bookingId } = req.params;

    const {
      slotId,
      booking_start,
      booking_end
    } = req.body;

    const user_id = req.user_id;

    const result = await bookingService.editBooking({
      bookingId,
      user_id,
      slotId,
      booking_start,
      booking_end
    });

    res.json(result);

  } catch (error) {

    console.error("❌ Edit booking error:", error);
    next(error);
  }
};

/**
 * Cancel booking
 */
const cancelBooking = async (req, res, next) => {
  try {
    const bookingId = req.params.bookingId;
    const user_id = req.user_id; // identify user cancelling

    const result = await bookingService.cancelBooking(bookingId, user_id);

    res.json(result);

  } catch (error) {
    console.error("Cancel Error:", error);
    next(error);
  }
};

module.exports = {
  getAllBookings,
  getMyBookings,
  createBooking,
  editBooking,
  cancelBooking
};
