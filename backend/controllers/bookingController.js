const bookingService = require("../services/bookingService");

const getAllBookings = async (req, res, next) => {
  try {
    const result = await bookingService.getAllBookings();
    res.json(result);
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

        return `${hours.toString().padStart(2,"0")}:${minutes}`;
      }

      const start24 = convertTo24Hour(fromTime);
      const end24 = convertTo24Hour(toTime);

      const booking_start = `${date} ${start24}:00`;
      const booking_end = `${date} ${end24}:00`;

    const result = await bookingService.createBooking({
      slotId,
      user_id,
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