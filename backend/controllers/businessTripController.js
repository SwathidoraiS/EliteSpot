const { sql } = require("../config/db");
const logger = require("../utils/logger");
const { sendBusinessTripApprovalEmail, sendBusinessTripRejectionEmail } = require("../utils/emailService");
const getPendingBusinessTrips = async (req, res, next) => {
  try {
    const result = await sql.query`
      SELECT
        br.request_id,
        br.user_id,
        br.slot_id,
        br.from_datetime,
        br.to_datetime,
        br.purpose,
        br.status,
        br.created_at,
        u.emp_id,
        CONCAT(u.first_name, ' ', u.last_name) AS employee_name
      FROM BusinessTripRequest br
      INNER JOIN Users u
        ON br.user_id = u.user_id
      ORDER BY br.created_at DESC
    `;

    return res.json({
      success: true,
      requests: result.recordset
    });
  } catch (error) {
    logger.error("Failed to fetch pending Multiple Day requests", {
      error: error.message
    });
    next(error);
  }
};

const approveBusinessTrip = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const adminId = req.user_id;
    // Get the pending request
    const requestResult = await sql.query`
     SELECT *
     FROM BusinessTripRequest
     WHERE request_id = ${requestId}
       AND status = 'PENDING'
   `;
    if (requestResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Multiple Day request not found or already processed"
      });
    }
    const request = requestResult.recordset[0];
    // Check whether slot is still occupied
    const bookingResult = await sql.query`
     SELECT booking_id
     FROM Booking
     WHERE slot_id = ${request.slot_id}
       AND booking_stat = 1
       AND status IN ('BOOKED', 'PARKED')
       AND booking_start < ${request.to_datetime}
       AND booking_end > ${request.from_datetime}
   `;
    if (bookingResult.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Slot is already booked for this period"
      });
    }
    // Get employee ID
    const userResult = await sql.query`
     SELECT emp_id, email, first_name, last_name
     FROM Users
     WHERE user_id = ${request.user_id}
   `;
    if (userResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    const emp_id = userResult.recordset[0].emp_id;
    const userEmail = userResult.recordset[0].email;
    const employeeName = `${userResult.recordset[0].first_name} ${userResult.recordset[0].last_name}`;
    // Create actual Booking
    await sql.query`
     EXEC sp_Booking_Save
       @booking_id = NULL,
       @user_id = ${request.user_id},
       @emp_id = ${emp_id},
       @slot_id = ${request.slot_id},
       @booking_stat = 1,
       @booking_start = ${request.from_datetime},
       @booking_end = ${request.to_datetime}
   `;
    // Mark Business Trip request as APPROVED
    await sql.query`
     UPDATE BusinessTripRequest
     SET
       status = 'APPROVED',
       approved_by = ${adminId},
       approved_at = GETDATE()
     WHERE request_id = ${requestId}
   `;
    await sendBusinessTripApprovalEmail({
      recipientEmail: userEmail,
      employeeName,
      slotId: request.slot_id,
      bookingStart: request.from_datetime,
      bookingEnd: request.to_datetime,
      purpose: request.purpose,
      requestId
    });
    logger.info("Multiple Day Request approved", {
      requestId,
      adminId,
      userId: request.user_id,
      slotId: request.slot_id
    });
    return res.json({
      success: true,
      message: "Multiple Day request approved successfully"
    });
  } catch (error) {
    logger.error("Failed to approve Multiple Day Request", {
      error: error.message
    });
    next(error);
  }
};

const rejectBusinessTrip = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
    const adminId = req.user_id;
    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required"
      });
    }
    // Make sure request is still pending
    const requestResult = await sql.query`
     SELECT *
     FROM BusinessTripRequest
     WHERE request_id = ${requestId}
       AND status = 'PENDING'
      `;
    
    if (requestResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Multiple Day request not found or already processed"
      });
    }

    const request = requestResult.recordset[0];

    const userResult = await sql.query`
      SELECT email, first_name, last_name
      FROM Users
      WHERE user_id = ${request.user_id}
      `;
    if (userResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    const user = userResult.recordset[0];
    
    const employeeName =
      `${user.first_name} ${user.last_name}`.trim();
    
    // Reject request
    await sql.query`
     UPDATE BusinessTripRequest
     SET
       status = 'REJECTED',
       rejected_reason = ${reason.trim()}
     WHERE request_id = ${requestId}
   `;
    await sendBusinessTripRejectionEmail({
      recipientEmail: user.email,
      employeeName,
      slotId: request.slot_id,
      bookingStart: request.from_datetime,
      bookingEnd: request.to_datetime,
      purpose: request.purpose,
      rejectionReason: reason.trim(),
      requestId
    });

    logger.info("Multiple Day Request rejected", {
      requestId,
      adminId,
      reason: reason.trim()
    });
    return res.json({
      success: true,
      message: "Multiple Day request rejected successfully"
    });
  } catch (error) {
    logger.error("Failed to reject Multiple Day Request", {
      error: error.message
    });
    next(error);
  }
};

module.exports = {
  getPendingBusinessTrips,
  approveBusinessTrip,
  rejectBusinessTrip
};
