const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/bookingController");
const verifyToken = require("../middlewares/verifyToken");

router.get("/bookings", bookingController.getAllBookings);

router.get("/bookings/my", verifyToken, bookingController.getMyBookings);

router.post("/bookings", verifyToken, bookingController.createBooking);

router.put("/bookings/:bookingId", verifyToken, bookingController.cancelBooking);

module.exports = router;