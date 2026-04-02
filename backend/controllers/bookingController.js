const bookingService = require("../services/bookingService");

/**
 * Get all bookings (Admin)
 */
const getAllBookings = async (req, res, next) => {
  try {
    const result = await bookingService.getAllBookings();

    res.json(result);

  } catch (error) {
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
const createBooking = async (req, res) => {
  try {
    const { slotId, date, fromTime, toTime } = req.body;
    const user_id = req.user_id;

    const start24 = fromTime;
    const end24 = toTime;

    // ✅ create time
    let booking_start = `${date}T${start24}:00`;
    let booking_end = `${date}T${end24}:00`;

    // ✅ FIX time order
    let start = new Date(booking_start);
    let end = new Date(booking_end);

    if (start > end) {
      const temp = booking_start;
      booking_start = booking_end;
      booking_end = temp;
    }

    // ❌ still invalid
    if (new Date(booking_start) >= new Date(booking_end)) {
      return res.status(400).json({
        success: false,
        message: "Invalid time range"
      });
    }

    const now = new Date();

    if (new Date(booking_start) < now) {
      return res.status(400).json({
        success: false,
        message: "Cannot book past time"
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

/**
 * Create booking
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
  cancelBooking
};
