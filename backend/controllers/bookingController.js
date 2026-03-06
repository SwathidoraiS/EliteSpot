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

    const slotId = req.body.slotId;
    const user_id = req.user_id; // from token middleware

    const result = await bookingService.createBooking({
      slotId,
      user_id
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