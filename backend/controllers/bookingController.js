const bookingService = require("../services/bookingService");

const getAllBookings = async (req, res, next) => {
  try {
    const result = await bookingService.getAllBookings();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const createBooking = async (req, res, next) => {
  try {
    const result = await bookingService.createBooking(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const result = await bookingService.cancelBooking(req.params.bookingId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBookings,
  createBooking,
  cancelBooking
};