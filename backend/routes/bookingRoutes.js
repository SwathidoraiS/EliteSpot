const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/bookingController");
const verifyToken = require("../middlewares/verifyToken");

router.get("/", bookingController.getAllBookings);

router.get("/my", verifyToken, bookingController.getMyBookings);

router.post("/", verifyToken, bookingController.createBooking);

router.put("/:bookingId", verifyToken, bookingController.cancelBooking);

module.exports = router;