const bookingService = require("../services/bookingService");

const getAllBookings = async (req, res, next) => {
  try {
    const result = await bookingService.getAllBookings();

    res.json(result);

    res.json({
      success: true,
      bookings: bookingsWithStatus
    });

  } catch (error) {
    next(error);
  }
};

const getMyBookings = async (req, res, next) => {

  try {

    const user_id = req.user_id;

    const result = await bookingService.getMyBookings(user_id);

    res.json(result);

  } catch (error) {

    next(error);

  }

};

const createBooking = async (req, res) => {
  try {
    const { slotId, date, fromTime, toTime } = req.body;
    const user_id = req.user_id;

    function convertTo24Hour(time) {
      const [t, modifier] = time.split(" ");
      let [hours, minutes] = t.split(":");

      hours = parseInt(hours);

      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      return `${hours.toString().padStart(2, "0")}:${minutes}`;
    }

    const start24 = convertTo24Hour(fromTime);
    const end24 = convertTo24Hour(toTime);

    // ✅ create time
    let booking_start = `${date} ${start24}:00`;
    let booking_end = `${date} ${end24}:00`;

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
    res.status(500).json({ success: false, message: error.message });
  }
};

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

